// Updated: uses user-provided flower image; envelope opens slowly; letter rises from inside
// letter scales then typing begins slowly and lines are close; many hearts fly behind; card drifts up & disappears.

const openBtn = document.getElementById('openBtn');
const flowerStage = document.getElementById('flowerStage');
const flowerWrap = document.getElementById('flowerWrap');
const envelopeStage = document.getElementById('envelopeStage');
const envelopeBody = document.getElementById('envelopeBody');
const envelopeFlap = document.getElementById('envelopeFlap');
const letterStage = document.getElementById('letterStage');
const heartsBack = document.getElementById('heartsBack');
const card = document.getElementById('card');
const cardText = document.getElementById('cardText');

const MESSAGE = [
  "💖 Hôm nay là ngày 20/10 💖",
  "Anh muốn gửi tới em thật nhiều yêu thương.",
  "Thật nhiều niềm vui và nụ cười xinh nhất 🌸",
  "Chúc em luôn rạng rỡ và hạnh phúc như bây giờ 💕",
  "Cảm ơn em vì đã xuất hiện trong cuộc đời của anh 💌"
];

// timings
const FLOWER_EXIT_MS = 640;
const ENVELOPE_SHOW_MS = 220;
const FLAP_OPEN_MS = 950;      // slow flap open
const LETTER_RISE_MS = 900;    // slow letter rise
const LETTER_SCALE_MS = 500;   // scale up then settle
const TYPING_SPEED_MS = 80;    // slower typing (user requested slower)
const HEART_SPAWN_INTERVAL = 110; // many hearts
let heartSpawner = null;

function delay(ms){ return new Promise(res=>setTimeout(res, ms)); }

openBtn.addEventListener('click', async ()=> {
  // disable button
  openBtn.disabled = true; openBtn.style.pointerEvents = 'none';

  // 1) flower exit
  flowerWrap.style.transition = `transform ${FLOWER_EXIT_MS}ms cubic-bezier(.2,.9,.2,1), opacity ${FLOWER_EXIT_MS}ms`;
  flowerWrap.style.transform = 'translateY(-240px) scale(.96) rotate(-3deg)';
  flowerWrap.style.opacity = '0';
  openBtn.style.transform = 'translateY(8px) scale(.96)';
  openBtn.style.opacity = '0';
  await delay(FLOWER_EXIT_MS + 60);

  flowerStage.classList.add('hidden');

  // 2) show envelope quickly
  envelopeStage.classList.remove('hidden');
  envelopeStage.style.opacity = '1';
  await delay(ENVELOPE_SHOW_MS);

  // 3) open flap slowly with 3D feel
  envelopeStage.classList.add('envelope-open');
  await delay(FLAP_OPEN_MS);

  // 4) letter rises slowly from inside envelope
  // fade envelope out slowly (keeping flap opened appearance)
  envelopeStage.style.transition = `opacity ${LETTER_RISE_MS}ms ease`;
  envelopeStage.style.opacity = '0';
  await delay(LETTER_RISE_MS);
  envelopeStage.classList.add('hidden');

  // 5) show letter stage and start hearts behind
  letterStage.classList.remove('hidden');
  // initial card position (slightly down & small)
  card.style.transform = 'translateY(40px) scale(.92)';
  card.style.opacity = '0';
  startHearts();

  // 6) rise & scale card gradually to simulate trồi lên then phóng to readable size
  await delay(120);
  card.style.transition = `transform ${LETTER_SCALE_MS}ms cubic-bezier(.2,.9,.2,1), opacity ${LETTER_SCALE_MS}ms`;
  card.style.transform = 'translateY(-6px) scale(1.08)';
  card.style.opacity = '1';
  await delay(LETTER_SCALE_MS + 40);
  // settle to final size
  card.style.transition = `transform 300ms ease`;
  card.style.transform = 'translateY(0) scale(1)';
  await delay(160);

  // 7) start typing only after the card is settled
  const fullText = MESSAGE.join("\n\n") + "\n";
  await typeText(fullText, cardText, TYPING_SPEED_MS);

  // 8) after a pause, card drifts up slowly and fades away
  await delay(2500);
  card.style.transition = 'transform 1200ms ease, opacity 1200ms ease';
  card.style.transform = 'translateY(-120px) scale(.96)';
  card.style.opacity = '0';
  // stop hearts after a delay
  setTimeout(()=> stopHearts(), 1600);
});

// typing function
function typeText(text, target, speed){
  return new Promise(resolve => {
    let i = 0;
    target.innerHTML = "";
    function step(){
      if(i < text.length){
        target.innerHTML += text.charAt(i);
        i++;
        setTimeout(step, speed);
      } else {
        resolve();
      }
    }
    step();
  });
}

/* HEARTS: spawn many hearts with varied curved paths behind card */
function startHearts(){
  if(heartSpawner) return;
  heartSpawner = setInterval(()=> spawnHeart(), HEART_SPAWN_INTERVAL);
}

function stopHearts(){
  if(heartSpawner){ clearInterval(heartSpawner); heartSpawner = null; }
}

function spawnHeart(){
  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.textContent = '💖';
  heart.style.position = 'absolute';

  const w = window.innerWidth;
  const h = window.innerHeight;

  // spawn around center
  const cx = w/2; const cy = h/2;
  const spreadX = w * 0.45;
  const spreadY = h * 0.36;

  const startX = cx + (Math.random()-0.5) * spreadX;
  const startY = cy + (Math.random()*0.25 + 0.2) * spreadY; // slightly below center
  const endX = cx + (Math.random()-0.5) * spreadX * (0.8 + Math.random()*0.6);
  const endY = cy - (0.95*h + Math.random()*120);

  const cp1X = startX + (Math.random()-0.5) * 360;
  const cp1Y = startY - (80 + Math.random()*300);
  const cp2X = endX + (Math.random()-0.5) * 300;
  const cp2Y = endY + (60 + Math.random()*180);

  const size = 26 + Math.random()*60;
  heart.style.fontSize = `${size}px`;
  heart.style.left = `${startX}px`;
  heart.style.top = `${startY}px`;
  heart.style.opacity = `${0.85 - Math.random()*0.4}`;
  heart.style.zIndex = 1;
  heartsBack.appendChild(heart);

  const duration = 2600 + Math.random()*3600; // 2.6s - 6.2s
  const start = performance.now();

  function easeOut(t){ return 1 - Math.pow(1 - t, 3); }
  function animate(now){
    const t = Math.min((now - start)/duration, 1);
    const et = easeOut(t);

    const x = cubicBezier(startX, cp1X, cp2X, endX, et);
    const y = cubicBezier(startY, cp1Y, cp2Y, endY, et);

    const scale = 1 - 0.55*et;
    const rot = (Math.random()-0.5)*90*(1-et);
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.transform = `translate(-50%,-50%) scale(${scale}) rotate(${rot}deg)`;
    heart.style.opacity = `${(1-et)*0.95}`;

    if(t < 1){ requestAnimationFrame(animate); } else { heart.remove(); }
  }
  requestAnimationFrame(animate);
}

function cubicBezier(p0,p1,p2,p3,t){
  const c = 3*(p1-p0);
  const b = 3*(p2-p1) - c;
  const a = p3 - p0 - c - b;
  return a*Math.pow(t,3) + b*Math.pow(t,2) + c*t + p0;
}
