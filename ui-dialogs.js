/* Navigation autosaves work; download and explicit destructive actions may show dialogs. */
'use strict';
let appActiveDialog=null,appSavePromise=null;
function appNotice(message){
 let region=document.getElementById('app-notices');if(!region){region=document.createElement('div');region.id='app-notices';region.setAttribute('aria-live','polite');document.body.append(region);}
 const text=String(message);const old=[...region.children].find(el=>el.dataset.message===text);if(old)return;
 const notice=document.createElement('div');notice.className='app-notice';notice.dataset.message=text;notice.setAttribute('role','status');const body=document.createElement('span');body.textContent=text;const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Закрыть сообщение');close.onclick=()=>notice.remove();notice.append(body,close);region.append(notice);setTimeout(()=>notice.remove(),9000);
}
window.alert=appNotice;
function appDismissDialog(){appActiveDialog?.finish(false);}
function appDialog(message,options={}){
 if(appActiveDialog)return Promise.resolve(false);
 return new Promise(resolve=>{
  const previous=document.activeElement,dialog=document.createElement('dialog');dialog.className='app-message-dialog';dialog.setAttribute('aria-labelledby','app-message-title');const title=document.createElement('h2');title.id='app-message-title';title.textContent=options.title||'Скачать документ';const text=document.createElement('p');text.textContent=String(message);const actions=document.createElement('div');actions.className='actions';
  let done=false;const finish=value=>{if(done)return;done=true;dialog.close();dialog.remove();appActiveDialog=null;if(previous?.isConnected)previous.focus();resolve(value);};appActiveDialog={finish};
  if(options.cancel){const cancel=document.createElement('button');cancel.type='button';cancel.className='btn secondary';cancel.textContent='Отменить';cancel.dataset.appDialogCancel='';cancel.onclick=()=>finish(false);actions.append(cancel);}
  const ok=document.createElement('button');ok.type='button';ok.className='btn';ok.textContent=options.ok||'ОК';ok.dataset.appDialogOk='';ok.onclick=()=>finish(true);actions.append(ok);dialog.append(title,text,actions);document.body.append(dialog);dialog.addEventListener('keydown',e=>e.stopPropagation());dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false);});dialog.showModal();ok.focus();
 });
}
function appConfirm(message){return appDialog(message,{cancel:true});}
function appPendingChanges(documentOnly=false){
 const doc=typeof docDirty!=='undefined'&&docDirty&&!!document.getElementById('local-document-form');if(documentOnly)return {doc};
 const original=typeof draft!=='undefined'?trips.find(t=>t.id===(editing||draft.id)):null;const trip=typeof tripEditor!=='undefined'&&tripEditor&&JSON.stringify(draft)!==JSON.stringify(original?{...defaults(),...original}:defaults());
 const calculation=typeof page!=='undefined'&&page==='calculators'&&JSON.stringify(draft)!==JSON.stringify(selectedCalcId?{...defaults(),...(calculations.find(x=>x.id===selectedCalcId)||{})}:defaults());
 const profileForm=document.getElementById('profile-edit-form'),profile=!!profileForm&&['full_name','organization'].some(k=>profileForm.elements[k].value.trim()!==String(currentUser?.[k]||''));return {doc,trip,calculation,profile};
}
const appWorkMemory=new Map();let appRestoredContext=null;
function appWorkKey(kind,id='new'){return 'business-ai-work:'+encodeURIComponent(String(currentUser?.email||'guest').toLowerCase())+':'+kind+':'+id;}
function appWorkRead(key){try{return JSON.parse(localStorage.getItem(key)||'null')||appWorkMemory.get(key);}catch{return appWorkMemory.get(key);}}
function appWorkWrite(key,value){appWorkMemory.set(key,structuredClone(value));try{localStorage.setItem(key,JSON.stringify(value));}catch{appNotice('Не удалось сохранить на устройство. Черновик остаётся в этой вкладке.');}}
function appWorkRemove(key){appWorkMemory.delete(key);try{localStorage.removeItem(key);}catch{}}
function appCacheWork(){const profile=document.getElementById('profile-edit-form');if(profile&&currentUser?.email){const value={full_name:profile.elements.full_name.value.trim().slice(0,120),organization:profile.elements.organization.value.trim().slice(0,180)};try{localStorage.setItem(profileKey(),JSON.stringify(value));applyProfileOverrides();}catch{}}if(typeof draft==='undefined')return;if(tripEditor)appWorkWrite(appWorkKey('trip',editing||'new'),draft);else if(page==='calculators')appWorkWrite(appWorkKey('calculation',selectedCalcId||'new'),draft);}
function appRestoreWork(){const kind=tripEditor?'trip':page==='calculators'?'calculation':null;if(!kind){appRestoredContext=null;return;}const key=appWorkKey(kind,kind==='trip'?editing||'new':selectedCalcId||'new');if(appRestoredContext===key)return;appRestoredContext=key;const saved=appWorkRead(key);if(saved&&typeof saved==='object'&&!Array.isArray(saved))draft={...defaults(),...saved};}
function appSaveBeforeLeave(documentOnly=false){
 if(appSavePromise)return appSavePromise;const changes=appPendingChanges(documentOnly);appCacheWork();
 appSavePromise=(async()=>{try{
  if(changes.doc)docFlush();
  if(changes.trip&&currentUser?.email_verified===true&&draft.from?.trim()&&draft.to?.trim()&&(draft.status!=='Закрыт'||canClose(draft))){const old=trips.find(t=>t.id===(editing||draft.id)),item={...draft,id:old?.id||editing||uid(),number:old?.number||'ТР-'+String(Date.now()).slice(-8),createdAt:old?.createdAt||draft.createdAt||new Date().toISOString()};await put('trips',item);trips=await all('trips');draft={...defaults(),...item};editing=item.id;}
  if(changes.calculation&&currentUser?.email_verified===true){const item={...draft,id:selectedCalcId||uid(),createdAt:draft.createdAt||new Date().toISOString()};await put('calculations',item);calculations=await all('calculations');selectedCalcId=item.id;draft={...defaults(),...item};}
  if(changes.profile){const form=document.getElementById('profile-edit-form'),value={full_name:form.elements.full_name.value.trim().slice(0,120),organization:form.elements.organization.value.trim().slice(0,180)};localStorage.setItem(profileKey(),JSON.stringify(value));applyProfileOverrides();editingProfile=false;}
 }catch(error){appNotice('Не удалось завершить автосохранение. Черновик остаётся на устройстве: '+error.message);}return true;})().finally(()=>{appSavePromise=null;});return appSavePromise;
}
window.addEventListener('input',appCacheWork);window.addEventListener('change',appCacheWork);window.addEventListener('beforeunload',appCacheWork);
const appOriginalRender=render;render=function(){appRestoreWork();appOriginalRender();};
const appOriginalPut=put;put=async function(name,item){await appOriginalPut(name,item);if(name==='trips'&&tripEditor){appWorkRemove(appWorkKey('trip',editing||'new'));appWorkRemove(appWorkKey('trip',item.id));}if(name==='calculations'&&page==='calculators'){appWorkRemove(appWorkKey('calculation',selectedCalcId||'new'));appWorkRemove(appWorkKey('calculation',item.id));}};

function appReleaseDocument(){appDismissDialog();if(typeof localDocumentId!=='undefined'){clearTimeout(docSaveTimer);clearTimeout(docPreviewTimer);localDocumentId=null;docPending=null;docDirty=false;}}
if(typeof setPage==='function'){
 const originalSetPage=setPage;setPage=async function(target){if(page===target&&!tripEditor)return;if(!await appSaveBeforeLeave())return;appReleaseDocument();originalSetPage(target);};
}
