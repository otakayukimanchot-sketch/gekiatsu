import { CardInstance } from '../../cards/types';
import { getCardDefinition } from '../../cards/cardRegistry';
import { GameState, PlayerCombatState, GameEventLog } from '../types';

export interface EffectResult {
  success: boolean;
  message: string;
  logs: GameEventLog[];
  cardsToGraveyard?: CardInstance[];
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

  if (def.subType === 'NORMAL') {
    // Check specific spells
    if (def.id === 'spl_lightning') {
      // Enemy card or player
      let targetFound = false;
      if (targetCardInstanceId) {
        for (let i = 0; i < opponent.field.length; i++) {
          const card = opponent.field[i];
          if (card && card.instanceId === targetCardInstanceId) {
            const cardDef = getCardDefinition(card.definitionId);
            card.currentHp -= 800;
            targetFound = true;
            addLog(`【雷撃ボルト】が敵の「${cardDef?.name}」に800ダメージを与えた！`, 800, cardDef?.name);
            if (card.currentHp <= 0) {
              opponent.field[i] = null;
              card.zone = 'GRAVEYARD';
              opponent.graveyard.push(card);
              // graveyard for attachments
              if (card.attachedCards.length > 0) {
                card.attachedCards.forEach(att => {
                  att.zone = 'GRAVEYARD';
                  opponent.graveyard.push(att);
                });
                card.attachedCards = [];
              }
              addLog(`「${cardDef?.name}」は破壊され墓地へ送られた。`);
            }
            break;
          }
        }
      }
      if (!targetFound) {
        // Target is enemy player directly
        opponent.hp = Math.max(0, opponent.hp - 800);
        addLog(`【雷撃ボルト】が${opponent.name}に800の直接ダメージを与えた！`, 800, opponent.name);
      }
    } else if (def.id === 'spl_heal_spring') {
      const healAmount = 1000;
      player.hp = Math.min(player.maxHp, player.hp + healAmount);
      addLog(`【生命の泉】により${player.name}のHPが${healAmount}回復した！（現在HP: ${player.hp}）`, healAmount);
    } else if (def.id === 'spl_shirankedo_spell') {
      // Server-side random 3-way outcome
      const rand = Math.random();
      if (rand < 0.35) {
        // 600 damage to all enemy cards
        let hitCount = 0;
        opponent.field.forEach((card, idx) => {
          if (card) {
            card.currentHp -= 600;
            hitCount++;
            if (card.currentHp <= 0) {
              const cardDef = getCardDefinition(card.definitionId);
              opponent.field[idx] = null;
              card.zone = 'GRAVEYARD';
              opponent.graveyard.push(card);
              if (card.attachedCards.length > 0) {
                card.attachedCards.forEach(att => {
                  att.zone = 'GRAVEYARD';
                  opponent.graveyard.push(att);
                });
                card.attachedCards = [];
              }
              addLog(`「${cardDef?.name}」は【知らんけど】の爆発で破壊された！`);
            }
          }
        });
        addLog(`【知らんけど】発動！「なんか知らんけど奇跡起きた！」敵全カードに600ダメージ！（${hitCount}体命中）`);
      } else if (rand < 0.70) {
        // Friendly cards +400 ATK
        let buffCount = 0;
        player.field.forEach(card => {
          if (card) {
            card.currentAtk += 400;
            buffCount++;
          }
        });
        addLog(`【知らんけど】発動！「勢いでいける気がする！」自軍全カードのATKが+400！（${buffCount}体強化）`);
      } else {
        // Nothing happens
        addLog(`【知らんけど】発動！「……やっぱり知らんけどな。」（何も起こらなかった！）`);
      }
    } else if (def.id === 'spl_draw_boost') {
      const drawn = drawCardsFromDeck(player, 2);
      addLog(`【魔導の啓示】によりカードを${drawn.length}枚ドローした！`, drawn.length);
    } else if (def.id === 'spl_cataclysm') {
      // All cards on field take 700 damage
      let destroyed = 0;
      [player, opponent].forEach(p => {
        p.field.forEach((card, idx) => {
          if (card) {
            card.currentHp -= 700;
            if (card.currentHp <= 0) {
              const cDef = getCardDefinition(card.definitionId);
              p.field[idx] = null;
              card.zone = 'GRAVEYARD';
              p.graveyard.push(card);
              if (card.attachedCards.length > 0) {
                card.attachedCards.forEach(att => {
                  att.zone = 'GRAVEYARD';
                  p.graveyard.push(att);
                });
                card.attachedCards = [];
              }
              destroyed++;
              addLog(`「${cDef?.name}」は【天地崩壊】に巻き込まれ消滅した。`);
            }
          }
        });
      });
      addLog(`【天地崩壊】が戦場を襲う！全攻撃カードに700ダメージ！（計${destroyed}枚消滅）`);
    }

    // Check temple environment: Draw 1 card when using spell!
    if (state.environment && state.environment.cardInstance.definitionId === 'env_temple') {
      const templeDraw = drawCardsFromDeck(player, 1);
      if (templeDraw.length > 0) {
        addLog(`【静寂の魔導神殿】の加護によりカードを1枚ドローした！`);
      }
    }
  }

  return { success: true, message: '魔法を発動しました', logs };
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
      // Hand is full (10 cards max), send to graveyard
      card.zone = 'GRAVEYARD';
      player.graveyard.push(card);
    }
  }
  return drawn;
}

export function attachCardToTarget(
  hostCard: CardInstance,
  attachmentCard: CardInstance
): { success: boolean; message: string } {
  const def = getCardDefinition(attachmentCard.definitionId);
  if (!def || !def.attachmentRule) {
    return { success: false, message: '付着カードの定義が無効です' };
  }

  attachmentCard.zone = 'ATTACHED';
  attachmentCard.hostCardId = hostCard.instanceId;
  hostCard.attachedCards.push(attachmentCard);

  // Apply buffs
  hostCard.currentAtk += def.attachmentRule.atkBonus;
  hostCard.currentHp += def.attachmentRule.hpBonus;
  hostCard.maxHp += def.attachmentRule.hpBonus;

  if (def.attachmentRule.grantTaunt) {
    hostCard.isTaunt = true;
  }
  if (def.attachmentRule.grantCharge) {
    hostCard.hasCharge = true;
    hostCard.canAttack = true;
  }

  return { success: true, message: `「${def.name}」を付着しました！` };
}

export function evolveCard(
  targetCard: CardInstance
): { success: boolean; message: string; evolvedDefinitionId?: string } {
  const currentDef = getCardDefinition(targetCard.definitionId);
  if (!currentDef || !currentDef.evolutionRule) {
    return { success: false, message: 'このカードは進化できません' };
  }

  const evolvedDef = getCardDefinition(currentDef.evolutionRule.targetDefinitionId);
  if (!evolvedDef) {
    return { success: false, message: '進化先カードが見つかりません' };
  }

  // Update card definition to evolved card
  targetCard.definitionId = evolvedDef.id;
  targetCard.baseAtk = evolvedDef.baseAtk || 0;
  targetCard.currentAtk = targetCard.baseAtk;
  targetCard.maxHp = evolvedDef.baseHp || 1000;
  targetCard.currentHp = targetCard.maxHp;

  if (evolvedDef.effects.some(e => e.specialAction === 'TAUNT')) {
    targetCard.isTaunt = true;
  }
  if (evolvedDef.effects.some(e => e.specialAction === 'CHARGE')) {
    targetCard.hasCharge = true;
    targetCard.canAttack = true;
  }

  return {
    success: true,
    message: `「${currentDef.name}」が「${evolvedDef.name}」へと進化した！`,
    evolvedDefinitionId: evolvedDef.id
  };
}
