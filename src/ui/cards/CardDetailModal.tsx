import React from 'react';
import { CardInstance } from '../../cards/types';
import { getCardDefinition } from '../../cards/cardRegistry';
import { X, Sword, Shield, Zap, Sparkles, Flame, Layers } from 'lucide-react';

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
  actionLabel
}) => {
  if (!card) return null;
  const def = getCardDefinition(card.definitionId);
  if (!def) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-xl overflow-hidden bg-stone-900 border-2 border-amber-600/80 shadow-2xl text-stone-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
              def.type === 'ATTACK' ? 'bg-amber-600 text-white' :
              def.type === 'SPELL' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {def.type === 'ATTACK' ? '攻撃カード' : def.type === 'SPELL' ? '魔法カード' : '環境カード'}
            </span>
            <span className="font-bold text-base text-amber-200">{def.name}</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
          {/* Card Hero artwork */}
          <div className={`w-full h-32 rounded-lg bg-gradient-to-br ${def.artGradient} flex items-center justify-center relative shadow-inner border border-stone-700`}>
            <div className="text-white drop-shadow-lg flex flex-col items-center">
              <Sparkles className="w-12 h-12 mb-1" />
              <div className="text-xs font-bold tracking-wider">{def.name}</div>
            </div>
            {def.type === 'ATTACK' && (
              <div className="absolute bottom-2 inset-x-4 flex justify-between">
                <div className="px-2.5 py-1 rounded bg-amber-950/90 border border-amber-500 text-amber-300 font-black flex items-center gap-1">
                  <Sword className="w-3.5 h-3.5" /> ATK: {card.currentAtk}
                </div>
                <div className="px-2.5 py-1 rounded bg-rose-950/90 border border-rose-500 text-rose-300 font-black flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> HP: {card.currentHp} / {card.maxHp}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {def.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-300 text-[10px]">
                #{tag}
              </span>
            ))}
            {card.isTaunt && (
              <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-600 text-amber-300 text-[10px] font-bold">
                【守護】
              </span>
            )}
            {card.hasCharge && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 text-[10px] font-bold">
                【突撃】
              </span>
            )}
          </div>

          {/* Description */}
          <div className="p-2.5 rounded bg-stone-800/80 border border-stone-700 text-stone-200 leading-relaxed">
            <div className="text-stone-400 font-bold mb-1 text-[11px]">【効果テキスト】</div>
            {def.description}
          </div>

          {/* Attached cards stack list */}
          {card.attachedCards && card.attachedCards.length > 0 && (
            <div className="p-2.5 rounded bg-indigo-950/60 border border-indigo-700/60 text-indigo-200">
              <div className="font-bold flex items-center gap-1 mb-1 text-indigo-300">
                <Layers className="w-3.5 h-3.5" /> 付着カード（スタック中: {card.attachedCards.length}枚）
              </div>
              <ul className="space-y-1">
                {card.attachedCards.map((att, idx) => {
                  const aDef = getCardDefinition(att.definitionId);
                  return (
                    <li key={idx} className="flex justify-between items-center text-[11px] bg-indigo-900/40 p-1 rounded">
                      <span className="font-bold text-white">{aDef?.name}</span>
                      <span className="text-indigo-300">{aDef?.description}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Evolution info */}
          {def.evolutionRule && (
            <div className="p-2 rounded bg-amber-950/40 border border-amber-700/40 text-amber-200 text-[11px]">
              <div className="font-bold text-amber-300 mb-0.5">【進化可能】</div>
              <div>進化先: {getCardDefinition(def.evolutionRule.targetDefinitionId)?.name}</div>
            </div>
          )}

          {/* Flavor Text */}
          {def.flavorText && (
            <div className="italic text-stone-400 text-[11px] border-l-2 border-stone-600 pl-2 py-0.5">
              {def.flavorText}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-stone-800 bg-stone-950 flex gap-2">
          {actionLabel && onAction && (
            <button
              onClick={() => onAction(actionLabel)}
              className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              {actionLabel}
            </button>
          )}
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
