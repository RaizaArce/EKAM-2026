/* ============================================
   EKAM 2026 - Bolsa de trabajo
   Las convocatorias y las postulaciones pasan por el conector de Google
   (crm/google/bolsa-de-trabajo/Code.gs). Para cambiar de cuenta, solo se
   cambia BOLSA_ENDPOINT.
   ============================================ */

(function () {
    'use strict';

    const BOLSA_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzaFLc51wcjdedjiHRADMJWHINTjEOV4VrfkTydjNht8Zvj7Xu6ugPeFjKDIDsIJa85/exec';
    const MAX_CV = 5 * 1024 * 1024;

    const list = document.getElementById('jobsList');
    const hint = document.getElementById('jobsHint');
    const form = document.getElementById('applyForm');
    if (!list || !form) return;

    const jobSelect = document.getElementById('applyJob');
    const areaSelect = document.getElementById('applyArea');
    const status = document.getElementById('applyStatus');
    const submit = document.getElementById('applySubmit');
    const viewer = document.getElementById('posterViewer');
    const viewerImg = document.getElementById('posterViewerImg');
    const viewerTitle = document.getElementById('posterViewerTitle');
    const startedAt = Date.now();
    let solicitudId = null;
    let current = null;

    /* ---- Convocatorias ---- */
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

    function fechaLarga(iso) {
        const p = (iso || '').split('-').map(Number);
        if (p.length !== 3) return '';
        const d = new Date(p[0], p[1] - 1, p[2]);
        return dias[d.getDay()] + ' ' + d.getDate() + ' de ' + meses[d.getMonth()];
    }

    function el(tag, attrs, text) {
        const node = document.createElement(tag);
        Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
        if (text) node.textContent = text;
        return node;
    }

    function selectJob(job) {
        jobSelect.value = job.puesto;
        if (job.area) areaSelect.value = job.area;
    }

    function renderJob(job) {
        const li = el('li', { class: 'job' });

        const poster = el('button', { type: 'button', class: 'job__poster', 'aria-label': 'Ampliar el afiche de ' + job.puesto });
        const img = el('img', { referrerpolicy: 'no-referrer', alt: 'Afiche de la convocatoria: ' + job.puesto + (job.ciudad ? ' en ' + job.ciudad : ''), width: '720', height: '1080', loading: 'lazy', decoding: 'async' });
        img.src = job.aficheMini;
        const zoom = el('span', { class: 'job__zoom' }, 'Ampliar afiche');
        poster.append(img, zoom);
        poster.addEventListener('click', function () {
            current = job;
            viewerImg.referrerPolicy = 'no-referrer';
            viewerImg.src = job.afiche;
            viewerImg.alt = 'Afiche completo de la convocatoria: ' + job.puesto;
            viewerTitle.textContent = job.puesto;
            viewer.classList.remove('is-zoomed');
            viewer.showModal();
        });

        const body = el('div', { class: 'job__body' });
        body.append(el('h3', { class: 'job__title' }, job.puesto));
        const meta = el('ul', { class: 'job__meta' });
        [job.area, job.ciudad].filter(Boolean).forEach(function (m) { meta.append(el('li', null, m)); });
        body.append(meta);
        if (job.cierre) {
            const deadline = el('p', { class: 'job__deadline' }, 'Postula hasta el ');
            deadline.append(el('strong', null, fechaLarga(job.cierre)));
            body.append(deadline);
        }
        const apply = el('a', { href: '#postular', class: 'btn btn--primary job__apply' }, 'Postular a esta convocatoria');
        apply.addEventListener('click', function () { selectJob(job); });
        body.append(apply);

        li.append(poster, body);
        return li;
    }

    function renderEmpty(text) {
        list.replaceChildren(el('li', { class: 'jobs__empty' }, text));
        if (hint) hint.hidden = true;
    }

    fetch(BOLSA_ENDPOINT)
        .then(function (r) { return r.json(); })
        .then(function (data) {
            const jobs = (data && data.ofertas) || [];
            if (!jobs.length) {
                renderEmpty('Por ahora no hay convocatorias abiertas. Déjanos tu CV en la bolsa general y te avisaremos cuando aparezca una oportunidad.');
                return;
            }
            list.replaceChildren.apply(list, jobs.map(renderJob));
            jobs.slice().reverse().forEach(function (job) {
                const opt = el('option', { value: job.puesto, 'data-area': job.area || '' }, job.puesto + (job.ciudad ? ' · ' + job.ciudad : ''));
                jobSelect.insertBefore(opt, jobSelect.firstChild);
            });
            jobSelect.selectedIndex = 0;
            if (jobs[0].area) areaSelect.value = jobs[0].area;
        })
        .catch(function () {
            renderEmpty('No pudimos cargar las convocatorias en este momento. Igual puedes dejar tu CV en la bolsa general.');
        })
        .finally(function () { list.removeAttribute('aria-busy'); });

    jobSelect.addEventListener('change', function () {
        const area = jobSelect.selectedOptions[0] && jobSelect.selectedOptions[0].dataset.area;
        if (area) areaSelect.value = area;
    });

    /* ---- Visor del afiche ---- */
    viewerImg.addEventListener('click', function () { viewer.classList.toggle('is-zoomed'); });
    document.getElementById('posterViewerClose').addEventListener('click', function () { viewer.close(); });
    viewer.addEventListener('click', function (e) { if (e.target === viewer) viewer.close(); });
    document.getElementById('posterViewerApply').addEventListener('click', function () {
        if (current) selectJob(current);
        viewer.close();
    });

    /* ---- Postulación ---- */
    function setStatus(text, ok) {
        status.textContent = text;
        status.classList.toggle('apply-form__status--ok', !!ok);
    }

    function leerPdf(file) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.onload = function () { resolve(String(reader.result).split(',')[1] || ''); };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        const cv = form.cv.files[0];
        if (!cv || cv.size > MAX_CV || !/\.pdf$/i.test(cv.name)) {
            setStatus('El CV debe ser un archivo PDF de máximo 5 MB.');
            form.cv.focus();
            return;
        }

        submit.disabled = true;
        if (!solicitudId) {
            solicitudId = window.crypto && typeof window.crypto.randomUUID === 'function'
                ? window.crypto.randomUUID()
                : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2) + '-' + Math.random().toString(36).slice(2);
        }
        setStatus('Enviando tu postulación…');

        leerPdf(cv).then(function (data) {
            const payload = {
                solicitudId: solicitudId,
                website: form.website.value,
                elapsed: Date.now() - startedAt,
                convocatoria: jobSelect.value,
                area: areaSelect.value,
                nombres: form.nombres.value,
                apellidos: form.apellidos.value,
                correo: form.correo.value,
                whatsapp: form.whatsapp.value,
                ciudad: form.ciudad.value,
                universidad: form.universidad.value,
                especialidad: form.especialidad.value,
                egreso: form.egreso.value,
                navasoft: (form.querySelector('input[name="navasoft"]:checked') || {}).value || '',
                consentimiento: form.consentimiento.checked,
                compartir: form.compartir.checked,
                cv: { name: cv.name, type: cv.type, data: data }
            };
            // text/plain evita la consulta previa (CORS) que Apps Script no responde
            return fetch(BOLSA_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
        })
            .then(function (r) { return r.json(); })
            .then(function (res) {
                if (res && res.ok) {
                    solicitudId = null;
                    form.reset();
                    setStatus('¡Gracias! Recibimos tu postulación. Si tu perfil encaja, te contactaremos por WhatsApp o correo.', true);
                } else {
                    setStatus((res && res.error) || 'No pudimos enviar tu postulación. Inténtalo en unos minutos.');
                }
            })
            .catch(function () {
                setStatus('No pudimos enviar tu postulación. Revisa tu conexión e inténtalo otra vez.');
            })
            .finally(function () { submit.disabled = false; });
    });
})();
