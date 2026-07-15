import{shuffle}from'./utils.js';
const unique=values=>[...new Set(values)];
const sample=(values,count=3)=>shuffle(unique(values)).slice(0,count);
const optionObjects=(correct,wrong)=>shuffle([correct,...sample(wrong.filter(x=>x!==correct),3)]).map(value=>({value:String(value),label:String(value)}));
export function availableQuestionTypes(item){return['points',item.fineFixed!=null&&'fine','type',item.contraventionClass!=null&&'class','hasPoints','sanction'].filter(Boolean)}
export function buildInfractionQuestion(item,pool,forcedType=null){const candidates=availableQuestionTypes(item),type=candidates.includes(forcedType)?forcedType:shuffle(candidates)[0];let prompt,answer,options;
  if(type==='points'){prompt=`${item.name} : combien de points sont retirés ?`;answer=String(item.pointsLost);options=optionObjects(answer,[0,1,2,3,4,6].map(String))}
  if(type==='fine'){prompt=`Quel est le montant de l’amende forfaitaire pour « ${item.shortName} » ?`;answer=String(item.fineFixed);options=optionObjects(answer,unique(pool.map(x=>x.fineFixed).filter(x=>x!=null)).map(String));options.forEach(x=>x.label=`${x.label} €`)}
  if(type==='type'){prompt=`« ${item.shortName} » est-il une contravention ou un délit ?`;answer=item.type;options=optionObjects(answer,['Contravention','Délit'])}
  if(type==='class'){prompt=`Quelle est la classe de contravention de « ${item.shortName} » ?`;answer=String(item.contraventionClass);options=optionObjects(answer,[1,2,3,4,5].map(String));options.forEach(x=>x.label=`${x.label}e classe`)}
  if(type==='hasPoints'){prompt=`« ${item.shortName} » entraîne-t-il un retrait de points ?`;answer=item.pointsLost>0?'Oui':'Non';options=optionObjects(answer,['Oui','Non'])}
  if(type==='sanction'){const sanction=`${item.pointsLost} point(s)${item.fineFixed!=null?` et ${item.fineFixed} € d’amende forfaitaire`:''}`;prompt=`Quelle infraction correspond à cette sanction : ${sanction} ?`;answer=item.id;options=optionObjects(answer,pool.filter(x=>x.id!==item.id&&x.category===item.category).concat(pool).map(x=>x.id));options.forEach(x=>x.label=pool.find(i=>i.id===x.value)?.shortName||item.shortName)}
  return{id:`${item.id}:${type}`,item,type,prompt,answer,options,answered:null}
}
export function buildInfractionQuiz(pool,length,types=[]){const eligible=pool.filter(item=>availableQuestionTypes(item).some(x=>!types.length||types.includes(x))),selected=shuffle(eligible).slice(0,Math.min(length,eligible.length));return selected.map(item=>buildInfractionQuestion(item,pool,shuffle(availableQuestionTypes(item).filter(x=>!types.length||types.includes(x)))[0]))}
export function infractionFlashFaces(item,type,pool,settings={}){const money=[['Forfaitaire',item.fineFixed],['Minorée',item.fineReduced],['Majorée',item.fineIncreased],['Maximum tribunal',item.fineMaximum]].filter(([,v])=>v!=null).map(([l,v])=>`<li>${l} : ${v} €</li>`).join('');const sanctions=`<strong>${item.pointsLost} point(s)</strong><p>${item.type}${item.contraventionClass?` · ${item.contraventionClass}e classe`:''}</p>${money?`<ul>${money}</ul>`:''}${settings.includeComplementary&&item.complementaryPenalties?`<p><strong>Sanction possible :</strong> ${item.complementaryPenalties}</p>`:''}<p>${item.shortExplanation}</p>${settings.showLegalReferences?`<p class="muted">${item.legalReference}</p>`:''}`;
  if(type==='sanction-infraction'){const same=pool.filter(x=>x.pointsLost===item.pointsLost&&x.fineFixed===item.fineFixed);return{front:`<h2>${item.pointsLost} point(s)</h2><p>${item.fineFixed!=null?`${item.fineFixed} € d’amende forfaitaire`:item.type}</p>`,back:`<h2>${item.name}</h2><p>${item.shortExplanation}</p>${same.length>1?`<p class="muted">Plusieurs infractions partagent cette combinaison (${same.length}).</p>`:''}`}}
  if(type==='points-infractions'){const same=pool.filter(x=>x.pointsLost===item.pointsLost);return{front:`<h2>Quelles infractions entraînent un retrait de ${item.pointsLost} point(s) ?</h2>`,back:`<ul>${same.map(x=>`<li>${x.shortName}</li>`).join('')}</ul>`}}
  if(type==='situation-consequences')return{front:`<h2>${item.shortExplanation||item.name}</h2>`,back:`<h2>${item.name}</h2>${sanctions}`};
  return{front:`<h2>${item.name}</h2>`,back:sanctions}
}
