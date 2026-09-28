import React from 'react';
import { ActiveEnvironment } from '../../game/types';
import { CardView } from '../cards/CardView';
import { Globe } from 'lucide-react';
import { getCardDefinition } from '../../cards/cardRegistry';

interface EnvironmentZoneProps {
  environment: ActiveEnvironment | null;
  onInspect?: () => void;
  canPlace?: boolean;
  onPlaceEnvironment?: () => void;
}

export const EnvironmentZone: React.FC<EnvironmentZoneProps> = ({
  environment,
  onInspect,
  canPlace = false,
  onPlaceEnvironment
}) => {
  const def = environment ? getCardDefinition(environment.cardInstance.definitionId) : null;

  return (
    <div
      onClick={() => {
        if (canPlace && onPlaceEnvironment) {
          onPlaceEnvironment();
        } else if (environment && onInspect) {
          onInspect();
        }
      }}
      className={`relative w-20 h-28 rounded-xl border-2 flex flex-col items-center justify-center p-1 select-none transition-all ${
        environment
          ? 'border-emerald-500/80 bg-emerald-950/40 shadow-emerald-500/30 shadow-lg cursor-pointer hover:scale-105'
          : canPlace
          ? 'border-dashed border-yellow-400 bg-yellow-950/30 animate-pulse cursor-pointer'
          : 'border-dashed border-stone-700/60 bg-stone-900/30'
      }`}
    >
      {environment ? (
        <div className="w-full h-full flex flex-col items-center justify-between">
          <div className="text-[8px] font-bold text-emerald-400 tracking-wider">
            【環境カード】
          </div>
          <div className="scale-90 origin-center">
            <CardView card={environment.cardInstance} size="small" />
          </div>
          <div className="text-[8px] font-bold text-stone-200 truncate w-full text-center">
            {def?.name}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-stone-500 text-center p-1">
          <Globe className="w-5 h-5 mb-1 opacity-50" />
          <span className="text-[9px] font-bold text-stone-400">環境ゾーン</span>
          <span className="text-[7px] text-stone-500">1枚のみ有効</span>
          {canPlace && (
            <span className="mt-1 text-[8px] font-bold text-yellow-300">配置可能</span>
          )}
        </div>
      )}
    </div>
  );
};
