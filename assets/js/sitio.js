"use strict";
const Socialpat = (() => {
  const db = window.SOCIALPAT;
  const main = document.getElementById("contenido");
  const official = "https://www.ipna.csic.es/grupo-de-investigacion/ciencias-sociales-patrimonio-y-alimentacion";
  const titles = {inicio:"Inicio", grupo:"El grupo", equipo:"Equipo", proyectos:"Proyectos", publicaciones:"Publicaciones", contacto:"Contacto", fuentes:"Fuentes y créditos", edicion:"Edición del catálogo"};
  const e = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const fold = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
  const safeURL = value => /^https?:\/\//i.test(value || "") ? e(value) : "";
  const asset = path => {
    if (!path) return "";
    if (window.SOCIALPAT_ASSETS && Object.hasOwn(window.SOCIALPAT_ASSETS,path)) return window.SOCIALPAT_ASSETS[path];
    if (/^assets\/[\w./-]+$/.test(path) && !path.includes("..")) return path;
    if (/^https?:\/\//i.test(path) || /^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(path)) return path;
    return "";
  };
  const pic = (src,alt,cls="",lazy=true) => asset(src) ? '<img class="'+e(cls)+'" src="'+e(asset(src))+'" alt="'+e(alt)+'" '+(lazy?'loading="lazy"':'fetchpriority="high"')+' decoding="async">' : "";
  const ext = (url,label,cls="out") => safeURL(url)?'<a class="'+e(cls)+'" href="'+safeURL(url)+'" target="_blank" rel="noopener noreferrer">'+e(label)+'</a>':e(label);
  const link = (section,label,cls="") => '<a class="'+e(cls)+'" href="#'+e(section)+'">'+e(label)+'</a>';
  const byId = (list,id) => list.find(item=>item.id===id);
  const person = id => byId(db.members,id);
  const project = id => byId(db.projects,id);
  const section = (title,html) => '<section class="content-set"><h2>'+e(title)+'</h2>'+html+'</section>';
  const head = (title,sub,kicker="SOCIALPAT · IPNA-CSIC") => '<section class="subhead"><div class="wrap"><div class="eyebrow">'+e(kicker)+'</div><h1>'+e(title)+'</h1><p>'+e(sub)+'</p></div></section>';
  const back = (route,title) => link(route,title,"crumb");
  const search = (id,label,placeholder) => '<label class="grow">'+e(label)+'<input type="search" id="'+id+'" placeholder="'+e(placeholder)+'" autocomplete="off"></label>';
  const option=(val,label)=>'<option value="'+e(val)+'">'+e(label)+'</option>';
  const select=(id,label,first,arr)=>'<label>'+e(label)+'<select id="'+id+'">'+option("",first)+arr.map(([v,l])=>option(v,l)).join("")+'</select></label>';
  const yearSorted = () => [...db.publications].sort((a,b)=>b.year-a.year || a.title.localeCompare(b.title,"es"));
  const empty = message => '<p class="empty">'+e(message)+'</p>';
  function projectPicture(p) {
    const src=p.cover||p.image||p.logo;
    const logo=!p.cover && (p.imageKind==="logo" || p.imageKind==="funder" || (!p.image && p.logo));
    return '<div class="picture'+(logo?' is-logo':'')+'">'+(src?pic(src,p.coverAlt||p.imageAlt||p.short):'<span class="type-cover">'+e(p.short)+'</span>')+'</div>';
  }
  function projectCard(p) {
    return '<article class="project-card"><a href="#proyectos/'+e(p.id)+'">'+projectPicture(p)+'<span class="kicker">'+e(p.cardLabel||p.status||"Proyecto")+'</span><h3>'+e(p.short)+'</h3><p class="desc">'+e(p.teaser||p.description)+'</p></a></article>';
  }
  function memberCards(list) {
    return '<div class="people">'+list.map(m=>'<article class="person-card"><a href="#equipo/'+e(m.id)+'">'+pic(m.photo,"Retrato de "+m.name,"portrait")+'<h3>'+e(m.name)+'</h3><p class="small">'+e(m.role)+'</p></a></article>').join("")+'</div>';
  }
  function pubRows(list) {
    if (!list.length) return empty("Aún no hay publicaciones vinculadas en esta selección.");
    return '<div class="pub-list">'+list.map(p=>{
      const authorText=Array.isArray(p.authors)?p.authors.join(", "):p.authors;
      const tags=p.projects.map(project).filter(Boolean).map(t=>link("proyectos/"+t.id,t.short,"chip")).join("");
      const location=[p.type,p.venue].filter(Boolean).map(e).join(" · ");
      const funding=p.fundingSource && p.projects.length ? ext(p.fundingSource,"Crédito del proyecto") : "";
      const source=p.url || (p.doi ? "https://doi.org/"+p.doi : p.source);
      return '<article class="pub-row"><span class="pub-year">'+e(p.year)+'</span><div>'+ext(source,p.title,"pub-title")+'<p class="small">'+e(authorText)+'</p><p class="small"><i>'+location+'</i></p>'+(tags?'<p class="chips">'+tags+funding+'</p>':'')+'</div>'+ext(source,p.doi?"DOI":"Ver registro")+'</article>';
    }).join("")+'</div>';
  }
  function home() {
    const picks=["frontcat","alsemac","truefoods"].map(project).filter(Boolean);
    return '<section class="hero">'+pic("assets/editorial/la-geria.webp","Viñas entre muros de piedra volcánica en La Geria, Lanzarote","hero-photo",false)+'<div class="hero-inner wrap"><div class="eyebrow">Grupo de investigación · IPNA-CSIC</div><h1>Ciencias sociales,<br>patrimonio y<br><em>alimentación.</em></h1><p class="hero-desc">Desde Canarias estudiamos cómo las personas cultivan, habitan y dan valor a los territorios que comparten.</p><div class="actions">'+link("proyectos","Explorar proyectos","btn")+link("equipo","Conoce al equipo","btn alt")+'</div></div><a class="photo-cap" href="#fuentes"><span class="pin" aria-hidden="true"></span>La Geria, Lanzarote</a></section>'+
    '<section class="wrap block"><div class="section-head"><div><div class="eyebrow">Investigación</div><h2>Proyectos destacados</h2></div>'+link("proyectos","Ver todos los proyectos","textlink")+'</div><div class="proj-grid">'+picks.map(projectCard).join("")+'</div></section>'+
    '<section class="tint"><div class="wrap block group-band">'+pic("assets/editorial/bodega.webp","Detalle de una barrica en una bodega","editor-photo")+'<div><div class="eyebrow">El grupo</div><h2>Del viñedo al paisaje</h2><p>Una barrica de tea, un comedor escolar o un yacimiento sirven de punto de partida para investigar quién decide qué se conserva, qué comemos y cómo cambia un territorio. En SOCIALPAT reunimos antropología, sociología y arqueología para estudiar esas decisiones.</p><div class="actions">'+link("grupo","Nuestras líneas de investigación","textlink")+'</div></div></div></section>'+
    '<section class="wrap block"><div class="section-head"><div><div class="eyebrow">Bibliografía</div><h2>Publicaciones recientes</h2></div>'+link("publicaciones","Consultar la selección","textlink")+'</div>'+pubRows((db.featuredPublications||[]).map(id=>byId(db.publications,id)).filter(Boolean).slice(0,3))+'</section>';
  }
  function group() {
    return head("El grupo","Ciencias sociales, patrimonio y alimentación en el Instituto de Productos Naturales y Agrobiología.")+'<div class="wrap inner"><div class="group-band"><div><p class="intro-prose">¿Qué convierte un alimento, un oficio o un paisaje en patrimonio?</p><p>SOCIALPAT comenzó a trabajar como grupo en 2021 en Tenerife. Estudiamos cómo se transmite el conocimiento, qué desigualdades atraviesan la producción y el consumo, y cómo se negocia el cuidado de los paisajes y de las especies que los habitan.</p><p>Combinamos trabajo de campo, archivos, análisis de alimentos, teledetección y arqueología biomolecular. Canarias es un lugar central de investigación, con trabajos que se extienden a la península ibérica, América Latina y Asia.</p></div>'+pic("assets/editorial/tinajas.webp","Tinajas en el interior de una bodega","editor-photo")+'</div>'+
    section("Líneas de investigación",'<div class="line-list">'+db.lines.map(l=>'<details><summary>'+e(l.name)+'</summary><div class="line-content">'+pic(l.image,l.name)+ '<div><p>'+e(l.text)+'</p><div class="links">'+l.members.map(person).filter(Boolean).map(m=>link("equipo/"+m.id,m.name,"chip")).join("")+ext(l.url,"Línea en IPNA")+'</div></div></div></details>').join("")+'</div>')+
    '<div class="actions">'+ext(official,"Ficha del grupo en IPNA-CSIC","textlink")+'</div></div>';
  }
  function directory(kind) {
    const isPeople=kind==="equipo", isPub=kind==="publicaciones";
    let desc=isPeople?"Las personas que integran SOCIALPAT y las preguntas que orientan su trabajo.":isPub?"Selección de trabajos de las personas del grupo, incluidas publicaciones anteriores a su incorporación.":"Investigación en Canarias y en colaboración con otras instituciones. Cada ficha reúne el equipo, las entidades participantes y las publicaciones vinculadas.";
    let controls=search("query","Buscar",isPeople?"Nombre o tema de investigación":isPub?"Título, autoría, revista o DOI":"Nombre, tema o entidad");
    if(isPeople) controls+=select("role","Categoría","Todas las categorías",[...new Set(db.members.map(m=>m.category))].map(s=>[s,s]));
    else if(isPub) controls+=select("pid","Persona","Todo el equipo",db.members.map(m=>[m.id,m.name]))+select("yr","Año","Todos los años",[...new Set(yearSorted().map(p=>p.year))].map(y=>[y,y]))+select("pj","Proyecto","Todos los proyectos",db.projects.map(p=>[p.id,p.short]));
    else controls+=select("status","Estado","Todos los estados",[...new Set(db.projects.map(s=>s.status).filter(Boolean))].map(s=>[s,s]));
    return head(titles[kind],desc)+'<div class="wrap inner"><div class="tools">'+controls+'</div><p class="count" id="result-count" role="status"></p><div id="results"></div></div>';
  }
  function bindFilter(kind) {
    const el=id=>document.getElementById(id), field=id=>el(id)?.value??"";
    const update=()=>{
      const q=fold(field("query")).trim();
      let matches,html,noun;
      if(kind==="equipo"){
        matches=db.members.filter(m=>(!field("role")||m.category===field("role"))&&fold([m.name,m.bio,...m.interests].join(" ")).includes(q));
        html=memberCards(matches);noun=matches.length===1?"persona":"personas";
      } else if(kind==="proyectos"){
        matches=db.projects.filter(p=>(!field("status")||p.status===field("status"))&&fold([p.short,p.title,p.description,p.program,...p.partners.map(v=>v.name),...p.funders,...p.team,...p.leads].join(" ")).includes(q));
        html='<div class="proj-grid grid-long">'+matches.map(projectCard).join("")+'</div>';noun=matches.length===1?"proyecto":"proyectos";
      }else{
        matches=yearSorted().filter(p=>(!field("yr")||String(p.year)===field("yr"))&&(!field("pid")||p.members.includes(field("pid")))&&(!field("pj")||p.projects.includes(field("pj")))&&fold([p.title,p.authors,p.venue,p.doi].join(" ")).includes(q));
        html=pubRows(matches);noun=matches.length===1?"referencia":"referencias";
      }
      el("result-count").textContent=matches.length+" "+noun;
      el("results").innerHTML=matches.length?html:empty("No hay coincidencias. Prueba otro término o cambia los filtros.");
    };
    document.querySelector(".tools").addEventListener("input",update);update();
  }
  function personDetail(m) {
    const refs=db.publications.filter(p=>p.members.includes(m.id)).sort((a,b)=>b.year-a.year);
    const projects=db.projects.filter(p=>p.memberIds.includes(m.id));
    return '<div class="wrap inner">'+back("equipo","Equipo")+'<div class="profile">'+pic(m.photo,"Retrato de "+m.name,"",false)+'<div><div class="eyebrow">'+e(m.role)+'</div><h1>'+e(m.name)+'</h1><p class="bio">'+e(m.bio)+'</p><div class="tags">'+m.interests.map(t=>'<span>'+e(t)+'</span>').join("")+'</div><div class="links">'+ext(m.source,"Perfil IPNA-CSIC")+m.links.filter(l=>!["LinkedIn","Academia.edu","Scopus","ResearchGate"].includes(l.label)).map(l=>ext(l.url,l.label)).join("")+'</div>'+(m.email?'<p class="doi"><a href="mailto:'+e(m.email)+'">'+e(m.email)+'</a></p>':'')+'</div></div>'+
    (projects.length?section("Proyectos",'<div class="chips">'+projects.map(p=>link("proyectos/"+p.id,p.short,"chip")).join("")+'</div>'):"")+section("Publicaciones seleccionadas",pubRows(refs))+'</div>';
  }
  function nameLink(name) {
    const m=db.members.find(x=>x.name===name||x.aliases?.includes(name));
    return m?link("equipo/"+m.id,name,"chip"):'<span class="chip">'+e(name)+'</span>';
  }
  function projectDetail(p) {
    const refs=yearSorted().filter(pub=>pub.projects.includes(p.id));
    const blocks=[["Estado",p.status],["Periodo",p.dates],["Programa",p.program],["Referencia",p.reference]].filter(x=>x[1]);
    const sourceLinks=[...new Set([p.source,...(p.sources||[])].filter(Boolean))];
    const photo=p.cover||p.image||p.logo;
    const isLogo=!p.cover&&(p.imageKind==="logo"||p.imageKind==="funder"||p.logo===photo);
    const team=[...new Set(p.team.filter(n=>!p.leads.includes(n)))];
    return '<div class="wrap inner">'+back("proyectos","Proyectos")+'<div class="project-over"><div><div class="eyebrow">Proyecto de investigación</div><h1>'+e(p.short)+'</h1>'+(p.title&&p.short!==p.title?'<p class="project-title-more">'+e(p.title)+'</p>':'')+'<p class="bio">'+e(p.description)+'</p></div><div>'+pic(photo,p.coverAlt||p.imageAlt||p.short,"feature-img"+(isLogo?" logo":""),false)+'</div></div><dl class="info-bar">'+blocks.map(([label,value])=>'<div><dt>'+e(label)+'</dt><dd>'+e(value)+'</dd></div>').join("")+'</dl>'+
    (p.logo && (p.logo!==photo||!isLogo)?section("Identidad del proyecto",'<div class="logo-box">'+pic(p.logo,"Logotipo de "+p.short)+'</div>'):"")+
    (p.leads.length||team.length?section("Equipo", (p.leads.length?'<p class="kicker">'+e(p.leadLabel||"Responsables científicos")+'</p><div class="chips">'+p.leads.map(nameLink).join("")+'</div>':"")+(team.length?'<p class="kicker" style="margin-top:1rem">Participantes</p><div class="chips">'+team.map(nameLink).join("")+'</div>':"")):"")+
    section("Entidades participantes",p.partners.length?'<ul class="partners">'+p.partners.map(a=>'<li>'+pic(a.logo,"", "",true)+'<div>'+(a.url?ext(a.url,a.name,""):e(a.name))+'<small>'+e(a.role)+'</small></div></li>').join("")+'</ul>':empty("La ficha consultada no detalla otras entidades participantes."))+
    (p.funders.length?section("Financiación",'<p>'+p.funders.map(e).join(" · ")+'</p>'):"")+
    section("Publicaciones vinculadas",pubRows(refs))+
    (p.note?'<p class="content-set small">'+e(p.note)+'</p>':"")+
    section("Fuentes",'<div class="links">'+sourceLinks.map(u=>ext(u,sourceLabel(u))).join("")+'</div>')+'</div>';
  }
  function sourceLabel(url) {
    try {const h=new URL(url).hostname.replace(/^www\./,"");return ({"ipna.csic.es":"IPNA-CSIC","cordis.europa.eu":"CORDIS","digital.csic.es":"DIGITAL.CSIC"})[h]||h;}catch{return "Fuente";}
  }
  function contact() {
    return head("Contacto","Grupo de Ciencias Sociales, Patrimonio y Alimentación.")+'<div class="wrap block contact-grid"><section><h2>Escríbenos</h2>'+db.members.slice(0,2).map(m=>'<p>'+link("equipo/"+m.id,m.name,"textlink")+'<br><a class="doi" href="mailto:'+e(m.email)+'">'+e(m.email)+'</a></p>').join("")+'</section><section><h2>Dónde estamos</h2><p>Instituto de Productos Naturales y Agrobiología<br>Campus de Anchieta · Avda. Astrofísico Francisco Sánchez, 3<br>38206 San Cristóbal de La Laguna, Tenerife</p><p>'+ext("https://www.ipna.csic.es/contacto","Cómo llegar al IPNA")+'</p></section></div>';
  }
  function credits() {
    return head("Fuentes y créditos","Procedencia de los contenidos, fotografías y referencias del catálogo.")+'<div class="wrap inner narrow">'+
    section("Equipo y proyectos",'<p>El directorio parte del personal que aparece en la '+ext(official,"ficha institucional de SOCIALPAT")+'. Cada perfil conserva un enlace al original. Las fichas de proyectos incluyen sus fuentes institucionales, de consorcio o de financiación. Los logotipos conservan la identidad de la entidad que representan.</p>')+
    section("Bibliografía",'<p>La selección reúne trabajos localizables mediante DOI, repositorios y fuentes académicas. La vinculación de una publicación con una persona indica autoría. Para asociarla a un proyecto se ha utilizado una referencia explícita al proyecto o a su financiación. La cobertura bibliográfica es selectiva.</p>')+
    section("Fotografías e identidad visual",pic("assets/editorial/socialpat-logo.webp","Identidad gráfica de SOCIALPAT","full-logo")+'<p>La fotografía de portada es <i>La Geria, Lanzarote, Canary Islands</i>, de Tamara Kulikova (2012). Se ha reducido y convertido a WebP, con recorte de encuadre adaptable. '+ext("https://commons.wikimedia.org/wiki/File:La_Geria,_Lanzarote,_Canary_Islands.jpg","Fotografía original")+' · '+ext("https://creativecommons.org/licenses/by-sa/4.0/","Licencia CC BY-SA 4.0")+'.</p><p>El emblema, las fotografías de investigación y los retratos proceden de las páginas del IPNA-CSIC. Las miniaturas de ALSEMAC y de otras fichas pueden ilustrar el tema con material del grupo. Las imágenes de los proyectos y los logotipos de las instituciones participantes proceden de sus fichas oficiales.</p><details><summary>Originales del grupo y del equipo</summary><ul class="simple-list">'+db.visualSources.map(v=>'<li>'+ext(v.url,v.label)+'</li>').join("")+db.members.map(m=>'<li>'+ext(m.photoSource,m.name)+'</li>').join("")+'</ul></details><details><summary>Imágenes de proyectos y entidades</summary><ul class="simple-list">'+db.projects.map(p=>{
       const urls=[p.imageSource,p.logoSource,...p.partners.map(a=>a.logoSource)].filter(Boolean);
       return urls.length?'<li>'+e(p.short)+' · '+[...new Set(urls)].map((u,i)=>ext(u,"Original "+(i+1))).join(" · ")+'</li>':"";
    }).join("")+'</ul></details>')+section("Tipografías",'<p>DM Sans e Instrument Serif. Ambas se distribuyen con la licencia SIL Open Font License.</p>')+'</div>';
  }
  function render() {
    const [sectionId,id]=(location.hash.slice(1)||"inicio").split("/");
    if(sectionId==="contenido"){location.replace("#inicio");return;}
    const mode=titles[sectionId]?sectionId:null;
    let content, detail;
    if (id && mode==="equipo" && (detail=person(id))) content=personDetail(detail);
    else if (id && mode==="proyectos" && (detail=project(id))) content=projectDetail(detail);
    else if (!id && ["equipo","proyectos","publicaciones"].includes(mode)) content=directory(mode);
    else if (!id && mode==="inicio") content=home();
    else if (!id && mode==="grupo") content=group();
    else if (!id && mode==="contacto") content=contact();
    else if (!id && mode==="fuentes") content=credits();
    else if (!id && mode==="edicion") content=window.EdicionSocialpat.page();
    else content=head("Página no encontrada","Comprueba la dirección o vuelve al inicio.")+'<div class="wrap inner">'+link("inicio","Volver al inicio","btn")+'</div>';
    main.innerHTML=content;
    if (document.querySelector(".tools")) bindFilter(mode);
    if (mode==="edicion"&&!id) window.EdicionSocialpat.bind();
    document.querySelectorAll("#primary a").forEach(a=>{a.removeAttribute("aria-current");if(a.hash==="#"+mode)a.setAttribute("aria-current","page");});
    document.getElementById("primary").classList.remove("open");document.getElementById("menu").setAttribute("aria-expanded","false");
    document.title=(detail?.name||detail?.short||titles[mode]||"Página no encontrada")+" · SOCIALPAT";
  }
  function iniciar() {
    render();
    window.addEventListener("hashchange",()=>{render();window.scrollTo(0,0);main.focus({preventScroll:true});});
    document.getElementById("menu").addEventListener("click",ev=>{const open=document.getElementById("primary").classList.toggle("open");ev.currentTarget.setAttribute("aria-expanded",String(open));});
    document.querySelector(".skip").addEventListener("click",ev=>{ev.preventDefault();main.focus();main.scrollIntoView();});
  }
  return {iniciar,db,e,asset,ext,head,option,fold,pic,yearSorted};
})();
