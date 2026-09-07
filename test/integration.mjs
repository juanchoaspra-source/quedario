// Ejecutar con Wrangler activo: node test/integration.mjs
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:8787', id=crypto.randomUUID(), owner=crypto.randomUUID(), guest=crypto.randomUUID();
async function request(path,method='GET',body,token=owner){const response=await fetch(`${origin}/api/groups/${id}${path}`,{method,headers:{Origin:origin,'X-Participant':token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return {status:response.status,data:await response.json()};}
const name='Prueba '+id;
const created=await request('','POST',{name,password:'Prueba segura 123'});
assert.equal(created.status,200);
assert.equal((await fetch(origin+'/'+created.data.slug)).status,200);
assert.equal((await request('/unlock','POST',{name:'Bea',password:'Prueba segura 123'},guest)).status,200);
let result=await request('/events','POST',{title:'Cena',place:'Centro',category:'cena',capacity:1,date:'2099-01-01'});
const event=result.data.events[0].id;
assert.equal((await request('/events','POST',{title:'No autorizado'},guest)).status,403);
await Promise.all([request(`/events/${event}/participants`,'POST',{name:'Ana'}),request(`/events/${event}/participants`,'POST',{name:'Bea'},guest)]);
result=await request('');
assert.equal(result.data.events[0].participants.filter(p=>p.waiting).length,1);
assert.equal(result.data.events[0].participants.filter(p=>!p.waiting).length,1);
assert.equal(JSON.stringify(result.data).includes(owner),false);
assert.equal((await request(`/events/${event}`,'DELETE',undefined,guest)).status,403);
await request(`/events/${event}/participants`,'DELETE');
result=await request('','GET',undefined,guest);
assert.equal(result.data.events[0].participants[0].waiting,false);
assert.equal(result.data.events[0].participants[0].mine,true);
await request(`/events/${event}`,'DELETE');
assert.equal((await request('')).data.events.length,0);
assert.equal((await fetch(origin)).status,200);
assert.equal((await request('','DELETE',{confirmName:name})).status,200);
assert.equal((await request('')).status,410);
assert.equal((await fetch(origin+'/api/resolve/'+created.data.slug)).status,404);
console.log('Integración correcta: persistencia, concurrencia, permisos, espera, promoción, cancelación y página inicial.');
