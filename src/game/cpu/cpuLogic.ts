import { GameActionPayload, GameState, PlayerKey } from '../types';
import { getCardDefinition } from '../../cards/cardRegistry';
import { canEvolveCard } from '../engine/gameEngine';

/**
 * ポケポケ型 CPU 条件分岐ロジック
 * 現在のHP・必要エネルギー・相手のHP・ベンチ・手札・カードレベル・進化条件を固定ルールで評価して次の1手を決定する
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

  // 2. If Active Spot is empty, play a Basic Attack card (evolvesFrom === null) to Active Spot
  if (!bot.activeCard) {
    const basicAttackCardsInHand = bot.hand.filter((c) => {
      const def = getCardDefinition(c.definitionId);
      return def?.type === 'ATTACK' && def.evolution.evolvesFrom === null;
    });
    if (basicAttackCardsInHand.length > 0) {
      return {
        actionType: 'PLAY_CARD_TO_ACTIVE',
        cardInstanceId: basicAttackCardsInHand[0].instanceId,
      };
    }
  }

  // 3. Evolve any eligible card on Active Spot or Bench if matching evolution card is in hand
  const fieldCards = [bot.activeCard, ...bot.bench].filter(
    (fc): fc is NonNullable<typeof fc> => fc !== null
  );
  for (const handCard of bot.hand) {
    const handDef = getCardDefinition(handCard.definitionId);
    if (!handDef || handDef.type !== 'ATTACK' || !handDef.evolution.evolvesFrom) continue;

    const matchingTarget = fieldCards.find(
      (fc) => canEvolveCard(fc, handCard, state.turnNumber).ok
    );
    if (matchingTarget) {
      return {
        actionType: 'EVOLVE_CARD',
        cardInstanceId: handCard.instanceId,
        targetCardInstanceId: matchingTarget.instanceId,
      };
    }
  }

  // 4. Place Basic Attack cards (evolvesFrom === null) from Hand onto empty Bench slots
  const emptyBenchIdx = bot.bench.findIndex((b) => b === null);
  if (emptyBenchIdx !== -1) {
    const basicAttackInHand = bot.hand.find((c) => {
      const def = getCardDefinition(c.definitionId);
      return def?.type === 'ATTACK' && def.evolution.evolvesFrom === null;
    });
    if (basicAttackInHand) {
      return {
        actionType: 'PLAY_CARD_TO_BENCH',
        cardInstanceId: basicAttackInHand.instanceId,
        benchIndex: emptyBenchIdx,
      };
    }
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

    if (bot.activeCard && bot.activeCard.attachedEnergy < bot.activeCard.energyCost) {
      targetId = bot.activeCard.instanceId;
    } else {
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
        (b) =>
          b !== null &&
          b.attachedEnergy >= b.energyCost &&
          b.currentHp > bot.activeCard!.currentHp
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
