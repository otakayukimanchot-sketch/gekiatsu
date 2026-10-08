import {
  CardColorTheme,
  CardDefinition,
  CardElement,
  CardFaction,
  CardLevel,
  CardRarity,
  CardSetId,
  CardSubCategory,
  CardType,
  LevelStats,
  RawCardSeed,
} from './types';

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

export const ELEMENT_METADATA: Record<
  CardElement,
  { label: string; badgeClass: string; summary: string }
> = {
  FLAME: {
    label: '紅蓮',
    badgeClass: 'bg-orange-500/25 text-orange-200 border-orange-400/50',
    summary: '高火力・速攻・捨身アタック',
  },
  AQUA: {
    label: '蒼海',
    badgeClass: 'bg-sky-500/25 text-sky-200 border-sky-400/50',
    summary: '回復・手札補充・エネ妨害',
  },
  VERDANT: {
    label: '翠森',
    badgeClass: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50',
    summary: 'ベンチ展開・陣形強化・共鳴',
  },
  VOLT: {
    label: '紫電',
    badgeClass: 'bg-yellow-500/25 text-yellow-200 border-yellow-400/50',
    summary: 'エネ加速・超帯電・機動戦',
  },
  LIGHT: {
    label: '聖光',
    badgeClass: 'bg-amber-200/25 text-amber-100 border-amber-300/50',
    summary: '鉄壁ガード・軽減・全体支援',
  },
  ABYSS: {
    label: '深淵',
    badgeClass: 'bg-purple-500/25 text-purple-200 border-purple-400/50',
    summary: 'トラッシュ利用・背水・追撃',
  },
};

export const RARITY_METADATA: Record<
  CardRarity,
  { label: string; shortLabel: string; badgeClass: string }
> = {
  COMMON: {
    label: 'コモン',
    shortLabel: 'C',
    badgeClass: 'bg-slate-700 text-slate-200 border-slate-500',
  },
  UNCOMMON: {
    label: 'アンコモン',
    shortLabel: 'UC',
    badgeClass: 'bg-emerald-800 text-emerald-200 border-emerald-500',
  },
  RARE: {
    label: 'レア',
    shortLabel: 'R',
    badgeClass: 'bg-sky-700 text-sky-100 border-sky-400',
  },
  EPIC: {
    label: 'エピック',
    shortLabel: 'SR',
    badgeClass: 'bg-purple-700 text-purple-100 border-purple-300',
  },
  LEGENDARY: {
    label: 'レジェンダリー',
    shortLabel: 'SSR',
    badgeClass: 'bg-amber-500 text-stone-950 border-yellow-200',
  },
  MYTHIC: {
    label: 'ミシック',
    shortLabel: 'UR',
    badgeClass: 'bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400 text-stone-950 border-white',
  },
};

export const SET_METADATA: Record<
  CardSetId,
  { id: CardSetId; code: string; name: string; themeDescription: string }
> = {
  SET_000_ORIGIN: {
    id: 'SET_000_ORIGIN',
    code: 'SET-000',
    name: '原初の学園伝承',
    themeDescription: 'ホンモノカードバトルの伝統と新戦力が融合したオールスター収録セット。',
  },
  SET_001_DAWN: {
    id: 'SET_001_DAWN',
    code: 'SET-001',
    name: '始まりの大地',
    themeDescription: '紅蓮・翠森・蒼海の基礎シナジーと陣形・共鳴戦術を収録した基本拡張セット。',
  },
  SET_002_CYBER: {
    id: 'SET_002_CYBER',
    code: 'SET-002',
    name: '機巧都市アーク',
    themeDescription: '紫電・聖光を中心としたエネルギー加速・超帯電・装備強化メカニクス。',
  },
  SET_003_ABYSS: {
    id: 'SET_003_ABYSS',
    code: 'SET-003',
    name: '深淵の夜想曲',
    themeDescription: '深淵・紅蓮によるトラッシュ参照、背水強化、ベンチ狙撃、捨身コンボ。',
  },
  SET_004_SKY: {
    id: 'SET_004_SKY',
    code: 'SET-004',
    name: '天空の遺跡',
    themeDescription: '全6属性のレジェンド・ミシック級守護者と多属性連携スペルを集結。',
  },
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
  return ATTACK_LEVEL_COLORS[level] || ATTACK_LEVEL_COLORS[1];
}

let autoCollectionCounter = 1;

export function resetCollectionCounter() {
  autoCollectionCounter = 1;
}

function inferDefaultRarity(type: CardType, level: CardLevel): CardRarity {
  if (type !== 'ATTACK') return 'RARE';
  if (level === 1) return 'COMMON';
  if (level === 2) return 'UNCOMMON';
  if (level === 3) return 'RARE';
  if (level === 4) return 'EPIC';
  return 'LEGENDARY';
}

function inferDefaultElement(seed: RawCardSeed): CardElement {
  const sym = seed.ui.artSymbol;
  if (sym === 'Flame' || sym === 'Sword') return 'FLAME';
  if (sym === 'Zap') return 'VOLT';
  if (sym === 'Shield' || sym === 'Crown') return 'LIGHT';
  if (sym === 'Trees' || sym === 'Crosshair') return 'VERDANT';
  if (sym === 'Skull' || sym === 'HelpCircle' || sym === 'Lock') return 'ABYSS';
  return 'AQUA';
}

function inferSubCategory(seed: RawCardSeed): CardSubCategory {
  if (seed.type === 'SPELL') {
    if (
      seed.abilities.spellEffect === 'BUFF_ATK_20' ||
      seed.abilities.spellEffect === 'BUFF_ATK_30' ||
      seed.abilities.spellEffect === 'EQUIP_ARMOR_HP_20_SHIELD_20' ||
      seed.abilities.spellEffect === 'EQUIP_BLADE_ATK_25_ENERGY_1'
    ) {
      return 'EQUIPMENT_SPELL';
    }
    return 'SUPPORT_SPELL';
  }
  if (seed.level === 5) return 'LEGEND_UNIT';
  if (seed.level >= 3) return 'ADVANCED_UNIT';
  return 'BASIC_UNIT';
}

export function buildCardDefinition(seed: RawCardSeed): CardDefinition {
  const effectiveLevel: CardLevel = seed.type === 'ATTACK' ? seed.level : 1;
  const stats = getStatsForCard(seed.type, effectiveLevel);
  const colorTheme = getColorThemeForCard(seed.type, effectiveLevel);

  const rarity = seed.rarity || inferDefaultRarity(seed.type, effectiveLevel);
  const element = seed.element || inferDefaultElement(seed);
  const faction: CardFaction = seed.faction || '連邦学園';
  const setId: CardSetId = seed.setId || 'SET_000_ORIGIN';
  const subCategory = seed.subCategory || inferSubCategory(seed);
  const collectionNumber = seed.collectionNumber ?? autoCollectionCounter++;

  const hasSkillBonus =
    (seed.abilities.onPlaySkill && seed.abilities.onPlaySkill !== 'NONE') ||
    (seed.abilities.combatSkill && seed.abilities.combatSkill !== 'NONE')
      ? 15
      : 0;
  const balanceScore =
    seed.type === 'ATTACK'
      ? Math.round(stats.hp * 0.5 + stats.attack * 0.8 - stats.energyCost * 12 + hasSkillBonus)
      : 65;

  return {
    id: seed.id,
    collectionNumber,
    setId,
    name: seed.name,
    type: seed.type,
    subCategory,
    rarity,
    element,
    faction,
    keywords: seed.keywords || [],
    archetypes: seed.archetypes || ['CLASSIC'],
    evolution: seed.evolution,
    stats,
    abilities: seed.abilities,
    ui: seed.ui,
    colorTheme,
    balanceScore,

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
  };
}
