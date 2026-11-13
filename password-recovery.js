/* Email password recovery. Tokens stay in memory and never enter local storage. */
'use strict';
(()=>{
 const RESET_API=window.BUSINESS_PLATFORM.reset;
 const originalTab=showLandingTab,originalSubmit=submitLanding;
 let resetToken='',requestBusy=false,viewVersion=0;
 const node=id=>document.getElementById(id);
 function status(message){let el=node('landing-recovery-status');if(!el){el=document.createElement('p');el.id='landing-recovery-status';el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.style.cssText='color:#9ee6cf;white-space:pre-wrap;line-height:1.5';node('landing-error').after(el);}el.textContent=message;}
 const passwordField=(label,name)=>'<label>'+label+'<span class="landing-password-wrap"><input name="'+name+'" type="password" autocomplete="new-password" minlength="10" required><button type="button" class="landing-password-eye" data-password-eye aria-label="Показать пароль" aria-pressed="false" title="Показать пароль">👁</button></span></label>';
 showLandingTab=function(tab){
  viewVersion++;status('');node('landing-error').textContent='';
  const hint=document.querySelector('.landing-password-hint'),button=document.querySelector('[data-landing-preview]');button.disabled=false;
  if(!['recover','reset','reset-invalid'].includes(tab)){resetToken='';if(hint)hint.hidden=false;return originalTab(tab);}
  landingTab=tab;document.querySelectorAll('[data-landing-tab]').forEach(b=>b.classList.remove('active'));
  if(hint)hint.hidden=tab!=='reset';
  if(tab==='recover'){
   resetToken='';node('landing-title').textContent='Восстановление пароля';node('landing-subtitle').textContent='Отправим ссылку для установки нового пароля';
   node('landing-fields').innerHTML='<label>Электронная почта<input name="email" type="email" autocomplete="email" placeholder="example@mail.ru" maxlength="254" required></label>';
   button.textContent='Отправить ссылку';
  }else if(tab==='reset'){
   node('landing-title').textContent='Новый пароль';node('landing-subtitle').textContent='Введите новый пароль дважды. Ссылка из письма действует 15 минут.';
   node('landing-fields').innerHTML=passwordField('Новый пароль','password')+passwordField('Повторите новый пароль','confirm');button.textContent='Сохранить новый пароль';
  }else{
   resetToken='';node('landing-title').textContent='Ссылка недействительна';node('landing-subtitle').textContent='Запросите новое письмо через «Забыли пароль?». Скопируйте ссылку из письма полностью.';node('landing-fields').replaceChildren();button.textContent='Запросить новую ссылку';
  }
 };
 async function resetRequest(route,body){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),30000);
  try{
   const response=await fetch(RESET_API+'?route='+encodeURIComponent(route),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,returnUrl:new URL('./',location.href).href}),credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:controller.signal});
   const data=await response.json().catch(()=>null);
   if(!response.ok){if(response.status===400)throw Error(route==='/reset'?'Ссылка недействительна, уже использована или истекла. Запросите новое письмо.':'Проверьте адрес электронной почты.');throw Error('Не удалось выполнить запрос. Попробуйте позже.');}
   if(data?.ok!==true)throw Error('Сервер не подтвердил выполнение запроса. Попробуйте позже.');
  }finally{clearTimeout(timeout);}
 }
 submitLanding=async function(){
  if(!['recover','reset','reset-invalid'].includes(landingTab))return originalSubmit();
  if(landingTab==='reset-invalid'){showLandingTab('recover');return;}
  if(requestBusy)return;
  const error=node('landing-error'),button=document.querySelector('[data-landing-preview]'),get=name=>node('landing-fields').querySelector('[name="'+name+'"]')?.value||'';
  error.textContent='';status('');
  const tab=landingTab,version=viewVersion;
  let body,route;
  if(tab==='recover'){
   const email=get('email').trim().toLowerCase();if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){error.textContent='Укажите корректный адрес электронной почты.';return;}
   body={email};route='/request';
  }else{
   const password=get('password');if(!/^[a-f0-9]{64}$/.test(resetToken)){showLandingTab('reset-invalid');return;}
   if(password.length<10||new TextEncoder().encode(password).length>1024){error.textContent='Пароль должен содержать не менее 10 символов и быть не длиннее 1024 байт.';return;}
   if(password!==get('confirm')){error.textContent='Пароли не совпадают.';return;}
   body={token:resetToken,password};route='/reset';
  }
  requestBusy=true;button.disabled=true;
  try{
   await resetRequest(route,body);if(version!==viewVersion)return;
   if(tab==='recover'){status('Если этот адрес зарегистрирован, письмо со ссылкой будет отправлено. Проверьте также папку «Спам». Ссылка действует 15 минут.');}
   else{
    resetToken='';localStorage.removeItem('business-ai-test2-auth-token');sessionStorage.removeItem('business-ai-test2-auth-token');currentUser=null;
    showLandingTab('login');status('Пароль изменён. Войдите с новым паролем.');node('landing-fields').querySelector('[name="email"]')?.focus();
   }
  }catch(e){if(version===viewVersion)error.textContent=e.name==='AbortError'?'Сервер не ответил вовремя. Попробуйте ещё раз.':e instanceof TypeError?'Нет соединения с сервером. Проверьте интернет и повторите попытку.':e.message;}
  finally{requestBusy=false;if(version===viewVersion)button.disabled=false;}
 };
 function openResetLink(){
  const hash=location.hash.slice(1);if(!/(?:^|&)reset_token(?:=|&|$)/.test(hash))return;
  const values=new URLSearchParams(hash),tokens=values.getAll('reset_token');
  // Clear the fragment before rendering or submitting; do not log or persist it.
  history.replaceState(history.state,'',location.pathname+location.search);
  resetToken=hash.length<=2048&&tokens.length===1&&/^[a-f0-9]{64}$/.test(tokens[0])?tokens[0]:'';
  node('landing').hidden=false;showLandingTab(resetToken?'reset':'reset-invalid');
 }
 openResetLink();window.addEventListener('hashchange',openResetLink);
})();
