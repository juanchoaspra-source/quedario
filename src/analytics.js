const empty = () => ({ groupsCreated: 0, groupsDeleted: 0, membersJoined: 0, activitiesCreated: 0, signups: 0, locations: {} });
const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export class Dashboard {
  constructor(ctx) { this.ctx = ctx; }
  async fetch(request) {
    if (request.method === 'GET') {
      const stats = await this.ctx.storage.get('stats') || empty();
      const locations = Object.values(stats.locations).sort((a, b) => b.activities - a.activities || b.signups - a.signups).slice(0, 100);
      return Response.json({ ...stats, locations });
    }
    if (request.method !== 'POST') return Response.json({ error: 'Método no permitido.' }, { status: 405 });
    const event = await request.json(), stats = await this.ctx.storage.get('stats') || empty();
    if (event.type === 'group-created') stats.groupsCreated++;
    if (event.type === 'group-deleted') stats.groupsDeleted++;
    if (event.type === 'member-joined') stats.membersJoined++;
    if (event.type === 'activity-created') {
      stats.activitiesCreated++;
      const city = clean(event.city, 80) || 'Ciudad no indicada', place = clean(event.place, 200) || 'Lugar no indicado';
      const key = `${city.toLocaleLowerCase('es')}:${place.toLocaleLowerCase('es')}`;
      const location = stats.locations[key] || { city, place, activities: 0, signups: 0, lastActivityAt: '' };
      location.activities++; location.lastActivityAt = new Date().toISOString(); stats.locations[key] = location;
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
