import { CardInstance } from '../../cards/types';
import { getCardDefinition, createStandardDeckDefinitionIds } from '../../cards/cardRegistry';

export function generateInstanceId(): string {
  return 'card_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
}

export function createCardInstance(definitionId: string, ownerId: string): CardInstance {
  const def = getCardDefinition(definitionId);
  if (!def) {
    throw new Error(`Card definition not found: ${definitionId}`);
  }

  const baseAtk = def.baseAtk || (def.attachmentRule?.atkBonus ? def.attachmentRule.atkBonus : 0);
  const baseHp = def.baseHp || (def.attachmentRule?.hpBonus ? def.attachmentRule.hpBonus : 0);

  const hasTaunt = def.effects.some(e => e.specialAction === 'TAUNT') || !!def.attachmentRule?.grantTaunt;
  const hasCharge = def.effects.some(e => e.specialAction === 'CHARGE') || !!def.attachmentRule?.grantCharge;
  const canPierceTaunt = def.effects.some(e => e.specialAction === 'PIERCE_TAUNT');

  return {
    instanceId: generateInstanceId(),
    definitionId,
    ownerId,
    zone: 'DECK',
    currentHp: baseHp,
    maxHp: baseHp,
    currentAtk: baseAtk,
    baseAtk,
    canAttack: false,
    attacksThisTurn: 0,
    summonTurn: 0,
    attachedCards: [],
    isTaunt: hasTaunt,
    hasCharge: hasCharge,
    canPierceTaunt: canPierceTaunt
  };
}

export function buildStandardDeck(ownerId: string): CardInstance[] {
  const definitionIds = createStandardDeckDefinitionIds();
  const instances = definitionIds.map(id => createCardInstance(id, ownerId));
  return shuffleDeck(instances);
}

export function shuffleDeck<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
