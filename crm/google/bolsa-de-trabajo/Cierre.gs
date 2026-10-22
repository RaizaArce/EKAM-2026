/** Preparar una vez. La lista se actualiza al publicar o cerrar ofertas. */
function prepararCierreOfertas() {
  const form = FormApp.openById(PropertiesService.getScriptProperties().getProperty('FORM_ID'));
  const accion = form.getItems(FormApp.ItemType.MULTIPLE_CHOICE)
    .filter(function (item) { return item.getTitle() === '¿Qué quieres hacer?'; })[0].asMultipleChoiceItem();
  const puesto = form.getItems(FormApp.ItemType.TEXT)
    .filter(function (item) { return item.getTitle() === 'Puesto'; })[0].asTextItem();
  const publicarExistente = form.getItems(FormApp.ItemType.PAGE_BREAK)
    .filter(function (item) { return item.getTitle() === 'Datos de la oferta'; })[0];
  const publicar = publicarExistente ? publicarExistente.asPageBreakItem()
    : form.addPageBreakItem().setTitle('Datos de la oferta');
  // La primera pantalla solo pregunta la acción. El puesto escrito es exclusivo de publicación.
  if (publicar.getIndex() !== 1) form.moveItem(publicar.getIndex(), 1);
  if (puesto.getIndex() !== publicar.getIndex() + 1) form.moveItem(puesto.getIndex(), publicar.getIndex() + 1);
  puesto.setHelpText('Escribe el título del nuevo puesto que vas a publicar.');
  const cierreExistente = form.getItems(FormApp.ItemType.PAGE_BREAK)
    .filter(function (item) { return item.getTitle() === 'Cerrar una oferta'; })[0];
  const cerrar = cierreExistente ? cierreExistente.asPageBreakItem()
    : form.addPageBreakItem().setTitle('Cerrar una oferta');
  cerrar.setHelpText('Selecciona la convocatoria que deseas retirar de la web. Los postulantes y sus CV se conservan.');
  // Esta navegación corresponde al final de la sección anterior (publicación).
  cerrar.setGoToPage(FormApp.PageNavigationType.SUBMIT);
  publicar.setGoToPage(FormApp.PageNavigationType.CONTINUE);
  const listaExistente = form.getItems(FormApp.ItemType.LIST)
    .filter(function (item) { return item.getTitle() === 'Oferta que deseas cerrar'; })[0];
  const lista = listaExistente ? listaExistente.asListItem() : form.addListItem().setTitle('Oferta que deseas cerrar');
  lista.setRequired(true).setHelpText('Elige una opción. No necesitas escribir el puesto ni adjuntar un afiche.');
  accion.setChoices([
    accion.createChoice('Publicar una oferta', publicar),
    accion.createChoice('Cerrar una oferta', cerrar)
  ]);
  actualizarOfertasParaCerrar();
  Logger.log('Cierre por selección listo: ' + form.getPublishedUrl());
}

function actualizarOfertasParaCerrar() {
  const form = FormApp.openById(PropertiesService.getScriptProperties().getProperty('FORM_ID'));
  const item = form.getItems(FormApp.ItemType.LIST)
    .filter(function (pregunta) { return pregunta.getTitle() === 'Oferta que deseas cerrar'; })[0];
  if (!item) return;
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_OFERTAS);
  const datos = hoja.getDataRange().getValues();
  const opciones = [];
  for (let i = 1; i < datos.length; i++) {
    const fila = datos[i];
    if (fila[8] !== 'Publicada' || !fila[2]) continue;
    if (!fila[0]) {
      fila[0] = Utilities.getUuid().slice(0, 8);
      hoja.getRange(i + 1, 1).setValue(fila[0]);
    }
    opciones.push(String(fila[2]) + (fila[4] ? ' · ' + fila[4] : '') + ' [ID: ' + fila[0] + ']');
  }
  item.asListItem().setChoiceValues(opciones.length ? opciones.reverse() : ['No hay ofertas abiertas']);
}
