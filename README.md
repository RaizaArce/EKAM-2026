# EKAM Perú — Sitio web corporativo

Sitio web de **EKAM PERU S.A.C.**, empresa de Chiclayo que implementa el ERP **NAVASOFT** y desarrolla software a medida para empresas del norte del Perú.

Es un sitio estático: HTML, CSS y JavaScript sin frameworks, sin dependencias npm y sin backend. El dominio previsto es `https://www.ekamperu.com`.

> **Estado:** rediseño en desarrollo. Antes de publicar, EKAM Perú debe validar cifras, textos y datos de contacto (ver [Pendientes](#pendientes)).

## Ejecutar en local

Solo se necesita Python 3 para servir los archivos:

```bash
python -m http.server 5500
```

Luego abrir <http://localhost:5500>.

Abrir los `.html` con doble clic también funciona, pero las rutas con carpeta (`sectores/grifos/`) solo resuelven bien desde un servidor.

## Páginas

| Ruta | Contenido |
|---|---|
| `index.html` | Portada: propuesta de valor, NAVASOFT, soluciones, IA, sectores, metodología, clientes y contacto |
| `soluciones.html` | Catálogo de soluciones NAVASOFT con detalle interactivo |
| `soluciones/<solución>/` | Una página por solución (6): ERP, facturación electrónica, contabilidad, hoteles y restaurantes, activos fijos, NavaMóvil |
| `sectores.html` | Soluciones por sector |
| `sectores/<sector>/` | Una página por sector (10): agroindustria, comercio, construcción, educación, grifos, hoteles y restaurantes, industria, salud, servicios, transporte |
| `nosotros.html` | Historia, misión, visión, servicios y datos formales de la empresa |
| `recursos/` | Guías: cómo elegir un ERP, facturación electrónica en Perú, PLE y libros electrónicos |
| `privacidad.html` | Política de privacidad |

Todas las páginas están registradas en `sitemap.xml`.

## Estructura

```
EKAM-2026/
├── index.html, soluciones.html, sectores.html, nosotros.html, privacidad.html
├── soluciones/ · sectores/ · recursos/    ← una carpeta con index.html por página
├── robots.txt, sitemap.xml
├── css/
│   ├── style.css         ← sistema de diseño y estilos compartidos (variables en :root)
│   ├── soluciones.css    ← hero, tarjetas y CTA de las páginas internas
│   ├── sectores.css
│   └── nosotros.css
├── js/
│   ├── main.js           ← menú, formulario, WhatsApp y asistente (portada y páginas internas)
│   ├── soluciones.js     ← detalle interactivo de soluciones.html
│   ├── sectores.js
│   └── chatbot.js        ← asistente en las páginas que no cargan main.js
├── assets/
│   ├── icons/            ← logotipos y favicons
│   ├── LogosClientes/    ← logos del carrusel de clientes (.webp)
│   ├── images/           ← asistente virtual, NavaMóvil e imagen para redes (og-ekam.jpg)
│   ├── screenshots/      ← capturas de NAVASOFT
│   └── videos/           ← video de demostración y su portada
├── tools/                ← capturas antes/después para revisar cambios de CSS (no se publica)
├── README.md
└── WEB-DOCUMENTACION.md  ← guía técnica y de contenido
```

## Configuración

Los datos de contacto y las integraciones se definen al inicio de `js/main.js`:

| Constante | Uso |
|---|---|
| `WHATSAPP_NUMBER` | Número que reciben el formulario, el botón flotante y el asistente |
| `CONTACT_EMAIL` | Correo alternativo del formulario |
| `LEAD_ENDPOINT` | Opcional. URL que recibe una copia de cada solicitud por POST (Formspree, webhook de n8n, etc.). Vacío: el formulario solo abre WhatsApp |

El número de WhatsApp también aparece escrito en los enlaces `wa.me` del HTML; al cambiarlo hay que reemplazarlo en todas las páginas.

## Cómo hacer cambios

- **Estilos:** reutilizar las variables de `css/style.css` (colores, tipografía, espaciados) en lugar de valores sueltos. Las páginas internas comparten el hero y el CTA de `soluciones.css`.
- **Caché:** los `.css` y `.js` se enlazan con `?v=<fecha>`. Al modificar uno, actualizar ese valor en las páginas que lo cargan para que los visitantes reciban la versión nueva.
- **Página nueva:** copiar el header y el footer de una página existente, añadirla a `sitemap.xml` y enlazarla desde el menú o el footer.
- **Imágenes:** usar `.webp` (o `.mp4` comprimido para video) y no subir los originales pesados al repositorio.
- **Revisión visual:** `tools/capturas.py` y `tools/comparar.py` generan y comparan capturas de todas las páginas antes y después de un cambio; las instrucciones están al inicio de cada archivo.

## Publicación

Subir al directorio público del servidor los `.html`, `robots.txt`, `sitemap.xml` y las carpetas `css/`, `js/`, `assets/`, `soluciones/`, `sectores/` y `recursos/`.

No subir `.git/`, `tools/` ni los archivos `.md`.

## Pendientes

- [ ] Validar con EKAM Perú las cifras de la portada (años de experiencia, empresas implementadas)
- [ ] Validar los textos de `nosotros.html` y la dirección de la oficina
- [ ] Añadir el código de Google Analytics 4 o Tag Manager (los eventos ya se envían)
- [ ] Definir si el formulario guardará las solicitudes (`LEAD_ENDPOINT`)
- [ ] Añadir el equipo a la página Nosotros

## Licencia

Uso interno — EKAM PERU S.A.C. Todos los derechos reservados.
