import{shuffle}from'./utils.js';import{isDue,statusOf}from'./scheduler.js';
export function filterFlashcards(signs,progress,{category='',scope='all'}={}){return signs.filter(s=>!category||s.category===category).filter(s=>{const p=progress[s.code]||{};if(scope==='difficult')return statusOf(p)==='difficult';if(scope==='due')return isDue(p);if(scope==='errors')return(p.incorrect||0)>0;return true})}
export const buildFlashDeck=signs=>shuffle(signs);
export function flashFaces(sign,type,settings){const code=settings.flashcardShowCode?`<span class="badge">${sign.officialCode||sign.code}</span>`:'';const trap=settings.flashcardShowTraps&&sign.trap?`<p><strong>Piège :</strong> ${sign.trap}</p>`:'';const confused=sign.confusedWith?.length?`<p><strong>À ne pas confondre :</strong> ${sign.confusedWith.join(', ')}</p>`:'';
  if(type==='meaning-image')return{front:`<div class="flash-text"><h2>${sign.shortMeaning||sign.name}</h2></div>`,back:`<img class="sign-image" src="${sign.image}" alt="Panneau ${sign.code}">${code}<p>${sign.category}</p>`};
  if(type==='name-image')return{front:`<div class="flash-text"><h2>${sign.officialName||sign.name}</h2></div>`,back:`<img class="sign-image" src="${sign.image}" alt="Panneau ${sign.code}">${code}<p>${sign.category}</p>`};
  return{front:`<img class="sign-image" src="${sign.image}" alt="Panneau à identifier">`,back:`<div class="flash-text"><h2>${sign.name} ${code}</h2><p>${sign.shortMeaning}</p><p class="muted">${sign.category}</p>${trap}${confused}</div>`};
}
