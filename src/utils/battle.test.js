import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTurnQueue,
  calcDamage,
  effectivenessText,
  getStat,
  pickMove,
  prepareTeamMembers,
  typeMultiplier,
  DEFAULT_MOVES,
} from './battle.js';

const poke = (overrides = {}) => ({
  id: 1,
  name: 'testmon',
  types: ['normal'],
  stats: [
    { name: 'hp', value: 100 },
    { name: 'attack', value: 100 },
    { name: 'defense', value: 100 },
    { name: 'speed', value: 100 },
  ],
  moves: ['Tackle'],
  ...overrides,
});

test('getStat mengambil nilai stat, fallback 50', () => {
  assert.equal(getStat(poke(), 'hp'), 100);
  assert.equal(getStat(poke(), 'spdef'), 50);
  assert.equal(getStat({}, 'hp'), 50);
});

test('prepareTeamMembers menskalakan HP/attack/defense/speed', () => {
  const [p] = prepareTeamMembers([poke()]);
  assert.equal(p.maxHp, Math.floor(100 * 2.2 + 110));
  assert.equal(p.currentHp, p.maxHp);
  assert.equal(p.attack, Math.floor(100 * 1.2 + 20));
  assert.equal(p.defense, Math.floor(100 * 1.2 + 20));
  assert.equal(p.speed, Math.floor(100 * 1.2 + 20));
});

test('prepareTeamMembers tidak mengubah objek asal', () => {
  const original = poke();
  prepareTeamMembers([original]);
  assert.equal(original.currentHp, undefined);
});

test('typeMultiplier mengalikan efektivitas semua kombinasi tipe', () => {
  assert.equal(typeMultiplier(['water'], ['fire']), 2);
  assert.equal(typeMultiplier(['electric'], ['ground']), 0);
  assert.equal(typeMultiplier(['normal'], ['rock']), 0.5);
  assert.equal(typeMultiplier(['fire'], ['grass', 'bug']), 4);
  assert.equal(typeMultiplier(['normal'], ['normal']), 1);
  assert.equal(typeMultiplier([], ['fire']), 1);
});

test('calcDamage deterministik dengan rng tetap', () => {
  const attacker = { attack: 120, types: ['water'] };
  const defender = { defense: 100, types: ['fire'] };
  const { damage, multiplier } = calcDamage(attacker, defender, () => 0.5);
  // base = 120 - 50 = 70; x2 tipe; x1.0 acak -> 140
  assert.equal(multiplier, 2);
  assert.equal(damage, 140);
});

test('calcDamage punya lantai base damage 8 dan minimum 4', () => {
  const attacker = { attack: 1, types: ['normal'] };
  const defender = { defense: 999, types: ['normal'] };
  // base = max(8, 1 - 499.5) = 8; acak minimum 0.85 -> floor(6.8) = 6
  assert.equal(calcDamage(attacker, defender, () => 0).damage, 6);
  assert.ok(calcDamage(attacker, defender, () => 0).damage >= 4);
});

test('calcDamage memberi 0 damage untuk tipe kebal', () => {
  const attacker = { attack: 200, types: ['electric'] };
  const defender = { defense: 50, types: ['ground'] };
  const { damage, multiplier } = calcDamage(attacker, defender, () => 0.5);
  assert.equal(multiplier, 0);
  assert.equal(damage, 4); // lantai minimum tetap berlaku
});

test('effectivenessText memberi label sesuai multiplier', () => {
  assert.match(effectivenessText(4), /Sangat efektif/);
  assert.match(effectivenessText(0.5), /Kurang efektif/);
  assert.match(effectivenessText(0), /Tidak berpengaruh/);
  assert.equal(effectivenessText(1), '');
});

test('pickMove memakai move Pokémon atau default', () => {
  assert.equal(pickMove({ moves: ['Thunder Shock'] }, () => 0), 'Thunder Shock');
  assert.ok(DEFAULT_MOVES.includes(pickMove({ moves: [] }, () => 0)));
  assert.ok(DEFAULT_MOVES.includes(pickMove({}, () => 0.99)));
});

test('buildTurnQueue: yang lebih cepat menyerang lebih dulu', () => {
  const fast = { ...poke(), speed: 200, currentHp: 10 };
  const slow = { ...poke(), speed: 50, currentHp: 10 };
  const { queue, advanceTurn } = buildTurnQueue({
    team1Members: [fast],
    team1ActiveIdx: 0,
    team2Members: [slow],
    team2ActiveIdx: 0,
    turn: 3,
  });
  assert.equal(advanceTurn, true);
  assert.equal(queue[0].attackerSide, 1);
  assert.equal(queue[0].defenderSide, 2);
  assert.equal(queue[0].turn, 3);
  assert.equal(queue[1].type, 'check_faint');
  assert.equal(queue[2].attackerSide, 2);
});

test('buildTurnQueue: seri kecepatan dimenangkan sisi 1', () => {
  const a = { ...poke(), speed: 100, currentHp: 10 };
  const b = { ...poke(), speed: 100, currentHp: 10 };
  const { queue } = buildTurnQueue({
    team1Members: [a], team1ActiveIdx: 0, team2Members: [b], team2ActiveIdx: 0, turn: 1,
  });
  assert.equal(queue[0].attackerSide, 1);
});

test('buildTurnQueue: aktif pingsan menghasilkan swap ke anggota berikutnya', () => {
  const faint = { ...poke(), currentHp: 0 };
  const bench = { ...poke(), currentHp: 50 };
  const { queue, advanceTurn } = buildTurnQueue({
    team1Members: [faint, bench],
    team1ActiveIdx: 0,
    team2Members: [poke()],
    team2ActiveIdx: 0,
    turn: 1,
  });
  assert.equal(advanceTurn, false);
  assert.deepEqual(queue, [{ type: 'swap', side: 1, nextIdx: 1 }]);
});

test('buildTurnQueue: semua pingsan menghasilkan victory', () => {
  const faint = { ...poke(), currentHp: 0 };
  const win = buildTurnQueue({
    team1Members: [faint],
    team1ActiveIdx: 0,
    team2Members: [poke()],
    team2ActiveIdx: 0,
    turn: 1,
  });
  assert.deepEqual(win.queue, [{ type: 'victory', winnerSide: 2 }]);

  const win1 = buildTurnQueue({
    team1Members: [poke()],
    team1ActiveIdx: 0,
    team2Members: [faint],
    team2ActiveIdx: 0,
    turn: 1,
  });
  assert.deepEqual(win1.queue, [{ type: 'victory', winnerSide: 1 }]);
});

test('buildTurnQueue: kedua sisi kosong = seri', () => {
  const { queue } = buildTurnQueue({
    team1Members: [], team1ActiveIdx: 0, team2Members: [], team2ActiveIdx: 0, turn: 1,
  });
  assert.deepEqual(queue, [{ type: 'victory', winnerSide: 0 }]);
});
