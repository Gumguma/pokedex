export const TYPE_DETAILS = {
    normal: { color: 'bg-neutral-100 text-neutral-600 border-neutral-200/80', hex: '#A8A77A', label: 'Normal' },
    fire: { color: 'bg-neutral-800 text-neutral-100 border-neutral-900', hex: '#EE8130', label: 'Api' },
    water: { color: 'bg-neutral-200 text-neutral-700 border-neutral-300', hex: '#6390F0', label: 'Air' },
    electric: { color: 'bg-zinc-100 text-zinc-800 border-zinc-300', hex: '#F7D02C', label: 'Listrik' },
    grass: { color: 'bg-zinc-200 text-zinc-700 border-zinc-300', hex: '#7AC74C', label: 'Daun' },
    ice: { color: 'bg-neutral-100 text-neutral-500 border-neutral-250', hex: '#96D9D6', label: 'Es' },
    fighting: { color: 'bg-neutral-700 text-neutral-100 border-neutral-800', hex: '#C22E28', label: 'Petarung' },
    poison: { color: 'bg-zinc-700 text-zinc-100 border-zinc-800', hex: '#A33EA1', label: 'Racun' },
    ground: { color: 'bg-neutral-300/80 text-neutral-800 border-neutral-400/40', hex: '#E2BF65', label: 'Tanah' },
    flying: { color: 'bg-neutral-200/80 text-neutral-600 border-neutral-300', hex: '#A98FF3', label: 'Terbang' },
    psychic: { color: 'bg-neutral-900 text-neutral-100 border-neutral-950', hex: '#F95587', label: 'Psikis' },
    bug: { color: 'bg-zinc-100 text-zinc-600 border-zinc-200', hex: '#A6B91A', label: 'Serangga' },
    rock: { color: 'bg-neutral-400 text-neutral-900 border-neutral-500/50', hex: '#B6A136', label: 'Batu' },
    ghost: { color: 'bg-neutral-850 text-neutral-100 border-neutral-900', hex: '#735797', label: 'Hantu' },
    dragon: { color: 'bg-zinc-900 text-zinc-100 border-zinc-950', hex: '#6F35FC', label: 'Naga' },
    steel: { color: 'bg-neutral-100 text-neutral-700 border-neutral-300', hex: '#B7B7CE', label: 'Baja' },
    fairy: { color: 'bg-zinc-50 text-zinc-600 border-zinc-200', hex: '#D685AD', label: 'Peri' },
    dark: { color: 'bg-zinc-950 text-zinc-50 border-zinc-950', hex: '#705746', label: 'Gelap' }
};

export const TYPE_EFFECTIVENESS = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 }
};

export const GENERATIONS = {
    all: { limit: 10000, offset: 0, label: 'Semua Gen' },
    g1: { limit: 151, offset: 0, label: 'Gen 1 (Kanto)' },
    g2: { limit: 100, offset: 151, label: 'Gen 2 (Johto)' },
    g3: { limit: 135, offset: 251, label: 'Gen 3 (Hoenn)' },
    g4: { limit: 107, offset: 386, label: 'Gen 4 (Sinnoh)' },
    g5: { limit: 156, offset: 493, label: 'Gen 5 (Unova)' },
    g6: { limit: 72, offset: 649, label: 'Gen 6 (Kalos)' },
    g7: { limit: 88, offset: 721, label: 'Gen 7 (Alola)' },
    g8: { limit: 96, offset: 809, label: 'Gen 8 (Galar)' }
};