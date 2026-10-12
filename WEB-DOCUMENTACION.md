# EKAM Perú — Documentación técnica del sitio

Guía para quien mantenga el sitio: cómo está organizado, qué hace cada archivo y cómo hacer los cambios más comunes. El resumen y la puesta en marcha están en `README.md`.

## 1. Resumen

- Sitio corporativo estático de **EKAM PERU S.A.C.** (Chiclayo), partner de **NAVASOFT ERP**.
- HTML, CSS y JavaScript sin frameworks, sin proceso de compilación y sin backend.
- 25 páginas: portada, catálogo de soluciones, sectores, nosotros, recursos, privacidad y una página por solución, sector y guía.
- Contacto por WhatsApp: el formulario, el botón flotante y el asistente virtual preparan un mensaje para `wa.me`.
- Dominio previsto: `https://www.ekamperu.com` (canónicas, sitemap y datos estructurados ya lo usan).

## 2. Ejecutar y verificar

```bash
python -m http.server 5500
```

Abrir <http://localhost:5500>.

Antes de subir cualquier cambio:

```bash
python tools/verificar_sitio.py
```

Revisa enlaces y recursos locales, anclas, `sitemap.xml`, JSON-LD y que cada `.css`/`.js` se enlace con la misma versión `?v=` en todas las páginas. La misma verificación corre en GitHub Actions en cada pull request (`.github/workflows/verificar-sitio.yml`).

Para cambios de estilo, `tools/capturas.py` y `tools/comparar.py` generan capturas de todas las páginas (1366 px y 375 px) antes y después del cambio y señalan las diferencias. Requieren Google Chrome, Pillow y numpy; las instrucciones están al inicio de cada archivo.

## 3. Mapa del sitio

| Ruta | Página | CSS propio | JS |
|---|---|---|---|
| `index.html` | Portada | — | `main.js` |
| `soluciones.html` | Catálogo con detalle interactivo (`?solucion=erp`) | `soluciones.css` | `soluciones.js`, `chatbot.js` |
| `soluciones/<slug>/` | 6 páginas: `erp-navasoft`, `facturacion-electronica`, `contabilidad`, `hoteles-restaurantes`, `activos-fijos`, `navamovil` | `soluciones.css` | `main.js` |
| `sectores.html` | Sectores con pestañas | `sectores.css` | `sectores.js`, `chatbot.js` |
| `sectores/<slug>/` | 10 páginas: `agroindustria`, `comercio`, `construccion`, `educacion`, `grifos`, `hoteles-restaurantes`, `industria`, `salud`, `servicios`, `transporte` | `soluciones.css` | `main.js` |
| `nosotros.html` | Historia, misión, visión, servicios y datos formales | `soluciones.css`, `nosotros.css` | `main.js` |
| `recursos/` y `recursos/<slug>/` | Índice y 3 guías: `como-elegir-un-erp`, `facturacion-electronica-peru`, `ple-libros-electronicos` | `soluciones.css` | `main.js` |
| `privacidad.html` | Política de privacidad | — | `main.js` |

Todas cargan `css/style.css`. Las páginas dentro de carpetas usan rutas relativas (`../../css/style.css`).

### Secciones de la portada

En orden de aparición; el `id` es el ancla que usan el menú y los enlaces internos.

| `id` | Contenido |
|---|---|
| `inicio` | Hero: titular, llamados a la acción, cifras y escena ilustrada |
| — | Propuesta de valor (`.commercial-summary`) |
| `navasoft` | NAVASOFT como plataforma |
| `soluciones` | Módulos y soluciones |
| `pantallas` | Capturas de NAVASOFT con pestañas, visor ampliado y video de demostración |
| `ia` | Inteligencia artificial aplicada a la gestión |
| `sectores` | Sectores atendidos |
| `a-medida` | Desarrollo a medida |
| `implementacion` | Metodología de implementación |
| `empresa` | Nosotros: socio tecnológico, cifras, relación EKAM → NAVASOFT y botón a `nosotros.html` |
| `clientes` | Carrusel de logos (dentro de `empresa`) |
| `problemas` | Problemas que se resuelven y cierre |
| `contacto` | Formulario de contacto |

Fuera del `<main>`: footer, visor de imágenes, botón flotante de WhatsApp y asistente virtual.

## 4. Estructura de archivos

```
EKAM-2026/
├── *.html                     ← portada y páginas de primer nivel
├── soluciones/ · sectores/ · recursos/   ← una carpeta con index.html por página
├── robots.txt · sitemap.xml
├── css/
│   ├── style.css              ← variables, base, componentes compartidos y portada
│   ├── soluciones.css         ← hero, tarjetas, detalle y CTA de las páginas internas
│   ├── sectores.css           ← solo sectores.html
│   └── nosotros.css           ← solo nosotros.html
├── js/
│   ├── main.js                ← comportamiento de la portada y páginas internas
│   ├── soluciones.js          ← datos y detalle de soluciones.html
│   ├── sectores.js            ← datos y pestañas de sectores.html
│   └── chatbot.js             ← asistente para las páginas que no cargan main.js
├── assets/
│   ├── icons/                 ← logos de EKAM y NAVASOFT, favicons
│   ├── LogosClientes/         ← logos del carrusel (.webp)
│   ├── images/                ← asistente virtual, NavaMóvil, og-ekam.jpg
│   ├── screenshots/           ← capturas de NAVASOFT (.jpeg)
│   └── videos/                ← demostracion-navasoft-web.mp4 y su póster
├── tools/                     ← verificación y capturas (no se publica)
└── .github/workflows/         ← verificación automática en pull requests
```

No hay plantillas: el header y el footer están copiados en cada página. Un cambio en el menú o en el pie debe aplicarse en las 25.

## 5. Sistema de diseño

Definido como variables en `:root`, al inicio de `css/style.css`. Usar siempre las variables.

| Uso | Variable | Valor |
|---|---|---|
| Azul oscuro (fondos, títulos, texto de botones naranjas) | `--color-primary-dark` | `#071A2B` |
| Azul de marca (enlaces, etiquetas) | `--color-primary` | `#1677B8` |
| Azul claro | `--color-primary-light` | `#20A4F3` |
| Naranja de acento (botón principal, detalles) | `--color-accent` | `#F59E0B` |
| Naranja oscuro (hover) | `--color-accent-dark` | `#D67A00` |
| Fondo de página / superficies | `--color-background` / `--color-surface` | `#F6F9FC` / `#FFFFFF` |
| Texto / texto secundario | `--color-text` / `--color-text-secondary` | `#152536` / `#64748B` |
| Bordes | `--color-border` | `#E5EAF0` |

- **Tipografía:** Montserrat (títulos, `--font-heading`) e Inter (texto, `--font-family`), desde Google Fonts. Tamaños fluidos con `clamp()`: `--text-xs` a `--text-6xl`.
- **Espaciado:** `--space-xs` (0,25 rem) a `--space-5xl` (7 rem). **Radios:** `--radius-sm` a `--radius-2xl`. **Sombras:** `--shadow-sm` a `--shadow-xl`.
- **Ancho máximo:** `--container-max` 1200 px. **Altura del header:** `--header-height` 92 px.

### Componentes compartidos

- **Botones:** `.btn` con `.btn--primary` (naranja con texto azul oscuro), `.btn--outline`, `.btn--ghost-light` (sobre fondos oscuros) y `.btn--lg`.
- **Encabezado de sección:** `.section__header` con `.section__label`, `.section__title` y `.section__subtitle`; variantes `--light` para fondos oscuros.
- **Hero y cierre de páginas internas:** `.solutions-hero` y `.solutions-cta` (en `soluciones.css`). Las páginas internas llevan `<body class="solutions-page">`.

### Organización de `style.css`

El archivo tiene un índice al inicio. Además de los bloques por componente, conserva varias capas de ajuste añadidas al final ("Design polish pass", "Final responsive polish", etc.) que sobrescriben reglas anteriores. Antes de modificar un componente, buscar su selector en todo el archivo: puede estar definido en más de un lugar y gana la última regla.

## 6. JavaScript

Sin dependencias. Cada archivo es una función autoejecutable en modo estricto.

### `js/main.js`

| Bloque | Qué hace |
|---|---|
| Header | Sombra al hacer scroll, menú móvil con overlay, cierre al redimensionar |
| Navegación | Scroll suave a las anclas y resaltado del enlace de la sección visible |
| Animaciones | Aparición de elementos con `IntersectionObserver`; contadores (`data-count`, `data-prefix`) |
| Carruseles | Indicadores de los carruseles deslizables en celular |
| Capturas | Pestañas, visor de imagen ampliada y video de demostración. El marco de ventana de las capturas es solo CSS (`.showcase__image-button::before`) |
| Formulario | Validación y armado del mensaje de WhatsApp; opción de correo; envío opcional a `LEAD_ENDPOINT` |
| WhatsApp | Enlace del botón flotante |
| Asistente virtual | Menú de temas con respuestas predefinidas y derivación a WhatsApp; modo con IA opcional |

Configuración, al inicio del archivo:

| Constante | Uso |
|---|---|
| `WHATSAPP_NUMBER` | Número de destino, con código de país y sin signos |
| `WHATSAPP_MESSAGE` | Mensaje inicial del botón flotante |
| `CONTACT_EMAIL` | Correo alternativo del formulario |
| `LEAD_ENDPOINT` | Opcional. URL que recibe cada solicitud por POST en JSON. Vacío: desactivado |
| `CHAT_AI_ENDPOINT` | Opcional. Webhook del asistente con IA. Vacío: el asistente usa solo respuestas predefinidas |

**Asistente con IA.** Con `CHAT_AI_ENDPOINT` configurado, el panel añade un campo de texto. Cada consulta se envía por POST con `{ sesion, mensaje, historial, origen }` y se espera `{ "respuesta": "..." }`. Tiene límite de 400 caracteres por mensaje, 20 mensajes por sesión y 20 s de espera; si la petición falla, ofrece continuar por WhatsApp. El límite real de uso debe aplicarse en el servidor que recibe el webhook. Al activarlo hay que actualizar la política de privacidad.

**Analítica.** `trackCommercialEvent()` envía eventos a `gtag` o `dataLayer` si existen: `lead_whatsapp_prepared`, `whatsapp_floating_click`, `chatbot_whatsapp_click` y `chatbot_ai_message`. El sitio aún no incluye el código de Google Analytics o Tag Manager; al añadirlo en el `<head>`, los eventos empiezan a registrarse.

### Otros archivos

- **`soluciones.js`:** contiene los textos e imágenes de cada solución en el objeto `solutions` y pinta el detalle según `?solucion=`. Para editar una solución del catálogo se cambia aquí, no en el HTML.
- **`sectores.js`:** igual para los sectores (objeto `sectors`), con sus ilustraciones.
- **`chatbot.js`:** versión reducida del asistente para `soluciones.html` y `sectores.html`.

El número de WhatsApp está repetido en `main.js`, `soluciones.js`, `sectores.js` y en los enlaces `wa.me` del HTML. Para cambiarlo, buscar el número en todo el proyecto.

## 7. Tareas frecuentes

### Cambiar un estilo o un script

1. Editar el archivo.
2. Actualizar su versión `?v=` en **todas** las páginas que lo enlazan (formato `AAAAMMDD-n`). Sin esto, los visitantes siguen viendo la versión en caché.
3. Ejecutar `python tools/verificar_sitio.py`.

### Añadir una página

1. Copiar una página del mismo tipo (por ejemplo, otro sector) y ajustar rutas relativas, `<title>`, descripción, canónica y Open Graph.
2. Añadirla a `sitemap.xml` y enlazarla desde el menú, el footer o la página índice.
3. Si corresponde, añadir el JSON-LD de migas de pan al final del `<body>`, como en las páginas de sector.

### Añadir un cliente al carrusel

1. Guardar el logo en `assets/LogosClientes/` en formato `.webp`.
2. En `index.html`, sección `#clientes`, añadir el slide en los **dos** grupos `.clients-carousel__group` (el segundo es la copia que hace continuo el desplazamiento).

### Cambiar una captura o el video

- Capturas: reemplazar el archivo en `assets/screenshots/` conservando el nombre, o actualizar la ruta en `index.html` y en `soluciones.js`.
- Video: exportar una versión comprimida para web y reemplazar `assets/videos/demostracion-navasoft-web.mp4` y su póster. No subir el original al repositorio.

### Cambiar el menú o el footer

Aplicar el cambio en las 25 páginas respetando las rutas relativas de cada nivel. En la portada, el enlace "Nosotros" del header apunta a `#empresa` para que funcione el resaltado al hacer scroll; en el resto apunta a `nosotros.html`.

## 8. Responsive y accesibilidad

- Puntos de quiebre principales: 1150, 1024, 900 (el menú pasa a hamburguesa), 768, 640 y 480 px. Entre 901 y 1024 px el menú completo sigue visible con el logo y los enlaces más compactos.
- HTML semántico con un solo `<h1>` por página y `aria-labelledby` en las secciones.
- Menú móvil y asistente con `aria-expanded`, `aria-controls` y foco gestionado.
- `prefers-reduced-motion` detiene carruseles y animaciones.
- Contraste: el botón principal usa texto azul oscuro sobre naranja (7,5:1). No usar texto blanco sobre `--color-accent`: queda en 2,2:1, por debajo del mínimo AA de 4,5:1.
- Todas las imágenes llevan `alt`; las decorativas, `alt=""` o `aria-hidden`.

## 9. SEO y rendimiento

- Cada página tiene `<title>`, descripción, canónica, Open Graph y tarjeta de Twitter. La imagen para compartir es `assets/images/og-ekam.jpg` (plantilla en `tools/og.html`).
- Datos estructurados JSON-LD: `Organization` en la portada, `AboutPage` en Nosotros y `BreadcrumbList` en las páginas de sector, solución y recursos.
- `robots.txt` permite todo y apunta a `sitemap.xml`.
- Imágenes en `.webp` con `width`/`height` y `loading="lazy"` fuera del primer pantallazo; fuentes cargadas sin bloquear el render; del video solo se precargan los metadatos (`preload="metadata"`).

## 10. Publicación

Subir al directorio público: los `.html`, `robots.txt`, `sitemap.xml` y las carpetas `css/`, `js/`, `assets/`, `soluciones/`, `sectores/` y `recursos/`.

No subir: `.git/`, `.github/`, `tools/` ni los `.md`.

GitHub no publica el sitio automáticamente; fusionar en `main` no cambia lo que se ve en el dominio.

## 11. Pendientes

- Validar con EKAM Perú las cifras de la portada, los textos de `nosotros.html` y la dirección de la oficina.
- Añadir el código de Google Analytics 4 o Tag Manager.
- Definir si se activan `LEAD_ENDPOINT` y `CHAT_AI_ENDPOINT`.
- Añadir `favicon.ico` en la raíz (hoy solo hay SVG y PNG; algunos navegadores lo piden igualmente).
- Deuda técnica: header y footer duplicados en 25 páginas, y capas de ajuste acumuladas en `style.css`.
