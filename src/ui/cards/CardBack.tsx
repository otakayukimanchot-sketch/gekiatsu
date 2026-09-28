import React from 'react';

interface CardBackProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CardBack: React.FC<CardBackProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-12 h-18 text-[9px]',
    md: 'w-18 h-26 text-xs',
    lg: 'w-24 h-36 text-sm'
  };

  return (
    <div
      className={`relative rounded-lg overflow-hidden border-2 border-amber-600/80 bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-950 shadow-md flex items-center justify-center select-none cursor-pointer transition-transform ${sizeClasses[size]} ${className}`}
      style={{
        boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 0 12px rgba(217, 119, 6, 0.3)'
      }}
    >
      {/* Decorative frame */}
      <div className="absolute inset-1 border border-amber-500/30 rounded-md pointer-events-none" />
      <div className="absolute inset-2 border border-amber-400/20 rounded pointer-events-none" />
      
      {/* Center card seal */}
      <div className="w-8 h-8 rounded-full border border-amber-400/60 bg-amber-900/40 flex items-center justify-center shadow-inner">
        <div className="w-4 h-4 rotate-45 border border-amber-300/80 bg-gradient-to-tr from-amber-600 to-yellow-300 shadow-sm" />
      </div>

      {/* Card back filigree accents */}
      <div className="absolute top-1 left-1 text-[7px] text-amber-500/50 font-serif">❖</div>
      <div className="absolute top-1 right-1 text-[7px] text-amber-500/50 font-serif">❖</div>
      <div className="absolute bottom-1 left-1 text-[7px] text-amber-500/50 font-serif">❖</div>
      <div className="absolute bottom-1 right-1 text-[7px] text-amber-500/50 font-serif">❖</div>
    </div>
  );
};
