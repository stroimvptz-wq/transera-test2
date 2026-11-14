/* A single billing block, with a shared promo form and existing payment handlers. */
'use strict';
(()=>{
 function arrange(){if(page!=='account'||!currentUser?.email)return;const promo=document.getElementById('transera-promo-form'),ai=document.getElementById('account-ai-balance');if(!promo||!ai)return;
  let block=document.getElementById('account-billing');if(block)return;
  block=document.createElement('section');block.id='account-billing';block.className='card section account-billing';block.innerHTML='<h2>Подписка и AI-баланс</h2><p class="muted">Документы — по подписке. Чат, картинки и видео — за AI-баллы.</p><div data-billing-sections></div><section class="account-promo"><h3>Промокод</h3><div data-common-promo></div></section><p><a href="tariffs.html">Тарифы и правила списания</a> · <a href="offer.html">Оферта</a> · <a href="privacy.html">Обработка персональных данных</a></p>';
  const subscription=promo.closest('details');
  (document.getElementById('account-panel-subscription')||document.getElementById('content')).append(block);
  const target=block.querySelector('[data-billing-sections]');if(subscription){subscription.querySelector('summary').textContent='Подписка на документы';subscription.open=true;target.append(subscription);}
  ai.querySelector('summary').textContent='AI-баланс';target.append(ai);ai.open=true;
  const aiBody=ai.querySelector('.panel-body'),packages=aiBody.querySelector('.actions');if(packages){const controls=document.createElement('div');controls.className='actions';controls.innerHTML='<button type="button" class="btn" data-account-topup>Пополнить баланс</button><button type="button" class="btn secondary" data-ai-wallet>История списаний</button>';packages.before(controls);packages.dataset.accountTopupOptions='';packages.hidden=history.state?.accountSection!=='ai-balance';}

  const destination=block.querySelector('[data-common-promo]'),status=document.getElementById('transera-promo-status'),heading=promo.previousElementSibling;
  if(heading?.tagName==='H3'&&heading.textContent==='Промокод')heading.remove();
  const hint=status?.nextElementSibling;if(hint?.classList.contains('panel-hint'))hint.remove();destination.append(promo);if(status)destination.append(status);
  const tabs=document.querySelector('.champagne-account-tabs');if(tabs){const b=tabs.querySelector('[data-account-tab=subscription]');if(b)b.textContent='Подписка и AI-баланс';}
  if(history.state?.accountSection==='ai-balance')document.querySelector('[data-account-tab=subscription]')?.click();
  const mail=document.getElementById('account-mail');if(mail){mail.querySelector('.panel-body > p').textContent='Подтверждение адреса и подключение отправки — два разных шага. Уже подтверждённый адрес не нужно подтверждать повторно.';}
 }
 document.addEventListener('click',e=>{if(e.target.closest('[data-account-topup]')){const options=document.querySelector('[data-account-topup-options]');if(options)options.hidden=!options.hidden;}});
 const previous=render;render=function(){previous();arrange();};arrange();
 window.addEventListener('business-ai-balance-changed',()=>{window.BUSINESS_ACCOUNT_REFRESH?.();});
})();
