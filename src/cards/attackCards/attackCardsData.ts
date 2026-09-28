import { CardDefinition } from '../types';

export const ATTACK_CARDS: CardDefinition[] = [
  {
    id: 'atk_leo',
    name: '真・剣士レオ',
    type: 'ATTACK',
    cost: 3,
    baseAtk: 1200,
    baseHp: 1500,
    tags: ['戦士', '先陣'],
    description: '標準的な攻撃カード。高いバランス力を誇り、「聖騎士ロードレオ」へと進化可能。',
    flavorText: '「我が剣に迷いなし！正義の道を切り拓く！」',
    artColor: '#3b82f6',
    artGradient: 'from-blue-600 to-indigo-900',
    artSymbol: 'Sword',
    effects: [],
    evolutionRule: {
      targetDefinitionId: 'evo_lord_leo',
      statBonusAtk: 1200,
      statBonusHp: 1100
    }
  },
  {
    id: 'atk_golem',
    name: '守護の巨兵ゴーレム',
    type: 'ATTACK',
    cost: 4,
    baseAtk: 800,
    baseHp: 2400,
    tags: ['巨兵', '守護'],
    description: '【守護】相手は守護を持つカードが存在する場合、このカードを優先して攻撃しなければならない。',
    flavorText: '堅牢なる岩石の肉体は、主への攻撃をことごとく阻む。',
    artColor: '#78716c',
    artGradient: 'from-stone-600 to-stone-900',
    artSymbol: 'Shield',
    effects: [
      {
        id: 'eff_golem_taunt',
        trigger: 'ON_PLAY',
        targetType: 'NONE',
        description: '【守護】を獲得する。',
        specialAction: 'TAUNT'
      }
    ]
  },
  {
    id: 'atk_ninja',
    name: '疾風の忍者',
    type: 'ATTACK',
    cost: 3,
    baseAtk: 1000,
    baseHp: 1000,
    tags: ['忍者', '速攻'],
    description: '【突撃】場に出たターンに即座に攻撃が可能。',
    flavorText: '影より出でて、風と共に斬り伏せる。',
    artColor: '#10b981',
    artGradient: 'from-emerald-600 to-teal-950',
    artSymbol: 'Zap',
    effects: [
      {
        id: 'eff_ninja_charge',
        trigger: 'ON_PLAY',
        targetType: 'NONE',
        description: '【突撃】獲得。出したターンに攻撃できる。',
        specialAction: 'CHARGE'
      }
    ]
  },
  {
    id: 'atk_luna',
    name: '魔導少女ルナ',
    type: 'ATTACK',
    cost: 3,
    baseAtk: 900,
    baseHp: 1100,
    tags: ['魔法使い', '遠隔'],
    description: '【召喚時】相手の攻撃カード1体に400ダメージを与える。',
    flavorText: '「私の魔力、侮らないでよね！」',
    artColor: '#a855f7',
    artGradient: 'from-purple-600 to-fuchsia-950',
    artSymbol: 'Sparkles',
    effects: [
      {
        id: 'eff_luna_onplay',
        trigger: 'ON_PLAY',
        targetType: 'ENEMY_CARD',
        description: '相手攻撃カード1体に400ダメージ',
        damage: 400
      }
    ]
  },
  {
    id: 'atk_yoshie',
    name: '綺麗なよしえ',
    type: 'ATTACK',
    cost: 3,
    baseAtk: 1100,
    baseHp: 1300,
    tags: ['神秘', '回復'],
    description: '【召喚時】自プレイヤーのHPを500回復する。清廉な輝きで戦場を包む。',
    flavorText: '「皆様、どうか心穏やかにお過ごしください。」',
    artColor: '#ec4899',
    artGradient: 'from-pink-500 to-rose-900',
    artSymbol: 'HeartHandshake',
    effects: [
      {
        id: 'eff_yoshie_heal',
        trigger: 'ON_PLAY',
        targetType: 'FRIENDLY_PLAYER',
        description: '自プレイヤーのHPを500回復',
        healPlayer: 500
      }
    ]
  },
  {
    id: 'atk_draco',
    name: '幼竜ドラコ',
    type: 'ATTACK',
    cost: 2,
    baseAtk: 700,
    baseHp: 900,
    tags: ['ドラゴン', '幼体'],
    description: '進化の可能性を秘めた子竜。「火炎竜ヴォルケス」へ進化可能。',
    flavorText: '小さな体にも竜の熱き血潮が脈打っている。',
    artColor: '#f97316',
    artGradient: 'from-orange-500 to-amber-900',
    artSymbol: 'Flame',
    effects: [],
    evolutionRule: {
      targetDefinitionId: 'evo_volces',
      statBonusAtk: 1500,
      statBonusHp: 1300
    }
  },
  {
    id: 'atk_shirankedo',
    name: '知らんけどの使い手',
    type: 'ATTACK',
    cost: 4,
    baseAtk: 1400,
    baseHp: 1300,
    tags: ['関西', '不確定'],
    description: '【攻撃時】サーバー側乱数で判定。50%で相手対象に500追撃ダメージ、50%で「知らんけど」で何も起きない。',
    flavorText: '「絶対勝てるで！……知らんけどな。」',
    artColor: '#eab308',
    artGradient: 'from-yellow-500 to-amber-950',
    artSymbol: 'HelpCircle',
    effects: [
      {
        id: 'eff_shirankedo_attack',
        trigger: 'ON_ATTACK',
        targetType: 'ENEMY_CARD',
        description: '50%で500追撃ダメージ、50%で知らんけど',
        isRandom: true,
        randomEffectType: 'COIN_FLIP',
        damage: 500
      }
    ]
  },
  {
    id: 'atk_knight',
    name: '鋼鉄の重装騎士',
    type: 'ATTACK',
    cost: 4,
    baseAtk: 1300,
    baseHp: 1800,
    tags: ['戦士', '重装'],
    description: '付着カード（装備カード）と相性が良いタフな前衛カード。',
    flavorText: '鉄壁の甲冑が矢も魔法も弾き返す。',
    artColor: '#64748b',
    artGradient: 'from-slate-600 to-slate-950',
    artSymbol: 'ShieldAlert',
    effects: []
  },
  {
    id: 'atk_phoenix',
    name: '不死鳥フェニックス',
    type: 'ATTACK',
    cost: 5,
    baseAtk: 1800,
    baseHp: 1600,
    tags: ['神鳥', '不死'],
    description: '【破壊時】1ゲーム中に1度だけ、HP800でその場に復活する。',
    flavorText: '灰燼より立ち上がり、再び炎の翼を広げる伝説の鳥。',
    artColor: '#ef4444',
    artGradient: 'from-red-600 to-rose-950',
    artSymbol: 'Flame',
    effects: [
      {
        id: 'eff_phoenix_rebirth',
        trigger: 'ON_DESTROY',
        targetType: 'NONE',
        description: '一度だけHP800で復活する',
        specialAction: 'RESURRECT_ONCE',
        buffHp: 800
      }
    ]
  },
  {
    id: 'atk_assassin',
    name: '影の暗殺者',
    type: 'ATTACK',
    cost: 4,
    baseAtk: 1500,
    baseHp: 1100,
    tags: ['暗殺者', '貫通'],
    description: '【守護無視】相手の守護カードを無視して、直接相手プレイヤーや後衛を攻撃できる。',
    flavorText: '遮る盾など無意味。急所は既に捉えている。',
    artColor: '#1e293b',
    artGradient: 'from-slate-800 to-zinc-950',
    artSymbol: 'Crosshair',
    effects: [
      {
        id: 'eff_assassin_pierce',
        trigger: 'ON_PLAY',
        targetType: 'NONE',
        description: '相手の守護を無視して攻撃できる',
        specialAction: 'PIERCE_TAUNT'
      }
    ]
  },

  // Evolution cards (Can be summoned via Evolution on base card)
  {
    id: 'evo_lord_leo',
    name: '聖騎士ロードレオ',
    type: 'ATTACK',
    cost: 5,
    baseAtk: 2400,
    baseHp: 2600,
    tags: ['進化', '聖騎士', '守護'],
    description: '【進化召喚】「真・剣士レオ」から進化！【守護】を持ち、ターン終了時に味方全カードのHPを300回復。',
    flavorText: '幾多の試練を乗り越え、聖なる鎧を纏いし救世の騎士。',
    artColor: '#38bdf8',
    artGradient: 'from-sky-400 via-blue-600 to-indigo-950',
    artSymbol: 'Crown',
    isEvolutionOnly: true,
    effects: [
      {
        id: 'eff_lord_taunt',
        trigger: 'ON_PLAY',
        targetType: 'NONE',
        description: '【守護】を獲得',
        specialAction: 'TAUNT'
      },
      {
        id: 'eff_lord_heal',
        trigger: 'ON_TURN_END',
        targetType: 'ALL_FRIENDLY_CARDS',
        description: '自軍全カードのHPを300回復',
        healCard: 300
      }
    ]
  },
  {
    id: 'evo_volces',
    name: '火炎竜ヴォルケス',
    type: 'ATTACK',
    cost: 5,
    baseAtk: 2200,
    baseHp: 2200,
    tags: ['進化', 'ドラゴン', '全体攻撃'],
    description: '【進化召喚】「幼竜ドラコ」から進化！【召喚時】敵の場の全攻撃カードに500ダメージ！',
    flavorText: '天を焼き尽くす紅蓮の業火。地上に逃げ場はない。',
    artColor: '#f43f5e',
    artGradient: 'from-rose-500 via-red-600 to-amber-950',
    artSymbol: 'Flame',
    isEvolutionOnly: true,
    effects: [
      {
        id: 'eff_volces_blast',
        trigger: 'ON_PLAY',
        targetType: 'ALL_ENEMY_CARDS',
        description: '敵全カードに500ダメージ',
        damage: 500
      }
    ]
  }
];
