let cache=[];
export async function loadSigns(){
  const response=await fetch('./data/panneaux_code.json');if(!response.ok)throw new Error(`Données indisponibles (${response.status})`);const raw=await response.json();
  cache=raw.map(x=>({...x,image:String(x.image||`./assets/png/${x.code}.png`).replace(/^\.\.\/assets\//,'./assets/'),confusedWith:Array.isArray(x.confusedWith)?x.confusedWith:[],active:x.active===true}));return cache;
}
export const signs=()=>cache;
export const activeSigns=settings=>cache.filter(x=>x.active||(settings.includeIncomplete&&['Incomplet','À vérifier'].includes(x.validation)&&x.name&&!x.name.startsWith('Intitulé à vérifier')&&x.shortMeaning&&!x.shortMeaning.startsWith('Intitulé à vérifier'))).filter(x=>!settings.categories?.length||settings.categories.includes(x.category));
export const categories=()=>[...new Set(cache.map(x=>x.category))].sort((a,b)=>a.localeCompare(b,'fr'));
