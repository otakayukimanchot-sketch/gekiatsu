import React, { useState } from 'react';
import {
  ALL_CARD_DEFINITIONS,
  createStandardDeckDefinitionIds,
  getCardDefinition,
} from '../../cards/cardRegistry';
import { CardInstance } from '../../cards/types';
import { createCardInstance } from '../../game/engine/deckBuilder';
import { CardView } from '../cards/CardView';
import { CardDetailModal } from '../cards/CardDetailModal';
import { X, Layers } from 'lucide-react';

interface DeckInspectModalProps {
  onClose: () => void;
}

type FilterOption =
  | 'ALL'
  | 'DECK'
  | 'LV1'
  | 'LV2'
  | 'LV3'
  | 'LV4'
  | 'LV5'
  | 'SPELL'
  | 'ENVIRONMENT';

export const DeckInspectModal: React.FC<DeckInspectModalProps> = ({ onClose }) => {
  const [filter, setFilter] = useState<FilterOption>('ALL');
  const [selectedCard, setSelectedCard] = useState<CardInstance | null>(null);

  const allCardInstances = React.useMemo(() => {
    return ALL_CARD_DEFINITIONS.map((def) => createCardInstance(def.id, 'viewer'));
  }, []);

  const standardDeckInstances = React.useMemo(() => {
    return createStandardDeckDefinitionIds().map((id) => createCardInstance(id, 'viewer'));
  }, []);

  const displayedInstances = React.useMemo(() => {
    if (filter === 'DECK') return standardDeckInstances;
    return allCardInstances.filter((card) => {
      const def = getCardDefinition(card.definitionId);
      if (!def) return false;
      if (filter === 'ALL') return true;
      if (filter === 'LV1') return def.type === 'ATTACK' && def.level === 1;
      if (filter === 'LV2') return def.type === 'ATTACK' && def.level === 2;
      if (filter === 'LV3') return def.type === 'ATTACK' && def.level === 3;
      if (filter === 'LV4') return def.type === 'ATTACK' && def.level === 4;
      if (filter === 'LV5') return def.type === 'ATTACK' && def.level === 5;
      if (filter === 'SPELL') return def.type === 'SPELL';
      if (filter === 'ENVIRONMENT') return def.type === 'ENVIRONMENT';
      return true;
    });
  }, [filter, allCardInstances, standardDeckInstances]);

  const filterButtons: { key: FilterOption; label: string; colorClass: string }[] = [
    { key: 'ALL', label: `全カード (${allCardInstances.length})`, colorClass: 'bg-amber-500 text-stone-950' },
    { key: 'DECK', label: '標準デッキ (20枚)', colorClass: 'bg-yellow-400 text-stone-950' },
    { key: 'LV1', label: 'Lv.1 速攻', colorClass: 'bg-slate-300 text-slate-950' },
    { key: 'LV2', label: 'Lv.2 標準', colorClass: 'bg-cyan-400 text-cyan-950' },
    { key: 'LV3', label: 'Lv.3 主力', colorClass: 'bg-purple-400 text-purple-950' },
    { key: 'LV4', label: 'Lv.4 強襲', colorClass: 'bg-rose-400 text-rose-950' },
    { key: 'LV5', label: 'Lv.5 EX級', colorClass: 'bg-amber-400 text-amber-950' },
    { key: 'SPELL', label: 'Lv.1 魔法', colorClass: 'bg-blue-400 text-blue-950' },
    { key: 'ENVIRONMENT', label: 'Lv.1 環境', colorClass: 'bg-emerald-400 text-emerald-950' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border-2 border-amber-500/80 shadow-2xl flex flex-col max-h-[90vh] text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 font-black text-sm text-amber-300">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>ホンモノカードバトル 全カード図鑑＆20枚デッキ構成</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-stone-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-2.5 border-b border-slate-800 bg-slate-900/80 overflow-x-auto text-[11px]">
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`px-2.5 py-1 rounded-full font-black whitespace-nowrap transition-all cursor-pointer ${
                filter === btn.key
                  ? `${btn.colorClass} shadow scale-105`
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Card grid */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 justify-items-center">
            {displayedInstances.map((card, idx) => (
              <div
                key={`${card.definitionId}_${idx}`}
                onClick={() => setSelectedCard(card)}
                className="cursor-pointer hover:scale-105 transition-transform"
              >
                <CardView card={card} size="field" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs text-slate-400">
          <span>※カードをタップするとレベル別ステータス・わざ・効果を確認できます</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-200 text-xs font-bold cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>

      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
};
