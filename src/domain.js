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
function imageInput(value) {
  if (value === undefined) return undefined;
  if (value === '') return '';
  if (typeof value !== 'string' || !/^data:image\/webp;base64,[a-z0-9+/=]+$/i.test(value) || value.length > 180000) throw new Error('La imagen debe ser un archivo WebP reducido de menos de 130 KB.');
  return value;
}
export function eventInput(body) {
  const title = text(body.title), place = text(body.place, 200);
  const city = typeof body.city === 'string' && body.city.trim() ? text(body.city, 80) : '';
  const capacity = Number(body.capacity), date = new Date(body.date);
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500 || !Number.isFinite(+date) || +date <= Date.now()) throw new Error('Indica una fecha futura y un aforo de 1 a 500.');
  const category = ['cena', 'comida', 'cafe', 'concierto', 'ruta', 'motos', 'fiestas', 'teatro', 'cine', 'viaje', 'padel', 'correr', 'futbol', 'gimnasio', 'bici', 'senderismo', 'yoga', 'juegos', 'compras', 'museo', 'baile', 'brunch', 'playa', 'otro'].includes(body.category) ? body.category : 'otro';
  const detail = ['fiestas', 'viaje'].includes(category) ? text(body.detail, 80) : '';
  const hasEndDate = ['ruta', 'fiestas', 'viaje'].includes(category);
  const endDate = hasEndDate ? new Date(body.endDate || body.date) : undefined;
  if (hasEndDate && (!Number.isFinite(+endDate) || +endDate < +date)) throw new Error('La fecha de fin debe ser igual o posterior a la de inicio.');
  const location = locationInput(body.location);
  const image = imageInput(body.image);
  return { id: crypto.randomUUID(), title, place, city, category, detail, capacity, date: date.toISOString(), ...(hasEndDate ? {endDate:endDate.toISOString()} : {}), participants: [], comments: [], ...(location ? {location} : {}), ...(image !== undefined ? {image} : {}) };
}
export function enroll(event, token, name) {
  if (new Date(event.endDate || event.date) <= new Date()) throw new Error('Esta quedada ya ha terminado.');
  if (event.participants.some(participant => participant.token === token)) return;
  if (event.participants.length >= 1000) throw new Error('La lista está completa.');
  event.participants.push({ token, name: text(name, 60) });
}
export function addComment(event, token, name, value) {
  if (value === undefined || value === null || value === '') return;
  const comment = text(value, 500);
  event.comments ??= [];
  if (event.comments.length >= 500) throw new Error('Esta actividad ya tiene el máximo de 500 comentarios.');
  event.comments.push({ id: crypto.randomUUID(), token, name: text(name, 60), text: comment, createdAt: new Date().toISOString() });
}
export function publicGroup(group, token) {
  return { name: group.name, slug: group.slug, owner: isAdmin(group, token), protected: !!group.password, closed: !!group.closed,
    members: (group.members || []).map(member => ({ id: member.id, name: member.name, admin: isAdmin(group, member.token), mine: member.token === token })),
    events: group.events.map(({ creatorToken, ...event }) => ({ ...event, canEdit: isAdmin(group, token) || creatorToken === token, canCancel: isAdmin(group, token) || creatorToken === token, participants: event.participants.map((participant, index) => ({ name: participant.name, mine: participant.token === token, waiting: index >= event.capacity })), comments: (event.comments || []).map(comment => ({ id: comment.id, name: comment.name, text: comment.text, createdAt: comment.createdAt, mine: comment.token === token })) })) };
}
