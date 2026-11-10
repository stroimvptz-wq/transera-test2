/* Dismissible messages. Confirmations resolve only after the user's choice. */
'use strict';
let appDialogQueue=Promise.resolve();
function appDialog(message,options={}){
 const run=()=>new Promise(resolve=>{
  const previous=document.activeElement,dialog=document.createElement('dialog');dialog.className='app-message-dialog';dialog.setAttribute('aria-labelledby','app-message-title');
  const title=document.createElement('h2');title.id='app-message-title';title.textContent=options.title||'Сообщение';const text=document.createElement('p');text.textContent=String(message);const actions=document.createElement('div');actions.className='actions';const cancel=document.createElement('button');cancel.type='button';cancel.className='btn secondary';cancel.textContent='Отмена';cancel.dataset.appDialogCancel='';const ok=document.createElement('button');ok.type='button';ok.className='btn';ok.textContent=options.ok||'ОК';ok.dataset.appDialogOk='';actions.append(cancel,ok);dialog.append(title,text,actions);document.body.append(dialog);
  let done=false;const finish=value=>{if(done)return;done=true;dialog.close();dialog.remove();if(previous?.isConnected)previous.focus();resolve(value);};cancel.onclick=()=>finish(false);ok.onclick=()=>finish(true);dialog.addEventListener('keydown',e=>e.stopPropagation());dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false);});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)finish(false);}});dialog.showModal();cancel.focus();
 });
 const pending=appDialogQueue.then(run);appDialogQueue=pending.catch(()=>{});return pending;
}
function appConfirm(message,options={}){return appDialog(message,{title:'Подтверждение',...options});}
window.alert=message=>{void appDialog(message);};
