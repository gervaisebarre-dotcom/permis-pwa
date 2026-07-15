import{shuffle}from'./utils.js';
export function makeOptions(sign,pool){const same=shuffle(pool.filter(x=>x.code!==sign.code&&x.category===sign.category&&x.name!==sign.name)),other=shuffle(pool.filter(x=>x.code!==sign.code&&x.name!==sign.name&&!same.some(y=>y.code===x.code)));return shuffle([sign,...same,...other].filter((x,i,a)=>a.findIndex(y=>y.name===x.name)===i).slice(0,4))}
export function buildQueue(pool,length){const shuffled=shuffle(pool);return Array.from({length:Math.min(length,pool.length)},(_,i)=>shuffled[i%shuffled.length])}
export function reinsert(queue,sign,index){const at=Math.min(queue.length,index+3+Math.floor(Math.random()*3));queue.splice(at,0,sign)}
