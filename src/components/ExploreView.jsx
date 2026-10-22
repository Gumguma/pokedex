import PropTypes from 'prop-types';
import PokemonCard from './PokemonCard';
import PokemonCardSkeleton from './PokemonCardSkeleton';
import EmptyState from './EmptyState';
import { GENERATIONS, TYPE_DETAILS } from '../constants/pokemonData';

const FIELD_CLASS =
  'w-full bg-canvas border border-line py-3 px-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white disabled:opacity-50';
const LABEL_CLASS =
  'block text-[8px] font-black tracking-widest text-neutral-400 mb-1.5 uppercase';

/** Tab Jelajah & Favorit: filer, grid kartu, dan pagination. */
export default function ExploreView({
  activeTab,
  searchTerm,
  onSearchChange,
  onLiveSearch,
  loading,
  selectedType,
  onTypeChange,
  selectedGen,
  onGenChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  pokemon,
  favorites,
  compareList,
  onToggleFav,
  onToggleCompare,
  onOpenDetails,
  onAddToTeam,
  onLoadMore,
  onResetFilters,
  onExplore,
}) {
  const isFavoritesTab = activeTab === 'favorites';

  return (
    <>
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-line flex flex-col gap-4 sm:gap-5 mb-6 sm:mb-8 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari Pokémon (cth: '25' atau 'Ditto')..."
            aria-label="Cari Pokémon"
            className="w-full bg-canvas border border-line focus:border-indigo-600 focus:bg-white focus:outline-none transition-all rounded-xl py-3 px-4 text-xs font-bold text-slate-900 placeholder:text-slate-400"
          />
          <button
            onClick={() => onLiveSearch(searchTerm)}
            disabled={loading || !searchTerm.trim()}
            className="btn-primary w-full md:w-auto min-h-12 whitespace-nowrap"
          >
            Tembak PokéAPI Live
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="filter-type">Tipe Elemen</label>
            <select
              id="filter-type"
              value={selectedType}
              onChange={(event) => onTypeChange(event.target.value)}
              className={FIELD_CLASS}
            >
              <option value="all">Semua Tipe</option>
              {Object.entries(TYPE_DETAILS)
                .filter(([key]) => key !== 'legendary' && key !== 'mythical')
                .map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="filter-gen">Generasi</label>
            <select
              id="filter-gen"
              disabled={isFavoritesTab}
              value={selectedGen}
              onChange={(event) => onGenChange(event.target.value)}
              className={FIELD_CLASS}
            >
              {Object.entries(GENERATIONS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="filter-category">Kategori Spesial</label>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={(event) => onCategoryChange(event.target.value)}
              className={FIELD_CLASS}
            >
              <option value="all">Semua Kategori</option>
              <option value="legendary">Hanya Legendary</option>
              <option value="mythical">Hanya Mythical</option>
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="filter-sort">Urutkan</label>
            <select
              id="filter-sort"
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value)}
              className={FIELD_CLASS}
            >
              <option value="id_asc">ID (Terkecil)</option>
              <option value="id_desc">ID (Terbesar)</option>
              <option value="name_asc">Nama (A - Z)</option>
              <option value="name_desc">Nama (Z - A)</option>
            </select>
          </div>
        </div>
      </div>

      <p role="status" aria-live="polite" className="mb-3 text-[9px] font-black uppercase tracking-widest text-slate-400 m-0">
        {loading ? 'Memuat…' : `${pokemon.length} Pokémon`}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6" aria-busy={loading}>
        {loading && pokemon.length === 0 ? (
          <PokemonCardSkeleton count={8} />
        ) : pokemon.length === 0 ? (
          isFavoritesTab ? (
            <EmptyState
              title="Belum ada favorit"
              description="Tandai Pokémon dengan ikon hati untuk menyimpannya di sini."
              actionLabel="Jelajahi Pokémon"
              onAction={onExplore}
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
              onAction={onResetFilters}
              icon={
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="m20 20-3.5-3.5" />
                </svg>
              }
            />
          )
        ) : (
          pokemon.map((p) => (
            <PokemonCard
              key={p.id}
              pokemon={p}
              isFav={favorites.includes(p.id)}
              isComparing={compareList.some((c) => c.id === p.id)}
              onToggleFav={onToggleFav}
              onToggleCompare={onToggleCompare}
              onOpenDetails={onOpenDetails}
              onAddToTeamClick={onAddToTeam}
            />
          ))
        )}
      </div>

      {!isFavoritesTab && selectedGen === 'all' && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-3.5 rounded-xl bg-white border border-line hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            {loading ? 'Sedang Memuat...' : 'Muat Lebih Banyak'}
          </button>
        </div>
      )}
    </>
  );
}

ExploreView.propTypes = {
  activeTab: PropTypes.string.isRequired,
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onLiveSearch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  selectedType: PropTypes.string.isRequired,
  onTypeChange: PropTypes.func.isRequired,
  selectedGen: PropTypes.string.isRequired,
  onGenChange: PropTypes.func.isRequired,
  selectedCategory: PropTypes.string.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
  pokemon: PropTypes.arrayOf(PropTypes.object).isRequired,
  favorites: PropTypes.arrayOf(PropTypes.number).isRequired,
  compareList: PropTypes.arrayOf(PropTypes.object).isRequired,
  onToggleFav: PropTypes.func.isRequired,
  onToggleCompare: PropTypes.func.isRequired,
  onOpenDetails: PropTypes.func.isRequired,
  onAddToTeam: PropTypes.func.isRequired,
  onLoadMore: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
  onExplore: PropTypes.func.isRequired,
};
