import test from 'node:test';
import assert from 'node:assert/strict';
import { Limits } from '../src/limits.js';

test('limita por señal de borde aunque se roten identificadores de navegador', async () => {
  const data = new Map();
  const limits = new Limits({ storage: { get: async key => data.get(key), put: async (key, value) => data.set(key, value) } });
  const check = async key => (await limits.fetch(new Request('https://limits/check', { method: 'POST', body: JSON.stringify({ scope: 'group-create', key, limit: 2, windowMs: 60000 }) }))).json();
  assert.equal((await check('203.0.113.8')).allowed, true);
  assert.equal((await check('203.0.113.8')).allowed, true);
  const blocked = await check('203.0.113.8');
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfter > 0);
});
