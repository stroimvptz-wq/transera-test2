'use strict';
(()=>{let order=null,busy=false,orderOwner='';const who=()=>String(currentUser?.email||'').trim().toLowerCase();function keepOrder(){if(order)window.BUSINESS_DEVICE_DRAFTS?.set('pending-document-payment',order,who());else window.BUSINESS_DEVICE_DRAFTS?.remove('pending-document-payment',who());}function restoreOrder(){const owner=who();if(owner!==orderOwner){orderOwner=owner;order=window.BUSINESS_DEVICE_DRAFTS?.get('pending-document-payment',owner)||null;}if(page==='account'&&order&&!document.querySelector('[data-document-payment-check]')){output('Есть незавершённый платёж подписки. Проверьте его перед новой оплатой.');controls(order.url);}};const shared=window.BUSINESS_PLATFORM.sharedData===true,api=(r,b)=>window.BUSINESS_PLATFORM_API(shared?'subscriptions':'billing',r,b);function output(text){const n=document.getElementById('transera-payment-status');if(n)n.textContent=text;}function controls(url){const n=document.getElementById('transera-payment-status');if(!n)return;if(url){const u=new URL(url);if(u.protocol!=='https:'||!(u.hostname==='pay.tbank-online.com'||['tbank.ru','tinkoff.ru'].some(h=>u.hostname===h||u.hostname.endsWith('.'+h))))throw Error('Некорректная ссылка оплаты.');const a=document.createElement('a');a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Перейти к оплате в Т-Банк';a.className='btn';n.append(a);}if(order){const b=document.createElement('button');b.className='btn secondary';b.type='button';b.dataset.documentPaymentCheck='';b.textContent='Проверить оплату';n.append(b);}}
 window.addEventListener('click',e=>{restoreOrder();const pay=e.target.closest('[data-test-pay]'),check=e.target.closest('[data-document-payment-check]');if(!pay&&!check)return;if(pay&&pay.dataset.accessChecked!=='once')return;e.preventDefault();e.stopImmediatePropagation();if(busy)return;void(async()=>{busy=true;try{if(pay){if(order)throw Error('Сначала проверьте предыдущую попытку оплаты.');order={id:crypto.randomUUID(),plan:pay.dataset.testPay,terms:window.BUSINESS_TERMS};const d=await api('/payments/create',shared?{plan:order.plan}:{...order,kind:'documents',consent:true});if(shared){order.id=d.order_id;order.url=d.payment_url;keepOrder();if(order.terms)await recordTerms(order);output('Платёж подписки создан.');controls(d.payment_url);}else{order.url=d.payment.confirmationUrl;keepOrder();output(d.payment.test?'Создан тестовый платёж подписки.':'Платёж подписки создан.');controls(d.payment.confirmationUrl);}}else{const d=await api('/payments/status?'+(shared?'order_id=':'id=')+encodeURIComponent(order.id));if(shared?d.applied===true:d.payment.credited){if(shared&&order.terms)await recordTerms(order);order=null;keepOrder();await transeraRefreshAccess();output('Подписка на документы активирована.');}else if((shared?d.status:d.payment.status)==='canceled'){order=null;keepOrder();output('Оплата отменена.');}else{output('Оплата пока не подтверждена.');controls();}}}catch(err){output(err.message);controls();}finally{busy=false;}
})();},true);

 // A legacy billing deployment may not yet expose the optional terms-receipt route.
 // Keep a durable, owner-scoped queue; only a definite 404 allows payment to continue.
 let receiptRouteMissing=false,flushingReceipts=false;
 const pendingTerms=account=>window.BUSINESS_DEVICE_DRAFTS?.get('pending-subscription-terms',account)||[];
 async function recordTerms(payment){
  const account=who(),receipt={orderId:payment.id,terms:payment.terms};
  const queue=pendingTerms(account).filter(item=>item.orderId!==payment.id);queue.push(receipt);
  window.BUSINESS_DEVICE_DRAFTS?.set('pending-subscription-terms',queue,account);
  if(receiptRouteMissing)return;
  try{await window.BUSINESS_PLATFORM_API('billing','/subscription/terms',receipt);
   window.BUSINESS_DEVICE_DRAFTS?.set('pending-subscription-terms',pendingTerms(account).filter(item=>item.orderId!==payment.id),account);
  }catch(error){if(error.status!==404)throw error;receiptRouteMissing=true;}
 }
 async function flushTerms(){
  if(flushingReceipts||receiptRouteMissing||!who()||page!=='account')return;
  const account=who(),queue=pendingTerms(account);if(!queue.length)return;flushingReceipts=true;
  try{for(const item of queue){if(who()!==account)break;await recordTerms({id:item.orderId,terms:item.terms});if(receiptRouteMissing)break;}}catch{}finally{flushingReceipts=false;}
 }
 const previous=render;render=function(){previous();restoreOrder();void flushTerms();};restoreOrder();
})();
