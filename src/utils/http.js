/**
 * Helper HTTP untuk PokéAPI.
 *
 * PokéAPI membatasi laju request: menembak 151 request detail sekaligus membuat
 * sebagian di antaranya gagal (429/502/timeout) dan sebelumnya gagal itu dibuang
 * diam-diam sehingga daftar Pokémon tampak kosong. Dua helper di sini memperbaiki
 * sumber masalahnya:
 *
 * - `fetchJson` — retry dengan backoff untuk error jaringan / 5xx / 429.
 * - `mapWithConcurrency` — batasi request paralel dan tangkap error per item.
 */

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

export class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener?.('abort', onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    }
    signal?.addEventListener?.('abort', onAbort, { once: true });
  });

/**
 * Ambil JSON dengan retry + backoff.
 *
 * @param {string} url
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]
 * @param {number} [options.retries] jumlah percobaan ulang (default 2)
 * @param {number} [options.baseDelayMs] jeda awal backoff (default 400)
 * @param {typeof fetch} [options.fetchImpl] untuk test
 * @returns {Promise<any>}
 */
export async function fetchJson(url, options = {}) {
  const {
    signal,
    retries = 2,
    baseDelayMs = 400,
    fetchImpl = globalThis.fetch,
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    try {
      const res = await fetchImpl(url, { signal });
      if (res.ok) return await res.json();

      const status = res.status;
      const error = new HttpError(`HTTP ${status}`, status);
      if (!RETRYABLE_STATUS.has(status) || attempt === retries) throw error;
      lastError = error;
    } catch (err) {
      if (err?.name === 'AbortError') throw err;
      // HttpError non-retryable sudah dilempar di atas.
      if (err instanceof HttpError && !RETRYABLE_STATUS.has(err.status)) throw err;
      lastError = err;
      if (attempt === retries) break;
    }

    await sleep(baseDelayMs * 2 ** attempt, signal);
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/**
 * Jalankan `mapper` untuk setiap item dengan batas konkurensi.
 * Urutan hasil selalu sama dengan urutan input. Item yang gagal menjadi `null`
 * (tidak menggagalkan seluruh batch) kecuali error adalah AbortError.
 *
 * @template T, R
 * @param {T[]} items
 * @param {number} limit
 * @param {(item: T, index: number) => Promise<R>} mapper
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<(R|null)[]>}
 */
export async function mapWithConcurrency(items, limit, mapper, options = {}) {
  const { signal } = options;
  const size = Math.max(1, Math.floor(limit) || 1);
  const results = new Array(items.length);
  let cursor = 0;

  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      try {
        results[index] = await mapper(items[index], index);
      } catch (err) {
        if (err?.name === 'AbortError') throw err;
        results[index] = null;
      }
    }
  };

  const workers = Array.from({ length: Math.min(size, items.length) }, worker);
  await Promise.all(workers);
  return results;
}
