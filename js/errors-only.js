import{$,escapeHtml,percent,shuffle,toast}from'./utils.js';
import{route}from'./router.js';
import{activeSigns}from'./data.js';
import{activeInfractions}from'./infractions-data.js';
import{getProgress,saveProgress,getSettings}from'./storage.js';
import{getInfractionProgress,saveInfractionProgress,getInfractionSettings}from'./infractions-storage.js';
import{blankProgress,isDue,review}from'./scheduler.js';
import{makeOptions}from'./quiz.js';
import{buildInfractionQuestion,infractionFlashFaces}from'./infractions-engine.js';
import{flashFaces}from'./flashcards.js';
import{answerButtons,selectAnswer,revealAnswer}from'./answer-ui.js';
import{renderSessionReview,bindSessionReview}from'./session-review.js';

const progressOf=(map,id)=>({...blankProgress(),...(map[id]||{})});
const successRate=p=>p.seen?Number(p.correct||0)/Number(p.seen):0;

export function isErrorProgress(progress,{includeCorrected=false}={}){
  return Number(progress?.incorrect||0)>0&&(includeCorrected||Number(progress?.streak||0)<2||progress?.lastAnswer==='incorrect');
}

export function rankErrors(items,shuffleItems=false){
  if(shuffleItems)return shuffle(items);
  return [...items].sort((a,b)=>String(b.progress.lastError||'').localeCompare(String(a.progress.lastError||''))||Number(b.progress.incorrect||0)-Number(a.progress.incorrect||0)||successRate(a.progress)-successRate(b.progress)||Number(isDue(b.progress))-Number(isDue(a.progress)));
}

export function combineErrors(panels,infractions,{content='both',strategy='balanced'}={}){
  if(content==='panels')return panels;
  if(content==='infractions')return infractions;
  if(strategy==='count')return rankErrors([...panels,...infractions]);
  const result=[],left=[...panels],right=[...infractions];
  while(left.length||right.length){if(left.length)result.push(left.shift());if(right.length)result.push(right.shift())}
  return result;
}

export function registerErrorsOnlyRoutes(){
  let session=null;
  route('errors-only',renderConfig);

  function pools(includeCorrected=false,random=false){
    const panelProgress=getProgress(),infProgress=getInfractionProgress();
    const panels=rankErrors(activeSigns(getSettings()).filter(x=>x.name&&x.shortMeaning).map(item=>({kind:'panel',id:item.code,item,progress:progressOf(panelProgress,item.code)})).filter(x=>isErrorProgress(x.progress,{includeCorrected})),random);
    const infractions=rankErrors(activeInfractions(getInfractionSettings()).map(item=>({kind:'infraction',id:item.id,item,progress:progressOf(infProgress,item.id)})).filter(x=>isErrorProgress(x.progress,{includeCorrected})),random);
    return{panels,infractions};
  }

  function renderConfig(){const {panels,infractions}=pools(true);app().innerHTML=`<span class="eyebrow">Révision ciblée</span><h1>Uniquement mes erreurs</h1><div class="grid stats-grid"><div class="card stat"><strong>${panels.length}</strong><span>erreurs Panneaux</span></div><div class="card stat"><strong>${infractions.length}</strong><span>erreurs Infractions</span></div><div class="card stat"><strong>${panels.length+infractions.length}</strong><span>erreurs au total</span></div></div><form id="errors-only-form" class="card form-grid two"><label class="field">Type de contenu<select name="content"><option value="panels">Panneaux uniquement</option><option value="infractions">Infractions uniquement</option><option value="both" selected>Panneaux + Infractions</option></select></label><label class="field">Format<select name="format"><option value="flashcards">Flashcards</option><option value="quiz" selected>Quiz</option><option value="exam">Examen</option></select></label><label class="field">Nombre d’éléments<select name="length"><option value="10">10</option><option value="20">20</option><option value="40">40</option><option value="all">Tous les éléments disponibles</option></select></label><label class="field">Composition mixte<select name="strategy"><option value="balanced">Équilibré</option><option value="count">Priorité aux erreurs les plus nombreuses</option><option value="50">50 % panneaux / 50 % infractions</option></select></label><label class="check"><input name="shuffle" type="checkbox"> Mélanger les erreurs</label><label class="check"><input name="includeCorrected" type="checkbox"> Inclure les erreurs déjà corrigées récemment</label><div id="errors-only-estimate" class="callout"></div><button class="button block" type="submit">Lancer la série</button></form>`;const form=$('#errors-only-form'),estimate=()=>{const selected=selectFromForm(form,false),wanted=form.length.value==='all'?selected.length:Number(form.length.value);$('#errors-only-estimate').textContent=`${selected.length} erreur${selected.length>1?'s':''} disponible${selected.length>1?'s':''}. La session contiendra ${Math.min(wanted,selected.length)} élément${Math.min(wanted,selected.length)>1?'s':''}.`};form.oninput=estimate;estimate();form.onsubmit=e=>{e.preventDefault();const selected=selectFromForm(form,true);if(!selected.length){renderEmpty(form.content.value);return}const requested=form.length.value==='all'?selected.length:Number(form.length.value);const cards=selected.slice(0,Math.min(requested,selected.length));if(cards.length<requested)toast(`${cards.length} erreur(s) disponible(s) : toutes seront utilisées`);start(cards,form.format.value)}}

  function selectFromForm(form,applyShuffle){const includeCorrected=form.includeCorrected.checked,{panels,infractions}=pools(includeCorrected,applyShuffle&&form.shuffle.checked);if(form.content.value!=='both')return form.content.value==='panels'?panels:infractions;if(form.strategy.value==='50')return combineErrors(panels,infractions,{strategy:'balanced'});return combineErrors(panels,infractions,{strategy:form.strategy.value})}

  function renderEmpty(content){const panel=content!=='infractions';app().innerHTML=`<section class="empty"><h1>Aucune erreur à réviser pour le moment.</h1><p>Continuez à vous entraîner : les prochaines erreurs apparaîtront automatiquement ici.</p><div class="button-row"><a class="button" href="${panel?'#/quiz':'#/inf-quiz'}">Quiz</a><a class="button secondary" href="${panel?'#/exam':'#/inf-exam'}">Examen</a><a class="button secondary" href="${panel?'#/learn':'#/inf-learn'}">Apprentissage</a></div></section>`}

  function start(cards,format){session={cards,index:0,format,flipped:false,correct:0,questions:format==='flashcards'?[]:cards.map(createQuestion)};if(format==='flashcards')renderFlash();else renderQuestion()}
  function createQuestion(entry){if(entry.kind==='panel'){const options=makeOptions(entry.item,activeSigns(getSettings()));return{...entry,sourceId:entry.id,type:'Image → signification',prompt:'Que signifie ce panneau ?',answer:entry.item.code,options:options.map(x=>({value:x.code,label:x.name})),answered:null,validated:false}}return{...entry,...buildInfractionQuestion(entry.item,activeInfractions(getInfractionSettings())),sourceId:entry.id}}
  function persist(entry,rating){const id=entry.sourceId||entry.id;if(entry.kind==='panel'){const map=getProgress();map[id]=review(progressOf(map,id),rating);saveProgress(map)}else{const map=getInfractionProgress();map[id]=review(progressOf(map,id),rating);saveInfractionProgress(map)}}

  function renderFlash(){if(session.index>=session.cards.length){finishFlash();return}const entry=session.cards[session.index],faces=entry.kind==='panel'?flashFaces(entry.item,'image-meaning',getSettings()):infractionFlashFaces(entry.item,'infraction-sanctions',activeInfractions(getInfractionSettings()),getInfractionSettings());app().innerHTML=`<div class="session-head"><span>Erreur ${session.index+1} / ${session.cards.length}</span><span>${entry.kind==='panel'?'Panneau':'Infraction'}</span></div><div class="flash-stage"><div class="flash-card ${session.flipped?'flipped':''}"><section class="flash-face flash-front">${faces.front}</section><section class="flash-face flash-back">${faces.back}</section></div></div><button id="error-flip" class="button block">${session.flipped?'Revoir la question':'Retourner'}</button><div class="rating ${session.flipped?'':'hidden'}">${[['again','À revoir'],['hard','Difficile'],['correct','Correct'],['easy','Facile']].map(([v,l])=>`<button class="button secondary" data-error-rating="${v}">${l}</button>`).join('')}</div>`;$('#error-flip').onclick=()=>{session.flipped=!session.flipped;renderFlash()};document.querySelectorAll('[data-error-rating]').forEach(button=>button.onclick=()=>{persist(entry,button.dataset.errorRating);session.index++;session.flipped=false;renderFlash()})}
  function finishFlash(){const corrected=session.cards.filter(x=>{const map=x.kind==='panel'?getProgress():getInfractionProgress();return!isErrorProgress(progressOf(map,x.id))}).length;app().innerHTML=`<section class="empty"><span class="eyebrow">Flashcards terminées</span><h1>${session.cards.length} erreurs révisées</h1><p>${corrected} corrigée(s) · ${session.cards.length-corrected} encore à revoir</p><a class="button" href="#/errors-only">Nouvelle série</a></section>`}

  function renderQuestion(){if(session.index>=session.questions.length){finishQuestions();return}const q=session.questions[session.index],exam=session.format==='exam';app().innerHTML=`<div class="session-head"><span>${q.kind==='panel'?'Panneau':'Infraction'} · Question ${session.index+1} / ${session.questions.length}</span><span>${exam?`${session.index} réponse(s) enregistrée(s)`:`${session.correct} juste(s)`}</span></div><section class="card">${q.kind==='panel'?`<img class="sign-image" src="${q.item.image}" alt="Panneau ${escapeHtml(q.item.code)}">`:''}<h2>${escapeHtml(q.prompt)}</h2><div id="error-answers" class="answers">${answerButtons(q.options,{selected:q.answered,exam})}</div><div id="error-feedback"></div>${exam?'':`<button id="error-validate" class="button block" ${q.answered==null?'disabled':''}>Valider</button>`}<button id="error-next" class="button block ${exam?'':'hidden'}" ${exam&&q.answered==null?'disabled':''}>${session.index===session.questions.length-1?'Terminer':'Suivant'}</button></section>`;const answers=$('#error-answers');answers.onclick=e=>{const button=e.target.closest('[data-answer-value]');if(!button||q.validated)return;q.answered=selectAnswer(answers,button,{exam});(exam?$('#error-next'):$('#error-validate')).disabled=false};if(!exam)$('#error-validate').onclick=()=>{q.validated=true;const ok=String(q.answered)===String(q.answer);if(ok)session.correct++;persist(q,ok?'correct':'wrong');revealAnswer(answers,{selected:q.answered,correct:q.answer});$('#error-feedback').innerHTML=`<div class="feedback"><strong>${ok?'Bonne réponse':'À revoir'}</strong><p>${escapeHtml(q.kind==='panel'?q.item.shortMeaning:q.item.shortExplanation)}</p></div>`;$('#error-validate').classList.add('hidden');$('#error-next').classList.remove('hidden')};$('#error-next').onclick=()=>{if(q.answered==null)return;if(exam&&String(q.answered)===String(q.answer))session.correct++;session.index++;renderQuestion()}}

  function finishQuestions(){if(session.format==='exam')session.questions.forEach(q=>persist(q,String(q.answered)===String(q.answer)?'correct':'wrong'));const items=session.questions.map(q=>({id:q.sourceId||q.id,module:q.kind==='panel'?'Panneau':'Infraction',type:q.type||'Révision des erreurs',question:q.prompt,image:q.kind==='panel'?q.item.image:'',selectedLabel:q.options.find(x=>String(x.value)===String(q.answered))?.label||'',correctLabel:q.options.find(x=>String(x.value)===String(q.answer))?.label||'',status:q.answered==null?'unanswered':String(q.answered)===String(q.answer)?'correct':'incorrect',explanation:q.kind==='panel'?q.item.shortMeaning:q.item.shortExplanation,detailHref:q.kind==='panel'?'#/gallery':'#/inf-library'}));const remaining=session.questions.filter(q=>{const id=q.sourceId||q.id,map=q.kind==='panel'?getProgress():getInfractionProgress();return isErrorProgress(progressOf(map,id))});app().innerHTML=renderSessionReview({title:session.format==='exam'?'Examen des erreurs terminé':'Quiz des erreurs terminé',items,newHref:'#/errors-only',backHref:'#/home'});app().insertAdjacentHTML('afterbegin',`<div class="card error-session-stats"><strong>${session.correct} / ${session.questions.length}</strong> · ${percent(session.correct,session.questions.length)} % · ${session.questions.length-remaining.length} corrigée(s) · ${remaining.length} encore à revoir</div>`);bindSessionReview(app(),{onRetry:()=>{if(!remaining.length){renderEmpty('both');return}start(remaining,session.format)},onDetails:()=>location.hash='#/errors-only'})}
}

const app=()=>$('#app');
