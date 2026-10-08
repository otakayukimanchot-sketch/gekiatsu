import React from 'react';
import { CardInstance } from '../../cards/types';
import { CardView } from '../cards/CardView';
import { X, Trash2 } from 'lucide-react';

interface GraveyardModalProps {
  cards: CardInstance[];
  ownerName: string;
  onClose: () => void;
  onInspectCard?: (card: CardInstance) => void;
}

export const GraveyardModal: React.FC<GraveyardModalProps> = ({
  cards,
  ownerName,
  onClose,
  onInspectCard,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-xl bg-stone-900 border-2 border-stone-700 shadow-2xl flex flex-col max-h-[85vh] text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Trash2 className="w-4 h-4 text-stone-400" />
            <span>
              {ownerName} のトラッシュ ({cards.length}枚)
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card grid */}
        <div className="p-4 overflow-y-auto flex-1">
          {cards.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs italic">
              トラッシュにはまだカードがありません。
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 justify-items-center">
              {cards.map((card, idx) => (
                <div
                  key={idx}
                  onClick={() => onInspectCard?.(card)}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  <CardView card={card} size="field" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-800 bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
