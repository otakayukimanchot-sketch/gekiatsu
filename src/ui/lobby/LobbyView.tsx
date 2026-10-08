import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  Layers,
  Sparkles,
  Wifi,
  WifiOff,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';
import { RuleModal } from './RuleModal';
import { DeckInspectModal } from './DeckInspectModal';
import { ALL_CARD_DEFINITIONS } from '../../cards/cardRegistry';

interface LobbyViewProps {
  playerName: string;
  playerAvatar: string;
  onUpdatePlayer: (name: string, avatar: string) => void;
  onQuickMatch: () => void;
  onCreateFriendRoom: () => void;
  onJoinFriendRoom: (code: string) => void;
  onSoloBotMatch: () => void;
  onCancelMatch: () => void;
  isMatching: boolean;
  matchingMessage?: string;
  createdInviteCode?: string | null;
  isConnected: boolean;
  errorMessage?: string | null;
}

const AVATARS = [
  { id: 'smile', icon: '😎', label: '勝負師' },
  { id: 'rocket', icon: '🚀', label: 'スピード' },
  { id: 'ghost', icon: '👻', label: 'トリック' },
  { id: 'zap', icon: '⚡', label: '電光石火' },
  { id: 'crown', icon: '👑', label: '王者' },
];

export const LobbyView: React.FC<LobbyViewProps> = ({
  playerName,
  playerAvatar,
  onUpdatePlayer,
  onQuickMatch,
  onCreateFriendRoom,
  onJoinFriendRoom,
  onSoloBotMatch,
  onCancelMatch,
  isMatching,
  matchingMessage,
  createdInviteCode,
  isConnected,
  errorMessage,
}) => {
  const [nameInput, setNameInput] = useState(playerName);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [showDeck, setShowDeck] = useState(false);
  const [copied, setCopied] = useState(false);
  const [friendModeTab, setFriendModeTab] = useState<'create' | 'join'>('create');

  const handleNameBlur = () => {
    const trimmed = nameInput.trim() || 'デュエリスト';
    setNameInput(trimmed);
    onUpdatePlayer(trimmed, playerAvatar);
  };

  const handleCopyCode = () => {
    if (createdInviteCode) {
      navigator.clipboard.writeText(createdInviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-slate-950 text-stone-100 flex flex-col justify-between overflow-x-hidden font-sans select-none">
      {/* Background Ambience */}
      <div
        className="absolute inset-0 pointer-events-none opacity-90"
        style={{
          background:
            'radial-gradient(ellipse at 50% 25%, #1e293b 0%, #0f172a 60%, #020617 100%)',
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 max-w-md mx-auto w-full px-4 py-6 flex flex-col gap-4 flex-1 justify-center">
        {/* Game Title & Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-1 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>3ポイント先取・ハイテンポ1対1カードバトル</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 tracking-wider drop-shadow-md">
            ホンモノカードバトル
          </h1>
          <p className="text-slate-400 text-xs">
            エネルギーを付けてわざを放て！シンプル＆戦略的ポケポケ型バトル
          </p>
        </div>

        {/* Connection Status indicator */}
        <div className="flex items-center justify-center gap-2 text-xs">
          {isConnected ? (
            <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
              <Wifi className="w-3 h-3" /> サーバー接続中
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-400 font-bold bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-800 animate-pulse">
              <WifiOff className="w-3 h-3" /> 接続再試行中...
            </span>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-xs text-center font-bold">
            {errorMessage}
          </div>
        )}

        {/* Player Profile Setup Box */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
            <span>プレイヤー設定</span>
            <span className="text-[10px] text-slate-400 font-normal">アイコン＆名前</span>
          </div>

          <div className="flex items-center gap-2">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                onClick={() => onUpdatePlayer(nameInput, av.id)}
                className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                  playerAvatar === av.id
                    ? 'bg-amber-500 border-2 border-yellow-200 scale-105 shadow-md'
                    : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                {av.icon}
              </button>
            ))}
          </div>

          <div>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameBlur}
              maxLength={12}
              placeholder="プレイヤー名"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-stone-100 font-bold text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* MATCHMAKING / ROOM STATE */}
        {isMatching ? (
          <div className="p-6 rounded-2xl bg-slate-900/95 border-2 border-amber-500 shadow-2xl text-center space-y-4 animate-pulse">
            <div className="w-12 h-12 rounded-full border-3 border-amber-400 border-t-transparent animate-spin mx-auto" />
            <h3 className="font-bold text-base text-amber-200">
              {matchingMessage || '対戦相手を検索中…'}
            </h3>
            <p className="text-xs text-slate-400">他のプレイヤーの接続を待機しています。</p>
            <button
              onClick={onCancelMatch}
              className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-stone-300 font-bold text-xs cursor-pointer"
            >
              マッチング中止
            </button>
          </div>
        ) : createdInviteCode ? (
          <div className="p-6 rounded-2xl bg-slate-900/95 border-2 border-amber-500 shadow-2xl text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
              <Users className="w-3.5 h-3.5" /> フレンド待機中
            </div>
            <p className="text-xs text-stone-300">以下の合言葉を対戦相手に伝えてください：</p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-3xl font-black text-amber-400 tracking-widest px-4 py-2 rounded-xl bg-slate-950 border border-amber-500/50">
                {createdInviteCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow flex items-center justify-center cursor-pointer"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="text-[11px] text-slate-400">
              相手が合言葉を入力すると自動的に対戦が開始されます。
            </div>
            <button
              onClick={onCancelMatch}
              className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-stone-300 font-bold text-xs cursor-pointer"
            >
              待機を中止する
            </button>
          </div>
        ) : (
          /* BATTLE MODE BUTTONS */
          <div className="space-y-3">
            {/* Solo CPU Battle (Highlighted for instant play & testing) */}
            <button
              disabled={!isConnected}
              onClick={onSoloBotMatch}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-stone-950 font-black text-base shadow-xl flex items-center justify-between hover:brightness-110 active:scale-98 transition-all cursor-pointer border border-yellow-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-950/20 flex items-center justify-center text-xl">
                  🤖
                </div>
                <div className="text-left">
                  <div className="text-stone-950 font-black">CPU対戦 (1人ですぐ遊ぶ)</div>
                  <div className="text-[11px] font-bold text-stone-900/80">
                    コンピュータと1対1ポケポケ型バトル！
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Quick Match */}
            <button
              disabled={!isConnected}
              onClick={onQuickMatch}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-700 text-white font-black text-sm shadow-lg flex items-center justify-between hover:brightness-110 active:scale-98 transition-all cursor-pointer border border-sky-400/60"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center text-lg">
                  ⚔️
                </div>
                <div className="text-left">
                  <div className="font-black">ランダムオンライン対戦</div>
                  <div className="text-[10px] text-sky-100/80">
                    全国のプレイヤーとリアルタイム1対1バトル
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Friend Match */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-2.5">
              <div className="flex border-b border-slate-800 pb-1.5 text-xs font-bold gap-3">
                <button
                  onClick={() => setFriendModeTab('create')}
                  className={`pb-1 cursor-pointer ${
                    friendModeTab === 'create'
                      ? 'text-amber-400 border-b-2 border-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  合言葉で部屋を作る
                </button>
                <button
                  onClick={() => setFriendModeTab('join')}
                  className={`pb-1 cursor-pointer ${
                    friendModeTab === 'join'
                      ? 'text-amber-400 border-b-2 border-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  合言葉で部屋に入る
                </button>
              </div>

              {friendModeTab === 'create' ? (
                <button
                  disabled={!isConnected}
                  onClick={onCreateFriendRoom}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                >
                  <Users className="w-4 h-4" /> 部屋を作成して合言葉を発行
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="合言葉を入力"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-stone-100 font-mono font-bold text-sm text-center uppercase tracking-widest focus:outline-none focus:border-amber-500"
                  />
                  <button
                    disabled={!isConnected || !joinCodeInput.trim()}
                    onClick={() => onJoinFriendRoom(joinCodeInput)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-black text-xs cursor-pointer"
                  >
                    参加
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sub Navigation: Card List & Rule book */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={() => setShowRules(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-stone-200 text-xs font-bold border border-slate-800 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>ルール・レベル表</span>
          </button>
          <button
            onClick={() => setShowDeck(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-stone-200 text-xs font-bold border border-slate-800 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>全カード図鑑＆デッキ (全{ALL_CARD_DEFINITIONS.length}種)</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-3 text-center text-[10px] text-slate-600">
        ホンモノカードバトル © 2026 Honmono Card Battle Pocket
      </div>

      {/* Modals */}
      {showRules && <RuleModal onClose={() => setShowRules(false)} />}
      {showDeck && <DeckInspectModal onClose={() => setShowDeck(false)} />}
    </div>
  );
};
