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
    <div className="w-full select-none z-30">
      {/* Ticker Bar (Always shows latest log) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-stone-950/90 border-y border-stone-800 px-3 py-1.5 flex items-center justify-between cursor-pointer hover:bg-stone-900 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <ScrollText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] text-stone-300 truncate">
            {latestLog ? latestLog.message : '対戦開始'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-stone-400 shrink-0 ml-2">
          <span>履歴</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Expanded Logs Panel */}
      {isOpen && (
        <div className="max-h-48 overflow-y-auto bg-stone-900/95 border-b border-stone-800 p-2 space-y-1.5 text-[11px]">
          {logs.slice().reverse().map(log => {
            const isMe = log.actorPlayerId === myPlayerId;
            return (
              <div
                key={log.id}
                className={`p-1.5 rounded flex items-start gap-2 ${
                  isMe ? 'bg-amber-950/30 border-l-2 border-amber-500' : 'bg-stone-800/40 border-l-2 border-stone-600'
                }`}
              >
                <span className="text-stone-500 text-[10px] shrink-0">
                  T{log.turnNumber}
                </span>
                <span className={`font-bold shrink-0 ${isMe ? 'text-amber-300' : 'text-stone-300'}`}>
                  {log.actorPlayerName}:
                </span>
                <span className="text-stone-200 break-words flex-1">
                  {log.message}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
