/* Downloads and unsaved edits are the only in-app dialogs. */
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
function appSaveBeforeLeave(documentOnly=false){
 if(appSavePromise)return appSavePromise;
 const changes=appPendingChanges(documentOnly);if(!Object.values(changes).some(Boolean))return Promise.resolve(true);
 if(changes.doc)clearTimeout(docSaveTimer);appDismissDialog();
 appSavePromise=(async()=>{
  const ok=await appDialog('Есть несохранённые изменения. Сохраните их перед переходом.',{title:'Несохранённые изменения',ok:'Сохранить'});if(!ok){if(changes.doc)docQueueSave();return false;}
  try{
   if(changes.doc&&!docFlush()){appNotice('Не удалось сохранить документ. Можно скачать копию черновика.');return false;}
   if(changes.trip){if(!draft.from?.trim()||!draft.to?.trim()){appNotice('Для сохранения рейса укажите пункты отправления и назначения.');return false;}const old=trips.find(t=>t.id===(editing||draft.id));if(editing&&normalizeStatus(old||{})==='Закрыт'&&draft.status==='Доставлен'&&canClose(draft)){draft.status='Закрыт';draft.closedAt=new Date().toISOString();}if(draft.status==='Закрыт'&&!canClose(draft)){appNotice('Нельзя сохранить закрытый рейс с задолженностью или без документов.');return false;}if(draft.status!=='Закрыт')delete draft.closedAt;const item={...draft,id:old?.id||editing||uid(),number:old?.number||'ТР-'+String(Date.now()).slice(-8),createdAt:old?.createdAt||draft.createdAt||new Date().toISOString()};await put('trips',item);trips=await all('trips');draft={...defaults(),...item};editing=item.id;}
   if(changes.calculation){const item={...draft,id:uid(),createdAt:new Date().toISOString()};await put('calculations',item);calculations=await all('calculations');selectedCalcId=item.id;draft={...defaults(),...item};}
   if(changes.profile){const form=document.getElementById('profile-edit-form');if(!form?.reportValidity())return false;form.requestSubmit();if(editingProfile)return false;}
   return true;
  }catch(error){appNotice('Не удалось сохранить изменения: '+error.message);return false;}
 })().finally(()=>{appSavePromise=null;});return appSavePromise;
}
function appReleaseDocument(){appDismissDialog();if(typeof localDocumentId!=='undefined'){clearTimeout(docSaveTimer);clearTimeout(docPreviewTimer);localDocumentId=null;docPending=null;docDirty=false;}}
if(typeof setPage==='function'){
 const originalSetPage=setPage;setPage=async function(target){if(page===target&&!tripEditor)return;if(!await appSaveBeforeLeave())return;appReleaseDocument();originalSetPage(target);};
}
