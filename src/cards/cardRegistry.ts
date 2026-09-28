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
 * Standard 40-card tournament deck
 */
export function createStandardDeckDefinitionIds(): string[] {
  const deck: string[] = [];

  // Attack cards (24 cards)
  deck.push('atk_yoshie_clean', 'atk_yoshie_clean', 'atk_yoshie_clean'); // 3
  deck.push('atk_yoton', 'atk_yoton');                                   // 2
  deck.push('atk_yoshida_ryuku', 'atk_yoshida_ryuku');                   // 2
  deck.push('atk_mayu_sable', 'atk_mayu_sable');                         // 2
  deck.push('atk_mue', 'atk_mue');                                       // 2
  deck.push('atk_shochan', 'atk_shochan');                               // 2
  deck.push('atk_orichan', 'atk_orichan');                               // 2
  deck.push('atk_ago', 'atk_ago');                                       // 2
  deck.push('atk_ryunosuke', 'atk_ryunosuke');                           // 2
  deck.push('atk_vanilla_sokun', 'atk_vanilla_sokun');                   // 2
  deck.push('atk_headphone_niki', 'atk_headphone_niki', 'atk_headphone_niki'); // 3

  // Spell cards (12 cards)
  deck.push('spl_juzu_card', 'spl_juzu_card');       // 2
  deck.push('spl_unko_card');                        // 1
  deck.push('spl_yukiya_card');                      // 1
  deck.push('spl_futomomo');                         // 1
  deck.push('spl_ago_card');                         // 1
  deck.push('spl_nozoki_sokun');                     // 1
  deck.push('spl_matenai_sokun');                    // 1
  deck.push('spl_sabishigariya_yukiya');             // 1
  deck.push('spl_shirankedo');                       // 1
  deck.push('spl_yasumatsu');                        // 1
  deck.push('spl_fluorescent_ryunosuke');            // 1

  // Environment cards (4 cards)
  deck.push('env_sensoji');        // 1
  deck.push('env_sumidagawa');     // 1
  deck.push('env_yukiya_room');    // 1
  deck.push('env_phoenix_hall');   // 1

  // Total: 24 + 12 + 4 = 40
  return deck;
}
