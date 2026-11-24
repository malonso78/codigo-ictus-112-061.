const $ = id => document.getElementById(id);
let activatedAt = null, timerInterval = null, events = [];
const checklist = [
 ["Seguridad y valoración inicial",["Seguridad de la escena y uso de EPI según riesgo","Valoración ABCDE y nivel de conciencia","Identificación de signos/síntomas compatibles con ictus","Descartar / registrar posibles imitadores según protocolo"]],
 ["Tiempo y antecedentes",["Determinar última vez visto bien (LKW) y fuente de información","Precisar hora de inicio o despertar con síntomas","Registrar situación funcional previa (mRS)","Preguntar por anticoagulantes/antiagregantes y última dosis","Recoger antecedentes, alergias y comorbilidades relevantes"]],
 ["Valoración y monitorización",["Registrar constantes y glucemia capilar","Realizar escala neurológica prehospitalaria adoptada por el servicio","Registrar NIHSS si procede y personal formado disponible","Documentar exploración, lateralidad y evolución del déficit","Reevaluar y registrar cambios durante la asistencia"]],
 ["Coordinación y traslado",["Activar / registrar Código Ictus según procedimiento local","Prealertar al centro receptor por el canal oficial","Confirmar hospital de destino según circuito vigente","Registrar hora de salida, llegada y transferencia","Realizar entrega estructurada y documentar incidencias"]]
];
function addEvent(label, date=new Date()){events.push({label,at:date.toISOString()});renderEvents()}
function renderEvents(){const el=$("eventList");if(!events.length){el.innerHTML='<p class="muted">Aún no hay eventos registrados.</p>';return}el.innerHTML=events.map(e=>`<div class="event"><time>${new Date(e.at).toLocaleString("es-ES")}</time>${escapeHtml(e.label)}</div>`).join("")}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function nowLocal(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)}
function stamp(id){$(id).value=nowLocal();addEvent("Hora registrada: "+id)}
function tick(){if(!activatedAt)return;let sec=Math.max(0,Math.floor((Date.now()-activatedAt)/1000));$("timer").textContent=[Math.floor(sec/3600),Math.floor(sec%3600/60),sec%60].map(n=>String(n).padStart(2,"0")).join(":")}
function activate(){if(activatedAt)return;activatedAt=Date.now();$("activationTime").value=nowLocal();$("statusPill").textContent="ACTIVADO";$("statusPill").classList.add("on");$("activateBtn").disabled=true;$("closeBtn").disabled=false;addEvent("Código Ictus activado");tick();timerInterval=setInterval(tick,1000)}
function closeEpisode(){if(!activatedAt)return;addEvent("Episodio cerrado · tiempo transcurrido "+$("timer").textContent);clearInterval(timerInterval);timerInterval=null;$("statusPill").textContent="CERRADO";$("closeBtn").disabled=true}
function renderChecklist(){const root=$("checklistGroups");root.innerHTML=checklist.map((g,i)=>`<div class="task-group"><h3>${g[0]}</h3>${g[1].map((t,j)=>`<div class="task"><label><input type="checkbox" class="task-check"> <span>${t}</span></label></div>`).join("")}</div>`).join("");root.addEventListener("change",updateProgress);updateProgress()}
function updateProgress(){const all=[...document.querySelectorAll(".task-check")],done=all.filter(x=>x.checked).length,pct=all.length?Math.round(done/all.length*100):0;$("progressText").textContent=`${done} de ${all.length} completados`;$("progressPct").textContent=pct+"%";$("progressBar").style.width=pct+"%"}
function fields(){const out={};document.querySelectorAll("input,select,textarea").forEach(el=>{if(!el.id)return;if(el.type==="checkbox")return;out[el.id]=el.value});out.sintomas=[...$("symptoms").querySelectorAll("input:checked")].map(x=>x.parentElement.textContent.trim());out.antecedentes=[...document.querySelectorAll("#valoracion .check-grid")[1].querySelectorAll("input:checked")].map(x=>x.parentElement.textContent.trim());out.checklist=[...document.querySelectorAll(".task")].map(x=>({tarea:x.innerText.trim(),completada:x.querySelector("input").checked}));out.escalas={
 fast:{puntuacion:[...document.querySelectorAll(".fast-item")].filter(x=>x.checked).length, hallazgos:[...document.querySelectorAll(".fast-item:checked")].map(x=>x.parentElement.textContent.trim())},
 cincinnati:{puntuacion:[...document.querySelectorAll(".cinc-item")].filter(x=>x.checked).length, hallazgos:[...document.querySelectorAll(".cinc-item:checked")].map(x=>x.parentElement.textContent.trim())},
 race:{puntuacion:[...document.querySelectorAll(".race-select")].reduce((a,x)=>a+Number(x.value||0),0), items:[...document.querySelectorAll(".race-select")].map(x=>({valor:x.value,descripcion:x.previousElementSibling?.textContent||""})), dominioCortical:$("raceCortical").value},
 nihss:{puntuacion:$("nihssDedicated").value,hora:$("nihssDedicatedTime").value,observaciones:$("nihssNotes").value},
 horaValoracion:$("scaleAssessmentTime").value,evaluador:$("scaleAssessor").value
};out.eventos=events;out.activado=!!activatedAt;out.tiempoActivacion=$("timer").textContent;return out}
function exportJSON(){const blob=new Blob([JSON.stringify(fields(),null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="registro-codigo-ictus.json";a.click();URL.revokeObjectURL(url)}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".panel").forEach(x=>x.classList.toggle("active",x.id===b.dataset.tab))}));
$("activateBtn").addEventListener("click",activate);$("closeBtn").addEventListener("click",closeEpisode);
document.querySelectorAll("[data-now]").forEach(b=>b.addEventListener("click",()=>stamp(b.dataset.now)));
$("vitalsNow").addEventListener("click",()=>stamp("vitalsTime"));
$("addEvent").addEventListener("click",()=>{const v=$("eventNote").value.trim();if(!v)return;addEvent(v);$("eventNote").value=""});
$("printBtn").addEventListener("click",()=>window.print());$("downloadBtn").addEventListener("click",exportJSON);
$("resetBtn").addEventListener("click",()=>{if(!confirm("¿Borrar todos los campos y eventos de esta pestaña? Esta acción no se puede deshacer."))return;clearInterval(timerInterval);timerInterval=null;activatedAt=null;events=[];document.querySelectorAll("input,select,textarea").forEach(e=>{if(e.type==="checkbox")e.checked=false;else if(e.classList.contains("race-select"))e.selectedIndex=0;else e.value=""});updateFast();updateCincinnati();updateRace();$("timer").textContent="00:00:00";$("statusPill").textContent="SIN ACTIVAR";$("statusPill").classList.remove("on");$("activateBtn").disabled=false;$("closeBtn").disabled=true;renderEvents();updateProgress()});
renderChecklist();
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js", {updateViaCache:"none"}).then(reg=>reg.update()).catch(()=>{}));

// Escalas neurológicas: registro descriptivo y cálculo de puntuaciones seleccionadas.
function updateFast(){
 const n=[...document.querySelectorAll(".fast-item")].filter(x=>x.checked).length;
 $("fastScore").textContent=n+"/3";
 $("fastResult").textContent=n===0?"Sin hallazgos marcados.":`${n} de 3 componentes FAST marcados como alterados.`;
}
function updateCincinnati(){
 const n=[...document.querySelectorAll(".cinc-item")].filter(x=>x.checked).length;
 $("cincinnatiScore").textContent=n+"/3";
 $("cincinnatiResult").textContent=n===0?"Sin signos marcados.":`${n} de 3 signos de Cincinnati marcados como anormales.`;
}
function updateRace(){
 const values=[...document.querySelectorAll(".race-select")].map(x=>Number(x.value||0));
 const n=values.reduce((a,b)=>a+b,0);
 $("raceScore").textContent=n+"/9";
 $("raceResult").textContent=`Puntuación RACE registrada: ${n}/9. Confirmar interpretación y umbrales en el protocolo local.`;
}
document.querySelectorAll(".fast-item").forEach(x=>x.addEventListener("change",updateFast));
document.querySelectorAll(".cinc-item").forEach(x=>x.addEventListener("change",updateCincinnati));
document.querySelectorAll(".race-select").forEach(x=>x.addEventListener("change",updateRace));
$("scaleTimeNow").addEventListener("click",()=>{$("scaleAssessmentTime").value=nowLocal()});
$("saveScales").addEventListener("click",()=>{
 const fast=[...document.querySelectorAll(".fast-item")].filter(x=>x.checked).length;
 const cinc=[...document.querySelectorAll(".cinc-item")].filter(x=>x.checked).length;
 const race=[...document.querySelectorAll(".race-select")].reduce((a,x)=>a+Number(x.value||0),0);
 const nihss=$("nihssDedicated").value||"no registrado";
 const cortical=$("raceCortical").value||"no especificado";
 addEvent(`Escalas: FAST ${fast}/3; Cincinnati ${cinc}/3; RACE ${race}/9 (dominio cortical: ${cortical}); NIHSS ${nihss}. Evaluador: ${$("scaleAssessor").value||"no indicado"}`);
});
