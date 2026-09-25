(function () {
    'use strict';

    const WHATSAPP_NUMBER = '51949882756';

    const sectors = {
        agroexportacion: {
            title: 'Agroexportación',
            kicker: 'Gestión integrada para operaciones agroexportadoras',
            description: 'EKAM Perú implementa NAVASOFT para conectar el control de insumos, compras, producción, costos y la información administrativa de tu operación.',
            needs: ['Control de insumos e inventarios', 'Requerimientos y compras', 'Seguimiento de producción', 'Control de costos', 'Información contable'],
            modules: ['Logística', 'Almacén', 'Producción', 'Tesorería', 'Contabilidad'],
            metricOne: ['Insumos y compras', 'Control integrado'],
            metricTwo: ['Producción y costos', 'Seguimiento diario']
        },
        industria: {
            title: 'Industria',
            kicker: 'Control para producción, costos y almacenes',
            description: 'EKAM Perú configura NAVASOFT para integrar las áreas operativas y administrativas de empresas industriales en una sola solución.',
            needs: ['Materias primas y suministros', 'Órdenes y consumo de producción', 'Costos de producto terminado', 'Inventarios y despachos', 'Información administrativa'],
            modules: ['Producción', 'Almacén', 'Logística', 'Contabilidad', 'Business Intelligence'],
            metricOne: ['Producción', 'Procesos conectados'],
            metricTwo: ['Costos e inventario', 'Información al día']
        },
        comercio: {
            title: 'Comercio',
            kicker: 'Ventas, inventario y facturación en una sola gestión',
            description: 'EKAM Perú implementa NAVASOFT para centralizar las ventas, el stock, las compras, la caja y la facturación de empresas comerciales.',
            needs: ['Ventas y punto de venta', 'Control de stock', 'Compras y proveedores', 'Cuentas por cobrar', 'Facturación electrónica'],
            modules: ['Ventas', 'Almacén', 'Logística', 'Tesorería', 'Contabilidad'],
            metricOne: ['Ventas y facturación', 'Control integrado'],
            metricTwo: ['Stock disponible', 'Seguimiento diario']
        },
        transporte: {
            title: 'Transporte',
            kicker: 'Información centralizada para la gestión administrativa',
            description: 'EKAM Perú adapta NAVASOFT para ordenar la gestión comercial, las compras, la tesorería, los almacenes y la contabilidad de empresas de transporte.',
            needs: ['Compras y requerimientos', 'Control de almacén', 'Ventas y facturación', 'Caja y bancos', 'Información contable'],
            modules: ['Logística', 'Almacén', 'Ventas', 'Tesorería', 'Contabilidad'],
            metricOne: ['Operación comercial', 'Control integrado'],
            metricTwo: ['Caja y almacén', 'Seguimiento diario']
        },
        salud: {
            title: 'Salud',
            kicker: 'Gestión administrativa para clínicas y centros médicos',
            description: 'EKAM Perú implementa NAVASOFT para integrar inventarios, compras, facturación, tesorería y contabilidad en organizaciones del sector salud.',
            needs: ['Inventario de suministros', 'Compras y proveedores', 'Facturación y cobranzas', 'Caja y bancos', 'Reportes administrativos'],
            modules: ['Almacén', 'Logística', 'Ventas', 'Tesorería', 'Contabilidad'],
            metricOne: ['Facturación y cobros', 'Control integrado'],
            metricTwo: ['Suministros', 'Información al día']
        },
        educacion: {
            title: 'Educación',
            kicker: 'Administración organizada para instituciones educativas',
            description: 'EKAM Perú configura NAVASOFT para integrar la facturación, las cuentas por cobrar, la tesorería y la contabilidad de instituciones educativas.',
            needs: ['Facturación', 'Cuentas por cobrar', 'Caja y bancos', 'Compras y proveedores', 'Información contable'],
            modules: ['Ventas', 'Tesorería', 'Logística', 'Contabilidad', 'Business Intelligence'],
            metricOne: ['Facturación y cobros', 'Control integrado'],
            metricTwo: ['Tesorería', 'Seguimiento diario']
        },
        'hoteles-restaurantes': {
            title: 'Hoteles y restaurantes',
            kicker: 'Solución ERP para tu sector',
            description: 'EKAM Perú implementa NAVASOFT según las necesidades de tu operación, configura los módulos, capacita a tu equipo y acompaña el uso de la solución.',
            needs: ['Ventas y facturación', 'Control de inventarios', 'Compras y proveedores', 'Caja y tesorería', 'Reportes para la gestión'],
            modules: ['Ventas', 'Almacén', 'Logística', 'Tesorería', 'Contabilidad'],
            metricOne: ['Ventas y facturación', 'Control integrado'],
            metricTwo: ['Inventario', 'Seguimiento diario']
        },
        servicios: {
            title: 'Empresas de servicios',
            kicker: 'Control comercial y administrativo para tu operación',
            description: 'EKAM Perú implementa NAVASOFT para organizar cotizaciones, ventas, cobranzas, tesorería y contabilidad en empresas que brindan servicios.',
            needs: ['Cotizaciones y ventas', 'Gestión de clientes', 'Facturación electrónica', 'Cuentas por cobrar', 'Información financiera'],
            modules: ['Ventas', 'CRM', 'Tesorería', 'Contabilidad', 'Business Intelligence'],
            metricOne: ['Ventas y clientes', 'Control integrado'],
            metricTwo: ['Cobranzas', 'Seguimiento diario']
        },
        otros: {
            title: 'Otros sectores',
            kicker: 'Una implementación adaptada a los procesos de tu empresa',
            description: 'EKAM Perú también atiende organizaciones de construcción, asociaciones, estaciones de servicio y otros rubros. Analizamos cada operación para definir la configuración adecuada de NAVASOFT.',
            needs: ['Diagnóstico de procesos', 'Integración de áreas', 'Control administrativo', 'Información centralizada', 'Acompañamiento especializado'],
            modules: ['Logística', 'Ventas', 'Almacén', 'Tesorería', 'Contabilidad'],
            metricOne: ['Procesos clave', 'Configuración adaptada'],
            metricTwo: ['Información', 'Gestión centralizada']
        }
    };

    const sectorVisuals = {
        agroexportacion: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=82',
        industria: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1600&q=82',
        comercio: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=82',
        transporte: 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=1600&q=82',
        salud: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1600&q=82',
        educacion: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=82',
        'hoteles-restaurantes': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=82',
        servicios: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=82',
        otros: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=82'
    };

    const elements = {
        tabs: document.getElementById('sectorTabs'),
        detail: document.getElementById('sectorDetail'),
        title: document.getElementById('sectorTitle'),
        kicker: document.getElementById('sectorKicker'),
        description: document.getElementById('sectorDescription'),
        needs: document.getElementById('sectorNeeds'),
        modules: document.getElementById('sectorModules'),
        visual: document.getElementById('sectorVisual'),
        chips: document.getElementById('sectorChips'),
        whatsapp: document.getElementById('sectorWhatsapp'),
        floatingWhatsapp: document.getElementById('floatingWhatsapp')
    };

    var VISUAL_FALLBACK = 'assets/screenshots/navasoft-general.jpeg';
    var visualFallbackApplied = false;

    elements.visual.addEventListener('error', function () {
        if (visualFallbackApplied) return;
        visualFallbackApplied = true;
        elements.visual.src = VISUAL_FALLBACK;
    });

    function listItems(items) {
        return items.map(function (item) {
            const li = document.createElement('li');
            li.textContent = item;
            return li;
        });
    }

    function chips(items) {
        return items.slice(0, 3).map(function (item) {
            const chip = document.createElement('span');
            chip.textContent = item;
            return chip;
        });
    }

    function whatsappUrl(sectorTitle) {
        const message = 'Hola, me interesa conocer cómo EKAM Perú puede implementar NAVASOFT para una empresa del sector ' + sectorTitle + '. Quisiera recibir más información.';
        return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
    }

    function renderSector(key, shouldFocus, shouldUpdateUrl) {
        const sector = sectors[key] || sectors.agroexportacion;
        const selectedKey = sectors[key] ? key : 'agroexportacion';

        elements.detail.classList.add('is-changing');

        window.setTimeout(function () {
            elements.title.textContent = sector.title;
            elements.kicker.textContent = sector.kicker;
            elements.description.textContent = sector.description;
            elements.needs.replaceChildren.apply(elements.needs, listItems(sector.needs));
            elements.modules.replaceChildren.apply(elements.modules, listItems(sector.modules));
            elements.visual.src = sectorVisuals[selectedKey];
            elements.visual.alt = 'Pantalla de NAVASOFT para ' + sector.title;
            elements.chips.replaceChildren.apply(elements.chips, chips(sector.modules));

            const url = whatsappUrl(sector.title);
            elements.whatsapp.href = url;
            elements.floatingWhatsapp.href = url;
            elements.floatingWhatsapp.setAttribute('aria-label', 'Consultar por WhatsApp sobre ' + sector.title);

            document.querySelectorAll('.sector-tab').forEach(function (tab) {
                const isSelected = tab.dataset.sector === selectedKey;
                tab.setAttribute('aria-selected', String(isSelected));
                tab.tabIndex = isSelected ? 0 : -1;
                if (isSelected) {
                    tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    if (shouldFocus) tab.focus({ preventScroll: true });
                }
            });

            if (shouldUpdateUrl) {
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('sector', selectedKey);
                window.history.replaceState({}, '', newUrl);
            }
            document.title = sector.title + ' | Soluciones por sector | EKAM Perú';
            elements.detail.classList.remove('is-changing');
        }, 90);
    }

    elements.tabs.addEventListener('click', function (event) {
        const tab = event.target.closest('.sector-tab');
        if (tab) renderSector(tab.dataset.sector, false, true);
    });

    elements.tabs.addEventListener('keydown', function (event) {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const tabs = Array.from(elements.tabs.querySelectorAll('.sector-tab'));
        const current = tabs.indexOf(document.activeElement);
        let next = current;
        if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        renderSector(tabs[next].dataset.sector, true, true);
    });

    document.getElementById('sectorPrev').addEventListener('click', function () {
        elements.tabs.scrollBy({ left: -300, behavior: 'smooth' });
    });

    document.getElementById('sectorNext').addEventListener('click', function () {
        elements.tabs.scrollBy({ left: 300, behavior: 'smooth' });
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
        const willOpen = !mainNav.classList.contains('header__nav--open');
        if (!willOpen) return closeMenu();
        mainNav.classList.add('header__nav--open');
        menuToggle.classList.add('header__toggle--active');
        menuToggle.setAttribute('aria-expanded', 'true');
        overlay.classList.add('mobile-overlay--active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    });

    overlay.addEventListener('click', closeMenu);
    mainNav.addEventListener('click', function (event) {
        if (event.target.closest('a') && window.innerWidth <= 1024) closeMenu();
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && mainNav.classList.contains('header__nav--open')) closeMenu();
    });

    const initial = new URLSearchParams(window.location.search).get('sector');
    renderSector(initial && sectors[initial] ? initial : 'agroexportacion', false, false);
}());
