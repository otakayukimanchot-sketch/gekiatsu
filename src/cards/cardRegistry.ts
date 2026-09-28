import { CardDefinition } from './types';
import { ATTACK_CARDS } from './attackCards/attackCardsData';
import { SPELL_CARDS } from './spellCards/spellCardsData';
import { ENVIRONMENT_CARDS } from './environmentCards/environmentCardsData';

export const ALL_CARD_DEFINITIONS: CardDefinition[] = [
  ...ATTACK_CARDS,
  ...SPELL_CARDS,
  ...ENVIRONMENT_CARDS
];

export const CARD_REGISTRY = new Map<string, CardDefinition>();
ALL_CARD_DEFINITIONS.forEach(card => {
  CARD_REGISTRY.set(card.id, card);
});

export function getCardDefinition(id: string): CardDefinition | undefined {
  return CARD_REGISTRY.get(id);
}

/**
 * Creates standard 40-card deck representation (Definition IDs)
 * Prompt Rule #5:
 * Standard deck: 40 cards, max 3 copies of same card.
 */
export function createStandardDeckDefinitionIds(): string[] {
  const deck: string[] = [];

  // Attack cards (24 cards)
  deck.push('atk_leo', 'atk_leo', 'atk_leo');            // 3
  deck.push('atk_golem', 'atk_golem', 'atk_golem');      // 3
  deck.push('atk_ninja', 'atk_ninja', 'atk_ninja');      // 3
  deck.push('atk_luna', 'atk_luna', 'atk_luna');        // 3
  deck.push('atk_yoshie', 'atk_yoshie', 'atk_yoshie');    // 3
  deck.push('atk_draco', 'atk_draco', 'atk_draco');      // 3
  deck.push('atk_shirankedo', 'atk_shirankedo');         // 2
  deck.push('atk_knight', 'atk_knight');                 // 2
  deck.push('atk_phoenix', 'atk_phoenix');               // 2

  // Spell cards (12 cards)
  deck.push('spl_lightning', 'spl_lightning');           // 2
  deck.push('spl_heal_spring', 'spl_heal_spring');       // 2
  deck.push('spl_shirankedo_spell', 'spl_shirankedo_spell'); // 2
  deck.push('spl_draw_boost', 'spl_draw_boost');         // 2
  deck.push('spl_cataclysm');                            // 1
  deck.push('spl_att_sword', 'spl_att_sword');           // 2
  deck.push('spl_awakening_orb');                        // 1

  // Environment cards (4 cards)
  deck.push('env_magma', 'env_forest', 'env_temple', 'env_sky_island'); // 4

  // Total: 24 + 12 + 4 = 40 cards!
  return deck;
}
