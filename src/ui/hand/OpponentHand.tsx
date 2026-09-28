import React from 'react';
import { MaskedCardInstance } from '../../cards/types';
import { CardBack } from '../cards/CardBack';

interface OpponentHandProps {
  cards?: MaskedCardInstance[];
  count: number;
}

export const OpponentHand: React.FC<OpponentHandProps> = ({ cards, count }) => {
  const displayCount = cards ? cards.length : count;
  if (displayCount === 0) {
    return (
      <div className="h-14 flex items-center justify-center text-[10px] text-stone-500 italic">
        相手の手札なし
      </div>
    );
  }

  const items = cards && cards.length > 0 
    ? cards 
    : Array.from({ length: displayCount }, (_, i) => ({ instanceId: `opp_card_${i}`, zone: 'HAND' as const, isFaceDown: true as const }));

  const n = items.length;
  const maxAngle = Math.min(24, n * 4);
  const angleStep = n > 1 ? (maxAngle * 2) / (n - 1) : 0;

  return (
    <div className="relative w-full h-16 flex items-start justify-center select-none overflow-visible pt-0.5">
      <div className="flex items-start justify-center -space-x-4 sm:-space-x-3 px-2">
        {items.map((card, i) => {
          const centerIndex = (n - 1) / 2;
          const normalizedOffset = i - centerIndex;
          // Inverted arch for top player
          const rotDeg = -normalizedOffset * (angleStep || 0);
          const translateY = Math.abs(normalizedOffset) * 2;

          return (
            <div
              key={card.instanceId}
              style={{
                transform: `rotate(${rotDeg}deg) translateY(${translateY}px)`,
                zIndex: 10 + i,
                transition: 'all 0.2s ease-out'
              }}
              className="origin-top hover:z-30 hover:translate-y-2 cursor-default"
            >
              <CardBack size="sm" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
