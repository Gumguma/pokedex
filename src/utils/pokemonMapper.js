/**
 * Pemetaan data PokéAPI ke bentuk yang dipakai UI.
 * Semua fungsi di sini murni (tanpa fetch, tanpa React) supaya mudah diuji.
 */
import { LEGENDARY_IDS, MYTHICAL_IDS } from '../constants/pokemonData.js';

const SPRITE_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
const FALLBACK_SPRITE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
const DEFAULT_MOVES = ['Tackle', 'Growl', 'Pound', 'Scratch'];

export const titleCaseMove = (rawName) =>
  rawName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const spriteOf = (pData) =>
  pData?.sprites?.other?.['official-artwork']?.front_default ||
  pData?.sprites?.front_default ||
  FALLBACK_SPRITE;

/** Artwork resmi berdasarkan ID (bukan data API). */
export const artworkUrl = (id) => `${SPRITE_BASE}/${id}.png`;

/**
 * Ringkas satu entri `/pokemon/{id}` menjadi objek kartu.
 * @param {object} pData
 */
export function mapPokemon(pData) {
  return {
    id: pData.id,
    name: pData.name,
    types: (pData.types || []).map((t) => t.type.name),
    sprite: spriteOf(pData),
    stats: (pData.stats || []).map((s) => ({ name: s.stat.name, value: s.base_stat })),
    height: pData.height,
    weight: pData.weight,
    abilities: (pData.abilities || []).map((a) => a.ability.name),
    isLegendary: LEGENDARY_IDS.has(pData.id),
    isMythical: MYTHICAL_IDS.has(pData.id),
    moves:
      pData.moves && pData.moves.length > 0
        ? pData.moves.slice(0, 4).map((m) => titleCaseMove(m.move.name))
        : [...DEFAULT_MOVES],
  };
}

/** Bentuk ringkas untuk soal kuis (nama kapital, tanpa stats). */
export function mapQuizPokemon(pData) {
  return {
    id: pData.id,
    name: pData.name.toUpperCase(),
    sprite: spriteOf(pData),
    types: (pData.types || []).map((t) => t.type.name),
  };
}

/** Ambil teks Indonesia, jatuh ke Inggris, lalu ke fallback. */
export function pickLocalized(entries, field, fallback) {
  if (!Array.isArray(entries)) return fallback;
  const id = entries.find((entry) => entry.language?.name === 'id');
  const en = entries.find((entry) => entry.language?.name === 'en');
  const value = (id && id[field]) ?? (en && en[field]);
  return value ?? fallback;
}

/** Rantai evolusi dari `/evolution-chain/{id}` → array {id, name, sprite}. */
export function buildEvolutionChain(chain) {
  const evolution = [];
  let current = chain;
  while (current) {
    const parts = current.species.url.split('/').filter(Boolean);
    const id = parseInt(parts[parts.length - 1], 10);
    evolution.push({ id, name: current.species.name, sprite: artworkUrl(id) });
    current = current.evolves_to?.[0];
  }
  return evolution;
}

/**
 * Gabungkan data `/pokemon` dengan `/pokemon-species` + rantai evolusi.
 * @param {object} pokemon hasil mapPokemon
 * @param {object} speciesData respons /pokemon-species
 * @param {object|null} evoData respons /evolution-chain
 */
export function mergeSpeciesDetails(pokemon, speciesData, evoData) {
  const desc = pickLocalized(
    speciesData?.flavor_text_entries,
    'flavor_text',
    'Tidak ada deskripsi untuk Pokémon ini.',
  ).replace(/[\n\f]/g, ' ');

  const category = pickLocalized(speciesData?.genera, 'genus', 'Pokémon');

  return {
    ...pokemon,
    desc,
    category,
    evolution: evoData?.chain ? buildEvolutionChain(evoData.chain) : [],
    isLegendary: pokemon.isLegendary || !!speciesData?.is_legendary,
    isMythical: pokemon.isMythical || !!speciesData?.is_mythical,
  };
}

/** Pesan error yang ramah berdasarkan error/navigator. */
export function describeFetchError(err, isOnline = true) {
  if (!isOnline) return '❌ Tidak ada koneksi internet. Periksa jaringan Anda.';
  const message = err?.message || '';
  if (message.includes('404')) return '🔍 Data tidak ditemukan di PokéAPI.';
  if (message.includes('429')) return '⏳ Terlalu banyak request. Tunggu sebentar dan coba lagi.';
  if (message.includes('500') || message.includes('503'))
    return '🔧 Server PokéAPI sedang bermasalah. Coba lagi nanti.';
  return `⚠️ Gagal memuat data: ${message}`;
}
