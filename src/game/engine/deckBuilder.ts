import { CardInstance } from '../../cards/types';
import { createStandardDeckDefinitionIds, DECK_SIZE, getCardDefinition } from '../../cards/cardRegistry';

let instanceCounter = 1;

export function createCardInstance(definitionId: string, ownerId: string): CardInstance {
  const def = getCardDefinition(definitionId);
  if (!def) {
    throw new Error(`Card definition not found: ${definitionId}`);
  }

  const instanceId = `c_${ownerId.substring(0, 6)}_${Date.now().toString(36)}_${instanceCounter++}`;

  return {
    instanceId,
    definitionId: def.id,
    ownerId,
    zone: 'DECK',
    currentHp: def.hp,
    maxHp: def.hp,
    baseAtk: def.attack,
    currentAtk: def.attack,
    energyCost: def.energyCost,
    retreatCost: def.retreatCost,
    attachedEnergy: 0,
    tempAtkBuff: 0,
    damageReductionNextTurn: 0,
    summonTurn: 0,
  };
}

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * デッキ内の進化カードに対応する進化元カードが含まれているか検証する
 */
export function isDeckEvolutionValid(deckIds: string[]): boolean {
  const idSet = new Set(deckIds);
  for (const id of deckIds) {
    const def = getCardDefinition(id);
    if (!def) return false;
    if (def.type === 'ATTACK' && def.evolution.evolvesFrom !== null) {
      if (!idSet.has(def.evolution.evolvesFrom)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * 20枚デッキを生成し、ポケポケ仕様として「初期バトル場には必ず基礎カード（進化元を持たない攻撃カード）が配置される」ように調整する
 */
export function buildInitialDeckAndSetup(
  ownerId: string,
  customDeckIds?: string[]
): {
  activeCard: CardInstance;
  hand: CardInstance[];
  deck: CardInstance[];
} {
  let deckIds = createStandardDeckDefinitionIds();

  if (customDeckIds && customDeckIds.length === DECK_SIZE) {
    const valid = customDeckIds.every((id) => !!getCardDefinition(id));
    const hasBasicAttack = customDeckIds.some((id) => {
      const def = getCardDefinition(id);
      return def?.type === 'ATTACK' && def.evolution.evolvesFrom === null;
    });
    if (valid && hasBasicAttack && isDeckEvolutionValid(customDeckIds)) {
      deckIds = customDeckIds;
    }
  }

  let allCards = shuffleArray(deckIds.map((id) => createCardInstance(id, ownerId)));

  // Find a suitable opening active card: MUST be a Basic Attack card (evolvesFrom === null)
  let openingIdx = allCards.findIndex((c) => {
    const def = getCardDefinition(c.definitionId);
    return def?.type === 'ATTACK' && def.evolution.evolvesFrom === null && def.level <= 2;
  });
  if (openingIdx === -1) {
    openingIdx = allCards.findIndex((c) => {
      const def = getCardDefinition(c.definitionId);
      return def?.type === 'ATTACK' && def.evolution.evolvesFrom === null;
    });
  }
  if (openingIdx === -1) {
    openingIdx = 0;
  }

  const [activeCard] = allCards.splice(openingIdx, 1);
  activeCard.zone = 'ACTIVE';
  activeCard.summonTurn = 1;

  // Draw 4 more cards for initial hand (total 5 opening cards: 1 in Active Spot + 4 in Hand)
  const hand = allCards.splice(0, 4).map((c) => {
    c.zone = 'HAND';
    return c;
  });

  const deck = allCards.map((c) => {
    c.zone = 'DECK';
    return c;
  });

  return { activeCard, hand, deck };
}
