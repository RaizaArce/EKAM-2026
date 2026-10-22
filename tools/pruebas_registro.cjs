// Pruebas de conservación de estados, notas, enlaces y correspondencia de filas.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function sheet(rows,formulas={}) {
  const s={rows:rows.map(r=>r.slice()),links:{},filter:null,getLastRow:()=>s.rows.length,getMaxRows:()=>1000,getMaxColumns:()=>26,
    setRowHeights:()=>{},getFilter:()=>s.filter};
  s.getRange=(row,col,count=1,width=1)=>({
    getValues:()=>Array.from({length:count},(_,i)=>Array.from({length:width},(_,j)=>(s.rows[row+i-1]||[])[col+j-1]??'')),
    getFormulas:()=>Array.from({length:count},(_,i)=>[formulas[row+i]||'']),
    getRichTextValues:()=>Array.from({length:count},(_,i)=>[{getLinkUrl:()=>s.links[row+i]||null}]),
    setValue:v=>{s.rows[row-1]||=[];s.rows[row-1][col-1]=v;},
    setValues(values){values.forEach((r,i)=>{s.rows[row+i-1]||=[];r.forEach((v,j)=>s.rows[row+i-1][col+j-1]=v);});return this;},
    setWrap(){return this;},setNumberFormat(){return this;},
    clearContent:()=>{for(let i=0;i<count;i++)s.rows[row+i-1]=Array(width).fill('');},
    setRichTextValues:values=>values.forEach((v,i)=>{s.links[row+i]=v[0].url;s.rows[row+i-1][col-1]=v[0].text;}),
    createFilter:()=>s.filter={getRange:()=>({getNumRows:()=>1000})}
  });return s;
}
let uuid=0;const ctx={Utilities:{getUuid:()=> 'legacy-id-'+(++uuid)},seguro_:s=>/^[=+\-@]/.test(String(s||''))?"'"+s:String(s||''),
  SpreadsheetApp:{newRichTextValue:()=>{const value={};return{setText(t){value.text=t;return this;},setLinkUrl(u){value.url=u;return this;},build:()=>value};}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('crm/google/bolsa-de-trabajo/Registro.gs','utf8'),ctx);
const original=[['Fecha'],[new Date('2026-10-21'),'Contador','Contabilidad','Ana','Perez','ana@example.test','999999999','Chiclayo','Instituto','Contabilidad',2020,'Básico','https://drive.google.com/file/d/cv-ana/view','Sí','Sí','id-ana','Enviado'],[new Date('2026-10-22'),'Sistemas','Sistemas','Luis','Diaz','luis@example.test','999999999','Lima','Universidad','Sistemas',2021,'Avanzado','#ERROR!','Sí','Sí','','Pendiente']];
const source=sheet(original,{3:'=HYPERLINK("https://drive.google.com/file/d/cv-luis/view","Ver CV")'}),view=sheet([]);
ctx.construirRegistro_(source,view);
assert.equal(view.rows[1][1],'Luis Diaz');assert.equal(view.rows[2][1],'Ana Perez');assert.equal(view.rows[1][3],'Nuevo');assert.equal(view.rows[1][4],'Abrir CV');assert.equal(view.links[2],'https://drive.google.com/file/d/cv-luis/view');assert.equal(source.rows[2][12],'https://drive.google.com/file/d/cv-luis/view');assert.equal(source.rows[2][15],'legacy-id-1');console.log('OK Orden por fecha, enlaces, estado inicial y recuperación de CV anterior');
view.rows[2][3]='Contactado';view.rows[2][15]='Llamar el lunes';source.rows.push([new Date('2026-10-23'),'Sistemas','Sistemas','Maria','Ruiz','maria@example.test','999999999','Piura','Universidad','Sistemas',2025,'Básico','https://drive.google.com/file/d/cv-maria/view','Sí','Sí','id-maria','Enviado']);
ctx.construirRegistro_(source,view);
assert.equal(view.rows[1][1],'Maria Ruiz');const ana=view.rows.find(r=>r[16]==='id-ana');assert.equal(ana[3],'Contactado');assert.equal(ana[15],'Llamar el lunes');assert.equal(view.rows.length,4);assert.equal(uuid,1);console.log('OK Postulación nueva conserva estado y observaciones vinculados al ID');
ctx.construirRegistro_(source,view);assert.equal(view.rows.length,4);assert.equal(view.rows.find(r=>r[16]==='id-ana')[3],'Contactado');console.log('OK Actualización repetida no duplica registros ni borra seguimiento');
