import { CardInstance, MaskedCardInstance } from '../cards/types';
import { ActiveEnvironment, GameEventLog, GamePhase, PlayerKey } from '../game/types';

export interface SanitizedPlayerState {
  playerId: string;
  name: string;
  avatarIcon: string;
  hp: number;
  maxHp: number;
  deckCount: number;
  handCount: number;
  // If this is the client player, `hand` contains full CardInstances.
  // If opponent, `maskedHand` contains face-down cards with instanceIds only.
  hand?: CardInstance[];
  maskedHand?: MaskedCardInstance[];
  field: (CardInstance | null)[];
  graveyard: CardInstance[];
  attacksCountThisTurn: number;
  hasDrawnThisTurn: boolean;
  isConnected: boolean;
}

export interface SanitizedGameState {
  gameId: string;
  roomId: string;
  phase: GamePhase;
  turnNumber: number;
  activePlayerKey: PlayerKey;
  firstPlayerKey: PlayerKey;
  isMyTurn: boolean;
  myPlayerKey: PlayerKey;
  me: SanitizedPlayerState;
  opponent: SanitizedPlayerState;
  environment: ActiveEnvironment | null;
  stateVersion: number;
  winnerPlayerId?: string;
  winReason?: string;
  logs: GameEventLog[];
}
