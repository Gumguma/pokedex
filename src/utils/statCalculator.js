import { TYPE_EFFECTIVENESS } from '../constants/pokemonData';

export const calculateTypeWeakness = (types) => {
    const weaknesses = {};
    const allTypes = [
        'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting',
        'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost',
        'dragon', 'steel', 'fairy', 'dark'
    ];

    allTypes.forEach(t => {
        weaknesses[t] = 1.0;
    });

    types.forEach(pType => {
        allTypes.forEach(attacker => {
            const multiplier = TYPE_EFFECTIVENESS[attacker]?.[pType];
            if (multiplier !== undefined) {
                weaknesses[attacker] *= multiplier;
            }
        });
    });

    return Object.entries(weaknesses)
        .map(([type, val]) => ({ type, multiplier: val }))
        .filter(item => item.multiplier !== 1.0)
        .sort((a, b) => b.multiplier - a.multiplier);
};