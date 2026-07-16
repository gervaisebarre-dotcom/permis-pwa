import{escapeHtml,percent}from'./utils.js';

export function reviewSummary(items){
  const correct=items.filter(x=>x.status==='correct').length;
  const unanswered=items.filter(x=>x.status==='unanswered').length;
  return {total:items.length,correct,incorrect:items.length-correct-unanswered,unanswered,rate:percent(correct,items.length)};
}

export function renderSessionReview({title='Session terminée',items,newHref,backHref}){
  const summary=reviewSummary(items);
  return `<section class="hero session-review-summary"><span class="eyebrow">${escapeHtml(title)}</span><h1>Score : ${summary.correct} / ${summary.total}</h1><div class="grid stats-grid"><div class="card stat"><strong>${summary.rate} %</strong><span>Taux de réussite</span></div><div class="card stat"><strong>${summary.incorrect}</strong><span>Erreurs</span></div><div class="card stat"><strong>${summary.unanswered}</strong><span>Non répondues</span></div></div></section><div class="review-filters button-row" role="group" aria-label="Filtrer le récapitulatif"><button class="button secondary" data-review-filter="all" aria-pressed="true">Toutes</button><button class="button secondary" data-review-filter="correct" aria-pressed="false">Correctes</button><button class="button secondary" data-review-filter="incorrect" aria-pressed="false">Incorrectes</button><button class="button secondary" data-review-filter="unanswered" aria-pressed="false">Non répondues</button></div><div id="session-review" class="review-list">${items.map((item,index)=>reviewCard(item,index)).join('')}</div><div class="button-row review-actions"><button id="retry-review-errors" class="button" ${summary.incorrect?'':'disabled'}>Refaire uniquement les erreurs</button><button id="review-details" class="button secondary">Revoir les fiches</button><a class="button secondary" href="${escapeHtml(newHref)}">Nouvelle session</a><a class="button secondary" href="${escapeHtml(backHref)}">Retour au module</a></div>`;
}

function reviewCard(item,index){
  const statusLabel=item.status==='correct'?'Correcte':item.status==='incorrect'?'Incorrecte':'Non répondue';
  return `<article class="card review-card" data-review-status="${item.status}" data-review-id="${escapeHtml(item.id||'')}"><div class="review-card-head"><span class="badge">${index+1}</span><span>${escapeHtml(item.module)} · ${escapeHtml(item.type)}</span><strong class="review-status ${item.status}">${statusLabel}</strong></div>${item.image?`<img class="review-image" src="${escapeHtml(item.image)}" alt="">`:''}<h2>${escapeHtml(item.question)}</h2><dl class="review-answers"><div><dt>Votre réponse</dt><dd>${escapeHtml(item.selectedLabel||'Non répondue')}</dd></div><div><dt>Bonne réponse</dt><dd>${escapeHtml(item.correctLabel||'—')}</dd></div></dl>${item.explanation?`<p class="feedback">${escapeHtml(item.explanation)}</p>`:''}${item.detailHref?`<a class="detail-link" href="${escapeHtml(item.detailHref)}">Voir la fiche détaillée</a>`:''}</article>`;
}

export function bindSessionReview(root,{onRetry,onDetails}={}){
  root.querySelectorAll('[data-review-filter]').forEach(button=>button.onclick=()=>{
    root.querySelectorAll('[data-review-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===button)));
    root.querySelectorAll('[data-review-status]').forEach(card=>card.hidden=button.dataset.reviewFilter!=='all'&&card.dataset.reviewStatus!==button.dataset.reviewFilter);
  });
  const retry=root.querySelector('#retry-review-errors');if(retry)retry.onclick=()=>onRetry?.();
  const details=root.querySelector('#review-details');if(details)details.onclick=()=>onDetails?.();
}
