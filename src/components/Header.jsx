
export default function Header({ activeTab, setActiveTab, favoritesCount, compareCount, teamsCount, journalCount }) {
    return (
        <header className="sticky top-0 z-40 bg-gradient-to-r from-indigo-700 via-violet-700 to-violet-600 px-4 sm:px-6 py-3 sm:py-4 shadow-lg shadow-indigo-900/20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">

                {/* Identitas Brand */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 border border-white/20">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M2 12h20" />
                            <circle cx="12" cy="12" r="3" fill="currentColor" className="text-white" />
                            <circle cx="12" cy="12" r="1" fill="currentColor" className="text-indigo-700" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tight text-white m-0 leading-none">
                            POKÉDEX
                        </h1>
                        <p className="text-[9px] text-white/60 tracking-widest font-black uppercase m-0 mt-0.5">MODERN · INDIGO</p>
                    </div>
                </div>

                {/* Tab Navigasi */}
                <nav className="flex items-center gap-1 bg-white/10 p-1 rounded-[14px] overflow-x-auto max-w-full scrollbar-none snap-x snap-mandatory">
                    <button
                        onClick={() => setActiveTab('explore')}
                        className={`flex min-h-11 snap-start items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${activeTab === 'explore'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        Jelajah
                    </button>

                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`flex min-h-11 snap-start items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${activeTab === 'favorites'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        Favorit
                        {favoritesCount > 0 && (
                            <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold font-mono leading-none">
                                {favoritesCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('compare')}
                        className={`flex min-h-11 snap-start items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${activeTab === 'compare'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        Bandingkan
                        {compareCount > 0 && (
                            <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold font-mono leading-none">
                                {compareCount}/2
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('teams')}
                        className={`flex min-h-11 snap-start items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${activeTab === 'teams'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        Tim Tempur
                        {teamsCount > 0 && (
                            <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold font-mono leading-none">
                                {teamsCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('battle')}
                        className={`flex min-h-11 snap-start items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${activeTab === 'battle'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        Arena Tempur
                    </button>

                    <button
                        onClick={() => setActiveTab('journal')}
                        className={`flex min-h-11 snap-start items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${activeTab === 'journal'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        Jurnal
                        {journalCount > 0 && (
                            <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold font-mono leading-none">
                                {journalCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('game')}
                        className={`flex min-h-11 snap-start items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${activeTab === 'game'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        Kuis Bayangan
                    </button>
                </nav>

            </div>
        </header>
    );
}