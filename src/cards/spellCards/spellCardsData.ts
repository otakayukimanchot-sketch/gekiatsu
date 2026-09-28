import { CardDefinition } from '../types';

export const SPELL_CARDS: CardDefinition[] = [
  // 1. のぞきのそうくん
  {
    id: 'spl_nozoki_sokun',
    name: 'のぞきのそうくん',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 2,
    baseHp: 50,
    tags: ['魔法', '情報開示', 'そうくん系'],
    description: '【効果】相手の手札をすべて公開して確認する。（体力: 50）',
    flavorText: '「ちょっと見せて！何持ってるの！？」',
    artColor: '#38bdf8',
    artGradient: 'from-sky-500 to-indigo-800',
    artSymbol: 'Sparkles',
    effects: [
      {
        id: 'eff_nozoki',
        trigger: 'ON_PLAY',
        targetType: 'ENEMY_PLAYER',
        description: '相手の手持ちのカードを一度見ることができる。'
      }
    ]
  },

  // 2. 見えてます
  {
    id: 'spl_mietemasu',
    name: '見えてます',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 1,
    tags: ['魔法', '迎撃', '無効化'],
    description: '【効果】相手が「のぞきのそうくん」を使用したとき、その覗き見効果を完全に無効化して不発にする。相手を牽制する。',
    flavorText: '「全部見えてますから。」',
    artColor: '#6366f1',
    artGradient: 'from-indigo-500 to-purple-900',
    artSymbol: 'Lock',
    effects: [
      {
        id: 'eff_mietemasu',
        trigger: 'ON_PLAY',
        targetType: 'NONE',
        description: 'のぞきのそうくんを無効化する防御結界を展開'
      }
    ]
  },

  // 3. 蛍光マーカーのりゅーのすけ
  {
    id: 'spl_fluorescent_ryunosuke',
    name: '蛍光マーカーのりゅーのすけ',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 3,
    baseHp: 20,
    tags: ['魔法', '手札破壊', 'りゅーのすけ系'],
    description: '【効果】相手の目を蛍光マーカーで混乱させているうちに、相手の手札からランダムに1枚選び墓地へ捨てる！（体力: 20）',
    flavorText: '「蛍光マーカー眩しいだろー！その隙にポイッ！」',
    artColor: '#84cc16',
    artGradient: 'from-lime-400 to-emerald-800',
    artSymbol: 'Zap',
    effects: [
      {
        id: 'eff_marker_discard',
        trigger: 'ON_PLAY',
        targetType: 'ENEMY_PLAYER',
        description: '相手の手札からランダムに1枚捨てる'
      }
    ]
  },

  // 4. 待てないそうくん
  {
    id: 'spl_matenai_sokun',
    name: '待てないそうくん',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 4,
    baseHp: 1,
    tags: ['魔法', '追加行動', 'そうくん系'],
    description: '【効果】「届いたら先に食べるのは当たり前だよね！」自分のターンを続行し、場の全カードの攻撃権を復活させる！（体力: 1）',
    flavorText: '「届いたら先に食べるのは当たり前だよね！」',
    artColor: '#f97316',
    artGradient: 'from-amber-500 via-orange-600 to-red-800',
    artSymbol: 'Flame',
    effects: [
      {
        id: 'eff_matenai',
        trigger: 'ON_PLAY',
        targetType: 'FRIENDLY_PLAYER',
        description: '自分のターンを続行する'
      }
    ]
  },

  // 5. さびしがりやのゆきや
  {
    id: 'spl_sabishigariya_yukiya',
    name: 'さびしがりやのゆきや',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 2,
    baseHp: 20,
    tags: ['魔法', '追加召喚', 'ゆきや系'],
    description: '【効果】このターン、1枚追加で攻撃カードを召喚できる。（体力: 20）',
    flavorText: '「一人じゃ寂しいから、もう一人呼んでいい…？」',
    artColor: '#a855f7',
    artGradient: 'from-purple-400 to-indigo-900',
    artSymbol: 'Heart',
    effects: [
      {
        id: 'eff_sabishigariya',
        trigger: 'ON_PLAY',
        targetType: 'FRIENDLY_PLAYER',
        description: '1枚追加で召喚できる'
      }
    ]
  },

  // 6. ふともも
  {
    id: 'spl_futomomo',
    name: 'ふともも',
    type: 'SPELL',
    subType: 'EVOLUTION',
    cost: 2,
    baseHp: 10,
    tags: ['魔法', '進化トリガー', 'ふともも'],
    description: '【進化効果】自分の場に「吉田りゅうく」がいる場合、「リューク・スカイウォーカー」に進化させる！（体力: 10）',
    flavorText: '「魅惑のふとももが眠れるフォースを呼び覚ます。」',
    artColor: '#ec4899',
    artGradient: 'from-pink-400 to-rose-700',
    artSymbol: 'Heart',
    effects: []
  },

  // 7. 数珠カード
  {
    id: 'spl_juzu_card',
    name: '数珠カード',
    type: 'SPELL',
    subType: 'ATTACHMENT',
    cost: 2,
    tags: ['魔法', '付着', '進化トリガー', 'よしえ系'],
    description: '【効果】山札からカードを1枚引く。さらに「綺麗なよしえ」に付属させることで「塩よしえ」に進化できる！',
    flavorText: '「清めの数珠が秘められし塩気を引き出す。」',
    artColor: '#8b5cf6',
    artGradient: 'from-violet-500 to-purple-950',
    artSymbol: 'Sparkles',
    effects: [
      {
        id: 'eff_juzu_draw',
        trigger: 'ON_PLAY',
        targetType: 'FRIENDLY_PLAYER',
        description: '追加で1枚引く',
        drawCards: 1
      }
    ],
    attachmentRule: {
      allowedTarget: 'FRIENDLY_ATTACK',
      atkBonus: 0,
      hpBonus: 0
    }
  },

  // 8. 顎カード
  {
    id: 'spl_ago_card',
    name: '顎カード',
    type: 'SPELL',
    subType: 'ATTACHMENT',
    cost: 2,
    tags: ['魔法', '付着', '進化トリガー', '顎'],
    description: '【効果】「まゆサブレ」に付属させることで「顎・キャノン」に進化！まゆサブレ以外のカードに付属した場合は攻撃力＋300。',
    flavorText: '「鋭利なる顎の付属具。装着するだけで殺傷力アップ。」',
    artColor: '#ef4444',
    artGradient: 'from-orange-500 to-red-900',
    artSymbol: 'Crosshair',
    effects: [],
    attachmentRule: {
      allowedTarget: 'FRIENDLY_ATTACK',
      atkBonus: 300,
      hpBonus: 0
    }
  },

  // 9. ユキやカード
  {
    id: 'spl_yukiya_card',
    name: 'ユキやカード',
    type: 'SPELL',
    subType: 'ATTACHMENT',
    cost: 2,
    baseAtk: 100,
    baseHp: 50,
    tags: ['魔法', '付着', '進化トリガー', 'ゆきや系'],
    description: '【効果】付属したカードの攻撃力＋100、体力＋50。「普通に話すだけならいいよー（嘘）」嘉慧に付属させることで「よしえEX」に進化できる！',
    flavorText: '「ユキやの魔力が嘉慧を限界突破させる。」',
    artColor: '#06b6d4',
    artGradient: 'from-cyan-400 to-blue-900',
    artSymbol: 'Crown',
    effects: [],
    attachmentRule: {
      allowedTarget: 'FRIENDLY_ATTACK',
      atkBonus: 100,
      hpBonus: 50
    }
  },

  // 10. うんこかーど
  {
    id: 'spl_unko_card',
    name: 'うんこかーど',
    type: 'SPELL',
    subType: 'ATTACHMENT',
    cost: 2,
    tags: ['魔法', '付着', '進化トリガー'],
    description: '【効果】付属したカードの攻撃力＋50。「塩よしえ」に付属させることで「普通に話すだけならいいよー（嘘）」嘉慧に進化する！',
    flavorText: '「強烈な臭気と威力。攻撃力＋50。」',
    artColor: '#78350f',
    artGradient: 'from-amber-700 to-stone-900',
    artSymbol: 'Skull',
    effects: [],
    attachmentRule: {
      allowedTarget: 'FRIENDLY_ATTACK',
      atkBonus: 50,
      hpBonus: 0
    }
  },

  // 11. 三者面談
  {
    id: 'spl_sansha_mendan',
    name: '三者面談',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 2,
    tags: ['魔法', '保護', '無敵'],
    description: '【効果】1ターンの間、対象カード1体へのすべての攻撃・ダメージを無効化する。',
    flavorText: '「親と担任と本人の前では手を出せない。」',
    artColor: '#64748b',
    artGradient: 'from-slate-500 to-slate-900',
    artSymbol: 'Shield',
    effects: []
  },

  // 12. トレード
  {
    id: 'spl_trade',
    name: 'トレード',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 4,
    tags: ['魔法', 'コントロール奪取'],
    description: '【効果】相手の場のカード1体と、自分の場のカード1体を入れ替える！',
    flavorText: '「等価交換…？いや、こっちが得する交換だ！」',
    artColor: '#eab308',
    artGradient: 'from-amber-400 via-yellow-600 to-stone-900',
    artSymbol: 'Sparkles',
    effects: []
  },

  // 13. 絶対に許さない
  {
    id: 'spl_zettai_yurusanai',
    name: '絶対に許さない',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 3,
    tags: ['魔法', '逆転', '背水の陣'],
    description: '【効果】自分のHPが1000以下なら、自軍の全攻撃カードの攻撃力＋2000！',
    flavorText: '「ここまで追い詰められたからには…絶対に許さない！！」',
    artColor: '#dc2626',
    artGradient: 'from-red-600 via-rose-700 to-stone-950',
    artSymbol: 'Flame',
    effects: []
  },

  // 14. もう一枚だけ
  {
    id: 'spl_mou_ichimai_dake',
    name: 'もう一枚だけ',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 2,
    tags: ['魔法', 'ドロー', 'リスク'],
    description: '【効果】山札からカードを2枚引く。その代わり、次の自分のターンは通常ドローができない。',
    flavorText: '「もう一枚だけ…これが最後だから…！」',
    artColor: '#0284c7',
    artGradient: 'from-sky-500 to-blue-900',
    artSymbol: 'BookOpen',
    effects: []
  },

  // 15. 何してんの？
  {
    id: 'spl_nani_shitenno',
    name: '何してんの？',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 2,
    tags: ['魔法', '攻撃妨害', '無効化'],
    description: '【効果】冷静なツッコミで、相手の次の攻撃を1回だけ無効化する。',
    flavorText: '「……何してんの？」',
    artColor: '#475569',
    artGradient: 'from-slate-600 to-zinc-900',
    artSymbol: 'HelpCircle',
    effects: []
  },

  // 16. 知らんけど
  {
    id: 'spl_shirankedo',
    name: '知らんけど',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 2,
    tags: ['魔法', 'ギャンブル', 'ランダム'],
    description: '【効果】サーバー側ランダム判定！【表】自軍カードの攻撃力＋1000！【裏】自軍カードの攻撃力−500（知らんけど）。',
    flavorText: '「これ使ったら勝てるって！……知らんけど。」',
    artColor: '#d946ef',
    artGradient: 'from-fuchsia-500 via-pink-600 to-purple-900',
    artSymbol: 'Sparkles',
    effects: []
  },

  // 17. とりあえず落ち着こう
  {
    id: 'spl_ochitsukou',
    name: 'とりあえず落ち着こう',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 3,
    tags: ['魔法', '全体無力化'],
    description: '【効果】場に存在するすべての攻撃カードの攻撃力を一時的に0にする。',
    flavorText: '「まあまあ、熱くならずに一旦落ち着こうよ。」',
    artColor: '#14b8a6',
    artGradient: 'from-teal-400 to-cyan-900',
    artSymbol: 'Heart',
    effects: []
  },

  // 18. そっくりさん
  {
    id: 'spl_sokkurisan',
    name: 'そっくりさん',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 3,
    tags: ['魔法', 'ステータスコピー'],
    description: '【効果】場にいる相手カード1体を対象にする。対象カードの【攻撃力】と【体力】を自分の場の対象カードにそのままコピーする！（効果はコピーしない）',
    flavorText: '「瓜二つのステータス。見分けがつかない。」',
    artColor: '#8b5cf6',
    artGradient: 'from-violet-500 to-indigo-950',
    artSymbol: 'Sparkles',
    effects: []
  },

  // 19. 安松
  {
    id: 'spl_yasumatsu',
    name: '安松',
    type: 'SPELL',
    subType: 'NORMAL',
    cost: 5,
    tags: ['魔法', '超強化', '一回限定', 'つだぬまず'],
    description: '【効果】一回だけ、「しょーちゃん」「ムエ」「おりちゃん」の攻撃力をそれぞれ＋10000する！使用後、このカードは消滅（除外）する。',
    flavorText: '「安松の魂の叫びが3人に天文学的パワーを授ける！！」',
    artColor: '#fbbf24',
    artGradient: 'from-amber-300 via-yellow-500 to-orange-700',
    artSymbol: 'Crown',
    effects: []
  }
];
