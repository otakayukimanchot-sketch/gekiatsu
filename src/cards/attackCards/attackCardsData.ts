import { CardDefinition, RawCardSeed } from '../types';
import { buildCardDefinition } from '../levelSystem';

/**
 * 攻撃カード定義一覧
 *
 * 【収録系列一覧】
 * 1. よしえ進化系列: 綺麗なよしえ (Lv.2) → 「普通に話すだけならいいよー（嘘）」嘉慧 (Lv.4) → よしえEX (Lv.5)
 * 2. りゅうく進化系列: 吉田りゅうく (Lv.3) → リューク・スカイウォーカー (Lv.5)
 * 3. サブレ・キャノン系列: まゆサブレ (Lv.3) → 顎・キャノン (Lv.4)
 * 4. ヘッドフォンニキ系列: ヘッドフォンニキ (Lv.2) → オンフードヘッドフォンニキ (Lv.4)
 * 5. ゆきや進化系列＆派生: ゆきや (Lv.2) → 裏切りのゆきや (Lv.4) → ゆきやEX (Lv.5) / おどるゆきや (Lv.3)
 * 6. 博子進化系列: 博子 (Lv.2) → ピロコ (Lv.4) → 博子EX (Lv.5)
 * 7. りゅーのすけ進化系列: りゅーのすけ (Lv.1) → じゅーりゅーのすけ (Lv.3) → りゅーのすけEX (Lv.5)
 * 8. モンゴル進化系列: モンゴル (Lv.2) → スーパーフライ (Lv.4) → モンゴルEX (Lv.5)
 * 9. うーたん進化系列: うーたん (Lv.1) → 凶暴なうーたん (Lv.3)
 * 10. ワンワン進化系列: ワンワン (Lv.2) → 凶暴なワンワン (Lv.4)
 * 11. マスオさん進化系列: マスオさん (Lv.2) → え～！マスオさん (Lv.4) → マスオさんEX (Lv.5)
 * 12. アガサ博士進化系列: アガサ博士 (Lv.2) → ふぉアガサ博士 (Lv.4) → アガサ博士EX (Lv.5)
 * 13. ガボン進化系列: ガボン (Lv.2) → メイド服のガボン (Lv.4) → ガボンEX (Lv.5)
 * 14. づっきー進化系列: づっきー (Lv.2) → 昼夜逆転のづっきー (Lv.3) → 作曲家なづっきー (Lv.4) → づっきーEX (Lv.5)
 * 15. ２世進化系列: ２世 (Lv.2) → はしゃぐ２世 (Lv.4) → ２世EX (Lv.5)
 * 16. ヨートン進化系列: ヨートン (Lv.2) → おはヨートン (Lv.4) → ヨートンEX (Lv.5)
 * 17. ブーン進化系列: ブーン (Lv.2) → かわいいブーン (Lv.4) → ブーンEX (Lv.5)
 * 18. バニラ進化系列: バニラなそうくん (Lv.2) → バニラじゃなくていいじゃん (Lv.4) → バニラEX (Lv.5)
 * 19. ケロロ軍曹進化系列: ケロロ軍曹 (Lv.2) → ゲロロ軍曹 (Lv.4) → 軍曹EX (Lv.5)
 * 20. アフリカ進化系列: アフリカ (Lv.2) → 専門はアフリカ (Lv.4) → アフリカEX (Lv.5)
 * 21. つだぬまず＆特効系列: しょーちゃん (Lv.3) / おりちゃん (Lv.3) / ムエ (Lv.4) / もえきゅん (Lv.2・しょーちゃん即死) / りょち (Lv.2・ムエ即死) / もか (Lv.2・ムエ＆しょーちゃん+30) / こはく (Lv.2・ムエ＆しょーちゃん+30)
 * 22. 単体アタッカー: 情報処理基礎のおばぁ (Lv.1) / 顎 (Lv.1) / 井上教授 (Lv.1) / 野々村議員 (Lv.2) / 中央大学教授（ピザを持ってくる） (Lv.3)
 */
const ATTACK_CARD_SEEDS: RawCardSeed[] = [
  // ============================================================================
  // 1. よしえ進化系列
  //    綺麗なよしえ (Lv.2) → 「普通に話すだけならいいよー（嘘）」嘉慧 (Lv.4) → よしえEX (Lv.5)
  // ============================================================================
  {
    id: 'atk_yoshie_clean',
    name: '綺麗なよしえ',
    type: 'ATTACK',
    evolution: {
      family: 'よしえ系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_yoshie_kakei',
      triggerCardId: 'spl_juzu_card',
    },
    level: 2,
    abilities: {
      attackName: 'ピュアストライク',
      activeEffect: '2エネルギーで50ダメージを与える安定攻撃',
      description:
        '攻守のバランスに優れたLv.2基礎カード。「普通に話すだけならいいよー（嘘）」嘉慧へ進化可能。',
    },
    ui: {
      tags: ['よしえ系', 'Lv.2'],
      flavorText: '「清らかで美しいよしえ。その裏に秘められた本性とは。」',
      artSymbol: 'Sparkles',
    },
  },
  {
    id: 'evo_yoshie_kakei',
    name: '「普通に話すだけならいいよー（嘘）」嘉慧',
    type: 'ATTACK',
    evolution: {
      family: 'よしえ系列',
      stage: 2,
      evolvesFrom: 'atk_yoshie_clean',
      evolvesTo: 'evo_yoshie_ex',
    },
    level: 4,
    abilities: {
      attackName: '嘘つきオーバーキル',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      description:
        '「綺麗なよしえ」から進化。3エネルギーで100ダメージを放つ重量級アタッカー。「よしえEX」へ進化可能。',
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
      stage: 3,
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
  // 8. モンゴル進化系列
  //    モンゴル (Lv.2) → スーパーフライ (Lv.4) → モンゴルEX (Lv.5)
  // ============================================================================
  {
    id: 'atk_nakamura_sensei',
    name: 'モンゴル',
    type: 'ATTACK',
    evolution: {
      family: 'モンゴル系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_superfly_unit',
    },
    level: 2,
    abilities: {
      attackName: '草原の疾風アタック',
      activeEffect: '2エネルギーで50ダメージを与える基本攻撃',
      description: 'モンゴル進化系列の起点となるLv.2基礎カード。「スーパーフライ」へ進化可能。',
    },
    ui: {
      tags: ['モンゴル系', '基礎', 'Lv.2'],
      flavorText: '「果てしない大草原から吹き抜ける熱き風！」',
      artSymbol: 'Wind',
    },
  },
  {
    id: 'evo_superfly_unit',
    name: 'スーパーフライ',
    type: 'ATTACK',
    evolution: {
      family: 'モンゴル系列',
      stage: 2,
      evolvesFrom: 'atk_nakamura_sensei',
      evolvesTo: 'evo_nakamura_ex',
    },
    level: 4,
    abilities: {
      attackName: 'モンゴル大飛翔インパクト',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      description: '「モンゴル」から進化。大草原の風を纏い3エネルギー100ダメージを叩き出す。「モンゴルEX」へ進化可能。',
    },
    ui: {
      tags: ['モンゴル系', '進化', 'Lv.4'],
      flavorText: '「大地を越えて羽ばたくスーパーフライの魂！！」',
      artSymbol: 'Wind',
    },
  },
  {
    id: 'evo_nakamura_ex',
    name: 'モンゴルEX',
    type: 'ATTACK',
    evolution: {
      family: 'モンゴル系列',
      stage: 3,
      evolvesFrom: 'evo_superfly_unit',
      evolvesTo: null,
    },
    level: 5,
    abilities: {
      attackName: 'EX大草原アルティメットストーム',
      activeEffect: '4エネルギーで130ダメージを与えるEX必殺技',
      passiveEffect: 'EXルール：きぜつした際、相手は2ポイントを獲得する',
      description:
        '【EX級】「スーパーフライ」から進化する最終形態！HP160・攻撃力130の伝説級モンゴルEX。',
    },
    ui: {
      tags: ['モンゴル系', 'EX', '進化', 'Lv.5'],
      flavorText: '「大地と蒼き狼の力を宿した究極形態、モンゴルEX降臨！」',
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
    id: 'atk_moka',
    name: 'もか',
    type: 'ATTACK',
    evolution: {
      family: '特効系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 2,
    abilities: {
      attackName: 'もかスマイルアタック',
      activeEffect: '通常50ダメージ（相手が「ムエ」または「しょーちゃん」ならダメージ＋30！）',
      passiveEffect: '特効：攻撃対象が「ムエ」または「しょーちゃん」の場合、与えるダメージ＋30',
      combatSkill: 'BONUS_VS_MUE_AND_SHOCHAN_30',
      description:
        '【特効】通常攻撃（50ダメージ）に加え、相手が「ムエ」または「しょーちゃん」のときはダメージが＋30（合計80ダメージ）になる！',
    },
    ui: {
      tags: ['特効', 'もか', 'Lv.2'],
      flavorText: '「ムエちゃんとしょーちゃんには容赦しないよ♡」',
      artSymbol: 'Heart',
    },
  },
  {
    id: 'atk_kohaku',
    name: 'こはく',
    type: 'ATTACK',
    evolution: {
      family: '特効系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 2,
    abilities: {
      attackName: 'こはくラッシュ',
      activeEffect: '通常50ダメージ（相手が「ムエ」または「しょーちゃん」ならダメージ＋30！）',
      passiveEffect: '特効：攻撃対象が「ムエ」または「しょーちゃん」の場合、与えるダメージ＋30',
      combatSkill: 'BONUS_VS_MUE_AND_SHOCHAN_30',
      description:
        '【特効】通常攻撃（50ダメージ）に加え、相手が「ムエ」または「しょーちゃん」のときはダメージが＋30（合計80ダメージ）になる！',
    },
    ui: {
      tags: ['特効', 'こはく', 'Lv.2'],
      flavorText: '「ムエちゃんもしょーちゃんもまとめて相手してあげる！」',
      artSymbol: 'Sparkles',
    },
  },

  // ============================================================================
  // 14. 単体アタッカー & 新進化系列
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
    name: '井上教授',
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
      tags: ['井上教授', 'Lv.1'],
      flavorText: '「立ちはだかる学術の権威。」',
      artSymbol: 'Shield',
    },
  },
  // ヨートン進化系列: ヨートン (Lv.2) → おはヨートン (Lv.4) → ヨートンEX (Lv.5)
  {
    id: 'atk_yoton',
    name: 'ヨートン',
    type: 'ATTACK',
    evolution: {
      family: 'ヨートン系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_ohayoton',
    },
    level: 2,
    abilities: {
      attackName: 'ヨートンスラッシュ',
      activeEffect: '2エネルギーで50ダメージを与える安定攻撃',
      description: '安定したHP80と2エネルギー50ダメージを兼ね備えた基礎カード。「おはヨートン」へ進化可能。',
    },
    ui: {
      tags: ['ヨートン系', 'Lv.2'],
      flavorText: '「ヨートン参上！」',
      artSymbol: 'Sword',
    },
  },
  {
    id: 'evo_ohayoton',
    name: 'おはヨートン',
    type: 'ATTACK',
    evolution: {
      family: 'ヨートン系列',
      stage: 2,
      evolvesFrom: 'atk_yoton',
      evolvesTo: 'evo_yoton_ex',
    },
    level: 4,
    abilities: {
      attackName: 'モーニング・ヨートン砲',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      description: '「ヨートン」から進化。爽やかな朝の挨拶と共に100ダメージを叩き込む。「ヨートンEX」へ進化可能。',
    },
    ui: {
      tags: ['ヨートン系', '進化', 'Lv.4'],
      flavorText: '「おはヨートン！！朝からフルパワー全開！」',
      artSymbol: 'Flame',
    },
  },
  {
    id: 'evo_yoton_ex',
    name: 'ヨートンEX',
    type: 'ATTACK',
    evolution: {
      family: 'ヨートン系列',
      stage: 3,
      evolvesFrom: 'evo_ohayoton',
      evolvesTo: null,
    },
    level: 5,
    abilities: {
      attackName: 'EXアルティメット・ヨートンブレイク',
      activeEffect: '4エネルギーで130ダメージを与えるEX必殺技',
      passiveEffect: 'EXルール：きぜつした際、相手は2ポイントを獲得する',
      description: '【EX級】「おはヨートン」から進化する最終形態！HP160・攻撃力130の究極ヨートン。',
    },
    ui: {
      tags: ['ヨートン系', 'EX', '進化', 'Lv.5'],
      flavorText: '「極限進化を遂げたヨートンEXの前に敵はなし！！」',
      artSymbol: 'Crown',
    },
  },
  // バニラ進化系列: バニラなそうくん (Lv.2) → バニラじゃなくていいじゃん (Lv.4) → バニラEX (Lv.5)
  {
    id: 'atk_vanilla_sokun',
    name: 'バニラなそうくん',
    type: 'ATTACK',
    evolution: {
      family: 'バニラ系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_vanilla_janakute',
      triggerCardId: 'spl_vanilla',
    },
    level: 2,
    abilities: {
      attackName: 'バニラアタック',
      activeEffect: '2エネルギーで50ダメージを与える安定攻撃',
      description: 'クセがなく扱いやすいLv.2基礎カード。「バニラじゃなくていいじゃん」へ進化可能。',
    },
    ui: {
      tags: ['バニラ系', 'そうくん系', 'Lv.2'],
      flavorText: '「バニラじゃなくていいじゃぁん！」',
      artSymbol: 'Heart',
    },
  },
  {
    id: 'evo_vanilla_janakute',
    name: 'バニラじゃなくていいじゃん',
    type: 'ATTACK',
    evolution: {
      family: 'バニラ系列',
      stage: 2,
      evolvesFrom: 'atk_vanilla_sokun',
      evolvesTo: 'evo_vanilla_ex',
    },
    level: 4,
    abilities: {
      attackName: '脱バニラ・フルバースト',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      description: '「バニラなそうくん」から進化。3エネルギー100ダメージを放ち、「バニラEX」へ進化可能。',
    },
    ui: {
      tags: ['バニラ系', '進化', 'Lv.4'],
      flavorText: '「だからバニラじゃなくていいじゃんって言ってるでしょ！！」',
      artSymbol: 'Flame',
    },
  },
  {
    id: 'evo_vanilla_ex',
    name: 'バニラEX',
    type: 'ATTACK',
    evolution: {
      family: 'バニラ系列',
      stage: 3,
      evolvesFrom: 'evo_vanilla_janakute',
      evolvesTo: null,
    },
    level: 5,
    abilities: {
      attackName: 'EX高収入アルティメット・シンフォニー',
      activeEffect: '4エネルギーで130ダメージを与えるEX必殺技',
      passiveEffect: 'EXルール：きぜつした際、相手は2ポイントを獲得する',
      description: '【EX級】「バニラじゃなくていいじゃん」から進化する最終形態！HP160・攻撃力130の最高峰カード。',
    },
    ui: {
      tags: ['バニラ系', 'EX', '進化', 'Lv.5'],
      flavorText: '「バーニラ！バニラ！究極覚醒バニラEXで高収入＆高火力！！」',
      artSymbol: 'Crown',
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

  // ============================================================================
  // 15. ガボン進化系列
  //     ガボン (Lv.2) → メイド服のガボン (Lv.4) → ガボンEX (Lv.5)
  // ============================================================================
  {
    id: 'atk_gabon',
    name: 'ガボン',
    type: 'ATTACK',
    evolution: {
      family: 'ガボン系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_maid_gabon',
    },
    level: 2,
    abilities: {
      attackName: 'ガボンタックル',
      activeEffect: '2エネルギーで50ダメージを与える基本攻撃',
      description: 'ガボン進化系列の起点となるLv.2基礎カード。「メイド服のガボン」へ進化可能。',
    },
    ui: {
      tags: ['ガボン系', '基礎', 'Lv.2'],
      flavorText: '「パワフルな体当たりで前線を切り拓くガボン！」',
      artSymbol: 'Shield',
    },
  },
  {
    id: 'evo_maid_gabon',
    name: 'メイド服のガボン',
    type: 'ATTACK',
    evolution: {
      family: 'ガボン系列',
      stage: 2,
      evolvesFrom: 'atk_gabon',
      evolvesTo: 'evo_gabon_ex',
    },
    level: 4,
    abilities: {
      attackName: '萌え萌えキュン・フルスイング',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      description:
        '「ガボン」から進化。ギャップ萌えと圧倒的破壊力を兼ね備え、3エネルギー100ダメージを叩き込む。「ガボンEX」へ進化可能。',
    },
    ui: {
      tags: ['ガボン系', 'メイド', '進化', 'Lv.4'],
      flavorText: '「お帰りなさいませご主人様！特大の一撃をお届けします♡」',
      artSymbol: 'Heart',
    },
  },
  {
    id: 'evo_gabon_ex',
    name: 'ガボンEX',
    type: 'ATTACK',
    evolution: {
      family: 'ガボン系列',
      stage: 3,
      evolvesFrom: 'evo_maid_gabon',
      evolvesTo: null,
    },
    level: 5,
    abilities: {
      attackName: 'EXアルティメット・ガボンインパクト',
      activeEffect: '4エネルギーで130ダメージを与えるEX必殺技',
      passiveEffect: 'EXルール：きぜつした際、相手は2ポイントを獲得する',
      description:
        '【EX級】「メイド服のガボン」から進化する最終形態！HP160・攻撃力130の超弩級フィニッシャー。',
    },
    ui: {
      tags: ['ガボン系', 'EX', '進化', 'Lv.5'],
      flavorText: '「すべてのリミッターを解き放った究極のガボンEX降臨！！」',
      artSymbol: 'Crown',
    },
  },

  // ============================================================================
  // 16. づっきー進化系列
  //     づっきー (Lv.2) → 昼夜逆転のづっきー (Lv.3) → 作曲家なづっきー (Lv.4) → づっきーEX (Lv.5)
  // ============================================================================
  {
    id: 'atk_zukky',
    name: 'づっきー',
    type: 'ATTACK',
    evolution: {
      family: 'づっきー系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_chuya_zukky',
    },
    level: 2,
    abilities: {
      attackName: 'づっきービート',
      activeEffect: '2エネルギーで50ダメージを与える基本攻撃',
      description: 'づっきー進化系列の起点となるLv.2基礎カード。「昼夜逆転のづっきー」へ進化可能。',
    },
    ui: {
      tags: ['づっきー系', '基礎', 'Lv.2'],
      flavorText: '「まだ生活リズムが整っている頃のづっきー。」',
      artSymbol: 'Sparkles',
    },
  },
  {
    id: 'evo_chuya_zukky',
    name: '昼夜逆転のづっきー',
    type: 'ATTACK',
    evolution: {
      family: 'づっきー系列',
      stage: 2,
      evolvesFrom: 'atk_zukky',
      evolvesTo: 'evo_composer_zukky',
    },
    level: 3,
    abilities: {
      attackName: '午前4時のハイテンション',
      activeEffect: '2エネルギーで70ダメージを与える主力攻撃',
      description:
        '「づっきー」から進化。深夜に覚醒し2エネルギー70ダメージを放つ。「作曲家なづっきー」へ進化可能。',
    },
    ui: {
      tags: ['づっきー系', '夜行性', '進化', 'Lv.3'],
      flavorText: '「朝日が昇る頃に一番目が冴えてくるタイプ。」',
      artSymbol: 'Zap',
    },
  },
  {
    id: 'evo_composer_zukky',
    name: '作曲家なづっきー',
    type: 'ATTACK',
    evolution: {
      family: 'づっきー系列',
      stage: 3,
      evolvesFrom: 'evo_chuya_zukky',
      evolvesTo: 'evo_zukky_ex',
    },
    level: 4,
    abilities: {
      attackName: '神曲マスタリング爆撃',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      description:
        '「昼夜逆転のづっきー」から進化。魂のメロディで3エネルギー100ダメージを響かせる。「づっきーEX」へ進化可能。',
    },
    ui: {
      tags: ['づっきー系', '作曲家', '進化', 'Lv.4'],
      flavorText: '「徹夜の果てに降りてきた神フレーズが戦場を震わせる！」',
      artSymbol: 'Sparkles',
    },
  },
  {
    id: 'evo_zukky_ex',
    name: 'づっきーEX',
    type: 'ATTACK',
    evolution: {
      family: 'づっきー系列',
      stage: 4,
      evolvesFrom: 'evo_composer_zukky',
      evolvesTo: null,
    },
    level: 5,
    abilities: {
      attackName: 'EXグランド・シンフォニア',
      activeEffect: '4エネルギーで130ダメージを与えるEX必殺技',
      passiveEffect: 'EXルール：きぜつした際、相手は2ポイントを獲得する',
      description:
        '【EX級】「作曲家なづっきー」から進化する第4段階・最終形態！HP160・攻撃力130の究極マエストロ。',
    },
    ui: {
      tags: ['づっきー系', 'EX', '進化', 'Lv.5'],
      flavorText: '「世界を塗り替える究極の交響曲！づっきーEX、開演！！」',
      artSymbol: 'Crown',
    },
  },

  // ============================================================================
  // 17. ２世進化系列
  //     ２世 (Lv.2) → はしゃぐ２世 (Lv.4) → ２世EX (Lv.5)
  // ============================================================================
  {
    id: 'atk_nisei',
    name: '２世',
    type: 'ATTACK',
    evolution: {
      family: '２世系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_hashagu_nisei',
    },
    level: 2,
    abilities: {
      attackName: 'サラブレッドショット',
      activeEffect: '2エネルギーで50ダメージを与える基本攻撃',
      description: '２世進化系列の起点となるLv.2基礎カード。「はしゃぐ２世」へ進化可能。',
    },
    ui: {
      tags: ['２世系', '基礎', 'Lv.2'],
      flavorText: '「受け継がれし血統。そのポテンシャルは計り知れない。」',
      artSymbol: 'Sparkles',
    },
  },
  {
    id: 'evo_hashagu_nisei',
    name: 'はしゃぐ２世',
    type: 'ATTACK',
    evolution: {
      family: '２世系列',
      stage: 2,
      evolvesFrom: 'atk_nisei',
      evolvesTo: 'evo_nisei_ex',
    },
    level: 4,
    abilities: {
      attackName: '全力ハイテンション暴走',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      description:
        '「２世」から進化。全力ではしゃぎ回り3エネルギー100ダメージを叩き出す。「２世EX」へ進化可能。',
    },
    ui: {
      tags: ['２世系', '進化', 'Lv.4'],
      flavorText: '「テンション最高潮！！もう誰にも止められない！！」',
      artSymbol: 'Flame',
    },
  },
  {
    id: 'evo_nisei_ex',
    name: '２世EX',
    type: 'ATTACK',
    evolution: {
      family: '２世系列',
      stage: 3,
      evolvesFrom: 'evo_hashagu_nisei',
      evolvesTo: null,
    },
    level: 5,
    abilities: {
      attackName: 'EXレジェンド・サクセサー',
      activeEffect: '4エネルギーで130ダメージを与えるEX必殺技',
      passiveEffect: 'EXルール：きぜつした際、相手は2ポイントを獲得する',
      description:
        '【EX級】「はしゃぐ２世」から進化する最終形態！HP160・攻撃力130で初代をも超える覚醒を果たした。',
    },
    ui: {
      tags: ['２世系', 'EX', '進化', 'Lv.5'],
      flavorText: '「初代を超えし新時代の覇者、２世EXここに極まる！！」',
      artSymbol: 'Crown',
    },
  },

  // ============================================================================
  // 18. 新規単体アタッカー＆進化系列:
  //     中央大学教授（ピザを持ってくる）
  //     ブーン → かわいいブーン → ブーンEX
  //     ケロロ軍曹 → ゲロロ軍曹 → 軍曹EX
  //     アフリカ → 専門はアフリカ → アフリカEX
  // ============================================================================
  {
    id: 'atk_chuo_pizza_prof',
    name: '中央大学教授（ピザを持ってくる）',
    type: 'ATTACK',
    evolution: {
      family: '単体',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: null,
    },
    level: 3,
    abilities: {
      attackName: '焼きたてピザ差し入れアタック',
      activeEffect: '2エネルギーで70ダメージを与える主力攻撃',
      description:
        '熱々のピザを片手に颯爽と現れる中央大学教授！HP100・攻撃力70で味方の士気も最高潮に高める。',
    },
    ui: {
      tags: ['中央大学', 'ピザ', '教授', 'Lv.3'],
      flavorText: '「みんなお疲れ！熱々のピザを持ってきたぞ〜！！」',
      artSymbol: 'Flame',
    },
  },
  // ブーン進化系列: ブーン (Lv.2) → かわいいブーン (Lv.4) → ブーンEX (Lv.5)
  {
    id: 'atk_boon',
    name: 'ブーン',
    type: 'ATTACK',
    evolution: {
      family: 'ブーン系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_kawaii_boon',
    },
    level: 2,
    abilities: {
      attackName: '超速ブーン突撃',
      activeEffect: '2エネルギーで50ダメージを与える高速突撃',
      description:
        '両手を広げて風を切り裂くLv.2基礎カード！「かわいいブーン」へ進化可能。',
    },
    ui: {
      tags: ['ブーン系', '高速', 'Lv.2'],
      flavorText: '「⊂二二二（ ＾ω＾）二⊃ ブーン！！」',
      artSymbol: 'Wind',
    },
  },
  {
    id: 'evo_kawaii_boon',
    name: 'かわいいブーン',
    type: 'ATTACK',
    evolution: {
      family: 'ブーン系列',
      stage: 2,
      evolvesFrom: 'atk_boon',
      evolvesTo: 'evo_boon_ex',
    },
    level: 4,
    abilities: {
      attackName: 'プリティ・ブーン旋風',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      description:
        '「ブーン」から進化。愛くるしい姿から3エネルギー100ダメージを繰り出す。「ブーンEX」へ進化可能。',
    },
    ui: {
      tags: ['ブーン系', 'かわいい', '進化', 'Lv.4'],
      flavorText: '「⊂二二二（ ✿＾ω＾✿ ）二⊃ かわいくブーン！！」',
      artSymbol: 'Heart',
    },
  },
  {
    id: 'evo_boon_ex',
    name: 'ブーンEX',
    type: 'ATTACK',
    evolution: {
      family: 'ブーン系列',
      stage: 3,
      evolvesFrom: 'evo_kawaii_boon',
      evolvesTo: null,
    },
    level: 5,
    abilities: {
      attackName: 'EX超音速ジェット・ブーン',
      activeEffect: '4エネルギーで130ダメージを与えるEX必殺技',
      passiveEffect: 'EXルール：きぜつした際、相手は2ポイントを獲得する',
      description:
        '【EX級】「かわいいブーン」から進化する最終形態！HP160・攻撃力130で音速を超えて戦場を翔ける！',
    },
    ui: {
      tags: ['ブーン系', 'EX', '進化', 'Lv.5'],
      flavorText: '「マッハの壁を突破した究極のブーンEX！！」',
      artSymbol: 'Crown',
    },
  },
  // ケロロ軍曹進化系列: ケロロ軍曹 (Lv.2) → ゲロロ軍曹 (Lv.4) → 軍曹EX (Lv.5)
  {
    id: 'atk_keroro_gunso',
    name: 'ケロロ軍曹',
    type: 'ATTACK',
    evolution: {
      family: 'ケロロ軍曹系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_geroro_gunso',
    },
    level: 2,
    abilities: {
      attackName: 'ケロン星侵略アタック',
      activeEffect: '2エネルギーで50ダメージを与える基本攻撃',
      description:
        'ケロロ軍曹進化系列の起点となるLv.2基礎カード。「ゲロロ軍曹」へ進化可能。',
    },
    ui: {
      tags: ['軍曹系', '基礎', 'Lv.2'],
      flavorText: '「本日よりペコポン侵略を開始するであります！ケロロ〜！」',
      artSymbol: 'Trees',
    },
  },
  {
    id: 'evo_geroro_gunso',
    name: 'ゲロロ軍曹',
    type: 'ATTACK',
    evolution: {
      family: 'ケロロ軍曹系列',
      stage: 2,
      evolvesFrom: 'atk_keroro_gunso',
      evolvesTo: 'evo_gunso_ex',
    },
    level: 4,
    abilities: {
      attackName: 'ゲロロ総攻撃キャノン',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      description:
        '「ケロロ軍曹」から進化。本気モードで3エネルギー100ダメージを叩き込む。「軍曹EX」へ進化可能。',
    },
    ui: {
      tags: ['軍曹系', '進化', 'Lv.4'],
      flavorText: '「ゲロロ軍曹に改名したであります！火力も桁違いであります！」',
      artSymbol: 'Flame',
    },
  },
  {
    id: 'evo_gunso_ex',
    name: '軍曹EX',
    type: 'ATTACK',
    evolution: {
      family: 'ケロロ軍曹系列',
      stage: 3,
      evolvesFrom: 'evo_geroro_gunso',
      evolvesTo: null,
    },
    level: 5,
    abilities: {
      attackName: 'EX最終兵器ケロン・オーバーロード',
      activeEffect: '4エネルギーで130ダメージを与えるEX必殺技',
      passiveEffect: 'EXルール：きぜつした際、相手は2ポイントを獲得する',
      description:
        '【EX級】「ゲロロ軍曹」から進化する最終形態！HP160・攻撃力130の宇宙最強クラス軍曹EX。',
    },
    ui: {
      tags: ['軍曹系', 'EX', '進化', 'Lv.5'],
      flavorText: '「全宇宙を制圧する究極の軍曹EX、ここに誕生であります！！」',
      artSymbol: 'Crown',
    },
  },
  // アフリカ進化系列: アフリカ (Lv.2) → 専門はアフリカ (Lv.4) → アフリカEX (Lv.5)
  {
    id: 'atk_africa',
    name: 'アフリカ',
    type: 'ATTACK',
    evolution: {
      family: 'アフリカ系列',
      stage: 1,
      evolvesFrom: null,
      evolvesTo: 'evo_senmon_africa',
    },
    level: 2,
    abilities: {
      attackName: 'サバンナ・スタンプ',
      activeEffect: '2エネルギーで50ダメージを与える基本攻撃',
      description:
        '広大な大地を思わせるLv.2基礎カード。「専門はアフリカ」へ進化可能。',
    },
    ui: {
      tags: ['アフリカ系', '基礎', 'Lv.2'],
      flavorText: '「果てしなく広がる大地の鼓動。」',
      artSymbol: 'Trees',
    },
  },
  {
    id: 'evo_senmon_africa',
    name: '専門はアフリカ',
    type: 'ATTACK',
    evolution: {
      family: 'アフリカ系列',
      stage: 2,
      evolvesFrom: 'atk_africa',
      evolvesTo: 'evo_africa_ex',
    },
    level: 4,
    abilities: {
      attackName: 'アフリカ専門フィールドワーク',
      activeEffect: '3エネルギーで100ダメージを与える強襲攻撃',
      description:
        '「アフリカ」から進化。圧倒的な専門知識と行動力で3エネルギー100ダメージを与える。「アフリカEX」へ進化可能。',
    },
    ui: {
      tags: ['アフリカ系', '専門', '進化', 'Lv.4'],
      flavorText: '「私の専門はアフリカです。何でも聞いてください！」',
      artSymbol: 'BookOpen',
    },
  },
  {
    id: 'evo_africa_ex',
    name: 'アフリカEX',
    type: 'ATTACK',
    evolution: {
      family: 'アフリカ系列',
      stage: 3,
      evolvesFrom: 'evo_senmon_africa',
      evolvesTo: null,
    },
    level: 5,
    abilities: {
      attackName: 'EXマザー・コンチネント・インパクト',
      activeEffect: '4エネルギーで130ダメージを与えるEX必殺技',
      passiveEffect: 'EXルール：きぜつした際、相手は2ポイントを獲得する',
      description:
        '【EX級】「専門はアフリカ」から進化する最終形態！HP160・攻撃力130の大陸級フィニッシャー。',
    },
    ui: {
      tags: ['アフリカ系', 'EX', '進化', 'Lv.5'],
      flavorText: '「大陸そのもののエネルギーが凝縮された究極のアフリカEX！！」',
      artSymbol: 'Crown',
    },
  },
];

export const ATTACK_CARDS: CardDefinition[] = ATTACK_CARD_SEEDS.map(buildCardDefinition);
