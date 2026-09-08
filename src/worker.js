import { text, eventInput, enroll, addComment, publicGroup } from './domain.js';
import { migrate, isAdmin, canRead, ensureMember, passwordMatches, setPassword } from './access.js';
import { slugify, namesRequest } from './names.js';
import { analyticsRequest } from './analytics.js';
import { rateLimit } from './limits.js';
export { Names } from './names.js';
export { Dashboard } from './analytics.js';
export { Limits } from './limits.js';
const securityHeaders = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'geolocation=(self), camera=(), microphone=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'"
};
const json = (data, status = 200, headers = {}) => Response.json(data, { status, headers: { ...securityHeaders, ...headers } });
function secure(response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(securityHeaders)) if (!headers.has(name)) headers.set(name, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return secure(await env.ASSETS.fetch(request));
    if (request.method !== 'GET' && request.headers.get('Origin') !== url.origin) return json({ error: 'Origen no permitido.' }, 403);
    if (request.method !== 'GET' && !request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return json({ error: 'El contenido debe ser JSON.' }, 415);
    if (Number(request.headers.get('Content-Length')) > 16384) return json({ error: 'Petición demasiado grande.' }, 413);
    const clientKey = request.headers.get('CF-Connecting-IP') || 'unknown';
    const named=url.pathname.match(/^\/api\/resolve\/([a-z0-9-]{1,65})$/);
    if(named && request.method==='GET') {
      const limit = await rateLimit(env, 'resolve', clientKey, 120, 60000);
      if (!limit.allowed) return json({ error: 'Demasiadas consultas. Inténtalo más tarde.' }, 429, { 'Retry-After': String(limit.retryAfter) });
      const response=await namesRequest(env,'/resolve',{slug:named[1]});
      return json(await response.json(),response.status);
    }
    if (url.pathname === '/api/admin/dashboard' && request.method === 'GET') {
      if (!env.ADMIN_DASHBOARD_KEY || request.headers.get('X-Admin-Key') !== env.ADMIN_DASHBOARD_KEY) return json({ error: 'Acceso privado no autorizado.' }, 401);
      return secure(await env.ANALYTICS.get(env.ANALYTICS.idFromName('private-dashboard')).fetch(new Request('https://analytics/dashboard')));
    }
    const match = url.pathname.match(/^\/api\/groups\/([a-f0-9-]{36})(?:\/.*)?$/);
    if (!match) return json({ error: 'Ruta no encontrada.' }, 404);
    if (request.method === 'POST' && url.pathname === `/api/groups/${match[1]}`) {
      const limit = await rateLimit(env, 'group-create', clientKey, 5, 3600000);
      if (!limit.allowed) return json({ error: 'Has creado demasiados grupos. Inténtalo más tarde.' }, 429, { 'Retry-After': String(limit.retryAfter) });
    }
    const headers = new Headers(request.headers);
    headers.set('X-Quedario-Rate-Key', request.headers.get('CF-Connecting-IP') || 'unknown');
    return secure(await env.GROUPS.get(env.GROUPS.idFromName(match[1])).fetch(new Request(request, { headers })));
  }
};
export class Group {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }
  async fetch(request) {
    try {
        const token = request.headers.get('X-Participant');
        if (!token || !/^[a-f0-9-]{36}$/.test(token)) return json({ error: 'Identificación no válida.' }, 401);
        const path = new URL(request.url).pathname.split('/').slice(4);
        if(await this.ctx.storage.get('deleted')) return json({error:'Este grupo ha sido borrado.',deleted:true},410);
        let group = await this.ctx.storage.get('group');
        if (group) migrate(group);
        const locked = () => json({ error: 'Introduce la contraseña del grupo para acceder.', locked: true }, 401);
        if (request.method === 'GET' && path.length === 0) {
          if (!group || !canRead(group, token)) return locked();
          await this.ctx.storage.put('group', group);
          return json(publicGroup(group, token));
        }
        const raw = await request.text();
        if (raw.length > 16384) return json({ error: 'Petición demasiado grande.' }, 413);
        const body = raw ? JSON.parse(raw) : {};
        if (request.method === 'POST' && path.length === 0) {
          if (group) return locked();
          group = migrate({ name: text(body.name, 80), owner: token, events: [] });
          if(body.password) await setPassword(group, body.password);
          if(this.env?.NAMES){
            const response=await namesRequest(this.env,'/claim',{slug:slugify(body.slug || group.name),id:new URL(request.url).pathname.split('/')[3]});
            const result=await response.json();if(!response.ok)return json(result,response.status);
            group.slug=result.slug;
          }
          await analyticsRequest(this.env, { type: 'group-created' });
        } else {
          if (!group) return locked();
          if (group.banned.includes(token)) return locked();
          if(path.length===0 && request.method==='DELETE'){
            if(!isAdmin(group,token))return json({error:'Solo los administradores pueden borrar el grupo.'},403);
            if(body.confirmName!==group.name)throw new Error('Escribe el nombre exacto del grupo para confirmar el borrado.');
            await this.ctx.storage.deleteAll();
            await this.ctx.storage.put('deleted',true);
            if(group.slug && this.env?.NAMES)await namesRequest(this.env,'/release',{slug:group.slug,id:new URL(request.url).pathname.split('/')[3]});
            await analyticsRequest(this.env, { type: 'group-deleted' });
            return json({deleted:true});
          } else if (path.length === 1 && path[0] === 'unlock' && request.method === 'POST') {
            if (group.closed && !group.members.some(m => m.token === token)) return locked();
            const name = text(body.name, 60);
            const now = Date.now();
            const rateKey = `unlock-attempts:${token}:${request.headers.get('X-Quedario-Rate-Key') || 'unknown'}`;
            let attempts = await this.ctx.storage.get(rateKey);
            if (!attempts || now - attempts.start > 60000) attempts = { start: now, count: 0 };
            if (group.password) {
              if (attempts.count >= 10) return json({ error: 'Demasiados intentos para este acceso. Espera un minuto.' }, 429);
              if (typeof body.password !== 'string' || body.password.length > 128 || !await passwordMatches(body.password, group.password)) {
                attempts.count++;
                await this.ctx.storage.put(rateKey, attempts);
                return locked();
              }
              await this.ctx.storage.delete(rateKey);
            }
            const wasMember = group.members.some(item => item.token === token);
            const member = ensureMember(group, token, name);
            member.name = name; member.version = group.accessVersion;
            if (!wasMember) await analyticsRequest(this.env, { type: 'member-joined' });
          } else if (!canRead(group, token)) return locked();
          else if (path.length === 1 && path[0] === 'settings' && request.method === 'PATCH') {
            if (!isAdmin(group, token)) return json({ error: 'Solo los administradores pueden modificar los ajustes.' }, 403);
            group.name = text(body.name, 80);
            if (body.password) await setPassword(group, body.password);
            else if(body.password===''){delete group.password;group.accessVersion++;}
          } else if (path.length === 1 && path[0] === 'status' && request.method === 'PATCH') {
            if (!isAdmin(group, token)) return json({ error: 'Solo los administradores pueden cerrar o reabrir el grupo.' }, 403);
            if (typeof body.closed !== 'boolean') throw new Error('Estado no válido.');
            group.closed = body.closed;
          } else if (path.length === 2 && path[0] === 'members' && request.method === 'DELETE') {
            if (!isAdmin(group, token)) return json({ error: 'Solo los administradores pueden expulsar miembros.' }, 403);
            const member = group.members.find(m => m.id === path[1]);
            if (!member) throw new Error('Miembro no encontrado.');
            if (isAdmin(group, member.token) && group.admins.length === 1) throw new Error('No se puede expulsar al último administrador.');
            group.banned.push(member.token);
            group.admins = group.admins.filter(t => t !== member.token);
            group.members = group.members.filter(m => m.id !== member.id);
            for (const event of group.events) event.participants = event.participants.filter(p => p.token !== member.token);
            await this.ctx.storage.put('group', group);
            if (member.token === token) return locked();
          } else if (path.length === 1 && path[0] === 'admins' && request.method === 'PATCH') {
            if (!isAdmin(group, token)) return json({ error: 'Solo los administradores pueden gestionar permisos.' }, 403);
            const member = group.members.find(m => m.id === body.memberId);
            if (!member || typeof body.admin !== 'boolean') throw new Error('Selecciona un miembro del grupo.');
            if (body.admin && !isAdmin(group, member.token)) group.admins.push(member.token);
            if (!body.admin) {
              if (group.admins.length === 1 && isAdmin(group, member.token)) throw new Error('Debe quedar al menos un administrador.');
              group.admins = group.admins.filter(t => t !== member.token);
              member.version = -1;
            }
          } else if (path[0] !== 'events') return json({ error: 'Ruta no encontrada.' }, 404);
          else if (path.length === 1 && request.method === 'POST') {
            if (group.closed) throw new Error('El grupo está cerrado. Reábrelo para crear quedadas.');
            if (group.events.length >= 200) throw new Error('Límite de 200 quedadas por grupo.');
            const event = eventInput(body);
            event.creatorToken = token;
            const member = group.members.find(m => m.token === token);
            addComment(event, token, member?.name || 'Administrador', body.comment);
            group.events.push(event);
            await analyticsRequest(this.env, { type: 'activity-created', city: event.city, place: event.place });
          } else {
            const event = group.events.find(e => e.id === path[1]);
            if (!event) return json({ error: 'Quedada no encontrada.' }, 404);
            if (path.length === 3 && path[2] === 'participants' && request.method === 'POST') {
              if (group.closed) throw new Error('El grupo está cerrado y no admite inscripciones.');
              const wasEnrolled = event.participants.some(participant => participant.token === token);
              enroll(event, token, body.name);
              const member = ensureMember(group, token, body.name);
              member.name = text(body.name, 60);
              addComment(event, token, member.name, body.comment);
              if (!wasEnrolled) await analyticsRequest(this.env, { type: 'signup', city: event.city, place: event.place });
            }
            else if (path.length === 3 && path[2] === 'participants' && request.method === 'DELETE') event.participants = event.participants.filter(p => p.token !== token);
            else if (path.length === 2 && request.method === 'DELETE') {
              if (!isAdmin(group, token) && event.creatorToken !== token) return json({ error: 'Solo quien creó la quedada o un administrador puede cancelarla.' }, 403);
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
  }
}
