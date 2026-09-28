import React from 'react';
import { CardInstance } from '../../cards/types';
import { CardView } from '../cards/CardView';
import { Layers } from 'lucide-react';

interface FieldSlotProps {
  card: CardInstance | null;
  slotIndex: number;
  isFriendly: boolean;
  isSelected?: boolean;
  isTargetable?: boolean;
  isAttacker?: boolean;
  canAct?: boolean;
  canPlaceCard?: boolean;
  onClick?: () => void;
  onInspectCard?: (card: CardInstance) => void;
}

export const FieldSlot: React.FC<FieldSlotProps> = ({
  card,
  slotIndex,
  isFriendly,
  isSelected = false,
  isTargetable = false,
  isAttacker = false,
  canAct = false,
  canPlaceCard = false,
  onClick,
  onInspectCard
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative w-18 h-26 sm:w-20 sm:h-28 rounded-xl flex items-center justify-center select-none transition-all duration-200 ${
        card
          ? 'cursor-pointer'
          : canPlaceCard
          ? 'border-2 border-dashed border-amber-400/80 bg-amber-950/30 hover:bg-amber-900/40 cursor-pointer animate-pulse'
          : 'border-2 border-stone-800/80 bg-stone-900/30'
      }`}
      style={{
        boxShadow: card ? '0 6px 14px rgba(0,0,0,0.6)' : 'inset 0 2px 6px rgba(0,0,0,0.5)'
      }}
    >
      {card ? (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Attached stacked cards rendered underneath with physical offset */}
          {card.attachedCards && card.attachedCards.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {card.attachedCards.map((att, idx) => (
                <div
                  key={idx}
                  className="absolute rounded-lg border border-indigo-400/60 bg-gradient-to-r from-indigo-900 to-indigo-950 shadow-md"
                  style={{
                    width: '100%',
                    height: '100%',
                    top: `${(idx + 1) * -4}px`,
                    left: `${(idx + 1) * 3}px`,
                    zIndex: idx
                  }}
                >
                  <div className="absolute top-0.5 right-1 flex items-center gap-0.5 text-[7px] text-indigo-300 font-bold">
                    <Layers className="w-2 h-2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Main Host Card */}
          <div
            className="relative z-10 w-full h-full"
            onContextMenu={(e) => {
              e.preventDefault();
              onInspectCard?.(card);
            }}
          >
            <CardView
              card={card}
              size="field"
              isSelected={isSelected}
              isTargetable={isTargetable}
              isAttacker={isAttacker}
              canAct={canAct}
              className="w-full h-full"
            />
          </div>
        </div>
      ) : (
        <div className="text-center p-1 pointer-events-none">
          {canPlaceCard ? (
            <span className="text-[10px] font-bold text-amber-300">配置</span>
          ) : (
            <span className="text-[9px] font-sans font-bold text-stone-600/80">
              {slotIndex + 1}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
