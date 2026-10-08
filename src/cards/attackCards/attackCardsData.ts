import { CardDefinition, RawCardSeed } from '../types';
import { buildCardDefinition } from '../levelSystem';

/**
 * 攻撃カード定義一覧 (全19種)
 *
 * 【記載順序】
 * 1. よしえ進化系列: 綺麗なよしえ (Lv.2) → 塩よしえ (Lv.3) → 「普通に話すだけならいいよー（嘘）」嘉慧 (Lv.4) → よしえEX (Lv.5)
 * 2. りゅうく進化系列: 吉田りゅうく (Lv.3) → リューク・スカイウォーカー (Lv.5)
 * 3. サブレ・キャノン進化系列: まゆサブレ (Lv.3) → 顎・キャノン (Lv.4)
 * 4. ヘッドフォンニキ進化系列: ヘッドフォンニキ (Lv.2) → オンフードヘッドフォンニキ (Lv.4)
 * 5. つだぬまず連携系列: しょーちゃん (Lv.3) / おりちゃん (Lv.3) / ムエ (Lv.4)
 * 6. 単体・速攻／標準カード: 情報処理基礎のおばぁ (Lv.1) / りゅーのすけ (Lv.1) / 顎 (Lv.1) / 井上教授（壁） (Lv.1) / ヨートン (Lv.2) / バニラなそうくん (Lv.2)
 */
const ATTACK_CARD_SEEDS: RawCardSeed[] = [
  // ============================================================================
  // 1. よしえ進化系列
  //    綺麗なよしえ (Lv.2) → 塩よしえ (Lv.3) → 嘉慧 (Lv.4) → よしえEX (Lv.5)
  // ============================================================================

  // [Stage 1] 綺麗なよしえ (よしえ系列の起点 -> 塩よしえへ繋がる)
  {
    id: 'atk_yoshie_clean',
    name: '綺麗なよしえ',
    type: 'ATTACK',
    evolution: {
      family: 'よしえ系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_yoshie_salt',
      triggerCardId: 'spl_juzu_card',
    },
    level: 2,
    abilities: {
      attackName: 'ピュアストライク',
      activeEffect: '2エネルギーで50ダメージを与える安定攻撃',
      description: '攻守のバランスに優れたLv.2標準カード。逃げるコストも1と軽快。',
    },
    ui: {
      tags: ['よしえ系', 'Lv.2'],
      flavorText: '「清らかで美しいよしえ。まだ塩分は控えめ。」',
      artSymbol: 'Sparkles',
    },
  },

  // [Stage 2] 塩よしえ (綺麗なよしえ から進化 -> 嘉慧へ繋がる)
  {
    id: 'evo_yoshie_salt',
    name: '塩よしえ',
    type: 'ATTACK',
    evolution: {
      family: 'よしえ系列',
      stage: 2,
      evolvesFrom: 'atk_yoshie_clean',
      evolvesTo: 'evo_yoshie_kakei',
      triggerCardId: 'spl_unko_card',
    },
    level: 3,
    abilities: {
      attackName: '塩対応スラッシュ',
      activeEffect: '2エネルギーで70ダメージを与える主力攻撃',
      description: '2エネルギーで70ダメージを叩き出す主力アタッカー。HP100で耐久力も十分。',
    },
    ui: {
      tags: ['よしえ系', 'Lv.3'],
      flavorText: '「塩対応が冴え渡るよしえ。近づく者には容赦ない。」',
      artSymbol: 'Zap',
    },
  },

  // [Stage 3] 「普通に話すだけならいいよー（嘘）」嘉慧 (塩よしえ から進化 -> よしえEXへ繋がる)
  {
    id: 'evo_yoshie_kakei',
    name: '「普通に話すだけならいいよー（嘘）」嘉慧',
    type: 'ATTACK',
    evolution: {
      family: 'よしえ系列',
      stage: 3,
      evolvesFrom: 'evo_yoshie_salt',
      evolvesTo: 'evo_yoshie_ex',
      triggerCardId: 'spl_yukiya_card',
    },
    level: 4,
    abilities: {
      attackName: '嘘つきオーバーキル',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      description: '3エネルギーで100ダメージを放つ重量級アタッカー。Lv.3以下のカードを一撃で葬る。',
    },
    ui: {
      tags: ['よしえ系', '嘉慧', 'Lv.4'],
      flavorText: '「普通に話すだけならいいよー（絶対に嘘）。」',
      artSymbol: 'HelpCircle',
    },
  },

  // [Stage 4 / 最終EX] よしえEX (嘉慧 から進化する最終形態)
  {
    id: 'evo_yoshie_ex',
    name: 'よしえEX',
    type: 'ATTACK',
    evolution: {
      family: 'よしえ系列',
      stage: 4,
      evolvesFrom: 'evo_yoshie_kakei',
      evolvesTo: null,
    },
    level: 5,
    abilities: {
      attackName: 'EXアルティメット輝き',
      activeEffect: '4エネルギーで130ダメージを与えるEX必殺技',
      passiveEffect: 'EXルール：きぜつした際、相手は2ポイントを獲得する',
      description:
        '【EX級】HP160・攻撃力130の最高峰カード！4エネルギー必要で育成に時間がかかり、気絶すると相手に2ポイントを与える。',
    },
    ui: {
      tags: ['よしえ系', 'EX', 'Lv.5'],
      flavorText: '「すべてを超越したEXの輝き。誰も逆らえない。」',
      artSymbol: 'Crown',
    },
  },

  // ============================================================================
  // 2. りゅうく進化系列
  //    吉田りゅうく (Lv.3) → リューク・スカイウォーカー (Lv.5)
  // ============================================================================

  // [Stage 1] 吉田りゅうく (りゅうく系列の起点 -> リューク・スカイウォーカーへ繋がる)
  {
    id: 'atk_yoshida_ryuku',
    name: '吉田りゅうく',
    type: 'ATTACK',
    evolution: {
      family: 'りゅうく系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_ryuku_skywalker',
      triggerCardId: 'spl_futomomo',
    },
    level: 3,
    abilities: {
      attackName: 'フォースタックル',
      activeEffect: '2エネルギーで70ダメージを与える主力攻撃',
      description: '鍛え上げられたタフネスで戦線を維持するLv.3主力カード。',
    },
    ui: {
      tags: ['りゅうく系', 'Lv.3'],
      flavorText: '「鍛え上げられたタフネス。秘めたるフォースが眠る。」',
      artSymbol: 'Shield',
    },
  },

  // [Stage 2 / 最終EX] リューク・スカイウォーカー (吉田りゅうく から進化する最終形態)
  {
    id: 'evo_ryuku_skywalker',
    name: 'リューク・スカイウォーカー',
    type: 'ATTACK',
    evolution: {
      family: 'りゅうく系列',
      stage: 2,
      evolvesFrom: 'atk_yoshida_ryuku',
      evolvesTo: null,
    },
    level: 5,
    abilities: {
      attackName: 'ギャラクシーフォース',
      activeEffect: '4エネルギーで130ダメージを与えるEX必殺技',
      passiveEffect: 'EXルール：きぜつした際、相手は2ポイントを獲得する',
      description:
        '【EX級】HP160・攻撃力130の超大型フィニッシャー！4エネルギー必要で気絶時は2ポイント失うが、完成すれば無双の強さ。',
    },
    ui: {
      tags: ['りゅうく系', 'EX', 'Lv.5'],
      flavorText: '「リュークと共にあらんことを。」銀河を揺るがす圧倒的フォース。',
      artSymbol: 'Zap',
    },
  },

  // ============================================================================
  // 3. サブレ・キャノン進化系列
  //    まゆサブレ (Lv.3) → 顎・キャノン (Lv.4)
  // ============================================================================

  // [Stage 1] まゆサブレ (サブレ系列の起点 -> 顎・キャノンへ繋がる)
  {
    id: 'atk_mayu_sable',
    name: 'まゆサブレ',
    type: 'ATTACK',
    evolution: {
      family: 'サブレ・キャノン系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_ago_cannon',
      triggerCardId: 'spl_ago_card',
    },
    level: 3,
    abilities: {
      attackName: 'サブレクラッシュ',
      activeEffect: '2エネルギーで70ダメージを与える主力攻撃',
      description: '2エネルギー70ダメージの優秀な中堅アタッカー。どんな場面でも頼りになる。',
    },
    ui: {
      tags: ['サブレ', 'Lv.3'],
      flavorText: '「サクサクの香ばしいサブレ。実戦でもめっぽう強い。」',
      artSymbol: 'Crosshair',
    },
  },

  // [Stage 2] 顎・キャノン (まゆサブレ から進化)
  {
    id: 'evo_ago_cannon',
    name: '顎・キャノン',
    type: 'ATTACK',
    evolution: {
      family: 'サブレ・キャノン系列',
      stage: 2,
      evolvesFrom: 'atk_mayu_sable',
      evolvesTo: null,
    },
    level: 4,
    abilities: {
      attackName: '超高出力顎キャノン',
      activeEffect: '3エネルギーで100ダメージを与える重砲撃',
      description: '3エネルギーを溜めて100ダメージの主砲を放つ高火力エースカード。',
    },
    ui: {
      tags: ['キャノン', '顎', 'Lv.4'],
      flavorText: '「突き出た顎から放たれる超高出力キャノン砲！」',
      artSymbol: 'Flame',
    },
  },

  // ============================================================================
  // 4. ヘッドフォンニキ進化系列
  //    ヘッドフォンニキ (Lv.2) → オンフードヘッドフォンニキ (Lv.4)
  // ============================================================================

  // [Stage 1] ヘッドフォンニキ (ニキ系列の起点 -> オンフードヘッドフォンニキへ繋がる)
  {
    id: 'atk_headphone_niki',
    name: 'ヘッドフォンニキ',
    type: 'ATTACK',
    evolution: {
      family: 'ヘッドフォンニキ系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_onhood_headphone_niki',
    },
    level: 2,
    abilities: {
      attackName: '重低音ビート',
      activeEffect: '2エネルギーで50ダメージを与える安定攻撃',
      description: 'リズムに乗って2エネルギー50ダメージを放つ扱いやすい標準アタッカー。',
    },
    ui: {
      tags: ['ニキ系', 'Lv.2'],
      flavorText: '「お気に入りのヘッドフォンで音楽に没頭中。」',
      artSymbol: 'Sparkles',
    },
  },

  // [Stage 2] オンフードヘッドフォンニキ (ヘッドフォンニキ から進化)
  {
    id: 'evo_onhood_headphone_niki',
    name: 'オンフードヘッドフォンニキ',
    type: 'ATTACK',
    evolution: {
      family: 'ヘッドフォンニキ系列',
      stage: 2,
      evolvesFrom: 'atk_headphone_niki',
      evolvesTo: null,
    },
    level: 4,
    abilities: {
      attackName: '密閉フルボリューム',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      description: 'HP130・攻撃力100を誇る重装アタッカー。ベンチでエネルギーを育てて投入しよう。',
    },
    ui: {
      tags: ['ニキ系', 'Lv.4'],
      flavorText: '「フードの上から装着することで更なる密閉感と力を手に入れた。」',
      artSymbol: 'Crown',
    },
  },

  // ============================================================================
  // 5. つだぬまず連携系列
  //    しょーちゃん (Lv.3) / おりちゃん (Lv.3) / ムエ (Lv.4)
  //    ※環境カード「浅草寺」でさらに攻撃ボーナスを得る連携グループ
  // ============================================================================

  {
    id: 'atk_shochan',
    name: 'しょーちゃん',
    type: 'ATTACK',
    evolution: {
      family: 'つだぬまず系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
      triggerCardId: 'env_sensoji',
    },
    level: 3,
    abilities: {
      attackName: 'つだぬまドライブ',
      activeEffect: '2エネルギーで70ダメージを与える主力攻撃',
      passiveEffect: '環境「浅草寺」展開時、攻撃ダメージが合計＋20される',
      description: 'HP100・攻撃力70の主力カード。2エネルギーで安定した高打点を出す。',
    },
    ui: {
      tags: ['つだぬまず', 'Lv.3'],
      flavorText: '「つだぬまずの頼れる中核。」',
      artSymbol: 'Zap',
    },
  },

  {
    id: 'atk_orichan',
    name: 'おりちゃん',
    type: 'ATTACK',
    evolution: {
      family: 'つだぬまず系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
      triggerCardId: 'env_sensoji',
    },
    level: 3,
    abilities: {
      attackName: '堅実ガードインパクト',
      activeEffect: '2エネルギーで70ダメージを与える主力攻撃',
      passiveEffect: '環境「浅草寺」展開時、攻撃ダメージが合計＋20される',
      description: '安定したHP100と70ダメージで中盤の盤面を制圧する主力カード。',
    },
    ui: {
      tags: ['つだぬまず', 'Lv.3'],
      flavorText: '「堅実な立ち回りで戦線を支える。」',
      artSymbol: 'Shield',
    },
  },

  {
    id: 'atk_mue',
    name: 'ムエ',
    type: 'ATTACK',
    evolution: {
      family: 'つだぬまず系列',
      stage: 2,
      evolvesFrom: null,
      evolvesTo: null,
      triggerCardId: 'env_sensoji',
    },
    level: 4,
    abilities: {
      attackName: 'エースバースト',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      passiveEffect: '環境「浅草寺」展開時、攻撃ダメージが合計＋20される',
      description: '3エネルギー100ダメージ・HP130の主力エース。戦況を一変させるパワーを持つ。',
    },
    ui: {
      tags: ['つだぬまず', 'Lv.4'],
      flavorText: '「圧倒的パワーを誇るエースアタッカー。」',
      artSymbol: 'Sword',
    },
  },

  // ============================================================================
  // 6. 単体・速攻／標準カード (Lv.1 〜 Lv.2)
  // ============================================================================

  {
    id: 'atk_info_grandma',
    name: '情報処理基礎のおばぁ',
    type: 'ATTACK',
    evolution: {
      family: '単体',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '課題チェック',
      activeEffect: '1エネルギーで30ダメージを与える速攻攻撃',
      description:
        '1エネルギーで素早く攻撃できる速攻カード。「普通に厳しい」指導で序盤からプレッシャーを与える。',
    },
    ui: {
      tags: ['情報処理', '教官', 'Lv.1'],
      flavorText: '「普通に厳しいからね。課題出した？」',
      artSymbol: 'BookOpen',
    },
  },

  {
    id: 'atk_ryunosuke',
    name: 'りゅーのすけ',
    type: 'ATTACK',
    evolution: {
      family: 'りゅーのすけ系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
      triggerCardId: 'spl_fluorescent_ryunosuke',
    },
    level: 1,
    abilities: {
      attackName: 'ハイスピード突撃',
      activeEffect: '1エネルギーで30ダメージを与える速攻攻撃',
      description: '1エネルギーで即座に動ける軽量アタッカー。序盤の主導権を握るのに最適。',
    },
    ui: {
      tags: ['速攻', 'Lv.1'],
      flavorText: '「先手必勝！一瞬の隙を突く電光石火の一撃！」',
      artSymbol: 'Zap',
    },
  },

  {
    id: 'atk_ago',
    name: '顎',
    type: 'ATTACK',
    evolution: {
      family: '顎系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_ago_cannon',
      triggerCardId: 'spl_ago_card',
    },
    level: 1,
    abilities: {
      attackName: '鋭角突き',
      activeEffect: '1エネルギーで30ダメージを与える速攻攻撃',
      description: '鋭利な角度から1エネルギーで30ダメージを繰り出す速攻カード。',
    },
    ui: {
      tags: ['顎', 'Lv.1'],
      flavorText: '「見事な鋭角を描く顎。」',
      artSymbol: 'Crosshair',
    },
  },

  {
    id: 'token_inoue_professor',
    name: '井上教授（壁）',
    type: 'ATTACK',
    evolution: {
      family: 'フェニックスホール系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
      triggerCardId: 'env_phoenix_hall',
    },
    level: 1,
    abilities: {
      attackName: '学術の壁ドン',
      activeEffect: '1エネルギーで30ダメージを与える速攻攻撃',
      passiveEffect: '環境「フェニックスホール」の効果でも手札に生成される',
      description: 'フェニックスホールに立ちはだかる教授。1エネルギーで堅実に戦線を支える。',
    },
    ui: {
      tags: ['井上教授', '壁', 'Lv.1'],
      flavorText: '「立ちはだかる学術の壁。」',
      artSymbol: 'Shield',
    },
  },

  {
    id: 'atk_yoton',
    name: 'ヨートン',
    type: 'ATTACK',
    evolution: {
      family: '単体',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 2,
    abilities: {
      attackName: 'ヨートンスラッシュ',
      activeEffect: '2エネルギーで50ダメージを与える安定攻撃',
      description: '安定したHP80と2エネルギー50ダメージを兼ね備えた堅実なファイター。',
    },
    ui: {
      tags: ['戦士', 'Lv.2'],
      flavorText: '「ヨートン参上！」',
      artSymbol: 'Sword',
    },
  },

  {
    id: 'atk_vanilla_sokun',
    name: 'バニラなそうくん',
    type: 'ATTACK',
    evolution: {
      family: 'そうくん系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
      triggerCardId: 'spl_matenai_sokun',
    },
    level: 2,
    abilities: {
      attackName: 'バニラアタック',
      activeEffect: '2エネルギーで50ダメージを与える安定攻撃',
      description: 'クセがなく扱いやすいLv.2標準カード。序盤から中盤の繋ぎとして活躍。',
    },
    ui: {
      tags: ['そうくん系', 'Lv.2'],
      flavorText: '「バニラじゃなくていいじゃぁん！」',
      artSymbol: 'Heart',
    },
  },
];

export const ATTACK_CARDS: CardDefinition[] = ATTACK_CARD_SEEDS.map(buildCardDefinition);
