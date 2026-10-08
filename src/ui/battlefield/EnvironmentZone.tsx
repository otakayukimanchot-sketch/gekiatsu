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
  onPlaceEnvironment,
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
      className={`relative card-size-small shrink-0 rounded-lg border-2 flex flex-col items-center justify-center p-0.5 select-none transition-all ${
        environment
          ? 'border-emerald-500/80 bg-emerald-950/40 shadow-emerald-500/30 shadow-md cursor-pointer hover:scale-105'
          : canPlace
          ? 'border-dashed border-yellow-400 bg-yellow-950/30 animate-pulse cursor-pointer'
          : 'border-dashed border-stone-700/60 bg-stone-900/30'
      }`}
    >
      {environment ? (
        <div className="w-full h-full flex flex-col items-center justify-between overflow-hidden">
          <div className="w-full h-full">
            <CardView card={environment.cardInstance} size="small" className="w-full h-full" />
          </div>
          <span className="sr-only">{def?.name}</span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-stone-500 text-center p-0.5">
          <Globe className="w-3.5 h-3.5 mb-0.5 opacity-60" />
          <span className="text-[7px] font-bold text-stone-400 leading-tight">環境</span>
          {canPlace && (
            <span className="mt-0.5 text-[6.5px] font-bold text-yellow-300 leading-none">
              展開可
            </span>
          )}
        </div>
      )}
    </div>
  );
};
