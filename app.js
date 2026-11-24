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
};out.criteriosActivacion={
 sospechaCincinnati:[...document.querySelectorAll(".cinc-item")].filter(x=>x.checked).length,
 "inicioDesconocidoODespertar":$("unknownOnset").checked,
 excepcionMRS3Protocolizada:$("mrs3Exception").checked,
 resultado:$("activationDecision").textContent
};out.eventos=events;out.activado=!!activatedAt;out.tiempoActivacion=$("timer").textContent;return out}
function exportJSON(){const blob=new Blob([JSON.stringify(fields(),null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="registro-codigo-ictus.json";a.click();URL.revokeObjectURL(url)}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".panel").forEach(x=>x.classList.toggle("active",x.id===b.dataset.tab))}));
$("goScalesBtn").addEventListener("click",()=>document.querySelector('[data-tab="escalas"]').click());
["unknownOnset","mrs3Exception","onset","lkw","mrs","glucose"].forEach(id=>$(id).addEventListener("change",evaluateActivation));
document.querySelectorAll(".cinc-item").forEach(x=>x.addEventListener("change",evaluateActivation));
$("onset").addEventListener("input",evaluateActivation);$("lkw").addEventListener("input",evaluateActivation);$("glucose").addEventListener("input",evaluateActivation);
$("activateBtn").addEventListener("click",activate);$("closeBtn").addEventListener("click",closeEpisode);
document.querySelectorAll("[data-now]").forEach(b=>b.addEventListener("click",()=>stamp(b.dataset.now)));
$("vitalsNow").addEventListener("click",()=>stamp("vitalsTime"));
$("addEvent").addEventListener("click",()=>{const v=$("eventNote").value.trim();if(!v)return;addEvent(v);$("eventNote").value=""});
$("printBtn").addEventListener("click",()=>window.print());$("downloadBtn").addEventListener("click",exportJSON);
$("resetBtn").addEventListener("click",()=>{if(!confirm("¿Borrar todos los campos y eventos de esta pestaña? Esta acción no se puede deshacer."))return;clearInterval(timerInterval);timerInterval=null;activatedAt=null;events=[];document.querySelectorAll("input,select,textarea").forEach(e=>{if(e.type==="checkbox")e.checked=false;else if(e.classList.contains("race-select"))e.selectedIndex=0;else e.value=""});updateFast();updateCincinnati();updateRace();$("timer").textContent="00:00:00";$("statusPill").textContent="SIN ACTIVAR";$("statusPill").classList.remove("on");$("activateBtn").disabled=false;$("closeBtn").disabled=true;renderEvents();updateProgress();evaluateActivation()});
renderChecklist();\nevaluateActivation();

function evaluateActivation(){
 const cinc=[...document.querySelectorAll(".cinc-item")].filter(x=>x.checked).length;
 const unknown=$("unknownOnset").checked;
 const onset=$("onset").value, lkw=$("lkw").value;
 const timeValue=onset||lkw;
 let timeState="missing", timeText="Pendiente de registrar inicio o LKW.";
 if(unknown){timeState="pass";timeText="Inicio desconocido / ictus del despertar marcado: cumple el criterio temporal configurado."}
 else if(timeValue){
   const elapsed=(Date.now()-new Date(timeValue).getTime())/3600000;
   if(!Number.isFinite(elapsed)){timeState="missing";timeText="No se pudo interpretar la fecha/hora; revisa el dato."}
   else if(elapsed<0){timeState="missing";timeText="La fecha/hora registrada está en el futuro; revisa el dato."}
   else if(elapsed<24){timeState="pass";timeText=`${elapsed.toFixed(1)} h desde ${onset?"el inicio conocido":"LKW"}: cumple (<24 h).`}
   else {timeState="fail";timeText=`${elapsed.toFixed(1)} h desde ${onset?"el inicio conocido":"LKW"}: supera 24 h.`}
 }
 const mrs=$("mrs").value;
 const exception=$("mrs3Exception").checked;
 let mrsState="missing",mrsText="Pendiente de registrar mRS.";
 if(mrs!==""){
   const n=Number(mrs);
   if(n<=2){mrsState="pass";mrsText=`mRS ${n}: cumple (≤2).`}
   else if(n===3 && exception){mrsState="pass";mrsText="mRS 3: excepción marcada; confirmar que está autorizada en el protocolo local."}
   else {mrsState="fail";mrsText=n===3?"mRS 3: no cumple salvo excepción protocolizada marcada.":`mRS ${n}: no cumple el criterio configurado (≤2; salvo excepción protocolizada para mRS 3).`}
 }
 const glucose=$("glucose").value;
 let glucoseState="missing",glucoseText="Pendiente de registrar glucemia.";
 if(glucose!==""){
   const g=Number(glucose);
   if(!Number.isFinite(g)||g<0){glucoseState="missing";glucoseText="Valor de glucemia no válido."}
   else if(g<60){glucoseState="fail";glucoseText=`${g} mg/dL: inferior a 60 mg/dL. Corregir y reevaluar según protocolo.`}
   else {glucoseState="pass";glucoseText=`${g} mg/dL: cumple (≥60 mg/dL).`}
 }
 $("activationCincinnati").textContent=`${cinc}/3 signos positivos · ${cinc>=1?"Cumple sospecha clínica (≥1).":"No cumple sospecha clínica (se requiere ≥1)."}`
 $("activationTimeResult").textContent=timeText;
 $("activationMrsResult").textContent=mrsText;
 $("activationGlucoseResult").textContent=glucoseText;
 const states=[cinc>=1?"pass":"fail",timeState,mrsState,glucoseState];
 const missing=states.includes("missing");
 const fails=states.includes("fail");
 const decision=$("activationDecision"), reasons=$("activationReasons");
 reasons.innerHTML="";
 if(missing){
   decision.className="activation-result pending";
   decision.textContent="INCOMPLETO · Faltan datos o hay fechas no válidas.";
   if(cinc<1) reasons.innerHTML+="<li>Cincinnati requiere al menos un signo positivo.</li>";
   if(timeState==="missing") reasons.innerHTML+="<li>Completa inicio/LKW o marca despertar/inicio desconocido.</li>";
   if(mrsState==="missing") reasons.innerHTML+="<li>Registra mRS basal.</li>";
   if(glucoseState==="missing") reasons.innerHTML+="<li>Registra glucemia capilar.</li>";
 } else if(fails){
   decision.className="activation-result fail";
   decision.textContent=glucoseState==="fail" && Number(glucose)<60 ? "NO CUMPLE · Glucemia <60 mg/dL: corregir y reevaluar según protocolo." : "NO CUMPLE · Uno o más criterios de inclusión no se satisfacen.";
   if(cinc<1) reasons.innerHTML+="<li>Cincinnati 0/3: no alcanza el criterio de sospecha clínica.</li>";
   if(timeState==="fail") reasons.innerHTML+="<li>Tiempo de evolución superior o igual a 24 horas.</li>";
   if(mrsState==="fail") reasons.innerHTML+="<li>Situación funcional basal fuera del criterio configurado.</li>";
   if(glucoseState==="fail") reasons.innerHTML+="<li>Glucemia inferior a 60 mg/dL; corregir y reevaluar según protocolo.</li>";
 } else {
   decision.className="activation-result pass";
   decision.textContent="CUMPLE LOS CRITERIOS CONFIGURADOS · Considerar ACTIVACIÓN según protocolo local.";
   reasons.innerHTML="<li>Cincinnati ≥1.</li><li>Tiempo <24 h o inicio desconocido / ictus del despertar.</li><li>mRS ≤2 o excepción protocolizada mRS 3 marcada.</li><li>Glucemia ≥60 mg/dL.</li>";
 }
}
\nif("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js", {updateViaCache:"none"}).then(reg=>reg.update()).catch(()=>{}));

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
