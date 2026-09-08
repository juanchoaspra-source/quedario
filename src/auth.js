const hash = async value => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(byte => byte.toString(16).padStart(2, '0')).join('');
export class Auth {
  constructor(ctx) { this.ctx = ctx; }
  async fetch(request) {
    const body = request.method === 'POST' ? await request.json() : {};
    if (new URL(request.url).pathname === '/login') {
      const providerKey = `google:${body.subject}`;
      let account = await this.ctx.storage.get(providerKey);
      if (!account) { account = { id: crypto.randomUUID(), subject: body.subject, email: body.email, name: body.name, picture: body.picture || '' }; await this.ctx.storage.put(providerKey, account); }
      else { account.name = body.name; account.picture = body.picture || ''; await this.ctx.storage.put(providerKey, account); }
      const raw = `${crypto.randomUUID()}${crypto.randomUUID()}`, session = { account, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30 };
      await this.ctx.storage.put(`session:${await hash(raw)}`, session);
      return Response.json({ raw, account });
    }
    const raw = body.session || '';
    const key = `session:${await hash(raw)}`, session = await this.ctx.storage.get(key);
    if (!session || session.expiresAt < Date.now()) { await this.ctx.storage.delete(key); return Response.json({ account: null }); }
    if (new URL(request.url).pathname === '/logout') { await this.ctx.storage.delete(key); return Response.json({ account: null }); }
    if (new URL(request.url).pathname === '/profile') {
      if (typeof body.picture !== 'string' || !body.picture.startsWith('data:image/webp;base64,') || body.picture.length > 120000) return Response.json({ error: 'La foto debe ser una imagen WebP reducida.' }, { status: 400 });
      session.account.picture = body.picture;
      await this.ctx.storage.put(`google:${session.account.subject}`, session.account);
      await this.ctx.storage.put(key, session);
    }
    return Response.json({ account: session.account });
  }
}
export const authRequest = (env, path, body) => env.AUTH.get(env.AUTH.idFromName('accounts')).fetch(new Request(`https://auth${path}`, { method: 'POST', body: JSON.stringify(body) }));
