const input=document.getElementById('customerName');
const btn=document.getElementById('sendBtn');
const choice=document.getElementById('choice');
const choicePreview=document.getElementById('choicePreview');
const choiceName=document.getElementById('choiceName');
let selected=null;
let publicConfig=window.FLORENTINO_CONFIG||{};

function typed(){return input.value.trim()||'Érica';}
function fitFontPreview(el){
  let size=34;
  el.style.fontSize=size+'px';
  while(el.scrollWidth>el.clientWidth&&size>13){size--;el.style.fontSize=size+'px';}
}
function refreshNames(){
  document.querySelectorAll('.font-preview').forEach(function(el){
    el.textContent=typed();
    requestAnimationFrame(function(){fitFontPreview(el);});
  });
  if(selected) choicePreview.textContent=typed();
}
function bindCards(){
  const cards=Array.from(document.querySelectorAll('.font-card'));
  cards.forEach(function(card){
    card.onclick=function(){
      cards.forEach(function(c){c.classList.remove('on');});
      card.classList.add('on');
      selected={id:card.dataset.id,font:card.dataset.font};
      choice.classList.remove('hidden');
      choicePreview.textContent=typed();
      choicePreview.style.fontFamily='"'+selected.font+'", sans-serif';
      choiceName.textContent='Fonte '+String(selected.id).padStart(2,'0')+' · '+selected.font;
      btn.disabled=false;
    };
  });
}
function loadGoogleFonts(fonts){
  const families=fonts.map(function(f){return 'family='+encodeURIComponent(f.name).replace(/%20/g,'+');}).join('&');
  if(!families)return;
  const old=document.getElementById('dynamic-public-fonts');
  if(old)old.remove();
  const link=document.createElement('link');
  link.id='dynamic-public-fonts';
  link.rel='stylesheet';
  link.href='https://fonts.googleapis.com/css2?'+families+'&display=swap';
  document.head.appendChild(link);
}
function renderPublicFonts(fonts){
  const grid=document.getElementById('fontGrid');
  if(!grid)return;
  selected=null;
  btn.disabled=true;
  choice.classList.add('hidden');
  grid.innerHTML='';
  loadGoogleFonts(fonts);
  fonts.forEach(function(f){
    const card=document.createElement('button');
    card.className='font-card';
    card.dataset.id=String(f.id);
    card.dataset.font=f.name;
    const id=document.createElement('span');
    id.className='font-id';
    id.textContent=String(f.id).padStart(2,'0');
    const preview=document.createElement('span');
    preview.className='font-preview';
    preview.style.fontFamily='"'+f.name+'", sans-serif';
    preview.textContent=typed();
    const name=document.createElement('span');
    name.className='font-name';
    name.textContent=f.name;
    card.append(id,preview,name);
    grid.appendChild(card);
  });
  bindCards();
  refreshNames();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(refreshNames);
}
async function loadPublicConfig(){
  try{
    const response=await fetch('./font-config.json?t='+Date.now(),{cache:'no-store'});
    if(!response.ok)throw new Error('HTTP '+response.status);
    const config=await response.json();
    if(config.whatsapp)publicConfig.whatsapp=config.whatsapp;
    if(Array.isArray(config.fonts))renderPublicFonts(config.fonts);
  }catch(err){
    console.error('Falha ao carregar font-config.json',err);
    bindCards();
    refreshNames();
  }
}
input.addEventListener('input',refreshNames);
btn.addEventListener('click',function(){
  if(!selected)return;
  const nome=input.value.trim();
  if(!nome){input.focus();alert('Digite o nome para gravação.');return;}
  const numero=String(publicConfig.whatsapp||'').replace(/\D/g,'');
  const inicio=publicConfig.mensagemInicial||'Olá! Escolhi minha personalização na página da Florentino Imports.';
  const msg=inicio+'\n\nNome para gravação: '+nome+'\nFonte: '+String(selected.id).padStart(2,'0')+' · '+selected.font;
  const base=numero?'https://wa.me/'+numero:'https://wa.me/';
  window.open(base+'?text='+encodeURIComponent(msg),'_blank');
});
window.addEventListener('resize',refreshNames);
loadPublicConfig();