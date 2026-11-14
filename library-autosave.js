'use strict';
(()=>{
 const forms=new WeakSet(),pending=new Map(),inflight=new Set(),who=()=>String(currentUser?.email||'').trim().toLowerCase(),device=window.BUSINESS_DEVICE_DRAFTS;
 function notice(form,text){const n=form?.querySelector('[role=status]');if(n)n.textContent=text;}
 function value(form){return Object.fromEntries(new FormData(form));}
 function save(form){const owner=who(),id=form.dataset.libraryEdit,old=device.get('library-edit:'+id,owner),entry={id,fields:value(form),revision:Math.max(Date.now(),(old?.revision||0)+1)};device.set('library-edit:'+id,entry,owner);const key=owner+'|'+id;clearTimeout(pending.get(key)?.timer);pending.set(key,{owner,entry,form,timer:setTimeout(()=>void sync(key),600)});notice(form,'Сохранено на устройстве. Синхронизируем…');}
 async function sync(key){if(inflight.has(key))return;const task=pending.get(key);if(!task||task.owner!==who())return;inflight.add(key);try{await window.BUSINESS_PLATFORM_API('chat','/document/update',{...task.entry,consent:true});if(who()!==task.owner)return;if(pending.get(key)===task){pending.delete(key);notice(task.form,'Сохранено в облаке бесплатно.');}}catch(e){notice(task.form,'Сохранено на устройстве. '+e.message);}finally{inflight.delete(key);if(pending.get(key)&&pending.get(key)!==task)void sync(key);}}
 function enhance(){for(const f of document.querySelectorAll('[data-library-edit]')){if(forms.has(f))continue;forms.add(f);const saved=device.get('library-edit:'+f.dataset.libraryEdit,who());if(saved?.fields){for(const [k,v]of Object.entries(saved.fields)){const n=f.elements.namedItem(k);if(n)n.value=v;}save(f);}f.querySelector('button[type=submit],button:not([type])')?.remove();f.addEventListener('input',()=>save(f));f.addEventListener('submit',e=>{e.preventDefault();save(f);});}}
 new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});window.addEventListener('online',()=>{for(const k of pending.keys())void sync(k);});enhance();
})();
