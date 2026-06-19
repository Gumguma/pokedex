import React, { useState } from 'react';
import { TYPE_DETAILS } from '../constants/pokemonData';
import { calculateTypeWeakness } from '../utils/statCalculator';

export default function PokemonModal({ pokemon, onClose, onOpenDifferentPokemon, cachedDetails, journalLogs = [], onCreateJournal, onUpdateJournal, onDeleteJournal }) {
    const weaknesses = calculateTypeWeakness(pokemon.types);

    const existingLog = journalLogs.find(log => log.pokemonId === pokemon.id);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState(() => {
        if (existingLog) {
            return {
                date: existingLog.date || '',
                location: existingLog.location || '',
                level: existingLog.level || 5,
                nature: existingLog.nature || 'Normal',
                notes: existingLog.notes || ''
            };
        }
        return {
            date: new Date().toISOString().split('T')[0],
            location: '',
            level: 5,
            nature: 'Normal',
            notes: ''
        };
    });

    const natures = [
        'Normal', 'Adamant', 'Bashful', 'Bold', 'Brave', 'Calm', 'Careful', 'Docile', 
        'Gentle', 'Hardy', 'Hasty', 'Impish', 'Jolly', 'Lax', 'Lonely', 'Mild', 
        'Modest', 'Naive', 'Naughty', 'Quiet', 'Quirky', 'Rash', 'Relaxed', 'Sassy', 'Serious', 'Timid'
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-neutral-950/20">
            <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-neutral-200/60 bg-white text-neutral-900 shadow-2xl p-8 flex flex-col gap-8 text-left scrollbar-none">

                {/* Tombol Keluar */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-xl bg-neutral-50 border border-neutral-200/60 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-all cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                {/* Atas: Gambar & Profil Utama */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="relative rounded-2xl bg-neutral-50 border border-neutral-150/50 p-8 flex flex-col items-center justify-center min-h-[220px]">
                        <span className="absolute top-4 left-4 font-mono text-[10px] font-bold text-neutral-300">
                            #{String(pokemon.id).padStart(3, '0')}
                        </span>
                        <img src={pokemon.sprite} alt={pokemon.name} className="w-36 h-36 object-contain filter drop-shadow-md animate-float-hover" />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-400">{pokemon.category}</span>
                            <h2 className="text-3xl font-extrabold capitalize text-neutral-950 tracking-tight m-0 mt-0.5">{pokemon.name}</h2>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {pokemon.types.map(t => {
                                const detail = TYPE_DETAILS[t] || TYPE_DETAILS.normal;
                                return (
                                    <span key={t} className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md border ${detail.color}`}>
                                        {detail.label}
                                    </span>
                                );
                            })}
                        </div>

                        <p className="text-xs leading-relaxed text-neutral-500 bg-neutral-50/50 p-4 rounded-xl border border-neutral-200/30 italic m-0">
                            "{pokemon.desc}"
                        </p>

                        <div className="grid grid-cols-2 gap-3 text-[10px] font-bold">
                            <div className="bg-neutral-50/60 p-3 rounded-xl border border-neutral-150/40">
                                <span className="block text-neutral-400 uppercase text-[8px] tracking-wider mb-0.5">Tinggi</span>
                                <span className="font-mono text-neutral-800 text-xs">{pokemon.height / 10} m</span>
                            </div>
                            <div className="bg-neutral-50/60 p-3 rounded-xl border border-neutral-150/40">
                                <span className="block text-neutral-400 uppercase text-[8px] tracking-wider mb-0.5">Berat</span>
                                <span className="font-mono text-neutral-800 text-xs">{pokemon.weight / 10} kg</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tengah: Stats Grid */}
                <div className="space-y-3">
                    <h3 className="text-[9px] font-black tracking-widest text-neutral-400 uppercase m-0">Statistik Dasar</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {pokemon.stats.map(s => {
                            const statLabel = s.name.toUpperCase().replace('-', ' ');
                            const percentage = Math.min((s.value / 165) * 100, 100);

                            return (
                                <div key={s.name} className="bg-neutral-50/40 p-3 rounded-xl border border-neutral-200/40 flex items-center justify-between gap-4">
                                    <div className="min-w-[90px]">
                                        <span className="block text-[8px] text-neutral-400 font-bold tracking-wider">{statLabel}</span>
                                        <span className="font-mono text-xs font-bold text-neutral-850">{s.value}</span>
                                    </div>
                                    <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
                                        <div style={{ width: `${percentage}%` }} className="h-full bg-neutral-800 rounded-full"></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Ketahanan & Kelemahan */}
                <div className="space-y-3">
                    <h3 className="text-[9px] font-black tracking-widest text-neutral-400 uppercase m-0">Ketahanan & Kelemahan Elemen</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {weaknesses.map(item => {
                            const detail = TYPE_DETAILS[item.type] || { label: item.type };
                            let badgeColor = "bg-neutral-50 border-neutral-200/60 text-neutral-500";

                            if (item.multiplier >= 2) {
                                badgeColor = "bg-neutral-900 text-white border-neutral-950 font-bold";
                            } else if (item.multiplier === 0) {
                                badgeColor = "bg-neutral-100 text-neutral-300 border-neutral-200/40 line-through";
                            } else if (item.multiplier < 1) {
                                badgeColor = "bg-neutral-100 text-neutral-600 border-neutral-200/80";
                            }

                            return (
                                <div key={item.type} className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider ${badgeColor}`}>
                                    <span>{detail.label}</span>
                                    <span className="font-mono opacity-85">{item.multiplier}x</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bawah: Diagram Evolusi */}
                {pokemon.evolution && pokemon.evolution.length > 1 && (
                    <div className="space-y-3 border-t border-neutral-150/60 pt-4">
                        <h3 className="text-[9px] font-black tracking-widest text-neutral-400 uppercase m-0">Silsilah Evolusi</h3>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-neutral-50/50 p-6 rounded-2xl border border-neutral-200/35">
                            {pokemon.evolution.map((evo, i) => (
                                <React.Fragment key={evo.id}>
                                    {i > 0 && (
                                        <svg className="w-4 h-4 text-neutral-300 rotate-90 sm:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
                                    )}
                                    <button
                                        onClick={() => {
                                            const backupData = cachedDetails[evo.name] || {
                                                id: evo.id,
                                                name: evo.name,
                                                sprite: evo.sprite,
                                                types: ['normal'],
                                                stats: []
                                            };
                                            onOpenDifferentPokemon(backupData);
                                        }}
                                        className={`p-3 rounded-2xl border flex flex-col items-center hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-sm transition-all bg-white cursor-pointer ${
                                            evo.id === pokemon.id 
                                                ? 'border-neutral-900 bg-neutral-50 shadow-[0_2px_8px_rgba(0,0,0,0.02)]' 
                                                : 'border-neutral-200/50'
                                        }`}
                                    >
                                        <img src={evo.sprite} alt={evo.name} className="w-10 h-10 object-contain" />
                                        <span className="block text-[9px] font-bold capitalize text-neutral-800 mt-1.5">{evo.name}</span>
                                    </button>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bawah: Jurnal Tangkapan Pelatih */}
                <div className="space-y-4 border-t border-neutral-150/60 pt-6">
                    <h3 className="text-[9px] font-black tracking-widest text-neutral-400 uppercase m-0 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-neutral-450" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                        Catatan Jurnal Pelatih
                    </h3>

                    {existingLog && !isEditing ? (
                        <div className="bg-neutral-50/50 border border-neutral-200/50 rounded-2xl p-5 hover:shadow-sm transition-all space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[9px] font-bold text-neutral-500">
                                <div>
                                    <span className="block text-[7px] text-neutral-400 uppercase">Tanggal Tangkapan</span>
                                    <span className="text-neutral-700">{existingLog.date || 'Tidak Diketahui'}</span>
                                </div>
                                <div>
                                    <span className="block text-[7px] text-neutral-400 uppercase">Lokasi Menangkap</span>
                                    <span className="text-neutral-700 capitalize">{existingLog.location}</span>
                                </div>
                                <div>
                                    <span className="block text-[7px] text-neutral-400 uppercase">Level</span>
                                    <span className="text-neutral-700 font-mono">Lv. {existingLog.level}</span>
                                </div>
                                <div>
                                    <span className="block text-[7px] text-neutral-400 uppercase">Nature</span>
                                    <span className="text-neutral-700">{existingLog.nature || 'Normal'}</span>
                                </div>
                            </div>

                            {existingLog.notes && (
                                <div className="p-3 bg-white border border-neutral-150/40 rounded-xl text-neutral-500 text-[10px] leading-relaxed italic">
                                    "{existingLog.notes}"
                                </div>
                            )}

                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200/60 text-neutral-850 text-[9px] font-bold rounded-lg cursor-pointer transition-colors border-0"
                                >
                                    Ubah Catatan
                                </button>
                                <button
                                    onClick={() => {
                                        onDeleteJournal(existingLog.id);
                                        setForm({
                                            date: new Date().toISOString().split('T')[0],
                                            location: '',
                                            level: 5,
                                            nature: 'Normal',
                                            notes: ''
                                        });
                                        setIsEditing(false);
                                    }}
                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 text-[9px] font-bold rounded-lg cursor-pointer transition-colors border border-red-250/20"
                                >
                                    Hapus Jurnal
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-neutral-50/40 border border-neutral-200/50 rounded-2xl p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Tanggal Ditangkap</label>
                                    <input
                                        type="date"
                                        value={form.date}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        className="w-full bg-white border border-neutral-250/60 rounded-lg p-2 text-[10px] font-bold focus:outline-none focus:border-neutral-800 text-neutral-800 box-border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Lokasi Menangkap</label>
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                        placeholder="cth: Rute 1"
                                        className="w-full bg-white border border-neutral-250/60 rounded-lg p-2 text-[10px] font-bold focus:outline-none focus:border-neutral-800 text-neutral-800 box-border"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Level Saat Ini</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={form.level}
                                        onChange={(e) => setForm({ ...form, level: parseInt(e.target.value, 10) || 5 })}
                                        className="w-full bg-white border border-neutral-250/60 rounded-lg p-2 text-[10px] font-bold focus:outline-none focus:border-neutral-800 text-neutral-800 box-border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Sifat (Nature)</label>
                                    <select
                                        value={form.nature}
                                        onChange={(e) => setForm({ ...form, nature: e.target.value })}
                                        className="w-full bg-white border border-neutral-250/60 rounded-lg p-2 text-[10px] font-bold focus:outline-none focus:border-neutral-800 text-neutral-800 box-border"
                                    >
                                        {natures.map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Catatan Personal</label>
                                <textarea
                                    rows="2"
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Masukkan cerita petualangan saat menangkap..."
                                    className="w-full bg-white border border-neutral-250/60 rounded-lg p-2 text-[10px] font-bold focus:outline-none focus:border-neutral-800 text-neutral-800 resize-none box-border"
                                />
                            </div>

                            <div className="flex gap-2 justify-end">
                                {existingLog && (
                                    <button
                                        onClick={() => {
                                            setForm({
                                                date: existingLog.date || '',
                                                location: existingLog.location || '',
                                                level: existingLog.level || 5,
                                                nature: existingLog.nature || 'Normal',
                                                notes: existingLog.notes || ''
                                            });
                                            setIsEditing(false);
                                        }}
                                        className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200/60 text-neutral-500 hover:text-neutral-850 text-[9px] font-bold rounded-lg cursor-pointer border-0 transition-colors"
                                    >
                                        Batal
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (!form.location.trim()) {
                                            alert("Lokasi menangkap harus diisi!");
                                            return;
                                        }
                                        if (existingLog) {
                                            onUpdateJournal(existingLog.id, form);
                                            setIsEditing(false);
                                        } else {
                                            onCreateJournal({
                                                pokemonId: pokemon.id,
                                                pokemonName: pokemon.name,
                                                pokemonSprite: pokemon.sprite,
                                                ...form
                                            });
                                        }
                                    }}
                                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[9px] font-bold rounded-lg cursor-pointer border-0 transition-colors"
                                >
                                    {existingLog ? 'Simpan Perubahan' : 'Tambah Catatan'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}