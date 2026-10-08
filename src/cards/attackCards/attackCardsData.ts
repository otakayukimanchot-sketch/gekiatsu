import { CardDefinition, RawCardSeed } from '../types';
import { buildCardDefinition } from '../levelSystem';

/**
 * 攻撃カード定義一覧 (全50種)
 *
 * 【収録系列一覧】
 * 1. よしえ進化系列: 綺麗なよしえ (Lv.2) → 塩よしえ (Lv.3) → 「普通に話すだけならいいよー（嘘）」嘉慧 (Lv.4) → よしえEX (Lv.5)
 * 2. りゅうく進化系列: 吉田りゅうく (Lv.3) → リューク・スカイウォーカー (Lv.5)
 * 3. サブレ・キャノン系列: まゆサブレ (Lv.3) → 顎・キャノン (Lv.4) / キャノンの殴り (Lv.2) / ボイメキャノン (Lv.3)
 * 4. ヘッドフォンニキ系列: ヘッドフォンニキ (Lv.2) → オンフードヘッドフォンニキ (Lv.4) / 赤ヘッドフォン (Lv.2)
 * 5. ゆきや進化系列＆派生: ゆきや (Lv.2) → 裏切りのゆきや (Lv.4) → ゆきやEX (Lv.5) / さみしいゆきや (Lv.1) / 返金のゆきや (Lv.2) / おどるゆきや (Lv.3)
 * 6. 博子進化系列: 博子 (Lv.2) → ピロコ (Lv.4) → 博子EX (Lv.5)
 * 7. りゅーのすけ進化系列: りゅーのすけ (Lv.1) → じゅーりゅーのすけ (Lv.3) → りゅーのすけEX (Lv.5)
 * 8. 中村先生進化系列: 中村先生 (Lv.2) → スーパーフライ (Lv.4) → 中村EX (Lv.5)
 * 9. うーたん進化系列: うーたん (Lv.1) → 凶暴なうーたん (Lv.3)
 * 10. ワンワン進化系列: ワンワン (Lv.2) → 凶暴なワンワン (Lv.4)
 * 11. マスオさん進化系列: マスオさん (Lv.2) → え～！マスオさん (Lv.4) → マスオさんEX (Lv.5)
 * 12. アガサ博士進化系列: アガサ博士 (Lv.2) → ふぉアガサ博士 (Lv.4) → アガサ博士EX (Lv.5)
 * 13. つだぬまず＆特効系列: しょーちゃん (Lv.3) / おりちゃん (Lv.3) / ムエ (Lv.4) / もえきゅん (Lv.2・しょーちゃん即死) / りょち (Lv.2・ムエ即死) / メンヘラな泰松 (Lv.3)
 * 14. 単体アタッカー: 情報処理基礎のおばぁ (Lv.1) / 顎 (Lv.1) / 井上教授（壁） (Lv.1) / ヨートン (Lv.2) / バニラなそうくん (Lv.2) / 野々村議員 (Lv.2)
 */
const ATTACK_CARD_SEEDS: RawCardSeed[] = [
  // ============================================================================
  // 1. よしえ進化系列
  // ============================================================================
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
      description: '攻守のバランスに優れたLv.2基礎カード。塩よしえへ進化可能。',
    },
    ui: {
      tags: ['よしえ系', 'Lv.2'],
      flavorText: '「清らかで美しいよしえ。まだ塩分は控えめ。」',
      artSymbol: 'Sparkles',
    },
  },
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
      description: '「綺麗なよしえ」から進化。2エネルギーで70ダメージを叩き出す主力アタッカー。',
    },
    ui: {
      tags: ['よしえ系', '進化', 'Lv.3'],
      flavorText: '「塩対応が冴え渡るよしえ。近づく者には容赦ない。」',
      artSymbol: 'Zap',
    },
  },
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
      description: '「塩よしえ」から進化。3エネルギーで100ダメージを放つ重量級アタッカー。',
    },
    ui: {
      tags: ['よしえ系', '嘉慧', '進化', 'Lv.4'],
      flavorText: '「普通に話すだけならいいよー（絶対に嘘）。」',
      artSymbol: 'HelpCircle',
    },
  },
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
        '【EX級】「嘉慧」から進化する最終形態！HP160・攻撃力130の最高峰カード。きぜつ時は相手に2ポイントを与える。',
    },
    ui: {
      tags: ['よしえ系', 'EX', '進化', 'Lv.5'],
      flavorText: '「すべてを超越したEXの輝き。誰も逆らえない。」',
      artSymbol: 'Crown',
    },
  },

  // ============================================================================
  // 2. りゅうく進化系列
  // ============================================================================
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
      description: '鍛え上げられたタフネスで戦線を維持するLv.3基礎カード。リューク・スカイウォーカーへ進化可能。',
    },
    ui: {
      tags: ['りゅうく系', 'Lv.3'],
      flavorText: '「鍛え上げられたタフネス。秘めたるフォースが眠る。」',
      artSymbol: 'Shield',
    },
  },
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
        '【EX級】「吉田りゅうく」から進化！HP160・攻撃力130の超大型フィニッシャー。きぜつ時は2ポイント失う。',
    },
    ui: {
      tags: ['りゅうく系', 'EX', '進化', 'Lv.5'],
      flavorText: '「リュークと共にあらんことを。」銀河を揺るがす圧倒的フォース。',
      artSymbol: 'Zap',
    },
  },

  // ============================================================================
  // 3. サブレ・キャノン系列
  // ============================================================================
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
      description: '2エネルギー70ダメージの優秀な中堅アタッカー。「顎・キャノン」へ進化可能。',
    },
    ui: {
      tags: ['サブレ', 'Lv.3'],
      flavorText: '「サクサクの香ばしいサブレ。実戦でもめっぽう強い。」',
      artSymbol: 'Crosshair',
    },
  },
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
      description: '「まゆサブレ」から進化。3エネルギーを溜めて100ダメージの主砲を放つ高火力エースカード。',
    },
    ui: {
      tags: ['キャノン', '顎', '進化', 'Lv.4'],
      flavorText: '「突き出た顎から放たれる超高出力キャノン砲！」',
      artSymbol: 'Flame',
    },
  },
  {
    id: 'atk_cannon_naguri',
    name: 'キャノンの殴り',
    type: 'ATTACK',
    evolution: {
      family: 'サブレ・キャノン系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 2,
    abilities: {
      attackName: 'ゼロ距離ストレート',
      activeEffect: '2エネルギーで50ダメージを与える近接打撃',
      description: '砲撃ではなく物理で殴りかかるLv.2基礎カード。堅実な50ダメージを与える。',
    },
    ui: {
      tags: ['キャノン', '格闘', 'Lv.2'],
      flavorText: '「撃つより殴った方が早い！！」',
      artSymbol: 'Sword',
    },
  },
  {
    id: 'atk_voicememo_cannon',
    name: 'ボイメキャノン',
    type: 'ATTACK',
    evolution: {
      family: 'サブレ・キャノン系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 3,
    abilities: {
      attackName: '爆音ボイスメッセージ砲',
      activeEffect: '2エネルギーで70ダメージを与える音響砲撃',
      description: '怒涛のボイスメッセージを撃ち込むLv.3主力アタッカー。2エネルギー70ダメージ。',
    },
    ui: {
      tags: ['キャノン', 'ボイメ', 'Lv.3'],
      flavorText: '「再生ボタンを押した瞬間、鼓膜と精神が吹き飛ぶ。」',
      artSymbol: 'Zap',
    },
  },

  // ============================================================================
  // 4. ヘッドフォンニキ系列
  // ============================================================================
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
      description: 'リズムに乗って2エネルギー50ダメージを放つ基礎アタッカー。「オンフードヘッドフォンニキ」へ進化可能。',
    },
    ui: {
      tags: ['ニキ系', 'Lv.2'],
      flavorText: '「お気に入りのヘッドフォンで音楽に没頭中。」',
      artSymbol: 'Sparkles',
    },
  },
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
      description: '「ヘッドフォンニキ」から進化。HP130・攻撃力100を誇る重装アタッカー。',
    },
    ui: {
      tags: ['ニキ系', '進化', 'Lv.4'],
      flavorText: '「フードの上から装着することで更なる密閉感と力を手に入れた。」',
      artSymbol: 'Crown',
    },
  },
  {
    id: 'atk_red_headphone',
    name: '赤ヘッドフォン',
    type: 'ATTACK',
    evolution: {
      family: 'ヘッドフォンニキ系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 2,
    abilities: {
      attackName: 'クリムゾンビート',
      activeEffect: '2エネルギーで50ダメージを与える音波攻撃',
      description: '真紅のヘッドフォンで闘志を高めるLv.2基礎カード。HP80・攻撃力50で扱いやすい。',
    },
    ui: {
      tags: ['ニキ系', '赤ヘッドフォン', 'Lv.2'],
      flavorText: '「赤いヘッドフォンは通常の3倍のグルーヴを生む。」',
      artSymbol: 'Flame',
    },
  },

  // ============================================================================
  // 5. ゆきや進化系列＆派生カード
  //    ゆきや (Lv.2) → 裏切りのゆきや (Lv.4) → ゆきやEX (Lv.5)
  //    さみしいゆきや (Lv.1) / 返金のゆきや (Lv.2) / おどるゆきや (Lv.3)
  // ============================================================================
  {
    id: 'atk_yukiya',
    name: 'ゆきや',
    type: 'ATTACK',
    evolution: {
      family: 'ゆきや系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_uragiri_yukiya',
    },
    level: 2,
    abilities: {
      attackName: 'スマイルアタック',
      activeEffect: '2エネルギーで50ダメージを与える基本攻撃',
      description: 'ゆきや進化系列の起点となるLv.2基礎カード。「裏切りのゆきや」へ進化可能。',
    },
    ui: {
      tags: ['ゆきや系', '基礎', 'Lv.2'],
      flavorText: '「まだ純粋な頃のゆきや。しかしその瞳の奥には何かが宿る。」',
      artSymbol: 'Heart',
    },
  },
  {
    id: 'evo_uragiri_yukiya',
    name: '裏切りのゆきや',
    type: 'ATTACK',
    evolution: {
      family: 'ゆきや系列',
      stage: 2,
      evolvesFrom: 'atk_yukiya',
      evolvesTo: 'evo_yukiya_ex',
    },
    level: 4,
    abilities: {
      attackName: '背面バックスタブ',
      activeEffect: '3エネルギーで100ダメージを与える裏切りの強襲',
      description: '「ゆきや」から進化。3エネルギー100ダメージで相手の信頼ごと粉砕するLv.4強襲カード。「ゆきやEX」へ進化可能。',
    },
    ui: {
      tags: ['ゆきや系', '進化', 'Lv.4'],
      flavorText: '「ごめんね、最初からそっちの味方じゃなかったんだ。」',
      artSymbol: 'Skull',
    },
  },
  {
    id: 'evo_yukiya_ex',
    name: 'ゆきやEX',
    type: 'ATTACK',
    evolution: {
      family: 'ゆきや系列',
      stage: 3,
      evolvesFrom: 'evo_uragiri_yukiya',
      evolvesTo: null,
    },
    level: 5,
    abilities: {
      attackName: 'EX絶対支配ノクターン',
      activeEffect: '4エネルギーで130ダメージを与えるEX必殺技',
      passiveEffect: 'EXルール：きぜつした際、相手は2ポイントを獲得する',
      description:
        '【EX級】「裏切りのゆきや」から進化する最終形態！HP160・攻撃力130の圧倒的支配力を持つ。',
    },
    ui: {
      tags: ['ゆきや系', 'EX', '進化', 'Lv.5'],
      flavorText: '「裏切りの果てに辿り着いた絶対王政。すべてはゆきやの手のひらの上。」',
      artSymbol: 'Crown',
    },
  },
  {
    id: 'atk_samishii_yukiya',
    name: 'さみしいゆきや',
    type: 'ATTACK',
    evolution: {
      family: 'ゆきや系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 1,
    abilities: {
      attackName: 'かまってタックル',
      activeEffect: '1エネルギーで30ダメージを与える速攻攻撃',
      description: '1エネルギーで即座に動けるLv.1速攻カード。寂しさを力に変えて序盤から攻める。',
    },
    ui: {
      tags: ['ゆきや系', '速攻', 'Lv.1'],
      flavorText: '「ねえ、なんで既読つかないの……？」',
      artSymbol: 'Heart',
    },
  },
  {
    id: 'atk_henkin_yukiya',
    name: '返金のゆきや',
    type: 'ATTACK',
    evolution: {
      family: 'ゆきや系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 2,
    abilities: {
      attackName: '全額返金クレーム',
      activeEffect: '2エネルギーで50ダメージを与える追及攻撃',
      description: '1円単位まで徹底的に取り立てるLv.2標準アタッカー。HP80・攻撃力50。',
    },
    ui: {
      tags: ['ゆきや系', '返金', 'Lv.2'],
      flavorText: '「領収書ありますよね？今すぐ返金してください！」',
      artSymbol: 'Lock',
    },
  },
  {
    id: 'atk_odoru_yukiya',
    name: 'おどるゆきや',
    type: 'ATTACK',
    evolution: {
      family: 'ゆきや系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 3,
    abilities: {
      attackName: 'フィーバーダンスステップ',
      activeEffect: '2エネルギーで70ダメージを与える華麗なステップ攻撃',
      description: '華麗なダンスで相手を翻弄し、2エネルギー70ダメージを叩き込むLv.3主力カード。',
    },
    ui: {
      tags: ['ゆきや系', 'ダンス', 'Lv.3'],
      flavorText: '「フロアの中心で踊り狂う！誰にも止められないステップ！」',
      artSymbol: 'Sparkles',
    },
  },

  // ============================================================================
  // 6. 博子進化系列
  //    博子 (Lv.2) → ピロコ (Lv.4) → 博子EX (Lv.5)
  // ============================================================================
  {
    id: 'atk_hiroko',
    name: '博子',
    type: 'ATTACK',
    evolution: {
      family: '博子系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_piroko',
    },
    level: 2,
    abilities: {
      attackName: '博子スマッシュ',
      activeEffect: '2エネルギーで50ダメージを与える基本攻撃',
      description: '博子進化系列の起点となるLv.2基礎カード。「ピロコ」へ進化可能。',
    },
    ui: {
      tags: ['博子系', '基礎', 'Lv.2'],
      flavorText: '「穏やかな微笑みの裏に秘められた実力。」',
      artSymbol: 'Sparkles',
    },
  },
  {
    id: 'evo_piroko',
    name: 'ピロコ',
    type: 'ATTACK',
    evolution: {
      family: '博子系列',
      stage: 2,
      evolvesFrom: 'atk_hiroko',
      evolvesTo: 'evo_hiroko_ex',
    },
    level: 4,
    abilities: {
      attackName: 'ピロコ・トルネード',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      description: '「博子」から進化。リミッターを解除して100ダメージを放つLv.4強襲形態。「博子EX」へ進化可能。',
    },
    ui: {
      tags: ['博子系', '進化', 'Lv.4'],
      flavorText: '「ピロコと呼びなさい！本気モード突入よ！」',
      artSymbol: 'Flame',
    },
  },
  {
    id: 'evo_hiroko_ex',
    name: '博子EX',
    type: 'ATTACK',
    evolution: {
      family: '博子系列',
      stage: 3,
      evolvesFrom: 'evo_piroko',
      evolvesTo: null,
    },
    level: 5,
    abilities: {
      attackName: 'EXゴッドエンプレス博子',
      activeEffect: '4エネルギーで130ダメージを与えるEX必殺技',
      passiveEffect: 'EXルール：きぜつした際、相手は2ポイントを獲得する',
      description:
        '【EX級】「ピロコ」から進化する最終形態！HP160・攻撃力130の女帝カード。',
    },
    ui: {
      tags: ['博子系', 'EX', '進化', 'Lv.5'],
      flavorText: '「光り輝く博子EXの前に、ひれ伏せぬ者はいない。」',
      artSymbol: 'Crown',
    },
  },

  // ============================================================================
  // 7. りゅーのすけ進化系列
  //    りゅーのすけ (Lv.1) → じゅーりゅーのすけ (Lv.3) → りゅーのすけEX (Lv.5)
  // ============================================================================
  {
    id: 'atk_ryunosuke',
    name: 'りゅーのすけ',
    type: 'ATTACK',
    evolution: {
      family: 'りゅーのすけ系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_juryunosuke',
      triggerCardId: 'spl_fluorescent_ryunosuke',
    },
    level: 1,
    abilities: {
      attackName: 'ハイスピード突撃',
      activeEffect: '1エネルギーで30ダメージを与える速攻攻撃',
      description: '1エネルギーで即座に動けるLv.1基礎アタッカー。「じゅーりゅーのすけ」へ進化可能。',
    },
    ui: {
      tags: ['りゅーのすけ系', '速攻', 'Lv.1'],
      flavorText: '「先手必勝！一瞬の隙を突く電光石火の一撃！」',
      artSymbol: 'Zap',
    },
  },
  {
    id: 'evo_juryunosuke',
    name: 'じゅーりゅーのすけ',
    type: 'ATTACK',
    evolution: {
      family: 'りゅーのすけ系列',
      stage: 2,
      evolvesFrom: 'atk_ryunosuke',
      evolvesTo: 'evo_ryunosuke_ex',
    },
    level: 3,
    abilities: {
      attackName: '十流ブレード乱舞',
      activeEffect: '2エネルギーで70ダメージを与える主力攻撃',
      description: '「りゅーのすけ」から進化。2エネルギー70ダメージで中盤を圧倒し、「りゅーのすけEX」へ進化可能。',
    },
    ui: {
      tags: ['りゅーのすけ系', '進化', 'Lv.3'],
      flavorText: '「十の流派を極めし進化形態、じゅーりゅーのすけ見参！」',
      artSymbol: 'Sword',
    },
  },
  {
    id: 'evo_ryunosuke_ex',
    name: 'りゅーのすけEX',
    type: 'ATTACK',
    evolution: {
      family: 'りゅーのすけ系列',
      stage: 3,
      evolvesFrom: 'evo_juryunosuke',
      evolvesTo: null,
    },
    level: 5,
    abilities: {
      attackName: 'EX閃光ドラゴンズロア',
      activeEffect: '4エネルギーで130ダメージを与えるEX必殺技',
      passiveEffect: 'EXルール：きぜつした際、相手は2ポイントを獲得する',
      description:
        '【EX級】「じゅーりゅーのすけ」から進化する最終形態！HP160・攻撃力130の超神速フィニッシャー。',
    },
    ui: {
      tags: ['りゅーのすけ系', 'EX', '進化', 'Lv.5'],
      flavorText: '「光速を超えし真の覚醒。りゅーのすけEXの一閃が戦場を裂く！」',
      artSymbol: 'Crown',
    },
  },

  // ============================================================================
  // 8. 中村先生進化系列
  //    中村先生 (Lv.2) → スーパーフライ (Lv.4) → 中村EX (Lv.5)
  // ============================================================================
  {
    id: 'atk_nakamura_sensei',
    name: '中村先生',
    type: 'ATTACK',
    evolution: {
      family: '中村先生系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_superfly_unit',
    },
    level: 2,
    abilities: {
      attackName: '熱血チョーク投げ',
      activeEffect: '2エネルギーで50ダメージを与える基本攻撃',
      description: '教壇から鋭い一撃を放つLv.2基礎カード。「スーパーフライ」へ進化可能。',
    },
    ui: {
      tags: ['中村系', '先生', 'Lv.2'],
      flavorText: '「ここテストに出るぞー！しっかり聞いておけ！」',
      artSymbol: 'BookOpen',
    },
  },
  {
    id: 'evo_superfly_unit',
    name: 'スーパーフライ',
    type: 'ATTACK',
    evolution: {
      family: '中村先生系列',
      stage: 2,
      evolvesFrom: 'atk_nakamura_sensei',
      evolvesTo: 'evo_nakamura_ex',
    },
    level: 4,
    abilities: {
      attackName: 'モンゴル大飛翔インパクト',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      description: '「中村先生」から進化。大草原の風を纏い3エネルギー100ダメージを叩き出す。「中村EX」へ進化可能。',
    },
    ui: {
      tags: ['中村系', '進化', 'Lv.4'],
      flavorText: '「大地を越えて羽ばたくスーパーフライの魂！！」',
      artSymbol: 'Wind',
    },
  },
  {
    id: 'evo_nakamura_ex',
    name: '中村EX',
    type: 'ATTACK',
    evolution: {
      family: '中村先生系列',
      stage: 3,
      evolvesFrom: 'evo_superfly_unit',
      evolvesTo: null,
    },
    level: 5,
    abilities: {
      attackName: 'EXグランドマスター講義',
      activeEffect: '4エネルギーで130ダメージを与えるEX必殺技',
      passiveEffect: 'EXルール：きぜつした際、相手は2ポイントを獲得する',
      description:
        '【EX級】「スーパーフライ」から進化する最終形態！HP160・攻撃力130の伝説級教育者。',
    },
    ui: {
      tags: ['中村系', 'EX', '進化', 'Lv.5'],
      flavorText: '「これぞ究極の授業！単位と共に相手を吹き飛ばす！」',
      artSymbol: 'Crown',
    },
  },

  // ============================================================================
  // 9. うーたん進化系列
  //    うーたん (Lv.1) → 凶暴なうーたん (Lv.3)
  // ============================================================================
  {
    id: 'atk_utan',
    name: 'うーたん',
    type: 'ATTACK',
    evolution: {
      family: 'うーたん系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_kyobo_utan',
    },
    level: 1,
    abilities: {
      attackName: 'マラカスぽんぽん',
      activeEffect: '1エネルギーで30ダメージを与える速攻攻撃',
      description: '元気いっぱいに1エネルギー30ダメージを出すLv.1基礎カード。「凶暴なうーたん」へ進化可能。',
    },
    ui: {
      tags: ['うーたん系', '速攻', 'Lv.1'],
      flavorText: '「うーたん、げんきげんきー！」',
      artSymbol: 'Sparkles',
    },
  },
  {
    id: 'evo_kyobo_utan',
    name: '凶暴なうーたん',
    type: 'ATTACK',
    evolution: {
      family: 'うーたん系列',
      stage: 2,
      evolvesFrom: 'atk_utan',
      evolvesTo: null,
    },
    level: 3,
    abilities: {
      attackName: '狂乱マラカス粉砕撃',
      activeEffect: '2エネルギーで70ダメージを与える主力攻撃',
      description: '「うーたん」から進化。笑顔のまま2エネルギー70ダメージを振り下ろす凶暴形態。',
    },
    ui: {
      tags: ['うーたん系', '進化', 'Lv.3'],
      flavorText: '「うーたん……おこったぞぉぉぉ！！」',
      artSymbol: 'Flame',
    },
  },

  // ============================================================================
  // 10. ワンワン進化系列
  //     ワンワン (Lv.2) → 凶暴なワンワン (Lv.4)
  // ============================================================================
  {
    id: 'atk_wanwan',
    name: 'ワンワン',
    type: 'ATTACK',
    evolution: {
      family: 'ワンワン系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_kyobo_wanwan',
    },
    level: 2,
    abilities: {
      attackName: 'わんわんダッシュ',
      activeEffect: '2エネルギーで50ダメージを与える基本攻撃',
      description: 'みんなの人気者Lv.2基礎カード。「凶暴なワンワン」へ進化可能。',
    },
    ui: {
      tags: ['ワンワン系', '基礎', 'Lv.2'],
      flavorText: '「わんわんだよー！いっしょにあそぼー！」',
      artSymbol: 'Trees',
    },
  },
  {
    id: 'evo_kyobo_wanwan',
    name: '凶暴なワンワン',
    type: 'ATTACK',
    evolution: {
      family: 'ワンワン系列',
      stage: 2,
      evolvesFrom: 'atk_wanwan',
      evolvesTo: null,
    },
    level: 4,
    abilities: {
      attackName: '野生解放ビーストファング',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      description: '「ワンワン」から進化。野生の本能を解放し3エネルギー100ダメージで噛み砕くLv.4強襲カード。',
    },
    ui: {
      tags: ['ワンワン系', '進化', 'Lv.4'],
      flavorText: '「遊びの時間は終わりだ……ガルルルッ！！」',
      artSymbol: 'Skull',
    },
  },

  // ============================================================================
  // 11. マスオさん進化系列
  //     マスオさん (Lv.2) → え～！マスオさん (Lv.4) → マスオさんEX (Lv.5)
  // ============================================================================
  {
    id: 'atk_masuo',
    name: 'マスオさん',
    type: 'ATTACK',
    evolution: {
      family: 'マスオさん系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_ee_masuo',
    },
    level: 2,
    abilities: {
      attackName: '誠実サラリーマンアタック',
      activeEffect: '2エネルギーで50ダメージを与える基本攻撃',
      description: '優しき婿養子Lv.2基礎カード。「え～！マスオさん」へ進化可能。',
    },
    ui: {
      tags: ['マスオ系', '基礎', 'Lv.2'],
      flavorText: '「いやあ、今日もいい天気だなあ。」',
      artSymbol: 'Shield',
    },
  },
  {
    id: 'evo_ee_masuo',
    name: 'え～！マスオさん',
    type: 'ATTACK',
    evolution: {
      family: 'マスオさん系列',
      stage: 2,
      evolvesFrom: 'atk_masuo',
      evolvesTo: 'evo_masuo_ex',
    },
    level: 4,
    abilities: {
      attackName: '驚愕のえ～！！ショックウェーブ',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      description: '「マスオさん」から進化。凄まじい驚きの声量で100ダメージを与える。「マスオさんEX」へ進化可能。',
    },
    ui: {
      tags: ['マスオ系', '進化', 'Lv.4'],
      flavorText: '「えぇぇぇ～～っ！？本当かいサザエ！！」',
      artSymbol: 'Zap',
    },
  },
  {
    id: 'evo_masuo_ex',
    name: 'マスオさんEX',
    type: 'ATTACK',
    evolution: {
      family: 'マスオさん系列',
      stage: 3,
      evolvesFrom: 'evo_ee_masuo',
      evolvesTo: null,
    },
    level: 5,
    abilities: {
      attackName: 'EX超絶大黒柱インパクト',
      activeEffect: '4エネルギーで130ダメージを与えるEX必殺技',
      passiveEffect: 'EXルール：きぜつした際、相手は2ポイントを獲得する',
      description:
        '【EX級】「え～！マスオさん」から進化する最終形態！HP160・攻撃力130の究極家長。',
    },
    ui: {
      tags: ['マスオ系', 'EX', '進化', 'Lv.5'],
      flavorText: '「磯野家もフグ田家も、この私がすべて守ってみせる！！」',
      artSymbol: 'Crown',
    },
  },

  // ============================================================================
  // 12. アガサ博士進化系列
  //     アガサ博士 (Lv.2) → ふぉアガサ博士 (Lv.4) → アガサ博士EX (Lv.5)
  // ============================================================================
  {
    id: 'atk_agasa',
    name: 'アガサ博士',
    type: 'ATTACK',
    evolution: {
      family: 'アガサ博士系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_fo_agasa',
    },
    level: 2,
    abilities: {
      attackName: '発明メカガジェット',
      activeEffect: '2エネルギーで50ダメージを与える基本攻撃',
      description: '天才発明家Lv.2基礎カード。「ふぉアガサ博士」へ進化可能。',
    },
    ui: {
      tags: ['アガサ系', '発明', 'Lv.2'],
      flavorText: '「ワシの新発明を見せてやろう！」',
      artSymbol: 'BookOpen',
    },
  },
  {
    id: 'evo_fo_agasa',
    name: 'ふぉアガサ博士',
    type: 'ATTACK',
    evolution: {
      family: 'アガサ博士系列',
      stage: 2,
      evolvesFrom: 'atk_agasa',
      evolvesTo: 'evo_agasa_ex',
    },
    level: 4,
    abilities: {
      attackName: 'ふぉっふぉっふぉレーザー',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      description: '「アガサ博士」から進化。豪快な笑い声と共に100ダメージを撃ち抜く。「アガサ博士EX」へ進化可能。',
    },
    ui: {
      tags: ['アガサ系', '進化', 'Lv.4'],
      flavorText: '「ふぉっふぉっふぉ！出力最大じゃ！！」',
      artSymbol: 'Zap',
    },
  },
  {
    id: 'evo_agasa_ex',
    name: 'アガサ博士EX',
    type: 'ATTACK',
    evolution: {
      family: 'アガサ博士系列',
      stage: 3,
      evolvesFrom: 'evo_fo_agasa',
      evolvesTo: null,
    },
    level: 5,
    abilities: {
      attackName: 'EX最終科学オーバーテクノロジー',
      activeEffect: '4エネルギーで130ダメージを与えるEX必殺技',
      passiveEffect: 'EXルール：きぜつした際、相手は2ポイントを獲得する',
      description:
        '【EX級】「ふぉアガサ博士」から進化する最終形態！HP160・攻撃力130の超科学結晶。',
    },
    ui: {
      tags: ['アガサ系', 'EX', '進化', 'Lv.5'],
      flavorText: '「科学の限界を超えた究極メカ、ここに完成じゃ！！」',
      artSymbol: 'Crown',
    },
  },

  // ============================================================================
  // 13. つだぬまず＆特効系列
  //     しょーちゃん (Lv.3) / おりちゃん (Lv.3) / ムエ (Lv.4)
  //     もえきゅん (Lv.2・しょーちゃん即死) / りょち (Lv.2・ムエ即死) / メンヘラな泰松 (Lv.3)
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
    },
    level: 3,
    abilities: {
      attackName: 'つだぬまドライブ',
      activeEffect: '2エネルギーで70ダメージを与える主力攻撃',
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
    },
    level: 3,
    abilities: {
      attackName: '堅実ガードインパクト',
      activeEffect: '2エネルギーで70ダメージを与える主力攻撃',
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
    },
    level: 4,
    abilities: {
      attackName: 'エースバースト',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      description: '3エネルギー100ダメージ・HP130の主力エース。戦況を一変させるパワーを持つ。',
    },
    ui: {
      tags: ['つだぬまず', 'Lv.4'],
      flavorText: '「圧倒的パワーを誇るエースアタッカー。」',
      artSymbol: 'Sword',
    },
  },
  {
    id: 'atk_moekyun',
    name: 'もえきゅん',
    type: 'ATTACK',
    evolution: {
      family: '特効系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 2,
    abilities: {
      attackName: 'きゅんきゅんハートブレイク',
      activeEffect: '通常50ダメージ（相手が「しょーちゃん」なら一撃即死！）',
      passiveEffect: '特効：攻撃対象が「しょーちゃん」の場合、残りHPをすべて削り即死させる',
      combatSkill: 'INSTANT_KILL_SHOCHAN',
      description:
        '【特効】相手が「しょーちゃん」のとき一撃で即死させる！それ以外の相手には通常のLv.2攻撃（50ダメージ）を行う。',
    },
    ui: {
      tags: ['特効', 'しょーちゃんキラー', 'Lv.2'],
      flavorText: '「しょーちゃんには効果バツグンどころか一撃必殺♡」',
      artSymbol: 'Heart',
    },
  },
  {
    id: 'atk_ryochi',
    name: 'りょち',
    type: 'ATTACK',
    evolution: {
      family: '特効系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 2,
    abilities: {
      attackName: 'ピンポイント・スナイプ',
      activeEffect: '通常50ダメージ（相手が「ムエ」なら一撃即死！）',
      passiveEffect: '特効：攻撃対象が「ムエ」の場合、残りHPをすべて削り即死させる',
      combatSkill: 'INSTANT_KILL_MUE',
      description:
        '【特効】相手が「ムエ」のとき一撃で即死させる！それ以外の相手には通常のLv.2攻撃（50ダメージ）を行う。',
    },
    ui: {
      tags: ['特効', 'ムエキラー', 'Lv.2'],
      flavorText: '「ムエちゃんだけは絶対に逃がさない。」',
      artSymbol: 'Crosshair',
    },
  },
  {
    id: 'atk_menhera_yasumatsu',
    name: 'メンヘラな泰松',
    type: 'ATTACK',
    evolution: {
      family: 'つだぬまず系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 3,
    abilities: {
      attackName: '深夜の長文連投',
      activeEffect: '2エネルギーで70ダメージを与える重圧攻撃',
      description: '重すぎる感情をぶつけて2エネルギー70ダメージを与えるLv.3主力アタッカー。',
    },
    ui: {
      tags: ['泰松', 'メンヘラ', 'Lv.3'],
      flavorText: '「なんで返信くれないの？もういいよね全部消すね。」',
      artSymbol: 'Skull',
    },
  },

  // ============================================================================
  // 14. 単体アタッカー (Lv.1 〜 Lv.2)
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
    id: 'atk_ago',
    name: '顎',
    type: 'ATTACK',
    evolution: {
      family: '顎系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
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
      triggerCardId: 'spl_phoenix_hall',
    },
    level: 1,
    abilities: {
      attackName: '学術の壁ドン',
      activeEffect: '1エネルギーで30ダメージを与える速攻攻撃',
      passiveEffect: '魔法「フェニックスホール（講堂）」の効果でも手札に生成される',
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
  {
    id: 'atk_nonomura_giin',
    name: '野々村議員',
    type: 'ATTACK',
    evolution: {
      family: '単体',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 2,
    abilities: {
      attackName: '号泣会見シャウト',
      activeEffect: '2エネルギーで50ダメージを与える音波攻撃',
      description: '耳をつんざく渾身の号泣会見で2エネルギー50ダメージを与えるLv.2標準カード。',
    },
    ui: {
      tags: ['会見', '号泣', 'Lv.2'],
      flavorText: '「この世の中をぉぉ！変えたい一心でぇぇぇ！！」',
      artSymbol: 'Zap',
    },
  },
];

export const ATTACK_CARDS: CardDefinition[] = ATTACK_CARD_SEEDS.map(buildCardDefinition);
