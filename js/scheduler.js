export const INTERVALS=[0,1,3,7,14,30,60];
export function blankProgress(){return{seen:0,correct:0,incorrect:0,streak:0,level:0,lastReviewed:null,nextReview:null,intervalDays:0,status:'new',lastAnswer:null,lastError:null}}
export function review(previous,rating,now=new Date()){
  const p={...blankProgress(),...previous}, wrong=rating==='again'||rating==='wrong';p.seen++;p.lastReviewed=now.toISOString();p.lastAnswer=wrong?'incorrect':'correct';
  if(wrong){p.incorrect++;p.streak=0;p.level=0;p.intervalDays=1;p.lastError=p.lastReviewed;p.status='review'}
  else{p.correct++;p.streak++;const step=rating==='hard'?Math.max(1,p.level):rating==='easy'?Math.min(INTERVALS.length-1,p.level+2):Math.min(INTERVALS.length-1,p.level+1);p.level=step;p.intervalDays=rating==='hard'?1:INTERVALS[step];p.status=p.intervalDays>=14&&p.streak>=3?'mastered':'learning'}
  const next=new Date(now);next.setDate(next.getDate()+p.intervalDays);p.nextReview=next.toISOString();return p;
}
export const isDue=(p,now=new Date())=>Boolean(p?.nextReview)&&new Date(p.nextReview)<=now;
export const statusOf=p=>!p?.seen?'new':p.status==='mastered'?'mastered':isDue(p)?'due':p.incorrect>p.correct?'difficult':'learning';
