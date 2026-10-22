import PropTypes from 'prop-types';
import TypeBadge from './TypeBadge';

const statTotal = (stats) => stats.reduce((sum, s) => sum + s.value, 0);

const barClass = (isWinner, isTie) =>
  isWinner ? 'bg-indigo-600' : isTie ? 'bg-slate-400' : 'bg-slate-200';

const valueClass = (isWinner, isTie) =>
  isWinner ? 'text-neutral-900' : isTie ? 'text-neutral-600' : 'text-neutral-400';

/** Tab Bandingkan: dua Pokémon berdampingan + bar statistik. */
export default function CompareView({ compareList, onRemove }) {
  return (
    <div className="bg-white p-5 sm:p-8 rounded-3xl border border-line shadow-[0_1px_2px_rgba(17,24,39,.03)] max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-xl font-extrabold text-indigo-700 m-0">Bandingkan Pokémon</h2>
        <p className="text-slate-400 text-xs mt-1 m-0 font-medium">
          Pilih 2 Pokémon dari tab Jelajah untuk membandingkan statistik mereka.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 mb-8 sm:mb-10">
        {[0, 1].map((index) => {
          const p = compareList[index];
          if (!p) {
            return (
              <div
                key={index}
                className="h-52 border-2 border-dashed border-line rounded-2xl flex flex-col items-center justify-center text-xs text-slate-400 font-bold bg-canvas/40 gap-2"
              >
                <svg className="w-8 h-8 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Pilih Pokémon ke-{index + 1}
              </div>
            );
          }

          return (
            <div key={p.id} className="p-6 bg-canvas/60 rounded-2xl border border-line text-center relative">
              <button
                onClick={() => onRemove(p)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 font-bold text-[9px] cursor-pointer transition-all border border-line"
              >
                ✕ Hapus
              </button>
              <img src={p.sprite} alt={p.name} className="w-24 h-24 mx-auto animate-float-hover" />
              <h3 className="capitalize font-extrabold text-base text-neutral-900 mt-3 m-0">{p.name}</h3>
              <span className="font-mono text-[9px] text-neutral-400 font-bold">
                #{String(p.id).padStart(3, '0')}
              </span>
              <div className="flex justify-center gap-1.5 mt-2">
                {p.types.map((t) => (
                  <TypeBadge key={t} type={t} className="text-[8px]" />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-[9px]">
                <div className="bg-white p-2 rounded-lg border border-neutral-200/40">
                  <span className="block text-[7px] text-neutral-400 uppercase font-bold">Tinggi</span>
                  <span className="font-mono text-neutral-800 font-bold">{p.height / 10}m</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-neutral-200/40">
                  <span className="block text-[7px] text-neutral-400 uppercase font-bold">Berat</span>
                  <span className="font-mono text-neutral-800 font-bold">{p.weight / 10}kg</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-neutral-200/40">
                  <span className="block text-[7px] text-neutral-400 uppercase font-bold">Total</span>
                  <span className="font-mono text-neutral-800 font-bold">{statTotal(p.stats)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {compareList.length === 2 && (
        <div className="space-y-4">
          <h3 className="text-[9px] font-black tracking-widest text-neutral-400 uppercase m-0 text-center">
            Perbandingan Statistik Detail
          </h3>
          <div className="space-y-3">
            {compareList[0].stats.map((s, i) => {
              const val1 = s.value;
              const val2 = compareList[1].stats[i]?.value || 0;
              const pct1 = (val1 / 165) * 100;
              const pct2 = (val2 / 165) * 100;
              const isWinner1 = val1 > val2;
              const isWinner2 = val2 > val1;
              const isTie = val1 === val2;

              return (
                <div key={s.name} className="bg-canvas/50 rounded-xl border border-line p-4">
                  <div className="text-center mb-2">
                    <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">
                      {s.name.toUpperCase().replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className={`font-mono text-sm font-bold min-w-[36px] text-right ${valueClass(isWinner1, isTie)}`}>
                      {val1}
                    </span>
                    <div className="flex-1 flex justify-end">
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(pct1, 100)}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${barClass(isWinner1, isTie)}`}
                        />
                      </div>
                    </div>
                    <div className="w-px h-5 bg-neutral-200" />
                    <div className="flex-1">
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(pct2, 100)}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${barClass(isWinner2, isTie)}`}
                        />
                      </div>
                    </div>
                    <span className={`font-mono text-sm font-bold min-w-[36px] text-left ${valueClass(isWinner2, isTie)}`}>
                      {val2}
                    </span>
                  </div>
                </div>
              );
            })}

            {(() => {
              const total1 = statTotal(compareList[0].stats);
              const total2 = statTotal(compareList[1].stats);
              const isWinner1 = total1 > total2;
              const isWinner2 = total2 > total1;
              const isTie = total1 === total2;
              return (
                <div className="bg-neutral-900 rounded-xl p-4 text-white">
                  <div className="text-center mb-2">
                    <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">
                      TOTAL BASE STATS
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <span className={`font-mono text-xl font-black ${isWinner1 ? 'text-white' : 'text-neutral-500'}`}>{total1}</span>
                      <span className="block capitalize text-[9px] text-neutral-400 font-bold mt-0.5">{compareList[0].name}</span>
                      {isWinner1 && <span className="text-[8px] text-neutral-300 font-bold">★ UNGGUL</span>}
                    </div>
                    <div className="text-neutral-600 text-xs font-bold">VS</div>
                    <div className="text-center flex-1">
                      <span className={`font-mono text-xl font-black ${isWinner2 ? 'text-white' : 'text-neutral-500'}`}>{total2}</span>
                      <span className="block capitalize text-[9px] text-neutral-400 font-bold mt-0.5">{compareList[1].name}</span>
                      {isWinner2 && <span className="text-[8px] text-neutral-300 font-bold">★ UNGGUL</span>}
                    </div>
                  </div>
                  {isTie && (
                    <p className="text-center text-[9px] text-neutral-400 font-bold mt-2 m-0">
                      Seri! Keduanya seimbang.
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

CompareView.propTypes = {
  compareList: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRemove: PropTypes.func.isRequired,
};
