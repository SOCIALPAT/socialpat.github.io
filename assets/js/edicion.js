"use strict";
window.EdicionSocialpat = (() => {
  const {db,e,ext,head,option,fold,pic}=Socialpat;
  const get=id=>document.getElementById(id);
  const val=id=>get(id).value.trim();
  const lines=value=>[...new Set(value.split(/\r?\n/).map(v=>v.trim()).filter(Boolean))];
  let mode="publication",chosen="",pendingExport=false;
  const list=()=>mode==="publication"?db.publications:db.projects;
  const current=()=>list().find(x=>x.id===chosen)||{};
  const checks=(name,items,selected)=>items.map(([value,label])=>'<label><input type="checkbox" name="'+name+'" value="'+e(value)+'"'+(selected.includes(value)?' checked':'')+'> '+e(label)+'</label>').join("");
  const selected=name=>[...document.querySelectorAll('input[name="'+name+'"]:checked')].map(x=>x.value);
  const field=(id,label,value="",type="text",req=false,full=false)=>'<label class="'+(full?"full":"")+'">'+e(label)+'<input id="'+id+'" type="'+type+'" value="'+e(value)+'"'+(req?" required":"")+'></label>';
  const area=(id,label,value="",req=false)=>'<label class="full">'+e(label)+'<textarea id="'+id+'" rows="3"'+(req?" required":"")+'>'+e(value)+'</textarea></label>';
  const legend=(title,body)=>'<fieldset><legend>'+e(title)+'</legend>'+body+'</fieldset>';
  const listChecks=(name,title,items,values=[],scroll=false)=>legend(title,'<div class="checks'+(scroll?' scroller':'')+'">'+checks(name,items,values)+'</div>');
  const uid=(prefix)=>prefix+"-"+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,9));
  const partURL=s=>!s||/^https?:\/\//i.test(s);
  const doiKey=s=>String(s||"").trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i,"").replace(/^doi:\s*/i,"").toLowerCase();
  const act=(id,label,cls="btn alt")=>'<button type="button" id="'+id+'" class="'+cls+'">'+e(label)+'</button>';
  function page(){
    return head("Edición del catálogo","Añade publicaciones y actualiza las fichas de proyectos desde esta copia de la web.")+
    '<div class="wrap inner edit"><p>Guarda cada ficha y descarga el catálogo actualizado. Para conservar los cambios, sustituye <code>datos/socialpat.js</code> en la carpeta de la web por el archivo descargado. Puedes revisar el resultado navegando por esta misma pestaña.</p>'+
    '<div class="actions">'+act("export","Descargar catálogo actualizado","btn")+(window.SOCIALPAT_ASSETS?act("export-page","Descargar web actualizada en un HTML"):"")+'</div><p id="export-note" class="helper" role="status"></p><nav aria-label="Tipo de ficha">'+act("pub-mode","Publicaciones")+act("proj-mode","Proyectos")+'</nav><div id="editor-body"></div></div>';
  }
  function bind(){
    get("pub-mode").onclick=()=>switchMode("publication");
    get("proj-mode").onclick=()=>switchMode("project");
    get("export").onclick=()=>exportData(false);
    if(get("export-page"))get("export-page").onclick=()=>exportData(true);
    renderForm();
  }
  const dirtyForm=()=>Boolean(get("edit-form")?.dataset.changed);
  const canDiscard=()=>!dirtyForm()||window.confirm("¿Descartar los cambios pendientes de guardar en esta ficha?");
  function switchMode(next){if(next===mode||!canDiscard())return;mode=next;chosen="";renderForm();}
  function pubFields(p){
    return '<div class="fields">'+field("title","Título",p.title,"text",true,true)+area("authors","Autoría completa, una persona por línea",(p.authors||[]).join("\n"),true)+field("year","Año",p.year||new Date().getFullYear(),"number",true)+field("type","Tipo de publicación",p.type||"Artículo","text",true)+field("venue","Revista, editorial o repositorio",p.venue,"text",true,true)+field("doi","DOI",p.doi)+field("url","Enlace a la publicación",p.url,"url")+'</div>'+
    listChecks("member","Personas de SOCIALPAT firmantes",db.members.map(m=>[m.id,m.name]),p.members)+listChecks("project","Proyectos vinculados",db.projects.map(p=>[p.id,p.short]),p.projects)+field("funding","Enlace que acredita la vinculación con el proyecto",p.fundingSource,"url",false,true);
  }
  function partnerRow(a={}){
    const row=document.createElement("div");row.className="row-edit";
    row.innerHTML='<label>Entidad<input class="p-name" value="'+e(a.name)+'" required></label><label>Función<input class="p-role" value="'+e(a.role)+'" placeholder="Socio, entidad asociada…"></label><label>Web<input class="p-url" type="url" value="'+e(a.url)+'"></label><label>Logotipo<input class="p-file file" type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label><div class="p-prev">'+(a.logo?pic(a.logo,a.name,"inline-logo"):"")+'</div><button type="button" class="btn alt small-btn remove">Quitar entidad</button>';
    row.original=structuredClone(a);row.logo=a.logo||"";
    row.querySelector(".remove").onclick=()=>{row.remove();get("edit-form").dataset.changed="1";};
    row.querySelector(".p-file").onchange=async ev=>{const v=await getLogo(ev.target);if(v){row.logo=v;row.querySelector(".p-prev").innerHTML=pic(v,"Logotipo de la entidad","inline-logo");}};
    return row;
  }
  function projectFields(p){
    const pubs=db.publications.filter(x=>(x.projects||[]).includes(p.id)).map(x=>x.id);
    return '<div class="fields">'+field("short","Nombre breve o sigla",p.short,"text",true)+field("title","Título completo",p.title,"text",true)+area("description","Descripción",p.description,true)+field("status","Estado",p.status||"En ejecución","text",true)+field("dates","Periodo",p.dates)+field("program","Programa",p.program)+field("reference","Referencia o número de ayuda",p.reference)+field("source","Fuente principal",p.source,"url",false,true)+area("sources","Otras fuentes, una URL por línea",(p.sources||[]).filter(x=>x!==p.source).join("\n"))+area("leads","Responsables, una persona por línea",(p.leads||[]).join("\n"))+area("team","Otras personas del equipo, una por línea",(p.team||[]).join("\n"))+area("funders","Financiadores, uno por línea",(p.funders||[]).join("\n"))+'</div>'+
    legend("Logotipo del proyecto",'<div id="logo-preview">'+pic(p.logo,"Logotipo del proyecto","inline-logo")+'</div><label>Seleccionar imagen<input class="file" type="file" id="logo-file" accept="image/png,image/jpeg,image/webp,image/gif"></label><p class="helper">PNG, JPEG, WebP o GIF, hasta 2 MB. La imagen queda incluida en el catálogo.</p>')+
    legend("Miembros del consorcio",'<div id="partners"></div>'+act("add-partner","Añadir entidad","btn alt small-btn"))+
    listChecks("pub","Publicaciones vinculadas",Socialpat.yearSorted().map(x=>[x.id,x.year+" · "+x.title]),pubs,true);
  }
  async function getLogo(input){
    const file=input.files[0];if(!file)return null;
    if(file.size>2*1024*1024||!["image/png","image/jpeg","image/webp","image/gif"].includes(file.type)){input.value="";message("Elige un PNG, JPEG, WebP o GIF de hasta 2 MB.");return null;}
    const form=get("edit-form");form.dataset.loading=String(Number(form.dataset.loading||0)+1);
    try{
      const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
      const test=new Image();test.src=data;await test.decode();
      return data;
    }catch{message("No se pudo leer esa imagen.");return null;}
    finally{form.dataset.loading=String(Number(form.dataset.loading)-1);}
  }
  const message=s=>{get("msg").textContent=s;};
  function renderForm(msg=""){
    get("pub-mode").setAttribute("aria-pressed",String(mode==="publication"));
    get("proj-mode").setAttribute("aria-pressed",String(mode==="project"));
    get("export-note").textContent=pendingExport?"Hay cambios guardados en esta pestaña pendientes de descargar.":"";
    const pub=mode==="publication",p=current(),noun=pub?"publicación":"proyecto",items=pub?Socialpat.yearSorted():list();
    get("editor-body").innerHTML='<div class="edit-panel"><label>Ficha que quieres editar<select id="choose">'+option("",pub?"Crear una publicación":"Crear un proyecto")+items.map(x=>option(x.id,pub?x.year+" · "+x.title:x.short)).join("")+'</select></label><form id="edit-form">'+legend(pub?"Datos bibliográficos":"Datos del proyecto",pub?pubFields(p):projectFields(p))+'<button class="btn" type="submit">Guardar '+noun+' en esta copia</button><p id="msg" class="status" role="status"></p></form></div>';
    get("choose").value=chosen;
    get("choose").onchange=ev=>{if(!canDiscard()){ev.target.value=chosen;return;}chosen=ev.target.value;renderForm();};
    if(!pub){
      (p.partners||[]).forEach(a=>get("partners").appendChild(partnerRow(a)));
      get("add-partner").onclick=()=>{const row=partnerRow();get("partners").appendChild(row);get("edit-form").dataset.changed="1";row.querySelector("input").focus();};
      get("logo-preview").logo=p.logo||"";
      get("logo-file").onchange=async ev=>{const logo=await getLogo(ev.target);if(logo){get("logo-preview").logo=logo;get("logo-preview").innerHTML=pic(logo,"Nuevo logotipo","inline-logo");}};
    }
    get("edit-form").addEventListener("input",()=>{get("edit-form").dataset.changed="1";});
    get("edit-form").onsubmit=ev=>{ev.preventDefault();if(Number(get("edit-form").dataset.loading||0)>0){message("Espera a que termine de cargarse la imagen.");return;}try{save(p);pendingExport=true;renderForm("Ficha guardada. Descarga el catálogo para conservar los cambios.");}catch(err){message(err.message);}};
    if(msg)message(msg);
  }
  function save(old){
    const pub=mode==="publication",id=old.id||uid(pub?"pub":"proyecto");let value;
    if(pub){
      const doi=doiKey(val("doi")),url=val("url"),year=Number(val("year")),members=selected("member");
      if(!val("title")||!lines(val("authors")).length||!val("venue"))throw Error("Completa el título, la autoría y la revista o editorial.");
      if(!Number.isInteger(year)||year<1000||year>9999)throw Error("Introduce el año con cuatro cifras.");
      if(doi&&!/^10\.\d{4,9}\/\S+$/i.test(doi))throw Error("Revisa el formato del DOI (10.xxxx/…).");
      if(!doi&&!url)throw Error("Añade un DOI o un enlace al registro.");
      if(!partURL(url)||!partURL(val("funding")))throw Error("Revisa los enlaces. Deben comenzar por https:// o http://.");
      if(!members.length)throw Error("Selecciona al menos una persona firmante de SOCIALPAT.");
      if(doi&&db.publications.some(p=>p.id!==id&&doiKey(p.doi)===doi))throw Error("Ese DOI ya está en el catálogo. Selecciona la ficha existente para editarla.");
      const projects=selected("project");
      value={...old,id,title:val("title"),authors:lines(val("authors")),year,venue:val("venue"),type:val("type"),url:url||"https://doi.org/"+doi,doi,members,projects,fundingSource:val("funding"),source:old.source||url||"https://doi.org/"+doi};
    }else{
      const leads=lines(val("leads")),team=lines(val("team")),source=val("source"),sources=lines(val("sources"));
      if(!val("short")||!val("title")||!val("description"))throw Error("Completa los nombres y la descripción del proyecto.");
      if(!partURL(source)||sources.some(u=>!partURL(u)))throw Error("Revisa las URL de las fuentes.");
      const partners=[...get("partners").children].map(row=>{
        const name=row.querySelector(".p-name").value.trim(),url=row.querySelector(".p-url").value.trim();
        if(!name||!partURL(url))throw Error("Revisa los nombres y las direcciones de las entidades.");
        const a={...row.original,name,role:row.querySelector(".p-role").value.trim(),url,logo:row.logo};
        if(a.logo!==row.original.logo)delete a.logoSource;return a;
      });
      const names=[...leads,...team].map(fold),logo=get("logo-preview").logo;
      value={...old,id,short:val("short"),title:val("title"),description:val("description"),dates:val("dates"),status:val("status"),program:val("program"),reference:val("reference"),leads,team,memberIds:db.members.filter(m=>[m.name,...(m.aliases||[])].some(n=>names.includes(fold(n)))).map(m=>m.id),partners,funders:lines(val("funders")),source,sources:[...new Set([source,...sources].filter(Boolean))],logo};
      if(logo!==old.logo){delete value.logoSource;if(old.logo && old.logo===old.image){value.image=logo;value.imageAlt="Logotipo de "+value.short;delete value.imageSource;}}
      if(old.description!==value.description) delete value.teaser;
      const pubs=new Set(selected("pub"));
      db.publications.forEach(x=>{x.projects=x.projects.filter(key=>key!==id);if(pubs.has(x.id))x.projects.push(id);});
    }
    const index=list().findIndex(x=>x.id===id);
    if(index<0)list().push(value);else list()[index]=value;
    chosen=id;
  }
  function exportData(portable){
    if(dirtyForm()){message("Guarda primero los cambios de la ficha que estás editando.");get("msg").scrollIntoView({block:"nearest"});return;}
    const serialized="window.SOCIALPAT = "+JSON.stringify(db,null,2).replace(/</g,"\\u003c")+";\n";
    let blob,filename;
    if(portable){
      const copy=document.documentElement.cloneNode(true);
      copy.querySelector("#contenido").replaceChildren();
      copy.querySelector("#embedded-data").textContent=serialized;
      copy.querySelector("title").textContent="SOCIALPAT · IPNA-CSIC";
      blob=new Blob(["<!doctype html>\n",copy.outerHTML],{type:"text/html;charset=utf-8"});
      filename="SOCIALPAT-interna.html";
    }else{
      blob=new Blob([serialized],{type:"text/javascript;charset=utf-8"});filename="socialpat.js";
    }
    const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    pendingExport=false;get("export-note").textContent=portable?"Descarga iniciada. La nueva copia HTML incluye tus cambios.":"Descarga iniciada. Coloca socialpat.js dentro de la carpeta datos y abre de nuevo index.html.";
  }
  function unloading(ev){if(pendingExport||dirtyForm()){ev.preventDefault();ev.returnValue="";}}
  window.addEventListener("beforeunload",unloading);
  document.addEventListener("click",ev=>{const a=ev.target.closest("a");if(a&&location.hash==="#edicion"&&a.hash.startsWith("#")&&a.hash!==location.hash&&a.getAttribute("href")?.startsWith("#")&&!canDiscard()){ev.preventDefault();}});
  return {page,bind};
})();
