// Имитация Google Apps Script окружения для проверки Code.gs
const vm=require('vm'),fs=require('fs'),crypto=require('crypto');
function makeEnv(props){
  const sheets={};const cache={};
  const mkSheet=name=>{const d=[];const sh={name,d,
    getLastRow(){let n=0;d.forEach((r,i)=>{if(r&&r.some(v=>v!==''&&v!=null))n=i+1;});return n;},
    getRange(r,c,nr,nc){return{
      getValues(){const o=[];for(let i=0;i<nr;i++){const row=[];for(let j=0;j<nc;j++){const v=(d[r-1+i]||[])[c-1+j];row.push(v==null?'':v);}o.push(row);}return o;},
      setValues(v){v.forEach((row,i)=>{d[r-1+i]=d[r-1+i]||[];row.forEach((x,j)=>{d[r-1+i][c-1+j]=x;});});},
      clearContent(){for(let i=0;i<nr;i++)for(let j=0;j<nc;j++)if(d[r-1+i])d[r-1+i][c-1+j]='';},
      setNumberFormat(){}};}};return sh;};
  const ctx={console,JSON,Date,Math,Number,String,Object,Array,parseInt,isFinite,
    SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:n=>sheets[n]||null,insertSheet:n=>(sheets[n]=mkSheet(n)),getSpreadsheetTimeZone:()=>'Asia/Almaty'})},
    ContentService:{MimeType:{JSON:'json'},createTextOutput:t=>({t,setMimeType(){return this;},getContent(){return this.t;}})},
    CacheService:{getScriptCache:()=>({get:k=>cache[k]??null,put:(k,v)=>{cache[k]=v;},remove:k=>{delete cache[k];},getAll:ks=>{const o={};ks.forEach(k=>{if(cache[k]!=null)o[k]=cache[k];});return o;},putAll:(o)=>{Object.assign(cache,o);},removeAll:ks=>ks.forEach(k=>delete cache[k])})},
    LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]??null})},
    Utilities:{getUuid:()=>crypto.randomUUID(),sleep(){},formatDate:(d)=>d.toTimeString().slice(0,5)}};
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname + '/Code.gs','utf8'),ctx);
  return {ctx,sheets,get:(p)=>JSON.parse(ctx.doGet({parameter:p}).getContent()),post:(b)=>JSON.parse(ctx.doPost({postData:{contents:JSON.stringify(b)}}).getContent())};
}
const assert=require('assert');
const E=makeEnv({ORGANIZER_PASSWORD:'adminpass1',ORG_VOLLEYBALL_PASSWORD:'volleypass',ORG_CHESS_PASSWORD:'chesspass1'});
let r=E.get({});assert(r.ok,JSON.stringify(r));
console.log('первый запуск: sports',Object.keys(r.data.sports),'арены dads',r.data.sports.volleyball_dads.venues,'moms',r.data.sports.volleyball_moms.venues);
assert.deepStrictEqual(Object.keys(E.sheets).sort(),['Арены','Матчи','Настройки','Расписание','Участники'].sort());
// вход
assert(!E.post({action:'login',username:'organizer',password:'bad'}).ok);
assert(!E.post({action:'login',username:'org_tennis',password:'x'}).ok);   // пароль не задан
assert(!E.post({action:'login',username:'__proto__',password:'x'}).ok);
const lv=E.post({action:'login',username:'org_volleyball',password:'volleypass'});assert(lv.ok&&lv.token);
const ad=E.post({action:'login',username:'organizer',password:'adminpass1'});assert(ad.ok);
// сохранение организатором волейбола
const mk=(id,name,cls,parent)=>({id,name,cls,parent,group:''});
const dads={format:'championship',groups:2,venues:['Большой зал','Арена 2'],participants:[mk('p1','Алпамыс','7А','Иванова'),mk('p2','Батыр','7Б','Петров')],
 matches:[{id:'m1',round:1,group:'',a:'p1',b:'p2',sa:15,sb:12.5,detail:'2-я партия',venue:'0',status:'live'},{id:'m2',round:1,group:'',a:'p1',b:'',sa:1,sb:0,detail:'',venue:'',status:'finished'}]};
let s=E.post({action:'save',full:true,token:lv.token,data:{news:'взлом',sports:{volleyball_dads:dads,chess_dads:{participants:[mk('c1','X','1','')]}}}});assert(s.ok,JSON.stringify(s));
let g=E.get({});assert(g.ok);
assert.strictEqual(g.data.news,'Добро пожаловать на спартакиаду!');               // news не изменён (не админ)
assert.strictEqual(g.data.sports.chess_dads.participants.length,0);                    // чужой вид спорта не записан
const d=g.data.sports.volleyball_dads;
assert.strictEqual(d.format,'championship');assert.deepStrictEqual(d.venues,['Большой зал','Арена 2']);
assert.strictEqual(d.participants.length,2);assert(!('parent' in d.participants[0]),'родитель не должен виден без входа');
assert.strictEqual(d.matches[0].sb,12.5);assert.strictEqual(d.matches[0].venue,'0');assert.strictEqual(d.matches[0].status,'live');
assert.strictEqual(d.matches[1].b,'');assert.strictEqual(d.matches[1].venue,'');
g=E.get({token:lv.token});assert.strictEqual(g.data.sports.volleyball_dads.participants[0].parent,'Иванова');
console.log('Матчи в таблице:',E.sheets['Матчи'].d.slice(0,3).map(r=>r.join('|')));
// админ
s=E.post({action:'save',full:true,token:ad.token,data:{news:'Новости',date:'14 ноября 2026',place:'Лицей',schedule:[{time:'09:00',event:'Открытие',place:'Зал'}],sports:{chess_dads:{format:'swiss',participants:[mk('c1','Аружан','5А','Мама')],matches:[]}}}});assert(s.ok);
g=E.get({});assert.strictEqual(g.data.news,'Новости');assert.strictEqual(g.data.date,'14 ноября 2026');
assert.deepStrictEqual(g.data.schedule,[{time:'09:00',event:'Открытие',place:'Зал'}]);
assert.strictEqual(g.data.sports.chess_dads.format,'swiss');assert.strictEqual(g.data.sports.chess_dads.participants[0].name,'Аружан');
assert.strictEqual(g.data.sports.volleyball_dads.participants.length,2);          // данные волейбола сохранились
// без токена нельзя писать
assert(!E.post({action:'save',data:{news:'x'}}).ok);
// выход
E.post({action:'logout',token:ad.token});assert(!E.post({action:'save',token:ad.token,data:{news:'y'}}).ok);
// защита: неверные id в матчах, статус
s=E.post({action:'save',full:true,token:lv.token,data:{sports:{volleyball_moms:{format:'bad',participants:[mk('a','A','1','')],matches:[{id:'z',round:500,a:'nope',b:'a',sa:'abc',sb:1,status:'weird',venue:'9'}]}}}});assert(s.ok);
const mm=E.get({}).data.sports.volleyball_moms;assert.strictEqual(mm.format,'league');assert.strictEqual(mm.matches[0].a,'');assert.strictEqual(mm.matches[0].round,99);assert.strictEqual(mm.matches[0].sa,0);assert.strictEqual(mm.matches[0].status,'scheduled');assert.strictEqual(mm.matches[0].venue,'');
// блокировка после 10 неудачных попыток
for(let i=0;i<10;i++)E.post({action:'login',username:'organizer',password:'x'});
assert(/много попыток/.test(E.post({action:'login',username:'organizer',password:'adminpass1'}).error));
// кэш: второе чтение родителем идёт из кэша и обновляется после сохранения
const E2=makeEnv({ORGANIZER_PASSWORD:'adminpass1'});E2.get({});
const l2=E2.post({action:'login',username:'organizer',password:'adminpass1'});
E2.post({action:'save',full:true,token:l2.token,data:{news:'A',sports:{}}});
assert.strictEqual(E2.get({}).data.news,'A');
const before=E2.sheets['Настройки'].d.length;
assert.strictEqual(E2.get({}).data.news,'A');                       // из кэша
E2.post({action:'save',full:true,token:l2.token,data:{news:'B',sports:{}}});
assert.strictEqual(E2.get({}).data.news,'B');                       // кэш сброшен
console.log('ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ');

// ---- точечные правки: два организатора одного вида спорта пишут одновременно
{
  const E3=makeEnv({ORGANIZER_PASSWORD:'adminpass1',ORG_VOLLEYBALL_PASSWORD:'volleypass'});
  assert.deepStrictEqual(E3.get({action:'ping'}).features,['patch']);
  const t=E3.post({action:'login',username:'org_volleyball',password:'volleypass'}).token;
  const P=(id,n)=>({id,name:n,cls:'',parent:'',group:'А'});
  const M=(id,a,b)=>({id,round:1,group:'А',a,b,sa:0,sb:0,detail:'',venue:'0',status:'scheduled'});
  E3.post({action:'save',full:true,token:t,data:{sports:{volleyball_dads:{format:'league',groups:2,venues:['Арена 1','Арена 2'],participants:[P('a','7А'),P('b','7Ә'),P('c','8А')],matches:[M('m1','a','b'),M('m2','b','c')]}}}});
  // организатор 1 вводит счёт m1, организатор 2 одновременно m2 и переименовывает арену 2
  assert(E3.post({action:'save',token:t,patches:{volleyball_dads:{mUp:[{...M('m1','a','b'),detail:'15-10; 15-9',status:'finished'}]}}}).ok);
  assert(E3.post({action:'save',token:t,patches:{volleyball_dads:{mUp:[{...M('m2','b','c'),status:'live'}],venues:{1:'Новое имя'}}}}).ok);
  let d=E3.get({}).data.sports.volleyball_dads;
  assert.strictEqual(d.matches.find(m=>m.id==='m1').status,'finished');
  assert.strictEqual(d.matches.find(m=>m.id==='m2').status,'live');
  assert.deepStrictEqual(d.venues,['Арена 1','Новое имя']);
  // удалённый матч не воскресает, добавленный дважды не дублируется, чужие данные сохраняются
  E3.post({action:'save',token:t,patches:{volleyball_dads:{mDel:['m2']}}});
  E3.post({action:'save',token:t,patches:{volleyball_dads:{mUp:[{...M('m2','b','c'),status:'finished'}],mAdd:[M('po-SF1','a','c'),M('po-SF1','a','c')]}}});
  E3.post({action:'save',token:t,patches:{volleyball_dads:{mAdd:[{...M('po-SF1','a','c'),status:'finished'}]}}});
  d=E3.get({}).data.sports.volleyball_dads;
  assert(!d.matches.find(m=>m.id==='m2'));
  assert.strictEqual(d.matches.filter(m=>m.id==='po-SF1').length,1);
  assert.strictEqual(d.matches.find(m=>m.id==='po-SF1').status,'scheduled');
  assert.strictEqual(d.participants.length,3);
  // чужой вид спорта патчем не записать
  assert(E3.post({action:'save',token:t,patches:{chess_dads:{pUp:[P('x','X')]}}}).ok);
  assert.strictEqual(E3.get({}).data.sports.chess_dads.participants.length,0);
  console.log('точечные правки: ок');
}

{const E4=makeEnv({ORG_VOLLEYBALL_PASSWORD:'volleypass'});const tk=E4.post({action:'login',username:'org_volleyball',password:'volleypass'}).token;
 const r=E4.post({action:'save',token:tk,data:{sports:{volleyball_dads:{venues:['x','y'],participants:[],matches:[]}}}});assert(!r.ok&&/устарела/.test(r.error));console.log('старые страницы отклоняются: ок');}
{ // старые записи tennis/chess переходят в «папы»
  const E5=makeEnv({ORGANIZER_PASSWORD:'adminpass1'});E5.get({});
  E5.sheets['Участники'].d.push(['tennis','t1','Игрок','7А','','А'],['chess','c1','Шахматист','8А','','']);
  E5.sheets['Матчи'].d.push(['tennis','tm1',1,'А','t1','','',0,'','','scheduled','','']);
  E5.sheets['Настройки'].d.push(['format_tennis','group'],['groups_chess','3']);
  E5.sheets['Арены'].d.push(['chess',1,'Мой зал']);
  E5.ctx.cache_().remove('db_ready2');
  const d=E5.get({token:E5.post({action:'login',username:'organizer',password:'adminpass1'}).token}).data.sports;
  assert.strictEqual(d.tennis_dads.participants[0].name,'Игрок');assert.strictEqual(d.tennis_dads.matches[0].id,'tm1');
  assert.strictEqual(d.tennis_dads.format,'group');assert.strictEqual(d.chess_dads.participants[0].name,'Шахматист');
  assert.strictEqual(d.chess_dads.groups,3);assert.deepStrictEqual(d.chess_dads.venues,['Мой зал']);assert.strictEqual(d.tennis_moms.participants.length,0);
  console.log('перенос tennis/chess в «папы»: ок');
}
