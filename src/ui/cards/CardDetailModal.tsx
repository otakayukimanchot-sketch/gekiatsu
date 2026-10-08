import React from 'react';
import { CardInstance } from '../../cards/types';
import { getCardDefinition } from '../../cards/cardRegistry';
import { X, Sword, Shield, Zap, Sparkles, Footprints, Trophy, GitBranch } from 'lucide-react';

interface CardDetailModalProps {
  card: CardInstance | null;
  onClose: () => void;
  onAction?: (actionName: string) => void;
  actionLabel?: string;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  onClose,
  onAction,
  actionLabel,
}) => {
  if (!card) return null;
  const def = getCardDefinition(card.definitionId);
  if (!def) return null;

  const theme = def.colorTheme;
  const evolvesFromCard = def.evolution.evolvesFrom
    ? getCardDefinition(def.evolution.evolvesFrom)
    : undefined;
  const evolvesToCard = def.evolution.evolvesTo
    ? getCardDefinition(def.evolution.evolvesTo)
    : undefined;
  const triggerCard = def.evolution.triggerCardId
    ? getCardDefinition(def.evolution.triggerCardId)
    : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full max-w-sm rounded-2xl overflow-hidden bg-stone-900 border-2 ${theme.borderClass} shadow-2xl text-stone-100 flex flex-col max-h-[88dvh]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-black shrink-0 ${theme.badgeBg} ${theme.badgeText}`}
            >
              {theme.tierLabel}
            </span>
            <span className="font-black text-sm sm:text-base text-white truncate">{def.name}</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-3.5 overflow-y-auto space-y-2.5 flex-1 text-xs">
          {/* Card Hero Banner */}
          <div
            className={`w-full h-30 rounded-xl bg-gradient-to-br ${theme.artGradient} flex flex-col items-center justify-center relative shadow-inner border border-white/20 p-3`}
          >
            <div className="text-white drop-shadow-lg flex flex-col items-center">
              <Sparkles className="w-9 h-9 mb-1" />
              <div className="text-sm font-black tracking-wider text-center">{def.name}</div>
            </div>

            {def.type === 'ATTACK' && (
              <div className="absolute bottom-2 inset-x-3 flex justify-between items-center">
                <div className="px-2 py-0.5 rounded-lg bg-black/80 border border-amber-400/80 text-amber-300 font-black flex items-center gap-1">
                  <Sword className="w-3 h-3" /> 攻撃力: {card.currentAtk}
                </div>
                <div className="px-2 py-0.5 rounded-lg bg-black/80 border border-emerald-400/80 text-emerald-300 font-black flex items-center gap-1">
                  <Shield className="w-3 h-3" /> HP: {card.currentHp} / {card.maxHp}
                </div>
              </div>
            )}
          </div>

          {/* Battle Stats Box for Attack Cards */}
          {def.type === 'ATTACK' && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-1.5 rounded-xl bg-stone-800/90 border border-stone-700">
                <div className="text-[10px] text-stone-400 mb-0.5 flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" /> 必要エネ
                </div>
                <div className="font-black text-xs text-yellow-300">
                  {card.attachedEnergy} / {def.stats.energyCost}
                </div>
              </div>
              <div className="p-1.5 rounded-xl bg-stone-800/90 border border-stone-700">
                <div className="text-[10px] text-stone-400 mb-0.5 flex items-center justify-center gap-1">
                  <Footprints className="w-3 h-3 text-sky-400" /> にげる
                </div>
                <div className="font-black text-xs text-sky-300">
                  エネ {def.stats.retreatCost}個
                </div>
              </div>
              <div className="p-1.5 rounded-xl bg-stone-800/90 border border-stone-700">
                <div className="text-[10px] text-stone-400 mb-0.5 flex items-center justify-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" /> 撃破Pt
                </div>
                <div className="font-black text-xs text-amber-300">{def.stats.pointValue} pt</div>
              </div>
            </div>
          )}

          {/* Evolution / Lineage Info Box */}
          <div className="p-2.5 rounded-xl bg-stone-800/60 border border-stone-700/80 space-y-1 text-[11px]">
            <div className="font-bold text-sky-300 flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5" />
              <span>系列: {def.evolution.family} (Stage {def.evolution.stage})</span>
            </div>
            {evolvesFromCard && (
              <div className="text-amber-300 bg-amber-950/50 border border-amber-500/40 rounded-lg px-2 py-1 mt-1">
                【進化条件】場の「<span className="font-black text-white">{evolvesFromCard.name}</span>」から進化できます（直接場には出せません）。
              </div>
            )}
            {evolvesToCard && (
              <div className="text-stone-300">
                進化先: <span className="font-bold text-amber-300">{evolvesToCard.name}</span>
              </div>
            )}
            {triggerCard && (
              <div className="text-stone-400 text-[10px]">
                関連カード: {triggerCard.name}
              </div>
            )}
          </div>

          {/* Move / Effect Box */}
          <div className="p-2.5 rounded-xl bg-stone-800/90 border border-stone-700 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-amber-300 text-xs">
                {def.type === 'ATTACK'
                  ? `【わざ】${def.abilities.attackName}`
                  : `【効果】${def.abilities.attackName}`}
              </span>
              {def.type === 'ATTACK' && (
                <span className="font-black text-xs text-white">{card.currentAtk} ダメージ</span>
              )}
            </div>
            <p className="text-stone-200 leading-relaxed">{def.abilities.description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {def.ui.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-300 text-[10px]"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Flavor Text */}
          {def.ui.flavorText && (
            <div className="italic text-stone-400 text-[11px] border-l-2 border-stone-600 pl-2.5 py-0.5">
              {def.ui.flavorText}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-2.5 border-t border-stone-800 bg-stone-950 flex gap-2">
          {actionLabel && onAction && (
            <button
              onClick={() => onAction(actionLabel)}
              className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {actionLabel}
            </button>
          )}
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
