/* Browser voice input and speech playback; no credentials or quota grants. */
'use strict';
(()=>{
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 let recognition=null,session=0,status='',speaking=false,speechQueue=[],utterance=null;
 const synthesis=window.speechSynthesis;
 const defaults={voice:'warm',tone:'friendly'};
 let preferences;try{preferences={...defaults,...JSON.parse(localStorage.getItem('business-ai-voice')||'{}')};}catch{preferences={...defaults};}
 window.BIZNES_AI_VOICE_SETTINGS=()=>({...preferences});
 function settings(){
  document.querySelector('.ai-voice-settings-modal')?.remove();
  const known={warm:{name:'Марина',gender:'female'},bright:{name:'Джейн',gender:'female'},alena:{name:'Алёна',gender:'female'},calm:{name:'Ермил',gender:'male'},zahar:{name:'Захар',gender:'male'},filipp:{name:'Филипп',gender:'male'}},available=window.BIZNES_AI_CHAT_BRIDGE?.voices?.(),voices=available?Object.entries(available).map(([id,v])=>[id,v.name||known[id]?.name||v.title,v.gender||known[id]?.gender]):Object.entries(known).map(([id,v])=>[id,v.name,v.gender]),tones=[['friendly','Дружелюбная'],['neutral','Спокойная'],['expressive','Выразительная']];
  document.body.insertAdjacentHTML('beforeend','<div class="content-modal ai-voice-settings-modal" role="dialog" aria-modal="true" aria-labelledby="ai-voice-settings-title"><section class="card content-voice-dialog"><button type="button" class="btn secondary ai-voice-settings-close" data-ai-close-voice-settings aria-label="Закрыть выбор голоса">×</button><h2 id="ai-voice-settings-title">Выбор голоса</h2><label>Голос<select name="ai-playback-voice">'+[['female','Женские голоса'],['male','Мужские голоса']].map(([gender,label])=>'<optgroup label="'+label+'">'+voices.filter(v=>v[2]===gender).map(([key,title])=>'<option value="'+key+'" '+(preferences.voice===key?'selected':'')+'>'+title+' — '+(gender==='male'?'мужской':'женский')+'</option>').join('')+'</optgroup>').join('')+'</select></label><label>Интонация<select name="ai-playback-tone">'+tones.map(([key,title])=>'<option value="'+key+'" '+(preferences.tone===key?'selected':'')+'>'+title+'</option>').join('')+'</select></label><p class="muted">'+(window.BIZNES_AI_CONTENT_CONFIG?.voiceApiUrl?'Эти настройки используются при прослушивании.':'Выбор для нейроозвучки сохранится. Пока она не подключена, ответы читает доступный русский голос устройства.')+'</p><button type="button" class="btn" data-ai-close-voice-settings>Готово</button></section></div>');
  document.querySelector('[name=ai-playback-voice]')?.focus();
 }
 function note(message){window.BUSINESS_CHAT_OPERATION_NOTICE?.('microphone',message);status=message;document.querySelectorAll('[data-ai-voice-status]').forEach(x=>x.textContent=message);}
 function stopInput(){session++;const old=recognition;recognition=null;try{old?.abort();}catch{}updateButtons();}
 function stopSpeech(){session++;speechQueue=[];utterance=null;speaking=false;synthesis?.cancel();updateButtons();}
 function updateButtons(){document.querySelectorAll('[data-ai-mic]').forEach(b=>{b.textContent=b.hasAttribute('data-ai-chat-mic')?(recognition?'■':'🎙'):(recognition?'■ Остановить запись':'🎙 Надиктовать');b.setAttribute('aria-pressed',String(!!recognition));});document.querySelectorAll('[data-ai-speech-stop]').forEach(b=>b.hidden=!speaking);}
 function enhance(){
  const root=document.querySelector('.ai-page');if(!root){if(recognition)stopInput();if(speaking)stopSpeech();return;}
  const form=root.querySelector('#ai-task-form');
  if(form&&!form.querySelector('[data-ai-voice-controls]')){
   const imageMode=!!form.querySelector('.ai-image-prompt');const inline=!!form.closest('.ai-chat-main')||imageMode;const controls=document.createElement('div');controls.dataset.aiVoiceControls='';controls.className='ai-voice-controls'+(inline?' ai-chat-inline-voice':'');
   const button=document.createElement('button');button.type='button';button.className='btn secondary';button.dataset.aiMic='';button.disabled=!Recognition;button.title=Recognition?'Надиктовать сообщение. Браузер запросит доступ к микрофону.':'В этом браузере распознавание речи недоступно.';if(inline){button.dataset.aiChatMic='';button.setAttribute('aria-label','Надиктовать сообщение');}controls.append(button);
   const listen=document.createElement('button');listen.type='button';listen.className='btn secondary';listen.dataset.aiListenDraft='';listen.textContent=inline?'🔊':'▶ Прослушать мой текст';listen.title='Прослушать текст сообщения';listen.setAttribute('aria-label','Прослушать текст сообщения');listen.disabled=!synthesis&&!window.BIZNES_AI_CONTENT_CONFIG?.voiceApiUrl;if(!imageMode)controls.append(listen);
   const stop=document.createElement('button');stop.type='button';stop.className='btn secondary';stop.dataset.aiSpeechStop='';stop.textContent=inline?'■':'■ Остановить';stop.title='Остановить прослушивание';stop.setAttribute('aria-label','Остановить прослушивание');if(!imageMode)controls.append(stop);
   const action=form.querySelector('[name="ai-action"]');if(action&&Array.from(action.options).some(x=>x.value==='Кратко изложи содержание приложенного файла')){const summarize=document.createElement('button');summarize.type='button';summarize.className='btn secondary';summarize.dataset.aiExplainFile='';summarize.textContent='Объяснить содержимое документа';controls.append(summarize);}
   if(inline&&!imageMode){const choice=document.createElement('button');choice.type='button';choice.className='btn secondary ai-voice-choice';choice.dataset.aiVoiceSettings='';choice.textContent='Выбор голоса';choice.title='Выбрать голос и интонацию';controls.prepend(choice);}
   const text=document.createElement('span');text.dataset.aiVoiceStatus='';text.setAttribute('role','status');text.textContent=status||(!Recognition?'Голосовой ввод не поддерживается этим браузером.':inline?'':'Речь распознаёт браузер; текст можно проверить перед отправкой.');if(inline){if(imageMode){controls.className='ai-voice-controls ai-image-mic';form.querySelector('.ai-image-prompt').append(controls);}else form.querySelector('.ai-chat-compose-actions').prepend(controls);text.className='ai-chat-voice-status';form.append(text);}else{controls.append(text);form.append(controls);}
  }
  root.querySelectorAll('.ai-message-assistant,.ai-result-text').forEach(node=>{
   if(window.BIZNES_AI_CONTENT_CONFIG?.voiceApiUrl)return;
   if(node.querySelector('[data-ai-speak],[data-content-speak]'))return;
   const controls=document.createElement('div');controls.className='ai-voice-controls';
   const button=document.createElement('button');button.type='button';button.className='btn secondary';if(window.BIZNES_AI_CONTENT_CONFIG?.voiceApiUrl){button.dataset.contentSpeak='';button.textContent='▶ Нейроголос';}else{button.dataset.aiSpeak='';button.textContent='▶ Прослушать';button.disabled=!synthesis;}controls.append(button);
   const stop=document.createElement('button');stop.type='button';stop.className='btn secondary';stop.dataset.aiSpeechStop='';stop.textContent='■ Остановить';stop.title='Остановить прослушивание';stop.setAttribute('aria-label','Остановить прослушивание');controls.append(stop);node.append(controls);
  });updateButtons();
 }
 function dictate(){
  if(recognition){stopInput();note('Запись остановлена. Проверьте текст перед отправкой.');return;}
  const input=document.querySelector('.ai-page [name="ai-prompt"]');if(!input||input.disabled)return;
  if(!Recognition){note('Этот браузер не поддерживает голосовой ввод.');return;}
  stopSpeech();const owner=String(currentUser?.email||''),mode=page,my=++session;const base=input.value.trim();const single=matchMedia('(pointer: coarse)').matches||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);let finalized=false;
  const r=new Recognition();recognition=r;r.lang='ru-RU';r.continuous=!single;r.interimResults=true;
  r.onstart=()=>{if(my===session){note(single?'Слушаю одну фразу… После паузы запись завершится.':'Слушаю… Нажмите микрофон, когда закончите.');updateButtons();}};
  r.onresult=e=>{if(my!==session||page!==mode||String(currentUser?.email||'')!==owner||single&&finalized)return;let transcript='';if(single){const result=e.results[e.results.length-1];if(!result)return;transcript=String(result[0]?.transcript||'').trim();if(result.isFinal)finalized=true;}else{const parts=[];for(let i=0;i<e.results.length;i++)parts.push(String(e.results[i][0]?.transcript||'').trim());transcript=parts.filter(Boolean).join(' ');}const target=document.querySelector('.ai-page [name="ai-prompt"]');if(!target)return;target.value=[base,transcript].filter(Boolean).join(' ').slice(0,target.maxLength>0?target.maxLength:6000);target.dispatchEvent(new Event('input',{bubbles:true}));if(single&&finalized){try{r.stop?.();}catch{}}};
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
  let text=plainText;if(text===undefined&&node)text=window.BIZNES_AI_SPEAKABLE_MESSAGE?.(node)??undefined;if(text===undefined){const copy=node.cloneNode(true);copy.querySelectorAll('.ai-voice-controls,article>strong').forEach(x=>x.remove());text=copy.textContent;}text=speechText(text);if(!text){note('Сначала введите или надиктуйте текст.');return;}
  const voices=synthesis.getVoices();const preferred={warm:/marina|марина/i,bright:/jane|джейн/i,calm:/ermil|ермил/i}[preferences.voice]||/marina/i;const russian=voices.filter(v=>/^ru(?:-|_)/i.test(v.lang)).sort((a,b)=>Number(preferred.test(b.name))-Number(preferred.test(a.name))||Number(/natural|neural|online|google|yandex/i.test(b.name))-Number(/natural|neural|online|google|yandex/i.test(a.name)))[0];
  if(!russian){note('На устройстве нет русского голоса. Добавьте русский голос в настройках речи устройства и попробуйте снова.');return;}
  speechQueue=speechParts(text);speaking=true;note('Читаю ответ вслух…');updateButtons();
  function next(){if(my!==session)return;if(!speechQueue.length){speaking=false;note('Чтение завершено.');updateButtons();return;}utterance=new SpeechSynthesisUtterance(speechQueue.shift());utterance.lang='ru-RU';utterance.voice=russian;utterance.rate=preferences.tone==='neutral'?.9:preferences.tone==='expressive'?1.03:.96;utterance.pitch=preferences.tone==='expressive'?1.08:1;utterance.onend=next;utterance.onerror=e=>{if(my!==session)return;speaking=false;speechQueue=[];note('Не удалось озвучить ответ. Проверьте настройки звука устройства.');updateButtons();};synthesis.speak(utterance);}next();
 }
 document.addEventListener('click',e=>{
  if(e.target.closest('[data-ai-voice-settings]')){settings();return;}
  if(e.target.closest('[data-ai-close-voice-settings]')){document.querySelector('.ai-voice-settings-modal')?.remove();document.querySelector('[data-ai-voice-settings]')?.focus();return;}
  if(e.target.closest('[data-ai-listen-draft]')){if(window.BIZNES_AI_NEURAL_PLAY){const last=document.querySelector('.ai-message-assistant:last-of-type');const text=last?(window.BIZNES_AI_SPEAKABLE_MESSAGE?.(last)||last.querySelector('.ai-message-text')?.textContent||last.textContent):document.querySelector('.ai-page [name=ai-prompt]')?.value;void window.BIZNES_AI_NEURAL_PLAY(text);return;}const last=document.querySelector('.ai-message-assistant:last-of-type');if(last){const play=last.querySelector('[data-content-speak],[data-ai-speak]');if(play)play.click();else speak(last);}else speak(null,document.querySelector('.ai-page [name="ai-prompt"]')?.value);return;}
  if(e.target.closest('[data-ai-explain-file]')){const form=document.querySelector('#ai-task-form'),input=form?.querySelector('[name="ai-prompt"]'),action=form?.querySelector('[name="ai-action"]');if(!input)return;action.value='Кратко изложи содержание приложенного файла';action.dispatchEvent(new Event('change',{bubbles:true}));input.value='Объясни простыми словами содержание приложенного документа. Выдели важные сроки, суммы и обязательства. Подготовь связный рассказ, который удобно слушать вслух.';input.dispatchEvent(new Event('input',{bubbles:true}));const send=form.querySelector('[type=submit]');if(send&&!send.disabled)form.requestSubmit();else note('Для объяснения документа нужен доступный AI-лимит. После получения ответа нажмите «Прослушать».');return;}
  if(e.target.closest('[data-ai-mic]')){dictate();return;}
  const button=e.target.closest('[data-ai-speak]');if(button){speak(button.closest('.ai-message-assistant,.ai-result-text'));return;}
  if(e.target.closest('[data-ai-speech-stop]')){window.BIZNES_AI_NEURAL_STOP?.();stopSpeech();note('Чтение остановлено.');return;}
  if(e.target.closest('[data-ai-new],[data-ai-tool],[data-ai-menu],[data-ai-history],[data-go-home],[data-go-back],[data-page],[data-landing-logout]')){window.BIZNES_AI_NEURAL_STOP?.();stopInput();stopSpeech();status='';}
 },true);
 document.addEventListener('change',e=>{if(e.target.name==='ai-playback-voice')preferences.voice=e.target.value;else if(e.target.name==='ai-playback-tone')preferences.tone=e.target.value;else return;try{localStorage.setItem('business-ai-voice',JSON.stringify(preferences));}catch{}});
 document.addEventListener('keydown',e=>{const modal=document.querySelector('.ai-voice-settings-modal');if(!modal)return;if(e.key==='Escape'){modal.remove();document.querySelector('[data-ai-voice-settings]')?.focus();}if(e.key==='Tab'){const fields=[...modal.querySelectorAll('button,select')],first=fields[0],last=fields.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
 document.addEventListener('submit',e=>{if(e.target.id==='ai-task-form')stopInput();},true);
 window.addEventListener('pagehide',()=>{stopInput();stopSpeech();});window.addEventListener('popstate',()=>{stopInput();stopSpeech();});
 const previousRender=render;render=function(){previousRender();enhance();};enhance();
})();
