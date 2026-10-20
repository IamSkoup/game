'use strict';
(() => {
const S=SF,T=THREE;
S.MISSION_DEFS=[
{name:'Патруль саванны',letter:'П',start:{x:-45,z:5},intro:[['Кайон','До края Земель Прайда — Хранители всегда на страже!'],['Оно','Хапана! У водопоя Джанджа, Чизи и Чунгу.'],['Фули','Опять они? Похоже, намечается пробежка.']],outro:[['Джазири','Не все гиены одинаковые. И даже Джанджа ещё может это понять.'],['Фули','Пусть сначала научится бегать быстрее.'],['Кайон','Спасибо, друзья. Саванна снова в безопасности.']],stages:[
{kind:'travel',hero:0,text:'Вместе с Хранителями доберись до места нападения.',target:{x:38,z:-32}},
{kind:'fight',hero:0,text:'Отгони Чизи и Чунгу. ЛКМ — удар, F — Рык, Q — уклонение.',target:{x:40,z:-38},enemies:2,names:['Чизи','Чунгу']},
{kind:'chase',hero:1,text:'Догони Джанджу. Используй Huwezi! Затем E рядом с ним.',target:{x:116,z:-90},limit:80},
{kind:'track',hero:2,text:'Включи Инстинкт (F). Найди тайный путь и перехвати гиен (E).',target:{x:145,z:-116}},
]},
{name:'Гость из другого мира',letter:'Т',start:{x:72,z:58},intro:[['Банга','Зука Зама! Что это за рычащий железный зверь?!'],['Тревор','Какого чёрта?! Где шоссе? И почему этот лев на меня смотрит?'],['Кайон','Ты в Землях Прайда. Давай сначала без резких движений.']],outro:[['Тревор','Говорящие звери. Ну конечно. Обычный день Тревора Филипса!'],['Макини','Этот камень улавливает эхо разлома. Через него вы услышите друг друга.'],['Фули','Только не вызывайте его во время моей пробежки.'],['Тревор','Понадоблюсь — свистните в эту штуку. Я ещё покажу вам настоящую поездку.']],stages:[
{kind:'talk',hero:0,text:'Дождись пикапа и поговори с Тревором (E).',target:{x:78,z:63}},
{kind:'board',hero:0,text:'Подойди к Canis Bodhi и нажми E, чтобы сесть в кузов.',target:{x:78,z:63}},
{kind:'drive',hero:0,text:'Пройди маршрут на пикапе. W/S — газ и тормоз, A/D — руль.',points:[{x:128,z:91},{x:48,z:138},{x:-35,z:101},{x:7,z:65},{x:72,z:58}],limit:180},
{kind:'exit',hero:0,text:'Остановись у водопоя и выйди из пикапа (E).',target:{x:72,z:58}},
]},
{name:'Последний рык',letter:'Р',start:{x:-39,z:-4},intro:[['Оно','Над вулканом густой дым. Армия Шрама идёт к границе!'],['Джазири','Сопротивление нашло обход. Мы проведём вас.'],['Кайон','Хранители, вместе! Не дадим страху захватить наш дом.']],outro:[['Фули','Вот теперь можно немного отдохнуть. Немного.'],['Джазири','Чужеземье — наш дом. Мы будем защищать его вместе.'],['Кайон','Пока жив Круг Жизни, надежда не погаснет.']],stages:[
{kind:'travel',hero:0,text:'Веди Хранителей к границе Чужеземья.',target:{x:129,z:-133}},
{kind:'fight',hero:0,text:'Прорви заслон армии Шрама. Прикрой товарищей.',target:{x:139,z:-147},enemies:4},
{kind:'track',hero:2,text:'Обойди патрули. Инстинкт покажет тайный проход (F, затем E).',target:{x:194,z:-206},patrols:2},
{kind:'sprint',hero:1,text:'Предупреди союзников! Пройди три точки до обвала.',points:[{x:210,z:-222},{x:235,z:-239},{x:251,z:-263}],limit:65,hazards:true},
{kind:'fight',hero:0,text:'Шрам: фаза I. Отбей волну гиен и избегай огня.',target:{x:251,z:-268},enemies:3,boss:true,hazards:true},
{kind:'runes',hero:2,text:'Шрам: фаза II. Найди три слабых места. F — Инстинкт, E — открыть.',points:[{x:234,z:-267},{x:250,z:-282},{x:272,z:-268}],boss:true,hazards:true},
{kind:'sprint',hero:1,text:'Шрам: фаза III. Освободи союзников в трёх точках до вспышки!',points:[{x:278,z:-252},{x:248,z:-243},{x:230,z:-260}],limit:42,boss:true,hazards:true},
{kind:'roar',hero:0,text:'Шрам: фаза IV. Подойди к отметке и направь Рык на дух Шрама (F).',target:{x:255,z:-278},boss:true,hazards:true}
]}
];
S.Missions=class{
 constructor(g){this.g=g;this.completed=[];this.active=null;this.stage=0;this.failed=false;this.spawned=[];this.borrowed=[];this.point=0;this.hazards=[];this.hazardTimer=3;this.marker=new T.Group();const ring=new T.Mesh(new T.TorusGeometry(3.5,.13,8,40),new T.MeshBasicMaterial({color:0xeac47e}));ring.rotation.x=Math.PI/2;const beam=new T.Mesh(new T.CylinderGeometry(.12,.12,12,6),new T.MeshBasicMaterial({color:0xeac47e,transparent:true,opacity:.5}));beam.position.y=6;this.marker.add(ring,beam);g.scene.add(this.marker);this.stats={time:0,damage:0,abilities:0};this.kind=null;this.bossActive=false;}
 get def(){return this.active!==null?S.MISSION_DEFS[this.active]:null}get step(){return this.def?.stages[this.stage]||null}
 available(){return S.MISSION_DEFS.map((d,i)=>({...d,id:i})).filter(d=>!this.completed.includes(d.id)&&(d.id===0||this.completed.includes(d.id-1)))}
 target(){if(this.active!==null&&!this.failed){if(this.kind==='chase'&&this.chaser)return this.chaser;if(this.kind==='drive'||this.kind==='sprint'||this.kind==='runes')return this.step.points[Math.min(this.point,this.step.points.length-1)];return this.step.target||null}return this.available()[0]?.start||null}
 start(id){if(this.active!==null||this.completed.includes(id)||(id>0&&!this.completed.includes(id-1)))return;this.active=id;this.stage=0;this.failed=false;this.stats={time:0,damage:this.g.stats.damage,abilities:this.g.stats.abilities};this.g.ui.closeDialogue();this.g.forceHero(0);const h=this.g.hero;for(let i=0;i<3;i++){const e=this.g.heroes[i];e.x=h.x+i*3;e.z=h.z+3;e.y=S.height(e.x,e.z);e.follow=i!==0;}for(const n of this.g.npcs)if(['bunga','beshte','ono'].includes(n.id))n.follow=true;if(id===2){this.g.weather.set(2);this.g.weather.hour=17;}
 this.g.cinematic(this.def.intro,()=>this.enter(0));}
 cleanupStage(){for(const e of this.spawned)this.g.removeEntity(e);this.spawned=[];for(const v of this.borrowed){const e=v.e;e.mission=false;e.scripted=false;e.scriptTarget=null;e.x=v.x;e.z=v.z;e.hp=e.maxHp;e.hostile=true;e.home={...v.home};}this.borrowed=[];this.chaser=null;for(const h of this.hazards){this.g.scene.remove(h.mesh);h.mesh.geometry.dispose();h.mesh.material.dispose()}this.hazards=[];}
 cleanup(){this.cleanupStage();this.active=null;this.bossActive=false;this.kind=null;this.g.world.scar.visible=false;for(const e of [...this.g.heroes,...this.g.npcs])e.follow=false;}
 borrow(id,x,z){const e=this.g.npcs.find(n=>n.id===id);this.borrowed.push({e,x:e.x,z:e.z,home:{...e.home}});e.x=x;e.z=z;e.hp=e.maxHp;e.mission=true;e.stun=0;e.y=S.height(x,z);e.target={x,z};return e;}
 enter(stage,restore=false){this.cleanupStage();this.stage=stage;this.failed=false;this.point=0;const s=this.step,g=this.g;if(!s)return this.complete();this.kind=s.kind;this.remaining=s.limit||0;this.hazardTimer=3;this.bossActive=!!s.boss;g.world.scar.visible=this.bossActive;
 const previous=g.hero;const location={x:previous.x,z:previous.z};g.forceHero(s.hero);const hero=g.hero;
 if(restore){const p=s.target||s.points[0];location.x=p.x-13;location.z=p.z+15;hero.hp=hero.maxHp;hero.special=Math.max(hero.special,60);}
 if(hero!==previous||restore){hero.x=location.x;hero.z=location.z;hero.y=S.height(hero.x,hero.z);hero.vx=hero.vz=0;g.cameraTransition=1.1;}
 for(const e of g.heroes){e.follow=e!==hero;if(e!==hero&&S.dist(e,hero)>70){e.x=hero.x+4;e.z=hero.z+4;e.y=S.height(e.x,e.z);}}
 if(s.kind==='fight'){const p=s.target;for(let i=0;i<s.enemies;i++){let e;if(this.active===0)e=this.borrow(['cheezi','chungu'][i],p.x+(i*6-3),p.z-3);else{e=g.spawnEnemy(p.x+Math.sin(i*2)*7,p.z+Math.cos(i*2)*7,'mission');this.spawned.push(e);}e.maxHp=65;e.hp=65;e.mission=true;e.hostile=true;}g.ui.subtitle(this.active===2?'Шрам':'Чизи',this.active===2?'Вы пришли прямо в мою ловушку!':'Эй, а нас же больше… почти!');}
 if(s.patrols)for(let i=0;i<s.patrols;i++){const e=g.spawnEnemy(s.target.x-12+i*16,s.target.z+10,'mission');e.mission=true;e.patrol=true;this.spawned.push(e);}
 if(s.kind==='chase'){const p=g.hero;this.chaser=this.borrow('janja',p.x+20,p.z-14);this.chaser.hp=90;this.chaser.maxHp=90;this.chaseClock=0;g.ui.subtitle('Джанджа','Ха! Посмотрим, кто кого догонит!');}
 if(s.kind==='talk'){g.car.appear(163,66,{x:78,z:63});g.car.heading=-Math.PI/2;}
 if(s.kind==='board'&&restore)g.car.appear(78,63);
 if(s.kind==='drive'){if(restore){g.car.appear(78,63);hero.x=78;hero.z=63;g.car.board();}g.ui.subtitle('Тревор','Держитесь крепче! Дорог нет? Да плевать!');}
 if(s.kind==='exit'){g.car.speed=0;if(restore){g.car.appear(72,58);g.car.board();}}
 if(s.kind==='roar'){g.ui.subtitle('Шрам','Ты думаешь, твой рык сильнее моего пламени?');hero.special=Math.max(hero.special,65);}
 g.ui.toast(this.def.name+' · этап '+(stage+1)+'/'+this.def.stages.length);g.save?.auto();}
 chaseTarget(){this.chaseClock+=0;const p=this.step.target;return{x:p.x+Math.sin(this.chaseClock*.16)*18,z:p.z+Math.cos(this.chaseClock*.16)*18};}
 next(){if(this.active===null)return;const n=this.stage+1;if(n>=this.def.stages.length)this.complete();else this.enter(n);}
 complete(){const g=this.g,id=this.active,def=this.def;if(id===null)return;const time=this.stats.time,damage=g.stats.damage-this.stats.damage,abilities=g.stats.abilities-this.stats.abilities;this.cleanupStage();this.kind='cinematic';this.bossActive=false;g.world.scar.visible=false;
 if(id===2){g.combat.ring(262,-280,0xffeabc,2,65,3);g.audio.roar();g.weather.hour=17.7;g.weather.set(0)}
 g.cinematic(def.outro,()=>{this.completed.push(id);this.active=null;this.kind=null;for(const e of [...g.heroes,...g.npcs])e.follow=false;if(id===1){g.contacts.add('trevor');g.car.speed=8;g.car.autoTarget={x:320,z:100};}if(id===2){g.heroes[2].home={x:145,z:-106};g.heroes[2].target={x:145,z:-106};}g.hero.reputation['Хранители']+=15;g.ui.banner('МИССИЯ ПРОЙДЕНА',def.name+' · '+Math.round(time)+' с · урон '+Math.round(damage)+' · способностей '+abilities+(id===1?'\nОткрыт контакт «Тревор»':''),6);if(id===2){g.endingTimer=7;}g.save.auto();});}
 fail(reason){if(this.active===null||this.failed)return;this.failed=true;this.g.ui.banner('МИССИЯ ПРОВАЛЕНА',reason+'\nE — повторить текущий этап после возрождения',5);this.g.ui.subtitle('Контрольная точка','Пройденные этапы сохранены. Повтори текущий этап клавишей E.');this.bossActive=false;}
 retry(){if(!this.failed||this.g.deadTimer>0)return;this.g.hero.hp=this.g.hero.maxHp;this.g.hero.special=100;this.enter(this.stage,true);}
 interact(){if(this.failed){this.retry();return true}if(this.active===null){const d=this.available().find(m=>S.dist(this.g.hero,m.start)<9);if(d){this.start(d.id);return true}return false}const g=this.g,h=g.hero,s=this.step,p=this.target();if(!s||!p)return false;
 if(s.kind==='talk'&&g.car.arrived&&S.dist(h,g.car)<10){g.ui.dialogue('Тревор','Только не говори мне, что вы все разговариваете. Я уже понял. Где я, чёрт возьми?!',[['Ты в Землях Прайда.',()=>g.ui.dialogue('Кайон','Это наш дом. Если ты не навредишь его жителям, мы поможем найти путь назад.',[['А эта штука умеет бегать?',()=>g.ui.dialogue('Тревор','Бегать? Это Canis Bodhi! Залезайте, покажу, на что он способен.',[['Поехали.',()=>{g.ui.closeDialogue();this.next()}],['Ещё осмотрюсь.',()=>g.ui.closeDialogue()]])],['До встречи.',()=>g.ui.closeDialogue()]])],['Успокойся. Мы можем помочь.',()=>g.ui.dialogue('Фули','Для такого шума у него удивительно маленькие лапы.',[['Попросить о поездке',()=>{g.ui.closeDialogue();this.next()}],['До встречи.',()=>g.ui.closeDialogue()]])],['До встречи.',()=>g.ui.closeDialogue()]]);return true;}
 if(s.kind==='board'&&S.dist(h,g.car)<10){g.car.board();this.next();return true}
 if(s.kind==='exit'&&g.car.riding){g.car.exit();if(!g.car.riding)this.next();return true}
 if(s.kind==='chase'&&S.dist(h,p)<8){g.ui.subtitle('Фули','Неужели ты думал, что сможешь убежать от меня?');this.next();return true}
 if((s.kind==='track'||s.kind==='runes')&&S.dist(h,p)<8){if(h.id!=='jasiri'||h.activeAbility<=0){g.ui.toast('Джазири: сначала включи Инстинкт клавишей F.');return true}g.combat.ring(p.x,p.z,0x93e4be,1,8,1.2);if(s.kind==='runes'){this.point++;if(this.point>=s.points.length)this.next();else g.ui.toast('Путь открыт · '+this.point+'/'+s.points.length)}else this.next();return true}return false;}
 onRoar(){if(this.kind!=='roar'||this.failed)return;const h=this.g.hero,p=this.target();const dot=Math.sin(h.heading)*(265-h.x)+Math.cos(h.heading)*(-309-h.z);if(h.id==='kion'&&S.dist(h,p)<15&&dot>0){this.next();}else this.g.ui.toast('Подойди к золотой отметке и повернись к Шраму.');}
 update(dt){const g=this.g,p=this.target();this.marker.visible=!!p&&!g.cutscene;if(p){this.marker.position.set(p.x,S.height(p.x,p.z)+.25,p.z);this.marker.rotation.y=g.time*.6;}
 if(this.active===null||this.failed||g.cutscene||!this.step)return;this.stats.time+=dt;const s=this.step;if(s.limit){this.remaining-=dt;if(this.remaining<=0){this.fail('Время вышло.');return}}
 if(this.kind==='travel'&&S.dist(g.hero,p)<10){this.next();return}
 if(this.kind==='fight'&&[...this.spawned,...this.borrowed.map(x=>x.e)].filter(e=>e.mission).every(e=>e.hp<=0)){this.next();return}
 if(this.kind==='chase'){this.chaseClock+=dt;if(this.chaser.hp<=0){this.next();return}}
 if(this.kind==='sprint'||this.kind==='drive'){const actor=this.kind==='drive'?g.car:g.hero;if((this.kind!=='drive'||g.car.riding)&&S.dist(actor,p)<10){g.audio.tone(660,.22,.13,'sine',990);this.point++;if(this.point>=s.points.length){this.next();return}g.ui.toast('Контрольная точка '+this.point+'/'+s.points.length);if(this.kind==='drive')g.ui.subtitle(this.point%2?'Банга':'Фули',this.point%2?'Зука Зама! Ещё быстрее!':'Я всё равно быстрее. И торможу лучше.');}}
 if(this.kind==='exit'&&!g.car.riding&&S.dist(g.hero,p)<15){this.next();return}
 if(s.hazards){this.hazardTimer-=dt;if(this.hazardTimer<0){this.hazardTimer=2.5;const x=g.hero.x+(Math.random()-.5)*10,z=g.hero.z+(Math.random()-.5)*10;const mesh=new T.Mesh(new T.CircleGeometry(3.8,24),new T.MeshBasicMaterial({color:0xf87c32,transparent:true,opacity:.45,side:T.DoubleSide}));mesh.rotation.x=-Math.PI/2;mesh.position.set(x,S.height(x,z)+.2,z);g.scene.add(mesh);this.hazards.push({x,z,t:0,mesh});}for(let i=this.hazards.length-1;i>=0;i--){const h=this.hazards[i];h.t+=dt;h.mesh.material.opacity=.25+Math.sin(h.t*12)*.2;if(h.t>2){if(S.dist(h,g.hero)<3.8)g.combat.damage(g.hero,27,{name:'Пламя Шрама'});g.combat.ring(h.x,h.z,0xf38d34,.4,5,.6);g.scene.remove(h.mesh);h.mesh.geometry.dispose();h.mesh.material.dispose();this.hazards.splice(i,1);}}}
 }
};
})();
