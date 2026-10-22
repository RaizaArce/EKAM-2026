# Bolsa de trabajo — conector de Google

La página `bolsa-de-trabajo/` no tiene backend propio: las convocatorias y las postulaciones pasan por un script de Google Apps Script (`Code.gs`) que usa una hoja de cálculo, dos carpetas de Drive y un formulario de Google. No está conectado al CRM.

La instalación actual de pruebas pertenece a la cuenta personal que administra la bolsa. Se conserva esa cuenta, su carpeta, formulario, hoja y correo receptor hasta que se acuerde el traslado a EKAM. No ejecutar una instalación nueva para aplicar estas correcciones.

```
Ingeniero ──(formulario "Publicar oferta EKAM")──► hoja "Ofertas" + afiche en Drive
Web ──GET──► doGet: ofertas publicadas y vigentes (JSON)
Postulante ──(formulario de la web)──POST──► doPost: CV en Drive + fila en "Postulantes" + correo de aviso
```

La página consulta las convocatorias automáticamente cada **30 segundos** mientras está visible, y también al volver a la pestaña o recuperar la conexión. Las altas y cierres aparecen sin recargar. Actualiza las tarjetas y las opciones de postulación conservando los datos escritos y el CV. Si se cierra la convocatoria elegida, avisa y deja seleccionada Bolsa general para que la persona pueda elegir otra. Ante un fallo temporal conserva las últimas ofertas recibidas y reintenta; no recarga toda la página. La demora depende del intervalo y del tiempo de respuesta de Google, no es una notificación instantánea.

## Qué hay en Google

| Elemento | Contenido |
|---|---|
| Hoja de cálculo, pestaña **Ofertas** | Una fila por convocatoria: puesto, área, ciudad, fecha de cierre, afiche y estado (`Publicada` / `Cerrada`) |
| Hoja de cálculo, pestaña **Postulantes** | Una fila por postulación, con la dirección del CV y las dos autorizaciones |
| Drive › Bolsa de trabajo EKAM › **Afiches** | Imágenes de las convocatorias. Son públicas (cualquiera con el enlace) porque la web las muestra |
| Drive › Bolsa de trabajo EKAM › **CV** | CV en PDF, privados. Nombre: `fecha_apellidos_nombres_convocatoria.pdf` |
| Formulario **PUBLICAR O CERRAR OFERTAS** | Lo que usa el ingeniero para publicar o cerrar ofertas. Está junto al registro en Drive |
| Propiedad del script `CORREO_AVISO` | Correo que recibe cada postulación (no está en el código) |

## Guía para el ingeniero

**Punto de entrada:** abrir en Drive **Registro de postulantes - EKAM** y elegir la primera pestaña, **Inicio**. Allí están los dos accesos: **PUBLICAR O CERRAR UNA OFERTA** y **VER POSTULANTES Y CV**. El enlace del formulario mantiene la misma dirección de siempre. También se puede abrir directamente el formulario **PUBLICAR O CERRAR OFERTAS** desde la misma carpeta de Drive.

**Administrar postulantes:** abrir en la carpeta de Drive el archivo **Registro de postulantes - EKAM**, pestaña **Registro de postulantes**. Cada fila reúne nombre completo, convocatoria, estado, enlace **Abrir CV**, contacto y formación. Los datos más recientes aparecen primero. Los filtros de los encabezados permiten buscar por convocatoria, área, nivel o estado.

Editar únicamente **Estado** (Nuevo, Revisado, Contactado, Descartado) y **Observaciones**. Son datos internos; cambiar el estado no envía mensajes ni toma decisiones automáticas. El seguimiento se conserva por ID aunque se reordene la lista o entre otro postulante. Los CV continúan privados.

Las columnas a la derecha contienen los demás datos solicitados; las dos primeras permanecen visibles al desplazarse. La pestaña original **Postulantes** sigue recibiendo los envíos. La vista de gestión se actualiza después de cada nueva recepción; si hay un problema de actualización, ejecutar `actualizarRegistroPostulantes()` desde Apps Script. No eliminar filas solo en la vista: la conservación de datos se gestiona en la hoja original y en Drive.

**Publicar una oferta**

1. En la pestaña **Inicio**, pulsar **PUBLICAR O CERRAR UNA OFERTA**. También se puede abrir el formulario del mismo nombre desde Drive.
2. Elegir *Publicar una oferta*, escribir el puesto, el área, la ciudad y la fecha de cierre, y subir el afiche (imagen JPG o PNG).
3. Enviar. La oferta aparece al recargar `ekamperu.com/bolsa-de-trabajo/`.

**Cerrar una oferta antes de tiempo:** elegir *Cerrar una oferta*, pulsar Siguiente, seleccionar la convocatoria en **Oferta que deseas cerrar** y enviar. No hay que escribir el puesto ni adjuntar un afiche. La lista identifica cada convocatoria por puesto, ciudad y código; solo cierra la seleccionada, incluso si hay dos con el mismo nombre. Se actualiza al publicar o cerrar ofertas y excluye las ya cerradas. El cierre retira la convocatoria de la web y conserva el historial, postulantes y CV. Si el formulario llevaba tiempo abierto, recargarlo para ver la lista actual.

Una oferta sin fecha de cierre permanece visible hasta cerrarla; con fecha, se oculta automáticamente después de ese día. El listado administrativo permite cerrar también las que vencieron pero aún tienen estado Publicada.

**Revisar postulantes:** cada postulación llega al correo con el botón *Descargar CV*, y aparece en el registro con el enlace *Abrir CV*. No cambiar el nombre de las pestañas ni el orden de las columnas de origen; usar los filtros de la vista de gestión.

## Protección contra spam y validaciones

`doPost` rechaza la postulación si:

- el campo oculto `website` viene lleno (responde "ok" sin guardar nada, para no dar pistas al bot);
- se envió menos de 3 segundos después de abrir la página;
- falta un campo obligatorio, el correo o el WhatsApp no tienen un formato válido, o el año de egreso está fuera de rango;
- falta alguna de las dos autorizaciones;
- el mismo correo ya envió 3 postulaciones en la última hora;
- el CV no comienza con la cabecera `%PDF-` o pesa más de 5 MB. Esta comprobación de formato no analiza todo el contenido del archivo.

El límite por correo usa la caché de Google durante una hora desde el último envío aceptado; es una protección básica y no una garantía contra envíos simultáneos.

Los textos se guardan con `seguro_()` para que no se interpreten como fórmulas en la hoja. Cada envío incorpora un `solicitudId`, conservado durante los reintentos de la página. El servidor busca ese ID en la hoja antes de crear otro CV. Las páginas antiguas sin ID usan una huella de los datos y el CV para evitar duplicados idénticos.

Las columnas originales se conservan; se añaden al final **ID solicitud** y **Estado aviso** automáticamente al recibir una postulación. No cambiar su orden. Si falla el correo después de guardar, la web confirma la recepción y el aviso queda **Pendiente**. Revisar esos registros en la hoja; no pedir al postulante que vuelva a enviarlos. Si falla la escritura y se comprueba que no existe el registro, el CV recién creado pasa a la papelera de Drive. Si la escritura sí se confirmó aunque se perdió su respuesta, se conserva el CV y se confirma la recepción.

Las imágenes se solicitan con `referrerpolicy="no-referrer"` para evitar el bloqueo de la respuesta de Google en el navegador. Esto no cambia los permisos: los afiches siguen siendo públicos y los CV privados.

## Instalación en una cuenta nueva

1. Crear una hoja de cálculo de Google y abrir *Extensiones › Apps Script*.
2. Pegar `Code.gs` y añadir `Registro.gs`, `Accesos.gs` y `Cierre.gs` al mismo proyecto (también se pueden concatenar en un único archivo). En *Configuración del proyecto*, activar "Mostrar el archivo de manifiesto" y pegar `appsscript.json`.
3. Ejecutar `configurar()` y autorizar los permisos. Crea las pestañas, las carpetas, el formulario y el activador `alEnviarFormulario`, y guarda el correo de la cuenta en `CORREO_AVISO`.
4. Abrir el formulario creado y añadir la pregunta **Afiche** de tipo *Subir archivo* (solo imágenes, 1 archivo). Apps Script no puede crear esa pregunta.
5. *Implementar › Nueva implementación › Aplicación web*: Ejecutar como **Yo**, Acceso **Cualquier persona**. Copiar la URL `/exec`.
6. Pegar esa URL en `BOLSA_ENDPOINT` al inicio de `js/bolsa.js`, subir la versión `?v=` en `bolsa-de-trabajo/index.html` y publicar.
7. Ejecutar `organizarPostulantes()` una vez: crea la vista administrativa, configura filtros, estados, enlaces y formato, y renombra el archivo para encontrarlo fácilmente en Drive. Conserva la hoja original, formulario y carpetas. Publicar una nueva versión con ambos archivos del script para que las nuevas postulaciones actualicen la vista.
8. Ejecutar `prepararAccesos()` una vez: crea **Inicio** con los dos enlaces, renombra el formulario y lo ubica en la misma carpeta del registro. Es una preparación administrativa; los enlaces funcionan sin cambiar la implementación pública del servicio.
9. En instalaciones existentes, ejecutar `prepararCierreOfertas()` para actualizar el formulario al cierre por selección. Conserva el mismo formulario, preguntas de publicación y activador. El activador `alEnviarFormulario` usa el código guardado del proyecto; no hace falta cambiar la URL pública para esta mejora. Si se edita directamente la pestaña Ofertas, ejecutar `actualizarOfertasParaCerrar()` para reflejar esos cambios en el desplegable.

Para cambiar el correo que recibe los avisos: *Configuración del proyecto › Propiedades del script › CORREO_AVISO*. No hace falta volver a implementar.

Si se edita `Code.gs`, hay que crear una **nueva versión** de la implementación existente (*Implementar › Gestionar implementaciones › editar*) para que la URL no cambie.

Para aplicar la corrección del 22/10/2026: reemplazar el contenido de `Code.gs` en el proyecto existente, guardar y actualizar esa implementación. No hace falta ejecutar `configurar()`, cambiar `CORREO_AVISO`, mover carpetas ni crear otro formulario. Publicar también `js/bolsa.js` y `bolsa-de-trabajo/index.html` (versión `20261022-2`). Probar un envío identificado como prueba en la cuenta actual y comprobar que hay una sola fila, un CV y un aviso.

La mejora de actualización automática del listado usa `js/bolsa.js?v=20261022-3`. Subir `js/bolsa.js` y `bolsa-de-trabajo/index.html` juntos al hosting. Quien ya tenga la versión anterior abierta necesita recargarla una sola vez para recibir el código nuevo; después las convocatorias se actualizan solas.

Pruebas locales: `node tools/pruebas_bolsa.cjs`, `node tools/pruebas_registro.cjs` y `node tools/pruebas_cierre.cjs`. Usan servicios Google simulados; no envían correo ni actualizan la implementación de Google. Las del registro comprueban el orden, enlaces, recuperación de CV antiguos y conservación de estados y observaciones al entrar otra postulación. Las de cierre verifican identificación exacta, nombres repetidos, reintentos, lista vacía y actualización al publicar.

## Conservación de datos

La política de privacidad (`privacidad.html#bolsa-de-trabajo`) indica que las postulaciones se conservan 12 meses desde su envío. Por ahora el borrado es manual: una vez al mes, eliminar las filas de *Postulantes* con más de 12 meses y sus CV de la carpeta *CV*. También se borran antes si el postulante lo pide a soporte@ekamperu.com.

Antes de borrar una fila, identificar su archivo con la dirección de la columna `CV`. La dirección se guarda directamente, sin fórmulas que dependan del idioma de Sheets. Eliminar el archivo y vaciar su papelera para completar la eliminación; revisar también las copias que se hayan compartido para selección. Asignar un responsable de esta revisión y registrar la fecha y cantidad eliminada sin copiar datos personales al registro.

## Entrega y comprobación

Las pruebas de aceptación y la reversión están en `DEPLOY-SERVIDOR.md`. La revisión del código local no acredita que la implementación de Google esté actualizada ni que el correo, los permisos de los CV o el envío desde el dominio publicado funcionen. Confirmar estos puntos en la cuenta de EKAM antes de dar la bolsa por operativa.
