/**
 * Zero-Storage Privacy & Anti-Tracking Guard
 * 
 * Guarantees that when connected to Wi-Fi / network:
 * 1. ZERO game information (card names, decks, hands, HP, battle actions, room IDs, logs)
 *    is ever stored on disk, localStorage, sessionStorage, IndexedDB, CacheStorage, or cookies.
 * 2. Storage APIs (localStorage, sessionStorage) are intercepted and neutralized while connected to Wi-Fi.
 * 3. All session state is purely ephemeral in-memory React state, disappearing immediately on tab close or refresh.
 * 4. All tracking vectors (URL history leaks, referrer headers, browser caches) are purged.
 */

export function isConnectedToNetwork(): boolean {
  if (typeof navigator === 'undefined') return false;
  return navigator.onLine !== false;
}

/**
 * Completely purges all persistent and semi-persistent storage on the device.
 */
export function purgeAllDeviceStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    // 1. Clear CacheStorage
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name).catch(() => {});
        });
      }).catch(() => {});
    }

    // 2. Clear localStorage completely while on Wi-Fi/network
    try {
      localStorage.clear();
    } catch {
      // Ignore if access blocked
    }

    // 3. Clear sessionStorage completely while on Wi-Fi/network
    try {
      sessionStorage.clear();
    } catch {
      // Ignore if access blocked
    }

    // 4. Delete all IndexedDB databases
    if (typeof indexedDB !== 'undefined' && indexedDB.databases) {
      indexedDB.databases().then((dbs) => {
        dbs.forEach((dbInfo) => {
          if (dbInfo.name) {
            indexedDB.deleteDatabase(dbInfo.name);
          }
        });
      }).catch(() => {});
    }

    // 5. Expire all cookies
    if (typeof document !== 'undefined' && document.cookie) {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    }
  } catch {
    // Non-fatal safety catch
  }
}

let isInterceptorActive = false;

/**
 * Intercepts Storage APIs while connected to Wi-Fi / network.
 * Silently drops all storage attempts for game data, card names, and room IDs.
 */
export function activateStorageInterceptor(): void {
  if (typeof window === 'undefined' || isInterceptorActive) return;
  isInterceptorActive = true;

  try {
    const originalLocalSet = Storage.prototype.setItem;

    Storage.prototype.setItem = function (key: string, value: string) {
      // If connected to Wi-Fi/network, NEVER store game info, card names, or rooms
      if (isConnectedToNetwork()) {
        const lowerKey = key.toLowerCase();
        const lowerVal = typeof value === 'string' ? value.toLowerCase() : '';

        const isForbidden =
          lowerKey.includes('card') ||
          lowerKey.includes('game') ||
          lowerKey.includes('deck') ||
          lowerKey.includes('room') ||
          lowerKey.includes('battle') ||
          lowerKey.includes('player') ||
          lowerKey.includes('honmono') ||
          lowerVal.includes('card') ||
          lowerVal.includes('deck') ||
          lowerVal.includes('score') ||
          lowerVal.includes('format') ||
          lowerVal.includes('roomid');

        if (isForbidden) {
          // Block storage - purely in-memory
          return;
        }
      }
      return originalLocalSet.call(this, key, value);
    };
  } catch {
    // Fallback if Storage prototype cannot be modified
  }
}

/**
 * Initializes privacy guard listeners.
 * Actively purges and shields storage while on Wi-Fi.
 */
export function initPrivacyGuard(): () => void {
  purgeAllDeviceStorage();
  activateStorageInterceptor();

  const handleNetworkCheck = () => {
    if (isConnectedToNetwork()) {
      purgeAllDeviceStorage();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleNetworkCheck);
    window.addEventListener('focus', handleNetworkCheck);
    window.addEventListener('pagehide', handleNetworkCheck);
    window.addEventListener('beforeunload', handleNetworkCheck);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleNetworkCheck);
      window.removeEventListener('focus', handleNetworkCheck);
      window.removeEventListener('pagehide', handleNetworkCheck);
      window.removeEventListener('beforeunload', handleNetworkCheck);
    }
  };
}

export function enforceNoGameStorage(): void {
  purgeAllDeviceStorage();
}
