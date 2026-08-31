# EKAM 2026 · NAVASOFT ERP — DOCUMENTACIÓN DE LA WEB

> Documentación técnica y funcional completa de la página web desarrollada como propuesta de rediseño para **EKAM PERÚ / NAVASOFT**.

---

## 1. RESUMEN DEL PROYECTO

| Atributo | Valor |
|---|---|
| Nombre del proyecto | EKAM 2026 |
| Tipo | Propuesta de rediseño web (prototipo independiente) |
| Tecnología | HTML5 + CSS3 + JavaScript Vanilla (ES6+) |
| Framework | Ninguno (sin React, Vue, Angular, Tailwind, Bootstrap, etc.) |
| Dependencias | Ninguna (sin `node_modules`, sin npm) |
| Backend | Ninguno (sin PHP, sin base de datos) |
| Ruta local | `C:\EKAM-2026` |
| Sitio de producción | NO tocado (`https://www.ekamperu.com/`) |

---

## 2. CÓMO EJECUTAR LA WEB

Sin build, sin instalaciones. Solo un servidor estático:

```bash
cd C:\EKAM-2026
python -m http.server 5500
```

Abrir en el navegador:

```
http://localhost:5500
```

> **Importante:** no abrir el archivo `index.html` directamente con doble clic (`file://`). Aunque muchas cosas funcionan, es mejor servirlo por HTTP para evitar problemas con rutas y módulos.

---

## 3. ESTRUCTURA DE CARPETAS

```
EKAM-2026/
│
├── index.html                     ← Página principal completa (una sola página)
├── README.md                      ← Documentación resumida del proyecto
├── WEB-DOCUMENTACION.md           ← Este archivo (documentación detallada)
├── .gitignore                     ← Exclusiones de Git
│
├── css/
│   └── style.css                  ← Todo el sistema de estilos
│
├── js/
│   └── main.js                    ← Todo el comportamiento (Vanilla JS)
│
└── assets/
    ├── icons/
    │   ├── favicon.svg            ← Favicon provisional
    │   ├── Logo-EKAM.png          ← Logo oficial EKAM
    │   └── Logo-Navasoft.png      ← Logo oficial NAVASOFT
    │
    └── LogosClientes/             ← Logos de clientes (carrusel)
        ├── Contactiva.png
        ├── Delcor.png
        ├── JockeyClubChiclayo.png
        ├── Molisam.png
        ├── SanRoque.png
        └── Vidavas.png
```

> **Nota sobre carpetas vacías planificadas:** la estructura original previó `assets/images/logo/`, `assets/images/sistema/`, `assets/images/clientes/` y `assets/images/sectores/` para futuras capturas reales. Los logos de clientes se almacenan actualmente en `assets/LogosClientes/`.

---

## 4. IDENTIDAD VISUAL (PALETA DE COLORES)

Todos los colores están centralizados en variables CSS (fácil de cambiar cuando EKAM confirme su manual de marca).

```css
:root {
    --color-primary-dark:      #071A2B;   /* Azul petróleo / oscuro */
    --color-primary:           #0877C9;   /* Azul principal EKAM */
    --color-primary-hover:     #0668b0;   /* Azul al pasar el mouse */
    --color-primary-light:     #20A4F3;   /* Azul claro / acentos */
    --color-primary-subtle:    #e8f4fd;   /* Fondo azul muy suave */

    --color-background:        #F6F9FC;   /* Fondo de secciones alternas */
    --color-surface:           #FFFFFF;   /* Tarjetas / superficies */

    --color-text:              #152536;   /* Texto principal */
    --color-text-secondary:    #64748B;   /* Texto secundario */
    --color-text-muted:        #94A3B8;   /* Texto atenuado */

    --color-border:            #E5EAF0;   /* Bordes */
    --color-border-light:      #F0F3F7;   /* Bordes tenues */

    --color-success:           #10B981;   /* Éxito / validación */
    --color-error:             #EF4444;   /* Errores de formulario */
    --color-warning:           #F59E0B;   /* Alertas */
}
```

**Convención de marca:** siempre se mantiene la identidad azul. No se usan degradados excesivos ni neones.

---

## 5. TIPOGRAFÍA

Pila de fuentes (con fallback offline — la fuente se carga de Google Fonts pero la web funciona sin internet):

```css
--font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
```

### Jerarquía tipográfica (adaptable con `clamp()`)

| Uso | Variable | Tamaño aproximado |
|---|---|---|
| H1 (Hero) | `--text-6xl` | 44–64px |
| H2 (secciones) | `--text-4xl` | 32–44px |
| H3 (tarjetas) | `--text-lg` a `--text-xl` | 17–21px |
| Body | `--text-base` | 15–17px |
| Subtítulos | `--text-secondary` | 13–14px |
| Texto pequeño / etiquetas | `--text-xs` | 12–13px |

---

## 6. SECCIONES DE LA PÁGINA

La web es de una sola página (`index.html`) con desplazamiento suave. Las secciones, en orden:

### 6.1 Header / Barra de navegación
- **Sticky**: fija al hacer scroll, cambia de apariencia (sombra + borde) al desplazarse.
- **Logo**: imagen `Logo-EKAM.png` + texto "EKAM NAVASOFT".
- **Menú**: Inicio · Soluciones · NAVASOFT · Sectores · Clientes · Nosotros · Contacto.
- **CTA**: botón "Solicitar demo".
- **Responsive**: menú hamburguesa con overlay, cierre con `Escape`, accesible por teclado.
- **Marker HTML**: `<header class="header" id="header">`

### 6.2 Hero principal
- Etiqueta "NAVASOFT ERP" + logo NAVASOFT.
- Título: **"Controla toda tu empresa desde un solo sistema"**.
- Subtítulo y 2 botones (Solicitar demostración / Conocer NAVASOFT).
- Línea de confianza: "Software peruano · Implementación · Soporte especializado".
- **Mockup** decorativo del sistema en la derecha (placeholder elegante, no una captura real).
- Tarjetas flotantes animadas (Ventas, Inventarios, Facturación).
- **Marker HTML**: `<section class="hero" id="inicio">`

### 6.3 Franja de confianza
- 4 características con iconos: Software peruano, Solución modular, Soporte especializado, Experiencia empresarial.
- **Marker HTML**: `<section class="trust-strip">`

### 6.4 Desafíos que resolvemos (`#problemas`)
- Título: "Información conectada para tomar mejores decisiones".
- 6 tarjetas de problemática: Información dispersa, Procesos separados, Control de inventario, Gestión financiera, Facturación electrónica, Seguimiento de ventas.
- **Marker HTML**: `<section class="section section--alt" id="problemas">`

### 6.5 Pilares (`#pilares`)
- 3 tarjetas: **Movilidad**, **Integración**, **Adaptabilidad** (conceptos heredados de la web actual).
- **Marker HTML**: `<section class="section" id="pilares">`

### 6.6 Soluciones / Módulos (`#soluciones`)
- Título: "Una solución para cada proceso de tu empresa".
- 6 tarjetas de módulos: Gestión Administrativa, Contabilidad, Ventas, Facturación Electrónica, Hoteles, Restaurantes.
- Cada tarjeta: icono, nombre, descripción, 2–3 características y enlace "Conocer más".
- **Marker HTML**: `<section class="section section--alt" id="soluciones">`

### 6.7 NAVASOFT en acción (`#navasoft`)
- Visor grande con **tabs** (JavaScript): General, Ventas, Inventarios, Contabilidad, Facturación.
- Actualmente muestra **placeholders** claramente identificados ("Se reemplazará con imagen real").
- **Sustitución de imágenes futura:** colocar capturas en `assets/images/sistema/` (dashboard.webp, ventas.webp, inventarios.webp, contabilidad.webp, facturacion.webp) y sustituir los placeholders en el HTML.
- **Marker HTML**: `<section class="section" id="navasoft">`

### 6.8 NavaMóvil (`#navamovil`)
- Fondo azul oscuro (sección diferenciada).
- Capacidades: consulta de stock/precios, clientes, cotizaciones/pedidos, cuentas por cobrar, datos para fuerza de ventas.
- **Mockup** de smartphone (placeholder, no screenshot real).
- **Marker HTML**: `<section class="section section--dark" id="navamovil">`

### 6.9 Sectores (`#sectores`)
- 4 tarjetas: Empresas comerciales, Industria, Hoteles, Restaurantes.
- **Marker HTML**: `<section class="section" id="sectores">`

### 6.10 Nuestros clientes (`#clientes`)
- **Carrusel horizontal infinito** (logo marquee).
- 6 logos reales de clientes.
- Detalles:
  - Movimiento automático derecha → izquierda, loop infinito perfecto.
  - Velocidad: `32s` por ciclo (ajustable).
  - Pausa al pasar el mouse sobre el carrusel.
  - Efecto fade lateral en ambos extremos.
  - Normalización visual individual por cliente (escalas).
  - `prefers-reduced-motion` → se detiene y muestra los logos en filas.
- Clientes (orden): Contactiva, Grupo Delcor, Molisam, San Roque, VIDAVA'S, Jockey Club Chiclayo.
- **Rutas de logos**: `assets/LogosClientes/<Nombre>.png`
- **Marker HTML**: `<section class="section section--alt" id="clientes">`

### 6.11 Nuestra empresa (`#empresa`)
- Diferencia **EKAM PERÚ** (empresa/acompañamiento/implementación/soporte) vs **NAVASOFT** (producto ERP).
- Título: "Más que software, acompañamiento para tu empresa".
- Visuales con ambos logos.
- **Marker HTML**: `<section class="section" id="empresa">`

### 6.12 Llamada a la acción (`#cta`)
- Fondo con degradado azul.
- "Descubre cómo NAVASOFT puede adaptarse a tu empresa" + botón.
- **Marker HTML**: `<section class="section section--cta" id="cta">`

### 6.13 Formulario de contacto (`#contacto`)
- Campos: Nombre, Empresa, Teléfono/WhatsApp, Correo, Solución de interés (select), Mensaje.
- Validación client-side en JavaScript.
- Muestra una **notificación visual** ("Mensaje enviado — Demostración") porque aún no hay backend.
- **Marker HTML**: `<section class="section" id="contacto">`

### 6.14 Footer
- Marcas de soluciones, empresa, soporte y ubicación (Chiclayo, Lambayeque, Perú).
- Copyright: © 2026 EKAM PERÚ S.A.C.
- **Marker HTML**: `<footer class="footer">`

### 6.15 Botón flotante de WhatsApp
- Botón flotante abajo a la derecha.
- Si `WHATSAPP_NUMBER` está vacío, redirige a `#contacto` en lugar de generar un enlace roto.
- **Marker HTML**: `<a class="whatsapp-btn" id="whatsappBtn">`

---

## 7. JAVASCRIPT (`js/main.js`)

Todo el JS está envuelto en un IIFE (no contamina el scope global). Módulos por responsabilidad:

| Módulo | Función |
|---|---|
| **Header scroll** | Añade/quita clase `header--scrolled` al hacer scroll |
| **Menú móvil** | Abre/cierra con overlay, cierre con `Escape`, cierre al hacer clic en enlace, cierre al redimensionar |
| **Smooth navigation** | Scroll suave a anclas, respeta altura del header |
| **Active nav link** | Resalta la sección visible en el menú |
| **IntersectionObserver** | Anima la aparición de tarjetas (fade/slide up) al entrar en viewport |
| **Showcase tabs** | Cambia paneles NAVASOFT, con navegación por teclado (flechas/Home/End) |
| **Formulario** | Valida campos (obligatorios + email), muestra notificación de demo, limpia errores al escribir |
| **WhatsApp** | Configura el enlace con número o fallback a `#contacto` |
| **Utilidades** | Manejo de resize, cierre de menú en desktop |

### WhatsApp: configurar número oficial

En `js/main.js`, línea 10:

```js
// TODO: colocar número oficial de WhatsApp de EKAM.
const WHATSAPP_NUMBER = '';
```

Rellena con el número en formato internacional (solo dígitos):

```js
const WHATSAPP_NUMBER = '51999000000';
```

---

## 8. CÓMO AGREGAR UN NUEVO CLIENTE AL CARRUSEL

1. **Coloca el logo** en `assets/LogosClientes/` (formato `.png`, con `object-fit: contain` no se deformará).
2. **Edita `index.html`** en la sección `#clientes` y añade un slide **dentro de los DOS grupos** (el primer grupo es visible, el segundo es la copia para el loop infinito). Estructura:

```html
<div class="clients-carousel__slide">
    <div class="client-logo client-miempresa">
        <div class="logo-wrapper"><img src="assets/LogosClientes/MiEmpresa.png" alt="Mi Empresa" class="client-logo__img" loading="lazy"></div>
    </div>
</div>
```

3. **Opcional:** añade escala de normalización en `css/style.css`:

```css
.client-miempresa .client-logo__img {
    transform: scale(1.0);
}
```

> **Importante:** si se agrega un slide a un grupo, debe agregarse **también en el segundo grupo** (el `aria-hidden=true`) para mantener el loop perfecto de `translateX(-50%)`.

---

## 9. CÓMO SUSTITUIR LAS CAPTURAS DE NAVASOFT

El visor `#navasoft` tiene tabs con placeholders. Para usar capturas reales:

1. Coloca las imágenes en `assets/images/sistema/` en formato **WebP**:
   - `dashboard.webp` (tab General)
   - `ventas.webp`
   - `inventarios.webp`
   - `contabilidad.webp`
   - `facturacion.webp`
2. En `index.html`, dentro de cada panel, reemplaza el contenido del `.showcase__placeholder` por una `<img>`:

```html
<img src="assets/images/sistema/ventas.webp" alt="Módulo de ventas NAVASOFT" loading="lazy">
```

Cada panel queda funcionando: al hacer clic en el tab cambia la imagen.

---

## 10. AJUSTES FRECUENTES

### Cambiar la velocidad del carrusel de clientes
En `css/style.css`:

```css
.clients-carousel__track {
    animation: clientsScroll 32s linear infinite;  /* ← cambia 32s */
}
```
Menor número = más rápido; mayor = más lento.

### Cambiar el tamaño de los logos/tarjetas
En `css/style.css`, bloque `.client-logo` (desktop) y los media queries:

```css
.client-logo {
    width: clamp(260px, 20vw, 300px);
    height: clamp(160px, 12vw, 180px);
}
```

La escala individual de cada logo está en los bloques `.client-* .client-logo__img`.

### Cambiar colores de marca
En `css/style.css`, dentro de `:root` (ver sección 4). Al cambiar una variable se actualiza en toda la web.

---

## 11. RESPONSIVE

La web se adapta a los breakpoints:

| Breakpoint | Ajustes clave |
|---|---|
| **> 1024px** | Layout desktop completo, menú horizontal |
| **≤ 1024px** | Menú hamburguesa, grids a 2 columnas, tarjetas de logos más pequeñas |
| **≤ 768px** | Grids a 1 columna, contacto a 1 columna, carrusel compacto |
| **≤ 480px** | Botones apilados, botón WhatsApp reducido, carrusel aún más compacto |

Sin overflow horizontal del `body`: el carrusel está contenido en su sección.

---

## 12. ACCESIBILIDAD

- HTML semántico: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`.
- `alt` descriptivos en todas las imágenes.
- `aria-label` en acciones sin texto visible.
- `aria-hidden="true"` en el segundo grupo de logos del carrusel (evita duplicar lectores de pantalla).
- Menú móvil usable por teclado (`Escape` para cerrar, anclas accesibles).
- `:focus-visible` visible en todos los elementos interactivos.
- Contraste adecuado entre texto y fondo.
- `prefers-reduced-motion` respetado (se desactivan animaciones y el carrusel automático).
- Tabs del showcase operables por teclado (flechas + Home/End).

---

## 13. SEO

- `lang="es"`.
- `<title>`: "Software ERP en Perú | NAVASOFT - EKAM Perú".
- `meta description` y `meta keywords`.
- Open Graph básico (og:title, og:description, og:type, og:url, og:locale, og:site_name).
- Twitter Cards.
- Favicon configurado.
- Un solo `<h1>` principal en el hero.
- Estructura de encabezados jerárquica.

---

## 14. RENDIMIENTO

- Sin librerías externas pesadas.
- Fonts con `preconnect` + `display=swap` (y fallback local).
- `loading="lazy"` en imágenes que están fuera del viewport inicial.
- `loading="eager"` implícito en logos del carrusel (área visible).
- Animaciones por CSS `transform` (GPU) — `will-change: transform` en el carrusel.
- Sin JS innecesario cuando CSS basta.

---

## 15. ESTADO DE GIT

- Repositorio inicializado en rama **`main`**.
- Working tree limpio tras cada commit.
- **No hay remote configurado** (falta que el usuario proporcione la URL del repositorio remoto).

Para agregar el remoto cuando la URL esté disponible:

```bash
git remote add origin URL_DEL_REPOSITORIO
git push -u origin main
```

> Nunca usar `--force`.

---

## 16. PENDIENTES (información real de EKAM)

- [ ] Confirmar colores corporativos oficiales (ajustar `:root`).
- [ ] Sustituir mockups por **capturas reales** de NAVASOFT.
- [ ] Sustituir placeholders del visor `#navasoft` por imágenes reales.
- [ ] Confirmar métricas empresariales (usuarios, instalaciones, % de ahorro).
- [ ] Confirmar teléfono, correo y redes sociales.
- [ ] Configurar número oficial de WhatsApp (`WHATSAPP_NUMBER`).
- [ ] Integrar el formulario con un backend real.
- [ ] Agregar logos de clientes faltantes (validar con EKAM).
- [ ] Validar contenido y textos con la empresa.
- [ ] Definir futura integración con la tecnología del sitio de producción.

---

## 17. LOG DE COMMITS

| Commit | Descripción |
|---|---|
| `016bf38` | chore: initialize EKAM 2026 website |
| `1c61aa8` | feat: build EKAM 2026 homepage redesign |
| `7b2be45` | feat: integrate EKAM and NAVASOFT official logos |
| `1381a1d` | feat: add client logos carousel |
| `eac72b5` | feat: enhance clients carousel with color logos and infinite loop |
| `a420e21` | feat: enlarge client logos and adjust card proportions |

---

*Documento generado como parte de la propuesta de rediseño 2026 · EKAM PERÚ / NAVASOFT.*
