/**
 * Bolsa de trabajo EKAM Perú: conector entre Google (hoja, Drive, formulario) y la web.
 *
 * - El ingeniero publica ofertas con el formulario de Google "Publicar oferta EKAM" (sube el afiche).
 * - La web pide las ofertas vigentes a doGet y las muestra.
 * - La web envía cada postulación a doPost: el CV se guarda en Drive (privado), los datos en la hoja
 *   "Postulantes" y llega un correo de aviso.
 *
 * Instalación (una sola vez): ejecutar configurar() desde el editor de Apps Script, agregar en el
 * formulario la pregunta "Afiche" de tipo "Subir archivo" y publicar el script como aplicación web
 * (Ejecutar como: yo · Acceso: cualquier persona).
 * El correo de aviso se guarda en Propiedades del script → CORREO_AVISO (no va en el código).
 */

const HOJA_OFERTAS = 'Ofertas';
const HOJA_POSTULANTES = 'Postulantes';
const AREAS = ['Contabilidad', 'Sistemas', 'Administración', 'Otra'];
const NIVELES = ['Ninguno', 'Básico', 'Avanzado'];
const MAX_CV_BYTES = 5 * 1024 * 1024;
const ZONA = 'America/Lima';

const COLUMNAS_OFERTAS = ['ID', 'Publicada el', 'Puesto', 'Área', 'Ciudad', 'Cierre', 'Afiche (ID)', 'Afiche', 'Estado'];
const COLUMNAS_POSTULANTES = ['Fecha', 'Convocatoria', 'Área de interés', 'Nombres', 'Apellidos', 'Correo', 'WhatsApp', 'Ciudad',
  'Universidad o instituto', 'Especialidad', 'Año de egreso', 'NAVASOFT', 'CV', 'Autoriza uso', 'Autoriza compartir', 'ID solicitud', 'Estado aviso'];

/* ------------------------------------------------------------------ */
/* Instalación                                                         */
/* ------------------------------------------------------------------ */

function configurar() {
  const props = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(ZONA);

  prepararHoja_(ss, HOJA_OFERTAS, COLUMNAS_OFERTAS);
  prepararHoja_(ss, HOJA_POSTULANTES, COLUMNAS_POSTULANTES);

  const raiz = carpeta_(DriveApp.getRootFolder(), 'Bolsa de trabajo EKAM');
  props.setProperty('CARPETA_AFICHES', carpeta_(raiz, 'Afiches').getId());
  props.setProperty('CARPETA_CV', carpeta_(raiz, 'CV').getId());
  DriveApp.getFileById(ss.getId()).moveTo(raiz);

  let form;
  if (props.getProperty('FORM_ID')) {
    form = FormApp.openById(props.getProperty('FORM_ID'));
  } else {
    form = FormApp.create('Publicar oferta EKAM');
    form.setDescription('Publica o cierra una convocatoria de la bolsa de trabajo de ekamperu.com. La oferta aparece en la web en segundos.');
    form.addMultipleChoiceItem().setTitle('¿Qué quieres hacer?').setChoiceValues(['Publicar una oferta', 'Cerrar una oferta']).setRequired(true);
    form.addTextItem().setTitle('Puesto').setHelpText('Ej.: Contador público. Para cerrar una oferta, escribe el puesto igual que cuando la publicaste.').setRequired(true);
    form.addListItem().setTitle('Área').setChoiceValues(AREAS);
    form.addTextItem().setTitle('Ciudad').setHelpText('Ej.: Chiclayo');
    form.addDateItem().setTitle('Fecha de cierre').setHelpText('La oferta se oculta sola después de esta fecha.');
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    DriveApp.getFileById(form.getId()).moveTo(raiz);
    props.setProperty('FORM_ID', form.getId());
  }

  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === 'alEnviarFormulario'; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('alEnviarFormulario').forSpreadsheet(ss).onFormSubmit().create();

  if (!props.getProperty('CORREO_AVISO')) {
    props.setProperty('CORREO_AVISO', Session.getEffectiveUser().getEmail());
  }

  Logger.log('Listo. Formulario para publicar ofertas: ' + form.getPublishedUrl());
  Logger.log('Falta: agregar en el formulario la pregunta "Afiche" (Subir archivo, solo imágenes) y publicar como aplicación web.');
}

function prepararHoja_(ss, nombre, columnas) {
  const hoja = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
  if (hoja.getLastRow() === 0) {
    hoja.getRange(1, 1, 1, columnas.length).setValues([columnas])
      .setFontWeight('bold').setBackground('#123B63').setFontColor('#ffffff');
    hoja.setFrozenRows(1);
    hoja.getRange(1, 1, 1, columnas.length).createFilter();
    hoja.autoResizeColumns(1, columnas.length);
  }
  return hoja;
}

function carpeta_(padre, nombre) {
  const it = padre.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : padre.createFolder(nombre);
}

/* ------------------------------------------------------------------ */
/* Publicar o cerrar ofertas (formulario del ingeniero)                */
/* ------------------------------------------------------------------ */

function alEnviarFormulario(e) {
  const v = e.namedValues || {};
  const dato = function (k) { return ((v[k] || [''])[0] || '').toString().trim(); };
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_OFERTAS);
  const accion = dato('¿Qué quieres hacer?');
  const puesto = dato('Puesto');
  if (!puesto) return;

  if (accion.indexOf('Cerrar') === 0) {
    const datos = hoja.getDataRange().getValues();
    for (let i = 1; i < datos.length; i++) {
      if (normal_(datos[i][2]) === normal_(puesto) && datos[i][8] === 'Publicada') {
        hoja.getRange(i + 1, 9).setValue('Cerrada');
      }
    }
    return;
  }

  const idAfiche = idDeDrive_(dato('Afiche'));
  if (idAfiche) {
    const archivo = DriveApp.getFileById(idAfiche);
    archivo.moveTo(DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('CARPETA_AFICHES')));
    archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  }
  const cierre = fechaCierre_(dato('Fecha de cierre'));
  hoja.appendRow([
    Utilities.getUuid().slice(0, 8), new Date(), seguro_(puesto), dato('Área') || 'Otra', seguro_(dato('Ciudad')),
    cierre, idAfiche, idAfiche ? 'https://drive.google.com/file/d/' + idAfiche + '/view' : '', 'Publicada'
  ]);
}

// La fecha llega como texto según el idioma de la hoja: 23/10/2026 o 2026-10-23. Cierra al final de ese día (hora de Lima).
function fechaCierre_(texto) {
  let m = (texto || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return new Date(m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2) + 'T23:59:59-05:00');
  m = (texto || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(texto + 'T23:59:59-05:00');
  return '';
}

function idDeDrive_(url) {
  const m = (url || '').match(/[-\w]{25,}/);
  return m ? m[0] : '';
}

function normal_(s) {
  return (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/* ------------------------------------------------------------------ */
/* La web pide las ofertas vigentes                                    */
/* ------------------------------------------------------------------ */

function doGet() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_OFERTAS);
  const datos = hoja.getDataRange().getValues().slice(1);
  const ahora = new Date();
  const ofertas = datos
    .filter(function (f) { return f[8] === 'Publicada' && f[2] && (!f[5] || new Date(f[5]) >= ahora); })
    .map(function (f) {
      const id = f[6];
      return {
        id: f[0],
        puesto: f[2],
        area: f[3],
        ciudad: f[4],
        cierre: f[5] ? Utilities.formatDate(new Date(f[5]), ZONA, 'yyyy-MM-dd') : '',
        afiche: id ? 'https://lh3.googleusercontent.com/d/' + id + '=w1600' : '',
        aficheMini: id ? 'https://lh3.googleusercontent.com/d/' + id + '=w720' : ''
      };
    })
    .reverse();
  return json_({ ok: true, ofertas: ofertas, areas: AREAS });
}

/* ------------------------------------------------------------------ */
/* La web envía una postulación                                        */
/* ------------------------------------------------------------------ */

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Antispam: campo trampa, tiempo mínimo de llenado y límite por correo
    if (d.website) return json_({ ok: true });
    if (!(Number(d.elapsed) >= 3000)) return json_({ ok: false, error: 'Revisa el formulario e inténtalo otra vez.' });

    const texto = function (k, max) { return (d[k] || '').toString().trim().slice(0, max || 120); };
    const p = {
      convocatoria: texto('convocatoria'), area: texto('area', 40), nombres: texto('nombres'), apellidos: texto('apellidos'),
      correo: texto('correo').toLowerCase(), whatsapp: texto('whatsapp', 30), ciudad: texto('ciudad'),
      universidad: texto('universidad', 160), especialidad: texto('especialidad'), egreso: texto('egreso', 4),
      navasoft: texto('navasoft', 20)
    };
    const faltan = ['convocatoria', 'nombres', 'apellidos', 'correo', 'whatsapp', 'ciudad', 'universidad', 'especialidad', 'egreso', 'navasoft']
      .filter(function (k) { return !p[k]; });
    if (faltan.length) return json_({ ok: false, error: 'Completa todos los campos obligatorios.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.correo)) return json_({ ok: false, error: 'Revisa tu correo.' });
    if (!/^[0-9+()\s-]{6,20}$/.test(p.whatsapp)) return json_({ ok: false, error: 'Revisa tu número de WhatsApp.' });
    const anio = Number(p.egreso);
    if (!(anio >= 1960 && anio <= new Date().getFullYear() + 1)) return json_({ ok: false, error: 'Revisa el año de egreso.' });
    if (NIVELES.indexOf(p.navasoft) < 0) return json_({ ok: false, error: 'Elige tu nivel de NAVASOFT.' });
    if (AREAS.indexOf(p.area) < 0) p.area = 'Otra';
    if (d.consentimiento !== true || d.compartir !== true) return json_({ ok: false, error: 'Debes aceptar las dos autorizaciones.' });

    // CV: solo PDF real de hasta 5 MB
    const cv = d.cv || {};
    const bytes = Utilities.base64Decode((cv.data || '').toString());
    if (!bytes.length || bytes.length > MAX_CV_BYTES) return json_({ ok: false, error: 'El CV debe ser un PDF de máximo 5 MB.' });
    const cabecera = String.fromCharCode.apply(null, bytes.slice(0, 5).map(function (b) { return b & 0xff; }));
    if (cabecera !== '%PDF-') return json_({ ok: false, error: 'El CV debe ser un archivo PDF.' });

    const fecha = new Date();
    const nombreArchivo = [
      Utilities.formatDate(fecha, ZONA, 'yyyy-MM-dd'), limpio_(p.apellidos), limpio_(p.nombres), limpio_(p.convocatoria)
    ].join('_') + '.pdf';
    // El ID persiste en la hoja: también protege si se pierde la respuesta HTTP.
    // La huella conserva compatibilidad con páginas antiguas que aún no envían ID.
    const huella = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
      JSON.stringify(p) + ':' + cv.data).map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
    const solicitud = /^[a-zA-Z0-9-]{16,80}$/.test(d.solicitudId || '') ? d.solicitudId : huella;
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    let hoja, fila, enlace;
    try {
      hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_POSTULANTES);
      // Ampliar hojas existentes sin modificar las quince columnas originales.
      hoja.getRange(1, 16, 1, 2).setValues([['ID solicitud', 'Estado aviso']]);
      if (buscarSolicitud_(hoja, solicitud)) return json_({ ok: true });
      const cache = CacheService.getScriptCache();
      const claveLimite = 'envios_' + p.correo;
      const envios = Number(cache.get(claveLimite) || 0);
      if (envios >= 3) return json_({ ok: false, error: 'Ya recibimos tus postulaciones. Inténtalo más tarde.' });
      let archivo;
      try {
        archivo = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('CARPETA_CV'))
          .createFile(Utilities.newBlob(bytes, 'application/pdf', nombreArchivo));
        enlace = archivo.getUrl();
        hoja.appendRow([
          fecha, seguro_(p.convocatoria), p.area, seguro_(p.nombres), seguro_(p.apellidos), seguro_(p.correo), "'" + p.whatsapp,
          seguro_(p.ciudad), seguro_(p.universidad), seguro_(p.especialidad), anio, p.navasoft,
          enlace, 'Sí', 'Sí', solicitud, 'Pendiente'
        ]);
        SpreadsheetApp.flush();
      } catch (err) {
        // Un error puede llegar después de que Sheets haya confirmado la escritura.
        // Solo retirar el CV cuando comprobamos que no existe su registro.
        if (!buscarSolicitud_(hoja, solicitud)) {
          if (archivo) archivo.setTrashed(true);
          throw err;
        }
      }
      fila = buscarSolicitud_(hoja, solicitud);
      // Un fallo de caché posterior no convierte un registro guardado en un error.
      try { cache.put(claveLimite, String(envios + 1), 3600); } catch (err) { console.error(err); }
    } finally {
      lock.releaseLock();
    }
    // El correo es un aviso: la postulación ya fue recibida y no debe repetirse.
    try {
      avisar_(p, enlace, fecha);
      hoja.getRange(fila, 17).setValue('Enviado');
    } catch (err) {
      console.error('Postulación guardada; aviso pendiente: ' + solicitud + ' ' + err);
    }
    // La vista de gestión no debe bloquear una postulación ya recibida.
    try {
      if (typeof actualizarRegistroPostulantes === 'function') actualizarRegistroPostulantes();
    } catch (err) { console.error('Registro administrativo pendiente de actualizar: ' + err); }
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'No pudimos enviar tu postulación. Inténtalo en unos minutos.' });
  }
}

function buscarSolicitud_(hoja, solicitud) {
  const ultima = hoja.getLastRow();
  if (ultima < 2) return 0;
  const celda = hoja.getRange(2, 16, ultima - 1, 1).createTextFinder(solicitud).matchEntireCell(true).findNext();
  return celda ? celda.getRow() : 0;
}

function avisar_(p, enlace, fecha) {
  const destino = PropertiesService.getScriptProperties().getProperty('CORREO_AVISO');
  if (!destino) throw new Error('Falta configurar CORREO_AVISO');
  const fila = function (k, v) {
    return '<tr><td style="padding:6px 12px 6px 0;color:#64748B">' + k + '</td><td style="padding:6px 0;color:#152536;font-weight:600">' + html_(v) + '</td></tr>';
  };
  const cuerpo =
    '<div style="font-family:Arial,sans-serif;max-width:560px">' +
    '<h2 style="margin:0 0 4px;color:#123B63">Nuevo postulante: ' + html_(p.nombres + ' ' + p.apellidos) + '</h2>' +
    '<p style="margin:0 0 16px;color:#64748B">' + html_(p.convocatoria) + ' · ' + Utilities.formatDate(fecha, ZONA, "dd/MM/yyyy HH:mm") + '</p>' +
    '<table style="border-collapse:collapse;font-size:14px">' +
    fila('Área de interés', p.area) + fila('Ciudad', p.ciudad) + fila('Universidad o instituto', p.universidad) +
    fila('Especialidad', p.especialidad) + fila('Año de egreso', p.egreso) + fila('NAVASOFT', p.navasoft) +
    fila('Correo', p.correo) + fila('WhatsApp', p.whatsapp) +
    '</table>' +
    '<p style="margin:20px 0"><a href="' + enlace + '" style="background:#F59E0B;color:#071A2B;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Descargar CV</a></p>' +
    '<p style="color:#94A3B8;font-size:12px">El postulante autorizó el uso de sus datos para selección y que se comparta su CV con empresas aliadas.</p>' +
    '</div>';
  MailApp.sendEmail({
    to: destino,
    replyTo: p.correo,
    subject: 'Postulante: ' + p.nombres + ' ' + p.apellidos + ' · ' + p.convocatoria,
    htmlBody: cuerpo,
    name: 'Bolsa de trabajo EKAM'
  });
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Evita que un dato se interprete como fórmula en la hoja
function seguro_(s) {
  s = (s || '').toString();
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function html_(s) {
  return (s || '').toString().replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function limpio_(s) {
  return normal_(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'sin-dato';
}
