export type CardType = 'ATTACK' | 'SPELL' | 'ENVIRONMENT';

export type CardLevel = 1 | 2 | 3 | 4 | 5;

export type SpellEffectKind =
  | 'DRAW_1'
  | 'SEARCH_ATTACK_CARD'
  | 'BONUS_ENERGY_ACTIVE'
  | 'BUFF_ATK_20'
  | 'BUFF_ATK_30'
  | 'HEAL_30_BUFF_10'
  | 'HEAL_20_SHIELD_20'
  | 'SHIELD_30'
  | 'DIRECT_DMG_20'
  | 'DRAIN_ENERGY_DMG_10'
  | 'SWAP_OPPONENT_BENCH'
  | 'PEEK_AND_DRAW';

export type EnvironmentEffectKind =
  | 'GROLAN_FULL_HEAL'
  | 'PHOENIX_WALL'
  | 'SENSOJI_BOOST'
  | 'SUMIDAGAWA_BOOST'
  | 'YUKIYA_ROOM_BOOST';

/**
 * カードの進化・系列関係を表す構造体
 * 「どの系列に属し、どのカードから進化し、次にどのカードへ進化するか」を一目で把握できる
 */
export interface EvolutionInfo {
  family: string;
  stage: 1 | 2 | 3 | 4;
  evolvesFrom: string | null;
  evolvesTo: string | null;
  triggerCardId?: string;
}

/**
 * カードのバトルステータス（レベルに応じた統一値）
 */
export interface LevelStats {
  level: CardLevel;
  hp: number;
  attack: number;
  energyCost: number;
  retreatCost: number;
  pointValue: number;
}

/**
 * カードの能力・わざ・固有効果情報
 */
export interface CardAbilities {
  attackName: string;
  description: string;
  passiveEffect?: string;
  activeEffect?: string;
  spellEffect?: SpellEffectKind;
  environmentEffect?: EnvironmentEffectKind;
}

/**
 * カードのUI表示・アート情報
 */
export interface CardUiMetadata {
  tags: string[];
  flavorText?: string;
  artSymbol: string;
}

export interface CardColorTheme {
  frameGradient: string;
  borderClass: string;
  badgeBg: string;
  badgeText: string;
  artGradient: string;
  accentHex: string;
  tierLabel: string;
}

/**
 * カード定義の入力シード
 * プロパティ順序:
 * 1. id -> 2. name -> 3. type -> 4. evolution -> 5. level (stats基準) -> 6. abilities -> 7. ui
 */
export interface RawCardSeed {
  id: string;
  name: string;
  type: CardType;
  evolution: EvolutionInfo;
  level: CardLevel;
  abilities: CardAbilities;
  ui: CardUiMetadata;
}

/**
 * ゲーム全体で参照される正規化済みカード定義 (Single Source of Truth)
 */
export interface CardDefinition {
  // 1. ID
  id: string;
  // 2. 表示名
  name: string;
  // 3. 種別
  type: CardType;
  // 4. 進化・系列情報
  evolution: EvolutionInfo;
  // 5. ステータス
  stats: LevelStats;
  // 6. 能力・効果
  abilities: CardAbilities;
  // 7. UI表示情報
  ui: CardUiMetadata;
  colorTheme: CardColorTheme;

  // 既存コード互換のフラットアクセサ (Single Source of Truth から自動導出)
  level: CardLevel;
  hp: number;
  attack: number;
  energyCost: number;
  retreatCost: number;
  pointValue: number;
  attackName: string;
  description: string;
  tags: string[];
  flavorText?: string;
  artSymbol: string;
  spellEffect?: SpellEffectKind;
  environmentEffect?: EnvironmentEffectKind;
}

export type CardZone = 'DECK' | 'HAND' | 'ACTIVE' | 'BENCH' | 'ENVIRONMENT' | 'TRASH';

export interface CardInstance {
  instanceId: string;
  definitionId: string;
  ownerId: string;
  zone: CardZone;
  benchIndex?: number;
  currentHp: number;
  maxHp: number;
  baseAtk: number;
  currentAtk: number;
  energyCost: number;
  retreatCost: number;
  attachedEnergy: number;
  tempAtkBuff: number;
  damageReductionNextTurn: number;
  summonTurn: number;
}

export interface MaskedCardInstance {
  instanceId: string;
  zone: CardZone;
  isFaceDown: true;
}
