/**
 * Safe localStorage wrapper dengan auto-cleanup saat quota exceeded
 */

export const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      console.warn('LocalStorage penuh, membersihkan cache lama...');
      
      // Auto cleanup oldest/largest entries
      const keysToClean = ['pokedex_cache', 'pokedex_battle_history'];
      keysToClean.forEach(k => {
        try {
          localStorage.removeItem(k);
        } catch (e) {
          console.warn(`Gagal hapus ${k}:`, e);
        }
      });
      
      // Retry setelah cleanup
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.error('❌ LocalStorage masih penuh setelah cleanup:', retryErr);
        return false;
      }
    }
    console.error('LocalStorage error:', err);
    return false;
  }
};

export const safeGetItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.warn(`Gagal membaca ${key} dari localStorage:`, err);
    return defaultValue;
  }
};

export const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error(`Gagal hapus ${key}:`, err);
    return false;
  }
};
