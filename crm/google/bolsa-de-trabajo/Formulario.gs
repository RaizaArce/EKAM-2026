/** Formulario web administrable. Las claves no cambian al editar preguntas. */
const FORMULARIO_HOJA = 'Formulario web';
function camposBase_() {
  return [
    ['convocatoria', '¿A qué postulas?', 'convocatoria', '', true, true, ''],
    ['area', 'Área de interés', 'lista', AREAS.join(' | '), true, true, ''],
    ['nombres', 'Nombres', 'texto', '', true, true, ''],
    ['apellidos', 'Apellidos', 'texto', '', true, true, ''],
    ['correo', 'Correo', 'correo', '', true, true, ''],
    ['whatsapp', 'WhatsApp', 'teléfono', '', true, true, ''],
    ['ciudad', 'Ciudad', 'texto', '', true, true, ''],
    ['universidad', 'Universidad o instituto', 'texto', '', true, true, ''],
    ['especialidad', 'Especialidad', 'texto', '', true, true, ''],
    ['egreso', 'Año de egreso', 'número', '', true, true, ''],
    ['navasoft', 'Conocimiento de NAVASOFT', 'lista', NIVELES.join(' | '), true, true, '']
  ].map(function (r) { return { clave:r[0], pregunta:r[1], tipo:r[2], opciones:r[3] ? r[3].split(' | ') : [], obligatorio:r[4], visible:r[5], ayuda:r[6] }; });
}
function opcionesFormulario_(valor) {
  return String(valor || '').split('|').map(function (s) { return s.trim().slice(0, 120); }).filter(Boolean).filter(function (v,i,a) { return a.indexOf(v) === i; }).slice(0, 60);
}
function formularioWeb_() {
  const base = camposBase_();
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FORMULARIO_HOJA);
  if (!hoja || hoja.getLastRow() < 2) return base;
  const filas = hoja.getRange(2, 1, Math.min(hoja.getLastRow() - 1, 100), 7).getValues();
  const protegidas = ['convocatoria','nombres','apellidos','correo','whatsapp'];
  const tipos = ['texto','párrafo','lista','número','correo','teléfono'];
  const usadas = {};
  filas.forEach(function (r) {
    const clave = String(r[0] || '').trim();
    const pregunta = String(r[1] || '').trim().slice(0, 160);
    if (!/^[a-z][a-z0-9_]{1,39}$/.test(clave) || !pregunta || usadas[clave]) return;
    const existente = base.find(function (c) { return c.clave === clave; });
    if (!existente && (clave.indexOf('pregunta_') !== 0 || base.length >= 31)) return;
    usadas[clave] = true;
    const campo = existente || { clave:clave, tipo:'texto', opciones:[], obligatorio:false, visible:true };
    campo.pregunta = pregunta;
    campo.ayuda = String(r[6] || '').trim().slice(0, 300);
    campo.obligatorio = protegidas.indexOf(clave) >= 0 || r[4] === true || normal_(r[4]) === 'si';
    campo.visible = protegidas.indexOf(clave) >= 0 || !(r[5] === false || normal_(r[5]) === 'no');
    if (!existente && tipos.indexOf(r[2]) >= 0) campo.tipo = r[2];
    if (campo.tipo === 'lista') {
      const opciones = opcionesFormulario_(r[3]);
      if (opciones.length) campo.opciones = opciones;
      else if (!existente) campo.tipo = 'texto';
    }
    if (!campo.visible) campo.obligatorio = false;
    if (!existente) base.push(campo);
  });
  return base;
}
function prepararFormularioWeb() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName(FORMULARIO_HOJA) || ss.insertSheet(FORMULARIO_HOJA);
  if (hoja.getLastRow() === 0) {
    const filas = camposBase_().map(function (c) { return [c.clave,c.pregunta,c.tipo,c.opciones.join(' | '),c.obligatorio,c.visible,c.ayuda || '']; });
    for (let i=1;i<=20;i++) filas.push(['pregunta_'+i,'','texto','',false,true,'']);
    hoja.getRange(1,1,1,7).setValues([['Clave (no cambiar)','Pregunta','Tipo','Opciones (separar con |)','Obligatoria','Mostrar','Ayuda para el postulante']]);
    hoja.getRange(2,1,filas.length,7).setValues(filas);
    hoja.getRange(2,5,filas.length,2).insertCheckboxes();
    hoja.getRange(2,5,filas.length,2).setValues(filas.map(function(r){return [r[4],r[5]];}));
    hoja.getRange(13,3,20,1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['texto','párrafo','lista','número','correo','teléfono'],true).setAllowInvalid(false).build());
  }
  hoja.setFrozenRows(1);
  hoja.getRange(1,1,1,7).setBackground('#123B63').setFontColor('#ffffff').setFontWeight('bold').setWrap(true);
  hoja.setColumnWidths(1,7,160);
  hoja.setColumnWidth(2,260); hoja.setColumnWidth(4,320); hoja.setColumnWidth(7,320);
  hoja.getDataRange().setWrap(true).setVerticalAlignment('middle');
  hoja.getRange('A1').setNote('No cambies las claves. Para agregar preguntas, completa una fila pregunta_ que esté vacía. No reutilices una clave para otra pregunta si ya recibió respuestas.');
  hoja.getRange('B1').setNote('Edita los nombres aquí. Escribe una pregunta en una fila vacía para agregarla a la web. Borra su texto o desmarca Mostrar para retirarla. Las respuestas anteriores se conservan.');
  hoja.getRange('C1').setNote('En los campos existentes se conserva el tipo para mantener compatibilidad. Elige el tipo en las preguntas adicionales.');
  hoja.getRange('D1').setNote('Ejemplo: Contabilidad | Sistemas | Ventas. Se aplica a las listas, también Área de interés y NAVASOFT.');
  hoja.getRange('E1').setNote('Nombres, apellidos, correo, WhatsApp y convocatoria siempre son obligatorios y visibles. CV y autorizaciones permanecen protegidos.');
  const origen = ss.getSheetByName(HOJA_POSTULANTES);
  if (origen.getMaxColumns() < 18) origen.insertColumnsAfter(origen.getMaxColumns(),18-origen.getMaxColumns());
  origen.getRange(1,18).setValue('Respuestas adicionales');
  const registro = ss.getSheetByName('Registro de postulantes');
  if (registro) { actualizarRegistroPostulantes(); registro.setColumnWidth(19,360); registro.getRange(1,19).setBackground('#e8edf3').setFontWeight('bold').setWrap(true); }
  const inicio = ss.getSheetByName('Inicio');
  if (inicio) {
    inicio.getRange('B15:E16').breakApart().merge().setBackground('#e8edf3').setRichTextValue(SpreadsheetApp.newRichTextValue().setText('EDITAR EL FORMULARIO DE LA WEB').setLinkUrl(ss.getUrl()+'#gid='+hoja.getSheetId()).build()).setFontSize(15).setFontWeight('bold');
    inicio.getRange('B17:E19').breakApart().merge().setValue('Cambia preguntas y opciones, marca Obligatoria o Mostrar. Para añadir una pregunta, completa una fila vacía. Los cambios se guardan solos y aparecen en la web en unos 30 segundos.').setWrap(true).setFontWeight('normal').setFontSize(11);
  }
  SpreadsheetApp.flush();
  Logger.log('Formulario editable: '+ss.getUrl()+'#gid='+hoja.getSheetId());
}
function validarFormulario_(d, p, campos) {
  const extras = [];
  for (let i=0;i<campos.length;i++) {
    const c=campos[i];
    if (!c.visible) { if (Object.prototype.hasOwnProperty.call(p,c.clave)) p[c.clave]=''; continue; }
    const adicional=c.clave.indexOf('pregunta_')===0;
    const valor=String(adicional ? ((d.adicionales || {})[c.clave] || '') : (p[c.clave] || '')).trim().slice(0, c.tipo==='párrafo'?2000:160);
    if (c.obligatorio && !valor) return {error:'Completa: '+c.pregunta+'.'};
    if (valor && c.tipo==='lista' && c.opciones.indexOf(valor)<0) return {error:'Revisa las opciones de '+c.pregunta+'. La configuración pudo cambiar; actualiza el formulario.'};
    if (valor && c.tipo==='número' && !/^-?\d+(\.\d+)?$/.test(valor)) return {error:'Revisa: '+c.pregunta+'.'};
    if (valor && c.tipo==='correo' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) return {error:'Revisa: '+c.pregunta+'.'};
    if (adicional) extras.push({clave:c.clave,pregunta:c.pregunta,respuesta:valor});
  }
  return {adicionales:extras};
}
