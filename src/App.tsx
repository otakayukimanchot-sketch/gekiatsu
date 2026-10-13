import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SanitizedGameState, LiveMatchSummary } from './online/types';
import { BattleFormatOption, WinScoreOption } from './game/types';
import {
  EMOTE_COOLDOWN_MS,
  EMOTE_DISPLAY_DURATION_MS,
  EmoteBroadcastEvent,
} from './game/emotes';
import { TabletopBoard } from './ui/battlefield/TabletopBoard';
import { LobbyView } from './ui/lobby/LobbyView';
import { initPrivacyGuard, purgeAllDeviceStorage } from './utils/noStorageGuard';
import { maskWireData, unmaskWireData } from './utils/wireSecurity';

interface LocalPlayerProfile {
  id: string;
  name: string;
  avatarIcon: string;
  winScore?: WinScoreOption;
  battleFormat?: BattleFormatOption;
}

export default function App() {
  // Pure volatile in-memory player profile: NEVER written to disk/localStorage while on Wi-Fi
  const [player, setPlayer] = useState<LocalPlayerProfile>(() => {
    return {
      id: 'p_' + Math.random().toString(36).substring(2, 9),
      name: 'デュエリスト',
      avatarIcon: 'smile',
      winScore: 3,
      battleFormat: 'standard',
    };
  });

  const [winScore, setWinScore] = useState<WinScoreOption>(3);
  const [battleFormat, setBattleFormat] = useState<BattleFormatOption>('standard');

  const [gameState, setGameState] = useState<SanitizedGameState | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchingMessage, setMatchingMessage] = useState<string>('');
  const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveMatches, setLiveMatches] = useState<LiveMatchSummary[]>([]);
  const [activeEmotes, setActiveEmotes] = useState<
    Record<string, { emoji: string; eventId: string }>
  >({});
  const [emoteCooldownUntil, setEmoteCooldownUntil] = useState<number>(0);

  const socketRef = useRef<Socket | null>(null);
  const emoteTimersRef = useRef<Record<string, number>>({});
  const playerRef = useRef(player);
  playerRef.current = player;
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const inMemoryRoomIdRef = useRef<string | null>(null);

  // Zero-Storage Privacy Guard: continuously purges any disk/browser storage and blocks storage APIs
  useEffect(() => {
    const cleanup = initPrivacyGuard();
    return () => {
      cleanup();
      purgeAllDeviceStorage();
    };
  }, []);

  // Initialize Socket connection with wire-level payload encryption and zero network leakage
  useEffect(() => {
    const socket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setErrorMessage(null);

      // Rejoin in-memory room if reconnecting
      if (inMemoryRoomIdRef.current && playerRef.current) {
        socket.emit(
          'card_rejoin_match',
          maskWireData({
            roomId: inMemoryRoomIdRef.current,
            playerId: playerRef.current.id,
          })
        );
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    socket.on('card_game_state', (raw: unknown) => {
      const state = unmaskWireData<SanitizedGameState>(raw);
      if (!state) return;

      setGameState(state);
      setIsMatching(false);
      setCreatedInviteCode(null);
      setErrorMessage(null);
      inMemoryRoomIdRef.current = state.roomId;
    });

    socket.on('match_waiting', (raw: unknown) => {
      const data = unmaskWireData<{ message: string }>(raw);
      if (!data) return;
      setIsMatching(true);
      setMatchingMessage(data.message);
    });

    socket.on('friend_room_created', (raw: unknown) => {
      const data = unmaskWireData<{ inviteCode: string; roomId: string }>(raw);
      if (!data) return;
      setCreatedInviteCode(data.inviteCode);
      inMemoryRoomIdRef.current = data.roomId;
    });

    socket.on('card_live_matches', (raw: unknown) => {
      const data = unmaskWireData<{ matches: LiveMatchSummary[] }>(raw);
      setLiveMatches(Array.isArray(data?.matches) ? data.matches : []);
    });

    socket.on('card_emote_event', (raw: unknown) => {
      const evt = unmaskWireData<EmoteBroadcastEvent>(raw);
      if (!evt || !evt.senderPlayerId || !evt.emoji) return;

      // Clear previous timer for this sender if another emote arrives before 2.5s
      const existingTimer = emoteTimersRef.current[evt.senderPlayerId];
      if (existingTimer) {
        window.clearTimeout(existingTimer);
      }

      setActiveEmotes((prev) => ({
        ...prev,
        [evt.senderPlayerId]: {
          emoji: evt.emoji,
          eventId: evt.eventId,
        },
      }));

      if (playerRef.current && evt.senderPlayerId === playerRef.current.id) {
        setEmoteCooldownUntil(Date.now() + (evt.cooldownMs || EMOTE_COOLDOWN_MS));
      }

      emoteTimersRef.current[evt.senderPlayerId] = window.setTimeout(() => {
        setActiveEmotes((prev) => {
          const current = prev[evt.senderPlayerId];
          if (!current || current.eventId !== evt.eventId) return prev;
          const next = { ...prev };
          delete next[evt.senderPlayerId];
          return next;
        });
        delete emoteTimersRef.current[evt.senderPlayerId];
      }, EMOTE_DISPLAY_DURATION_MS);
    });

    socket.on('card_emote_rejected', (raw: unknown) => {
      const data = unmaskWireData<{ reason?: string; retryAfterMs?: number }>(raw);
      if (data?.retryAfterMs && data.retryAfterMs > 0) {
        setEmoteCooldownUntil(Date.now() + data.retryAfterMs);
      }
    });

    socket.on('card_error', (raw: unknown) => {
      const data = unmaskWireData<{ message: string }>(raw);
      setErrorMessage(data?.message || 'エラーが発生しました。');
      setIsMatching(false);
      setTimeout(() => setErrorMessage(null), 4000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleUpdatePlayer = (name: string, avatarIcon: string) => {
    setPlayer((prev) => ({ ...prev, name, avatarIcon }));
  };

  const handleChangeWinScore = (newWinScore: WinScoreOption) => {
    setWinScore(newWinScore);
    setPlayer((prev) => ({ ...prev, winScore: newWinScore }));
  };

  const handleChangeBattleFormat = (newFormat: BattleFormatOption) => {
    setBattleFormat(newFormat);
    setPlayer((prev) => ({ ...prev, battleFormat: newFormat }));
  };

  const handleQuickMatch = (overrideFormat?: BattleFormatOption) => {
    if (!socketRef.current) return;
    const fmt = overrideFormat || battleFormat;
    const fmtLabel = fmt === 'allstar' ? '全員参加大乱闘' : '標準デッキ';
    setIsMatching(true);
    setMatchingMessage(`対戦相手を探しています（${fmtLabel} / ${winScore}点先取）…`);
    socketRef.current.emit(
      'card_quick_match',
      maskWireData({
        player: { ...player, winScore, battleFormat: fmt },
      })
    );
  };

  const handleCreateFriendRoom = () => {
    if (!socketRef.current) return;
    socketRef.current.emit(
      'card_create_friend_room',
      maskWireData({
        player: { ...player, winScore, battleFormat },
      })
    );
  };

  const handleJoinFriendRoom = (code: string) => {
    if (!socketRef.current || !code.trim()) return;
    socketRef.current.emit(
      'card_join_friend_room',
      maskWireData({
        inviteCode: code,
        player: { ...player, winScore, battleFormat },
      })
    );
  };

  const handleSoloBotMatch = (overrideFormat?: BattleFormatOption) => {
    if (!socketRef.current) return;
    const fmt = overrideFormat || battleFormat;
    if (overrideFormat && overrideFormat !== battleFormat) {
      handleChangeBattleFormat(overrideFormat);
    }
    socketRef.current.emit(
      'card_solo_match',
      maskWireData({
        player: { ...player, winScore, battleFormat: fmt },
      })
    );
  };

  const handleCancelMatch = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('card_cancel_match');
    setIsMatching(false);
    setCreatedInviteCode(null);
    inMemoryRoomIdRef.current = null;
  };

  const handleSendGameAction = (actionType: string, payload: any = {}) => {
    if (!socketRef.current || !gameState) return;
    socketRef.current.emit(
      'card_action',
      maskWireData({
        roomId: gameState.roomId,
        playerId: player.id,
        payload: {
          actionType,
          ...payload,
          stateVersion: gameState.stateVersion,
        },
      })
    );
  };

  const handleSendEmote = (emoteId: string) => {
    if (!socketRef.current || !gameState || !isConnected) return;
    if (Date.now() < emoteCooldownUntil) return;
    const clientRequestId =
      'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    socketRef.current.emit(
      'card_send_emote',
      maskWireData({
        roomId: gameState.roomId,
        emoteId,
        clientRequestId,
      })
    );
  };

  const handleLeaveRoom = () => {
    if (gameState?.isSpectator && socketRef.current) {
      socketRef.current.emit(
        'card_leave_spectate',
        maskWireData({ roomId: gameState.roomId })
      );
    }
    setGameState(null);
    setIsMatching(false);
    setCreatedInviteCode(null);
    inMemoryRoomIdRef.current = null;
    purgeAllDeviceStorage();
  };

  const handleRequestLiveMatches = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('card_list_live_matches');
  };

  const handleSpectateMatch = (targetIdOrCode: string) => {
    if (!socketRef.current || !targetIdOrCode.trim()) return;
    socketRef.current.emit(
      'card_spectate_match',
      maskWireData({
        targetIdOrCode,
        player: { id: player.id, name: player.name },
      })
    );
  };

  const handlePlayAgain = () => {
    const isSoloRoom = gameState?.roomId?.startsWith('solo_');
    const prevFormat = gameState?.battleFormat || battleFormat;
    handleLeaveRoom();
    if (isSoloRoom && socketRef.current) {
      socketRef.current.emit(
        'card_solo_match',
        maskWireData({
          player: { ...player, winScore, battleFormat: prevFormat },
        })
      );
    }
  };

  // Render Tabletop Battle when in active game state
  if (gameState) {
    return (
      <TabletopBoard
        gameState={gameState}
        onSendAction={handleSendGameAction}
        onSendEmote={handleSendEmote}
        activeEmotes={activeEmotes}
        emoteCooldownUntil={emoteCooldownUntil}
        onLeaveRoom={handleLeaveRoom}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  // Render Lobby
  return (
    <LobbyView
      playerName={player.name}
      playerAvatar={player.avatarIcon}
      winScore={winScore}
      battleFormat={battleFormat}
      onChangeWinScore={handleChangeWinScore}
      onChangeBattleFormat={handleChangeBattleFormat}
      onUpdatePlayer={handleUpdatePlayer}
      onQuickMatch={handleQuickMatch}
      onCreateFriendRoom={handleCreateFriendRoom}
      onJoinFriendRoom={handleJoinFriendRoom}
      onSoloBotMatch={handleSoloBotMatch}
      onCancelMatch={handleCancelMatch}
      onRequestLiveMatches={handleRequestLiveMatches}
      onSpectateMatch={handleSpectateMatch}
      liveMatches={liveMatches}
      isMatching={isMatching}
      matchingMessage={matchingMessage}
      createdInviteCode={createdInviteCode}
      isConnected={isConnected}
      errorMessage={errorMessage}
    />
  );
}
