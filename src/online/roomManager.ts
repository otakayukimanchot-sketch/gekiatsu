import { GameState, GameActionPayload } from '../game/types';
import { initializeGame, handleGameAction } from '../game/engine/gameEngine';
import { decideNextBotAction } from '../game/cpu/cpuLogic';
import { sanitizeGameStateForPlayer } from './sanitizer';
import { Server, Socket } from 'socket.io';

export interface RoomParticipant {
  socketId: string;
  id: string;
  playerId: string;
  name: string;
  avatarIcon: string;
  customDeckIds?: string[];
  isBot?: boolean;
}

export interface CardRoom {
  roomId: string;
  type: 'random' | 'friend' | 'solo';
  inviteCode?: string;
  participants: RoomParticipant[];
  gameState?: GameState;
  createdAt: number;
}

export class CardRoomManager {
  private rooms = new Map<string, CardRoom>();
  private quickMatchQueue: RoomParticipant[] = [];
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public handleQuickMatch(
    socket: Socket,
    player: { id: string; name: string; avatarIcon?: string; customDeckIds?: string[] }
  ) {
    this.quickMatchQueue = this.quickMatchQueue.filter(
      (p) => p.playerId !== player.id && p.socketId !== socket.id
    );

    const participant: RoomParticipant = {
      socketId: socket.id,
      id: player.id,
      playerId: player.id,
      name: player.name,
      avatarIcon: player.avatarIcon || 'smile',
      customDeckIds: player.customDeckIds,
    };

    if (this.quickMatchQueue.length > 0) {
      const opponent = this.quickMatchQueue.shift()!;
      const roomId = 'room_' + Math.random().toString(36).substring(2, 9);

      const room: CardRoom = {
        roomId,
        type: 'random',
        participants: [opponent, participant],
        createdAt: Date.now(),
      };

      const gameId = 'game_' + roomId;
      room.gameState = initializeGame(
        gameId,
        roomId,
        opponent,
        participant,
        opponent.customDeckIds,
        participant.customDeckIds
      );
      this.rooms.set(roomId, room);

      const oppSocket = this.io.sockets.sockets.get(opponent.socketId);
      if (oppSocket) oppSocket.join(roomId);
      socket.join(roomId);

      this.broadcastGameState(roomId);
    } else {
      this.quickMatchQueue.push(participant);
      socket.emit('match_waiting', { message: '対戦相手を探しています…' });
    }
  }

  public cancelMatch(socketId: string) {
    this.quickMatchQueue = this.quickMatchQueue.filter((p) => p.socketId !== socketId);
  }

  public createFriendRoom(
    socket: Socket,
    player: { id: string; name: string; avatarIcon?: string; customDeckIds?: string[] }
  ): string {
    const inviteCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const roomId = 'friend_' + inviteCode;

    const participant: RoomParticipant = {
      socketId: socket.id,
      id: player.id,
      playerId: player.id,
      name: player.name,
      avatarIcon: player.avatarIcon || 'smile',
      customDeckIds: player.customDeckIds,
    };

    const room: CardRoom = {
      roomId,
      type: 'friend',
      inviteCode,
      participants: [participant],
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
    player: { id: string; name: string; avatarIcon?: string; customDeckIds?: string[] }
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
        if (room.gameState) {
          this.sendStateToPlayer(socket, room.gameState, player.id);
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
      participant.customDeckIds
    );

    this.broadcastGameState(roomId);
  }

  public startSoloBotMatch(
    socket: Socket,
    player: { id: string; name: string; avatarIcon?: string; customDeckIds?: string[] }
  ) {
    const roomId = 'solo_' + Math.random().toString(36).substring(2, 9);
    const botId = 'bot_cpu_master';

    const human: RoomParticipant = {
      socketId: socket.id,
      id: player.id,
      playerId: player.id,
      name: player.name,
      avatarIcon: player.avatarIcon || 'smile',
      customDeckIds: player.customDeckIds,
    };

    const bot: RoomParticipant = {
      socketId: 'socket_bot',
      id: botId,
      playerId: botId,
      name: 'CPU マスター',
      avatarIcon: 'ghost',
      isBot: true,
    };

    const room: CardRoom = {
      roomId,
      type: 'solo',
      participants: [human, bot],
      createdAt: Date.now(),
    };

    const gameId = 'game_' + roomId;
    room.gameState = initializeGame(gameId, roomId, human, bot, human.customDeckIds);
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

    this.broadcastGameState(roomId);
    this.scheduleBotIfNeeded(roomId);
  }

  public rejoinMatch(socket: Socket, roomId: string, playerId: string) {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) return;

    const p = room.participants.find((part) => part.playerId === playerId);
    if (p) {
      p.socketId = socket.id;
      socket.join(roomId);
      if (room.gameState.playerA.playerId === playerId) {
        room.gameState.playerA.isConnected = true;
        room.gameState.playerA.socketId = socket.id;
      } else if (room.gameState.playerB.playerId === playerId) {
        room.gameState.playerB.isConnected = true;
        room.gameState.playerB.socketId = socket.id;
      }
      this.sendStateToPlayer(socket, room.gameState, playerId);
      this.broadcastGameState(roomId);
    }
  }

  public handleDisconnect(socketId: string) {
    this.cancelMatch(socketId);

    for (const [roomId, room] of this.rooms.entries()) {
      const p = room.participants.find((part) => part.socketId === socketId);
      if (p && room.gameState && room.gameState.phase !== 'GAME_OVER') {
        if (room.gameState.playerA.playerId === p.playerId) {
          room.gameState.playerA.isConnected = false;
        } else if (room.gameState.playerB.playerId === p.playerId) {
          room.gameState.playerB.isConnected = false;
        }
        this.broadcastGameState(roomId);
      }
    }
  }

  public broadcastGameState(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) return;

    for (const p of room.participants) {
      if (p.isBot) continue;
      const sock = this.io.sockets.sockets.get(p.socketId);
      if (sock) {
        const sanitized = sanitizeGameStateForPlayer(room.gameState, p.playerId);
        sock.emit('card_game_state', sanitized);
      }
    }
  }

  private sendStateToPlayer(socket: Socket, state: GameState, playerId: string) {
    const sanitized = sanitizeGameStateForPlayer(state, playerId);
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

    const botAction = decideNextBotAction(room.gameState, 'playerB');
    if (!botAction) return;

    const res = handleGameAction(room.gameState, room.gameState.playerB.playerId, botAction);
    if (res.success) {
      this.broadcastGameState(roomId);
      this.scheduleBotIfNeeded(roomId);
    }
  }
}
