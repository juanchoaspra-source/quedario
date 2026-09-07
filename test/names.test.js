import test from 'node:test';
import assert from 'node:assert/strict';
import { Names,slugify } from '../src/names.js';
test('enlaces normalizados, colisiones, alternativas y liberación con propietario correcto',async()=>{
 const map=new Map();const names=new Names({storage:{get:async k=>map.get(k),put:async(k,v)=>map.set(k,v),delete:async k=>map.delete(k)},blockConcurrencyWhile:fn=>fn()});
 const call=async(path,body)=>{const r=await names.fetch(new Request('https://names'+path,{method:'POST',body:JSON.stringify(body)}));return {status:r.status,data:await r.json()};};
 assert.equal(slugify('Peña del Café'),'pena-del-cafe');
 assert.equal((await call('/claim',{slug:'Peña del Café',id:'a'})).data.slug,'pena-del-cafe');
 const collision=await call('/claim',{slug:'pena-del-cafe',id:'b'});
 assert.equal(collision.status,409);assert.ok(collision.data.alternatives.includes('pena-del-cafe-2'));
 await call('/release',{slug:'pena-del-cafe',id:'b'});
 assert.equal((await call('/resolve',{slug:'pena-del-cafe'})).data.id,'a');
 await call('/release',{slug:'pena-del-cafe',id:'a'});
 assert.equal((await call('/resolve',{slug:'pena-del-cafe'})).status,404);
 assert.equal((await call('/claim',{slug:'pena-del-cafe',id:'b'})).status,200);
});
