const openBtn = document.getElementById("openBtn");
const flowerStage = document.getElementById("flowerStage");
const envelopeStage = document.getElementById("envelopeStage");
const envelopeBody = document.getElementById("envelopeBody");
const letterInner = document.getElementById("letterInner");
const cardText = document.getElementById("cardText");

// Lời chúc
const message = "Gửi bé yêu của anh 💌";

// Sparkles setup
const canvas = document.getElementById("sparkles");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const sparkles = [];
for(let i=0;i<50;i++){
  sparkles.push({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    size: Math.random()*4+1,
    dx: (Math.random()-0.5)*0.3,
    dy: (Math.random()-0.5)*0.3,
    alpha: Math.random()
  });
}

function drawSparkles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  sparkles.forEach(s=>{
    ctx.fillStyle=`rgba(255,154,200,${s.alpha})`;
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.size,0,Math.PI*2);
    ctx.fill();
    s.x += s.dx;
    s.y += s.dy;
    if(s.x<0||s.x>canvas.width) s.dx*=-1;
    if(s.y<0||s.y>canvas.height) s.dy*=-1;
  });
  requestAnimationFrame(drawSparkles);
}
drawSparkles();

// Khi click mở thiệp
openBtn.addEventListener("click", ()=>{
  // Ẩn hoa stage
  flowerStage.style.opacity = 0;
  setTimeout(()=>{flowerStage.classList.add("hidden");},350);

  // Hiện envelope stage
  envelopeStage.classList.remove("hidden");
  setTimeout(()=>{
    envelopeBody.classList.add("envelope-open");
    // Sau khi phong bì mở, lá thư bay lên
    setTimeout(()=>{
      letterInner.classList.remove("hidden");
      letterInner.classList.add("show");
      // Hiển thị lời chúc từng ký tự
      let i=0;
      function type(){
        if(i<message.length){
          cardText.innerHTML += message.charAt(i);
          i++;
          setTimeout(type,100);
        }
      }
      type();
    }, 1200);
  },300);
});

