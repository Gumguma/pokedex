import { useState, useEffect, useCallback } from 'react';
import { safeGetItem, safeSetItem } from '../utils/storage';

const INITIAL_TEAMS = [{ id: '1', name: 'Tim Utama Saya', members: [] }];

export const useTeams = (onToast, onError) => {
  const [teams, setTeams] = useState(() => {
    return safeGetItem('pokedex_teams', INITIAL_TEAMS);
  });

  useEffect(() => {
    const ok = safeSetItem('pokedex_teams', JSON.stringify(teams));
    if (!ok && onError) {
      onError('Storage penuh. Gagal sinkron data tim.');
    }
  }, [teams, onError]);

  const createTeam = useCallback((name) => {
    const newTeam = {
      id: Date.now().toString(),
      name,
      members: []
    };
    setTeams((prev) => [...prev, newTeam]);
    onToast?.(`Tim "${name}" berhasil dibuat.`);
  }, [onToast]);

  const deleteTeam = useCallback((id) => {
    setTeams((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target) {
        onToast?.(`Tim "${target.name}" berhasil dihapus.`);
      }
      return prev.filter((t) => t.id !== id);
    });
  }, [onToast]);

  const renameTeam = useCallback((id, newName) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: newName } : t))
    );
    onToast?.(`Nama tim diubah menjadi "${newName}".`);
  }, [onToast]);

  const addPokemonToTeam = useCallback((teamId, pokemon) => {
    let message = '';
    let isError = false;

    setTeams((prev) =>
      prev.map((team) => {
        if (team.id !== teamId) return team;

        if (team.members.length >= 6) {
          message = 'Satu tim maksimal berisi 6 Pokémon.';
          isError = true;
          return team;
        }

        if (team.members.some((m) => m.id === pokemon.id)) {
          message = 'Pokémon ini sudah ada di dalam tim ini.';
          isError = true;
          return team;
        }

        message = `${pokemon.name} ditambahkan ke ${team.name}.`;
        return { ...team, members: [...team.members, pokemon] };
      })
    );

    if (isError) {
      onError?.(message);
      return false;
    }

    if (message) {
      onToast?.(message);
    }
    return true;
  }, [onToast, onError]);

  const removePokemonFromTeam = useCallback((teamId, pokemonId) => {
    setTeams((prev) =>
      prev.map((team) => {
        if (team.id !== teamId) return team;

        const member = team.members.find((m) => m.id === pokemonId);
        if (member) {
          onToast?.(`${member.name} dihapus dari ${team.name}.`);
        }

        return {
          ...team,
          members: team.members.filter((m) => m.id !== pokemonId)
        };
      })
    );
  }, [onToast]);

  return {
    teams,
    createTeam,
    deleteTeam,
    renameTeam,
    addPokemonToTeam,
    removePokemonFromTeam
  };
};
