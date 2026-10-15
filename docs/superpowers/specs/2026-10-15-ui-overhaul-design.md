# UI Overhaul — Modern Indigo — Design Spec

Date: 2026-10-15
Status: approved (mockups v3/v4 accepted)

## Goal

Rombak seluruh tampilan Pokédex agar terasa modern & profesional. Aksen indigo/violet, kartu putih bersih, warna tipe dipakai sebagai identitas visual. Semua tab (Jelajah, Favorit, Bandingkan, Tim, Arena, Jurnal, Kuis, Modal) memakai satu bahasa desain.

## Non-goals

- Tidak ada dark mode.
- Tidak mengubah struktur data, state, hooks, atau logika apa pun. Murni presentasi (className + sedikit inline style).
- Tidak menambah dependency.
- Tidak mengubah layout grid/max-width yang sudah ada.

## Design tokens

Pakai utility Tailwind bawaan; tidak perlu token kustom.

| Peran | Nilai | Utility |
|---|---|---|
| Aksen utama | `#4338ca` | `indigo-700` |
| Aksen terang | `#7c3aed` | `violet-600` |
| Aksen lembut (bg) | `#eef2ff` | `indigo-50` |
| Gradient aksen | `100deg, indigo-700 → violet-700 58% → violet-600` | `bg-gradient-to-r from-indigo-700 via-violet-700 to-violet-600` |
| Canvas | `#f6f7fb` | `bg-[#f6f7fb]` |
| Surface | `#ffffff` | `bg-white` |
| Garis | `#e9ebf0` | `border-[#e9ebf0]` |
| Ink | `#0f172a` | `slate-900` |
| Muted | `#94a3b8` | `slate-400` |

Radius konsisten: `12` (input/filter), `16` (panel), `18`/`rounded-2xl` (kartu), `rounded-3xl` (modal).

## Warna tipe

`TYPE_DETAILS[].hex` sudah ada tapi belum dipakai. Jadikan sumber warna badge tipe.

- Badge tipe = solid `backgroundColor: hex`, `color` otomatis (gelap untuk tipe terang seperti listrik/es/tanah, putih untuk sisanya) via hitung luminansi hex (satu fungsi kecil, ~4 baris).
- `TYPE_DETAILS[].color` (kelas monokrom) dihapus dari pemakaian; `hex` + `label` tetap.
- Halo lingkaran di kartu: `radial-gradient(circle at 50% 42%, <hex>, transparent 68%)`, opacity `0.4`.

## Per-komponen

### `src/index.css`
- `body` bg `#f6f7fb`.
- Scrollbar thumb tetap netral.

### `src/components/Header.jsx`
- Header: bar gradient aksen (`from-indigo-700 via-violet-700 to-violet-600`), teks putih, tidak sticky-blur putih lagi.
- Logo: kotak `rgba(255,255,255,.16)` berbingkai, ikon putih.
- Judul: `POKÉDEX` putih + subjudul kecil transparan. Hapus teks "EST. ABU-ABU & PUTIH".
- Nav: container `bg-white/13 rounded-[13px]`; item aktif `bg-white text-indigo-700 shadow`; item lain `text-white/80`.

### `src/components/PokemonCard.jsx`
- Kartu putih, `rounded-2xl`, border `#e9ebf0`, shadow lembut, hover lift.
- Aksi (＋ tim / ⇅ banding / ♥ favorit) jadi ikon 22px `rounded-lg`; state aktif = gradient indigo→violet + teks putih.
- Sprite: div `h-[104px]` putih; halo `radial-gradient(circle, <hex tipe-1>, transparent 68%)` opacity `.4`; sprite `w-20 h-20` drop-shadow.
- Badge tipe: pakai `TypeBadge` baru (solid hex).
- CTA "Lihat Detail": teks muted → indigo saat hover; favorit = tint `indigo-50`.

### `src/components/TypeBadge.jsx`
- Solid `hex` background + warna teks auto-luminansi.
- Varian `isWeakness`: `multiplier>=2` solid hex tipe; `0` pudar + line-through; `<1` tint lembut. Hilangkan skala neutral-900.
- `showIcon` tetap; `TypeIcon` pakai `currentColor` sehingga otomatis sewarna.

### `src/App.jsx`
- Root bg `#f6f7fb`.
- Panel search + 4 filter: kartu putih radius 16, label uppercase kecil, input `bg-[#f6f7fb]` focus `border-indigo-600`.
- Tombol "Tembak Live"/primary: gradient aksen.
- Progress bar top: gradient aksen.
- Seksi Bandingkan: kartu putih, bar statistik pemenang `bg-indigo-600`, seri `slate-400`, kalah `slate-200`.
- Toast: `bg-slate-900` dipertahankan, tambah border aksen tipis.
- Modal "tambah ke tim" (`App.jsx` ~776): radius 3xl, tombol pilihan hover indigo-50.

### `src/components/PokemonModal.jsx`
- Overlay sama; kartu radius 3xl.
- Stat bar: `bg-indigo-600` (bukan neutral-900).
- Tombol simpan/primary gradient aksen; tombol sekunder outline.
- Section weakness pakai `TypeBadge isWeakness` baru.

### `src/components/TeamManager.jsx`
- Judul aksen, input focus `border-indigo-600`, tombol buat gradient aksen.
- Kartu tim: border `#e9ebf0`, slot kosong dashed netral, badge tim indigo-50/indigo-700.

### `src/components/JournalTimeline.jsx`
- Garis timeline + dot aksen indigo.
- Kartu log putih radius 16; tombol edit/hapus netral→indigo hover.

### `src/components/QuizGame.jsx`
- Skor aksen indigo; siluet box bg `#f6f7fb`; opsi jawaban hover indigo-50; benar `emerald-600`, salah `rose-600`.

### `src/components/BattleSimulator.jsx`
- Tombol aksi gradient aksen; HP bar hijau→kuning→merah tetap (semantik).
- Panel/log pertempuran radius 16, border `#e9ebf0`.
- Angka damage/pemenang aksen indigo.

### `src/components/PokemonCardSkeleton.jsx`
- Samakan bentuk kartu baru: header baris, halo lingkaran `rounded-full` (ganti blok), badge pill, CTA bar.

### `src/components/ErrorBoundary.jsx`
- Kartu putih radius 3xl, tombol "Muat Ulang" gradient aksen.

## Verifikasi

- `npm run build` sukses.
- `npm run lint` 0 error/warning.
- Cek visual tiap tab di dev server.

## File terdampak

`src/index.css`, `src/App.jsx`, `src/components/{Header,PokemonCard,TypeBadge,PokemonModal,TeamManager,JournalTimeline,QuizGame,BattleSimulator,PokemonCardSkeleton,ErrorBoundary}.jsx`, `src/constants/pokemonData.js` (hapus pemakaian `color`, sisakan `hex`+`label`).
