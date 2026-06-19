import { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import PokemonCard from './components/PokemonCard';
import PokemonModal from './components/PokemonModal';
import TeamManager from './components/TeamManager';
import QuizGame from './components/QuizGame';
import JournalTimeline from './components/JournalTimeline';

import { GENERATIONS, TYPE_DETAILS } from './constants/pokemonData';
import { playPokemonCry } from './utils/audioHelper';

export default function App() {
  // Global States
  const [pokemonList, setPokemonList] = useState([]);
  const [cachedDetails, setCachedDetails] = useState({});
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('pokedex_favs');
    return saved ? JSON.parse(saved) : [];
  });
  const [journalLogs, setJournalLogs] = useState(() => {
    const saved = localStorage.getItem('pokedex_journal');
    return saved ? JSON.parse(saved) : [];
  });
  const [toastMessage, setToastMessage] = useState(null);

  // CRUD Team State
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('pokedex_teams');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Tim Utama Saya', members: [] }
    ];
  });

  // Navigation & Filtering States
  const [activeTab, setActiveTab] = useState('explore');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedGen, setSelectedGen] = useState('all');
  const [sortBy, setSortBy] = useState('id_asc');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Overlay Team Selector State
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [selectedPokemonToTeam, setSelectedPokemonToTeam] = useState(null);

  // Modal / Comparison States
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [compareList, setCompareList] = useState([]);

  // Game States
  const [gamePokemon, setGamePokemon] = useState(null);
  const [gameOptions, setGameOptions] = useState([]);
  const [gameScore, setGameScore] = useState(0);
  const [gameHighScore, setGameHighScore] = useState(() => {
    return parseInt(localStorage.getItem('pokedex_highscore') || '0', 10);
  });
  const [gameResult, setGameResult] = useState(null);
  const [gameLoading, setGameLoading] = useState(false);

  // Auto-sync LocalStorage
  useEffect(() => {
    localStorage.setItem('pokedex_favs', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('pokedex_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('pokedex_journal', JSON.stringify(journalLogs));
  }, [journalLogs]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
  }, []);

  // Fetching Pokemons
  const fetchPokemonBatch = useCallback(async (reset = false) => {
    setLoading(true);
    setApiError(null);
    try {
      let currentLimit = 24;
      let currentOffset = reset ? 0 : offset;

      if (selectedGen !== 'all') {
        currentLimit = GENERATIONS[selectedGen].limit;
        currentOffset = GENERATIONS[selectedGen].offset;
      }

      const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${currentLimit}&offset=${currentOffset}`);
      if (!res.ok) throw new Error();
      const data = await res.json();

      const detailedPromises = data.results.map(async (p) => {
        if (cachedDetails[p.name]) return cachedDetails[p.name];

        const pRes = await fetch(p.url);
        if (!pRes.ok) return null;
        const pData = await pRes.json();

        const mapped = {
          id: pData.id,
          name: pData.name,
          types: pData.types.map(t => t.type.name),
          sprite: pData.sprites.other['official-artwork'].front_default || pData.sprites.front_default,
          stats: pData.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
          height: pData.height,
          weight: pData.weight,
          abilities: pData.abilities.map(a => a.ability.name),
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
      console.warn("Gagal memuat batch Pokémon:", err);
      setApiError('Tidak dapat memuat data dari server PokéAPI.');
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

      setSelectedPokemon({
        ...pokemon,
        desc,
        category,
        evolution
      });
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
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${cleanTerm}`);
      if (!res.ok) throw new Error();
      const pData = await res.json();

      const mapped = {
        id: pData.id,
        name: pData.name,
        types: pData.types.map(t => t.type.name),
        sprite: pData.sprites.other['official-artwork'].front_default || pData.sprites.front_default,
        stats: pData.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
        height: pData.height,
        weight: pData.weight,
        abilities: pData.abilities.map(a => a.ability.name),
      };

      setPokemonList(prev => {
        if (prev.some(p => p.id === mapped.id)) return prev;
        return [mapped, ...prev];
      });

      setCachedDetails(prev => ({ ...prev, [mapped.name]: mapped }));
      loadFullPokemonDetails(mapped);
    } catch (err) {
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
        sprite: pData.sprites.other['official-artwork'].front_default || pData.sprites.front_default,
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
        localStorage.setItem('pokedex_highscore', newScore.toString());
      }
    } else {
      setGameResult('wrong');
      setGameScore(0);
    }
  };

  // CRUD Team Handlers
  const handleCreateTeam = (name) => {
    const newTeam = {
      id: Date.now().toString(),
      name,
      members: []
    };
    setTeams([...teams, newTeam]);
    showToast(`Tim "${name}" berhasil dibuat.`);
  };

  const handleDeleteTeam = (id) => {
    const team = teams.find(t => t.id === id);
    setTeams(teams.filter(t => t.id !== id));
    if (team) {
      showToast(`Tim "${team.name}" berhasil dihapus.`);
    }
  };

  const handleRenameTeam = (id, newName) => {
    setTeams(teams.map(t => t.id === id ? { ...t, name: newName } : t));
    showToast(`Nama tim diubah menjadi "${newName}".`);
  };

  const handleAddToTeam = (teamId, pokemon) => {
    let added = false;
    let targetTeamName = '';
    let errorMsg = '';
    
    setTeams(teams.map(t => {
      if (t.id === teamId) {
        if (t.members.length >= 6) {
          errorMsg = "Satu tim maksimal berisi 6 Pokémon.";
          return t;
        }
        if (t.members.some(m => m.id === pokemon.id)) {
          errorMsg = "Pokémon ini sudah ada di dalam tim ini.";
          return t;
        }
        added = true;
        targetTeamName = t.name;
        return { ...t, members: [...t.members, pokemon] };
      }
      return t;
    }));

    if (errorMsg) {
      setApiError(errorMsg);
    } else if (added) {
      showToast(`${pokemon.name} ditambahkan ke ${targetTeamName}.`);
    }
    setShowTeamSelector(false);
  };

  const handleRemoveFromTeam = (teamId, pokemonId) => {
    let removedName = '';
    let targetTeamName = '';
    
    setTeams(teams.map(t => {
      if (t.id === teamId) {
        const member = t.members.find(m => m.id === pokemonId);
        if (member) {
          removedName = member.name;
          targetTeamName = t.name;
        }
        return { ...t, members: t.members.filter(m => m.id !== pokemonId) };
      }
      return t;
    }));

    if (removedName) {
      showToast(`${removedName} dihapus dari ${targetTeamName}.`);
    }
  };

  // CRUD Journal Handlers
  const handleCreateJournal = (log) => {
    const newLog = {
      id: Date.now().toString(),
      ...log
    };
    setJournalLogs([newLog, ...journalLogs]);
    showToast(`Jurnal tangkapan untuk ${log.pokemonName} berhasil disimpan.`);
  };

  const handleUpdateJournal = (id, updatedLog) => {
    setJournalLogs(journalLogs.map(log => 
      log.id === id ? { ...log, ...updatedLog } : log
    ));
    showToast("Jurnal tangkapan berhasil diperbarui.");
  };

  const handleDeleteJournal = (id) => {
    const log = journalLogs.find(l => l.id === id);
    setJournalLogs(journalLogs.filter(log => log.id !== id));
    if (log) {
      showToast(`Jurnal tangkapan untuk ${log.pokemonName} berhasil dihapus.`);
    } else {
      showToast("Jurnal tangkapan berhasil dihapus.");
    }
  };

  // Favorites & Compare
  const handleToggleFav = (id) => {
    const p = pokemonList.find(x => x.id === id) || Object.values(cachedDetails).find(x => x.id === id);
    const nameStr = p ? p.name : `Pokémon #${id}`;
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
      showToast(`${nameStr} dihapus dari Favorit.`);
    } else {
      setFavorites([...favorites, id]);
      showToast(`${nameStr} ditambahkan ke Favorit.`);
    }
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

    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter(p => p.name.includes(term) || p.id.toString() === term);
    }

    if (selectedType !== 'all') {
      list = list.filter(p => p.types.includes(selectedType));
    }

    list.sort((a, b) => {
      if (sortBy === 'id_asc') return a.id - b.id;
      if (sortBy === 'id_desc') return b.id - a.id;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      return 0;
    });

    return list;
  }, [pokemonList, activeTab, favorites, searchTerm, selectedType, sortBy]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 font-sans pb-16">

      {modalLoading && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-neutral-900 animate-pulse z-50"></div>
      )}

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favorites.length}
        compareCount={compareList.length}
        teamsCount={teams.length}
        journalCount={journalLogs.length}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">

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
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/50 flex flex-col gap-5 mb-8 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari Pokémon (cth: '25' atau 'Ditto')..."
                  className="w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-800 focus:bg-white focus:outline-none transition-all rounded-xl py-3 px-4 text-xs font-bold text-neutral-900 placeholder:text-neutral-400"
                />
                <button
                  onClick={() => handleLiveSearch(searchTerm)}
                  disabled={loading || !searchTerm.trim()}
                  className="w-full md:w-auto px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-850 disabled:opacity-40 text-white font-bold text-xs transition-all whitespace-nowrap cursor-pointer shadow-sm"
                >
                  Tembak PokéAPI Live
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[8px] font-black tracking-widest text-neutral-400 mb-1.5 uppercase">Tipe Elemen</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 py-2.5 px-3 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-neutral-800"
                  >
                    <option value="all">Semua Tipe</option>
                    {Object.entries(TYPE_DETAILS).map(([key, val]) => (
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
                    className="w-full bg-neutral-50 border border-neutral-200 py-2.5 px-3 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-neutral-800 disabled:opacity-50"
                  >
                    {Object.entries(GENERATIONS).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-black tracking-widest text-neutral-400 mb-1.5 uppercase">Urutkan</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 py-2.5 px-3 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-neutral-800"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {processedPokemon.map(p => (
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
              ))}
            </div>

            {/* Pagination Load More */}
            {activeTab === 'explore' && selectedGen === 'all' && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => fetchPokemonBatch(false)}
                  disabled={loading}
                  className="px-6 py-3.5 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 text-neutral-800 text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  {loading ? 'Sedang Memuat...' : 'Muat Lebih Banyak'}
                </button>
              </div>
            )}
          </>
        )}

        {/* TAB COMPARISON */}
        {activeTab === 'compare' && (
          <div className="bg-white p-8 rounded-3xl border border-neutral-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.01)] max-w-4xl mx-auto">
            <h2 className="text-xl font-extrabold text-neutral-900 text-center mb-8">Bandingkan Pokémon</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[0, 1].map(index => {
                const p = compareList[index];
                if (!p) {
                  return (
                     <div key={index} className="h-44 border border-dashed border-neutral-200 rounded-2xl flex items-center justify-center text-xs text-neutral-400 font-bold bg-neutral-50/30">
                      Pilih Pokémon ke-{index + 1} dari tab Jelajah
                    </div>
                  );
                }
                return (
                  <div key={p.id} className="p-6 bg-neutral-50/50 rounded-2xl border border-neutral-200/40 text-center relative">
                    <button onClick={() => handleToggleCompare(p)} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 font-bold text-[10px] cursor-pointer transition-colors bg-transparent border-0">Hapus</button>
                    <img src={p.sprite} alt={p.name} className="w-24 h-24 mx-auto animate-float-hover" />
                    <h3 className="capitalize font-extrabold text-sm text-neutral-850 mt-4">{p.name}</h3>
                    <div className="grid grid-cols-2 gap-2.5 mt-6 text-[9px] font-bold text-left">
                      {p.stats.map(s => (
                        <div key={s.name} className="bg-white p-3 rounded-xl border border-neutral-200/40 flex justify-between items-center">
                          <span className="text-neutral-450 uppercase text-[8px] tracking-wider">{s.name.replace('-', ' ')}</span>
                          <span className="font-mono text-neutral-900 font-bold">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB CRUD TEAMS */}
        {activeTab === 'teams' && (
          <TeamManager
            teams={teams}
            onCreateTeam={handleCreateTeam}
            onDeleteTeam={handleDeleteTeam}
            onRenameTeam={handleRenameTeam}
            onRemoveFromTeam={handleRemoveFromTeam}
          />
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
            onUpdateJournal={handleUpdateJournal}
            onDeleteJournal={handleDeleteJournal}
          />
        )}

      </main>

      {/* OVERLAY: Add to Team Select Modal */}
      {showTeamSelector && selectedPokemonToTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-neutral-950/20">
          <div className="bg-white rounded-3xl border border-neutral-200/60 p-8 max-w-sm w-full space-y-5 shadow-2xl">
            <h3 className="text-sm font-extrabold text-neutral-900 m-0">Tambahkan ke Tim</h3>
            <p className="text-neutral-400 text-xs m-0">Pilih slot tim untuk memasukkan <strong className="capitalize text-neutral-600">{selectedPokemonToTeam.name}</strong>:</p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {teams.map(team => (
                <button
                  key={team.id}
                  onClick={() => handleAddToTeam(team.id, selectedPokemonToTeam)}
                  className="w-full p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/60 rounded-xl text-left text-xs font-bold capitalize text-neutral-700 transition-all flex justify-between items-center cursor-pointer"
                >
                  <span>{team.name}</span>
                  <span className="text-[10px] text-neutral-400">{team.members.length}/6 Anggota</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => { setShowTeamSelector(false); setSelectedPokemonToTeam(null); }}
              className="w-full py-3 bg-neutral-100/80 text-neutral-500 hover:text-neutral-800 font-bold text-xs rounded-xl cursor-pointer border-0 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
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
          onCreateJournal={handleCreateJournal}
          onUpdateJournal={handleUpdateJournal}
          onDeleteJournal={handleDeleteJournal}
        />
      )}

      {/* TOAST NOTIFIKASI */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-neutral-900 border border-neutral-950 text-white text-[11px] font-bold tracking-tight shadow-xl flex items-center gap-2.5 animate-slide-up box-border transition-all">
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