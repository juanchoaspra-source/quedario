const $ = s => document.querySelector(s);
const categories = { cena: ['Cena','M4 3v7m4-7v7M6 3v18M3 10h6M17 3v18m0-18c-5 5-5 10 0 10'], comida: ['Comida','M3 12a9 9 0 0 1 18 0M2 16h20M12 3v2M5 20h14'], cafe: ['Café','M4 8h12v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM16 9h2a3 3 0 0 1 0 6h-2M7 2v3m5-3v3'], concierto: ['Concierto','M9 18V5l11-2v13M9 8l11-2M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3M20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3'], ruta: ['Ruta','m2 20 7-14 5 9 3-5 5 10ZM14 4h5m-3-3v6'], motos: ['Club de motos','M8 17a3 3 0 1 1-6 0 3 3 0 0 1 6 0M22 17a3 3 0 1 1-6 0 3 3 0 0 1 6 0M5 17l5-7h5l4 7M8 17h6l3-5M14 6h3l2 5M8 10H5'], fiestas: ['Fiestas','m3 21 5-14 9 9ZM10 3v2m7-2-2 4m6 2-4 2M5 14l5 5'], teatro: ['Teatro','M3 4l8 2v6c0 4-4 6-4 6s-4-2-4-6ZM13 7l8-3v8c0 4-4 6-4 6M5 9h1m2 1h1M5 13q2 2 4 0m6-3h1m2-1h1m-4 5q2-2 4 0'], cine: ['Cine','M3 8h18v13H3ZM3 8V3h18v5M7 3l-3 5m9-5-3 5m9-5-3 5m-6 4 5 3-5 3Z'], viaje: ['Viaje','m3 10 7 2 6-8c2-2 4-1 3 1l-5 9 5 4-2 2-6-3-4 4-2-1 2-6-5-2Z'], otro: ['Otro plan','m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z'] };
function icon(key){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${categories[key][1]}"/></svg>`;}
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let token, saved, group, id, filter = 'all', joining;
try { token = localStorage.getItem('quedario.identity') || crypto.randomUUID(); localStorage.setItem('quedario.identity', token); saved = JSON.parse(localStorage.getItem('quedario.groups') || '{}'); } catch { $('#notice').textContent = 'Activa el almacenamiento de este navegador para usar Quedario.'; throw new Error('Storage unavailable'); }
function notice(message){$('#notice').textContent = message;const inline=$('#unlock-status');if(inline)inline.textContent=message;}
window.addEventListener('error',()=>notice('No se pudo completar la acción. Recarga la página e inténtalo de nuevo.'));
window.addEventListener('unhandledrejection',()=>notice('No se pudo completar la acción. Comprueba tu conexión y vuelve a intentarlo.'));
function remember(){saved[id] = group.name;localStorage.setItem('quedario.groups',JSON.stringify(saved));}
async function api(path='', method='GET', body){const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);let r;try{r = await fetch(`/api/groups/${id}${path}`, {method, signal:controller.signal, headers:{'Content-Type':'application/json','X-Participant':token}, ...(body ? {body:JSON.stringify(body)}:{})});}catch(error){throw new Error(error.name==='AbortError'?'La conexión está tardando demasiado. Pulsa Entrar al grupo para reintentar.':'No se pudo conectar. Comprueba tu conexión y vuelve a intentarlo.');}finally{clearTimeout(timeout);}let data;try{data=await r.json();}catch{throw new Error('El servidor no ha podido responder. Vuelve a intentarlo en unos instantes.');}if(!r.ok){if(data.alternatives){$('#slug-alternatives').innerHTML=data.alternatives.map(s=>`<button type="button" class="secondary" data-slug="${esc(s)}">${esc(s)}</button>`).join('');}if(data.deleted){delete saved[id];localStorage.setItem('quedario.groups',JSON.stringify(saved));$('#group').hidden=true;$('#members-section').hidden=true;$('#locked').hidden=true;}if(data.locked){group=null;$('#group').hidden=true;$('#members-section').hidden=true;$('#locked').hidden=false;delete saved[id];localStorage.setItem('quedario.groups',JSON.stringify(saved));}throw new Error(data.error || 'No se pudo completar.');}return data;}
async function action(fn){const buttons=[...document.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);try{notice('');await fn();}catch(e){notice(e.message || 'Comprueba tu conexión e inténtalo de nuevo.');}finally{buttons.forEach(b=>b.disabled=false);}}
function render(){
  $('#locked').hidden=true;$('#group').hidden=false;$('#members-section').hidden=false;$('#settings').hidden=!group.owner;
  $('#privacy-note').textContent=group.protected?'Grupo protegido por contraseña. Comparte el enlace solo con los tuyos.':'Este grupo aún no tiene contraseña. Un administrador puede establecerla en Ajustes del grupo.';
  $('#members').innerHTML=(group.members||[]).map(m=>`<article class="card"><strong>${esc(m.name)}${m.mine?' (tú)':''}</strong><p class="muted">${m.admin?'Administrador':'Miembro'}</p>${group.owner?`<button class="secondary" data-member="${esc(m.id)}" data-admin="${!m.admin}">${m.admin?'Quitar administración':'Nombrar administrador'}</button><button class="secondary" data-expel="${esc(m.id)}">Expulsar miembro</button>`:''}</article>`).join('');
  $('#group-name').textContent=group.name;$('#new-event').hidden=!group.owner || group.closed;$('#group-status').textContent=group.closed?'Reabrir grupo':'Cerrar grupo';if(group.closed)$('#privacy-note').textContent='Grupo cerrado: se conserva para consulta y no admite nuevas entradas ni inscripciones.';
  const events=group.events.filter(e=>($('#past').checked || new Date(e.date)>new Date()) && (filter==='all'||e.category===filter)).sort((a,b)=>new Date(a.date)-new Date(b.date));
  $('#count').textContent=`· ${events.length}`;
  $('#events').innerHTML=events.length?events.map(e=>{const key=categories[e.category]?e.category:'otro', mine=e.participants.find(p=>p.mine), full=e.participants.length>=e.capacity, past=new Date(e.date)<=new Date();return `<article class="card"><span class="badge">${icon(key)}${esc(e.detail && key==='fiestas' ? `Fiestas de ${e.detail}` : e.detail && key==='viaje' ? `Viaje a ${e.detail}` : categories[key][0])}</span><p class="date">${esc(new Intl.DateTimeFormat('es',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(e.date)))}</p><h3>${esc(e.title)}</h3><p>${esc(e.place)}</p><p class="muted">${Math.min(e.participants.length,e.capacity)} / ${e.capacity} plazas · ${Math.max(0,e.participants.length-e.capacity)} en espera</p><div class="actions"><button data-event="${e.id}" data-action="${mine?'leave':'join'}" ${(past||group.closed)&&!mine?'disabled':''}>${mine?(mine.waiting?'Salir de la espera':'No podré ir'):(group.closed?'Grupo cerrado':past?'Ya ha comenzado':full?'Entrar en lista de espera':'Me apunto')}</button>${group.owner?`<button class="secondary" data-event="${e.id}" data-action="cancel">Cancelar plan</button>`:''}</div><details><summary>Participantes y lista de espera</summary><ul>${e.participants.map(p=>`<li class="${p.waiting?'wait':''}">${p.waiting?'En espera · ':''}${esc(p.name)}${p.mine?' (tú)':''}</li>`).join('')||'<li>Aún no hay nadie. ¡Abre el plan!</li>'}</ul></details></article>`;}).join(''):'<p class="empty">No hay quedadas para esta selección. Los próximos buenos momentos empiezan con un plan.</p>';
}
async function load(){group=await api();remember();render();if(group.slug)history.replaceState(null,'','/'+group.slug);}
function groupUrl(){return group.slug?`${location.origin}/${group.slug}`:`${location.origin}/#g=${id}`;}
async function route(){if(location.pathname!=='/'){const slug=location.pathname.split('/').filter(Boolean).join('/');try{const response=await fetch('/api/resolve/'+encodeURIComponent(slug));const data=await response.json();if(!response.ok)throw new Error(data.error);history.replaceState(null,'','/#g='+data.id);}catch(error){notice(error.message);return;}}const match=location.hash.match(/^#g=([a-f0-9-]{36})$/);id=match?.[1];$('#home').hidden=!!id;$('#group').hidden=true;$('#locked').hidden=true;$('#members-section').hidden=true;if(id){$('#events').textContent='Cargando grupo…';await action(load);}else{$('#saved').innerHTML=Object.entries(saved).map(([key,name])=>`<a class="card saved-link" href="#g=${esc(key)}"><h3>${esc(name)}</h3><span class="muted">Entrar al grupo →</span></a>`).join('')||'<p class="muted">Aquí encontrarás los grupos que crees o visites desde este navegador.</p>';}}
$('#group-form').onsubmit=e=>{e.preventDefault();if(!validatePasswords(e.target))return;action(async()=>{id=crypto.randomUUID();group=await api('','POST',Object.fromEntries(new FormData(e.target)));remember();history.replaceState(null,'','/');location.hash=`g=${id}`;e.target.reset();});};
$('#event-form').onsubmit=e=>{e.preventDefault();action(async()=>{const data=Object.fromEntries(new FormData(e.target));data.date=new Date(data.date).toISOString();group=await api('/events','POST',data);$('#event-dialog').close();e.target.reset();updateDetail();render();});};
function updateDetail(){
  const category = $('#event-form select').value;
  const input = $('#detail-label input');
  const needed = category === 'fiestas' || category === 'viaje';
  $('#detail-label').hidden = !needed; input.disabled = !needed; input.required = needed;
  $('#detail-caption').textContent = category === 'fiestas' ? 'Fiestas de… (nombre)' : 'Viaje a… (destino)';
  input.placeholder = category === 'fiestas' ? 'Ej.: San Juan' : 'Ej.: Asturias';
}
$('#event-form select').onchange = updateDetail;
$('#new-event').onclick=()=>$('#event-dialog').showModal();$('#close').onclick=()=>$('#event-dialog').close();$('#join-close').onclick=()=>$('#join-dialog').close();
$('#events').onclick=e=>{const button=e.target.closest('[data-action]');if(!button)return;const event=button.dataset.event;if(button.dataset.action==='join'){joining=event;$('#join-dialog').showModal();return;}if(!confirm(button.dataset.action==='cancel'?'¿Cancelar esta quedada para todo el grupo?':'¿Salir de la quedada? La primera persona en espera ocupará tu plaza.'))return;action(async()=>{group=await api(`/events/${event}${button.dataset.action==='leave'?'/participants':''}`,'DELETE');render();});};
$('#join-form').onsubmit=e=>{e.preventDefault();action(async()=>{group=await api(`/events/${joining}/participants`,'POST',Object.fromEntries(new FormData(e.target)));$('#join-dialog').close();render();});};
$('#filters').innerHTML='<button class="secondary" data-category="all" aria-pressed="true">Todos</button>'+Object.entries(categories).map(([key,[name]])=>`<button class="secondary" data-category="${key}" aria-pressed="false">${icon(key)}${name}</button>`).join('');
const categoryEmoji={cena:'🍽️',comida:'🥗',cafe:'☕',concierto:'🎵',ruta:'🥾',motos:'🏍️',fiestas:'🎉',teatro:'🎭',cine:'🎬',viaje:'✈️',otro:'⭐'};
$('#category-picker').innerHTML='<option value="all">Todas las actividades</option>'+Object.entries(categories).map(([key,[name]])=>`<option value="${key}">${categoryEmoji[key]} ${name}</option>`).join('');
function selectCategory(value){filter=value;$('#category-picker').value=value;document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===value)));render();}
$('#filters').onclick=e=>{const button=e.target.closest('[data-category]');if(button)selectCategory(button.dataset.category);};
$('#category-picker').onchange=e=>selectCategory(e.target.value);
$('#past').onchange=render;$('#refresh').onclick=()=>action(load);
$('#copy').onclick=()=>action(async()=>{await navigator.clipboard.writeText(groupUrl());notice('Enlace del grupo copiado.');});
$('#share').onclick=()=>window.open(`https://wa.me/?text=${encodeURIComponent(`Únete a ${group.name} en Quedario y apúntate a nuestros planes: ${groupUrl()}`)}`,'_blank','noopener,noreferrer');
$('#settings').onclick=()=>{const form=$('#settings-form');form.elements.name.value=group.name;form.elements.password.value='';form.elements.passwordConfirm.value='';form.elements.passwordConfirm.setCustomValidity('');form.elements.passwordConfirm.required=false;$('#settings-dialog').showModal();};
$('#settings-close').onclick=()=>$('#settings-dialog').close();
$('#settings-form').onsubmit=e=>{e.preventDefault();if(!validatePasswords(e.target))return;if(group.protected&&!e.target.elements.password.value&&!confirm('¿Quitar la contraseña? Cualquiera con el enlace podrá ver el grupo.'))return;action(async()=>{group=await api('/settings','PATCH',Object.fromEntries(new FormData(e.target)));remember();render();$('#settings-dialog').close();notice('Ajustes guardados.');});};
$('#unlock-form').onsubmit=e=>{
 e.preventDefault();const form=e.currentTarget;
 if(!form.elements.name.value.trim()){notice('Escribe tu nombre para entrar.');form.elements.name.focus();return;}
 if(!form.elements.password.value){notice('Escribe la contraseña del grupo.');form.elements.password.focus();return;}
 const body={name:form.elements.name.value.trim(),password:form.elements.password.value};
 const submit=$('#unlock-submit');
 action(async()=>{submit.textContent='Entrando…';notice('Comprobando acceso…');try{group=await api('/unlock','POST',body);remember();render();form.reset();notice('');window.scrollTo({top:0,behavior:'smooth'});}finally{submit.textContent='Entrar al grupo';}});
};
$('#members').onclick=e=>{const expel=e.target.closest('[data-expel]');if(expel){if(!confirm('¿Expulsar a este miembro? Perderá el acceso y se eliminarán sus inscripciones, liberando sus plazas.'))return;action(async()=>{group=await api('/members/'+expel.dataset.expel,'DELETE');render();});return;}const b=e.target.closest('[data-member]');if(!b)return;if(!confirm(b.dataset.admin==='true'?'¿Nombrar administrador? Podrá cambiar el nombre, la contraseña y los permisos del grupo.':'¿Retirar los permisos de administración?'))return;action(async()=>{group=await api('/admins','PATCH',{memberId:b.dataset.member,admin:b.dataset.admin==='true'});remember();render();});};
$('#group-status').onclick=()=>{const closed=!group.closed;if(!confirm(closed?'¿Cerrar el grupo? Se conservará para consulta y se bloquearán nuevas entradas e inscripciones.':'¿Reabrir el grupo para admitir entradas e inscripciones?'))return;action(async()=>{group=await api('/status','PATCH',{closed});render();$('#settings-dialog').close();notice(closed?'Grupo cerrado.':'Grupo reabierto.');});};
$('#slug-alternatives').onclick=e=>{const b=e.target.closest('[data-slug]');if(b){$('#group-form').elements.slug.value=b.dataset.slug;notice('Enlace seleccionado. Pulsa Crear grupo para continuar.');}};
$('#delete-group').onclick=()=>{const name=prompt('Borrado definitivo: se eliminarán las quedadas, miembros y ajustes. Escribe el nombre exacto del grupo para confirmar: '+group.name);if(name===null)return;if(name!==group.name){notice('El nombre no coincide. No se ha borrado nada.');return;}action(async()=>{await api('','DELETE',{confirmName:name});delete saved[id];localStorage.setItem('quedario.groups',JSON.stringify(saved));$('#settings-dialog').close();group=null;history.replaceState(null,'','/');await route();notice('Grupo borrado por completo.');});};
function validatePasswords(form){
 const password=form.elements.password, confirmation=form.elements.passwordConfirm;
 confirmation.setCustomValidity(password.value===confirmation.value?'':'Las contraseñas no coinciden.');
 return form.reportValidity();
}
for(const form of [$('#group-form'),$('#settings-form')]){
 for(const input of [form.elements.password,form.elements.passwordConfirm]) input.addEventListener('input',()=>{
   form.elements.passwordConfirm.setCustomValidity('');
   form.elements.passwordConfirm.required=!!form.elements.password.value || false;
 });
}
const eye='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
document.querySelectorAll('input[type="password"]').forEach((input,index)=>{
 input.id ||= 'password-field-'+index;
 const wrap=document.createElement('span');wrap.className='password-field';input.before(wrap);wrap.append(input);
 const button=document.createElement('button');button.type='button';button.className='password-eye';button.innerHTML=eye;button.setAttribute('aria-controls',input.id);
 const update=()=>{const visible=input.type==='text';button.setAttribute('aria-label',visible?'Ocultar contraseña':'Mostrar contraseña');button.title=visible?'Ocultar contraseña':'Mostrar contraseña';button.setAttribute('aria-pressed',String(visible));};
 button.onclick=()=>{input.type=input.type==='password'?'text':'password';update();};wrap.append(button);update();
 input.form.addEventListener('reset',()=>{input.type='password';update();});
});
window.addEventListener('hashchange',route);route();
