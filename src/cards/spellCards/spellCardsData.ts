import { CardDefinition, RawCardSeed } from '../types';
import { buildCardDefinition } from '../levelSystem';

/**
 * 魔法（サポート）カード定義一覧 (全14種・Lv.1統一)
 *
 * 【記載順序】
 * 1. ドロー・サーチ系: Superfly / 数珠カード / さびしがりやのゆきや / のぞきのそうくん
 * 2. エネルギー加速系: ふともも / 待てないそうくん
 * 3. 火力強化系: 顎カード / 安松 / ユキやカード
 * 4. 防御・回復系: 見えてます / 三者面談
 * 5. 直接妨害・入れ替え系: うんこかーど / 蛍光マーカーのりゅーのすけ / トレード
 */
const SPELL_CARD_SEEDS: RawCardSeed[] = [
  // ============================================================================
  // 1. ドロー・サーチ系魔法カード
  // ============================================================================

  {
    id: 'spl_superfly',
    name: 'Superfly',
    type: 'SPELL',
    evolution: {
      family: 'ドロー魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: 'モンゴルのお土産',
      activeEffect: '山札からカードを1枚引く',
      description: '【魔法】モンゴルから帰国してお土産に一枚あげる（山札からカードを1枚追加で引ける）。',
      spellEffect: 'DRAW_1',
    },
    ui: {
      tags: ['魔法', 'ドロー', 'お土産'],
      flavorText: '「モンゴルから帰ってきたよ！これお土産の1枚！」',
      artSymbol: 'Sparkles',
    },
  },

  {
    id: 'spl_juzu_card',
    name: '数珠カード',
    type: 'SPELL',
    evolution: {
      family: 'よしえ系列サポート',
      stage: 1,
      evolvesFrom: 'atk_yoshie_clean',
      evolvesTo: 'evo_yoshie_salt',
    },
    level: 1,
    abilities: {
      attackName: '清めのドロー',
      activeEffect: '山札からカードを1枚引く',
      description: '【魔法】山札からカードを1枚引く。',
      spellEffect: 'DRAW_1',
    },
    ui: {
      tags: ['魔法', 'ドロー', 'よしえ系'],
      flavorText: '「清めの数珠が運命の1枚を引き寄せる。」',
      artSymbol: 'Sparkles',
    },
  },

  {
    id: 'spl_sabishigariya_yukiya',
    name: 'さびしがりやのゆきや',
    type: 'SPELL',
    evolution: {
      family: 'ゆきや系列サポート',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '仲間呼び',
      activeEffect: '山札からランダムな攻撃カード1枚を手札に加える',
      description: '【魔法】山札からランダムな攻撃カード1枚を手札に加える。',
      spellEffect: 'SEARCH_ATTACK_CARD',
    },
    ui: {
      tags: ['魔法', 'サーチ', 'ゆきや系'],
      flavorText: '「一人じゃ寂しいから、もう一人呼んでいい…？」',
      artSymbol: 'Heart',
    },
  },

  {
    id: 'spl_nozoki_sokun',
    name: 'のぞきのそうくん',
    type: 'SPELL',
    evolution: {
      family: 'そうくん系列サポート',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '手札チェック',
      activeEffect: '相手の手札をログに公開し、山札からカードを1枚引く',
      description: '【魔法】相手の手札を確認してログに公開し、自分は山札からカードを1枚引く。',
      spellEffect: 'PEEK_AND_DRAW',
    },
    ui: {
      tags: ['魔法', '情報開示', 'そうくん系'],
      flavorText: '「ちょっと見せて！何持ってるの！？」',
      artSymbol: 'Sparkles',
    },
  },

  // ============================================================================
  // 2. エネルギー加速系魔法カード
  // ============================================================================

  {
    id: 'spl_futomomo',
    name: 'ふともも',
    type: 'SPELL',
    evolution: {
      family: 'りゅうく系列サポート',
      stage: 1,
      evolvesFrom: 'atk_yoshida_ryuku',
      evolvesTo: 'evo_ryuku_skywalker',
    },
    level: 1,
    abilities: {
      attackName: 'フォース覚醒',
      activeEffect: '自分のバトル場のカードにボーナスエネルギーを＋1個付与する',
      description: '【魔法】自分のバトル場のカードにボーナスエネルギーを＋1個付与する。',
      spellEffect: 'BONUS_ENERGY_ACTIVE',
    },
    ui: {
      tags: ['魔法', 'エネルギー加速', 'ふともも'],
      flavorText: '「魅惑のふとももが眠れるフォースを呼び覚ます。」',
      artSymbol: 'Heart',
    },
  },

  {
    id: 'spl_matenai_sokun',
    name: '待てないそうくん',
    type: 'SPELL',
    evolution: {
      family: 'そうくん系列サポート',
      stage: 1,
      evolvesFrom: 'atk_vanilla_sokun',
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '先食いチャージ',
      activeEffect: '自分のバトル場のカードにボーナスエネルギーを＋1個付与する',
      description: '【魔法】自分のバトル場のカードにボーナスエネルギーを＋1個付与する。',
      spellEffect: 'BONUS_ENERGY_ACTIVE',
    },
    ui: {
      tags: ['魔法', 'エネルギー加速', 'そうくん系'],
      flavorText: '「届いたら先に食べるのは当たり前だよね！」',
      artSymbol: 'Flame',
    },
  },

  // ============================================================================
  // 3. 火力強化・複合回復系魔法カード
  // ============================================================================

  {
    id: 'spl_ago_card',
    name: '顎カード',
    type: 'SPELL',
    evolution: {
      family: 'サブレ・キャノン系列サポート',
      stage: 1,
      evolvesFrom: 'atk_mayu_sable',
      evolvesTo: 'evo_ago_cannon',
    },
    level: 1,
    abilities: {
      attackName: '鋭角強化',
      activeEffect: 'このターン、自分のバトル場のカードの攻撃ダメージ＋20',
      description: '【魔法】このターン、自分のバトル場のカードが使う攻撃のダメージを＋20する。',
      spellEffect: 'BUFF_ATK_20',
    },
    ui: {
      tags: ['魔法', '火力強化', '顎'],
      flavorText: '「鋭利なる顎の力。装着するだけで殺傷力アップ。」',
      artSymbol: 'Crosshair',
    },
  },

  {
    id: 'spl_yasumatsu',
    name: '安松',
    type: 'SPELL',
    evolution: {
      family: 'つだぬまず系列サポート',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '安松の咆哮',
      activeEffect: 'このターン、自分のバトル場のカードの攻撃ダメージ＋30',
      description: '【魔法】このターン、自分のバトル場のカードが使う攻撃のダメージを＋30する！',
      spellEffect: 'BUFF_ATK_30',
    },
    ui: {
      tags: ['魔法', '超強化', 'つだぬまず'],
      flavorText: '「安松の魂の叫びが仲間に渾身のパワーを授ける！！」',
      artSymbol: 'Crown',
    },
  },

  {
    id: 'spl_yukiya_card',
    name: 'ユキやカード',
    type: 'SPELL',
    evolution: {
      family: 'よしえ系列サポート',
      stage: 1,
      evolvesFrom: 'evo_yoshie_kakei',
      evolvesTo: 'evo_yoshie_ex',
    },
    level: 1,
    abilities: {
      attackName: 'ユキやの加護',
      activeEffect: '自分のバトル場のカードのHPを30回復し、このターンの攻撃ダメージ＋10',
      description: '【魔法】自分のバトル場のカードのHPを30回復し、このターンの攻撃ダメージを＋10する。',
      spellEffect: 'HEAL_30_BUFF_10',
    },
    ui: {
      tags: ['魔法', '回復', '強化', 'ゆきや系'],
      flavorText: '「ユキやの魔力が仲間を癒やし力を授ける。」',
      artSymbol: 'Crown',
    },
  },

  // ============================================================================
  // 4. 防御・ダメージ軽減系魔法カード
  // ============================================================================

  {
    id: 'spl_mietemasu',
    name: '見えてます',
    type: 'SPELL',
    evolution: {
      family: '防御魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '見切りガード',
      activeEffect: '自分のバトル場のHPを20回復し、次の相手ターンの被ダメージ−20',
      description: '【魔法】自分のバトル場のカードのHPを20回復し、次の相手ターンに受けるダメージを−20する。',
      spellEffect: 'HEAL_20_SHIELD_20',
    },
    ui: {
      tags: ['魔法', '回復', '軽減'],
      flavorText: '「全部見えてますから。」',
      artSymbol: 'Lock',
    },
  },

  {
    id: 'spl_sansha_mendan',
    name: '三者面談',
    type: 'SPELL',
    evolution: {
      family: '防御魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '先生の介入',
      activeEffect: '次の相手ターン、自分のバトル場の被ダメージ−30',
      description: '【魔法】次の相手のターン、自分のバトル場のカードが受けるダメージを−30する。',
      spellEffect: 'SHIELD_30',
    },
    ui: {
      tags: ['魔法', '防御'],
      flavorText: '「親と担任と本人の前では手を出せない。」',
      artSymbol: 'Shield',
    },
  },

  // ============================================================================
  // 5. 直接ダメージ・妨害・入れ替え系魔法カード
  // ============================================================================

  {
    id: 'spl_unko_card',
    name: 'うんこかーど',
    type: 'SPELL',
    evolution: {
      family: 'よしえ系列サポート',
      stage: 1,
      evolvesFrom: 'evo_yoshie_salt',
      evolvesTo: 'evo_yoshie_kakei',
    },
    level: 1,
    abilities: {
      attackName: '強烈な臭気',
      activeEffect: '相手のバトル場のカードに20ダメージを与える',
      description: '【魔法】相手のバトル場のカードに20ダメージを与える。',
      spellEffect: 'DIRECT_DMG_20',
    },
    ui: {
      tags: ['魔法', '直接ダメージ'],
      flavorText: '「強烈な臭気と威力。相手の体力を直接削る。」',
      artSymbol: 'Skull',
    },
  },

  {
    id: 'spl_fluorescent_ryunosuke',
    name: '蛍光マーカーのりゅーのすけ',
    type: 'SPELL',
    evolution: {
      family: 'りゅーのすけ系列サポート',
      stage: 1,
      evolvesFrom: 'atk_ryunosuke',
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '目くらましビーム',
      activeEffect: '相手のバトル場に10ダメージ＆エネルギー1個トラッシュ',
      description:
        '【魔法】相手のバトル場のカードに10ダメージを与え、さらに相手のバトル場のエネルギーを1個トラッシュする。',
      spellEffect: 'DRAIN_ENERGY_DMG_10',
    },
    ui: {
      tags: ['魔法', '妨害', 'りゅーのすけ系'],
      flavorText: '「蛍光マーカー眩しいだろー！その隙にポイッ！」',
      artSymbol: 'Zap',
    },
  },

  {
    id: 'spl_trade',
    name: 'トレード',
    type: 'SPELL',
    evolution: {
      family: '入れ替え魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '強制スイッチ',
      activeEffect: '相手のバトル場のカードをベンチカードとランダムに入れ替える',
      description:
        '【魔法】相手のバトル場のカードを、相手のベンチカードとランダムに入れ替える（ベンチがいない場合は1枚引く）。',
      spellEffect: 'SWAP_OPPONENT_BENCH',
    },
    ui: {
      tags: ['魔法', '入れ替え'],
      flavorText: '「ちょっとそこの控え、前に出てきなさい！」',
      artSymbol: 'Sparkles',
    },
  },
];

export const SPELL_CARDS: CardDefinition[] = SPELL_CARD_SEEDS.map(buildCardDefinition);
