const ACT=[
  {k:'Beach',l:'Beach',i:'🏖'},{k:'Hiking',l:'Hiking',i:'⛰'},{k:'City',l:'City',i:'🏙'},
  {k:'Camping',l:'Camping',i:'⛺'},{k:'Formal',l:'Formal',i:'👔'},{k:'Photo',l:'Photography',i:'📷'},
  {k:'Winter',l:'Winter Sports',i:'❄'},{k:'Gym',l:'Fitness',i:'💪'},{k:'Work',l:'Work / Remote',i:'💼'},
  {k:'Water',l:'Water Sports',i:'🚣'},{k:'Cycling',l:'Cycling',i:'🚲'},{k:'Tropical',l:'Tropical',i:'🌴'},
];
const ESS=['Passport / ID','Wallet & Cash','Phone & Charger','Toiletries Bag','Underwear & Socks','Toothbrush & Paste','Deodorant','First Aid Kit'];
const PRE={
  Beach:['Swimsuit','Sunscreen SPF 50+','Beach Towel','Flip Flops','Sunglasses','Dry Bag','Wide-brimmed Hat'],
  Hiking:['Hiking Boots','Water Bladder','Daypack','Bug Spray','Energy Bars','Trekking Poles'],
  City:['Comfortable Walking Shoes','Power Bank','Small Daypack','Rain Jacket','Anti-theft Bag'],
  Camping:['Sleeping Bag','Tent & Stakes','Headlamp','Lighter','Portable Stove','Camping Chair'],
  Formal:['Dress Shirt / Blouse','Suit / Evening Dress','Dress Shoes','Tie / Cufflinks','Lint Roller'],
  Photo:['Camera Body','Extra Lenses','SD Cards','Tripod','Lens Cleaning Kit','Spare Batteries'],
  Winter:['Thermal Layers','Ski Jacket & Pants','Goggles','Insulated Gloves','Beanie','Neck Warmer'],
  Gym:['Workout Clothes','Training Shoes','Protein Shaker','Sweat Towel','Earbuds'],
  Work:['Laptop & Charger','Portable Mouse','Noise-cancelling Headphones','Notebook','Universal Adapter'],
  Water:['Wetsuit / Rash Guard','Water Shoes','Goggles / Snorkel','Waterproof Watch','Life Vest'],
  Cycling:['Helmet','Cycling Shorts','Bike Pump','Multi-tool','Cycling Gloves','Reflective Gear'],
  Tropical:['Rain Poncho','Mosquito Net','Quick-dry Clothes','Water Purification Tablets','Binoculars'],
};
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

let sel=[],custom=[],editId=null,cy,cm,removed=[],checked=[],currentUser=null;

// ── UTILS ──
const pad=n=>String(n).padStart(2,'0');
const fmt=s=>{if(!s)return'';const[y,m,d]=s.split('-');return`${+d} ${MONTHS[+m-1].slice(0,3)} ${y}`};
const esc=s=>s.replace(/'/g,"\\'");

// ── USER STORAGE (keyed per email) ──
const getUsers=()=>JSON.parse(localStorage.getItem('voy-users')||'{}');
const setUsers=u=>localStorage.setItem('voy-users',JSON.stringify(u));
const getTripKey=()=>`voy-trips-${currentUser?.email||''}`;
const getTrips=()=>JSON.parse(localStorage.getItem(getTripKey())||'[]');
const setTrips=t=>localStorage.setItem(getTripKey(),JSON.stringify(t));

// ── TOAST ──
function toast(msg){
  const e=document.getElementById('toast');e.textContent=msg;e.classList.add('show');
  clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),2600);
}

// ── THEME ──
function toggleDark(){
  const L=document.body.classList.toggle('light');
  document.querySelectorAll('.dm-btn').forEach(b=>b.textContent=L?'🌙':'☀️');
  localStorage.setItem('voy-theme',L?'light':'dark');
  if(document.getElementById('v-cal').classList.contains('on')) buildCal();
}

// ── AUTH ──
let authMode='login';
function switchTab(mode){
  authMode=mode;
  document.getElementById('tab-login').classList.toggle('active',mode==='login');
  document.getElementById('tab-register').classList.toggle('active',mode==='register');
  document.getElementById('reg-name-wrap').style.display=mode==='register'?'block':'none';
  document.getElementById('auth-err').textContent='';
}

function authSubmit(){
  const email=document.getElementById('auth-email').value.trim().toLowerCase();
  const pw=document.getElementById('auth-pw').value;
  const rem=document.getElementById('rem-me').checked;
  const err=document.getElementById('auth-err');
  if(!email||!pw){err.textContent='Please fill in all fields';return}
  const users=getUsers();
  if(authMode==='register'){
    const name=document.getElementById('reg-name').value.trim();
    if(!name){err.textContent='Enter your name';return}
    if(users[email]){err.textContent='Email already registered';return}
    users[email]={name,pw};
    setUsers(users);
    loginUser({email,name},rem);
  } else {
    const u=users[email];
    if(!u||u.pw!==pw){err.textContent='Invalid email or password';return}
    loginUser({email,name:u.name},rem);
  }
}

function loginUser(user,remember){
  currentUser=user;
  const store=remember?localStorage:sessionStorage;
  store.setItem('voy-session',JSON.stringify(user));
  showHome();
}

function logout(){
  currentUser=null;
  localStorage.removeItem('voy-session');
  sessionStorage.removeItem('voy-session');
  document.getElementById('app-screen').classList.remove('on');
  document.getElementById('home-screen').classList.remove('on');
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('auth-email').value='';
  document.getElementById('auth-pw').value='';
  document.getElementById('auth-err').textContent='';
}

// ── HOME ──
function showHome(){
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('on');
  document.getElementById('home-screen').classList.add('on');
  const initials=currentUser.name.split(' ').map(x=>x[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('home-av').textContent=initials;
  document.getElementById('home-uname').textContent=currentUser.name;
  document.getElementById('home-greeting').textContent=`Welcome back, ${currentUser.name.split(' ')[0]}`;
  const today=new Date().toISOString().split('T')[0];
  const trips=getTrips();
  document.getElementById('stat-total').textContent=trips.length;
  document.getElementById('stat-upcoming').textContent=trips.filter(t=>t.s>today).length;
  document.getElementById('stat-active').textContent=trips.filter(t=>t.s<=today&&t.e>=today).length;
}

function openApp(v){
  document.getElementById('home-screen').classList.remove('on');
  document.getElementById('app-screen').classList.add('on');
  if(v==='plan')newTrip();else go(v);
}

function goHome(){
  document.getElementById('app-screen').classList.remove('on');
  showHome();
}

// ── APP ──
function go(v){
  document.querySelectorAll('.view').forEach(e=>e.classList.remove('on'));
  document.getElementById('v-'+v).classList.add('on');
  document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active'));
  document.getElementById('nb-'+v).classList.add('active');
  if(v==='cal')buildCal();
  if(v==='trips')buildTrips();
}

function buildChips(){
  document.getElementById('chips').innerHTML=ACT.map(a=>`<div class="chip" id="c-${a.k}" onclick="tog('${a.k}')">${a.i} ${a.l}</div>`).join('');
}

function tog(k){sel.includes(k)?sel=sel.filter(x=>x!==k):sel.push(k);syncChips();buildList()}
function syncChips(){ACT.forEach(a=>{const e=document.getElementById('c-'+a.k);if(e)e.classList.toggle('on',sel.includes(a.k))})}

function addCustom(){
  const i=document.getElementById('ci'),v=i.value.trim();
  if(!v)return;if(!custom.includes(v)){custom.push(v);buildList()}i.value='';i.focus();
}

function removeItem(name){
  const li=[...document.querySelectorAll('#list .li')].find(l=>l.querySelector('span')?.textContent===name);
  if(li){li.classList.add('removing');setTimeout(()=>{removed.push(name);buildList()},320)}
  else{removed.push(name);buildList()}
}

function getCurrentItems(){
  return[...new Set([...ESS,...sel.flatMap(k=>PRE[k]||[]),...custom])].filter(x=>!removed.includes(x));
}

function updateProgress(){
  const items=getCurrentItems(),total=items.length;
  const done=checked.filter(x=>items.includes(x)).length;
  document.getElementById('prog-count').textContent=`${done} / ${total} items`;
  document.getElementById('prog-fill').style.width=(total?Math.round(done/total*100):0)+'%';
}

function buildList(){
  const items=getCurrentItems();const el=document.getElementById('list');
  if(!items.length){el.innerHTML='<div class="empty">Select activities or add custom items above</div>';updateProgress();return}
  el.innerHTML=items.map(x=>`<label class="li"><input type="checkbox" ${checked.includes(x)?'checked':''} onchange="toggleCheck('${esc(x)}',this.checked)"><span>${x}</span><button class="li-remove" onclick="removeItem('${esc(x)}');event.preventDefault()">✕</button></label>`).join('');
  updateProgress();
}

function toggleCheck(name,val){
  val?(!checked.includes(name)&&checked.push(name)):checked=checked.filter(x=>x!==name);
  document.querySelectorAll('#list .li input[type=checkbox]').forEach(cb=>{
    if(cb.nextElementSibling?.textContent===name){
      cb.classList.remove('bouncing');void cb.offsetWidth;cb.classList.add('bouncing');
      cb.addEventListener('animationend',()=>cb.classList.remove('bouncing'),{once:true});
    }
  });
  updateProgress();
}

function newTrip(){
  editId=null;sel=[];custom=[];removed=[];checked=[];
  ['t-name','t-start','t-end'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('ph-title').textContent='New Adventure';
  document.getElementById('ph-sub').textContent='Fill in the details below';
  syncChips();buildList();go('plan');
}

function save() {
  const n = document.getElementById('t-name').value.trim();
  const s = document.getElementById('t-start').value;
  const e = document.getElementById('t-end').value;
  if (!n || !s || !e) return toast('⚠ Please fill in all fields');

  const [sT, eT, todayT] = [s, e, new Date().toISOString().split('T')[0]]
    .map(d => new Date(d).getTime());

  if (eT < sT) return toast('⚠ Return must be after departure');
  if (sT < todayT) return toast('⚠ Departure date is in the past');

  const trips = getTrips();
  const overlap = trips.find(t =>
    t.id !== editId && sT <= new Date(t.e).getTime() && eT >= new Date(t.s).getTime()
  );
  if (overlap) return toast(`⚠ Dates overlap with "${overlap.n}"`);

  const trip = { id: editId || Date.now(), n, s, e, a: [...sel], c: [...custom], rm: [...removed] };
  setTrips(editId ? trips.map(t => t.id === editId ? trip : t) : [...trips, trip]);
  toast(editId ? '✓ Journey updated' : '✓ Journey saved');
  editId = null;
  go('trips');
}

function countdown(s,e){
  const today=new Date();today.setHours(0,0,0,0);
  const dep=new Date(s),ret=new Date(e);
  const diff=ms=>Math.round(ms/86400000);
  if(today<dep){const d=diff(dep-today);return`<div class="countdown">✈ ${d} day${d!==1?'s':''} to departure</div>`}
  if(today<=ret){const d=diff(ret-today);return`<div class="countdown active">🌍 Trip in progress · ${d} day${d!==1?'s':''} left</div>`}
  return'<div class="countdown past">✓ Completed</div>';
}

function buildTrips(){
  const trips=getTrips();
  document.getElementById('tc-badge').textContent=trips.length;
  document.getElementById('trips-out').innerHTML=trips.length
    ?trips.map(t=>`<div class="tc"><div><div class="tn">${t.n}</div><div class="td">${fmt(t.s)} → ${fmt(t.e)}</div>${countdown(t.s,t.e)}<div class="tt">${(t.a||[]).map(k=>{const f=ACT.find(x=>x.k===k);return`<span class="ttag">${f?f.i+' '+f.l:k}</span>`}).join('')}</div></div><div class="acts"><button class="be" onclick="editTrip(${t.id})">Edit</button><button class="bd" onclick="delTrip(${t.id})">Delete</button></div></div>`).join('')
    :'<div class="es"><p>No journeys yet</p><small>Plan your first adventure and it will appear here</small></div>';
}

function editTrip(id){
  const t=getTrips().find(x=>x.id===id);if(!t)return;
  editId=id;
  document.getElementById('t-name').value=t.n;
  document.getElementById('t-start').value=t.s;
  document.getElementById('t-end').value=t.e;
  sel=[...(t.a||[])];custom=[...(t.c||[])];removed=[...(t.rm||[])];checked=[];
  document.getElementById('ph-title').textContent='Edit Journey';
  document.getElementById('ph-sub').textContent='Update your trip details';
  syncChips();buildList();go('plan');
}

function delTrip(id){
  const target=[...document.querySelectorAll('#trips-out .tc')].find(c=>c.querySelector('.bd')?.getAttribute('onclick')===`delTrip(${id})`);
  if(!target){setTrips(getTrips().filter(t=>t.id!==id));buildTrips();return}
  if(target._delPending)return;
  target._delPending=true;
  target.classList.add('shaking');
  target.addEventListener('animationend',()=>{
    target.classList.remove('shaking');
    if(!confirm('Delete this trip?')){target._delPending=false;return}
    target.classList.add('gone');
    setTimeout(()=>{setTrips(getTrips().filter(t=>t.id!==id));buildTrips();toast('Trip removed')},420);
  },{once:true});
}

function calNav(d){cm+=d;if(cm<0){cm=11;cy--}if(cm>11){cm=0;cy++}buildCal()}

function buildCal(){
  const trips=getTrips();
  document.getElementById('cal-lbl').textContent=`${MONTHS[cm]} ${cy}`;
  const g=document.getElementById('cal-grid');
  g.innerHTML=DOW.map(d=>`<div class="dow">${d}</div>`).join('');
  const today=new Date();
  const ts=`${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
  const first=new Date(cy,cm,1).getDay();
  const dim=new Date(cy,cm+1,0).getDate();
  const prev=new Date(cy,cm,0).getDate();
  const mk=(txt,cls)=>{const d=document.createElement('div');d.className=cls;d.textContent=txt;g.appendChild(d)};
  for(let i=first-1;i>=0;i--)mk(prev-i,'day other');
  for(let n=1;n<=dim;n++){
    const ds=`${cy}-${pad(cm+1)}-${pad(n)}`;
    let cls='day';
    if(ds===ts)cls+=' today';
    const trip=trips.find(t=>ds===t.s||ds===t.e||(ds>t.s&&ds<t.e));
    if(trip)cls+=ds===trip.s?' ds':ds===trip.e?' de':' dm';
    mk(n,cls);
  }
  const rem=(first+dim)%7;
  for(let i=1;i<=(rem?7-rem:0);i++)mk(i,'day other');
}

function exportPDF(){
  const name=document.getElementById('t-name').value.trim()||'My Trip';
  const start=document.getElementById('t-start').value,end=document.getElementById('t-end').value;
  const items=getCurrentItems(),total=items.length;
  const done=checked.filter(x=>items.includes(x)).length;
  const pct=total?Math.round(done/total*100):0;
  const win=window.open('','_blank');
  if(!win)return toast('⚠ Allow popups to export PDF');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${name} — Packing List</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Helvetica,sans-serif;background:#fff;color:#111;padding:40px;max-width:680px;margin:0 auto;-webkit-print-color-adjust:exact;print-color-adjust:exact}h1{font-family:Georgia,serif;font-size:32px;font-weight:400;color:#c9a84c;margin-bottom:4px}.sub{font-size:13px;color:#6b7280;margin-bottom:28px}.pr{display:flex;justify-content:space-between;margin-bottom:6px}.pl{font-size:10px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#6b7280}.pc{font-size:13px;color:#c9a84c;font-weight:500}.pb{height:6px;background:#f0f0f0;border-radius:10px;margin-bottom:24px;overflow:hidden}.pf{height:100%;background:linear-gradient(90deg,#c9a84c,#e4c97e)}.item{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid #f3f4f6}.item:last-child{border:none}.box{width:16px;height:16px;border:2px solid #c9a84c;border-radius:3px;flex-shrink:0;display:flex;align-items:center;justify-content:center}.box.chk{background:#c9a84c}.ck{color:#fff;font-size:11px;font-weight:700}.nm{font-size:13px}.done{color:#9ca3af;text-decoration:line-through}.foot{margin-top:24px;font-size:11px;color:#9ca3af;text-align:right}</style></head><body>
<h1>${name}</h1><div class="sub">${fmt(start)||'—'} → ${fmt(end)||'—'}</div>
<div class="pr"><span class="pl">Packed</span><span class="pc">${done} / ${total} items (${pct}%)</span></div>
<div class="pb"><div class="pf" style="width:${pct}%"></div></div>
${items.map(x=>{const c=checked.includes(x);return`<div class="item"><div class="box ${c?'chk':''}">${c?'<span class="ck">✓</span>':''}</div><span class="nm ${c?'done':''}">${x}</span></div>`}).join('')}
<div class="foot">Exported from Voyager · ${new Date().toLocaleDateString()}</div>
<script>window.onload=function(){window.print()}<\/script></body></html>`);
  win.document.close();
}

// ── INIT ──
window.addEventListener('DOMContentLoaded',()=>{
  const L=localStorage.getItem('voy-theme')==='light';
  if(L)document.body.classList.add('light');
  document.querySelectorAll('.dm-btn').forEach(b=>b.textContent=L?'🌙':'☀️');
  const now=new Date();cy=now.getFullYear();cm=now.getMonth();
  buildChips();buildList();
  const sess=JSON.parse(localStorage.getItem('voy-session')||sessionStorage.getItem('voy-session')||'null');
  if(sess){
    currentUser=sess;
    const today=new Date().toISOString().split('T')[0];
    setTrips(getTrips().filter(t=>t.e>=today));
    showHome();
  }
  document.getElementById('ci').addEventListener('keydown',e=>{if(e.key==='Enter')addCustom()});
  document.getElementById('auth-pw').addEventListener('keydown',e=>{if(e.key==='Enter')authSubmit()});
});