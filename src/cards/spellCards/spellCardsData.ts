import { CardDefinition, RawCardSeed } from '../types';
import { buildCardDefinition } from '../levelSystem';

/**
 * 魔法（サポート）カード定義一覧 (Lv.1統一)
 *
 * 【記載順序】
 * 1. ドロー・サーチ系: 数珠カード / モリシア（今は亡きショッピングセンター） / 秋葉原 / 受験パルキアニキ / trio（秋葉原のアイドルグッズ専門店） / ブラックコーヒー / バニラ / ポーカー
 * 2. エネルギー加速系: ふともも / モンスターエナジー / ZONE / アル中カラカラ / 松岡修造 / 酒
 * 3. 火力強化系: 顎カード / 泰松 / 浅草寺 / FCバルセロナ / 21歳 拳で / ﾄﾞｩﾜｧ!!ｾﾝﾅﾅﾋｬｸ!! / 10人ニキ / バキ童 / 千葉ロッテマリーンズ
 * 4. 防御・回復・展開・機動力系: 三者面談 / グローバルラウンジ / イタリアン♡ / カラオケ / フェニックスホール（講堂） / 隅田川 / マック / 自己防衛おじさん / 離れるそうくん / ポカリ / あげパン / ロングバターデニッシュ / 浅草寺の芝生
 * 5. 直接ダメージ・妨害・入れ替え系: うんこかーど / トレード / インフル / 朝のラッシュ / おでんツンツン男
 */
const SPELL_CARD_SEEDS: RawCardSeed[] = [
  // ============================================================================
  // 1. ドロー・サーチ系魔法カード
  // ============================================================================
  {
    id: 'spl_juzu_card',
    name: '数珠カード',
    type: 'SPELL',
    evolution: {
      family: 'よしえ系列サポート',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
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
    id: 'spl_morisia',
    name: 'モリシア（今は亡きショッピングセンター）',
    type: 'SPELL',
    evolution: {
      family: 'ドロー魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '思い出の掘り出し物',
      activeEffect: '山札からカードを1枚引く（手札が3枚以下なら2枚引く）',
      description:
        '【魔法】思い出のショッピングセンターを散策！山札からカードを1枚引く（手札が3枚以下なら2枚引く）。',
      spellEffect: 'DRAW_2_IF_LOW_HAND',
    },
    ui: {
      tags: ['魔法', 'ドロー', '津田沼'],
      flavorText: '「在りし日のモリシアの記憶が、手札に新たな輝きをもたらす。」',
      artSymbol: 'Sparkles',
    },
  },
  {
    id: 'spl_akihabara',
    name: '秋葉原',
    type: 'SPELL',
    evolution: {
      family: 'サーチ魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '電気街パーツ調達',
      activeEffect: '山札から攻撃カード1枚を探して手札に加える',
      description: '【魔法】電気街で戦力調達！山札から攻撃カード1枚を手札に加える。',
      spellEffect: 'SEARCH_ATTACK_CARD',
    },
    ui: {
      tags: ['魔法', 'サーチ', '秋葉原'],
      flavorText: '「探しているカードなら秋葉原で必ず見つかる！」',
      artSymbol: 'Zap',
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
      evolvesFrom: null,
      evolvesTo: null,
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
    id: 'spl_monster_energy',
    name: 'モンスターエナジー',
    type: 'SPELL',
    evolution: {
      family: 'エナジー魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '魔剤ブースト',
      activeEffect: '自分のバトル場のカードにボーナスエネルギーを＋1個付与する',
      description: '【魔法】カフェイン注入！自分のバトル場のカードにボーナスエネルギーを＋1個付与する。',
      spellEffect: 'BONUS_ENERGY_ACTIVE',
    },
    ui: {
      tags: ['魔法', 'エネルギー加速', 'エナドリ'],
      flavorText: '「プシュッ！徹夜明けでも一気にフルパワー稼働！」',
      artSymbol: 'Zap',
    },
  },
  {
    id: 'spl_zone',
    name: 'ZONE',
    type: 'SPELL',
    evolution: {
      family: 'エナジー魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '超没入チャージ',
      activeEffect: '自分のベンチ（いなければバトル場）のカードにボーナスエネルギー＋1個',
      description:
        '【魔法】極限の集中状態へ突入！自分のベンチ（ベンチがいなければバトル場）のカードにボーナスエネルギーを＋1個付与する。',
      spellEffect: 'BONUS_ENERGY_BENCH',
    },
    ui: {
      tags: ['魔法', 'エネルギー加速', 'ZONE'],
      flavorText: '「アンリミテッドな没入感。控えのエースが瞬く間に覚醒する。」',
      artSymbol: 'Zap',
    },
  },

  // ============================================================================
  // 3. 火力強化系魔法カード
  // ============================================================================
  {
    id: 'spl_ago_card',
    name: '顎カード',
    type: 'SPELL',
    evolution: {
      family: 'サブレ・キャノン系列サポート',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
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
    name: '泰松',
    type: 'SPELL',
    evolution: {
      family: 'つだぬまず系列サポート',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '泰松のエール',
      activeEffect: 'このターン、自分のバトル場のカードの攻撃ダメージ＋10',
      description: '【魔法】このターン、自分のバトル場のカードが使う攻撃のダメージを＋10する！',
      spellEffect: 'BUFF_ATK_10',
    },
    ui: {
      tags: ['魔法', '火力強化', '泰松', 'つだぬまず'],
      flavorText: '「泰松の応援が仲間の攻撃力を＋10底上げする！」',
      artSymbol: 'Crown',
    },
  },
  {
    id: 'spl_sensoji',
    name: '浅草寺',
    type: 'SPELL',
    evolution: {
      family: 'つだぬまず系列サポート',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '雷門の加護',
      activeEffect: 'このターン、自分のバトル場のカードの攻撃ダメージ＋20',
      description: '【魔法】雷門の霊験あらたかな加護！このターン、自分のバトル場の攻撃ダメージを＋20する。',
      spellEffect: 'BUFF_ATK_20',
    },
    ui: {
      tags: ['魔法', '火力強化', '浅草寺'],
      flavorText: '「雷門をくぐりし者に浅草の加護が宿る。」',
      artSymbol: 'Sparkles',
    },
  },
  {
    id: 'spl_fc_barcelona',
    name: 'FCバルセロナ',
    type: 'SPELL',
    evolution: {
      family: '強化魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: 'ティキ・タカ総攻撃',
      activeEffect: 'このターン、自分のバトル場のカードの攻撃ダメージ＋30',
      description: '【魔法】華麗なるパス回しから決定機を演出！このターン、自分のバトル場の攻撃ダメージを＋30する！',
      spellEffect: 'BUFF_ATK_30',
    },
    ui: {
      tags: ['魔法', '超強化', 'サッカー'],
      flavorText: '「ブラウグラナの誇り！圧倒的攻撃サッカーでゴールをこじ開ける！」',
      artSymbol: 'Flame',
    },
  },

  // ============================================================================
  // 4. 防御・回復・展開系魔法カード
  // ============================================================================
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
  {
    id: 'spl_global_lounge',
    name: 'グローバルラウンジ',
    type: 'SPELL',
    evolution: {
      family: '回復魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: 'コーヒー全快ブレイク',
      activeEffect: '自分の場（バトル場・ベンチ）の傷ついたすべてのカードのHPを全回復する',
      description: '【魔法】コーヒーを飲んでリフレッシュ！自分の場に出ているすべてのカードのHPを全回復する。',
      spellEffect: 'FULL_HEAL_ALL',
    },
    ui: {
      tags: ['魔法', '全回復', 'グロラン'],
      flavorText: '「香り高いコーヒーで一息。傷ついた仲間たちの体力が一気に全快する。」',
      artSymbol: 'Heart',
    },
  },
  {
    id: 'spl_italian_heart',
    name: 'イタリアン♡',
    type: 'SPELL',
    evolution: {
      family: '回復魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '絶品コースディナー',
      activeEffect: '自分のバトル場のHPを30回復し、このターンの攻撃ダメージ＋10',
      description: '【魔法】美味しいイタリアンで活力充填！自分のバトル場のHPを30回復し、このターンの攻撃ダメージ＋10。',
      spellEffect: 'HEAL_30_BUFF_10',
    },
    ui: {
      tags: ['魔法', '回復', 'イタリアン'],
      flavorText: '「焼きたてピッツァとパスタで心も身体も満たされる♡」',
      artSymbol: 'Heart',
    },
  },
  {
    id: 'spl_karaoke',
    name: 'カラオケ',
    type: 'SPELL',
    evolution: {
      family: '回復魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: 'オールナイト熱唱',
      activeEffect: '自分の場（バトル場・ベンチ）のすべてのカードのHPを25回復する',
      description: '【魔法】みんなで熱唱してテンションアップ！自分の場すべてのカードのHPを25回復する。',
      spellEffect: 'HEAL_ALL_25',
    },
    ui: {
      tags: ['魔法', '全体回復', 'カラオケ'],
      flavorText: '「マイクを握れば疲れなんて吹き飛ぶ！」',
      artSymbol: 'Sparkles',
    },
  },
  {
    id: 'spl_phoenix_hall',
    name: 'フェニックスホール（講堂）',
    type: 'SPELL',
    evolution: {
      family: 'フェニックスホール系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: 'フェニックスの守り',
      activeEffect: '手札に「井上教授」(Lv.1) を1枚加え、次の相手ターンの被ダメージ−20',
      description:
        '【魔法】自分の手札に「井上教授」（Lv.1）を1枚生成し、さらに次の相手ターンに自分のバトル場が受けるダメージを−20する。',
      spellEffect: 'PHOENIX_WALL_TOKEN',
    },
    ui: {
      tags: ['魔法', '壁生成', '軽減'],
      flavorText: '「講堂に響く足音。そのたびに井上教授が立ちはだかる。」',
      artSymbol: 'Shield',
    },
  },
  {
    id: 'spl_sumidagawa',
    name: '隅田川',
    type: 'SPELL',
    evolution: {
      family: '回復魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '隅田川の涼風',
      activeEffect: '自分のバトル場のHPを20回復し、次の相手ターンの被ダメージ−20',
      description: '【魔法】川辺の涼風でリフレッシュ！自分のバトル場のHPを20回復し、次の相手ターンの被ダメージを−20する。',
      spellEffect: 'HEAL_20_SHIELD_20',
    },
    ui: {
      tags: ['魔法', '回復', '軽減', '隅田川'],
      flavorText: '「雄大なる隅田川の流れが戦場を潤す。」',
      artSymbol: 'Trees',
    },
  },
  {
    id: 'spl_mcdonalds',
    name: 'マック',
    type: 'SPELL',
    evolution: {
      family: '回復魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: 'ポテトLサイズセット',
      activeEffect: '自分のバトル場のHPを30回復し、このターンの攻撃ダメージ＋10',
      description: '【魔法】マックの揚げたてポテトでエネルギー補給！自分のバトル場のHPを30回復し、このターンの攻撃ダメージ＋10。',
      spellEffect: 'HEAL_30_BUFF_10',
    },
    ui: {
      tags: ['魔法', '回復', 'マック'],
      flavorText: '「ティロリ♪ティロリ♪ 揚げたての誘惑には誰も勝てない。」',
      artSymbol: 'Heart',
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
      evolvesFrom: null,
      evolvesTo: null,
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
  {
    id: 'spl_influenza',
    name: 'インフル',
    type: 'SPELL',
    evolution: {
      family: '直接ダメージ魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '猛威の学級閉鎖',
      activeEffect: '相手の場（バトル場・ベンチ）のすべてのカードに15ダメージを与える',
      description: '【魔法】急激な発熱が相手陣営を襲う！相手のバトル場とベンチすべてのカードに15ダメージを与える。',
      spellEffect: 'BENCH_STORM_15_ALL',
    },
    ui: {
      tags: ['魔法', '全体ダメージ', 'インフル'],
      flavorText: '「高熱により相手ベンチまでまとめてダウン！」',
      artSymbol: 'Skull',
    },
  },
  {
    id: 'spl_morning_rush',
    name: '朝のラッシュ',
    type: 'SPELL',
    evolution: {
      family: '入れ替え魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '満員電車押し出し',
      activeEffect: '相手のバトル場のカードをベンチカードとランダムに入れ替える',
      description:
        '【魔法】すし詰めの乗車率200%！相手のバトル場のカードをベンチと強制的に入れ替える（控えがいなければ1枚引く）。',
      spellEffect: 'SWAP_OPPONENT_BENCH',
    },
    ui: {
      tags: ['魔法', '入れ替え', 'ラッシュ'],
      flavorText: '「押さないでくださーい！そのままベンチへ押し流される！」',
      artSymbol: 'Wind',
    },
  },

  // ============================================================================
  // 6. 新規追加魔法カード（ネットミーム・レジェンド系）
  // ============================================================================
  {
    id: 'spl_21sai_kobushide',
    name: '21歳 拳で',
    type: 'SPELL',
    evolution: {
      family: '強化魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '拳で抵抗',
      activeEffect: 'このターン、自分のバトル場のカードの攻撃ダメージ＋30',
      description:
        '【魔法】「何歳ですか？」「21歳！」「どうやって抵抗する？」「拳で！」このターン、自分のバトル場の攻撃ダメージを＋30する！',
      spellEffect: 'BUFF_ATK_30',
    },
    ui: {
      tags: ['魔法', '超強化', '拳で'],
      flavorText: '「21歳！拳でッ！！」',
      artSymbol: 'Sword',
    },
  },
  {
    id: 'spl_jikoboei_ojisan',
    name: '自己防衛おじさん',
    type: 'SPELL',
    evolution: {
      family: '防御魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '究極の自己防衛',
      activeEffect: '次の相手ターン、自分のバトル場の被ダメージ−30',
      description:
        '【魔法】「誰も頼れないからこそ自己防衛！」次の相手のターン、自分のバトル場のカードが受けるダメージを−30する。',
      spellEffect: 'SHIELD_30',
    },
    ui: {
      tags: ['魔法', '防御', '自己防衛'],
      flavorText: '「国なんかあてにしちゃダメ。やっぱり自己防衛ですよ。」',
      artSymbol: 'Shield',
    },
  },
  {
    id: 'spl_aruchu_karakara',
    name: 'アル中カラカラ',
    type: 'SPELL',
    evolution: {
      family: 'エナジー魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: 'ハイボール濃いめチャージ（できた！）',
      activeEffect: '自分のバトル場のカードにボーナスエネルギーを＋1個付与する',
      description:
        '【魔法】氷をカラカラ鳴らしてウイスキーをドバドバ注入！自分のバトル場のカードにボーナスエネルギーを＋1個付与する。',
      spellEffect: 'BONUS_ENERGY_ACTIVE',
    },
    ui: {
      tags: ['魔法', 'エネルギー加速', 'カラカラ'],
      flavorText: '「氷入れて〜、ハイボール濃いめ……できた！（ゴクゴク）」',
      artSymbol: 'Zap',
    },
  },
  {
    id: 'spl_duwaa_1700',
    name: 'ﾄﾞｩﾜｧ!!ｾﾝﾅﾅﾋｬｸ!!',
    type: 'SPELL',
    evolution: {
      family: '強化魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '驚愕の1700オーバーブースト',
      activeEffect: 'このターン、自分のバトル場のカードの攻撃ダメージ＋30',
      description:
        '【魔法】桁違いの数値にテンション爆発！このターン、自分のバトル場のカードの攻撃ダメージを＋30する！',
      spellEffect: 'BUFF_ATK_30',
    },
    ui: {
      tags: ['魔法', '超強化', '1700'],
      flavorText: '「ﾄﾞｩﾜｧ!! ｾﾝﾅﾅﾋｬｸ!!」',
      artSymbol: 'Flame',
    },
  },
  {
    id: 'spl_oden_tsuntsun',
    name: 'おでんツンツン男',
    type: 'SPELL',
    evolution: {
      family: '妨害魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '熱々ちくわぶツンツン',
      activeEffect: '相手のバトル場に10ダメージ＆エネルギー1個トラッシュ',
      description:
        '【魔法】相手のバトル場のカードをツンツンして10ダメージを与え、さらに相手のバトル場のエネルギーを1個トラッシュする。',
      spellEffect: 'DRAIN_ENERGY_DMG_10',
    },
    ui: {
      tags: ['魔法', '妨害', 'エネ破壊'],
      flavorText: '「ツンツン！相手の戦意とエネルギーを削ぎ落とす迷惑攻撃！」',
      artSymbol: 'Crosshair',
    },
  },
  {
    id: 'spl_bakibaki_dotei',
    name: 'バキ童',
    type: 'SPELL',
    evolution: {
      family: '強化魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: 'バキバキフルパワー覚醒',
      activeEffect: 'このターン、自分のバトル場のカードの攻撃ダメージ＋50',
      description:
        '【魔法】バッキバキの眼光で限界突破！このターン、自分のバトル場のカードが使う攻撃のダメージを＋50する！！',
      spellEffect: 'BUFF_ATK_50',
    },
    ui: {
      tags: ['魔法', '超絶強化', 'バキ童'],
      flavorText: '「はい、そうですね。攻撃力＋50のバキ童と呼ばれています。」',
      artSymbol: 'Flame',
    },
  },
  {
    id: 'spl_juken_palkia_niki',
    name: '受験パルキアニキ',
    type: 'SPELL',
    evolution: {
      family: 'ドロー魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: 'あくうせつだん受験突破',
      activeEffect: '山札からカードを1枚引く（手札が3枚以下なら2枚引く）',
      description:
        '【魔法】空間を切り裂く勢いで難関突破！山札からカードを1枚引く（手札が3枚以下なら2枚引く）。',
      spellEffect: 'DRAW_2_IF_LOW_HAND',
    },
    ui: {
      tags: ['魔法', 'ドロー', '受験'],
      flavorText: '「受験会場に響き渡る渾身のパルキア咆哮！！」',
      artSymbol: 'BookOpen',
    },
  },
  {
    id: 'spl_10nin_niki',
    name: '10人ニキ',
    type: 'SPELL',
    evolution: {
      family: '強化魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '1対10伝説のハッタリ',
      activeEffect: 'このターン、自分のバトル場のカードの攻撃ダメージ＋20',
      description:
        '【魔法】「10人同時に相手した」伝説の威圧感！このターン、自分のバトル場の攻撃ダメージを＋20する。',
      spellEffect: 'BUFF_ATK_20',
    },
    ui: {
      tags: ['魔法', '火力強化', '10人ニキ'],
      flavorText: '「10人相手でも余裕っすよ！（自己申告）」',
      artSymbol: 'Sword',
    },
  },
  {
    id: 'spl_matsuoka_shuzo',
    name: '松岡修造',
    type: 'SPELL',
    evolution: {
      family: '熱血魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: 'あきらめんなよ！熱血太陽エール',
      activeEffect: '自分のバトル場のHPを30回復し、このターンの攻撃ダメージ＋10',
      description:
        '【魔法】「どうしてそこでやめるんだ、そこで！！もっと熱くなれよ！！」自分のバトル場のHPを30回復し、このターンの攻撃ダメージを＋10する！',
      spellEffect: 'HEAL_30_BUFF_10',
    },
    ui: {
      tags: ['魔法', '熱血回復', '強化'],
      flavorText: '「君ならできる！今日から君は富士山だ！！」',
      artSymbol: 'Flame',
    },
  },
  {
    id: 'spl_hanareru_sokun',
    name: '離れるそうくん',
    type: 'SPELL',
    evolution: {
      family: 'そうくん系列サポート',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: 'サッと距離をとる',
      activeEffect: '自分の場のカードの「にげる」に必要なエネルギーコストを0にする',
      description:
        '【魔法】「じゃあ俺ちょっと離れるね！」自分の場（バトル場・ベンチ）のカードの「にげる」コストを0にする（エネルギー消費なしでベンチと交代できる）。',
      spellEffect: 'FREE_RETREAT_THIS_TURN',
    },
    ui: {
      tags: ['魔法', '逃げるコスト0', 'そうくん系'],
      flavorText: '「察しが良すぎるそうくん、気配を消してスーッと距離を置く。」',
      artSymbol: 'Wind',
    },
  },
  {
    id: 'spl_trio_akihabara',
    name: 'trio（秋葉原のアイドルグッズ専門店）',
    type: 'SPELL',
    evolution: {
      family: 'サーチ魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '推しグッズ発掘サーチ',
      activeEffect: '山札から攻撃カード1枚を手札に加え、バトル場の攻撃ダメージ＋10',
      description:
        '【魔法】秋葉原の聖地trioでお宝グッズを発掘！山札から攻撃カード1枚を手札に加え、さらにこのターン自分のバトル場の攻撃ダメージを＋10する。',
      spellEffect: 'SEARCH_ATTACK_CARD',
    },
    ui: {
      tags: ['魔法', 'サーチ', '秋葉原', 'アイドル'],
      flavorText: '「レアな生写真もチェキも掘り出し物もtrioなら全部揃う！」',
      artSymbol: 'Sparkles',
    },
  },
  {
    id: 'spl_black_coffee',
    name: 'ブラックコーヒー',
    type: 'SPELL',
    evolution: {
      family: 'ドロー魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '眠気覚ましの苦味',
      activeEffect: '山札からカードを1枚引き、自分のバトル場の攻撃ダメージ＋10',
      description:
        '【魔法】キリッとした苦味で頭が冴え渡る！山札からカードを1枚引き、このターン自分のバトル場の攻撃ダメージを＋10する。',
      spellEffect: 'DRAW_1',
    },
    ui: {
      tags: ['魔法', 'ドロー', 'カフェイン'],
      flavorText: '「砂糖もミルクもいらない。この苦味が勝負勘を研ぎ澄ます。」',
      artSymbol: 'Sparkles',
    },
  },
  {
    id: 'spl_sake',
    name: '酒',
    type: 'SPELL',
    evolution: {
      family: 'エナジー魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '酔拳テンション全開',
      activeEffect: '自分のバトル場のカードにボーナスエネルギー＋1個＆このターンの攻撃ダメージ＋20',
      description:
        '【魔法】一杯引っ掛けてリミッター解除！自分のバトル場のカードにボーナスエネルギーを＋1個付与し、さらにこのターンの攻撃ダメージを＋20する！',
      spellEffect: 'BONUS_ENERGY_ACTIVE',
    },
    ui: {
      tags: ['魔法', 'エネルギー加速', '火力強化', '酒'],
      flavorText: '「酒は百薬の長！テンション最高潮で拳が唸る！」',
      artSymbol: 'Flame',
    },
  },
  {
    id: 'spl_pocari',
    name: 'ポカリ',
    type: 'SPELL',
    evolution: {
      family: '回復魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '急速イオン水分補給',
      activeEffect: '自分の場（バトル場・ベンチ）のすべてのカードのHPを25回復する',
      description:
        '【魔法】乾いた身体に染み渡るイオンサプライ！自分の場とベンチのすべてのカードのHPを25回復する。',
      spellEffect: 'HEAL_ALL_25',
    },
    ui: {
      tags: ['魔法', '全体回復', '水分補給'],
      flavorText: '「乾いた戦場に潤いを。飲む点滴で仲間全員が蘇る！」',
      artSymbol: 'Heart',
    },
  },
  {
    id: 'spl_vanilla',
    name: 'バニラ',
    type: 'SPELL',
    evolution: {
      family: 'そうくん系列サポート',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '高収入求人テーマソング',
      activeEffect: '山札からカードを1枚引く（手札が3枚以下なら2枚引く）',
      description:
        '【魔法】街中に響き渡るおなじみのメロディ！山札からカードを1枚引く（手札が3枚以下なら2枚引く）。',
      spellEffect: 'DRAW_2_IF_LOW_HAND',
    },
    ui: {
      tags: ['魔法', 'ドロー', 'バニラ'],
      flavorText: '「バーニラ、バニラ、バーニラ♪ 耳から離れない中毒性で手札を補充！」',
      artSymbol: 'Sparkles',
    },
  },
  {
    id: 'spl_chiba_lotte',
    name: '千葉ロッテマリーンズ',
    type: 'SPELL',
    evolution: {
      family: '強化魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '幕張の熱狂応援歌',
      activeEffect: 'このターン、自分のバトル場のカードの攻撃ダメージ＋30',
      description:
        '【魔法】ZOZOマリンに轟く圧倒的応援のボルテージ！このターン、自分のバトル場のカードが使う攻撃のダメージを＋30する！',
      spellEffect: 'BUFF_ATK_30',
    },
    ui: {
      tags: ['魔法', '超強化', 'ロッテ', '野球'],
      flavorText: '「俺たちの誇り！熱狂の応援が選手に限界突破の力を宿す！」',
      artSymbol: 'Flame',
    },
  },
  {
    id: 'spl_agepan',
    name: 'あげパン',
    type: 'SPELL',
    evolution: {
      family: '回復魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '給食の王様チャージ',
      activeEffect: '自分のバトル場のHPを30回復し、このターンの攻撃ダメージ＋10',
      description:
        '【魔法】きなこと砂糖がたっぷりまぶされた人気メニュー！自分のバトル場のHPを30回復し、このターンの攻撃ダメージを＋10する。',
      spellEffect: 'HEAL_30_BUFF_10',
    },
    ui: {
      tags: ['魔法', '回復', 'パン', '強化'],
      flavorText: '「あげパンの日はテンション最高潮！甘くて香ばしい至福の味！」',
      artSymbol: 'Heart',
    },
  },
  {
    id: 'spl_long_butter_danish',
    name: 'ロングバターデニッシュ',
    type: 'SPELL',
    evolution: {
      family: '回復魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '超ロング糖分補給',
      activeEffect: '自分の場（バトル場・ベンチ）のすべてのカードのHPを25回復する',
      description:
        '【魔法】ボリューム満点のロングバターデニッシュをみんなでシェア！自分の場（バトル場・ベンチ）すべてのカードのHPを25回復する。',
      spellEffect: 'HEAL_ALL_25',
    },
    ui: {
      tags: ['魔法', '全体回復', 'デニッシュ', 'パン'],
      flavorText: '「長〜いデニッシュで腹持ち抜群！ベンチの仲間まで元気いっぱい！」',
      artSymbol: 'Heart',
    },
  },
  {
    id: 'spl_sensoji_lawn',
    name: '浅草寺の芝生',
    type: 'SPELL',
    evolution: {
      family: '回復魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: '芝生でごろ寝リラックス',
      activeEffect: '自分のバトル場のHPを20回復し、次の相手ターンの被ダメージ−20',
      description:
        '【魔法】浅草寺の芝生でゆったりくつろぐ！自分のバトル場のカードのHPを20回復し、さらに次の相手ターンに受けるダメージを−20する。',
      spellEffect: 'HEAL_20_SHIELD_20',
    },
    ui: {
      tags: ['魔法', '回復', '軽減', '浅草寺'],
      flavorText: '「芝生の上で一休み。心地よい風がダメージを和らげる。」',
      artSymbol: 'Trees',
    },
  },
  {
    id: 'spl_poker',
    name: 'ポーカー',
    type: 'SPELL',
    evolution: {
      family: 'ドロー魔法',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: 'オールイン・ドロー',
      activeEffect: '山札からカードを1枚引く（手札が3枚以下なら2枚引く）',
      description:
        '【魔法】勝負師のポーカーフェイスで手札を引き込む！山札からカードを1枚引く（自分の手札が3枚以下なら2枚引く）。',
      spellEffect: 'DRAW_2_IF_LOW_HAND',
    },
    ui: {
      tags: ['魔法', 'ドロー', 'ポーカー'],
      flavorText: '「ロイヤルストレートフラッシュを狙え！運命のドローに全てを賭ける！」',
      artSymbol: 'Sparkles',
    },
  },
];

export const SPELL_CARDS: CardDefinition[] = SPELL_CARD_SEEDS.map(buildCardDefinition);
