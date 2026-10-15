
export default function QuizGame({
    gamePokemon,
    gameOptions,
    gameScore,
    gameHighScore,
    gameResult,
    gameLoading,
    onGuess,
    onNextRound
}) {
    return (
        <div className="max-w-xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-[#e9ebf0] shadow-[0_1px_2px_rgba(17,24,39,.03)] text-center">

            {/* Papan Skor */}
            <div className="flex justify-between items-center mb-8 border-b border-[#f2f4f7] pb-4">
                <div className="text-left">
                    <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-bold">Skor Beruntun</span>
                    <span className="font-mono text-xl font-extrabold text-indigo-700">{gameScore}</span>
                </div>
                <div className="text-right">
                    <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-bold">High Score</span>
                    <span className="font-mono text-xl font-bold text-slate-400">{gameHighScore}</span>
                </div>
            </div>

            {gameLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Menyiapkan Siluet Bayangan...</p>
                </div>
            ) : gamePokemon ? (
                <div className="space-y-6">

                    {/* Box Siluet Bayangan */}
                    <div 
                        className="relative w-full h-48 bg-[#f6f7fb] rounded-2xl border border-[#e9ebf0] flex items-center justify-center overflow-hidden"
                        style={{ 
                            backgroundImage: 'radial-gradient(#e5e5e5 1px, transparent 1px)', 
                            backgroundSize: '16px 16px' 
                        }}
                    >
                        <img
                            src={gamePokemon.sprite}
                            alt="Quiz Siluet"
                            className={`w-36 h-36 object-contain transition-all duration-500 filter ${
                                gameResult === null ? 'brightness-0 contrast-200' : 'brightness-100 drop-shadow-md'
                            }`}
                        />
                    </div>

                    {/* Notifikasi Hasil */}
                    {gameResult === 'correct' && (
                        <div className="p-3 bg-emerald-50 border border-emerald-500 text-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2">
                            <span>✓</span>
                            <span>Benar! Itu adalah {gamePokemon.name}</span>
                        </div>
                    )}
                    {gameResult === 'wrong' && (
                        <div className="p-3 bg-rose-50 border border-rose-500 text-rose-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2">
                            <span>✗</span>
                            <span>Salah! Jawaban yang benar: {gamePokemon.name}</span>
                        </div>
                    )}

                    {/* Grid Pilihan Ganda */}
                    <div className="grid grid-cols-2 gap-3">
                        {gameOptions.map((opt) => {
                            let btnClass = "bg-white border-[#e9ebf0] hover:bg-indigo-50 text-slate-800 hover:border-indigo-200 font-bold";
                            
                            if (gameResult !== null) {
                                if (opt === gamePokemon.name) {
                                    btnClass = "border-emerald-500 bg-emerald-50 text-emerald-700 font-extrabold";
                                } else {
                                    btnClass = "bg-[#f6f7fb] border-[#e9ebf0] text-slate-300 cursor-not-allowed opacity-50";
                                }
                            }

                            return (
                                <button
                                    key={opt}
                                    onClick={() => onGuess(opt)}
                                    disabled={gameResult !== null}
                                    className={`w-full py-3.5 px-4 rounded-xl border text-xs transition-all duration-200 truncate cursor-pointer ${btnClass}`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tombol Ronde Lanjutan */}
                    {gameResult !== null && (
                        <button
                            onClick={onNextRound}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-700 to-violet-600 hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_6px_16px_-6px_rgba(79,70,229,.55)]"
                        >
                            Ronde Berikutnya →
                        </button>
                    )}

                </div>
            ) : null}

        </div>
    );
}