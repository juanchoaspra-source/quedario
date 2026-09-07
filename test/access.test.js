import test from 'node:test';
import assert from 'node:assert/strict';
import { Group } from '../src/worker.js';
test('migra el grupo existente, protege datos, administra permisos y revoca contraseñas', async () => {
 const owner=crypto.randomUUID(), guest=crypto.randomUUID(), stranger=crypto.randomUUID();
 const map=new Map([['group',{name:'Grupo existente',owner,events:[]}]]);
 const instance=new Group({storage:{get:async k=>structuredClone(map.get(k)),put:async(k,v)=>map.set(k,structuredClone(v))},blockConcurrencyWhile:fn=>fn()});
 async function req(token,path='',method='GET',body){const r=await instance.fetch(new Request('https://example.com/api/groups/'+crypto.randomUUID()+path,{method,headers:{'X-Participant':token},...(body?{body:JSON.stringify(body)}:{})}));return {status:r.status,data:await r.json()};}
 assert.equal((await req(owner)).data.owner,true);
 assert.equal((await req(guest,'/settings','PATCH',{name:'Ataque'})).status,403);
 assert.equal((await req(owner,'/settings','PATCH',{name:'Amigos',password:'Clave inicial 123'})).status,200);
 const denied=await req(stranger);assert.equal(denied.status,401);assert.equal(denied.data.name,undefined);assert.equal(denied.data.members,undefined);
 assert.equal((await req(guest,'/unlock','POST',{name:'Bea',password:'Incorrecta'})).status,401);
 const unlocked=await req(guest,'/unlock','POST',{name:'Bea',password:'Clave inicial 123'});
 assert.equal(unlocked.status,200);assert.equal(unlocked.data.members.length,2);assert.equal(JSON.stringify(unlocked.data).includes(owner),false);
 const member=unlocked.data.members.find(m=>m.mine);
 assert.equal((await req(guest,'/admins','PATCH',{memberId:member.id,admin:true})).status,403);
 assert.equal((await req(owner,'/admins','PATCH',{memberId:member.id,admin:true})).status,200);
 assert.equal((await req(guest,'/settings','PATCH',{name:'Nuevo nombre',password:'Nueva clave 456'})).status,200);
 assert.equal((await req(owner,'/admins','PATCH',{memberId:member.id,admin:false})).status,200);
 assert.equal((await req(guest)).status,401);
 assert.equal((await req(guest,'/unlock','POST',{name:'Bea',password:'Clave inicial 123'})).status,401);
 assert.equal((await req(guest,'/unlock','POST',{name:'Bea',password:'Nueva clave 456'})).status,200);
 const mine=(await req(owner)).data.members.find(m=>m.mine);
 assert.equal((await req(owner,'/admins','PATCH',{memberId:mine.id,admin:false})).status,400);
 assert.equal(map.get('group').events.length,0);
 assert.equal(map.get('group').password.hash.includes('Nueva clave'),false);
});
