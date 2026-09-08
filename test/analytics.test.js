import test from 'node:test';
import assert from 'node:assert/strict';
import { Dashboard } from '../src/analytics.js';

test('agrega actividad e inscripciones por ciudad y lugar sin datos personales', async () => {
  const data = new Map();
  const dashboard = new Dashboard({ storage: { get: async key => structuredClone(data.get(key)), put: async (key, value) => data.set(key, structuredClone(value)) } });
  const record = async body => dashboard.fetch(new Request('https://analytics/record', { method: 'POST', body: JSON.stringify(body) }));
  await record({ type: 'group-created', groupId: 'grupo-1', memberId: 'persona-1', name: 'Los del viernes', city: 'Zaragoza', platform: 'telegram' });
  await record({ type: 'member-joined', groupId: 'grupo-1', memberId: 'persona-2' });
  await record({ type: 'activity-created', groupId: 'grupo-1', city: 'Zaragoza', place: 'Café Central', date: '2026-09-12T13:30:00.000Z', location: { latitude: 41.6488, longitude: -0.8891 } });
  await record({ type: 'signup', groupId: 'grupo-1', memberId: 'persona-2', city: 'Zaragoza', place: 'Café Central', date: '2026-09-12T13:30:00.000Z' });
  const report = await (await dashboard.fetch(new Request('https://analytics/dashboard'))).json();
  assert.equal(report.groupsCreated, 1);
  assert.equal(report.activeGroups, 1);
  assert.equal(report.uniqueMembers, 2);
  assert.deepEqual(report.groups[0], { id: 'grupo-1', name: 'Los del viernes', city: 'Zaragoza', platform: 'telegram', members: 2, activities: 1, signups: 1, createdAt: report.groups[0].createdAt });
  assert.equal(report.activeGroupDetails[0].id, 'grupo-1');
  assert.equal(report.timeline.at(-1).activities, 1);
  assert.equal(report.timeline.at(-1).signups, 1);
  assert.equal(report.locations[0].city, 'Zaragoza');
  assert.equal(report.locations[0].place, 'Café Central');
  assert.equal(report.locations[0].activities, 1);
  assert.equal(report.locations[0].signups, 1);
  assert.deepEqual(report.locations[0].months['2026-09'], { activities: 1, signups: 1 });
  assert.deepEqual(report.locations[0].location, { latitude: 41.6488, longitude: -0.8891 });
});

test('sincroniza el número actual de miembros y permite actualizar la ciudad del grupo', async () => {
  const data = new Map();
  const dashboard = new Dashboard({ storage: { get: async key => structuredClone(data.get(key)), put: async (key, value) => data.set(key, structuredClone(value)) } });
  const record = body => dashboard.fetch(new Request('https://analytics/record', { method: 'POST', body: JSON.stringify(body) }));
  await record({ type: 'group-synced', groupId: 'grupo-2', name: 'Amigas', city: 'Huesca', platform: 'whatsapp', members: ['uno', 'dos', 'tres'] });
  await record({ type: 'member-left', groupId: 'grupo-2', memberId: 'dos' });
  await record({ type: 'group-updated', groupId: 'grupo-2', name: 'Amigas de Huesca', city: 'Jaca', platform: 'whatsapp' });
  const report = await (await dashboard.fetch(new Request('https://analytics/dashboard'))).json();
  assert.equal(report.groups[0].name, 'Amigas de Huesca');
  assert.equal(report.groups[0].city, 'Jaca');
  assert.equal(report.groups[0].members, 2);
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

test('fusiona el mismo local aunque se escriba de otra manera', async () => {
  const data = new Map();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ places: [{ id: 'same-place', displayName: { text: 'Café Central' }, location: { latitude: 41.65, longitude: -0.88 } }] }), { status: 200 });
  try {
    const dashboard = new Dashboard({ storage: { get: async key => structuredClone(data.get(key)), put: async (key, value) => data.set(key, structuredClone(value)) } }, { GOOGLE_PLACES_API_KEY: 'secret' });
    const record = body => dashboard.fetch(new Request('https://analytics/record', { method: 'POST', body: JSON.stringify(body) }));
    await record({ type: 'activity-created', city: 'Zaragoza', place: 'Café Central', date: '2026-09-12T13:30:00.000Z' });
    await record({ type: 'activity-created', city: 'Zaragoza', place: 'Cafe Central', date: '2026-09-20T13:30:00.000Z' });
    const report = await (await dashboard.fetch(new Request('https://analytics/dashboard'))).json();
    assert.equal(report.locations.length, 1);
    assert.equal(report.locations[0].activities, 2);
    assert.equal(report.locations[0].months['2026-09'].activities, 2);
  } finally { globalThis.fetch = originalFetch; }
});
