import { CardInstance, MaskedCardInstance } from '../cards/types';
import {
  BattleFormatOption,
  GameAnimationEvent,
  GameEventLog,
  GamePhase,
  PlayerKey,
  WinScoreOption,
} from '../game/types';

export interface SanitizedPlayerState {
  playerId: string;
  name: string;
  avatarIcon: string;
  score: number;
  maxScore: WinScoreOption;
  activeCard: CardInstance | null;
  bench: (CardInstance | null)[]; // 3 slots
  deckCount: number;
  handCount: number;
  hand?: CardInstance[];
  maskedHand?: MaskedCardInstance[];
  trash: CardInstance[];
  energyAvailable: number;
  hasAttachedEnergyThisTurn: boolean;
  hasRetreatedThisTurn: boolean;
  hasUsedSpellThisTurn: boolean;
  hasUsedTradeTicketThisMatch?: boolean;
  isConnected: boolean;
  disconnectedAt?: number;
}

export interface SanitizedGameState {
  gameId: string;
  roomId: string;
  phase: GamePhase;
  turnNumber: number;
  activePlayerKey: PlayerKey;
  firstPlayerKey: PlayerKey;
  promotionRequiredPlayerKey?: PlayerKey;
  winScore: WinScoreOption;
  battleFormat: BattleFormatOption;
  isMyTurn: boolean;
  mustPromoteBench: boolean;
  myPlayerKey: PlayerKey;
  isSpectator?: boolean;
  spectatorCount?: number;
  me: SanitizedPlayerState;
  opponent: SanitizedPlayerState;
  stateVersion: number;
  winnerPlayerId?: string;
  winReason?: string;
  logs: GameEventLog[];
  lastAnimation?: GameAnimationEvent;
}

export interface LiveMatchSummary {
  roomId: string;
  type: 'random' | 'friend' | 'solo';
  inviteCode?: string;
  winScore: WinScoreOption;
  battleFormat: BattleFormatOption;
  turnNumber: number;
  phase: GamePhase;
  playerAName: string;
  playerAAvatar: string;
  playerAScore: number;
  playerBName: string;
  playerBAvatar: string;
  playerBScore: number;
  spectatorCount: number;
}
