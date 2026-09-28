export const RULES = {
  INITIAL_HP: 5000,
  STANDARD_DECK_SIZE: 40,
  MAX_SAME_CARD: 3,
  INITIAL_HAND_SIZE: 5,
  MAX_HAND_SIZE: 10,
  NORMAL_DRAW_COUNT: 1,
  FIELD_SLOTS_COUNT: 5,
  FIRST_PLAYER_FIRST_TURN_DRAWS: false,
  SECOND_PLAYER_FIRST_TURN_DRAWS: true,
  FIRST_PLAYER_CAN_ATTACK_TURN_1: true,
  DECK_OUT_LOSS: true,
  DISCARD_EXCESS_HAND_TO_GRAVEYARD: true,
} as const;

export function canCardAttackTarget(
  attackerCanAttack: boolean,
  attacksThisTurn: number,
  isTurnPlayer: boolean,
  phase: string
): { allowed: boolean; reason?: string } {
  if (!isTurnPlayer) {
    return { allowed: false, reason: 'あなたのターンではありません。' };
  }
  if (phase !== 'BATTLE' && phase !== 'MAIN') {
    return { allowed: false, reason: '現在攻撃できるフェーズではありません。' };
  }
  if (!attackerCanAttack) {
    return { allowed: false, reason: 'このカードは現在攻撃できません（召喚酔いまたは行動済み）。' };
  }
  if (attacksThisTurn >= 1) {
    return { allowed: false, reason: 'このターンはすでに攻撃済みです。' };
  }
  return { allowed: true };
}
