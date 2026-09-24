const spaceCanvas = document.getElementById('spaceCanvas');
const orbCanvas = document.getElementById('orbCanvas');
const waveCanvas = document.getElementById('waveCanvas');
const orbButton = document.getElementById('orbButton');

const stateText = document.getElementById('stateText');
const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date');
const micStatus = document.getElementById('micStatus');
const recDot = document.getElementById('recDot');
const transcriptLog = document.getElementById('transcriptLog');
const engineStatus = document.getElementById('engineStatus');

const sctx = spaceCanvas.getContext('2d');
const octx = orbCanvas.getContext('2d');
const wctx = waveCanvas.getContext('2d');

let W = 0, H = 0;
let orbSize = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 2);
let listening = false;
let micStream = null;
let audioCtx = null;
let analyser = null;
let audioData = null;
let recognition = null;
let speechSupported = false;
let animationId = 0;
let time = 0;
let stars = [];
let particles = [];
let transcriptNodes = [];

function resizeCanvas(canvas, ctx, cssW, cssH){
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}

function resizeAll(){
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  resizeCanvas(spaceCanvas, sctx, W, H);
  orbSize = orbButton.getBoundingClientRect().width;
  resizeCanvas(orbCanvas, octx, orbSize, orbSize);
  const wr = waveCanvas.getBoundingClientRect();
  resizeCanvas(waveCanvas, wctx, wr.width, wr.height);
  makeStars();
  makeParticles();
}
window.addEventListener('resize', resizeAll);

function makeStars(){
  stars = Array.from({length: Math.floor(W*H/7500)}, () => ({
    x:Math.random()*W,
    y:Math.random()*H,
    r:Math.random()*1.2+.15,
    a:Math.random()*.75+.1,
    tw:Math.random()*Math.PI*2,
    sp:Math.random()*.5+.15
  }));
}

function makeParticles(){
  particles = Array.from({length: 180}, (_,i) => ({
    a: Math.random()*Math.PI*2,
    r: 0.16 + Math.random()*0.43,
    p: 0.55 + Math.random()*2.8,
    s: Math.random()*.009 + .002,
    size: Math.random()*1.6+.2,
    band: i%3
  }));
}

function updateClock(){
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString('en-GB', {hour12:false});
  dateEl.textContent = now.toLocaleDateString('en-GB', {
    day:'2-digit', month:'short', year:'numeric'
  }).toUpperCase();
}
setInterval(updateClock,1000);
updateClock();

function drawSpace(){
  sctx.clearRect(0,0,W,H);
  const g = sctx.createRadialGradient(W*.5,H*.45,20,W*.5,H*.45,Math.max(W,H)*.65);
  g.addColorStop(0,'rgba(7,43,65,.18)');
  g.addColorStop(.35,'rgba(3,30,45,.10)');
  g.addColorStop(1,'rgba(0,0,0,0)');
  sctx.fillStyle = g;
  sctx.fillRect(0,0,W,H);

  for(const st of stars){
    st.tw += .007*st.sp;
    const a = st.a*(.65+.35*Math.sin(st.tw));
    sctx.beginPath();
    sctx.fillStyle = `rgba(106,210,232,${a})`;
    sctx.arc(st.x,st.y,st.r,0,Math.PI*2);
    sctx.fill();
  }

  // A subtle nebula band, matching the reference's cyan-blue space haze.
  sctx.save();
  sctx.globalAlpha = .08;
  sctx.filter = 'blur(24px)';
  const ng = sctx.createLinearGradient(0,H*.25,W,H*.73);
  ng.addColorStop(0,'rgba(0,0,0,0)');
  ng.addColorStop(.35,'rgba(51,192,225,.8)');
  ng.addColorStop(.55,'rgba(63,107,197,.55)');
  ng.addColorStop(1,'rgba(0,0,0,0)');
  sctx.strokeStyle = ng;
  sctx.lineWidth = 65;
  sctx.beginPath();
  sctx.moveTo(-100,H*.56); sctx.quadraticCurveTo(W*.48,H*.18,W+100,H*.46); sctx.stroke();
  sctx.restore();
}

function glowStroke(ctx, alpha=1){
  ctx.shadowColor = `rgba(82,240,255,${.55*alpha})`;
  ctx.shadowBlur = 12*alpha;
}
function resetShadow(ctx){ctx.shadowBlur=0;ctx.shadowColor='transparent'}

function drawOrb(){
  const S = orbSize, cx=S/2, cy=S/2;
  octx.clearRect(0,0,S,S);
  const activity = listening ? 1 : .36;
  const bass = getAudioLevel();

  // Outer HUD rings
  octx.save();
  octx.translate(cx,cy);
  for(let i=0;i<6;i++){
    const r = S*(.245 + i*.065);
    const wobble = Math.sin(time*.00045+i*1.31)*S*.004*activity;
    octx.beginPath();
    octx.setLineDash(i%2 ? [2,7] : []);
    octx.lineWidth = 0.8 + (i===2?0.4:0);
    octx.strokeStyle = `rgba(107,220,242,${0.14 + (i===2?.16:0)})`;
    octx.arc(0,0,r+wobble,0,Math.PI*2);
    octx.stroke();
    octx.setLineDash([]);
  }

  // rotating tick marks
  for(let i=0;i<40;i++){
    const a=i*Math.PI*2/40 + time*.00007*(i%2?1:-1);
    const r = S*.425;
    const len = i%5===0 ? 8 : 3;
    octx.save(); octx.rotate(a);
    octx.strokeStyle = `rgba(111,226,243,${i%5===0?.34:.16})`;
    octx.lineWidth = 1;
    octx.beginPath(); octx.moveTo(r-len,r*0); octx.lineTo(r,r*0); octx.stroke();
    octx.restore();
  }
  octx.restore();

  // Outer luminous halo
  const halo = octx.createRadialGradient(cx,cy,S*.12,cx,cy,S*.49);
  halo.addColorStop(0,'rgba(16,212,237,.02)');
  halo.addColorStop(.55,'rgba(41,205,233,.07)');
  halo.addColorStop(.78,'rgba(89,236,250,.13)');
  halo.addColorStop(1,'rgba(0,0,0,0)');
  octx.fillStyle=halo;
  octx.fillRect(0,0,S,S);

  // Large translucent shell
  const shellR = S*(.29 + bass*.007*activity);
  const shell = octx.createRadialGradient(cx-shellR*.2,cy-shellR*.25,shellR*.06,cx,cy,shellR);
  shell.addColorStop(0,'rgba(104,246,255,.08)');
  shell.addColorStop(.52,'rgba(44,140,183,.08)');
  shell.addColorStop(.82,'rgba(115,241,255,.16)');
  shell.addColorStop(1,'rgba(34,104,142,.01)');
  octx.fillStyle=shell;
  octx.beginPath(); octx.arc(cx,cy,shellR,0,Math.PI*2); octx.fill();

  // Mesh bands
  octx.save(); octx.translate(cx,cy);
  for(let band=0;band<4;band++){
    const rot = time*.00012*(band%2?-.9:1.0);
    octx.save(); octx.rotate(rot);
    octx.beginPath();
    const rx=S*(.23+band*.025), ry=S*(.15+band*.045);
    for(let i=0;i<=180;i++){
      const t=i/180*Math.PI*2;
      const distort=(Math.sin(t*7+time*.001+band)*.018 + Math.sin(t*3-time*.0006)*.012)*activity;
      const x=Math.cos(t)*(rx*(1+distort));
      const y=Math.sin(t)*(ry*(1+distort));
      if(i===0)octx.moveTo(x,y); else octx.lineTo(x,y);
    }
    octx.strokeStyle=`rgba(109,238,249,${.16-.02*band})`;
    octx.lineWidth=.8;
    octx.stroke();
    octx.restore();
  }
  octx.restore();

  // Orbital ellipses
  const orbitCount=8;
  for(let i=0;i<orbitCount;i++){
    const rot=time*.00015*(i%2?-.75:.6)+i*.44;
    const rx=S*(.22+i*.013), ry=S*(.10+i*.008);
    octx.save(); octx.translate(cx,cy); octx.rotate(rot);
    octx.beginPath(); octx.ellipse(0,0,rx,ry,0,0,Math.PI*2);
    octx.strokeStyle=`rgba(118,241,251,${.22-i*.014})`;
    octx.lineWidth=i===4?1.3:.75; glowStroke(octx, .6);
    octx.stroke(); resetShadow(octx);

    const dotA = time*.001*(i%2?-.7:.85) + i;
    const dx=Math.cos(dotA)*rx, dy=Math.sin(dotA)*ry;
    octx.beginPath(); octx.fillStyle='#adfbff'; octx.arc(dx,dy,i===4?3.2:2,0,Math.PI*2); octx.fill();
    resetShadow(octx);
    octx.restore();
  }

  // Fine particle shell
  for(const p of particles){
    p.a += p.s*(listening?1.9:0.75);
    const rr = S*p.r*(1+bass*.09*activity);
    const x=cx+Math.cos(p.a)*rr;
    const y=cy+Math.sin(p.a)*rr*.69;
    octx.beginPath();
    octx.fillStyle=`rgba(141,243,255,${.09 + p.band*.025})`;
    octx.arc(x,y,p.size*(.7+activity*.3),0,Math.PI*2);
    octx.fill();
  }

  // Inner sphere
  const innerR=S*(.115+bass*.012*activity);
  const core=octx.createRadialGradient(cx-innerR*.28,cy-innerR*.33,innerR*.03,cx,cy,innerR);
  core.addColorStop(0,'rgba(105,235,255,.45)');
  core.addColorStop(.28,'rgba(54,158,211,.38)');
  core.addColorStop(.7,'rgba(6,38,76,.72)');
  core.addColorStop(1,'rgba(1,14,32,.95)');
  octx.fillStyle=core;
  octx.beginPath(); octx.arc(cx,cy,innerR,0,Math.PI*2); octx.fill();

  // Inner crisp ring
  octx.beginPath();
  octx.arc(cx,cy,innerR*1.03,0,Math.PI*2);
  octx.strokeStyle=`rgba(130,244,255,${.42+activity*.22})`;
  octx.lineWidth=1;
  glowStroke(octx,activity);
  octx.stroke(); resetShadow(octx);

  // Center pulse
  const pulseR = innerR*(.50 + .07*Math.sin(time*.006)*(listening?1.5:.5) + bass*.04);
  const pg=octx.createRadialGradient(cx,cy,pulseR*.1,cx,cy,pulseR);
  pg.addColorStop(0,`rgba(42,226,250,${.18+activity*.10})`);
  pg.addColorStop(1,'rgba(16,98,172,0)');
  octx.fillStyle=pg;
  octx.beginPath(); octx.arc(cx,cy,pulseR,0,Math.PI*2); octx.fill();
}

function getAudioLevel(){
  if(!analyser || !audioData) return 0;
  analyser.getByteTimeDomainData(audioData);
  let sum=0;
  for(let i=0;i<audioData.length;i++){
    const v=(audioData[i]-128)/128;
    sum += v*v;
  }
  return Math.min(1,Math.sqrt(sum/audioData.length)*3.1);
}

function drawWave(){
  const r=waveCanvas.getBoundingClientRect();
  const w=r.width,h=r.height;
  wctx.clearRect(0,0,w,h);
  const level=listening ? getAudioLevel() : 0.15;
  const amp=h*(listening ? (.10+level*.30) : .07);

  const center=h*.52;
  const segments=220;

  // Glow line
  wctx.save();
  wctx.lineWidth=1.4;
  wctx.strokeStyle='rgba(71,236,255,.82)';
  wctx.shadowColor='rgba(55,223,255,.75)';
  wctx.shadowBlur=10;
  wctx.beginPath();
  for(let i=0;i<segments;i++){
    const x=i/(segments-1)*w;
    const t=i/(segments-1);
    const env=Math.pow(Math.sin(Math.PI*t),2.2);
    const a1=Math.sin(t*15.5+time*.0025);
    const a2=Math.sin(t*29-time*.0032+1.2)*.47;
    const a3=Math.sin(t*47+time*.004)*.22;
    const y=center+(a1+a2+a3)*amp*env*(listening?1:0.42);
    if(i===0)wctx.moveTo(x,y); else wctx.lineTo(x,y);
  }
  wctx.stroke();
  wctx.restore();

  // Fine harmonic strands
  for(let j=1;j<7;j++){
    wctx.beginPath();
    wctx.lineWidth=.45;
    wctx.strokeStyle=`rgba(61,211,238,${.18-j*.018})`;
    for(let i=0;i<segments;i++){
      const x=i/(segments-1)*w, t=i/(segments-1);
      const env=Math.pow(Math.sin(Math.PI*t),2.5);
      const y=center+Math.sin(t*(12+j*3.6)+time*.001*(j%2?1:-1)+j)*amp*env*(.65-j*.045);
      if(i===0)wctx.moveTo(x,y); else wctx.lineTo(x,y);
    }
    wctx.stroke();
  }

  // Baseline
  wctx.beginPath();
  wctx.lineWidth=.5;
  wctx.strokeStyle='rgba(82,189,210,.26)';
  wctx.moveTo(w*.08,center); wctx.lineTo(w*.92,center); wctx.stroke();
}

function frame(ts){
  time=ts;
  drawSpace(); drawOrb(); drawWave();
  animationId=requestAnimationFrame(frame);
}
resizeAll();
frame(0);

function setState(active){
  listening=active;
  stateText.textContent=active ? 'LISTENING' : 'IDLE';
  micStatus.textContent=active ? 'MICROPHONE ACTIVE' : 'MICROPHONE OFF';
  recDot.classList.toggle('on',active);
  orbButton.classList.toggle('active',active);
}

function appendTranscript(text, interim=false){
  if(!text.trim()) return;
  const empty = transcriptLog.querySelector('.transcript-empty');
  if(empty) empty.remove();

  const row=document.createElement('div');
  row.className=`t-row ${interim?'interim':'final'}`;
  row.innerHTML=`<span class="tag">${interim?'LIVE':'YOU'}</span>${escapeHTML(text)}`;
  transcriptLog.appendChild(row);
  transcriptLog.scrollTop=transcriptLog.scrollHeight;

  while(transcriptLog.children.length>7){
    transcriptLog.removeChild(transcriptLog.firstChild);
  }
}

function escapeHTML(str){
  return str.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

async function startMic(){
  if(listening) return;

  if(!navigator.mediaDevices?.getUserMedia){
    engineStatus.textContent='MIC NOT SUPPORTED';
    micStatus.textContent='BROWSER UNSUPPORTED';
    return;
  }

  try{
    micStream=await navigator.mediaDevices.getUserMedia({audio:true});
    audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const source=audioCtx.createMediaStreamSource(micStream);
    analyser=audioCtx.createAnalyser();
    analyser.fftSize=1024;
    analyser.smoothingTimeConstant=.82;
    source.connect(analyser);
    audioData=new Uint8Array(analyser.fftSize);

    setState(true);
    startRecognition();
  }catch(err){
    micStatus.textContent='MIC PERMISSION DENIED';
    engineStatus.textContent='MIC ACCESS FAILED';
    console.error(err);
  }
}

function stopMic(){
  setState(false);
  if(recognition){
    recognition.onend=null;
    try{recognition.stop()}catch(e){}
  }
  if(micStream){
    micStream.getTracks().forEach(t=>t.stop());
    micStream=null;
  }
  if(audioCtx){
    audioCtx.close().catch(()=>{});
    audioCtx=null;
  }
  analyser=null; audioData=null;
}

function startRecognition(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){
    speechSupported=false;
    engineStatus.textContent='WEB SPEECH UNSUPPORTED';
    micStatus.textContent='MIC ONLY';
    return;
  }
  speechSupported=true;
  engineStatus.textContent='WEB SPEECH API';
  recognition=new SR();
  recognition.continuous=true;
  recognition.interimResults=true;
  recognition.lang='en-IN';

  recognition.onstart=()=>setState(true);
  recognition.onresult=(event)=>{
    let interim='';
    for(let i=event.resultIndex;i<event.results.length;i++){
      const txt=event.results[i][0].transcript;
      if(event.results[i].isFinal){
        appendTranscript(txt,false);
        // Hook point for your FRIDAY command router:
        window.dispatchEvent(new CustomEvent('friday-command',{detail:{text:txt}}));
      }else interim += txt;
    }
    if(interim) showInterim(interim);
  };
  recognition.onerror=(event)=>{
    console.warn('Speech recognition:',event.error);
    if(event.error==='not-allowed' || event.error==='service-not-allowed'){
      micStatus.textContent='SPEECH ACCESS DENIED';
    }
  };
  recognition.onend=()=>{
    if(listening && micStream){
      try{ recognition.start(); }catch(e){}
    }
  };
  try{recognition.start()}catch(e){}
}

function showInterim(text){
  const existing=transcriptLog.querySelector('.interim');
  if(existing){
    existing.innerHTML=`<span class="tag">LIVE</span>${escapeHTML(text)}`;
  }else{
    appendTranscript(text,true);
  }
}

orbButton.addEventListener('click',()=>{
  if(listening) stopMic(); else startMic();
});

// Optional integration example:
// window.addEventListener('friday-command', e => console.log('Command:', e.detail.text));
