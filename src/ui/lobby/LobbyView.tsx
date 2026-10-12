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
  ArrowLeft,
  Eye,
  RefreshCw,
  Swords,
  Bot,
  KeyRound,
  Trophy,
  Flame,
  Shield,
} from 'lucide-react';
import { RuleModal } from './RuleModal';
import { DeckInspectModal } from './DeckInspectModal';
import { ALL_CARD_DEFINITIONS } from '../../cards/cardRegistry';
import { BattleFormatOption, WinScoreOption } from '../../game/types';
import { LiveMatchSummary } from '../../online/types';

interface LobbyViewProps {
  playerName: string;
  playerAvatar: string;
  winScore: WinScoreOption;
  battleFormat: BattleFormatOption;
  onChangeWinScore: (winScore: WinScoreOption) => void;
  onChangeBattleFormat: (format: BattleFormatOption) => void;
  onUpdatePlayer: (name: string, avatar: string) => void;
  onQuickMatch: (overrideFormat?: BattleFormatOption) => void;
  onCreateFriendRoom: () => void;
  onJoinFriendRoom: (code: string) => void;
  onSoloBotMatch: (overrideFormat?: BattleFormatOption) => void;
  onCancelMatch: () => void;
  onRequestLiveMatches?: () => void;
  onSpectateMatch?: (targetIdOrCode: string) => void;
  liveMatches?: LiveMatchSummary[];
  isMatching: boolean;
  matchingMessage?: string;
  createdInviteCode?: string | null;
  isConnected: boolean;
  errorMessage?: string | null;
}

type SelectedPlayMode = 'cpu' | 'online' | 'room' | 'spectate' | null;

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
  winScore,
  battleFormat,
  onChangeWinScore,
  onChangeBattleFormat,
  onUpdatePlayer,
  onQuickMatch,
  onCreateFriendRoom,
  onJoinFriendRoom,
  onSoloBotMatch,
  onCancelMatch,
  onRequestLiveMatches,
  onSpectateMatch,
  liveMatches = [],
  isMatching,
  matchingMessage,
  createdInviteCode,
  isConnected,
  errorMessage,
}) => {
  const [nameInput, setNameInput] = useState(playerName);
  const [selectedMode, setSelectedMode] = useState<SelectedPlayMode>(null);
  const [roomActionTab, setRoomActionTab] = useState<'create' | 'join'>('create');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [spectateCodeInput, setSpectateCodeInput] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [showDeck, setShowDeck] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleSelectMode = (mode: SelectedPlayMode) => {
    setSelectedMode(mode);
    if (mode === 'spectate') {
      onRequestLiveMatches?.();
    }
  };

  const renderVictoryAndFormatSelectors = (subtitleText: string) => (
    <div className="space-y-4">
      {/* STEP 2A: Victory Condition Selector */}
      <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>STEP 1: 勝利条件を選択 (VICTORY CONDITION)</span>
          </div>
          <span className="text-[10px] text-slate-400">目標ポイント先取で勝利</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([3, 5, 7] as WinScoreOption[]).map((pts) => {
            const active = winScore === pts;
            return (
              <button
                key={pts}
                type="button"
                onClick={() => onChangeWinScore(pts)}
                className={`py-2.5 px-2 rounded-xl font-black text-xs border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  active
                    ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600 text-stone-950 border-yellow-200 shadow-[0_0_20px_rgba(251,191,36,0.35)] scale-[1.02]'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span className="text-sm font-black tracking-tight">{pts}点先取</span>
                <span
                  className={`text-[9px] font-bold ${
                    active ? 'text-stone-900' : 'text-slate-500'
                  }`}
                >
                  {pts === 3 ? 'スピード決着' : pts === 5 ? 'スタンダード' : 'ロング激闘'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2B: Deck Format Selector */}
      <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-sky-300">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>STEP 2: デッキ形式を選択 (DECK FORMAT)</span>
          </div>
          <span className="text-[10px] text-slate-400">{subtitleText}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onChangeBattleFormat('standard')}
            className={`p-3 rounded-xl font-black text-left border transition-all cursor-pointer flex items-start gap-2.5 ${
              battleFormat === 'standard'
                ? 'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white border-sky-200 shadow-[0_0_22px_rgba(56,189,248,0.35)] scale-[1.01]'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-black/25 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-5 h-5 text-sky-200" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-black flex items-center justify-between">
                <span>標準デッキ対戦</span>
                {battleFormat === 'standard' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/20 text-white">
                    選択中
                  </span>
                )}
              </div>
              <div className="text-[10px] opacity-90 font-bold mt-0.5 leading-snug">
                20枚バランス構築・初期手札5枚（魔法2＋攻撃3）
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChangeBattleFormat('allstar')}
            className={`p-3 rounded-xl font-black text-left border transition-all cursor-pointer flex items-start gap-2.5 ${
              battleFormat === 'allstar'
                ? 'bg-gradient-to-br from-rose-500 via-fuchsia-600 to-amber-500 text-white border-yellow-200 shadow-[0_0_22px_rgba(244,63,94,0.4)] scale-[1.01]'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-black/25 flex items-center justify-center shrink-0 mt-0.5">
              <Flame className="w-5 h-5 text-amber-200" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-black flex items-center justify-between">
                <span>全員参加大乱闘</span>
                {battleFormat === 'allstar' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/30 text-yellow-200">
                    選択中
                  </span>
                )}
              </div>
              <div className="text-[10px] opacity-95 font-bold mt-0.5 leading-snug">
                全{ALL_CARD_DEFINITIONS.length}種総出・初期手札10枚（魔法3＋攻撃7）
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-[100dvh] w-full bg-slate-950 text-stone-100 flex flex-col justify-between overflow-x-hidden font-sans select-none">
      {/* Background Ambience */}
      <div
        className="absolute inset-0 pointer-events-none opacity-95"
        style={{
          background:
            'radial-gradient(ellipse at 50% 20%, #1e293b 0%, #0f172a 55%, #020617 100%)',
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 max-w-md mx-auto w-full px-4 py-5 flex flex-col gap-4 flex-1 justify-center">
        {/* Game Title & Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>ハイテンポ1対1カードバトル</span>
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

        {/* Compact Player Profile Box */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-2.5">
          <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
            <span>プレイヤープロフィール</span>
            <span className="text-[10px] text-slate-400 font-normal">アイコン＆名前</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => onUpdatePlayer(nameInput, av.id)}
                  className={`w-9 h-9 rounded-xl text-base flex items-center justify-center transition-all cursor-pointer ${
                    playerAvatar === av.id
                      ? 'bg-amber-500 border-2 border-yellow-200 scale-105 shadow-md'
                      : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {av.icon}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameBlur}
              maxLength={12}
              placeholder="プレイヤー名"
              className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-stone-100 font-bold text-xs sm:text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* MATCHMAKING / ROOM WAITING STATE */}
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
              <Users className="w-3.5 h-3.5" /> ルーム待機中（
              {battleFormat === 'allstar' ? '全員参加大乱闘' : '標準デッキ'} / {winScore}点先取）
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
        ) : selectedMode === null ? (
          /* =================================================================
           * STEP 1: CHOOSE PLAY MODE ("CPU戦", "オンライン対戦", "ルームマッチ", "観戦")
           * ================================================================= */
          <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-black text-amber-300 tracking-wide">
                対戦モードを選択 (SELECT MODE)
              </span>
              <span className="text-[10px] text-slate-400">4つのモードから選択</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* 1. CPU Match */}
              <button
                type="button"
                disabled={!isConnected}
                onClick={() => handleSelectMode('cpu')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-stone-950 font-black text-left shadow-lg flex items-center justify-between hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer border border-yellow-200 disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-stone-950/20 flex items-center justify-center shrink-0">
                    <Bot className="w-6 h-6 text-stone-950" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-black tracking-tight">
                      CPU戦 (CPU MATCH)
                    </div>
                    <div className="text-[11px] font-bold text-stone-900/85">
                      1人でじっくり練習！勝利条件とデッキ形式を選んで即バトル
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </button>

              {/* 2. Online Match */}
              <button
                type="button"
                disabled={!isConnected}
                onClick={() => handleSelectMode('online')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white font-black text-left shadow-lg flex items-center justify-between hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer border border-sky-300/60 disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-black/25 flex items-center justify-center shrink-0">
                    <Swords className="w-6 h-6 text-sky-200" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-black tracking-tight">
                      オンライン対戦 (ONLINE MATCH)
                    </div>
                    <div className="text-[11px] font-bold text-sky-100/85">
                      全国のプレイヤーとランダムマッチングで真剣勝負
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </button>

              {/* 3. Room Match */}
              <button
                type="button"
                disabled={!isConnected}
                onClick={() => handleSelectMode('room')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-700 text-white font-black text-left shadow-lg flex items-center justify-between hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer border border-fuchsia-300/60 disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-black/25 flex items-center justify-center shrink-0">
                    <KeyRound className="w-6 h-6 text-fuchsia-200" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-black tracking-tight">
                      ルームマッチ (ROOM MATCH)
                    </div>
                    <div className="text-[11px] font-bold text-fuchsia-100/85">
                      合言葉で部屋を作成・参加して友達と1対1対戦
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </button>

              {/* 4. Spectate */}
              <button
                type="button"
                disabled={!isConnected}
                onClick={() => handleSelectMode('spectate')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white font-black text-left shadow-lg flex items-center justify-between hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer border border-emerald-300/60 disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-black/25 flex items-center justify-center shrink-0">
                    <Eye className="w-6 h-6 text-emerald-200" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-black tracking-tight">
                      観戦 (SPECTATE)
                    </div>
                    <div className="text-[11px] font-bold text-emerald-100/85">
                      進行中のオンライン対戦や友達のルームをリアルタイム観戦
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </button>
            </div>
          </div>
        ) : (
          /* =================================================================
           * STEP 2: SUBSEQUENT CONFIGURATION FOR SELECTED MODE
           * ================================================================= */
          <div className="p-4 rounded-2xl bg-slate-900/95 border-2 border-amber-500/70 shadow-2xl space-y-4 animate-fadeIn">
            {/* Step Header with Back Button */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <button
                type="button"
                onClick={() => setSelectedMode(null)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-stone-200 font-bold text-xs cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>モード選択へ戻る</span>
              </button>

              <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                {selectedMode === 'cpu' && (
                  <>
                    <Bot className="w-4 h-4 text-amber-400" />
                    <span>CPU戦の設定</span>
                  </>
                )}
                {selectedMode === 'online' && (
                  <>
                    <Swords className="w-4 h-4 text-sky-400" />
                    <span>オンライン対戦の設定</span>
                  </>
                )}
                {selectedMode === 'room' && (
                  <>
                    <KeyRound className="w-4 h-4 text-fuchsia-400" />
                    <span>ルームマッチの設定</span>
                  </>
                )}
                {selectedMode === 'spectate' && (
                  <>
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>リアルタイム観戦</span>
                  </>
                )}
              </div>
            </div>

            {/* Mode 1: CPU Match Flow */}
            {selectedMode === 'cpu' && (
              <div className="space-y-4">
                {renderVictoryAndFormatSelectors('CPU対戦ルール')}
                <button
                  type="button"
                  disabled={!isConnected}
                  onClick={() => onSoloBotMatch(battleFormat)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-stone-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all cursor-pointer border border-yellow-200"
                >
                  <Bot className="w-5 h-5" />
                  <span>
                    CPU戦を開始する（
                    {battleFormat === 'allstar' ? '全員参加大乱闘' : '標準デッキ'}・{winScore}
                    点先取）
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mode 2: Online Match Flow */}
            {selectedMode === 'online' && (
              <div className="space-y-4">
                {renderVictoryAndFormatSelectors('同条件のプレイヤーとマッチング')}
                <button
                  type="button"
                  disabled={!isConnected}
                  onClick={() => onQuickMatch(battleFormat)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all cursor-pointer border border-sky-300"
                >
                  <Swords className="w-5 h-5" />
                  <span>
                    オンライン対戦を開始（
                    {battleFormat === 'allstar' ? '全員参加大乱闘' : '標準デッキ'}・{winScore}
                    点先取）
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mode 3: Room Match Flow */}
            {selectedMode === 'room' && (
              <div className="space-y-4">
                {/* Sub-tabs: Create Room vs Join Room */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRoomActionTab('create')}
                    className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      roomActionTab === 'create'
                        ? 'bg-fuchsia-600 text-white shadow'
                        : 'text-slate-400 hover:text-stone-200'
                    }`}
                  >
                    新しく部屋を作る
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoomActionTab('join')}
                    className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      roomActionTab === 'join'
                        ? 'bg-fuchsia-600 text-white shadow'
                        : 'text-slate-400 hover:text-stone-200'
                    }`}
                  >
                    合言葉で部屋に入る
                  </button>
                </div>

                {roomActionTab === 'create' ? (
                  <div className="space-y-4">
                    {renderVictoryAndFormatSelectors('作成する部屋のルール')}
                    <button
                      type="button"
                      disabled={!isConnected}
                      onClick={onCreateFriendRoom}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-600 to-indigo-600 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all cursor-pointer border border-fuchsia-300"
                    >
                      <Users className="w-5 h-5" />
                      <span>
                        このルールで部屋を作成（
                        {battleFormat === 'allstar' ? '大乱闘' : '標準'}・{winScore}点先取）
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-fuchsia-300">
                      友達から教えてもらった合言葉（招待コード）を入力してください
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={joinCodeInput}
                        onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                        maxLength={6}
                        placeholder="合言葉を入力"
                        className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-stone-100 font-mono font-black text-base text-center uppercase tracking-widest focus:outline-none focus:border-fuchsia-500"
                      />
                      <button
                        type="button"
                        disabled={!isConnected || !joinCodeInput.trim()}
                        onClick={() => onJoinFriendRoom(joinCodeInput)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:brightness-110 disabled:opacity-50 text-white font-black text-xs cursor-pointer shadow"
                      >
                        参加する
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ※勝利条件とデッキ形式は部屋を作成したホストの設定が適用されます。
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mode 4: Spectate Flow */}
            {selectedMode === 'spectate' && (
              <div className="space-y-3">
                {/* Direct Code / Room ID Input */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-emerald-300">
                    合言葉またはルームIDを指定して観戦
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={spectateCodeInput}
                      onChange={(e) => setSpectateCodeInput(e.target.value)}
                      placeholder="例: ABCD または room_xxxx"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-stone-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      disabled={!isConnected || !spectateCodeInput.trim()}
                      onClick={() => onSpectateMatch?.(spectateCodeInput)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-stone-950 font-black text-xs cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> 観戦する
                    </button>
                  </div>
                </div>

                {/* Active Matches List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      現在進行中のライブ対戦 ({liveMatches.length}件)
                    </span>
                    <button
                      type="button"
                      onClick={() => onRequestLiveMatches?.()}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> リスト更新
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 pr-0.5">
                    {liveMatches.length === 0 ? (
                      <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 text-center text-xs text-slate-400 space-y-1">
                        <div>現在進行中の対戦はありません。</div>
                        <div className="text-[10px] text-slate-500">
                          他のプレイヤーが対戦を開始するとここにリアルタイム表示されます。
                        </div>
                      </div>
                    ) : (
                      liveMatches.map((m) => (
                        <div
                          key={m.roomId}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/60 flex items-center justify-between gap-2 transition-all"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className="text-emerald-300 font-bold">
                                {m.battleFormat === 'allstar' ? '全員参加大乱闘' : '標準デッキ'}
                              </span>
                              <span>·</span>
                              <span className="text-amber-300 font-bold">{m.winScore}点先取</span>
                              <span>·</span>
                              <span className="text-slate-400">Turn {m.turnNumber}</span>
                              {m.inviteCode && (
                                <span className="text-slate-400 font-mono">#{m.inviteCode}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-black text-white truncate">
                              <span className="truncate">{m.playerAName}</span>
                              <span className="text-emerald-400 font-mono">
                                {m.playerAScore} - {m.playerBScore}
                              </span>
                              <span className="truncate">{m.playerBName}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Eye className="w-3 h-3 text-emerald-400" /> 観戦者: {m.spectatorCount}人
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onSpectateMatch?.(m.roomId)}
                            className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-stone-950 font-black text-xs shrink-0 cursor-pointer flex items-center gap-1 shadow"
                          >
                            <Eye className="w-3.5 h-3.5" /> 観戦
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sub Navigation: Card List & Rule book */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-stone-200 text-xs font-bold border border-slate-800 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>ルール・レベル表</span>
          </button>
          <button
            type="button"
            onClick={() => setShowDeck(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-stone-200 text-xs font-bold border border-slate-800 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>全カード図鑑 (全{ALL_CARD_DEFINITIONS.length}種)</span>
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
