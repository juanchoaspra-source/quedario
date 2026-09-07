import { text, eventInput, enroll, publicGroup } from './domain.js';
const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (request.method !== 'GET' && request.headers.get('Origin') !== url.origin) return json({ error: 'Origen no permitido.' }, 403);
    if (Number(request.headers.get('Content-Length')) > 16384) return json({ error: 'Petición demasiado grande.' }, 413);
    const match = url.pathname.match(/^\/api\/groups\/([a-f0-9-]{36})(?:\/.*)?$/);
    if (!match) return json({ error: 'Ruta no encontrada.' }, 404);
    return env.GROUPS.get(env.GROUPS.idFromName(match[1])).fetch(request);
  }
};
export class Group {
  constructor(ctx) { this.ctx = ctx; }
  async fetch(request) {
    return this.ctx.blockConcurrencyWhile(async () => {
      try {
        const token = request.headers.get('X-Participant');
        if (!token || !/^[a-f0-9-]{36}$/.test(token)) return json({ error: 'Identificación no válida.' }, 401);
        const path = new URL(request.url).pathname.split('/').slice(4);
        let group = await this.ctx.storage.get('group');
        if (request.method === 'GET' && path.length === 0) return group ? json(publicGroup(group, token)) : json({ error: 'No se encuentra el grupo. Comprueba el enlace.' }, 404);
        const raw = await request.text();
        if (raw.length > 16384) return json({ error: 'Petición demasiado grande.' }, 413);
        const body = raw ? JSON.parse(raw) : {};
        if (request.method === 'POST' && path.length === 0) {
          if (group) return json({ error: 'El grupo ya existe.' }, 409);
          group = { name: text(body.name, 80), owner: token, events: [] };
        } else {
          if (!group) return json({ error: 'Grupo no encontrado.' }, 404);
          if (path[0] !== 'events') return json({ error: 'Ruta no encontrada.' }, 404);
          if (path.length === 1 && request.method === 'POST') {
            if (group.owner !== token) return json({ error: 'Solo el organizador puede crear quedadas.' }, 403);
            if (group.events.length >= 200) throw new Error('Límite de 200 quedadas por grupo.');
            group.events.push(eventInput(body));
          } else {
            const event = group.events.find(e => e.id === path[1]);
            if (!event) return json({ error: 'Quedada no encontrada.' }, 404);
            if (path.length === 3 && path[2] === 'participants' && request.method === 'POST') enroll(event, token, body.name);
            else if (path.length === 3 && path[2] === 'participants' && request.method === 'DELETE') event.participants = event.participants.filter(p => p.token !== token);
            else if (path.length === 2 && request.method === 'DELETE') {
              if (group.owner !== token) return json({ error: 'Solo el organizador puede cancelar.' }, 403);
              group.events = group.events.filter(e => e.id !== event.id);
            } else return json({ error: 'Ruta no encontrada.' }, 404);
          }
        }
        await this.ctx.storage.put('group', group);
        return json(publicGroup(group, token));
      } catch (error) {
        if (error instanceof SyntaxError) return json({ error: 'Datos no válidos.' }, 400);
        return json({ error: error.message || 'No se pudo guardar.' }, 400);
      }
    });
  }
}
