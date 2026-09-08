export class Limits {
  constructor(ctx) { this.ctx = ctx; }
  async fetch(request) {
    const { scope, key, limit, windowMs } = await request.json();
    const now = Date.now(), storageKey = `${scope}:${key}`;
    let state = await this.ctx.storage.get(storageKey);
    if (!state || now >= state.resetAt) state = { count: 0, resetAt: now + windowMs };
    if (state.count >= limit) return Response.json({ allowed: false, retryAfter: Math.max(1, Math.ceil((state.resetAt - now) / 1000)) });
    state.count++;
    await this.ctx.storage.put(storageKey, state);
    return Response.json({ allowed: true, retryAfter: 0 });
  }
}

export async function rateLimit(env, scope, key, limit, windowMs) {
  if (!env.LIMITS) return { allowed: true, retryAfter: 0 };
  const response = await env.LIMITS.get(env.LIMITS.idFromName('edge-limits')).fetch(new Request('https://limits/check', { method: 'POST', body: JSON.stringify({ scope, key, limit, windowMs }) }));
  return response.json();
}
