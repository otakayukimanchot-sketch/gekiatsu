import {
  CardColorTheme,
  CardDefinition,
  CardLevel,
  CardType,
  LevelStats,
  RawCardSeed,
} from './types';

/**
 * カードレベル（1〜5段階）から能力値を自動算出するSingle Source of Truthテーブル
 * 同じレベルの攻撃カードはすべて一律のHP・攻撃力・必要エネルギー・逃げるコストを持つ。
 */
export const LEVEL_STATS_TABLE: Record<CardLevel, LevelStats> = {
  1: {
    level: 1,
    hp: 60,
    attack: 30,
    energyCost: 1,
    retreatCost: 1,
    pointValue: 1,
  },
  2: {
    level: 2,
    hp: 80,
    attack: 50,
    energyCost: 2,
    retreatCost: 1,
    pointValue: 1,
  },
  3: {
    level: 3,
    hp: 100,
    attack: 70,
    energyCost: 2,
    retreatCost: 2,
    pointValue: 1,
  },
  4: {
    level: 4,
    hp: 130,
    attack: 100,
    energyCost: 3,
    retreatCost: 2,
    pointValue: 1,
  },
  5: {
    level: 5,
    hp: 160,
    attack: 130,
    energyCost: 4,
    retreatCost: 3,
    pointValue: 2,
  },
};

/**
 * 5段階の攻撃カード（Lv.1〜Lv.5）、魔法カード（Lv.1）、環境カード（Lv.1）の7種類のカラーテーマ定義
 */
export const ATTACK_LEVEL_COLORS: Record<CardLevel, CardColorTheme> = {
  1: {
    frameGradient: 'from-slate-600 via-slate-700 to-zinc-900',
    borderClass: 'border-slate-300',
    badgeBg: 'bg-slate-200',
    badgeText: 'text-slate-900',
    artGradient: 'from-slate-500 via-zinc-600 to-slate-900',
    accentHex: '#94a3b8',
    tierLabel: 'Lv.1 速攻',
  },
  2: {
    frameGradient: 'from-cyan-600 via-sky-700 to-slate-950',
    borderClass: 'border-cyan-300',
    badgeBg: 'bg-cyan-300',
    badgeText: 'text-cyan-950',
    artGradient: 'from-cyan-400 via-sky-600 to-blue-950',
    accentHex: '#06b6d4',
    tierLabel: 'Lv.2 標準',
  },
  3: {
    frameGradient: 'from-purple-600 via-violet-800 to-indigo-950',
    borderClass: 'border-purple-300',
    badgeBg: 'bg-purple-300',
    badgeText: 'text-purple-950',
    artGradient: 'from-purple-500 via-fuchsia-700 to-indigo-950',
    accentHex: '#a855f7',
    tierLabel: 'Lv.3 主力',
  },
  4: {
    frameGradient: 'from-rose-600 via-red-700 to-stone-950',
    borderClass: 'border-rose-300',
    badgeBg: 'bg-rose-300',
    badgeText: 'text-rose-950',
    artGradient: 'from-rose-500 via-red-600 to-amber-950',
    accentHex: '#f43f5e',
    tierLabel: 'Lv.4 強襲',
  },
  5: {
    frameGradient: 'from-amber-400 via-yellow-600 to-amber-950',
    borderClass: 'border-yellow-200',
    badgeBg: 'bg-yellow-300',
    badgeText: 'text-amber-950',
    artGradient: 'from-yellow-300 via-amber-500 to-orange-950',
    accentHex: '#f59e0b',
    tierLabel: 'Lv.5 EX級',
  },
};

export const SPELL_COLOR_THEME: CardColorTheme = {
  frameGradient: 'from-blue-600 via-indigo-700 to-blue-950',
  borderClass: 'border-blue-300',
  badgeBg: 'bg-blue-200',
  badgeText: 'text-blue-950',
  artGradient: 'from-blue-400 via-indigo-600 to-slate-950',
  accentHex: '#3b82f6',
  tierLabel: 'Lv.1 魔法',
};

export const ENVIRONMENT_COLOR_THEME: CardColorTheme = {
  frameGradient: 'from-emerald-600 via-teal-700 to-emerald-950',
  borderClass: 'border-emerald-300',
  badgeBg: 'bg-emerald-200',
  badgeText: 'text-emerald-950',
  artGradient: 'from-emerald-400 via-teal-600 to-stone-950',
  accentHex: '#10b981',
  tierLabel: 'Lv.1 環境',
};

export function getStatsForCard(type: CardType, level: CardLevel): LevelStats {
  if (type !== 'ATTACK') {
    return {
      level: 1,
      hp: 0,
      attack: 0,
      energyCost: 0,
      retreatCost: 0,
      pointValue: 0,
    };
  }
  return LEVEL_STATS_TABLE[level] || LEVEL_STATS_TABLE[1];
}

export function getColorThemeForCard(type: CardType, level: CardLevel): CardColorTheme {
  if (type === 'SPELL') return SPELL_COLOR_THEME;
  if (type === 'ENVIRONMENT') return ENVIRONMENT_COLOR_THEME;
  return ATTACK_LEVEL_COLORS[level] || ATTACK_LEVEL_COLORS[1];
}

/**
 * カード定義シードから正規化済みのCardDefinitionを生成する
 */
export function buildCardDefinition(seed: RawCardSeed): CardDefinition {
  const effectiveLevel: CardLevel = seed.type === 'ATTACK' ? seed.level : 1;
  const stats = getStatsForCard(seed.type, effectiveLevel);
  const colorTheme = getColorThemeForCard(seed.type, effectiveLevel);

  return {
    // 1. ID
    id: seed.id,
    // 2. 表示名
    name: seed.name,
    // 3. 種別
    type: seed.type,
    // 4. 進化関係
    evolution: seed.evolution,
    // 5. ステータス
    stats,
    // 6. 能力・効果
    abilities: seed.abilities,
    // 7. UI表示情報
    ui: seed.ui,
    colorTheme,

    // 互換プロパティ (すべて stats / abilities / ui の Single Source of Truth を参照)
    level: stats.level,
    hp: stats.hp,
    attack: stats.attack,
    energyCost: stats.energyCost,
    retreatCost: stats.retreatCost,
    pointValue: stats.pointValue,
    attackName: seed.abilities.attackName,
    description: seed.abilities.description,
    tags: seed.ui.tags,
    flavorText: seed.ui.flavorText,
    artSymbol: seed.ui.artSymbol,
    spellEffect: seed.abilities.spellEffect,
    environmentEffect: seed.abilities.environmentEffect,
  };
}
