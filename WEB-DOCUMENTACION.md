# EKAM Perú — Documentación técnica del sitio

Guía para quien mantenga el sitio: cómo está organizado, qué hace cada archivo y cómo hacer los cambios más comunes. El resumen y la puesta en marcha están en `README.md`.

## 1. Resumen

- Sitio corporativo estático de **EKAM PERU S.A.C.** (sede en Chiclayo), partner de **NAVASOFT ERP**.
- Al mencionar la sede, acompañarla siempre de la cobertura ("Sede en Chiclayo · Atención en todo el norte del Perú"), para que no parezca que EKAM solo trabaja en Chiclayo.
- HTML, CSS y JavaScript sin frameworks, sin proceso de compilación y sin backend propio. La bolsa de trabajo usa Google Apps Script (sección 6).
- 28 páginas: portada, catálogo de soluciones, sectores, clientes, bolsa de trabajo, nosotros, recursos, privacidad y una página por solución, sector y guía.
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
| `index.html` | Portada | `home.css` | `main.js` |
| `soluciones.html` | Catálogo: cada tarjeta enlaza a la página de su solución | `soluciones.css` | `chatbot.js` |
| `soluciones/<slug>/` | 6 páginas: `erp-navasoft`, `facturacion-electronica`, `contabilidad`, `hoteles-restaurantes`, `activos-fijos`, `navamovil` | `soluciones.css` | `main.js` |
| `sectores.html` | Sectores con pestañas | `sectores.css` | `sectores.js`, `chatbot.js` |
| `sectores/<slug>/` | 10 páginas: `agroindustria`, `comercio`, `construccion`, `educacion`, `grifos`, `hoteles-restaurantes`, `industria`, `salud`, `servicios`, `transporte` | `soluciones.css` | `main.js` |
| `nosotros.html` | Historia, misión, visión y servicios | `soluciones.css`, `nosotros.css` | `main.js` |
| `clientes/` | Escenario azul con el índice de 9 sectores a la izquierda y los 42 logos a la derecha; el selector filtra por sector (enlace compartible `clientes/#construccion`) y cada tarjeta gira al pasar el mouse y muestra el nombre. Para agregar uno: guardar el `.webp` en `assets/LogosClientes/`, copiar un `<li>` con el `data-sector` de su rubro y sumar 1 a los contadores | `soluciones.css`, `clientes.css` | `main.js`, `clientes.js` |
| `bolsa-de-trabajo/` | Convocatorias (tarjetas con afiche ampliable) y formulario de postulación con CV. Las ofertas no se editan aquí: el ingeniero las publica desde un formulario de Google | `soluciones.css`, `bolsa.css` | `main.js`, `bolsa.js` |
| `recursos/` y `recursos/<slug>/` | Índice y 3 guías: `como-elegir-un-erp`, `facturacion-electronica-peru`, `ple-libros-electronicos` | `soluciones.css` | `main.js` |
| `privacidad.html` | Política de privacidad | — | `main.js` |

Todas cargan `css/style.css`; la portada carga además `css/home.css`. Las páginas dentro de carpetas usan rutas relativas (`../../css/style.css`). `404.html` usa rutas absolutas (`/css/style.css`) porque el servidor puede mostrarla en cualquier dirección.

### Secciones de la portada

En orden de aparición; el `id` es el ancla que usan el menú y los enlaces internos.

| `id` | Contenido |
|---|---|
| `inicio` | Hero: titular, llamados a la acción, cifras y escena ilustrada |
| — | Propuesta de valor (`.commercial-summary`) |
| `navasoft` | NAVASOFT como plataforma: diagrama de módulos y franja de normativa peruana (SUNAT, PLE, SIRE) |
| `pantallas` | Capturas de NAVASOFT con pestañas, visor ampliado y video de demostración |
| `ia` | Inteligencia artificial aplicada a la gestión |
| `sectores` | Sectores atendidos |
| `a-medida` | Desarrollo a medida |
| `implementacion` | Metodología de implementación (única página donde se muestra completa) |
| `empresa` | Nosotros: socio tecnológico, relación EKAM → NAVASOFT y botón a `nosotros.html` (las cifras están en el hero) |
| `clientes` | Carrusel de logos (dentro de `empresa`) |
| `academy` | EKAM Academy: cuatro líneas de capacitación y botón de WhatsApp. En celular cada línea se despliega al tocarla |
| `problemas` | Problemas que se resuelven; enlaza directo con el formulario de contacto |
| `contacto` | Formulario de contacto |

Fuera del `<main>`: footer, visor de imágenes, botón flotante de WhatsApp y asistente virtual.

## 4. Estructura de archivos

```
EKAM-2026/
├── *.html                     ← portada y páginas de primer nivel
├── soluciones/ · sectores/ · clientes/ · bolsa-de-trabajo/ · recursos/   ← una carpeta con index.html por página
├── robots.txt · sitemap.xml
├── css/
│   ├── style.css              ← variables, base y componentes compartidos por todas las páginas
│   ├── home.css               ← secciones que solo existen en la portada
│   ├── soluciones.css         ← hero, tarjetas, detalle y CTA de las páginas internas
│   ├── sectores.css           ← solo sectores.html
│   ├── nosotros.css           ← solo nosotros.html
│   ├── clientes.css           ← solo clientes/
│   └── bolsa.css              ← solo bolsa-de-trabajo/
├── js/
│   ├── main.js                ← comportamiento de la portada y páginas internas
│   ├── sectores.js            ← datos y pestañas de sectores.html
│   ├── clientes.js            ← filtro por sector de clientes/
│   ├── bolsa.js               ← convocatorias y postulación de bolsa-de-trabajo/
│   └── chatbot.js             ← asistente para las páginas que no cargan main.js
├── assets/
│   ├── icons/                 ← logos de EKAM y NAVASOFT, favicons
│   ├── LogosClientes/         ← logos del carrusel (.webp)
│   ├── images/                ← asistente virtual, NavaMóvil, og-ekam.jpg
│   ├── screenshots/           ← capturas de NAVASOFT (.webp y variante -640.webp)
│   └── videos/                ← demostracion-navasoft-web.mp4 y su póster
├── 404.html · favicon.ico     ← página de error y favicon para navegadores antiguos
├── crm/google/bolsa-de-trabajo/  ← script de Google de la bolsa y su guía (no se publica)
├── tools/                     ← verificación, cambio de WhatsApp y capturas (no se publica)
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

### Organización del CSS

- `style.css` lo cargan las 27 páginas: variables, base, header, footer, botones, formulario, asistente y componentes de las páginas internas.
- `home.css` solo lo carga `index.html`, después de `style.css`: hero, módulos, capturas, IA, sectores, metodología, Nosotros, EKAM Academy y cierre.
- Regla práctica: si una clase aparece solo en `index.html`, su regla va en `home.css`; si la usa alguna otra página o un script, va en `style.css`.
- Algunas reglas de la portada siguen en `style.css` a propósito: moverlas habría cambiado qué regla gana cuando dos empatan en especificidad.


El archivo tiene un índice al inicio. Además de los bloques por componente, conserva varias capas de ajuste añadidas al final ("Design polish pass", "Final responsive polish", etc.) que sobrescriben reglas anteriores. Antes de modificar un componente, buscar su selector en todo el archivo: puede estar definido en más de un lugar y gana la última regla.

## 6. JavaScript

Sin dependencias. Cada archivo es una función autoejecutable en modo estricto. Se cargan desde el `<head>` con `defer`, así no bloquean el render y se ejecutan en orden cuando el HTML ya está leído.

### `js/main.js`

| Bloque | Qué hace |
|---|---|
| Header | Sombra al hacer scroll, menú móvil con overlay, cierre al redimensionar |
| Navegación | Scroll suave a las anclas y resaltado del enlace de la sección visible |
| Animaciones | Aparición de elementos con `IntersectionObserver`; contadores (`data-count`, `data-prefix`) |
| Carruseles | Indicadores de los carruseles deslizables en celular |
| Capturas | Pestañas, visor de imagen ampliada y video de demostración. El marco de ventana de las capturas es solo CSS (`.showcase__image-button::before`) |
| Formulario | Validación, casilla de consentimiento obligatoria, armado del mensaje de WhatsApp y opción de correo; registro en el CRM (Supabase) si está configurado |
| WhatsApp | Enlace del botón flotante |
| Asistente virtual | Menú de temas con respuestas predefinidas y derivación a WhatsApp; modo con IA opcional |

Configuración, al inicio del archivo:

| Constante | Uso |
|---|---|
| `WHATSAPP_NUMBER` | Número de destino, con código de país y sin signos |
| `WHATSAPP_MESSAGE` | Mensaje inicial del botón flotante |
| `CONTACT_EMAIL` | Correo alternativo del formulario |
| `SUPABASE_URL`, `SUPABASE_PUBLIC_KEY` | Opcional. Proyecto Supabase del CRM. Cada solicitud llama a la función `registrar_interesado_web` (`crm/supabase/002_registro_web.sql`). Vacías: desactivado |
| `PRIVACY_POLICY_VERSION` | Fecha de la política de privacidad que se guarda con cada consentimiento |
| `CHAT_AI_ENDPOINT` | Opcional. Webhook del asistente con IA. Vacío: el asistente usa solo respuestas predefinidas |

**Asistente con IA.** Con `CHAT_AI_ENDPOINT` configurado, el panel añade un campo de texto. Cada consulta se envía por POST con `{ sesion, mensaje, historial, origen }` y se espera `{ "respuesta": "..." }`. Tiene límite de 400 caracteres por mensaje, 20 mensajes por sesión y 20 s de espera; si la petición falla, ofrece continuar por WhatsApp. El límite real de uso debe aplicarse en el servidor que recibe el webhook. Al activarlo hay que actualizar la política de privacidad.

El flujo listo para importar en n8n está en `crm/n8n/asistente-web.workflow.json` (Webhook → modelo de IA → respuesta). Usa las mismas instrucciones que `crm/n8n/instrucciones-asistente.txt`; si se cambia una, cambiar la otra. Hoy el nodo de IA llama a Gemini; el proveedor definido es GPT (OpenAI), así que al montar n8n hay que cambiar ese nodo. Para activarlo: importar el flujo, crear la credencial del proveedor en n8n (nunca escribir la clave en el flujo), activar el flujo y copiar su *Production URL* en `CHAT_AI_ENDPOINT`.

**Analítica.** `trackCommercialEvent()` envía eventos a `gtag` o `dataLayer` si existen: `lead_whatsapp_prepared`, `whatsapp_floating_click`, `chatbot_whatsapp_click` y `chatbot_ai_message`. El sitio aún no incluye el código de Google Analytics o Tag Manager; al añadirlo en el `<head>`, los eventos empiezan a registrarse.

### Otros archivos

- **`sectores.js`:** contiene los textos e ilustraciones de cada sector en el objeto `sectors` y pinta el detalle de `sectores.html`.
- **`chatbot.js`:** versión reducida del asistente para `soluciones.html` y `sectores.html`.
- **`bolsa.js`:** pide las convocatorias vigentes a `BOLSA_ENDPOINT` (script de Google), pinta las tarjetas sin `innerHTML`, abre el afiche en un `<dialog>` con zoom y envía la postulación con el CV en base64. El `POST` va como `text/plain` para evitar la consulta previa CORS, que Apps Script no responde. El script, la protección contra spam, la guía para publicar ofertas y la instalación están en `crm/google/bolsa-de-trabajo/README.md`.

El número de WhatsApp está repetido en `main.js`, `sectores.js` y en los enlaces `wa.me` y `tel:` del HTML. Para cambiarlo en todo el sitio: `python tools/cambiar_whatsapp.py 51XXXXXXXXX`. El verificador falla si queda más de un número.

## 7. Tareas frecuentes

### Cambiar un estilo o un script

1. Editar el archivo.
2. Actualizar su versión `?v=` en **todas** las páginas que lo enlazan (formato `AAAAMMDD-n`). Sin esto, los visitantes siguen viendo la versión en caché.
3. Ejecutar `python tools/verificar_sitio.py`.

### Añadir una página

1. Copiar una página del mismo tipo (por ejemplo, otro sector) y ajustar rutas relativas, `<title>`, descripción, canónica y Open Graph.
2. Añadirla a `sitemap.xml` y enlazarla desde el menú, el footer o la página índice.
3. Si corresponde, añadir el JSON-LD de migas de pan al final del `<body>`, como en las páginas de sector.

### Evitar contenido repetido

- La metodología de 6 pasos vive solo en la portada (`#implementacion`). Las páginas de solución y sector la resumen en su frase de introducción.
- Las cifras (+15 años, +300 empresas, norte del Perú) viven solo en el hero de la portada.
- El detalle de cada solución vive en `soluciones/<slug>/`; `soluciones.html` solo enlaza. Los enlaces antiguos `soluciones.html?solucion=...` redirigen con 301 desde `.htaccess`.

### Añadir un cliente al carrusel

1. Guardar el logo en `assets/LogosClientes/` en formato `.webp`.
2. En `index.html`, sección `#clientes`, hay dos carruseles: el primero (`.clients-carousel--reverse`) avanza hacia la derecha y el segundo hacia la izquierda. Elegir uno y añadir el slide en sus **dos** grupos `.clients-carousel__group` (el segundo es la copia que hace continuo el desplazamiento).
3. En `css/home.css`, ajustar `--carousel-duration` de ese carrusel (unos 5,3 s por logo) para que ambas filas mantengan la misma velocidad.

Los logos se muestran siempre a color. Deben ser los oficiales de cada empresa (de su web o su página oficial), sin redibujarlos.

### Cambiar una captura o el video

- Capturas de la portada ("Mira NAVASOFT en funcionamiento"): son recortes horizontales (proporción cercana a 2,5:1) llamados `navasoft-<módulo>-panel.webp`, con una variante de 640 px (`-panel-640.webp`) declarada en `srcset`. Cada una tiene su `aspect-ratio` en `css/home.css`; si cambian las medidas de una imagen, actualizar esa regla y los atributos `width`/`height`.
- Las capturas nunca deben mostrar datos reales de clientes: nombres, RUC y correos se reemplazan por datos de ejemplo antes de publicarlas.
- `soluciones.html` y las páginas de solución usan esas mismas capturas horizontales (clase `solution-detail__image--wide`, que respeta su proporción); NavaMóvil conserva su imagen en 16:10.
- Video: exportar una versión comprimida para web y reemplazar `assets/videos/demostracion-navasoft-web.mp4` y su póster. No subir el original al repositorio.

### Cambiar el menú o el footer

Aplicar el cambio en las 28 páginas respetando las rutas relativas de cada nivel. En la portada, el enlace "Nosotros" del header apunta a `#empresa` para que funcione el resaltado al hacer scroll; en el resto apunta a `nosotros.html`.

## 8. Responsive y accesibilidad

- Puntos de quiebre principales (en `em`, para que respeten el tamaño de letra del navegador): 1100 px (por debajo el menú pasa a hamburguesa, porque los siete enlaces y el botón no caben en una línea), 1024, 900, 768, 640 y 480 px.
- Enlace "Saltar al contenido" al inicio de cada página, visible al recibir foco con el teclado; lleva a `<main id="contenido">`.
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

Subir al directorio público: los `.html` (incluido `404.html`), `favicon.ico`, `robots.txt`, `sitemap.xml`, `.htaccess` (solo con el SSL activo) y las carpetas `css/`, `js/`, `assets/`, `soluciones/`, `sectores/`, `clientes/`, `bolsa-de-trabajo/` y `recursos/`.

No subir: `.git/`, `.github/`, `.claude/`, `tools/`, `crm/` ni los `.md`.

GitHub no publica el sitio automáticamente; fusionar en `main` no cambia lo que se ve en el dominio.

## 11. Pendientes

- Añadir el código de Google Analytics 4 o Tag Manager.
- Activar el asistente con IA cuando exista el servidor n8n (Hostinger): pasar el flujo `crm/n8n/asistente-web.workflow.json` a GPT, copiar su URL en `CHAT_AI_ENDPOINT` y actualizar la política de privacidad.
- Subir `.htaccess` (HTTPS, `404.html`, compresión y caché) después de activar el SSL en cPanel.
- Pasar la bolsa de trabajo a la cuenta de Google de EKAM: instalar el script allí, poner el correo de la empresa en `CORREO_AVISO` y actualizar `BOLSA_ENDPOINT`.
- Borrar cada mes las postulaciones con más de 12 meses desde su envío y sus CV (plazo de la política de privacidad). El borrado es manual: asignar un responsable y seguir `crm/google/bolsa-de-trabajo/README.md`.
- Deuda técnica: header y footer duplicados en 27 páginas, y capas de ajuste acumuladas en el CSS.
