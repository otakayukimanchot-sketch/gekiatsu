import React from 'react';
import { CardInstance } from '../../cards/types';
import { CardView } from '../cards/CardView';
import { Zap, ArrowUpCircle, Shield } from 'lucide-react';

interface FieldSlotProps {
  card: CardInstance | null;
  slotIndex?: number;
  slotRole?: 'ACTIVE' | 'BENCH';
  isFriendly: boolean;
  isSelected?: boolean;
  isTargetable?: boolean;
  targetBadgeText?: string;
  isAttacker?: boolean;
  canAct?: boolean;
  canPlaceCard?: boolean;
  damagePopup?: number | null;
  onClick?: () => void;
  onInspectCard?: (card: CardInstance) => void;
}

export const FieldSlot: React.FC<FieldSlotProps> = ({
  card,
  slotIndex = 0,
  slotRole = 'BENCH',
  isFriendly,
  isSelected = false,
  isTargetable = false,
  targetBadgeText,
  isAttacker = false,
  canAct = false,
  canPlaceCard = false,
  damagePopup = null,
  onClick,
  onInspectCard,
}) => {
  const isActiveSlot = slotRole === 'ACTIVE';

  const sizeClass = isActiveSlot ? 'card-size-active' : 'card-size-field';

  return (
    <div
      onClick={onClick}
      className={`relative ${sizeClass} shrink-0 rounded-lg flex items-center justify-center select-none transition-all duration-150 ${
        card
          ? 'cursor-pointer'
          : canPlaceCard
          ? 'border-2 border-dashed border-amber-400 bg-amber-950/35 hover:bg-amber-900/50 cursor-pointer animate-pulse'
          : isActiveSlot
          ? 'border-2 border-amber-500/40 bg-stone-900/50'
          : 'border-2 border-stone-800/80 bg-stone-900/35'
      }`}
      style={{
        boxShadow: card
          ? isActiveSlot
            ? '0 8px 18px rgba(0,0,0,0.7)'
            : '0 4px 10px rgba(0,0,0,0.55)'
          : 'inset 0 2px 6px rgba(0,0,0,0.5)',
      }}
    >
      {card ? (
        <div
          className="relative w-full h-full flex items-center justify-center"
          onContextMenu={(e) => {
            e.preventDefault();
            onInspectCard?.(card);
          }}
        >
          <CardView
            card={card}
            size={isActiveSlot ? 'active' : 'field'}
            isSelected={isSelected}
            isTargetable={isTargetable}
            isAttacker={isAttacker}
            canAct={canAct}
            className="w-full h-full"
          />

          {/* Target Action Overlay Badge */}
          {isTargetable && targetBadgeText && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 font-black text-[8px] px-1.5 py-0.2 rounded-full shadow-lg border border-white whitespace-nowrap flex items-center gap-0.5 animate-bounce">
              {targetBadgeText.includes('エネ') ? (
                <Zap className="w-2 h-2 fill-current" />
              ) : (
                <ArrowUpCircle className="w-2 h-2" />
              )}
              <span>{targetBadgeText}</span>
            </div>
          )}

          {/* Damage Popup Animation */}
          {damagePopup !== null && damagePopup > 0 && (
            <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none animate-bounce">
              <div className="bg-red-600 text-white font-black text-sm px-2 py-0.5 rounded-full border-2 border-yellow-300 shadow-2xl">
                -{damagePopup}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-1 pointer-events-none flex flex-col items-center justify-center gap-0.5">
          {canPlaceCard ? (
            <span className="text-[9px] font-black text-amber-300">配置</span>
          ) : isActiveSlot ? (
            <>
              <Shield className="w-3.5 h-3.5 text-amber-500/40" />
              <span className="text-[8px] font-black text-stone-500 leading-tight">
                {isFriendly ? '自分バトル場' : '相手バトル場'}
              </span>
            </>
          ) : (
            <span className="text-[7.5px] font-bold text-stone-600">
              ベンチ {slotIndex + 1}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
