import { text, eventInput, enroll, addComment, publicGroup } from './domain.js';
import { migrate, isAdmin, canRead, ensureMember, linkLegacyIdentity, passwordMatches, setPassword } from './access.js';
import { slugify, namesRequest } from './names.js';
import { analyticsRequest } from './analytics.js';
import { rateLimit } from './limits.js';
import { authRequest } from './auth.js';
export { Names } from './names.js';
export { Dashboard } from './analytics.js';
export { Limits } from './limits.js';
export { Auth } from './auth.js';
const securityHeaders = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'geolocation=(self), camera=(), microphone=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' https://accounts.google.com/gsi/client https://unpkg.com; style-src 'self' https://accounts.google.com/gsi/style https://unpkg.com; img-src 'self' data: https://lh3.googleusercontent.com https://*.tile.openstreetmap.org https://unpkg.com; connect-src 'self' https://accounts.google.com/gsi/; frame-src https://accounts.google.com/gsi/ https://www.google.com"
};
const json = (data, status = 200, headers = {}) => Response.json(data, { status, headers: { ...securityHeaders, ...headers } });
const groupPlatform = value => ['whatsapp', 'telegram', 'facebook', 'otro'].includes(value) ? value : 'whatsapp';
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
    const bodyLimit = url.pathname === '/api/auth/profile' ? 120000 : url.pathname.includes('/events') ? 200000 : 16384;
    if (Number(request.headers.get('Content-Length')) > bodyLimit) return json({ error: 'Petición demasiado grande.' }, 413);
    const clientKey = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (url.pathname === '/api/auth/config' && request.method === 'GET') return json({ googleClientId: env.GOOGLE_CLIENT_ID || '' });
    const session = request.headers.get('Cookie')?.match(/(?:^|;\s*)quedario_session=([^;]+)/)?.[1];
    if (url.pathname === '/api/auth/me' && request.method === 'GET') return json(await (await authRequest(env, '/resolve', { session })).json());
    if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
      const result = await (await authRequest(env, '/logout', { session })).json();
      return json(result, 200, { 'Set-Cookie': 'quedario_session=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax' });
    }
    if (url.pathname === '/api/auth/profile' && request.method === 'POST') {
      const result = await (await authRequest(env, '/profile', { session, picture: (await request.json()).picture })).json();
      return json(result, result.error ? 400 : 200);
    }
    if (url.pathname === '/api/auth/google' && request.method === 'POST') {
      if (!env.GOOGLE_CLIENT_ID) return json({ error: 'El acceso con Google aún no está configurado.' }, 503);
      const { credential } = await request.json();
      if (typeof credential !== 'string' || credential.length > 4096) return json({ error: 'Credencial de Google no válida.' }, 400);
      const verified = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      const profile = await verified.json();
      if (!verified.ok || profile.aud !== env.GOOGLE_CLIENT_ID || profile.email_verified !== 'true' || !profile.sub) return json({ error: 'Google no ha podido verificar esta cuenta.' }, 401);
      const result = await (await authRequest(env, '/login', { subject: profile.sub, email: profile.email, name: profile.name || profile.email, picture: profile.picture || '' })).json();
      return json({ account: result.account }, 200, { 'Set-Cookie': `quedario_session=${result.raw}; Path=/; Max-Age=2592000; Secure; HttpOnly; SameSite=Lax` });
    }
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
    if (url.pathname === '/api/admin/dashboard/enrich' && request.method === 'POST') {
      if (!env.ADMIN_DASHBOARD_KEY || request.headers.get('X-Admin-Key') !== env.ADMIN_DASHBOARD_KEY) return json({ error: 'Acceso privado no autorizado.' }, 401);
      return secure(await env.ANALYTICS.get(env.ANALYTICS.idFromName('private-dashboard')).fetch(new Request('https://analytics/enrich', { method: 'POST' })));
    }
    if (url.pathname === '/api/admin/dashboard/refresh' && request.method === 'POST') {
      if (!env.ADMIN_DASHBOARD_KEY || request.headers.get('X-Admin-Key') !== env.ADMIN_DASHBOARD_KEY) return json({ error: 'Acceso privado no autorizado.' }, 401);
      const directory = await namesRequest(env, '/list', {});
      const { ids: registeredIds = [] } = await directory.json();
      const body = await request.json().catch(() => ({}));
      const savedIds = Array.isArray(body.groupIds) ? body.groupIds : [];
      const ids = [...new Set([...registeredIds, ...savedIds].filter(groupId => typeof groupId === 'string' && /^[a-f0-9-]{36}$/.test(groupId)))].slice(0, 300);
      const results = await Promise.allSettled(ids.map(groupId => env.GROUPS.get(env.GROUPS.idFromName(groupId)).fetch(new Request(`https://groups/api/groups/${groupId}/dashboard-sync`, { method: 'POST', headers: { 'X-Admin-Key': env.ADMIN_DASHBOARD_KEY } }))));
      const synced = results.filter(result => result.status === 'fulfilled' && result.value.ok).length;
      return json({ ok: true, found: ids.length, synced });
    }
    const match = url.pathname.match(/^\/api\/groups\/([a-f0-9-]{36})(?:\/.*)?$/);
    if (!match) return json({ error: 'Ruta no encontrada.' }, 404);
    if (request.method === 'POST' && url.pathname === `/api/groups/${match[1]}`) {
      const limit = await rateLimit(env, 'group-create', clientKey, 5, 3600000);
      if (!limit.allowed) return json({ error: 'Has creado demasiados grupos. Inténtalo más tarde.' }, 429, { 'Retry-After': String(limit.retryAfter) });
    }
    const auth = session ? await (await authRequest(env, '/resolve', { session })).json() : null;
    const headers = new Headers(request.headers);
    if (auth?.account?.id) {
      headers.set('X-Legacy-Participant', request.headers.get('X-Participant') || '');
      headers.set('X-Participant', auth.account.id);
    }
    headers.set('X-Quedario-Rate-Key', request.headers.get('CF-Connecting-IP') || 'unknown');
    return secure(await env.GROUPS.get(env.GROUPS.idFromName(match[1])).fetch(new Request(request, { headers })));
  }
};
export class Group {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }
  async fetch(request) {
    try {
        const token = request.headers.get('X-Participant');
        const internal = !!this.env?.ADMIN_DASHBOARD_KEY && request.headers.get('X-Admin-Key') === this.env.ADMIN_DASHBOARD_KEY;
        if (!internal && (!token || !/^[a-f0-9-]{36}$/.test(token))) return json({ error: 'Identificación no válida.' }, 401);
        const path = new URL(request.url).pathname.split('/').slice(4);
        if(await this.ctx.storage.get('deleted')) return json({error:'Este grupo ha sido borrado.',deleted:true},410);
        let group = await this.ctx.storage.get('group');
        if (group) migrate(group);
        if (internal && request.method === 'POST' && path.length === 1 && path[0] === 'dashboard-sync') {
          if (!group) return json({ error: 'Este grupo no existe.' }, 404);
          await analyticsRequest(this.env, { type: 'group-snapshot', groupId: new URL(request.url).pathname.split('/')[3], name: group.name, city: group.city, platform: group.platform, members: group.members.map(member => member.token), activities: group.events.length, signups: group.events.reduce((total, event) => total + event.participants.length, 0) });
          await this.ctx.storage.put('group', group);
          return json({ ok: true });
        }
        if (group) linkLegacyIdentity(group, request.headers.get('X-Legacy-Participant'), token);
        const locked = () => json({ error: 'Introduce la contraseña del grupo para acceder.', locked: true }, 401);
        if (request.method === 'GET' && path.length === 0) {
          if (!group || !canRead(group, token)) return locked();
          await this.ctx.storage.put('group', group);
          await analyticsRequest(this.env, { type: 'group-snapshot', groupId: new URL(request.url).pathname.split('/')[3], name: group.name, city: group.city, platform: group.platform, members: group.members.map(member => member.token), activities: group.events.length, signups: group.events.reduce((total, event) => total + event.participants.length, 0) });
          return json(publicGroup(group, token));
        }
        const raw = await request.text();
        if (raw.length > 200000) return json({ error: 'Petición demasiado grande.' }, 413);
        const body = raw ? JSON.parse(raw) : {};
        if (request.method === 'POST' && path.length === 0) {
          if (group) return locked();
          group = migrate({ name: text(body.name, 80), city: typeof body.city === 'string' && body.city.trim() ? text(body.city, 80) : '', platform: groupPlatform(body.platform), owner: token, events: [] });
          if(body.password) await setPassword(group, body.password);
          if(this.env?.NAMES){
            const response=await namesRequest(this.env,'/claim',{slug:slugify(body.slug || group.name),id:new URL(request.url).pathname.split('/')[3]});
            const result=await response.json();if(!response.ok)return json(result,response.status);
            group.slug=result.slug;
          }
          await analyticsRequest(this.env, { type: 'group-created', groupId: new URL(request.url).pathname.split('/')[3], memberId: token, name: group.name, city: group.city, platform: group.platform });
        } else {
          if (!group) return locked();
          if (group.banned.includes(token)) return locked();
          if(path.length===0 && request.method==='DELETE'){
            if(!isAdmin(group,token))return json({error:'Solo los administradores pueden borrar el grupo.'},403);
            if(body.confirmName!==group.name)throw new Error('Escribe el nombre exacto del grupo para confirmar el borrado.');
            await this.ctx.storage.deleteAll();
            await this.ctx.storage.put('deleted',true);
            if(group.slug && this.env?.NAMES)await namesRequest(this.env,'/release',{slug:group.slug,id:new URL(request.url).pathname.split('/')[3]});
            await analyticsRequest(this.env, { type: 'group-deleted', groupId: new URL(request.url).pathname.split('/')[3] });
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
            if (!wasMember) await analyticsRequest(this.env, { type: 'member-joined', groupId: new URL(request.url).pathname.split('/')[3], memberId: token });
          } else if (!canRead(group, token)) return locked();
          else if (path.length === 1 && path[0] === 'settings' && request.method === 'PATCH') {
            if (!isAdmin(group, token)) return json({ error: 'Solo los administradores pueden modificar los ajustes.' }, 403);
            group.name = text(body.name, 80);
            group.city = typeof body.city === 'string' && body.city.trim() ? text(body.city, 80) : '';
            if (body.password) await setPassword(group, body.password);
            else if(body.password===''){delete group.password;group.accessVersion++;}
            await analyticsRequest(this.env, { type: 'group-updated', groupId: new URL(request.url).pathname.split('/')[3], name: group.name, city: group.city, platform: group.platform });
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
            await analyticsRequest(this.env, { type: 'member-left', groupId: new URL(request.url).pathname.split('/')[3], memberId: member.token });
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
            await analyticsRequest(this.env, { type: 'activity-created', groupId: new URL(request.url).pathname.split('/')[3], city: event.city, place: event.place, location: event.location });
          } else {
            const event = group.events.find(e => e.id === path[1]);
            if (!event) return json({ error: 'Quedada no encontrada.' }, 404);
            if (path.length === 3 && path[2] === 'participants' && request.method === 'POST') {
              if (group.closed) throw new Error('El grupo está cerrado y no admite inscripciones.');
              const wasEnrolled = event.participants.some(participant => participant.token === token);
              enroll(event, token, body.name);
              const wasMember = group.members.some(member => member.token === token);
              const member = ensureMember(group, token, body.name);
              member.name = text(body.name, 60);
              addComment(event, token, member.name, body.comment);
              if (!wasMember) await analyticsRequest(this.env, { type: 'member-joined', groupId: new URL(request.url).pathname.split('/')[3], memberId: token });
              if (!wasEnrolled) await analyticsRequest(this.env, { type: 'signup', groupId: new URL(request.url).pathname.split('/')[3], memberId: token, city: event.city, place: event.place, date: event.date });
            }
            else if (path.length === 3 && path[2] === 'participants' && request.method === 'DELETE') event.participants = event.participants.filter(p => p.token !== token);
            else if (path.length === 2 && request.method === 'PATCH') {
              if (!isAdmin(group, token) && event.creatorToken !== token) return json({ error: 'Solo quien creó la quedada o un administrador puede editarla.' }, 403);
              const updated = eventInput(body);
              Object.assign(event, updated, { id: event.id, creatorToken: event.creatorToken, participants: event.participants, comments: event.comments || [] });
            }
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
