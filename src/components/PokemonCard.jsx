import PropTypes from 'prop-types';
import TypeBadge from './TypeBadge';
import { TYPE_DETAILS } from '../constants/pokemonData';

export default function PokemonCard({
    pokemon,
    isFav,
    isComparing,
    onToggleFav,
    onToggleCompare,
    onOpenDetails,
    onAddToTeamClick
}) {
    return (
        <div className="group relative bg-white rounded-2xl border border-[#e9ebf0] transition-all duration-300 hover:-translate-y-1 flex flex-col shadow-[0_1px_2px_rgba(17,24,39,.03),0_10px_26px_-20px_rgba(17,24,39,.22)] overflow-hidden text-left">

            {/* Header Kartu */}
            <div className="flex items-center justify-between p-4 z-10">
                <span className="font-mono text-xs font-bold tracking-wider text-neutral-300">
                    #{String(pokemon.id).padStart(3, '0')}
                </span>

                <div className="flex items-center gap-1.5">
                    {/* Tambah ke Tim (CRUD) */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddToTeamClick(pokemon); }}
                        className="w-[22px] h-[22px] rounded-lg border border-[#e9ebf0] bg-[#f6f7fb] text-slate-400 inline-flex items-center justify-center transition-all cursor-pointer hover:text-indigo-700 hover:border-indigo-200"
                        title="Tambah ke Tim Tempur"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </button>

                    {/* Bandingkan */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleCompare(pokemon); }}
                        className={`w-[22px] h-[22px] rounded-lg border inline-flex items-center justify-center transition-all cursor-pointer ${isComparing
                                ? 'bg-gradient-to-br from-indigo-700 to-violet-600 border-transparent text-white shadow-[0_4px_10px_-3px_rgba(79,70,229,.5)]'
                                : 'bg-[#f6f7fb] text-slate-400 border-[#e9ebf0] hover:text-indigo-700 hover:border-indigo-200'
                            }`}
                        title="Bandingkan Pokémon"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>
                    </button>

                    {/* Favorit */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleFav(pokemon.id); }}
                        className={`w-[22px] h-[22px] rounded-lg border inline-flex items-center justify-center transition-all cursor-pointer ${isFav
                                ? 'bg-gradient-to-br from-indigo-700 to-violet-600 border-transparent text-white shadow-[0_4px_10px_-3px_rgba(79,70,229,.5)]'
                                : 'bg-[#f6f7fb] text-slate-400 border-[#e9ebf0] hover:text-indigo-700 hover:border-indigo-200'
                            }`}
                        title="Favorit"
                    >
                        <svg className="w-3.5 h-3.5" fill={isFav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    </button>
                </div>
            </div>

            {/* Gambar Pokémon */}
            <div className="flex justify-center items-center relative h-[104px] bg-white">
                <div
                    className="absolute w-[104px] h-[104px] rounded-full opacity-40"
                    style={{ background: `radial-gradient(circle at 50% 42%, ${TYPE_DETAILS[pokemon.types[0]]?.hex ?? '#A8A77A'}, transparent 68%)` }}
                ></div>
                <img
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    loading="lazy"
                    className="w-20 h-20 object-contain z-10 drop-shadow-[0_5px_7px_rgba(0,0,0,.16)] transition-transform duration-300 group-hover:scale-105"
                />
            </div>

            {/* Rincian Singkat */}
            <div className="p-4 flex flex-col flex-grow z-10 border-t border-[#f2f4f7]">
                <h3 className="text-[13.5px] font-bold capitalize tracking-tight text-slate-800 m-0">
                    {pokemon.name}
                </h3>

                {/* Elemen Tipe */}
                <div className="flex gap-1.5 mt-2 flex-wrap">
                    {pokemon.isLegendary && <TypeBadge type="legendary" />}
                    {pokemon.isMythical && <TypeBadge type="mythical" />}
                    {pokemon.types.map(t => (
                        <TypeBadge key={t} type={t} />
                    ))}
                </div>
            </div>

            {/* Detail Button */}
            <button
                onClick={() => onOpenDetails(pokemon)}
                className="w-full py-3 bg-white hover:bg-indigo-50 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-700 border-t border-[#f2f4f7] mt-auto transition-colors cursor-pointer text-center"
            >
                Lihat Pokédex Detail →
            </button>

        </div>
    );
}

PokemonCard.propTypes = {
    pokemon: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        sprite: PropTypes.string,
        types: PropTypes.arrayOf(PropTypes.string).isRequired,
        isLegendary: PropTypes.bool,
        isMythical: PropTypes.bool
    }).isRequired,
    isFav: PropTypes.bool,
    isComparing: PropTypes.bool,
    onToggleFav: PropTypes.func.isRequired,
    onToggleCompare: PropTypes.func.isRequired,
    onOpenDetails: PropTypes.func.isRequired,
    onAddToTeamClick: PropTypes.func.isRequired
};