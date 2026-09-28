import { CardDefinition } from '../types';

export const ATTACK_CARDS: CardDefinition[] = [
  // 1. 綺麗なよしえ
  {
    id: 'atk_yoshie_clean',
    name: '綺麗なよしえ',
    type: 'ATTACK',
    cost: 2,
    baseAtk: 500,
    baseHp: 70,
    tags: ['よしえ系', '進化前'],
    description: '基本の攻撃カード。「数珠カード」を付属させることで「塩よしえ」へ進化する。',
    flavorText: '「清らかで美しいよしえ。まだ塩分は控えめ。」',
    artColor: '#ec4899',
    artGradient: 'from-pink-500 to-rose-700',
    artSymbol: 'Sparkles',
    effects: [],
    evolutionRule: {
      targetDefinitionId: 'evo_yoshie_salt'
    }
  },

  // 2. 塩よしえ (進化カード)
  {
    id: 'evo_yoshie_salt',
    name: '塩よしえ',
    type: 'ATTACK',
    cost: 3,
    baseAtk: 700,
    baseHp: 100,
    tags: ['よしえ系', '進化体'],
    description: '「綺麗なよしえ」に「数珠カード」を付属させて進化。「うんこかーど」を付属させることで「普通に話すだけならいいよー（嘘）」嘉慧へ進化する。',
    flavorText: '「塩対応が冴え渡るよしえ。近づく者には容赦ない。」',
    artColor: '#a855f7',
    artGradient: 'from-purple-600 to-indigo-900',
    artSymbol: 'Zap',
    isEvolutionOnly: true,
    effects: [],
    evolutionRule: {
      targetDefinitionId: 'evo_yoshie_kakei'
    }
  },

  // 3. 「普通に話すだけならいいよー（嘘）」嘉慧 (進化カード)
  {
    id: 'evo_yoshie_kakei',
    name: '「普通に話すだけならいいよー（嘘）」嘉慧',
    type: 'ATTACK',
    cost: 4,
    baseAtk: 800,
    baseHp: 150,
    tags: ['よしえ系', '進化体', '嘉慧'],
    description: '「塩よしえ」に「うんこかーど」を付属させて進化。「ユキやカード」を付属させることで「よしえEX」へ進化する。',
    flavorText: '「普通に話すだけならいいよー（絶対に嘘）。」',
    artColor: '#3b82f6',
    artGradient: 'from-blue-600 via-indigo-700 to-slate-900',
    artSymbol: 'HelpCircle',
    isEvolutionOnly: true,
    effects: [],
    evolutionRule: {
      targetDefinitionId: 'evo_yoshie_ex'
    }
  },

  // 4. よしえEX (最終進化カード)
  {
    id: 'evo_yoshie_ex',
    name: 'よしえEX',
    type: 'ATTACK',
    cost: 5,
    baseAtk: 1000,
    baseHp: 500,
    tags: ['よしえ系', 'EX', '最終進化'],
    description: '「嘉慧」に「ユキやカード」を付属させて進化。圧倒的な耐久力と攻撃力を誇る至高のよしえ。',
    flavorText: '「すべてを超越したEXの輝き。誰も逆らえない。」',
    artColor: '#f59e0b',
    artGradient: 'from-yellow-400 via-amber-600 to-orange-950',
    artSymbol: 'Crown',
    isEvolutionOnly: true,
    effects: []
  },

  // 5. ヨートン
  {
    id: 'atk_yoton',
    name: 'ヨートン',
    type: 'ATTACK',
    cost: 2,
    baseAtk: 250,
    baseHp: 200,
    tags: ['戦士'],
    description: '堅実な性能を持つ攻撃カード。',
    flavorText: '「ヨートン参上！」',
    artColor: '#10b981',
    artGradient: 'from-emerald-600 to-teal-900',
    artSymbol: 'Sword',
    effects: []
  },

  // 6. 吉田りゅうく
  {
    id: 'atk_yoshida_ryuku',
    name: '吉田りゅうく',
    type: 'ATTACK',
    cost: 3,
    baseAtk: 300,
    baseHp: 700,
    tags: ['りゅうく系', '進化前'],
    description: '高い体力を誇る。「ふともも」を使用することで「リューク・スカイウォーカー」に進化する。',
    flavorText: '「鍛え上げられたタフネス。秘めたるフォースが眠る。」',
    artColor: '#6366f1',
    artGradient: 'from-indigo-600 to-slate-900',
    artSymbol: 'Shield',
    effects: [],
    evolutionRule: {
      targetDefinitionId: 'evo_ryuku_skywalker'
    }
  },

  // 7. リューク・スカイウォーカー (進化カード)
  {
    id: 'evo_ryuku_skywalker',
    name: 'リューク・スカイウォーカー',
    type: 'ATTACK',
    cost: 5,
    baseAtk: 1000,
    baseHp: 1000,
    tags: ['りゅうく系', '進化体', 'ジェダイ'],
    description: '「吉田りゅうく」に「ふともも」を使用して進化。【効果】「リュークと共にあらんことを」',
    flavorText: '「リュークと共にあらんことを。」銀河を揺るがす圧倒的フォース。',
    artColor: '#0ea5e9',
    artGradient: 'from-cyan-400 via-blue-600 to-slate-950',
    artSymbol: 'Zap',
    isEvolutionOnly: true,
    effects: []
  },

  // 8. 情報処理基礎のおばぁ
  {
    id: 'atk_info_grandma',
    name: '情報処理基礎のおばぁ',
    type: 'ATTACK',
    cost: 2,
    baseAtk: 100,
    baseHp: 100,
    tags: ['情報処理', '教官'],
    description: '【効果】「普通に厳しい」。単位取得への道は険しい。',
    flavorText: '「普通に厳しいからね。課題出した？」',
    artColor: '#78716c',
    artGradient: 'from-stone-600 to-stone-900',
    artSymbol: 'BookOpen',
    effects: []
  },

  // 9. まゆサブレ
  {
    id: 'atk_mayu_sable',
    name: 'まゆサブレ',
    type: 'ATTACK',
    cost: 3,
    baseAtk: 300,
    baseHp: 450,
    tags: ['サブレ', '進化前'],
    description: '攻撃力300（「ムエ」に対しては特攻で攻撃力700！）。「顎カード」を付属させることで「顎・キャノン」に進化する。',
    flavorText: '「サクサクの香ばしいサブレ。ムエにはめっぽう強い。」',
    artColor: '#d97706',
    artGradient: 'from-amber-500 to-yellow-800',
    artSymbol: 'Crosshair',
    effects: []
  },

  // 10. 顎・キャノン (進化カード)
  {
    id: 'evo_ago_cannon',
    name: '顎・キャノン',
    type: 'ATTACK',
    cost: 4,
    baseAtk: 700,
    baseHp: 300,
    tags: ['キャノン', '進化体'],
    description: '「まゆサブレ」に「顎カード」を付属させて進化。攻撃力700（「ムエ」に対しては攻撃力1000！）。',
    flavorText: '「突き出た顎から放たれる超高出力キャノン砲！」',
    artColor: '#dc2626',
    artGradient: 'from-red-600 to-amber-900',
    artSymbol: 'Flame',
    isEvolutionOnly: true,
    effects: []
  },

  // 11. バニラなそうくん
  {
    id: 'atk_vanilla_sokun',
    name: 'バニラなそうくん',
    type: 'ATTACK',
    cost: 2,
    baseAtk: 30,
    baseHp: 900,
    tags: ['そうくん系', '高耐久'],
    description: '【効果】「バニラじゃなくていいじゃぁん」。超高体力で場に居座る。',
    flavorText: '「バニラじゃなくていいじゃぁん！」',
    artColor: '#fef08a',
    artGradient: 'from-yellow-200 via-amber-300 to-yellow-600',
    artSymbol: 'Heart',
    effects: []
  },

  // 12. ムエ
  {
    id: 'atk_mue',
    name: 'ムエ',
    type: 'ATTACK',
    cost: 4,
    baseAtk: 1000,
    baseHp: 600,
    tags: ['つだぬまず', '高火力'],
    description: '攻撃力1000の強豪。しょーちゃん・おりちゃんと共に「つだぬまず」を形成する。',
    flavorText: '「圧倒的パワーを誇るエースアタッカー。」',
    artColor: '#ef4444',
    artGradient: 'from-red-600 via-rose-700 to-stone-900',
    artSymbol: 'Sword',
    effects: []
  },

  // 13. しょーちゃん
  {
    id: 'atk_shochan',
    name: 'しょーちゃん',
    type: 'ATTACK',
    cost: 3,
    baseAtk: 600,
    baseHp: 500,
    tags: ['つだぬまず'],
    description: 'バランスの良いアタッカー。ムエ・おりちゃんと揃うと「つだぬまず」が発動。',
    flavorText: '「つだぬまずの頼れる中核。」',
    artColor: '#3b82f6',
    artGradient: 'from-blue-600 to-cyan-900',
    artSymbol: 'Zap',
    effects: []
  },

  // 14. おりちゃん
  {
    id: 'atk_orichan',
    name: 'おりちゃん',
    type: 'ATTACK',
    cost: 3,
    baseAtk: 500,
    baseHp: 700,
    tags: ['つだぬまず', '高耐久'],
    description: '高耐久アタッカー。ムエ・しょーちゃんと揃うと「つだぬまず」が発動。',
    flavorText: '「堅実な立ち回りで戦線を支える。」',
    artColor: '#10b981',
    artGradient: 'from-emerald-500 to-teal-900',
    artSymbol: 'Shield',
    effects: []
  },

  // 15. 顎
  {
    id: 'atk_ago',
    name: '顎',
    type: 'ATTACK',
    cost: 2,
    baseAtk: 400,
    baseHp: 100,
    tags: ['顎'],
    description: '鋭利な突起物。低コスト高火力。',
    flavorText: '「見事な鋭角を描く顎。」',
    artColor: '#f97316',
    artGradient: 'from-orange-500 to-stone-900',
    artSymbol: 'Crosshair',
    effects: []
  },

  // 16. りゅーのすけ
  {
    id: 'atk_ryunosuke',
    name: 'りゅーのすけ',
    type: 'ATTACK',
    cost: 1,
    baseAtk: 500,
    baseHp: 2,
    tags: ['紙装甲'],
    description: '攻撃力500・体力わずか2の超攻撃型カード。かすり傷でも倒れる。',
    flavorText: '「当たれば痛いが、触れられたら即終了！」',
    artColor: '#e11d48',
    artGradient: 'from-rose-500 to-red-950',
    artSymbol: 'Zap',
    effects: []
  },

  // 17. ヘッドフォンニキ
  {
    id: 'atk_headphone_niki',
    name: 'ヘッドフォンニキ',
    type: 'ATTACK',
    cost: 2,
    baseAtk: 300,
    baseHp: 300,
    tags: ['ニキ系', '進化前'],
    description: '「ヘッドフォンニキ」同士を重ね合わせることで「オンフードヘッドフォンニキ」へと進化する！',
    flavorText: '「お気に入りのヘッドフォンで音楽に没頭中。」',
    artColor: '#8b5cf6',
    artGradient: 'from-purple-500 to-indigo-950',
    artSymbol: 'Sparkles',
    effects: [],
    evolutionRule: {
      targetDefinitionId: 'evo_onhood_headphone_niki'
    }
  },

  // 18. オンフードヘッドフォンニキ (進化カード)
  {
    id: 'evo_onhood_headphone_niki',
    name: 'オンフードヘッドフォンニキ',
    type: 'ATTACK',
    cost: 4,
    baseAtk: 700,
    baseHp: 700,
    tags: ['ニキ系', '進化体'],
    description: 'ヘッドフォンニキにヘッドフォンニキを重ねて合体進化！フードの上からヘッドフォンを装着した究極形態。',
    flavorText: '「フードの上から装着することで更なる密閉感と力を手に入れた。」',
    artColor: '#c026d3',
    artGradient: 'from-fuchsia-600 to-purple-950',
    artSymbol: 'Crown',
    isEvolutionOnly: true,
    effects: []
  },

  // 19. 井上教授（壁） (環境カード「フェニックスホール」の特殊生成カード)
  {
    id: 'token_inoue_professor',
    name: '井上教授（壁）',
    type: 'ATTACK',
    cost: 1,
    baseAtk: 0,
    baseHp: 100,
    tags: ['特殊生成', '壁', '守護'],
    description: '【特殊生成・守護】フェニックスホールの効果で生成される壁。相手の攻撃を受け止める。',
    flavorText: '「立ちはだかる学術の壁。」',
    artColor: '#64748b',
    artGradient: 'from-slate-600 to-stone-900',
    artSymbol: 'Shield',
    isEvolutionOnly: true,
    effects: [
      {
        id: 'eff_inoue_wall',
        trigger: 'ON_PLAY',
        targetType: 'NONE',
        description: '【守護】壁として敵の攻撃を引き受ける',
        specialAction: 'TAUNT'
      }
    ]
  }
];
