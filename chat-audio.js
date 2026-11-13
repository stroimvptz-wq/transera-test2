'use strict';
(()=>{
 const cfg=window.BIZNES_AI_CHAT_CONFIG||{};
 if(!cfg.serverReady)return;
 let player=null,objectURL=null,epoch=0,busy=false,fingerprint=null;
 const note=value=>document.querySelectorAll('[data-ai-voice-status]').forEach(n=>n.textContent=value);
 function stop(){epoch++;busy=false;player?.pause();player=null;if(objectURL)URL.revokeObjectURL(objectURL);objectURL=null;fingerprint=null;note('');}
 async function api(route,body){const token=sessionStorage.getItem('business-ai-test2-auth-token');if(!token)throw Error('Войдите в аккаунт заново.');const response=await fetch(cfg.apiUrl+'?route='+encodeURIComponent(route.split('?')[0])+(route.includes('?')?'&'+route.split('?')[1]:''),{method:body?'POST':'GET',headers:{'X-TRANSERA-Token':'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(body?90000:20000)});const d=await response.json();if(!response.ok||!d.ok)throw Error(d.error||'Не удалось получить озвучку.');return d;}
 window.BIZNES_AI_NEURAL_STOP=stop;
 window.BIZNES_AI_NEURAL_PLAY=async value=>{
  if(busy||player&&!player.paused){stop();return;}
  const settings=window.BIZNES_AI_VOICE_SETTINGS?.()||{},requested=JSON.stringify([String(currentUser?.email||''),String(value||'').slice(0,6000),settings.voice,settings.tone]);
  if(player?.paused&&fingerprint===requested){try{await player.play();note('Читаю ответ.');}catch{note('Нажмите динамик, чтобы разрешить звук.');}return;}
  stop();const my=epoch,owner=String(currentUser?.email||'');const same=()=>my===epoch&&owner===String(currentUser?.email||'');
  const text=Array.from(String(value||'')).slice(0,3000).join('').trim();if(!text){note('Пока нет текста для прослушивания.');return;}
  busy=true;note('Готовлю озвучку…');
  try{
   const payload={mode:'speech',text,voice:settings.voice||'warm',tone:settings.tone||'friendly'};
   const q=await api('/quote',payload);if(!same())return;
   const d=await api('/generate',{...payload,maxChargeMicro:q.maxChargeMicro});if(!same())return;
   if(d.request?.status!=='complete')throw Error(d.request?.error||'Не удалось завершить озвучку.');
   let offset=0,size=null;const chunks=[];
   for(let n=0;n<70;n++){
    const f=await api('/file?id='+encodeURIComponent(d.request.id)+'&offset='+offset);if(!same())return;
    if(f.mime!=='audio/wav'||!Number.isSafeInteger(f.size)||f.size>13000000||size!==null&&f.size!==size)throw Error('Сервис вернул некорректный аудиофайл.');size=f.size;
    const bytes=Uint8Array.from(atob(f.data),c=>c.charCodeAt(0));if(f.nextOffset!==offset+bytes.length||!bytes.length)throw Error('Аудиофайл загрузился не полностью.');chunks.push(bytes);offset=f.nextOffset;if(f.done)break;
   }
   if(offset!==size)throw Error('Аудиофайл загрузился не полностью.');
   objectURL=URL.createObjectURL(new Blob(chunks,{type:'audio/wav'}));player=new Audio(objectURL);fingerprint=requested;
   player.onended=()=>{if(same()){busy=false;note('Чтение завершено.');}};
   await player.play();if(same()){busy=false;note('Читаю ответ. Нажмите динамик ещё раз, чтобы остановить.');document.querySelector('[data-ai-refresh]')?.click();}
  }catch(e){if(same()){busy=false;note(e.name==='NotAllowedError'?'Браузер заблокировал звук. Нажмите динамик ещё раз.':e.message);}}
 };
 document.addEventListener('click',e=>{if(e.target.closest('[data-ai-new],[data-ai-menu],[data-ai-tool],[data-go-home],[data-go-back],[data-page],[data-landing-logout]'))stop();},true);
 window.addEventListener('pagehide',stop);
})();
