/* Visual activity only: never persisted, billed or included in model history. */
'use strict';
(()=>{
 let scheduled=false;
 function update(){
  scheduled=false;
  for(const form of document.querySelectorAll('.ai-chat-main #ai-task-form,[data-media-form]')){
  let indicator=form.querySelector('[data-chat-activity]');
  if(!indicator){indicator=document.createElement('div');indicator.dataset.chatActivity='';indicator.className='chat-activity';indicator.hidden=true;indicator.setAttribute('role','status');indicator.setAttribute('aria-live','polite');indicator.innerHTML='<span class="chat-activity-orbit" aria-hidden="true"></span><span class="chat-activity-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="chat-activity-label">AI бизнес</span>';form.prepend(indicator);}
  const busy=form.getAttribute('aria-busy')==='true'||form.querySelector('.ai-chat-send')?.getAttribute('aria-busy')==='true';
  const recording=form.querySelector('[data-ai-mic],[data-media-mic]')?.getAttribute('aria-pressed')==='true';
  const typing=document.activeElement===form.querySelector('[name=ai-prompt],[name=prompt]')&&!!form.querySelector('[name=ai-prompt],[name=prompt]')?.value.trim();
  const mode=busy?'thinking':recording?'listening':typing?'writing':'';
  if(indicator.dataset.mode!==mode){indicator.dataset.mode=mode;indicator.hidden=!mode;indicator.setAttribute('aria-label',({thinking:'AI бизнес готовит ответ',listening:'Идёт запись голоса',writing:'Вы вводите сообщение'})[mode]||'');}
  if(form.dataset.activity!==mode)form.dataset.activity=mode;
  }
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-busy','aria-pressed']});
 for(const name of ['input','focusin','focusout'])document.addEventListener(name,schedule);
 window.addEventListener('pagehide',()=>{document.querySelector('[data-chat-activity]')?.remove();});
 schedule();
})();
