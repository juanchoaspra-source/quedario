export function slugify(name) {
  const slug = String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0,60).replace(/-$/,'');
  return slug && !['api','favicon','robots','index','assets'].includes(slug) ? slug : 'grupo';
}
export class Names {
  constructor(ctx) { this.ctx=ctx; }
  async fetch(request) {
    return this.ctx.blockConcurrencyWhile(async()=>{
      const body=await request.json();
      const slug=slugify(body.slug);
      const current=await this.ctx.storage.get(slug);
      const action=new URL(request.url).pathname;
      if(action==='/resolve')return Response.json(current ? {id:current} : {error:'Este grupo no existe o ha sido borrado.'},{status:current?200:404});
      if(action==='/release') {if(current===body.id)await this.ctx.storage.delete(slug);return Response.json({ok:true});}
      if(!current || current===body.id){await this.ctx.storage.put(slug,body.id);return Response.json({slug});}
      const alternatives=[];
      for(let n=2;n<1000 && alternatives.length<4;n++){const candidate=`${slug.slice(0,50)}-${n}`;if(!await this.ctx.storage.get(candidate))alternatives.push(candidate);}
      return Response.json({error:'Ese enlace ya está ocupado. Escoge una alternativa.',alternatives},{status:409});
    });
  }
}
export const namesRequest=(env,path,body)=>env.NAMES.get(env.NAMES.idFromName('directory')).fetch(new Request('https://names'+path,{method:'POST',body:JSON.stringify(body)}));
