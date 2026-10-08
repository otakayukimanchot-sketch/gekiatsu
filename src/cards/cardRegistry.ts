import { CardDefinition } from './types';
import { ATTACK_CARDS } from './attackCards/attackCardsData';
import { SPELL_CARDS } from './spellCards/spellCardsData';

/**
 * カード進化系列・関連グループ一覧 (CARD_EVOLUTION_LINES)
 * コードを開いただけで「どのカードがどの順番で進化・連携するか」を一目で確認できるカタログ
 */
export const CARD_EVOLUTION_LINES = {
  yoshieLine: {
    familyName: 'よしえ系列',
    stages: ['atk_yoshie_clean', 'evo_yoshie_salt', 'evo_yoshie_kakei', 'evo_yoshie_ex'],
    relatedSupportCards: ['spl_juzu_card', 'spl_unko_card', 'spl_yukiya_card'],
  },
  ryukuLine: {
    familyName: 'りゅうく系列',
    stages: ['atk_yoshida_ryuku', 'evo_ryuku_skywalker'],
    relatedSupportCards: ['spl_futomomo'],
  },
  sableCannonLine: {
    familyName: 'サブレ・キャノン系列',
    stages: ['atk_mayu_sable', 'evo_ago_cannon'],
    relatedSupportCards: ['spl_ago_card', 'atk_ago', 'atk_cannon_naguri', 'atk_voicememo_cannon'],
  },
  headphoneNikiLine: {
    familyName: 'ヘッドフォンニキ系列',
    stages: ['atk_headphone_niki', 'evo_onhood_headphone_niki'],
    relatedSupportCards: ['atk_red_headphone'],
  },
  yukiyaLine: {
    familyName: 'ゆきや系列',
    stages: ['atk_yukiya', 'evo_uragiri_yukiya', 'evo_yukiya_ex'],
    relatedSupportCards: [
      'atk_samishii_yukiya',
      'atk_henkin_yukiya',
      'atk_odoru_yukiya',
      'spl_sabishigariya_yukiya',
    ],
  },
  hirokoLine: {
    familyName: '博子系列',
    stages: ['atk_hiroko', 'evo_piroko', 'evo_hiroko_ex'],
    relatedSupportCards: [],
  },
  ryunosukeLine: {
    familyName: 'りゅーのすけ系列',
    stages: ['atk_ryunosuke', 'evo_juryunosuke', 'evo_ryunosuke_ex'],
    relatedSupportCards: ['spl_fluorescent_ryunosuke'],
  },
  nakamuraLine: {
    familyName: '中村先生系列',
    stages: ['atk_nakamura_sensei', 'evo_superfly_unit', 'evo_nakamura_ex'],
    relatedSupportCards: ['spl_superfly'],
  },
  utanLine: {
    familyName: 'うーたん系列',
    stages: ['atk_utan', 'evo_kyobo_utan'],
    relatedSupportCards: [],
  },
  wanwanLine: {
    familyName: 'ワンワン系列',
    stages: ['atk_wanwan', 'evo_kyobo_wanwan'],
    relatedSupportCards: [],
  },
  masuoLine: {
    familyName: 'マスオさん系列',
    stages: ['atk_masuo', 'evo_ee_masuo', 'evo_masuo_ex'],
    relatedSupportCards: [],
  },
  agasaLine: {
    familyName: 'アガサ博士系列',
    stages: ['atk_agasa', 'evo_fo_agasa', 'evo_agasa_ex'],
    relatedSupportCards: [],
  },
  tsudanumazuGroup: {
    familyName: 'つだぬまず＆特効系列',
    stages: [
      'atk_shochan',
      'atk_orichan',
      'atk_mue',
      'atk_moekyun',
      'atk_ryochi',
      'atk_menhera_yasumatsu',
    ],
    relatedSupportCards: ['spl_yasumatsu', 'spl_sensoji', 'spl_sumidagawa'],
  },
} as const;

export const ALL_CARD_DEFINITIONS: CardDefinition[] = [
  ...ATTACK_CARDS,
  ...SPELL_CARDS,
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
 * ポケポケ型 コンパクト20枚デッキ（進化系列＆新カード完備バランス構築）
 * 攻撃カード15枚 ＋ 魔法カード5枚（環境カード廃止済み）
 */
export function createStandardDeckDefinitionIds(): string[] {
  return [
    // りゅーのすけ進化ライン (3枚: Lv.1 → Lv.3 → Lv.5)
    'atk_ryunosuke',
    'evo_juryunosuke',
    'evo_ryunosuke_ex',

    // ゆきや進化ライン (3枚: Lv.2 → Lv.4 → Lv.5)
    'atk_yukiya',
    'evo_uragiri_yukiya',
    'evo_yukiya_ex',

    // うーたん進化ライン (2枚: Lv.1 → Lv.3)
    'atk_utan',
    'evo_kyobo_utan',

    // サブレ・キャノン進化ライン (2枚: Lv.3 → Lv.4)
    'atk_mayu_sable',
    'evo_ago_cannon',

    // 特効＆主力カード (5枚: もえきゅん / りょち / しょーちゃん / ムエ / 情報処理基礎のおばぁ)
    'atk_moekyun',
    'atk_ryochi',
    'atk_shochan',
    'atk_mue',
    'atk_info_grandma',

    // 魔法カード (5枚: Lv.1)
    'spl_monster_energy',
    'spl_global_lounge',
    'spl_sensoji',
    'spl_fc_barcelona',
    'spl_morisia',
  ];
}
