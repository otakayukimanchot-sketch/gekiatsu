import { CardInstance } from '../cards/types';

export type GamePhase =
  | 'WAITING'
  | 'MAIN'
  | 'WAITING_FOR_PROMOTION' // Knocked out active card; player must pick a bench card
  | 'GAME_OVER';

export type PlayerKey = 'playerA' | 'playerB';

export type WinScoreOption = 3 | 5 | 7;

export type BattleFormatOption = 'standard' | 'allstar';

export interface PlayerBattleState {
  playerId: string;
  name: string;
  socketId: string;
  avatarIcon: string;
  score: number;
  maxScore: WinScoreOption;
  activeCard: CardInstance | null;
  bench: (CardInstance | null)[]; // 3 Bench slots (0, 1, 2)
  hand: CardInstance[];
  deck: CardInstance[];
  trash: CardInstance[];
  energyAvailable: number; // Energy orb ready in the Energy Zone this turn
  hasAttachedEnergyThisTurn: boolean;
  hasRetreatedThisTurn: boolean;
  hasUsedSpellThisTurn: boolean;
  isConnected: boolean;
}

export type AnimationEventType =
  | 'GAME_START'
  | 'DRAW'
  | 'PLAY_CARD'
  | 'EVOLVE'
  | 'ATTACH_ENERGY'
  | 'ATTACK'
  | 'KNOCKOUT'
  | 'RETREAT'
  | 'PROMOTE'
  | 'SPELL'
  | 'HEAL'
  | 'GAME_OVER';

export interface GameAnimationEvent {
  id: string;
  type: AnimationEventType;
  actorPlayerId: string;
  sourceCardId?: string;
  targetCardId?: string;
  cardName?: string;
  attackName?: string;
  damage?: number;
  heal?: number;
  pointsGained?: number;
  timestamp: number;
}

export interface GameEventLog {
  id: string;
  timestamp: number;
  turnNumber: number;
  actorPlayerId: string;
  actorPlayerName: string;
  type: AnimationEventType | 'TURN_END' | 'SURRENDER';
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
  promotionRequiredPlayerKey?: PlayerKey;
  winScore: WinScoreOption;
  battleFormat: BattleFormatOption;
  processedKnockoutIds: string[];
  playerA: PlayerBattleState;
  playerB: PlayerBattleState;
  stateVersion: number;
  winnerPlayerId?: string;
  winReason?: string;
  logs: GameEventLog[];
  lastAnimation?: GameAnimationEvent;
  lastActionTimestamp: number;
}

export type GameActionType =
  | 'PLAY_CARD_TO_ACTIVE'
  | 'PLAY_CARD_TO_BENCH'
  | 'EVOLVE_CARD'
  | 'ATTACH_ENERGY'
  | 'RETREAT_ACTIVE'
  | 'PROMOTE_BENCH_CARD'
  | 'ATTACK'
  | 'USE_SPELL_CARD'
  | 'END_TURN'
  | 'SURRENDER';

export interface GameActionPayload {
  actionType: GameActionType;
  cardInstanceId?: string;
  targetCardInstanceId?: string;
  benchIndex?: number; // 0..2
  customDeckIds?: string[];
  stateVersion?: number;
}
