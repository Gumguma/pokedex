# Pokédex

Pokédex interaktif berbahasa Indonesia: jelajahi Pokémon lintas generasi, bandingkan statistik, susun tim, simulasikan pertarungan, catat jurnal, dan uji hafalan lewat kuis.

**Live:** https://gumguma.github.io/pokedex/

## Fitur

- **Jelajah** — grid Pokémon dengan filter tipe, generasi, kategori (legendary/mythical), pencarian, dan pengurutan
- **Favorit** — tandai Pokémon, tersimpan di perangkat
- **Bandingkan** — adu statistik dua Pokémon berdampingan
- **Tim Tempur** — susun beberapa tim, maksimal 6 anggota per tim
- **Arena Tempur** — simulasi pertarungan memakai statistik dan tabel efektivitas tipe
- **Jurnal** — catatan per Pokémon dengan timeline
- **Kuis Bayangan** — tebak nama Pokémon dari siluet, ada skor beruntun dan high score
- Suara cry Pokémon (opsional, dengan guard autoplay)
- Tema indigo, mobile-first, tanpa dark mode

## Stack

- React 19 + Vite 8
- Tailwind CSS 4 (lewat `@tailwindcss/vite`, token di `src/index.css`)
- Tanpa router — navigasi tab memakai state
- Tanpa backend — data dari [PokéAPI](https://pokeapi.co/), sprite dan cry dari repo `PokeAPI/sprites` & `PokeAPI/cries`
- Font Plus Jakarta Sans dari Google Fonts

## Menjalankan

```bash
npm install
npm run dev        # server lokal (Vite)
npm run build      # build produksi ke dist/
npm run preview    # cek hasil build
npm run lint       # eslint
npm test           # unit test (node --test)
npm run deploy     # build + push dist/ ke branch gh-pages
```

Butuh Node 20+ (dikembangkan di Node 22).

## Struktur

```
src/
  App.jsx                  # state global + tab + fetch PokéAPI
  components/              # 15 komponen UI (card, modal, battle, quiz, journal, tim)
  hooks/                   # useFavorites, useTeams, useJournal, useDebounce, useModalBehavior
  utils/                   # storage (localStorage aman), statCalculator, typeColor, audioHelper
  constants/pokemonData.js # TYPE_DETAILS (18 tipe + legendary/mythical) & label generasi
  index.css                # token Tailwind 4 (@theme)
```

## Penyimpanan data

Semua data pengguna ada di `localStorage`, tidak ada yang dikirim ke server:

| Key | Isi |
| --- | --- |
| `pokedex_favs` | daftar ID favorit |
| `pokedex_teams` | daftar tim tempur |
| `pokedex_journal` | catatan jurnal |

`src/utils/storage.js` menangani kuota penuh: kalau `setItem` gagal, isi dibersihkan lalu dicoba ulang, dan UI menampilkan toast gagal simpan.

## Test

```bash
npm test
```

Memakai test runner bawaan Node (`node --test`). Saat ini menguji helper kontras warna badge (`src/utils/typeColor.js`).

## Deploy

```bash
npm run deploy
```

`predeploy` menjalankan build, lalu `gh-pages` mem-push `dist/` ke branch `gh-pages`. Situs GitHub Pages menyajikan branch itu di https://gumguma.github.io/pokedex/ — perlu beberapa menit sampai cache ikut diperbarui.

## Catatan

- Aplikasi butuh internet: data Pokémon diambil langsung dari PokéAPI saat runtime.
- `base: './'` di `vite.config.js` supaya asset tetap benar saat disajikan dari sub-path GitHub Pages.
