import React from 'react';
import { CardBack } from '../cards/CardBack';

interface DeckStack3DProps {
  cardCount: number;
  label?: string;
  canDraw?: boolean;
  onDraw?: () => void;
  isOpponent?: boolean;
}

export const DeckStack3D: React.FC<DeckStack3DProps> = ({
  cardCount,
  label = '山札',
  canDraw = false,
  onDraw,
  isOpponent = false
}) => {
  // Visual layers count based on remaining deck (max 5 visible stacked edge lines)
  const layerCount = Math.min(5, Math.ceil(cardCount / 8));

  return (
    <div
      onClick={() => {
        if (canDraw && onDraw) onDraw();
      }}
      className={`relative flex flex-col items-center select-none group ${
        canDraw ? 'cursor-pointer animate-pulse' : 'cursor-default'
      }`}
    >
      <div className="relative">
        {/* Render stacked paper card side edges for real physical 3D card bundle look */}
        {Array.from({ length: layerCount }).map((_, idx) => (
          <div
            key={idx}
            className="absolute rounded-lg border border-amber-900/60 bg-amber-950/80 shadow"
            style={{
              width: '48px',
              height: '72px',
              left: `${idx * 1.5}px`,
              top: `${idx * 1.5}px`,
              zIndex: idx
            }}
          />
        ))}

        {/* Top card of the deck */}
        <div
          className={`relative z-10 transition-transform ${
            canDraw ? 'group-hover:-translate-y-1.5' : ''
          }`}
          style={{
            transform: `translate(${layerCount * 1.5}px, ${layerCount * 1.5}px)`
          }}
        >
          <CardBack size="sm" />

          {/* Remaining count badge */}
          <div className="absolute -bottom-1.5 -right-1.5 bg-amber-600 text-stone-950 border border-amber-300 rounded-full w-5 h-5 flex items-center justify-center font-black text-[9px] shadow-lg">
            {cardCount}
          </div>

          {canDraw && (
            <div className="absolute inset-0 bg-yellow-400/20 rounded-lg border-2 border-yellow-400 animate-ping pointer-events-none" />
          )}
        </div>
      </div>

      <div className="mt-2 text-[9px] font-bold text-amber-200/90 text-center tracking-wider">
        {label}
        {canDraw && <span className="block text-yellow-300 font-black">【ドロー】</span>}
      </div>
    </div>
  );
};
