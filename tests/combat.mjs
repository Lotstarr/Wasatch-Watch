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
