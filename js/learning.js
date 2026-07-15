import{shuffle}from'./utils.js';import{blankProgress}from'./scheduler.js';
export const newCards=(signs,progress,count,category='')=>shuffle(signs.filter(s=>(!category||s.category===category)&&!(progress[s.code]||blankProgress()).seen)).slice(0,count);
