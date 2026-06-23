import TypeBadge from './TypeBadge';

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
        <div className="group relative bg-white rounded-2xl border border-neutral-200/40 hover:border-neutral-300/80 transition-all duration-300 hover:-translate-y-1 flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] overflow-hidden text-left">

            {/* Header Kartu */}
            <div className="flex items-center justify-between p-4 z-10">
                <span className="font-mono text-xs font-bold tracking-wider text-neutral-300">
                    #{String(pokemon.id).padStart(3, '0')}
                </span>

                <div className="flex items-center gap-1.5">
                    {/* Tambah ke Tim (CRUD) */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddToTeamClick(pokemon); }}
                        className="p-1.5 rounded-lg border bg-neutral-50 text-neutral-400 border-neutral-200/60 hover:text-neutral-900 hover:border-neutral-300 hover:bg-white transition-all cursor-pointer"
                        title="Tambah ke Tim Tempur"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </button>

                    {/* Bandingkan */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleCompare(pokemon); }}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isComparing
                                ? 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800'
                                : 'bg-neutral-50 text-neutral-400 border-neutral-200/60 hover:text-neutral-900 hover:border-neutral-300 hover:bg-white'
                            }`}
                        title="Bandingkan Pokémon"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>
                    </button>

                    {/* Favorit */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleFav(pokemon.id); }}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isFav
                                ? 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800'
                                : 'bg-neutral-50 text-neutral-400 border-neutral-200/60 hover:text-neutral-900 hover:border-neutral-300 hover:bg-white'
                            }`}
                        title="Favorit"
                    >
                        <svg className="w-3.5 h-3.5" fill={isFav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    </button>
                </div>
            </div>

            {/* Gambar Pokémon */}
            <div className="flex justify-center items-center py-4 relative h-36">
                <div className="absolute w-20 h-20 bg-neutral-100/50 rounded-full blur-md transition-all duration-300 group-hover:bg-neutral-200/30"></div>
                <img
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    loading="lazy"
                    className="w-28 h-28 object-contain z-10 filter drop-shadow-sm transition-all duration-350 group-hover:scale-105 group-hover:animate-float-hover"
                />
            </div>

            {/* Rincian Singkat */}
            <div className="p-4 flex flex-col flex-grow z-10 bg-neutral-50/30 border-t border-neutral-100/60">
                <h3 className="text-sm font-bold capitalize tracking-tight text-neutral-800 m-0">
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
                className="w-full py-3 bg-white hover:bg-neutral-50 text-[9px] font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-800 border-t border-neutral-100 mt-auto transition-colors duration-250 cursor-pointer text-center"
            >
                Lihat Pokédex Detail →
            </button>

        </div>
    );
}