import { CardDefinition } from '../types';

export const ENVIRONMENT_CARDS: CardDefinition[] = [
  {
    id: 'env_magma',
    name: '灼熱のマグマ大地',
    type: 'ENVIRONMENT',
    cost: 3,
    tags: ['環境', '炎', '攻撃上昇'],
    description: '【環境カード】場全体を溶岩帯に変える。場のすべての攻撃カードのATKが+300される。（環境カードは盤面に1枚のみ存在可能）',
    flavorText: '燃え盛る大地が戦士たちの闘争本能を極限まで滾らせる。',
    artColor: '#ef4444',
    artGradient: 'from-amber-600 via-red-600 to-stone-900',
    artSymbol: 'Flame',
    effects: [
      {
        id: 'eff_env_magma_buff',
        trigger: 'ON_PLAY',
        targetType: 'ALL_CARDS',
        description: '全攻撃カードATK+300',
        buffAtk: 300
      }
    ]
  },
  {
    id: 'env_forest',
    name: '深緑の大樹海',
    type: 'ENVIRONMENT',
    cost: 3,
    tags: ['環境', '木', '持続回復'],
    description: '【環境カード】戦場を大自然で包む。各ターン開始時、手番プレイヤーのHPが300回復し、自軍の全攻撃カードのHPが200回復する。',
    flavorText: '千年の命を育む原生林が傷ついた者を癒やし続ける。',
    artColor: '#10b981',
    artGradient: 'from-emerald-700 via-green-600 to-teal-950',
    artSymbol: 'Trees',
    effects: [
      {
        id: 'eff_env_forest_heal',
        trigger: 'ON_TURN_START',
        targetType: 'FRIENDLY_PLAYER',
        description: 'ターン開始時HP300回復',
        healPlayer: 300
      }
    ]
  },
  {
    id: 'env_temple',
    name: '静寂の魔導神殿',
    type: 'ENVIRONMENT',
    cost: 3,
    tags: ['環境', '魔力', '魔力循環'],
    description: '【環境カード】神聖な魔力場を展開。魔法カードを発動するたび、使用者は山札からカードを1枚ドローする。',
    flavorText: '古の神託が響く神殿では、呪文の詠唱が無限の英知を呼ぶ。',
    artColor: '#8b5cf6',
    artGradient: 'from-violet-700 via-indigo-600 to-blue-950',
    artSymbol: 'Sparkles',
    effects: [
      {
        id: 'eff_env_temple_draw',
        trigger: 'ON_PLAY',
        targetType: 'FRIENDLY_PLAYER',
        description: '魔法使用時ドロー',
        drawCards: 1
      }
    ]
  },
  {
    id: 'env_sky_island',
    name: '天空の浮遊島',
    type: 'ENVIRONMENT',
    cost: 3,
    tags: ['環境', '風', '乱戦'],
    description: '【環境カード】風吹き荒れる高空。守護が機能しなくなり、全攻撃カードが相手プレイヤーへ直接攻撃可能になる。',
    flavorText: '遮るもののない天上の決戦場。互いの刃が直接交錯する。',
    artColor: '#0ea5e9',
    artGradient: 'from-sky-500 via-cyan-600 to-indigo-950',
    artSymbol: 'Wind',
    effects: []
  }
];
