/* One promo field; the server resolves AI balance versus the existing subscription service. */
'use strict';
(()=>{
 let busy=false,owner='';
 const who=()=>String(currentUser?.email||'').trim().toLowerCase();
 function enhance(){if(who()!==owner){owner=who();busy=false;}const form=document.getElementById('transera-promo-form');if(!form)return;form.querySelector('[name=promo-purpose]')?.closest('label')?.remove();const button=form.querySelector('[type=submit]');button.disabled=busy;button.textContent=busy?'Проверяем…':'Применить';let note=form.querySelector('[data-ai-bonus-note]');if(!note){note=document.createElement('p');note.className='muted';note.dataset.aiBonusNote='';form.append(note);}note.textContent='Один код для подписки или AI-баланса. Тип определится автоматически.';}
 const previous=render;render=function(){previous();enhance();};
 document.addEventListener('submit',async event=>{
  if(event.target.id!=='transera-promo-form')return;event.preventDefault();event.stopImmediatePropagation();if(busy)return;
  const code=event.target.elements.promo.value.trim(),account=who();if(!code)return;
  const output=text=>{if(who()===account){const n=document.getElementById('transera-promo-status');if(n)n.textContent=text;}};
  busy=true;enhance();output('Определяем тип промокода…');
  try{
   const platform=window.BUSINESS_PLATFORM||{};
   if(!platform.billing)throw Error('Сервис промокодов ещё не подключён.');
   let resolved;try{resolved=await window.BUSINESS_PLATFORM_API('billing','/promos/type',{code});}catch(error){if(error.status!==404)throw error;resolved={kind:/^AI-[A-F0-9]{24}$/i.test(code)?'ai':'subscription'};}if(who()!==account)return;
   if(resolved.kind==='ai'){
    const result=await window.BUSINESS_PLATFORM_API('billing','/promos/redeem',{code});if(who()!==account)return;
    output((result.alreadyApplied?'Этот промокод уже активирован.':'Начислено '+Number(result.points).toLocaleString('ru-RU')+' AI-баллов.')+' Баланс: '+(Number(result.balanceMicro)/1e6).toLocaleString('ru-RU',{maximumFractionDigits:2})+' баллов.');
    window.dispatchEvent(new Event('business-ai-balance-changed'));
   }else if(resolved.kind==='subscription'){
    const result=await subscriptionApi('/promo/redeem',{code});if(who()!==account)return;
    if(!result.activated)throw Error('Подписка не активирована.');
    await transeraRefreshAccess();output('Подписка продлена до '+new Date(result.paid_until).toLocaleDateString('ru-RU')+'.');
   }else throw Error('Сервер не определил тип кода. Баллы и подписка не изменены.');
  }catch(error){output(error.message==='CODE_UNAVAILABLE'?'Промокод не найден, истёк или уже использован.':error.message);}
  finally{if(who()===account){busy=false;enhance();}}
 },true);
 enhance();
})();
