import { useState, useEffect, useCallback, useRef } from 'react';
import { GENERATIONS } from '../constants/pokemonData';
import { playPokemonCry, cleanupAudio } from '../utils/audioHelper';
import { fetchJson, mapWithConcurrency } from '../utils/http';
import {
  describeFetchError,
  mapPokemon,
  mapQuizPokemon,
  mergeSpeciesDetails,
} from '../utils/pokemonMapper';

const API = 'https://pokeapi.co/api/v2';
const DETAIL_CONCURRENCY = 8;
const PAGE_SIZE_DEFAULT = 151;
const PAGE_SIZE_MORE = 48;

/**
 * Semua lalu lintas data Pokémon: daftar, pencarian, detail spesies, kuis.
 * Dipisah dari App supaya komponen tetap soal tampilan.
 */
export function usePokemonCollection({ selectedGen }) {
  const [pokemonList, setPokemonList] = useState([]);
  const [cachedDetails, setCachedDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [partialWarning, setPartialWarning] = useState(null);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const abortControllerRef = useRef(null);
  const cacheRef = useRef({});
  // Offset disimpan di ref, bukan state: kalau jadi dependency useCallback,
  // setiap batch yang selesai memicu effect muat-ulang tanpa henti.
  const offsetRef = useRef(0);

  useEffect(() => {
    cacheRef.current = cachedDetails;
  }, [cachedDetails]);

  useEffect(() => {
    return () => {
      cleanupAudio();
      abortControllerRef.current?.abort();
    };
  }, []);

  const fetchPokemonBatch = useCallback(
    async (reset = false) => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      const currentLimit = selectedGen !== 'all'
        ? GENERATIONS[selectedGen].limit
        : reset
          ? PAGE_SIZE_DEFAULT
          : PAGE_SIZE_MORE;
      const currentOffset = reset
        ? selectedGen !== 'all'
          ? GENERATIONS[selectedGen].offset
          : 0
        : offsetRef.current;

      setLoading(true);
      setApiError(null);
      setPartialWarning(null);

      try {
        const data = await fetchJson(`${API}/pokemon?limit=${currentLimit}&offset=${currentOffset}`, {
          signal,
        });

        let failed = 0;
        const detailedList = await mapWithConcurrency(
          data.results || [],
          DETAIL_CONCURRENCY,
          async (entry) => {
            const cached = cacheRef.current[entry.name];
            if (cached) return cached;
            try {
              const pData = await fetchJson(entry.url, { signal });
              const mapped = mapPokemon(pData);
              setCachedDetails((prev) => ({ ...prev, [entry.name]: mapped }));
              return mapped;
            } catch (err) {
              if (err?.name === 'AbortError') throw err;
              failed += 1;
              return null;
            }
          },
          { signal },
        );

        const cleaned = detailedList.filter(Boolean);

        if (cleaned.length === 0) {
          throw new Error('HTTP 503');
        }

        if (failed > 0) {
          setPartialWarning(
            `${failed} Pokémon gagal dimuat dan dilewati. Tekan "Muat Lebih Banyak" atau muat ulang untuk mencoba lagi.`,
          );
        }

        if (reset || selectedGen !== 'all') {
          setPokemonList(cleaned);
        } else {
          setPokemonList((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            return [...prev, ...cleaned.filter((p) => !existingIds.has(p.id))];
          });
        }
        offsetRef.current = currentOffset + currentLimit;
      } catch (err) {
        if (err?.name === 'AbortError') return;
        setApiError(describeFetchError(err, navigator.onLine));
      } finally {
        setLoading(false);
      }
    },
    [selectedGen],
  );

  // Muat ulang saat generasi berubah / pertama kali.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPokemonBatch(true);
  }, [selectedGen, fetchPokemonBatch]);

  const loadFullPokemonDetails = useCallback(async (pokemon) => {
    setModalLoading(true);
    setSelectedPokemon(pokemon);
    try {
      const speciesData = await fetchJson(`${API}/pokemon-species/${pokemon.id}/`);

      let evoData = null;
      if (speciesData?.evolution_chain?.url) {
        try {
          evoData = await fetchJson(speciesData.evolution_chain.url);
        } catch {
          evoData = null; // evolusi opsional: jangan gagalkan seluruh detail
        }
      }

      const updated = mergeSpeciesDetails(pokemon, speciesData, evoData);
      setCachedDetails((prev) => ({ ...prev, [pokemon.name]: updated }));
      setSelectedPokemon(updated);
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setSelectedPokemon({
        ...pokemon,
        desc: 'Deskripsi biografi gagal diunduh.',
        category: 'Pokémon',
        evolution: [],
      });
    } finally {
      playPokemonCry(pokemon.id, pokemon.types);
      setModalLoading(false);
    }
  }, []);

  const clearDetail = useCallback(() => setSelectedPokemon(null), []);

  /** Pencarian langsung ke PokéAPI (tombol "Tembak PokéAPI Live"). */
  const handleLiveSearch = useCallback(
    async (term) => {
      const cleanTerm = term?.toLowerCase().trim();
      if (!cleanTerm) return;

      setLoading(true);
      setApiError(null);
      try {
        const pData = await fetchJson(`${API}/pokemon/${cleanTerm}`);
        const mapped = mapPokemon(pData);
        setPokemonList((prev) => (prev.some((p) => p.id === mapped.id) ? prev : [mapped, ...prev]));
        setCachedDetails((prev) => ({ ...prev, [mapped.name]: mapped }));
        await loadFullPokemonDetails(mapped);
      } catch (err) {
        if (err?.name === 'AbortError') return;
        setApiError(
          err?.status === 404
            ? `Pokémon "${term}" tidak ditemukan di PokéAPI.`
            : describeFetchError(err, navigator.onLine),
        );
      } finally {
        setLoading(false);
      }
    },
    [loadFullPokemonDetails],
  );

  /** Satu soal kuis: 4 pilihan nama, satu target acak. */
  const fetchQuizRound = useCallback(async () => {
    const options = [];
    while (options.length < 4) {
      const randId = Math.floor(Math.random() * 151) + 1;
      if (!options.includes(randId)) options.push(randId);
    }
    const targetId = options[Math.floor(Math.random() * 4)];

    const results = await mapWithConcurrency(options, 4, async (id) => {
      const pData = await fetchJson(`${API}/pokemon/${id}`);
      return { id, pokemon: mapQuizPokemon(pData) };
    });

    const available = results.filter(Boolean);
    const targetEntry = available.find((entry) => entry.id === targetId) || available[0];
    if (!targetEntry) throw new Error('Kuis gagal dimuat: tidak ada data.');

    return {
      pokemon: targetEntry.pokemon,
      options: available.map((entry) => entry.pokemon.name),
    };
  }, []);

  return {
    pokemonList,
    cachedDetails,
    loading,
    apiError,
    setApiError,
    partialWarning,
    setPartialWarning,
    selectedPokemon,
    modalLoading,
    fetchPokemonBatch,
    handleLiveSearch,
    loadFullPokemonDetails,
    clearDetail,
    fetchQuizRound,
  };
}
