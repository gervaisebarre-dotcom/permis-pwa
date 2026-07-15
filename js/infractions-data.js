let cache=[];
const numberOrNull=value=>value===null||value===''||Number.isNaN(Number(value))?null:Number(value);
export function normalizeInfraction(raw){return{
  ...raw,id:String(raw.id),name:String(raw.name||''),shortName:String(raw.shortName||raw.name||''),category:String(raw.category||'Autres'),subcategory:String(raw.subcategory||''),type:String(raw.type||''),
  contraventionClass:numberOrNull(raw.contraventionClass),pointsLost:Number(raw.pointsLost)||0,fineFixed:numberOrNull(raw.fineFixed),fineReduced:numberOrNull(raw.fineReduced),fineIncreased:numberOrNull(raw.fineIncreased),fineMaximum:numberOrNull(raw.fineMaximum),
  possibleSuspension:Boolean(raw.possibleSuspension),possibleCancellation:Boolean(raw.possibleCancellation),possibleVehicleImmobilization:Boolean(raw.possibleVehicleImmobilization),possibleVehicleConfiscation:Boolean(raw.possibleVehicleConfiscation),possiblePrison:Boolean(raw.possiblePrison),
  active:Boolean(raw.active)&&raw.validation==='Approuvé',verifiedAt:String(raw.verifiedAt||''),legalReference:String(raw.legalReference||''),officialSource:String(raw.officialSource||'')
}}
export async function loadInfractions(){const response=await fetch('./data/infractions_code.json');if(!response.ok)throw new Error(`Infractions indisponibles (${response.status})`);cache=(await response.json()).map(normalizeInfraction);return cache}
export const infractions=()=>cache;
export const activeInfractions=(settings={})=>cache.filter(x=>x.active&&(!settings.categories?.length||settings.categories.includes(x.category)));
export const infractionCategories=()=>[...new Set(cache.filter(x=>x.active).map(x=>x.category))].sort((a,b)=>a.localeCompare(b,'fr'));
