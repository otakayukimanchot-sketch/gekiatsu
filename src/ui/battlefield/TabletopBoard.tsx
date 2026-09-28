import React, { useState } from 'react';
import { SanitizedGameState } from '../../online/types';
import { CardInstance } from '../../cards/types';
import { getCardDefinition } from '../../cards/cardRegistry';
import { OpponentHand } from '../hand/OpponentHand';
import { CardView } from '../cards/CardView';
import { DeckStack3D } from '../deck/DeckStack3D';
import { GraveyardPile } from '../graveyard/GraveyardPile';
import { GraveyardModal } from '../graveyard/GraveyardModal';
import { FieldSlot } from './FieldSlot';
import { EnvironmentZone } from './EnvironmentZone';
import { CardDetailModal } from '../cards/CardDetailModal';
import { LogDrawer } from './LogDrawer';
import { 
  Heart, Sword, Shield, LogOut, Info, AlertTriangle, 
  RotateCcw, Trophy, Skull, Flame, Sparkles, CheckCircle2 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TabletopBoardProps {
  gameState: SanitizedGameState;
  onSendAction: (actionType: string, payload?: any) => void;
  onLeaveRoom: () => void;
  onRematch?: () => void;
}

export const TabletopBoard: React.FC<TabletopBoardProps> = ({
  gameState,
  onSendAction,
  onLeaveRoom,
  onRematch
}) => {
  const { me, opponent, isMyTurn, phase, environment, logs, winnerPlayerId, winReason } = gameState;

  // Local selection states
  const [selectedHandCard, setSelectedHandCard] = useState<CardInstance | null>(null);
  const [hoveredHandCardId, setHoveredHandCardId] = useState<string | null>(null);
  const [selectedFieldCard, setSelectedFieldCard] = useState<CardInstance | null>(null);
  const [inspectCard, setInspectCard] = useState<CardInstance | null>(null);
  const [viewingGraveyard, setViewingGraveyard] = useState<'me' | 'opp' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Trigger confetti on victory
  React.useEffect(() => {
    if (phase === 'GAME_OVER' && winnerPlayerId === me.playerId) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [phase, winnerPlayerId, me.playerId]);

  const clearSelection = () => {
    setSelectedHandCard(null);
    setHoveredHandCardId(null);
    setSelectedFieldCard(null);
    setActionError(null);
  };

  // Hand card click handler
  const handleSelectHandCard = (card: CardInstance) => {
    if (!isMyTurn) {
      setInspectCard(card);
      return;
    }

    if (selectedHandCard?.instanceId === card.instanceId) {
      clearSelection();
      return;
    }

    setSelectedHandCard(card);
    setSelectedFieldCard(null);
    setActionError(null);
  };

  // Friendly field card click handler
  const handleFriendlyFieldCardClick = (card: CardInstance | null, slotIndex: number) => {
    if (!isMyTurn) {
      if (card) setInspectCard(card);
      return;
    }

    // If an attack card is selected in hand, placing it on this slot
    if (selectedHandCard) {
      const def = getCardDefinition(selectedHandCard.definitionId);
      if (def?.type === 'ATTACK') {
        if (card === null) {
          onSendAction('PLAY_ATTACK_CARD', {
            cardInstanceId: selectedHandCard.instanceId,
            targetSlotIndex: slotIndex
          });
          clearSelection();
          return;
        } else {
          setActionError('その枠には既にカードが配置されています。');
          return;
        }
      }

      // If an attachment spell is selected in hand, attach to this card!
      if (def?.type === 'SPELL' && def.subType === 'ATTACHMENT') {
        if (card) {
          onSendAction('ATTACH_CARD', {
            cardInstanceId: selectedHandCard.instanceId,
            targetCardInstanceId: card.instanceId
          });
          clearSelection();
          return;
        } else {
          setActionError('付着させる攻撃カードを選択してください。');
          return;
        }
      }

      // If evolution spell or target is selected
      if (def?.type === 'SPELL' && def.subType === 'EVOLUTION') {
        if (card) {
          onSendAction('EVOLVE_CARD', {
            cardInstanceId: selectedHandCard.instanceId,
            targetCardInstanceId: card.instanceId
          });
          clearSelection();
          return;
        }
      }
    }

    // If no hand card selected, toggle selecting this field card for attack
    if (card) {
      if (selectedFieldCard?.instanceId === card.instanceId) {
        setSelectedFieldCard(null);
      } else {
        if (card.canAttack && card.attacksThisTurn === 0) {
          setSelectedFieldCard(card);
        } else {
          setInspectCard(card);
        }
      }
    }
  };

  // Opponent field card click handler
  const handleOpponentFieldCardClick = (card: CardInstance | null) => {
    if (!card) return;

    // If spell targeting an enemy card
    if (selectedHandCard) {
      const def = getCardDefinition(selectedHandCard.definitionId);
      if (def?.type === 'SPELL') {
        if (def.subType === 'ATTACHMENT' && def.attachmentRule?.allowedTarget === 'ANY_ATTACK') {
          onSendAction('ATTACH_CARD', {
            cardInstanceId: selectedHandCard.instanceId,
            targetCardInstanceId: card.instanceId
          });
          clearSelection();
          return;
        }
        if (def.subType === 'NORMAL') {
          onSendAction('USE_SPELL_CARD', {
            cardInstanceId: selectedHandCard.instanceId,
            targetCardInstanceId: card.instanceId
          });
          clearSelection();
          return;
        }
      }
    }

    // If attacking with field card
    if (selectedFieldCard && isMyTurn) {
      onSendAction('ATTACK_CARD', {
        cardInstanceId: selectedFieldCard.instanceId,
        targetCardInstanceId: card.instanceId
      });
      clearSelection();
      return;
    }

    // Otherwise inspect
    setInspectCard(card);
  };

  // Direct attack opponent player
  const handleAttackOpponentPlayer = () => {
    if (selectedFieldCard && isMyTurn) {
      onSendAction('ATTACK_PLAYER', {
        cardInstanceId: selectedFieldCard.instanceId
      });
      clearSelection();
    }
  };

  // Place environment card
  const handlePlaceEnvironment = () => {
    if (selectedHandCard) {
      const def = getCardDefinition(selectedHandCard.definitionId);
      if (def?.type === 'ENVIRONMENT') {
        onSendAction('PLAY_ENVIRONMENT', {
          cardInstanceId: selectedHandCard.instanceId
        });
        clearSelection();
      }
    }
  };

  // Cast selected normal spell
  const handleCastSpell = () => {
    if (selectedHandCard) {
      const def = getCardDefinition(selectedHandCard.definitionId);
      if (def?.type === 'SPELL' && def.subType === 'NORMAL') {
        onSendAction('USE_SPELL_CARD', {
          cardInstanceId: selectedHandCard.instanceId
        });
        clearSelection();
      }
    }
  };

  const selectedDef = selectedHandCard ? getCardDefinition(selectedHandCard.definitionId) : null;
  const isAttackCardSelected = selectedDef?.type === 'ATTACK';
  const isSpellSelected = selectedDef?.type === 'SPELL' && selectedDef.subType === 'NORMAL';
  const isAttachmentSelected = selectedDef?.type === 'SPELL' && selectedDef.subType === 'ATTACHMENT';
  const isEnvironmentSelected = selectedDef?.type === 'ENVIRONMENT';

  const isGameOver = phase === 'GAME_OVER';
  const iWon = winnerPlayerId === me.playerId;

  return (
    <div className="relative w-full h-[100dvh] flex flex-col justify-between overflow-hidden bg-stone-950 text-stone-100 select-none font-sans">
      {/* Felt / Wood Tabletop Texture Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-90"
        style={{
          background: 'radial-gradient(ellipse at center, #1b382b 0%, #0d2118 65%, #08140f 100%)',
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
        }}
      />
      {/* Subtle wood border framing */}
      <div className="absolute inset-0 border-8 border-amber-950/80 rounded-none pointer-events-none shadow-2xl" />

      {/* TOP: OPPONENT AREA */}
      <div className="relative z-20 w-full flex flex-col px-3 pt-2">
        {/* Opponent Header Bar */}
        <div className="flex items-center justify-between gap-2 max-w-lg mx-auto w-full">
          {/* Opponent Info */}
          <div
            onClick={handleAttackOpponentPlayer}
            className={`flex items-center gap-2 p-1.5 rounded-lg bg-stone-900/80 border transition-all ${
              selectedFieldCard && isMyTurn
                ? 'border-red-500 ring-2 ring-red-500/80 bg-red-950/40 cursor-pointer animate-pulse'
                : 'border-stone-800'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-sm font-bold shadow">
              {opponent.avatarIcon === 'rocket' ? '🚀' : opponent.avatarIcon === 'ghost' ? '👻' : '👤'}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-stone-200">{opponent.name}</span>
                {!opponent.isConnected && (
                  <span className="text-[9px] bg-red-900 text-red-300 px-1 rounded">切断中</span>
                )}
                {selectedFieldCard && isMyTurn && (
                  <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded animate-bounce">
                    攻撃可能！
                  </span>
                )}
              </div>
              {/* HP Bar */}
              <div className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                <div className="w-24 h-3 bg-stone-950 rounded-full border border-stone-700 overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-rose-600 to-red-400 transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, (opponent.hp / opponent.maxHp) * 100))}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-rose-300 ml-0.5">{opponent.hp}</span>
              </div>
            </div>
          </div>

          {/* Opponent Deck & Graveyard */}
          <div className="flex items-center gap-3">
            <DeckStack3D cardCount={opponent.deckCount} isOpponent label="山札" />
            <GraveyardPile
              cards={opponent.graveyard}
              label="墓地"
              onClick={() => setViewingGraveyard('opp')}
            />
          </div>
        </div>

        {/* Opponent Fanned Hand (Face Down) */}
        <div className="w-full flex justify-center -mt-1">
          <OpponentHand cards={opponent.maskedHand} count={opponent.handCount} />
        </div>
      </div>

      {/* CENTER: BATTLEFIELD */}
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-2 py-1">
        {/* Opponent Field (5 slots) */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2">
          {opponent.field.map((card, idx) => (
            <FieldSlot
              key={`opp_slot_${idx}`}
              card={card}
              slotIndex={idx}
              isFriendly={false}
              isTargetable={
                (!!selectedFieldCard && isMyTurn) ||
                (isSpellSelected && !!card) ||
                (isAttachmentSelected && !!card)
              }
              onClick={() => handleOpponentFieldCardClick(card)}
              onInspectCard={setInspectCard}
            />
          ))}
        </div>

        {/* Center River / Environment / Turn Status Bar */}
        <div className="flex items-center justify-between py-1 px-3 my-1 rounded-xl bg-black/40 border border-stone-800/80 backdrop-blur-xs">
          {/* Environment zone */}
          <EnvironmentZone
            environment={environment}
            canPlace={isEnvironmentSelected && isMyTurn}
            onPlaceEnvironment={handlePlaceEnvironment}
            onInspect={() => {
              if (environment) setInspectCard(environment.cardInstance);
            }}
          />

          {/* Turn & Action status */}
          <div className="flex flex-col items-center justify-center flex-1 px-2">
            <div className={`px-3 py-1 rounded-full text-xs font-black tracking-wider shadow flex items-center gap-1.5 ${
              isMyTurn
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-stone-800 text-stone-400'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isMyTurn ? 'あなたのターン' : '相手のターン'} (T{gameState.turnNumber})</span>
            </div>

            {/* Hint message */}
            <div className="mt-1 text-[10px] text-stone-400 text-center truncate max-w-xs">
              {selectedHandCard && (
                <span className="text-yellow-300 font-bold">
                  {isAttackCardSelected ? '空きスロットをタップして配置' :
                   isAttachmentSelected ? '付着させるカードをタップ' :
                   isEnvironmentSelected ? '環境ゾーンをタップして展開' : '魔法を使用できます'}
                </span>
              )}
              {selectedFieldCard && (
                <span className="text-red-400 font-bold">
                  攻撃対象の敵カードまたは相手プレイヤーをタップ！
                </span>
              )}
              {!selectedHandCard && !selectedFieldCard && (
                <span>カードを選択して操作してください</span>
              )}
            </div>

            {/* Error toast if any */}
            {actionError && (
              <div className="mt-1 text-[10px] bg-red-950/90 border border-red-500 text-red-200 px-2 py-0.5 rounded flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{actionError}</span>
              </div>
            )}
          </div>

          {/* End Turn / Actions Button */}
          <div className="flex flex-col gap-1 items-end">
            <button
              disabled={!isMyTurn}
              onClick={() => onSendAction('END_TURN')}
              className={`px-3 py-2 rounded-lg font-black text-xs shadow-lg transition-all ${
                isMyTurn
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-stone-950 hover:brightness-110 active:scale-95 cursor-pointer ring-2 ring-yellow-400'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              ターン終了
            </button>
            <button
              onClick={() => {
                if (window.confirm('降伏して対戦を終了しますか？')) {
                  onSendAction('SURRENDER');
                }
              }}
              className="text-[9px] text-stone-500 hover:text-stone-300 px-1 py-0.5"
            >
              降伏
            </button>
          </div>
        </div>

        {/* Battle Event Logs Ticker & Drawer (Center positioned for clear visibility) */}
        <div className="w-full max-w-lg mx-auto my-0.5">
          <LogDrawer logs={logs} myPlayerId={me.playerId} />
        </div>

        {/* My Field (5 slots) */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-1">
          {me.field.map((card, idx) => (
            <FieldSlot
              key={`my_slot_${idx}`}
              card={card}
              slotIndex={idx}
              isFriendly={true}
              isSelected={selectedFieldCard?.instanceId === card?.instanceId}
              canAct={isMyTurn && !!card && card.canAttack && card.attacksThisTurn === 0}
              isAttacker={selectedFieldCard?.instanceId === card?.instanceId}
              canPlaceCard={isAttackCardSelected && card === null && isMyTurn}
              isTargetable={isAttachmentSelected && !!card && isMyTurn}
              onClick={() => handleFriendlyFieldCardClick(card, idx)}
              onInspectCard={setInspectCard}
            />
          ))}
        </div>
      </div>

      {/* BOTTOM: MY AREA (Elevated with safe area padding to prevent clipping by mobile system bar) */}
      <div className="relative z-20 w-full flex flex-col px-3 pb-[max(2.5rem,env(safe-area-inset-bottom,36px))] pt-1">
        {/* Hand Card Action Floating Toolbar */}
        {selectedHandCard && isMyTurn && (
          <div className="w-full max-w-sm mx-auto mb-1 p-2 rounded-lg bg-stone-900/95 border border-amber-500/80 shadow-xl flex items-center justify-between animate-slideUp">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-xs text-amber-300 truncate">
                {selectedDef?.name}
              </span>
              <span className="text-[10px] text-stone-400">
                ({selectedDef?.type === 'ATTACK' ? '攻撃' : selectedDef?.type === 'SPELL' ? '魔法' : '環境'})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {isSpellSelected && (
                <button
                  onClick={handleCastSpell}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow cursor-pointer active:scale-95"
                >
                  発動する
                </button>
              )}
              <button
                onClick={() => setInspectCard(selectedHandCard)}
                className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold"
              >
                詳細
              </button>
              <button
                onClick={clearSelection}
                className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* My Status & Decks Bar */}
        <div className="flex items-center justify-between gap-2 max-w-lg mx-auto w-full mb-1">
          {/* My Info */}
          <div className="flex items-center gap-2 p-1.5 rounded-lg bg-stone-900/80 border border-stone-800">
            <div className="w-8 h-8 rounded-full bg-amber-950 border border-amber-600 flex items-center justify-center text-sm font-bold shadow">
              {me.avatarIcon === 'rocket' ? '🚀' : me.avatarIcon === 'ghost' ? '👻' : '😎'}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-amber-200">{me.name} (あなた)</span>
              </div>
              {/* HP Bar */}
              <div className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                <div className="w-24 h-3 bg-stone-950 rounded-full border border-stone-700 overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, (me.hp / me.maxHp) * 100))}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-emerald-300 ml-0.5">{me.hp}</span>
              </div>
            </div>
          </div>

          {/* My Deck Stack (3D) & Graveyard */}
          <div className="flex items-center gap-3">
            <DeckStack3D
              cardCount={me.deckCount}
              canDraw={isMyTurn && !me.hasDrawnThisTurn}
              onDraw={() => onSendAction('DRAW_CARD')}
              label="山札"
            />
            <GraveyardPile
              cards={me.graveyard}
              label="墓地"
              onClick={() => setViewingGraveyard('me')}
            />
          </div>
        </div>

        {/* My Fanned Hand (ババ抜き風 扇状ファンアニメーション & アクティブ強調) */}
        <div className="w-full relative h-36 sm:h-40 flex items-end justify-center select-none overflow-visible pb-2 pt-6">
          {(!me.hand || me.hand.length === 0) ? (
            <div className="h-24 flex items-center justify-center text-xs text-stone-500 italic">
              手札がありません
            </div>
          ) : (
            <div className={`flex items-end justify-center px-4 max-w-full ${
              me.hand.length <= 3 ? '-space-x-2 sm:-space-x-1' :
              me.hand.length <= 5 ? '-space-x-5 sm:-space-x-4' :
              me.hand.length <= 7 ? '-space-x-7 sm:-space-x-5' :
              '-space-x-9 sm:-space-x-6'
            }`}>
              {me.hand.map((card, idx) => {
                const total = me.hand!.length;
                const isSelected = selectedHandCard?.instanceId === card.instanceId;
                const isHovered = hoveredHandCardId === card.instanceId;
                const centerIndex = (total - 1) / 2;
                const normalizedOffset = idx - centerIndex;

                // Fan angle (ババ抜き風扇状回転)
                const maxAngle = Math.min(28, total * 5.2);
                const angleStep = total > 1 ? (maxAngle * 2) / (total - 1) : 0;
                const baseRotDeg = normalizedOffset * angleStep;
                const rotDeg = isSelected ? 0 : isHovered ? baseRotDeg * 0.3 : baseRotDeg;

                // Arc translation (扇の円弧カーブ)
                const arcY = Math.abs(normalizedOffset) * Math.min(10, total * 1.8);
                // Active / Hover lift
                const translateY = isSelected ? -56 : isHovered ? -32 : arcY - 20;
                const scale = isSelected ? 1.16 : isHovered ? 1.08 : 1.0;
                const zIndex = isSelected ? 60 : isHovered ? 45 : 10 + idx;

                return (
                  <div
                    key={card.instanceId}
                    style={{
                      transform: `rotate(${rotDeg}deg) translateY(${translateY}px) scale(${scale})`,
                      transformOrigin: 'bottom center',
                      zIndex,
                      transition: 'transform 0.24s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.2s ease, filter 0.2s ease'
                    }}
                    className={`relative shrink-0 cursor-pointer origin-bottom ${
                      isSelected
                        ? 'filter drop-shadow-[0_0_20px_rgba(250,204,21,0.95)]'
                        : isHovered
                        ? 'filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]'
                        : 'shadow-[-4px_2px_10px_rgba(0,0,0,0.5)]'
                    }`}
                    onClick={() => handleSelectHandCard(card)}
                    onMouseEnter={() => setHoveredHandCardId(card.instanceId)}
                    onMouseLeave={() => setHoveredHandCardId(null)}
                    onTouchStart={() => setHoveredHandCardId(card.instanceId)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setInspectCard(card);
                    }}
                  >
                    {/* Active Card Emphasis Badge */}
                    {isSelected && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-xl flex items-center gap-1 animate-bounce whitespace-nowrap z-50 border border-yellow-100">
                        <Sparkles className="w-2.5 h-2.5" /> 選択中
                      </div>
                    )}

                    <CardView
                      card={card}
                      size="hand"
                      isSelected={isSelected}
                      canAct={isMyTurn}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Inspect Card Modal */}
      {inspectCard && (
        <CardDetailModal
          card={inspectCard}
          onClose={() => setInspectCard(null)}
        />
      )}

      {/* Graveyard Inspector Modal */}
      {viewingGraveyard && (
        <GraveyardModal
          cards={viewingGraveyard === 'me' ? me.graveyard : opponent.graveyard}
          ownerName={viewingGraveyard === 'me' ? me.name : opponent.name}
          onClose={() => setViewingGraveyard(null)}
          onInspectCard={setInspectCard}
        />
      )}

      {/* GAME OVER SCREEN MODAL */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border-2 border-amber-500 shadow-2xl p-6 text-center text-stone-100 flex flex-col items-center">
            {iWon ? (
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 mb-3 shadow-lg animate-bounce">
                <Trophy className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-stone-800 border-2 border-stone-700 flex items-center justify-center text-stone-400 mb-3 shadow-lg">
                <Skull className="w-8 h-8" />
              </div>
            )}

            <h2 className={`text-2xl font-black mb-1 tracking-wider ${
              iWon ? 'text-amber-300' : 'text-stone-400'
            }`}>
              {iWon ? 'VICTORY' : 'DEFEAT'}
            </h2>
            <p className="text-sm font-bold text-stone-300 mb-3">
              {iWon ? 'あなたの完全勝利！' : '敗北……次回リベンジだ！'}
            </p>

            {winReason && (
              <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700 text-xs text-stone-300 mb-5 leading-relaxed">
                {winReason}
              </div>
            )}

            <div className="w-full space-y-2">
              <button
                onClick={onLeaveRoom}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black text-sm shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                ロビーへ戻る
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
