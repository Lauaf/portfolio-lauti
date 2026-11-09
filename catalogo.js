// Catálogo, fichas y laboratorio de visión: la misma lógica para / (castellano) y /en/ (inglés).
// El idioma sale del lang del <html>; los datos de cada idioma viven en proyectos.js.
const EN=typeof document!=='undefined'&&!!document.documentElement&&document.documentElement.lang==='en';
const ROOT=EN?'../':''; // en/ sirve los mismos archivos desde la raíz del sitio
const DATOS=EN?CATALOGO_EN:{proyectos:PROYECTOS,enlaces:PROYECTO_ENLACES,imagenes:PROYECTO_IMAGENES};
const P=DATOS.proyectos,PROJECT_REPOSITORIES=DATOS.enlaces,IMAGENES=DATOS.imagenes;
const TXT=EN?{all:'All',cats:['All','Professional','Personal','University'],live:'● In production',try:'Try ↗',details:'View details',count:(n,t)=>`${n} of ${t} projects shown`,did:'What I did',stack:'Stack and concepts',notes:'Status and notes',demo:'Try the related demo ↗'}
  :{all:'Todos',cats:['Todos','Profesional','Personal','Universidad'],live:'● En producción',try:'Probar ↗',details:'Ver detalles',count:(n,t)=>`${n} de ${t} proyectos mostrados`,did:'¿Qué se trabajó?',stack:'Stack y conceptos',notes:'Estado y consideraciones',demo:'Probar demo relacionada ↗'};
const categories=TXT.cats;let activeCat=TXT.all,q='';
const $=id=>document.getElementById(id);
function safe(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
const ruta=u=>/^(https?:|mailto:|#)/.test(u)?u:ROOT+u;
function thumb(name,cls='thumb'){const m=IMAGENES[name];if(!m)return '';return `<img class="${cls}${m.pixel?' pixel':''}${m.contain?' contain':''}" src="${safe(ruta(m.src))}" alt="${safe(m.alt)}" loading="lazy"${m.pos?` style="object-position:${safe(m.pos)}"`:''}>`}
function liveCta(name){return (PROJECT_REPOSITORIES[name]||[]).find(r=>r.cta)}
function repositoryLinks(name,className='repo-link',skipCta=false){
  return (PROJECT_REPOSITORIES[name]||[]).filter(r=>!(skipCta&&r.cta)).map(repo=>
    `<a class="${className}${repo.live?' live':''}" href="${safe(ruta(repo.url))}" target="_blank" rel="noopener noreferrer">${safe(repo.label)}</a>`
  ).join('');
}
function ctaBoton(name,cls){const c=liveCta(name);return c?`<a class="${cls}" href="${safe(ruta(c.url))}" target="_blank" rel="noopener noreferrer">${safe(c.cta)}</a>`:''}
function renderProjects(){
  // Keep the project array intact and carry its original index through filtering.
  const filtered=P.map((p,i)=>({p,i})).filter(({p})=>
    (activeCat===TXT.all||p[1]===activeCat)&&p.slice(0,4).join(' ').toLowerCase().includes(q)
  );
  $('projects').innerHTML=filtered.map(({p,i})=>`<article class="project"><div class="projectvisual${IMAGENES[p[0]]?' has-img':''}">${thumb(p[0])}<span class="projectnumber">${String(i+1).padStart(2,'0')}</span><small${liveCta(p[0])?' class="live-badge"':''}>${liveCta(p[0])?TXT.live:safe(p[1])}</small></div><div class="projectbody"><h3>${safe(p[0])}</h3><p>${safe(p[2])}</p><div class="tags">${p[3].split(',').slice(0,4).map(t=>`<span>${safe(t)}</span>`).join('')}</div><div class="projectfoot">${liveCta(p[0])?ctaBoton(p[0],'btn primary small'):p[9]?`<button class="btn primary small" onclick="openDemo('${p[9]}')">${TXT.try}</button>`:''}<button class="btn small" onclick="showProject(${i})">${TXT.details}</button></div><div class="repolinks">${repositoryLinks(p[0],'repo-link',true)}</div></div></article>`).join('');
  $('count').textContent=TXT.count(filtered.length,P.length);
}
$('filters').innerHTML=categories.map(c=>`<button class="chip ${c===activeCat?'active':''}" data-filter="${c}">${c}</button>`).join('');
$('filters').onclick=e=>{if(e.target.dataset.filter){activeCat=e.target.dataset.filter;[...$('filters').children].forEach(x=>x.classList.toggle('active',x.dataset.filter===activeCat));renderProjects()}};
$('search').oninput=e=>{q=e.target.value.toLowerCase();renderProjects()};
function showProject(i){const p=P[i];$('modalcat').textContent=p[1]+' / '+p[6];$('modaltitle').textContent=p[0];$('modalcontent').innerHTML=`${thumb(p[0],'modalimg')}<p>${safe(p[2])}</p><h3>${TXT.did}</h3><p>${safe(p[7])}</p><h3>${TXT.stack}</h3><p>${safe(p[3].replaceAll(',',' · '))}</p><h3>${TXT.notes}</h3><p>${safe(p[8])}</p>`;$('modalactions').innerHTML=ctaBoton(p[0],'btn primary')+(p[9]?`<button class="btn primary" onclick="$('modal').close();openDemo('${p[9]}')">${TXT.demo}</button>`:'')+repositoryLinks(p[0],'btn',true);$('modal').showModal()}
renderProjects();
function montarVision(sub){if(typeof window!=='undefined'&&window.Vision)Vision.montar($('demo-vision'),sub)}
function openDemo(id,scroll=true){montarVision(id.split('/')[1]);if(scroll)$('laboratorio').scrollIntoView({behavior:'smooth'})}
// Enlace directo al laboratorio (lo usa el pueblo): index.html#demo=vision/dados. Sin enlace, se monta al acercarse.
if(typeof addEventListener==='function')addEventListener('DOMContentLoaded',()=>{const m=/^#demo=(vision(?:\/[\w-]+)?)$/.exec(location.hash);if(m)return openDemo(m[1]);if('IntersectionObserver' in window){const o=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){o.disconnect();montarVision()}},{rootMargin:'400px'});o.observe($('laboratorio'))}else montarVision()});
