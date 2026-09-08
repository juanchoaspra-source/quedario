import test from 'node:test';
import assert from 'node:assert/strict';
import { Dashboard } from '../src/analytics.js';

test('agrega actividad e inscripciones por ciudad y lugar sin datos personales', async () => {
  const data = new Map();
  const dashboard = new Dashboard({ storage: { get: async key => structuredClone(data.get(key)), put: async (key, value) => data.set(key, structuredClone(value)) } });
  const record = async body => dashboard.fetch(new Request('https://analytics/record', { method: 'POST', body: JSON.stringify(body) }));
  await record({ type: 'group-created', groupId: 'grupo-1', memberId: 'persona-1' });
  await record({ type: 'member-joined', groupId: 'grupo-1', memberId: 'persona-2' });
  await record({ type: 'activity-created', city: 'Zaragoza', place: 'Café Central', location: { latitude: 41.6488, longitude: -0.8891 } });
  await record({ type: 'signup', city: 'Zaragoza', place: 'Café Central' });
  const report = await (await dashboard.fetch(new Request('https://analytics/dashboard'))).json();
  assert.equal(report.groupsCreated, 1);
  assert.equal(report.activeGroups, 1);
  assert.equal(report.uniqueMembers, 2);
  assert.equal(report.locations[0].city, 'Zaragoza');
  assert.equal(report.locations[0].place, 'Café Central');
  assert.equal(report.locations[0].activities, 1);
  assert.equal(report.locations[0].signups, 1);
  assert.deepEqual(report.locations[0].location, { latitude: 41.6488, longitude: -0.8891 });
});
