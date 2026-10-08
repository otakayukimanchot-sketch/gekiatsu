import { CardInstance, MaskedCardInstance } from '../cards/types';
import { GameAnimationEvent, GameEventLog, GamePhase, PlayerKey } from '../game/types';

export interface SanitizedPlayerState {
  playerId: string;
  name: string;
  avatarIcon: string;
  score: number;
  maxScore: number;
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
  isConnected: boolean;
}

export interface SanitizedGameState {
  gameId: string;
  roomId: string;
  phase: GamePhase;
  turnNumber: number;
  activePlayerKey: PlayerKey;
  firstPlayerKey: PlayerKey;
  promotionRequiredPlayerKey?: PlayerKey;
  isMyTurn: boolean;
  mustPromoteBench: boolean;
  myPlayerKey: PlayerKey;
  me: SanitizedPlayerState;
  opponent: SanitizedPlayerState;
  stateVersion: number;
  winnerPlayerId?: string;
  winReason?: string;
  logs: GameEventLog[];
  lastAnimation?: GameAnimationEvent;
}
