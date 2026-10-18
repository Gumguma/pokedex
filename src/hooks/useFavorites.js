import { useState, useEffect, useCallback } from 'react';
import { safeGetItem, safeSetItem } from '../utils/storage';

export const useFavorites = (onToast) => {
  const [favorites, setFavorites] = useState(() => {
    return safeGetItem('pokedex_favs', []);
  });

  useEffect(() => {
    const ok = safeSetItem('pokedex_favs', JSON.stringify(favorites));
    if (!ok && onToast) {
      onToast('Storage penuh. Gagal sinkron favorit.');
    }
  }, [favorites, onToast]);

  const toggleFavorite = useCallback((id, name = `Pokémon #${id}`) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        onToast?.(`${name} dihapus dari Favorit.`);
        return prev.filter((item) => item !== id);
      }
      onToast?.(`${name} ditambahkan ke Favorit.`);
      return [...prev, id];
    });
  }, [onToast]);

  return { favorites, toggleFavorite };
};
