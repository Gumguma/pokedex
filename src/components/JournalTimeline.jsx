import { useState } from 'react';

export default function JournalTimeline({ journalLogs, onUpdateJournal, onDeleteJournal }) {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        level: 5,
        location: '',
        date: '',
        nature: 'Normal',
        notes: ''
    });

    const handleStartEdit = (log) => {
        setEditingId(log.id);
        setEditForm({
            level: log.level,
            location: log.location,
            date: log.date,
            nature: log.nature || 'Normal',
            notes: log.notes
        });
    };

    const handleSave = (id) => {
        if (!editForm.location.trim()) return;
        onUpdateJournal(id, editForm);
        setEditingId(null);
    };

    const natures = [
        'Normal', 'Adamant', 'Bashful', 'Bold', 'Brave', 'Calm', 'Careful', 'Docile', 
        'Gentle', 'Hardy', 'Hasty', 'Impish', 'Jolly', 'Lax', 'Lonely', 'Mild', 
        'Modest', 'Naive', 'Naughty', 'Quiet', 'Quirky', 'Rash', 'Relaxed', 'Sassy', 'Serious', 'Timid'
    ];

    return (
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.01)] text-left">
            <div className="max-w-2xl mx-auto mb-10 text-center">
                <h2 className="text-xl font-extrabold text-neutral-900 mb-2 m-0">
                    Jurnal Catatan Petualangan
                </h2>
                <p className="text-neutral-450 text-xs leading-relaxed m-0 font-medium">
                    Histori petualangan dan riwayat tangkapan unik Pokémon Anda di dunia luar.
                </p>
            </div>

            {journalLogs.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/40">
                    <p className="text-neutral-400 text-xs font-bold m-0">Jurnal petualangan Anda masih kosong.</p>
                    <p className="text-[10px] text-neutral-300 mt-1 m-0 font-bold">
                        Buka detail Pokémon dari tab **Jelajah** dan tambahkan catatan tangkapan pertama Anda!
                    </p>
                </div>
            ) : (
                <div className="max-w-xl mx-auto relative pl-6 border-l-2 border-neutral-100 space-y-10 py-2">
                    {journalLogs.map((log) => {
                        const isEditing = editingId === log.id;

                        return (
                            <div key={log.id} className="relative">
                                {/* Bullet Node */}
                                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-neutral-900 border-4 border-white shadow-sm flex items-center justify-center"></div>

                                {/* Card Jurnal */}
                                <div className="bg-neutral-50/40 border border-neutral-200/50 rounded-2xl p-5 hover:shadow-sm transition-all space-y-4">
                                    
                                    {/* Header: Info Pokémon */}
                                    <div className="flex items-center justify-between gap-4 pb-3 border-b border-neutral-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200/60 flex items-center justify-center">
                                                <img src={log.pokemonSprite} alt={log.pokemonName} className="w-8 h-8 object-contain" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold capitalize text-neutral-800 m-0 leading-tight">
                                                    {log.pokemonName}
                                                </h4>
                                                <span className="font-mono text-[8px] text-neutral-400 font-bold uppercase tracking-wider">
                                                    #{String(log.pokemonId).padStart(3, '0')}
                                                </span>
                                            </div>
                                        </div>

                                        {!isEditing && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleStartEdit(log)}
                                                    className="text-[9px] font-bold text-neutral-400 hover:text-neutral-800 transition-colors bg-transparent border-0 cursor-pointer"
                                                >
                                                    Ubah
                                                </button>
                                                <button
                                                    onClick={() => onDeleteJournal(log.id)}
                                                    className="text-[9px] font-bold text-neutral-400 hover:text-red-650 transition-colors bg-transparent border-0 cursor-pointer"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Area */}
                                    {isEditing ? (
                                        <div className="space-y-3.5 pt-1">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Tanggal</label>
                                                    <input
                                                        type="date"
                                                        value={editForm.date}
                                                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                                        className="w-full bg-white border border-neutral-200 rounded-lg p-2 text-[10px] font-bold focus:outline-none focus:border-neutral-800 text-neutral-800"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Lokasi</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.location}
                                                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                                        placeholder="cth: Rute 1"
                                                        className="w-full bg-white border border-neutral-200 rounded-lg p-2 text-[10px] font-bold focus:outline-none focus:border-neutral-800 text-neutral-800"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Level</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="100"
                                                        value={editForm.level}
                                                        onChange={(e) => setEditForm({ ...editForm, level: parseInt(e.target.value, 10) || 5 })}
                                                        className="w-full bg-white border border-neutral-200 rounded-lg p-2 text-[10px] font-bold focus:outline-none focus:border-neutral-800 text-neutral-800"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Sifat (Nature)</label>
                                                    <select
                                                        value={editForm.nature}
                                                        onChange={(e) => setEditForm({ ...editForm, nature: e.target.value })}
                                                        className="w-full bg-white border border-neutral-200 rounded-lg p-2 text-[10px] font-bold focus:outline-none focus:border-neutral-800 text-neutral-800"
                                                    >
                                                        {natures.map(n => <option key={n} value={n}>{n}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Catatan</label>
                                                <textarea
                                                    rows="2"
                                                    value={editForm.notes}
                                                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                                    className="w-full bg-white border border-neutral-200 rounded-lg p-2 text-[10px] font-bold focus:outline-none focus:border-neutral-800 text-neutral-800 resize-none"
                                                />
                                            </div>

                                            <div className="flex gap-2 justify-end pt-1">
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="px-3 py-1.5 bg-neutral-100 text-neutral-500 hover:text-neutral-800 text-[9px] font-bold rounded-lg cursor-pointer transition-colors"
                                                >
                                                    Batal
                                                </button>
                                                <button
                                                    onClick={() => handleSave(log.id)}
                                                    className="px-3 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 text-[9px] font-bold rounded-lg cursor-pointer transition-colors"
                                                >
                                                    Simpan
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3.5">
                                            {/* Baris Meta Tangkapan */}
                                            <div className="grid grid-cols-2 gap-3 text-[9px] font-bold text-neutral-500">
                                                <div>
                                                    <span className="block text-[7px] text-neutral-400 uppercase">Tanggal Tangkapan</span>
                                                    <span className="text-neutral-700">{log.date || 'Tidak Diketahui'}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[7px] text-neutral-400 uppercase">Lokasi Menangkap</span>
                                                    <span className="text-neutral-700 capitalize">{log.location}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[7px] text-neutral-400 uppercase">Level</span>
                                                    <span className="text-neutral-700 font-mono">Lv. {log.level}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[7px] text-neutral-400 uppercase">Nature</span>
                                                    <span className="text-neutral-700">{log.nature || 'Normal'}</span>
                                                </div>
                                            </div>

                                            {/* Catatan Personal */}
                                            {log.notes && (
                                                <div className="p-3 bg-white border border-neutral-150/40 rounded-xl text-neutral-500 text-[10px] leading-relaxed italic">
                                                    "{log.notes}"
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
