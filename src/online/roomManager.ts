import {
  BattleFormatOption,
  GameActionPayload,
  GameState,
  WinScoreOption,
} from '../game/types';
import { initializeGame, handleGameAction } from '../game/engine/gameEngine';
import { decideNextBotAction } from '../game/cpu/cpuLogic';
import { sanitizeGameStateForPlayer } from './sanitizer';
import { LiveMatchSummary } from './types';
import {
  EMOTE_COOLDOWN_MS,
  EmoteBroadcastEvent,
  getEmoteById,
} from '../game/emotes';
import { Server, Socket } from 'socket.io';

export interface RoomParticipant {
  socketId: string;
  id: string;
  playerId: string;
  name: string;
  avatarIcon: string;
  customDeckIds?: string[];
  winScore?: WinScoreOption;
  battleFormat?: BattleFormatOption;
  isBot?: boolean;
}

export interface RoomSpectator {
  socketId: string;
  playerId: string;
  name: string;
}

export interface CardRoom {
  roomId: string;
  type: 'random' | 'friend' | 'solo';
  inviteCode?: string;
  winScore: WinScoreOption;
  battleFormat: BattleFormatOption;
  participants: RoomParticipant[];
  spectators: RoomSpectator[];
  gameState?: GameState;
  createdAt: number;
}

export class CardRoomManager {
  private rooms = new Map<string, CardRoom>();
  private quickMatchQueue: RoomParticipant[] = [];
  private emoteCooldowns = new Map<string, number>(); // key: `${roomId}:${playerId}` -> lastSentTimestamp
  private disconnectTimers = new Map<string, NodeJS.Timeout>(); // key: `${roomId}:${playerId}` -> 60s timeout
  private processedEmoteClientIds = new Set<string>();
  private emoteCooldownMs: number;
  private io: Server;
  private static readonly DISCONNECT_FORFEIT_MS = 60_000;

  constructor(io: Server, emoteCooldownMs: number = EMOTE_COOLDOWN_MS) {
    this.io = io;
    this.emoteCooldownMs = emoteCooldownMs;
  }

  public handleQuickMatch(
    socket: Socket,
    player: {
      id: string;
      name: string;
      avatarIcon?: string;
      customDeckIds?: string[];
      winScore?: WinScoreOption;
      battleFormat?: BattleFormatOption;
    }
  ) {
    this.quickMatchQueue = this.quickMatchQueue.filter(
      (p) => p.playerId !== player.id && p.socketId !== socket.id
    );

    const requestedWinScore: WinScoreOption =
      player.winScore === 7 ? 7 : player.winScore === 5 ? 5 : 3;
    const requestedFormat: BattleFormatOption =
      player.battleFormat === 'allstar' ? 'allstar' : 'standard';

    const participant: RoomParticipant = {
      socketId: socket.id,
      id: player.id,
      playerId: player.id,
      name: player.name,
      avatarIcon: player.avatarIcon || 'smile',
      customDeckIds: player.customDeckIds,
      winScore: requestedWinScore,
      battleFormat: requestedFormat,
    };

    const matchIdx = this.quickMatchQueue.findIndex(
      (p) =>
        (p.winScore || 3) === requestedWinScore &&
        (p.battleFormat || 'standard') === requestedFormat
    );

    if (matchIdx !== -1) {
      const opponent = this.quickMatchQueue.splice(matchIdx, 1)[0];
      const roomId = 'room_' + Math.random().toString(36).substring(2, 9);

      const room: CardRoom = {
        roomId,
        type: 'random',
        winScore: requestedWinScore,
        battleFormat: requestedFormat,
        participants: [opponent, participant],
        spectators: [],
        createdAt: Date.now(),
      };

      const gameId = 'game_' + roomId;
      room.gameState = initializeGame(
        gameId,
        roomId,
        opponent,
        participant,
        opponent.customDeckIds,
        participant.customDeckIds,
        requestedWinScore,
        requestedFormat
      );
      this.rooms.set(roomId, room);

      const oppSocket = this.io.sockets.sockets.get(opponent.socketId);
      if (oppSocket) oppSocket.join(roomId);
      socket.join(roomId);

      this.broadcastGameState(roomId);
    } else {
      this.quickMatchQueue.push(participant);
      const formatLabel = requestedFormat === 'allstar' ? '全員参加大乱闘' : '標準デッキ';
      socket.emit('match_waiting', {
        message: `対戦相手を探しています（${formatLabel} / ${requestedWinScore}点先取）…`,
      });
    }
  }

  public cancelMatch(socketId: string) {
    this.quickMatchQueue = this.quickMatchQueue.filter((p) => p.socketId !== socketId);
  }

  public createFriendRoom(
    socket: Socket,
    player: {
      id: string;
      name: string;
      avatarIcon?: string;
      customDeckIds?: string[];
      winScore?: WinScoreOption;
      battleFormat?: BattleFormatOption;
    }
  ): string {
    const inviteCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const roomId = 'friend_' + inviteCode;
    const requestedWinScore: WinScoreOption =
      player.winScore === 7 ? 7 : player.winScore === 5 ? 5 : 3;
    const requestedFormat: BattleFormatOption =
      player.battleFormat === 'allstar' ? 'allstar' : 'standard';

    const participant: RoomParticipant = {
      socketId: socket.id,
      id: player.id,
      playerId: player.id,
      name: player.name,
      avatarIcon: player.avatarIcon || 'smile',
      customDeckIds: player.customDeckIds,
      winScore: requestedWinScore,
      battleFormat: requestedFormat,
    };

    const room: CardRoom = {
      roomId,
      type: 'friend',
      inviteCode,
      winScore: requestedWinScore,
      battleFormat: requestedFormat,
      participants: [participant],
      spectators: [],
      createdAt: Date.now(),
    };

    this.rooms.set(roomId, room);
    socket.join(roomId);

    socket.emit('friend_room_created', { inviteCode, roomId });
    return roomId;
  }

  public joinFriendRoom(
    socket: Socket,
    inviteCode: string,
    player: {
      id: string;
      name: string;
      avatarIcon?: string;
      customDeckIds?: string[];
      winScore?: WinScoreOption;
      battleFormat?: BattleFormatOption;
    }
  ) {
    const cleanCode = inviteCode.trim().toUpperCase();
    const roomId = 'friend_' + cleanCode;
    const room = this.rooms.get(roomId);

    if (!room) {
      socket.emit('card_error', {
        message: 'ルームが見つかりません。合言葉を確認してください。',
      });
      return;
    }

    if (room.participants.length >= 2) {
      const existing = room.participants.find((p) => p.playerId === player.id);
      if (existing) {
        existing.socketId = socket.id;
        socket.join(roomId);
        this.clearDisconnectTimer(roomId, player.id);
        if (room.gameState) {
          if (room.gameState.playerA.playerId === player.id) {
            room.gameState.playerA.isConnected = true;
            room.gameState.playerA.disconnectedAt = undefined;
            room.gameState.playerA.socketId = socket.id;
          } else if (room.gameState.playerB.playerId === player.id) {
            room.gameState.playerB.isConnected = true;
            room.gameState.playerB.disconnectedAt = undefined;
            room.gameState.playerB.socketId = socket.id;
          }
          this.sendStateToPlayer(socket, room.gameState, player.id, room.spectators.length);
          this.broadcastGameState(roomId);
        }
        return;
      }
      socket.emit('card_error', { message: 'ルームは満員です。' });
      return;
    }

    const participant: RoomParticipant = {
      socketId: socket.id,
      id: player.id,
      playerId: player.id,
      name: player.name,
      avatarIcon: player.avatarIcon || 'rocket',
      customDeckIds: player.customDeckIds,
      winScore: room.winScore,
      battleFormat: room.battleFormat,
    };

    room.participants.push(participant);
    socket.join(roomId);

    const gameId = 'game_' + roomId;
    room.gameState = initializeGame(
      gameId,
      roomId,
      room.participants[0],
      participant,
      room.participants[0].customDeckIds,
      participant.customDeckIds,
      room.winScore,
      room.battleFormat
    );

    this.broadcastGameState(roomId);
  }

  public startSoloBotMatch(
    socket: Socket,
    player: {
      id: string;
      name: string;
      avatarIcon?: string;
      customDeckIds?: string[];
      winScore?: WinScoreOption;
      battleFormat?: BattleFormatOption;
    }
  ) {
    const roomId = 'solo_' + Math.random().toString(36).substring(2, 9);
    const botId = 'bot_cpu_master';
    const requestedWinScore: WinScoreOption =
      player.winScore === 7 ? 7 : player.winScore === 5 ? 5 : 3;
    const requestedFormat: BattleFormatOption =
      player.battleFormat === 'allstar' ? 'allstar' : 'standard';

    const human: RoomParticipant = {
      socketId: socket.id,
      id: player.id,
      playerId: player.id,
      name: player.name,
      avatarIcon: player.avatarIcon || 'smile',
      customDeckIds: player.customDeckIds,
      winScore: requestedWinScore,
      battleFormat: requestedFormat,
    };

    const bot: RoomParticipant = {
      socketId: 'socket_bot',
      id: botId,
      playerId: botId,
      name: requestedFormat === 'allstar' ? 'CPU オールスター王' : 'CPU マスター',
      avatarIcon: 'ghost',
      winScore: requestedWinScore,
      battleFormat: requestedFormat,
      isBot: true,
    };

    const room: CardRoom = {
      roomId,
      type: 'solo',
      winScore: requestedWinScore,
      battleFormat: requestedFormat,
      participants: [human, bot],
      spectators: [],
      createdAt: Date.now(),
    };

    const gameId = 'game_' + roomId;
    room.gameState = initializeGame(
      gameId,
      roomId,
      human,
      bot,
      human.customDeckIds,
      undefined,
      requestedWinScore,
      requestedFormat
    );
    this.rooms.set(roomId, room);

    socket.join(roomId);
    this.broadcastGameState(roomId);

    this.scheduleBotIfNeeded(roomId);
  }

  public handleCardAction(
    socket: Socket,
    roomId: string,
    playerId: string,
    payload: GameActionPayload
  ) {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) {
      socket.emit('card_error', { message: '対戦が見つかりません。' });
      return;
    }

    const result = handleGameAction(room.gameState, playerId, payload);
    if (!result.success) {
      socket.emit('card_error', { message: result.error || '操作が無効です。' });
      return;
    }

    if (room.gameState.phase === 'GAME_OVER') {
      this.clearAllRoomDisconnectTimers(roomId);
    }

    this.broadcastGameState(roomId);
    this.scheduleBotIfNeeded(roomId);
  }

  /**
   * Real-time Emote handler with strict server-side validation:
   * - Resolves sender identity exclusively from authenticated socket.id in room.participants (never trusts client playerId)
   * - Validates match existence and active match state
   * - Validates emoteId against the 24 registered emotes
   * - Prevents duplicate clientRequestId events and enforces configurable cooldown
   */
  public handleSendEmote(
    socket: Socket,
    payload: {
      roomId?: string;
      emoteId?: string;
      clientRequestId?: string;
    }
  ) {
    if (!payload || typeof payload.roomId !== 'string' || typeof payload.emoteId !== 'string') {
      socket.emit('card_emote_rejected', { reason: '無効なエモートリクエストです。' });
      return;
    }

    const room = this.rooms.get(payload.roomId);
    if (!room || !room.gameState) {
      socket.emit('card_emote_rejected', { reason: '対戦ルームが見つかりません。' });
      return;
    }

    // Verify match state (allow during active match phases MAIN, WAITING_FOR_PROMOTION, and GAME_OVER post-match screen)
    const allowedPhases = ['MAIN', 'WAITING_FOR_PROMOTION', 'GAME_OVER'];
    if (!allowedPhases.includes(room.gameState.phase)) {
      socket.emit('card_emote_rejected', { reason: '現在はエモートを送信できません。' });
      return;
    }

    // Never trust client-provided player identities: look up participant strictly by socket.id
    const sender = room.participants.find((p) => !p.isBot && p.socketId === socket.id);
    if (!sender) {
      socket.emit('card_emote_rejected', {
        reason: 'この対戦のプレイヤーのみエモートを送信できます。',
      });
      return;
    }

    // Validate emoteId against the 24 allowed emotes
    const emoteDef = getEmoteById(payload.emoteId);
    if (!emoteDef) {
      socket.emit('card_emote_rejected', { reason: '存在しないエモートIDです。' });
      return;
    }

    // Deduplicate identical client request IDs
    if (payload.clientRequestId) {
      const dedupKey = `${room.roomId}:${sender.playerId}:${payload.clientRequestId}`;
      if (this.processedEmoteClientIds.has(dedupKey)) {
        return;
      }
      this.processedEmoteClientIds.add(dedupKey);
      if (this.processedEmoteClientIds.size > 1000) {
        const firstKey = this.processedEmoteClientIds.values().next().value;
        if (firstKey) this.processedEmoteClientIds.delete(firstKey);
      }
    }

    // Enforce server-side cooldown per player in the match
    const now = Date.now();
    const cooldownKey = `${room.roomId}:${sender.playerId}`;
    const lastSent = this.emoteCooldowns.get(cooldownKey) || 0;
    const elapsed = now - lastSent;

    if (elapsed < this.emoteCooldownMs) {
      const retryAfterMs = this.emoteCooldownMs - elapsed;
      socket.emit('card_emote_rejected', {
        reason: 'クールダウン中です。',
        retryAfterMs,
      });
      return;
    }

    this.emoteCooldowns.set(cooldownKey, now);

    const event: EmoteBroadcastEvent = {
      eventId: 'emo_' + now + '_' + Math.random().toString(36).substring(2, 7),
      roomId: room.roomId,
      senderPlayerId: sender.playerId,
      senderName: sender.name,
      emoteId: emoteDef.id,
      emoji: emoteDef.emoji,
      timestamp: now,
      cooldownMs: this.emoteCooldownMs,
    };

    this.broadcastEmote(room.roomId, event);

    // Optional playful bot reply in solo mode so solo players also experience two-way emotes
    if (room.type === 'solo' && room.gameState.phase !== 'GAME_OVER') {
      const botParticipant = room.participants.find((p) => p.isBot);
      if (botParticipant && Math.random() < 0.45) {
        const botReplyPool = [
          'greet_wave',
          'greet_cool',
          'battle_swords',
          'battle_fire',
          'react_moai',
          'funny_crown',
        ];
        const pickedId = botReplyPool[Math.floor(Math.random() * botReplyPool.length)];
        const botEmote = getEmoteById(pickedId);
        if (botEmote) {
          setTimeout(() => {
            const currentRoom = this.rooms.get(room.roomId);
            if (!currentRoom || !currentRoom.gameState) return;
            const botNow = Date.now();
            const botCooldownKey = `${room.roomId}:${botParticipant.playerId}`;
            if (botNow - (this.emoteCooldowns.get(botCooldownKey) || 0) < this.emoteCooldownMs) {
              return;
            }
            this.emoteCooldowns.set(botCooldownKey, botNow);
            this.broadcastEmote(room.roomId, {
              eventId: 'emo_bot_' + botNow + '_' + Math.random().toString(36).substring(2, 6),
              roomId: room.roomId,
              senderPlayerId: botParticipant.playerId,
              senderName: botParticipant.name,
              emoteId: botEmote.id,
              emoji: botEmote.emoji,
              timestamp: botNow,
              cooldownMs: this.emoteCooldownMs,
            });
          }, 900);
        }
      }
    }
  }

  private broadcastEmote(roomId: string, event: EmoteBroadcastEvent) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    for (const p of room.participants) {
      if (p.isBot) continue;
      const sock = this.io.sockets.sockets.get(p.socketId);
      if (sock) {
        sock.emit('card_emote_event', event);
      }
    }

    for (const spec of room.spectators) {
      const sock = this.io.sockets.sockets.get(spec.socketId);
      if (sock) {
        sock.emit('card_emote_event', event);
      }
    }
  }

  public rejoinMatch(socket: Socket, roomId: string, playerId: string) {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) return;

    const p = room.participants.find((part) => part.playerId === playerId);
    if (p) {
      p.socketId = socket.id;
      socket.join(roomId);
      this.clearDisconnectTimer(roomId, playerId);
      if (room.gameState.playerA.playerId === playerId) {
        room.gameState.playerA.isConnected = true;
        room.gameState.playerA.disconnectedAt = undefined;
        room.gameState.playerA.socketId = socket.id;
      } else if (room.gameState.playerB.playerId === playerId) {
        room.gameState.playerB.isConnected = true;
        room.gameState.playerB.disconnectedAt = undefined;
        room.gameState.playerB.socketId = socket.id;
      }
      this.sendStateToPlayer(socket, room.gameState, playerId, room.spectators.length);
      this.broadcastGameState(roomId);
      return;
    }

    const spec = room.spectators.find((s) => s.playerId === playerId);
    if (spec) {
      spec.socketId = socket.id;
      socket.join(roomId);
      this.sendStateToPlayer(socket, room.gameState, playerId, room.spectators.length);
    }
  }

  public getLiveMatches(): LiveMatchSummary[] {
    const matches: LiveMatchSummary[] = [];
    for (const room of this.rooms.values()) {
      if (!room.gameState || room.gameState.phase === 'GAME_OVER') continue;
      matches.push({
        roomId: room.roomId,
        type: room.type,
        inviteCode: room.inviteCode,
        winScore: room.winScore,
        battleFormat: room.battleFormat,
        turnNumber: room.gameState.turnNumber,
        phase: room.gameState.phase,
        playerAName: room.gameState.playerA.name,
        playerAAvatar: room.gameState.playerA.avatarIcon,
        playerAScore: room.gameState.playerA.score,
        playerBName: room.gameState.playerB.name,
        playerBAvatar: room.gameState.playerB.avatarIcon,
        playerBScore: room.gameState.playerB.score,
        spectatorCount: room.spectators.length,
      });
    }
    return matches;
  }

  public spectateMatch(
    socket: Socket,
    targetIdOrCode: string,
    player: { id: string; name: string }
  ) {
    const trimmed = targetIdOrCode.trim();
    let room = this.rooms.get(trimmed);
    if (!room) {
      const code = trimmed.toUpperCase();
      room = this.rooms.get('friend_' + code);
    }
    if (!room || !room.gameState) {
      socket.emit('card_error', {
        message: '観戦できる進行中のルームが見つかりません。',
      });
      return;
    }

    const isParticipant = room.participants.some((p) => p.playerId === player.id);
    if (!isParticipant) {
      room.spectators = room.spectators.filter(
        (s) => s.playerId !== player.id && s.socketId !== socket.id
      );
      room.spectators.push({
        socketId: socket.id,
        playerId: player.id,
        name: player.name || '観戦者',
      });
    }

    socket.join(room.roomId);
    this.broadcastGameState(room.roomId);
  }

  public leaveSpectate(socket: Socket, roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const before = room.spectators.length;
    room.spectators = room.spectators.filter((s) => s.socketId !== socket.id);
    socket.leave(roomId);
    if (room.spectators.length !== before) {
      this.broadcastGameState(roomId);
    }
  }

  public handleDisconnect(socketId: string) {
    this.cancelMatch(socketId);

    for (const [roomId, room] of this.rooms.entries()) {
      const specIdx = room.spectators.findIndex((s) => s.socketId === socketId);
      if (specIdx !== -1) {
        room.spectators.splice(specIdx, 1);
        this.broadcastGameState(roomId);
      }

      const p = room.participants.find((part) => part.socketId === socketId);
      if (p && room.gameState && room.gameState.phase !== 'GAME_OVER') {
        const now = Date.now();
        if (room.gameState.playerA.playerId === p.playerId) {
          room.gameState.playerA.isConnected = false;
          room.gameState.playerA.disconnectedAt = now;
        } else if (room.gameState.playerB.playerId === p.playerId) {
          room.gameState.playerB.isConnected = false;
          room.gameState.playerB.disconnectedAt = now;
        }
        this.startDisconnectForfeitTimer(roomId, p.playerId);
        this.broadcastGameState(roomId);
      }
    }
  }

  private clearDisconnectTimer(roomId: string, playerId: string) {
    const key = `${roomId}:${playerId}`;
    const timer = this.disconnectTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(key);
    }
  }

  private clearAllRoomDisconnectTimers(roomId: string) {
    for (const [key, timer] of this.disconnectTimers.entries()) {
      if (key.startsWith(`${roomId}:`)) {
        clearTimeout(timer);
        this.disconnectTimers.delete(key);
      }
    }
  }

  private startDisconnectForfeitTimer(roomId: string, disconnectedPlayerId: string) {
    this.clearDisconnectTimer(roomId, disconnectedPlayerId);
    const key = `${roomId}:${disconnectedPlayerId}`;

    const timer = setTimeout(() => {
      this.disconnectTimers.delete(key);
      const room = this.rooms.get(roomId);
      if (!room || !room.gameState || room.gameState.phase === 'GAME_OVER') return;

      const state = room.gameState;
      const isPlayerA = state.playerA.playerId === disconnectedPlayerId;
      const isPlayerB = state.playerB.playerId === disconnectedPlayerId;
      if (!isPlayerA && !isPlayerB) return;

      const disconnectedPlayer = isPlayerA ? state.playerA : state.playerB;
      const remainingPlayer = isPlayerA ? state.playerB : state.playerA;

      if (disconnectedPlayer.isConnected) return;

      this.clearAllRoomDisconnectTimers(roomId);

      state.phase = 'GAME_OVER';
      state.winnerPlayerId = remainingPlayer.playerId;
      state.winReason = `${disconnectedPlayer.name} の通信が1分間回復しなかったため、不戦勝（デフォルト勝利）となりました！`;
      state.stateVersion += 1;
      state.lastActionTimestamp = Date.now();

      this.broadcastGameState(roomId);
    }, CardRoomManager.DISCONNECT_FORFEIT_MS);

    this.disconnectTimers.set(key, timer);
  }

  public broadcastGameState(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) return;
    const specCount = room.spectators.length;

    for (const p of room.participants) {
      if (p.isBot) continue;
      const sock = this.io.sockets.sockets.get(p.socketId);
      if (sock) {
        const sanitized = sanitizeGameStateForPlayer(room.gameState, p.playerId, specCount);
        sock.emit('card_game_state', sanitized);
      }
    }

    for (const spec of room.spectators) {
      const sock = this.io.sockets.sockets.get(spec.socketId);
      if (sock) {
        const sanitized = sanitizeGameStateForPlayer(room.gameState, spec.playerId, specCount);
        sock.emit('card_game_state', sanitized);
      }
    }
  }

  private sendStateToPlayer(
    socket: Socket,
    state: GameState,
    playerId: string,
    spectatorCount: number = 0
  ) {
    const sanitized = sanitizeGameStateForPlayer(state, playerId, spectatorCount);
    socket.emit('card_game_state', sanitized);
  }

  private scheduleBotIfNeeded(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room || room.type !== 'solo' || !room.gameState || room.gameState.phase === 'GAME_OVER') {
      return;
    }

    const state = room.gameState;
    const isBotPromotion =
      state.phase === 'WAITING_FOR_PROMOTION' && state.promotionRequiredPlayerKey === 'playerB';
    const isBotMainTurn = state.phase === 'MAIN' && state.activePlayerKey === 'playerB';

    if (isBotPromotion || isBotMainTurn) {
      setTimeout(() => this.executeBotStep(roomId), 750);
    }
  }

  private executeBotStep(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState || room.gameState.phase === 'GAME_OVER') return;

    try {
      const botAction = decideNextBotAction(room.gameState, 'playerB');
      if (!botAction) return;

      const res = handleGameAction(room.gameState, room.gameState.playerB.playerId, botAction);
      if (res.success) {
        this.broadcastGameState(roomId);
        this.scheduleBotIfNeeded(roomId);
      } else {
        // Fallback: if a bot action fails validation, safely end the bot's turn so the match never stalls or loops
        if (room.gameState.phase === 'MAIN' && room.gameState.activePlayerKey === 'playerB') {
          const fallback = handleGameAction(room.gameState, room.gameState.playerB.playerId, {
            actionType: 'END_TURN',
          });
          if (fallback.success) {
            this.broadcastGameState(roomId);
          }
        }
      }
    } catch (err) {
      console.error('[Bot Step Error]', err);
    }
  }
}
