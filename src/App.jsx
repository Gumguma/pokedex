import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/Header';
import PokemonCard from './components/PokemonCard';
import PokemonCardSkeleton from './components/PokemonCardSkeleton';
import PokemonModal from './components/PokemonModal';
import TeamManager from './components/TeamManager';
import QuizGame from './components/QuizGame';
import JournalTimeline from './components/JournalTimeline';
import TypeBadge from './components/TypeBadge';
import BattleSimulator from './components/BattleSimulator';
import EmptyState from './components/EmptyState';
import ModalShell from './components/ModalShell';

import { GENERATIONS, TYPE_DETAILS, LEGENDARY_IDS, MYTHICAL_IDS } from './constants/pokemonData';
import { playPokemonCry, cleanupAudio } from './utils/audioHelper';
import { useDebounce } from './hooks/useDebounce';
import { useFavorites } from './hooks/useFavorites';
import { useTeams } from './hooks/useTeams';
import { useJournal } from './hooks/useJournal';
import { safeSetItem, safeGetItem } from './utils/storage';

export default function App() {
  const [toastMessage, setToastMessage] = useState(null);
  const [apiError, setApiError] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
  }, []);

  const handleApiError = useCallback((msg) => {
    setApiError(msg);
  }, []);

  // Global States & Custom Hooks
  const [pokemonList, setPokemonList] = useState([]);
  const [cachedDetails, setCachedDetails] = useState({});
  const { favorites, toggleFavorite } = useFavorites(showToast);
  const {
    teams,
    createTeam,
    deleteTeam,
    renameTeam,
    addPokemonToTeam,
    removePokemonFromTeam
  } = useTeams(showToast, handleApiError);
  const {
    journalLogs,
    createJournal,
    updateJournal,
    deleteJournal
  } = useJournal(showToast, handleApiError);

  // Navigation & Filtering States
  const [activeTab, setActiveTab] = useState('explore');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedGen, setSelectedGen] = useState('all');
  const [sortBy, setSortBy] = useState('id_asc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  // Overlay Team Selector State
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [selectedPokemonToTeam, setSelectedPokemonToTeam] = useState(null);

  // AbortController untuk cancel fetch sebelumnya
  const abortControllerRef = useRef(null);

  // Modal / Comparison States
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [compareList, setCompareList] = useState([]);

  // Game States
  const [gamePokemon, setGamePokemon] = useState(null);
  const [gameOptions, setGameOptions] = useState([]);
  const [gameScore, setGameScore] = useState(0);
  const [gameHighScore, setGameHighScore] = useState(() => {
    return safeGetItem('pokedex_highscore', 0);
  });
  const [gameResult, setGameResult] = useState(null);
  const [gameLoading, setGameLoading] = useState(false);

  // Auto-dismiss Toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Cleanup audio context saat unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
      // Cancel pending fetch saat unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetching Pokemons
  const fetchPokemonBatch = useCallback(async (reset = false) => {
    // Cancel previous fetch jika masih running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Buat abort controller baru
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setLoading(true);
    setApiError(null);
    try {
      let currentLimit;
      let currentOffset;

      if (selectedGen !== 'all') {
        // Specific generation: load all at once
        currentLimit = GENERATIONS[selectedGen].limit;
        currentOffset = GENERATIONS[selectedGen].offset;
      } else {
        // 'Semua Gen': load 151 on first load, then 48 per batch
        currentOffset = reset ? 0 : offset;
        currentLimit = reset ? 151 : 48;
      }

      const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${currentLimit}&offset=${currentOffset}`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const detailedPromises = data.results.map(async (p) => {
        if (cachedDetails[p.name]) return cachedDetails[p.name];

        const pRes = await fetch(p.url, { signal });
        if (!pRes.ok) return null;
        const pData = await pRes.json();

        const mapped = {
          id: pData.id,
          name: pData.name,
          types: pData.types.map(t => t.type.name),
          sprite: pData.sprites?.other?.['official-artwork']?.front_default 
              || pData.sprites?.front_default 
              || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png',
          stats: pData.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
          height: pData.height,
          weight: pData.weight,
          abilities: pData.abilities.map(a => a.ability.name),
          isLegendary: LEGENDARY_IDS.has(pData.id),
          isMythical: MYTHICAL_IDS.has(pData.id),
          moves: pData.moves && pData.moves.length > 0 
            ? pData.moves.slice(0, 4).map(m => m.move.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))
            : ['Tackle', 'Growl', 'Pound', 'Scratch'],
        };

        setCachedDetails(prev => ({ ...prev, [p.name]: mapped }));
        return mapped;
      });

      const detailedList = (await Promise.all(detailedPromises)).filter(p => p !== null);

      if (reset || selectedGen !== 'all') {
        setPokemonList(detailedList);
        setOffset(currentOffset + currentLimit);
      } else {
        setPokemonList(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniques = detailedList.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniques];
        });
        setOffset(currentOffset + currentLimit);
      }
    } catch (err) {
      // Jangan set error jika fetch di-abort (user-initiated)
      if (err.name === 'AbortError') {
        return;
      }
      
      console.warn("Gagal memuat batch Pokémon:", err);
      
      // Error handling lebih spesifik
      let errorMessage;
      
      if (!navigator.onLine) {
        errorMessage = '❌ Tidak ada koneksi internet. Periksa jaringan Anda.';
      } else if (err.message.includes('404')) {
        errorMessage = '🔍 Data tidak ditemukan di PokéAPI.';
      } else if (err.message.includes('429')) {
        errorMessage = '⏳ Terlalu banyak request. Tunggu sebentar dan coba lagi.';
      } else if (err.message.includes('500') || err.message.includes('503')) {
        errorMessage = '🔧 Server PokéAPI sedang bermasalah. Coba lagi nanti.';
      } else {
        errorMessage = `⚠️ Gagal memuat data: ${err.message}`;
      }
      
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [offset, selectedGen, cachedDetails]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPokemonBatch(true);
  }, [selectedGen, fetchPokemonBatch]);

  // Fetch Detail Spesies & Evolusi Dinamis
  const loadFullPokemonDetails = async (pokemon) => {
    setModalLoading(true);
    try {
      const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}/`);
      const speciesData = await speciesRes.json();

      let desc = speciesData.flavor_text_entries.find(entry => entry.language.name === 'id')?.flavor_text ||
        speciesData.flavor_text_entries.find(entry => entry.language.name === 'en')?.flavor_text ||
        "Tidak ada deskripsi untuk Pokémon ini.";

      desc = desc.replace(/[\n\f]/g, ' ');

      const category = speciesData.genera.find(g => g.language.name === 'id')?.genus ||
        speciesData.genera.find(g => g.language.name === 'en')?.genus ||
        "Pokémon";

      const evoChainUrl = speciesData.evolution_chain.url;
      const evoRes = await fetch(evoChainUrl);
      const evoData = await evoRes.json();

      const evolution = [];
      let currentChain = evoData.chain;

      while (currentChain) {
        const pName = currentChain.species.name;
        const parts = currentChain.species.url.split('/');
        const pId = parts[parts.length - 2];
        const artUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pId}.png`;

        evolution.push({
          id: parseInt(pId, 10),
          name: pName,
          sprite: artUrl
        });

        currentChain = currentChain.evolves_to[0];
      }

      const isLegendary = LEGENDARY_IDS.has(pokemon.id) || !!speciesData.is_legendary;
      const isMythical = MYTHICAL_IDS.has(pokemon.id) || !!speciesData.is_mythical;

      const updatedDetails = {
        ...pokemon,
        desc,
        category,
        evolution,
        isLegendary,
        isMythical
      };

      setCachedDetails(prev => ({ ...prev, [pokemon.name]: updatedDetails }));
      setSelectedPokemon(updatedDetails);
      playPokemonCry(pokemon.id, pokemon.types);
    } catch (err) {
      console.warn("Gagal memuat detail biografi spesies:", err);
      setSelectedPokemon({
        ...pokemon,
        desc: "Deskripsi biografi gagal diunduh.",
        category: "Pokémon",
        evolution: []
      });
      playPokemonCry(pokemon.id, pokemon.types);
    } finally {
      setModalLoading(false);
    }
  };

  // Live direct search PokéAPI
  const handleLiveSearch = async (term) => {
    if (!term.trim()) return;
    const cleanTerm = term.toLowerCase().trim();
    const abortController = new AbortController();
    
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${cleanTerm}`, { signal: abortController.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const pData = await res.json();

      const mapped = {
        id: pData.id,
        name: pData.name,
        types: pData.types.map(t => t.type.name),
        sprite: pData.sprites?.other?.['official-artwork']?.front_default 
            || pData.sprites?.front_default 
            || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png',
        stats: pData.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
        height: pData.height,
        weight: pData.weight,
        abilities: pData.abilities.map(a => a.ability.name),
        isLegendary: LEGENDARY_IDS.has(pData.id),
        isMythical: MYTHICAL_IDS.has(pData.id),
        moves: pData.moves && pData.moves.length > 0 
          ? pData.moves.slice(0, 4).map(m => m.move.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))
          : ['Tackle', 'Growl', 'Pound', 'Scratch'],
      };

      setPokemonList(prev => {
        if (prev.some(p => p.id === mapped.id)) return prev;
        return [mapped, ...prev];
      });

      setCachedDetails(prev => ({ ...prev, [mapped.name]: mapped }));
      loadFullPokemonDetails(mapped);
    } catch (err) {
      if (err.name === 'AbortError') return;
      
      console.warn("Gagal melakukan pencarian live:", err);
      setApiError(`Pokémon "${term}" tidak ditemukan di PokéAPI.`);
    } finally {
      setLoading(false);
    }
  };

  // Game Logic
  const startNewGameRound = useCallback(async () => {
    setGameLoading(true);
    setGameResult(null);
    try {
      const options = [];
      while (options.length < 4) {
        const randId = Math.floor(Math.random() * 151) + 1;
        if (!options.includes(randId)) options.push(randId);
      }

      const targetId = options[Math.floor(Math.random() * 4)];
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${targetId}`);
      const pData = await res.json();

      const targetPoke = {
        id: pData.id,
        name: pData.name.toUpperCase(),
        sprite: pData.sprites?.other?.['official-artwork']?.front_default 
            || pData.sprites?.front_default 
            || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png',
        types: pData.types.map(t => t.type.name)
      };

      const optPromises = options.map(async (id) => {
        if (id === targetId) return targetPoke.name;
        const oRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const oData = await oRes.json();
        return oData.name.toUpperCase();
      });

      const optNames = await Promise.all(optPromises);

      setGamePokemon(targetPoke);
      setGameOptions(optNames);
    } catch (err) {
      console.warn("Gagal memuat kuis baru:", err);
      setApiError("Kuis gagal dimuat.");
    } finally {
      setGameLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'game' && !gamePokemon) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startNewGameRound();
    }
  }, [activeTab, gamePokemon, startNewGameRound]);

  const handleGameGuess = (guess) => {
    if (gameResult) return;
    if (guess === gamePokemon.name) {
      setGameResult('correct');
      playPokemonCry(gamePokemon.id, gamePokemon.types);
      const newScore = gameScore + 1;
      setGameScore(newScore);
      if (newScore > gameHighScore) {
        setGameHighScore(newScore);
        safeSetItem('pokedex_highscore', newScore.toString());
      }
    } else {
      setGameResult('wrong');
      setGameScore(0);
    }
  };

  // Favorites & Compare
  const handleToggleFav = (id) => {
    const p = pokemonList.find(x => x.id === id) || Object.values(cachedDetails).find(x => x.id === id);
    const nameStr = p ? p.name : `Pokémon #${id}`;
    toggleFavorite(id, nameStr);
  };

  const handleToggleCompare = (poke) => {
    if (compareList.some(c => c.id === poke.id)) {
      setCompareList(compareList.filter(c => c.id !== poke.id));
      showToast(`${poke.name} dihapus dari perbandingan.`);
    } else {
      if (compareList.length >= 2) {
        setCompareList([compareList[0], poke]);
        showToast(`${poke.name} dimasukkan ke slot perbandingan kedua.`);
      } else {
        setCompareList([...compareList, poke]);
        showToast(`${poke.name} ditambahkan ke perbandingan.`);
      }
    }
  };

  // Filtered List
  const processedPokemon = useMemo(() => {
    let list = [...pokemonList];
    if (activeTab === 'favorites') {
      list = list.filter(p => favorites.includes(p.id));
    }

    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase().trim();
      list = list.filter(p => p.name.includes(term) || p.id.toString() === term);
    }

    if (selectedType !== 'all') {
      list = list.filter(p => p.types.includes(selectedType));
    }

    if (selectedCategory === 'legendary') {
      list = list.filter(p => p.isLegendary);
    } else if (selectedCategory === 'mythical') {
      list = list.filter(p => p.isMythical);
    }

    list.sort((a, b) => {
      if (sortBy === 'id_asc') return a.id - b.id;
      if (sortBy === 'id_desc') return b.id - a.id;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      return 0;
    });

    return list;
  }, [pokemonList, activeTab, favorites, debouncedSearch, selectedType, selectedCategory, sortBy]);

  const closeTeamSelector = useCallback(() => {
    setShowTeamSelector(false);
    setSelectedPokemonToTeam(null);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedGen('all');
    setSelectedCategory('all');
    setSortBy('id_asc');
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-slate-900 font-sans pb-16">

      {modalLoading && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-700 to-violet-600 animate-pulse z-50"></div>
      )}

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favorites.length}
        compareCount={compareList.length}
        teamsCount={teams.length}
        journalCount={journalLogs.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-neutral-900 border border-neutral-950 text-white text-xs flex justify-between items-center shadow-sm">
            <span className="font-bold">⚠️ {apiError}</span>
            <button onClick={() => setApiError(null)} className="font-extrabold text-[10px] uppercase tracking-wider hover:opacity-80 transition-opacity">Tutup</button>
          </div>
        )}

        {/* TAB EXPLORE & FAVORITES */}
        {(activeTab === 'explore' || activeTab === 'favorites') && (
          <>
            {/* Filters */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-line flex flex-col gap-4 sm:gap-5 mb-6 sm:mb-8 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari Pokémon (cth: '25' atau 'Ditto')..."
                  className="w-full bg-canvas border border-line focus:border-indigo-600 focus:bg-white focus:outline-none transition-all rounded-xl py-3 px-4 text-xs font-bold text-slate-900 placeholder:text-slate-400"
                />
                <button
                  onClick={() => handleLiveSearch(searchTerm)}
                  disabled={loading || !searchTerm.trim()}
                  className="btn-primary w-full md:w-auto min-h-12 whitespace-nowrap"
                >
                  Tembak PokéAPI Live
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[8px] font-black tracking-widest text-neutral-400 mb-1.5 uppercase">Tipe Elemen</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-canvas border border-line py-3 px-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  >
                    <option value="all">Semua Tipe</option>
                    {Object.entries(TYPE_DETAILS).filter(([key]) => key !== 'legendary' && key !== 'mythical').map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-black tracking-widest text-neutral-400 mb-1.5 uppercase">Generasi</label>
                  <select
                    disabled={activeTab === 'favorites'}
                    value={selectedGen}
                    onChange={(e) => setSelectedGen(e.target.value)}
                    className="w-full bg-canvas border border-line py-3 px-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white disabled:opacity-50"
                  >
                    {Object.entries(GENERATIONS).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-black tracking-widest text-neutral-400 mb-1.5 uppercase">Kategori Spesial</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-canvas border border-line py-3 px-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  >
                    <option value="all">Semua Kategori</option>
                    <option value="legendary">Hanya Legendary</option>
                    <option value="mythical">Hanya Mythical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-black tracking-widest text-neutral-400 mb-1.5 uppercase">Urutkan</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-canvas border border-line py-3 px-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  >
                    <option value="id_asc">ID (Terkecil)</option>
                    <option value="id_desc">ID (Terbesar)</option>
                    <option value="name_asc">Nama (A - Z)</option>
                    <option value="name_desc">Nama (Z - A)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid Card List */}
            <p role="status" aria-live="polite" className="mb-3 text-[9px] font-black uppercase tracking-widest text-slate-400 m-0">
              {loading ? 'Memuat…' : `${processedPokemon.length} Pokémon`}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6" aria-busy={loading}>
              {loading && processedPokemon.length === 0 ? (
                <PokemonCardSkeleton count={8} />
              ) : processedPokemon.length === 0 ? (
                activeTab === 'favorites' ? (
                  <EmptyState
                    title="Belum ada favorit"
                    description="Tandai Pokémon dengan ikon hati untuk menyimpannya di sini."
                    actionLabel="Jelajahi Pokémon"
                    onAction={() => setActiveTab('explore')}
                    icon={
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                      </svg>
                    }
                  />
                ) : (
                  <EmptyState
                    title="Tidak ada Pokémon yang cocok"
                    description="Coba ubah kata kunci atau filter yang dipilih."
                    actionLabel="Reset Filter"
                    onAction={resetFilters}
                    icon={
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
                        <circle cx="11" cy="11" r="7" />
                        <path strokeLinecap="round" d="m20 20-3.5-3.5" />
                      </svg>
                    }
                  />
                )
              ) : (
                processedPokemon.map(p => (
                  <PokemonCard
                    key={p.id}
                    pokemon={p}
                    isFav={favorites.includes(p.id)}
                    isComparing={compareList.some(c => c.id === p.id)}
                    onToggleFav={handleToggleFav}
                    onToggleCompare={handleToggleCompare}
                    onOpenDetails={loadFullPokemonDetails}
                    onAddToTeamClick={(poke) => {
                      setSelectedPokemonToTeam(poke);
                      setShowTeamSelector(true);
                    }}
                  />
                ))
              )}
            </div>

            {/* Pagination Load More */}
            {activeTab === 'explore' && selectedGen === 'all' && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => fetchPokemonBatch(false)}
                  disabled={loading}
                  className="px-6 py-3.5 rounded-xl bg-white border border-line hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  {loading ? 'Sedang Memuat...' : 'Muat Lebih Banyak'}
                </button>
              </div>
            )}
          </>
        )}

        {/* TAB COMPARISON */}
        {activeTab === 'compare' && (
          <div className="bg-white p-5 sm:p-8 rounded-3xl border border-line shadow-[0_1px_2px_rgba(17,24,39,.03)] max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-xl font-extrabold text-indigo-700 m-0">Bandingkan Pokémon</h2>
              <p className="text-slate-400 text-xs mt-1 m-0 font-medium">Pilih 2 Pokémon dari tab Jelajah untuk membandingkan statistik mereka.</p>
            </div>

            {/* Pokémon Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 mb-8 sm:mb-10">
              {[0, 1].map(index => {
                const p = compareList[index];
                if (!p) {
                  return (
                    <div key={index} className="h-52 border-2 border-dashed border-line rounded-2xl flex flex-col items-center justify-center text-xs text-slate-400 font-bold bg-canvas/40 gap-2">
                      <svg className="w-8 h-8 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      Pilih Pokémon ke-{index + 1}
                    </div>
                  );
                }
                return (
                  <div key={p.id} className="p-6 bg-canvas/60 rounded-2xl border border-line text-center relative">
                    <button onClick={() => handleToggleCompare(p)} className="absolute top-4 right-4 p-1.5 rounded-lg bg-white text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 font-bold text-[9px] cursor-pointer transition-all border border-line">✕ Hapus</button>
                    <img src={p.sprite} alt={p.name} className="w-24 h-24 mx-auto animate-float-hover" />
                    <h3 className="capitalize font-extrabold text-base text-neutral-900 mt-3 m-0">{p.name}</h3>
                    <span className="font-mono text-[9px] text-neutral-400 font-bold">#{String(p.id).padStart(3, '0')}</span>
                    <div className="flex justify-center gap-1.5 mt-2">
                      {p.types.map(t => (
                        <TypeBadge key={t} type={t} className="text-[8px]" />
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4 text-[9px]">
                      <div className="bg-white p-2 rounded-lg border border-neutral-200/40">
                        <span className="block text-[7px] text-neutral-400 uppercase font-bold">Tinggi</span>
                        <span className="font-mono text-neutral-800 font-bold">{p.height / 10}m</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-neutral-200/40">
                        <span className="block text-[7px] text-neutral-400 uppercase font-bold">Berat</span>
                        <span className="font-mono text-neutral-800 font-bold">{p.weight / 10}kg</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-neutral-200/40">
                        <span className="block text-[7px] text-neutral-400 uppercase font-bold">Total</span>
                        <span className="font-mono text-neutral-800 font-bold">{p.stats.reduce((sum, s) => sum + s.value, 0)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats Comparison Bars */}
            {compareList.length === 2 && (
              <div className="space-y-4">
                <h3 className="text-[9px] font-black tracking-widest text-neutral-400 uppercase m-0 text-center">Perbandingan Statistik Detail</h3>
                <div className="space-y-3">
                  {compareList[0].stats.map((s, i) => {
                    const val1 = s.value;
                    const val2 = compareList[1].stats[i]?.value || 0;
                    const pct1 = (val1 / 165) * 100;
                    const pct2 = (val2 / 165) * 100;
                    const isWinner1 = val1 > val2;
                    const isWinner2 = val2 > val1;
                    const isTie = val1 === val2;
                    const statLabel = s.name.toUpperCase().replace('-', ' ');

                    return (
                      <div key={s.name} className="bg-canvas/50 rounded-xl border border-line p-4">
                        <div className="text-center mb-2">
                          <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">{statLabel}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                          {/* Left value */}
                          <span className={`font-mono text-sm font-bold min-w-[36px] text-right ${isWinner1 ? 'text-neutral-900' : isTie ? 'text-neutral-600' : 'text-neutral-400'}`}>
                            {val1}
                          </span>
                          {/* Left bar */}
                          <div className="flex-1 flex justify-end">
                            <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.min(pct1, 100)}%` }}
                                className={`h-full rounded-full transition-all duration-500 ${isWinner1 ? 'bg-indigo-600' : isTie ? 'bg-slate-400' : 'bg-slate-200'}`}
                              />
                            </div>
                          </div>
                          {/* Divider */}
                          <div className="w-px h-5 bg-neutral-200" />
                          {/* Right bar */}
                          <div className="flex-1">
                            <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.min(pct2, 100)}%` }}
                                className={`h-full rounded-full transition-all duration-500 ${isWinner2 ? 'bg-indigo-600' : isTie ? 'bg-slate-400' : 'bg-slate-200'}`}
                              />
                            </div>
                          </div>
                          {/* Right value */}
                          <span className={`font-mono text-sm font-bold min-w-[36px] text-left ${isWinner2 ? 'text-neutral-900' : isTie ? 'text-neutral-600' : 'text-neutral-400'}`}>
                            {val2}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Total Stats */}
                  {(() => {
                    const total1 = compareList[0].stats.reduce((sum, s) => sum + s.value, 0);
                    const total2 = compareList[1].stats.reduce((sum, s) => sum + s.value, 0);
                    const isWinner1 = total1 > total2;
                    const isWinner2 = total2 > total1;
                    const isTie = total1 === total2;
                    return (
                      <div className="bg-neutral-900 rounded-xl p-4 text-white">
                        <div className="text-center mb-2">
                          <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">TOTAL BASE STATS</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-center flex-1">
                            <span className={`font-mono text-xl font-black ${isWinner1 ? 'text-white' : 'text-neutral-500'}`}>{total1}</span>
                            <span className="block capitalize text-[9px] text-neutral-400 font-bold mt-0.5">{compareList[0].name}</span>
                            {isWinner1 && <span className="text-[8px] text-neutral-300 font-bold">★ UNGGUL</span>}
                          </div>
                          <div className="text-neutral-600 text-xs font-bold">VS</div>
                          <div className="text-center flex-1">
                            <span className={`font-mono text-xl font-black ${isWinner2 ? 'text-white' : 'text-neutral-500'}`}>{total2}</span>
                            <span className="block capitalize text-[9px] text-neutral-400 font-bold mt-0.5">{compareList[1].name}</span>
                            {isWinner2 && <span className="text-[8px] text-neutral-300 font-bold">★ UNGGUL</span>}
                          </div>
                        </div>
                        {isTie && <p className="text-center text-[9px] text-neutral-400 font-bold mt-2 m-0">Seri! Keduanya seimbang.</p>}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB CRUD TEAMS */}
        {activeTab === 'teams' && (
          <TeamManager
            teams={teams}
            onCreateTeam={createTeam}
            onDeleteTeam={deleteTeam}
            onRenameTeam={renameTeam}
            onRemoveFromTeam={removePokemonFromTeam}
          />
        )}

        {/* TAB BATTLE SIMULATOR */}
        {activeTab === 'battle' && (
          <BattleSimulator teams={teams} />
        )}

        {/* TAB GAME */}
        {activeTab === 'game' && (
          <QuizGame
            gamePokemon={gamePokemon}
            gameOptions={gameOptions}
            gameScore={gameScore}
            gameHighScore={gameHighScore}
            gameResult={gameResult}
            gameLoading={gameLoading}
            onGuess={handleGameGuess}
            onNextRound={startNewGameRound}
          />
        )}

        {/* TAB JURNAL */}
        {activeTab === 'journal' && (
          <JournalTimeline
            journalLogs={journalLogs}
            onUpdateJournal={updateJournal}
            onDeleteJournal={deleteJournal}
          />
        )}

      </main>

      {/* OVERLAY: Add to Team Select Modal */}
      {showTeamSelector && selectedPokemonToTeam && (
        <ModalShell onClose={closeTeamSelector} label="Tambahkan ke Tim" panelClassName="max-w-sm p-5 sm:p-8 space-y-5">
            <h3 className="text-sm font-extrabold text-neutral-900 m-0">Tambahkan ke Tim</h3>
            <p className="text-neutral-400 text-xs m-0">Pilih slot tim untuk memasukkan <strong className="capitalize text-neutral-600">{selectedPokemonToTeam.name}</strong>:</p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {teams.map(team => (
                <button
                  key={team.id}
                  onClick={() => {
                    const ok = addPokemonToTeam(team.id, selectedPokemonToTeam);
                    if (ok) {
                      closeTeamSelector();
                    }
                  }}
                  className="w-full p-3 bg-canvas hover:bg-indigo-50 hover:border-indigo-200 border border-line rounded-xl text-left text-xs font-bold capitalize text-slate-700 transition-all flex justify-between items-center cursor-pointer"
                >
                  <span>{team.name}</span>
                  <span className="text-[10px] text-neutral-400">{team.members.length}/6 Anggota</span>
                </button>
              ))}
            </div>

            <button
              onClick={closeTeamSelector}
              className="w-full min-h-11 py-3 bg-neutral-100/80 text-neutral-500 hover:text-neutral-800 font-bold text-xs rounded-xl cursor-pointer border-0 transition-colors"
            >
              Batal
            </button>
        </ModalShell>
      )}

      {/* MODAL DETAIL */}
      {selectedPokemon && (
        <PokemonModal
          key={selectedPokemon.id}
          pokemon={selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
          onOpenDifferentPokemon={loadFullPokemonDetails}
          cachedDetails={cachedDetails}
          journalLogs={journalLogs}
          onCreateJournal={createJournal}
          onUpdateJournal={updateJournal}
          onDeleteJournal={deleteJournal}
        />
      )}

      {/* TOAST NOTIFIKASI */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-neutral-900 border border-indigo-500/30 text-white text-[11px] font-bold tracking-tight shadow-xl flex items-center gap-2.5 animate-slide-up box-border transition-all">
          <svg className="w-3.5 h-3.5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <span className="capitalize">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}