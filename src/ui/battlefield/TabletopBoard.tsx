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
  History,
  X,
  ScrollText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameEventLog } from '../../game/types';

export interface ParsedActionLog {
  id: string;
  turnNumber: number;
  timestamp: number;
  actorLabel: string;
  actorBadge: string;
  typeLabel: string;
  typeBadge: string;
  icon: string;
  summary: string;
  fullMessage: string;
  isMe: boolean;
  isOpp: boolean;
  rawType: string;
}

export function parseGameLog(
  log: GameEventLog,
  myPlayerId?: string,
  oppPlayerId?: string
): ParsedActionLog {
  const isMe = myPlayerId != null && log.actorPlayerId === myPlayerId;
  const isOpp = oppPlayerId != null && log.actorPlayerId === oppPlayerId;
  const actorLabel = isMe ? '自分' : isOpp ? '相手' : log.actorPlayerName;
  const actorBadge = isMe
    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
    : isOpp
    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    : 'bg-slate-700 text-slate-300 border-slate-600';

  let typeBadge = 'bg-slate-800 text-slate-300 border-slate-700';
  let typeLabel = '行動';
  let icon = '📢';
  let summary = log.message;

  switch (log.type) {
    case 'SPELL':
      typeBadge = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      typeLabel = '魔法';
      icon = '✨';
      summary = `魔法カード「${log.cardName || ''}」を使用`;
      break;
    case 'KNOCKOUT':
      typeBadge = 'bg-rose-600/30 text-rose-300 border-rose-500/50 animate-pulse';
      typeLabel = '撃破';
      icon = '💥';
      summary = log.message;
      break;
    case 'ATTACK':
      typeBadge = 'bg-red-500/20 text-red-300 border-red-500/40';
      typeLabel = '攻撃';
      icon = '⚔️';
      summary = log.message;
      break;
    case 'EVOLVE':
      typeBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      typeLabel = '進化';
      icon = '🌟';
      summary = `「${log.cardName || ''}」へ進化！`;
      break;
    case 'ATTACH_ENERGY':
      typeBadge = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      typeLabel = 'エネルギー';
      icon = '⚡';
      summary = `「${log.cardName || ''}」にエネルギー付与`;
      break;
    case 'PLAY_CARD':
      typeBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      typeLabel = '登場';
      icon = '🃏';
      summary = `「${log.cardName || ''}」を場に出した`;
      break;
    case 'RETREAT':
      typeBadge = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      typeLabel = '交代';
      icon = '🏃';
      summary = `バトル場とベンチを交代`;
      break;
    case 'PROMOTE':
      typeBadge = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      typeLabel = 'バトル場へ';
      icon = '🛡️';
      summary = `「${log.cardName || ''}」をバトル場に出した`;
      break;
    case 'DRAW':
      typeBadge = 'bg-slate-800 text-slate-300 border-slate-700';
      typeLabel = 'ドロー';
      icon = '🎴';
      summary = log.message;
      break;
    case 'TURN_END':
      typeBadge = 'bg-slate-800 text-slate-400 border-slate-700';
      typeLabel = 'ターン終了';
      icon = '⌛';
      summary = `${actorLabel}がターン終了`;
      break;
    case 'GAME_OVER':
      typeBadge = 'bg-amber-500/30 text-amber-300 border-amber-500/50';
      typeLabel = '決着';
      icon = '🏆';
      summary = log.message;
      break;
    default:
      summary = log.message;
  }

  return {
    id: log.id,
    turnNumber: log.turnNumber,
    timestamp: log.timestamp,
    actorLabel,
    actorBadge,
    typeLabel,
    typeBadge,
    icon,
    summary,
    fullMessage: log.message,
    isMe,
    isOpp,
    rawType: log.type,
  };
}

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
  const oppHand = Array.isArray(opponent?.hand) ? opponent.hand : [];
  const myTrash = Array.isArray(me?.trash) ? me.trash : [];
  const oppTrash = Array.isArray(opponent?.trash) ? opponent.trash : [];

  const [selectedHandCard, setSelectedHandCard] = useState<CardInstance | null>(null);
  const [hoveredHandCardId, setHoveredHandCardId] = useState<string | null>(null);
  const [spectatorHandTab, setSpectatorHandTab] = useState<'both' | 'me' | 'opp'>('both');
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
  const [showActionHistory, setShowActionHistory] = useState(false);

  const logs = Array.isArray(gameState.logs) ? gameState.logs : [];

  // 直前の行動（自分または相手が直前に行ったアクション）
  const latestAction = React.useMemo(() => {
    if (!logs || logs.length === 0) return null;
    // 最新の非DRAW・非TURN_ENDアクションを優先的に探索
    for (let i = logs.length - 1; i >= 0; i--) {
      const l = logs[i];
      if (l.type !== 'DRAW' && l.type !== 'TURN_END') {
        return parseGameLog(l, me?.playerId, opponent?.playerId);
      }
    }
    return parseGameLog(logs[logs.length - 1], me?.playerId, opponent?.playerId);
  }, [logs, me?.playerId, opponent?.playerId]);

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

    const isMeActor =
      lastAnimation.actorPlayerId != null &&
      me?.playerId != null &&
      lastAnimation.actorPlayerId === me.playerId;
    const actorLabel = isMeActor ? '自分' : '相手';

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
        `⚔️ ${actorLabel}: 「${lastAnimation.cardName || ''}」の『${lastAnimation.attackName || 'アタック'}』！ ${
          lastAnimation.damage || 0
        } ダメージ！`
      );
      setVfxOverlay({
        kind: 'SKILL',
        title: `⚔️ ${actorLabel}: ${lastAnimation.attackName || 'SKILL ATTACK'}`,
        subtitle: `${lastAnimation.cardName || ''} ➔ -${lastAnimation.damage || 0} DMG`,
      });
      scheduleClearAllAnims(2000);
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
        `💥 攻撃カード「${lastAnimation.cardName || ''}」が撃破された！ (+${pts}pt)`
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

      scheduleClearAllAnims(2200);
      return;
    }

    if (lastAnimation.type === 'PROMOTE') {
      setVfxOverlay(null);
      setAnimBanner(`🛡️ ${actorLabel}: ベンチから「${lastAnimation.cardName || ''}」がバトル場へ登場！`);
      scheduleClearAllAnims(1500);
      return;
    }

    if (lastAnimation.type === 'ATTACH_ENERGY') {
      setVfxOverlay(null);
      setAnimBanner(`⚡ ${actorLabel}: 「${lastAnimation.cardName || ''}」にエネルギー付与！`);
      scheduleClearAllAnims(1400);
      return;
    }

    if (lastAnimation.type === 'EVOLVE') {
      setAnimBanner(`🌟 ${actorLabel}: 「${lastAnimation.cardName || ''}」へ進化！`);
      setVfxOverlay({
        kind: 'EVOLVE',
        title: `🌟 ${actorLabel}: EVOLUTION!`,
        subtitle: `${lastAnimation.cardName || ''} が覚醒降臨！`,
      });
      scheduleClearAllAnims(2000);
      return;
    }

    if (lastAnimation.type === 'SPELL') {
      setAnimBanner(`✨ ${actorLabel}: 魔法カード「${lastAnimation.cardName || ''}」を使用！`);
      setVfxOverlay({
        kind: 'SPELL',
        title: `✨ ${actorLabel}: 魔法カード「${lastAnimation.cardName || '魔法'}」を使用`,
        subtitle: lastAnimation.attackName || '',
      });
      scheduleClearAllAnims(2200);
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

  // Shared Card Row Renderer
  const renderCardRow = (cards: CardInstance[], isLandscapeMode: boolean, isOpponent: boolean = false) => {
    if (cards.length === 0) {
      return (
        <div className="py-2 flex items-center justify-center text-[10px] text-slate-500 italic px-4">
          手札がありません
        </div>
      );
    }

    const total = cards.length;
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
      <div className="w-full overflow-x-auto overflow-y-visible pokepoke-scroll flex items-center px-2 py-1">
        <div className={`flex items-center mx-auto ${overlapClass}`}>
          {cards.map((card, idx) => {
            if (card == null || card.instanceId == null) return null;
            const isSelected = !isSpectator && isCardMatchingId(selectedHandCard, card.instanceId);
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

            const rotDeg = isLandscapeMode || isSpectator
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
                onClick={() => {
                  if (isSpectator) {
                    setInspectCard(card);
                  } else {
                    handleSelectHandCard(card);
                  }
                }}
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
                  canAct={!isSpectator && !isOpponent && isMyTurn && hasEvoTargetNow}
                  isUnplayableEvolution={!isSpectator && isEvoCard && !hasEvoTargetNow}
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

  // Shared Hand Renderer (Guarantees spectator dual-hand visibility & normal single-player tray)
  const renderHandCards = (isLandscapeMode: boolean) => {
    if (isSpectator) {
      return (
        <div className="w-full flex flex-col gap-1 py-1">
          {/* Spectator Hand Tab Controls */}
          <div className="flex items-center justify-between px-2.5 py-0.5 border-b border-slate-800/80 bg-slate-950/60 rounded-t-xl text-[10px]">
            <div className="flex items-center gap-1 font-bold text-amber-300">
              <Eye className="w-3 h-3 text-amber-400" />
              <span>観戦手札ビュー</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg p-0.5">
              <button
                onClick={() => setSpectatorHandTab('both')}
                className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                  spectatorHandTab === 'both'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                👀 両者表示
              </button>
              <button
                onClick={() => setSpectatorHandTab('me')}
                className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                  spectatorHandTab === 'me'
                    ? 'bg-blue-500 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🔵 {me.name} ({myHand.length})
              </button>
              <button
                onClick={() => setSpectatorHandTab('opp')}
                className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                  spectatorHandTab === 'opp'
                    ? 'bg-rose-500 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🔴 {opponent.name} ({oppHand.length})
              </button>
            </div>
          </div>

          {/* Cards Display according to selected tab */}
          {(spectatorHandTab === 'both' || spectatorHandTab === 'me') && (
            <div className="flex flex-col">
              <div className="px-2 pt-0.5 flex items-center justify-between text-[9px] font-bold text-blue-300">
                <span>🔵 {me.name} の手札 ({myHand.length}枚)</span>
                <span className="text-[8px] text-slate-400">タップで詳細確認</span>
              </div>
              {renderCardRow(myHand, isLandscapeMode, false)}
            </div>
          )}

          {(spectatorHandTab === 'both' || spectatorHandTab === 'opp') && (
            <div className="flex flex-col border-t border-slate-800/60 pt-0.5">
              <div className="px-2 pt-0.5 flex items-center justify-between text-[9px] font-bold text-rose-300">
                <span>🔴 {opponent.name} の手札 ({oppHand.length}枚)</span>
                <span className="text-[8px] text-slate-400">タップで詳細確認</span>
              </div>
              {renderCardRow(oppHand, isLandscapeMode, true)}
            </div>
          )}
        </div>
      );
    }

    return renderCardRow(myHand, isLandscapeMode, false);
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
              {isSpectator ? (
                <button
                  onClick={() => setSpectatorHandTab((prev) => (prev === 'opp' ? 'both' : 'opp'))}
                  className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-stone-300 flex items-center gap-1 cursor-pointer transition-colors"
                  title="相手の手札を表示"
                >
                  <Eye className="w-2.5 h-2.5 text-sky-400" />
                  <span>手札</span>
                  <span className="text-sky-300 font-mono">{oppHand.length}</span>
                </button>
              ) : (
                <div className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-stone-300">
                  手札 <span className="text-sky-300 font-mono">{opponent.handCount}</span>
                </div>
              )}
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
          <div className="relative w-full flex items-center justify-between gap-2 py-1 px-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-inner">
            {/* Left Side: [VS] + Score "〇-〇" + Emote Display Above/Below [VS] */}
            <div className="relative flex items-center gap-1.5 shrink-0">
              {/* Opponent Emote Above [VS] on the left side */}
              {oppActiveEmote?.emoji && (
                <div className="absolute bottom-full left-0 mb-1.5 z-40 pointer-events-none flex items-center gap-1">
                  <EmoteSpeechBubble
                    emoji={oppActiveEmote.emoji}
                    eventKey={oppActiveEmote.eventId}
                    position="top-right"
                  />
                </div>
              )}

              <div className="px-2 py-0.5 rounded-lg bg-slate-950 border border-amber-500/40 text-[9px] font-black text-amber-400 shrink-0">
                VS
              </div>

              {/* Numeric "〇-〇" Score Display with Required Points displayed directly above */}
              <div className="flex flex-col items-center justify-center">
                <span className="text-[8px] font-black text-amber-300 tracking-tight leading-none mb-0.5 whitespace-nowrap">
                  {winScore}点先取
                </span>
                <div
                  className="px-2.5 py-0.5 rounded-lg bg-slate-950 border border-slate-700 flex items-center gap-1.5 shadow-sm"
                  title={`自分 ${me.score} - ${opponent.score} 相手 (${winScore}点先取)`}
                >
                  <span className="text-xs sm:text-sm font-black font-mono text-emerald-400 leading-none">
                    {me.score}
                  </span>
                  <span className="text-[10px] font-black text-stone-400 leading-none">-</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-amber-400 leading-none">
                    {opponent.score}
                  </span>
                </div>
              </div>

              {/* My Emote Below [VS] on the left side */}
              {myActiveEmote?.emoji && (
                <div className="absolute top-full left-0 mt-1.5 z-40 pointer-events-none flex items-center gap-1">
                  <EmoteSpeechBubble
                    emoji={myActiveEmote.emoji}
                    eventKey={myActiveEmote.eventId}
                    position="bottom-right"
                  />
                </div>
              )}
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

          {/* 直前の行動 (直前で自分/相手がなにを行ったかを表示) */}
          <div className="w-full my-0.5 px-2.5 py-1 rounded-xl bg-slate-950/90 border border-slate-700/80 shadow flex items-center justify-between gap-1.5 min-h-[30px]">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                直前の行動
              </span>
              {latestAction ? (
                <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-black shrink-0 border ${latestAction.actorBadge}`}>
                    {latestAction.actorLabel}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-black shrink-0 border ${latestAction.typeBadge}`}>
                    {latestAction.typeLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowActionHistory(true)}
                    className="text-[10px] font-bold text-stone-100 truncate cursor-pointer hover:text-amber-300 text-left transition-colors"
                    title={latestAction.fullMessage}
                  >
                    {latestAction.icon} {latestAction.summary}
                  </button>
                </div>
              ) : (
                <span className="text-[9px] text-slate-400 italic">対戦開始（待機中）</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowActionHistory(true)}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-stone-200 text-[9px] font-black shrink-0 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
              title="対戦履歴・行動ログ一覧を表示"
            >
              <History className="w-3 h-3 text-amber-400" />
              <span>履歴 ({logs.length})</span>
            </button>
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

          {/* Player Info + Deck/Trash + Emote Control */}
          <div className="flex items-center justify-between gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-black text-[11px] text-amber-200 truncate">{me.name}</span>
              <span className="text-[9px] text-stone-400 font-bold shrink-0">
                ({winScore}点先取)
              </span>
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
            {isSpectator ? (
              <button
                onClick={() => setSpectatorHandTab((prev) => (prev === 'opp' ? 'both' : 'opp'))}
                className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[9px] text-stone-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="相手の手札を表示"
              >
                <Eye className="w-2.5 h-2.5 text-sky-400" />
                <span>手札:{oppHand.length}</span>
                <span className="text-slate-400">山札:{opponent.deckCount}</span>
              </button>
            ) : (
              <span className="text-[9px] text-slate-400">
                手札:{opponent.handCount} 山札:{opponent.deckCount}
              </span>
            )}
            <button
              onClick={() => setViewingTrash('opp')}
              className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-[9px] text-stone-300 cursor-pointer"
            >
              相手トラッシュ({oppTrash.length})
            </button>
          </div>

          {/* Center Turn & Action Guide & Recent Action */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-center">
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
            {latestAction ? (
              <button
                type="button"
                onClick={() => setShowActionHistory(true)}
                className="flex items-center gap-1 max-w-[260px] px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-700 hover:border-amber-400/50 text-[9px] cursor-pointer truncate transition-colors"
                title={latestAction.fullMessage}
              >
                <span className="text-[8px] font-black text-amber-300 shrink-0">直前:</span>
                <span className={`px-1 py-0.2 rounded text-[7px] font-black shrink-0 border ${latestAction.actorBadge}`}>
                  {latestAction.actorLabel}
                </span>
                <span className={`px-1 py-0.2 rounded text-[7px] font-black shrink-0 border ${latestAction.typeBadge}`}>
                  {latestAction.typeLabel}
                </span>
                <span className="text-stone-200 font-bold truncate">
                  {latestAction.icon} {latestAction.summary}
                </span>
              </button>
            ) : (
              <span className="text-[9px] text-amber-200 font-bold truncate">
                {actionError || getActionGuideText()}
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowActionHistory(true)}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-stone-300 text-[8px] font-bold shrink-0 cursor-pointer flex items-center gap-0.5"
              title="対戦履歴一覧"
            >
              <History className="w-2.5 h-2.5 text-amber-400" />
              <span>履歴({logs.length})</span>
            </button>
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

          {/* Center: VS Badge + Numeric Score "〇-〇" + Emotes Above/Below VS */}
          <div className="relative flex flex-col items-center justify-center gap-1 shrink-0">
            {oppActiveEmote?.emoji && (
              <div className="absolute bottom-full mb-1 z-40 pointer-events-none">
                <EmoteSpeechBubble
                  emoji={oppActiveEmote.emoji}
                  eventKey={oppActiveEmote.eventId}
                  position="top-right"
                />
              </div>
            )}
            <div className="px-2 py-0.5 rounded-lg bg-slate-950 border border-amber-500/40 text-[10px] font-black text-amber-400 shadow">
              VS
            </div>
            <span className="text-[8px] font-black text-amber-300 tracking-tight leading-none whitespace-nowrap">
              {winScore}点先取
            </span>
            <div className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-700 flex items-center gap-1 shadow">
              <span className="text-xs font-black font-mono text-emerald-400 leading-none">
                {me.score}
              </span>
              <span className="text-[9px] font-black text-stone-400 leading-none">-</span>
              <span className="text-xs font-black font-mono text-amber-400 leading-none">
                {opponent.score}
              </span>
            </div>
            {myActiveEmote?.emoji && (
              <div className="absolute top-full mt-1 z-40 pointer-events-none">
                <EmoteSpeechBubble
                  emoji={myActiveEmote.emoji}
                  eventKey={myActiveEmote.eventId}
                  position="bottom-right"
                />
              </div>
            )}
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

      {/* Action History Modal (直前の行動・対戦ログ一覧) */}
      {showActionHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-black text-amber-300">直前の行動・対戦ログ一覧</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                  全 {logs.length} 件
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowActionHistory(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                title="閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Log list (newest first) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-800/60">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  まだ行動履歴がありません
                </div>
              ) : (
                [...logs].reverse().map((rawLog, idx) => {
                  const parsed = parseGameLog(rawLog, me?.playerId, opponent?.playerId);
                  const isLatest = idx === 0;
                  return (
                    <div
                      key={parsed.id || `log_${idx}`}
                      className={`pt-2 first:pt-0 flex flex-col gap-1 p-2 rounded-xl transition-colors ${
                        isLatest
                          ? 'bg-amber-500/10 border border-amber-500/30'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isLatest && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-amber-400 text-stone-950">
                              最新
                            </span>
                          )}
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                            T{parsed.turnNumber}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-black border ${parsed.actorBadge}`}>
                            {parsed.actorLabel}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-black border ${parsed.typeBadge}`}>
                            {parsed.icon} {parsed.typeLabel}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {new Date(parsed.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-stone-100 pl-1 leading-relaxed">
                        {parsed.fullMessage}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-400">
                最新のアクションが一番上に表示されます
              </span>
              <button
                type="button"
                onClick={() => setShowActionHistory(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-stone-200 text-xs font-bold cursor-pointer transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
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
