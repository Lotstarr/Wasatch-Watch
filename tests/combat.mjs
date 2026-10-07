import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const elements=new Map();const element=()=>({textContent:'',innerHTML:'',disabled:false,style:{},children:[],append(x){this.children.push(x)},replaceChildren(){this.children=[]},close(){},showModal(){},addEventListener(){},getContext(){return {}},getBoundingClientRect(){return{left:0,top:0,width:1080,height:680}}});
const document={getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},querySelector(){return element()},createElement(){return element()},addEventListener(){}};
const save=new Map();const context=vm.createContext({document,window:{addEventListener(){}},HTMLElement:class{},performance:{now:()=>0},requestAnimationFrame(){},localStorage:{getItem:k=>save.get(k),setItem:(k,v)=>save.set(k,v)},assert,console});
vm.runInContext(readFileSync(new URL('../public/game.js',import.meta.url),'utf8').replace(/^import .*;\n/,''),context);
vm.runInContext(`
reset(); selected=0; build('ranger');assert.equal(gold,190);assert.equal(towers.length,1);build('ranger');assert.equal(towers.length,1);
let t=towers[0];upgrade(t);assert.equal(t.tier,2);assert.equal(gold,100);upgrade(t);assert.equal(t.tier,2);assert.equal(gold,100);
let e={hp:1,kind:'moss',reward:8,dead:false,d:0};hit(e,20,t);assert.equal(gold,108);hit(e,20,t);assert.equal(gold,108);
reset();spawn('moss');enemies[0].d=total+1;update(1/60);assert.equal(lives,19);assert.equal(gold,270);
reset();nextWave();paused=true;update(1);assert.equal(clock,0);assert.equal(enemies.length,0);paused=false;update(1);assert.ok(enemies.length>0);
reset();selected=0;build('cave');let cave=towers[0];cave.guard=at(cave.rally);spawn('moss');let enemy=enemies[0];enemy.d=cave.rally;let old=enemy.d;update(.1);assert.equal(enemy.d,old);assert.ok(enemy.hp<enemy.max);
reset();selected=0;build('cave');cave=towers[0];spawn('flyer');enemy=enemies[0];enemy.d=cave.rally;old=enemy.d;update(.1);assert.ok(enemy.d>old);
reset();lives=1;spawn('moss');enemies[0].d=total+1;update(.1);assert.equal(finished,true);assert.equal(lives,0);
reset();wave=8;active=true;update(.1);assert.equal(finished,true);assert.equal(JSON.parse(localStorage.getItem('wasatch-campaign')).foothills,3);
console.log('PASS: build costs, duplicate-site protection, upgrade affordability, unique rewards, leaks, pause, blocking, flyers, defeat and saved victory.');
`,context);
vm.runInContext(`
reset(); selected=0;build('ranger');selected=1;build('snow');
for(let w=1;w<=8&&!finished;w++){
 nextWave();
 for(let tick=0;tick<30000&&active&&!finished;tick++){
  if(tick%120===0){
   const order=[[2,'cave'],[3,'ranger'],[5,'bees'],[4,'ranger'],[6,'snow'],[7,'ranger'],[8,'ranger']].filter(([site])=>site<sites.length);
   const slot=order.find(([site])=>!towers.some(t=>t.site===site));
   if(slot&&gold>=types[slot[1]].cost){selected=slot[0];build(slot[1]);}
   else if(!slot){const t=towers.filter(t=>t.tier<4).sort((a,b)=>a.tier-b.tier)[0];if(t&&gold>=upgradeCost(t))upgrade(t,'A');}
  }
  update(1/60);
 }
}
assert.equal(wave,8);assert.ok(lives>0);assert.equal(finished,true);
console.log('PASS: affordable mixed-tower strategy completes all eight waves and the boss with '+lives+' lives.');
`,context);
vm.runInContext(`
reset();selected=0;build('ranger');spawn('moss');enemies[0].d=170;const before=enemies[0].hp;update(1/60);assert.equal(enemies[0].hp,before);assert.equal(projectiles.length,1);for(let i=0;i<30;i++)update(1/60);assert.ok(enemies[0].hp<before);
reset();selected=0;build('snow');spawn('moss');enemies[0].d=170;for(let i=0;i<60;i++)update(1/60);assert.ok(enemies[0].slow>0);assert.ok(enemies[0].freezeCooldown>0);
reset();selected=0;build('cave');gold=1000;upgrade(towers[0]);upgrade(towers[0]);upgrade(towers[0],'A');assert.equal(towers[0].rate,.8);assert.equal(towers[0].tier,4);
console.log('PASS: projectiles delay damage until impact, snow control applies on impact, and Defensive Line keeps its stated attack rate.');
`,context);
vm.runInContext(`
localStorage.setItem('wasatch-campaign','{}');assert.equal(loadLevel(1),false);assert.equal(level.id,'foothills');lives=20;finish(true);assert.equal(unlocked(1),true);assert.equal(loadLevel(1),true);assert.equal(level.id,'canyon');assert.equal(gold,250);assert.equal(towers.length,0);assert.equal(at(total).x,1120);
const shield={hp:100,kind:'rock',reward:14,dead:false,d:0};hit(shield,20,{kind:'ranger'});assert.equal(shield.hp,89);hit(shield,20,{kind:'ranger',branch:'B'});assert.equal(shield.hp,69);
reset();selected=3;build('snow');selected=4;build('ranger');
for(let w=1;w<=8&&!finished;w++){nextWave();for(let tick=0;tick<40000&&active&&!finished;tick++){if(tick%120===0){const order=[[2,'cave'],[0,'ranger'],[5,'bees'],[6,'ranger'],[1,'ranger']];const slot=order.find(([site])=>!towers.some(t=>t.site===site));if(slot&&gold>=types[slot[1]].cost){selected=slot[0];build(slot[1]);}else if(!slot){const t=towers.filter(t=>t.tier<4).sort((a,b)=>a.tier-b.tier)[0];if(t&&gold>=upgradeCost(t))upgrade(t,t.kind==='snow'?'A':t.kind==='ranger'?'B':'A');}
const focus=enemies.filter(e=>!e.dead).sort((a,b)=>Number(b.kind==='healer')-Number(a.kind==='healer')||remaining(a)-remaining(b))[0];if(focus){if(abilityCooldown.storm===0&&enemies.length>=4){orders='storm';executeOrder(point(focus));}if(abilityCooldown.reinforce===0&&focus.kind!=='flyer'){orders='reinforce';executeOrder(point(focus));}}}update(1/60);}}
assert.equal(wave,8);assert.ok(lives>0);assert.equal(finished,true);const canyonVictoryLives=lives;assert.ok(progress().canyon>0);assert.equal(loadLevel(2),false);assert.equal(progress().foothills,3);const best=progress().canyon;lives=1;finish(true);assert.equal(progress().canyon,best);localStorage.setItem('wasatch-campaign','null');assert.equal(unlocked(1),false);
console.log('PASS: campaign locks, per-level saves, best-star preservation, armor bypass, and full Provo Canyon victory with '+canyonVictoryLives+' lives.');
`,context);
vm.runInContext(`
level=levels[0];configureMap();reset();const armorTarget={hp:100,kind:'rock',reward:14,dead:false,d:0,freezeCooldown:0};hit(armorTarget,20,{kind:'snow'});assert.equal(armorTarget.hp,73);assert.ok(armorTarget.slow>0);
selected=0;build('bees');spawn('moss');spawn('flyer');spawn('rock');for(const e of enemies)e.d=170;update(1/60);assert.equal(swarms.length,3);assert.equal(new Set(swarms.map(s=>s.target)).size,3);assert.equal(towers[0].damage,2);for(let i=0;i<100;i++)update(1/60);assert.ok(enemies.every(e=>e.hp<e.max));
console.log('PASS: Snowmaker bypasses shields with 35% bonus damage; Beehive launches lowered-damage swarms at every in-range enemy.');
`,context);
vm.runInContext(`
reset();level=levels[1];configureMap();reset();wave=3;spawn('splitter',300);const parent=enemies[0],startingGold=gold;hit(parent,1000,{kind:'ranger'});assert.equal(enemies.filter(e=>e.kind==='shard').length,2);assert.equal(gold,startingGold+6);assert.ok(enemies.filter(e=>e.kind==='shard').every(e=>e.d<=300&&e.d>=284));hit(parent,1000,{kind:'ranger'});assert.equal(enemies.filter(e=>e.kind==='shard').length,2);
reset();selected=0;build('ranger');spawn('moss',180);spawn('flyer',150);towers[0].targeting='flyers';update(1/60);assert.equal(projectiles[0].target.kind,'flyer');
reset();selected=0;build('ranger');spawn('moss',180);spawn('rock',150);towers[0].targeting='strongest';update(1/60);assert.equal(projectiles[0].target.kind,'rock');
reset();selected=0;build('ranger');spawn('moss',180);spawn('rock',150);update(1/60);assert.equal(projectiles[0].target.kind,'moss');
reset();const expected=Object.values(wavePlans.canyon[0][1]).reduce((a,b)=>a+b,0);nextWave();assert.equal(pending.length,expected);assert.ok(wavePreview().includes('Shield guards'));assert.ok(wavePreview().includes('SOUTH'));
console.log('PASS: splitter children and rewards occur once, all three targeting priorities, and previews match authored wave plans.');
`,context);
vm.runInContext(`
level=levels[0];configureMap();reset();selected=0;build('cave');const movingCave=towers[0],home={...movingCave.guard};update(.1);assert.ok(Math.hypot(movingCave.guard.x-home.x,movingCave.guard.y-home.y)>0);assert.equal(movingCave.deployed,false);for(let i=0;i<150;i++)update(1/60);assert.ok(movingCave.deployed);assert.ok(Math.hypot(movingCave.guard.x-at(movingCave.rally).x,movingCave.guard.y-at(movingCave.rally).y)<8);movingCave.respawn=6;const rallyLocation={...movingCave.guard};update(.1);assert.equal(movingCave.deployed,false);assert.ok(Math.hypot(movingCave.guard.x-home.x,movingCave.guard.y-home.y)<Math.hypot(rallyLocation.x-home.x,rallyLocation.y-home.y));
reset();wave=1;active=true;const preBonus=gold;update(1/60);assert.equal(gold,preBonus+13);update(1/60);assert.equal(gold,preBonus+13);
console.log('PASS: defenders travel before blocking, retreat while regrouping, and wave-clear bonus is awarded once.');
`,context);
vm.runInContext(readFileSync(new URL('../public/art.js',import.meta.url),'utf8'),context);
vm.runInContext(`
const drawingMethods=['clearRect','fillRect','beginPath','ellipse','fill','stroke','lineTo','moveTo','closePath','fillText','arc','save','restore','translate','scale','rotate','strokeRect','setLineDash','drawImage','bezierCurveTo','quadraticCurveTo'];for(const method of drawingMethods)ctx[method]=()=>{};ctx.createLinearGradient=()=>({addColorStop(){}});const originalCreateElement=document.createElement;document.createElement=(tag)=>{const el=originalCreateElement(tag);if(tag==='canvas')el.getContext=()=>ctx;return el;};
for(const map of levels.slice(0,2)){level=map;configureMap();reset();gold=10000;for(let i=0;i<4;i++){selected=i;build(['ranger','snow','bees','cave'][i]);for(let tier=0;tier<i;tier++)upgrade(towers[i],'A');}for(const kind of ['moss','runner','rock','flyer','boss','splitter','shard','healer','wisp'])spawn(kind,260);enemies[0].freeze=1;enemies[1].slow=1;enemies[2].blocked=true;draw();paused=true;draw();}
console.log('PASS: both illustrated maps, tower tiers, every enemy type, status overlays and pause render without errors.');
`,context);
vm.runInContext(`
level=levels[0];configureMap();reset();selected=0;build('ranger');gold=1000;let preview=upgradeStats(towers[0]);upgrade(towers[0]);assert.equal(towers[0].damage,preview.damage);assert.equal(towers[0].range,preview.range);assert.equal(towers[0].rate,preview.rate);upgrade(towers[0]);preview=upgradeStats(towers[0],'B');upgrade(towers[0],'B');assert.equal(towers[0].damage,preview.damage);assert.equal(towers[0].range,preview.range);assert.equal(towers[0].rate,preview.rate);
reset();selected=0;build('ranger');const reportingTower=towers[0];const victim={hp:3,max:3,kind:'moss',reward:8,dead:false,d:100};hit(victim,100,reportingTower);assert.equal(report.ranger.damage,3);assert.equal(report.ranger.kills,1);hit(victim,100,reportingTower);assert.equal(report.ranger.damage,3);towers=[];assert.equal(report.ranger.kills,1);
reset();selected=0;build('ranger');gold=1000;upgrade(towers[0]);upgrade(towers[0]);upgrade(towers[0],'A');spawn('moss',170);spawn('moss',150);update(1/60);assert.equal(projectiles.length,2);assert.equal(projectiles[1].damage,projectiles[0].damage*.5);
reset();selected=0;build('snow');gold=1000;upgrade(towers[0]);upgrade(towers[0]);upgrade(towers[0],'B');spawn('boss',170);hit(enemies[0],1,towers[0]);assert.equal(enemies[0].freeze,1.4);
reset();selected=0;build('bees');gold=1000;upgrade(towers[0]);upgrade(towers[0]);upgrade(towers[0],'A');spawn('boss',170);update(1/60);assert.ok(swarms[0].life>3);
reset();selected=0;build('cave');gold=1000;upgrade(towers[0]);upgrade(towers[0]);upgrade(towers[0],'B');towers[0].guard=at(towers[0].rally);spawn('boss',towers[0].rally);const initialHealth=enemies[0].hp;update(1/60);assert.equal(towers[0].chargeCd,8);assert.ok(initialHealth-enemies[0].hp>=towers[0].damage*2);
reset();nextWave();update(1/60);assert.ok($('current-wave').textContent.includes('1 on trail'));assert.ok($('current-wave').textContent.includes('10 incoming'));assert.ok($('wave-intel').textContent.includes('UP NEXT'));
inspected=enemies[0];refresh();assert.equal($('selection').textContent,'Trail scout');assert.ok($('detail').textContent.includes('No armor'));
console.log('PASS: exact upgrade previews, capped damage and sold-tower attribution, paired arrows, Frost Mage freezes, extended swarms, Blitz charges, wave counters and enemy inspection.');
`,context);
vm.runInContext(`
level=levels[1];configureMap();reset();assert.equal(routeInfo.length,2);assert.equal(sites.length,7);spawn('moss',170,0);spawn('moss',170,1);assert.notEqual(point(enemies[0]).y,point(enemies[1]).y);const shared=levels[1].routes[0].slice(-4);assert.equal(JSON.stringify(shared),JSON.stringify(levels[1].routes[1].slice(-4)));
wave=3;spawn('splitter',250,1);const laneSplitter=enemies.at(-1);hit(laneSplitter,1000,{kind:'ranger'});assert.ok(enemies.filter(e=>e.kind==='shard').every(e=>e.route===1));
reset();spawn('rock',200,1);spawn('healer',210,1);enemies[0].hp-=20;const preHeal=enemies[0].hp;update(.1);assert.ok(enemies[0].hp>preHeal);
const magicGuard={hp:100,max:100,kind:'wisp',reward:12,d:150,route:0,dead:false,freezeCooldown:0};hit(magicGuard,20,{kind:'snow'});assert.equal(magicGuard.hp,91);hit(magicGuard,20,{kind:'ranger'});assert.equal(magicGuard.hp,71);
reset();spawn('boss',250,0);orders='storm';executeOrder(point(enemies[0]));assert.equal(abilityCooldown.storm,35);assert.ok(enemies[0].hp<enemies[0].max);const stormHp=enemies[0].hp;orders='storm';executeOrder(point(enemies[0]));assert.equal(enemies[0].hp,stormHp);paused=true;update(1);assert.equal(abilityCooldown.storm,35);paused=false;update(1);assert.ok(abilityCooldown.storm<35);
orders='reinforce';executeOrder(at(250));assert.equal(reinforcements.length,1);assert.equal(abilityCooldown.reinforce,25);assert.ok(report.ability);assert.equal(report.hero,undefined);
console.log('PASS: dual routes merge correctly, splitter children retain lanes, healer aura, magic resistance, cooldown enforcement, pause, reinforcements and hero-free combat.');
`,context);
vm.runInContext(`
level=levels[1];configureMap();reset();selected=0;build('ranger');selected=2;build('snow');
for(let w=1;w<=8&&!finished;w++){nextWave();for(let tick=0;tick<40000&&active&&!finished;tick++){if(tick%120===0){const order=[[3,'bees'],[4,'cave'],[5,'ranger'],[6,'ranger'],[1,'ranger']];const slot=order.find(([site])=>!towers.some(t=>t.site===site));if(slot&&gold>=types[slot[1]].cost){selected=slot[0];build(slot[1]);}else if(!slot){const t=towers.filter(t=>t.tier<4).sort((a,b)=>a.tier-b.tier)[0];if(t&&gold>=upgradeCost(t))upgrade(t,t.kind==='snow'?'B':t.kind==='ranger'?'A':'A');}const focus=enemies.filter(e=>!e.dead).sort((a,b)=>Number(b.kind==='healer')-Number(a.kind==='healer')||remaining(a)-remaining(b))[0];if(focus){if(abilityCooldown.storm===0&&enemies.length>=4){orders='storm';executeOrder(point(focus));}if(abilityCooldown.reinforce===0&&focus.kind!=='flyer'){orders='reinforce';executeOrder(point(focus));}}}update(1/60);}}
assert.equal(wave,8);assert.ok(lives>0);assert.ok(finished);console.log('PASS: alternative lane-focused defense with affordable purchases, timed abilities without a hero completes Provo Canyon with '+lives+' lives.');
`,context);

vm.runInContext(`
reset();selected=0;build('ranger');spawn('moss',190);spawn('healer',150);towers[0].targeting='healers';update(1/60);assert.equal(projectiles[0].target.kind,'healer');
reset();selected=0;build('snow');spawn('moss',190);spawn('rock',150);towers[0].targeting='armored';update(1/60);assert.equal(projectiles[0].target.kind,'rock');
reset();selected=0;build('ranger');spawn('moss',190);spawn('runner',150);towers[0].targeting='healers';update(1/60);assert.equal(projectiles[0].target.kind,'moss');
reset();selectOrder('storm');assert.equal(abilityAim(at(250)).radius,110);assert.ok(abilityAim(at(250)).valid);assert.equal(abilityAim({x:1050,y:40}).valid,false);executeOrder({x:1050,y:40});assert.equal(abilityCooldown.storm,0);assert.equal(orders,'storm');selectOrder('storm');assert.equal(orders,null);selectOrder('hero');assert.equal(orders,null);selectOrder('reinforce');assert.equal(abilityAim(at(250)).radius,28);
console.log('PASS: healer and armor priorities, fallback, exact ability previews, invalid cast and cancellation.');
`,context);
vm.runInContext(`
reset();spawn('moss',250);reinforcements=[{...at(250),life:.001,cool:0}];const expiredSquadHP=enemies[0].hp;update(.02);assert.equal(enemies[0].hp,expiredSquadHP);assert.equal(enemies[0].blocked,false);assert.equal(reinforcements.length,0);
reset();selected=0;build('cave');const exhaustedCave=towers[0];exhaustedCave.rally=250;exhaustedCave.guard={...at(250)};exhaustedCave.stamina=.01;spawn('boss',250);const bossHP=enemies[0].hp;update(.1);assert.ok(exhaustedCave.respawn>0);assert.equal(enemies[0].hp,bossHP);assert.equal(enemies[0].blocked,false);
console.log('PASS: expired temporary defenders and exhausted cave squads stop attacking and blocking immediately.');
`,context);
