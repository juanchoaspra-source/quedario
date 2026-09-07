export function text(value, max = 100) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new Error('Revisa los campos obligatorios y su longitud.');
  return value.trim();
}
export function eventInput(body) {
  const title = text(body.title), place = text(body.place, 200);
  const capacity = Number(body.capacity), date = new Date(body.date);
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500 || !Number.isFinite(+date) || +date <= Date.now()) throw new Error('Indica una fecha futura y un aforo de 1 a 500.');
  const category = ['cena', 'comida', 'cafe', 'concierto', 'ruta', 'motos', 'fiestas', 'teatro', 'cine', 'viaje', 'otro'].includes(body.category) ? body.category : 'otro';
  const detail = ['fiestas', 'viaje'].includes(category) ? text(body.detail, 80) : '';
  return { id: crypto.randomUUID(), title, place, category, detail, capacity, date: date.toISOString(), participants: [] };
}
export function enroll(event, token, name) {
  if (new Date(event.date) <= new Date()) throw new Error('Esta quedada ya ha comenzado.');
  if (event.participants.some(p => p.token === token)) return;
  if (event.participants.length >= 1000) throw new Error('La lista está completa.');
  event.participants.push({ token, name: text(name, 60) });
}
export function publicGroup(group, token) {
  return { name: group.name, owner: token === group.owner, events: group.events.map(e => ({ ...e, participants: e.participants.map((p, i) => ({ name: p.name, mine: p.token === token, waiting: i >= e.capacity })) })) };
}
