/* ============================================
   EKAM 2026 - Página de clientes
   Selector de sector: filtra la grilla de logos
   ============================================ */

(function () {
    'use strict';

    const grid = document.getElementById('clientsGrid');
    const lema = document.getElementById('clientsLema');
    const filters = document.querySelectorAll('.clients-filter');
    if (!grid || !lema || !filters.length) return;

    const cards = grid.querySelectorAll('.client-card');
    const strip = filters[0].closest('ul');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Contadores calculados desde la grilla, para que no se desfasen al agregar clientes
    filters.forEach(function (f) {
        const count = f.dataset.sector === 'todos' ? cards.length : grid.querySelectorAll('[data-sector="' + f.dataset.sector + '"]').length;
        const b = f.querySelector('b');
        if (b) b.textContent = count;
    });
    const lemaTodos = lema.textContent.replace(/^\d+/, cards.length);
    lema.textContent = lemaTodos;

    // Tarjeta que invita a sumarse cuando un sector deja la última fila incompleta
    const invite = document.createElement('li');
    invite.className = 'client-card client-card--invite';
    invite.innerHTML = '<p>¿Tu empresa es de este rubro?<br><a href="../index.html#contacto">Sé la próxima</a></p>';

    function centerTab(button) {
        if (strip.scrollWidth <= strip.clientWidth) return;
        strip.scrollTo({
            left: button.offsetLeft - (strip.clientWidth - button.offsetWidth) / 2,
            behavior: reduceMotion.matches ? 'auto' : 'smooth'
        });
    }

    function select(sector, updateUrl) {
        let button = Array.prototype.find.call(filters, function (f) { return f.dataset.sector === sector; });
        if (!button) {
            button = filters[0];
            sector = 'todos';
        }

        filters.forEach(function (f) {
            f.setAttribute('aria-pressed', f === button ? 'true' : 'false');
        });

        let order = 0;
        let shown = 0;
        cards.forEach(function (card) {
            const visible = sector === 'todos' || card.dataset.sector === sector;
            card.hidden = !visible;
            if (visible) shown += 1;
            card.classList.remove('client-card--enter');
            if (visible && !reduceMotion.matches) {
                card.style.setProperty('--enter-delay', Math.min(order, 12) * 28 + 'ms');
                order += 1;
            }
        });
        grid.classList.toggle('clients-grid--all', sector === 'todos');

        if (sector !== 'todos' && shown % 4 !== 0) {
            grid.appendChild(invite);
        } else if (invite.parentNode) {
            invite.remove();
        }

        if (!reduceMotion.matches) {
            void grid.offsetWidth;
            cards.forEach(function (card) {
                if (!card.hidden) card.classList.add('client-card--enter');
            });
        }

        if (sector === 'todos') {
            lema.textContent = lemaTodos;
        } else {
            lema.textContent = button.dataset.lema + ' ';
            const link = document.createElement('a');
            link.href = button.dataset.pagina;
            link.textContent = 'Ver la solución';
            lema.appendChild(link);
        }

        centerTab(button);

        if (updateUrl) {
            history.replaceState(null, '', sector === 'todos' ? location.pathname : '#' + sector);
        }
    }

    filters.forEach(function (button) {
        button.addEventListener('click', function () {
            select(button.dataset.sector, true);
        });
    });

    // En pantallas táctiles la tarjeta gira con un toque
    grid.addEventListener('click', function (e) {
        if (window.matchMedia('(hover: hover)').matches) return;
        const card = e.target.closest('.client-card:not(.client-card--invite)');
        if (!card) return;
        cards.forEach(function (c) { if (c !== card) c.classList.remove('is-flipped'); });
        card.classList.toggle('is-flipped');
    });

    window.addEventListener('hashchange', function () {
        select(location.hash.slice(1), false);
    });

    if (location.hash) {
        select(location.hash.slice(1), false);
    }
})();
