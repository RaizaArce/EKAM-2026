/** Ejecutar una vez para preparar los accesos del administrador. */
function prepararAccesos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const idFormulario = PropertiesService.getScriptProperties().getProperty('FORM_ID');
  if (!idFormulario) throw new Error('No se encontró el formulario existente');
  const formulario = FormApp.openById(idFormulario);
  formulario.setTitle('PUBLICAR O CERRAR OFERTAS');
  // El cierre solo necesita el puesto: no exigir otro afiche para retirar una oferta.
  const puesto = formulario.getItems().filter(function (item) { return item.getTitle() === 'Puesto'; })[0];
  const accion = formulario.getItems(FormApp.ItemType.MULTIPLE_CHOICE)
    .filter(function (item) { return item.getTitle() === '¿Qué quieres hacer?'; })[0].asMultipleChoiceItem();
  const seccionExistente = formulario.getItems(FormApp.ItemType.PAGE_BREAK)
    .filter(function (item) { return item.getTitle() === 'Datos de la oferta'; })[0];
  const seccion = seccionExistente ? seccionExistente.asPageBreakItem()
    : formulario.addPageBreakItem().setTitle('Datos de la oferta');
  if (seccion.getIndex() !== puesto.getIndex() + 1) formulario.moveItem(seccion.getIndex(), puesto.getIndex() + 1);
  accion.setChoices([
    accion.createChoice('Publicar una oferta', seccion),
    accion.createChoice('Cerrar una oferta', FormApp.PageNavigationType.SUBMIT)
  ]);
  const archivoFormulario = DriveApp.getFileById(idFormulario);
  archivoFormulario.setName('PUBLICAR O CERRAR OFERTAS');
  // Mantener el formulario junto al registro en la carpeta existente.
  const padres = DriveApp.getFileById(ss.getId()).getParents();
  if (padres.hasNext()) archivoFormulario.moveTo(padres.next());
  const registro = ss.getSheetByName(REGISTRO_NOMBRE);
  if (!registro) throw new Error('Primero preparar el registro de postulantes');
  const inicio = ss.getSheetByName('Inicio') || ss.insertSheet('Inicio');
  inicio.getRange('A1:F20').breakApart().clearContent();
  inicio.getRange('A1:F20').setFontFamily('Arial').setFontSize(11).setVerticalAlignment('middle');
  inicio.setHiddenGridlines(true);
  inicio.setColumnWidth(1, 28);
  inicio.setColumnWidths(2, 4, 180);
  inicio.setColumnWidth(6, 28);
  inicio.setRowHeights(1, 20, 28);
  inicio.getRange('B2:E2').merge().setValue('BOLSA DE TRABAJO · EKAM').setFontSize(21).setFontWeight('bold');
  inicio.getRange('B3:E3').merge().setValue('Elige qué necesitas hacer.');
  inicio.getRange('B5:E6').merge().setBackground('#e8edf3');
  inicio.getRange('B5').setRichTextValue(SpreadsheetApp.newRichTextValue()
    .setText('PUBLICAR O CERRAR UNA OFERTA').setLinkUrl(formulario.getPublishedUrl()).build()).setFontSize(15).setFontWeight('bold');
  inicio.getRange('B7:E8').merge().setValue('Abre el formulario, elige publicar o cerrar, completa los datos y envía.').setWrap(true);
  inicio.getRange('B10:E11').merge().setBackground('#e8edf3');
  inicio.getRange('B10').setRichTextValue(SpreadsheetApp.newRichTextValue()
    .setText('VER POSTULANTES Y CV').setLinkUrl(ss.getUrl() + '#gid=' + registro.getSheetId()).build()).setFontSize(15).setFontWeight('bold');
  inicio.getRange('B12:E13').merge().setValue('Todos los datos juntos. Filtra, cambia el estado, escribe observaciones y abre cada CV.').setWrap(true);
  inicio.getRange('B15:E16').merge().setValue('Uso interno. Ingresa con la cuenta administradora. Los CV permanecen privados.').setWrap(true).setFontColor('#526171');
  ss.setActiveSheet(inicio);
  ss.moveActiveSheet(1);
  inicio.setActiveSelection('B2');
  SpreadsheetApp.flush();
  Logger.log('Inicio: ' + ss.getUrl() + '#gid=' + inicio.getSheetId());
  Logger.log('Publicar o cerrar: ' + formulario.getPublishedUrl());
}
