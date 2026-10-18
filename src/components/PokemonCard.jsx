import PropTypes from 'prop-types';
import TypeBadge from './TypeBadge';
import CardActions from './CardActions';
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
        <div className="group relative bg-white rounded-2xl border border-line transition-all duration-300 hover:-translate-y-1 flex flex-col shadow-[0_1px_2px_rgba(17,24,39,.03),0_10px_26px_-20px_rgba(17,24,39,.22)] overflow-hidden text-left">

            {/* Header Kartu */}
            <div className="flex items-center justify-between p-3 sm:p-4 z-10">
                <span className="font-mono text-xs font-bold tracking-wider text-neutral-300">
                    #{String(pokemon.id).padStart(3, '0')}
                </span>

                <CardActions
                    pokemon={pokemon}
                    isFav={isFav}
                    isComparing={isComparing}
                    onToggleFav={onToggleFav}
                    onToggleCompare={onToggleCompare}
                    onAddToTeamClick={onAddToTeamClick}
                />
            </div>

            {/* Gambar Pokémon */}
            <div className="flex justify-center items-center relative h-20 sm:h-[104px] bg-white">
                <div
                    className="absolute w-20 h-20 sm:w-[104px] sm:h-[104px] rounded-full opacity-40"
                    style={{ background: `radial-gradient(circle at 50% 42%, ${TYPE_DETAILS[pokemon.types?.[0]]?.hex ?? '#A8A77A'}, transparent 68%)` }}
                ></div>
                <img
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    loading="lazy"
                    className="w-20 h-20 object-contain z-10 drop-shadow-[0_5px_7px_rgba(0,0,0,.16)] transition-transform duration-300 group-hover:scale-105"
                />
            </div>

            {/* Rincian Singkat */}
            <div className="p-3.5 sm:p-4 flex flex-col flex-grow z-10 border-t border-line-soft">
                <h3 className="text-[12.5px] sm:text-[13.5px] font-bold capitalize tracking-tight text-slate-800 m-0">
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
                className="w-full py-3.5 bg-white hover:bg-indigo-50 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-700 border-t border-line-soft mt-auto transition-colors cursor-pointer text-center"
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