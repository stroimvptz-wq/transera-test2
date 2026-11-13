'use strict';
(()=>{
 const memory=new Map();let pending;
 const who=()=>String(currentUser?.email||'guest').trim().toLowerCase(),key=(slot,owner=who())=>'business-ai-device:'+encodeURIComponent(owner)+':'+slot;
 const notice=()=>{if(typeof appNotice==='function')appNotice('Не удалось сохранить черновик на устройство. Пока он остаётся в этой вкладке.');};
 function get(slot,owner){const id=key(slot,owner);try{return JSON.parse(localStorage.getItem(id)||'null')||memory.get(id)||null;}catch{return memory.get(id)||null;}}
 function set(slot,value,owner){const id=key(slot,owner);memory.set(id,structuredClone(value));try{localStorage.setItem(id,JSON.stringify(value));}catch{notice();}}
 function remove(slot,owner){const id=key(slot,owner);memory.delete(id);try{localStorage.removeItem(id);}catch{}void file(slot,null,owner).catch(notice);}
 function db(){if(!pending)pending=new Promise((resolve,reject)=>{const r=indexedDB.open('business-ai-device-drafts-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('files');r.onsuccess=()=>resolve(r.result);r.onerror=()=>{notice();reject(r.error);};});return pending;}
 async function file(slot,value,owner){const id=key(slot,owner),database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction('files',value===undefined?'readonly':'readwrite'),store=tx.objectStore('files'),r=value===undefined?store.get(id):value===null?store.delete(id):store.put(value,id);let result;r.onsuccess=()=>result=r.result;tx.oncomplete=()=>resolve(result||null);tx.onerror=()=>{notice();reject(tx.error);};});}
 window.BUSINESS_DEVICE_DRAFTS={get,set,remove,file,owner:who};
})();
// Additional business forms keep values only; restoration never submits a form.
(()=>{
 const store=window.BUSINESS_DEVICE_DRAFTS,seen=new WeakSet(),selector='[data-fleet-form],#warehouse-add,.warehouse-move';
 function slot(form){return 'form:'+page+':'+(form.id||form.dataset.fleetForm||'move')+':'+(form.dataset.warehouseId||form.dataset.fleetEntryId||(typeof fleetVehicle!=='undefined'?fleetVehicle:'')||'new');}
 function fields(form){return [...form.elements].filter(e=>e.name&&!['password','hidden','file','submit','button','reset'].includes(e.type)&&!/(?:password|secret|token|verification|consent)/i.test(e.name));}
 function save(e){const form=e.target.closest?.(selector);if(!form)return;store.set(slot(form),Object.fromEntries(fields(form).map(el=>[el.name,el.type==='checkbox'?el.checked:el.value])));}
 function mount(){document.querySelectorAll(selector).forEach(form=>{if(seen.has(form))return;seen.add(form);const saved=store.get(slot(form));if(saved)for(const el of fields(form))if(Object.hasOwn(saved,el.name)){if(el.type==='checkbox')el.checked=!!saved[el.name];else el.value=saved[el.name];}const b=document.createElement('button');b.type='button';b.className='btn secondary';b.textContent='Начать заново';b.dataset.deviceFormNew='';b.onclick=()=>{store.remove(slot(form));form.reset();};form.append(b);});}
 document.addEventListener('input',save);document.addEventListener('change',save);const previous=render;render=function(){previous();mount();};mount();
})();
