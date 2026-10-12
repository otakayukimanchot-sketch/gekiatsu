import { GameState, PlayerKey } from '../game/types';
import { SanitizedGameState, SanitizedPlayerState } from './types';
import { MaskedCardInstance } from '../cards/types';

export function sanitizeGameStateForPlayer(
  state: GameState,
  viewingPlayerId: string,
  spectatorCount: number = 0
): SanitizedGameState {
  const isPlayerA = state.playerA.playerId === viewingPlayerId;
  const isPlayerB = state.playerB.playerId === viewingPlayerId;
  const isSpectator = !isPlayerA && !isPlayerB;

  const myKey: PlayerKey = isSpectator ? 'playerA' : isPlayerA ? 'playerA' : 'playerB';
  const opponentKey: PlayerKey = isSpectator ? 'playerB' : isPlayerA ? 'playerB' : 'playerA';

  const myRaw = state[myKey];
  const oppRaw = state[opponentKey];

  const maskedMyHand: MaskedCardInstance[] = (myRaw.hand || []).map((card) => ({
    instanceId: card.instanceId,
    zone: 'HAND',
    isFaceDown: true,
  }));

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
    hand: isSpectator ? [] : myRaw.hand || [],
    maskedHand: isSpectator ? maskedMyHand : undefined,
    trash: myRaw.trash || [],
    energyAvailable: myRaw.energyAvailable,
    hasAttachedEnergyThisTurn: myRaw.hasAttachedEnergyThisTurn,
    hasRetreatedThisTurn: myRaw.hasRetreatedThisTurn,
    hasUsedSpellThisTurn: myRaw.hasUsedSpellThisTurn,
    hasUsedTradeTicketThisMatch: myRaw.hasUsedTradeTicketThisMatch,
    isConnected: myRaw.isConnected,
    disconnectedAt: myRaw.disconnectedAt,
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
    hasUsedTradeTicketThisMatch: oppRaw.hasUsedTradeTicketThisMatch,
    isConnected: oppRaw.isConnected,
    disconnectedAt: oppRaw.disconnectedAt,
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
    isMyTurn: !isSpectator && state.activePlayerKey === myKey && state.phase === 'MAIN',
    mustPromoteBench:
      !isSpectator &&
      state.phase === 'WAITING_FOR_PROMOTION' &&
      state.promotionRequiredPlayerKey === myKey,
    myPlayerKey: myKey,
    isSpectator,
    spectatorCount,
    me,
    opponent,
    stateVersion: state.stateVersion,
    winnerPlayerId: state.winnerPlayerId,
    winReason: state.winReason,
    logs: state.logs || [],
    lastAnimation: state.lastAnimation,
  };
}
