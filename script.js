const openBtn = document.getElementById('openBtn');
const flowerStage = document.getElementById('flowerStage');
const envelopeStage = document.getElementById('envelopeStage');
const envelopeBody = document.getElementById('envelopeBody');
const envelopeFlap = document.getElementById('envelopeFlap');
const innerLetter = document.getElementById('innerLetter');
const letterStage = document.getElementById('letterStage');
const card = document.getElementById('card');
const cardText = document.getElementById('cardText');
const heartsContainer = document.getElementById('heartsContainer');
const fireworks = document.getElementById('fireworks');
const ctx = fireworks.getContext ? fireworks.getContext('2d') : null;

const MESSAGE = [
  "💖 Hôm nay là ngày 20/10 💖",
  "Anh muốn gửi tới em thật nhiều yêu thương.",
  "Thật nhiều niềm vui và nụ cười xinh nhất 🌸",
  "Chúc em luôn rạng rỡ và hạnh phúc như bây giờ 💕",
  "Cảm ơn em vì đã xuất hiện trong cuộc đời của anh 💌"
];

function delay(ms){ return new Promise(r=>setTimeout(r, ms)); }

/* resize fireworks canvas */
function resizeCanvas(){
  if(!ctx) return;
  fireworks.width = window.innerWidth;
  fireworks.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* helper to clone paper and animate to center & enlarge */
function animateCloneToCenter(sourceEl, targetW = Math.min(window.innerWidth * 0.9, 1000), targetH = Math.min(window.innerHeight * 0.85, 900), duration = 900) {
  const rect = sourceEl.getBoundingClientRect();
  const clone = sourceEl.cloneNode(true);
  clone.classList.add('paper-curved');
  // set inline styles for fixed positioning
  clone.style.position = 'fixed';
  clone.style.left = rect.left + 'px';
  clone.style.top = rect.top + 'px';
  clone.style.width = rect.width + 'px';
  clone.style.height = rect.height + 'px';
  clone.style.margin = '0';
  clone.style.transform = getComputedStyle(sourceEl).transform || 'none';
  clone.style.transition = `all ${duration}ms cubic-bezier(.2,.9,.2,1)`;
  clone.style.zIndex = 1000;
  clone.style.opacity = '1';
  document.body.appendChild(clone);

  // compute target center pos
  const targetLeft = (window.innerWidth - targetW) / 2;
  const targetTop = (window.innerHeight - targetH) / 2;

  // trigger reflow then animate
  requestAnimationFrame(() => {
    clone.style.left = targetLeft + 'px';
    clone.style.top = targetTop + 'px';
    clone.style.width = targetW + 'px';
    clone.style.height = targetH + 'px';
    clone.style.transform = 'translateZ(0) scale(1)'; // keep simple
  });

  return new Promise(res => {
    setTimeout(() => res(clone), duration + 30);
  });
}

/* typewriter */
async function typeText(text, target, speed){
  target.textContent = "";
  for(let i=0;i<text.length;i++){
    target.textContent += text[i];
    await delay(speed);
  }
}

/* hearts floating like bubbles */
let heartsInterval;
function startHearts(){
  if(heartsInterval) clearInterval(heartsInterval);
  heartsInterval = setInterval(()=>{
    const h = document.createElement('div');
    h.className = 'heart';
    h.style.left = (5 + Math.random()*90) + '%';
    const size = 36 + Math.random()*40;
    h.style.width = size + 'px';
    h.style.height = size + 'px';
    heartsContainer.appendChild(h);
    // remove after animation time (7s)
    setTimeout(()=>{ h.remove(); }, 7500);
  }, 420);
}
function stopHearts(){
  if(heartsInterval) clearInterval(heartsInterval);
}

/* fireworks (keeps existing behaviour) */
let particles = [];
let fwRunning = false;
function startFireworks(){
  if(!ctx) return;
  resizeCanvas();
  if(fwRunning) return;
  fwRunning = true;

  function createBurst(x,y,count=80,spread=6){
    const colors = ["#ff94c2","#ffb6d5","#ffcce0","#ff80bf","#ff9ac8"];
    for(let i=0;i<count;i++){
      const angle = Math.random()*Math.PI*2;
      const speed = (Math.random()*spread) + (spread*0.6);
      particles.push({
        x,y,
        vx: Math.cos(angle)*speed,
        vy: Math.sin(angle)*speed,
        life: 60 + Math.random()*60,
        size: 2 + Math.random()*3,
        color: colors[Math.floor(Math.random()*colors.length)]
      });
    }
  }

  // continuous bursts: center + corners
  createBurst(window.innerWidth/2, window.innerHeight/2, 200, 12); // big center first
  const corners = [[80,80],[window.innerWidth-80,80],[80,window.innerHeight-80],[window.innerWidth-80,window.innerHeight-80]];
  corners.forEach(c => createBurst(c[0], c[1], 90, 6));

  function loop(){
    ctx.clearRect(0,0,fireworks.width, fireworks.height);
    // occasional extra corner bursts for continuity
    if(Math.random() < 0.18){
      const c = corners[Math.floor(Math.random()*corners.length)];
      createBurst(c[0]+(Math.random()*40-20), c[1]+(Math.random()*40-20), 60, 5);
    }
    for(let i = particles.length - 1; i >= 0; i--){
      const p = particles[i];
      p.vy += 0.03;
      p.x += p.vx; p.y += p.vy; p.life--;
      ctx.globalAlpha = Math.max(0, p.life / 100);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.fill();
      if(p.life <= 0) particles.splice(i,1);
    }
    if(fwRunning) requestAnimationFrame(loop);
  }
  loop();
}

function stopFireworks(){
  fwRunning = false;
  particles = [];
  if(ctx) ctx.clearRect(0,0,fireworks.width,fireworks.height);
}

/* main sequence — only changed letter behaviour (realistic: hidden -> partial rise -> clone -> enlarge -> reveal card) */
openBtn.addEventListener('click', async () => {
  openBtn.disabled = true;

  // fade flower
  flowerStage.style.transition = 'opacity 360ms ease, transform 360ms ease';
  flowerStage.style.opacity = '0';
  flowerStage.style.transform = 'translateY(-20px) scale(.99)';
  await delay(420);
  flowerStage.classList.add('hidden');

  // show envelope and open flap
  envelopeStage.classList.remove('hidden');
  await delay(200);
  envelopeBody.classList.add('envelope-open'); // flap open via css selector change
  envelopeStage.classList.add('envelope-open');
  await delay(700);

  // PARTIAL: the real inner letter (still inside) becomes visible slightly (partial rise)
  // we add class to move it a bit upward so user sees it pushing out
  innerLetter.classList.add('letter-partial'); // partial visible (still mostly inside)
  await delay(700);

  // Now we clone the innerLetter and animate the clone to center & scale (seamless rise+zoom)
  const clone = await animateCloneToCenter(innerLetter, Math.min(window.innerWidth*0.92, 1000), Math.min(window.innerHeight*0.86, 900), 900);

  // once clone is at center and enlarged, hide envelope and clone stays to keep continuity
  envelopeStage.style.opacity = '0';
  await delay(300);
  envelopeStage.classList.add('hidden');

  // start background effects immediately
  letterStage.classList.remove('hidden');
  startFireworks();
  startHearts();

  // after clone finished positioning, fade clone out and reveal card area
  await delay(120);
  clone.style.transition = 'opacity 260ms ease';
  clone.style.opacity = '0';
  await delay(300);
  clone.remove();

  // show card (actual content area)
  card.classList.add('show');

  // type faster as requested
  await typeText(MESSAGE.join("\n\n"), cardText, 45);

  // keep effects for a while then fade
  await delay(1600);
  stopHearts();
  stopFireworks();
});
