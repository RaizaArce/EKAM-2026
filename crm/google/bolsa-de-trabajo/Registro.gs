/** Vista administrativa. Ejecutar organizarPostulantes() una vez. */
const REGISTRO_NOMBRE = 'Registro de postulantes';
const REGISTRO_ESTADOS = ['Nuevo', 'Revisado', 'Contactado', 'Descartado'];
const REGISTRO_COLUMNAS = ['Fecha', 'Postulante', 'Convocatoria', 'Estado', 'CV', 'WhatsApp', 'Correo', 'Ciudad',
  'Área de interés', 'NAVASOFT', 'Universidad o instituto', 'Especialidad', 'Año de egreso',
  'Autoriza uso', 'Autoriza compartir', 'Observaciones', 'ID solicitud', 'Estado aviso'];

function organizarPostulantes() {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const origen = ss.getSheetByName(HOJA_POSTULANTES);
    if (!origen) throw new Error('No existe la hoja Postulantes');
    const registro = ss.getSheetByName(REGISTRO_NOMBRE) || ss.insertSheet(REGISTRO_NOMBRE);
    construirRegistro_(origen, registro);
    const alto = registro.getMaxRows();
    registro.getRange(1, 1, alto, 18).setFontFamily('Arial').setFontSize(10).setVerticalAlignment('middle');
    registro.getRange(1, 1, 1, 18).setBackground('#e8edf3').setFontColor('#172b40').setFontWeight('bold').setWrap(true);
    registro.setRowHeight(1, 44);
    registro.setFrozenRows(1);
    registro.setFrozenColumns(2);
    registro.setHiddenGridlines(false);
    const anchos = [145, 240, 220, 125, 105, 135, 240, 145, 150, 115, 240, 200, 100, 115, 125, 280, 200, 125];
    anchos.forEach(function (ancho, i) { registro.setColumnWidth(i + 1, ancho); });
    registro.getRange(1, 1).setNote('Cada fila corresponde a una postulación. Filtra por convocatoria o estado. Edita solo Estado y Observaciones; los demás datos se actualizan desde la web.');
    registro.getRange(1, 4).setNote('Elige Nuevo, Revisado, Contactado o Descartado. Este estado es interno y no envía mensajes al postulante.');
    registro.getRange(1, 5).setNote('Abre el CV privado en Drive. Se requiere acceso autorizado a la cuenta administradora.');
    registro.getRange(1, 16).setNote('Notas internas del proceso. Se conservan al actualizar la lista.');
    const rangoEstado = registro.getRange(2, 4, alto - 1, 1);
    rangoEstado.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(REGISTRO_ESTADOS, true).setAllowInvalid(false).build());
    const colores = ['#e8f0fe', '#fff3cd', '#e6f4ea', '#eeeeee'];
    registro.setConditionalFormatRules(REGISTRO_ESTADOS.map(function (estado, i) {
      return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(estado).setBackground(colores[i]).setRanges([rangoEstado]).build();
    }));
    registro.hideColumns(17, 2);
    ss.rename('Registro de postulantes - EKAM');
    ss.setActiveSheet(registro);
    ss.moveActiveSheet(1);
    registro.setActiveSelection('A1');
    SpreadsheetApp.flush();
    Logger.log('Registro listo: ' + ss.getUrl() + '#gid=' + registro.getSheetId());
  } finally {
    lock.releaseLock();
  }
}

function actualizarRegistroPostulantes() {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const registro = ss.getSheetByName(REGISTRO_NOMBRE);
    if (registro) construirRegistro_(ss.getSheetByName(HOJA_POSTULANTES), registro);
  } finally {
    lock.releaseLock();
  }
}

function construirRegistro_(origen, registro) {
  const anteriores = registro.getLastRow() > 1
    ? registro.getRange(2, 1, registro.getLastRow() - 1, 18).getValues() : [];
  const seguimiento = {};
  anteriores.forEach(function (fila) {
    if (fila[16]) seguimiento[fila[16]] = { estado: fila[3], notas: fila[15] };
  });
  const datos = origen.getLastRow() > 1 ? origen.getRange(2, 1, origen.getLastRow() - 1, 17).getValues() : [];
  const formulas = datos.length ? origen.getRange(2, 13, datos.length, 1).getFormulas() : [];
  const enlaces = datos.length ? origen.getRange(2, 13, datos.length, 1).getRichTextValues() : [];
  const filas = [];
  datos.forEach(function (fila, i) {
    if (!fila[3] && !fila[4] && !fila[5]) return;
    if (!fila[15]) {
      fila[15] = Utilities.getUuid();
      origen.getRange(i + 2, 16).setValue(fila[15]);
    }
    let cv = (fila[12] || '').toString();
    if (!/^https:\/\/drive\.google\.com\//.test(cv)) {
      const formula = (formulas[i] || [''])[0];
      const match = formula.match(/https:\/\/drive\.google\.com\/[^"\s]+/);
      cv = match ? match[0] : enlaces[i][0] ? enlaces[i][0].getLinkUrl() || '' : '';
      if (cv) origen.getRange(i + 2, 13).setValue(cv);
    }
    const previo = seguimiento[fila[15]] || {};
    const estado = REGISTRO_ESTADOS.indexOf(previo.estado) >= 0 ? previo.estado : 'Nuevo';
    filas.push([fila[0], seguro_((fila[3] + ' ' + fila[4]).trim()), seguro_(fila[1]), estado, cv,
      "'" + (fila[6] || ''), seguro_(fila[5]), seguro_(fila[7]), seguro_(fila[2]), seguro_(fila[11]),
      seguro_(fila[8]), seguro_(fila[9]), fila[10], fila[13], fila[14], seguro_(previo.notas || ''), fila[15], fila[16]]);
  });
  filas.sort(function (a, b) { return new Date(b[0]) - new Date(a[0]); });
  // Expandir antes de escribir; no recortar filas manualmente.
  if (registro.getMaxColumns() < 18) registro.insertColumnsAfter(registro.getMaxColumns(), 18 - registro.getMaxColumns());
  if (registro.getMaxRows() < filas.length + 2) registro.insertRowsAfter(registro.getMaxRows(), filas.length + 2 - registro.getMaxRows());
  registro.getRange(1, 1, 1, 18).setValues([REGISTRO_COLUMNAS]);
  if (filas.length) {
    registro.getRange(2, 1, filas.length, 18).setValues(filas).setWrap(true);
    registro.getRange(2, 1, filas.length, 1).setNumberFormat('dd/MM/yyyy HH:mm');
    registro.setRowHeights(2, filas.length, 52);
    registro.getRange(2, 5, filas.length, 1).setRichTextValues(filas.map(function (fila) {
      const texto = SpreadsheetApp.newRichTextValue().setText(fila[4] ? 'Abrir CV' : 'Sin enlace');
      if (fila[4]) texto.setLinkUrl(fila[4]);
      return [texto.build()];
    }));
  }
  if (anteriores.length > filas.length) registro.getRange(filas.length + 2, 1, anteriores.length - filas.length, 18).clearContent();
  // Ampliar el filtro para incluir también los próximos registros.
  let filtro = registro.getFilter();
  const criterios = [];
  if (filtro && filtro.getRange().getNumRows() < registro.getMaxRows()) {
    for (let columna = 1; columna <= 18; columna++) criterios.push(filtro.getColumnFilterCriteria(columna));
    filtro.remove();
    filtro = null;
  }
  if (!filtro) {
    filtro = registro.getRange(1, 1, registro.getMaxRows(), 18).createFilter();
    criterios.forEach(function (criterio, i) { if (criterio) filtro.setColumnFilterCriteria(i + 1, criterio); });
  }
}
