export const $=(s,root=document)=>root.querySelector(s);
export const shuffle=a=>{const b=[...a];for(let i=b.length-1;i;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
export const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export const percent=(a,b)=>b?Math.round(a/b*100):0;
export const formatDate=value=>value?new Intl.DateTimeFormat('fr-FR',{dateStyle:'medium'}).format(new Date(value)):'—';
export const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
export function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200)}
export const imageFallback=e=>{e.currentTarget.src='icons/icon-192.png';e.currentTarget.alt='Image indisponible'};
