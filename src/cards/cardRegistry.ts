import { CardDefinition } from './types';
import { ATTACK_CARDS } from './attackCards/attackCardsData';
import { SPELL_CARDS } from './spellCards/spellCardsData';
import { ENVIRONMENT_CARDS } from './environmentCards/environmentCardsData';

/**
 * カード進化系列・関連グループ一覧 (CARD_EVOLUTION_LINES)
 * コードを開いただけで「どのカードがどの順番で進化・連携するか」を一目で確認できるカタログ
 */
export const CARD_EVOLUTION_LINES = {
  // 綺麗なよしえ (Lv.2) → 塩よしえ (Lv.3) → 嘉慧 (Lv.4) → よしえEX (Lv.5)
  yoshieLine: {
    familyName: 'よしえ系列',
    stages: ['atk_yoshie_clean', 'evo_yoshie_salt', 'evo_yoshie_kakei', 'evo_yoshie_ex'],
    relatedSupportCards: ['spl_juzu_card', 'spl_unko_card', 'spl_yukiya_card'],
  },
  // 吉田りゅうく (Lv.3) → リューク・スカイウォーカー (Lv.5)
  ryukuLine: {
    familyName: 'りゅうく系列',
    stages: ['atk_yoshida_ryuku', 'evo_ryuku_skywalker'],
    relatedSupportCards: ['spl_futomomo'],
  },
  // まゆサブレ (Lv.3) → 顎・キャノン (Lv.4)
  sableCannonLine: {
    familyName: 'サブレ・キャノン系列',
    stages: ['atk_mayu_sable', 'evo_ago_cannon'],
    relatedSupportCards: ['spl_ago_card', 'atk_ago'],
  },
  // ヘッドフォンニキ (Lv.2) → オンフードヘッドフォンニキ (Lv.4)
  headphoneNikiLine: {
    familyName: 'ヘッドフォンニキ系列',
    stages: ['atk_headphone_niki', 'evo_onhood_headphone_niki'],
    relatedSupportCards: [],
  },
  // つだぬまず連携グループ: しょーちゃん (Lv.3) / おりちゃん (Lv.3) / ムエ (Lv.4)
  tsudanumazuGroup: {
    familyName: 'つだぬまず系列',
    stages: ['atk_shochan', 'atk_orichan', 'atk_mue'],
    relatedSupportCards: ['spl_yasumatsu', 'env_sensoji', 'env_sumidagawa'],
  },
  // フェニックスホール → 井上教授（壁）
  phoenixHallGroup: {
    familyName: 'フェニックスホール系列',
    stages: ['token_inoue_professor'],
    relatedSupportCards: ['env_phoenix_hall'],
  },
} as const;

export const ALL_CARD_DEFINITIONS: CardDefinition[] = [
  ...ATTACK_CARDS,
  ...SPELL_CARDS,
  ...ENVIRONMENT_CARDS,
];

export const CARD_REGISTRY = new Map<string, CardDefinition>();
ALL_CARD_DEFINITIONS.forEach((card) => {
  CARD_REGISTRY.set(card.id, card);
});

export function getCardDefinition(id: string): CardDefinition | undefined {
  return CARD_REGISTRY.get(id);
}

export const DECK_SIZE = 20;

/**
 * ポケポケ型 コンパクト20枚デッキ（進化系列完備バランス構築）
 * 基礎カードから進化カードへの進化ラインが確実に成立する構成
 */
export function createStandardDeckDefinitionIds(): string[] {
  return [
    // Lv.1 速攻・基礎カード (3枚)
    'atk_info_grandma',
    'atk_ryunosuke',
    'atk_ago',

    // Lv.2 標準・基礎カード (4枚)
    'atk_yoshie_clean', // 塩よしえの進化元
    'atk_yoton',
    'atk_headphone_niki',
    'atk_vanilla_sokun',

    // Lv.3 主力・基礎/1進化カード (4枚)
    'atk_mayu_sable', // 顎・キャノンの進化元
    'evo_yoshie_salt', // 綺麗なよしえから進化 → 嘉慧へ進化
    'atk_shochan',
    'atk_orichan',

    // Lv.4 強襲・進化/基礎カード (3枚)
    'evo_yoshie_kakei', // 塩よしえから進化 → よしえEXへ進化
    'evo_ago_cannon', // まゆサブレから進化
    'atk_mue',

    // Lv.5 最上位EX・最終進化カード (1枚)
    'evo_yoshie_ex', // 嘉慧から進化

    // Lv.1 魔法カード (3枚)
    'spl_superfly',
    'spl_futomomo',
    'spl_yasumatsu',

    // Lv.1 環境カード (2枚)
    'env_grolan',
    'env_sensoji',
  ];
}
