import React from 'react';
import { CardInstance } from '../../cards/types';
import { getCardDefinition } from '../../cards/cardRegistry';
import { 
  Sword, Shield, Sparkles, Flame, Zap, Crosshair, 
  HelpCircle, Heart, Lock, BookOpen, Skull, Trees, Wind, Crown
} from 'lucide-react';

interface CardViewProps {
  card: CardInstance;
  isFaceDown?: boolean;
  size?: 'hand' | 'field' | 'small' | 'large';
  isSelected?: boolean;
  isTargetable?: boolean;
  isAttacker?: boolean;
  canAct?: boolean;
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const SYMBOL_MAP: Record<string, React.ElementType> = {
  Sword,
  Shield,
  ShieldAlert: Shield,
  Sparkles,
  Flame,
  Zap,
  Crosshair,
  HelpCircle,
  Heart,
  HeartHandshake: Heart,
  Lock,
  BookOpen,
  Skull,
  Trees,
  Wind,
  Crown
};

export const CardView: React.FC<CardViewProps> = ({
  card,
  isFaceDown = false,
  size = 'field',
  isSelected = false,
  isTargetable = false,
  isAttacker = false,
  canAct = false,
  onClick,
  className = '',
  style = {}
}) => {
  const def = getCardDefinition(card.definitionId);
  if (!def) return null;

  const IconComp = SYMBOL_MAP[def.artSymbol] || Sparkles;

  const sizeClasses = {
    small: 'w-14 h-20 text-[9px]',
    field: 'w-20 h-28 text-[10px]',
    hand: 'w-22 h-32 text-xs',
    large: 'w-60 h-84 text-sm'
  };

  const typeColorMap = {
    ATTACK: 'from-amber-700/80 to-amber-950/90 border-amber-500/70',
    SPELL: 'from-blue-700/80 to-indigo-950/90 border-blue-400/70',
    ENVIRONMENT: 'from-emerald-700/80 to-teal-950/90 border-emerald-400/70'
  };

  const isDead = card.currentHp <= 0 && def.type === 'ATTACK';

  return (
    <div
      onClick={onClick}
      style={style}
      className={`relative select-none rounded-lg overflow-hidden border-2 shadow-lg transition-all duration-150 cursor-pointer flex flex-col justify-between p-1 bg-gradient-to-b ${typeColorMap[def.type]} ${sizeClasses[size]} ${
        isSelected ? 'ring-3 ring-yellow-400 -translate-y-2 scale-105 z-20 shadow-yellow-500/50 shadow-xl' : ''
      } ${
        isTargetable ? 'ring-3 ring-rose-500 animate-pulse hover:scale-105 z-10' : ''
      } ${
        isAttacker ? 'ring-3 ring-red-500 shadow-red-500/60 shadow-xl scale-105 z-20' : ''
      } ${
        canAct ? 'border-amber-300 ring-2 ring-amber-400/60' : ''
      } ${isDead ? 'opacity-40 grayscale' : ''} ${className}`}
    >
      {/* Physical Card Border Inner Highlight */}
      <div className="absolute inset-0.5 border border-white/20 rounded-md pointer-events-none" />

      {/* Card Header: Cost + Name */}
      <div className="flex items-center justify-between z-10 gap-0.5">
        <div className="flex items-center gap-1 min-w-0">
          <span className="font-bold text-white tracking-tight truncate drop-shadow-sm font-sans">
            {def.name}
          </span>
        </div>
        {/* Cost orb */}
        <div className="w-4 h-4 rounded-full bg-blue-600/90 border border-blue-300 flex items-center justify-center text-[9px] font-black text-white shrink-0 shadow">
          {def.cost}
        </div>
      </div>

      {/* Artwork Box */}
      <div className={`relative my-0.5 w-full flex-1 rounded bg-gradient-to-br ${def.artGradient} flex items-center justify-center overflow-hidden border border-black/40 shadow-inner`}>
        {/* Background glow */}
        <div className="absolute inset-0 bg-radial from-white/20 to-transparent opacity-60" />
        <IconComp className="w-6 h-6 text-white drop-shadow-md z-10" />

        {/* Badges on artwork */}
        {card.isTaunt && (
          <div className="absolute top-0.5 left-0.5 bg-stone-800/90 text-amber-300 border border-amber-500/60 rounded px-0.5 text-[8px] flex items-center gap-0.5 font-bold shadow z-20">
            <Shield className="w-2.5 h-2.5" /> 守護
          </div>
        )}

        {card.hasCharge && (
          <div className="absolute top-0.5 right-0.5 bg-emerald-800/90 text-emerald-200 border border-emerald-400/60 rounded px-0.5 text-[8px] flex items-center gap-0.5 font-bold shadow z-20">
            <Zap className="w-2.5 h-2.5" /> 突撃
          </div>
        )}

        {/* Evolution badge */}
        {def.id.startsWith('evo_') && (
          <div className="absolute bottom-0.5 left-0.5 bg-amber-500 text-stone-950 font-black px-1 rounded text-[7px] shadow z-20">
            EVO
          </div>
        )}

        {/* Attachment count indicator */}
        {card.attachedCards && card.attachedCards.length > 0 && (
          <div className="absolute bottom-0.5 right-0.5 bg-indigo-900/90 text-indigo-200 border border-indigo-400 rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold shadow z-20">
            +{card.attachedCards.length}
          </div>
        )}
      </div>

      {/* Card Footer: Type & Stats */}
      <div className="z-10 mt-auto">
        {def.type === 'ATTACK' ? (
          <div className="flex items-center justify-between font-black text-white px-0.5">
            {/* ATK */}
            <div className={`flex items-center gap-0.5 px-1 py-0.2 rounded bg-amber-950/80 border border-amber-600/70 text-amber-300 ${
              card.currentAtk > (def.baseAtk || 0) ? 'text-green-300 font-extrabold' : ''
            }`}>
              <Sword className="w-2.5 h-2.5" />
              <span>{card.currentAtk}</span>
            </div>

            {/* HP */}
            <div className={`flex items-center gap-0.5 px-1 py-0.2 rounded bg-rose-950/80 border border-rose-600/70 text-rose-300 ${
              card.currentHp < card.maxHp ? 'text-red-400 font-extrabold' : ''
            }`}>
              <Shield className="w-2.5 h-2.5" />
              <span>{Math.max(0, card.currentHp)}</span>
            </div>
          </div>
        ) : (
          <div className="text-center font-bold py-0.2 rounded bg-black/40 text-stone-200 text-[8px] truncate px-1">
            {def.type === 'SPELL' ? (def.subType === 'ATTACHMENT' ? '付着魔法' : def.subType === 'EVOLUTION' ? '進化魔法' : '魔法') : '環境'}
          </div>
        )}
      </div>

      {/* Ready to attack glow badge */}
      {canAct && def.type === 'ATTACK' && (
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping pointer-events-none" />
      )}
    </div>
  );
};
