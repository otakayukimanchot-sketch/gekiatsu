/**
 * Zero-Storage Privacy & Anti-Tracking Guard
 * 
 * Guarantees that when connected to Wi-Fi / network:
 * 1. All game state, cards, and player profiles remain strictly in volatile React state.
 * 2. Any old or lingering localStorage / sessionStorage keys related to the game are safely removed.
 * 3. Never mutates native prototypes or throws exceptions in sandboxed iframes.
 */

export function isConnectedToNetwork(): boolean {
  if (typeof navigator === 'undefined') return false;
  return navigator.onLine !== false;
}

/**
 * Safely removes any lingering card or game data from browser storage without throwing.
 */
export function purgeAllDeviceStorage(): void {
  if (typeof window === 'undefined') return;

  // 1. Safely remove game keys from localStorage
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && /honmono|card|game|deck|room|battle|player/i.test(key)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {
          // Ignore
        }
      });
    }
  } catch {
    // Sandboxed iframes may block localStorage access
  }

  // 2. Safely remove game keys from sessionStorage
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && /honmono|card|game|deck|room|battle|player/i.test(key)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => {
        try {
          sessionStorage.removeItem(k);
        } catch {
          // Ignore
        }
      });
    }
  } catch {
    // Sandboxed iframes may block sessionStorage access
  }

  // 3. Clear CacheStorage safely
  try {
    if (typeof window !== 'undefined' && 'caches' in window && window.caches) {
      window.caches
        .keys()
        .then((names) => {
          names.forEach((name) => {
            if (/card|game|honmono/i.test(name)) {
              window.caches.delete(name).catch(() => {});
            }
          });
        })
        .catch(() => {});
    }
  } catch {
    // Ignore
  }
}

/**
 * Initializes privacy guard listeners.
 * Safely purges persistent storage on connect and navigation events.
 */
export function initPrivacyGuard(): () => void {
  purgeAllDeviceStorage();

  const handleNetworkCheck = () => {
    purgeAllDeviceStorage();
  };

  if (typeof window !== 'undefined') {
    try {
      window.addEventListener('online', handleNetworkCheck);
      window.addEventListener('pagehide', handleNetworkCheck);
    } catch {
      // Ignore
    }
  }

  return () => {
    if (typeof window !== 'undefined') {
      try {
        window.removeEventListener('online', handleNetworkCheck);
        window.removeEventListener('pagehide', handleNetworkCheck);
      } catch {
        // Ignore
      }
    }
  };
}

export function enforceNoGameStorage(): void {
  purgeAllDeviceStorage();
}
