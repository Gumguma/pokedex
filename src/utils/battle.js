/**
 * Logika pertarungan murni (tanpa React/state) supaya bisa diuji.
 * Semua angka mengikuti perilaku lama di BattleSimulator.
 */
import { TYPE_EFFECTIVENESS } from '../constants/pokemonData.js';

export const DEFAULT_MOVES = ['Tackle', 'Growl', 'Pound', 'Scratch'];

/** Ambil nilai stat, fallback 50 kalau tidak ada. */
export const getStat = (poke, statName) => {
  const stat = poke?.stats?.find((s) => s.name === statName);
  return stat ? stat.value : 50;
};

/** Skala stat mentah ke angka pertarungan (rasa Lv 50). */
export const prepareTeamMembers = (members) =>
  members.map((member) => {
    const maxHp = Math.floor(getStat(member, 'hp') * 2.2 + 110);
    return {
      ...member,
      maxHp,
      currentHp: maxHp,
      attack: Math.floor(getStat(member, 'attack') * 1.2 + 20),
      defense: Math.floor(getStat(member, 'defense') * 1.2 + 20),
      speed: Math.floor(getStat(member, 'speed') * 1.2 + 20),
    };
  });

/** Total efektivitas tipe penyerang atas seluruh tipe bertahan. */
export const typeMultiplier = (attackerTypes = [], defenderTypes = []) => {
  let multiplier = 1;
  attackerTypes.forEach((atkType) => {
    defenderTypes.forEach((defType) => {
      const mult = TYPE_EFFECTIVENESS[atkType]?.[defType];
      if (mult !== undefined) multiplier *= mult;
    });
  });
  return multiplier;
};

/**
 * Hitung damage.
 * @param {object} attacker punya attack + types
 * @param {object} defender punya defense + types
 * @param {() => number} [rng] sumber acak (untuk test)
 */
export const calcDamage = (attacker, defender, rng = Math.random) => {
  const baseDamage = Math.max(8, Math.floor(attacker.attack - defender.defense * 0.5));
  const multiplier = typeMultiplier(attacker.types, defender.types);
  const randomFactor = 0.85 + rng() * 0.3;
  const damage = Math.max(4, Math.floor(baseDamage * multiplier * randomFactor));
  return { damage, multiplier };
};

export const effectivenessText = (multiplier) => {
  if (multiplier >= 2) return ' 💥 Sangat efektif!';
  if (multiplier > 0 && multiplier < 1) return ' 🛡️ Kurang efektif...';
  if (multiplier === 0) return ' 🚫 Tidak berpengaruh!';
  return '';
};

export const pickMove = (attacker, rng = Math.random) => {
  const moves = attacker?.moves?.length ? attacker.moves : DEFAULT_MOVES;
  return moves[Math.floor(rng() * moves.length)];
};

/**
 * Bangun antrean aksi satu turn.
 * Urutan: pemenang berdasarkan kecepatan menyerang lebih dulu, lalu balasan.
 * Kalau salah satu sisi habis, hasilnya aksi `victory`; kalau aktif pingsan,
 * hasilnya `swap`.
 *
 * @returns {{queue: object[], advanceTurn: boolean}}
 */
export function buildTurnQueue({
  team1Members,
  team1ActiveIdx,
  team2Members,
  team2ActiveIdx,
  turn,
}) {
  const p1 = team1Members[team1ActiveIdx];
  const p2 = team2Members[team2ActiveIdx];

  if (!p1 && !p2) return { queue: [{ type: 'victory', winnerSide: 0 }], advanceTurn: false };
  if (!p1) return { queue: [{ type: 'victory', winnerSide: 2 }], advanceTurn: false };
  if (!p2) return { queue: [{ type: 'victory', winnerSide: 1 }], advanceTurn: false };

  if (p1.currentHp <= 0) {
    const nextIdx = team1ActiveIdx + 1;
    return {
      queue: nextIdx >= team1Members.length
        ? [{ type: 'victory', winnerSide: 2 }]
        : [{ type: 'swap', side: 1, nextIdx }],
      advanceTurn: false,
    };
  }

  if (p2.currentHp <= 0) {
    const nextIdx = team2ActiveIdx + 1;
    return {
      queue: nextIdx >= team2Members.length
        ? [{ type: 'victory', winnerSide: 1 }]
        : [{ type: 'swap', side: 2, nextIdx }],
      advanceTurn: false,
    };
  }

  const first = p1.speed >= p2.speed ? 1 : 2;
  const second = first === 1 ? 2 : 1;

  return {
    queue: [
      { type: 'attack', attackerSide: first, defenderSide: second, turn },
      { type: 'check_faint', side: second },
      { type: 'attack', attackerSide: second, defenderSide: first, turn },
      { type: 'check_faint', side: first },
    ],
    advanceTurn: true,
  };
}
