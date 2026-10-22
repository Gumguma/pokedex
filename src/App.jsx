import { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import PokemonModal from './components/PokemonModal';
import TeamManager from './components/TeamManager';
import QuizGame from './components/QuizGame';
import JournalTimeline from './components/JournalTimeline';
import BattleSimulator from './components/BattleSimulator';
import ModalShell from './components/ModalShell';
import ExploreView from './components/ExploreView';
import CompareView from './components/CompareView';

import { useDebounce } from './hooks/useDebounce';
import { useFavorites } from './hooks/useFavorites';
import { useTeams } from './hooks/useTeams';
import { useJournal } from './hooks/useJournal';
import { usePokemonCollection } from './hooks/usePokemonCollection';
import { safeSetItem, safeGetItem } from './utils/storage';
import { playPokemonCry } from './utils/audioHelper';

export default function App() {
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
  }, []);

  const handleApiError = useCallback((msg) => {
    showToast(msg);
  }, [showToast]);

  // Navigation & Filtering States
  const [activeTab, setActiveTab] = useState('explore');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedGen, setSelectedGen] = useState('all');
  const [sortBy, setSortBy] = useState('id_asc');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Data Pokémon (fetch, cache, detail, kuis)
  const {
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
  } = usePokemonCollection({ selectedGen });

  const { favorites, toggleFavorite } = useFavorites(showToast);
  const {
    teams,
    createTeam,
    deleteTeam,
    renameTeam,
    addPokemonToTeam,
    removePokemonFromTeam,
  } = useTeams(showToast, handleApiError);
  const {
    journalLogs,
    createJournal,
    updateJournal,
    deleteJournal,
  } = useJournal(showToast, handleApiError);

  // Overlay Team Selector State
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [selectedPokemonToTeam, setSelectedPokemonToTeam] = useState(null);

  // Comparison States
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
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Game Logic
  const startNewGameRound = useCallback(async () => {
    setGameLoading(true);
    setGameResult(null);
    try {
      const round = await fetchQuizRound();
      setGamePokemon(round.pokemon);
      setGameOptions(round.options);
    } catch {
      showToast('Kuis gagal dimuat.');
    } finally {
      setGameLoading(false);
    }
  }, [fetchQuizRound, showToast]);

  useEffect(() => {
    if (activeTab === 'game' && !gamePokemon) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startNewGameRound();
    }
  }, [activeTab, gamePokemon, startNewGameRound]);

  const handleGameGuess = (guess) => {
    if (gameResult || !gamePokemon) return;
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
    const p = pokemonList.find((x) => x.id === id) || Object.values(cachedDetails).find((x) => x.id === id);
    toggleFavorite(id, p ? p.name : `Pokémon #${id}`);
  };

  const handleToggleCompare = (poke) => {
    if (compareList.some((c) => c.id === poke.id)) {
      setCompareList(compareList.filter((c) => c.id !== poke.id));
      showToast(`${poke.name} dihapus dari perbandingan.`);
      return;
    }
    if (compareList.length >= 2) {
      setCompareList([compareList[0], poke]);
      showToast(`${poke.name} dimasukkan ke slot perbandingan kedua.`);
    } else {
      setCompareList([...compareList, poke]);
      showToast(`${poke.name} ditambahkan ke perbandingan.`);
    }
  };

  // Filtered List
  const processedPokemon = useMemo(() => {
    let list = [...pokemonList];
    if (activeTab === 'favorites') {
      list = list.filter((p) => favorites.includes(p.id));
    }
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase().trim();
      list = list.filter((p) => p.name.includes(term) || p.id.toString() === term);
    }
    if (selectedType !== 'all') {
      list = list.filter((p) => p.types.includes(selectedType));
    }
    if (selectedCategory === 'legendary') {
      list = list.filter((p) => p.isLegendary);
    } else if (selectedCategory === 'mythical') {
      list = list.filter((p) => p.isMythical);
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

  const openTeamSelector = useCallback((poke) => {
    setSelectedPokemonToTeam(poke);
    setShowTeamSelector(true);
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-slate-900 font-sans pb-16">
      {modalLoading && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-700 to-violet-600 animate-pulse z-50" />
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
            <button
              onClick={() => setApiError(null)}
              className="font-extrabold text-[10px] uppercase tracking-wider hover:opacity-80 transition-opacity"
            >
              Tutup
            </button>
          </div>
        )}

        {partialWarning && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex justify-between items-center gap-3">
            <span className="font-bold">{partialWarning}</span>
            <button
              onClick={() => setPartialWarning(null)}
              className="font-extrabold text-[10px] uppercase tracking-wider hover:opacity-80 transition-opacity"
            >
              Tutup
            </button>
          </div>
        )}

        {(activeTab === 'explore' || activeTab === 'favorites') && (
          <ExploreView
            activeTab={activeTab}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onLiveSearch={handleLiveSearch}
            loading={loading}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedGen={selectedGen}
            onGenChange={setSelectedGen}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
            pokemon={processedPokemon}
            favorites={favorites}
            compareList={compareList}
            onToggleFav={handleToggleFav}
            onToggleCompare={handleToggleCompare}
            onOpenDetails={loadFullPokemonDetails}
            onAddToTeam={openTeamSelector}
            onLoadMore={() => fetchPokemonBatch(false)}
            onResetFilters={resetFilters}
            onExplore={() => setActiveTab('explore')}
          />
        )}

        {activeTab === 'compare' && (
          <CompareView compareList={compareList} onRemove={handleToggleCompare} />
        )}

        {activeTab === 'teams' && (
          <TeamManager
            teams={teams}
            onCreateTeam={createTeam}
            onDeleteTeam={deleteTeam}
            onRenameTeam={renameTeam}
            onRemoveFromTeam={removePokemonFromTeam}
          />
        )}

        {activeTab === 'battle' && <BattleSimulator teams={teams} />}

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
        <ModalShell
          onClose={closeTeamSelector}
          label="Tambahkan ke Tim"
          panelClassName="max-w-sm p-5 sm:p-8 space-y-5"
        >
          <h3 className="text-sm font-extrabold text-neutral-900 m-0">Tambahkan ke Tim</h3>
          <p className="text-neutral-400 text-xs m-0">
            Pilih slot tim untuk memasukkan{' '}
            <strong className="capitalize text-neutral-600">{selectedPokemonToTeam.name}</strong>:
          </p>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => {
                  const ok = addPokemonToTeam(team.id, selectedPokemonToTeam);
                  if (ok) closeTeamSelector();
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
          onClose={clearDetail}
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
