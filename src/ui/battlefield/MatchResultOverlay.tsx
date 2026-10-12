import React, { useMemo } from 'react';
import { SanitizedGameState } from '../../online/types';
import { CardDefinition, CardInstance } from '../../cards/types';
import { getCardDefinition } from '../../cards/cardRegistry';
import { CardView } from '../cards/CardView';
import {
  Trophy,
  Skull,
  Swords,
  RotateCcw,
  Home,
  Flame,
  Shield,
  Zap,
  Sparkles,
  Crown,
} from 'lucide-react';

interface MatchResultOverlayProps {
  gameState: SanitizedGameState;
  onPlayAgain?: () => void;
  onLeaveRoom: () => void;
  onInspectCard?: (card: CardInstance) => void;
}

const AVATAR_MAP: Record<string, string> = {
  smile: '😎',
  rocket: '🚀',
  ghost: '👻',
  zap: '⚡',
  crown: '👑',
  bot: '🤖',
};

export const MatchResultOverlay: React.FC<MatchResultOverlayProps> = ({
  gameState,
  onPlayAgain,
  onLeaveRoom,
  onInspectCard,
}) => {
  const {
    me,
    opponent,
    winScore,
    battleFormat,
    turnNumber,
    winnerPlayerId,
    winReason,
    logs = [],
    isSpectator,
  } = gameState;

  const safeLogs = Array.isArray(logs) ? logs : [];
  const safeMyHand = Array.isArray(me?.hand) ? me.hand : [];
  const safeMyTrash = Array.isArray(me?.trash) ? me.trash : [];
  const safeOppTrash = Array.isArray(opponent?.trash) ? opponent.trash : [];

  const isDraw = !winnerPlayerId;
  const iWon = isSpectator
    ? winnerPlayerId === me.playerId
    : winnerPlayerId === me.playerId;
  const isVictoryTheme = isSpectator ? true : iWon;

  // Determine MVP / Finisher / Featured Hero Card from existing game state
  const featuredHero = useMemo((): {
    card: CardInstance;
    def: CardDefinition;
    roleLabel: string;
    ownerName: string;
  } | null => {
    const targetOwner = isSpectator
      ? winnerPlayerId === opponent.playerId
        ? opponent
        : me
      : me;
    const targetTrash = isSpectator
      ? winnerPlayerId === opponent.playerId
        ? safeOppTrash
        : safeMyTrash
      : safeMyTrash;
    const targetHand = isSpectator
      ? winnerPlayerId === opponent.playerId
        ? []
        : safeMyHand
      : safeMyHand;

    const candidates: { card: CardInstance; priority: number; roleLabel: string }[] = [];

    if (targetOwner.activeCard) {
      const def = getCardDefinition(targetOwner.activeCard.definitionId);
      const isFinisher =
        gameState.lastAnimation?.actorPlayerId === targetOwner.playerId &&
        def &&
        gameState.lastAnimation?.cardName === def.name;
      candidates.push({
        card: targetOwner.activeCard,
        priority: 100 + (def?.level || 1) * 15 + (isFinisher ? 50 : 0),
        roleLabel: isVictoryTheme ? 'FINISHER / MVP' : 'ACE FIGHTER',
      });
    }

    (targetOwner.bench || []).forEach((b) => {
      if (!b) return;
      const def = getCardDefinition(b.definitionId);
      candidates.push({
        card: b,
        priority: 60 + (def?.level || 1) * 12 + b.attachedEnergy * 5,
        roleLabel: 'BATTLE VANGUARD',
      });
    });

    targetTrash.forEach((t) => {
      const def = getCardDefinition(t.definitionId);
      if (def?.type === 'ATTACK') {
        candidates.push({
          card: t,
          priority: 40 + def.level * 10,
          roleLabel: 'FALLEN HERO',
        });
      }
    });

    targetHand.forEach((h) => {
      const def = getCardDefinition(h.definitionId);
      if (def?.type === 'ATTACK') {
        candidates.push({
          card: h,
          priority: 20 + def.level * 8,
          roleLabel: 'KEY CARD',
        });
      }
    });

    if (candidates.length === 0 && opponent.activeCard) {
      const def = getCardDefinition(opponent.activeCard.definitionId);
      if (def) {
        return {
          card: opponent.activeCard,
          def,
          roleLabel: 'DOMINANT ACE',
          ownerName: opponent.name,
        };
      }
    }

    candidates.sort((a, b) => b.priority - a.priority);
    if (candidates.length > 0) {
      const top = candidates[0];
      const def = getCardDefinition(top.card.definitionId);
      if (def) {
        return {
          card: top.card,
          def,
          roleLabel: top.roleLabel,
          ownerName: targetOwner.name,
        };
      }
    }
    return null;
  }, [
    me,
    opponent,
    safeMyHand,
    safeMyTrash,
    safeOppTrash,
    gameState.lastAnimation,
    winnerPlayerId,
    isSpectator,
    isVictoryTheme,
  ]);

  // Compute real match battle stats from player state, trash, and logs
  const matchStats = useMemo(() => {
    let myTotalDamage = 0;
    let mySpellsUsed = safeMyTrash.filter(
      (c) => getCardDefinition(c.definitionId)?.type === 'SPELL'
    ).length;

    for (const entry of safeLogs) {
      const text = typeof entry === 'string' ? entry : '';
      if (text.includes(me.name)) {
        const dmgMatch = text.match(/(\d+)\s*ダメージ/);
        if (dmgMatch) {
          myTotalDamage += parseInt(dmgMatch[1], 10);
        }
      }
    }

    // Also include damage currently on opponent's active/bench/trash cards if logs were sanitized
    if (myTotalDamage === 0) {
      if (opponent.activeCard) {
        myTotalDamage += Math.max(0, opponent.activeCard.maxHp - opponent.activeCard.currentHp);
      }
      (opponent.bench || []).forEach((b) => {
        if (b) {
          myTotalDamage += Math.max(0, b.maxHp - b.currentHp);
        }
      });
      safeOppTrash.forEach((t) => {
        const def = getCardDefinition(t.definitionId);
        if (def?.type === 'ATTACK') {
          myTotalDamage += t.maxHp || def.stats.hp || 0;
        }
      });
    }

    const myKnockouts = me.score;

    return {
      myTotalDamage,
      mySpellsUsed,
      myKnockouts,
    };
  }, [safeLogs, safeMyTrash, safeOppTrash, me.name, me.score, opponent.activeCard, opponent.bench]);

  const winnerName =
    winnerPlayerId === me.playerId
      ? me.name
      : winnerPlayerId === opponent.playerId
      ? opponent.name
      : 'DRAW';

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto overflow-x-hidden bg-black/95 text-stone-100 select-none font-sans animate-fadeIn">
      {/* =====================================================================
       * DYNAMIC CINEMATIC BACKGROUND (SPEED LINES, SHOCKWAVES, DIAGONAL SLASH)
       * ===================================================================== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Core Radial Aura */}
        <div
          className="absolute inset-0"
          style={{
            background: isVictoryTheme
              ? 'radial-gradient(circle at 50% 34%, rgba(245, 158, 11, 0.38) 0%, rgba(220, 38, 38, 0.25) 42%, rgba(2, 6, 23, 0.98) 85%)'
              : 'radial-gradient(circle at 50% 34%, rgba(56, 189, 248, 0.25) 0%, rgba(88, 28, 135, 0.28) 45%, rgba(2, 6, 23, 0.98) 85%)',
          }}
        />

        {/* Diagonal Speed Lines Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: isVictoryTheme
              ? 'repeating-linear-gradient(-32deg, transparent, transparent 14px, rgba(251, 191, 36, 0.22) 14px, rgba(251, 191, 36, 0.22) 16px)'
              : 'repeating-linear-gradient(-32deg, transparent, transparent 14px, rgba(56, 189, 248, 0.18) 14px, rgba(56, 189, 248, 0.18) 16px)',
          }}
        />

        {/* Bold Diagonal Backslash Band */}
        <div
          className={`absolute -left-24 right-[-6rem] top-[16%] h-48 sm:h-64 -rotate-6 transform transition-all ${
            isVictoryTheme
              ? 'bg-gradient-to-r from-red-950/80 via-amber-600/30 to-red-900/80 border-y-2 border-amber-400/50 shadow-[0_0_90px_rgba(245,158,11,0.4)]'
              : 'bg-gradient-to-r from-slate-950/90 via-indigo-900/40 to-cyan-950/80 border-y-2 border-cyan-400/40 shadow-[0_0_80px_rgba(6,182,212,0.3)]'
          }`}
        />

        {/* Expanding Shockwave Ring */}
        <div
          className={`absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 rounded-full border-2 pointer-events-none animate-ping opacity-20 ${
            isVictoryTheme ? 'border-amber-300' : 'border-cyan-400'
          }`}
          style={{ animationDuration: '2.8s' }}
        />
      </div>

      {/* =====================================================================
       * MAIN CONTENT CONTAINER (OPTIMIZED FOR SMARTPHONE PORTRAIT + DESKTOP)
       * ===================================================================== */}
      <div className="relative z-10 w-full max-w-md mx-auto px-3.5 py-3 sm:py-5 flex flex-col justify-between min-h-[100dvh] gap-2.5">
        {/* -------------------------------------------------------------------
         * A. HEADER & B. DIAGONAL WIN/LOSS BANNER
         * ------------------------------------------------------------------- */}
        <div className="space-y-1.5 pt-0.5">
          {/* A. Top Header Label */}
          <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
            <div className="flex items-center gap-1.5">
              <span
                className={`px-2 py-0.5 transform -skew-x-12 font-black ${
                  isVictoryTheme
                    ? 'bg-amber-400 text-stone-950'
                    : 'bg-cyan-400 text-slate-950'
                }`}
              >
                BATTLE RESULT
              </span>
              <span className="text-stone-300 font-bold">
                {battleFormat === 'allstar' ? 'ALL-STAR BRAWL' : 'STANDARD 20'}
              </span>
            </div>
            <span className="text-stone-400 font-mono">
              TURN {turnNumber} · FIRST TO {winScore} PTS
            </span>
          </div>

          {/* B. Main Win/Loss Diagonal Title Banner */}
          <div className="relative py-2 flex flex-col items-center justify-center">
            <div
              className={`w-full py-2.5 px-4 transform -skew-x-6 border-y-2 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden ${
                isVictoryTheme
                  ? 'bg-gradient-to-r from-red-700 via-orange-600 to-amber-500 border-yellow-200 shadow-[0_0_40px_rgba(245,158,11,0.55)]'
                  : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 border-cyan-400/80 shadow-[0_0_35px_rgba(34,211,238,0.35)]'
              }`}
            >
              {/* Subtle metallic sheen slash */}
              <div className="absolute inset-y-0 -left-10 w-24 bg-white/15 transform skew-x-12 pointer-events-none" />

              <h1
                className="font-black italic tracking-tighter uppercase leading-none text-center select-none"
                style={{
                  fontSize: 'clamp(2.2rem, 10vw, 3.4rem)',
                  textShadow: isVictoryTheme
                    ? '0 4px 0 #450a0a, 0 0 25px rgba(254, 240, 138, 0.85)'
                    : '0 4px 0 #020617, 0 0 22px rgba(34, 211, 238, 0.75)',
                }}
              >
                {isDraw ? (
                  <span className="text-stone-100">DRAW GAME</span>
                ) : isSpectator ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-200 to-amber-400">
                    GAME SET!
                  </span>
                ) : iWon ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-100 to-amber-300">
                    VICTORY!
                  </span>
                ) : (
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 via-sky-300 to-indigo-400">
                    DEFEAT...
                  </span>
                )}
              </h1>

              <div className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm font-black tracking-wider uppercase">
                {isSpectator ? (
                  <span className="text-yellow-100 drop-shadow">
                    WINNER: {winnerName} 選手！
                  </span>
                ) : iWon ? (
                  <span className="text-yellow-100 drop-shadow">
                    YOU WIN!! 完全勝利達成！
                  </span>
                ) : (
                  <span className="text-cyan-200 drop-shadow">
                    YOU LOSE... 次戦リベンジへ！
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------
         * C. CHARACTER / MVP CARD SHOWCASE + VS SCOREBOARD
         * ------------------------------------------------------------------- */}
        <div className="relative flex flex-col items-center gap-2.5 my-auto">
          {/* Featured Hero Card Showcase */}
          {featuredHero && (
            <div className="relative w-full flex items-center justify-center py-1">
              {/* Backlight Glow behind MVP Card */}
              <div
                className={`absolute w-44 h-44 rounded-full blur-2xl pointer-events-none ${
                  isVictoryTheme ? 'bg-amber-400/40' : 'bg-cyan-500/30'
                }`}
              />

              <div className="relative z-10 flex items-center gap-3.5 w-full bg-slate-950/85 border border-stone-700/80 p-2.5 transform -skew-x-2 shadow-2xl">
                {/* Card Visual (Tappable for detail inspection) */}
                <div
                  onClick={() => onInspectCard?.(featuredHero.card)}
                  className="relative shrink-0 cursor-pointer group transition-transform hover:scale-105"
                >
                  <CardView card={featuredHero.card} size="active" />
                  <div
                    className={`absolute -top-2 -left-2 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow ${
                      isVictoryTheme
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950'
                        : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950'
                    }`}
                  >
                    {featuredHero.roleLabel}
                  </div>
                </div>

                {/* Hero Card Spotlight Info */}
                <div className="flex-1 min-w-0 text-left space-y-1 transform skew-x-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                    <Crown
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isVictoryTheme ? 'text-amber-400' : 'text-cyan-400'
                      }`}
                    />
                    <span
                      className={
                        isVictoryTheme ? 'text-amber-300' : 'text-cyan-300'
                      }
                    >
                      {featuredHero.ownerName}&apos;S ACE CARD
                    </span>
                  </div>

                  <div className="text-base sm:text-lg font-black text-white truncate leading-tight">
                    {featuredHero.def.name}
                  </div>

                  <div className="text-[11px] font-bold text-amber-200/90 truncate">
                    必殺技: 『{featuredHero.def.abilities.attackName}』
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono font-bold text-stone-300">
                    <span>Lv.{featuredHero.def.level}</span>
                    <span>·</span>
                    <span className="text-emerald-300">
                      HP {featuredHero.card.currentHp}/{featuredHero.card.maxHp}
                    </span>
                    <span>·</span>
                    <span className="text-rose-300">
                      ATK {featuredHero.card.currentAtk}
                    </span>
                  </div>

                  {featuredHero.def.ui.flavorText && (
                    <p className="text-[10px] text-stone-400 italic line-clamp-2 pt-0.5">
                      {featuredHero.def.ui.flavorText}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* High-Impact Diagonal VS Scoreboard */}
          <div className="w-full grid grid-cols-11 items-center bg-slate-950/95 border-y-2 border-stone-700/90 py-2.5 px-3 shadow-xl relative overflow-hidden">
            {/* Player (Me) Side */}
            <div className="col-span-5 flex items-center gap-2 min-w-0">
              <div
                className={`w-10 h-10 shrink-0 flex items-center justify-center text-xl font-black border-2 transform -skew-x-6 ${
                  winnerPlayerId === me.playerId
                    ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                    : 'bg-slate-900 border-slate-700'
                }`}
              >
                {AVATAR_MAP[me.avatarIcon] || '😎'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  {winnerPlayerId === me.playerId && (
                    <span className="px-1 py-0.2 bg-amber-400 text-stone-950 font-black text-[8px] uppercase">
                      WIN
                    </span>
                  )}
                  <span className="text-xs font-black text-white truncate">
                    {me.name}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span
                    className={`text-2xl sm:text-3xl font-black font-mono leading-none ${
                      winnerPlayerId === me.playerId
                        ? 'text-amber-300'
                        : 'text-stone-300'
                    }`}
                  >
                    {me.score}
                  </span>
                  <span className="text-[10px] font-bold text-stone-500 font-mono">
                    / {winScore} PT
                  </span>
                </div>
              </div>
            </div>

            {/* Center Diagonal Slash VS */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              <div className="text-xs font-black italic text-amber-400 tracking-tighter transform -skew-x-12">
                VS
              </div>
            </div>

            {/* Opponent Side */}
            <div className="col-span-5 flex items-center justify-end gap-2 min-w-0 text-right">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-end gap-1">
                  <span className="text-xs font-black text-white truncate">
                    {opponent.name}
                  </span>
                  {winnerPlayerId === opponent.playerId && (
                    <span className="px-1 py-0.2 bg-rose-500 text-white font-black text-[8px] uppercase">
                      WIN
                    </span>
                  )}
                </div>
                <div className="flex items-baseline justify-end gap-1 mt-0.5">
                  <span
                    className={`text-2xl sm:text-3xl font-black font-mono leading-none ${
                      winnerPlayerId === opponent.playerId
                        ? 'text-rose-400'
                        : 'text-stone-400'
                    }`}
                  >
                    {opponent.score}
                  </span>
                  <span className="text-[10px] font-bold text-stone-500 font-mono">
                    / {winScore} PT
                  </span>
                </div>
              </div>
              <div
                className={`w-10 h-10 shrink-0 flex items-center justify-center text-xl font-black border-2 transform -skew-x-6 ${
                  winnerPlayerId === opponent.playerId
                    ? 'bg-rose-500/20 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                    : 'bg-slate-900 border-slate-700'
                }`}
              >
                {AVATAR_MAP[opponent.avatarIcon] || '🤖'}
              </div>
            </div>
          </div>

          {/* Battle Summary Stats Strip */}
          <div className="w-full grid grid-cols-3 gap-1.5 text-center">
            <div className="bg-slate-950/90 border border-stone-800 py-1.5 px-2 transform -skew-x-3">
              <div className="text-[9px] font-bold text-stone-400 uppercase">
                TOTAL DAMAGE
              </div>
              <div className="text-xs sm:text-sm font-black font-mono text-amber-300">
                {matchStats.myTotalDamage} <span className="text-[9px] text-stone-500">DMG</span>
              </div>
            </div>
            <div className="bg-slate-950/90 border border-stone-800 py-1.5 px-2 transform -skew-x-3">
              <div className="text-[9px] font-bold text-stone-400 uppercase">
                KNOCKOUTS
              </div>
              <div className="text-xs sm:text-sm font-black font-mono text-emerald-300">
                {matchStats.myKnockouts} <span className="text-[9px] text-stone-500">K.O.</span>
              </div>
            </div>
            <div className="bg-slate-950/90 border border-stone-800 py-1.5 px-2 transform -skew-x-3">
              <div className="text-[9px] font-bold text-stone-400 uppercase">
                MAGIC CAST
              </div>
              <div className="text-xs sm:text-sm font-black font-mono text-sky-300">
                {matchStats.mySpellsUsed} <span className="text-[9px] text-stone-500">CARDS</span>
              </div>
            </div>
          </div>

          {/* Win Reason Callout */}
          {winReason && (
            <div
              className={`w-full py-2 px-3 border-l-4 text-xs font-bold leading-snug ${
                isVictoryTheme
                  ? 'bg-amber-950/40 border-amber-400 text-amber-100'
                  : 'bg-cyan-950/40 border-cyan-400 text-cyan-100'
              }`}
            >
              {winReason}
            </div>
          )}
        </div>

        {/* -------------------------------------------------------------------
         * D. ACTION BUTTONS (GAME UI SHARP ANGLES)
         * ------------------------------------------------------------------- */}
        <div className="space-y-2 pb-1">
          {!isSpectator && onPlayAgain && (
            <button
              type="button"
              onClick={onPlayAgain}
              className={`w-full py-3.5 px-4 transform -skew-x-6 font-black text-sm sm:text-base tracking-wider uppercase shadow-2xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 ${
                isVictoryTheme
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 text-stone-950 border-white shadow-[0_0_30px_rgba(251,191,36,0.5)] hover:brightness-110'
                  : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 border-white shadow-[0_0_30px_rgba(56,189,248,0.45)] hover:brightness-110'
              }`}
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>REMATCH / もう一度対戦する</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLeaveRoom}
            className={`w-full py-3 px-4 transform -skew-x-6 font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border ${
              !isSpectator && onPlayAgain
                ? 'bg-slate-900/95 hover:bg-slate-800 text-stone-200 border-stone-600'
                : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 text-stone-950 border-white py-3.5 text-sm shadow-xl'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>RETURN TO LOBBY / ロビーへ戻る</span>
          </button>
        </div>
      </div>
    </div>
  );
};
