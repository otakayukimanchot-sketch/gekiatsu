import { CardInstance, CardZone } from '../cards/types';

export type GamePhase = 
  | 'WAITING'
  | 'STARTING'
  | 'DRAW'
  | 'MAIN'
  | 'BATTLE'
  | 'END'
  | 'GAME_OVER';

export type PlayerKey = 'playerA' | 'playerB';

export interface PlayerCombatState {
  playerId: string;
  name: string;
  socketId: string;
  avatarIcon: string;
  hp: number;
  maxHp: number;
  deck: CardInstance[];
  hand: CardInstance[];
  field: (CardInstance | null)[]; // 5 slots on the board
  graveyard: CardInstance[];
  exile: CardInstance[];
  hasDrawnThisTurn: boolean;
  summonCountThisTurn: number;
  attacksCountThisTurn: number;
  isReady: boolean;
  isConnected: boolean;
}

export interface ActiveEnvironment {
  cardInstance: CardInstance;
  placedByPlayerId: string;
  placedTurn: number;
}

export interface GameEventLog {
  id: string;
  timestamp: number;
  turnNumber: number;
  actorPlayerId: string;
  actorPlayerName: string;
  type: 
    | 'GAME_START'
    | 'DRAW'
    | 'PLAY_ATTACK'
    | 'USE_SPELL'
    | 'ATTACH_CARD'
    | 'EVOLVE'
    | 'PLAY_ENVIRONMENT'
    | 'ATTACK'
    | 'COMBAT_DAMAGE'
    | 'HEAL'
    | 'DESTROY'
    | 'TURN_END'
    | 'EFFECT_TRIGGER'
    | 'SURRENDER'
    | 'DISCONNECT'
    | 'GAME_OVER';
  message: string;
  cardName?: string;
  targetName?: string;
  value?: number;
}

export interface GameState {
  gameId: string;
  roomId: string;
  phase: GamePhase;
  turnNumber: number;
  activePlayerKey: PlayerKey;
  firstPlayerKey: PlayerKey;
  playerA: PlayerCombatState;
  playerB: PlayerCombatState;
  environment: ActiveEnvironment | null;
  stateVersion: number;
  winnerPlayerId?: string;
  winReason?: string;
  logs: GameEventLog[];
  lastActionTimestamp: number;
}

// Client action payload types
export type GameActionType =
  | 'READY'
  | 'DRAW_CARD'
  | 'PLAY_ATTACK_CARD'
  | 'USE_SPELL_CARD'
  | 'ATTACH_CARD'
  | 'EVOLVE_CARD'
  | 'PLAY_ENVIRONMENT'
  | 'ATTACK_CARD'
  | 'ATTACK_PLAYER'
  | 'END_TURN'
  | 'SURRENDER';

export interface GameActionPayload {
  actionType: GameActionType;
  cardInstanceId?: string;
  targetCardInstanceId?: string;
  targetSlotIndex?: number;
  targetPlayerId?: string;
  stateVersion?: number;
}
