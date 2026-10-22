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
    const lemaTodos = lema.textContent;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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
        cards.forEach(function (card) {
            const visible = sector === 'todos' || card.dataset.sector === sector;
            card.hidden = !visible;
            card.classList.remove('client-card--enter');
            if (visible && !reduceMotion.matches) {
                card.style.setProperty('--enter-delay', Math.min(order, 12) * 28 + 'ms');
                order += 1;
            }
        });
        grid.classList.toggle('clients-grid--all', sector === 'todos');

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

        if (updateUrl) {
            history.replaceState(null, '', sector === 'todos' ? location.pathname : '#' + sector);
        }
    }

    filters.forEach(function (button) {
        button.addEventListener('click', function () {
            select(button.dataset.sector, true);
            if (window.innerWidth <= 900) {
                button.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
            }
        });
    });

    if (location.hash) {
        select(location.hash.slice(1), false);
    }
})();
