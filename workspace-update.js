/* One workspace for calculation, trip records and financial settlement. */
'use strict';
(()=>{
 const previousCalc=calc;
 calc=function(d){const r=previousCalc(d);if(d.mode==='hired'&&d.manualPrice!==''&&d.manualPrice!=null){const value=Number(String(d.manualPrice).replace(',','.'));if(Number.isFinite(value)&&value>=0){r.price=value;r.profit=r.price-r.cost;r.margin=r.price?r.profit/r.price*100:0;r.roi=r.cost?r.profit/r.cost*100:0;}}return r;};
 const previousEditor=editor;
 editor=function(){let html=previousEditor();if(draft.mode==='hired'){const fieldHTML=field('manualPrice','Цена заказчику за рейс, ₽');html=html.replace('<div class="fields">','<div class="fields">'+fieldHTML);}return html;};
 let tab='calculation';
 const previousTrips=tripsPage,previousFields=tripFields;
 function tabs(){return '<div class="tabs" aria-label="Разделы рейсов">'+[['calculation','Расчёт перевозки'],['records','Рейсы и оплаты'],['finance','Финансовые показатели']].map(([id,title])=>'<button type="button" class="tab '+(id===tab?'active':'')+'" data-trip-workspace="'+id+'">'+title+'</button>').join('')+'</div>';}
 tripFields=function(){if(tab==='calculation')return '<div class="actions trip-create-documents"><button type="button" class="btn" data-trip-doc="tn" data-trip-side="transport">Создать ТН</button><button type="button" class="btn secondary" data-trip-doc="ttn" data-trip-side="transport">Создать ТТН</button><button type="button" class="btn secondary" data-trip-workspace="records">К рейсам и оплатам</button></div>';return previousFields();};
 tripsPage=function(){const heading='<div class="top"><h1>Рейсы, калькуляторы, финансы</h1></div>'+tabs();if(tab==='finance')return heading+dashboard().replace(/<div class="top">[\s\S]*?<\/h1>[\s\S]*?<\/div><\/div>/,'');if(tab==='calculation'){if(!tripEditor){tripEditor=true;tripEditMode=true;}return heading+'<div class="two">'+editor()+results(false)+'</div>'+tripFields();}return heading+previousTrips().replace('<h1>Рейсы</h1>','<h2>Рейсы и оплаты</h2>');};
 const originalSetPage=setPage;
 setPage=function(next){const alias=['calculators','dashboard'].includes(next);if(alias){tab=next==='dashboard'?'finance':'calculation';next='trips';}if(next==='trips'&&page!=='trips'&&!alias)tab='calculation';return originalSetPage(next);};
 function decorate(){
  document.querySelectorAll('[data-page=calculators],[data-page=dashboard]').forEach(n=>n.remove());
  for(const n of document.querySelectorAll('[data-page=trips]')){const title=n.querySelector('.champagne-tile-title');if(title)title.textContent='Рейсы, калькуляторы, финансы';else if(!n.querySelector('input,select'))n.textContent='Рейсы, калькуляторы, финансы';}
  if(page==='business'){const host=document.querySelector('.champagne-transport-menu');if(host&&!host.querySelector('[data-page=trips]')){const button=document.createElement('button');button.type='button';button.className='champagne-tile';button.dataset.page='trips';button.innerHTML='<span class="champagne-tile-title">Рейсы, калькуляторы, финансы</span><span class="champagne-tile-sub">Расчёт перевозки, документы, оплаты и показатели</span>';host.append(button);}}
 }
 const previousRender=render;render=function(){if(['calculators','dashboard'].includes(page)){tab=page==='dashboard'?'finance':'calculation';page='trips';tripEditor=tab==='calculation';}if(page==='trips'&&tab==='calculation'){tripEditor=true;tripEditMode=true;}previousRender();decorate();if(page==='trips'&&history.state?.page==='trips')history.replaceState({...history.state,tripWorkspace:tab,tripEditor,editing},'',location.href);};
 document.addEventListener('click',async e=>{if(e.target.closest('[data-dashboard-filter]'))tab='records';const b=e.target.closest('[data-trip-workspace]');if(b){e.preventDefault();if(!await appSaveBeforeLeave())return;tab=b.dataset.tripWorkspace;if(tab==='records'){tripEditor=false;editing=null;}else if(tab==='finance'){tripEditor=false;editing=null;}else{tripEditor=true;tripEditMode=true;}history.replaceState({...history.state,tripWorkspace:tab,tripEditor,editing},'',location.href);render();return;}const action=e.target.closest('[data-action]');if(action&&['edit-trip','blank-trip'].includes(action.dataset.action))tab='records';},true);
 window.addEventListener('popstate',e=>{if(e.state?.page==='trips'&&e.state.tripWorkspace)tab=e.state.tripWorkspace;},true);
 window.BUSINESS_TRIP_WORKSPACE={tab:()=>tab,select:next=>{tab=next;}};decorate();
})();
