export function migrate(group) {
  group.admins ??= [group.owner];
  group.members ??= [];
  group.accessVersion ??= 0;
  group.banned ??= [];
  for (const p of [{ token: group.owner, name: 'Creador del grupo' }, ...group.events.flatMap(e => e.participants)]) {
    if (!group.banned.includes(p.token) && !group.members.some(m => m.token === p.token)) group.members.push({ id: crypto.randomUUID(), token: p.token, name: p.name, version: -1 });
  }
  return group;
}
export const isAdmin = (group, token) => (group.admins || [group.owner]).includes(token);
export const canRead = (group, token) => !group.banned?.includes(token) && (isAdmin(group, token) || ((!group.closed || group.members.some(m => m.token === token)) && ((!group.password) || group.members.some(m => m.token === token && m.version === group.accessVersion))));
export function ensureMember(group, token, name = '') {
  let member = group.members.find(item => item.token === token);
  if (!member) {
    if (group.members.length >= 2000) throw new Error('El grupo ha alcanzado su límite de miembros.');
    member = { id: crypto.randomUUID(), token, name: typeof name === 'string' ? name.trim().slice(0, 60) : '', version: -1 };
    group.members.push(member);
  }
  return member;
}
export function linkLegacyIdentity(group, legacyToken, accountToken) {
  if (!legacyToken || legacyToken === accountToken || group.banned.includes(legacyToken) || group.banned.includes(accountToken)) return false;
  const belongsToLegacy = group.owner === legacyToken || group.admins.includes(legacyToken) || group.members.some(member => member.token === legacyToken) || group.events.some(event => event.creatorToken === legacyToken || event.participants.some(participant => participant.token === legacyToken) || (event.comments || []).some(comment => comment.token === legacyToken));
  if (!belongsToLegacy) return false;
  if (group.owner === legacyToken) group.owner = accountToken;
  group.admins = [...new Set(group.admins.map(token => token === legacyToken ? accountToken : token))];
  const legacyMember = group.members.find(member => member.token === legacyToken);
  const accountMember = group.members.find(member => member.token === accountToken);
  if (legacyMember && accountMember) {
    accountMember.version = Math.max(accountMember.version, legacyMember.version);
    if (!accountMember.name && legacyMember.name) accountMember.name = legacyMember.name;
    group.members = group.members.filter(member => member !== legacyMember);
  } else if (legacyMember) legacyMember.token = accountToken;
  for (const event of group.events) {
    if (event.creatorToken === legacyToken) event.creatorToken = accountToken;
    for (const participant of event.participants) if (participant.token === legacyToken) participant.token = accountToken;
    event.participants = event.participants.filter((participant, index, all) => all.findIndex(item => item.token === participant.token) === index);
    for (const comment of event.comments || []) if (comment.token === legacyToken) comment.token = accountToken;
  }
  return true;
}
const DEFAULT_ITERATIONS = 600000;
export async function passwordHash(password, salt, iterations = DEFAULT_ITERATIONS) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations, hash: 'SHA-256' }, key, 256);
  return [...new Uint8Array(bits)].map(v => v.toString(16).padStart(2, '0')).join('');
}
export async function passwordMatches(password, record) {
  const candidate = await passwordHash(password, record.salt, record.iterations || 100000);
  const expected = String(record.hash || '');
  let difference = candidate.length ^ expected.length;
  const length = Math.max(candidate.length, expected.length);
  for (let index = 0; index < length; index++) difference |= (candidate.charCodeAt(index) || 0) ^ (expected.charCodeAt(index) || 0);
  return difference === 0;
}
export async function setPassword(group, password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) throw new Error('La contraseña debe tener entre 8 y 128 caracteres.');
  const salt = crypto.randomUUID();
  group.password = { salt, hash: await passwordHash(password, salt), iterations: DEFAULT_ITERATIONS };
  group.accessVersion++;
}
