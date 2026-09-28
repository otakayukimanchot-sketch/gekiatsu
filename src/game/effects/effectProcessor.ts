import { CardInstance } from '../../cards/types';
import { getCardDefinition } from '../../cards/cardRegistry';
import { GameState, PlayerCombatState, GameEventLog } from '../types';
import { createCardInstance } from '../engine/deckBuilder';

export interface EffectResult {
  success: boolean;
  message: string;
  logs: GameEventLog[];
  cardsToGraveyard?: CardInstance[];
  revealedHand?: CardInstance[];
}

export function processSpellEffect(
  state: GameState,
  player: PlayerCombatState,
  opponent: PlayerCombatState,
  spellCard: CardInstance,
  targetCardInstanceId?: string
): EffectResult {
  const def = getCardDefinition(spellCard.definitionId);
  if (!def) return { success: false, message: '呪文データが見つかりません', logs: [] };

  const logs: GameEventLog[] = [];
  const addLog = (msg: string, value?: number, targetName?: string) => {
    logs.push({
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      turnNumber: state.turnNumber,
      actorPlayerId: player.playerId,
      actorPlayerName: player.name,
      type: 'USE_SPELL',
      message: msg,
      cardName: def.name,
      targetName,
      value
    });
  };

  let revealedHand: CardInstance[] | undefined = undefined;

  // 1. のぞきのそうくん
  if (def.id === 'spl_nozoki_sokun') {
    // Check if opponent has "見えてます"
    const hasMietemasu = opponent.hand.some(c => c.definitionId === 'spl_mietemasu');
    if (hasMietemasu) {
      addLog(`【のぞきのそうくん】発動！しかし相手の手札の「見えてます」に感知され、効果は完全に無効化された！`);
    } else {
      revealedHand = opponent.hand;
      addLog(`【のぞきのそうくん】発動！相手の手札（${opponent.hand.length}枚）を覗き見た！`);
    }
  }

  // 2. 見えてます
  else if (def.id === 'spl_mietemasu') {
    addLog(`【見えてます】発動！「全部見えてますから。」相手の覗き見を牽制する結界を展開！`);
  }

  // 3. 蛍光マーカーのりゅーのすけ
  else if (def.id === 'spl_fluorescent_ryunosuke') {
    if (opponent.hand.length > 0) {
      const randIdx = Math.floor(Math.random() * opponent.hand.length);
      const discarded = opponent.hand.splice(randIdx, 1)[0];
      discarded.zone = 'GRAVEYARD';
      opponent.graveyard.push(discarded);
      const dDef = getCardDefinition(discarded.definitionId);
      addLog(`【蛍光マーカーのりゅーのすけ】発動！蛍光マーカーの眩しさで相手の手札「${dDef?.name}」を墓地へ捨てさせた！`, undefined, dDef?.name);
    } else {
      addLog(`【蛍光マーカーのりゅーのすけ】発動！しかし相手の手札は0枚だった！`);
    }
  }

  // 4. 待てないそうくん
  else if (def.id === 'spl_matenai_sokun') {
    player.field.forEach(c => {
      if (c) {
        c.attacksThisTurn = 0;
        c.canAttack = true;
      }
    });
    player.hasDrawnThisTurn = false;
    addLog(`【待てないそうくん】発動！「届いたら先に食べるのは当たり前だよね！」自分のターンを続行し全カードが再攻撃可能になった！`);
  }

  // 5. さびしがりやのゆきや
  else if (def.id === 'spl_sabishigariya_yukiya') {
    addLog(`【さびしがりやのゆきや】発動！「一人じゃ寂しい…」追加で攻撃カードを召喚できるようになった！`);
    // Check Sumidagawa environment rule: ends if yukiya card appears
    checkSumidagawaBreach(state, logs, 'さびしがりやのゆきや');
  }

  // 6. ふともも
  else if (def.id === 'spl_futomomo') {
    const ryuku = player.field.find(c => c && c.definitionId === 'atk_yoshida_ryuku');
    if (ryuku) {
      evolveCard(ryuku, 'evo_ryuku_skywalker');
      addLog(`【ふともも】の効果で「吉田りゅうく」が「リューク・スカイウォーカー」へと進化した！「リュークと共にあらんことを」！`);
    } else {
      addLog(`【ふともも】を使用したが、場に「吉田りゅうく」がいなかったため進化は不発に終わった！`);
    }
  }

  // 7. 数珠カード (通常使用時: 1枚ドロー)
  else if (def.id === 'spl_juzu_card') {
    const drawn = drawCardsFromDeck(player, 1);
    addLog(`【数珠カード】の効果で山札からカードを1枚引いた！`, drawn.length);
  }

  // 11. 三者面談
  else if (def.id === 'spl_sansha_mendan') {
    let target = player.field.find(c => c && c.instanceId === targetCardInstanceId) || player.field.find(c => c !== null);
    if (target) {
      target.isTaunt = true; // Protects and absorbs
      addLog(`【三者面談】発動！「${getCardDefinition(target.definitionId)?.name}」への攻撃を無効化する加護が付与された！`);
    } else {
      addLog(`【三者面談】を発動したが、対象のカードが存在しなかった！`);
    }
  }

  // 12. トレード
  else if (def.id === 'spl_trade') {
    const myCardIdx = player.field.findIndex(c => c !== null);
    const oppCardIdx = opponent.field.findIndex(c => c !== null);
    if (myCardIdx !== -1 && oppCardIdx !== -1) {
      const myCard = player.field[myCardIdx]!;
      const oppCard = opponent.field[oppCardIdx]!;
      myCard.ownerId = opponent.playerId;
      oppCard.ownerId = player.playerId;
      player.field[myCardIdx] = oppCard;
      opponent.field[oppCardIdx] = myCard;
      addLog(`【トレード】成立！自分の「${getCardDefinition(myCard.definitionId)?.name}」と相手の「${getCardDefinition(oppCard.definitionId)?.name}」を強制交換した！`);
    } else {
      addLog(`【トレード】を発動したが、互いの場にカードが揃っておらず交換できなかった！`);
    }
  }

  // 13. 絶対に許さない
  else if (def.id === 'spl_zettai_yurusanai') {
    if (player.hp <= 1000) {
      player.field.forEach(c => {
        if (c) c.currentAtk += 2000;
      });
      addLog(`【絶対に許さない】発動！HP1000以下の極限状態で全自軍カードの攻撃力が＋2000された！！`, 2000);
    } else {
      addLog(`【絶対に許さない】を発動したが、HPが1000を超えているため効果は発動しなかった！（現在HP: ${player.hp}）`);
    }
  }

  // 14. もう一枚だけ
  else if (def.id === 'spl_mou_ichimai_dake') {
    const drawn = drawCardsFromDeck(player, 2);
    player.hasDrawnThisTurn = true; // Mark as drawn
    addLog(`【もう一枚だけ】発動！カードを2枚引いた！（次のターンは通常ドロー不可）`, drawn.length);
  }

  // 15. 何してんの？
  else if (def.id === 'spl_nani_shitenno') {
    addLog(`【何してんの？】発動！「……何してんの？」相手の次の攻撃を牽制した！`);
  }

  // 16. 知らんけど
  else if (def.id === 'spl_shirankedo') {
    const isHeads = Math.random() < 0.5;
    if (isHeads) {
      player.field.forEach(c => {
        if (c) c.currentAtk += 1000;
      });
      addLog(`【知らんけど】発動！【表】が出た！自軍カードの攻撃力＋1000！！（知らんけど）`, 1000);
    } else {
      player.field.forEach(c => {
        if (c) c.currentAtk = Math.max(0, c.currentAtk - 500);
      });
      addLog(`【知らんけど】発動！【裏】が出た！自軍カードの攻撃力−500……（知らんけど）`, 500);
    }
  }

  // 17. とりあえず落ち着こう
  else if (def.id === 'spl_ochitsukou') {
    [player, opponent].forEach(p => {
      p.field.forEach(c => {
        if (c) c.currentAtk = 0;
      });
    });
    addLog(`【とりあえず落ち着こう】発動！戦場にいる全カードの攻撃力が0になった！`);
  }

  // 18. そっくりさん
  else if (def.id === 'spl_sokkurisan') {
    const oppCard = opponent.field.find(c => c && c.instanceId === targetCardInstanceId) || opponent.field.find(c => c !== null);
    const myCard = player.field.find(c => c !== null);
    if (oppCard && myCard) {
      myCard.currentAtk = oppCard.currentAtk;
      myCard.currentHp = oppCard.currentHp;
      myCard.maxHp = oppCard.maxHp;
      addLog(`【そっくりさん】発動！「${getCardDefinition(myCard.definitionId)?.name}」が敵の「${getCardDefinition(oppCard.definitionId)?.name}」のステータス（ATK:${oppCard.currentAtk} / HP:${oppCard.currentHp}）を完全コピーした！`);
    } else {
      addLog(`【そっくりさん】を発動したが、対象が存在しなかった！`);
    }
  }

  // 19. 安松
  else if (def.id === 'spl_yasumatsu') {
    let buffCount = 0;
    player.field.forEach(c => {
      if (c && (c.definitionId === 'atk_shochan' || c.definitionId === 'atk_mue' || c.definitionId === 'atk_orichan')) {
        c.currentAtk += 10000;
        buffCount++;
      }
    });
    addLog(`【安松】発動！一回限定の超絶パワー！ムエ・しょーちゃん・おりちゃんの攻撃力を＋10000した！（${buffCount}体強化）カードは消滅する！`, 10000);
  }

  // Environment check: 炎上する教室
  // さらに、魔法カードが使用されたとき、場にいる全キャラクターに50ダメージ
  if (state.environment && state.environment.cardInstance.definitionId === 'env_burning_classroom') {
    [player, opponent].forEach(p => {
      p.field.forEach((c, idx) => {
        if (c) {
          c.currentHp -= 50;
          if (c.currentHp <= 0) {
            const cDef = getCardDefinition(c.definitionId);
            p.field[idx] = null;
            c.zone = 'GRAVEYARD';
            p.graveyard.push(c);
            addLog(`【炎上する教室】の余波で「${cDef?.name}」が力尽きた。`);
          }
        }
      });
    });
    addLog(`【炎上する教室】の炎上効果！魔法使用の反動で場の全カードに50ダメージ！`, 50);
  }

  return { success: true, message: '魔法を発動しました', logs, revealedHand };
}

export function drawCardsFromDeck(player: PlayerCombatState, count: number): CardInstance[] {
  const drawn: CardInstance[] = [];
  for (let i = 0; i < count; i++) {
    if (player.deck.length === 0) break;
    const card = player.deck.shift()!;
    card.zone = 'HAND';
    if (player.hand.length < 10) {
      player.hand.push(card);
      drawn.push(card);
    } else {
      card.zone = 'GRAVEYARD';
      player.graveyard.push(card);
    }
  }
  return drawn;
}

/**
 * Attaches a card to a host card. Handles evolution checks:
 * 1. 綺麗なよしえ + 数珠カード -> 塩よしえ
 * 2. 塩よしえ + うんこかーど -> 嘉慧 (ATK +50)
 * 3. 嘉慧 + ユキやカード -> よしえEX (ATK +100, HP +50)
 * 4. まゆサブレ + 顎カード -> 顎・キャノン (他ならATK +300)
 * 5. ヘッドフォンニキ + ヘッドフォンニキ -> オンフードヘッドフォンニキ
 */
export function attachCardToTarget(
  hostCard: CardInstance,
  attachmentCard: CardInstance
): { success: boolean; message: string; evolved?: boolean } {
  const attachDef = getCardDefinition(attachmentCard.definitionId);
  const hostDef = getCardDefinition(hostCard.definitionId);
  if (!attachDef || !hostDef) {
    return { success: false, message: 'カードデータが見つかりません' };
  }

  attachmentCard.zone = 'ATTACHED';
  attachmentCard.hostCardId = hostCard.instanceId;
  hostCard.attachedCards.push(attachmentCard);

  // 1. 綺麗なよしえ + 数珠カード -> 塩よしえ
  if (hostCard.definitionId === 'atk_yoshie_clean' && attachmentCard.definitionId === 'spl_juzu_card') {
    evolveCard(hostCard, 'evo_yoshie_salt');
    return { success: true, message: '「綺麗なよしえ」に「数珠カード」を付属！「塩よしえ」へ進化した！', evolved: true };
  }

  // 2. 塩よしえ + うんこかーど -> 嘉慧 (うんこかーど攻撃力+50加算)
  if (hostCard.definitionId === 'evo_yoshie_salt' && attachmentCard.definitionId === 'spl_unko_card') {
    evolveCard(hostCard, 'evo_yoshie_kakei');
    hostCard.currentAtk += 50;
    return { success: true, message: '「塩よしえ」に「うんこかーど」を付属！「普通に話すだけならいいよー（嘘）」嘉慧へ進化！（ATK+50）', evolved: true };
  }

  // 3. 嘉慧 + ユキやカード -> よしえEX (ユキやカード ATK+100, HP+50)
  if (hostCard.definitionId === 'evo_yoshie_kakei' && attachmentCard.definitionId === 'spl_yukiya_card') {
    evolveCard(hostCard, 'evo_yoshie_ex');
    hostCard.currentAtk += 100;
    hostCard.currentHp += 50;
    hostCard.maxHp += 50;
    return { success: true, message: '「嘉慧」に「ユキやカード」を付属！「よしえEX」へと究極進化！（ATK+100/HP+50）', evolved: true };
  }

  // 4. まゆサブレ + 顎カード -> 顎・キャノン
  if (hostCard.definitionId === 'atk_mayu_sable' && attachmentCard.definitionId === 'spl_ago_card') {
    evolveCard(hostCard, 'evo_ago_cannon');
    return { success: true, message: '「まゆサブレ」に「顎カード」を付属！「顎・キャノン」へ進化した！', evolved: true };
  }

  // 5. ヘッドフォンニキ + ヘッドフォンニキ -> オンフードヘッドフォンニキ
  if (hostCard.definitionId === 'atk_headphone_niki' && attachmentCard.definitionId === 'atk_headphone_niki') {
    evolveCard(hostCard, 'evo_onhood_headphone_niki');
    return { success: true, message: '「ヘッドフォンニキ」に「ヘッドフォンニキ」を重ねた！「オンフードヘッドフォンニキ」へ合体進化！', evolved: true };
  }

  // General attachment stat bonuses
  if (attachDef.attachmentRule) {
    hostCard.currentAtk += attachDef.attachmentRule.atkBonus;
    hostCard.currentHp += attachDef.attachmentRule.hpBonus;
    hostCard.maxHp += attachDef.attachmentRule.hpBonus;
  } else if (attachmentCard.definitionId === 'spl_yukiya_card') {
    hostCard.currentAtk += 100;
    hostCard.currentHp += 50;
    hostCard.maxHp += 50;
  } else if (attachmentCard.definitionId === 'spl_unko_card') {
    hostCard.currentAtk += 50;
  }

  return { success: true, message: `「${attachDef.name}」を「${hostDef.name}」に付属しました！` };
}

export function evolveCard(targetCard: CardInstance, targetDefId: string) {
  const evolvedDef = getCardDefinition(targetDefId);
  if (!evolvedDef) return;

  targetCard.definitionId = evolvedDef.id;
  targetCard.baseAtk = evolvedDef.baseAtk || 0;
  targetCard.currentAtk = targetCard.baseAtk;
  targetCard.maxHp = evolvedDef.baseHp || 100;
  targetCard.currentHp = targetCard.maxHp;

  if (evolvedDef.effects.some(e => e.specialAction === 'TAUNT')) {
    targetCard.isTaunt = true;
  }
}

/**
 * Checks if the Sumidagawa environment ends when a yukiya card appears
 */
export function checkSumidagawaBreach(state: GameState, logs: GameEventLog[], cardName: string) {
  if (state.environment && state.environment.cardInstance.definitionId === 'env_sumidagawa') {
    const envCard = state.environment.cardInstance;
    envCard.zone = 'GRAVEYARD';
    state.environment = null;
    logs.push({
      id: 'log_env_end_' + Date.now(),
      timestamp: Date.now(),
      turnNumber: state.turnNumber,
      actorPlayerId: 'system',
      actorPlayerName: '環境判定',
      type: 'EFFECT_TRIGGER',
      message: `「${cardName}」が場に出現したため、【隅田川】の環境効果が終了・消滅した！`
    });
  }
}
