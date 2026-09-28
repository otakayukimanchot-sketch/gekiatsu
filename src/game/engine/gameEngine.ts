import { GameState, PlayerCombatState, GameActionPayload, GameEventLog, PlayerKey } from '../types';
import { CardInstance } from '../../cards/types';
import { getCardDefinition } from '../../cards/cardRegistry';
import { buildStandardDeck, createCardInstance } from './deckBuilder';
import { RULES, canCardAttackTarget } from '../rules/gameRules';
import { 
  resolveCardToCardCombat, 
  resolveCardToPlayerCombat, 
  calculateEffectiveAtk 
} from '../combat/combatResolver';
import { 
  processSpellEffect, 
  drawCardsFromDeck, 
  attachCardToTarget, 
  evolveCard,
  checkSumidagawaBreach
} from '../effects/effectProcessor';

export function initializeGame(
  gameId: string,
  roomId: string,
  playerAInfo: { id: string; name: string; socketId: string; avatarIcon?: string },
  playerBInfo: { id: string; name: string; socketId: string; avatarIcon?: string }
): GameState {
  // Server-side random determines first player
  const isPlayerAFirst = Math.random() < 0.5;
  const firstPlayerKey: PlayerKey = isPlayerAFirst ? 'playerA' : 'playerB';
  const activePlayerKey: PlayerKey = firstPlayerKey;

  const deckA = buildStandardDeck(playerAInfo.id);
  const deckB = buildStandardDeck(playerBInfo.id);

  const playerA: PlayerCombatState = {
    playerId: playerAInfo.id,
    name: playerAInfo.name,
    socketId: playerAInfo.socketId,
    avatarIcon: playerAInfo.avatarIcon || 'smile',
    hp: RULES.INITIAL_HP,
    maxHp: RULES.INITIAL_HP,
    deck: deckA,
    hand: [],
    field: [null, null, null, null, null],
    graveyard: [],
    exile: [],
    hasDrawnThisTurn: true, // First turn handled specifically
    summonCountThisTurn: 0,
    attacksCountThisTurn: 0,
    isReady: true,
    isConnected: true
  };

  const playerB: PlayerCombatState = {
    playerId: playerBInfo.id,
    name: playerBInfo.name,
    socketId: playerBInfo.socketId,
    avatarIcon: playerBInfo.avatarIcon || 'rocket',
    hp: RULES.INITIAL_HP,
    maxHp: RULES.INITIAL_HP,
    deck: deckB,
    hand: [],
    field: [null, null, null, null, null],
    graveyard: [],
    exile: [],
    hasDrawnThisTurn: false,
    summonCountThisTurn: 0,
    attacksCountThisTurn: 0,
    isReady: true,
    isConnected: true
  };

  // Draw initial 5 cards each
  drawCardsFromDeck(playerA, RULES.INITIAL_HAND_SIZE);
  drawCardsFromDeck(playerB, RULES.INITIAL_HAND_SIZE);

  const firstPlayer = isPlayerAFirst ? playerA : playerB;

  const initialLog: GameEventLog = {
    id: 'log_start',
    timestamp: Date.now(),
    turnNumber: 1,
    actorPlayerId: firstPlayer.playerId,
    actorPlayerName: firstPlayer.name,
    type: 'GAME_START',
    message: `「本物カードバトル」対戦開始！先攻は ${firstPlayer.name} です。（各プレイヤーHP: ${RULES.INITIAL_HP}）`
  };

  return {
    gameId,
    roomId,
    phase: 'MAIN',
    turnNumber: 1,
    activePlayerKey,
    firstPlayerKey,
    playerA,
    playerB,
    environment: null,
    stateVersion: 1,
    logs: [initialLog],
    lastActionTimestamp: Date.now()
  };
}

export function handleGameAction(
  state: GameState,
  playerId: string,
  payload: GameActionPayload
): { success: boolean; error?: string } {
  // If game is already over, reject all actions
  if (state.phase === 'GAME_OVER') {
    return { success: false, error: 'ゲームは既に終了しています。' };
  }

  // Handle surrender at any time
  if (payload.actionType === 'SURRENDER') {
    const isPlayerA = state.playerA.playerId === playerId;
    const surrenderingPlayer = isPlayerA ? state.playerA : state.playerB;
    const winnerPlayer = isPlayerA ? state.playerB : state.playerA;

    state.phase = 'GAME_OVER';
    state.winnerPlayerId = winnerPlayer.playerId;
    state.winReason = `${surrenderingPlayer.name} が降伏しました。`;
    state.stateVersion += 1;
    state.logs.push({
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      turnNumber: state.turnNumber,
      actorPlayerId: playerId,
      actorPlayerName: surrenderingPlayer.name,
      type: 'SURRENDER',
      message: `${surrenderingPlayer.name} が降伏を選択しました。勝者: ${winnerPlayer.name}！`
    });
    return { success: true };
  }

  // Active player verification
  const activePlayer = state[state.activePlayerKey];
  const opponentPlayer = state[state.activePlayerKey === 'playerA' ? 'playerB' : 'playerA'];

  if (activePlayer.playerId !== playerId) {
    return { success: false, error: '相手のターン中は操作できません。' };
  }

  const addLog = (
    type: GameEventLog['type'],
    message: string,
    cardName?: string,
    targetName?: string,
    value?: number
  ) => {
    state.logs.push({
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      turnNumber: state.turnNumber,
      actorPlayerId: activePlayer.playerId,
      actorPlayerName: activePlayer.name,
      type,
      message,
      cardName,
      targetName,
      value
    });
  };

  switch (payload.actionType) {
    case 'DRAW_CARD': {
      if (activePlayer.hasDrawnThisTurn) {
        return { success: false, error: 'このターンはすでにカードを引いています。' };
      }
      if (activePlayer.deck.length === 0) {
        // Deck out loss
        state.phase = 'GAME_OVER';
        state.winnerPlayerId = opponentPlayer.playerId;
        state.winReason = `${activePlayer.name} の山札が0枚の状態でドローしたため敗北しました。`;
        state.stateVersion += 1;
        addLog('GAME_OVER', `${activePlayer.name} の山札が尽きました！敗北！勝者: ${opponentPlayer.name}！`);
        return { success: true };
      }
      const drawn = drawCardsFromDeck(activePlayer, 1);
      activePlayer.hasDrawnThisTurn = true;
      state.stateVersion += 1;
      addLog('DRAW', `${activePlayer.name} がカードを1枚引きました。`);
      return { success: true };
    }

    case 'PLAY_ATTACK_CARD': {
      if (!payload.cardInstanceId) {
        return { success: false, error: '対象のカードが指定されていません。' };
      }
      const handIndex = activePlayer.hand.findIndex(c => c.instanceId === payload.cardInstanceId);
      if (handIndex === -1) {
        return { success: false, error: '手札に対象のカードが存在しません。' };
      }
      const card = activePlayer.hand[handIndex];
      const def = getCardDefinition(card.definitionId);
      if (!def || def.type !== 'ATTACK') {
        return { success: false, error: 'このカードは攻撃カードではありません。' };
      }
      if (def.isEvolutionOnly) {
        return { success: false, error: 'このカードは進化専用カードです。手札から直接出せません。' };
      }

      // Special evolution rule: ヘッドフォンニキ + ヘッドフォンニキ -> オンフードヘッドフォンニキ
      if (payload.targetSlotIndex !== undefined && activePlayer.field[payload.targetSlotIndex]) {
        const existingCard = activePlayer.field[payload.targetSlotIndex]!;
        if (existingCard.definitionId === 'atk_headphone_niki' && card.definitionId === 'atk_headphone_niki') {
          activePlayer.hand.splice(handIndex, 1);
          evolveCard(existingCard, 'evo_onhood_headphone_niki');
          addLog('EVOLVE', `「ヘッドフォンニキ」に「ヘッドフォンニキ」を重ねた！「オンフードヘッドフォンニキ」へ合体進化！`);
          state.stateVersion += 1;
          return { success: true };
        }
      }

      // Find target field slot
      let slot = payload.targetSlotIndex;
      if (slot === undefined || slot < 0 || slot >= 5 || activePlayer.field[slot] !== null) {
        // Find first empty slot
        slot = activePlayer.field.findIndex(s => s === null);
      }
      if (slot === -1) {
        return { success: false, error: '場の枠（最大5体）がすべて埋まっています。' };
      }

      // Place card on field
      activePlayer.hand.splice(handIndex, 1);
      card.zone = 'FIELD';
      card.slotIndex = slot;
      card.summonTurn = state.turnNumber;
      card.canAttack = card.hasCharge || (state.turnNumber === 1 && RULES.FIRST_PLAYER_CAN_ATTACK_TURN_1);
      card.attacksThisTurn = 0;
      activePlayer.field[slot] = card;

      addLog('PLAY_ATTACK', `${activePlayer.name} が攻撃カード「${def.name}」を場に配置しました！（ATK: ${card.currentAtk} / HP: ${card.currentHp}）`, def.name);

      // Environment Check 1: フェニックスホール
      // 「本物カード（攻撃カード）が1体場に出現するたびに、「井上教授（壁）」(体力100)を1体生成する。」
      if (state.environment && state.environment.cardInstance.definitionId === 'env_phoenix_hall') {
        const wallSlot = activePlayer.field.findIndex(s => s === null);
        if (wallSlot !== -1) {
          const inoueWall = createCardInstance('token_inoue_professor', activePlayer.playerId);
          inoueWall.zone = 'FIELD';
          inoueWall.slotIndex = wallSlot;
          inoueWall.isTaunt = true;
          activePlayer.field[wallSlot] = inoueWall;
          addLog('EFFECT_TRIGGER', `【フェニックスホール】の効果発動！守護の「井上教授（壁）」（体力:100）が召喚された！`);
        }
      }

      // Environment Check 2: 隅田川
      // 「ゆきや系カード」が場に出た瞬間、この環境効果は終了する。
      if (card.definitionId.includes('yukiya') || def.tags.includes('ゆきや系')) {
        checkSumidagawaBreach(state, state.logs, def.name);
      }

      state.stateVersion += 1;
      return { success: true };
    }

    case 'USE_SPELL_CARD': {
      if (!payload.cardInstanceId) {
        return { success: false, error: '呪文カードが指定されていません。' };
      }
      const handIndex = activePlayer.hand.findIndex(c => c.instanceId === payload.cardInstanceId);
      if (handIndex === -1) {
        return { success: false, error: '手札にその魔法カードがありません。' };
      }
      const spellCard = activePlayer.hand[handIndex];
      const def = getCardDefinition(spellCard.definitionId);
      if (!def || def.type !== 'SPELL') {
        return { success: false, error: 'このカードは魔法カードではありません。' };
      }

      // If it's an attachment, use ATTACH_CARD instead
      if (def.subType === 'ATTACHMENT') {
        return { success: false, error: '付着カードは攻撃カードを指定して付属させてください。' };
      }

      // Remove from hand, put in graveyard (or exile for Yasumatsu)
      activePlayer.hand.splice(handIndex, 1);
      if (def.id === 'spl_yasumatsu') {
        spellCard.zone = 'EXILE';
        activePlayer.exile.push(spellCard);
      } else {
        spellCard.zone = 'GRAVEYARD';
        activePlayer.graveyard.push(spellCard);
      }

      const res = processSpellEffect(state, activePlayer, opponentPlayer, spellCard, payload.targetCardInstanceId);
      state.logs.push(...res.logs);

      // Check win condition
      checkGameOver(state);
      state.stateVersion += 1;
      return { success: true };
    }

    case 'ATTACH_CARD': {
      if (!payload.cardInstanceId || !payload.targetCardInstanceId) {
        return { success: false, error: '付属カードおよび対象カードを指定してください。' };
      }
      const handIndex = activePlayer.hand.findIndex(c => c.instanceId === payload.cardInstanceId);
      if (handIndex === -1) {
        return { success: false, error: '手札にそのカードがありません。' };
      }
      const attachCard = activePlayer.hand[handIndex];
      const attachDef = getCardDefinition(attachCard.definitionId);
      if (!attachDef) {
        return { success: false, error: 'カードデータが見つかりません。' };
      }

      // Find target card on friendly field
      const targetCard = activePlayer.field.find(c => c && c.instanceId === payload.targetCardInstanceId);
      if (!targetCard) {
        return { success: false, error: '付属対象の攻撃カードが戦場に見つかりません。' };
      }

      activePlayer.hand.splice(handIndex, 1);
      const res = attachCardToTarget(targetCard, attachCard);
      const targetDef = getCardDefinition(targetCard.definitionId);

      addLog('ATTACH_CARD', res.message, attachDef.name, targetDef?.name);
      state.stateVersion += 1;
      return { success: true };
    }

    case 'EVOLVE_CARD': {
      // Evolve target card on friendly field
      if (!payload.targetCardInstanceId) {
        return { success: false, error: '進化対象のカードを指定してください。' };
      }
      const targetCard = activePlayer.field.find(c => c && c.instanceId === payload.targetCardInstanceId);
      if (!targetCard) {
        return { success: false, error: '自分の場にそのカードが見つかりません。' };
      }
      const currentDef = getCardDefinition(targetCard.definitionId);
      if (!currentDef?.evolutionRule) {
        return { success: false, error: 'このカードは進化できません。' };
      }

      // If initiated via a spell card from hand (e.g. ふともも):
      if (payload.cardInstanceId) {
        const handIndex = activePlayer.hand.findIndex(c => c.instanceId === payload.cardInstanceId);
        if (handIndex !== -1) {
          const spell = activePlayer.hand.splice(handIndex, 1)[0];
          spell.zone = 'GRAVEYARD';
          activePlayer.graveyard.push(spell);
        }
      }

      evolveCard(targetCard, currentDef.evolutionRule.targetDefinitionId);
      const evolvedDef = getCardDefinition(targetCard.definitionId);
      addLog('EVOLVE', `${activePlayer.name} の「${currentDef.name}」が「${evolvedDef?.name}」へ進化した！`, evolvedDef?.name);

      checkGameOver(state);
      state.stateVersion += 1;
      return { success: true };
    }

    case 'PLAY_ENVIRONMENT': {
      if (!payload.cardInstanceId) {
        return { success: false, error: '環境カードが指定されていません。' };
      }
      const handIndex = activePlayer.hand.findIndex(c => c.instanceId === payload.cardInstanceId);
      if (handIndex === -1) {
        return { success: false, error: '手札に環境カードがありません。' };
      }
      const envCard = activePlayer.hand[handIndex];
      const def = getCardDefinition(envCard.definitionId);
      if (!def || def.type !== 'ENVIRONMENT') {
        return { success: false, error: 'このカードは環境カードではありません。' };
      }

      activePlayer.hand.splice(handIndex, 1);
      envCard.zone = 'FIELD';

      // Rule #7: Only 1 environment card on field. Existing environment card goes to its owner's graveyard.
      if (state.environment) {
        const oldCard = state.environment.cardInstance;
        oldCard.zone = 'GRAVEYARD';
        const oldOwner = oldCard.ownerId === activePlayer.playerId ? activePlayer : opponentPlayer;
        oldOwner.graveyard.push(oldCard);
        addLog('EFFECT_TRIGGER', `環境が塗り替えられ、既存の環境カード「${getCardDefinition(oldCard.definitionId)?.name}」が墓地へ送られた。`);
      }

      state.environment = {
        cardInstance: envCard,
        placedByPlayerId: activePlayer.playerId,
        placedTurn: state.turnNumber
      };

      addLog('PLAY_ENVIRONMENT', `${activePlayer.name} が環境カード「${def.name}」を展開！戦場が変化した！`, def.name);
      state.stateVersion += 1;
      return { success: true };
    }

    case 'ATTACK_CARD': {
      if (!payload.cardInstanceId || !payload.targetCardInstanceId) {
        return { success: false, error: '攻撃元カードと攻撃対象カードを指定してください。' };
      }
      const attacker = activePlayer.field.find(c => c && c.instanceId === payload.cardInstanceId);
      if (!attacker) {
        return { success: false, error: '攻撃元カードがあなたの場に存在しません。' };
      }
      const defender = opponentPlayer.field.find(c => c && c.instanceId === payload.targetCardInstanceId);
      if (!defender) {
        return { success: false, error: '攻撃対象の敵カードが存在しません。' };
      }

      const check = canCardAttackTarget(attacker.canAttack, attacker.attacksThisTurn, true, state.phase);
      if (!check.allowed) {
        return { success: false, error: check.reason };
      }

      // Taunt (守護) check
      const hasTauntOnEnemyField = opponentPlayer.field.some(c => c && c.isTaunt);
      if (hasTauntOnEnemyField && !defender.isTaunt && !attacker.canPierceTaunt) {
        return { success: false, error: '相手の場に【守護】カード（井上教授など）が存在するため、守護カードを優先して攻撃してください。' };
      }

      const atkDef = getCardDefinition(attacker.definitionId);
      const defDef = getCardDefinition(defender.definitionId);

      const totalCardsOnBoard = state.playerA.field.filter(Boolean).length + state.playerB.field.filter(Boolean).length;

      const combat = resolveCardToCardCombat(
        attacker,
        defender,
        state.environment,
        activePlayer.field,
        opponentPlayer.field,
        totalCardsOnBoard
      );

      addLog(
        'ATTACK',
        `「${atkDef?.name}」(ATK:${combat.attackerDealtDamage}) が「${defDef?.name}」を攻撃！(反撃: ${combat.defenderCounterDamage})`,
        atkDef?.name,
        defDef?.name,
        combat.attackerDealtDamage
      );

      // Handle defender death
      if (combat.defenderDied) {
        const dIdx = opponentPlayer.field.findIndex(c => c?.instanceId === defender.instanceId);
        if (dIdx !== -1) opponentPlayer.field[dIdx] = null;
        defender.zone = 'GRAVEYARD';
        opponentPlayer.graveyard.push(defender);
        if (defender.attachedCards.length > 0) {
          defender.attachedCards.forEach(att => {
            att.zone = 'GRAVEYARD';
            opponentPlayer.graveyard.push(att);
          });
          defender.attachedCards = [];
        }
        addLog('DESTROY', `敵の「${defDef?.name}」は撃破され墓地へ送られた。`);
      }

      // Handle attacker death
      if (combat.attackerDied) {
        const aIdx = activePlayer.field.findIndex(c => c?.instanceId === attacker.instanceId);
        if (aIdx !== -1) activePlayer.field[aIdx] = null;
        attacker.zone = 'GRAVEYARD';
        activePlayer.graveyard.push(attacker);
        if (attacker.attachedCards.length > 0) {
          attacker.attachedCards.forEach(att => {
            att.zone = 'GRAVEYARD';
            activePlayer.graveyard.push(att);
          });
          attacker.attachedCards = [];
        }
        addLog('DESTROY', `味方の「${atkDef?.name}」は相打ちにより破壊された。`);
      }

      checkGameOver(state);
      state.stateVersion += 1;
      return { success: true };
    }

    case 'ATTACK_PLAYER': {
      if (!payload.cardInstanceId) {
        return { success: false, error: '攻撃元カードを指定してください。' };
      }
      const attacker = activePlayer.field.find(c => c && c.instanceId === payload.cardInstanceId);
      if (!attacker) {
        return { success: false, error: '攻撃元カードがあなたの場に存在しません。' };
      }

      const check = canCardAttackTarget(attacker.canAttack, attacker.attacksThisTurn, true, state.phase);
      if (!check.allowed) {
        return { success: false, error: check.reason };
      }

      // Taunt check
      const hasTauntOnEnemyField = opponentPlayer.field.some(c => c && c.isTaunt);
      if (hasTauntOnEnemyField && !attacker.canPierceTaunt) {
        return { success: false, error: '相手の場に【守護】カード（井上教授など）が存在するため、直接攻撃できません。' };
      }

      const atkDef = getCardDefinition(attacker.definitionId);
      const totalCardsOnBoard = state.playerA.field.filter(Boolean).length + state.playerB.field.filter(Boolean).length;

      const combat = resolveCardToPlayerCombat(
        attacker,
        state.environment,
        activePlayer.field,
        totalCardsOnBoard
      );

      opponentPlayer.hp = Math.max(0, opponentPlayer.hp - combat.damage);
      addLog(
        'ATTACK',
        `「${atkDef?.name}」が ${opponentPlayer.name} にダイレクトアタック！ ${combat.damage} ダメージ！（相手残りHP: ${opponentPlayer.hp}）`,
        atkDef?.name,
        opponentPlayer.name,
        combat.damage
      );

      checkGameOver(state);
      state.stateVersion += 1;
      return { success: true };
    }

    case 'END_TURN': {
      // 1. Switch turn player
      const nextPlayerKey: PlayerKey = state.activePlayerKey === 'playerA' ? 'playerB' : 'playerA';
      state.activePlayerKey = nextPlayerKey;
      state.turnNumber += 1;

      const newActive = state[nextPlayerKey];
      const newOpponent = state[nextPlayerKey === 'playerA' ? 'playerB' : 'playerA'];

      // Reset card action states for new active player
      newActive.field.forEach(c => {
        if (c) {
          c.attacksThisTurn = 0;
          c.canAttack = true;
        }
      });
      newActive.hasDrawnThisTurn = false;
      newActive.summonCountThisTurn = 0;
      newActive.attacksCountThisTurn = 0;

      addLog('TURN_END', `${activePlayer.name} のターン終了。ターン ${state.turnNumber}：${newActive.name} のターン！`);

      // 2. Normal draw at start of turn (Rule #5 & #6)
      const isSecondPlayerFirstTurn = state.turnNumber === 2;
      const shouldDraw = state.turnNumber > 2 || isSecondPlayerFirstTurn;

      if (shouldDraw) {
        if (newActive.deck.length === 0) {
          // Deck out defeat
          state.phase = 'GAME_OVER';
          state.winnerPlayerId = newOpponent.playerId;
          state.winReason = `${newActive.name} の山札が尽きたため敗北しました。`;
          state.stateVersion += 1;
          addLog('GAME_OVER', `${newActive.name} の山札が0枚のためドローできず敗北！勝者: ${newOpponent.name}！`);
          return { success: true };
        }
        drawCardsFromDeck(newActive, 1);
        newActive.hasDrawnThisTurn = true;
        addLog('DRAW', `${newActive.name} がターン開始時にカードを1枚ドローしました。`);
      }

      checkGameOver(state);
      state.stateVersion += 1;
      return { success: true };
    }

    default:
      return { success: false, error: '不明なアクションです。' };
  }
}

export function checkGameOver(state: GameState): boolean {
  if (state.phase === 'GAME_OVER') return true;

  if (state.playerA.hp <= 0 && state.playerB.hp <= 0) {
    state.phase = 'GAME_OVER';
    state.winReason = '両者のHPが同時に0以下になり、引き分けとなりました。';
    state.stateVersion += 1;
    return true;
  }

  if (state.playerA.hp <= 0) {
    state.phase = 'GAME_OVER';
    state.winnerPlayerId = state.playerB.playerId;
    state.winReason = `${state.playerB.name} が ${state.playerA.name} のHPを0にしました！`;
    state.stateVersion += 1;
    state.logs.push({
      id: 'log_win_' + Date.now(),
      timestamp: Date.now(),
      turnNumber: state.turnNumber,
      actorPlayerId: state.playerB.playerId,
      actorPlayerName: state.playerB.name,
      type: 'GAME_OVER',
      message: `決着！${state.playerB.name} の勝利！`
    });
    return true;
  }

  if (state.playerB.hp <= 0) {
    state.phase = 'GAME_OVER';
    state.winnerPlayerId = state.playerA.playerId;
    state.winReason = `${state.playerA.name} が ${state.playerB.name} のHPを0にしました！`;
    state.stateVersion += 1;
    state.logs.push({
      id: 'log_win_' + Date.now(),
      timestamp: Date.now(),
      turnNumber: state.turnNumber,
      actorPlayerId: state.playerA.playerId,
      actorPlayerName: state.playerA.name,
      type: 'GAME_OVER',
      message: `決着！${state.playerA.name} の勝利！`
    });
    return true;
  }

  return false;
}
