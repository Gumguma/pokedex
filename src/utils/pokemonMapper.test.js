import test from 'node:test';
import assert from 'node:assert/strict';
import {
  artworkUrl,
  buildEvolutionChain,
  describeFetchError,
  mapPokemon,
  mapQuizPokemon,
  mergeSpeciesDetails,
  pickLocalized,
  spriteOf,
  titleCaseMove,
} from './pokemonMapper.js';

const rawPokemon = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  types: [{ type: { name: 'electric' } }],
  abilities: [{ ability: { name: 'static' } }],
  stats: [
    { base_stat: 35, stat: { name: 'hp' } },
    { base_stat: 55, stat: { name: 'attack' } },
  ],
  sprites: { other: { 'official-artwork': { front_default: 'art.png' } }, front_default: 'small.png' },
  moves: [
    { move: { name: 'quick-attack' } },
    { move: { name: 'thunder-shock' } },
  ],
};

test('titleCaseMove mengubah slug jadi judul', () => {
  assert.equal(titleCaseMove('thunder-shock'), 'Thunder Shock');
  assert.equal(titleCaseMove('tackle'), 'Tackle');
});

test('spriteOf memilih artwork resmi lebih dulu', () => {
  assert.equal(spriteOf(rawPokemon), 'art.png');
  assert.equal(spriteOf({ sprites: { front_default: 'small.png' } }), 'small.png');
  assert.match(spriteOf({}), /pokemon\/0\.png$/);
});

test('artworkUrl memakai ID', () => {
  assert.match(artworkUrl(25), /official-artwork\/25\.png$/);
});

test('mapPokemon memetakan field kartu', () => {
  const p = mapPokemon(rawPokemon);
  assert.equal(p.id, 25);
  assert.equal(p.name, 'pikachu');
  assert.deepEqual(p.types, ['electric']);
  assert.deepEqual(p.stats, [
    { name: 'hp', value: 35 },
    { name: 'attack', value: 55 },
  ]);
  assert.deepEqual(p.abilities, ['static']);
  assert.deepEqual(p.moves, ['Quick Attack', 'Thunder Shock']);
  assert.equal(p.isLegendary, false);
});

test('mapPokemon memberi move default kalau kosong', () => {
  const p = mapPokemon({ ...rawPokemon, moves: [] });
  assert.deepEqual(p.moves, ['Tackle', 'Growl', 'Pound', 'Scratch']);
});

test('mapPokemon menandai legendary sesuai daftar ID', () => {
  const mewtwo = mapPokemon({ ...rawPokemon, id: 150 });
  assert.equal(mewtwo.isLegendary, true);
});

test('mapQuizPokemon memakai nama kapital', () => {
  const q = mapQuizPokemon(rawPokemon);
  assert.equal(q.name, 'PIKACHU');
  assert.equal(q.sprite, 'art.png');
  assert.deepEqual(q.types, ['electric']);
  assert.equal(q.stats, undefined);
});

test('pickLocalized memilih id lalu en lalu fallback', () => {
  const entries = [
    { language: { name: 'en' }, flavor_text: 'English text' },
    { language: { name: 'id' }, flavor_text: 'Teks Indonesia' },
  ];
  assert.equal(pickLocalized(entries, 'flavor_text', 'x'), 'Teks Indonesia');
  assert.equal(
    pickLocalized([{ language: { name: 'en' }, flavor_text: 'English text' }], 'flavor_text', 'x'),
    'English text',
  );
  assert.equal(pickLocalized([], 'flavor_text', 'fallback'), 'fallback');
  assert.equal(pickLocalized(undefined, 'flavor_text', 'fallback'), 'fallback');
});

test('buildEvolutionChain menelusuri evolves_to', () => {
  const chain = {
    species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
    evolves_to: [
      {
        species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
        evolves_to: [
          { species: { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon-species/3/' }, evolves_to: [] },
        ],
      },
    ],
  };
  const evo = buildEvolutionChain(chain);
  assert.deepEqual(evo.map((e) => e.name), ['bulbasaur', 'ivysaur', 'venusaur']);
  assert.deepEqual(evo.map((e) => e.id), [1, 2, 3]);
  assert.match(evo[2].sprite, /official-artwork\/3\.png$/);
});

test('mergeSpeciesDetails membersihkan newline dan fallback kategori', () => {
  const pokemon = mapPokemon(rawPokemon);
  const species = {
    flavor_text_entries: [{ language: { name: 'id' }, flavor_text: 'Tikus\nlistrik\fmini' }],
    genera: [],
  };
  const merged = mergeSpeciesDetails(pokemon, species, null);
  assert.equal(merged.desc, 'Tikus listrik mini');
  assert.equal(merged.category, 'Pokémon');
  assert.deepEqual(merged.evolution, []);
});

test('mergeSpeciesDetails menandai legendary dari species', () => {
  const pokemon = mapPokemon(rawPokemon);
  const merged = mergeSpeciesDetails(pokemon, { is_legendary: true, flavor_text_entries: [] }, null);
  assert.equal(merged.isLegendary, true);
  assert.equal(merged.desc, 'Tidak ada deskripsi untuk Pokémon ini.');
});

test('describeFetchError memilih pesan sesuai kondisi', () => {
  assert.match(describeFetchError(new Error('HTTP 500'), false), /koneksi internet/);
  assert.match(describeFetchError(new Error('HTTP 404')), /tidak ditemukan/);
  assert.match(describeFetchError(new Error('HTTP 429')), /Terlalu banyak request/);
  assert.match(describeFetchError(new Error('HTTP 503')), /Server PokéAPI/);
  assert.match(describeFetchError(new Error('boom')), /Gagal memuat data: boom/);
});
