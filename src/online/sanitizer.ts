import { GameState, PlayerCombatState, PlayerKey } from '../game/types';
import { SanitizedGameState, SanitizedPlayerState } from './types';
import { MaskedCardInstance } from '../cards/types';

export function sanitizeGameStateForPlayer(state: GameState, viewingPlayerId: string): SanitizedGameState {
  const isPlayerA = state.playerA.playerId === viewingPlayerId;
  const myKey: PlayerKey = isPlayerA ? 'playerA' : 'playerB';
  const opponentKey: PlayerKey = isPlayerA ? 'playerB' : 'playerA';

  const myRaw = state[myKey];
  const oppRaw = state[opponentKey];

  const me: SanitizedPlayerState = {
    playerId: myRaw.playerId,
    name: myRaw.name,
    avatarIcon: myRaw.avatarIcon,
    hp: myRaw.hp,
    maxHp: myRaw.maxHp,
    deckCount: myRaw.deck.length,
    handCount: myRaw.hand.length,
    hand: myRaw.hand, // View own hand fully
    field: myRaw.field,
    graveyard: myRaw.graveyard,
    attacksCountThisTurn: myRaw.attacksCountThisTurn,
    hasDrawnThisTurn: myRaw.hasDrawnThisTurn,
    isConnected: myRaw.isConnected
  };

  // Mask opponent hand strictly according to Prompt #14
  const maskedOpponentHand: MaskedCardInstance[] = oppRaw.hand.map(card => ({
    instanceId: card.instanceId,
    zone: 'HAND',
    isFaceDown: true
  }));

  const opponent: SanitizedPlayerState = {
    playerId: oppRaw.playerId,
    name: oppRaw.name,
    avatarIcon: oppRaw.avatarIcon,
    hp: oppRaw.hp,
    maxHp: oppRaw.maxHp,
    deckCount: oppRaw.deck.length,
    handCount: oppRaw.hand.length,
    maskedHand: maskedOpponentHand, // Opponent cards have NO definitionId or stats
    field: oppRaw.field,
    graveyard: oppRaw.graveyard,
    attacksCountThisTurn: oppRaw.attacksCountThisTurn,
    hasDrawnThisTurn: oppRaw.hasDrawnThisTurn,
    isConnected: oppRaw.isConnected
  };

  return {
    gameId: state.gameId,
    roomId: state.roomId,
    phase: state.phase,
    turnNumber: state.turnNumber,
    activePlayerKey: state.activePlayerKey,
    firstPlayerKey: state.firstPlayerKey,
    isMyTurn: state.activePlayerKey === myKey,
    myPlayerKey: myKey,
    me,
    opponent,
    environment: state.environment,
    stateVersion: state.stateVersion,
    winnerPlayerId: state.winnerPlayerId,
    winReason: state.winReason,
    logs: state.logs.slice(-30) // Latest 30 logs for smooth UI
  };
}
