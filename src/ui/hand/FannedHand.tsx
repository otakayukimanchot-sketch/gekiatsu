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
      <div className="h-32 flex items-center justify-center text-xs text-stone-400 font-serif italic">
        手札がありません
      </div>
    );
  }

  const n = cards.length;
  // Calculate dynamic fan angles based on card count
  const maxAngle = Math.min(30, n * 5);
  const angleStep = n > 1 ? (maxAngle * 2) / (n - 1) : 0;
  const maxTranslateY = Math.min(16, n * 2.5);

  return (
    <div className="relative w-full h-36 flex items-end justify-center select-none overflow-visible pb-1">
      <div className="flex items-end justify-center -space-x-4 sm:-space-x-3 px-4 max-w-full">
        {cards.map((card, i) => {
          const isSelected = card.instanceId === selectedCardId;
          const centerIndex = (n - 1) / 2;
          const normalizedOffset = i - centerIndex;
          
          // Arc geometry
          const rotDeg = isSelected ? 0 : normalizedOffset * (angleStep || 0);
          const translateY = isSelected ? -24 : Math.abs(normalizedOffset) * (maxTranslateY / (centerIndex || 1));

          return (
            <div
              key={card.instanceId}
              style={{
                transform: `rotate(${rotDeg}deg) translateY(${translateY}px)`,
                zIndex: isSelected ? 50 : 10 + i,
                transition: 'all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
              className="origin-bottom cursor-pointer hover:z-40 hover:-translate-y-6 hover:rotate-0"
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
