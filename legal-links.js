/* Informational policy links only: no consent checkbox or extra registration step. */
'use strict';
(()=>{
 window.BUSINESS_TERMS=Object.freeze({offer:'2026-11-14-1',tariffs:'2026-11-14-1'});
 function draw(){
  const landing=document.getElementById('landing-fields');if(landing&&!document.querySelector('[data-registration-policy]')){const p=document.createElement('p');p.dataset.registrationPolicy='';p.className='muted';p.innerHTML='Обработка данных описана в <a href="privacy.html" target="_blank" rel="noopener">Политике обработки персональных данных</a>.';landing.after(p);}
  const host=document.querySelector('.main');if(host&&!host.querySelector('.legal-footer')){const footer=document.createElement('footer');footer.className='legal-footer';footer.innerHTML='<details><summary>Правовая информация</summary><nav><a href="offer.html">Оферта</a><a href="tariffs.html">Тарифы и правила списания</a><a href="privacy.html">Обработка персональных данных</a><a href="contacts.html">Реквизиты и контакты</a></nav></details>';host.append(footer);}
 }
 const previous=render;render=function(){previous();draw();};draw();
})();
