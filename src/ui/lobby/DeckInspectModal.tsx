import React, { useState } from 'react';
import { ALL_CARD_DEFINITIONS, createStandardDeckDefinitionIds, getCardDefinition } from '../../cards/cardRegistry';
import { CardInstance } from '../../cards/types';
import { createCardInstance } from '../../game/engine/deckBuilder';
import { CardView } from '../cards/CardView';
import { CardDetailModal } from '../cards/CardDetailModal';
import { X, Layers, Filter } from 'lucide-react';

interface DeckInspectModalProps {
  onClose: () => void;
}

export const DeckInspectModal: React.FC<DeckInspectModalProps> = ({ onClose }) => {
  const [filterType, setFilterType] = useState<'ALL' | 'ATTACK' | 'SPELL' | 'ENVIRONMENT'>('ALL');
  const [selectedCard, setSelectedCard] = useState<CardInstance | null>(null);

  // Build standard deck card instances
  const standardDeckIds = createStandardDeckDefinitionIds();
  const instances = React.useMemo(() => {
    return standardDeckIds.map(id => createCardInstance(id, 'viewer'));
  }, []);

  const filteredInstances = instances.filter(card => {
    const def = getCardDefinition(card.definitionId);
    if (!def) return false;
    if (filterType === 'ALL') return true;
    return def.type === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-stone-900 border-2 border-amber-600/80 shadow-2xl flex flex-col max-h-[90vh] text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>標準40枚デッキ構成一覧 (全40枚)</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 p-3 border-b border-stone-800 bg-stone-900/60 overflow-x-auto text-xs">
          {(['ALL', 'ATTACK', 'SPELL', 'ENVIRONMENT'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                filterType === type
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
              }`}
            >
              {type === 'ALL' ? '全カード (40)' :
               type === 'ATTACK' ? '攻撃カード (24)' :
               type === 'SPELL' ? '魔法カード (12)' : '環境カード (4)'}
            </button>
          ))}
        </div>

        {/* Card grid */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 justify-items-center">
            {filteredInstances.map((card, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedCard(card)}
                className="cursor-pointer hover:scale-105 transition-transform"
              >
                <CardView card={card} size="field" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-800 bg-stone-950 flex justify-between items-center text-xs text-stone-400">
          <span>※カードをタップすると詳細・効果を確認できます</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold"
          >
            閉じる
          </button>
        </div>
      </div>

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
};
