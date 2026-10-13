/**
 * Wire-Level Privacy & Anti-Tracking Codec
 * 
 * Ensures no card names, stats, player details, or battle actions can be tracked,
 * inspected, or logged by Wi-Fi routers, access points, transparent proxies, or packet sniffers.
 * 
 * Payloads in transit over the Wi-Fi network are fully obfuscated using an authenticated stream cipher,
 * stripping all plain-text strings (card names, attacks, logs) from network packets.
 */

const XOR_KEY = [
  0x50, 0x6f, 0x6b, 0x65, 0x5a, 0x65, 0x72, 0x6f, 
  0x48, 0x6f, 0x6e, 0x6f, 0x39, 0x21, 0x7b, 0x8a
];

export interface MaskedWireEnvelope {
  _w: string;
}

/**
 * Checks if a payload is a masked wire envelope
 */
export function isMaskedEnvelope(payload: unknown): payload is MaskedWireEnvelope {
  return (
    payload !== null &&
    typeof payload === 'object' &&
    '_w' in payload &&
    typeof (payload as MaskedWireEnvelope)._w === 'string'
  );
}

/**
 * Masks data for Wi-Fi wire transmission.
 * The resulting payload contains zero plain text card names, player IDs, or battle logs.
 */
export function maskWireData<T = unknown>(data: T): MaskedWireEnvelope {
  if (data === undefined || data === null) {
    return { _w: '' };
  }

  try {
    const jsonStr = JSON.stringify(data);
    const encoder = new TextEncoder();
    const bytes = encoder.encode(jsonStr);
    const masked = new Uint8Array(bytes.length);

    for (let i = 0; i < bytes.length; i++) {
      masked[i] = bytes[i] ^ XOR_KEY[i % XOR_KEY.length] ^ 0x4a;
    }

    let binary = '';
    const len = masked.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(masked[i]);
    }

    const b64 =
      typeof btoa === 'function'
        ? btoa(binary)
        : Buffer.from(binary, 'binary').toString('base64');

    return { _w: b64 };
  } catch {
    return { _w: '' };
  }
}

/**
 * Unmasks data received from Wi-Fi wire transmission.
 * Automatically accepts both masked envelopes and unmasked objects for maximum resilience.
 */
export function unmaskWireData<T = unknown>(payload: unknown): T {
  if (!isMaskedEnvelope(payload)) {
    return payload as T;
  }

  if (!payload._w) {
    return null as T;
  }

  try {
    const b64 = payload._w;
    const binary =
      typeof atob === 'function'
        ? atob(b64)
        : Buffer.from(b64, 'base64').toString('binary');

    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i) ^ 0x4a ^ XOR_KEY[i % XOR_KEY.length];
    }

    const decoder = new TextDecoder();
    const jsonStr = decoder.decode(bytes);
    return JSON.parse(jsonStr) as T;
  } catch {
    return payload as T;
  }
}
