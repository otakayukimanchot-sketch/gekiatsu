export type CardType = 'ATTACK' | 'SPELL' | 'ENVIRONMENT';

export type SpellSubType = 'NORMAL' | 'ATTACHMENT' | 'EVOLUTION';

export type EffectTrigger = 
  | 'ON_PLAY'
  | 'ON_ATTACK'
  | 'ON_DESTROY'
  | 'ON_TURN_START'
  | 'ON_TURN_END'
  | 'ON_DEFEND';

export type TargetType =
  | 'NONE'
  | 'ENEMY_CARD'
  | 'FRIENDLY_CARD'
  | 'ANY_CARD'
  | 'ENEMY_PLAYER'
  | 'FRIENDLY_PLAYER'
  | 'ALL_ENEMY_CARDS'
  | 'ALL_FRIENDLY_CARDS'
  | 'ALL_CARDS';

export interface CardEffect {
  id: string;
  trigger: EffectTrigger;
  targetType: TargetType;
  description: string;
  // Effect action payload
  damage?: number;
  healPlayer?: number;
  healCard?: number;
  drawCards?: number;
  buffAtk?: number;
  buffHp?: number;
  isRandom?: boolean;
  randomEffectType?: 'SHIRANKEDO' | 'COIN_FLIP';
  specialAction?: 'RESURRECT_ONCE' | 'DISCARD_RANDOM' | 'TAUNT' | 'CHARGE' | 'PIERCE_TAUNT';
}

export interface EvolutionRule {
  targetDefinitionId: string; // The card definition that this evolves into OR from
  fromDefinitionId?: string;  // Which card can be evolved from
  statBonusAtk?: number;
  statBonusHp?: number;
}

export interface AttachmentRule {
  allowedTarget: 'FRIENDLY_ATTACK' | 'ANY_ATTACK';
  atkBonus: number;
  hpBonus: number;
  grantTaunt?: boolean;
  grantCharge?: boolean;
  endTurnHeal?: number;
}

export interface CardDefinition {
  id: string;
  name: string;
  type: CardType;
  subType?: SpellSubType;
  cost: number;
  baseAtk?: number;
  baseHp?: number;
  tags: string[];
  description: string;
  flavorText?: string;
  artColor: string;
  artGradient: string;
  artSymbol: string;
  effects: CardEffect[];
  evolutionRule?: EvolutionRule;
  attachmentRule?: AttachmentRule;
  isEvolutionOnly?: boolean; // Cannot be placed in main deck directly if true
}

export type CardZone = 'DECK' | 'HAND' | 'FIELD' | 'ATTACHED' | 'GRAVEYARD' | 'EXILE';

export interface CardInstance {
  instanceId: string;
  definitionId: string;
  ownerId: string;
  zone: CardZone;
  slotIndex?: number; // 0..4 on FIELD
  currentHp: number;
  maxHp: number;
  currentAtk: number;
  baseAtk: number;
  canAttack: boolean;
  attacksThisTurn: number;
  summonTurn: number;
  attachedCards: CardInstance[];
  hostCardId?: string;
  hasResurrected?: boolean;
  isTaunt?: boolean;
  hasCharge?: boolean;
  canPierceTaunt?: boolean;
}

// Client-facing masked card for hidden zones (Opponent's Hand / Deck)
export interface MaskedCardInstance {
  instanceId: string;
  zone: CardZone;
  isFaceDown: true;
}
