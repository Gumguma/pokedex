
export default function Header({ activeTab, setActiveTab, favoritesCount, compareCount, teamsCount, journalCount }) {
    return (
        <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-neutral-200/50 px-6 py-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">

                {/* Identitas Brand */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200">
                        <svg className="w-5 h-5 text-neutral-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M2 12h20" />
                            <circle cx="12" cy="12" r="3" fill="currentColor" className="text-white" />
                            <circle cx="12" cy="12" r="1" fill="currentColor" className="text-neutral-800" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tight text-neutral-900 m-0 leading-none">
                            POKÉDEX<span className="text-neutral-400 font-light">.MINIMAL</span>
                        </h1>
                        <p className="text-[9px] text-neutral-400 tracking-widest font-black uppercase m-0 mt-0.5">EST. ABU-ABU & PUTIH</p>
                    </div>
                </div>

                {/* Tab Navigasi */}
                <nav className="flex items-center gap-1 bg-neutral-100/80 p-1 rounded-xl border border-neutral-200/50 overflow-x-auto max-w-full scrollbar-none">
                    <button
                        onClick={() => setActiveTab('explore')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${activeTab === 'explore'
                                ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200/50'
                                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/30'
                            }`}
                    >
                        Jelajah
                    </button>

                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${activeTab === 'favorites'
                                ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200/50'
                                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/30'
                            }`}
                    >
                        Favorit
                        {favoritesCount > 0 && (
                            <span className="bg-neutral-800 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold font-mono leading-none">
                                {favoritesCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('compare')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${activeTab === 'compare'
                                ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200/50'
                                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/30'
                            }`}
                    >
                        Bandingkan
                        {compareCount > 0 && (
                            <span className="bg-neutral-850 text-neutral-100 text-[9px] px-1.5 py-0.5 rounded-md font-bold font-mono leading-none border border-neutral-700">
                                {compareCount}/2
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('teams')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${activeTab === 'teams'
                                ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200/50'
                                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/30'
                            }`}
                    >
                        Tim Tempur
                        {teamsCount > 0 && (
                            <span className="bg-neutral-800 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold font-mono leading-none">
                                {teamsCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('battle')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${activeTab === 'battle'
                                ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200/50'
                                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/30'
                            }`}
                    >
                        Arena Tempur
                    </button>

                    <button
                        onClick={() => setActiveTab('journal')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${activeTab === 'journal'
                                ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200/50'
                                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/30'
                            }`}
                    >
                        Jurnal
                        {journalCount > 0 && (
                            <span className="bg-neutral-800 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold font-mono leading-none">
                                {journalCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('game')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${activeTab === 'game'
                                ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200/50'
                                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/30'
                            }`}
                    >
                        Kuis Bayangan
                    </button>
                </nav>

            </div>
        </header>
    );
}