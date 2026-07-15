const routes=new Map();export const route=(name,render)=>routes.set(name,render);export const getRoute=name=>routes.get(name);
export async function dispatch(){const name=location.hash.replace(/^#\//,'').split('/')[0]||'home';document.querySelectorAll('[data-route]').forEach(a=>a.classList.toggle('active',a.dataset.route===name));const render=routes.get(name)||routes.get('home');await render();document.querySelector('#app')?.focus({preventScroll:true});window.scrollTo(0,0)}
export const startRouter=()=>{addEventListener('hashchange',dispatch);dispatch()};
