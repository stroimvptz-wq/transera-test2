/* Browser voice input and speech playback; no credentials or quota grants. */
'use strict';
(()=>{
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 let recognition=null,session=0,status='',speaking=false,speechQueue=[],utterance=null;
 const synthesis=window.speechSynthesis;
 function note(message){status=message;document.querySelectorAll('[data-ai-voice-status]').forEach(x=>x.textContent=message);}
 function stopInput(){session++;const old=recognition;recognition=null;try{old?.abort();}catch{}updateButtons();}
 function stopSpeech(){session++;speechQueue=[];utterance=null;speaking=false;synthesis?.cancel();updateButtons();}
 function updateButtons(){document.querySelectorAll('[data-ai-mic]').forEach(b=>{b.textContent=recognition?'■ Остановить запись':'🎙 Надиктовать';b.setAttribute('aria-pressed',String(!!recognition));});document.querySelectorAll('[data-ai-speech-stop]').forEach(b=>b.hidden=!speaking);}
 function enhance(){
  const root=document.querySelector('.ai-page');if(!root){if(recognition)stopInput();if(speaking)stopSpeech();return;}
  const form=root.querySelector('#ai-task-form');
  if(form&&!form.querySelector('[data-ai-voice-controls]')){
   const controls=document.createElement('div');controls.dataset.aiVoiceControls='';controls.className='ai-voice-controls';
   const button=document.createElement('button');button.type='button';button.className='btn secondary';button.dataset.aiMic='';button.disabled=!Recognition;button.title=Recognition?'Надиктовать сообщение. Браузер запросит доступ к микрофону.':'В этом браузере распознавание речи недоступно.';controls.append(button);
   const text=document.createElement('span');text.dataset.aiVoiceStatus='';text.setAttribute('role','status');text.textContent=status||(!Recognition?'Голосовой ввод не поддерживается этим браузером.':'Речь распознаёт браузер; текст можно проверить перед отправкой.');controls.append(text);form.append(controls);
  }
  root.querySelectorAll('.ai-message-assistant,.ai-result-text').forEach(node=>{
   if(node.querySelector('[data-ai-speak]'))return;
   const controls=document.createElement('div');controls.className='ai-voice-controls';
   const button=document.createElement('button');button.type='button';button.className='btn secondary';button.dataset.aiSpeak='';button.textContent='▶ Прослушать';button.disabled=!synthesis;controls.append(button);
   const stop=document.createElement('button');stop.type='button';stop.className='btn secondary';stop.dataset.aiSpeechStop='';stop.textContent='■ Остановить';controls.append(stop);node.append(controls);
  });updateButtons();
 }
 function dictate(){
  if(recognition){stopInput();note('Запись остановлена. Проверьте текст перед отправкой.');return;}
  const input=document.querySelector('.ai-page [name="ai-prompt"]');if(!input||input.disabled)return;
  if(!Recognition){note('Этот браузер не поддерживает голосовой ввод.');return;}
  stopSpeech();const owner=String(currentUser?.email||''),mode=page,my=++session;const base=input.value.trim();let final='';
  const r=new Recognition();recognition=r;r.lang='ru-RU';r.continuous=true;r.interimResults=true;
  r.onstart=()=>{if(my===session){note('Слушаю… Нажмите «Остановить запись», когда закончите.');updateButtons();}};
  r.onresult=e=>{if(my!==session||page!==mode||String(currentUser?.email||'')!==owner)return;let interim='';for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)final+=e.results[i][0].transcript+' ';else interim+=e.results[i][0].transcript;}
   const target=document.querySelector('.ai-page [name="ai-prompt"]');if(!target)return;target.value=[base,final.trim(),interim].filter(Boolean).join(' ').slice(0,target.maxLength>0?target.maxLength:6000);target.dispatchEvent(new Event('input',{bubbles:true}));
  };
  r.onerror=e=>{if(my!==session)return;recognition=null;const messages={'not-allowed':'Доступ к микрофону запрещён. Разрешите его в настройках сайта рядом с адресом.','audio-capture':'Микрофон не найден или занят другим приложением.','network':'Сервис распознавания браузера недоступен. Попробуйте другой браузер или введите текст.','no-speech':'Речь не услышана. Нажмите микрофон и попробуйте снова.','service-not-allowed':'Браузер не разрешает распознавание речи.'};note(messages[e.error]||'Не удалось распознать речь. Попробуйте ещё раз.');updateButtons();};
  r.onend=()=>{if(my!==session)return;recognition=null;if(status.startsWith('Слушаю'))note('Запись завершена. Проверьте текст и нажмите «Отправить».');updateButtons();};
  try{r.start();updateButtons();}catch{recognition=null;note('Не удалось включить микрофон. Проверьте разрешения браузера.');updateButtons();}
 }
 function speak(node){
  if(!synthesis)return;stopInput();stopSpeech();const my=++session;
  const copy=node.cloneNode(true);copy.querySelectorAll('.ai-voice-controls,strong').forEach(x=>x.remove());const text=copy.textContent.trim();if(!text)return;
  const voices=synthesis.getVoices();const russian=voices.find(v=>/^ru(?:-|_)/i.test(v.lang));
  if(!russian){note('На устройстве нет русского голоса. Добавьте русский голос в настройках речи устройства и попробуйте снова.');return;}
  speechQueue=text.match(/[\s\S]{1,220}(?:\s|$)|[\s\S]{1,220}/g)||[text];speaking=true;note('Читаю ответ вслух…');updateButtons();
  function next(){if(my!==session)return;if(!speechQueue.length){speaking=false;note('Чтение завершено.');updateButtons();return;}utterance=new SpeechSynthesisUtterance(speechQueue.shift());utterance.lang='ru-RU';utterance.voice=russian;utterance.rate=1;utterance.onend=next;utterance.onerror=e=>{if(my!==session)return;speaking=false;speechQueue=[];note('Не удалось озвучить ответ. Проверьте настройки звука устройства.');updateButtons();};synthesis.speak(utterance);}next();
 }
 document.addEventListener('click',e=>{
  if(e.target.closest('[data-ai-mic]')){dictate();return;}
  const button=e.target.closest('[data-ai-speak]');if(button){speak(button.closest('.ai-message-assistant,.ai-result-text'));return;}
  if(e.target.closest('[data-ai-speech-stop]')){stopSpeech();note('Чтение остановлено.');return;}
  if(e.target.closest('[data-ai-new],[data-ai-tool],[data-ai-menu],[data-ai-history],[data-go-home],[data-go-back],[data-page],[data-landing-logout]')){stopInput();stopSpeech();status='';}
 },true);
 document.addEventListener('submit',e=>{if(e.target.id==='ai-task-form')stopInput();},true);
 window.addEventListener('pagehide',()=>{stopInput();stopSpeech();});window.addEventListener('popstate',()=>{stopInput();stopSpeech();});
 const previousRender=render;render=function(){previousRender();enhance();};enhance();
})();
