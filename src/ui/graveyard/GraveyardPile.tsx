import React from 'react';
import { CardInstance } from '../../cards/types';
import { CardView } from '../cards/CardView';
import { Skull } from 'lucide-react';

interface GraveyardPileProps {
  cards: CardInstance[];
  label?: string;
  onClick?: () => void;
}

export const GraveyardPile: React.FC<GraveyardPileProps> = ({
  cards,
  label = '墓地',
  onClick
}) => {
  const topCard = cards.length > 0 ? cards[cards.length - 1] : null;

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center select-none cursor-pointer group"
    >
      <div className="relative w-12 h-18 rounded-lg border-2 border-dashed border-stone-600/70 bg-stone-900/60 flex items-center justify-center overflow-hidden transition-all group-hover:border-stone-400">
        {topCard ? (
          <div className="scale-80 origin-center">
            <CardView card={topCard} size="small" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-stone-500">
            <Skull className="w-4 h-4 opacity-50 mb-0.5" />
            <span className="text-[8px] font-sans">空</span>
          </div>
        )}

        {/* Count badge */}
        <div className="absolute -bottom-1 -right-1 bg-stone-800 text-stone-300 border border-stone-600 rounded-full w-4 h-4 flex items-center justify-center font-bold text-[8px] shadow">
          {cards.length}
        </div>
      </div>

      <span className="mt-1 text-[9px] font-bold text-stone-400 group-hover:text-stone-200">
        {label}
      </span>
    </div>
  );
};
