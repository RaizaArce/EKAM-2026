(function () {
    'use strict';

    const WHATSAPP_NUMBER = '51949882756';

    const sectors = {
        agroindustria: {
            title: 'Agroindustria',
            kicker: 'Gestión integrada para operaciones agroindustriales y agroexportadoras',
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
        grifos: {
            title: 'Grifos',
            kicker: 'Control de ventas, combustibles y caja por turnos',
            description: 'EKAM Perú implementa NAVASOFT para ordenar las ventas, el control de combustibles y productos, la caja y la facturación electrónica de estaciones de servicio.',
            needs: ['Ventas y facturación electrónica', 'Control de combustibles y productos', 'Caja y cierres por turno', 'Compras y proveedores', 'Información contable'],
            modules: ['Ventas', 'Almacén', 'Tesorería', 'Logística', 'Contabilidad'],
            metricOne: ['Ventas y caja', 'Control por turno'],
            metricTwo: ['Inventario', 'Seguimiento diario']
        },
        construccion: {
            title: 'Construcción',
            kicker: 'Costos, compras y almacenes por obra',
            description: 'EKAM Perú configura NAVASOFT para controlar requerimientos, compras, almacenes de obra, costos y la información contable de empresas constructoras.',
            needs: ['Control de costos por obra', 'Requerimientos y compras', 'Almacén de materiales', 'Facturación y cobranzas', 'Información contable'],
            modules: ['Logística', 'Almacén', 'Ventas', 'Tesorería', 'Contabilidad'],
            metricOne: ['Costos por obra', 'Control integrado'],
            metricTwo: ['Materiales', 'Seguimiento diario']
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
            description: 'EKAM Perú también atiende asociaciones, organizaciones sin fines de lucro y otros rubros. Analizamos cada operación para definir la configuración adecuada de NAVASOFT.',
            needs: ['Diagnóstico de procesos', 'Integración de áreas', 'Control administrativo', 'Información centralizada', 'Acompañamiento especializado'],
            modules: ['Logística', 'Ventas', 'Almacén', 'Tesorería', 'Contabilidad'],
            metricOne: ['Procesos clave', 'Configuración adaptada'],
            metricTwo: ['Información', 'Gestión centralizada']
        }
    };

    // Ilustracion propia por sector (sin fotos externas): icono lineal sobre degradado de marca.
    const sectorVisuals = {
        agroindustria: '<path d="M7 20h10"/><path d="M12 20v-9"/><path d="M12 11c0-4-3-6-7-6 0 4 3 6 7 6z"/><path d="M12 11c0-3.5 2.5-6 7-6 0 4-3 6-7 6z"/>',
        industria: '<path d="M2 20h20"/><path d="M4 20V9l5 3V9l5 3V9l5 3v8"/><path d="M8 16h1M12 16h1M16 16h1"/>',
        comercio: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
        grifos: '<path d="M3 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M2 22h14"/><path d="M15 9h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V8l-3-3"/><path d="M6 7h6"/>',
        construccion: '<path d="M2 21h20"/><path d="M6 21V3h2l12 4H8"/><path d="M18 7v5"/><rect x="16" y="12" width="4" height="3"/><path d="M6 11h2M6 15h2"/>',
        transporte: '<path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
        salud: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/><path d="M12 9v6M9 12h6"/>',
        educacion: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
        "hoteles-restaurantes": '<path d="M3 21V7l9-4 9 4v14"/><path d="M9 21v-5h6v5"/><path d="M8 9h.01M12 9h.01M16 9h.01M8 13h.01M12 13h.01M16 13h.01"/>',
        servicios: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
        otros: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>'
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

    const sectorAliases = { agroexportacion: 'agroindustria' };

    function renderSector(key, shouldFocus, shouldUpdateUrl) {
        key = sectorAliases[key] || key;
        const sector = sectors[key] || sectors.agroindustria;
        const selectedKey = sectors[key] ? key : 'agroindustria';

        elements.detail.classList.add('is-changing');

        window.setTimeout(function () {
            elements.title.textContent = sector.title;
            elements.kicker.textContent = sector.kicker;
            elements.description.textContent = sector.description;
            elements.needs.replaceChildren.apply(elements.needs, listItems(sector.needs));
            elements.modules.replaceChildren.apply(elements.modules, listItems(sector.modules));
            elements.visual.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + sectorVisuals[selectedKey] + '</svg>';
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
    renderSector(initial || 'agroindustria', false, false);
}());
