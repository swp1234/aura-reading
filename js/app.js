// Aura Color Studio: a disclosed, authored entertainment mapping.
(function(){
  'use strict';
  const ORDER=['ruby','ocean','golden','emerald','violet','crystal','nebula','obsidian'];
  const COLORS={ruby:'#e94255',ocean:'#3b82f6',golden:'#f5b82e',emerald:'#20b77a',violet:'#8b5cf6',crystal:'#cbd5e1',nebula:'#ec5aa7',obsidian:'#4b5563'};
  const QUESTIONS=[
    [['ruby',3],['obsidian',1],['ocean',3],['crystal',1],['golden',3],['emerald',1],['violet',3],['nebula',1]],
    [['emerald',3],['nebula',1],['ocean',3],['crystal',1],['golden',3],['ruby',1],['obsidian',3],['violet',1]],
    [['ruby',3],['obsidian',1],['ocean',3],['violet',1],['golden',3],['nebula',1],['crystal',3],['emerald',1]],
    [['ruby',3],['golden',1],['ocean',3],['nebula',1],['emerald',3],['crystal',1],['violet',3],['obsidian',1]],
    [['ruby',3],['golden',1],['ocean',3],['obsidian',1],['violet',3],['nebula',1],['crystal',3],['emerald',1]],
    [['ruby',3],['golden',1],['ocean',3],['violet',1],['emerald',3],['crystal',1],['obsidian',3],['nebula',1]],
    [['emerald',3],['crystal',1],['violet',3],['ocean',1],['ruby',3],['golden',1],['nebula',3],['obsidian',1]],
    [['obsidian',3],['ocean',1],['crystal',3],['emerald',1],['nebula',3],['violet',1],['golden',3],['ruby',1]],
    [['golden',3],['violet',1],['ocean',3],['emerald',1],['nebula',3],['crystal',1],['ruby',3],['obsidian',1]],
    [['ruby',3],['golden',1],['ocean',3],['violet',1],['emerald',3],['crystal',1],['obsidian',3],['nebula',1]]
  ];
  window.AuraStudioContract=Object.freeze({order:[...ORDER],questions:QUESTIONS.map(q=>q.map(x=>[...x])),points:[3,1],tieOrder:[...ORDER]});
  const scores=Object.fromEntries(ORDER.map(k=>[k,0])),emitted=new Set();let current=0,transitioning=false,completed=false,last=[];
  const $=id=>document.getElementById(id),t=(key,fallback)=>window.i18n?.t?window.i18n.t(key,fallback):(fallback||key);
  function trackOnce(name){if(!emitted.has(name)){emitted.add(name);if(typeof gtag==='function')gtag('event',name)}}
  function show(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(id)?.classList.add('active');window.scrollTo({top:0,behavior:'smooth'})}
  function reset(){ORDER.forEach(k=>{scores[k]=0});current=0;transitioning=false;completed=false;last=[]}
  function start(){reset();show('question-screen');render();trackOnce('aura_studio_start')}
  function render(){const n=current+1;$('progress-text').textContent=`${n} / ${QUESTIONS.length}`;$('progress-bar').style.width=`${current/QUESTIONS.length*100}%`;$('question-label').textContent=`${t('quiz.label','QUESTION')} ${n}`;$('question-text').textContent=t(`quiz.q${n}.text`,`Question ${n}`);const box=$('options');box.innerHTML='';for(let i=0;i<4;i++){const b=document.createElement('button');b.className='option';b.textContent=t(`quiz.q${n}.opt${i}`,`Option ${i+1}`);b.addEventListener('click',()=>answer(i,b));box.appendChild(b)}}
  function answer(index,selected){if(transitioning)return;transitioning=true;document.querySelectorAll('.option').forEach(b=>{b.disabled=true;b.classList.toggle('selected',b===selected)});const pairs=QUESTIONS[current].slice(index*2,index*2+2);pairs.forEach(([key,value])=>{scores[key]+=value});setTimeout(()=>{current+=1;transitioning=false;if(current===5)trackOnce('aura_studio_halfway');if(current>=QUESTIONS.length)finish();else render()},220)}
  function rank(){return ORDER.map((key,index)=>({key,index,score:scores[key]})).sort((a,b)=>b.score-a.score||a.index-b.index)}
  function finish(){completed=true;last=rank();renderResult();show('result-screen');trackOnce('aura_studio_complete')}
  function renderResult(){if(!last.length)return;const top=last[0],runner=last[1],name=t(`palette.${top.key}`,top.key),runnerName=t(`palette.${runner.key}`,runner.key);$('result-name').textContent=name;$('result-summary').textContent=t('result.summary','Your choices gave the most points to {top}; {runner} came next.').replace('{top}',name).replace('{runner}',runnerName);$('top-score').textContent=`${name} · ${top.score}`;$('runner-score').textContent=`${runnerName} · ${runner.score}`;$('palette-visual').style.setProperty('--palette',COLORS[top.key])}
  async function share(){const data={title:t('app.title','Aura Color Studio'),text:t('share.text','Try this ten-scene color-palette game.'),url:'https://dopabrain.com/aura-reading/'};try{if(navigator.share)await navigator.share(data);else await navigator.clipboard.writeText(`${data.text} ${data.url}`);$('share-status').textContent=t('share.success','Link copied.');trackOnce('aura_share_success')}catch(e){if(e?.name!=='AbortError')$('share-status').textContent=t('share.unavailable','Sharing is unavailable.')}}
  function syncActions(){const l=window.i18n?.currentLang||'en';$('next-reflection')?.setAttribute('href',`/emotion-iceberg/?lang=${l}`);$('next-coffee')?.setAttribute('href',`/mbti-coffee/?lang=${l}`)}
  window.onLanguageChange=function(){window.i18n?.applyTranslations();syncActions();if($('question-screen')?.classList.contains('active')&&!transitioning)render();renderResult()};
  function init(){$('start-btn')?.addEventListener('click',start);$('share-btn')?.addEventListener('click',share);$('lang-select')?.addEventListener('change',e=>window.i18n?.switchLang(e.target.value));$('next-reflection')?.addEventListener('click',()=>trackOnce('aura_reflection_click'));$('next-coffee')?.addEventListener('click',()=>trackOnce('aura_coffee_click'));$('retry-btn')?.addEventListener('click',()=>{if(!completed)return;completed=false;trackOnce('aura_studio_retry');show('start-screen')});const begun=Date.now(),wait=setInterval(()=>{if(window.i18n?.initialized||Date.now()-begun>2000){clearInterval(wait);syncActions();const loader=$('app-loader');if(loader){loader.classList.add('hidden');setTimeout(()=>{loader.style.display='none'},350)}document.body.dataset.auraStudioReady='true'}},50)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
