import { CardDefinition } from '../types';

export const ENVIRONMENT_CARDS: CardDefinition[] = [
  // 1. フェニックスホール
  {
    id: 'env_phoenix_hall',
    name: 'フェニックスホール',
    type: 'ENVIRONMENT',
    cost: 3,
    tags: ['環境', '壁生成', '井上教授'],
    description: '【環境効果】攻撃カードが1体場に出現するたびに、空きスロットへ「井上教授（壁）」（体力: 100）を1体生成する！',
    flavorText: '「フェニックスホールに響く足音。そのたびに井上教授が立ちはだかる。」',
    artColor: '#ef4444',
    artGradient: 'from-amber-600 via-red-600 to-stone-900',
    artSymbol: 'Shield',
    effects: []
  },

  // 2. 浅草寺
  {
    id: 'env_sensoji',
    name: '浅草寺',
    type: 'ENVIRONMENT',
    cost: 3,
    tags: ['環境', 'つだぬまず強化', '浅草寺'],
    description: '【環境効果】以下の3体の攻撃力を＋1000する！【対象】「ムエ」「しょーちゃん」「おりちゃん」',
    flavorText: '「雷門をくぐりし3人に浅草の霊験あらたかな加護が宿る。」',
    artColor: '#dc2626',
    artGradient: 'from-red-600 via-rose-700 to-amber-950',
    artSymbol: 'Sparkles',
    effects: []
  },

  // 3. 隅田川
  {
    id: 'env_sumidagawa',
    name: '隅田川',
    type: 'ENVIRONMENT',
    cost: 3,
    tags: ['環境', 'つだぬまず強化', '隅田川'],
    description: '【環境効果】以下の3体の攻撃力＋500：「ムエ」「しょーちゃん」「おりちゃん」。ただし、「ゆきや系カード」が場に出た瞬間、この環境効果は即座に終了（破壊）する。',
    flavorText: '「雄大なる隅田川の流れ。だがゆきやが来ると水流が途絶える。」',
    artColor: '#0284c7',
    artGradient: 'from-sky-500 via-blue-600 to-indigo-950',
    artSymbol: 'Trees',
    effects: []
  },

  // 4. ゆきやの部屋
  {
    id: 'env_yukiya_room',
    name: 'ゆきやの部屋',
    type: 'ENVIRONMENT',
    cost: 3,
    tags: ['環境', 'ゆきや系強化', 'デバフ'],
    description: '【環境効果】ゆきや系カードの攻撃力＋500！さらに「ムエ」「しょーちゃん」「おりちゃん」の攻撃力−200。',
    flavorText: '「ゆきやのプライベート空間。アウェイの3人は居心地の悪さで弱体化する。」',
    artColor: '#8b5cf6',
    artGradient: 'from-purple-600 via-indigo-700 to-slate-950',
    artSymbol: 'Heart',
    effects: []
  },

  // 5. 炎上する教室
  {
    id: 'env_burning_classroom',
    name: '炎上する教室',
    type: 'ENVIRONMENT',
    cost: 3,
    tags: ['環境', '炎上', '魔法ペナルティ'],
    description: '【環境効果】すべての攻撃カードの攻撃力＋300！さらに、誰かが魔法カードを使用するたび、場にいる全カードに50ダメージ！',
    flavorText: '「激論と炎が渦巻く教室。呪文の火の粉が全員を焦がす。」',
    artColor: '#ea580c',
    artGradient: 'from-orange-600 via-red-700 to-stone-900',
    artSymbol: 'Flame',
    effects: []
  },

  // 6. 誰もいない体育館
  {
    id: 'env_empty_gym',
    name: '誰もいない体育館',
    type: 'ENVIRONMENT',
    cost: 3,
    tags: ['環境', '孤高', '1体特化'],
    description: '【環境効果】戦場全体にカードが1体しか存在しない場合、その孤高のカードの攻撃力＋1000！',
    flavorText: '「静まり返った体育館。独り佇む者にスポットライトが注がれる。」',
    artColor: '#475569',
    artGradient: 'from-slate-600 via-zinc-700 to-slate-950',
    artSymbol: 'Crown',
    effects: []
  }
];
