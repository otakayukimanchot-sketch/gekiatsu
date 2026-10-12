import React, { useState, useEffect } from 'react';
import { SanitizedGameState } from '../../online/types';
import { CardInstance } from '../../cards/types';
import { getCardDefinition } from '../../cards/cardRegistry';
import { canEvolveCard } from '../../game/engine/gameEngine';
import { CardView } from '../cards/CardView';
import { GraveyardModal } from '../graveyard/GraveyardModal';
import { FieldSlot } from './FieldSlot';
import { CardDetailModal } from '../cards/CardDetailModal';
import { EmoteControl, EmoteSpeechBubble } from './EmoteSystem';
import { MatchResultOverlay } from './MatchResultOverlay';
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
  Eye,
  Info,
  WifiOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TabletopBoardProps {
  gameState: SanitizedGameState;
  onSendAction: (actionType: string, payload?: any) => void;
  onSendEmote?: (emoteId: string) => void;
  activeEmotes?: Record<string, { emoji: string; eventId: string }>;
  emoteCooldownUntil?: number;
  onLeaveRoom: () => void;
  onPlayAgain?: () => void;
}

/**
 * 必須ルール: 両方のオブジェクトおよびIDが存在することを確認してから比較するヘルパー
 * undefined === undefined が true になる事故を完全に防止する
 */
function isCardMatchingId(
  card: CardInstance | null | undefined,
  targetId: string | null | undefined
): boolean {
  return (
    card != null &&
    targetId != null &&
    card.instanceId != null &&
    card.instanceId === targetId
  );
}

function getSafeCardDamagePopup(
  damagePopup: { targetCardId: string; damage: number } | null | undefined,
  card: CardInstance | null | undefined
): number | null {
  if (
    damagePopup != null &&
    card != null &&
    damagePopup.targetCardId != null &&
    card.instanceId != null &&
    damagePopup.targetCardId === card.instanceId
  ) {
    return damagePopup.damage;
  }
  return null;
}

export const TabletopBoard: React.FC<TabletopBoardProps> = ({
  gameState,
  onSendAction,
  onSendEmote,
  activeEmotes = {},
  emoteCooldownUntil = 0,
  onLeaveRoom,
  onPlayAgain,
}) => {
  const {
    me,
    opponent,
    isMyTurn,
    mustPromoteBench,
    phase,
    winScore: gameWinScore,
    winnerPlayerId,
    winReason,
    lastAnimation,
    isSpectator,
    spectatorCount,
  } = gameState;

  const winScore = gameWinScore || me?.maxScore || 3;
  const myBench = Array.isArray(me?.bench) ? me.bench : [null, null, null];
  const oppBench = Array.isArray(opponent?.bench) ? opponent.bench : [null, null, null];
  const myHand = Array.isArray(me?.hand) ? me.hand : [];
  const myTrash = Array.isArray(me?.trash) ? me.trash : [];
  const oppTrash = Array.isArray(opponent?.trash) ? opponent.trash : [];

  const [selectedHandCard, setSelectedHandCard] = useState<CardInstance | null>(null);
  const [hoveredHandCardId, setHoveredHandCardId] = useState<string | null>(null);
  const [isAttachingEnergy, setIsAttachingEnergy] = useState(false);
  const [isRetreating, setIsRetreating] = useState(false);
  const [inspectCard, setInspectCard] = useState<CardInstance | null>(null);
  const [viewingTrash, setViewingTrash] = useState<'me' | 'opp' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmSurrender, setConfirmSurrender] = useState(false);
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState(0);
  const [disconnectSecondsLeft, setDisconnectSecondsLeft] = useState<number>(60);
  const [handReturnPicker, setHandReturnPicker] = useState<{
    spellCard: CardInstance;
    selectedIds: string[];
  } | null>(null);

  useEffect(() => {
    if (opponent && !opponent.isConnected && phase !== 'GAME_OVER') {
      const startTs = opponent.disconnectedAt || Date.now();
      const updateTimer = () => {
        const elapsed = Date.now() - startTs;
        const remSec = Math.max(0, Math.ceil((60_000 - elapsed) / 1000));
        setDisconnectSecondsLeft(remSec);
      };
      updateTimer();
      const id = window.setInterval(updateTimer, 500);
      return () => window.clearInterval(id);
    } else {
      setDisconnectSecondsLeft(60);
    }
  }, [opponent?.isConnected, opponent?.disconnectedAt, phase]);

  useEffect(() => {
    const updateCooldown = () => {
      const rem = Math.max(0, emoteCooldownUntil - Date.now());
      setCooldownRemainingMs(rem);
    };
    updateCooldown();
    if (emoteCooldownUntil > Date.now()) {
      const interval = window.setInterval(updateCooldown, 100);
      return () => window.clearInterval(interval);
    }
  }, [emoteCooldownUntil]);

  const myActiveEmote = me?.playerId ? activeEmotes[me.playerId] : undefined;
  const oppActiveEmote = opponent?.playerId ? activeEmotes[opponent.playerId] : undefined;

  // Animation states
  const [animBanner, setAnimBanner] = useState<string | null>(null);
  const [vfxOverlay, setVfxOverlay] = useState<{
    kind: 'SKILL' | 'SPELL' | 'EVOLVE' | 'KNOCKOUT';
    title: string;
    subtitle?: string;
  } | null>(null);
  const [vanishingGhost, setVanishingGhost] = useState<{
    cardName: string;
    points: number;
  } | null>(null);
  const [damagePopup, setDamagePopup] = useState<{
    targetCardId: string;
    damage: number;
  } | null>(null);
  const [attackingCardId, setAttackingCardId] = useState<string | null>(null);
  const [scorePopup, setScorePopup] = useState<{
    pointsGained: number;
    scorerName: string;
    isMe: boolean;
    knockedCardName?: string;
    currentScore: number;
    maxScore: number;
  } | null>(null);

  const processedAnimIdsRef = React.useRef<Set<string>>(new Set());
  const animTimerRef = React.useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animTimerRef.current) {
        window.clearTimeout(animTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      phase === 'GAME_OVER' &&
      winnerPlayerId != null &&
      me?.playerId != null &&
      winnerPlayerId === me.playerId
    ) {
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 },
      });
    }
  }, [phase, winnerPlayerId, me?.playerId]);

  useEffect(() => {
    if (!lastAnimation || !lastAnimation.id) return;
    if (processedAnimIdsRef.current.has(lastAnimation.id)) return;
    processedAnimIdsRef.current.add(lastAnimation.id);

    const scheduleClearAllAnims = (durationMs: number) => {
      if (animTimerRef.current) {
        window.clearTimeout(animTimerRef.current);
      }
      animTimerRef.current = window.setTimeout(() => {
        setAttackingCardId(null);
        setDamagePopup(null);
        setAnimBanner(null);
        setVfxOverlay(null);
        setScorePopup(null);
        setVanishingGhost(null);
        animTimerRef.current = null;
      }, durationMs);
    };

    if (lastAnimation.type === 'ATTACK') {
      if (lastAnimation.sourceCardId != null) {
        setAttackingCardId(lastAnimation.sourceCardId);
      }
      if (lastAnimation.targetCardId != null && lastAnimation.damage != null) {
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
      setVfxOverlay({
        kind: 'SKILL',
        title: `⚔️ ${lastAnimation.attackName || 'SKILL ATTACK'}`,
        subtitle: `${lastAnimation.cardName || ''} ➔ -${lastAnimation.damage || 0} DMG`,
      });
      scheduleClearAllAnims(1200);
      return;
    }

    if (lastAnimation.type === 'KNOCKOUT') {
      const pts = lastAnimation.pointsGained || 1;
      const isMeScorer =
        lastAnimation.actorPlayerId != null &&
        me?.playerId != null &&
        lastAnimation.actorPlayerId === me.playerId;
      const scorer = isMeScorer ? me : opponent;

      setVfxOverlay(null);
      setAnimBanner(
        `💥 「${lastAnimation.cardName || ''}」がきぜつ！ +${pts} POINT GET!`
      );
      setVanishingGhost({
        cardName: lastAnimation.cardName || 'カード',
        points: pts,
      });
      setScorePopup({
        pointsGained: pts,
        scorerName: scorer?.name || (isMeScorer ? 'YOU' : 'OPPONENT'),
        isMe: isMeScorer,
        knockedCardName: lastAnimation.cardName,
        currentScore: scorer?.score ?? pts,
        maxScore: winScore,
      });

      if (isMeScorer) {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.45 },
        });
      }

      scheduleClearAllAnims(1900);
      return;
    }

    if (lastAnimation.type === 'PROMOTE') {
      setVfxOverlay(null);
      setAnimBanner(`🚀 ベンチから「${lastAnimation.cardName || ''}」がバトル場へ登場！`);
      scheduleClearAllAnims(1100);
      return;
    }

    if (lastAnimation.type === 'ATTACH_ENERGY') {
      setVfxOverlay(null);
      setAnimBanner(`⚡ 「${lastAnimation.cardName || ''}」にエネルギー付与！`);
      scheduleClearAllAnims(950);
      return;
    }

    if (lastAnimation.type === 'EVOLVE') {
      setAnimBanner(`🌟 進化！「${lastAnimation.cardName || ''}」が降臨！`);
      setVfxOverlay({
        kind: 'EVOLVE',
        title: `🌟 EVOLUTION!`,
        subtitle: `${lastAnimation.cardName || ''} が覚醒降臨！`,
      });
      scheduleClearAllAnims(1250);
      return;
    }

    if (lastAnimation.type === 'SPELL') {
      setAnimBanner(`✨ 「${lastAnimation.cardName || ''}」を発動！`);
      setVfxOverlay({
        kind: 'SPELL',
        title: `✨ MAGIC CAST : ${lastAnimation.cardName || '魔法'}`,
        subtitle: lastAnimation.attackName || '',
      });
      scheduleClearAllAnims(1150);
      return;
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
    if (card == null || card.instanceId == null) return;
    if (phase === 'GAME_OVER' || isSpectator) {
      setInspectCard(card);
      return;
    }
    if (!isMyTurn) {
      setInspectCard(card);
      return;
    }
    // Second tap on an already-selected hand card opens the detailed card modal
    if (isCardMatchingId(selectedHandCard, card.instanceId)) {
      setInspectCard(card);
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
      if (
        def.abilities.spellEffect === 'TRADE_TICKET' &&
        me.hasUsedTradeTicketThisMatch
      ) {
        setActionError('「トレードチケット」は1回の対戦中に1度しか使用できません。');
        return;
      }
      const otherHandCards = myHand.filter((c) => c.instanceId !== selectedHandCard.instanceId);
      if (
        (def.abilities.spellEffect === 'TRADE_TICKET' ||
          def.abilities.spellEffect === 'HAND_SORT') &&
        otherHandCards.length > 0
      ) {
        setHandReturnPicker({
          spellCard: selectedHandCard,
          selectedIds: [],
        });
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
    !mustPromoteBench &&
    phase === 'MAIN' &&
    isMyTurn &&
    !me.hasAttachedEnergyThisTurn &&
    me.energyAvailable > 0;
  const canAttackNow =
    !mustPromoteBench &&
    phase === 'MAIN' &&
    isMyTurn &&
    me.activeCard != null &&
    opponent.activeCard != null &&
    me.activeCard.attachedEnergy >= me.activeCard.energyCost;
  const hasBenchCards = myBench.some((b) => b !== null);
  const canRetreatNow =
    !mustPromoteBench &&
    phase === 'MAIN' &&
    isMyTurn &&
    !me.hasRetreatedThisTurn &&
    me.activeCard != null &&
    hasBenchCards &&
    me.activeCard.attachedEnergy >= me.activeCard.retreatCost;

  const isGameOver = phase === 'GAME_OVER';
  const iWon =
    winnerPlayerId != null && me?.playerId != null && winnerPlayerId === me.playerId;

  const getActionGuideText = (): string => {
    if (isGameOver) {
      return iWon ? '🎉 YOU WIN! 対戦終了' : '対戦終了';
    }
    if (isSpectator) {
      return `👁️ ライブ観戦モード（カードをタップまたは長押しで能力・ステータス詳細を表示）`;
    }
    if (mustPromoteBench) {
      return '⚠️ バトル場のカードがきぜつしました。ベンチから出すカードを選んでください！';
    }
    if (phase === 'WAITING_FOR_PROMOTION') {
      return '相手がベンチから新しいバトル場のカードを選んでいます…';
    }
    if (!isMyTurn) {
      return '相手のターン中…（カードタップ/長押しで詳細確認）';
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
        : total <= 8
        ? '-space-x-3.5'
        : '-space-x-5'
      : total <= 4
      ? 'space-x-1'
      : total <= 6
      ? '-space-x-2.5 sm:-space-x-1.5'
      : total <= 8
      ? '-space-x-4 sm:-space-x-2.5'
      : '-space-x-6 sm:-space-x-3.5';

    return (
      <div className="w-full overflow-x-auto overflow-y-visible pokepoke-scroll flex items-center px-2 pt-2.5 pb-1">
        <div className={`flex items-center mx-auto ${overlapClass}`}>
          {myHand.map((card, idx) => {
            if (card == null || card.instanceId == null) return null;
            const isSelected = isCardMatchingId(selectedHandCard, card.instanceId);
            const isHovered =
              hoveredHandCardId != null && hoveredHandCardId === card.instanceId;
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
                  onLongPress={() => setInspectCard(card)}
                />
                <button
                  type="button"
                  title="カード詳細"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectCard(card);
                  }}
                  className="absolute top-0.5 right-0.5 z-30 w-4 h-4 rounded-full bg-black/75 hover:bg-amber-500 text-stone-200 hover:text-stone-950 border border-white/30 flex items-center justify-center cursor-pointer shadow"
                >
                  <Info className="w-2.5 h-2.5" />
                </button>
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

      {/* Opponent Connection Lost Small Notice */}
      {!opponent.isConnected && !isGameOver && (
        <div className="fixed top-2 right-2 z-50 px-3 py-1.5 rounded-xl bg-rose-950/95 border border-rose-500/80 text-rose-100 text-[11px] font-bold shadow-xl flex items-center gap-1.5 animate-pulse pointer-events-none">
          <WifiOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>Connection lost / 相手の通信が切断されました</span>
          <span className="px-1.5 py-0.5 rounded bg-black/50 text-amber-300 font-mono font-black text-[10px]">
            {disconnectSecondsLeft}s
          </span>
        </div>
      )}

      {/* Spectator Mode Banner */}
      {isSpectator && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1 rounded-full bg-emerald-950/95 border border-emerald-400 text-emerald-200 font-black text-[11px] shadow-xl flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>LIVE 観戦中 ({spectatorCount || 1}人視聴)</span>
          <button
            onClick={onLeaveRoom}
            className="ml-1 px-2 py-0.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-[10px] font-black cursor-pointer"
          >
            退室
          </button>
        </div>
      )}

      {/* Spectacular Non-Intrusive Skill / Spell / Evolve VFX Overlay */}
      {vfxOverlay && (
        <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center overflow-hidden">
          {vfxOverlay.kind === 'SPELL' && (
            <div className="w-64 h-64 rounded-full border-4 border-dashed border-fuchsia-400/70 bg-radial from-fuchsia-500/25 via-indigo-500/15 to-transparent anim-magic-circle flex items-center justify-center shadow-[0_0_50px_rgba(217,70,239,0.6)]" />
          )}
          {vfxOverlay.kind === 'SKILL' && (
            <div className="w-[120%] h-8 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_35px_rgba(251,191,36,0.95)] anim-slash-beam" />
          )}
          {vfxOverlay.kind === 'EVOLVE' && (
            <div className="w-72 h-72 rounded-full border-4 border-amber-300/80 bg-radial from-yellow-300/35 via-amber-500/15 to-transparent anim-magic-circle shadow-[0_0_60px_rgba(251,191,36,0.85)]" />
          )}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-5 py-2 rounded-2xl bg-stone-950/90 border-2 border-amber-300 shadow-2xl text-center animate-fadeIn">
            <div className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 tracking-wider drop-shadow">
              {vfxOverlay.title}
            </div>
            {vfxOverlay.subtitle && (
              <div className="text-[10px] font-bold text-stone-200 mt-0.5 max-w-xs truncate">
                {vfxOverlay.subtitle}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Disappearing / Shatter Ghost Effect on Knockout */}
      {vanishingGhost && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-45 pointer-events-none flex flex-col items-center justify-center">
          <div className="w-28 h-38 rounded-xl border-2 border-rose-400 bg-gradient-to-b from-rose-600/80 to-stone-950/90 flex flex-col items-center justify-center p-2 shadow-[0_0_40px_rgba(244,63,94,0.9)] anim-card-vanish">
            <Skull className="w-8 h-8 text-white mb-1" />
            <span className="text-[10px] font-black text-white text-center leading-tight">
              {vanishingGhost.cardName}
            </span>
            <span className="text-[9px] font-black text-amber-300 mt-1">KNOCK OUT!</span>
          </div>
        </div>
      )}

      {/* Floating Animation Banner */}
      {animBanner && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1 rounded-full bg-stone-950/95 border-2 border-amber-400 text-amber-200 font-black text-[11px] shadow-2xl animate-bounce whitespace-nowrap pointer-events-none">
          {animBanner}
        </div>
      )}

      {/* KO Point Reward Popup (+1 POINT GET! / +2 POINTS GET!) */}
      {scorePopup && !isGameOver && (
        <div className="fixed top-20 left-1/2 z-50 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 text-stone-950 border-2 border-white shadow-[0_0_35px_rgba(251,191,36,0.9)] flex flex-col items-center gap-0.5 anim-score-burst pointer-events-none">
          <div className="text-xs sm:text-sm font-black tracking-wider flex items-center gap-1">
            <Trophy className="w-4 h-4 fill-stone-950" />
            <span>
              +{scorePopup.pointsGained} POINT{scorePopup.pointsGained > 1 ? 'S' : ''} GET!
            </span>
          </div>
          <div className="text-[10px] font-black text-stone-900">
            {scorePopup.isMe ? 'YOU' : scorePopup.scorerName} : {scorePopup.currentScore} /{' '}
            {scorePopup.maxScore} POINTS
          </div>
        </div>
      )}

      {/* Bench Promotion Instruction Banner when Active Card is Knocked Out */}
      {mustPromoteBench && !isGameOver && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md px-3.5 py-2 rounded-2xl bg-rose-950/95 border-2 border-amber-400 text-stone-100 shadow-2xl text-center animate-fadeIn pointer-events-none">
          <div className="text-xs font-black text-amber-300">
            バトル場のカードがきぜつしました。
          </div>
          <div className="text-[11px] font-bold text-white mt-0.5">
            ベンチから出すカードを選んでタップしてください。
          </div>
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
              {!opponent.isConnected && !isGameOver && (
                <span className="px-1.5 py-0.5 rounded bg-rose-950 border border-rose-500 text-rose-200 text-[9px] font-black flex items-center gap-0.5 shrink-0 animate-pulse">
                  <WifiOff className="w-2.5 h-2.5 text-rose-400" />
                  <span>切断中 ({disconnectSecondsLeft}s)</span>
                </span>
              )}
              <EmoteSpeechBubble
                emoji={oppActiveEmote?.emoji || null}
                eventKey={oppActiveEmote?.eventId}
                position="top-right"
              />
              {/* Opponent Win-Point Orbs */}
              <div className="flex items-center gap-0.5 ml-1 shrink-0">
                {Array.from({ length: winScore }).map((_, idx) => (
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
                  {opponent.score}/{winScore} POINTS
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 text-[10px] font-bold">
              {/* 降参ボタン（ターン終了ボタンから離れた上部に配置＆2段階確認付きで誤タップを完全防止） */}
              {confirmSurrender ? (
                <div className="flex items-center gap-0.5 bg-rose-950 border border-rose-500 rounded px-1 py-0.5">
                  <button
                    onClick={() => {
                      setConfirmSurrender(false);
                      onSendAction('SURRENDER');
                    }}
                    className="text-[9px] font-black text-rose-200 hover:text-white px-1 cursor-pointer"
                  >
                    本当に降参
                  </button>
                  <button
                    onClick={() => setConfirmSurrender(false)}
                    className="text-[9px] text-slate-400 hover:text-white px-0.5 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmSurrender(true)}
                  className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-rose-950/70 border border-slate-800 hover:border-rose-700 text-slate-400 hover:text-rose-300 text-[9px] cursor-pointer"
                >
                  降参
                </button>
              )}
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
                damagePopup={getSafeCardDamagePopup(damagePopup, card)}
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
              isAttacker={isCardMatchingId(opponent.activeCard, attackingCardId)}
              damagePopup={getSafeCardDamagePopup(damagePopup, opponent.activeCard)}
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
                className={`px-3 py-1.5 rounded-lg font-black text-[10px] shadow transition-all ${
                  isMyTurn
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:brightness-110 active:scale-95 cursor-pointer ring-1 ring-sky-300'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                ターン終了
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
              isAttacker={isCardMatchingId(me.activeCard, attackingCardId)}
              isTargetable={
                (isAttachingEnergy && me.activeCard != null) ||
                (selectedIsEvolution &&
                  me.activeCard != null &&
                  canEvolveCard(me.activeCard, selectedHandCard, gameState.turnNumber).ok)
              }
              targetBadgeText={
                isAttachingEnergy
                  ? '⚡エネ付与'
                  : selectedIsEvolution &&
                    me.activeCard != null &&
                    canEvolveCard(me.activeCard, selectedHandCard, gameState.turnNumber).ok
                  ? '🌟進化可能'
                  : undefined
              }
              canPlaceCard={
                me.activeCard == null &&
                selectedDef?.type === 'ATTACK' &&
                !selectedIsEvolution &&
                isMyTurn &&
                !mustPromoteBench
              }
              damagePopup={getSafeCardDamagePopup(damagePopup, me.activeCard)}
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
              const isAttachTarget = isAttachingEnergy && card != null;
              const isRetreatTarget = isRetreating && card != null;
              const isPromoteTarget = mustPromoteBench && card != null;
              const isEvoTarget =
                selectedIsEvolution &&
                card != null &&
                canEvolveCard(card, selectedHandCard, gameState.turnNumber).ok;
              const canPlaceOnBench =
                isMyTurn &&
                !mustPromoteBench &&
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
                      ? '選択してバトル場へ'
                      : isAttachTarget
                      ? '⚡エネ付与'
                      : isRetreatTarget
                      ? '交代'
                      : isEvoTarget
                      ? '🌟進化可能'
                      : undefined
                  }
                  canPlaceCard={canPlaceOnBench}
                  damagePopup={getSafeCardDamagePopup(damagePopup, card)}
                  onClick={() => handleMyBenchClick(card, idx)}
                  onInspectCard={setInspectCard}
                />
              );
            })}
          </div>

          {/* Player Info + Points + Deck/Trash + Emote Control */}
          <div className="flex items-center justify-between gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-black text-[11px] text-amber-200 truncate">{me.name}</span>
              <EmoteSpeechBubble
                emoji={myActiveEmote?.emoji || null}
                eventKey={myActiveEmote?.eventId}
                position="bottom-right"
              />
              <div className="flex items-center gap-0.5 shrink-0">
                <span className="text-[8px] text-stone-400 font-bold">YOU:</span>
                {Array.from({ length: winScore }).map((_, idx) => (
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
                  {me.score}/{winScore} POINTS
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 text-[9px] font-bold">
              {!isSpectator && onSendEmote && (
                <EmoteControl
                  disabled={isGameOver}
                  cooldownRemainingMs={cooldownRemainingMs}
                  onSelectEmote={onSendEmote}
                />
              )}
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
            {confirmSurrender ? (
              <div className="flex items-center gap-1 bg-rose-950 border border-rose-500 rounded px-1.5 py-0.5">
                <button
                  onClick={() => {
                    setConfirmSurrender(false);
                    onSendAction('SURRENDER');
                  }}
                  className="text-[9px] font-black text-rose-200 hover:text-white cursor-pointer"
                >
                  本当に降参
                </button>
                <button
                  onClick={() => setConfirmSurrender(false)}
                  className="text-[9px] text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmSurrender(true)}
                className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-rose-950/70 border border-slate-800 text-[9px] text-slate-400 hover:text-rose-300 cursor-pointer"
              >
                🏳️降参
              </button>
            )}
            <span className="font-black text-xs text-stone-100">{opponent.name}</span>
            {!opponent.isConnected && !isGameOver && (
              <span className="px-1.5 py-0.5 rounded bg-rose-950 border border-rose-500 text-rose-200 text-[9px] font-black flex items-center gap-0.5 shrink-0 animate-pulse">
                <WifiOff className="w-2.5 h-2.5 text-rose-400" />
                <span>切断中 ({disconnectSecondsLeft}s)</span>
              </span>
            )}
            <EmoteSpeechBubble
              emoji={oppActiveEmote?.emoji || null}
              eventKey={oppActiveEmote?.eventId}
              position="top-right"
            />
            <div className="flex items-center gap-0.5">
              {Array.from({ length: winScore }).map((_, idx) => (
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
                {opponent.score}/{winScore} POINTS
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

          {/* Right: Turn End Only (Separated from Surrender) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              disabled={!isMyTurn}
              onClick={() => {
                clearModes();
                onSendAction('END_TURN');
              }}
              className={`px-3 py-1 rounded-lg font-black text-[10px] ${
                isMyTurn
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              ターン終了
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
                damagePopup={getSafeCardDamagePopup(damagePopup, card)}
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
              isAttacker={isCardMatchingId(opponent.activeCard, attackingCardId)}
              damagePopup={getSafeCardDamagePopup(damagePopup, opponent.activeCard)}
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
              isAttacker={isCardMatchingId(me.activeCard, attackingCardId)}
              isTargetable={
                (isAttachingEnergy && me.activeCard != null) ||
                (selectedIsEvolution &&
                  me.activeCard != null &&
                  canEvolveCard(me.activeCard, selectedHandCard, gameState.turnNumber).ok)
              }
              targetBadgeText={
                isAttachingEnergy
                  ? '⚡エネ付与'
                  : selectedIsEvolution &&
                    me.activeCard != null &&
                    canEvolveCard(me.activeCard, selectedHandCard, gameState.turnNumber).ok
                  ? '🌟進化可能'
                  : undefined
              }
              canPlaceCard={
                me.activeCard == null &&
                selectedDef?.type === 'ATTACK' &&
                !selectedIsEvolution &&
                isMyTurn &&
                !mustPromoteBench
              }
              damagePopup={getSafeCardDamagePopup(damagePopup, me.activeCard)}
              onClick={handleMyActiveClick}
              onInspectCard={setInspectCard}
            />
          </div>

          {/* Right: My Bench (3 Slots) */}
          <div className="flex items-center gap-1.5">
            {myBench.map((card, idx) => {
              const isAttachTarget = isAttachingEnergy && card != null;
              const isRetreatTarget = isRetreating && card != null;
              const isPromoteTarget = mustPromoteBench && card != null;
              const isEvoTarget =
                selectedIsEvolution &&
                card != null &&
                canEvolveCard(card, selectedHandCard, gameState.turnNumber).ok;
              const canPlaceOnBench =
                isMyTurn &&
                !mustPromoteBench &&
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
                      ? '選択してバトル場へ'
                      : isAttachTarget
                      ? '⚡エネ付与'
                      : isRetreatTarget
                      ? '交代'
                      : isEvoTarget
                      ? '🌟進化可能'
                      : undefined
                  }
                  canPlaceCard={canPlaceOnBench}
                  damagePopup={getSafeCardDamagePopup(damagePopup, card)}
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

          {/* Left Controls: Player Points + Emote + Energy + Attack + Retreat */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex flex-col gap-0.5 pr-1 border-r border-slate-800">
              <div className="flex items-center gap-1">
                <span className="font-black text-[10px] text-amber-200">{me.name}</span>
                <EmoteSpeechBubble
                  emoji={myActiveEmote?.emoji || null}
                  eventKey={myActiveEmote?.eventId}
                  position="bottom-right"
                />
                <span className="text-[9px] font-black text-emerald-300">
                  {me.score}/{winScore} POINTS
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

            {!isSpectator && onSendEmote && (
              <EmoteControl
                disabled={isGameOver}
                cooldownRemainingMs={cooldownRemainingMs}
                onSelectEmote={onSendEmote}
                compact
              />
            )}

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

      {/* Trade Ticket / Hand Sort Card Selection Modal */}
      {handReturnPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border-2 border-amber-400 shadow-2xl p-4 text-stone-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="font-black text-sm text-amber-300">
                {getCardDefinition(handReturnPicker.spellCard.definitionId)?.name}：山札に戻す手札を選択（最大2枚）
              </div>
              <button
                onClick={() => setHandReturnPicker(null)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-stone-300">
              山札に戻すカードを1〜2枚タップして選んでください。戻した枚数と同じだけ山札からドローします（選ばずに発動すると自動で最大2枚入れ替えます）。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 py-2 max-h-60 overflow-y-auto">
              {myHand
                .filter((c) => c.instanceId !== handReturnPicker.spellCard.instanceId)
                .map((c) => {
                  const picked = handReturnPicker.selectedIds.includes(c.instanceId);
                  return (
                    <div
                      key={c.instanceId}
                      onClick={() => {
                        setHandReturnPicker((prev) => {
                          if (!prev) return null;
                          if (prev.selectedIds.includes(c.instanceId)) {
                            return {
                              ...prev,
                              selectedIds: prev.selectedIds.filter((id) => id !== c.instanceId),
                            };
                          }
                          if (prev.selectedIds.length >= 2) return prev;
                          return {
                            ...prev,
                            selectedIds: [...prev.selectedIds, c.instanceId],
                          };
                        });
                      }}
                      className={`relative cursor-pointer transition-transform ${
                        picked ? 'scale-105 ring-2 ring-amber-400 rounded-lg' : 'opacity-85'
                      }`}
                    >
                      <CardView card={c} size="hand" isSelected={picked} />
                      {picked && (
                        <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-stone-950 font-black text-[9px] px-1.5 py-0.5 rounded-full shadow">
                          戻す
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setHandReturnPicker(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-stone-300 text-xs font-bold cursor-pointer"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  onSendAction('USE_SPELL_CARD', {
                    cardInstanceId: handReturnPicker.spellCard.instanceId,
                    selectedCardInstanceIds: handReturnPicker.selectedIds,
                  });
                  setHandReturnPicker(null);
                  clearModes();
                }}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 font-black text-xs cursor-pointer shadow"
              >
                {handReturnPicker.selectedIds.length > 0
                  ? `${handReturnPicker.selectedIds.length}枚戻してドロー`
                  : 'おまかせで発動'}
              </button>
            </div>
          </div>
        </div>
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

      {/* Ultimate Battle Result Screen */}
      {isGameOver && (
        <MatchResultOverlay
          gameState={gameState}
          onPlayAgain={onPlayAgain}
          onLeaveRoom={onLeaveRoom}
          onInspectCard={setInspectCard}
        />
      )}
    </div>
  );
};
