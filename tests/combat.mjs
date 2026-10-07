import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const elements=new Map();const element=()=>({textContent:'',innerHTML:'',disabled:false,style:{},children:[],append(x){this.children.push(x)},replaceChildren(){this.children=[]},close(){},showModal(){},addEventListener(){},getContext(){return {}},getBoundingClientRect(){return{left:0,top:0,width:1080,height:680}}});
const document={getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},querySelector(){return element()},createElement(){return element()},addEventListener(){}};
const save=new Map();const context=vm.createContext({document,window:{addEventListener(){}},HTMLElement:class{},performance:{now:()=>0},requestAnimationFrame(){},localStorage:{getItem:k=>save.get(k),setItem:(k,v)=>save.set(k,v)},assert,console});
vm.runInContext(readFileSync(new URL('../public/game.js',import.meta.url),'utf8'),context);
vm.runInContext(`
reset(); selected=0; build('ranger');assert.equal(gold,190);assert.equal(towers.length,1);build('ranger');assert.equal(towers.length,1);
let t=towers[0];upgrade(t);assert.equal(t.tier,2);assert.equal(gold,100);upgrade(t);assert.equal(t.tier,2);assert.equal(gold,100);
let e={hp:1,kind:'moss',reward:8,dead:false,d:0};hit(e,20,t);assert.equal(gold,108);hit(e,20,t);assert.equal(gold,108);
reset();spawn('moss');enemies[0].d=total+1;update(1/60);assert.equal(lives,19);assert.equal(gold,270);
reset();nextWave();paused=true;update(1);assert.equal(clock,0);assert.equal(enemies.length,0);paused=false;update(1);assert.ok(enemies.length>0);
reset();selected=0;build('cave');let cave=towers[0];spawn('moss');let enemy=enemies[0];enemy.d=cave.rally;let old=enemy.d;update(.1);assert.equal(enemy.d,old);assert.ok(enemy.hp<enemy.max);
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
   const order=[[2,'cave'],[3,'ranger'],[5,'bees'],[4,'ranger'],[6,'snow'],[7,'ranger'],[8,'ranger']];
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
