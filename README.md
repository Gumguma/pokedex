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
  App.jsx                  # orkestrasi state global + tab
  components/              # UI: ExploreView, CompareView, BattleSimulator, PokemonModal, dst.
  hooks/
    usePokemonCollection.js  # fetch daftar/detail/kuis + cache + error state
    useBattleEngine.js       # state & loop simulasi pertarungan
    useFavorites.js, useTeams.js, useJournal.js, useDebounce.js, useModalBehavior.js
  utils/
    http.js                  # fetchJson (retry+backoff) & mapWithConcurrency
    pokemonMapper.js         # pemetaan respons PokéAPI -> objek UI
    battle.js                # logika damage, tipe, antrean turn (murni)
    storage.js, typeColor.js, statCalculator.js, audioHelper.js
  constants/pokemonData.js # TYPE_DETAILS (18 tipe + legendary/mythical) & label generasi
  index.css                # token Tailwind 4 (@theme)
```

Lapisan data dipisah dari tampilan: `hooks/` memegang state dan efek, `utils/` memegang fungsi murni, `components/` hanya render.

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

Memakai test runner bawaan Node (`node --test`), 40+ test untuk fungsi murni:

- `src/utils/typeColor.test.js` — kontras warna badge
- `src/utils/http.test.js` — retry/backoff `fetchJson` & batas konkurensi
- `src/utils/pokemonMapper.test.js` — pemetaan data PokéAPI, evolusi, pesan error
- `src/utils/battle.test.js` — damage, efektivitas tipe, urutan turn, kondisi menang

Test tidak memanggil jaringan; `fetch` di-inject atau di-monkeypatch.

## Deploy

```bash
npm run deploy
```

`predeploy` menjalankan build, lalu `gh-pages` mem-push `dist/` ke branch `gh-pages`. Situs GitHub Pages menyajikan branch itu di https://gumguma.github.io/pokedex/ — perlu beberapa menit sampai cache ikut diperbarui.

## Catatan

- Aplikasi butuh internet: data Pokémon diambil langsung dari PokéAPI saat runtime.
- `base: './'` di `vite.config.js` supaya asset tetap benar saat disajikan dari sub-path GitHub Pages.
