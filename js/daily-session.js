export const DAILY_TARGET=40;

export function localDay(date=new Date()){
  const pad=value=>String(value).padStart(2,'0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}

export function createDailySession({dueIds=[],newIds=[],previous=null,target=DAILY_TARGET,today=localDay()}={}){
  if(previous?.date===today&&previous?.version===1)return normalizeDailySession(previous);
  const selected=[...new Set([...dueIds,...newIds])].slice(0,target);
  return {version:1,date:today,target,selectedIds:selected,dueIds:[...new Set(dueIds)].filter(id=>selected.includes(id)),newIds:[...new Set(newIds)].filter(id=>selected.includes(id)),completedIds:[],remainingIds:[...selected],repeatQueue:[],updatedAt:new Date().toISOString()};
}

export function normalizeDailySession(value){
  const selected=[...new Set(value?.selectedIds||[])];
  const completed=[...new Set(value?.completedIds||[])].filter(id=>selected.includes(id));
  const remaining=[...new Set(value?.remainingIds||selected.filter(id=>!completed.includes(id)))].filter(id=>selected.includes(id)&&!completed.includes(id));
  return {...value,version:1,target:Number(value?.target)||DAILY_TARGET,selectedIds:selected,completedIds:completed,remainingIds:remaining,repeatQueue:[...new Set(value?.repeatQueue||[])].filter(id=>selected.includes(id))};
}

export function completeDailyCard(value,id,{repeat=false}={}){
  const state=normalizeDailySession(value);
  if(!state.completedIds.includes(id))state.completedIds.push(id);
  state.remainingIds=state.remainingIds.filter(item=>item!==id);
  state.repeatQueue=state.repeatQueue.filter(item=>item!==id);
  if(repeat)state.repeatQueue.push(id);
  state.updatedAt=new Date().toISOString();
  return state;
}

export function dailyQueue(value){
  const state=normalizeDailySession(value);
  return [...state.remainingIds,...state.repeatQueue];
}

export function dailySummary(value){
  const state=normalizeDailySession(value);
  return {target:state.target,selected:state.selectedIds.length,completed:state.completedIds.length,remaining:state.remainingIds.length,repeats:state.repeatQueue.length,done:state.remainingIds.length===0};
}
