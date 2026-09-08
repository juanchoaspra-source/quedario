import test from 'node:test';
import assert from 'node:assert/strict';
import { Dashboard } from '../src/analytics.js';

test('agrega actividad e inscripciones por ciudad y lugar sin datos personales', async () => {
  const data = new Map();
  const dashboard = new Dashboard({ storage: { get: async key => structuredClone(data.get(key)), put: async (key, value) => data.set(key, structuredClone(value)) } });
  const record = async body => dashboard.fetch(new Request('https://analytics/record', { method: 'POST', body: JSON.stringify(body) }));
  await record({ type: 'group-created', groupId: 'grupo-1', memberId: 'persona-1' });
  await record({ type: 'member-joined', groupId: 'grupo-1', memberId: 'persona-2' });
  await record({ type: 'activity-created', city: 'Zaragoza', place: 'Café Central', date: '2026-09-12T13:30:00.000Z', location: { latitude: 41.6488, longitude: -0.8891 } });
  await record({ type: 'signup', city: 'Zaragoza', place: 'Café Central', date: '2026-09-12T13:30:00.000Z' });
  const report = await (await dashboard.fetch(new Request('https://analytics/dashboard'))).json();
  assert.equal(report.groupsCreated, 1);
  assert.equal(report.activeGroups, 1);
  assert.equal(report.uniqueMembers, 2);
  assert.equal(report.locations[0].city, 'Zaragoza');
  assert.equal(report.locations[0].place, 'Café Central');
  assert.equal(report.locations[0].activities, 1);
  assert.equal(report.locations[0].signups, 1);
  assert.deepEqual(report.locations[0].months['2026-09'], { activities: 1, signups: 1 });
  assert.deepEqual(report.locations[0].location, { latitude: 41.6488, longitude: -0.8891 });
});

test('completa una ficha nueva con Google Places y la conserva en el tablero', async () => {
  const data = new Map();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ places: [{ id: 'abc', displayName: { text: 'Café Central' }, formattedAddress: 'Calle Mayor 1, Zaragoza', location: { latitude: 41.65, longitude: -0.88 }, googleMapsUri: 'https://maps.google.com/?q=cafe', internationalPhoneNumber: '+34 600 000 000', websiteUri: 'https://cafe.example', types: ['cafe'] }] }), { status: 200 });
  try {
    const dashboard = new Dashboard({ storage: { get: async key => structuredClone(data.get(key)), put: async (key, value) => data.set(key, structuredClone(value)) } }, { GOOGLE_PLACES_API_KEY: 'secret' });
    await dashboard.fetch(new Request('https://analytics/record', { method: 'POST', body: JSON.stringify({ type: 'activity-created', city: 'Zaragoza', place: 'Café Central', date: '2026-09-12T13:30:00.000Z' }) }));
    const report = await (await dashboard.fetch(new Request('https://analytics/dashboard'))).json();
    assert.equal(report.locations[0].google.address, 'Calle Mayor 1, Zaragoza');
    assert.equal(report.locations[0].google.phone, '+34 600 000 000');
    assert.deepEqual(report.locations[0].location, { latitude: 41.65, longitude: -0.88 });
  } finally { globalThis.fetch = originalFetch; }
});
