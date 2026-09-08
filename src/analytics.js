const empty = () => ({ groupsCreated: 0, groupsDeleted: 0, membersJoined: 0, activitiesCreated: 0, signups: 0, groups: {}, locations: {}, aliases: {}, daily: { activeUsers: {}, activities: {}, signups: {} } });
const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const groupMetadata = event => ({ name: clean(event.name, 80) || 'Grupo sin nombre', city: clean(event.city, 80), platform: ['whatsapp', 'telegram', 'facebook', 'otro'].includes(event.platform) ? event.platform : 'whatsapp' });
const locationKey = (city, place) => `${city.toLocaleLowerCase('es')}:${place.toLocaleLowerCase('es')}`;
const monthKey = value => {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.valueOf()) ? new Date().toISOString().slice(0, 7) : date.toISOString().slice(0, 7);
};
const dailyKey = value => new Date(value || Date.now()).toISOString().slice(0, 10);
const dailyNumber = (daily, name, day) => Number(daily?.[name]?.[day] || 0);
const lastDays = (count = 30) => Array.from({ length: count }, (_, index) => {
  const date = new Date(); date.setUTCHours(0, 0, 0, 0); date.setUTCDate(date.getUTCDate() - (count - index - 1));
  return date.toISOString().slice(0, 10);
});
function recordDailyUser(stats, memberId, when) {
  if (!memberId) return Promise.resolve();
  const day = dailyKey(when);
  return memberFingerprint(memberId).then(member => {
    if (!member) return;
    const users = stats.daily.activeUsers[day] ??= [];
    if (!users.includes(member)) users.push(member);
  });
}
function recordDailyCount(stats, name, when) {
  const day = dailyKey(when);
  stats.daily[name][day] = dailyNumber(stats.daily, name, day) + 1;
}
function trimDaily(stats) {
  const cutoff = lastDays(366)[0];
  for (const values of Object.values(stats.daily)) for (const day of Object.keys(values)) if (day < cutoff) delete values[day];
}
const monthStats = (location, month) => location.months?.[month] ?? { activities: 0, signups: 0 };
function mergeLocation(target, source) {
  target.months ??= {}; source.months ??= {};
  target.activities += source.activities;
  target.signups += source.signups;
  for (const [month, counts] of Object.entries(source.months)) {
    const targetMonth = target.months[month] ??= { activities: 0, signups: 0 };
    targetMonth.activities += counts.activities || 0;
    targetMonth.signups += counts.signups || 0;
  }
  if (source.lastActivityAt > target.lastActivityAt) target.lastActivityAt = source.lastActivityAt;
  if (!target.location && source.location) target.location = source.location;
}
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
      const groups = Object.entries(stats.groups || {}).map(([id, group]) => ({ id, ...groupMetadata(group), members: (group.members || []).length, activities: group.activities || 0, signups: group.signups || 0, createdAt: group.createdAt || '' })).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name, 'es'));
      const activeGroups = groups.length || Math.max(0, stats.groupsCreated - stats.groupsDeleted);
      const uniqueMembers = new Set(Object.values(stats.groups || {}).flatMap(group => group.members || [])).size;
      const timeline = lastDays().map(day => ({ day, users: (stats.daily?.activeUsers?.[day] || []).length, activities: dailyNumber(stats.daily, 'activities', day), signups: dailyNumber(stats.daily, 'signups', day) }));
      const averageDailyUsers = Math.round((timeline.reduce((sum, day) => sum + day.users, 0) / timeline.length) * 10) / 10;
      const activeGroupDetails = groups.filter(group => group.activities || group.signups).sort((a, b) => (b.activities + b.signups) - (a.activities + a.signups)).slice(0, 20);
      return Response.json({ ...stats, activeGroups, uniqueMembers, locations, groups, timeline, averageDailyUsers, activeGroupDetails });
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
    stats.aliases ??= {};
    stats.daily ??= { activeUsers: {}, activities: {}, signups: {} };
    stats.daily.activeUsers ??= {}; stats.daily.activities ??= {}; stats.daily.signups ??= {};
    if (event.type === 'group-created') {
      stats.groupsCreated++;
      if (event.groupId) stats.groups[event.groupId] ??= { members: [], activities: 0, signups: 0, ...groupMetadata(event), createdAt: new Date().toISOString() };
    }
    if ((event.type === 'group-updated' || event.type === 'group-synced') && event.groupId) {
      const group = stats.groups[event.groupId] ??= { members: [], activities: 0, signups: 0, createdAt: '' };
      Object.assign(group, groupMetadata(event));
      if (event.type === 'group-synced' && Array.isArray(event.members)) {
        group.members = (await Promise.all(event.members.slice(0, 2000).map(memberFingerprint))).filter(Boolean);
      }
    }
    if (event.type === 'group-deleted') {
      stats.groupsDeleted++;
      if (event.groupId) delete stats.groups[event.groupId];
    }
    if (event.type === 'member-joined') stats.membersJoined++;
    if ((event.type === 'group-created' || event.type === 'member-joined') && event.groupId && event.memberId) {
      const group = stats.groups[event.groupId] ??= { members: [], activities: 0, signups: 0 };
      const member = await memberFingerprint(event.memberId);
      if (member && !group.members.includes(member)) group.members.push(member);
      await recordDailyUser(stats, event.memberId, event.at);
    }
    if (event.type === 'member-left' && event.groupId && event.memberId && stats.groups[event.groupId]) {
      const member = await memberFingerprint(event.memberId);
      stats.groups[event.groupId].members = (stats.groups[event.groupId].members || []).filter(item => item !== member);
    }
    if (event.type === 'activity-created') {
      stats.activitiesCreated++;
      recordDailyCount(stats, 'activities', event.at);
      if (event.groupId && stats.groups[event.groupId]) stats.groups[event.groupId].activities = (stats.groups[event.groupId].activities || 0) + 1;
      const city = clean(event.city, 80) || 'Ciudad no indicada', place = clean(event.place, 200) || 'Lugar no indicado';
      const requestedKey = locationKey(city, place);
      const key = stats.aliases[requestedKey] || requestedKey;
      const location = stats.locations[key] || { city, place, activities: 0, signups: 0, months: {}, lastActivityAt: '' };
      location.months ??= {};
      const month = monthKey(event.date);
      location.months[month] = monthStats(location, month);
      location.activities++; location.lastActivityAt = new Date().toISOString(); stats.locations[key] = location;
      location.months[month].activities++;
      if (event.location && Number.isFinite(Number(event.location.latitude)) && Number.isFinite(Number(event.location.longitude))) location.location = { latitude: Number(event.location.latitude), longitude: Number(event.location.longitude) };
      await enrichLocation(location, this.env?.GOOGLE_PLACES_API_KEY);
      const duplicate = location.google?.id && Object.entries(stats.locations).find(([otherKey, other]) => otherKey !== key && other.google?.id === location.google.id);
      if (duplicate) {
        const [canonicalKey, canonical] = duplicate;
        mergeLocation(canonical, location);
        delete stats.locations[key];
        stats.aliases[requestedKey] = canonicalKey;
      } else {
        stats.aliases[requestedKey] = key;
      }
    }
    if (event.type === 'signup') {
      stats.signups++;
      recordDailyCount(stats, 'signups', event.at);
      await recordDailyUser(stats, event.memberId, event.at);
      if (event.groupId && stats.groups[event.groupId]) stats.groups[event.groupId].signups = (stats.groups[event.groupId].signups || 0) + 1;
      const city = clean(event.city, 80) || 'Ciudad no indicada', place = clean(event.place, 200) || 'Lugar no indicado';
      const location = stats.locations[stats.aliases[locationKey(city, place)] || locationKey(city, place)];
      if (location) {
        location.months ??= {};
        const month = monthKey(event.date);
        location.months[month] = monthStats(location, month);
        location.signups++;
        location.months[month].signups++;
      }
    }
    trimDaily(stats);
    await this.ctx.storage.put('stats', stats);
    return Response.json({ ok: true });
  }
}

export async function analyticsRequest(env, event) {
  if (!env?.ANALYTICS) return;
  await env.ANALYTICS.get(env.ANALYTICS.idFromName('private-dashboard')).fetch(new Request('https://analytics/record', { method: 'POST', body: JSON.stringify(event) }));
}
