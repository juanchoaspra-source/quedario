import { isAdmin } from './access.js';
export function text(value, max = 100) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new Error('Revisa los campos obligatorios y su longitud.');
  return value.trim();
}
function locationInput(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'object' || Array.isArray(value)) throw new Error('La ubicación no es válida.');
  const latitude = Number(value.latitude), longitude = Number(value.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) throw new Error('La ubicación no es válida.');
  return { latitude: Math.round(latitude * 1e6) / 1e6, longitude: Math.round(longitude * 1e6) / 1e6 };
}
export function eventInput(body) {
  const title = text(body.title), place = text(body.place, 200);
  const capacity = Number(body.capacity), date = new Date(body.date);
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500 || !Number.isFinite(+date) || +date <= Date.now()) throw new Error('Indica una fecha futura y un aforo de 1 a 500.');
  const category = ['cena', 'comida', 'cafe', 'concierto', 'ruta', 'motos', 'fiestas', 'teatro', 'cine', 'viaje', 'otro'].includes(body.category) ? body.category : 'otro';
  const detail = ['fiestas', 'viaje'].includes(category) ? text(body.detail, 80) : '';
  const location = locationInput(body.location);
  return { id: crypto.randomUUID(), title, place, category, detail, capacity, date: date.toISOString(), participants: [], ...(location ? {location} : {}) };
}
export function enroll(event, token, name) {
  if (new Date(event.date) <= new Date()) throw new Error('Esta quedada ya ha comenzado.');
  if (event.participants.some(participant => participant.token === token)) return;
  if (event.participants.length >= 1000) throw new Error('La lista está completa.');
  event.participants.push({ token, name: text(name, 60) });
}
export function publicGroup(group, token) {
  return { name: group.name, slug: group.slug, owner: isAdmin(group, token), protected: !!group.password, closed: !!group.closed,
    members: (group.members || []).map(member => ({ id: member.id, name: member.name, admin: isAdmin(group, member.token), mine: member.token === token })),
    events: group.events.map(event => ({ ...event, participants: event.participants.map((participant, index) => ({ name: participant.name, mine: participant.token === token, waiting: index >= event.capacity })) })) };
}
