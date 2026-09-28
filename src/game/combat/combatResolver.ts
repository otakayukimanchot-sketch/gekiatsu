import { CardInstance } from '../../cards/types';
import { ActiveEnvironment } from '../types';

export function calculateEffectiveAtk(
  card: CardInstance,
  environment: ActiveEnvironment | null
): number {
  let atk = card.currentAtk;

  // Attached cards buff
  if (card.attachedCards && card.attachedCards.length > 0) {
    for (const att of card.attachedCards) {
      if (att.currentAtk) {
        atk += att.currentAtk;
      }
    }
  }

  // Environment buff
  if (environment) {
    if (environment.cardInstance.definitionId === 'env_magma') {
      atk += 300;
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
  environment: ActiveEnvironment | null
): CombatResult {
  const attackerAtk = calculateEffectiveAtk(attacker, environment);
  const defenderAtk = calculateEffectiveAtk(defender, environment);

  // Apply damage
  defender.currentHp -= attackerAtk;
  attacker.currentHp -= defenderAtk;

  let attackerDied = false;
  let defenderDied = false;
  let attackerResurrected = false;
  let defenderResurrected = false;

  // Attacker death / resurrect check
  if (attacker.currentHp <= 0) {
    if (attacker.definitionId === 'atk_phoenix' && !attacker.hasResurrected) {
      attacker.currentHp = 800;
      attacker.hasResurrected = true;
      attackerResurrected = true;
    } else {
      attackerDied = true;
    }
  }

  // Defender death / resurrect check
  if (defender.currentHp <= 0) {
    if (defender.definitionId === 'atk_phoenix' && !defender.hasResurrected) {
      defender.currentHp = 800;
      defender.hasResurrected = true;
      defenderResurrected = true;
    } else {
      defenderDied = true;
    }
  }

  attacker.attacksThisTurn += 1;
  attacker.canAttack = false;

  return {
    attackerDealtDamage: attackerAtk,
    defenderCounterDamage: defenderAtk,
    attackerDied,
    defenderDied,
    attackerResurrected,
    defenderResurrected
  };
}

export function resolveCardToPlayerCombat(
  attacker: CardInstance,
  environment: ActiveEnvironment | null
): { damage: number } {
  const attackerAtk = calculateEffectiveAtk(attacker, environment);
  attacker.attacksThisTurn += 1;
  attacker.canAttack = false;
  return { damage: attackerAtk };
}
