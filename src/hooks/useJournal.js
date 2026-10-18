import { useState, useEffect, useCallback } from 'react';
import { safeGetItem, safeSetItem } from '../utils/storage';

export const useJournal = (onToast, onError) => {
  const [journalLogs, setJournalLogs] = useState(() => {
    return safeGetItem('pokedex_journal', []);
  });

  useEffect(() => {
    const ok = safeSetItem('pokedex_journal', JSON.stringify(journalLogs));
    if (!ok && onError) {
      onError('Storage penuh. Gagal sinkron catatan jurnal.');
    }
  }, [journalLogs, onError]);

  const createJournal = useCallback((log) => {
    const newLog = {
      id: Date.now().toString(),
      ...log
    };
    setJournalLogs((prev) => [newLog, ...prev]);
    onToast?.(`Jurnal tangkapan untuk ${log.pokemonName} berhasil disimpan.`);
  }, [onToast]);

  const updateJournal = useCallback((id, updatedLog) => {
    setJournalLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, ...updatedLog } : log))
    );
    onToast?.('Jurnal tangkapan berhasil diperbarui.');
  }, [onToast]);

  const deleteJournal = useCallback((id) => {
    setJournalLogs((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.pokemonName) {
        onToast?.(`Jurnal tangkapan untuk ${target.pokemonName} berhasil dihapus.`);
      } else {
        onToast?.('Jurnal tangkapan berhasil dihapus.');
      }
      return prev.filter((item) => item.id !== id);
    });
  }, [onToast]);

  return {
    journalLogs,
    createJournal,
    updateJournal,
    deleteJournal
  };
};
