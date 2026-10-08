import { GameState, PlayerKey } from '../game/types';
import { SanitizedGameState, SanitizedPlayerState } from './types';
import { MaskedCardInstance } from '../cards/types';

export function sanitizeGameStateForPlayer(
  state: GameState,
  viewingPlayerId: string
): SanitizedGameState {
  const isPlayerA = state.playerA.playerId === viewingPlayerId;
  const myKey: PlayerKey = isPlayerA ? 'playerA' : 'playerB';
  const opponentKey: PlayerKey = isPlayerA ? 'playerB' : 'playerA';

  const myRaw = state[myKey];
  const oppRaw = state[opponentKey];

  const me: SanitizedPlayerState = {
    playerId: myRaw.playerId,
    name: myRaw.name,
    avatarIcon: myRaw.avatarIcon,
    score: myRaw.score,
    maxScore: myRaw.maxScore,
    activeCard: myRaw.activeCard,
    bench: myRaw.bench || [null, null, null],
    deckCount: myRaw.deck?.length ?? 0,
    handCount: myRaw.hand?.length ?? 0,
    hand: myRaw.hand || [],
    trash: myRaw.trash || [],
    energyAvailable: myRaw.energyAvailable,
    hasAttachedEnergyThisTurn: myRaw.hasAttachedEnergyThisTurn,
    hasRetreatedThisTurn: myRaw.hasRetreatedThisTurn,
    hasUsedSpellThisTurn: myRaw.hasUsedSpellThisTurn,
    isConnected: myRaw.isConnected,
  };

  const maskedOpponentHand: MaskedCardInstance[] = (oppRaw.hand || []).map((card) => ({
    instanceId: card.instanceId,
    zone: 'HAND',
    isFaceDown: true,
  }));

  const opponent: SanitizedPlayerState = {
    playerId: oppRaw.playerId,
    name: oppRaw.name,
    avatarIcon: oppRaw.avatarIcon,
    score: oppRaw.score,
    maxScore: oppRaw.maxScore,
    activeCard: oppRaw.activeCard,
    bench: oppRaw.bench || [null, null, null],
    deckCount: oppRaw.deck?.length ?? 0,
    handCount: oppRaw.hand?.length ?? 0,
    maskedHand: maskedOpponentHand,
    trash: oppRaw.trash || [],
    energyAvailable: oppRaw.energyAvailable,
    hasAttachedEnergyThisTurn: oppRaw.hasAttachedEnergyThisTurn,
    hasRetreatedThisTurn: oppRaw.hasRetreatedThisTurn,
    hasUsedSpellThisTurn: oppRaw.hasUsedSpellThisTurn,
    isConnected: oppRaw.isConnected,
  };

  return {
    gameId: state.gameId,
    roomId: state.roomId,
    phase: state.phase,
    turnNumber: state.turnNumber,
    activePlayerKey: state.activePlayerKey,
    firstPlayerKey: state.firstPlayerKey,
    promotionRequiredPlayerKey: state.promotionRequiredPlayerKey,
    winScore: state.winScore || myRaw.maxScore || 3,
    battleFormat: state.battleFormat || 'standard',
    isMyTurn: state.activePlayerKey === myKey && state.phase === 'MAIN',
    mustPromoteBench:
      state.phase === 'WAITING_FOR_PROMOTION' && state.promotionRequiredPlayerKey === myKey,
    myPlayerKey: myKey,
    me,
    opponent,
    stateVersion: state.stateVersion,
    winnerPlayerId: state.winnerPlayerId,
    winReason: state.winReason,
    logs: [],
    lastAnimation: state.lastAnimation,
  };
}
