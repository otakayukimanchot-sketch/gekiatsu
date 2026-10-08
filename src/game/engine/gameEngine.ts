import {
  AnimationEventType,
  BattleFormatOption,
  GameActionPayload,
  GameState,
  PlayerBattleState,
  PlayerKey,
  WinScoreOption,
} from '../types';
import { CardInstance } from '../../cards/types';
import { getCardDefinition } from '../../cards/cardRegistry';
import { buildInitialDeckAndSetup, createCardInstance } from './deckBuilder';

function addLog(
  _state: GameState,
  _actorId: string,
  _actorName: string,
  _type: AnimationEventType | 'TURN_END' | 'SURRENDER',
  _message: string,
  _cardName?: string,
  _targetName?: string,
  _value?: number
) {
  // ログ機能削除に伴い履歴保存を行わない
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
 */
export function recalculateDynamicStats(state: GameState) {
  const updatePlayerCards = (player: PlayerBattleState) => {
    const allField = [player.activeCard, ...player.bench].filter(Boolean);
    for (const card of allField) {
      if (!card) continue;
      card.currentAtk = card.baseAtk + card.tempAtkBuff;
    }
  };

  updatePlayerCards(state.playerA);
  updatePlayerCards(state.playerB);
}

/**
 * 攻撃カードが与える最終ダメージを計算する
 * - もえきゅん → しょーちゃん 特効即死
 * - りょち → ムエ 特効即死
 */
export function calculateCardDamage(
  attackerCard: CardInstance,
  defenderCard: CardInstance
): { damage: number; isInstantKill: boolean } {
  const attackerDef = getCardDefinition(attackerCard.definitionId);
  const defenderDef = getCardDefinition(defenderCard.definitionId);

  if (
    attackerDef?.abilities.combatSkill === 'INSTANT_KILL_SHOCHAN' &&
    defenderDef?.id === 'atk_shochan'
  ) {
    return {
      damage: Math.max(defenderCard.currentHp, defenderCard.maxHp, 999),
      isInstantKill: true,
    };
  }

  if (
    attackerDef?.abilities.combatSkill === 'INSTANT_KILL_MUE' &&
    defenderDef?.id === 'atk_mue'
  ) {
    return {
      damage: Math.max(defenderCard.currentHp, defenderCard.maxHp, 999),
      isInstantKill: true,
    };
  }

  const totalReduction = defenderCard.damageReductionNextTurn;
  return {
    damage: Math.max(10, attackerCard.currentAtk - totalReduction),
    isInstantKill: false,
  };
}

export function initializeGame(
  gameId: string,
  roomId: string,
  pA: { playerId: string; name: string; socketId: string; avatarIcon: string },
  pB: { playerId: string; name: string; socketId: string; avatarIcon: string },
  customDeckA?: string[],
  customDeckB?: string[],
  winScore: WinScoreOption = 3,
  battleFormat: BattleFormatOption = 'standard'
): GameState {
  const validWinScore: WinScoreOption = winScore === 7 ? 7 : winScore === 5 ? 5 : 3;
  const validFormat: BattleFormatOption = battleFormat === 'allstar' ? 'allstar' : 'standard';
  const setupA = buildInitialDeckAndSetup(pA.playerId, customDeckA, validFormat);
  const setupB = buildInitialDeckAndSetup(pB.playerId, customDeckB, validFormat);

  const firstPlayerKey: PlayerKey = Math.random() < 0.5 ? 'playerA' : 'playerB';

  const playerA: PlayerBattleState = {
    playerId: pA.playerId,
    name: pA.name,
    socketId: pA.socketId,
    avatarIcon: pA.avatarIcon,
    score: 0,
    maxScore: validWinScore,
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
    maxScore: validWinScore,
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
    winScore: validWinScore,
    battleFormat: validFormat,
    processedKnockoutIds: [],
    playerA,
    playerB,
    stateVersion: 1,
    logs: [],
    lastActionTimestamp: Date.now(),
  };

  const firstPlayer = state[firstPlayerKey];
  const formatLabel = validFormat === 'allstar' ? '全員参加大乱闘モード' : '標準デッキ対戦';
  addLog(
    state,
    firstPlayer.playerId,
    firstPlayer.name,
    'GAME_START',
    `バトル開始！【${formatLabel} / ${validWinScore}ポイント先取】先攻は ${firstPlayer.name} です。`
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

  // 最初のターン(T1)は初期手札（標準:5枚[魔法2+他3] / 大乱闘:10枚[魔法3+他7]）が既に配られているため追加ドローせずスタート
  const skipInitialTurn1Draw = state.turnNumber === 1;

  if (!skipInitialTurn1Draw && activePlayer.deck.length > 0) {
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
      `ターン${state.turnNumber}: ${activePlayer.name} のターン開始（エネルギー＋1獲得）`
    );
  }

  recalculateDynamicStats(state);
}

/**
 * 相手のベンチやバトル場がHP0以下になった際の気絶（ノックアウト）・ポイント加算・勝敗／ベンチ繰り出し処理
 */
function handleKnockoutAndTurnTransition(
  state: GameState,
  attackerKey: PlayerKey,
  defenderKey: PlayerKey,
  endTurnAfterCompare: boolean
) {
  if (state.phase === 'GAME_OVER') return;

  const attacker = state[attackerKey];
  const defender = state[defenderKey];
  const winScore = state.winScore || attacker.maxScore || 3;

  if (!Array.isArray(state.processedKnockoutIds)) {
    state.processedKnockoutIds = [];
  }

  // 1. まず相手ベンチでHP0以下になったカードのきぜつ処理（インフル等の全体ダメージ対応）
  for (let i = 0; i < defender.bench.length; i++) {
    const bCard = defender.bench[i];
    if (bCard != null && bCard.instanceId != null && bCard.currentHp <= 0) {
      if (state.processedKnockoutIds.includes(bCard.instanceId)) {
        defender.bench[i] = null;
        continue;
      }
      state.processedKnockoutIds.push(bCard.instanceId);

      const bDef = getCardDefinition(bCard.definitionId);
      const pts = bDef?.stats.pointValue || 1;
      bCard.currentHp = 0;
      bCard.attachedEnergy = 0;
      bCard.tempAtkBuff = 0;
      bCard.damageReductionNextTurn = 0;
      bCard.zone = 'TRASH';
      bCard.benchIndex = undefined;
      defender.trash.push(bCard);
      defender.bench[i] = null;

      attacker.score = Math.min(winScore, attacker.score + pts);
      addLog(
        state,
        attacker.playerId,
        attacker.name,
        'KNOCKOUT',
        `ベンチの「${bDef?.name}」がきぜつ！ ${attacker.name} が ${pts} ポイント獲得！（合計 ${attacker.score}/${winScore} pt）`,
        bDef?.name,
        undefined,
        pts
      );
      setAnimation(state, 'KNOCKOUT', attacker.playerId, {
        targetCardId: bCard.instanceId,
        cardName: bDef?.name,
        pointsGained: pts,
      });
    }
  }

  // 2. バトル場のきぜつチェック
  const knockedCard = defender.activeCard;

  if (knockedCard == null || knockedCard.currentHp > 0) {
    if (attacker.score >= winScore) {
      state.phase = 'GAME_OVER';
      state.winnerPlayerId = attacker.playerId;
      state.winReason = `${attacker.name} が先に ${winScore} ポイントを獲得して勝利！`;
      addLog(state, attacker.playerId, attacker.name, 'GAME_OVER', state.winReason);
      return;
    }
    if (endTurnAfterCompare) {
      startTurn(state, defenderKey);
    }
    return;
  }

  // 二重得点防止ガード: 既に処理済みのinstanceIdならポイントを重複加算しない
  if (
    knockedCard.instanceId != null &&
    state.processedKnockoutIds.includes(knockedCard.instanceId)
  ) {
    defender.activeCard = null;
    return;
  }
  if (knockedCard.instanceId != null) {
    state.processedKnockoutIds.push(knockedCard.instanceId);
  }

  const knockedDef = getCardDefinition(knockedCard.definitionId);
  const pointsGained = knockedDef?.stats.pointValue || 1;

  // Step 1 & 2: 撃破カードをバトル場から除去しトラッシュへ送る
  knockedCard.currentHp = 0;
  knockedCard.attachedEnergy = 0;
  knockedCard.tempAtkBuff = 0;
  knockedCard.damageReductionNextTurn = 0;
  knockedCard.zone = 'TRASH';
  defender.trash.push(knockedCard);
  defender.activeCard = null;

  // Step 3: 撃破したプレイヤーにポイント加算（二重加算なし）
  attacker.score = Math.min(winScore, attacker.score + pointsGained);

  addLog(
    state,
    attacker.playerId,
    attacker.name,
    'KNOCKOUT',
    `「${knockedDef?.name}」がきぜつ！ ${attacker.name} が ${pointsGained} ポイント獲得！（合計 ${attacker.score}/${winScore} pt）`,
    knockedDef?.name,
    undefined,
    pointsGained
  );

  setAnimation(state, 'KNOCKOUT', attacker.playerId, {
    targetCardId: knockedCard.instanceId,
    cardName: knockedDef?.name,
    pointsGained,
  });

  // Step 4: 勝利条件チェック（3点または5点に到達したらベンチ選択を要求せず即座に勝利）
  if (attacker.score >= winScore) {
    state.phase = 'GAME_OVER';
    state.winnerPlayerId = attacker.playerId;
    state.winReason = `${attacker.name} が先に ${winScore} ポイントを獲得して勝利！`;
    addLog(state, attacker.playerId, attacker.name, 'GAME_OVER', state.winReason);
    return;
  }

  // Step 5: ベンチに控えカードが存在するか確認
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

  // Step 6: 撃破された側がベンチから新しいバトル場のカードを選択するフェーズへ移行
  state.phase = 'WAITING_FOR_PROMOTION';
  state.promotionRequiredPlayerKey = defenderKey;
  addLog(
    state,
    defender.playerId,
    defender.name,
    'PROMOTE',
    `バトル場のカードがきぜつしました。${defender.name} はベンチから出すカードを選んでください。`
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
  if (targetCardInstanceId != null) {
    if (
      player.activeCard != null &&
      player.activeCard.instanceId != null &&
      player.activeCard.instanceId === targetCardInstanceId
    ) {
      targetCard = player.activeCard;
    } else {
      targetCard =
        player.bench.find(
          (b) => b != null && b.instanceId != null && b.instanceId === targetCardInstanceId
        ) || null;
    }
  } else {
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

  player.hand.splice(handIdx, 1);

  targetCard.definitionId = evoDef.id;
  targetCard.maxHp = evoDef.hp;
  targetCard.currentHp = Math.max(10, evoDef.hp - damageTaken);
  targetCard.baseAtk = evoDef.attack;
  targetCard.currentAtk = evoDef.attack;
  targetCard.energyCost = evoDef.energyCost;
  targetCard.retreatCost = evoDef.retreatCost;
  targetCard.summonTurn = state.turnNumber;

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

  let targetCard: CardInstance | null = null;
  if (targetCardInstanceId != null) {
    if (
      player.activeCard != null &&
      player.activeCard.instanceId != null &&
      player.activeCard.instanceId === targetCardInstanceId
    ) {
      targetCard = player.activeCard;
    } else {
      targetCard =
        player.bench.find(
          (b) => b != null && b.instanceId != null && b.instanceId === targetCardInstanceId
        ) || null;
    }
  }

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
  if (resolvedBenchIdx === undefined && targetCardInstanceId != null) {
    resolvedBenchIdx = player.bench.findIndex(
      (b) => b != null && b.instanceId != null && b.instanceId === targetCardInstanceId
    );
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
    case 'DRAW_2_IF_LOW_HAND': {
      const drawCount = player.hand.length <= 3 ? 2 : 1;
      let actualDrawn = 0;
      for (let i = 0; i < drawCount; i++) {
        if (player.deck.length > 0) {
          const drawn = player.deck.shift()!;
          drawn.zone = 'HAND';
          player.hand.push(drawn);
          actualDrawn++;
        }
      }
      effectSummary = `${player.name} が「${def.name}」を発動！山札からカードを${actualDrawn}枚引いた！`;
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
    case 'BONUS_ENERGY_BENCH': {
      const benchTarget =
        player.bench.find((b) => b !== null && b.attachedEnergy < b.energyCost) ||
        player.bench.find((b) => b !== null) ||
        player.activeCard;
      if (benchTarget) {
        benchTarget.attachedEnergy += 1;
        const tDef = getCardDefinition(benchTarget.definitionId);
        effectSummary = `${player.name} が「${def.name}」を発動！「${tDef?.name}」にボーナスエネルギー＋1！`;
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
    case 'BUFF_ATK_50': {
      if (player.activeCard) {
        player.activeCard.tempAtkBuff += 50;
        const actDef = getCardDefinition(player.activeCard.definitionId);
        effectSummary = `${player.name} が「${def.name}」を発動！このターン「${actDef?.name}」の攻撃ダメージ＋50！！`;
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
    case 'HEAL_ALL_25': {
      const friendly = [player.activeCard, ...player.bench].filter(Boolean);
      friendly.forEach((c) => {
        if (c) c.currentHp = Math.min(c.maxHp, c.currentHp + 25);
      });
      effectSummary = `${player.name} が「${def.name}」を発動！自分の場すべてのカードのHPを25回復！`;
      break;
    }
    case 'FULL_HEAL_ALL': {
      const friendly = [player.activeCard, ...player.bench].filter(Boolean);
      let count = 0;
      friendly.forEach((c) => {
        if (c && c.currentHp < c.maxHp) {
          c.currentHp = c.maxHp;
          count++;
        }
      });
      effectSummary = `${player.name} が「${def.name}」を発動！自分の場の傷ついたカード（${count}体）のHPを全回復した！`;
      break;
    }
    case 'PHOENIX_WALL_TOKEN': {
      const token = createCardInstance('token_inoue_professor', player.playerId);
      token.zone = 'HAND';
      player.hand.push(token);
      if (player.activeCard) {
        player.activeCard.damageReductionNextTurn += 20;
      }
      effectSummary = `${player.name} が「${def.name}」を発動！手札に「井上教授（壁）」を加え、次ターンの被ダメージ−20！`;
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
    case 'DIRECT_DMG_30': {
      if (opponent.activeCard) {
        opponent.activeCard.currentHp = Math.max(0, opponent.activeCard.currentHp - 30);
        const oppDef = getCardDefinition(opponent.activeCard.definitionId);
        effectSummary = `${player.name} が「${def.name}」を発動！相手の「${oppDef?.name}」に30ダメージ！`;
      }
      break;
    }
    case 'BENCH_STORM_15_ALL': {
      const oppCards = [opponent.activeCard, ...opponent.bench].filter(Boolean);
      oppCards.forEach((c) => {
        if (c) c.currentHp = Math.max(0, c.currentHp - 15);
      });
      effectSummary = `${player.name} が「${def.name}」を発動！相手の場すべてのカードに15ダメージ！`;
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
    case 'FREE_RETREAT_THIS_TURN': {
      const friendly = [player.activeCard, ...player.bench].filter(Boolean);
      friendly.forEach((c) => {
        if (c) c.retreatCost = 0;
      });
      effectSummary = `${player.name} が「${def.name}」を発動！自分の場のすべてのカードの「にげる」コストが 0 になった！`;
      break;
    }
  }

  // カード固有の追加ボーナス処理（trio / ブラックコーヒー / 酒）
  if (def.id === 'spl_trio_akihabara' && player.activeCard) {
    player.activeCard.tempAtkBuff += 10;
    effectSummary += '（さらにバトル場の攻撃力＋10！）';
  } else if (def.id === 'spl_black_coffee' && player.activeCard) {
    player.activeCard.tempAtkBuff += 10;
    effectSummary += '（さらにバトル場の攻撃力＋10！）';
  } else if (def.id === 'spl_sake' && player.activeCard) {
    player.activeCard.tempAtkBuff += 20;
    effectSummary += '（さらに酔拳効果でバトル場の攻撃力＋20！）';
  }

  recalculateDynamicStats(state);
  addLog(state, player.playerId, player.name, 'SPELL', effectSummary, def.name);
  setAnimation(state, 'SPELL', player.playerId, {
    sourceCardId: spellCard.instanceId,
    cardName: def.name,
    attackName: effectSummary,
  });

  const anyOpponentKnockedOut =
    (opponent.activeCard && opponent.activeCard.currentHp <= 0) ||
    opponent.bench.some((b) => b !== null && b.currentHp <= 0);

  if (anyOpponentKnockedOut) {
    handleKnockoutAndTurnTransition(state, playerKey, opponentKey, false);
  }
  return { success: true };
}

/**
 * 6. バトル場のカードによるわざ攻撃処理
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

  const { damage, isInstantKill } = calculateCardDamage(attackerCard, defenderCard);
  defenderCard.currentHp = Math.max(0, defenderCard.currentHp - damage);

  const logMessage = isInstantKill
    ? `💥特効即死！ ${player.name} の「${attackerDef?.name}」が宿敵「${defenderDef?.name}」を一撃で葬り去った！！`
    : `${player.name} の「${attackerDef?.name}」の『${attackerDef?.abilities.attackName}』！ 相手の「${defenderDef?.name}」に ${damage} ダメージ！（残りHP: ${defenderCard.currentHp}/${defenderCard.maxHp}）`;

  addLog(
    state,
    player.playerId,
    player.name,
    'ATTACK',
    logMessage,
    attackerDef?.name,
    defenderDef?.name,
    damage
  );

  setAnimation(state, 'ATTACK', player.playerId, {
    sourceCardId: attackerCard.instanceId,
    targetCardId: defenderCard.instanceId,
    cardName: attackerDef?.name,
    attackName: isInstantKill ? '特効一撃即死' : attackerDef?.abilities.attackName,
    damage,
  });

  handleKnockoutAndTurnTransition(state, playerKey, opponentKey, true);
  return { success: true };
}

/**
 * 7. きぜつ後のベンチカード繰り出し処理
 */
function promoteBenchCardToActive(
  state: GameState,
  playerKey: PlayerKey,
  benchIndex?: number,
  cardInstanceId?: string
): { success: boolean; error?: string } {
  const player = state[playerKey];

  let resolvedBenchIdx = benchIndex;
  if (resolvedBenchIdx === undefined && cardInstanceId != null) {
    resolvedBenchIdx = player.bench.findIndex(
      (c) => c != null && c.instanceId != null && c.instanceId === cardInstanceId
    );
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
