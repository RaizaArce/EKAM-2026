// Pruebas del código de Apps Script con servicios Google simulados. No envía correos.
// Ejecutar desde la raíz: node tools/pruebas_bolsa.cjs
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const payload = {elapsed:4000, convocatoria:'Bolsa general',area:'Sistemas',nombres:'PRUEBA',apellidos:'LOCAL',correo:'prueba@example.test',whatsapp:'999999999',ciudad:'Chiclayo',universidad:'Instituto',especialidad:'Sistemas',egreso:'2020',navasoft:'Básico',consentimiento:true,compartir:true,cv:{data:Buffer.from('%PDF-1.4 prueba').toString('base64')}};
function backend(options={}) {
  const state={files:0,rows:0,mail:0,trashed:0,records:[],cache:{},locked:false};
  const range=(row,col)=>({
    setValues:()=>{},
    setValue:value=>{if(options.statusFails)throw Error('Estado no disponible');state.records[row-2][col-1]=value;},
    createTextFinder:id=>({matchEntireCell:()=>({findNext:()=>{const i=state.records.findIndex(r=>r[15]===id);return i<0?null:{getRow:()=>i+2};}})})
  });
  const sheet={getLastRow:()=>state.records.length+1,getRange:range,
    appendRow:row=>{assert.equal(state.locked,true);if(options.sheetFails)throw Error('Sheets no disponible');state.records.push(row);state.rows++;if(options.appendThenFails)throw Error('Respuesta perdida tras guardar');},
    getDataRange:()=>({getValues:()=>[[],...state.records]})};
  const ctx={console:{error:()=>{}}, PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'config'})},
    CacheService:{getScriptCache:()=>({get:k=>state.cache[k],put:(k,v)=>{if(options.cacheFails)throw Error('Cache');state.cache[k]=v;}})},
    Utilities:{DigestAlgorithm:{SHA_256:'sha256'},computeDigest:(_,s)=>[...crypto.createHash('sha256').update(s).digest()],base64Decode:s=>[...Buffer.from(s,'base64')],formatDate:()=> '2026-10-22',newBlob:()=>({})},
    DriveApp:{getFolderById:()=>({createFile:()=>{assert.equal(state.locked,true);if(options.driveFails)throw Error('Drive no disponible');state.files++;return {getUrl:()=> 'https://drive.google.com/file/d/test/view',setTrashed:()=>{state.files--;state.trashed++;}};}})},
    LockService:{getScriptLock:()=>({waitLock:()=>{state.locked=true;},releaseLock:()=>{state.locked=false;}})},
    SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:()=>sheet}),flush:()=>{if(options.flushFails)throw Error('Respuesta perdida al confirmar');}},
    MailApp:{sendEmail:()=>{state.mail++;if(options.mailFails)throw Error('Cuota de correo');}},
    ContentService:{MimeType:{JSON:'json'},createTextOutput:s=>({setMimeType:()=>JSON.parse(s)})}};
  vm.createContext(ctx);vm.runInContext(fs.readFileSync('crm/google/bolsa-de-trabajo/Code.gs','utf8'),ctx);
  return {state,send:p=>ctx.doPost({postData:{contents:JSON.stringify(p)}}),ctx};
}
function run(){let passed=0;const test=(name,fn)=>{fn();passed++;console.log('OK '+name);};
test('Guarda una postulación y envía aviso',()=>{const b=backend();assert.equal(b.send(payload).ok,true);assert.equal(b.state.rows,1);assert.equal(b.state.files,1);assert.equal(b.state.records[0][16],'Enviado');assert.equal(b.state.locked,false);});
test('Falla de correo conserva éxito y marca Pendiente',()=>{const b=backend({mailFails:true});assert.equal(b.send(payload).ok,true);assert.equal(b.state.records[0][16],'Pendiente');});
test('Enlace CV sin fórmulas dependientes del idioma de Sheets',()=>{const b=backend();b.send(payload);assert.equal(b.state.records[0][12],'https://drive.google.com/file/d/test/view');});
test('Reintento después de falla de correo no duplica',()=>{const b=backend({mailFails:true});b.send(payload);assert.equal(b.send(payload).ok,true);assert.equal(b.state.rows,1);assert.equal(b.state.files,1);assert.equal(b.state.mail,1);});
test('Reintento con ID conserva una sola fila y CV',()=>{const b=backend();const p={...payload,solicitudId:'12345678-abcd-1234-abcd-123456789012'};b.send(p);b.send(p);assert.equal(b.state.rows,1);assert.equal(b.state.files,1);assert.equal(b.state.mail,1);});
test('Falla de Sheets retira CV a papelera',()=>{const b=backend({sheetFails:true});assert.equal(b.send(payload).ok,false);assert.equal(b.state.rows,0);assert.equal(b.state.files,0);assert.equal(b.state.trashed,1);assert.equal(b.state.locked,false);});
test('Falla de Drive no crea fila',()=>{const b=backend({driveFails:true});assert.equal(b.send(payload).ok,false);assert.equal(b.state.rows,0);assert.equal(b.state.files,0);});
for(const option of ['appendThenFails','flushFails'])test(option+': reconoce registro confirmado y conserva CV',()=>{const b=backend({[option]:true});assert.equal(b.send(payload).ok,true);assert.equal(b.state.rows,1);assert.equal(b.state.files,1);assert.equal(b.state.trashed,0);});
test('Falla de caché no transforma guardado en error',()=>{const b=backend({cacheFails:true});assert.equal(b.send(payload).ok,true);assert.equal(b.state.rows,1);});
test('Falla al marcar aviso no transforma guardado en error',()=>{const b=backend({statusFails:true});assert.equal(b.send(payload).ok,true);assert.equal(b.state.rows,1);});
test('Falla de vista administrativa no transforma guardado en error',()=>{const b=backend();b.ctx.actualizarRegistroPostulantes=()=>{throw Error('Vista no disponible');};assert.equal(b.send(payload).ok,true);assert.equal(b.state.rows,1);assert.equal(b.state.files,1);});
for(const [name,modify] of [['PDF falso',d=>d.cv={data:Buffer.from('texto').toString('base64')}],['CV demasiado grande',d=>d.cv={data:Buffer.alloc(5*1024*1024+1).toString('base64')}],['sin consentimiento',d=>d.consentimiento=false],['sin compartir',d=>d.compartir=false],['tiempo insuficiente',d=>d.elapsed=100],['correo inválido',d=>d.correo='incorrecto'],['teléfono inválido',d=>d.whatsapp='abc'],['año inválido',d=>d.egreso='1900'],['nivel inválido',d=>d.navasoft='Experto']])test('Rechaza '+name,()=>{const b=backend();const p=structuredClone(payload);modify(p);assert.equal(b.send(p).ok,false);assert.equal(b.state.files,0);assert.equal(b.state.rows,0);});
test('Límite por correo y reintentos no consumen cupo adicional',()=>{const b=backend();for(let i=0;i<3;i++){const p={...payload,solicitudId:'solicitud-prueba-000'+i};assert.equal(b.send(p).ok,true);assert.equal(b.send(p).ok,true);}assert.equal(b.send({...payload,solicitudId:'solicitud-prueba-0004'}).ok,false);assert.equal(b.state.rows,3);});
test('Textos de entrada no se convierten en fórmulas',()=>{const b=backend();b.send({...payload,nombres:'=SUM(1,1)'});assert.equal(b.state.records[0][3],"'=SUM(1,1)");});
console.log('Pruebas superadas: '+passed);return passed;
}
if(require.main===module)run();module.exports={backend,payload,run};
