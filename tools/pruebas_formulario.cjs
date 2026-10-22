const {backend,payload}=require('./pruebas_bolsa.cjs');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let passed=0;
function test(name,fn){fn();passed++;console.log('OK '+name);}
function setup(rows=[]){
 const b=backend();const ss=b.ctx.SpreadsheetApp.getActiveSpreadsheet();
 b.ctx.SpreadsheetApp.getActiveSpreadsheet=()=>({getSheetByName:name=>name==='Formulario web'?{getLastRow:()=>rows.length+1,getRange:()=>({getValues:()=>rows})}:ss.getSheetByName(name)});
 vm.runInContext(fs.readFileSync('crm/google/bolsa-de-trabajo/Formulario.gs','utf8'),b.ctx);return b;
}
test('Sin configuración conserva envío actual',()=>{const b=setup();assert.equal(b.send(payload).ok,true);assert.equal(b.state.rows,1);});
test('Área nueva se conserva en el registro',()=>{const b=setup([['area','Área','lista','Sistemas | Ventas',true,true,'']]);assert.equal(b.send({...payload,area:'Ventas'}).ok,true);assert.equal(b.state.records[0][2],'Ventas');});
test('Campo de formación opcional y oculto no bloquea',()=>{const b=setup([['universidad','Institución','texto','',true,false,''],['egreso','Año','número','',false,false,'']]);assert.equal(b.send({...payload,universidad:'',egreso:''}).ok,true);assert.equal(b.state.records[0][10],'');});
test('No permite ocultar ni quitar obligación de correo y nombre',()=>{const b=setup([['correo','Contacto','correo','',false,false,''],['nombres','Nombre','texto','',false,false,'']]);assert.equal(b.send({...payload,correo:''}).ok,false);assert.equal(b.send({...payload,nombres:''}).ok,false);});
test('Pregunta obligatoria se valida antes de crear CV',()=>{const b=setup([['pregunta_1','Disponibilidad','lista','Inmediata | Un mes',true,true,'']]);assert.equal(b.send(payload).ok,false);assert.equal(b.state.files,0);assert.equal(b.send({...payload,adicionales:{pregunta_1:'Otra'}}).ok,false);});
test('Pregunta adicional se guarda con su título y no duplica al reintentar',()=>{const b=setup([['pregunta_1','Disponibilidad','lista','Inmediata | Un mes',true,true,'']]);const p={...payload,adicionales:{pregunta_1:'Inmediata'}};assert.equal(b.send(p).ok,true);assert.equal(b.send(p).ok,true);assert.equal(b.state.rows,1);assert.deepEqual(JSON.parse(b.state.records[0][17]),[{clave:'pregunta_1',pregunta:'Disponibilidad',respuesta:'Inmediata'}]);});
test('Campos desconocidos o retirados no se guardan',()=>{const b=setup([['pregunta_1','Retirada','texto','',true,false,'']]);assert.equal(b.send({...payload,adicionales:{pregunta_1:'retirada',inventada:'dato'}}).ok,true);assert.equal(b.state.records[0][17],'[]');});
test('Correo, PDF y autorizaciones siguen protegidos con configuración',()=>{for(const p of [{...payload,correo:'abc'},{...payload,consentimiento:false},{...payload,cv:{data:'YWJj'}}]){const b=setup();assert.equal(b.send(p).ok,false);assert.equal(b.state.files,0);}});
test('Número y correo adicionales rechazan formato inválido',()=>{const b=setup([['pregunta_1','Número','número','',false,true,''],['pregunta_2','Otro correo','correo','',false,true,'']]);assert.equal(b.send({...payload,adicionales:{pregunta_1:'abc'}}).ok,false);assert.equal(b.send({...payload,adicionales:{pregunta_2:'abc'}}).ok,false);});
test('Error de correo mantiene respuestas guardadas y éxito',()=>{const b=setup([['pregunta_1','Comentario','texto','',false,true,'']]);b.ctx.MailApp.sendEmail=()=>{throw Error('Correo');};assert.equal(b.send({...payload,adicionales:{pregunta_1:'Prueba'}}).ok,true);assert.equal(b.state.records[0][16],'Pendiente');assert.match(b.state.records[0][17],/Prueba/);});
test('Reintento de página anterior conserva la misma huella sin ID',()=>{const b=backend();assert.equal(b.send(payload).ok,true);vm.runInContext(fs.readFileSync('crm/google/bolsa-de-trabajo/Formulario.gs','utf8'),b.ctx);b.ctx.formularioWeb_=()=>b.ctx.camposBase_();assert.equal(b.send(payload).ok,true);assert.equal(b.state.rows,1);assert.equal(b.state.files,1);});
console.log('Pruebas de configuración superadas: '+passed);
