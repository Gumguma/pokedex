import { useState, useEffect, useRef, useCallback } from 'react';
import { TYPE_EFFECTIVENESS } from '../constants/pokemonData';
import TypeBadge from './TypeBadge';

// Stat extraction helper
const getStat = (poke, statName) => {
    const s = poke.stats?.find(st => st.name === statName);
    return s ? s.value : 50;
};

// Prepare members with dynamic battle stats (scaled for Lv 50 feel)
const prepareTeamMembers = (members) => {
    return members.map(m => {
        const rawHp = getStat(m, 'hp');
        const maxHp = Math.floor(rawHp * 2.2 + 110);
        return {
            ...m,
            maxHp,
            currentHp: maxHp,
            attack: Math.floor(getStat(m, 'attack') * 1.2 + 20),
            defense: Math.floor(getStat(m, 'defense') * 1.2 + 20),
            speed: Math.floor(getStat(m, 'speed') * 1.2 + 20),
        };
    });
};

// Calculate damage based on Attacker, Defender and Type effectiveness
const calcDamage = (attacker, defender) => {
    const atk = attacker.attack;
    const def = defender.defense;
    const baseDamage = Math.max(8, Math.floor(atk - def * 0.5));

    // Evaluate Type Effectiveness Multiplier
    let multiplier = 1.0;
    if (attacker.types && defender.types) {
        attacker.types.forEach(atkType => {
            defender.types.forEach(defType => {
                const mult = TYPE_EFFECTIVENESS[atkType]?.[defType];
                if (mult !== undefined) {
                    multiplier *= mult;
                }
            });
        });
    }

    const randomFactor = 0.85 + Math.random() * 0.3; // 85% to 115%
    const finalDamage = Math.max(4, Math.floor(baseDamage * multiplier * randomFactor));

    return { damage: finalDamage, multiplier };
};

const getEffectivenessText = (mult) => {
    if (mult >= 2) return " 💥 Sangat efektif!";
    if (mult > 0 && mult < 1) return " 🛡️ Kurang efektif...";
    if (mult === 0) return " 🚫 Tidak berpengaruh!";
    return "";
};

export default function BattleSimulator({ teams }) {
    // Selection States
    const [team1Id, setTeam1Id] = useState('');
    const [team2Id, setTeam2Id] = useState('');

    // Battle History State
    const [battleHistory, setBattleHistory] = useState(() => {
        const saved = localStorage.getItem('pokedex_battle_history');
        return saved ? JSON.parse(saved) : [];
    });

    // Battle Engine States
    const [battleState, setBattleState] = useState('idle'); // 'idle' | 'running' | 'paused' | 'finished'
    const [t1Members, setT1Members] = useState([]);
    const [t2Members, setT2Members] = useState([]);
    const [t1ActiveIdx, setT1ActiveIdx] = useState(0);
    const [t2ActiveIdx, setT2ActiveIdx] = useState(0);
    
    const [turn, setTurn] = useState(1);
    const [battleQueue, setBattleQueue] = useState([]);
    const [logs, setLogs] = useState([]);
    const [winner, setWinner] = useState('');
    const [simulationSpeed, setSimulationSpeed] = useState(1200); // ms per tick

    // Visual Animation States
    const [animating1, setAnimating1] = useState(false);
    const [animating2, setAnimating2] = useState(false);
    const [hit1, setHit1] = useState(false);
    const [hit2, setHit2] = useState(false);

    // Auto-scroll ref for log box
    const logEndRef = useRef(null);

    // Retrieve active teams
    const team1 = teams.find(t => t.id === team1Id);
    const team2 = teams.find(t => t.id === team2Id);

    // Filter out empty teams for dropdown selection
    const validTeams = teams.filter(t => t.members && t.members.length > 0);

    // Scroll to bottom of logs
    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    // Initialize battle
    const startBattle = () => {
        if (!team1 || !team2) return;
        if (team1.members.length === 0 || team2.members.length === 0) return;

        const prepared1 = prepareTeamMembers(team1.members);
        const prepared2 = prepareTeamMembers(team2.members);

        setT1Members(prepared1);
        setT2Members(prepared2);
        setT1ActiveIdx(0);
        setT2ActiveIdx(0);
        setTurn(1);
        setWinner('');
        setLogs([
            `⚔️ **SIMULASI ARENA DIMULAI!**`,
            `👥 **Tim 1:** ${team1.name} VS **Tim 2:** ${team2.name}`,
            `🏁 **${prepared1[0].name.toUpperCase()}** dan **${prepared2[0].name.toUpperCase()}** memasuki arena arena tempur!`
        ]);
        setBattleQueue([]);
        setBattleState('running');
    };

    // Reset battle
    const resetBattle = () => {
        setBattleState('idle');
        setT1Members([]);
        setT2Members([]);
        setT1ActiveIdx(0);
        setT2ActiveIdx(0);
        setTurn(1);
        setBattleQueue([]);
        setLogs([]);
        setWinner('');
    };

    // Build the action queue when it is empty
    const generateQueue = useCallback(() => {
        const p1 = t1Members[t1ActiveIdx];
        const p2 = t2Members[t2ActiveIdx];

        // 1. Check if either side has fainted active Pokemon
        if (!p1 && !p2) {
            setBattleQueue([{ type: 'victory', winnerSide: 0 }]); // draw
            return;
        }
        if (!p1) {
            setBattleQueue([{ type: 'victory', winnerSide: 2 }]);
            return;
        }
        if (!p2) {
            setBattleQueue([{ type: 'victory', winnerSide: 1 }]);
            return;
        }

        // If one is fainted, queue a swap action
        if (p1.currentHp <= 0) {
            const nextIdx = t1ActiveIdx + 1;
            if (nextIdx >= t1Members.length) {
                setBattleQueue([{ type: 'victory', winnerSide: 2 }]);
            } else {
                setBattleQueue([{ type: 'swap', side: 1, nextIdx }]);
            }
            return;
        }
        if (p2.currentHp <= 0) {
            const nextIdx = t2ActiveIdx + 1;
            if (nextIdx >= t2Members.length) {
                setBattleQueue([{ type: 'victory', winnerSide: 1 }]);
            } else {
                setBattleQueue([{ type: 'swap', side: 2, nextIdx }]);
            }
            return;
        }

        // 2. Both are alive: determine turn order based on Speed
        const speed1 = p1.speed;
        const speed2 = p2.speed;

        const queue = [];
        if (speed1 >= speed2) {
            queue.push(
                { type: 'attack', attackerSide: 1, defenderSide: 2, turn },
                { type: 'check_faint', side: 2 },
                { type: 'attack', attackerSide: 2, defenderSide: 1, turn }, // counter-attack (if alive)
                { type: 'check_faint', side: 1 }
            );
        } else {
            queue.push(
                { type: 'attack', attackerSide: 2, defenderSide: 1, turn },
                { type: 'check_faint', side: 1 },
                { type: 'attack', attackerSide: 1, defenderSide: 2, turn }, // counter-attack (if alive)
                { type: 'check_faint', side: 2 }
            );
        }
        
        setBattleQueue(queue);
        setTurn(prev => prev + 1);
    }, [t1Members, t1ActiveIdx, t2Members, t2ActiveIdx, turn]);

    // Execute the front-most action in the queue
    const executeAction = useCallback((action) => {
        if (action.type === 'victory') {
            const winTeamName = action.winnerSide === 1 ? team1.name : team2.name;
            setWinner(winTeamName);
            setLogs(prev => [
                ...prev,
                `🏆 **PERTANDINGAN SELESAI!**`,
                `🎉 **Tim [${winTeamName.toUpperCase()}] keluar sebagai Pemenang!**`
            ]);
            setBattleState('finished');

            // Save to Battle History
            const newRecord = {
                id: Date.now(),
                team1Name: team1.name,
                team2Name: team2.name,
                winner: winTeamName,
                turnCount: turn - 1,
                date: new Date().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
            setBattleHistory(prev => {
                const next = [newRecord, ...prev];
                localStorage.setItem('pokedex_battle_history', JSON.stringify(next));
                return next;
            });
            return;
        }

        if (action.type === 'swap') {
            if (action.side === 1) {
                setT1ActiveIdx(action.nextIdx);
                const nextPoke = t1Members[action.nextIdx];
                setLogs(prev => [
                    ...prev,
                    `🔄 **${team1.name}** menarik Pokémon pingsan dan mengeluarkan **${nextPoke.name.toUpperCase()}** (HP: ${nextPoke.currentHp}/${nextPoke.maxHp})!`
                ]);
            } else {
                setT2ActiveIdx(action.nextIdx);
                const nextPoke = t2Members[action.nextIdx];
                setLogs(prev => [
                    ...prev,
                    `🔄 **${team2.name}** menarik Pokémon pingsan dan mengeluarkan **${nextPoke.name.toUpperCase()}** (HP: ${nextPoke.currentHp}/${nextPoke.maxHp})!`
                ]);
            }
            return;
        }

        if (action.type === 'check_faint') {
            const poke = action.side === 1 ? t1Members[t1ActiveIdx] : t2Members[t2ActiveIdx];
            if (poke && poke.currentHp <= 0) {
                setLogs(prev => [
                    ...prev,
                    `💀 **${poke.name.toUpperCase()}** pingsan (fainted)!`
                ]);
                // Clear remaining queue to force swap checks
                setBattleQueue([]);
            }
            return;
        }

        if (action.type === 'attack') {
            const attacker = action.attackerSide === 1 ? t1Members[t1ActiveIdx] : t2Members[t2ActiveIdx];
            const defender = action.defenderSide === 1 ? t1Members[t1ActiveIdx] : t2Members[t2ActiveIdx];

            // If attacker fainted earlier in this turn, cancel attack
            if (!attacker || attacker.currentHp <= 0 || !defender || defender.currentHp <= 0) {
                return;
            }

            const { damage, multiplier } = calcDamage(attacker, defender);

            // Select a random skill from attacker moves
            const movesList = attacker.moves && attacker.moves.length > 0 
                ? attacker.moves 
                : ['Tackle', 'Growl', 'Pound', 'Scratch'];
            const chosenMove = movesList[Math.floor(Math.random() * movesList.length)];

            // Apply damage to state
            if (action.defenderSide === 1) {
                setT1Members(prev => prev.map((m, idx) => {
                    if (idx === t1ActiveIdx) {
                        return { ...m, currentHp: Math.max(0, m.currentHp - damage) };
                    }
                    return m;
                }));
            } else {
                setT2Members(prev => prev.map((m, idx) => {
                    if (idx === t2ActiveIdx) {
                        return { ...m, currentHp: Math.max(0, m.currentHp - damage) };
                    }
                    return m;
                }));
            }

            // Animation triggers
            if (action.attackerSide === 1) {
                setAnimating1(true);
                setHit2(true);
                setTimeout(() => {
                    setAnimating1(false);
                    setHit2(false);
                }, 400);
            } else {
                setAnimating2(true);
                setHit1(true);
                setTimeout(() => {
                    setAnimating2(false);
                    setHit1(false);
                }, 400);
            }

            const sideLabel = action.attackerSide === 1 ? team1.name : team2.name;
            setLogs(prev => [
                ...prev,
                `⚡ **[${sideLabel}] ${attacker.name.toUpperCase()}** menggunakan **${chosenMove}** kepada **${defender.name.toUpperCase()}**! Menghasilkan **${damage}** damage.${getEffectivenessText(multiplier)}`
            ]);
        }
    }, [t1Members, t1ActiveIdx, t2Members, t2ActiveIdx, team1, team2, turn]);

    // Engine loop tick
    useEffect(() => {
        if (battleState !== 'running') return;

        const timer = setTimeout(() => {
            if (battleQueue.length === 0) {
                generateQueue();
            } else {
                const [action, ...rest] = battleQueue;
                setBattleQueue(rest);
                executeAction(action);
            }
        }, simulationSpeed);

        return () => clearTimeout(timer);
    }, [battleState, battleQueue, simulationSpeed, generateQueue, executeAction]);

    return (
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.01)] max-w-5xl mx-auto text-left animate-scale-in">
            
            {/* 1. SELECTION SCREEN (IDLE STATE) */}
            {battleState === 'idle' && (
                <div className="space-y-8">
                    <div className="text-center max-w-xl mx-auto">
                        <h2 className="text-xl font-extrabold text-neutral-900 m-0">Arena Tempur Pokémon</h2>
                        <p className="text-neutral-450 text-xs mt-1 m-0 font-medium leading-relaxed">
                            Pilih dua formasi tim tempur yang sudah diisi, lalu simulasikan pertarungan otomatis berdasarkan giliran (turn-based).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Player Team Selection */}
                        <div className="bg-neutral-50/50 p-6 rounded-2xl border border-neutral-200/40 space-y-4">
                            <div>
                                <label className="block text-[8px] font-black tracking-widest text-neutral-400 mb-1.5 uppercase">PILIH TIM 1 (PLAYER)</label>
                                <select
                                    value={team1Id}
                                    onChange={(e) => setTeam1Id(e.target.value)}
                                    className="w-full bg-white border border-neutral-200 py-3 px-4 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-neutral-850"
                                >
                                    <option value="">-- Pilih Tim 1 --</option>
                                    {validTeams.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.members.length} Pokémon)</option>
                                    ))}
                                </select>
                            </div>
                            
                            {team1 ? (
                                <div className="space-y-3">
                                    <span className="block text-[8px] font-black tracking-widest text-neutral-400 uppercase">LINEUP TIM 1</span>
                                    <div className="grid grid-cols-6 gap-2">
                                        {team1.members.map(m => (
                                            <div key={m.id} className="aspect-square bg-white border border-neutral-200/60 rounded-xl flex items-center justify-center p-1 relative group" title={m.name}>
                                                <img src={m.sprite} alt={m.name} className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-neutral-400 text-xs border border-dashed border-neutral-200 rounded-xl font-bold bg-white">
                                    Belum memilih Tim 1
                                </div>
                            )}
                        </div>

                        {/* Opponent Team Selection */}
                        <div className="bg-neutral-50/50 p-6 rounded-2xl border border-neutral-200/40 space-y-4">
                            <div>
                                <label className="block text-[8px] font-black tracking-widest text-neutral-400 mb-1.5 uppercase">PILIH TIM 2 (LAWAN / KOMPUTER)</label>
                                <select
                                    value={team2Id}
                                    onChange={(e) => setTeam2Id(e.target.value)}
                                    className="w-full bg-white border border-neutral-200 py-3 px-4 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-neutral-850"
                                >
                                    <option value="">-- Pilih Tim 2 --</option>
                                    {validTeams.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.members.length} Pokémon)</option>
                                    ))}
                                </select>
                            </div>

                            {team2 ? (
                                <div className="space-y-3">
                                    <span className="block text-[8px] font-black tracking-widest text-neutral-400 uppercase">LINEUP TIM 2</span>
                                    <div className="grid grid-cols-6 gap-2">
                                        {team2.members.map(m => (
                                            <div key={m.id} className="aspect-square bg-white border border-neutral-200/60 rounded-xl flex items-center justify-center p-1 relative group" title={m.name}>
                                                <img src={m.sprite} alt={m.name} className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-neutral-400 text-xs border border-dashed border-neutral-200 rounded-xl font-bold bg-white">
                                    Belum memilih Tim 2
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center pt-4">
                        <button
                            onClick={startBattle}
                            disabled={!team1Id || !team2Id || team1Id === team2Id || team1?.members?.length === 0 || team2?.members?.length === 0}
                            className="px-8 py-3.5 bg-neutral-900 text-white hover:bg-neutral-850 font-bold text-xs rounded-xl shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all uppercase tracking-widest"
                        >
                            {!team1Id || !team2Id
                                ? 'Pilih Kedua Tim'
                                : team1Id === team2Id
                                ? 'Tim Tidak Boleh Sama'
                                : 'Mulai Pertandingan'}
                        </button>
                    </div>

                    {/* RIWAYAT PERTANDINGAN */}
                    <div className="border-t border-neutral-200/50 pt-8 mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-tight m-0">Riwayat Pertandingan Arena</h3>
                                <p className="text-[10px] text-neutral-450 mt-0.5 m-0 font-medium">Daftar hasil pertarungan taktis yang telah selesai disimulasikan.</p>
                            </div>
                            {battleHistory.length > 0 && (
                                <button
                                    onClick={() => {
                                        setBattleHistory([]);
                                        localStorage.removeItem('pokedex_battle_history');
                                    }}
                                    className="px-3 py-1.5 border border-neutral-200 hover:text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-neutral-450"
                                >
                                    ✕ Bersihkan Riwayat
                                </button>
                            )}
                        </div>

                        {battleHistory.length === 0 ? (
                            <div className="py-10 text-center border border-dashed border-neutral-200/80 rounded-2xl bg-neutral-50/20 text-neutral-400 text-[10px] font-bold">
                                Belum ada riwayat pertandingan.
                            </div>
                        ) : (
                            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                                {battleHistory.map((history) => (
                                    <div key={history.id} className="bg-neutral-50/50 border border-neutral-200/40 p-4 rounded-xl flex items-center justify-between text-[10px] font-bold text-neutral-600 gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-neutral-800">{history.team1Name}</span>
                                                <span className="text-neutral-400 font-normal">VS</span>
                                                <span className="text-neutral-800">{history.team2Name}</span>
                                            </div>
                                            <div className="text-[8px] text-neutral-400 font-bold tracking-wider font-mono uppercase">{history.date}</div>
                                        </div>
                                        <div className="text-right space-y-1 flex-shrink-0">
                                            <div className="text-[9px] text-neutral-900 font-black uppercase">Pemenang: {history.winner} 🎉</div>
                                            <div className="text-[8px] text-neutral-450 font-mono tracking-wider">{history.turnCount} Turn</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 2. BATTLE STAGE (RUNNING, PAUSED, FINISHED STATE) */}
            {battleState !== 'idle' && (
                <div className="space-y-8">
                    {/* Header Arena */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-100 pb-5">
                        <div>
                            <h2 className="text-sm font-black tracking-widest text-neutral-400 uppercase m-0">Arena Tempur Aktif</h2>
                            <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-neutral-500 font-bold">
                                <span>{team1?.name}</span>
                                <span className="text-neutral-300">VS</span>
                                <span>{team2?.name}</span>
                            </div>
                        </div>

                        {/* Controls speed & state */}
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setSimulationSpeed(prev => prev === 1200 ? 500 : 1200)}
                                className="px-3 py-2 border border-neutral-200 hover:bg-neutral-50 text-[9px] font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all text-neutral-700 font-bold"
                            >
                                Speed: {simulationSpeed === 1200 ? 'Normal (1.2s)' : 'Cepat (0.5s)'}
                            </button>

                            {battleState === 'running' && (
                                <button
                                    onClick={() => setBattleState('paused')}
                                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all text-neutral-800"
                                >
                                    Pause
                                </button>
                            )}

                            {battleState === 'paused' && (
                                <button
                                    onClick={() => setBattleState('running')}
                                    className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-850 text-[9px] font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                                >
                                    Resume
                                </button>
                            )}

                            <button
                                onClick={resetBattle}
                                className="px-4 py-2 border border-neutral-200 hover:text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50 text-[9px] font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all text-neutral-400"
                            >
                                Keluar Arena
                            </button>
                        </div>
                    </div>

                    {/* Arena visual card Pokémon */}
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-center">
                        
                        {/* Tim 1 Active Pokemon Card */}
                        <div className="md:col-span-3">
                            {t1Members[t1ActiveIdx] ? (() => {
                                const p = t1Members[t1ActiveIdx];
                                const hpPct = (p.currentHp / p.maxHp) * 100;
                                const barColor = hpPct > 50 ? 'bg-neutral-900' : hpPct > 20 ? 'bg-neutral-500' : 'bg-neutral-300';
                                return (
                                    <div 
                                        className={`bg-neutral-50/50 p-6 rounded-2xl border border-neutral-200/40 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] transition-all duration-300 ${
                                            animating1 ? 'translate-x-10 scale-105 rotate-2 z-10' : ''
                                        } ${hit1 ? 'animate-bounce border-neutral-350 bg-neutral-100' : ''}`}
                                    >
                                        <span className="absolute top-4 left-4 font-mono text-[8px] font-bold text-neutral-400">ID #{String(p.id).padStart(3, '0')}</span>
                                        <img src={p.sprite} alt={p.name} className="w-28 h-28 object-contain filter drop-shadow-md animate-float-hover mb-4" />
                                        <h3 className="capitalize font-extrabold text-base text-neutral-900 m-0">{p.name}</h3>
                                        <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest block mt-0.5">Lv. 50</span>
                                        
                                        <div className="flex justify-center gap-1 mt-2">
                                            {p.types.map(t => <TypeBadge key={t} type={t} className="text-[8px]" />)}
                                        </div>

                                        {/* HP Info */}
                                        <div className="w-full mt-4 max-w-[200px] mx-auto text-left space-y-1">
                                            <div className="flex justify-between items-center text-[9px] font-bold font-mono text-neutral-600">
                                                <span>HP</span>
                                                <span>{p.currentHp} / {p.maxHp}</span>
                                            </div>
                                            <div className="w-full bg-neutral-150 h-2 rounded-full overflow-hidden border border-neutral-200/30">
                                                <div style={{ width: `${hpPct}%` }} className={`h-full transition-all duration-300 ${barColor}`} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })() : (
                                <div className="h-[300px] bg-neutral-50 border border-neutral-200/40 rounded-2xl flex items-center justify-center text-xs text-neutral-400 font-bold">
                                    Semua Pokémon pingsan
                                </div>
                            )}
                        </div>

                        {/* VS Separator */}
                        <div className="md:col-span-1 text-center py-4 flex flex-col items-center justify-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-neutral-950 border-4 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.1)] flex items-center justify-center text-white text-xs font-black tracking-tight z-10">VS</div>
                            <span className="font-mono text-[9px] font-black text-neutral-450 uppercase tracking-widest block">Turn {turn}</span>
                        </div>

                        {/* Tim 2 Active Pokemon Card */}
                        <div className="md:col-span-3">
                            {t2Members[t2ActiveIdx] ? (() => {
                                const p = t2Members[t2ActiveIdx];
                                const hpPct = (p.currentHp / p.maxHp) * 100;
                                const barColor = hpPct > 50 ? 'bg-neutral-900' : hpPct > 20 ? 'bg-neutral-500' : 'bg-neutral-300';
                                return (
                                    <div 
                                        className={`bg-neutral-50/50 p-6 rounded-2xl border border-neutral-200/40 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] transition-all duration-300 ${
                                            animating2 ? '-translate-x-10 scale-105 -rotate-2 z-10' : ''
                                        } ${hit2 ? 'animate-bounce border-neutral-350 bg-neutral-100' : ''}`}
                                    >
                                        <span className="absolute top-4 right-4 font-mono text-[8px] font-bold text-neutral-400">ID #{String(p.id).padStart(3, '0')}</span>
                                        <img src={p.sprite} alt={p.name} className="w-28 h-28 object-contain filter drop-shadow-md animate-float-hover mb-4" />
                                        <h3 className="capitalize font-extrabold text-base text-neutral-900 m-0">{p.name}</h3>
                                        <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest block mt-0.5">Lv. 50</span>
                                        
                                        <div className="flex justify-center gap-1 mt-2">
                                            {p.types.map(t => <TypeBadge key={t} type={t} className="text-[8px]" />)}
                                        </div>

                                        {/* HP Info */}
                                        <div className="w-full mt-4 max-w-[200px] mx-auto text-left space-y-1">
                                            <div className="flex justify-between items-center text-[9px] font-bold font-mono text-neutral-600">
                                                <span>HP</span>
                                                <span>{p.currentHp} / {p.maxHp}</span>
                                            </div>
                                            <div className="w-full bg-neutral-150 h-2 rounded-full overflow-hidden border border-neutral-200/30">
                                                <div style={{ width: `${hpPct}%` }} className={`h-full transition-all duration-300 ${barColor}`} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })() : (
                                <div className="h-[300px] bg-neutral-50 border border-neutral-200/40 rounded-2xl flex items-center justify-center text-xs text-neutral-400 font-bold">
                                    Semua Pokémon pingsan
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Lineups and HP status grids */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-neutral-100 pt-6">
                        {/* Tim 1 Lineup */}
                        <div className="space-y-2">
                            <span className="block text-[8px] font-black tracking-widest text-neutral-400 uppercase">LINEUP TIM 1 ({team1?.name})</span>
                            <div className="flex flex-wrap gap-2.5">
                                {t1Members.map((m, idx) => (
                                    <div 
                                        key={m.id} 
                                        className={`w-11 h-11 border rounded-xl flex items-center justify-center p-1 relative transition-all duration-300 ${
                                            idx === t1ActiveIdx 
                                                ? 'bg-neutral-100 border-neutral-900 ring-2 ring-neutral-900/10' 
                                                : m.currentHp <= 0 
                                                ? 'opacity-40 grayscale border-neutral-250 bg-neutral-50' 
                                                : 'bg-white border-neutral-200'
                                        }`}
                                    >
                                        <img src={m.sprite} alt={m.name} className="w-full h-full object-contain" />
                                        {m.currentHp > 0 && (
                                            <div className="absolute -bottom-1 left-0 right-0 h-1 bg-neutral-200 rounded-full overflow-hidden mx-1">
                                                <div style={{ width: `${(m.currentHp / m.maxHp) * 100}%` }} className="h-full bg-neutral-900" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tim 2 Lineup */}
                        <div className="space-y-2">
                            <span className="block text-[8px] font-black tracking-widest text-neutral-400 uppercase">LINEUP TIM 2 ({team2?.name})</span>
                            <div className="flex flex-wrap gap-2.5">
                                {t2Members.map((m, idx) => (
                                    <div 
                                        key={m.id} 
                                        className={`w-11 h-11 border rounded-xl flex items-center justify-center p-1 relative transition-all duration-300 ${
                                            idx === t2ActiveIdx 
                                                ? 'bg-neutral-100 border-neutral-900 ring-2 ring-neutral-900/10' 
                                                : m.currentHp <= 0 
                                                ? 'opacity-40 grayscale border-neutral-250 bg-neutral-50' 
                                                : 'bg-white border-neutral-200'
                                        }`}
                                    >
                                        <img src={m.sprite} alt={m.name} className="w-full h-full object-contain" />
                                        {m.currentHp > 0 && (
                                            <div className="absolute -bottom-1 left-0 right-0 h-1 bg-neutral-200 rounded-full overflow-hidden mx-1">
                                                <div style={{ width: `${(m.currentHp / m.maxHp) * 100}%` }} className="h-full bg-neutral-900" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Battle log box */}
                    <div className="space-y-2 border-t border-neutral-100 pt-6">
                        <span className="block text-[8px] font-black tracking-widest text-neutral-400 uppercase">LOG PERTANDINGAN (BATTLE JOURNAL)</span>
                        <div className="bg-neutral-900 text-neutral-200 p-4 rounded-2xl font-mono text-[9px] h-48 overflow-y-auto border border-neutral-950 shadow-inner flex flex-col gap-1.5 animate-pulse-slow">
                            {logs.map((log, index) => {
                                // Formatting simple marks inside terminal-styled log
                                const isDivider = log.startsWith('⚔️') || log.startsWith('🏆') || log.startsWith('👥');
                                const isFaint = log.includes('💀');
                                const isSwap = log.includes('🔄');

                                let colorClass = "text-neutral-300";
                                if (isDivider) colorClass = "text-white font-extrabold text-[10px] tracking-wide border-b border-neutral-800 pb-1 mt-1 mb-0.5";
                                else if (isFaint) colorClass = "text-neutral-450 font-bold";
                                else if (isSwap) colorClass = "text-neutral-450 italic";

                                return (
                                    <div key={index} className={colorClass}>
                                        {log.replace(/\*\*/g, '')}
                                    </div>
                                );
                            })}
                            <div ref={logEndRef} />
                        </div>
                    </div>
                </div>
            )}

            {/* 3. OVERLAY WINNER MODAL */}
            {battleState === 'finished' && winner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/20 backdrop-blur-md">
                    <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-2xl max-w-sm w-full text-center space-y-6 animate-scale-in">
                        <div className="w-16 h-16 bg-neutral-50 border border-neutral-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <span className="text-2xl">🏆</span>
                        </div>
                        
                        <div>
                            <h3 className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">PERTANDINGAN SELESAI</h3>
                            <h2 className="text-xl font-black text-neutral-900 mt-1 capitalize leading-snug">
                                Tim {winner} Menang! 🎉
                            </h2>
                            <p className="text-[10px] text-neutral-400 font-bold mt-1.5 leading-relaxed">
                                Seluruh Pokémon dari tim lawan berhasil dibuat pingsan dalam pertempuran taktis yang sengit.
                            </p>
                        </div>

                        <div className="flex gap-2.5">
                            <button
                                onClick={startBattle}
                                className="w-full py-3 bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm transition-colors uppercase tracking-wider"
                            >
                                Tanding Ulang
                            </button>
                            <button
                                onClick={resetBattle}
                                className="w-full py-3 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 text-neutral-800 font-bold text-xs rounded-xl cursor-pointer shadow-sm transition-colors uppercase tracking-wider"
                            >
                                Reset Arena
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
