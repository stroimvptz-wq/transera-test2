/* Graphite & champagne preview. Appearance only; existing data and APIs stay intact. */
'use strict';
(()=>{
 const root=document.documentElement;
 const themeKey=()=> 'biznes-ai-appearance:'+String(currentUser?.email||'visitor').toLowerCase();
 let appearanceTab='profile',appearanceDraft=null,identity=null;
 function storedTheme(){try{return localStorage.getItem(themeKey())==='light'?'light':'dark';}catch{return 'dark';}}
 function applyTheme(value){root.dataset.theme=value;root.style.colorScheme=value;}
 function logo(){return '<span class="champagne-mark" aria-hidden="true"><i></i><i></i></span><span>Бизнес <b>AI</b></span>';}
 const shapes={
 trips:'<path d="M19 23h39v31H19z"/><path d="M58 34h14l12 14v15H58z"/><path d="M64 39h6l8 10H64z" fill="var(--icon-window)"/><path d="M18 54h40v9H18z"/><circle cx="34" cy="64" r="9"/><circle cx="72" cy="64" r="9"/><circle cx="34" cy="64" r="4" fill="var(--icon-window)"/><circle cx="72" cy="64" r="4" fill="var(--icon-window)"/>',
 documents:'<path d="M29 18h39l10 11v49H29z" opacity=".48"/><path d="M20 13h37l14 15v45H20z"/><path d="M56 14v16h15" fill="none"/><path d="M31 40h28M31 50h28M31 60h18" fill="none"/>',
 calculators:'<rect x="25" y="12" width="48" height="68" rx="8"/><rect x="34" y="22" width="30" height="13" rx="3" fill="var(--icon-window)"/><path d="M35 46h4m10 0h4m10 0h1M35 57h4m10 0h4m10 0h1M35 68h4m10 0h4m10 0h1" fill="none"/>',
 dashboard:'<ellipse cx="59" cy="24" rx="20" ry="8"/><path d="M39 24v26c0 10 40 10 40 0V24"/><path d="M39 34c0 10 40 10 40 0m-40 10c0 10 40 10 40 0" fill="none"/><ellipse cx="35" cy="52" rx="20" ry="8"/><path d="M15 52v18c0 10 40 10 40 0V52"/><path d="M15 62c0 10 40 10 40 0" fill="none"/>',
 fleet:'<path d="M13 28h44v29H13z" opacity=".5"/><path d="M23 21h39v34H23z"/><path d="M62 34h13l12 15v13H62z"/><path d="M68 39h5l8 10H68z" fill="var(--icon-window)"/><path d="M22 55h40v8H22z"/><circle cx="37" cy="64" r="9"/><circle cx="75" cy="64" r="9"/><circle cx="37" cy="64" r="4" fill="var(--icon-window)"/><circle cx="75" cy="64" r="4" fill="var(--icon-window)"/>',
 taxi:'<path d="M25 44l9-20h32l10 20 7 8v16H17V52z"/><path d="M35 29h29l6 15H29z" fill="var(--icon-window)"/><rect x="42" y="15" width="16" height="9" rx="2"/><path d="M24 54h10m32 0h10M33 63h34" fill="none"/><path d="M24 69v5m51-5v5" fill="none"/>',
 warehouse:'<path d="M19 29l31-17 31 17v38L50 84 19 67z"/><path d="M19 29l31 18 31-18M50 47v37M34 21l31 18v16" fill="none"/>',
 account:'<circle cx="50" cy="29" r="15"/><path d="M21 79V68a29 29 0 0 1 58 0v11z"/><path d="M29 76v-6m42 6v-6" fill="none"/>'
 };
 function icon(id){return '<svg class="champagne-icon" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><linearGradient id="gold-'+id+'" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fff0cf"/><stop offset=".5" stop-color="#d9b77a"/><stop offset="1" stop-color="#94703d"/></linearGradient></defs><g fill="url(#gold-'+id+')" stroke="var(--icon-stroke)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">'+(shapes[id]||shapes.fleet)+'</g></svg>';}
 const menu=[['documents','Документы','Бланки и реквизиты'],['business','Транспорт, склад и финансы','Управление вашим делом']];
 function businessPage(){const items=[['transport','Транспорт','Автопарк, рейсы и калькуляторы'],['warehouse','Склад','Товары и движения'],['dashboard','Финансы и показатели','Результаты вашего дела']];return '<div class="page-navigation"><button type="button" class="back-to-home" data-go-home>⌂ Главная</button><button type="button" class="back-to-home" data-go-back>‹ Назад</button></div><div class="champagne-menu champagne-transport-menu">'+items.map(([id,title,sub])=>'<button type="button" class="champagne-tile" data-page="'+id+'">'+icon(id==='business'?'dashboard':id)+'<span class="champagne-tile-title">'+title+'</span><span class="champagne-tile-sub">'+sub+'</span></button>').join('')+'</div>';}
 function transportPage(){const items=[['fleet','Автопарк','Грузовой транспорт, таксопарк и аренда'],['trips','Рейсы','Маршруты и перевозки'],['calculators','Калькуляторы','Расчёты перевозок']];return '<div class="page-navigation"><button type="button" class="back-to-home" data-go-home>⌂ Главная</button><button type="button" class="back-to-home" data-go-back>‹ Назад</button></div><div class="champagne-home-head"><h1>Транспорт</h1></div><div class="champagne-menu champagne-transport-menu">'+items.map(([id,title,sub])=>'<button type="button" class="champagne-tile" data-page="'+id+'">'+icon(id==='business'?'dashboard':id)+'<span class="champagne-tile-title">'+title+'</span><span class="champagne-tile-sub">'+sub+'</span></button>').join('')+'</div>';}
 homePage=function(){return '<div class="champagne-menu">'+menu.map(([id,title,sub])=>'<button type="button" class="champagne-tile" data-page="'+id+'">'+icon(id==='business'?'dashboard':id)+'<span class="champagne-tile-title">'+title+'</span><span class="champagne-tile-sub">'+sub+'</span></button>').join('')+'</div>';};
 fleetPage=function(){return '<div class="champagne-home-head"><div><p class="champagne-eyebrow">ТРАНСПОРТ И АРЕНДА</p><h1>Автопарк</h1></div></div><div class="champagne-menu champagne-fleet-menu">'+fleetSections.map(([id,,title])=>'<button type="button" class="champagne-tile" data-page="'+id+'">'+icon(id==='taxi'?'taxi':'fleet')+'<span class="champagne-tile-title">'+esc(title)+'</span></button>').join('')+'</div>';};
 const originalAccount=accountPage;
 accountPage=function(){
  const t=document.createElement('template');t.innerHTML=originalAccount();t.content.querySelector('.top')?.remove();
  const profile=t.content.querySelector('.card.section'),subscription=t.content.querySelector('.account-panels');
  const user=currentUser||{},name=user.full_name||'Ваш профиль',initial=Array.from(name.trim())[0]||'Б';
  const tabs=[['profile','Профиль'],['appearance','Оформление'],['subscription','Подписка']];
  return '<div class="champagne-account-head"><div class="champagne-avatar" aria-hidden="true">'+esc(initial.toUpperCase())+'</div><div><p class="champagne-eyebrow">ЛИЧНЫЙ КАБИНЕТ</p><h1>'+esc(name)+'</h1><p class="muted">'+esc(user.email||'')+'</p></div></div><div class="champagne-account-tabs" role="tablist" aria-label="Настройки личного кабинета">'+tabs.map(([id,title])=>'<button type="button" id="account-tab-'+id+'" role="tab" aria-controls="account-panel-'+id+'" aria-selected="'+(appearanceTab===id)+'" data-account-tab="'+id+'">'+title+'</button>').join('')+'</div>'+tabs.filter(([id])=>id!=='appearance').map(([id])=>'<section id="account-panel-'+id+'" role="tabpanel" aria-labelledby="account-tab-'+id+'" '+(appearanceTab!==id?'hidden':'')+'>'+(id==='profile'?profile?.outerHTML||'':subscription?.outerHTML||'')+'</section>').join('')+'<section id="account-panel-appearance" role="tabpanel" aria-labelledby="account-tab-appearance" '+(appearanceTab!=='appearance'?'hidden':'')+'><form class="card champagne-appearance" id="appearance-form"><h2>Оформление</h2><p class="muted">Выберите удобную тему интерфейса.</p><fieldset><legend>Тема интерфейса</legend><div class="champagne-theme-choices">'+['light','dark'].map(theme=>'<label class="champagne-theme-choice" data-preview-theme="'+theme+'"><input type="radio" name="appearance-theme" value="'+theme+'" '+(root.dataset.theme===theme?'checked':'')+'><span class="theme-miniature" aria-hidden="true"><i></i><span><b></b><b></b><b></b><b></b></span></span><span class="theme-choice-caption"><strong>'+(theme==='light'?'☀ Светлая':'☾ Тёмная')+'</strong><span class="theme-selected-mark" aria-hidden="true">✓</span></span></label>').join('')+'</div></fieldset><p class="muted champagne-appearance-hint">Настройка сохраняется на этом устройстве. Перед сохранением можно посмотреть обе темы.</p><button type="submit" class="btn">Сохранить оформление</button><p id="appearance-status" role="status" aria-live="polite"></p></form></section>';
 };
 function refreshThemeControls(){document.querySelectorAll('[name="appearance-theme"]').forEach(r=>r.checked=r.value===root.dataset.theme);const toggle=document.querySelector('[data-theme-toggle]');if(toggle){toggle.textContent=root.dataset.theme==='dark'?'☀︎':'☾';toggle.setAttribute('aria-label',root.dataset.theme==='dark'?'Включить светлую тему':'Включить тёмную тему');}}
 function saveTheme(theme){try{localStorage.setItem(themeKey(),theme);appearanceDraft=null;applyTheme(theme);refreshThemeControls();return true;}catch{return false;}}
 const originalRender=render;
 render=function(){
  const next=String(currentUser?.email||'visitor').toLowerCase();
  if(identity!==next){identity=next;appearanceDraft=null;applyTheme(storedTheme());}
  if(page!=='account'&&appearanceDraft!==null){appearanceDraft=null;applyTheme(storedTheme());}
  originalRender();
  if(page==='business')document.getElementById('content').innerHTML=businessPage();
  if(page==='transport')document.getElementById('content').innerHTML=transportPage();
  let top=document.querySelector('.champagne-topbar');if(!top){top=document.createElement('header');top.className='champagne-topbar';document.getElementById('content').before(top);}
  const name=currentUser?.full_name?.trim().split(/\s+/)[0]||'Личный кабинет';
  top.innerHTML='<button type="button" class="champagne-wordmark" data-page="home" aria-label="Главное меню"><span class="champagne-wordmark-line">'+logo()+'</span><span class="champagne-brand-slogan">Для тех, кто делает.</span></button><div class="champagne-top-actions"><time class="champagne-clock" data-moscow-clock title="Московское время" aria-label="Дата и время по Москве"></time><button type="button" class="champagne-theme-toggle" data-theme-toggle></button><button type="button" class="champagne-profile-link" data-page="account"><span class="champagne-profile-initial" aria-hidden="true">'+esc(Array.from(name)[0].toUpperCase())+'</span><span>'+esc(name)+'</span></button></div>';
  refreshThemeControls();
 };
 document.addEventListener('click',e=>{
  const tab=e.target.closest('[data-account-tab]');if(tab){appearanceTab=tab.dataset.accountTab;document.querySelectorAll('[data-account-tab]').forEach(x=>x.setAttribute('aria-selected',String(x===tab)));document.querySelectorAll('[id^="account-panel-"]').forEach(x=>x.hidden=x.id!=='account-panel-'+appearanceTab);}
  if(e.target.closest('[data-theme-toggle]')){if(!saveTheme(root.dataset.theme==='dark'?'light':'dark'))alert('Не удалось сохранить тему на устройстве.');}
 });
 document.addEventListener('change',e=>{if(e.target.name==='appearance-theme'){appearanceDraft=e.target.value;applyTheme(appearanceDraft);refreshThemeControls();const status=document.getElementById('appearance-status');if(status)status.textContent='Предпросмотр. Нажмите «Сохранить оформление», чтобы оставить эту тему.';}});
 document.addEventListener('submit',e=>{if(e.target.id!=='appearance-form')return;e.preventDefault();const value=e.target.elements['appearance-theme'].value;document.getElementById('appearance-status').textContent=saveTheme(value)?'Оформление сохранено.':'Не удалось сохранить настройку. Проверьте свободное место на устройстве.';});
 applyTheme(storedTheme());render();
})();
