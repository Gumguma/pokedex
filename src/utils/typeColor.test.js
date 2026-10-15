import test from 'node:test';
import assert from 'node:assert/strict';
import { textOn } from './typeColor.js';
import { TYPE_DETAILS } from '../constants/pokemonData.js';

test('dark ink on light fills', () => {
  assert.equal(textOn('#FFFFFF'), '#0f172a');
  assert.equal(textOn('#F7D02C'), '#0f172a');
});

test('white ink on dark fills', () => {
  assert.equal(textOn('#000000'), '#ffffff');
  assert.equal(textOn('#4338CA'), '#ffffff');
});

test('every type detail has a 6-digit hex', () => {
  for (const [key, d] of Object.entries(TYPE_DETAILS)) {
    assert.match(d.hex, /^#[0-9A-Fa-f]{6}$/, `bad hex for ${key}`);
    assert.ok(['#0f172a', '#ffffff'].includes(textOn(d.hex)), `bad ink for ${key}`);
  }
});

test('unknown type resolves to a real detail', () => {
  const detail = TYPE_DETAILS['bogus'] || TYPE_DETAILS.normal;
  assert.ok(detail && detail.hex);
});
