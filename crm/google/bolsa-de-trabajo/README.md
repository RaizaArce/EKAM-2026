# Bolsa de trabajo — conector de Google

La página `bolsa-de-trabajo/` no tiene backend propio: las convocatorias y las postulaciones pasan por un script de Google Apps Script (`Code.gs`) que usa una hoja de cálculo, dos carpetas de Drive y un formulario de Google. No está conectado al CRM.

```
Ingeniero ──(formulario "Publicar oferta EKAM")──► hoja "Ofertas" + afiche en Drive
Web ──GET──► doGet: ofertas publicadas y vigentes (JSON)
Postulante ──(formulario de la web)──POST──► doPost: CV en Drive + fila en "Postulantes" + correo de aviso
```

## Qué hay en Google

| Elemento | Contenido |
|---|---|
| Hoja de cálculo, pestaña **Ofertas** | Una fila por convocatoria: puesto, área, ciudad, fecha de cierre, afiche y estado (`Publicada` / `Cerrada`) |
| Hoja de cálculo, pestaña **Postulantes** | Una fila por postulación, con el enlace "Ver CV" y las dos autorizaciones |
| Drive › Bolsa de trabajo EKAM › **Afiches** | Imágenes de las convocatorias. Son públicas (cualquiera con el enlace) porque la web las muestra |
| Drive › Bolsa de trabajo EKAM › **CV** | CV en PDF, privados. Nombre: `fecha_apellidos_nombres_convocatoria.pdf` |
| Formulario **Publicar oferta EKAM** | Lo único que usa el ingeniero para publicar o cerrar ofertas |
| Propiedad del script `CORREO_AVISO` | Correo que recibe cada postulación (no está en el código) |

## Guía para el ingeniero

**Publicar una oferta**

1. Abrir el formulario "Publicar oferta EKAM".
2. Elegir *Publicar una oferta*, escribir el puesto, el área, la ciudad y la fecha de cierre, y subir el afiche (imagen JPG o PNG).
3. Enviar. La oferta aparece al recargar `ekamperu.com/bolsa-de-trabajo/`.

**Cerrar una oferta antes de tiempo:** en el mismo formulario elegir *Cerrar una oferta* y escribir el puesto igual que al publicarlo. Esto cierra todas las ofertas publicadas con ese puesto (sin distinguir ciudad; se ignoran mayúsculas y tildes). Si no se cierra, la oferta se oculta sola el día siguiente a su fecha de cierre. Sin fecha de cierre, permanece visible hasta cerrarla manualmente.

**Revisar postulantes:** cada postulación llega al correo con el botón *Descargar CV*, y queda en la pestaña *Postulantes* de la hoja. Se puede filtrar u ordenar la hoja, pero no cambiar el nombre de las pestañas ni el orden de las columnas.

## Protección contra spam y validaciones

`doPost` rechaza la postulación si:

- el campo oculto `website` viene lleno (responde "ok" sin guardar nada, para no dar pistas al bot);
- se envió menos de 3 segundos después de abrir la página;
- falta un campo obligatorio, el correo o el WhatsApp no tienen un formato válido, o el año de egreso está fuera de rango;
- falta alguna de las dos autorizaciones;
- el mismo correo ya envió 3 postulaciones en la última hora;
- el CV no comienza con la cabecera `%PDF-` o pesa más de 5 MB. Esta comprobación de formato no analiza todo el contenido del archivo.

El límite por correo usa la caché de Google durante una hora desde el último envío aceptado; es una protección básica y no una garantía contra envíos simultáneos.

Los textos se guardan con `seguro_()` para que no se interpreten como fórmulas en la hoja.

## Instalación en una cuenta nueva

1. Crear una hoja de cálculo de Google y abrir *Extensiones › Apps Script*.
2. Pegar `Code.gs`. En *Configuración del proyecto*, activar "Mostrar el archivo de manifiesto" y pegar `appsscript.json`.
3. Ejecutar `configurar()` y autorizar los permisos. Crea las pestañas, las carpetas, el formulario y el activador `alEnviarFormulario`, y guarda el correo de la cuenta en `CORREO_AVISO`.
4. Abrir el formulario creado y añadir la pregunta **Afiche** de tipo *Subir archivo* (solo imágenes, 1 archivo). Apps Script no puede crear esa pregunta.
5. *Implementar › Nueva implementación › Aplicación web*: Ejecutar como **Yo**, Acceso **Cualquier persona**. Copiar la URL `/exec`.
6. Pegar esa URL en `BOLSA_ENDPOINT` al inicio de `js/bolsa.js`, subir la versión `?v=` en `bolsa-de-trabajo/index.html` y publicar.

Para cambiar el correo que recibe los avisos: *Configuración del proyecto › Propiedades del script › CORREO_AVISO*. No hace falta volver a implementar.

Si se edita `Code.gs`, hay que crear una **nueva versión** de la implementación existente (*Implementar › Gestionar implementaciones › editar*) para que la URL no cambie.

## Conservación de datos

La política de privacidad (`privacidad.html#bolsa-de-trabajo`) indica que las postulaciones se conservan 12 meses desde su envío. Por ahora el borrado es manual: una vez al mes, eliminar las filas de *Postulantes* con más de 12 meses y sus CV de la carpeta *CV*. También se borran antes si el postulante lo pide a soporte@ekamperu.com.

Antes de borrar una fila, identificar su CV con el enlace `Ver CV`. Eliminar el archivo y vaciar su papelera para completar la eliminación; revisar también las copias que se hayan compartido para selección. Asignar un responsable de esta revisión y registrar la fecha y cantidad eliminada sin copiar datos personales al registro.

## Entrega y comprobación

Las pruebas de aceptación y la reversión están en `DEPLOY-SERVIDOR.md`. La revisión del código local no acredita que la implementación de Google esté actualizada ni que el correo, los permisos de los CV o el envío desde el dominio publicado funcionen. Confirmar estos puntos en la cuenta de EKAM antes de dar la bolsa por operativa.
