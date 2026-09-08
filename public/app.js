const $ = selector => document.querySelector(selector);
const categories = { cena: ['Cena','M4 3v7m4-7v7M6 3v18M3 10h6M17 3v18m0-18c-5 5-5 10 0 10'], comida: ['Comida','M3 12a9 9 0 0 1 18 0M2 16h20M12 3v2M5 20h14'], cafe: ['Café','M4 8h12v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM16 9h2a3 3 0 0 1 0 6h-2M7 2v3m5-3v3'], concierto: ['Concierto','M9 18V5l11-2v13M9 8l11-2M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3M20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3'], ruta: ['Ruta','m2 20 7-14 5 9 3-5 5 10ZM14 4h5m-3-3v6'], motos: ['Club de motos','M8 17a3 3 0 1 1-6 0 3 3 0 0 1 6 0M22 17a3 3 0 1 1-6 0 3 3 0 0 1 6 0M5 17l5-7h5l4 7M8 17h6l3-5M14 6h3l2 5M8 10H5'], fiestas: ['Fiestas','m3 21 5-14 9 9ZM10 3v2m7-2-2 4m6 2-4 2M5 14l5 5'], teatro: ['Teatro','M3 4l8 2v6c0 4-4 6-4 6s-4-2-4-6ZM13 7l8-3v8c0 4-4 6-4 6M5 9h1m2 1h1M5 13q2 2 4 0m6-3h1m2-1h1m-4 5q2-2 4 0'], cine: ['Cine','M3 8h18v13H3ZM3 8V3h18v5M7 3l-3 5m9-5-3 5m9-5-3 5m-6 4 5 3-5 3Z'], viaje: ['Viaje','m3 10 7 2 6-8c2-2 4-1 3 1l-5 9 5 4-2 2-6-3-4 4-2-1 2-6-5-2Z'], otro: ['Otro plan','m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z'] };
const categoryEmoji = {cena:'🍽️',comida:'🥗',cafe:'☕',concierto:'🎵',ruta:'🥾',motos:'🏍️',fiestas:'🎉',teatro:'🎭',cine:'🎬',viaje:'✈️',otro:'⭐'};
categories.padel = ['Pádel','M5 3h8a5 5 0 0 1 0 10H9l-5 8V3ZM11 8h.01'];
categories.correr = ['Correr','M13 5a2 2 0 1 0 0 .01M9 22l2-6 2 2v4m-1-6 3-5 4 2m-8-2 3 1 2-3'];
categories.futbol = ['Fútbol','M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0 3 4-3 3-3-3 3-4Zm-3 7 3 3 3-3m-6 0-3 2m9-2 3 2m-9 1-1 4m4-4v4m-3 0 3 2 3-2'];
categories.gimnasio = ['Gimnasio','M3 9v6m3-9v12m3-9v6h6V9m3-3v12m3-9v6'];
categories.bici = ['Bici','M7 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0M23 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0M7 18l5-9h4l3 9M10 12h6M14 5h3'];
categories.senderismo = ['Senderismo','m3 21 6-14 4 7 3-5 5 12ZM12 3h5m-3-2v5'];
categories.yoga = ['Yoga','M12 5a2 2 0 1 0 0 .01M5 21c2-5 4-7 7-7s5 2 7 7M7 12l5 2 5-2m-10 0 2-4m8 4-2-4'];
categories.juegos = ['Juegos de mesa','M4 4h16v16H4ZM8 4v16m8-16v16M4 8h16m-16 8h16'];
categories.compras = ['Compras y mercadillo','M5 8h14l-1 12H6L5 8Zm3 0a4 4 0 0 1 8 0'];
categories.museo = ['Exposición y museo','M3 10h18M5 10V8l7-4 7 4v2M6 20h12M8 10v8m4-8v8m4-8v8'];
categories.baile = ['Baile','M13 5a2 2 0 1 0 0 .01M9 21l2-6 3 2 2 4m-3-6 3-5 4 2m-8-2 3 1 2-3'];
categories.brunch = ['Brunch','M4 7h12v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM16 8h2a3 3 0 0 1 0 6h-2M7 2v3m5-3v3'];
categories.playa = ['Playa y piscina','M3 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 22c2-2 4-2 6 0s4 2 6 0 4-2 6 0M12 3a3 3 0 1 0 0 .01'];
categoryEmoji.padel = '🎾';
categoryEmoji.correr = '🏃';
Object.assign(categoryEmoji,{futbol:'⚽',gimnasio:'🏋️',bici:'🚲',senderismo:'🥾',yoga:'🧘',juegos:'🎲',compras:'🛍️',museo:'🏛️',baile:'💃',brunch:'🥞',playa:'🏖️'});
const categoryGroups = {
  deporte: {label:'Deporte', categories:['padel','correr','futbol','gimnasio','bici','yoga']},
  salir: {label:'Comer y salir', categories:['cafe','comida','cena','brunch','fiestas','baile']},
  cultura: {label:'Cultura', categories:['cine','teatro','concierto','museo','juegos']},
  aireLibre: {label:'Aire libre', categories:['ruta','senderismo','motos','playa']},
  escapadas: {label:'Escapadas', categories:['viaje']},
  otros: {label:'Otros planes', categories:['compras','otro']}
};
const icon = key => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${categories[key][1]}"/></svg>`;
const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
let token, saved, group, id, filter = 'all', joining, editingId, dashboardMap, focusedEventId;

try {
  token = localStorage.getItem('quedario.identity') || crypto.randomUUID();
  localStorage.setItem('quedario.identity', token);
  saved = JSON.parse(localStorage.getItem('quedario.groups') || '{}');
} catch {
  $('#notice').textContent = 'Activa el almacenamiento de este navegador para usar Quedario.';
  throw new Error('Storage unavailable');
}

function notice(message) {
  $('#notice').textContent = message;
  for (const id of ['unlock-status', 'event-status', 'join-status']) {
    const inline = $('#' + id);
    if (inline) inline.textContent = message;
  }
}
window.addEventListener('error', event => notice(event.error?.message || event.message || 'No se pudo completar la acción. Recarga la página e inténtalo de nuevo.'));
window.addEventListener('unhandledrejection', event => notice(event.reason?.message || 'No se pudo completar la acción. Comprueba tu conexión y vuelve a intentarlo.'));
function remember() { saved[id] = group.name; localStorage.setItem('quedario.groups', JSON.stringify(saved)); }

async function api(path = '', method = 'GET', body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let response;
  try {
    response = await fetch(`/api/groups/${id}${path}`, { method, signal: controller.signal, headers: {'Content-Type':'application/json','X-Participant':token}, ...(body ? {body:JSON.stringify(body)} : {}) });
  } catch (error) {
    throw new Error(error.name === 'AbortError' ? 'La conexión está tardando demasiado. Pulsa Entrar al grupo para reintentar.' : 'No se pudo conectar. Comprueba tu conexión y vuelve a intentarlo.');
  } finally { clearTimeout(timeout); }
  let data;
  try { data = await response.json(); } catch { throw new Error('El servidor no ha podido responder. Vuelve a intentarlo en unos instantes.'); }
  if (!response.ok) {
    if (data.alternatives) $('#slug-alternatives').innerHTML = data.alternatives.map(slug => `<button type="button" class="secondary" data-slug="${esc(slug)}">${esc(slug)}</button>`).join('');
    if (data.deleted) { delete saved[id]; localStorage.setItem('quedario.groups', JSON.stringify(saved)); $('#group').hidden = true; $('#members-section').hidden = true; $('#locked').hidden = true; }
    if (data.locked) { group = null; $('#group').hidden = true; $('#members-section').hidden = true; $('#locked').hidden = false; delete saved[id]; localStorage.setItem('quedario.groups', JSON.stringify(saved)); }
    throw new Error(data.error || 'No se pudo completar.');
  }
  return data;
}

async function action(fn) {
  const buttons = [...document.querySelectorAll('button')];
  buttons.forEach(button => button.disabled = true);
  try { notice(''); await fn(); } catch (error) { notice(error.message || 'Comprueba tu conexión e inténtalo de nuevo.'); } finally { buttons.forEach(button => button.disabled = false); }
}

function mapsUrl(place, location) {
  const query = location ? `${location.latitude},${location.longitude}` : place;
  return `https://www.google.com/maps/search/?${new URLSearchParams({api:'1', query}).toString()}`;
}
function mapEmbedUrl(place, location) {
  const query = location ? `${location.latitude},${location.longitude}` : place;
  return `https://www.google.com/maps?${new URLSearchParams({output:'embed', q:query}).toString()}`;
}
function eventCategory(event) { return categories[event.category] ? event.category : 'otro'; }
function eventLabel(event) {
  const category = eventCategory(event);
  if (event.detail && category === 'fiestas') return `Fiestas de ${event.detail}`;
  if (event.detail && category === 'viaje') return `Viaje a ${event.detail}`;
  return categories[category][0];
}
function dayLabel(date) { return new Intl.DateTimeFormat('es-ES', {weekday:'long', day:'numeric', month:'long'}).format(date); }
function timeLabel(date) { return new Intl.DateTimeFormat('es-ES', {hour:'2-digit', minute:'2-digit'}).format(date); }
function dayKey(date) { return new Intl.DateTimeFormat('en-CA', {year:'numeric', month:'2-digit', day:'2-digit'}).format(date); }
function dateTimeLabel(date) { return new Intl.DateTimeFormat('es-ES', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}).format(date); }
function dateRangeLabel(event) {
  if (!event.endDate || event.endDate === event.date) return '';
  const start = new Date(event.date), end = new Date(event.endDate);
  return dayKey(start) === dayKey(end) ? `De ${timeLabel(start)} a ${timeLabel(end)}` : `Del ${dateTimeLabel(start)} al ${dateTimeLabel(end)}`;
}

function eventCard(event) {
  const key = eventCategory(event);
  const mine = event.participants.find(participant => participant.mine);
  const full = event.participants.length >= event.capacity;
  const past = new Date(event.date) <= new Date();
  const map = event.mapUrl || mapsUrl(event.place, event.location);
  const embed = mapEmbedUrl(event.place, event.location);
  const comments = event.comments || [];
  const dateRange = dateRangeLabel(event);
  const commentsMarkup = comments.length ? `<section class="event-comments" aria-label="Comentarios"><h4>Comentarios <span>${comments.length}</span></h4><ul>${comments.map(comment => `<li><strong>${esc(comment.name)}${comment.mine ? ' (tú)' : ''}</strong><p>${esc(comment.text)}</p></li>`).join('')}</ul></section>` : '<section class="event-comments"><h4>Comentarios <span>0</span></h4><p class="muted">Aún no hay comentarios.</p></section>';
  return `<article id="event-${esc(event.id)}" class="card event-card agenda-accent-${categoryAccent(event)}${event.id === focusedEventId ? ' focused-event' : ''}">${event.image ? `<img class="event-image" src="${esc(event.image)}" alt="Cartel o imagen de ${esc(event.title)}">` : ''}<div class="event-main"><time class="event-time" datetime="${esc(event.date)}">${esc(timeLabel(new Date(event.date)))}</time><div><span class="badge">${icon(key)}${esc(eventLabel(event))}</span><h3>${esc(event.title)}</h3>${dateRange ? `<p class="event-date-range">${esc(dateRange)}</p>` : ''}<p class="event-place">${esc(event.place)}</p><a class="map-link" href="${esc(map)}" target="_blank" rel="noopener noreferrer">${event.mapUrl ? 'Abrir enlace de Google Maps ↗' : event.location ? 'Abrir ubicación exacta en Google Maps ↗' : 'Ver lugar en Google Maps ↗'}</a><p class="muted">${Math.min(event.participants.length, event.capacity)} / ${event.capacity} plazas · ${Math.max(0, event.participants.length - event.capacity)} en espera</p></div></div><details class="event-map"><summary>Ver mapa aquí</summary><iframe title="Mapa de ${esc(event.title)}" src="${esc(embed)}" loading="lazy"></iframe></details>${commentsMarkup}<div class="actions"><button data-event="${esc(event.id)}" data-action="${mine ? 'leave' : 'join'}" ${(past || group.closed) && !mine ? 'disabled' : ''}>${mine ? (mine.waiting ? 'Salir de la espera' : 'No podré ir') : (group.closed ? 'Grupo cerrado' : past ? 'Ya ha comenzado' : full ? 'Entrar en lista de espera' : 'Me apunto')}</button>${event.canEdit ? `<button class="secondary" data-event="${esc(event.id)}" data-action="edit">Editar plan</button>` : ''}${event.canCancel ? `<button class="secondary" data-event="${esc(event.id)}" data-action="cancel">Cancelar plan</button>` : ''}</div><details><summary>Participantes y lista de espera</summary><ul>${event.participants.map(participant => `<li class="${participant.waiting ? 'wait' : ''}">${participant.waiting ? 'En espera · ' : ''}${esc(participant.name)}${participant.mine ? ' (tú)' : ''}</li>`).join('') || '<li>Aún no hay nadie. ¡Abre el plan!</li>'}</ul></details></article>`;
}

function renderEvents(events) {
  if (!events.length) return '<p class="empty">No hay quedadas para esta selección. Los próximos buenos momentos empiezan con un plan.</p>';
  const days = new Map();
  for (const event of events) {
    const date = new Date(event.date);
    const key = dayKey(date);
    if (!days.has(key)) days.set(key, {label: dayLabel(date), events: []});
    days.get(key).events.push(event);
  }
  return [...days.values()].map(day => `<section class="agenda-day"><div class="day-heading"><h3>${esc(day.label)}</h3><span>${day.events.length === 1 ? '1 actividad' : `${day.events.length} actividades`}</span></div>${day.events.map(eventCard).join('')}</section>`).join('');
}

function render() {
  $('#locked').hidden = true; $('#group').hidden = false; $('#members-section').hidden = false; $('#settings').hidden = !group.owner;
  $('#privacy-note').textContent = group.protected ? 'Grupo protegido por contraseña. Comparte el enlace solo con los tuyos.' : 'Este grupo aún no tiene contraseña. Un administrador puede establecerla en Ajustes del grupo.';
  $('#group-name').textContent = group.name;
  renderShareButton();
  $('#members').innerHTML = (group.members || []).map(member => `<article class="card"><strong>${esc(member.name)}${member.mine ? ' (tú)' : ''}</strong><p class="muted">${member.admin ? 'Administrador' : 'Miembro'}</p>${group.owner ? `<button class="secondary" data-member="${esc(member.id)}" data-admin="${!member.admin}">${member.admin ? 'Quitar administración' : 'Nombrar administrador'}</button><button class="secondary" data-expel="${esc(member.id)}">Expulsar miembro</button>` : ''}</article>`).join('');
  const canCreate = !group.closed;
  $('#new-event').hidden = !canCreate;
  $('#new-event-mobile').hidden = !canCreate;
  $('#creation-note').textContent = group.closed ? 'Grupo cerrado: nadie puede crear ni apuntarse a actividades hasta que un administrador lo reabra.' : 'Cualquier persona con acceso al grupo puede crear actividades. Solo los administradores pueden cancelarlas.';
  $('#group-status').textContent = group.closed ? 'Reabrir grupo' : 'Cerrar grupo';
  if (group.closed) $('#privacy-note').textContent = 'Grupo cerrado: se conserva para consulta y no admite nuevas entradas ni inscripciones.';
  const events = group.events.filter(event => ($('#past').checked || new Date(event.date) > new Date() || event.id === focusedEventId) && (filter === 'all' || event.category === filter || event.id === focusedEventId)).sort((a, b) => new Date(a.date) - new Date(b.date));
  $('#count').textContent = `· ${events.length}`;
  $('#events').innerHTML = renderEvents(events);
}

async function load() { group = await api(); remember(); render(); if (group.slug) history.replaceState(null, '', '/' + group.slug); }
function groupUrl() { return group.slug ? `${location.origin}/${group.slug}` : `${location.origin}/#g=${id}`; }
const platformDetails = {
  whatsapp: {label:'Compartir por WhatsApp', className:'whatsapp', url: text => `https://wa.me/?text=${encodeURIComponent(text)}`},
  telegram: {label:'Compartir por Telegram', className:'telegram', url: text => `https://t.me/share/url?${new URLSearchParams({url:groupUrl(),text})}`},
  facebook: {label:'Compartir en Facebook', className:'facebook', url: () => `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({u:groupUrl()})}`},
  otro: {label:'Compartir enlace del grupo', className:'generic', url: () => ''}
};
function renderShareButton() {
  const button = $('#share-platform'), platform = platformDetails[group.platform] || platformDetails.whatsapp;
  button.textContent = platform.label; button.className = platform.className;
}
function categoryAccent(event) {
  const category = eventCategory(event);
  if (['ruta', 'senderismo', 'bici', 'playa', 'viaje'].includes(category)) return 'blue';
  if (['cine', 'teatro', 'concierto', 'museo', 'juegos', 'baile'].includes(category)) return 'pink';
  if (['padel', 'correr', 'futbol', 'gimnasio', 'yoga'].includes(category)) return 'orange';
  if (['cafe', 'comida', 'cena', 'brunch', 'fiestas'].includes(category)) return 'yellow';
  if (['motos', 'compras'].includes(category)) return 'purple';
  return 'green';
}
function shareGroup() {
  const platform = platformDetails[group.platform] || platformDetails.whatsapp;
  const text = `Únete a ${group.name} en Quedario y apúntate a nuestros planes: ${groupUrl()}`;
  if (group.platform === 'otro') return navigator.clipboard.writeText(groupUrl()).then(() => notice('Enlace del grupo copiado.'));
  window.open(platform.url(text), '_blank', 'noopener,noreferrer');
}
async function promoteQuedario() {
  const url = location.origin, text = '¿Quieres tener Quedario en otros grupos? Muéstrales el enlace y organizad vuestros planes en un solo sitio.';
  if (navigator.share) { await navigator.share({title:'Quedario', text, url}); return; }
  await navigator.clipboard.writeText(`${text} ${url}`); notice('Mensaje y enlace de Quedario copiados.');
}
function agendaCapacity(event) {
  const total = event.participants?.length || 0;
  const waiting = Math.max(0, total - event.capacity);
  return `${Math.min(total, event.capacity)} / ${event.capacity} plazas${waiting ? ` · ${waiting} en espera` : ''}`;
}
async function loadMyAgenda() {
  const panel = $('#my-agenda'), content = $('#my-agenda-items');
  panel.hidden = false; content.textContent = 'Preparando tu agenda…';
  const entries = await Promise.all(Object.entries(saved).map(async ([groupId, name]) => {
    try {
      const response = await fetch(`/api/groups/${groupId}`, {headers:{'X-Participant':token}});
      if (!response.ok) return [];
      const data = await response.json();
      return data.events.filter(event => new Date(event.endDate || event.date) > new Date()).map(event => ({...event, groupId, groupName:data.name || name}));
    } catch { return []; }
  }));
  const events = entries.flat().sort((a, b) => new Date(a.date) - new Date(b.date));
  const days = new Map();
  for (const event of events) {
    const key = dayKey(new Date(event.date));
    if (!days.has(key)) days.set(key, []);
    days.get(key).push(event);
  }
  content.innerHTML = events.length ? [...days.values()].map(day => `<section class="agenda-day personal-agenda-day"><div class="day-heading"><h3>${esc(dayLabel(new Date(day[0].date)))}</h3><span>${day.length === 1 ? '1 actividad' : `${day.length} actividades`}</span></div><div class="grid">${day.map(event => `<a class="card saved-link agenda-link agenda-accent-${categoryAccent(event)}" href="#g=${esc(event.groupId)}&e=${esc(event.id)}"><span class="badge">${icon(eventCategory(event))}${esc(eventLabel(event))}</span><h3>${esc(event.title)}</h3><p>${esc(timeLabel(new Date(event.date)))} · ${esc(event.place)}</p><p class="muted">${esc(agendaCapacity(event))}</p><p class="muted">Grupo: ${esc(event.groupName)}</p></a>`).join('')}</div></section>`).join('') : '<p class="muted">No tienes actividades futuras en los grupos guardados en este navegador.</p>';
}
async function route() {
  if (location.pathname === '/tablero') {
    $('#home').hidden = true; $('#group').hidden = true; $('#locked').hidden = true; $('#members-section').hidden = true; $('#dashboard').hidden = false;
    return;
  }
  $('#dashboard').hidden = true;
  if (location.hash === '#agenda') {
    id = undefined; $('#home').hidden = false; $('#group').hidden = true; $('#locked').hidden = true; $('#members-section').hidden = true;
    await loadMyAgenda(); return;
  }
  $('#my-agenda').hidden = true;
  if (location.pathname !== '/') {
    const slug = location.pathname.split('/').filter(Boolean).join('/');
    try { const response = await fetch('/api/resolve/' + encodeURIComponent(slug)); const data = await response.json(); if (!response.ok) throw new Error(data.error); history.replaceState(null, '', '/#g=' + data.id); } catch (error) { notice(error.message); return; }
  }
  const match = location.hash.match(/^#g=([a-f0-9-]{36})(?:&e=([a-f0-9-]{36}))?$/);
  id = match?.[1];
  focusedEventId = match?.[2];
  $('#home').hidden = !!id; $('#group').hidden = true; $('#locked').hidden = true; $('#members-section').hidden = true;
  if (id) {
    $('#events').textContent = 'Cargando grupo…'; await action(load);
    if (focusedEventId) requestAnimationFrame(() => document.getElementById(`event-${focusedEventId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
  else $('#saved').innerHTML = Object.entries(saved).map(([key, name]) => `<a class="card saved-link" href="#g=${esc(key)}"><h3>${esc(name)}</h3><span class="muted">Entrar al grupo →</span></a>`).join('') || '<p class="muted">Aquí encontrarás los grupos que crees o visites desde este navegador.</p>';
}

$('#group-form').onsubmit = event => { event.preventDefault(); if (!validatePasswords(event.target)) return; action(async () => { id = crypto.randomUUID(); group = await api('', 'POST', Object.fromEntries(new FormData(event.target))); remember(); history.replaceState(null, '', '/'); location.hash = `g=${id}`; event.target.reset(); }); };

function updateDetail() {
  const form = $('#event-form');
  const category = form.elements.category.value;
  const input = $('#detail-label input');
  const needed = category === 'fiestas' || category === 'viaje';
  $('#detail-label').hidden = !needed; input.disabled = !needed; input.required = needed;
  $('#detail-caption').textContent = category === 'fiestas' ? 'Fiestas de… (nombre)' : 'Viaje a… (destino)';
  input.placeholder = category === 'fiestas' ? 'Ej.: San Juan' : 'Ej.: Asturias';
  const multiDay = ['ruta', 'fiestas', 'viaje'].includes(category);
  const endDate = form.elements.endDate;
  $('#end-date-label').hidden = !multiDay; endDate.disabled = !multiDay; endDate.required = multiDay;
  $('#date-range-help').hidden = !multiDay;
  $('#start-date-caption').textContent = multiDay ? 'Fecha y hora de inicio' : 'Fecha y hora';
  if (multiDay) syncEndDate();
}
function syncEndDate() {
  const form = $('#event-form');
  const startDate = form.elements.date, endDate = form.elements.endDate;
  endDate.min = startDate.value || '';
  if (!endDate.value || endDate.dataset.followsStart === 'true' || endDate.value < startDate.value) {
    endDate.value = startDate.value;
    endDate.dataset.followsStart = 'true';
  }
}
function draftLocation() {
  const form = $('#event-form');
  if (!form.dataset.latitude || !form.dataset.longitude) return null;
  return {latitude:Number(form.dataset.latitude), longitude:Number(form.dataset.longitude)};
}
function updatePlacePreview() {
  const form = $('#event-form'), place = form.elements.place.value.trim(), mapUrl = form.elements.mapUrl.value.trim();
  const location = draftLocation();
  const link = $('#place-preview');
  if (!place && !location && !mapUrl) { link.hidden = true; link.removeAttribute('href'); return; }
  link.href = mapUrl || mapsUrl(place, location); link.hidden = false;
  link.textContent = mapUrl ? 'Comprobar el enlace de Google Maps ↗' : location ? 'Comprobar ubicación exacta en Google Maps ↗' : 'Buscar en Google Maps ↗';
}
function clearDraftLocation() {
  const form = $('#event-form'); delete form.dataset.latitude; delete form.dataset.longitude;
  $('#location-status').textContent = 'Puedes comprobar el lugar en Google Maps o guardar tu ubicación actual como punto exacto.';
}
function localInputDate(value) {
  const date = new Date(value), pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function openEventDialog(eventToEdit) {
  if (!eventToEdit || !eventToEdit.id) eventToEdit = undefined;
  const form = $('#event-form'); form.reset(); delete form.elements.endDate.dataset.followsStart; delete form.dataset.image; delete form.dataset.removeImage; notice(''); clearDraftLocation(); editingId = eventToEdit?.id;
  if (eventToEdit) {
    form.elements.title.value = eventToEdit.title; form.elements.category.value = eventToEdit.category; form.elements.detail.value = eventToEdit.detail || '';
    form.elements.date.value = localInputDate(eventToEdit.date); form.elements.endDate.value = eventToEdit.endDate ? localInputDate(eventToEdit.endDate) : '';
    form.elements.city.value = eventToEdit.city || ''; form.elements.place.value = eventToEdit.place; form.elements.mapUrl.value = eventToEdit.mapUrl || ''; form.elements.capacity.value = eventToEdit.capacity;
    if (eventToEdit.location) { form.dataset.latitude = String(eventToEdit.location.latitude); form.dataset.longitude = String(eventToEdit.location.longitude); }
  }
  updateEventImagePreview(eventToEdit?.image || '');
  $('#event-dialog h2').textContent = eventToEdit ? 'Editar actividad' : 'Un nuevo plan';
  const submit = form.querySelector('button[type="submit"]');
  if (!submit) throw new Error('No se ha encontrado el botón para guardar la actividad.');
  submit.textContent = eventToEdit ? 'Guardar cambios' : 'Crear quedada'; updateDetail(); updatePlacePreview();
  const dialog = $('#event-dialog');
  if (!dialog.open) dialog.showModal();
  form.elements.title.focus();
}
function updateEventImagePreview(image) {
  const preview = $('#event-image-preview');
  if (!preview) return;
  if (!image) { preview.hidden = true; preview.innerHTML = ''; return; }
  preview.hidden = false;
  preview.innerHTML = `<img src="${esc(image)}" alt="Vista previa de la imagen"><button type="button" class="secondary" id="remove-event-image">Quitar imagen</button>`;
  $('#remove-event-image').onclick = () => { const form = $('#event-form'); delete form.dataset.image; form.dataset.removeImage = 'true'; form.elements.imageFile.value = ''; updateEventImagePreview(''); };
}
async function compressEventImage(file) {
  if (!file?.type.startsWith('image/')) throw new Error('Selecciona un archivo de imagen válido.');
  const source = await createImageBitmap(file);
  let width = Math.min(960, source.width), height = Math.max(1, Math.round(source.height * width / source.width));
  for (let attempt = 0; attempt < 4; attempt++) {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    canvas.getContext('2d').drawImage(source, 0, 0, width, height);
    const image = canvas.toDataURL('image/webp', Math.max(.55, .78 - attempt * .08));
    if (image.length <= 180000) return image;
    width = Math.round(width * .75); height = Math.round(height * .75);
  }
  throw new Error('No se pudo reducir esa imagen. Prueba con otra más pequeña.');
}
function currentPosition() {
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, {enableHighAccuracy:true, timeout:12000, maximumAge:60000}));
}

$('#event-form select').onchange = updateDetail;
$('#event-form').elements.date.addEventListener('input', syncEndDate);
$('#event-form').elements.endDate.addEventListener('input', event => { event.target.dataset.followsStart = event.target.value === $('#event-form').elements.date.value ? 'true' : 'false'; });
$('#event-form').elements.place.addEventListener('input', updatePlacePreview);
$('#event-form').elements.mapUrl.addEventListener('input', updatePlacePreview);
$('#event-form').elements.imageFile?.addEventListener('change', event => action(async () => { const file = event.target.files[0]; if (!file) return; const image = await compressEventImage(file); const form = $('#event-form'); form.dataset.image = image; delete form.dataset.removeImage; updateEventImagePreview(image); }));
document.querySelectorAll('[data-open-event]').forEach(button => button.onclick = () => openEventDialog());
$('#close').onclick = () => $('#event-dialog').close();
$('#join-close').onclick = () => $('#join-dialog').close();
$('#use-location').onclick = () => action(async () => {
  if (!navigator.geolocation) throw new Error('Este navegador no permite compartir la ubicación. Escribe la dirección y usa la búsqueda de Google Maps.');
  if (!confirm('Quedario usará tu ubicación solo para este plan. Se compartirá con los miembros del grupo al crear la actividad. ¿Quieres continuar?')) return;
  $('#location-status').textContent = 'Solicitando la ubicación del dispositivo…';
  let position;
  try { position = await currentPosition(); } catch (error) {
    if (error.code === 1) throw new Error('No has autorizado la ubicación. Puedes escribir una dirección y buscarla en Google Maps.');
    if (error.code === 3) throw new Error('No se pudo obtener la ubicación a tiempo. Inténtalo de nuevo o escribe la dirección.');
    throw new Error('No se pudo determinar la ubicación. Revisa la conexión o escribe la dirección.');
  }
  const form = $('#event-form');
  form.dataset.latitude = String(position.coords.latitude); form.dataset.longitude = String(position.coords.longitude);
  if (!form.elements.place.value.trim()) form.elements.place.value = 'Punto de encuentro (ubicación exacta)';
  $('#location-status').textContent = 'Ubicación exacta guardada. Puedes abrirla en Google Maps antes de crear la actividad.';
  updatePlacePreview();
});

$('#event-form').onsubmit = event => { event.preventDefault(); action(async () => {
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  delete data.imageFile;
  if (form.dataset.image) data.image = form.dataset.image;
  else if (form.dataset.removeImage === 'true') data.image = '';
  const location = draftLocation();
  if (location) data.location = location;
  data.date = new Date(data.date).toISOString();
  if (data.endDate) data.endDate = new Date(data.endDate).toISOString();
  group = await api(editingId ? `/events/${editingId}` : '/events', editingId ? 'PATCH' : 'POST', data);
  $('#event-dialog').close(); form.reset(); clearDraftLocation(); updateDetail(); render();
  notice(editingId ? 'Actividad actualizada.' : 'Actividad creada y añadida a la agenda.'); editingId = undefined;
}); };

$('#events').onclick = event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const eventId = button.dataset.event;
  if (button.dataset.action === 'join') {
    joining = eventId;
    const form = $('#join-form');
    const knownMember = group.members?.find(member => member.mine)?.name || '';
    form.elements.name.value = account?.name || knownMember;
    notice(''); $('#join-dialog').showModal();
    return;
  }
  if (button.dataset.action === 'edit') {
    const plan = group.events.find(item => item.id === eventId);
    if (!plan) { notice('No se ha encontrado esta actividad. Actualiza el grupo e inténtalo de nuevo.'); return; }
    try { openEventDialog(plan); } catch (error) { notice(error.message || 'No se pudo abrir la edición de esta actividad.'); }
    return;
  }
  if (!confirm(button.dataset.action === 'cancel' ? '¿Cancelar esta quedada para todo el grupo?' : '¿Salir de la quedada? La primera persona en espera ocupará tu plaza.')) return;
  action(async () => { group = await api(`/events/${eventId}${button.dataset.action === 'leave' ? '/participants' : ''}`, 'DELETE'); render(); });
};
$('#join-form').onsubmit = event => { event.preventDefault(); action(async () => { group = await api(`/events/${joining}/participants`, 'POST', Object.fromEntries(new FormData(event.target))); $('#join-dialog').close(); render(); notice('Te has apuntado a la actividad.'); }); };

const categoryOptions = groups => Object.values(groups).map(group => `<optgroup label="${esc(group.label)}">${group.categories.map(key => `<option value="${key}">${categoryEmoji[key]} ${esc(categories[key][0])}</option>`).join('')}</optgroup>`).join('');
$('#event-form').elements.category.innerHTML = categoryOptions(categoryGroups);
$('#filters').innerHTML = '<button class="secondary" data-category="all" aria-pressed="true">Todos</button>' + Object.entries(categories).map(([key, [name]]) => `<button class="secondary" data-category="${key}" aria-pressed="false">${icon(key)}${name}</button>`).join('');
$('#category-picker').innerHTML = '<option value="all">Todas las actividades</option>' + categoryOptions(categoryGroups);
function selectCategory(value) { filter = value; $('#category-picker').value = value; document.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === value))); render(); }
$('#filters').onclick = event => { const button = event.target.closest('[data-category]'); if (button) selectCategory(button.dataset.category); };
$('#category-picker').onchange = event => selectCategory(event.target.value);
$('#past').onchange = render;
$('#refresh').onclick = () => action(load);
$('#copy').onclick = () => action(async () => { await navigator.clipboard.writeText(groupUrl()); notice('Enlace del grupo copiado.'); });
$('#share-platform').onclick = () => action(shareGroup);
$('#promote-quedario').onclick = () => action(promoteQuedario);

function dashboardCard(label, value) { return `<article class="card"><strong>${esc(String(value))}</strong><p class="muted">${esc(label)}</p></article>`; }
function renderDashboardMap(locations) {
  const mapped = locations.filter(location => location.location);
  const section = $('#dashboard-map-section');
  section.hidden = !mapped.length;
  if (!mapped.length || !window.L) return;
  if (dashboardMap) dashboardMap.remove();
  dashboardMap = window.L.map('dashboard-map');
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution:'© OpenStreetMap contributors', maxZoom:19}).addTo(dashboardMap);
  const points = mapped.map(location => [location.location.latitude, location.location.longitude]);
  for (const location of mapped) {
    const detail = `<strong>${esc(location.place)}</strong><br>${esc(location.city)}<br>${location.activities} actividades · ${location.signups} inscripciones<br><a href="${esc(mapsUrl(`${location.place}, ${location.city}`, location.location))}" target="_blank" rel="noopener noreferrer">Abrir en Google Maps</a>`;
    window.L.marker([location.location.latitude, location.location.longitude]).addTo(dashboardMap).bindPopup(detail);
  }
  dashboardMap.fitBounds(points, {padding:[28,28], maxZoom:14});
}
function googlePlaceDetails(location) {
  const google = location.google;
  if (!google) return `<p class="muted">${location.location ? 'Ubicación exacta disponible.' : 'Pendiente de localizar con Google Places.'}</p>`;
  const contacts = [google.address, google.phone].filter(Boolean).map(esc).join(' · ');
  return `<p class="muted">Ficha verificada por Google Places${contacts ? ` · ${contacts}` : ''}</p>${google.website ? `<a class="map-link" href="${esc(google.website)}" target="_blank" rel="noopener noreferrer">Visitar web del local ↗</a>` : ''}`;
}
function locationCounts(location) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthly = location.months?.[currentMonth] || { activities: 0, signups: 0 };
  const average = location.activities ? (location.signups / location.activities).toFixed(1).replace('.0', '') : '0';
  return `<div class="location-counts"><strong>${location.activities}</strong><span>actividades</span><strong>${location.signups}</strong><span>personas apuntadas</span><strong>${average}</strong><span>media por actividad</span><strong>${monthly.activities}</strong><span>planes este mes</span><strong>${monthly.signups}</strong><span>personas este mes</span></div>`;
}
function dashboardGroup(group) {
  const channels = { whatsapp:'WhatsApp', telegram:'Telegram', facebook:'Facebook', otro:'Otro canal' };
  return `<article class="card location-card"><div><h3>${esc(group.name)}</h3><p>${esc(group.city || 'Ciudad no indicada')}</p><p class="muted">Creado para ${esc(channels[group.platform] || 'WhatsApp')}</p></div><div class="location-counts"><strong>${group.members}</strong><span>${group.members === 1 ? 'persona inscrita' : 'personas inscritas'}</span></div></article>`;
}
async function loadDashboard(key) {
  const response = await fetch('/api/admin/dashboard', { headers: { 'X-Admin-Key': key } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo abrir el tablero.');
  $('#dashboard-status').textContent = 'Datos actualizados.';
  $('#dashboard-data').innerHTML = [['Grupos activos', data.activeGroups], ['Personas únicas', data.uniqueMembers], ['Actividades creadas', data.activitiesCreated], ['Inscripciones acumuladas', data.signups], ['Locales detectados', data.locations.length]].map(([label, value]) => dashboardCard(label, value)).join('');
  $('#dashboard-groups').innerHTML = `<h2>Grupos creados</h2>${data.groups?.length ? `<div class="agenda-list">${data.groups.map(dashboardGroup).join('')}</div>` : '<p class="muted">Los grupos aparecerán aquí a medida que se creen o se actualicen sus ajustes.</p>'}`;
  $('#dashboard-locations').innerHTML = `<div class="toolbar"><h2>Fichas de locales</h2><button type="button" class="secondary" id="enrich-places">Completar fichas pendientes</button></div><p class="muted">Consulta hasta 20 locales sin ficha en cada actualización. Las personas apuntadas reflejan inscripciones; podrás confirmar asistencia real cuando incorporemos ese paso.</p>${data.locations.length ? `<div class="agenda-list">${data.locations.map(location => `<article class="card location-card"><div><h3>${esc(location.google?.name || location.place)}</h3><p>${esc(location.city)}</p></div>${locationCounts(location)}${googlePlaceDetails(location)}<a class="map-link" href="${esc(location.google?.mapsUrl || mapsUrl(`${location.place}, ${location.city}`, location.location))}" target="_blank" rel="noopener noreferrer">Abrir ficha en Google Maps ↗</a></article>`).join('')}</div>` : '<p class="muted">Aún no hay locales registrados.</p>'}`;
  renderDashboardMap(data.locations);
}
$('#dashboard-form').onsubmit = event => { event.preventDefault(); action(async () => {
  await loadDashboard(event.currentTarget.elements.key.value);
}); };
$('#dashboard-locations').onclick = event => {
  if (event.target.id !== 'enrich-places') return;
  action(async () => {
    const key = $('#dashboard-form').elements.key.value;
    const response = await fetch('/api/admin/dashboard/enrich', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Key': key } });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se han podido completar las fichas.');
    await loadDashboard(key);
    $('#dashboard-status').textContent = result.checked ? `${result.completed} fichas completadas de ${result.checked} consultadas.` : 'No hay fichas pendientes para completar.';
  });
};

$('#settings').onclick = () => { const form = $('#settings-form'); form.elements.name.value = group.name; form.elements.city.value = group.city || ''; form.elements.password.value = ''; form.elements.passwordConfirm.value = ''; form.elements.passwordConfirm.setCustomValidity(''); form.elements.passwordConfirm.required = false; $('#settings-dialog').showModal(); };
$('#settings-close').onclick = () => $('#settings-dialog').close();
$('#settings-form').onsubmit = event => { event.preventDefault(); if (!validatePasswords(event.target)) return; if (group.protected && !event.target.elements.password.value && !confirm('¿Quitar la contraseña? Cualquiera con el enlace podrá ver el grupo.')) return; action(async () => { group = await api('/settings', 'PATCH', Object.fromEntries(new FormData(event.target))); remember(); render(); $('#settings-dialog').close(); notice('Ajustes guardados.'); }); };
$('#unlock-form').onsubmit = event => {
  event.preventDefault(); const form = event.currentTarget;
  if (!form.elements.name.value.trim()) { notice('Escribe tu nombre para entrar.'); form.elements.name.focus(); return; }
  if (!form.elements.password.value) { notice('Escribe la contraseña del grupo.'); form.elements.password.focus(); return; }
  const body = {name:form.elements.name.value.trim(), password:form.elements.password.value}; const submit = $('#unlock-submit');
  action(async () => { submit.textContent = 'Entrando…'; notice('Comprobando acceso…'); try { group = await api('/unlock', 'POST', body); remember(); render(); form.reset(); notice(''); window.scrollTo({top:0, behavior:'smooth'}); } finally { submit.textContent = 'Entrar al grupo'; } });
};
$('#members').onclick = event => {
  const expel = event.target.closest('[data-expel]');
  if (expel) { if (!confirm('¿Expulsar a este miembro? Perderá el acceso y se eliminarán sus inscripciones, liberando sus plazas.')) return; action(async () => { group = await api('/members/' + expel.dataset.expel, 'DELETE'); render(); }); return; }
  const button = event.target.closest('[data-member]'); if (!button) return;
  if (!confirm(button.dataset.admin === 'true' ? '¿Nombrar administrador? Podrá cambiar el nombre, la contraseña y los permisos del grupo.' : '¿Retirar los permisos de administración?')) return;
  action(async () => { group = await api('/admins', 'PATCH', {memberId:button.dataset.member, admin:button.dataset.admin === 'true'}); remember(); render(); });
};
$('#group-status').onclick = () => { const closed = !group.closed; if (!confirm(closed ? '¿Cerrar el grupo? Se conservará para consulta y se bloquearán nuevas entradas e inscripciones.' : '¿Reabrir el grupo para admitir entradas e inscripciones?')) return; action(async () => { group = await api('/status', 'PATCH', {closed}); render(); $('#settings-dialog').close(); notice(closed ? 'Grupo cerrado.' : 'Grupo reabierto.'); }); };
$('#slug-alternatives').onclick = event => { const button = event.target.closest('[data-slug]'); if (button) { $('#group-form').elements.slug.value = button.dataset.slug; notice('Enlace seleccionado. Pulsa Crear grupo para continuar.'); } };
$('#delete-group').onclick = () => { const name = prompt('Borrado definitivo: se eliminarán las quedadas, miembros y ajustes. Escribe el nombre exacto del grupo para confirmar: ' + group.name); if (name === null) return; if (name !== group.name) { notice('El nombre no coincide. No se ha borrado nada.'); return; } action(async () => { await api('', 'DELETE', {confirmName:name}); delete saved[id]; localStorage.setItem('quedario.groups', JSON.stringify(saved)); $('#settings-dialog').close(); group = null; history.replaceState(null, '', '/'); await route(); notice('Grupo borrado por completo.'); }); };
function validatePasswords(form) { const password = form.elements.password, confirmation = form.elements.passwordConfirm; confirmation.setCustomValidity(password.value === confirmation.value ? '' : 'Las contraseñas no coinciden.'); return form.reportValidity(); }
for (const form of [$('#group-form'), $('#settings-form')]) for (const input of [form.elements.password, form.elements.passwordConfirm]) input.addEventListener('input', () => { form.elements.passwordConfirm.setCustomValidity(''); form.elements.passwordConfirm.required = !!form.elements.password.value; });
const eye = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
document.querySelectorAll('input[type="password"]').forEach((input, index) => {
  input.id ||= 'password-field-' + index;
  const wrap = document.createElement('span'); wrap.className = 'password-field'; input.before(wrap); wrap.append(input);
  const button = document.createElement('button'); button.type = 'button'; button.className = 'password-eye'; button.innerHTML = eye; button.setAttribute('aria-controls', input.id);
  const update = () => { const visible = input.type === 'text'; button.setAttribute('aria-label', visible ? 'Ocultar contraseña' : 'Mostrar contraseña'); button.title = visible ? 'Ocultar contraseña' : 'Mostrar contraseña'; button.setAttribute('aria-pressed', String(visible)); };
  button.onclick = () => { input.type = input.type === 'password' ? 'text' : 'password'; update(); }; wrap.append(button); update(); input.form.addEventListener('reset', () => { input.type = 'password'; update(); });
});
let account;
function accountInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  return parts.slice(0, 2).map(part => part[0]).join('').toLocaleUpperCase('es-ES');
}
function renderAccount() {
  const button = $('#account');
  if (!account) { button.textContent = '◯'; button.setAttribute('aria-label', 'Entrar con Google'); $('#account-content').innerHTML = '<p class="muted">Inicia sesión con Google para mantener tu identidad entre dispositivos.</p><div id="google-button"></div>'; return; }
  button.innerHTML = account.picture ? `<img src="${esc(account.picture)}" alt="">` : esc(accountInitials(account.name));
  button.setAttribute('aria-label', `Cuenta de ${account.name}`);
  $('#account-content').innerHTML = `<p><strong>${esc(account.name)}</strong><br><span class="muted">${esc(account.email)}</span></p><label>Foto de perfil<input id="profile-photo" type="file" accept="image/*"></label><p class="muted">Se reduce automáticamente a WebP antes de guardarla.</p><button id="logout" class="secondary">Cerrar sesión</button>`;
  $('#logout').onclick = () => action(async () => { await fetch('/api/auth/logout', { method: 'POST', headers: {'Content-Type':'application/json'} }); account = null; renderAccount(); $('#account-dialog').close(); });
  $('#profile-photo').onchange = event => action(async () => { const file = event.target.files[0]; if (!file) return; const picture = await compressProfilePhoto(file); const response = await fetch('/api/auth/profile', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ picture }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'No se pudo guardar la foto.'); account = data.account; renderAccount(); });
}
async function compressProfilePhoto(file) {
  if (!file.type.startsWith('image/')) throw new Error('Selecciona una imagen.');
  const image = await createImageBitmap(file), side = Math.min(256, image.width, image.height), canvas = document.createElement('canvas'); canvas.width = side; canvas.height = side;
  const context = canvas.getContext('2d'), scale = Math.max(side / image.width, side / image.height); context.drawImage(image, (side - image.width * scale) / 2, (side - image.height * scale) / 2, image.width * scale, image.height * scale);
  return canvas.toDataURL('image/webp', 0.78);
}
async function googleCredential(response) {
  const result = await fetch('/api/auth/google', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ credential: response.credential }) });
  const data = await result.json(); if (!result.ok) throw new Error(data.error || 'No se pudo iniciar sesión.');
  account = data.account; renderAccount(); $('#account-dialog').close(); notice('Sesión iniciada. Esta cuenta se reconocerá en tus otros dispositivos.');
}
async function setupGoogle() {
  const config = await (await fetch('/api/auth/config')).json();
  const me = await (await fetch('/api/auth/me')).json(); account = me.account; renderAccount();
  if (!config.googleClientId) { $('#account-content').innerHTML = '<p class="muted">El acceso con Google aún no está configurado en producción.</p>'; return; }
  const script = document.createElement('script'); script.src = 'https://accounts.google.com/gsi/client'; script.async = true;
  script.onload = () => { google.accounts.id.initialize({ client_id: config.googleClientId, callback: response => action(() => googleCredential(response)), auto_select: false }); google.accounts.id.renderButton($('#google-button'), { theme: 'outline', size: 'large', text: 'continue_with', locale: 'es' }); };
  document.head.append(script);
}
$('#account').onclick = () => { $('#account-dialog').showModal(); };
$('#google-home').onclick = () => { $('#account-dialog').showModal(); };
$('#account-close').onclick = () => $('#account-dialog').close();
setupGoogle().catch(() => {});
window.addEventListener('hashchange', route);
route();
