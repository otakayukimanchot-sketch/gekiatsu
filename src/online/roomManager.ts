import { GameState, GameActionPayload } from '../game/types';
import { initializeGame, handleGameAction } from '../game/engine/gameEngine';
import { sanitizeGameStateForPlayer } from './sanitizer';
import { getCardDefinition } from '../cards/cardRegistry';
import { Server, Socket } from 'socket.io';

export interface RoomParticipant {
  socketId: string;
  id: string;
  playerId: string;
  name: string;
  avatarIcon: string;
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

  public handleQuickMatch(socket: Socket, player: { id: string; name: string; avatarIcon?: string }) {
    // Remove if already in queue
    this.quickMatchQueue = this.quickMatchQueue.filter(p => p.playerId !== player.id && p.socketId !== socket.id);

    const participant: RoomParticipant = {
      socketId: socket.id,
      id: player.id,
      playerId: player.id,
      name: player.name,
      avatarIcon: player.avatarIcon || 'smile'
    };

    if (this.quickMatchQueue.length > 0) {
      // Pair up with waiting player
      const opponent = this.quickMatchQueue.shift()!;
      const roomId = 'room_' + Math.random().toString(36).substring(2, 9);

      const room: CardRoom = {
        roomId,
        type: 'random',
        participants: [opponent, participant],
        createdAt: Date.now()
      };

      const gameId = 'game_' + roomId;
      room.gameState = initializeGame(gameId, roomId, opponent, participant);
      this.rooms.set(roomId, room);

      // Join sockets to room
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
    this.quickMatchQueue = this.quickMatchQueue.filter(p => p.socketId !== socketId);
  }

  public createFriendRoom(socket: Socket, player: { id: string; name: string; avatarIcon?: string }): string {
    const inviteCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const roomId = 'friend_' + inviteCode;

    const participant: RoomParticipant = {
      socketId: socket.id,
      id: player.id,
      playerId: player.id,
      name: player.name,
      avatarIcon: player.avatarIcon || 'smile'
    };

    const room: CardRoom = {
      roomId,
      type: 'friend',
      inviteCode,
      participants: [participant],
      createdAt: Date.now()
    };

    this.rooms.set(roomId, room);
    socket.join(roomId);

    socket.emit('friend_room_created', { inviteCode, roomId });
    return roomId;
  }

  public joinFriendRoom(socket: Socket, inviteCode: string, player: { id: string; name: string; avatarIcon?: string }) {
    const cleanCode = inviteCode.trim().toUpperCase();
    const roomId = 'friend_' + cleanCode;
    const room = this.rooms.get(roomId);

    if (!room) {
      socket.emit('card_error', { message: 'ルームが見つかりません。合言葉を確認してください。' });
      return;
    }

    if (room.participants.length >= 2) {
      // Check if rejoining
      const existing = room.participants.find(p => p.playerId === player.id);
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
      avatarIcon: player.avatarIcon || 'rocket'
    };

    room.participants.push(participant);
    socket.join(roomId);

    // Initialize game with 2 players
    const gameId = 'game_' + roomId;
    room.gameState = initializeGame(gameId, roomId, room.participants[0], participant);

    this.broadcastGameState(roomId);
  }

  public startSoloBotMatch(socket: Socket, player: { id: string; name: string; avatarIcon?: string }) {
    const roomId = 'solo_' + Math.random().toString(36).substring(2, 9);
    const botId = 'bot_cpu_master';

    const human: RoomParticipant = {
      socketId: socket.id,
      id: player.id,
      playerId: player.id,
      name: player.name,
      avatarIcon: player.avatarIcon || 'smile'
    };

    const bot: RoomParticipant = {
      socketId: 'socket_bot',
      id: botId,
      playerId: botId,
      name: 'CPU 師範',
      avatarIcon: 'ghost',
      isBot: true
    };

    const room: CardRoom = {
      roomId,
      type: 'solo',
      participants: [human, bot],
      createdAt: Date.now()
    };

    const gameId = 'game_' + roomId;
    room.gameState = initializeGame(gameId, roomId, human, bot);
    this.rooms.set(roomId, room);

    socket.join(roomId);
    this.broadcastGameState(roomId);

    // If bot goes first, schedule bot turn
    if (room.gameState.activePlayerKey === 'playerB') {
      setTimeout(() => this.processBotTurn(roomId), 1500);
    }
  }

  public handleCardAction(socket: Socket, roomId: string, playerId: string, payload: GameActionPayload) {
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

    // If opponent is bot and it is now bot's turn, trigger bot decision
    if (
      room.type === 'solo' &&
      room.gameState.phase !== 'GAME_OVER' &&
      room.gameState.activePlayerKey === 'playerB'
    ) {
      setTimeout(() => this.processBotTurn(roomId), 1200);
    }
  }

  public rejoinMatch(socket: Socket, roomId: string, playerId: string) {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) return;

    const p = room.participants.find(part => part.playerId === playerId);
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
      const p = room.participants.find(part => part.socketId === socketId);
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

  private processBotTurn(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState || room.gameState.phase === 'GAME_OVER') return;
    const bot = room.gameState.playerB;
    if (room.gameState.activePlayerKey !== 'playerB') return;

    // 1. Play attack cards or environment cards if possible
    const attackInHand = bot.hand.find(c => {
      const def = getCardDefinition(c.definitionId);
      return def && def.type === 'ATTACK' && !def.isEvolutionOnly;
    });

    const emptySlot = bot.field.findIndex(s => s === null);
    if (attackInHand && emptySlot !== -1) {
      handleGameAction(room.gameState, bot.playerId, {
        actionType: 'PLAY_ATTACK_CARD',
        cardInstanceId: attackInHand.instanceId,
        targetSlotIndex: emptySlot
      });
      this.broadcastGameState(roomId);
    }

    // 2. Play spell card or attachment if possible
    const spellInHand = bot.hand.find(c => {
      const def = getCardDefinition(c.definitionId);
      return def && def.type === 'SPELL' && def.subType === 'NORMAL';
    });
    if (spellInHand) {
      handleGameAction(room.gameState, bot.playerId, {
        actionType: 'USE_SPELL_CARD',
        cardInstanceId: spellInHand.instanceId
      });
      this.broadcastGameState(roomId);
    }

    // 3. Attack with all ready field cards
    setTimeout(() => {
      if (!room.gameState || room.gameState.phase === 'GAME_OVER') return;
      const playerA = room.gameState.playerA;

      bot.field.forEach(c => {
        if (c && c.canAttack && c.attacksThisTurn === 0) {
          // Check if playerA has Taunt
          const tauntCard = playerA.field.find(fc => fc && fc.isTaunt);
          if (tauntCard) {
            handleGameAction(room.gameState!, bot.playerId, {
              actionType: 'ATTACK_CARD',
              cardInstanceId: c.instanceId,
              targetCardInstanceId: tauntCard.instanceId
            });
          } else {
            // Direct attack player
            handleGameAction(room.gameState!, bot.playerId, {
              actionType: 'ATTACK_PLAYER',
              cardInstanceId: c.instanceId
            });
          }
        }
      });
      this.broadcastGameState(roomId);

      // 4. End turn
      setTimeout(() => {
        if (!room.gameState || room.gameState.phase === 'GAME_OVER') return;
        handleGameAction(room.gameState, bot.playerId, { actionType: 'END_TURN' });
        this.broadcastGameState(roomId);
      }, 800);
    }, 800);
  }
}
