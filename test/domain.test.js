import test from 'node:test';
import assert from 'node:assert/strict';
import {addComment,eventInput,enroll,publicGroup} from '../src/domain.js';
import {ensureMember} from '../src/access.js';
test('aforo, espera por orden, duplicados y promoción al darse de baja',()=>{
 const event=eventInput({title:'Cena',place:'Centro',date:'2099-01-01',capacity:1,category:'cena'});
 enroll(event,'a','Ana');enroll(event,'b','Bea');enroll(event,'b','Bea');
 const group={name:'Amigos',owner:'secret',events:[event]};
 assert.equal(event.participants.length,2);
 assert.equal(publicGroup(group,'b').events[0].participants[1].waiting,true);
 assert.equal(JSON.stringify(publicGroup(group,'b')).includes('secret'),false);
 assert.equal(publicGroup(group,'b').events[0].participants[1].token,undefined);
 event.participants=event.participants.filter(participant=>participant.token!=='a');
 assert.equal(publicGroup(group,'b').events[0].participants[0].waiting,false);
});
test('rechaza fechas pasadas, nombres vacíos y aforos inválidos',()=>{
 for(const capacity of [0,501,1.5])assert.throws(()=>eventInput({title:'Cena',place:'Bar',date:'2099-01-01',capacity}));
 assert.throws(()=>eventInput({title:'Cena',place:'Bar',date:'2000-01-01',capacity:3}));
 assert.throws(()=>eventInput({title:' ',place:'Bar',date:'2099-01-01',capacity:3}));
});
test('guarda una ubicación exacta válida y rechaza coordenadas inválidas',()=>{
 const event=eventInput({title:'Paseo',place:'Puerta del Sol',date:'2099-01-01',capacity:8,location:{latitude:40.416775,longitude:-3.70379}});
 assert.deepEqual(event.location,{latitude:40.416775,longitude:-3.70379});
 assert.throws(()=>eventInput({title:'Paseo',place:'Centro',date:'2099-01-01',capacity:8,location:{latitude:91,longitude:0}}));
 assert.throws(()=>eventInput({title:'Paseo',place:'Centro',date:'2099-01-01',capacity:8,location:{latitude:40,longitude:'fuera'}}));
});
test('rutas, fiestas y viajes guardan fecha de inicio y fin',()=>{
 const trip=eventInput({title:'Escapada',place:'Asturias',date:'2099-04-10T09:00',endDate:'2099-04-13T18:00',capacity:8,category:'viaje',detail:'Asturias'});
 assert.equal(trip.endDate,new Date('2099-04-13T18:00').toISOString());
 const dayRoute=eventInput({title:'Ruta corta',place:'Sierra',date:'2099-04-10T09:00',capacity:8,category:'ruta'});
 assert.equal(dayRoute.endDate,dayRoute.date);
 const dinner=eventInput({title:'Cena',place:'Centro',date:'2099-04-10T20:00',endDate:'2099-04-12T20:00',capacity:8,category:'cena'});
 assert.equal(dinner.endDate,undefined);
 assert.throws(()=>eventInput({title:'Fiestas',place:'Pueblo',date:'2099-04-10T09:00',endDate:'2099-04-09T09:00',capacity:8,category:'fiestas',detail:'San Juan'}));
});
test('acepta enlaces de Google Maps y rechaza otros enlaces como ubicación',()=>{
 const event=eventInput({title:'Cena',place:'Centro',date:'2099-01-01',capacity:8,mapUrl:'https://maps.app.goo.gl/ejemplo'});
 assert.equal(event.mapUrl,'https://maps.app.goo.gl/ejemplo');
 assert.throws(()=>eventInput({title:'Cena',place:'Centro',date:'2099-01-01',capacity:8,mapUrl:'https://example.com/lugar'}));
});
test('acepta las actividades deportivas, culturales y de ocio',()=>{
 for (const category of ['padel','correr','futbol','gimnasio','bici','senderismo','yoga','juegos','compras','museo','baile','brunch','playa']) {
  const event=eventInput({title:'Plan deportivo',place:'Polideportivo',date:'2099-01-01',capacity:8,category});
  assert.equal(event.category,category);
 }
});
test('guarda un cartel WebP reducido y rechaza formatos o tamaños no seguros',()=>{
 const image='data:image/webp;base64,' + 'a'.repeat(100);
 assert.equal(eventInput({title:'Película',place:'Cine',date:'2099-01-01',capacity:8,image}).image,image);
 assert.throws(()=>eventInput({title:'Película',place:'Cine',date:'2099-01-01',capacity:8,image:'data:image/png;base64,abc'}));
 assert.throws(()=>eventInput({title:'Película',place:'Cine',date:'2099-01-01',capacity:8,image:'data:image/webp;base64,' + 'a'.repeat(180001)}));
});
test('guarda comentarios y oculta la identidad interna de quien comenta',()=>{
 const event=eventInput({title:'Cena',place:'Centro',date:'2099-01-01',capacity:4});
 addComment(event,'token-secreto','Ana','He reservado mesa para cuatro.');
 const group={name:'Amigos',owner:'otro-token',events:[event]};
 const comment=publicGroup(group,'token-secreto').events[0].comments[0];
 assert.equal(comment.name,'Ana');
 assert.equal(comment.text,'He reservado mesa para cuatro.');
 assert.equal(comment.mine,true);
 assert.equal(comment.token,undefined);
 assert.throws(()=>addComment(event,'otro','Bea',' '));
});
test('aplica el límite del grupo en una única admisión y no filtra al creador del plan',()=>{
 const owner=crypto.randomUUID(), guest=crypto.randomUUID();
 const event=eventInput({title:'Cena',place:'Centro',date:'2099-01-01',capacity:4});
 event.creatorToken=guest;
 const group={name:'Amigos',owner,admins:[owner],members:[{id:crypto.randomUUID(),token:owner,name:'Ana'}],events:[event]};
 assert.equal(publicGroup(group,guest).events[0].canCancel,true);
 assert.equal(JSON.stringify(publicGroup(group,guest)).includes(guest),false);
 group.members=Array.from({length:2000},(_,index)=>({id:String(index),token:`member-${index}`,name:'Miembro'}));
 assert.throws(()=>ensureMember(group,guest,'Bea'),/límite de miembros/);
});
