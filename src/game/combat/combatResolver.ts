import { CardInstance } from '../../cards/types';
import { ActiveEnvironment } from '../types';
import { getCardDefinition } from '../../cards/cardRegistry';

export function isYukiyaCard(card: CardInstance): boolean {
  const def = getCardDefinition(card.definitionId);
  return !!def && (
    def.id.includes('yukiya') || 
    def.tags.includes('ゆきや系')
  );
}

export function isTsudanumazuTrio(cardDefId: string): boolean {
  return cardDefId === 'atk_mue' || cardDefId === 'atk_shochan' || cardDefId === 'atk_orichan';
}

/**
 * Checks if the player's field has all 3 members of つだぬまず (ムエ, しょーちゃん, おりちゃん)
 */
export function checkTsudanumazuActive(field: (CardInstance | null)[]): boolean {
  const present = new Set<string>();
  field.forEach(c => {
    if (c) present.add(c.definitionId);
  });
  return present.has('atk_mue') && present.has('atk_shochan') && present.has('atk_orichan');
}

/**
 * Calculates effective ATK with all modifiers:
 * Base + Attachments + Special vs Target (ムエ特攻) + Environment + つだぬまず (+1000)
 */
export function calculateEffectiveAtk(
  card: CardInstance,
  environment: ActiveEnvironment | null,
  targetCard?: CardInstance | null,
  friendlyField?: (CardInstance | null)[],
  totalCardsOnBoard?: number
): number {
  let atk = card.currentAtk;

  // Attached cards buffs
  if (card.attachedCards && card.attachedCards.length > 0) {
    for (const att of card.attachedCards) {
      if (att.currentAtk) {
        atk += att.currentAtk;
      }
    }
  }

  // まゆサブレ & 顎・キャノン 特攻 (vs ムエ)
  if (targetCard && targetCard.definitionId === 'atk_mue') {
    if (card.definitionId === 'atk_mayu_sable') {
      // 300 -> 700 (+400 against ムエ)
      atk += 400;
    } else if (card.definitionId === 'evo_ago_cannon') {
      // 700 -> 1000 (+300 against ムエ)
      atk += 300;
    }
  }

  // 特殊効果「つだぬまず」: 場に ムエ・しょーちゃん・おりちゃん の3体すべてが存在する場合 +1000
  if (friendlyField && isTsudanumazuTrio(card.definitionId)) {
    if (checkTsudanumazuActive(friendlyField)) {
      atk += 1000;
    }
  }

  // Environment Card Buffs / Debuffs
  if (environment) {
    const envId = environment.cardInstance.definitionId;

    if (envId === 'env_burning_classroom') {
      atk += 300;
    } else if (envId === 'env_sensoji') {
      if (isTsudanumazuTrio(card.definitionId)) {
        atk += 1000;
      }
    } else if (envId === 'env_sumidagawa') {
      if (isTsudanumazuTrio(card.definitionId)) {
        atk += 500;
      }
    } else if (envId === 'env_yukiya_room') {
      if (isYukiyaCard(card)) {
        atk += 500;
      }
      if (isTsudanumazuTrio(card.definitionId)) {
        atk -= 200;
      }
    } else if (envId === 'env_empty_gym') {
      if (totalCardsOnBoard === 1) {
        atk += 1000;
      }
    }
  }

  return Math.max(0, atk);
}

export function calculateEffectiveHp(card: CardInstance): number {
  return Math.max(0, card.currentHp);
}

export interface CombatResult {
  attackerDealtDamage: number;
  defenderCounterDamage: number;
  attackerDied: boolean;
  defenderDied: boolean;
  attackerResurrected?: boolean;
  defenderResurrected?: boolean;
}

export function resolveCardToCardCombat(
  attacker: CardInstance,
  defender: CardInstance,
  environment: ActiveEnvironment | null,
  friendlyField?: (CardInstance | null)[],
  enemyField?: (CardInstance | null)[],
  totalCardsOnBoard?: number
): CombatResult {
  const attackerAtk = calculateEffectiveAtk(attacker, environment, defender, friendlyField, totalCardsOnBoard);
  const defenderAtk = calculateEffectiveAtk(defender, environment, attacker, enemyField, totalCardsOnBoard);

  // Apply damage
  defender.currentHp -= attackerAtk;
  attacker.currentHp -= defenderAtk;

  const attackerDied = defender.currentHp > 0 && attacker.currentHp <= 0 ? true : (attacker.currentHp <= 0);
  const defenderDied = defender.currentHp <= 0;

  attacker.attacksThisTurn += 1;
  attacker.canAttack = false;

  return {
    attackerDealtDamage: attackerAtk,
    defenderCounterDamage: defenderAtk,
    attackerDied,
    defenderDied
  };
}

export function resolveCardToPlayerCombat(
  attacker: CardInstance,
  environment: ActiveEnvironment | null,
  friendlyField?: (CardInstance | null)[],
  totalCardsOnBoard?: number
): { damage: number } {
  const attackerAtk = calculateEffectiveAtk(attacker, environment, null, friendlyField, totalCardsOnBoard);
  attacker.attacksThisTurn += 1;
  attacker.canAttack = false;
  return { damage: attackerAtk };
}
