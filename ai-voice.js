/* Browser voice input and speech playback; no credentials or quota grants. */
'use strict';
(()=>{
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 let recognition=null,session=0,status='',speaking=false,speechQueue=[],utterance=null;
 const synthesis=window.speechSynthesis;
 function note(message){status=message;document.querySelectorAll('[data-ai-voice-status]').forEach(x=>x.textContent=message);}
 function stopInput(){session++;const old=recognition;recognition=null;try{old?.abort();}catch{}updateButtons();}
 function stopSpeech(){session++;speechQueue=[];utterance=null;speaking=false;synthesis?.cancel();updateButtons();}
 function updateButtons(){document.querySelectorAll('[data-ai-mic]').forEach(b=>{b.textContent=b.hasAttribute('data-ai-chat-mic')?(recognition?'■':'🎙'):(recognition?'■ Остановить запись':'🎙 Надиктовать');b.setAttribute('aria-pressed',String(!!recognition));});document.querySelectorAll('[data-ai-speech-stop]').forEach(b=>b.hidden=!speaking);}
 function enhance(){
  const root=document.querySelector('.ai-page');if(!root){if(recognition)stopInput();if(speaking)stopSpeech();return;}
  const form=root.querySelector('#ai-task-form');
  if(form&&!form.querySelector('[data-ai-voice-controls]')){
   const inline=!!form.closest('.ai-chat-main');const controls=document.createElement('div');controls.dataset.aiVoiceControls='';controls.className='ai-voice-controls'+(inline?' ai-chat-inline-voice':'');
   const button=document.createElement('button');button.type='button';button.className='btn secondary';button.dataset.aiMic='';button.disabled=!Recognition;button.title=Recognition?'Надиктовать сообщение. Браузер запросит доступ к микрофону.':'В этом браузере распознавание речи недоступно.';if(inline){button.dataset.aiChatMic='';button.setAttribute('aria-label','Надиктовать сообщение');}controls.append(button);
   const listen=document.createElement('button');listen.type='button';listen.className='btn secondary';listen.dataset.aiListenDraft='';listen.textContent=inline?'🔊':'▶ Прослушать мой текст';listen.title='Прослушать текст сообщения';listen.setAttribute('aria-label','Прослушать текст сообщения');listen.disabled=!synthesis;controls.append(listen);
   const stop=document.createElement('button');stop.type='button';stop.className='btn secondary';stop.dataset.aiSpeechStop='';stop.textContent=inline?'■':'■ Остановить';stop.title='Остановить прослушивание';stop.setAttribute('aria-label','Остановить прослушивание');controls.append(stop);
   const action=form.querySelector('[name="ai-action"]');if(action&&Array.from(action.options).some(x=>x.value==='Кратко изложи содержание приложенного файла')){const summarize=document.createElement('button');summarize.type='button';summarize.className='btn secondary';summarize.dataset.aiExplainFile='';summarize.textContent='Объяснить содержимое документа';controls.append(summarize);}
   const text=document.createElement('span');text.dataset.aiVoiceStatus='';text.setAttribute('role','status');text.textContent=status||(!Recognition?'Голосовой ввод не поддерживается этим браузером.':inline?'':'Речь распознаёт браузер; текст можно проверить перед отправкой.');if(inline){form.querySelector('.ai-chat-compose-actions').prepend(controls);text.className='ai-chat-voice-status';form.append(text);}else{controls.append(text);form.append(controls);}
  }
  root.querySelectorAll('.ai-message-assistant,.ai-result-text').forEach(node=>{
   if(node.querySelector('[data-ai-speak]'))return;
   const controls=document.createElement('div');controls.className='ai-voice-controls';
   const button=document.createElement('button');button.type='button';button.className='btn secondary';button.dataset.aiSpeak='';button.textContent='▶ Прослушать';button.disabled=!synthesis;controls.append(button);
   const stop=document.createElement('button');stop.type='button';stop.className='btn secondary';stop.dataset.aiSpeechStop='';stop.textContent='■ Остановить';stop.title='Остановить прослушивание';stop.setAttribute('aria-label','Остановить прослушивание');controls.append(stop);node.append(controls);
  });updateButtons();
 }
 function dictate(){
  if(recognition){stopInput();note('Запись остановлена. Проверьте текст перед отправкой.');return;}
  const input=document.querySelector('.ai-page [name="ai-prompt"]');if(!input||input.disabled)return;
  if(!Recognition){note('Этот браузер не поддерживает голосовой ввод.');return;}
  stopSpeech();const owner=String(currentUser?.email||''),mode=page,my=++session;const base=input.value.trim();const segments=new Map();
  const r=new Recognition();recognition=r;r.lang='ru-RU';r.continuous=true;r.interimResults=true;
  r.onstart=()=>{if(my===session){note('Слушаю… Нажмите «Остановить запись», когда закончите.');updateButtons();}};
  r.onresult=e=>{if(my!==session||page!==mode||String(currentUser?.email||'')!==owner)return;for(const key of segments.keys())if(key>=e.results.length)segments.delete(key);for(let i=e.resultIndex;i<e.results.length;i++){segments.set(i,String(e.results[i][0].transcript||'').trim());}const transcript=[...segments.entries()].sort((a,b)=>a[0]-b[0]).map(([,text])=>text).filter(Boolean).join(' ');
   const target=document.querySelector('.ai-page [name="ai-prompt"]');if(!target)return;target.value=[base,transcript].filter(Boolean).join(' ').slice(0,target.maxLength>0?target.maxLength:6000);target.dispatchEvent(new Event('input',{bubbles:true}));
  };
  r.onerror=e=>{if(my!==session)return;recognition=null;const messages={'not-allowed':'Доступ к микрофону запрещён. Разрешите его в настройках сайта рядом с адресом.','audio-capture':'Микрофон не найден или занят другим приложением.','network':'Сервис распознавания браузера недоступен. Попробуйте другой браузер или введите текст.','no-speech':'Речь не услышана. Нажмите микрофон и попробуйте снова.','service-not-allowed':'Браузер не разрешает распознавание речи.'};note(messages[e.error]||'Не удалось распознать речь. Попробуйте ещё раз.');updateButtons();};
  r.onend=()=>{if(my!==session)return;recognition=null;if(status.startsWith('Слушаю'))note('Запись завершена. Проверьте текст и нажмите «Отправить».');updateButtons();};
  try{r.start();updateButtons();}catch{recognition=null;note('Не удалось включить микрофон. Проверьте разрешения браузера.');updateButtons();}
 }

 function speechText(value){return String(value||'')
  .replace(/```[\s\S]*?```/g,' Фрагмент кода. ')
  .replace(/!\[([^\]]*)\]\([^)]*\)/g,'$1')
  .replace(/\[([^\]]+)\]\([^)]*\)/g,'$1')
  .replace(/https?:\/\/\S+/g,' ссылка ')
  .replace(/^\s{0,3}#{1,6}\s+/gm,'')
  .replace(/^\s*(?:[-*+]|\d+[.)])\s+/gm,'')
  .replace(/[*_`~#|]/g,'')
  .replace(/\n{2,}/g,'. ')
  .replace(/\n/g,' ')
  .replace(/([.!?])\s*[.!?]+/g,'$1')
  .replace(/\s+([,.;:!?])/g,'$1')
  .replace(/\s+/g,' ').trim();
 }
 function speechParts(text){const sentences=text.match(/[^.!?]+(?:[.!?]+|$)/g)||[text];const parts=[];for(const sentence of sentences){const words=sentence.trim().split(/\s+/);let part='';for(const word of words){if(part.length+word.length>220&&part){parts.push(part);part='';}part+=(part?' ':'')+word;}if(part)parts.push(part);}return parts;}
 function speak(node,plainText){
  if(!synthesis)return;stopInput();stopSpeech();const my=++session;
  let text=plainText;if(text===undefined){const copy=node.cloneNode(true);copy.querySelectorAll('.ai-voice-controls,article>strong').forEach(x=>x.remove());text=copy.textContent;}text=speechText(text);if(!text){note('Сначала введите или надиктуйте текст.');return;}
  const voices=synthesis.getVoices();const russian=voices.filter(v=>/^ru(?:-|_)/i.test(v.lang)).sort((a,b)=>Number(/natural|neural|online|google|yandex/i.test(b.name))-Number(/natural|neural|online|google|yandex/i.test(a.name)))[0];
  if(!russian){note('На устройстве нет русского голоса. Добавьте русский голос в настройках речи устройства и попробуйте снова.');return;}
  speechQueue=speechParts(text);speaking=true;note('Читаю ответ вслух…');updateButtons();
  function next(){if(my!==session)return;if(!speechQueue.length){speaking=false;note('Чтение завершено.');updateButtons();return;}utterance=new SpeechSynthesisUtterance(speechQueue.shift());utterance.lang='ru-RU';utterance.voice=russian;utterance.rate=.96;utterance.pitch=1;utterance.onend=next;utterance.onerror=e=>{if(my!==session)return;speaking=false;speechQueue=[];note('Не удалось озвучить ответ. Проверьте настройки звука устройства.');updateButtons();};synthesis.speak(utterance);}next();
 }
 document.addEventListener('click',e=>{
  if(e.target.closest('[data-ai-listen-draft]')){speak(null,document.querySelector('.ai-page [name="ai-prompt"]')?.value);return;}
  if(e.target.closest('[data-ai-explain-file]')){const form=document.querySelector('#ai-task-form'),input=form?.querySelector('[name="ai-prompt"]'),action=form?.querySelector('[name="ai-action"]');if(!input)return;action.value='Кратко изложи содержание приложенного файла';action.dispatchEvent(new Event('change',{bubbles:true}));input.value='Объясни простыми словами содержание приложенного документа. Выдели важные сроки, суммы и обязательства. Подготовь связный рассказ, который удобно слушать вслух.';input.dispatchEvent(new Event('input',{bubbles:true}));const send=form.querySelector('[type=submit]');if(send&&!send.disabled)form.requestSubmit();else note('Для объяснения документа нужен доступный AI-лимит. После получения ответа нажмите «Прослушать».');return;}
  if(e.target.closest('[data-ai-mic]')){dictate();return;}
  const button=e.target.closest('[data-ai-speak]');if(button){speak(button.closest('.ai-message-assistant,.ai-result-text'));return;}
  if(e.target.closest('[data-ai-speech-stop]')){stopSpeech();note('Чтение остановлено.');return;}
  if(e.target.closest('[data-ai-new],[data-ai-tool],[data-ai-menu],[data-ai-history],[data-go-home],[data-go-back],[data-page],[data-landing-logout]')){stopInput();stopSpeech();status='';}
 },true);
 document.addEventListener('submit',e=>{if(e.target.id==='ai-task-form')stopInput();},true);
 window.addEventListener('pagehide',()=>{stopInput();stopSpeech();});window.addEventListener('popstate',()=>{stopInput();stopSpeech();});
 const previousRender=render;render=function(){previousRender();enhance();};enhance();
})();
