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
  gabonLine: {
    familyName: 'ガボン系列',
    stages: ['atk_gabon', 'evo_maid_gabon', 'evo_gabon_ex'],
    relatedSupportCards: [],
  },
  zukkyLine: {
    familyName: 'づっきー系列',
    stages: ['atk_zukky', 'evo_chuya_zukky', 'evo_composer_zukky', 'evo_zukky_ex'],
    relatedSupportCards: [],
  },
  niseiLine: {
    familyName: '２世系列',
    stages: ['atk_nisei', 'evo_hashagu_nisei', 'evo_nisei_ex'],
    relatedSupportCards: [],
  },
  ohtaniGroup: {
    familyName: '大谷翔平',
    stages: ['atk_ohtani_shohei'],
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
 * 標準デッキ生成（20枚・バランス構築＆ローテーション）
 * 特定カードだけが出続ける偏りを解消し、全進化系列・単体カード（メンヘラな泰松・大谷翔平・特効など）・魔法カード（安松・トレード・離れるそうくん・trio・酒・ポカリ・ブラックコーヒー等）がバランス良く登場する
 */
export function createStandardDeckDefinitionIds(): string[] {
  const evolutionChains: string[][] = [
    ['atk_yoshie_clean', 'evo_yoshie_salt', 'evo_yoshie_kakei', 'evo_yoshie_ex'],
    ['atk_yoshida_ryuku', 'evo_ryuku_skywalker'],
    ['atk_mayu_sable', 'evo_ago_cannon'],
    ['atk_headphone_niki', 'evo_onhood_headphone_niki'],
    ['atk_yukiya', 'evo_uragiri_yukiya', 'evo_yukiya_ex'],
    ['atk_hiroko', 'evo_piroko', 'evo_hiroko_ex'],
    ['atk_ryunosuke', 'evo_juryunosuke', 'evo_ryunosuke_ex'],
    ['atk_nakamura_sensei', 'evo_superfly_unit', 'evo_nakamura_ex'],
    ['atk_utan', 'evo_kyobo_utan'],
    ['atk_wanwan', 'evo_kyobo_wanwan'],
    ['atk_masuo', 'evo_ee_masuo', 'evo_masuo_ex'],
    ['atk_agasa', 'evo_fo_agasa', 'evo_agasa_ex'],
    ['atk_gabon', 'evo_maid_gabon', 'evo_gabon_ex'],
    ['atk_zukky', 'evo_chuya_zukky', 'evo_composer_zukky', 'evo_zukky_ex'],
    ['atk_nisei', 'evo_hashagu_nisei', 'evo_nisei_ex'],
  ];

  const singleAttackIds: string[] = ATTACK_CARDS.filter(
    (c) => c.evolution.evolvesFrom === null && c.evolution.evolvesTo === null
  ).map((c) => c.id);

  const allSpellIds: string[] = SPELL_CARDS.map((c) => c.id);

  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const deck: string[] = [];

  // 1. ランダムに3〜4系統の進化ラインを丸ごと採用（進化元〜最終形態までセットで入れることで進化事故を防ぐ）
  const shuffledChains = shuffle(evolutionChains);
  for (const chain of shuffledChains) {
    if (deck.length + chain.length <= 10) {
      deck.push(...chain);
    }
  }

  // 2. 残りの攻撃カード枠（計14枚まで）に単体アタッカー（泰松・しょーちゃん・ムエ・もえきゅん・りょち・大谷翔平など）を均等抽選で編成
  const shuffledSingles = shuffle(singleAttackIds);
  for (const singleId of shuffledSingles) {
    if (deck.length >= 14) break;
    if (!deck.includes(singleId)) {
      deck.push(singleId);
    }
  }

  // 3. 魔法カード6枚を全魔法プール（トレード・安松・離れるそうくん・trio・ブラックコーヒー・酒・ポカリ等）から均等抽選で編成
  const shuffledSpells = shuffle(allSpellIds);
  for (const spellId of shuffledSpells) {
    if (deck.length >= DECK_SIZE) break;
    deck.push(spellId);
  }

  return deck.slice(0, DECK_SIZE);
}

/**
 * 全員参加大乱闘（オールスター）デッキ生成
 * 収録されている全カード（全進化系列・全単体アタッカー・全魔法カード）が総出で参戦するスペシャル大乱闘山札！
 * 進化カードが含まれる場合は必ず進化元も同じ山札に入るため、すべての進化ルートが成立する。
 */
export function createAllStarBrawlDeckDefinitionIds(): string[] {
  return ALL_CARD_DEFINITIONS.map((c) => c.id);
}
