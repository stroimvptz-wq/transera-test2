'use strict';
(()=>{
 const dateFormat=new Intl.DateTimeFormat('ru-RU',{timeZone:'Europe/Moscow',day:'numeric',month:'long',year:'numeric'}),timeFormat=new Intl.DateTimeFormat('ru-RU',{timeZone:'Europe/Moscow',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 function clock(){const now=new Date(),value=dateFormat.format(now).replace(/\s*г\.$/,'')+' · '+timeFormat.format(now);document.querySelectorAll('[data-moscow-clock]').forEach(node=>{node.dateTime=now.toISOString();if(node.textContent!==value)node.textContent=value;});}
 function navigation(){document.querySelectorAll('.page-navigation').forEach(row=>{const back=row.querySelector('[data-go-back]'),home=row.querySelector('[data-go-home]');if(back&&home){row.prepend(back);row.append(home);}});clock();}
 const previous=render;render=function(){previous();navigation();};
 setInterval(clock,1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)clock();});navigation();
})();
