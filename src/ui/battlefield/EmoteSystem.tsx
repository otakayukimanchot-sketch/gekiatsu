import React, { useState, useRef, useEffect } from 'react';
import {
  EMOTE_CATEGORIES,
  EMOTE_DEFINITIONS,
  EMOTE_LONG_PRESS_MS,
  EmoteCategory,
} from '../../game/emotes';
import { Smile, X, Clock } from 'lucide-react';

interface EmoteControlProps {
  disabled?: boolean;
  cooldownRemainingMs?: number;
  onSelectEmote: (emoteId: string) => void;
  compact?: boolean;
}

/**
 * Emote button + Selection panel:
 * - Opens ONLY when the button is held for >= 400ms (EMOTE_LONG_PRESS_MS).
 * - Short taps (< 400ms) never send emotes and show a subtle hold-hint tooltip.
 * - Supports mouse, touch, and mobile devices via Pointer Events.
 */
export const EmoteControl: React.FC<EmoteControlProps> = ({
  disabled = false,
  cooldownRemainingMs = 0,
  onSelectEmote,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [activeCategory, setActiveCategory] = useState<EmoteCategory>('greetings');
  const [selectedFlashId, setSelectedFlashId] = useState<string | null>(null);
  const [shortTapHint, setShortTapHint] = useState(false);

  const holdTimerRef = useRef<number | null>(null);
  const hintTimerRef = useRef<number | null>(null);
  const openedOnThisPressRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isCoolingDown = cooldownRemainingMs > 0;

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
      if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
    };
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('pointerdown', handleOutside);
    return () => window.removeEventListener('pointerdown', handleOutside);
  }, [isOpen]);

  const startHold = (e: React.PointerEvent) => {
    if (disabled) return;
    // Only primary mouse button or touch/pen
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    openedOnThisPressRef.current = false;
    setIsHolding(true);
    setShortTapHint(false);

    if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
    holdTimerRef.current = window.setTimeout(() => {
      openedOnThisPressRef.current = true;
      setIsHolding(false);
      setIsOpen(true);
    }, EMOTE_LONG_PRESS_MS);
  };

  const endHold = () => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (isHolding && !openedOnThisPressRef.current) {
      setIsHolding(false);
      if (isOpen) {
        setIsOpen(false);
      } else {
        // Short tap (< 400ms): do NOT send any emote or open panel; show brief hold hint
        setShortTapHint(true);
        if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
        hintTimerRef.current = window.setTimeout(() => setShortTapHint(false), 1400);
      }
    } else {
      setIsHolding(false);
    }
  };

  const cancelHold = () => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
  };

  const handlePickEmote = (emoteId: string) => {
    if (disabled || isCoolingDown) return;
    setSelectedFlashId(emoteId);
    onSelectEmote(emoteId);
    window.setTimeout(() => {
      setSelectedFlashId(null);
      setIsOpen(false);
    }, 180);
  };

  const filteredEmotes = EMOTE_DEFINITIONS.filter((e) => e.category === activeCategory);

  return (
    <div ref={containerRef} className="relative inline-flex items-center select-none">
      {/* Long-Press Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onContextMenu={(e) => e.preventDefault()}
        title="長押し(0.4秒)でエモートパネルを開く"
        className={`relative overflow-hidden rounded-lg border font-black transition-all flex items-center justify-center gap-1 cursor-pointer select-none ${
          compact ? 'px-2 py-1 text-[9px]' : 'px-2 py-0.5 text-[9px]'
        } ${
          disabled
            ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
            : isOpen
            ? 'bg-amber-400 text-stone-950 border-white shadow-md scale-105'
            : isCoolingDown
            ? 'bg-slate-900 border-amber-500/40 text-amber-300/70'
            : 'bg-slate-950 hover:bg-slate-800 border-amber-500/50 text-amber-300 shadow-xs'
        }`}
      >
        {/* Hold Progress Fill Bar (400ms) */}
        {isHolding && (
          <span
            className="emote-hold-fill absolute inset-0 bg-amber-400/35 pointer-events-none origin-left"
          />
        )}

        {isCoolingDown ? (
          <>
            <Clock className="w-2.5 h-2.5 text-amber-400 animate-spin" />
            <span className="font-mono">{(cooldownRemainingMs / 1000).toFixed(1)}s</span>
          </>
        ) : (
          <>
            <Smile className="w-3 h-3 text-amber-400 shrink-0" />
            <span>エモート(長押し)</span>
          </>
        )}
      </button>

      {/* Subtle Short-Tap Hint Tooltip */}
      {shortTapHint && !isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 px-2 py-0.5 rounded-md bg-stone-950/95 border border-amber-400/80 text-amber-200 text-[9px] font-bold whitespace-nowrap shadow-lg pointer-events-none animate-fadeIn">
          0.4秒長押しで開く
        </div>
      )}

      {/* Emote Selection Panel */}
      {isOpen && (
        <div
          className="absolute bottom-full left-0 sm:left-auto sm:right-0 mb-2 z-50 w-64 sm:w-72 rounded-2xl bg-slate-900/95 border-2 border-amber-400 shadow-[0_12px_35px_rgba(0,0,0,0.85)] backdrop-blur-md p-2.5 text-stone-100 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-black text-amber-300">
                エモート送信 (全24種)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* 4 Category Tabs */}
          <div className="grid grid-cols-4 gap-1 mb-2">
            {EMOTE_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`py-1 px-1 rounded-lg text-[9px] font-black flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-b from-amber-400 to-yellow-500 text-stone-950 border-white shadow-sm scale-[1.02]'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-sm leading-none">{cat.icon}</span>
                  <span className="truncate w-full text-center text-[8px] leading-tight">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 6 Emotes Grid for Selected Category */}
          <div className="grid grid-cols-3 gap-1.5">
            {filteredEmotes.map((emo) => {
              const isSelected = selectedFlashId === emo.id;
              return (
                <button
                  key={emo.id}
                  type="button"
                  disabled={isCoolingDown}
                  onClick={() => handlePickEmote(emo.id)}
                  className={`group py-1.5 px-1 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-stone-950 border-white scale-110 shadow-lg'
                      : isCoolingDown
                      ? 'bg-slate-950/50 border-slate-800 opacity-50 cursor-not-allowed'
                      : 'bg-slate-950 hover:bg-slate-800 border-slate-800 hover:border-amber-400/70 hover:scale-105 active:scale-95'
                  }`}
                >
                  <span className="text-xl leading-none group-hover:scale-110 transition-transform">
                    {emo.emoji}
                  </span>
                  <span
                    className={`text-[8px] font-bold truncate max-w-full ${
                      isSelected ? 'text-stone-950 font-black' : 'text-slate-300'
                    }`}
                  >
                    {emo.label}
                  </span>
                </button>
              );
            })}
          </div>

          {isCoolingDown && (
            <div className="mt-1.5 text-center text-[9px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 rounded-lg py-0.5">
              クールダウン中… あと {(cooldownRemainingMs / 1000).toFixed(1)} 秒
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface EmoteBubbleProps {
  emoji: string | null;
  eventKey?: string;
  position?: 'top-right' | 'bottom-right';
}

/**
 * Animated speech bubble beside a player's avatar/name:
 * - Keyed by eventKey so if a new emote arrives before 2.5s, the pop-in animation cleanly restarts.
 * - Pointer-events-none so it never blocks cards, health bars, or battle controls.
 */
export const EmoteSpeechBubble: React.FC<EmoteBubbleProps> = ({
  emoji,
  eventKey,
  position = 'bottom-right',
}) => {
  if (!emoji) return null;

  return (
    <div
      key={eventKey || emoji}
      className={`pointer-events-none z-40 inline-flex items-center justify-center px-2 py-0.5 rounded-2xl bg-white text-stone-950 border-2 border-amber-400 shadow-[0_6px_18px_rgba(0,0,0,0.65)] anim-emote-bubble ${
        position === 'top-right' ? ' ml-1' : 'ml-1'
      }`}
    >
      <span className="text-base sm:text-lg leading-none select-none">{emoji}</span>
    </div>
  );
};
