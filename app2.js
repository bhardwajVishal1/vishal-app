/* SPA data + logic (no backend required) 
   Data stored in localStorage for demo. Replace with API calls to a backend later.
*/

const pages = document.querySelectorAll('.page');
const navBtns = document.querySelectorAll('.nav-btn');
const ctaBtns = document.querySelectorAll('.cta');
const pointsChip = document.getElementById('points-chip');
const modal = document.getElementById('modal');
const inName = document.getElementById('in-name');
const inEmail = document.getElementById('in-email');
const inPass = document.getElementById('in-pass');
const modalMsg = document.getElementById('modal-msg');
const accName = document.getElementById('acc-name');
const accEmail = document.getElementById('acc-email');
const accPoints = document.getElementById('acc-points');
const leaderList = document.getElementById('leader-list');
const gameArea = document.getElementById('game-area');

let state = {
  user: null,
  users: JSON.parse(localStorage.getItem('eco_users') || '{}'),
  leaderboard: JSON.parse(localStorage.getItem('eco_leaderboard') || '[]')
};

// helper: show page
navBtns.forEach(b => b.addEventListener('click', ()=> showPage(b.dataset.target)));
ctaBtns.forEach(b => b.addEventListener('click', ()=> showPage(b.dataset.target)));

// initial page
function showPage(id){
  pages.forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  renderAccount();
  renderLeaderboard();
}

// LOGIN / REGISTER modal
function openLogin(){
  modal.classList.remove('hidden');
  modalMsg.innerText = '';
  inName.value=''; inEmail.value=''; inPass.value='';
}
function closeModal(){ modal.classList.add('hidden'); }
window.openLogin = openLogin; window.closeModal = closeModal; // expose to inline buttons

function doRegister(){
  const name = inName.value.trim(); const email = inEmail.value.trim().toLowerCase(); const pass = inPass.value;
  if(!name || !email || !pass){ modalMsg.innerText = 'Fill all fields'; return; }
  if(state.users[email]){ modalMsg.innerText = 'Email already registered'; return; }
  state.users[email] = { name, email, pass, points: 0, joined: Date.now() };
  localStorage.setItem('eco_users', JSON.stringify(state.users));
  modalMsg.innerText = 'Registered — you can now log in';
}
function doLogin(){
  const email = inEmail.value.trim().toLowerCase(); const pass = inPass.value;
  const u = state.users[email];
  if(!u || u.pass !== pass){ modalMsg.innerText = 'Invalid credentials'; return; }
  state.user = email;
  modalMsg.innerText = 'Logged in';
  closeModal();
  renderAccount();
  refreshUI();
}

// render account UI
function renderAccount(){
  if(state.user){
    const u = state.users[state.user];
    accName.innerText = u.name;
    accEmail.innerText = u.email;
    accPoints.innerText = u.points + ' pts';
    pointsChip.innerText = u.points + ' pts';
    document.getElementById('btn-login').innerText = 'Logout';
    document.getElementById('btn-login').onclick = doLogout;
  } else {
    accName.innerText = 'Guest';
    accEmail.innerText = 'Not signed in';
    accPoints.innerText = '0 pts';
    pointsChip.innerText = '0 pts';
    document.getElementById('btn-login').innerText = 'Log in';
    document.getElementById('btn-login').onclick = openLogin;
  }
}

// logout
function doLogout(){
  state.user = null;
  renderAccount();
  refreshUI();
}

// claim action (demo)
function claimAction(title, pts){
  if(!state.user) { alert('Please login to claim actions'); return; }
  const u = state.users[state.user];
  u.points += pts;
  saveAndUpdate(u);
  toast(`Claimed ${title} +${pts} pts`);
}

// redeem reward
function redeemReward(title, cost){
  if(!state.user) return alert('Please login to redeem');
  const u = state.users[state.user];
  if(u.points < cost) return alert('Not enough points');
  u.points -= cost;
  saveAndUpdate(u);
  toast(`Redeemed ${title}!`);
}

// save and update leaderboard
function saveAndUpdate(userObj){
  state.users[userObj.email] = userObj;
  localStorage.setItem('eco_users', JSON.stringify(state.users));
  updateLeaderboard(userObj);
  renderAccount();
  refreshUI();
}

function updateLeaderboard(userObj){
  // find or add
  const list = state.leaderboard.filter(i => i.email !== userObj.email);
  list.push({name:userObj.name, email:userObj.email, points:userObj.points});
  list.sort((a,b)=>b.points-a.points);
  state.leaderboard = list.slice(0,50);
  localStorage.setItem('eco_leaderboard', JSON.stringify(state.leaderboard));
}

// render leaderboard
function renderLeaderboard(){
  leaderList.innerHTML = '';
  const lb = state.leaderboard.length ? state.leaderboard : Object.values(state.users).sort((a,b)=>b.points-a.points).slice(0,10);
  lb.forEach((u, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${idx+1}. ${u.name}</strong> <span class="muted">${u.points || 0} pts</span>`;
    leaderList.appendChild(li);
  });
}

// games
function startQuiz(){
  gameArea.innerHTML = '';
  const q = [
    {q:'Which gas do trees absorb to help reduce climate change?', a:'b', opts:{a:'Oxygen', b:'Carbon Dioxide', c:'Nitrogen'}},
    {q:'Which is best for environment?', a:'a', opts:{a:'Reusable bag', b:'Single-use plastic', c:'Incandescent bulb'}},
  ];
  let score = 0, i=0;
  const showQ = ()=>{
    if(i>=q.length){ finishQuiz(score); return; }
    const card = document.createElement('div'); card.className='action-card';
    card.innerHTML = `<h4>Q${i+1}</h4><p>${q[i].q}</p>`;
    for(const k of Object.keys(q[i].opts)){
      const btn = document.createElement('button');
      btn.innerText = q[i].opts[k];
      btn.onclick = ()=>{ if(k===q[i].a) score++; i++; showQ(); };
      card.appendChild(btn);
    }
    gameArea.innerHTML=''; gameArea.appendChild(card);
  };
  showQ();
}
function finishQuiz(score){
  if(score>0 && state.user){
    state.users[state.user].points += 15*score;
    saveAndUpdate(state.users[state.user]);
  }
  gameArea.innerHTML = `<p>Quiz finished — Score: ${score}</p>`;
}
function startClickGame(){
  gameArea.innerHTML = `<p>Click the green button fast for 5 seconds</p><button id="clicker">Click me</button><div id="clickcount">0</div>`;
  let count=0; const btn = document.getElementById('clicker'); const display = document.getElementById('clickcount');
  const end = Date.now()+5000;
  btn.onclick = ()=>{ if(Date.now()<end){ count++; display.innerText = count; } };
  setTimeout(()=>{
    gameArea.innerHTML = `<p>Time up! You clicked ${count} times.</p>`;
    if(count>=20 && state.user){
      state.users[state.user].points += 10; saveAndUpdate(state.users[state.user]);
      toast('+10 pts for fast clicks!');
    }
  },5100);
}
function startMemoryGame(){
  // simple 4-pair memory
  const symbols = ['🍃','🌳','♻️','🌱'];
  const deck = symbols.concat(symbols).sort(()=>Math.random()-0.5);
  gameArea.innerHTML = '<div class="memory-grid"></div>';
  const grid = gameArea.querySelector('.memory-grid');
  let first=null, lock=false, matches=0;
  deck.forEach((s, idx)=>{
    const tile = document.createElement('div'); tile.className='memory-tile'; tile.dataset.sym=s;
    tile.innerHTML = '<div class="face back">?</div><div class="face front">'+s+'</div>';
    tile.onclick = ()=>{
      if(lock || tile.classList.contains('open')) return;
      tile.classList.add('open');
      if(!first) first=tile;
      else {
        if(first.dataset.sym === tile.dataset.sym){
          first.classList.add('matched'); tile.classList.add('matched'); matches++; first=null;
          if(matches===symbols.length){
            if(state.user){ state.users[state.user].points += 20; saveAndUpdate(state.users[state.user]); toast('+20 pts!'); }
            gameArea.innerHTML = '<p>All matched! Great job.</p>';
          }
        } else {
          lock=true;
          setTimeout(()=>{ first.classList.remove('open'); tile.classList.remove('open'); first=null; lock=false; },800);
        }
      }
    };
    grid.appendChild(tile);
  });
}

// utilities
function toast(msg){
  const t = document.createElement('div');
  t.className='toast'; t.innerText = msg; document.body.appendChild(t);
  setTimeout(()=>t.classList.add('show'),50);
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),350); },2600);
}

// profile save/export/reset
function saveProfile(){
  if(!state.user) return alert('Login first');
  localStorage.setItem('eco_users', JSON.stringify(state.users));
  alert('Profile saved locally');
}
function exportData(){
  const blob = new Blob([JSON.stringify({users:state.users, leaderboard:state.leaderboard},null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='eco-data.json'; a.click(); URL.revokeObjectURL(url);
}
function clearData(){
  if(!confirm('Reset all demo data?')) return;
  localStorage.removeItem('eco_users'); localStorage.removeItem('eco_leaderboard');
  state.users={}; state.leaderboard=[]; state.user=null;
  renderAccount(); renderLeaderboard(); toast('Demo data cleared');
}

// initial render
renderAccount(); renderLeaderboard(); showPage('home');

// expose some functions globally for inline buttons
window.claimAction = claimAction; window.redeemReward = redeemReward;
window.startQuiz = startQuiz; window.startClickGame = startClickGame; window.startMemoryGame = startMemoryGame;
window.doRegister = doRegister; window.doLogin = doLogin; window.openLogin = openLogin;
window.saveProfile = saveProfile; window.exportData = exportData; window.clearData = clearData;
