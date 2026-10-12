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

interface LocalPlayerProfile {
  id: string;
  name: string;
  avatarIcon: string;
  winScore?: WinScoreOption;
  battleFormat?: BattleFormatOption;
}

export default function App() {
  // Player Profile from localStorage
  const [player, setPlayer] = useState<LocalPlayerProfile>(() => {
    const saved = localStorage.getItem('honmono_card_player');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          winScore: parsed.winScore === 7 ? 7 : parsed.winScore === 5 ? 5 : 3,
          battleFormat: parsed.battleFormat === 'allstar' ? 'allstar' : 'standard',
        };
      } catch (e) {}
    }
    const newId = 'p_' + Math.random().toString(36).substring(2, 9);
    const newProfile: LocalPlayerProfile = {
      id: newId,
      name: 'デュエリスト',
      avatarIcon: 'smile',
      winScore: 3,
      battleFormat: 'standard',
    };
    localStorage.setItem('honmono_card_player', JSON.stringify(newProfile));
    return newProfile;
  });

  const [winScore, setWinScore] = useState<WinScoreOption>(
    player.winScore === 7 ? 7 : player.winScore === 5 ? 5 : 3
  );
  const [battleFormat, setBattleFormat] = useState<BattleFormatOption>(
    player.battleFormat === 'allstar' ? 'allstar' : 'standard'
  );

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

  // Initialize Socket connection
  useEffect(() => {
    const socket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket Connected] ID:', socket.id);
      setIsConnected(true);
      setErrorMessage(null);

      // Check if we need to rejoin an active match
      const savedRoomId = sessionStorage.getItem('honmono_active_room');
      if (savedRoomId && playerRef.current) {
        console.log('[Attempting Rejoin]', savedRoomId);
        socket.emit('card_rejoin_match', {
          roomId: savedRoomId,
          playerId: playerRef.current.id
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('[Socket Disconnected]');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket Connect Error]', err);
      setIsConnected(false);
    });

    socket.on('card_game_state', (state: SanitizedGameState) => {
      console.log('[Game State Received] Turn:', state.turnNumber, 'Phase:', state.phase);
      setGameState(state);
      setIsMatching(false);
      setCreatedInviteCode(null);
      setErrorMessage(null);
      sessionStorage.setItem('honmono_active_room', state.roomId);
    });

    socket.on('match_waiting', (data: { message: string }) => {
      setIsMatching(true);
      setMatchingMessage(data.message);
    });

    socket.on('friend_room_created', (data: { inviteCode: string; roomId: string }) => {
      setCreatedInviteCode(data.inviteCode);
      sessionStorage.setItem('honmono_active_room', data.roomId);
    });

    socket.on('card_live_matches', (data: { matches: LiveMatchSummary[] }) => {
      setLiveMatches(Array.isArray(data.matches) ? data.matches : []);
    });

    socket.on('card_emote_event', (evt: EmoteBroadcastEvent) => {
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

    socket.on(
      'card_emote_rejected',
      (data: { reason?: string; retryAfterMs?: number }) => {
        if (data?.retryAfterMs && data.retryAfterMs > 0) {
          setEmoteCooldownUntil(Date.now() + data.retryAfterMs);
        }
      }
    );

    socket.on('card_error', (data: { message: string }) => {
      setErrorMessage(data.message);
      setIsMatching(false);
      setTimeout(() => setErrorMessage(null), 4000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleUpdatePlayer = (name: string, avatarIcon: string) => {
    const updated = { ...player, name, avatarIcon, winScore, battleFormat };
    setPlayer(updated);
    localStorage.setItem('honmono_card_player', JSON.stringify(updated));
  };

  const handleChangeWinScore = (newWinScore: WinScoreOption) => {
    setWinScore(newWinScore);
    const updated = { ...player, winScore: newWinScore, battleFormat };
    setPlayer(updated);
    localStorage.setItem('honmono_card_player', JSON.stringify(updated));
  };

  const handleChangeBattleFormat = (newFormat: BattleFormatOption) => {
    setBattleFormat(newFormat);
    const updated = { ...player, winScore, battleFormat: newFormat };
    setPlayer(updated);
    localStorage.setItem('honmono_card_player', JSON.stringify(updated));
  };

  const handleQuickMatch = (overrideFormat?: BattleFormatOption) => {
    if (!socketRef.current) return;
    const fmt = overrideFormat || battleFormat;
    const fmtLabel = fmt === 'allstar' ? '全員参加大乱闘' : '標準デッキ';
    setIsMatching(true);
    setMatchingMessage(`対戦相手を探しています（${fmtLabel} / ${winScore}点先取）…`);
    socketRef.current.emit('card_quick_match', {
      player: { ...player, winScore, battleFormat: fmt },
    });
  };

  const handleCreateFriendRoom = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('card_create_friend_room', {
      player: { ...player, winScore, battleFormat },
    });
  };

  const handleJoinFriendRoom = (code: string) => {
    if (!socketRef.current || !code.trim()) return;
    socketRef.current.emit('card_join_friend_room', {
      inviteCode: code,
      player: { ...player, winScore, battleFormat },
    });
  };

  const handleSoloBotMatch = (overrideFormat?: BattleFormatOption) => {
    if (!socketRef.current) return;
    const fmt = overrideFormat || battleFormat;
    if (overrideFormat && overrideFormat !== battleFormat) {
      handleChangeBattleFormat(overrideFormat);
    }
    socketRef.current.emit('card_solo_match', {
      player: { ...player, winScore, battleFormat: fmt },
    });
  };

  const handleCancelMatch = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('card_cancel_match');
    setIsMatching(false);
    setCreatedInviteCode(null);
    sessionStorage.removeItem('honmono_active_room');
  };

  const handleSendGameAction = (actionType: string, payload: any = {}) => {
    if (!socketRef.current || !gameState) return;
    socketRef.current.emit('card_action', {
      roomId: gameState.roomId,
      playerId: player.id,
      payload: {
        actionType,
        ...payload,
        stateVersion: gameState.stateVersion
      }
    });
  };

  const handleSendEmote = (emoteId: string) => {
    if (!socketRef.current || !gameState || !isConnected) return;
    if (Date.now() < emoteCooldownUntil) return;
    const clientRequestId =
      'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    socketRef.current.emit('card_send_emote', {
      roomId: gameState.roomId,
      emoteId,
      clientRequestId,
    });
  };

  const handleLeaveRoom = () => {
    if (gameState?.isSpectator && socketRef.current) {
      socketRef.current.emit('card_leave_spectate', { roomId: gameState.roomId });
    }
    setGameState(null);
    setIsMatching(false);
    setCreatedInviteCode(null);
    sessionStorage.removeItem('honmono_active_room');
  };

  const handleRequestLiveMatches = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('card_list_live_matches');
  };

  const handleSpectateMatch = (targetIdOrCode: string) => {
    if (!socketRef.current || !targetIdOrCode.trim()) return;
    socketRef.current.emit('card_spectate_match', {
      targetIdOrCode,
      player: { id: player.id, name: player.name },
    });
  };

  const handlePlayAgain = () => {
    const isSoloRoom = gameState?.roomId?.startsWith('solo_');
    const prevFormat = gameState?.battleFormat || battleFormat;
    handleLeaveRoom();
    if (isSoloRoom && socketRef.current) {
      socketRef.current.emit('card_solo_match', {
        player: { ...player, winScore, battleFormat: prevFormat },
      });
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
