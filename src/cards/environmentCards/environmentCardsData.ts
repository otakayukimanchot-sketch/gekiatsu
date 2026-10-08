import { CardDefinition, RawCardSeed } from '../types';
import { buildCardDefinition } from '../levelSystem';

/**
 * 環境カード定義一覧 (全5種・Lv.1統一)
 *
 * 【記載順序】
 * 1. グロラン (全体HP全回復＋毎ターン開始時HP10回復)
 * 2. フェニックスホール (井上教授（壁）生成＋被ダメージ軽減)
 * 3. 浅草寺 (全体攻撃＋10、つだぬまず系列は合計＋20)
 * 4. 隅田川 (発動時HP20回復＋全体攻撃＋10)
 * 5. ゆきやの部屋 (発動時HP20回復＋全体攻撃＋10)
 */
const ENVIRONMENT_CARD_SEEDS: RawCardSeed[] = [
  {
    id: 'env_grolan',
    name: 'グロラン',
    type: 'ENVIRONMENT',
    evolution: {
      family: '回復環境',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: 'コーヒーブレイク',
      activeEffect: '発動時、自分の場の傷ついたすべてのカードのHPを全回復する',
      passiveEffect: '毎ターン開始時、自分のバトル場のカードのHPを10回復する',
      description:
        '【環境】コーヒーを飲める（発動時、自分の場に出ている体力の削られたすべてのカードの体力を全回復する！さらに毎ターン開始時にバトル場のHPを10回復）。',
      environmentEffect: 'GROLAN_FULL_HEAL',
    },
    ui: {
      tags: ['環境', '全回復', 'コーヒー'],
      flavorText: '「香り高いコーヒーで一息。傷ついた仲間たちの体力が一気に全快する。」',
      artSymbol: 'Heart',
    },
  },

  {
    id: 'env_phoenix_hall',
    name: 'フェニックスホール',
    type: 'ENVIRONMENT',
    evolution: {
      family: 'フェニックスホール系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'token_inoue_professor',
    },
    level: 1,
    abilities: {
      attackName: 'フェニックスの守り',
      activeEffect: '発動時、手札に「井上教授（壁）」(Lv.1) を1枚生成する',
      passiveEffect: '場にある間、バトル場のカードが受けるダメージを−10する',
      description:
        '【環境】発動時、手札に「井上教授（壁）」（Lv.1）を1枚生成する。さらに場にある間、バトル場のカードが受けるダメージを−10する。',
      environmentEffect: 'PHOENIX_WALL',
    },
    ui: {
      tags: ['環境', '壁生成', '井上教授'],
      flavorText: '「フェニックスホールに響く足音。そのたびに井上教授が立ちはだかる。」',
      artSymbol: 'Shield',
    },
  },

  {
    id: 'env_sensoji',
    name: '浅草寺',
    type: 'ENVIRONMENT',
    evolution: {
      family: 'つだぬまず系列環境',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '雷門の加護',
      passiveEffect:
        '場にある間、すべてのバトル場の攻撃ダメージ＋10（「ムエ」「しょーちゃん」「おりちゃん」は合計＋20）',
      description:
        '【環境】場にある間、すべてのバトル場のカードの攻撃ダメージを＋10する（「ムエ」「しょーちゃん」「おりちゃん」はさらに＋10）。',
      environmentEffect: 'SENSOJI_BOOST',
    },
    ui: {
      tags: ['環境', '攻撃強化', '浅草寺'],
      flavorText: '「雷門をくぐりし者に浅草の霊験あらたかな加護が宿る。」',
      artSymbol: 'Sparkles',
    },
  },

  {
    id: 'env_sumidagawa',
    name: '隅田川',
    type: 'ENVIRONMENT',
    evolution: {
      family: 'つだぬまず系列環境',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '隅田川の奔流',
      activeEffect: '発動時、自分のバトル場のHPを20回復する',
      passiveEffect: '場にある間、すべてのバトル場のカードの攻撃ダメージ＋10',
      description:
        '【環境】場にある間、すべてのバトル場のカードの攻撃ダメージを＋10する。発動時に自分のバトル場のHPを20回復する。',
      environmentEffect: 'SUMIDAGAWA_BOOST',
    },
    ui: {
      tags: ['環境', '攻撃強化', '隅田川'],
      flavorText: '「雄大なる隅田川の流れが戦場を潤す。」',
      artSymbol: 'Trees',
    },
  },

  {
    id: 'env_yukiya_room',
    name: 'ゆきやの部屋',
    type: 'ENVIRONMENT',
    evolution: {
      family: 'ゆきや系列環境',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: 'プライベートルーム',
      activeEffect: '発動時、自分のバトル場のHPを20回復する',
      passiveEffect: '場にある間、すべてのバトル場のカードの攻撃ダメージ＋10',
      description:
        '【環境】発動時に自分のバトル場のHPを20回復し、場にある間、バトル場の攻撃ダメージを＋10する。',
      environmentEffect: 'YUKIYA_ROOM_BOOST',
    },
    ui: {
      tags: ['環境', '回復', '強化'],
      flavorText: '「ゆきやのプライベート空間。リラックスして本来の力を発揮できる。」',
      artSymbol: 'Heart',
    },
  },
];

export const ENVIRONMENT_CARDS: CardDefinition[] = ENVIRONMENT_CARD_SEEDS.map(buildCardDefinition);
