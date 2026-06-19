import { useState } from 'react';

export default function TeamManager({ teams, onCreateTeam, onDeleteTeam, onRenameTeam, onRemoveFromTeam }) {
    const [newTeamName, setNewTeamName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const handleCreate = (e) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;
        onCreateTeam(newTeamName.trim());
        setNewTeamName('');
    };

    const handleSaveRename = (id) => {
        if (!editName.trim()) return;
        onRenameTeam(id, editName.trim());
        setEditingId(null);
    };

    return (
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
            <div className="max-w-2xl mx-auto mb-10 text-center">
                <h2 className="text-xl font-extrabold text-neutral-900 mb-2 m-0">
                    Manajer Tim Tempur
                </h2>
                <p className="text-neutral-450 text-xs leading-relaxed m-0 font-medium">
                    Rancang formasi tim ideal Anda (maksimum 6 Pokémon). Perubahan disimpan secara otomatis ke memori lokal.
                </p>
            </div>

            {/* CREATE FORM */}
            <form onSubmit={handleCreate} className="flex gap-2.5 max-w-md mx-auto mb-10">
                <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Tulis nama tim baru... (cth: Tim Kanto)"
                    className="w-full bg-neutral-50/70 border border-neutral-200 focus:border-neutral-800 focus:bg-white focus:outline-none transition-all rounded-xl py-3 px-4 text-xs font-bold text-neutral-900 placeholder:text-neutral-400"
                />
                <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs whitespace-nowrap transition-all cursor-pointer shadow-sm"
                >
                    Buat Tim
                </button>
            </form>

            {/* READ TIM LIST */}
            {teams.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/40">
                    <p className="text-neutral-400 text-xs font-bold m-0">Belum ada tim yang dibuat.</p>
                    <p className="text-[10px] text-neutral-300 mt-1 m-0 font-bold">Buat tim melalui form di atas, lalu isi Pokémon dari menu Jelajah.</p>
                </div>
            ) : (
                <div className="space-y-12 text-left">
                    {teams.map(team => {
                        const count = team.members.length;
                        const avgStats = {};
                        if (count > 0) {
                            team.members.forEach(m => {
                                m.stats.forEach(s => {
                                    avgStats[s.name] = (avgStats[s.name] || 0) + s.value;
                                });
                            });
                            Object.keys(avgStats).forEach(key => {
                                avgStats[key] = Math.round(avgStats[key] / count);
                            });
                        }

                        // Buat daftar slot (persis 6)
                        const slots = [...team.members];
                        while (slots.length < 6) {
                            slots.push(null);
                        }

                        return (
                            <div key={team.id} className="border border-neutral-200/60 rounded-2xl p-6 bg-white shadow-sm space-y-6">

                                {/* Header Slot (Update Name & Delete Team) */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100/80 pb-4 gap-3">
                                    <div className="flex items-center gap-3">
                                        {editingId === team.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1 text-xs font-bold text-neutral-900 focus:outline-none focus:border-neutral-800"
                                                />
                                                <button
                                                    onClick={() => handleSaveRename(team.id)}
                                                    className="px-3 py-1 bg-neutral-900 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                                                >
                                                    Simpan
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-extrabold text-neutral-850 capitalize m-0">{team.name}</h3>
                                                <button
                                                    onClick={() => { setEditingId(team.id); setEditName(team.name); }}
                                                    className="text-neutral-400 hover:text-neutral-700 text-[10px] font-bold cursor-pointer bg-transparent border-0"
                                                >
                                                    (Ubah Nama)
                                                </button>
                                            </div>
                                        )}
                                        <span className="text-[10px] bg-neutral-100/85 border border-neutral-200/50 text-neutral-500 font-bold px-2.5 py-0.5 rounded-md">
                                            {count}/6 Pokémon
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => onDeleteTeam(team.id)}
                                        className="text-xs font-bold text-neutral-400 hover:text-neutral-900 bg-transparent border-0 cursor-pointer transition-colors"
                                    >
                                        Hapus Tim
                                    </button>
                                </div>

                                {/* Anggota Grid (6 Slot Taktis) */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                    {slots.map((member, idx) => {
                                        if (member) {
                                            return (
                                                <div key={member.id} className="relative p-4 bg-neutral-50/60 border border-neutral-150/40 rounded-xl flex flex-col items-center justify-center h-28">
                                                    <button
                                                        onClick={() => onRemoveFromTeam(team.id, member.id)}
                                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:border-neutral-300 flex items-center justify-center font-bold text-xs shadow-sm cursor-pointer transition-all"
                                                        title="Keluarkan Pokémon"
                                                    >
                                                        ×
                                                    </button>

                                                    <img src={member.sprite} alt={member.name} className="w-14 h-14 object-contain animate-float-hover" />
                                                    <span className="block text-[9px] font-bold capitalize text-neutral-800 mt-2.5 text-center truncate w-full">{member.name}</span>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={`empty-${idx}`} className="border border-neutral-150 border-dashed rounded-xl flex flex-col items-center justify-center h-28 bg-neutral-50/30 text-neutral-300">
                                                <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path>
                                                </svg>
                                                <span className="text-[8px] font-bold mt-1 uppercase tracking-wider text-neutral-350">Slot Kosong</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Analisis Statistik Gabungan (Read Analysis) */}
                                {count > 0 && (
                                    <div className="bg-neutral-50/40 p-4 rounded-xl border border-neutral-200/40 text-[10px] space-y-3.5">
                                        <span className="block font-bold tracking-wider text-neutral-450 uppercase text-[9px]">Kekuatan Rata-rata Statistik Tim</span>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                            {Object.entries(avgStats).map(([name, val]) => (
                                                <div key={name} className="bg-white p-3 rounded-xl border border-neutral-200/40 text-center">
                                                    <span className="block text-neutral-450 font-bold uppercase text-[8px] truncate">{name}</span>
                                                    <span className="font-mono text-xs font-bold text-neutral-900">{val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}