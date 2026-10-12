export type EmoteCategory = 'greetings' | 'reactions' | 'battle' | 'funny';

export interface EmoteDefinition {
  id: string;
  emoji: string;
  label: string;
  category: EmoteCategory;
}

export interface EmoteCategoryMeta {
  id: EmoteCategory;
  label: string;
  icon: string;
}

/**
 * Configurable cooldown duration (in milliseconds) enforced server-side and reflected in UI
 */
export const EMOTE_COOLDOWN_MS = Number(
  (typeof process !== 'undefined' && process.env?.EMOTE_COOLDOWN_MS) || 1500
);

/**
 * Duration (in milliseconds) each emote bubble stays visible before automatically disappearing
 */
export const EMOTE_DISPLAY_DURATION_MS = 2500;

/**
 * Long-press threshold (in milliseconds) required to open the emote selection panel
 */
export const EMOTE_LONG_PRESS_MS = 400;

export const EMOTE_CATEGORIES: EmoteCategoryMeta[] = [
  { id: 'greetings', label: 'あいさつ', icon: '👋' },
  { id: 'reactions', label: 'リアクション', icon: '🤯' },
  { id: 'battle', label: 'バトル', icon: '⚔️' },
  { id: 'funny', label: 'ネタ・レア', icon: '👑' },
];

export const EMOTE_DEFINITIONS: EmoteDefinition[] = [
  // 1. Greetings: 👋 🙇 🫶 🤝 🥳 😎
  { id: 'greet_wave', emoji: '👋', label: 'よろしく！', category: 'greetings' },
  { id: 'greet_bow', emoji: '🙇', label: 'お願いします', category: 'greetings' },
  { id: 'greet_heart', emoji: '🫶', label: '感謝！', category: 'greetings' },
  { id: 'greet_shake', emoji: '🤝', label: 'グッドゲーム', category: 'greetings' },
  { id: 'greet_party', emoji: '🥳', label: 'やったー！', category: 'greetings' },
  { id: 'greet_cool', emoji: '😎', label: 'ドヤッ', category: 'greetings' },

  // 2. Reactions: 🤯 💀 🤡 🫠 🗿 🥹
  { id: 'react_mindblown', emoji: '🤯', label: 'マジか！？', category: 'reactions' },
  { id: 'react_skull', emoji: '💀', label: '終わった…', category: 'reactions' },
  { id: 'react_clown', emoji: '🤡', label: 'ピエロ', category: 'reactions' },
  { id: 'react_melt', emoji: '🫠', label: '溶ける…', category: 'reactions' },
  { id: 'react_moai', emoji: '🗿', label: '無言の圧', category: 'reactions' },
  { id: 'react_tears', emoji: '🥹', label: '頼む…！', category: 'reactions' },

  // 3. Battle & Strategy: ⚔️ 🛡️ 🏹 🧙 🔥 🐉
  { id: 'battle_swords', emoji: '⚔️', label: '勝負だ！', category: 'battle' },
  { id: 'battle_shield', emoji: '🛡️', label: '鉄壁ガード', category: 'battle' },
  { id: 'battle_bow', emoji: '🏹', label: '狙い撃ち', category: 'battle' },
  { id: 'battle_mage', emoji: '🧙', label: '魔法詠唱', category: 'battle' },
  { id: 'battle_fire', emoji: '🔥', label: '燃えてきた', category: 'battle' },
  { id: 'battle_dragon', emoji: '🐉', label: '覚醒降臨', category: 'battle' },

  // 4. Funny & Rare: 🦆 🍌 👽 👾 🦈 👑
  { id: 'funny_duck', emoji: '🦆', label: 'カモかも？', category: 'funny' },
  { id: 'funny_banana', emoji: '🍌', label: 'バナナの皮', category: 'funny' },
  { id: 'funny_alien', emoji: '👽', label: '宇宙の法則', category: 'funny' },
  { id: 'funny_invader', emoji: '👾', label: 'バグ発生', category: 'funny' },
  { id: 'funny_shark', emoji: '🦈', label: 'シャーク襲来', category: 'funny' },
  { id: 'funny_crown', emoji: '👑', label: '王者の風格', category: 'funny' },
];

const EMOTE_MAP = new Map<string, EmoteDefinition>(
  EMOTE_DEFINITIONS.map((e) => [e.id, e])
);

export function getEmoteById(emoteId: string | undefined | null): EmoteDefinition | undefined {
  if (!emoteId) return undefined;
  return EMOTE_MAP.get(emoteId);
}

export interface EmoteBroadcastEvent {
  eventId: string;
  roomId: string;
  senderPlayerId: string;
  senderName: string;
  emoteId: string;
  emoji: string;
  timestamp: number;
  cooldownMs: number;
}
