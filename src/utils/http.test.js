import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchJson,
  mapWithConcurrency,
  HttpError,
} from './http.js';

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

test('fetchJson mengembalikan JSON saat sukses', async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    return jsonResponse({ count: 3 });
  };
  const data = await fetchJson('https://x/pokemon', { fetchImpl });
  assert.deepEqual(data, { count: 3 });
  assert.equal(calls.length, 1);
});

test('fetchJson retry pada 503 lalu sukses', async () => {
  let attempts = 0;
  const fetchImpl = async () => {
    attempts += 1;
    if (attempts < 3) return jsonResponse({}, 503);
    return jsonResponse({ ok: true });
  };
  const data = await fetchJson('https://x/pokemon', { fetchImpl, baseDelayMs: 1 });
  assert.deepEqual(data, { ok: true });
  assert.equal(attempts, 3);
});

test('fetchJson tidak retry pada 404', async () => {
  let attempts = 0;
  const fetchImpl = async () => {
    attempts += 1;
    return jsonResponse({}, 404);
  };
  await assert.rejects(
    () => fetchJson('https://x/missing', { fetchImpl, baseDelayMs: 1 }),
    (err) => err instanceof HttpError && err.status === 404,
  );
  assert.equal(attempts, 1);
});

test('fetchJson menyerah setelah retries habis', async () => {
  let attempts = 0;
  const fetchImpl = async () => {
    attempts += 1;
    return jsonResponse({}, 429);
  };
  await assert.rejects(
    () => fetchJson('https://x/pokemon', { fetchImpl, retries: 1, baseDelayMs: 1 }),
    (err) => err instanceof HttpError && err.status === 429,
  );
  assert.equal(attempts, 2);
});

test('fetchJson meneruskan AbortError tanpa retry', async () => {
  const controller = new AbortController();
  controller.abort();
  let attempts = 0;
  const fetchImpl = async () => {
    attempts += 1;
    return jsonResponse({});
  };
  await assert.rejects(
    () => fetchJson('https://x/pokemon', { fetchImpl, signal: controller.signal }),
    (err) => err.name === 'AbortError',
  );
  assert.equal(attempts, 0);
});

test('mapWithConcurrency menjaga urutan hasil', async () => {
  const items = [1, 2, 3, 4, 5];
  const out = await mapWithConcurrency(items, 2, async (n) => {
    await new Promise((r) => setTimeout(r, (6 - n) * 2));
    return n * 10;
  });
  assert.deepEqual(out, [10, 20, 30, 40, 50]);
});

test('mapWithConcurrency membatasi jumlah request paralel', async () => {
  let active = 0;
  let peak = 0;
  const out = await mapWithConcurrency(Array.from({ length: 20 }, (_, i) => i), 5, async (n) => {
    active += 1;
    peak = Math.max(peak, active);
    await new Promise((r) => setTimeout(r, 2));
    active -= 1;
    return n;
  });
  assert.equal(out.length, 20);
  assert.ok(peak <= 5, `peak paralel ${peak} melebihi batas 5`);
});

test('mapWithConcurrency mengganti item gagal dengan null', async () => {
  const out = await mapWithConcurrency([1, 2, 3], 2, async (n) => {
    if (n === 2) throw new Error('rate limited');
    return n;
  });
  assert.deepEqual(out, [1, null, 3]);
});

test('mapWithConcurrency meneruskan AbortError', async () => {
  const controller = new AbortController();
  await assert.rejects(
    () =>
      mapWithConcurrency([1, 2, 3], 1, async () => {
        controller.abort();
        throw new DOMException('Aborted', 'AbortError');
      }, { signal: controller.signal }),
    (err) => err.name === 'AbortError',
  );
});
