const empty = () => ({ groupsCreated: 0, groupsDeleted: 0, membersJoined: 0, activitiesCreated: 0, signups: 0, groups: {}, locations: {} });
const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const locationKey = (city, place) => `${city.toLocaleLowerCase('es')}:${place.toLocaleLowerCase('es')}`;
const monthKey = value => {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.valueOf()) ? new Date().toISOString().slice(0, 7) : date.toISOString().slice(0, 7);
};
const monthStats = (location, month) => location.months?.[month] ?? { activities: 0, signups: 0 };
const venueCanBeLocated = location => location?.place && location.place !== 'Lugar no indicado' && location.place.length > 2;
async function enrichLocation(location, apiKey) {
  if (!apiKey || !venueCanBeLocated(location) || location.google || location.lookupAt) return false;
  location.lookupAt = new Date().toISOString();
  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.types'
      },
      body: JSON.stringify({ textQuery: [location.place, location.city].filter(Boolean).join(', '), languageCode: 'es' })
    });
    const result = await response.json();
    const place = result.places?.[0];
    if (!response.ok || !place) {
      location.lookupError = response.ok ? 'No se ha encontrado una ficha verificable.' : 'Google Places no ha podido completar la ficha.';
      return false;
    }
    location.google = {
      id: place.id || '',
      name: place.displayName?.text || location.place,
      address: place.formattedAddress || '',
      phone: place.internationalPhoneNumber || place.nationalPhoneNumber || '',
      website: place.websiteUri || '',
      mapsUrl: place.googleMapsUri || '',
      types: Array.isArray(place.types) ? place.types.slice(0, 6) : ''
    };
    if (!location.location && Number.isFinite(place.location?.latitude) && Number.isFinite(place.location?.longitude)) {
      location.location = { latitude: place.location.latitude, longitude: place.location.longitude };
    }
    delete location.lookupError;
    return true;
  } catch {
    location.lookupError = 'No se ha podido consultar Google Places ahora.';
    return false;
  }
}
const memberFingerprint = async value => {
  if (typeof value !== 'string' || !value) return '';
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
};

export class Dashboard {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === 'GET') {
      const stats = await this.ctx.storage.get('stats') || empty();
      const locations = Object.values(stats.locations).sort((a, b) => b.activities - a.activities || b.signups - a.signups).slice(0, 100);
      const activeGroups = Object.keys(stats.groups || {}).length || Math.max(0, stats.groupsCreated - stats.groupsDeleted);
      const uniqueMembers = new Set(Object.values(stats.groups || {}).flatMap(group => group.members || [])).size;
      return Response.json({ ...stats, activeGroups, uniqueMembers, locations });
    }
    if (request.method !== 'POST') return Response.json({ error: 'Método no permitido.' }, { status: 405 });
    if (url.pathname === '/enrich') {
      const stats = await this.ctx.storage.get('stats') || empty();
      const pending = Object.values(stats.locations).filter(location => !location.google && !location.lookupAt && venueCanBeLocated(location)).slice(0, 20);
      let completed = 0;
      for (const location of pending) if (await enrichLocation(location, this.env?.GOOGLE_PLACES_API_KEY)) completed++;
      await this.ctx.storage.put('stats', stats);
      return Response.json({ ok: true, checked: pending.length, completed });
    }
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
      const key = locationKey(city, place);
      const location = stats.locations[key] || { city, place, activities: 0, signups: 0, months: {}, lastActivityAt: '' };
      location.months ??= {};
      const month = monthKey(event.date);
      location.months[month] = monthStats(location, month);
      location.activities++; location.lastActivityAt = new Date().toISOString(); stats.locations[key] = location;
      location.months[month].activities++;
      if (event.location && Number.isFinite(Number(event.location.latitude)) && Number.isFinite(Number(event.location.longitude))) location.location = { latitude: Number(event.location.latitude), longitude: Number(event.location.longitude) };
      await enrichLocation(location, this.env?.GOOGLE_PLACES_API_KEY);
    }
    if (event.type === 'signup') {
      stats.signups++;
      const city = clean(event.city, 80) || 'Ciudad no indicada', place = clean(event.place, 200) || 'Lugar no indicado';
      const location = stats.locations[locationKey(city, place)];
      if (location) {
        location.months ??= {};
        const month = monthKey(event.date);
        location.months[month] = monthStats(location, month);
        location.signups++;
        location.months[month].signups++;
      }
    }
    await this.ctx.storage.put('stats', stats);
    return Response.json({ ok: true });
  }
}

export async function analyticsRequest(env, event) {
  if (!env?.ANALYTICS) return;
  await env.ANALYTICS.get(env.ANALYTICS.idFromName('private-dashboard')).fetch(new Request('https://analytics/record', { method: 'POST', body: JSON.stringify(event) }));
}
