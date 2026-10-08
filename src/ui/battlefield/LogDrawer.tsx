import React, { useState } from 'react';
import { GameEventLog } from '../../game/types';
import { ScrollText, ChevronDown, ChevronUp } from 'lucide-react';

interface LogDrawerProps {
  logs: GameEventLog[];
  myPlayerId: string;
}

export const LogDrawer: React.FC<LogDrawerProps> = ({ logs, myPlayerId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;

  return (
    <div className="relative w-full select-none z-30">
      {/* Expanded Logs Floating Panel (Does NOT push layout or hand down) */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-1 max-h-44 overflow-y-auto rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl p-2 space-y-1 text-[10px] z-50 backdrop-blur-md">
          {logs
            .slice()
            .reverse()
            .map((log) => {
              const isMe = log.actorPlayerId === myPlayerId;
              return (
                <div
                  key={log.id}
                  className={`p-1 rounded flex items-start gap-1.5 ${
                    isMe
                      ? 'bg-amber-950/35 border-l-2 border-amber-500'
                      : 'bg-slate-800/50 border-l-2 border-slate-600'
                  }`}
                >
                  <span className="text-slate-500 text-[9px] shrink-0">T{log.turnNumber}</span>
                  <span
                    className={`font-bold shrink-0 ${
                      isMe ? 'text-amber-300' : 'text-slate-300'
                    }`}
                  >
                    {log.actorPlayerName}:
                  </span>
                  <span className="text-stone-200 break-words flex-1">{log.message}</span>
                </div>
              );
            })}
        </div>
      )}

      {/* Compact Single-Line Ticker Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-950/90 border border-slate-800 rounded-lg px-2.5 py-0.5 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <ScrollText className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="text-[10px] text-stone-300 truncate">
            {latestLog ? latestLog.message : 'バトル開始'}
          </span>
        </div>
        <div className="flex items-center gap-0.5 text-[9px] text-slate-400 shrink-0 ml-2">
          <span>履歴</span>
          {isOpen ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronUp className="w-3 h-3" />
          )}
        </div>
      </div>
    </div>
  );
};
