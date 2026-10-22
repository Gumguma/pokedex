import PropTypes from 'prop-types';
const baseButton = "relative w-[22px] h-[22px] rounded-lg border inline-flex items-center justify-center transition-all cursor-pointer active:scale-90 after:absolute after:-inset-[11px] after:content-['']";

export default function CardActions({ pokemon, isFav, isComparing, onToggleFav, onToggleCompare, onAddToTeamClick }) {
    const toggleState = (active) => active
        ? 'bg-gradient-to-br from-indigo-700 to-violet-600 border-transparent text-white shadow-[0_4px_10px_-3px_rgba(79,70,229,.5)]'
        : 'bg-canvas text-slate-400 border-line hover:text-indigo-700 hover:border-indigo-200';

    return (
        <div className="flex items-center gap-1.5">
            <button
                onClick={(e) => { e.stopPropagation(); onAddToTeamClick(pokemon); }}
                className={`${baseButton} bg-canvas text-slate-400 border-line hover:text-indigo-700 hover:border-indigo-200`}
                title="Tambah ke Tim Tempur"
                aria-label="Tambah ke Tim Tempur"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </button>

            <button
                onClick={(e) => { e.stopPropagation(); onToggleCompare(pokemon); }}
                className={`${baseButton} ${toggleState(isComparing)}`}
                title="Bandingkan Pokémon"
                aria-label="Bandingkan Pokémon"
                aria-pressed={isComparing}
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>
            </button>

            <button
                onClick={(e) => { e.stopPropagation(); onToggleFav(pokemon.id); }}
                className={`${baseButton} ${toggleState(isFav)}`}
                title="Favorit"
                aria-label="Favorit"
                aria-pressed={isFav}
            >
                <svg className="w-3.5 h-3.5" fill={isFav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </button>
        </div>
    );
}

CardActions.propTypes = {
  pokemon: PropTypes.object.isRequired,
  isFav: PropTypes.bool.isRequired,
  isComparing: PropTypes.bool.isRequired,
  onToggleFav: PropTypes.func.isRequired,
  onToggleCompare: PropTypes.func.isRequired,
  onAddToTeamClick: PropTypes.func.isRequired,
};
