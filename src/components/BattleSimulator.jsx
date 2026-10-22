import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ModalShell from './ModalShell';
import TypeBadge from './TypeBadge';
import { useBattleEngine } from '../hooks/useBattleEngine';

const hpBarColor = (pct) => (pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-400' : 'bg-rose-500');

/** Kartu Pokémon yang sedang bertarung. */
function FighterCard({ pokemon, side, animating, hit }) {
  if (!pokemon) {
    return (
      <div className="h-[300px] bg-neutral-50 border border-line rounded-2xl flex items-center justify-center text-xs text-neutral-400 font-bold">
        Semua Pokémon pingsan
      </div>
    );
  }

  const hpPct = (pokemon.currentHp / pokemon.maxHp) * 100;
  const attackStyle = side === 1
    ? (animating ? 'translate-x-10 scale-105 rotate-2 z-10' : '')
    : (animating ? '-translate-x-10 scale-105 -rotate-2 z-10' : '');

  return (
    <div
      className={`bg-canvas/60 p-4 sm:p-6 rounded-2xl border border-line text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[240px] sm:min-h-[300px] transition-all duration-300 ${attackStyle} ${
        hit ? 'animate-bounce border-slate-300 bg-neutral-100' : ''
      }`}
    >
      <span className={`absolute top-4 font-mono text-[8px] font-bold text-neutral-400 ${side === 1 ? 'left-4' : 'right-4'}`}>
        ID #{String(pokemon.id).padStart(3, '0')}
      </span>
      <img src={pokemon.sprite} alt={pokemon.name} className="w-28 h-28 object-contain filter drop-shadow-md animate-float-hover mb-4" />
      <h3 className="capitalize font-extrabold text-base text-neutral-900 m-0">{pokemon.name}</h3>
      <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest block mt-0.5">Lv. 50</span>

      <div className="flex justify-center gap-1 mt-2">
        {pokemon.types.map((t) => <TypeBadge key={t} type={t} className="text-[8px]" />)}
      </div>

      <div className="w-full mt-4 max-w-[200px] mx-auto text-left space-y-1">
        <div className="flex justify-between items-center text-[9px] font-bold font-mono text-neutral-600">
          <span>HP</span>
          <span>{pokemon.currentHp} / {pokemon.maxHp}</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-neutral-200/30">
          <div style={{ width: `${hpPct}%` }} className={`h-full transition-all duration-300 ${hpBarColor(hpPct)}`} />
        </div>
      </div>
    </div>
  );
}

FighterCard.propTypes = {
  pokemon: PropTypes.object,
  side: PropTypes.oneOf([1, 2]).isRequired,
  animating: PropTypes.bool.isRequired,
  hit: PropTypes.bool.isRequired,
};

/** Deretan thumbnail tim dengan indikator HP tipis. */
function LineupRow({ members, activeIdx, label }) {
  return (
    <div className="space-y-2">
      <span className="block text-[8px] font-black tracking-widest text-neutral-400 uppercase">{label}</span>
      <div className="flex flex-wrap gap-2.5">
        {members.map((m, idx) => (
          <div
            key={m.id}
            className={`w-11 h-11 border rounded-xl flex items-center justify-center p-1 relative transition-all duration-300 ${
              idx === activeIdx
                ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-600/10'
                : m.currentHp <= 0
                  ? 'opacity-40 grayscale border-slate-300 bg-canvas'
                  : 'bg-white border-line'
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
  );
}

LineupRow.propTypes = {
  members: PropTypes.arrayOf(PropTypes.object).isRequired,
  activeIdx: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};

export default function BattleSimulator({ teams }) {
  const engine = useBattleEngine(teams);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [engine.logs]);

  const {
    team1Id, setTeam1Id, team2Id, setTeam2Id, team1, team2, validTeams,
    battleState, t1Members, t2Members, t1ActiveIdx, t2ActiveIdx, turn,
    logs, winner, simulationSpeed, setSimulationSpeed,
    animating1, animating2, hit1, hit2, battleHistory,
    startBattle, resetBattle, pauseBattle, resumeBattle, clearHistory,
  } = engine;

  return (
    <div className="bg-white p-5 sm:p-8 rounded-3xl border border-line shadow-[0_1px_2px_rgba(17,24,39,.03)] max-w-5xl mx-auto text-left animate-scale-in">

      {/* 1. PILIH TIM */}
      {battleState === 'idle' && (
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-xl font-extrabold text-neutral-900 m-0">Arena Tempur Pokémon</h2>
            <p className="text-slate-400 text-xs mt-1 m-0 font-medium leading-relaxed">
              Pilih dua formasi tim tempur yang sudah diisi, lalu simulasikan pertarungan otomatis berdasarkan giliran (turn-based).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
            {[1, 2].map((side) => {
              const isFirst = side === 1;
              const selectedId = isFirst ? team1Id : team2Id;
              const onSelect = isFirst ? setTeam1Id : setTeam2Id;
              const team = isFirst ? team1 : team2;

              return (
                <div key={side} className="bg-canvas/60 p-4 sm:p-6 rounded-2xl border border-line space-y-4">
                  <div>
                    <label className="block text-[8px] font-black tracking-widest text-neutral-400 mb-1.5 uppercase">
                      {isFirst ? 'PILIH TIM 1 (PLAYER)' : 'PILIH TIM 2 (LAWAN / KOMPUTER)'}
                    </label>
                    <select
                      value={selectedId}
                      onChange={(event) => onSelect(event.target.value)}
                      className="w-full bg-white border border-line py-3 px-4 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="">-- Pilih Tim {side} --</option>
                      {validTeams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.members.length} Pokémon)</option>
                      ))}
                    </select>
                  </div>

                  {team ? (
                    <div className="space-y-3">
                      <span className="block text-[8px] font-black tracking-widest text-neutral-400 uppercase">
                        LINEUP TIM {side}
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {team.members.map((m) => (
                          <div key={m.id} className="aspect-square bg-white border border-line rounded-xl flex items-center justify-center p-1 relative group" title={m.name}>
                            <img src={m.sprite} alt={m.name} className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-neutral-400 text-xs border border-dashed border-line rounded-xl font-bold bg-white">
                      Belum memilih Tim {side}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={startBattle}
              disabled={!team1Id || !team2Id || team1Id === team2Id || team1?.members?.length === 0 || team2?.members?.length === 0}
              className="btn-primary px-8 py-3.5 uppercase tracking-widest disabled:cursor-not-allowed"
            >
              {!team1Id || !team2Id
                ? 'Pilih Kedua Tim'
                : team1Id === team2Id
                  ? 'Tim Tidak Boleh Sama'
                  : 'Mulai Pertandingan'}
            </button>
          </div>

          <div className="border-t border-line pt-8 mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-tight m-0">Riwayat Pertandingan Arena</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 m-0 font-medium">
                  Daftar hasil pertarungan taktis yang telah selesai disimulasikan.
                </p>
              </div>
              {battleHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-3 py-1.5 border border-line hover:text-indigo-700 hover:border-indigo-200 hover:bg-indigo-50 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-slate-400"
                >
                  ✕ Bersihkan Riwayat
                </button>
              )}
            </div>

            {battleHistory.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-line rounded-2xl bg-canvas/40 text-neutral-400 text-[10px] font-bold">
                Belum ada riwayat pertandingan.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {battleHistory.map((history) => (
                  <div key={history.id} className="bg-canvas/60 border border-line p-4 rounded-xl flex items-center justify-between text-[10px] font-bold text-neutral-600 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-neutral-800">{history.team1Name}</span>
                        <span className="text-neutral-400 font-normal">VS</span>
                        <span className="text-neutral-800">{history.team2Name}</span>
                      </div>
                      <div className="text-[8px] text-neutral-400 font-bold tracking-wider font-mono uppercase">{history.date}</div>
                    </div>
                    <div className="text-right space-y-1 flex-shrink-0">
                      <div className="text-[9px] text-indigo-700 font-black uppercase">Pemenang: {history.winner} 🎉</div>
                      <div className="text-[8px] text-slate-400 font-mono tracking-wider">{history.turnCount} Turn</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ARENA BERJALAN */}
      {battleState !== 'idle' && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-line-soft pb-5">
            <div>
              <h2 className="text-sm font-black tracking-widest text-neutral-400 uppercase m-0">Arena Tempur Aktif</h2>
              <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-neutral-500 font-bold">
                <span>{team1?.name}</span>
                <span className="text-neutral-300">VS</span>
                <span>{team2?.name}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSimulationSpeed((prev) => (prev === 1200 ? 500 : 1200))}
                className="px-3 py-2 border border-line hover:bg-indigo-50 hover:text-indigo-700 text-[9px] font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all text-neutral-700"
              >
                Speed: {simulationSpeed === 1200 ? 'Normal (1.2s)' : 'Cepat (0.5s)'}
              </button>

              {battleState === 'running' && (
                <button
                  onClick={pauseBattle}
                  className="px-4 py-2 bg-canvas hover:bg-indigo-50 border border-line hover:border-indigo-200 text-[9px] font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all text-neutral-800"
                >
                  Pause
                </button>
              )}

              {battleState === 'paused' && (
                <button
                  onClick={resumeBattle}
                  className="btn-primary px-4 py-2 text-[9px] uppercase tracking-wider"
                >
                  Resume
                </button>
              )}

              <button
                onClick={resetBattle}
                className="px-4 py-2 border border-line hover:text-indigo-700 hover:border-indigo-200 hover:bg-indigo-50 text-[9px] font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all text-neutral-400"
              >
                Keluar Arena
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-5 sm:gap-6 items-center">
            <div className="md:col-span-3">
              <FighterCard pokemon={t1Members[t1ActiveIdx]} side={1} animating={animating1} hit={hit1} />
            </div>

            <div className="md:col-span-1 text-center py-4 flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-700 to-violet-600 border-4 border-white shadow-[0_0_0_1px_rgba(79,70,229,.25)] flex items-center justify-center text-white text-xs font-black tracking-tight z-10">
                VS
              </div>
              <span className="font-mono text-[9px] font-black text-slate-400 uppercase tracking-widest block">Turn {turn}</span>
            </div>

            <div className="md:col-span-3">
              <FighterCard pokemon={t2Members[t2ActiveIdx]} side={2} animating={animating2} hit={hit2} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 border-t border-line-soft pt-6">
            <LineupRow members={t1Members} activeIdx={t1ActiveIdx} label={`LINEUP TIM 1 (${team1?.name ?? ''})`} />
            <LineupRow members={t2Members} activeIdx={t2ActiveIdx} label={`LINEUP TIM 2 (${team2?.name ?? ''})`} />
          </div>

          <div className="space-y-2 border-t border-line-soft pt-6">
            <span className="block text-[8px] font-black tracking-widest text-neutral-400 uppercase">
              LOG PERTANDINGAN (BATTLE JOURNAL)
            </span>
            <div
              role="log"
              aria-live="polite"
              className="bg-neutral-900 text-neutral-200 p-4 rounded-2xl font-mono text-[9px] h-48 overflow-y-auto border border-neutral-950 shadow-inner flex flex-col gap-1.5 animate-pulse-slow"
            >
              {logs.map((log, index) => {
                const isDivider = log.startsWith('⚔️') || log.startsWith('🏆') || log.startsWith('👥');
                const isFaint = log.includes('💀');
                const isSwap = log.includes('🔄');

                let colorClass = 'text-neutral-300';
                if (isDivider) colorClass = 'text-white font-extrabold text-[10px] tracking-wide border-b border-neutral-800 pb-1 mt-1 mb-0.5';
                else if (isFaint) colorClass = 'text-slate-400 font-bold';
                else if (isSwap) colorClass = 'text-slate-400 italic';

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

      {/* 3. MODAL PEMENANG */}
      {battleState === 'finished' && winner && (
        <ModalShell onClose={resetBattle} label="Hasil pertandingan" panelClassName="max-w-sm p-5 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <span className="text-2xl">🏆</span>
          </div>

          <div>
            <h3 className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">PERTANDINGAN SELESAI</h3>
            <h2 className="text-xl font-black text-indigo-700 mt-1 capitalize leading-snug">
              {winner === 'Seri' ? 'Pertandingan Seri! 🤝' : `${winner} Menang! 🎉`}
            </h2>
            <p className="text-[10px] text-neutral-400 font-bold mt-1.5 leading-relaxed">
              {winner === 'Seri'
                ? 'Kedua tim kehabisan Pokémon pada turn yang sama.'
                : 'Seluruh Pokémon dari tim lawan berhasil dibuat pingsan dalam pertempuran taktis yang sengit.'}
            </p>
          </div>

          <div className="flex gap-2.5">
            <button onClick={startBattle} className="btn-primary w-full uppercase tracking-wider">
              Tanding Ulang
            </button>
            <button onClick={resetBattle} className="btn-secondary w-full uppercase tracking-wider">
              Reset Arena
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

BattleSimulator.propTypes = {
  teams: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      members: PropTypes.arrayOf(PropTypes.object),
    }),
  ).isRequired,
};
