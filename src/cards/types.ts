export type CardType = 'ATTACK' | 'SPELL';

export type CardLevel = 1 | 2 | 3 | 4 | 5;

export type CardRarity =
  | 'COMMON'
  | 'UNCOMMON'
  | 'RARE'
  | 'EPIC'
  | 'LEGENDARY'
  | 'MYTHIC';

export type CardElement =
  | 'FLAME'   // 紅蓮 (高火力・速攻・リスク＆リターン)
  | 'AQUA'    // 蒼海 (回復・コントロール・手札補充・妨害)
  | 'VERDANT' // 翠森 (ベンチ展開・全体強化・成長シナジー)
  | 'VOLT'    // 紫電 (エネルギー加速・機動力・超帯電)
  | 'LIGHT'   // 聖光 (シールド防御・支援・ダメージ軽減)
  | 'ABYSS';  // 深淵 (トラッシュ利用・背水・手札干渉)

export type CardFaction =
  | '連邦学園'
  | '紅蓮騎士団'
  | '蒼海魔導院'
  | '翠緑獣王連'
  | '機巧都市アーク'
  | '黄昏影教団'
  | '天空聖域';

export type CardSetId =
  | 'SET_000_ORIGIN' // Set 000: 原初の学園伝承
  | 'SET_001_DAWN'   // Set 001: 始まりの大地
  | 'SET_002_CYBER'  // Set 002: 機巧都市アーク
  | 'SET_003_ABYSS'  // Set 003: 深淵の夜想曲
  | 'SET_004_SKY';   // Set 004: 天空の遺跡

export type CardSubCategory =
  | 'BASIC_UNIT'      // 基本ユニット
  | 'ADVANCED_UNIT'   // 上位ユニット
  | 'LEGEND_UNIT'     // レジェンド級ユニット
  | 'SUPPORT_SPELL'   // サポートカード
  | 'EQUIPMENT_SPELL' // 装備カード
  | 'EVENT_SPELL'     // イベント/スペル
  | 'SPECIAL_TECH';   // 特殊戦術カード

export type DeckArchetypeId =
  | 'CLASSIC'
  | 'AGGRO'
  | 'MIDRANGE'
  | 'CONTROL'
  | 'COMBO'
  | 'SWARM'
  | 'DEFENSIVE'
  | 'RAMP'
  | 'DISCARD'
  | 'RECOVERY'
  | 'RISK_REWARD';

export type OnPlayUnitSkill =
  | 'NONE'
  | 'DRAW_1'
  | 'GAIN_ENERGY_1'
  | 'BOOST_BENCH_ENERGY'
  | 'HEAL_ACTIVE_20'
  | 'HEAL_ALL_15'
  | 'PING_ENEMY_15'
  | 'SHIELD_ACTIVE_20'
  | 'BUFF_ACTIVE_20'
  | 'RECYCLE_TRASH_UNIT'
  | 'SYNERGY_ELEMENT_DRAW'
  | 'SYNERGY_SWARM_ENERGY';

export type CombatUnitSkill =
  | 'NONE'
  | 'INSTANT_KILL_SHOCHAN'    // もえきゅん: しょーちゃんに対して即死ダメージ
  | 'INSTANT_KILL_MUE'        // りょち: ムエに対して即死ダメージ
  | 'BERSERK_LOW_HP_30'       // 背水: HP50%以下でダメージ+30
  | 'SWARM_BONUS_10_PER_BENCH'// 陣形: ベンチ1体につきダメージ+10
  | 'HAND_SCALE_BONUS_20'     // 叡智: 手札4枚以上でダメージ+20
  | 'TRASH_SCALE_BONUS_25'    // 深淵: トラッシュ3枚以上でダメージ+25
  | 'ENERGY_OVERFLOW_20'      // 超帯電: 余剰エネルギー1個につきダメージ+20
  | 'DRAIN_HEAL_20'           // 吸収: 攻撃時HP20回復
  | 'PIERCE_SHIELD_15'        // 貫通: ダメージ軽減を貫通し+15
  | 'COUNTER_ARMOR_15'        // 鉄壁: 被ダメージ常時-15
  | 'SNIPE_BENCH_15'          // 追撃: 攻撃時相手ベンチ1体にも15ダメージ
  | 'GAMBLE_STRIKE_30'        // 捨身: 攻撃時自傷10でダメージ+30
  | 'ELEMENT_RESONANCE_20'    // 共鳴: ベンチに同属性がいればダメージ+20
  | 'GIANT_SLAYER_30';        // 巨竜狩り: 相手がLv.4以上ならダメージ+30

export type SpellEffectKind =
  | 'DRAW_1'
  | 'DRAW_2_IF_LOW_HAND'
  | 'SEARCH_ATTACK_CARD'
  | 'SEARCH_LOW_COST_2'
  | 'SEARCH_HIGH_LEVEL_UNIT'
  | 'RECYCLE_TRASH_2'
  | 'BONUS_ENERGY_ACTIVE'
  | 'BONUS_ENERGY_BENCH'
  | 'SURGE_ENERGY_IF_SWARM'
  | 'BUFF_ATK_20'
  | 'BUFF_ATK_30'
  | 'OVERDRIVE_ATK_40_SELF_15'
  | 'EQUIP_ARMOR_HP_20_SHIELD_20'
  | 'EQUIP_BLADE_ATK_25_ENERGY_1'
  | 'HEAL_30_BUFF_10'
  | 'HEAL_ALL_25'
  | 'FULL_HEAL_ALL'
  | 'HEAL_20_SHIELD_20'
  | 'SHIELD_30'
  | 'DIRECT_DMG_20'
  | 'DIRECT_DMG_30'
  | 'DIRECT_DMG_30_IF_TRASH_3'
  | 'BENCH_STORM_15_ALL'
  | 'DRAIN_ENERGY_DMG_10'
  | 'SWAP_OPPONENT_BENCH'
  | 'PEEK_AND_DRAW'
  | 'HAND_RELOAD_3'
  | 'PHOENIX_WALL_TOKEN'
  | 'FREE_RETREAT_THIS_TURN';

export interface EvolutionInfo {
  family: string;
  stage: 1 | 2 | 3 | 4;
  evolvesFrom: string | null;
  evolvesTo: string | null;
  triggerCardId?: string;
}

export interface LevelStats {
  level: CardLevel;
  hp: number;
  attack: number;
  energyCost: number;
  retreatCost: number;
  pointValue: number;
}

export interface CardAbilities {
  attackName: string;
  description: string;
  passiveEffect?: string;
  activeEffect?: string;
  onPlaySkill?: OnPlayUnitSkill;
  combatSkill?: CombatUnitSkill;
  spellEffect?: SpellEffectKind;
}

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

export interface RawCardSeed {
  id: string;
  name: string;
  type: CardType;
  evolution: EvolutionInfo;
  level: CardLevel;
  abilities: CardAbilities;
  ui: CardUiMetadata;
  // Optional extended metadata (auto-populated if omitted)
  collectionNumber?: number;
  setId?: CardSetId;
  rarity?: CardRarity;
  element?: CardElement;
  faction?: CardFaction;
  subCategory?: CardSubCategory;
  keywords?: string[];
  archetypes?: DeckArchetypeId[];
}

export interface CardDefinition {
  id: string;
  collectionNumber: number;
  setId: CardSetId;
  name: string;
  type: CardType;
  subCategory: CardSubCategory;
  rarity: CardRarity;
  element: CardElement;
  faction: CardFaction;
  keywords: string[];
  archetypes: DeckArchetypeId[];
  evolution: EvolutionInfo;
  stats: LevelStats;
  abilities: CardAbilities;
  ui: CardUiMetadata;
  colorTheme: CardColorTheme;
  balanceScore: number;

  // Flat accessors (Single Source of Truth)
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
}

export type CardZone = 'DECK' | 'HAND' | 'ACTIVE' | 'BENCH' | 'TRASH';

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
