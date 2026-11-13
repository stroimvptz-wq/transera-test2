'use strict';
(()=>{
 let navigating=false;
 function visit(tool){if(navigating)return;const old=history.state||{};if(old.page==='ai'&&old.aiTool===tool)return;history.pushState({...old,transera:true,page:'ai',aiTool:tool},'', '#ai');}
 window.BUSINESS_AI_NAV={visit};
 function compact(){if(page!=='ai')return;const root=document.querySelector('.ai-page');if(!root)return;root.querySelector('.ai-page-head')?.remove();root.querySelectorAll('[data-ai-chat-check],[data-ai-menu],[data-media-back]').forEach(x=>x.remove());let quota=root.querySelector('.ai-quota');if(!quota){const box=document.createElement('div');box.innerHTML=window.BIZNES_AI_CHAT_BRIDGE?.quotaHTML?.()||'';quota=box.querySelector('.ai-quota');if(quota)root.prepend(box);}const target=root.querySelector('.ai-chat-main > header')||root.querySelector('.ai-workspace > .card')||root;if(target===root){if(quota)quota.classList.add('ai-compact-quota');return;}let bar=target.matches('header')?target:target.querySelector('.ai-work-header');if(!bar){bar=document.createElement('header');bar.className='ai-work-header';target.prepend(bar);}if(quota){quota.classList.add('ai-compact-quota');if(quota.parentNode!==bar)bar.append(quota);}}
 window.BUSINESS_COMPACT_AI=compact;new MutationObserver(compact).observe(document.getElementById('content'),{childList:true,subtree:true});
 const previous=render;render=function(){previous();compact();};
 window.addEventListener('popstate',()=>{setTimeout(()=>{if(page!=='ai')return;const tool=history.state?.aiTool||'menu';navigating=true;window.BUSINESS_MEDIA_DRAFT?.hide();if(tool.startsWith('media-'))window.BUSINESS_MEDIA_DRAFT?.show(tool.slice(6));else window.BIZNES_AI_CHAT_BRIDGE?.show(tool);navigating=false;compact();},0);});
 // Start screen is public and has one entry action, without a registration wall.
 const landing=document.getElementById('landing'),start=document.createElement('section');start.id='business-start';start.className='business-start';start.innerHTML='<div class="business-start-card"><div class="business-start-brand"><span class="champagne-mark" aria-hidden="true"><i></i><i></i></span><span>Бизнес AI</span></div><p>Для тех, кто делает.</p><button type="button" class="btn business-start-button" data-business-start>Начать <span aria-hidden="true">→</span></button></div>';document.body.append(start);if(sessionStorage.getItem('business-start-entered')==='true'||currentUser?.email||['reset','reset-invalid'].includes(landingTab))start.hidden=true;
 document.addEventListener('click',e=>{if(e.target.closest('[data-business-start]')){sessionStorage.setItem('business-start-entered','true');start.hidden=true;landing.hidden=true;page='home';render();}});
 compact();
})();
