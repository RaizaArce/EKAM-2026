(function () {
    'use strict';

    const WHATSAPP_NUMBER = '51940455332';
    const solutions = {
        erp: {
            title: 'ERP NAVASOFT para empresas',
            summary: 'Una solución para centralizar las operaciones de tu empresa. EKAM Perú analiza las áreas involucradas y configura NAVASOFT para conectar la información que necesita tu equipo.',
            capabilities: ['Inventarios y almacenes', 'Compras y logística', 'Ventas y cobranzas', 'Tesorería y bancos'],
            areas: ['Administración', 'Comercial', 'Operaciones', 'Contabilidad'],
            image: 'assets/screenshots/navasoft-general.jpeg',
            alt: 'Pantalla principal de NAVASOFT ERP con accesos a los módulos empresariales',
            caption: 'Vista referencial de NAVASOFT ERP'
        },
        facturacion: {
            title: 'Facturación electrónica',
            summary: 'EKAM Perú configura NAVASOFT para emitir comprobantes electrónicos y ordenar el proceso de facturación de acuerdo con la operación de tu empresa.',
            capabilities: ['Facturas y boletas', 'Notas de crédito y débito', 'Seguimiento de comprobantes', 'Consulta de documentos emitidos'],
            areas: ['Ventas', 'Caja', 'Cobranzas', 'Contabilidad'],
            image: 'assets/screenshots/navasoft-facturacion.jpeg',
            alt: 'Pantalla de facturación electrónica en NAVASOFT',
            caption: 'Facturación electrónica desde NAVASOFT'
        },
        contabilidad: {
            title: 'Contabilidad',
            summary: 'Organiza la información contable y financiera de tu empresa con una implementación que puede conectarse con las áreas operativas del ERP.',
            capabilities: ['Libros y reportes contables', 'Estados financieros', 'Centros de costo', 'Conciliación y control de cuentas'],
            areas: ['Contabilidad', 'Tesorería', 'Compras', 'Ventas'],
            image: 'assets/screenshots/navasoft-contabilidad.jpeg',
            alt: 'Pantalla del módulo de contabilidad de NAVASOFT',
            caption: 'Gestión contable en NAVASOFT'
        },
        navamovil: {
            title: 'NavaMóvil',
            summary: 'Una aplicación móvil para apoyar la gestión comercial desde dispositivos móviles y mantener conectada la información con NAVASOFT.',
            capabilities: ['Consulta de productos y stock', 'Registro y seguimiento de cotizaciones', 'Pedidos y ventas', 'Consulta de documentos comerciales'],
            areas: ['Ventas', 'Atención al cliente', 'Supervisión comercial', 'Operaciones'],
            image: 'assets/images/navamovil-funcionalidades.png',
            alt: 'Principales funcionalidades de NavaMóvil: productos, cotizaciones y pedidos desde dispositivos móviles',
            caption: 'Funciones comerciales disponibles en NavaMóvil'
        },
        hoteles: {
            title: 'Soluciones para hoteles y restaurantes',
            summary: 'EKAM Perú adapta NAVASOFT para apoyar la gestión de reservas, habitaciones, ventas, caja, inventario y la información administrativa de establecimientos de hospitalidad.',
            capabilities: ['Reservas, check-in y check-out', 'Estado de habitaciones', 'Consumos, ventas y facturación', 'Reportes de control operativo'],
            areas: ['Recepción', 'Caja', 'Almacén', 'Administración'],
            image: 'assets/screenshots/navasoft-ventas.jpeg',
            alt: 'Pantalla de ventas de NAVASOFT como referencia de la gestión integrada para hoteles y restaurantes',
            caption: 'Gestión integrada para hoteles y restaurantes'
        },
        activos: {
            title: 'Gestión de activos fijos',
            summary: 'Mantén organizada la información de tus activos fijos y los procesos asociados a su control, depreciación, movimientos y consulta de reportes.',
            capabilities: ['Catálogo y clasificación de activos', 'Depreciación mensual', 'Bajas, revaluaciones y traslados', 'Control de mantenimiento y reportes'],
            areas: ['Administración', 'Contabilidad', 'Mantenimiento', 'Gerencia'],
            image: 'assets/screenshots/navasoft-contabilidad.jpeg',
            alt: 'Pantalla de NAVASOFT como referencia de información administrativa y contable',
            caption: 'Control de activos integrado con la gestión administrativa'
        }
    };

    const detail = document.getElementById('detalle');
    const title = document.getElementById('solutionDetailTitle');
    const summary = document.getElementById('solutionSummary');
    const capabilities = document.getElementById('solutionCapabilities');
    const areas = document.getElementById('solutionAreas');
    const image = document.getElementById('solutionImage');
    const caption = document.getElementById('solutionImageCaption');
    const whatsapp = document.getElementById('solutionWhatsApp');
    const floatingWhatsapp = document.getElementById('floatingWhatsapp');

    function createItems(items) {
        return items.map(function (item) {
            const element = document.createElement('li');
            element.textContent = item;
            return element;
        });
    }

    function messageUrl(solution) {
        const message = 'Hola, me interesa conocer cómo EKAM Perú puede implementar NAVASOFT para ' + solution.title + '. Quisiera solicitar más información.';
        return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
    }

    function renderSolution(key, scrollToDetail) {
        const selectedKey = solutions[key] ? key : 'erp';
        const solution = solutions[selectedKey];
        title.textContent = solution.title;
        summary.textContent = solution.summary;
        capabilities.replaceChildren.apply(capabilities, createItems(solution.capabilities));
        areas.replaceChildren.apply(areas, createItems(solution.areas));
        image.src = solution.image;
        image.alt = solution.alt;
        image.classList.toggle('solution-detail__image--contain', selectedKey === 'navamovil');
        caption.textContent = solution.caption;

        const url = messageUrl(solution);
        whatsapp.href = url;
        floatingWhatsapp.href = url;
        floatingWhatsapp.setAttribute('aria-label', 'Consultar ' + solution.title + ' por WhatsApp');
        document.querySelectorAll('.solution-card').forEach(function (card) {
            const isSelected = card.dataset.solution === selectedKey;
            card.toggleAttribute('aria-current', isSelected);
        });

        const locationUrl = new URL(window.location.href);
        locationUrl.searchParams.set('solucion', selectedKey);
        window.history.replaceState({}, '', locationUrl);
        document.title = solution.title + ' | Soluciones ERP | EKAM Perú';
        if (scrollToDetail) detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    document.getElementById('solutionCards').addEventListener('click', function (event) {
        const card = event.target.closest('.solution-card');
        if (!card) return;
        event.preventDefault();
        renderSolution(card.dataset.solution, true);
    });

    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const overlay = document.getElementById('mobileOverlay');
    function closeMenu() {
        mainNav.classList.remove('header__nav--open');
        menuToggle.classList.remove('header__toggle--active');
        menuToggle.setAttribute('aria-expanded', 'false');
        overlay.classList.remove('mobile-overlay--active');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    menuToggle.addEventListener('click', function () {
        const open = !mainNav.classList.contains('header__nav--open');
        if (!open) return closeMenu();
        mainNav.classList.add('header__nav--open');
        menuToggle.classList.add('header__toggle--active');
        menuToggle.setAttribute('aria-expanded', 'true');
        overlay.classList.add('mobile-overlay--active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    });
    overlay.addEventListener('click', closeMenu);
    mainNav.addEventListener('click', function (event) { if (event.target.closest('a') && window.innerWidth <= 1024) closeMenu(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeMenu(); });

    const requested = new URLSearchParams(window.location.search).get('solucion');
    renderSolution(requested, Boolean(requested));
}());
