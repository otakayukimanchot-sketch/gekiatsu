import React from 'react';
import { CardInstance } from '../../cards/types';
import { CardView } from '../cards/CardView';

interface FannedHandProps {
  cards: CardInstance[];
  selectedCardId?: string;
  isMyTurn: boolean;
  onSelectCard: (card: CardInstance) => void;
  onInspectCard?: (card: CardInstance) => void;
}

export const FannedHand: React.FC<FannedHandProps> = ({
  cards,
  selectedCardId,
  isMyTurn,
  onSelectCard,
  onInspectCard
}) => {
  if (!cards || cards.length === 0) {
    return (
      <div className="h-24 flex items-center justify-center text-xs text-stone-400 font-serif italic">
        手札がありません
      </div>
    );
  }

  const n = cards.length;
  // Dynamic angle step identical to opponent hand fan, spread based on count
  const maxAngle = Math.min(24, n * 4.5);
  const angleStep = n > 1 ? (maxAngle * 2) / (n - 1) : 0;

  // Adaptive overlap spacing so cards fan out smoothly without horizontal overflow
  const overlapClass =
    n <= 3
      ? '-space-x-2 sm:-space-x-1'
      : n <= 5
      ? '-space-x-4 sm:-space-x-3'
      : n <= 7
      ? '-space-x-6 sm:-space-x-4'
      : '-space-x-8 sm:-space-x-5';

  return (
    <div className="relative w-full h-32 sm:h-34 flex items-end justify-center select-none overflow-visible pb-1">
      <div className={`flex items-end justify-center ${overlapClass} px-2 max-w-full`}>
        {cards.map((card, i) => {
          const isSelected = card.instanceId === selectedCardId;
          const centerIndex = (n - 1) / 2;
          const normalizedOffset = i - centerIndex;

          // Natural card fan arc: left cards tilt left, right cards tilt right
          const rotDeg = isSelected ? 0 : normalizedOffset * (angleStep || 0);
          // Arch curve: center card sits highest, edge cards curve down gracefully like real fanned cards
          const translateY = isSelected ? -38 : Math.abs(normalizedOffset) * 3;

          return (
            <div
              key={card.instanceId}
              style={{
                transform: `rotate(${rotDeg}deg) translateY(${translateY}px)${isSelected ? ' scale(1.1)' : ''}`,
                zIndex: isSelected ? 50 : 10 + i,
                transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
              className="shrink-0 origin-bottom cursor-pointer hover:z-40 hover:-translate-y-8 hover:rotate-0 hover:scale-105 active:scale-95"
              onClick={() => onSelectCard(card)}
              onContextMenu={(e) => {
                e.preventDefault();
                onInspectCard?.(card);
              }}
            >
              <CardView
                card={card}
                size="hand"
                isSelected={isSelected}
                canAct={isMyTurn}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
