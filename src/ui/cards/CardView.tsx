import React from 'react';
import { CardInstance } from '../../cards/types';
import { getCardDefinition } from '../../cards/cardRegistry';
import {
  Sword,
  Shield,
  Sparkles,
  Flame,
  Zap,
  Crosshair,
  HelpCircle,
  Heart,
  Lock,
  BookOpen,
  Skull,
  Trees,
  Wind,
  Crown,
} from 'lucide-react';

interface CardViewProps {
  card: CardInstance;
  size?: 'hand' | 'field' | 'active' | 'small' | 'large';
  isSelected?: boolean;
  isTargetable?: boolean;
  isAttacker?: boolean;
  canAct?: boolean;
  isUnplayableEvolution?: boolean;
  onClick?: () => void;
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
  Crown,
};

export const CardView: React.FC<CardViewProps> = ({
  card,
  size = 'field',
  isSelected = false,
  isTargetable = false,
  isAttacker = false,
  canAct = false,
  isUnplayableEvolution = false,
  onClick,
  className = '',
  style = {},
}) => {
  if (!card) return null;
  const def = getCardDefinition(card.definitionId);
  if (!def) return null;

  const IconComp = SYMBOL_MAP[def.artSymbol] || Sparkles;
  const theme = def.colorTheme;
  const isEvolutionCard = def.type === 'ATTACK' && def.evolution.evolvesFrom !== null;

  const sizeClasses = {
    small: 'card-size-small',
    field: 'card-size-field',
    active: 'card-size-active',
    hand: 'card-size-hand',
    large: 'w-56 h-80 text-sm',
  };

  const isDead = card.currentHp <= 0 && def.type === 'ATTACK';
  const hpPercent =
    def.type === 'ATTACK' && card.maxHp > 0
      ? Math.max(0, Math.min(100, (card.currentHp / card.maxHp) * 100))
      : 100;

  const isReadyToAttack =
    def.type === 'ATTACK' && card.attachedEnergy >= card.energyCost && card.energyCost > 0;

  return (
    <div
      onClick={onClick}
      style={style}
      className={`relative select-none rounded-lg overflow-hidden border-2 shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between p-1 bg-gradient-to-b ${theme.frameGradient} ${theme.borderClass} ${sizeClasses[size]} ${
        isSelected
          ? 'ring-2 ring-yellow-300 z-30 shadow-yellow-400/60 shadow-lg'
          : ''
      } ${
        isTargetable
          ? 'ring-2 ring-amber-400 animate-pulse z-20 shadow-amber-400/50 shadow-md'
          : ''
      } ${
        isAttacker ? 'ring-2 ring-red-500 shadow-red-500/60 shadow-lg z-20' : ''
      } ${
        canAct && !isUnplayableEvolution ? 'ring-1 ring-yellow-300/80' : ''
      } ${isUnplayableEvolution && !isSelected ? 'opacity-65 saturate-50' : ''} ${
        isDead ? 'opacity-40 grayscale' : ''
      } ${className}`}
    >
      {/* Inner Card Frame Highlight */}
      <div className="absolute inset-0.5 border border-white/20 rounded-md pointer-events-none" />

      {/* Top Row: Level Badge + Evolution Badge + Name + HP */}
      <div className="z-10 flex flex-col gap-0.2 min-w-0">
        <div className="flex items-center justify-between gap-0.5">
          <div className="flex items-center gap-0.5 shrink-0">
            <span
              className={`px-1 py-0.1 rounded text-[6.5px] leading-tight font-black shrink-0 ${theme.badgeBg} ${theme.badgeText}`}
            >
              {def.type === 'ATTACK' ? `Lv.${def.level}` : '魔法'}
            </span>
            {isEvolutionCard && (
              <span className="px-0.5 py-0.1 rounded bg-amber-950/90 border border-amber-400/70 text-amber-200 text-[5.5px] leading-tight font-black">
                進化
              </span>
            )}
          </div>
          {def.type === 'ATTACK' && (
            <div className="flex items-center gap-0.5 font-black text-white drop-shadow-xs text-[7.5px] leading-none">
              <span className="text-[6px] text-rose-200">HP</span>
              <span className={card.currentHp < card.maxHp ? 'text-amber-300' : 'text-white'}>
                {Math.max(0, card.currentHp)}
              </span>
            </div>
          )}
        </div>

        {/* Card Name */}
        <div className="font-black text-white tracking-tight truncate drop-shadow-xs leading-tight px-0.5 text-[7.5px]">
          {def.name}
        </div>

        {/* HP Bar for Attack Cards */}
        {def.type === 'ATTACK' && (
          <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden border border-white/20">
            <div
              className={`h-full transition-all duration-300 ${
                hpPercent > 50
                  ? 'bg-gradient-to-r from-emerald-400 to-green-300'
                  : hpPercent > 25
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                  : 'bg-gradient-to-r from-rose-500 to-red-400'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Center Artwork Box */}
      <div
        className={`relative my-0.5 w-full flex-1 min-h-0 rounded bg-gradient-to-br ${theme.artGradient} flex items-center justify-center overflow-hidden border border-black/40 shadow-inner`}
      >
        <div className="absolute inset-0 bg-radial from-white/25 to-transparent opacity-60" />
        <IconComp
          className={`${
            size === 'active' ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-4 h-4 sm:w-5 sm:h-5'
          } text-white drop-shadow-md z-10`}
        />

        {/* EX 2-Point Badge for Lv.5 */}
        {def.pointValue === 2 && (
          <div className="absolute top-0.5 left-0.5 bg-gradient-to-r from-yellow-300 to-amber-500 text-stone-950 font-black px-1 rounded text-[6.5px] leading-tight shadow z-20">
            EX・2pt
          </div>
        )}

        {/* Shield Badge */}
        {card.damageReductionNextTurn > 0 && (
          <div className="absolute top-0.5 right-0.5 bg-sky-600/95 text-white border border-sky-200 rounded px-0.5 text-[6.5px] font-black shadow z-20 flex items-center gap-0.5">
            <Shield className="w-2 h-2" /> -{card.damageReductionNextTurn}
          </div>
        )}

        {/* Attached Energy Orbs Indicator on Field / Active */}
        {def.type === 'ATTACK' && (card.zone === 'ACTIVE' || card.zone === 'BENCH') && (
          <div className="absolute bottom-0.5 left-0.5 right-0.5 flex items-center justify-between px-0.5 z-20">
            <div className="flex items-center gap-0.5 bg-black/80 border border-yellow-400/70 rounded-full px-1 py-0.1">
              <Zap className="w-2 h-2 text-yellow-300 fill-yellow-300" />
              <span
                className={`text-[7px] font-black leading-none ${
                  isReadyToAttack ? 'text-yellow-300' : 'text-stone-200'
                }`}
              >
                {card.attachedEnergy}/{card.energyCost}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Row: Attack Move / Cost / Damage / Retreat */}
      <div className="z-10 mt-auto">
        {def.type === 'ATTACK' ? (
          <div className="flex flex-col gap-0.2 bg-black/60 rounded px-1 py-0.5 border border-white/15">
            <div className="flex items-center justify-between gap-0.5 text-white">
              {/* Energy Cost Dots */}
              <div className="flex items-center -space-x-0.5 shrink-0">
                {Array.from({ length: def.energyCost }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full border flex items-center justify-center ${
                      i < card.attachedEnergy
                        ? 'bg-yellow-400 border-white text-stone-950'
                        : 'bg-stone-800 border-yellow-400/60 text-yellow-300'
                    }`}
                  >
                    <Zap className="w-1.5 h-1.5 fill-current" />
                  </div>
                ))}
              </div>

              {/* Attack Damage */}
              <div
                className={`font-black text-[8px] leading-none flex items-center gap-0.5 ${
                  card.currentAtk > def.attack ? 'text-emerald-300' : 'text-amber-300'
                }`}
              >
                <Sword className="w-2 h-2" />
                <span>{card.currentAtk}</span>
              </div>
            </div>

            {size !== 'small' && (
              <div className="flex items-center justify-between text-[6.5px] leading-tight text-stone-300 border-t border-white/10 pt-0.2">
                <span className="truncate max-w-[68%] text-white/90 font-bold">
                  {def.attackName}
                </span>
                <span className="shrink-0 text-stone-300">逃:{def.retreatCost}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center font-black py-0.5 rounded bg-black/60 text-white text-[7px] leading-tight truncate px-1 border border-white/15">
            ⚡0 魔法発動
          </div>
        )}
      </div>

      {/* Ready Indicator Dot */}
      {canAct && isReadyToAttack && (
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-300 rounded-full animate-ping pointer-events-none" />
      )}
    </div>
  );
};
