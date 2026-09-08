const empty = () => ({ groupsCreated: 0, groupsDeleted: 0, membersJoined: 0, activitiesCreated: 0, signups: 0, groups: {}, locations: {} });
const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const memberFingerprint = async value => {
  if (typeof value !== 'string' || !value) return '';
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
};

export class Dashboard {
  constructor(ctx) { this.ctx = ctx; }
  async fetch(request) {
    if (request.method === 'GET') {
      const stats = await this.ctx.storage.get('stats') || empty();
      const locations = Object.values(stats.locations).sort((a, b) => b.activities - a.activities || b.signups - a.signups).slice(0, 100);
      const activeGroups = Object.keys(stats.groups || {}).length || Math.max(0, stats.groupsCreated - stats.groupsDeleted);
      const uniqueMembers = new Set(Object.values(stats.groups || {}).flatMap(group => group.members || [])).size;
      return Response.json({ ...stats, activeGroups, uniqueMembers, locations });
    }
    if (request.method !== 'POST') return Response.json({ error: 'Método no permitido.' }, { status: 405 });
    const event = await request.json(), stats = await this.ctx.storage.get('stats') || empty();
    stats.groups ??= {};
    if (event.type === 'group-created') {
      stats.groupsCreated++;
      if (event.groupId) stats.groups[event.groupId] ??= { members: [] };
    }
    if (event.type === 'group-deleted') {
      stats.groupsDeleted++;
      if (event.groupId) delete stats.groups[event.groupId];
    }
    if (event.type === 'member-joined') stats.membersJoined++;
    if ((event.type === 'group-created' || event.type === 'member-joined') && event.groupId && event.memberId) {
      const group = stats.groups[event.groupId] ??= { members: [] };
      const member = await memberFingerprint(event.memberId);
      if (member && !group.members.includes(member)) group.members.push(member);
    }
    if (event.type === 'activity-created') {
      stats.activitiesCreated++;
      const city = clean(event.city, 80) || 'Ciudad no indicada', place = clean(event.place, 200) || 'Lugar no indicado';
      const key = `${city.toLocaleLowerCase('es')}:${place.toLocaleLowerCase('es')}`;
      const location = stats.locations[key] || { city, place, activities: 0, signups: 0, lastActivityAt: '' };
      location.activities++; location.lastActivityAt = new Date().toISOString(); stats.locations[key] = location;
      if (event.location && Number.isFinite(Number(event.location.latitude)) && Number.isFinite(Number(event.location.longitude))) location.location = { latitude: Number(event.location.latitude), longitude: Number(event.location.longitude) };
    }
    if (event.type === 'signup') {
      stats.signups++;
      const city = clean(event.city, 80) || 'Ciudad no indicada', place = clean(event.place, 200) || 'Lugar no indicado';
      const location = stats.locations[`${city.toLocaleLowerCase('es')}:${place.toLocaleLowerCase('es')}`];
      if (location) location.signups++;
    }
    await this.ctx.storage.put('stats', stats);
    return Response.json({ ok: true });
  }
}

export async function analyticsRequest(env, event) {
  if (!env?.ANALYTICS) return;
  await env.ANALYTICS.get(env.ANALYTICS.idFromName('private-dashboard')).fetch(new Request('https://analytics/record', { method: 'POST', body: JSON.stringify(event) }));
}
