import React, { useState, useEffect } from 'react';
import { SanitizedGameState } from '../../online/types';
import { CardInstance } from '../../cards/types';
import { getCardDefinition } from '../../cards/cardRegistry';
import { canEvolveCard } from '../../game/engine/gameEngine';
import { CardView } from '../cards/CardView';
import { GraveyardModal } from '../graveyard/GraveyardModal';
import { FieldSlot } from './FieldSlot';
import { CardDetailModal } from '../cards/CardDetailModal';
import { LogDrawer } from './LogDrawer';
import {
  Sword,
  Zap,
  Footprints,
  Trophy,
  Skull,
  Sparkles,
  AlertTriangle,
  Layers,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TabletopBoardProps {
  gameState: SanitizedGameState;
  onSendAction: (actionType: string, payload?: any) => void;
  onLeaveRoom: () => void;
}

export const TabletopBoard: React.FC<TabletopBoardProps> = ({
  gameState,
  onSendAction,
  onLeaveRoom,
}) => {
  const {
    me,
    opponent,
    isMyTurn,
    mustPromoteBench,
    phase,
    logs,
    winnerPlayerId,
    winReason,
    lastAnimation,
  } = gameState;

  const myBench = Array.isArray(me?.bench) ? me.bench : [null, null, null];
  const oppBench = Array.isArray(opponent?.bench) ? opponent.bench : [null, null, null];
  const myHand = Array.isArray(me?.hand) ? me.hand : [];
  const myTrash = Array.isArray(me?.trash) ? me.trash : [];
  const oppTrash = Array.isArray(opponent?.trash) ? opponent.trash : [];
  const safeLogs = Array.isArray(logs) ? logs : [];

  const [selectedHandCard, setSelectedHandCard] = useState<CardInstance | null>(null);
  const [hoveredHandCardId, setHoveredHandCardId] = useState<string | null>(null);
  const [isAttachingEnergy, setIsAttachingEnergy] = useState(false);
  const [isRetreating, setIsRetreating] = useState(false);
  const [inspectCard, setInspectCard] = useState<CardInstance | null>(null);
  const [viewingTrash, setViewingTrash] = useState<'me' | 'opp' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Animation states
  const [animBanner, setAnimBanner] = useState<string | null>(null);
  const [damagePopup, setDamagePopup] = useState<{
    targetCardId: string;
    damage: number;
  } | null>(null);
  const [attackingCardId, setAttackingCardId] = useState<string | null>(null);

  useEffect(() => {
    if (phase === 'GAME_OVER' && winnerPlayerId === me.playerId) {
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 },
      });
    }
  }, [phase, winnerPlayerId, me.playerId]);

  useEffect(() => {
    if (!lastAnimation) return;

    if (lastAnimation.type === 'ATTACK') {
      if (lastAnimation.sourceCardId) {
        setAttackingCardId(lastAnimation.sourceCardId);
      }
      if (lastAnimation.targetCardId && lastAnimation.damage) {
        setDamagePopup({
          targetCardId: lastAnimation.targetCardId,
          damage: lastAnimation.damage,
        });
      }
      setAnimBanner(
        `⚔️ ${lastAnimation.cardName || ''} の『${lastAnimation.attackName || 'アタック'}』！ ${
          lastAnimation.damage || 0
        } ダメージ！`
      );
      const t = setTimeout(() => {
        setAttackingCardId(null);
        setDamagePopup(null);
        setAnimBanner(null);
      }, 1400);
      return () => clearTimeout(t);
    }

    if (lastAnimation.type === 'KNOCKOUT') {
      setAnimBanner(
        `💥 「${lastAnimation.cardName || ''}」がきぜつ！ +${lastAnimation.pointsGained || 1} ポイント！`
      );
      const t = setTimeout(() => setAnimBanner(null), 1600);
      return () => clearTimeout(t);
    }

    if (lastAnimation.type === 'ATTACH_ENERGY') {
      setAnimBanner(`⚡ 「${lastAnimation.cardName || ''}」にエネルギー付与！`);
      const t = setTimeout(() => setAnimBanner(null), 1000);
      return () => clearTimeout(t);
    }

    if (lastAnimation.type === 'EVOLVE') {
      setAnimBanner(`🌟 進化！「${lastAnimation.cardName || ''}」が降臨！`);
      const t = setTimeout(() => setAnimBanner(null), 1500);
      return () => clearTimeout(t);
    }

    if (lastAnimation.type === 'SPELL') {
      setAnimBanner(`✨ 「${lastAnimation.cardName || ''}」を発動！`);
      const t = setTimeout(() => setAnimBanner(null), 1200);
      return () => clearTimeout(t);
    }
  }, [lastAnimation?.id]);

  const clearModes = () => {
    setSelectedHandCard(null);
    setIsAttachingEnergy(false);
    setIsRetreating(false);
    setActionError(null);
  };

  const getValidEvolutionTargetsForCard = (handCard: CardInstance | null): CardInstance[] => {
    if (!handCard) return [];
    const def = getCardDefinition(handCard.definitionId);
    if (!def || def.type !== 'ATTACK' || !def.evolution.evolvesFrom) return [];
    return [me.activeCard, ...myBench].filter(
      (fc): fc is CardInstance =>
        fc !== null && canEvolveCard(fc, handCard, gameState.turnNumber).ok
    );
  };

  const handleSelectHandCard = (card: CardInstance) => {
    if (!isMyTurn) {
      setInspectCard(card);
      return;
    }
    if (selectedHandCard?.instanceId === card.instanceId) {
      clearModes();
      return;
    }
    setSelectedHandCard(card);
    setIsAttachingEnergy(false);
    setIsRetreating(false);
    setActionError(null);
  };

  const handlePlaySelectedHandCard = (benchSlotIndex?: number, targetCardInstanceId?: string) => {
    if (!selectedHandCard || !isMyTurn) return;
    const def = getCardDefinition(selectedHandCard.definitionId);
    if (!def) return;

    if (def.type === 'ATTACK') {
      if (def.evolution.evolvesFrom !== null) {
        const targets = getValidEvolutionTargetsForCard(selectedHandCard);
        const baseDef = getCardDefinition(def.evolution.evolvesFrom);
        if (targets.length === 0) {
          setActionError(
            `進化元「${baseDef?.name || '基礎カード'}」（前のターン以前に出たカード）が場にいません。`
          );
          return;
        }
        onSendAction('EVOLVE_CARD', {
          cardInstanceId: selectedHandCard.instanceId,
          targetCardInstanceId: targetCardInstanceId || targets[0].instanceId,
        });
        clearModes();
        return;
      }

      if (!me.activeCard) {
        onSendAction('PLAY_CARD_TO_ACTIVE', {
          cardInstanceId: selectedHandCard.instanceId,
        });
      } else {
        onSendAction('PLAY_CARD_TO_BENCH', {
          cardInstanceId: selectedHandCard.instanceId,
          benchIndex: benchSlotIndex,
        });
      }
      clearModes();
      return;
    }

    if (def.type === 'SPELL') {
      if (me.hasUsedSpellThisTurn) {
        setActionError('魔法カードは1ターンに1枚まで使用できます。');
        return;
      }
      onSendAction('USE_SPELL_CARD', {
        cardInstanceId: selectedHandCard.instanceId,
      });
      clearModes();
      return;
    }
  };

  const handleMyActiveClick = () => {
    if (isMyTurn && isAttachingEnergy && me.activeCard) {
      onSendAction('ATTACH_ENERGY', {
        targetCardInstanceId: me.activeCard.instanceId,
      });
      clearModes();
      return;
    }

    if (isMyTurn && selectedHandCard) {
      const def = getCardDefinition(selectedHandCard.definitionId);
      if (def?.type === 'ATTACK') {
        if (def.evolution.evolvesFrom !== null && me.activeCard) {
          const evoCheck = canEvolveCard(me.activeCard, selectedHandCard, gameState.turnNumber);
          if (evoCheck.ok) {
            handlePlaySelectedHandCard(undefined, me.activeCard.instanceId);
            return;
          } else {
            setActionError(evoCheck.reason || 'このカードは進化できません。');
            return;
          }
        }
        if (def.evolution.evolvesFrom === null && !me.activeCard) {
          onSendAction('PLAY_CARD_TO_ACTIVE', {
            cardInstanceId: selectedHandCard.instanceId,
          });
          clearModes();
          return;
        }
      }
    }

    if (me.activeCard) {
      setInspectCard(me.activeCard);
    }
  };

  const handleMyBenchClick = (card: CardInstance | null, benchIdx: number) => {
    if (mustPromoteBench && card) {
      onSendAction('PROMOTE_BENCH_CARD', {
        benchIndex: benchIdx,
        cardInstanceId: card.instanceId,
      });
      clearModes();
      return;
    }

    if (!isMyTurn) {
      if (card) setInspectCard(card);
      return;
    }

    if (isAttachingEnergy && card) {
      onSendAction('ATTACH_ENERGY', {
        targetCardInstanceId: card.instanceId,
      });
      clearModes();
      return;
    }

    if (isRetreating && card) {
      onSendAction('RETREAT_ACTIVE', {
        benchIndex: benchIdx,
        targetCardInstanceId: card.instanceId,
      });
      clearModes();
      return;
    }

    if (selectedHandCard) {
      const def = getCardDefinition(selectedHandCard.definitionId);
      if (def?.type === 'ATTACK') {
        if (def.evolution.evolvesFrom !== null && card) {
          const evoCheck = canEvolveCard(card, selectedHandCard, gameState.turnNumber);
          if (evoCheck.ok) {
            handlePlaySelectedHandCard(benchIdx, card.instanceId);
            return;
          } else {
            setActionError(evoCheck.reason || 'このカードには進化できません。');
            return;
          }
        }
        if (def.evolution.evolvesFrom === null && card === null) {
          handlePlaySelectedHandCard(benchIdx);
          return;
        }
      }
    }

    if (card) {
      setInspectCard(card);
    }
  };

  const selectedDef = selectedHandCard ? getCardDefinition(selectedHandCard.definitionId) : null;
  const selectedIsEvolution =
    selectedDef?.type === 'ATTACK' && selectedDef.evolution.evolvesFrom !== null;
  const selectedEvoBaseDef =
    selectedIsEvolution && selectedDef?.evolution.evolvesFrom
      ? getCardDefinition(selectedDef.evolution.evolvesFrom)
      : null;
  const validEvoTargetsForSelected = getValidEvolutionTargetsForCard(selectedHandCard);
  const myActiveDef = me.activeCard ? getCardDefinition(me.activeCard.definitionId) : null;

  const canAttachEnergyNow =
    isMyTurn && !me.hasAttachedEnergyThisTurn && me.energyAvailable > 0;
  const canAttackNow =
    isMyTurn &&
    !!me.activeCard &&
    !!opponent.activeCard &&
    me.activeCard.attachedEnergy >= me.activeCard.energyCost;
  const hasBenchCards = myBench.some((b) => b !== null);
  const canRetreatNow =
    isMyTurn &&
    !me.hasRetreatedThisTurn &&
    !!me.activeCard &&
    hasBenchCards &&
    me.activeCard.attachedEnergy >= me.activeCard.retreatCost;

  const isGameOver = phase === 'GAME_OVER';
  const iWon = winnerPlayerId === me.playerId;

  const getActionGuideText = (): string => {
    if (mustPromoteBench) {
      return '⚠️ ベンチのカードをタップしてバトル場へ出してください！';
    }
    if (!isMyTurn) {
      return '相手のターン中…（カードタップで詳細確認）';
    }
    if (isAttachingEnergy) {
      return '⚡ エネルギーを付ける自分のカードをタップ！';
    }
    if (isRetreating) {
      return '🏃 バトル場と入れ替えるベンチカードをタップ！';
    }
    if (selectedHandCard && selectedDef) {
      if (selectedDef.type === 'ATTACK') {
        if (selectedIsEvolution) {
          return validEvoTargetsForSelected.length > 0
            ? `🌟 場の「${selectedEvoBaseDef?.name}」または「進化する」をタップ！`
            : `⚠️ 進化元「${selectedEvoBaseDef?.name}」が場にいないため直接出せません`;
        }
        return !me.activeCard
          ? 'バトル場をタップして配置'
          : '空きベンチ枠または「ベンチに出す」をタップ！';
      }
      return '「魔法を発動」ボタンをタップ！';
    }
    if (canAttachEnergyNow) {
      return '①⚡エネルギー付与 ➔ ②手札をベンチへ/進化 ➔ ③⚔️わざ攻撃！';
    }
    if (canAttackNow) {
      return `⚔️「${myActiveDef?.attackName}」で攻撃可能！`;
    }
    return '手札をベンチに出すか「ターン終了」をタップ';
  };

  // Shared Hand Renderer (Guarantees 100% full card visibility from top edge to bottom edge)
  const renderHandCards = (isLandscapeMode: boolean) => {
    if (myHand.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-[11px] text-slate-500 italic px-4">
          手札がありません
        </div>
      );
    }

    const total = myHand.length;
    const overlapClass = isLandscapeMode
      ? total <= 4
        ? 'space-x-1.5'
        : total <= 6
        ? '-space-x-2'
        : '-space-x-4'
      : total <= 4
      ? 'space-x-1'
      : total <= 6
      ? '-space-x-2.5 sm:-space-x-1.5'
      : '-space-x-5 sm:-space-x-3';

    return (
      <div className="w-full overflow-x-auto overflow-y-visible pokepoke-scroll flex items-center justify-center px-2 pt-2.5 pb-1">
        <div className={`flex items-center justify-center ${overlapClass}`}>
          {myHand.map((card, idx) => {
            if (!card) return null;
            const isSelected = selectedHandCard?.instanceId === card.instanceId;
            const isHovered = hoveredHandCardId === card.instanceId;
            const cardDef = getCardDefinition(card.definitionId);
            const isEvoCard =
              cardDef?.type === 'ATTACK' && cardDef.evolution.evolvesFrom !== null;
            const hasEvoTargetNow = isEvoCard
              ? getValidEvolutionTargetsForCard(card).length > 0
              : true;

            const centerIndex = (total - 1) / 2;
            const normalizedOffset = idx - centerIndex;

            const rotDeg = isLandscapeMode
              ? 0
              : isSelected
              ? 0
              : normalizedOffset * Math.min(2.5, 12 / Math.max(1, total));
            const translateY = isSelected ? -6 : isHovered ? -3 : 0;
            const zIndex = isSelected ? 40 : isHovered ? 30 : 10 + idx;

            return (
              <div
                key={card.instanceId}
                style={{
                  transform: `translateY(${translateY}px) rotate(${rotDeg}deg)`,
                  zIndex,
                  transition: 'transform 0.15s ease-out',
                }}
                className="relative shrink-0 cursor-pointer"
                onClick={() => handleSelectHandCard(card)}
                onMouseEnter={() => setHoveredHandCardId(card.instanceId)}
                onMouseLeave={() => setHoveredHandCardId(null)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setInspectCard(card);
                }}
              >
                <CardView
                  card={card}
                  size="hand"
                  isSelected={isSelected}
                  canAct={isMyTurn && hasEvoTargetNow}
                  isUnplayableEvolution={isEvoCard && !hasEvoTargetNow}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Floating Action Bar when a card in Hand is selected (Does not push layout down)
  const renderSelectedHandFloatingBar = () => {
    if (!selectedHandCard || !isMyTurn || !selectedDef) return null;
    const canPlaySelectedNow = selectedIsEvolution
      ? validEvoTargetsForSelected.length > 0
      : true;

    return (
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 w-[94%] max-w-md px-2.5 py-1.5 rounded-xl bg-slate-900/95 border-2 border-amber-400 shadow-2xl flex items-center justify-between gap-2 backdrop-blur-md animate-fadeIn">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`px-1.5 py-0.5 rounded text-[8px] font-black shrink-0 ${selectedDef.colorTheme.badgeBg} ${selectedDef.colorTheme.badgeText}`}
            >
              {selectedDef.colorTheme.tierLabel}
            </span>
            <span className="font-black text-xs text-white truncate">{selectedDef.name}</span>
          </div>
          {selectedIsEvolution && (
            <span
              className={`text-[9px] font-bold truncate ${
                canPlaySelectedNow ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {canPlaySelectedNow
                ? `進化元「${selectedEvoBaseDef?.name}」から進化可能！`
                : `※「${selectedEvoBaseDef?.name}」から進化できます（進化元が場にありません）`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            disabled={!canPlaySelectedNow}
            onClick={() => handlePlaySelectedHandCard()}
            className={`px-2.5 py-1 rounded-lg font-black text-[11px] shadow transition-all ${
              canPlaySelectedNow
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 cursor-pointer active:scale-95'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            {selectedDef.type === 'ATTACK'
              ? selectedIsEvolution
                ? canPlaySelectedNow
                  ? `「${selectedEvoBaseDef?.name}」を進化`
                  : '進化元なし'
                : !me.activeCard
                ? 'バトル場に出す'
                : 'ベンチに出す'
              : '魔法を発動'}
          </button>
          <button
            onClick={() => setInspectCard(selectedHandCard)}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-200 text-[10px] font-bold cursor-pointer"
          >
            詳細
          </button>
          <button
            onClick={clearModes}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-400 text-[10px] cursor-pointer"
          >
            取消
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="game-screen relative bg-slate-950 text-stone-100 select-none font-sans">
      {/* Arena Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, #1e293b 0%, #0f172a 65%, #020617 100%)',
        }}
      />

      {/* Floating Animation Banner */}
      {animBanner && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1 rounded-full bg-stone-950/95 border-2 border-amber-400 text-amber-200 font-black text-[11px] shadow-2xl animate-bounce whitespace-nowrap">
          {animBanner}
        </div>
      )}

      {/* ====================================================================
         1. PORTRAIT & DESKTOP LAYOUT (.layout-portrait)
         GameScreen -> OpponentArea -> BattleArea (flex-1 min-h-0) -> ControlArea -> HandArea (shrink-0)
         ==================================================================== */}
      <div className="layout-portrait relative z-10 max-w-lg mx-auto w-full px-2 py-1 justify-between">
        {/* A. OPPONENT AREA (shrink-0) */}
        <div className="shrink-0 flex flex-col gap-1">
          {/* Opponent Header Strip */}
          <div className="flex items-center justify-between gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1 shadow">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs shrink-0">
                {opponent.avatarIcon === 'rocket'
                  ? '🚀'
                  : opponent.avatarIcon === 'ghost'
                  ? '🤖'
                  : '😎'}
              </div>
              <span className="font-black text-xs text-stone-100 truncate">{opponent.name}</span>
              {/* Opponent 3-Point Orbs */}
              <div className="flex items-center gap-0.5 ml-1 shrink-0">
                {Array.from({ length: opponent.maxScore }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                      idx < opponent.score
                        ? 'bg-amber-400 border-yellow-200 shadow-xs shadow-amber-400'
                        : 'bg-slate-950 border-slate-700'
                    }`}
                  >
                    {idx < opponent.score && <Trophy className="w-2 h-2 text-stone-950" />}
                  </div>
                ))}
                <span className="text-[9px] font-black text-amber-300 ml-0.5">
                  {opponent.score}/{opponent.maxScore}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 text-[10px] font-bold">
              <div className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-stone-300">
                手札 <span className="text-sky-300 font-mono">{opponent.handCount}</span>
              </div>
              <div className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-stone-300">
                山札 <span className="text-amber-300 font-mono">{opponent.deckCount}</span>
              </div>
              <button
                onClick={() => setViewingTrash('opp')}
                className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-stone-300 flex items-center gap-0.5 cursor-pointer"
              >
                <Trash2 className="w-2.5 h-2.5 text-stone-400" />
                <span className="text-stone-400 font-mono">{oppTrash.length}</span>
              </button>
            </div>
          </div>

          {/* Opponent Bench (3 Slots) */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-[8px] font-bold text-slate-500">相手ベンチ</span>
            {oppBench.map((card, idx) => (
              <FieldSlot
                key={`opp_bench_p_${idx}`}
                card={card}
                slotIndex={idx}
                slotRole="BENCH"
                isFriendly={false}
                onClick={() => card && setInspectCard(card)}
                onInspectCard={setInspectCard}
              />
            ))}
          </div>
        </div>

        {/* B. BATTLE AREA (flex-1 min-h-0: Uses remaining vertical space) */}
        <div className="flex-1 min-h-0 flex flex-col justify-evenly items-center w-full py-0.5 overflow-hidden">
          {/* Opponent Active Spot */}
          <div className="flex items-center justify-center gap-2.5 w-full">
            <div className="flex flex-col items-end text-right min-w-[64px]">
              <span className="text-[8px] font-bold text-rose-400">相手バトル場</span>
              {opponent.activeCard ? (
                <>
                  <span className="text-[11px] font-black text-white truncate max-w-[92px]">
                    {getCardDefinition(opponent.activeCard.definitionId)?.name}
                  </span>
                  <span className="text-[9px] font-bold text-rose-300">
                    HP {opponent.activeCard.currentHp}/{opponent.activeCard.maxHp}
                  </span>
                </>
              ) : (
                <span className="text-[9px] text-slate-500">待機中</span>
              )}
            </div>

            <FieldSlot
              card={opponent.activeCard}
              slotRole="ACTIVE"
              isFriendly={false}
              isAttacker={attackingCardId === opponent.activeCard?.instanceId}
              damagePopup={
                damagePopup?.targetCardId === opponent.activeCard?.instanceId
                  ? damagePopup.damage
                  : null
              }
              onClick={() => opponent.activeCard && setInspectCard(opponent.activeCard)}
              onInspectCard={setInspectCard}
            />

            <div className="min-w-[64px] flex flex-col items-start">
              {opponent.activeCard && (
                <div className="px-2 py-0.5 rounded-lg bg-slate-900/90 border border-slate-700 text-[9px]">
                  <div className="text-stone-400 text-[7px]">わざ威力</div>
                  <div className="font-black text-amber-300 flex items-center gap-0.5">
                    <Sword className="w-2.5 h-2.5" /> {opponent.activeCard.currentAtk}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Status Bar */}
          <div className="w-full flex items-center justify-between gap-1.5 py-1 px-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-inner">
            <div className="px-2 py-0.5 rounded-lg bg-slate-950 border border-amber-500/40 text-[9px] font-black text-amber-400 shrink-0">
              VS
            </div>

            <div className="flex flex-col items-center justify-center flex-1 min-w-0 px-1">
              <div
                className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider shadow flex items-center gap-1 ${
                  mustPromoteBench
                    ? 'bg-rose-600 text-white animate-bounce'
                    : isMyTurn
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>
                  {mustPromoteBench
                    ? '控えを選択！'
                    : isMyTurn
                    ? `あなたのターン (T${gameState.turnNumber})`
                    : `相手のターン (T${gameState.turnNumber})`}
                </span>
              </div>

              <div className="mt-0.5 text-[9px] text-amber-200 font-bold text-center truncate w-full">
                {getActionGuideText()}
              </div>

              {actionError && (
                <div className="mt-0.5 text-[8px] bg-red-950 border border-red-500 text-red-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{actionError}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-0.5 items-end shrink-0">
              <button
                disabled={!isMyTurn}
                onClick={() => {
                  clearModes();
                  onSendAction('END_TURN');
                }}
                className={`px-2.5 py-1 rounded-lg font-black text-[10px] shadow transition-all ${
                  isMyTurn
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:brightness-110 active:scale-95 cursor-pointer ring-1 ring-sky-300'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                ターン終了
              </button>
              <button
                onClick={() => onSendAction('SURRENDER')}
                className="text-[8px] text-slate-500 hover:text-rose-400 px-1 cursor-pointer"
              >
                降参
              </button>
            </div>
          </div>

          {/* My Active Spot + Energy Zone & Attack/Retreat Controls */}
          <div className="flex items-center justify-center gap-2 w-full">
            {/* Energy Zone Button */}
            <div className="w-22 sm:w-26 shrink-0">
              <button
                disabled={!canAttachEnergyNow}
                onClick={() => {
                  setSelectedHandCard(null);
                  setIsRetreating(false);
                  setIsAttachingEnergy(!isAttachingEnergy);
                }}
                className={`w-full p-1.5 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all ${
                  isAttachingEnergy
                    ? 'bg-yellow-400 text-stone-950 border-white ring-2 ring-yellow-300 scale-105 shadow-lg cursor-pointer'
                    : canAttachEnergyNow
                    ? 'bg-gradient-to-b from-amber-500/30 to-yellow-600/30 border-yellow-400 text-yellow-200 animate-pulse cursor-pointer shadow'
                    : 'bg-slate-900/70 border-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-0.5 font-black text-[10px]">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>エネルギー</span>
                </div>
                <span className="text-[8px] font-bold">
                  {canAttachEnergyNow
                    ? isAttachingEnergy
                      ? '付与先タップ'
                      : '残り 1個'
                    : '付与済(0)'}
                </span>
              </button>
            </div>

            {/* My Active Card */}
            <FieldSlot
              card={me.activeCard}
              slotRole="ACTIVE"
              isFriendly={true}
              canAct={canAttackNow}
              isAttacker={attackingCardId === me.activeCard?.instanceId}
              isTargetable={
                (isAttachingEnergy && !!me.activeCard) ||
                (selectedIsEvolution &&
                  !!me.activeCard &&
                  canEvolveCard(me.activeCard, selectedHandCard, gameState.turnNumber).ok)
              }
              targetBadgeText={
                isAttachingEnergy
                  ? '⚡エネ付与'
                  : selectedIsEvolution &&
                    !!me.activeCard &&
                    canEvolveCard(me.activeCard, selectedHandCard, gameState.turnNumber).ok
                  ? '🌟進化可能'
                  : undefined
              }
              canPlaceCard={
                !me.activeCard &&
                selectedDef?.type === 'ATTACK' &&
                !selectedIsEvolution &&
                isMyTurn
              }
              damagePopup={
                damagePopup?.targetCardId === me.activeCard?.instanceId
                  ? damagePopup.damage
                  : null
              }
              onClick={handleMyActiveClick}
              onInspectCard={setInspectCard}
            />

            {/* Attack & Retreat Buttons */}
            <div className="flex flex-col gap-1 w-24 sm:w-28 shrink-0">
              <button
                disabled={!canAttackNow}
                onClick={() => {
                  clearModes();
                  onSendAction('ATTACK');
                }}
                className={`w-full py-1.5 px-2 rounded-xl border-2 font-black text-left transition-all flex flex-col justify-center ${
                  canAttackNow
                    ? 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 border-yellow-300 text-white shadow-md cursor-pointer active:scale-95'
                    : 'bg-slate-900/80 border-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between text-[9px]">
                  <span className="flex items-center gap-0.5">
                    <Sword className="w-2.5 h-2.5" /> 攻撃
                  </span>
                  {me.activeCard && (
                    <span className="font-black text-yellow-300">
                      {me.activeCard.currentAtk}
                    </span>
                  )}
                </div>
                <div className="text-[8px] truncate font-bold opacity-90">
                  {myActiveDef
                    ? canAttackNow
                      ? `${myActiveDef.attackName}`
                      : `⚡${me.activeCard?.attachedEnergy}/${me.activeCard?.energyCost}`
                    : 'なし'}
                </div>
              </button>

              <button
                disabled={!canRetreatNow}
                onClick={() => {
                  setSelectedHandCard(null);
                  setIsAttachingEnergy(false);
                  setIsRetreating(!isRetreating);
                }}
                className={`w-full py-1 px-1.5 rounded-lg border font-bold text-[9px] flex items-center justify-center gap-0.5 transition-all ${
                  isRetreating
                    ? 'bg-sky-400 text-stone-950 border-white font-black cursor-pointer'
                    : canRetreatNow
                    ? 'bg-slate-800 hover:bg-slate-700 border-sky-400/70 text-sky-200 cursor-pointer'
                    : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Footprints className="w-2.5 h-2.5" />
                <span>にげる{me.activeCard ? `(⚡${me.activeCard.retreatCost})` : ''}</span>
              </button>
            </div>
          </div>
        </div>

        {/* C. PLAYER BENCH & STATUS AREA (shrink-0) */}
        <div className="shrink-0 flex flex-col gap-1">
          {/* My Bench (3 Slots) */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-[8px] font-bold text-slate-400">自分ベンチ</span>
            {myBench.map((card, idx) => {
              const isAttachTarget = isAttachingEnergy && !!card;
              const isRetreatTarget = isRetreating && !!card;
              const isPromoteTarget = mustPromoteBench && !!card;
              const isEvoTarget =
                selectedIsEvolution &&
                !!card &&
                canEvolveCard(card, selectedHandCard, gameState.turnNumber).ok;
              const canPlaceOnBench =
                isMyTurn &&
                selectedDef?.type === 'ATTACK' &&
                !selectedIsEvolution &&
                card === null;

              return (
                <FieldSlot
                  key={`my_bench_p_${idx}`}
                  card={card}
                  slotIndex={idx}
                  slotRole="BENCH"
                  isFriendly={true}
                  isTargetable={isAttachTarget || isRetreatTarget || isPromoteTarget || isEvoTarget}
                  targetBadgeText={
                    isPromoteTarget
                      ? 'バトル場へ'
                      : isAttachTarget
                      ? '⚡エネ付与'
                      : isRetreatTarget
                      ? '交代'
                      : isEvoTarget
                      ? '🌟進化可能'
                      : undefined
                  }
                  canPlaceCard={canPlaceOnBench}
                  onClick={() => handleMyBenchClick(card, idx)}
                  onInspectCard={setInspectCard}
                />
              );
            })}
          </div>

          {/* Player Info + Points + Deck/Trash + Log */}
          <div className="flex items-center justify-between gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-black text-[11px] text-amber-200 truncate">{me.name}</span>
              <div className="flex items-center gap-0.5 shrink-0">
                <span className="text-[8px] text-stone-400 font-bold">獲得Pt:</span>
                {Array.from({ length: me.maxScore }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                      idx < me.score
                        ? 'bg-emerald-400 border-white shadow-xs shadow-emerald-400'
                        : 'bg-slate-950 border-slate-700'
                    }`}
                  >
                    {idx < me.score && <Trophy className="w-2 h-2 text-stone-950" />}
                  </div>
                ))}
                <span className="text-[9px] font-black text-emerald-300 ml-0.5">
                  {me.score}/{me.maxScore}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 text-[9px] font-bold">
              <div className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-stone-300 flex items-center gap-0.5">
                <Layers className="w-2.5 h-2.5 text-amber-400" />
                <span>山札</span>
                <span className="text-amber-300 font-mono">{me.deckCount}</span>
              </div>
              <button
                onClick={() => setViewingTrash('me')}
                className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-stone-300 flex items-center gap-0.5 cursor-pointer"
              >
                <Trash2 className="w-2.5 h-2.5 text-stone-400" />
                <span>トラッシュ</span>
                <span className="text-stone-400 font-mono">{myTrash.length}</span>
              </button>
            </div>
          </div>

          <LogDrawer logs={safeLogs} myPlayerId={me.playerId} />
        </div>

        {/* D. HAND AREA (shrink-0: Reserved space at bottom so hand is NEVER clipped) */}
        <div className="relative shrink-0 w-full bg-slate-900/50 border border-slate-800/80 rounded-xl mt-0.5">
          {renderSelectedHandFloatingBar()}
          {renderHandCards(false)}
        </div>
      </div>

      {/* ====================================================================
         2. LANDSCAPE LAYOUT (.layout-landscape)
         Dedicated wide horizontal layout for mobile landscape viewports
         ==================================================================== */}
      <div className="layout-landscape relative z-10 w-full h-full px-2 py-1 gap-1">
        {/* ROW 1: COMPACT TOP HEADER BAR */}
        <div className="flex items-center justify-between gap-2 bg-slate-900/95 border border-slate-800 rounded-xl px-2.5 py-1">
          {/* Opponent Info & Points */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-black text-xs text-stone-100">{opponent.name}</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: opponent.maxScore }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                    idx < opponent.score
                      ? 'bg-amber-400 border-yellow-200'
                      : 'bg-slate-950 border-slate-700'
                  }`}
                >
                  {idx < opponent.score && <Trophy className="w-2 h-2 text-stone-950" />}
                </div>
              ))}
              <span className="text-[9px] font-black text-amber-300 ml-0.5">
                {opponent.score}/{opponent.maxScore}
              </span>
            </div>
            <span className="text-[9px] text-slate-400">
              手札:{opponent.handCount} 山札:{opponent.deckCount}
            </span>
            <button
              onClick={() => setViewingTrash('opp')}
              className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-[9px] text-stone-300 cursor-pointer"
            >
              相手トラッシュ({oppTrash.length})
            </button>
          </div>

          {/* Center Turn & Action Guide */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                mustPromoteBench
                  ? 'bg-rose-600 text-white animate-bounce'
                  : isMyTurn
                  ? 'bg-amber-400 text-stone-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {mustPromoteBench
                ? '控え選択'
                : isMyTurn
                ? `あなた (T${gameState.turnNumber})`
                : `相手 (T${gameState.turnNumber})`}
            </span>
            <span className="text-[9px] text-amber-200 font-bold truncate">
              {actionError || getActionGuideText()}
            </span>
          </div>

          {/* Right: Turn End & Surrender */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              disabled={!isMyTurn}
              onClick={() => {
                clearModes();
                onSendAction('END_TURN');
              }}
              className={`px-2.5 py-1 rounded-lg font-black text-[10px] ${
                isMyTurn
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              ターン終了
            </button>
            <button
              onClick={() => onSendAction('SURRENDER')}
              className="text-[9px] text-slate-500 hover:text-rose-400 px-1 cursor-pointer"
            >
              降参
            </button>
          </div>
        </div>

        {/* ROW 2: HORIZONTAL BATTLE ARENA (minmax(0, 1fr)) */}
        <div className="min-h-0 flex items-center justify-between gap-2 px-2 py-0.5 rounded-xl bg-slate-900/40 border border-slate-800/60 overflow-hidden">
          {/* Left: Opponent Bench (3 Slots) */}
          <div className="flex items-center gap-1.5">
            <div className="text-[8px] font-bold text-slate-500 [writing-mode:vertical-rl]">
              相手ベンチ
            </div>
            {oppBench.map((card, idx) => (
              <FieldSlot
                key={`opp_bench_l_${idx}`}
                card={card}
                slotIndex={idx}
                slotRole="BENCH"
                isFriendly={false}
                onClick={() => card && setInspectCard(card)}
                onInspectCard={setInspectCard}
              />
            ))}
          </div>

          {/* Center-Left: Opponent Active Spot */}
          <div className="flex items-center gap-2">
            <FieldSlot
              card={opponent.activeCard}
              slotRole="ACTIVE"
              isFriendly={false}
              isAttacker={attackingCardId === opponent.activeCard?.instanceId}
              damagePopup={
                damagePopup?.targetCardId === opponent.activeCard?.instanceId
                  ? damagePopup.damage
                  : null
              }
              onClick={() => opponent.activeCard && setInspectCard(opponent.activeCard)}
              onInspectCard={setInspectCard}
            />
          </div>

          {/* Center: VS Badge */}
          <div className="flex flex-col items-center justify-center gap-1 shrink-0">
            <div className="px-2 py-1 rounded-lg bg-slate-950 border border-amber-500/40 text-[10px] font-black text-amber-400 shadow">
              VS
            </div>
          </div>

          {/* Center-Right: My Active Spot */}
          <div className="flex items-center gap-2">
            <FieldSlot
              card={me.activeCard}
              slotRole="ACTIVE"
              isFriendly={true}
              canAct={canAttackNow}
              isAttacker={attackingCardId === me.activeCard?.instanceId}
              isTargetable={
                (isAttachingEnergy && !!me.activeCard) ||
                (selectedIsEvolution &&
                  !!me.activeCard &&
                  canEvolveCard(me.activeCard, selectedHandCard, gameState.turnNumber).ok)
              }
              targetBadgeText={
                isAttachingEnergy
                  ? '⚡エネ付与'
                  : selectedIsEvolution &&
                    !!me.activeCard &&
                    canEvolveCard(me.activeCard, selectedHandCard, gameState.turnNumber).ok
                  ? '🌟進化可能'
                  : undefined
              }
              canPlaceCard={
                !me.activeCard &&
                selectedDef?.type === 'ATTACK' &&
                !selectedIsEvolution &&
                isMyTurn
              }
              damagePopup={
                damagePopup?.targetCardId === me.activeCard?.instanceId
                  ? damagePopup.damage
                  : null
              }
              onClick={handleMyActiveClick}
              onInspectCard={setInspectCard}
            />
          </div>

          {/* Right: My Bench (3 Slots) */}
          <div className="flex items-center gap-1.5">
            {myBench.map((card, idx) => {
              const isAttachTarget = isAttachingEnergy && !!card;
              const isRetreatTarget = isRetreating && !!card;
              const isPromoteTarget = mustPromoteBench && !!card;
              const isEvoTarget =
                selectedIsEvolution &&
                !!card &&
                canEvolveCard(card, selectedHandCard, gameState.turnNumber).ok;
              const canPlaceOnBench =
                isMyTurn &&
                selectedDef?.type === 'ATTACK' &&
                !selectedIsEvolution &&
                card === null;

              return (
                <FieldSlot
                  key={`my_bench_l_${idx}`}
                  card={card}
                  slotIndex={idx}
                  slotRole="BENCH"
                  isFriendly={true}
                  isTargetable={isAttachTarget || isRetreatTarget || isPromoteTarget || isEvoTarget}
                  targetBadgeText={
                    isPromoteTarget
                      ? 'バトル場へ'
                      : isAttachTarget
                      ? '⚡エネ付与'
                      : isRetreatTarget
                      ? '交代'
                      : isEvoTarget
                      ? '🌟進化可能'
                      : undefined
                  }
                  canPlaceCard={canPlaceOnBench}
                  onClick={() => handleMyBenchClick(card, idx)}
                  onInspectCard={setInspectCard}
                />
              );
            })}
            <div className="text-[8px] font-bold text-slate-400 [writing-mode:vertical-rl]">
              自分ベンチ
            </div>
          </div>
        </div>

        {/* ROW 3: BOTTOM CONTROL & HAND AREA (Side-by-Side for Full Hand Visibility) */}
        <div className="relative flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1">
          {renderSelectedHandFloatingBar()}

          {/* Left Controls: Player Points + Energy + Attack + Retreat */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex flex-col gap-0.5 pr-1 border-r border-slate-800">
              <div className="flex items-center gap-1">
                <span className="font-black text-[10px] text-amber-200">{me.name}</span>
                <span className="text-[9px] font-black text-emerald-300">
                  {me.score}/{me.maxScore}pt
                </span>
              </div>
              <div className="flex items-center gap-1 text-[8px] text-slate-400">
                <span>山札:{me.deckCount}</span>
                <button
                  onClick={() => setViewingTrash('me')}
                  className="underline hover:text-white cursor-pointer"
                >
                  トラッシュ:{myTrash.length}
                </button>
              </div>
            </div>

            {/* Energy Button */}
            <button
              disabled={!canAttachEnergyNow}
              onClick={() => {
                setSelectedHandCard(null);
                setIsRetreating(false);
                setIsAttachingEnergy(!isAttachingEnergy);
              }}
              className={`px-2 py-1.5 rounded-lg border font-black text-[10px] flex flex-col items-center justify-center ${
                isAttachingEnergy
                  ? 'bg-yellow-400 text-stone-950 border-white cursor-pointer'
                  : canAttachEnergyNow
                  ? 'bg-amber-500/30 border-yellow-400 text-yellow-200 animate-pulse cursor-pointer'
                  : 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center gap-0.5">
                <Zap className="w-3 h-3 fill-current" /> エネ付与
              </span>
              <span className="text-[8px]">{canAttachEnergyNow ? '残り1' : '済'}</span>
            </button>

            {/* Attack Button */}
            <button
              disabled={!canAttackNow}
              onClick={() => {
                clearModes();
                onSendAction('ATTACK');
              }}
              className={`px-2.5 py-1.5 rounded-lg border font-black text-[10px] flex flex-col items-center justify-center ${
                canAttackNow
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 border-yellow-300 text-white cursor-pointer'
                  : 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center gap-0.5">
                <Sword className="w-3 h-3" /> わざ攻撃
              </span>
              <span className="text-[8px]">
                {me.activeCard ? `${me.activeCard.currentAtk} dmg` : '-'}
              </span>
            </button>

            {/* Retreat Button */}
            <button
              disabled={!canRetreatNow}
              onClick={() => {
                setSelectedHandCard(null);
                setIsAttachingEnergy(false);
                setIsRetreating(!isRetreating);
              }}
              className={`px-2 py-1.5 rounded-lg border font-bold text-[9px] flex flex-col items-center justify-center ${
                isRetreating
                  ? 'bg-sky-400 text-stone-950 border-white cursor-pointer'
                  : canRetreatNow
                  ? 'bg-slate-800 border-sky-400/70 text-sky-200 cursor-pointer'
                  : 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center gap-0.5">
                <Footprints className="w-2.5 h-2.5" /> にげる
              </span>
              <span className="text-[8px]">
                ⚡{me.activeCard ? me.activeCard.retreatCost : 0}
              </span>
            </button>
          </div>

          {/* Right Hand Area: Horizontal Full-Visibility Hand */}
          <div className="flex-1 min-w-0 flex items-center justify-center">
            {renderHandCards(true)}
          </div>
        </div>
      </div>

      {/* Inspect Card Modal */}
      {inspectCard && (
        <CardDetailModal card={inspectCard} onClose={() => setInspectCard(null)} />
      )}

      {/* Trash Modal */}
      {viewingTrash && (
        <GraveyardModal
          cards={viewingTrash === 'me' ? myTrash : oppTrash}
          ownerName={viewingTrash === 'me' ? me.name : opponent.name}
          onClose={() => setViewingTrash(null)}
          onInspectCard={setInspectCard}
        />
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400 shadow-2xl p-6 text-center text-stone-100 flex flex-col items-center">
            {iWon ? (
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 mb-3 shadow-lg animate-bounce">
                <Trophy className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 mb-3 shadow-lg">
                <Skull className="w-8 h-8" />
              </div>
            )}

            <h2
              className={`text-2xl font-black mb-1 tracking-wider ${
                iWon ? 'text-amber-300' : 'text-slate-400'
              }`}
            >
              {iWon ? 'VICTORY!' : 'DEFEAT...'}
            </h2>
            <p className="text-sm font-bold text-stone-200 mb-2">
              {iWon ? 'あなたの勝利です！' : '敗北……次は勝とう！'}
            </p>

            <div className="flex items-center justify-center gap-4 my-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-black">
              <span className="text-emerald-300">
                {me.name}: {me.score} pt
              </span>
              <span className="text-slate-500">VS</span>
              <span className="text-amber-300">
                {opponent.name}: {opponent.score} pt
              </span>
            </div>

            {winReason && (
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-stone-300 mb-5 leading-relaxed">
                {winReason}
              </div>
            )}

            <button
              onClick={onLeaveRoom}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-stone-950 font-black text-sm shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              ロビーへ戻る
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
