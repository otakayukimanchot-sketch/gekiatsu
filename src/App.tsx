import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SanitizedGameState } from './online/types';
import { TabletopBoard } from './ui/battlefield/TabletopBoard';
import { LobbyView } from './ui/lobby/LobbyView';

interface LocalPlayerProfile {
  id: string;
  name: string;
  avatarIcon: string;
}

export default function App() {
  // Player Profile from localStorage
  const [player, setPlayer] = useState<LocalPlayerProfile>(() => {
    const saved = localStorage.getItem('honmono_card_player');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const newId = 'p_' + Math.random().toString(36).substring(2, 9);
    const newProfile: LocalPlayerProfile = {
      id: newId,
      name: 'デュエリスト',
      avatarIcon: 'smile'
    };
    localStorage.setItem('honmono_card_player', JSON.stringify(newProfile));
    return newProfile;
  });

  const [gameState, setGameState] = useState<SanitizedGameState | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchingMessage, setMatchingMessage] = useState<string>('');
  const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
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
    const updated = { ...player, name, avatarIcon };
    setPlayer(updated);
    localStorage.setItem('honmono_card_player', JSON.stringify(updated));
  };

  const handleQuickMatch = () => {
    if (!socketRef.current) return;
    setIsMatching(true);
    setMatchingMessage('対戦相手を探しています…');
    socketRef.current.emit('card_quick_match', { player });
  };

  const handleCreateFriendRoom = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('card_create_friend_room', { player });
  };

  const handleJoinFriendRoom = (code: string) => {
    if (!socketRef.current || !code.trim()) return;
    socketRef.current.emit('card_join_friend_room', { inviteCode: code, player });
  };

  const handleSoloBotMatch = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('card_solo_match', { player });
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

  const handleLeaveRoom = () => {
    setGameState(null);
    setIsMatching(false);
    setCreatedInviteCode(null);
    sessionStorage.removeItem('honmono_active_room');
  };

  // Render Tabletop Battle when in active game state
  if (gameState) {
    return (
      <TabletopBoard
        gameState={gameState}
        onSendAction={handleSendGameAction}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  // Render Lobby
  return (
    <LobbyView
      playerName={player.name}
      playerAvatar={player.avatarIcon}
      onUpdatePlayer={handleUpdatePlayer}
      onQuickMatch={handleQuickMatch}
      onCreateFriendRoom={handleCreateFriendRoom}
      onJoinFriendRoom={handleJoinFriendRoom}
      onSoloBotMatch={handleSoloBotMatch}
      onCancelMatch={handleCancelMatch}
      isMatching={isMatching}
      matchingMessage={matchingMessage}
      createdInviteCode={createdInviteCode}
      isConnected={isConnected}
      errorMessage={errorMessage}
    />
  );
}
