import { CardDefinition } from '../types';

export const SPELL_CARDS: CardDefinition[] = [
  {
    id: 'spl_lightning',
    name: '雷撃ボルト',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 2,
    tags: ['魔法', '直接火力'],
    description: '【即時発動】相手の場の攻撃カード1体または相手プレイヤーに800ダメージを与える。',
    flavorText: '天空を裂き、迅雷が標的を貫く。',
    artColor: '#eab308',
    artGradient: 'from-amber-400 to-yellow-700',
    artSymbol: 'Zap',
    effects: [
      {
        id: 'eff_lightning_dmg',
        trigger: 'ON_PLAY',
        targetType: 'ENEMY_CARD',
        description: '敵単体に800ダメージ',
        damage: 800
      }
    ]
  },
  {
    id: 'spl_heal_spring',
    name: '生命の泉',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 2,
    tags: ['魔法', '回復'],
    description: '【即時発動】自プレイヤーのHPを1000回復する。',
    flavorText: '澄み渡る雫が、疲弊した魂を潤す。',
    artColor: '#06b6d4',
    artGradient: 'from-cyan-400 to-blue-700',
    artSymbol: 'Heart',
    effects: [
      {
        id: 'eff_spring_heal',
        trigger: 'ON_PLAY',
        targetType: 'FRIENDLY_PLAYER',
        description: '自プレイヤーHPを1000回復',
        healPlayer: 1000
      }
    ]
  },
  {
    id: 'spl_shirankedo_spell',
    name: '知らんけど',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 2,
    tags: ['魔法', 'ギャンブル', 'ランダム'],
    description: '【即時発動】サーバー乱数で3択！ ①相手全カードに600ダメージ ②自軍全カードATK+400 ③何も起きない（知らんけど）',
    flavorText: '「なんかすごい効果出るんちゃう？知らんけど。」',
    artColor: '#8b5cf6',
    artGradient: 'from-purple-500 via-indigo-600 to-pink-600',
    artSymbol: 'Dice5',
    effects: [
      {
        id: 'eff_shirankedo_magic',
        trigger: 'ON_PLAY',
        targetType: 'ALL_ENEMY_CARDS',
        description: 'サーバー乱数で奇跡か不発を判定',
        isRandom: true,
        randomEffectType: 'SHIRANKEDO'
      }
    ]
  },
  {
    id: 'spl_draw_boost',
    name: '魔導の啓示',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 3,
    tags: ['魔法', 'ドロー'],
    description: '【即時発動】デッキからカードを2枚ドローする。',
    flavorText: '古の書物が新たなる知恵と戦略を授ける。',
    artColor: '#3b82f6',
    artGradient: 'from-blue-500 to-cyan-700',
    artSymbol: 'BookOpen',
    effects: [
      {
        id: 'eff_draw_two',
        trigger: 'ON_PLAY',
        targetType: 'FRIENDLY_PLAYER',
        description: 'カードを2枚ドロー',
        drawCards: 2
      }
    ]
  },
  {
    id: 'spl_cataclysm',
    name: '天地崩壊',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 5,
    tags: ['魔法', '全体破壊'],
    description: '【即時発動】戦場のすべての攻撃カード（敵味方問わず）に700ダメージを与える。',
    flavorText: '大地は割れ、万物が天の裁きを受ける。',
    artColor: '#dc2626',
    artGradient: 'from-red-600 via-orange-700 to-stone-900',
    artSymbol: 'Skull',
    effects: [
      {
        id: 'eff_cataclysm_dmg',
        trigger: 'ON_PLAY',
        targetType: 'ALL_CARDS',
        description: '全カードに700ダメージ',
        damage: 700
      }
    ]
  },

  // Attachment Spells (カードの付着・スタック)
  {
    id: 'spl_att_sword',
    name: '剛力の聖剣',
    type: 'SPELL',
    subType: 'ATTACHMENT',
    cost: 2,
    tags: ['付着', '装備', '強化'],
    description: '【カード付着】味方の攻撃カード1体に付着する。対象のATK+600、HP+300。スタックされて表示される。',
    flavorText: '選ばれし勇者にのみ握ることを許された伝説の剛剣。',
    artColor: '#f59e0b',
    artGradient: 'from-amber-400 to-amber-700',
    artSymbol: 'Sword',
    effects: [],
    attachmentRule: {
      allowedTarget: 'FRIENDLY_ATTACK',
      atkBonus: 600,
      hpBonus: 300
    }
  },
  {
    id: 'spl_att_aegis',
    name: '聖樹の神盾',
    type: 'SPELL',
    subType: 'ATTACHMENT',
    cost: 2,
    tags: ['付着', '装備', '守護付与'],
    description: '【カード付着】味方の攻撃カード1体に付着する。対象のHP+900、【守護】を付与し、ターン終了時にHP200回復。',
    flavorText: '世界樹の枝より削り出された不可侵の加護盾。',
    artColor: '#10b981',
    artGradient: 'from-emerald-400 to-teal-800',
    artSymbol: 'Shield',
    effects: [],
    attachmentRule: {
      allowedTarget: 'FRIENDLY_ATTACK',
      atkBonus: 0,
      hpBonus: 900,
      grantTaunt: true,
      endTurnHeal: 200
    }
  },
  {
    id: 'spl_att_curse',
    name: '深淵の呪縛輪',
    type: 'SPELL',
    subType: 'ATTACHMENT',
    cost: 2,
    tags: ['付着', '弱体化', '呪い'],
    description: '【カード付着】敵の攻撃カード1体に付着する。対象のATKを500低下させ、行動力を奪う。',
    flavorText: '絡みつく漆黒の鎖が、対象の力を削ぎ落とす。',
    artColor: '#6b21a8',
    artGradient: 'from-purple-800 to-black',
    artSymbol: 'Lock',
    effects: [],
    attachmentRule: {
      allowedTarget: 'ANY_ATTACK',
      atkBonus: -500,
      hpBonus: 0
    }
  },

  // Evolution Spell (進化トリガー)
  {
    id: 'spl_awakening_orb',
    name: '覚醒のオーブ',
    type: 'SPELL',
    subType: 'EVOLUTION',
    cost: 3,
    tags: ['魔法', '進化', '覚醒'],
    description: '【進化発動】自分の場の進化可能な攻撃カード1体を進化させる！（真・剣士レオ → 聖騎士ロードレオ、幼竜ドラコ → 火炎竜ヴォルケス）',
    flavorText: '内に秘めし潜在能力を解放し、高次元の姿へと昇華させる。',
    artColor: '#38bdf8',
    artGradient: 'from-cyan-400 via-indigo-500 to-purple-800',
    artSymbol: 'Sparkles',
    effects: []
  }
];
