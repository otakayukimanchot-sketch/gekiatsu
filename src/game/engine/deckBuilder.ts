import { CardInstance } from '../../cards/types';
import { BattleFormatOption } from '../types';
import {
  createAllStarBrawlDeckDefinitionIds,
  createStandardDeckDefinitionIds,
  DECK_SIZE,
  getCardDefinition,
} from '../../cards/cardRegistry';

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
 * デッキを生成し、ポケポケ仕様として「初期バトル場には必ず基礎カード（進化元を持たない攻撃カード）が配置される」ように調整する
 * - standard: 20枚標準バランス構築（またはカスタム20枚デッキ）
 * - allstar: 全員参加大乱闘モード（全収録カード総参戦デッキ）
 */
export function buildInitialDeckAndSetup(
  ownerId: string,
  customDeckIds?: string[],
  battleFormat: BattleFormatOption = 'standard'
): {
  activeCard: CardInstance;
  hand: CardInstance[];
  deck: CardInstance[];
} {
  let deckIds =
    battleFormat === 'allstar'
      ? createAllStarBrawlDeckDefinitionIds()
      : createStandardDeckDefinitionIds();

  if (battleFormat === 'standard' && customDeckIds && customDeckIds.length === DECK_SIZE) {
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

  // Draw initial hand:
  // - standard: 4 cards in hand (+ 1 in Active Spot = 5 opening cards)
  // - allstar: 10 cards in hand (全員参加大乱闘モードのみ初期手札10枚)
  const initialHandCount = battleFormat === 'allstar' ? 10 : 4;
  const hand = allCards.splice(0, initialHandCount).map((c) => {
    c.zone = 'HAND';
    return c;
  });

  const deck = allCards.map((c) => {
    c.zone = 'DECK';
    return c;
  });

  return { activeCard, hand, deck };
}
