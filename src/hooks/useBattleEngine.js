import { useState, useEffect, useCallback } from 'react';
import {
  buildTurnQueue,
  calcDamage,
  effectivenessText,
  pickMove,
  prepareTeamMembers,
} from '../utils/battle';
import { safeSetItem, safeGetItem, safeRemoveItem } from '../utils/storage';

/**
 * Mesin simulasi pertarungan: state, antrean aksi, dan efek samping.
 * Komponen tinggal menampilkan.
 */
export function useBattleEngine(teams) {
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');

  const [battleHistory, setBattleHistory] = useState(() =>
    safeGetItem('pokedex_battle_history', []),
  );

  const [battleState, setBattleState] = useState('idle'); // idle | running | finished
  const [t1Members, setT1Members] = useState([]);
  const [t2Members, setT2Members] = useState([]);
  const [t1ActiveIdx, setT1ActiveIdx] = useState(0);
  const [t2ActiveIdx, setT2ActiveIdx] = useState(0);

  const [turn, setTurn] = useState(1);
  const [battleQueue, setBattleQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  const [winner, setWinner] = useState('');
  const [simulationSpeed, setSimulationSpeed] = useState(1200);

  const [animating1, setAnimating1] = useState(false);
  const [animating2, setAnimating2] = useState(false);
  const [hit1, setHit1] = useState(false);
  const [hit2, setHit2] = useState(false);

  const team1 = teams.find((t) => t.id === team1Id);
  const team2 = teams.find((t) => t.id === team2Id);
  const validTeams = teams.filter((t) => t.members && t.members.length > 0);

  const startBattle = () => {
    if (!team1 || !team2) return;
    if (!team1.members.length || !team2.members.length) return;

    const prepared1 = prepareTeamMembers(team1.members);
    const prepared2 = prepareTeamMembers(team2.members);

    setT1Members(prepared1);
    setT2Members(prepared2);
    setT1ActiveIdx(0);
    setT2ActiveIdx(0);
    setTurn(1);
    setWinner('');
    setLogs([
      '⚔️ **SIMULASI ARENA DIMULAI!**',
      `👥 **Tim 1:** ${team1.name} VS **Tim 2:** ${team2.name}`,
      `🏁 **${prepared1[0].name.toUpperCase()}** dan **${prepared2[0].name.toUpperCase()}** memasuki arena tempur!`,
    ]);
    setBattleQueue([]);
    setBattleState('running');
  };

  const pauseBattle = () => setBattleState('paused');
  const resumeBattle = () => setBattleState('running');

  const clearHistory = () => {
    setBattleHistory([]);
    safeRemoveItem('pokedex_battle_history');
  };

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

  /** Isi antrean kalau kosong; majukan turn hanya kalau bukan swap/victory. */
  const generateQueue = useCallback(() => {
    const { queue, advanceTurn } = buildTurnQueue({
      team1Members: t1Members,
      team1ActiveIdx: t1ActiveIdx,
      team2Members: t2Members,
      team2ActiveIdx: t2ActiveIdx,
      turn,
    });
    setBattleQueue(queue);
    if (advanceTurn) setTurn((prev) => prev + 1);
  }, [t1Members, t1ActiveIdx, t2Members, t2ActiveIdx, turn]);

  const executeAction = useCallback(
    (action) => {
      if (action.type === 'victory') {
        const winTeamName = action.winnerSide === 1 ? team1?.name : team2?.name;
        const isDraw = action.winnerSide === 0;

        setWinner(isDraw ? 'Seri' : winTeamName);
        setLogs((prev) => [
          ...prev,
          '🏆 **PERTANDINGAN SELESAI!**',
          isDraw
            ? '🤝 **Kedua tim habis bersamaan — pertandingan berakhir seri!**'
            : `🎉 **Tim [${winTeamName.toUpperCase()}] keluar sebagai Pemenang!**`,
        ]);
        setBattleState('finished');

        const newRecord = {
          id: Date.now(),
          team1Name: team1?.name ?? '-',
          team2Name: team2?.name ?? '-',
          winner: isDraw ? 'Seri' : winTeamName,
          turnCount: turn - 1,
          date: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        setBattleHistory((prev) => {
          const next = [newRecord, ...prev].slice(0, 20);
          safeSetItem('pokedex_battle_history', JSON.stringify(next));
          return next;
        });
        return;
      }

      if (action.type === 'swap') {
        const members = action.side === 1 ? t1Members : t2Members;
        const teamName = action.side === 1 ? team1?.name : team2?.name;
        const nextPoke = members[action.nextIdx];

        if (action.side === 1) setT1ActiveIdx(action.nextIdx);
        else setT2ActiveIdx(action.nextIdx);

        setLogs((prev) => [
          ...prev,
          `🔄 **${teamName}** menarik Pokémon pingsan dan mengeluarkan **${nextPoke.name.toUpperCase()}** (HP: ${nextPoke.currentHp}/${nextPoke.maxHp})!`,
        ]);
        return;
      }

      if (action.type === 'check_faint') {
        const poke = action.side === 1 ? t1Members[t1ActiveIdx] : t2Members[t2ActiveIdx];
        if (poke && poke.currentHp <= 0) {
          setLogs((prev) => [...prev, `💀 **${poke.name.toUpperCase()}** pingsan (fainted)!`]);
          setBattleQueue([]);
        }
        return;
      }

      if (action.type === 'attack') {
        const attacker = action.attackerSide === 1 ? t1Members[t1ActiveIdx] : t2Members[t2ActiveIdx];
        const defender = action.defenderSide === 1 ? t1Members[t1ActiveIdx] : t2Members[t2ActiveIdx];

        if (!attacker || attacker.currentHp <= 0 || !defender || defender.currentHp <= 0) return;

        const { damage, multiplier } = calcDamage(attacker, defender);
        const chosenMove = pickMove(attacker);
        const applyDamage = (member, idx) =>
          idx === (action.defenderSide === 1 ? t1ActiveIdx : t2ActiveIdx)
            ? { ...member, currentHp: Math.max(0, member.currentHp - damage) }
            : member;

        if (action.defenderSide === 1) setT1Members((prev) => prev.map(applyDamage));
        else setT2Members((prev) => prev.map(applyDamage));

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

        const sideLabel = action.attackerSide === 1 ? team1?.name : team2?.name;
        setLogs((prev) => [
          ...prev,
          `⚡ **[${sideLabel}] ${attacker.name.toUpperCase()}** menggunakan **${chosenMove}** kepada **${defender.name.toUpperCase()}**! Menghasilkan **${damage}** damage.${effectivenessText(multiplier)}`,
        ]);
      }
    },
    [t1Members, t1ActiveIdx, t2Members, t2ActiveIdx, team1, team2, turn],
  );

  // Loop mesin: satu aksi per tick.
  useEffect(() => {
    if (battleState !== 'running') return undefined;

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

  return {
    team1Id,
    setTeam1Id,
    team2Id,
    setTeam2Id,
    team1,
    team2,
    validTeams,
    battleState,
    t1Members,
    t2Members,
    t1ActiveIdx,
    t2ActiveIdx,
    turn,
    logs,
    winner,
    simulationSpeed,
    setSimulationSpeed,
    animating1,
    animating2,
    hit1,
    hit2,
    battleHistory,
    startBattle,
    resetBattle,
    pauseBattle,
    resumeBattle,
    clearHistory,
  };
}
