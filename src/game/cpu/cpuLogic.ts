import { GameActionPayload, GameState, PlayerKey } from '../types';
import { getCardDefinition } from '../../cards/cardRegistry';

/**
 * ポケポケ型 CPU 条件分岐ロジック
 * 現在のHP・必要エネルギー・相手のHP・ベンチ・手札・カードレベルを固定ルールで評価して次の1手を決定する
 */
export function decideNextBotAction(
  state: GameState,
  botKey: PlayerKey = 'playerB'
): GameActionPayload | null {
  if (state.phase === 'GAME_OVER') return null;

  const bot = state[botKey];
  const oppKey: PlayerKey = botKey === 'playerA' ? 'playerB' : 'playerA';
  const opp = state[oppKey];

  // 1. If bot must promote a Bench card after Knockout
  if (state.phase === 'WAITING_FOR_PROMOTION') {
    if (state.promotionRequiredPlayerKey !== botKey) return null;

    // Pick the best Bench card: prefer one that already has enough energy to attack, or highest HP+ATK score
    let bestIdx = -1;
    let bestScore = -999;

    bot.bench.forEach((card, idx) => {
      if (!card) return;
      const canAttackSoon = card.attachedEnergy >= card.energyCost - 1 ? 80 : 0;
      const score = canAttackSoon + card.currentHp + card.currentAtk;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    });

    if (bestIdx !== -1) {
      return {
        actionType: 'PROMOTE_BENCH_CARD',
        benchIndex: bestIdx,
      };
    }
    return null;
  }

  if (state.activePlayerKey !== botKey) return null;

  // 2. If Active Spot is empty, play an Attack card to Active Spot
  if (!bot.activeCard) {
    const attackCardsInHand = bot.hand.filter(
      (c) => getCardDefinition(c.definitionId)?.type === 'ATTACK'
    );
    if (attackCardsInHand.length > 0) {
      return {
        actionType: 'PLAY_CARD_TO_ACTIVE',
        cardInstanceId: attackCardsInHand[0].instanceId,
      };
    }
  }

  // 3. Place Attack cards from Hand onto empty Bench slots
  const emptyBenchIdx = bot.bench.findIndex((b) => b === null);
  if (emptyBenchIdx !== -1) {
    const attackInHand = bot.hand.find(
      (c) => getCardDefinition(c.definitionId)?.type === 'ATTACK'
    );
    if (attackInHand) {
      return {
        actionType: 'PLAY_CARD_TO_BENCH',
        cardInstanceId: attackInHand.instanceId,
        benchIndex: emptyBenchIdx,
      };
    }
  }

  // 4. Play Environment card if beneficial
  const envInHand = bot.hand.find((c) => {
    const def = getCardDefinition(c.definitionId);
    if (!def || def.type !== 'ENVIRONMENT') return false;
    if (def.environmentEffect === 'GROLAN_FULL_HEAL') {
      // Use Grolan when any friendly card is damaged
      return [bot.activeCard, ...bot.bench].some((fc) => fc && fc.currentHp < fc.maxHp);
    }
    return state.environment?.cardInstance.definitionId !== def.id;
  });

  if (envInHand) {
    return {
      actionType: 'PLAY_ENVIRONMENT',
      cardInstanceId: envInHand.instanceId,
    };
  }

  // 5. Use Spell card if not yet used this turn
  if (!bot.hasUsedSpellThisTurn) {
    const spellInHand = bot.hand.find(
      (c) => getCardDefinition(c.definitionId)?.type === 'SPELL'
    );
    if (spellInHand) {
      return {
        actionType: 'USE_SPELL_CARD',
        cardInstanceId: spellInHand.instanceId,
      };
    }
  }

  // 6. Attach Energy (1 per turn)
  if (!bot.hasAttachedEnergyThisTurn && bot.energyAvailable > 0) {
    let targetId: string | undefined;

    // Priority A: Active card needs energy to reach its attack cost
    if (bot.activeCard && bot.activeCard.attachedEnergy < bot.activeCard.energyCost) {
      targetId = bot.activeCard.instanceId;
    } else {
      // Priority B: Bench card that needs energy to reach its attack cost (prefer higher level ace)
      const benchCandidates = bot.bench
        .filter((b): b is NonNullable<typeof b> => b !== null && b.attachedEnergy < b.energyCost)
        .sort((a, b) => {
          const defA = getCardDefinition(a.definitionId);
          const defB = getCardDefinition(b.definitionId);
          return (defB?.level || 1) - (defA?.level || 1);
        });

      if (benchCandidates.length > 0) {
        targetId = benchCandidates[0].instanceId;
      } else if (bot.activeCard) {
        // Priority C: Give extra energy to Active card for future retreat
        targetId = bot.activeCard.instanceId;
      }
    }

    if (targetId) {
      return {
        actionType: 'ATTACH_ENERGY',
        targetCardInstanceId: targetId,
      };
    }
  }

  // 7. Consider Retreating if Active Card is low HP or cannot attack, and a Bench card IS ready to attack
  if (
    !bot.hasRetreatedThisTurn &&
    bot.activeCard &&
    bot.activeCard.attachedEnergy >= bot.activeCard.retreatCost
  ) {
    const activeCanAttack = bot.activeCard.attachedEnergy >= bot.activeCard.energyCost;
    const activeCanKoOpp =
      activeCanAttack && opp.activeCard && bot.activeCard.currentAtk >= opp.activeCard.currentHp;
    const activeIsLowHp = bot.activeCard.currentHp <= 40;

    if (!activeCanKoOpp && (!activeCanAttack || activeIsLowHp)) {
      const readyBenchIdx = bot.bench.findIndex(
        (b) => b !== null && b.attachedEnergy >= b.energyCost && b.currentHp > bot.activeCard!.currentHp
      );
      if (readyBenchIdx !== -1) {
        return {
          actionType: 'RETREAT_ACTIVE',
          benchIndex: readyBenchIdx,
        };
      }
    }
  }

  // 8. Attack if Active Card has enough Energy! (Attacking automatically ends the turn)
  if (
    bot.activeCard &&
    opp.activeCard &&
    bot.activeCard.attachedEnergy >= bot.activeCard.energyCost
  ) {
    return {
      actionType: 'ATTACK',
    };
  }

  // 9. Otherwise End Turn
  return {
    actionType: 'END_TURN',
  };
}
