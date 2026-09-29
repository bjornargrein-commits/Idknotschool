const GAMES = [
  {id:"neon", name:"Neon Runner", category:"Arcade", icon:"⚡", desc:"Dodge falling blocks and survive as long as you can."},
  {id:"snake", name:"Snake", category:"Classic", icon:"🐍", desc:"Eat the food, grow longer, and don't hit yourself."},
  {id:"pong", name:"Pong", category:"Classic", icon:"🏓", desc:"Beat the CPU in a fast round of classic Pong."},
  {id:"click", name:"Click Rush", category:"Arcade", icon:"🖱", desc:"Click the targets as quickly as possible for 20 seconds."},
  {id:"memory", name:"Memory Flip", category:"Puzzle", icon:"🧩", desc:"Find all matching pairs with the fewest moves."},
  {id:"breakout", name:"Brick Breaker", category:"Action", icon:"🧱", desc:"Bounce the ball and clear every brick."},
  {id:"dodge", name:"Sky Dodge", category:"Action", icon:"☁", desc:"Move left and right to avoid the incoming hazards."},
  {id:"reaction", name:"Reaction Test", category:"Classic", icon:"🎯", desc:"Wait for green, then click as fast as you can."}
];

const tones=["#20183a,#142b36","#16352d,#152847","#3a1a25,#241932","#17323b,#172341","#33203e,#19233a","#352b18,#20253b","#17332f,#1b233c","#2f2438,#1b2730"];
const grid=document.getElementById("gameGrid"), search=document.getElementById("searchInput"), chips=document.getElementById("categoryChips");
const empty=document.getElementById("emptyState"), modal=document.getElementById("gameModal"), area=document.getElementById("gameArea");
const title=document.getElementById("modalTitle"), desc=document.getElementById("modalDescription"), category=document.getElementById("modalCategory");
const controls=document.getElementById("gameControls");
let selected="All", cleanupGame=()=>{};

document.getElementById("gameCount").textContent=GAMES.length;

function categories(){return ["All",...new Set(GAMES.map(g=>g.category))]}
function renderChips(){chips.innerHTML=categories().map(c=>`<button class="chip ${c===selected?"active":""}" data-cat="${c}">${c}</button>`).join("");chips.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{selected=b.dataset.cat;renderChips();renderGames()})}
function filtered(){const q=search.value.trim().toLowerCase();return GAMES.filter(g=>(selected==="All"||g.category===selected)&&`${g.name} ${g.category} ${g.desc}`.toLowerCase().includes(q))}
function renderGames(){const list=filtered();empty.classList.toggle("hidden",list.length>0);grid.innerHTML=list.map((g,i)=>`<article class="game-card"><div class="game-art" style="background:linear-gradient(135deg,${tones[i%tones.length]})">${g.icon}</div><div class="game-info"><h3 class="game-title">${g.name}</h3><div class="game-meta">${g.category}</div><button class="play-card" data-id="${g.id}">Play</button></div></article>`).join("");grid.querySelectorAll(".play-card").forEach(b=>b.onclick=()=>openGame(b.dataset.id))}
function setControls(html){controls.innerHTML=html}
function openGame(id){const g=GAMES.find(x=>x.id===id);if(!g)return;cleanupGame();title.textContent=g.name;desc.textContent=g.desc;category.textContent=g.category;area.innerHTML="";setControls("");modal.classList.remove("hidden");document.body.style.overflow="hidden";cleanupGame=GAMES_BY_ID[id](area)}
function closeGame(){cleanupGame();cleanupGame=()=>{};modal.classList.add("hidden");document.body.style.overflow="";area.innerHTML=""}
document.getElementById("closeModal").onclick=closeGame;modal.onclick=e=>{if(e.target===modal)closeGame()};document.addEventListener("keydown",e=>{if(e.key==="Escape")closeGame()});
search.oninput=renderGames;
document.getElementById("randomBtn").onclick=()=>openGame(GAMES[Math.floor(Math.random()*GAMES.length)].id);
document.getElementById("featuredCard").onclick=()=>openGame("neon");
document.querySelectorAll(".category-card").forEach(b=>b.onclick=()=>{selected=b.dataset.category;renderChips();renderGames();document.getElementById("games").scrollIntoView({behavior:"smooth"})});
document.getElementById("themeBtn").onclick=()=>{document.body.classList.toggle("light");document.getElementById("themeBtn").textContent=document.body.classList.contains("light")?"☾":"☼"};

function canvasGame(parent,w=800,h=450){
  const c=document.createElement("canvas");c.width=w;c.height=h;parent.appendChild(c);return [c,c.getContext("2d")]
}
function frameLoop(fn){let raf=0,last=0;const loop=t=>{if(!last)last=t;const dt=Math.min(32,t-last);last=t;fn(dt,t);raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);return()=>cancelAnimationFrame(raf)}
function keyState(){const keys=new Set();const down=e=>{keys.add(e.key.toLowerCase())};const up=e=>keys.delete(e.key.toLowerCase());window.addEventListener("keydown",down);window.addEventListener("keyup",up);return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up)}}

function neon(parent){
  const [c,x]=canvasGame(parent);let player={x:380,y:390,w:38,h:22},blocks=[],score=0,over=false,t=0,spawn=0,keys=keyState();
  function spawnBlock(){blocks.push({x:Math.random()*760+20,y:-30,w:26+Math.random()*38,h:20+Math.random()*28,s:2.4+Math.random()*2.7})}
  function draw(){x.clearRect(0,0,800,450);x.fillStyle="#070912";x.fillRect(0,0,800,450);x.strokeStyle="#152342";for(let i=0;i<10;i++){x.beginPath();x.moveTo(i*90,0);x.lineTo(i*90-100,450);x.stroke()}x.fillStyle="#7feaff";x.fillRect(player.x,player.y,player.w,player.h);x.fillStyle="#b28dff";blocks.forEach(b=>x.fillRect(b.x,b.y,b.w,b.h));x.fillStyle="#fff";x.font="700 18px system-ui";x.fillText(`Score: ${Math.floor(score)}`,18,30);if(over){x.fillStyle="rgba(0,0,0,.68)";x.fillRect(0,0,800,450);x.fillStyle="#fff";x.font="800 42px system-ui";x.fillText("GAME OVER",285,205);x.font="600 20px system-ui";x.fillText("Press R to restart",320,245)}}
  const stopLoop=frameLoop(dt=>{if(over){draw();return}t+=dt;spawn+=dt;if(spawn>520){spawn=0;spawnBlock()}const sp=6*dt/16;if(keys.has("arrowleft")||keys.has("a"))player.x-=sp;if(keys.has("arrowright")||keys.has("d"))player.x+=sp;player.x=Math.max(0,Math.min(760,player.x));blocks.forEach(b=>b.y+=b.s*dt/16);blocks=blocks.filter(b=>b.y<480);score+=dt/1000;for(const b of blocks)if(b.x<player.x+player.w&&b.x+b.w>player.x&&b.y<player.y+player.h&&b.y+b.h>player.y)over=true;draw()});
  const restart=e=>{if(over&&e.key.toLowerCase()==="r")location.reload()};window.addEventListener("keydown",restart);setControls("Move with A/D or ←/→. Press R after losing to restart.");
  return()=>{stopLoop();keys();window.removeEventListener("keydown",restart)}
}

function snake(parent){
  const [c,x]=canvasGame(parent,600,600);let size=20,body=[{x:10,y:15},{x:9,y:15},{x:8,y:15}],dir={x:1,y:0},next={x:1,y:0},food={x:18,y:12},score=0,dead=false,last=0,raf=0;
  function newFood(){do{food={x:Math.floor(Math.random()*30),y:Math.floor(Math.random()*30)}}while(body.some(p=>p.x===food.x&&p.y===food.y))}
  const down=e=>{const k=e.key.toLowerCase();if((k==="arrowup"||k==="w")&&dir.y===0)next={x:0,y:-1};if((k==="arrowdown"||k==="s")&&dir.y===0)next={x:0,y:1};if((k==="arrowleft"||k==="a")&&dir.x===0)next={x:-1,y:0};if((k==="arrowright"||k==="d")&&dir.x===0)next={x:1,y:0}};
  window.addEventListener("keydown",down);
  function draw(){x.fillStyle="#07100c";x.fillRect(0,0,600,600);x.strokeStyle="#102519";for(let i=0;i<=30;i++){x.beginPath();x.moveTo(i*20,0);x.lineTo(i*20,600);x.stroke();x.beginPath();x.moveTo(0,i*20);x.lineTo(600,i*20);x.stroke()}x.fillStyle="#ff6689";x.fillRect(food.x*20+3,food.y*20+3,14,14);x.fillStyle="#67e8a3";body.forEach(p=>x.fillRect(p.x*20+2,p.y*20+2,16,16));x.fillStyle="#fff";x.font="700 18px system-ui";x.fillText(`Score: ${score}`,16,26);if(dead){x.fillStyle="rgba(0,0,0,.65)";x.fillRect(0,0,600,600);x.fillStyle="#fff";x.font="800 38px system-ui";x.fillText("GAME OVER",205,285)}}
  const loop=t=>{if(t-last>120&&!dead){last=t;dir=next;const h={x:body[0].x+dir.x,y:body[0].y+dir.y};if(h.x<0||h.x>=30||h.y<0||h.y>=30||body.some(p=>p.x===h.x&&p.y===h.y))dead=true;else{body.unshift(h);if(h.x===food.x&&h.y===food.y){score++;newFood()}else body.pop()}}draw();raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);setControls("Move with WASD or arrow keys. Eat the pink food to grow.");return()=>{cancelAnimationFrame(raf);window.removeEventListener("keydown",down)}
}

function pong(parent){
  const [c,x]=canvasGame(parent,800,450);let py=180,by=210,bx=390,dx=4,dy=3,p1=0,p2=0,keys=keyState(),raf=0,last=0;
  function reset(dir){bx=390;by=210;dx=4*dir;dy=(Math.random()>.5?3:-3)}
  const stop=frameLoop(dt=>{const s=7*dt/16;if(keys.has("w"))py-=s;if(keys.has("s"))py+=s;py=Math.max(0,Math.min(360,py));by+=3*dt/16*dy/3;bx+=dx*dt/16;if(by<0||by>430)dy*=-1;const cy=by-40; if(bx<34&&by+20>py&&by<py+90){dx=Math.abs(dx);dy+=(by-(py+45))/18}if(bx>750&&by+20>cy&&by<cy+90)dx=-Math.abs(dx);if(bx<0){p2++;reset(1)}if(bx>800){p1++;reset(-1)}if((p1+p2)>=5){dx=0;dy=0}x.fillStyle="#07090e";x.fillRect(0,0,800,450);x.fillStyle="#fff";x.fillRect(18,py,12,90);x.fillRect(770,cy,12,90);x.fillRect(bx,by,14,14);x.font="800 34px system-ui";x.fillText(p1,360,42);x.fillText(p2,425,42);if(p1+p2>=5){x.font="800 30px system-ui";x.fillText(p1>p2?"YOU WIN":"CPU WINS",320,235)}},0);setControls("W/S move your paddle. First to 5 wins.");return()=>{stop();keys()}}
function clickRush(parent){
  const [c,x]=canvasGame(parent);let score=0,time=20,target={x:400,y:220,r:28},running=false,done=false,start=0,stop=()=>{};
  function move(){target.x=40+Math.random()*720;target.y=60+Math.random()*330}
  c.addEventListener("click",e=>{if(!running){running=true;start=performance.now();return}const r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*800/r.width,my=(e.clientY-r.top)*450/r.height;if(Math.hypot(mx-target.x,my-target.y)<target.r){score++;move()}});
  stop=frameLoop(()=>{if(running){time=Math.max(0,20-(performance.now()-start)/1000);if(time===0){running=false;done=true}}x.fillStyle="#07090e";x.fillRect(0,0,800,450);x.fillStyle="#fff";x.font="700 24px system-ui";x.fillText(`Score: ${score}`,20,34);x.fillText(`Time: ${time.toFixed(1)}`,665,34);if(running){x.fillStyle="#76e7ff";x.beginPath();x.arc(target.x,target.y,target.r,0,Math.PI*2);x.fill()}else{x.font="800 30px system-ui";x.fillText(done?"Time! Click to play again":"Click to start",275,230)}});
  setControls("Click the target as many times as possible in 20 seconds.");return()=>{stop()}
}
function memory(parent){
  const [c,x]=canvasGame(parent,640,480);const vals=["🍒","🍋","🍇","🍉","⭐","💎","🔥","🍀"];let deck=[...vals,...vals].sort(()=>Math.random()-.5),open=[],matched=new Set(),moves=0,lock=false;
  c.addEventListener("click",e=>{const r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*640/r.width,my=(e.clientY-r.top)*480/r.height,col=Math.floor(mx/160),row=Math.floor((my-50)/100),i=row*4+col;if(row<0||i<0||i>=16||lock||matched.has(i)||open.includes(i))return;open.push(i);if(open.length===2){moves++;lock=true;setTimeout(()=>{if(deck[open[0]]===deck[open[1]]){matched.add(open[0]);matched.add(open[1])}open=[];lock=false},500)}});
  const stop=frameLoop(()=>{x.fillStyle="#080a10";x.fillRect(0,0,640,480);x.fillStyle="#fff";x.font="700 20px system-ui";x.fillText(`Moves: ${moves}`,18,30);for(let i=0;i<16;i++){const col=i%4,row=Math.floor(i/4),xx=col*160+10,yy=row*100+55;x.fillStyle=(matched.has(i)||open.includes(i))?"#24334b":"#171c26";x.fillRect(xx,yy,140,80);if(matched.has(i)||open.includes(i)){x.font="32px system-ui";x.fillText(deck[i],xx+51,yy+52)}}});setControls("Click two cards to find matching pairs.");return()=>stop()}
function breakout(parent){
  const [c,x]=canvasGame(parent);let paddle=350,ball={x:400,y:390,dx:4,dy:-4,r:7},bricks=[];for(let r=0;r<5;r++)for(let col=0;col<10;col++)bricks.push({x:13+col*78,y:45+r*26,w:70,h:18,on:true});let keys=keyState(),lost=false;
  const stop=frameLoop(dt=>{const s=7*dt/16;if(keys.has("arrowleft")||keys.has("a"))paddle-=s;if(keys.has("arrowright")||keys.has("d"))paddle+=s;paddle=Math.max(0,Math.min(700,paddle));if(!lost){ball.x+=ball.dx*dt/16;ball.y+=ball.dy*dt/16;if(ball.x<ball.r||ball.x>800-ball.r)ball.dx*=-1;if(ball.y<ball.r)ball.dy*=-1;if(ball.y>430&&ball.x>paddle&&ball.x<paddle+100)ball.dy=-Math.abs(ball.dy);for(const b of bricks)if(b.on&&ball.x>b.x&&ball.x<b.x+b.w&&ball.y>b.y&&ball.y<b.y+b.h){b.on=false;ball.dy*=-1;break}if(ball.y>470)lost=true}x.fillStyle="#07090e";x.fillRect(0,0,800,450);x.fillStyle="#67e8ff";x.fillRect(paddle,425,100,12);x.fillStyle="#ffbf66";x.beginPath();x.arc(ball.x,ball.y,ball.r,0,Math.PI*2);x.fill();bricks.forEach((b,i)=>{if(b.on){x.fillStyle=`hsl(${i*8},75%,60%)`;x.fillRect(b.x,b.y,b.w,b.h)}});if(lost){x.fillStyle="#fff";x.font="800 34px system-ui";x.fillText("GAME OVER",300,230)}});setControls("Move with A/D or ←/→. Break every brick.");return()=>{stop();keys()}}
function dodge(parent){
  const [c,x]=canvasGame(parent);let px=390,score=0,objs=[],keys=keyState(),over=false,spawn=0;
  const stop=frameLoop(dt=>{const s=7*dt/16;if(keys.has("arrowleft")||keys.has("a"))px-=s;if(keys.has("arrowright")||keys.has("d"))px+=s;px=Math.max(0,Math.min(760,px));spawn+=dt;if(spawn>420){spawn=0;objs.push({x:Math.random()*760,y:-25,w:22+Math.random()*30,h:18+Math.random()*22,s:3+Math.random()*3})}objs.forEach(o=>o.y+=o.s*dt/16);objs=objs.filter(o=>o.y<470);if(!over)score+=dt/1000;objs.forEach(o=>{if(o.x<px+40&&o.x+o.w>px&&o.y<410&&o.y+o.h>380)over=true});x.fillStyle="#07090e";x.fillRect(0,0,800,450);x.fillStyle="#75e2ff";x.fillRect(px,385,40,22);x.fillStyle="#ff6d91";objs.forEach(o=>x.fillRect(o.x,o.y,o.w,o.h));x.fillStyle="#fff";x.font="700 19px system-ui";x.fillText(`Score: ${score.toFixed(1)}`,18,30);if(over){x.font="800 34px system-ui";x.fillText("GAME OVER",300,230)}});setControls("Move with A/D or ←/→ and avoid the falling hazards.");return()=>{stop();keys()}}
function reaction(parent){
  const [c,x]=canvasGame(parent);let state="wait",start=0,result=null,armed=false,timer=0;
  function arm(){state="wait";result=null;armed=false;timer=800+Math.random()*2200;start=performance.now()}
  c.addEventListener("click",()=>{if(state==="ready"){result=performance.now()-start;state="result"}else if(state==="result")arm()});arm();
  const stop=frameLoop(()=>{if(state==="wait"&&performance.now()-start>timer){state="ready";start=performance.now()}x.fillStyle=state==="ready"?"#36d77a":"#090d12";x.fillRect(0,0,800,450);x.fillStyle=state==="ready"?"#062b18":"#fff";x.font="800 34px system-ui";x.textAlign="center";x.fillText(state==="wait"?"WAIT...":state==="ready"?"CLICK!":`Reaction: ${result} ms`,400,230);x.font="600 18px system-ui";x.fillText(state==="result"?"Click to try again":"Click the screen",400,265);x.textAlign="left"});setControls("Wait for the screen to turn green, then click as fast as you can.");return()=>stop()}
const GAMES_BY_ID={neon:neon,snake:snake,pong:pong,click:clickRush,memory:memory,breakout:breakout,dodge:dodge,reaction:reaction};
renderChips();renderGames();
