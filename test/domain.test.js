import test from 'node:test';
import assert from 'node:assert/strict';
import {eventInput,enroll,publicGroup} from '../src/domain.js';
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
