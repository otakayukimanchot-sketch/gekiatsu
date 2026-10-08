import {
  AnimationEventType,
  GameActionPayload,
  GameState,
  PlayerBattleState,
  PlayerKey,
} from '../types';
import { CardInstance } from '../../cards/types';
import { getCardDefinition } from '../../cards/cardRegistry';
import { buildInitialDeckAndSetup, createCardInstance } from './deckBuilder';

let logIdCounter = 1;

function addLog(
  state: GameState,
  actorId: string,
  actorName: string,
  type: AnimationEventType | 'TURN_END' | 'SURRENDER',
  message: string,
  cardName?: string,
  targetName?: string,
  value?: number
) {
  state.logs.push({
    id: `log_${Date.now()}_${logIdCounter++}`,
    timestamp: Date.now(),
    turnNumber: state.turnNumber,
    actorPlayerId: actorId,
    actorPlayerName: actorName,
    type,
    message,
    cardName,
    targetName,
    value,
  });
}

function setAnimation(
  state: GameState,
  type: AnimationEventType,
  actorPlayerId: string,
  extra: Partial<NonNullable<GameState['lastAnimation']>> = {}
) {
  state.lastAnimation = {
    id: `anim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type,
    actorPlayerId,
    timestamp: Date.now(),
    ...extra,
  };
}

/**
 * 場のカード（バトル場・ベンチ）の現在攻撃力を再計算する
 * 環境カードや一時バフを反映する
 */
export function recalculateDynamicStats(state: GameState) {
  const envDef = state.environment
    ? getCardDefinition(state.environment.cardInstance.definitionId)
    : undefined;
  const envEffect = envDef?.abilities.environmentEffect;

  const updatePlayerCards = (player: PlayerBattleState) => {
    const allField = [player.activeCard, ...player.bench].filter(Boolean);
    for (const card of allField) {
      if (!card) continue;
      const cardDef = getCardDefinition(card.definitionId);
      let envBonus = 0;

      if (envEffect === 'SENSOJI_BOOST') {
        if (cardDef?.evolution.family === 'つだぬまず系列') {
          envBonus = 20;
        } else {
          envBonus = 10;
        }
      } else if (envEffect === 'SUMIDAGAWA_BOOST' || envEffect === 'YUKIYA_ROOM_BOOST') {
        envBonus = 10;
      }

      card.currentAtk = card.baseAtk + card.tempAtkBuff + envBonus;
    }
  };

  updatePlayerCards(state.playerA);
  updatePlayerCards(state.playerB);
}

/**
 * 攻撃カードが与える最終ダメージを計算する
 */
export function calculateCardDamage(
  state: GameState,
  attackerCard: CardInstance,
  defenderCard: CardInstance
): number {
  const envDef = state.environment
    ? getCardDefinition(state.environment.cardInstance.definitionId)
    : undefined;
  const envShield = envDef?.abilities.environmentEffect === 'PHOENIX_WALL' ? 10 : 0;
  const totalReduction = defenderCard.damageReductionNextTurn + envShield;
  return Math.max(10, attackerCard.currentAtk - totalReduction);
}

export function initializeGame(
  gameId: string,
  roomId: string,
  pA: { playerId: string; name: string; socketId: string; avatarIcon: string },
  pB: { playerId: string; name: string; socketId: string; avatarIcon: string },
  customDeckA?: string[],
  customDeckB?: string[]
): GameState {
  const setupA = buildInitialDeckAndSetup(pA.playerId, customDeckA);
  const setupB = buildInitialDeckAndSetup(pB.playerId, customDeckB);

  const firstPlayerKey: PlayerKey = Math.random() < 0.5 ? 'playerA' : 'playerB';

  const playerA: PlayerBattleState = {
    playerId: pA.playerId,
    name: pA.name,
    socketId: pA.socketId,
    avatarIcon: pA.avatarIcon,
    score: 0,
    maxScore: 3,
    activeCard: setupA.activeCard,
    bench: [null, null, null],
    hand: setupA.hand,
    deck: setupA.deck,
    trash: [],
    energyAvailable: 0,
    hasAttachedEnergyThisTurn: false,
    hasRetreatedThisTurn: false,
    hasUsedSpellThisTurn: false,
    isConnected: true,
  };

  const playerB: PlayerBattleState = {
    playerId: pB.playerId,
    name: pB.name,
    socketId: pB.socketId,
    avatarIcon: pB.avatarIcon,
    score: 0,
    maxScore: 3,
    activeCard: setupB.activeCard,
    bench: [null, null, null],
    hand: setupB.hand,
    deck: setupB.deck,
    trash: [],
    energyAvailable: 0,
    hasAttachedEnergyThisTurn: false,
    hasRetreatedThisTurn: false,
    hasUsedSpellThisTurn: false,
    isConnected: true,
  };

  const state: GameState = {
    gameId,
    roomId,
    phase: 'MAIN',
    turnNumber: 0,
    activePlayerKey: firstPlayerKey,
    firstPlayerKey,
    playerA,
    playerB,
    environment: null,
    stateVersion: 1,
    logs: [],
    lastActionTimestamp: Date.now(),
  };

  const firstPlayer = state[firstPlayerKey];
  addLog(
    state,
    firstPlayer.playerId,
    firstPlayer.name,
    'GAME_START',
    `バトル開始！先攻は ${firstPlayer.name} です。（3ポイント先取で勝利）`
  );

  startTurn(state, firstPlayerKey);

  return state;
}

export function startTurn(state: GameState, nextPlayerKey: PlayerKey) {
  if (state.phase === 'GAME_OVER') return;

  state.turnNumber += 1;
  state.activePlayerKey = nextPlayerKey;
  state.phase = 'MAIN';
  state.promotionRequiredPlayerKey = undefined;

  const activePlayer = state[nextPlayerKey];
  const prevPlayerKey: PlayerKey = nextPlayerKey === 'playerA' ? 'playerB' : 'playerA';
  const prevPlayer = state[prevPlayerKey];

  [prevPlayer.activeCard, ...prevPlayer.bench].forEach((c) => {
    if (c) c.tempAtkBuff = 0;
  });

  [activePlayer.activeCard, ...activePlayer.bench].forEach((c) => {
    if (c) {
      c.tempAtkBuff = 0;
      c.damageReductionNextTurn = 0;
    }
  });

  activePlayer.energyAvailable = 1;
  activePlayer.hasAttachedEnergyThisTurn = false;
  activePlayer.hasRetreatedThisTurn = false;
  activePlayer.hasUsedSpellThisTurn = false;

  const envDef = state.environment
    ? getCardDefinition(state.environment.cardInstance.definitionId)
    : undefined;

  if (
    envDef?.abilities.environmentEffect === 'GROLAN_FULL_HEAL' &&
    activePlayer.activeCard &&
    activePlayer.activeCard.currentHp < activePlayer.activeCard.maxHp
  ) {
    const before = activePlayer.activeCard.currentHp;
    activePlayer.activeCard.currentHp = Math.min(
      activePlayer.activeCard.maxHp,
      activePlayer.activeCard.currentHp + 10
    );
    const healed = activePlayer.activeCard.currentHp - before;
    if (healed > 0) {
      const activeDef = getCardDefinition(activePlayer.activeCard.definitionId);
      addLog(
        state,
        activePlayer.playerId,
        activePlayer.name,
        'HEAL',
        `環境「グロラン」のコーヒー効果で「${activeDef?.name}」のHPが${healed}回復！`,
        activeDef?.name,
        undefined,
        healed
      );
    }
  }

  if (activePlayer.deck.length > 0) {
    const drawn = activePlayer.deck.shift()!;
    drawn.zone = 'HAND';
    activePlayer.hand.push(drawn);
    addLog(
      state,
      activePlayer.playerId,
      activePlayer.name,
      'DRAW',
      `ターン${state.turnNumber}: ${activePlayer.name} がカードを1枚ドロー＆エネルギー＋1獲得！`
    );
    setAnimation(state, 'DRAW', activePlayer.playerId, {
      sourceCardId: drawn.instanceId,
    });
  } else {
    addLog(
      state,
      activePlayer.playerId,
      activePlayer.name,
      'DRAW',
      `ターン${state.turnNumber}: ${activePlayer.name} のターン開始（山札0枚・エネルギー＋1獲得）`
    );
  }

  recalculateDynamicStats(state);
}

/**
 * バトル場のカードがHP0以下になった際の気絶（ノックアウト）・ポイント加算・勝敗／ベンチ繰り出し処理
 */
function handleKnockoutAndTurnTransition(
  state: GameState,
  attackerKey: PlayerKey,
  defenderKey: PlayerKey,
  endTurnAfterCompare: boolean
) {
  const attacker = state[attackerKey];
  const defender = state[defenderKey];
  const knockedCard = defender.activeCard;

  if (!knockedCard || knockedCard.currentHp > 0) {
    if (endTurnAfterCompare) {
      startTurn(state, defenderKey);
    }
    return;
  }

  const knockedDef = getCardDefinition(knockedCard.definitionId);
  const pointsGained = knockedDef?.stats.pointValue || 1;

  knockedCard.currentHp = 0;
  knockedCard.attachedEnergy = 0;
  knockedCard.tempAtkBuff = 0;
  knockedCard.damageReductionNextTurn = 0;
  knockedCard.zone = 'TRASH';
  defender.trash.push(knockedCard);
  defender.activeCard = null;

  attacker.score = Math.min(attacker.maxScore, attacker.score + pointsGained);

  addLog(
    state,
    attacker.playerId,
    attacker.name,
    'KNOCKOUT',
    `「${knockedDef?.name}」がきぜつ！ ${attacker.name} が ${pointsGained} ポイント獲得！（合計 ${attacker.score}/${attacker.maxScore} pt）`,
    knockedDef?.name,
    undefined,
    pointsGained
  );

  setAnimation(state, 'KNOCKOUT', attacker.playerId, {
    targetCardId: knockedCard.instanceId,
    cardName: knockedDef?.name,
    pointsGained,
  });

  if (attacker.score >= attacker.maxScore) {
    state.phase = 'GAME_OVER';
    state.winnerPlayerId = attacker.playerId;
    state.winReason = `${attacker.name} が先に ${attacker.maxScore} ポイントを獲得して勝利！`;
    addLog(state, attacker.playerId, attacker.name, 'GAME_OVER', state.winReason);
    return;
  }

  const availableBenchIndices = defender.bench
    .map((c, idx) => (c !== null ? idx : -1))
    .filter((idx) => idx !== -1);

  if (availableBenchIndices.length === 0) {
    state.phase = 'GAME_OVER';
    state.winnerPlayerId = attacker.playerId;
    state.winReason = `${defender.name} のベンチに控えカードがいなくなったため、${attacker.name} の勝利！`;
    addLog(state, attacker.playerId, attacker.name, 'GAME_OVER', state.winReason);
    return;
  }

  if (availableBenchIndices.length === 1) {
    const idx = availableBenchIndices[0];
    const promoted = defender.bench[idx]!;
    defender.bench[idx] = null;
    promoted.zone = 'ACTIVE';
    promoted.benchIndex = undefined;
    defender.activeCard = promoted;

    const promotedDef = getCardDefinition(promoted.definitionId);
    addLog(
      state,
      defender.playerId,
      defender.name,
      'PROMOTE',
      `${defender.name} はベンチから「${promotedDef?.name}」をバトル場に出した！`,
      promotedDef?.name
    );

    recalculateDynamicStats(state);
    if (endTurnAfterCompare) {
      startTurn(state, defenderKey);
    }
    return;
  }

  state.phase = 'WAITING_FOR_PROMOTION';
  state.promotionRequiredPlayerKey = defenderKey;
  addLog(
    state,
    defender.playerId,
    defender.name,
    'PROMOTE',
    `${defender.name} はベンチから次に出すバトルカードを選択してください。`
  );
}

/**
 * 1. バトル場へのカード配置処理（基礎カードのみ直接配置可能）
 */
function playCardToActive(
  state: GameState,
  player: PlayerBattleState,
  cardInstanceId?: string
): { success: boolean; error?: string } {
  if (player.activeCard !== null) {
    return { success: false, error: 'バトル場には既にカードがいます。ベンチに出してください。' };
  }
  const handIdx = player.hand.findIndex((c) => c.instanceId === cardInstanceId);
  if (handIdx === -1) {
    return { success: false, error: '手札にそのカードがありません。' };
  }
  const card = player.hand[handIdx];
  const def = getCardDefinition(card.definitionId);
  if (!def || def.type !== 'ATTACK') {
    return { success: false, error: 'バトル場に出せるのは攻撃カードのみです。' };
  }
  if (def.evolution.evolvesFrom !== null) {
    const baseDef = getCardDefinition(def.evolution.evolvesFrom);
    return {
      success: false,
      error: `「${def.name}」は進化カードです。場の「${baseDef?.name || '進化元'}」に重ねて進化させてください。`,
    };
  }

  player.hand.splice(handIdx, 1);
  card.zone = 'ACTIVE';
  card.summonTurn = state.turnNumber;
  player.activeCard = card;

  recalculateDynamicStats(state);
  addLog(
    state,
    player.playerId,
    player.name,
    'PLAY_CARD',
    `${player.name} がバトル場に「${def.name}」(Lv.${def.stats.level}) を出した！`,
    def.name
  );
  setAnimation(state, 'PLAY_CARD', player.playerId, {
    sourceCardId: card.instanceId,
    cardName: def.name,
  });
  return { success: true };
}

/**
 * 2. ベンチへのカード配置処理（基礎カードのみ直接配置可能）
 */
function playCardToBench(
  state: GameState,
  player: PlayerBattleState,
  cardInstanceId?: string,
  benchIndex?: number
): { success: boolean; error?: string } {
  const handIdx = player.hand.findIndex((c) => c.instanceId === cardInstanceId);
  if (handIdx === -1) {
    return { success: false, error: '手札にそのカードがありません。' };
  }
  const card = player.hand[handIdx];
  const def = getCardDefinition(card.definitionId);
  if (!def || def.type !== 'ATTACK') {
    return { success: false, error: 'ベンチに出せるのは攻撃カードのみです。' };
  }
  if (def.evolution.evolvesFrom !== null) {
    const baseDef = getCardDefinition(def.evolution.evolvesFrom);
    return {
      success: false,
      error: `「${def.name}」は進化カードです。直接ベンチには出せません（「${baseDef?.name || '進化元'}」から進化可能）。`,
    };
  }

  if (player.activeCard === null) {
    return playCardToActive(state, player, cardInstanceId);
  }

  let targetSlot = benchIndex;
  if (targetSlot === undefined || player.bench[targetSlot] !== null) {
    targetSlot = player.bench.findIndex((b) => b === null);
  }
  if (targetSlot === -1 || targetSlot < 0 || targetSlot > 2) {
    return { success: false, error: 'ベンチが満員です（最大3体まで）。' };
  }

  player.hand.splice(handIdx, 1);
  card.zone = 'BENCH';
  card.benchIndex = targetSlot;
  card.summonTurn = state.turnNumber;
  player.bench[targetSlot] = card;

  recalculateDynamicStats(state);
  addLog(
    state,
    player.playerId,
    player.name,
    'PLAY_CARD',
    `${player.name} がベンチに「${def.name}」(Lv.${def.stats.level}) を出した！`,
    def.name
  );
  setAnimation(state, 'PLAY_CARD', player.playerId, {
    sourceCardId: card.instanceId,
    cardName: def.name,
  });
  return { success: true };
}

/**
 * 2-B. 進化判定ヘルパー関数 (canEvolveCard)
 * - 進化カード（evolvesFrom !== null）であること
 * - 進化元の definitionId が evolvesFrom と完全一致すること（段階飛ばし不可）
 * - 出したばかり・またはこのターン既に進化したカード（baseCard.summonTurn >= currentTurn）ではないこと
 */
export function canEvolveCard(
  baseCard: CardInstance | null | undefined,
  evolutionCard: CardInstance | null | undefined,
  currentTurn: number
): { ok: boolean; reason?: string } {
  if (!baseCard || !evolutionCard) {
    return { ok: false, reason: '進化対象のカードが選択されていません。' };
  }
  const evoDef = getCardDefinition(evolutionCard.definitionId);
  const baseDef = getCardDefinition(baseCard.definitionId);
  if (!evoDef || evoDef.type !== 'ATTACK' || !evoDef.evolution.evolvesFrom) {
    return { ok: false, reason: 'このカードは進化カードではありません。' };
  }
  const requiredBaseDef = getCardDefinition(evoDef.evolution.evolvesFrom);
  if (!baseDef || baseCard.definitionId !== evoDef.evolution.evolvesFrom) {
    return {
      ok: false,
      reason: `「${evoDef.name}」は「${requiredBaseDef?.name || '対応する基礎カード'}」からのみ進化できます。`,
    };
  }
  if (baseCard.summonTurn >= currentTurn) {
    return {
      ok: false,
      reason: `場に出したターンや、このターン既に進化した「${baseDef.name}」はすぐには進化できません（次の自分のターンから進化可能）。`,
    };
  }
  return { ok: true };
}

/**
 * 2-C. 場のカード（バトル場またはベンチ）を進化させる処理
 */
function evolveFieldCard(
  state: GameState,
  player: PlayerBattleState,
  cardInstanceId?: string,
  targetCardInstanceId?: string
): { success: boolean; error?: string } {
  const handIdx = player.hand.findIndex((c) => c.instanceId === cardInstanceId);
  if (handIdx === -1) {
    return { success: false, error: '手札にその進化カードがありません。' };
  }
  const evoCard = player.hand[handIdx];
  const evoDef = getCardDefinition(evoCard.definitionId);
  if (!evoDef || evoDef.type !== 'ATTACK' || !evoDef.evolution.evolvesFrom) {
    return { success: false, error: '選択されたカードは進化カードではありません。' };
  }

  let targetCard: CardInstance | null = null;
  if (targetCardInstanceId) {
    if (player.activeCard?.instanceId === targetCardInstanceId) {
      targetCard = player.activeCard;
    } else {
      targetCard = player.bench.find((b) => b?.instanceId === targetCardInstanceId) || null;
    }
  } else {
    // ターゲット未指定の場合は進化可能な自分の場のカードを自動検索
    const candidates = [player.activeCard, ...player.bench].filter((c): c is CardInstance =>
      Boolean(c && canEvolveCard(c, evoCard, state.turnNumber).ok)
    );
    if (candidates.length > 0) {
      targetCard = candidates[0];
    }
  }

  if (!targetCard) {
    const reqDef = getCardDefinition(evoDef.evolution.evolvesFrom);
    return {
      success: false,
      error: `進化元となる「${reqDef?.name || '基礎カード'}」（前のターン以前に出たカード）が場にいません。`,
    };
  }

  const check = canEvolveCard(targetCard, evoCard, state.turnNumber);
  if (!check.ok) {
    return { success: false, error: check.reason };
  }

  const oldDef = getCardDefinition(targetCard.definitionId);
  const damageTaken = Math.max(0, targetCard.maxHp - targetCard.currentHp);

  // 手札から進化カードを消費
  player.hand.splice(handIdx, 1);

  // 場のカードインスタンスのステータスを進化後の定義へ更新（付与エネルギーや被ダメージ量を維持）
  targetCard.definitionId = evoDef.id;
  targetCard.maxHp = evoDef.hp;
  targetCard.currentHp = Math.max(10, evoDef.hp - damageTaken);
  targetCard.baseAtk = evoDef.attack;
  targetCard.currentAtk = evoDef.attack;
  targetCard.energyCost = evoDef.energyCost;
  targetCard.retreatCost = evoDef.retreatCost;
  targetCard.summonTurn = state.turnNumber; // 同一ターン内の連続2段階進化を防止

  recalculateDynamicStats(state);

  addLog(
    state,
    player.playerId,
    player.name,
    'EVOLVE',
    `${player.name} の「${oldDef?.name}」が「${evoDef.name}」(Lv.${evoDef.level}) に進化した！（HP: ${targetCard.currentHp}/${targetCard.maxHp}・攻撃力: ${targetCard.currentAtk}）`,
    evoDef.name,
    oldDef?.name
  );
  setAnimation(state, 'EVOLVE', player.playerId, {
    sourceCardId: evoCard.instanceId,
    targetCardId: targetCard.instanceId,
    cardName: evoDef.name,
  });

  return { success: true };
}

/**
 * 3. エネルギー付与処理
 */
function attachEnergyToCard(
  state: GameState,
  player: PlayerBattleState,
  targetCardInstanceId?: string
): { success: boolean; error?: string } {
  if (player.hasAttachedEnergyThisTurn || player.energyAvailable <= 0) {
    return { success: false, error: 'エネルギーは1ターンに1回だけ付与できます。' };
  }

  let targetCard =
    player.activeCard?.instanceId === targetCardInstanceId
      ? player.activeCard
      : player.bench.find((b) => b?.instanceId === targetCardInstanceId) || null;

  if (!targetCard && !targetCardInstanceId && player.activeCard) {
    targetCard = player.activeCard;
  }

  if (!targetCard) {
    return { success: false, error: 'エネルギーを付ける自分の場のカードを選択してください。' };
  }

  targetCard.attachedEnergy += 1;
  player.energyAvailable = 0;
  player.hasAttachedEnergyThisTurn = true;

  const targetDef = getCardDefinition(targetCard.definitionId);
  addLog(
    state,
    player.playerId,
    player.name,
    'ATTACH_ENERGY',
    `${player.name} が「${targetDef?.name}」にエネルギーを付けた！（合計 ${targetCard.attachedEnergy}/${targetCard.energyCost}）`,
    targetDef?.name,
    undefined,
    targetCard.attachedEnergy
  );
  setAnimation(state, 'ATTACH_ENERGY', player.playerId, {
    targetCardId: targetCard.instanceId,
    cardName: targetDef?.name,
  });
  return { success: true };
}

/**
 * 4. バトル場のカードをベンチと入れ替える（にげる）処理
 */
function retreatActiveCard(
  state: GameState,
  player: PlayerBattleState,
  benchIndex?: number,
  targetCardInstanceId?: string
): { success: boolean; error?: string } {
  if (player.hasRetreatedThisTurn) {
    return { success: false, error: '「にげる（入れ替え）」は1ターンに1回までです。' };
  }
  if (!player.activeCard) {
    return { success: false, error: 'バトル場にカードがいません。' };
  }

  let resolvedBenchIdx = benchIndex;
  if (resolvedBenchIdx === undefined && targetCardInstanceId) {
    resolvedBenchIdx = player.bench.findIndex((b) => b?.instanceId === targetCardInstanceId);
  }
  if (
    resolvedBenchIdx === undefined ||
    resolvedBenchIdx < 0 ||
    resolvedBenchIdx > 2 ||
    !player.bench[resolvedBenchIdx]
  ) {
    return { success: false, error: '交代先のベンチカードを選択してください。' };
  }

  const active = player.activeCard;
  if (active.attachedEnergy < active.retreatCost) {
    return {
      success: false,
      error: `逃げるにはエネルギーが ${active.retreatCost} 個必要です（現在 ${active.attachedEnergy} 個）。`,
    };
  }

  const benchCard = player.bench[resolvedBenchIdx]!;
  active.attachedEnergy -= active.retreatCost;

  active.zone = 'BENCH';
  active.benchIndex = resolvedBenchIdx;
  benchCard.zone = 'ACTIVE';
  benchCard.benchIndex = undefined;

  player.activeCard = benchCard;
  player.bench[resolvedBenchIdx] = active;
  player.hasRetreatedThisTurn = true;

  const oldDef = getCardDefinition(active.definitionId);
  const newDef = getCardDefinition(benchCard.definitionId);

  recalculateDynamicStats(state);
  addLog(
    state,
    player.playerId,
    player.name,
    'RETREAT',
    `${player.name} が「${oldDef?.name}」をベンチへ下げ、「${newDef?.name}」をバトル場に出した！`,
    newDef?.name
  );
  setAnimation(state, 'RETREAT', player.playerId, {
    sourceCardId: benchCard.instanceId,
    targetCardId: active.instanceId,
    cardName: newDef?.name,
  });
  return { success: true };
}

/**
 * 5. 魔法（サポート）カード発動処理
 */
function activateSpellCard(
  state: GameState,
  playerKey: PlayerKey,
  opponentKey: PlayerKey,
  cardInstanceId?: string
): { success: boolean; error?: string } {
  const player = state[playerKey];
  const opponent = state[opponentKey];

  if (player.hasUsedSpellThisTurn) {
    return { success: false, error: '魔法（サポート）カードは1ターンに1枚まで使用できます。' };
  }
  const handIdx = player.hand.findIndex((c) => c.instanceId === cardInstanceId);
  if (handIdx === -1) {
    return { success: false, error: '手札にその魔法カードがありません。' };
  }
  const spellCard = player.hand[handIdx];
  const def = getCardDefinition(spellCard.definitionId);
  if (!def || def.type !== 'SPELL') {
    return { success: false, error: '選択されたカードは魔法カードではありません。' };
  }

  player.hand.splice(handIdx, 1);
  spellCard.zone = 'TRASH';
  player.trash.push(spellCard);
  player.hasUsedSpellThisTurn = true;

  let effectSummary = def.abilities.description;

  switch (def.abilities.spellEffect) {
    case 'DRAW_1': {
      if (player.deck.length > 0) {
        const drawn = player.deck.shift()!;
        drawn.zone = 'HAND';
        player.hand.push(drawn);
        effectSummary = `${player.name} が魔法「${def.name}」を発動！山札からカードを1枚引いた！`;
      } else {
        effectSummary = `${player.name} が魔法「${def.name}」を発動！（山札が0枚のためドローなし）`;
      }
      break;
    }
    case 'SEARCH_ATTACK_CARD': {
      const atkIdx = player.deck.findIndex(
        (c) => getCardDefinition(c.definitionId)?.type === 'ATTACK'
      );
      if (atkIdx !== -1) {
        const [found] = player.deck.splice(atkIdx, 1);
        found.zone = 'HAND';
        player.hand.push(found);
        const foundDef = getCardDefinition(found.definitionId);
        effectSummary = `${player.name} が「${def.name}」で山札から「${foundDef?.name}」を手札に加えた！`;
      } else {
        effectSummary = `${player.name} が「${def.name}」を発動！（山札に攻撃カードがありませんでした）`;
      }
      break;
    }
    case 'BONUS_ENERGY_ACTIVE': {
      if (player.activeCard) {
        player.activeCard.attachedEnergy += 1;
        const actDef = getCardDefinition(player.activeCard.definitionId);
        effectSummary = `${player.name} が「${def.name}」を発動！「${actDef?.name}」にボーナスエネルギー＋1！`;
      }
      break;
    }
    case 'BUFF_ATK_20': {
      if (player.activeCard) {
        player.activeCard.tempAtkBuff += 20;
        const actDef = getCardDefinition(player.activeCard.definitionId);
        effectSummary = `${player.name} が「${def.name}」を発動！このターン「${actDef?.name}」の攻撃ダメージ＋20！`;
      }
      break;
    }
    case 'BUFF_ATK_30': {
      if (player.activeCard) {
        player.activeCard.tempAtkBuff += 30;
        const actDef = getCardDefinition(player.activeCard.definitionId);
        effectSummary = `${player.name} が「${def.name}」を発動！このターン「${actDef?.name}」の攻撃ダメージ＋30！`;
      }
      break;
    }
    case 'HEAL_30_BUFF_10': {
      if (player.activeCard) {
        player.activeCard.currentHp = Math.min(
          player.activeCard.maxHp,
          player.activeCard.currentHp + 30
        );
        player.activeCard.tempAtkBuff += 10;
        const actDef = getCardDefinition(player.activeCard.definitionId);
        effectSummary = `${player.name} が「${def.name}」を発動！「${actDef?.name}」のHPを30回復し攻撃力＋10！`;
      }
      break;
    }
    case 'HEAL_20_SHIELD_20': {
      if (player.activeCard) {
        player.activeCard.currentHp = Math.min(
          player.activeCard.maxHp,
          player.activeCard.currentHp + 20
        );
        player.activeCard.damageReductionNextTurn += 20;
        const actDef = getCardDefinition(player.activeCard.definitionId);
        effectSummary = `${player.name} が「${def.name}」を発動！「${actDef?.name}」のHP20回復＆次ターンダメージ−20！`;
      }
      break;
    }
    case 'SHIELD_30': {
      if (player.activeCard) {
        player.activeCard.damageReductionNextTurn += 30;
        const actDef = getCardDefinition(player.activeCard.definitionId);
        effectSummary = `${player.name} が「${def.name}」を発動！次の相手ターン「${actDef?.name}」が受けるダメージ−30！`;
      }
      break;
    }
    case 'DIRECT_DMG_20': {
      if (opponent.activeCard) {
        opponent.activeCard.currentHp = Math.max(0, opponent.activeCard.currentHp - 20);
        const oppDef = getCardDefinition(opponent.activeCard.definitionId);
        effectSummary = `${player.name} が「${def.name}」を発動！相手の「${oppDef?.name}」に20ダメージ！`;
      }
      break;
    }
    case 'DRAIN_ENERGY_DMG_10': {
      if (opponent.activeCard) {
        opponent.activeCard.currentHp = Math.max(0, opponent.activeCard.currentHp - 10);
        if (opponent.activeCard.attachedEnergy > 0) {
          opponent.activeCard.attachedEnergy -= 1;
        }
        const oppDef = getCardDefinition(opponent.activeCard.definitionId);
        effectSummary = `${player.name} が「${def.name}」を発動！相手の「${oppDef?.name}」に10ダメージ＆エネルギーを1個破壊！`;
      }
      break;
    }
    case 'SWAP_OPPONENT_BENCH': {
      const oppBenchIndices = opponent.bench
        .map((c, idx) => (c !== null ? idx : -1))
        .filter((idx) => idx !== -1);
      if (opponent.activeCard && oppBenchIndices.length > 0) {
        const pickIdx = oppBenchIndices[Math.floor(Math.random() * oppBenchIndices.length)];
        const oldActive = opponent.activeCard;
        const newActive = opponent.bench[pickIdx]!;
        oldActive.zone = 'BENCH';
        oldActive.benchIndex = pickIdx;
        newActive.zone = 'ACTIVE';
        newActive.benchIndex = undefined;
        opponent.activeCard = newActive;
        opponent.bench[pickIdx] = oldActive;
        const newDef = getCardDefinition(newActive.definitionId);
        effectSummary = `${player.name} が「${def.name}」を発動！相手のベンチから「${newDef?.name}」をバトル場へ引きずり出した！`;
      } else if (player.deck.length > 0) {
        const drawn = player.deck.shift()!;
        drawn.zone = 'HAND';
        player.hand.push(drawn);
        effectSummary = `${player.name} が「${def.name}」を発動！（相手にベンチがいないため1枚ドロー）`;
      }
      break;
    }
    case 'PEEK_AND_DRAW': {
      const oppHandNames = opponent.hand
        .map((c) => getCardDefinition(c.definitionId)?.name || '不明')
        .join('、');
      if (player.deck.length > 0) {
        const drawn = player.deck.shift()!;
        drawn.zone = 'HAND';
        player.hand.push(drawn);
      }
      effectSummary = `${player.name} が「${def.name}」を発動！相手の手札は【${
        oppHandNames || 'なし'
      }】！さらに1枚ドロー！`;
      break;
    }
  }

  recalculateDynamicStats(state);
  addLog(state, player.playerId, player.name, 'SPELL', effectSummary, def.name);
  setAnimation(state, 'SPELL', player.playerId, {
    sourceCardId: spellCard.instanceId,
    cardName: def.name,
  });

  if (opponent.activeCard && opponent.activeCard.currentHp <= 0) {
    handleKnockoutAndTurnTransition(state, playerKey, opponentKey, false);
  }
  return { success: true };
}

/**
 * 6. 環境カード展開処理
 */
function activateEnvironmentCard(
  state: GameState,
  player: PlayerBattleState,
  cardInstanceId?: string
): { success: boolean; error?: string } {
  const handIdx = player.hand.findIndex((c) => c.instanceId === cardInstanceId);
  if (handIdx === -1) {
    return { success: false, error: '手札にその環境カードがありません。' };
  }
  const envCard = player.hand[handIdx];
  const def = getCardDefinition(envCard.definitionId);
  if (!def || def.type !== 'ENVIRONMENT') {
    return { success: false, error: '選択されたカードは環境カードではありません。' };
  }

  player.hand.splice(handIdx, 1);

  if (state.environment) {
    const oldEnv = state.environment.cardInstance;
    oldEnv.zone = 'TRASH';
    const oldOwner = state.playerA.playerId === oldEnv.ownerId ? state.playerA : state.playerB;
    oldOwner.trash.push(oldEnv);
  }

  envCard.zone = 'ENVIRONMENT';
  state.environment = {
    cardInstance: envCard,
    placedByPlayerId: player.playerId,
    placedTurn: state.turnNumber,
  };

  let envMessage = `${player.name} が環境カード「${def.name}」を展開！`;

  if (def.abilities.environmentEffect === 'GROLAN_FULL_HEAL') {
    const targets = [player.activeCard, ...player.bench].filter(Boolean);
    let healedCount = 0;
    targets.forEach((c) => {
      if (c && c.currentHp < c.maxHp) {
        c.currentHp = c.maxHp;
        healedCount++;
      }
    });
    envMessage = `${player.name} が環境「グロラン」を展開！コーヒーを飲んで自分の場の傷ついたカード（${healedCount}体）のHPを全回復した！`;
  } else if (def.abilities.environmentEffect === 'PHOENIX_WALL') {
    const token = createCardInstance('token_inoue_professor', player.playerId);
    token.zone = 'HAND';
    player.hand.push(token);
    envMessage = `${player.name} が環境「フェニックスホール」を展開！手札に「井上教授（壁）」(Lv.1) を1枚生成！`;
  } else if (
    def.abilities.environmentEffect === 'SUMIDAGAWA_BOOST' ||
    def.abilities.environmentEffect === 'YUKIYA_ROOM_BOOST'
  ) {
    if (player.activeCard && player.activeCard.currentHp < player.activeCard.maxHp) {
      player.activeCard.currentHp = Math.min(
        player.activeCard.maxHp,
        player.activeCard.currentHp + 20
      );
    }
  }

  recalculateDynamicStats(state);
  addLog(state, player.playerId, player.name, 'ENVIRONMENT', envMessage, def.name);
  setAnimation(state, 'ENVIRONMENT', player.playerId, {
    sourceCardId: envCard.instanceId,
    cardName: def.name,
  });
  return { success: true };
}

/**
 * 7. バトル場のカードによるわざ攻撃処理
 */
function executeCardAttack(
  state: GameState,
  playerKey: PlayerKey,
  opponentKey: PlayerKey
): { success: boolean; error?: string } {
  const player = state[playerKey];
  const opponent = state[opponentKey];
  const attackerCard = player.activeCard;
  const defenderCard = opponent.activeCard;

  if (!attackerCard) {
    return { success: false, error: 'バトル場に攻撃できるカードがいません。' };
  }
  if (!defenderCard) {
    return { success: false, error: '相手のバトル場にカードがいません。' };
  }
  if (attackerCard.attachedEnergy < attackerCard.energyCost) {
    return {
      success: false,
      error: `攻撃にはエネルギーが ${attackerCard.energyCost} 個必要です（現在 ${attackerCard.attachedEnergy} 個）。`,
    };
  }

  recalculateDynamicStats(state);

  const attackerDef = getCardDefinition(attackerCard.definitionId);
  const defenderDef = getCardDefinition(defenderCard.definitionId);

  const damage = calculateCardDamage(state, attackerCard, defenderCard);
  defenderCard.currentHp = Math.max(0, defenderCard.currentHp - damage);

  addLog(
    state,
    player.playerId,
    player.name,
    'ATTACK',
    `${player.name} の「${attackerDef?.name}」の『${attackerDef?.abilities.attackName}』！ 相手の「${defenderDef?.name}」に ${damage} ダメージ！（残りHP: ${defenderCard.currentHp}/${defenderCard.maxHp}）`,
    attackerDef?.name,
    defenderDef?.name,
    damage
  );

  setAnimation(state, 'ATTACK', player.playerId, {
    sourceCardId: attackerCard.instanceId,
    targetCardId: defenderCard.instanceId,
    cardName: attackerDef?.name,
    attackName: attackerDef?.abilities.attackName,
    damage,
  });

  handleKnockoutAndTurnTransition(state, playerKey, opponentKey, true);
  return { success: true };
}

/**
 * 8. きぜつ後のベンチカード繰り出し処理
 */
function promoteBenchCardToActive(
  state: GameState,
  playerKey: PlayerKey,
  benchIndex?: number,
  cardInstanceId?: string
): { success: boolean; error?: string } {
  const player = state[playerKey];

  let resolvedBenchIdx = benchIndex;
  if (resolvedBenchIdx === undefined && cardInstanceId) {
    resolvedBenchIdx = player.bench.findIndex((c) => c?.instanceId === cardInstanceId);
  }
  if (
    resolvedBenchIdx === undefined ||
    resolvedBenchIdx < 0 ||
    resolvedBenchIdx > 2 ||
    !player.bench[resolvedBenchIdx]
  ) {
    return { success: false, error: '有効なベンチカードを選択してください。' };
  }

  const promoted = player.bench[resolvedBenchIdx]!;
  player.bench[resolvedBenchIdx] = null;
  promoted.zone = 'ACTIVE';
  promoted.benchIndex = undefined;
  player.activeCard = promoted;

  const promotedDef = getCardDefinition(promoted.definitionId);
  addLog(
    state,
    player.playerId,
    player.name,
    'PROMOTE',
    `${player.name} がベンチから「${promotedDef?.name}」をバトル場へ繰り出した！`,
    promotedDef?.name
  );
  setAnimation(state, 'PROMOTE', player.playerId, {
    sourceCardId: promoted.instanceId,
    cardName: promotedDef?.name,
  });

  recalculateDynamicStats(state);

  if (state.activePlayerKey !== playerKey) {
    startTurn(state, playerKey);
  } else {
    state.phase = 'MAIN';
    state.promotionRequiredPlayerKey = undefined;
  }

  return { success: true };
}

export function handleGameAction(
  state: GameState,
  playerId: string,
  payload: GameActionPayload
): { success: boolean; error?: string } {
  if (state.phase === 'GAME_OVER') {
    return { success: false, error: '対戦は既に終了しています。' };
  }

  const playerKey: PlayerKey | null =
    state.playerA.playerId === playerId
      ? 'playerA'
      : state.playerB.playerId === playerId
      ? 'playerB'
      : null;

  if (!playerKey) {
    return { success: false, error: 'プレイヤーが見つかりません。' };
  }

  const opponentKey: PlayerKey = playerKey === 'playerA' ? 'playerB' : 'playerA';
  const player = state[playerKey];
  const opponent = state[opponentKey];

  if (payload.actionType === 'SURRENDER') {
    state.phase = 'GAME_OVER';
    state.winnerPlayerId = opponent.playerId;
    state.winReason = `${player.name} が降参しました。${opponent.name} の勝利！`;
    addLog(state, player.playerId, player.name, 'SURRENDER', state.winReason);
    state.stateVersion += 1;
    state.lastActionTimestamp = Date.now();
    return { success: true };
  }

  if (state.phase === 'WAITING_FOR_PROMOTION') {
    if (state.promotionRequiredPlayerKey !== playerKey) {
      return { success: false, error: '相手が次のバトルカードを選択中です。' };
    }
    if (payload.actionType !== 'PROMOTE_BENCH_CARD') {
      return { success: false, error: 'ベンチからバトル場に出すカードを選択してください。' };
    }

    const res = promoteBenchCardToActive(
      state,
      playerKey,
      payload.benchIndex,
      payload.cardInstanceId
    );
    if (res.success) {
      state.stateVersion += 1;
      state.lastActionTimestamp = Date.now();
    }
    return res;
  }

  if (state.activePlayerKey !== playerKey) {
    return { success: false, error: '相手のターンです。' };
  }

  let result: { success: boolean; error?: string };

  switch (payload.actionType) {
    case 'PLAY_CARD_TO_ACTIVE':
      result = playCardToActive(state, player, payload.cardInstanceId);
      break;
    case 'PLAY_CARD_TO_BENCH':
      result = playCardToBench(state, player, payload.cardInstanceId, payload.benchIndex);
      break;
    case 'EVOLVE_CARD':
      result = evolveFieldCard(
        state,
        player,
        payload.cardInstanceId,
        payload.targetCardInstanceId
      );
      break;
    case 'ATTACH_ENERGY':
      result = attachEnergyToCard(state, player, payload.targetCardInstanceId);
      break;
    case 'RETREAT_ACTIVE':
      result = retreatActiveCard(
        state,
        player,
        payload.benchIndex,
        payload.targetCardInstanceId
      );
      break;
    case 'USE_SPELL_CARD':
      result = activateSpellCard(state, playerKey, opponentKey, payload.cardInstanceId);
      break;
    case 'PLAY_ENVIRONMENT':
      result = activateEnvironmentCard(state, player, payload.cardInstanceId);
      break;
    case 'ATTACK':
      result = executeCardAttack(state, playerKey, opponentKey);
      break;
    case 'END_TURN':
      addLog(
        state,
        player.playerId,
        player.name,
        'TURN_END',
        `${player.name} がターンを終了しました。`
      );
      startTurn(state, opponentKey);
      result = { success: true };
      break;
    default:
      return { success: false, error: '不明なアクションです。' };
  }

  if (result.success) {
    state.stateVersion += 1;
    state.lastActionTimestamp = Date.now();
  }
  return result;
}
