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
    const REFRESH_MS = 30000;

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
    let loaded = false;
    let refreshing = false;
    let jobsSignature = null;
    let configSignature = null;
    let extraFields = [];
    let formDirty = false;
    let pendingConfig = null;
    const configNotice = el('p', {class:'apply-form__hint', role:'status'});
    form.prepend(configNotice);
    form.addEventListener('input', function () { formDirty = true; });
    form.addEventListener('change', function () { formDirty = true; });

    function configureForm(fields) {
        if (!Array.isArray(fields)) return;
        const signature = JSON.stringify(fields);
        if (signature === configSignature) return;
        if (formDirty) {
            pendingConfig = fields;
            configNotice.replaceChildren(document.createTextNode('El formulario tiene cambios disponibles. Tus datos se conservarán. '));
            const update = el('button', {type:'button',class:'btn btn--secondary'}, 'Actualizar preguntas');
            update.addEventListener('click', function () { formDirty = false; configureForm(pendingConfig); formDirty = true; });
            configNotice.append(update);
            return;
        }
        const saved = {};
        form.querySelectorAll('[data-extra-field]').forEach(function(input){ saved[input.name] = input.value; });
        let extraSection = document.getElementById('extraQuestions');
        if (!extraSection) {
            extraSection = el('fieldset', {id:'extraQuestions'});
            form.querySelector('.apply-form__consent').before(extraSection);
        }
        extraSection.replaceChildren(el('legend', null, 'Información adicional'));
        extraFields = [];
        fields.forEach(function(c){
            if (!c || !/^[a-z][a-z0-9_]{1,39}$/.test(c.clave)) return;
            const extra = c.clave.indexOf('pregunta_') === 0;
            if (extra) {
                if (!c.visible) return;
                const wrapper = el('div', {class:'apply-form__field'});
                const id = 'extra_' + c.clave;
                wrapper.append(el('label',{for:id}, c.pregunta + (c.obligatorio ? ' *' : '')));
                const input = el(c.tipo === 'lista' ? 'select' : c.tipo === 'párrafo' ? 'textarea' : 'input', {id:id,name:c.clave,'data-extra-field':'true',class:c.tipo === 'lista'?'contact-form__select':'contact-form__input'});
                if (c.tipo === 'lista') {
                    input.append(el('option',{value:''}, 'Selecciona una opción'));
                    (c.opciones || []).forEach(function(v){input.append(el('option',{value:v},v));});
                } else if (c.tipo !== 'párrafo') input.type = ({'número':'number','correo':'email','teléfono':'tel'})[c.tipo] || 'text';
                input.required = !!c.obligatorio;
                input.maxLength = c.tipo === 'párrafo' ? 2000 : 160;
                if (c.tipo === 'número') input.step = 'any';
                if (saved[c.clave]) input.value = saved[c.clave];
                wrapper.append(input);
                if (c.ayuda) {const help=el('small',{id:id+'_help',class:'apply-form__hint'},c.ayuda);wrapper.append(help);input.setAttribute('aria-describedby',help.id);}
                extraSection.append(wrapper);
                extraFields.push(c.clave);
                return;
            }
            const inputs = Array.from(form.querySelectorAll('[name="'+c.clave+'"]'));
            if (!inputs.length) return;
            const wrapper = inputs[0].closest('.apply-form__field');
            if (!wrapper) return;
            wrapper.hidden = !c.visible;
            inputs.forEach(function(input){ input.disabled=!c.visible; input.required=!!c.visible && !!c.obligatorio && (input.type!=='radio' || input===inputs[0]); });
            const label = wrapper.querySelector('.apply-form__label') || wrapper.querySelector('label');
            if (label) label.textContent = c.pregunta + (c.obligatorio ? ' *' : '');
            if (c.clave === 'navasoft') {
                const group = wrapper.querySelector('.apply-form__levels');
                const previous = (group.querySelector(':checked') || {}).value;
                group.replaceChildren();
                (c.opciones || []).forEach(function(value,i){const l=el('label');const r=el('input',{type:'radio',name:'navasoft',value:value});r.required=!!c.visible&&!!c.obligatorio&&i===0;r.disabled=!c.visible;r.checked=value===previous;l.append(r,document.createTextNode(' '+value));group.append(l);});
            } else if (inputs[0].tagName === 'SELECT' && c.clave !== 'convocatoria') {
                const previous=inputs[0].value;
                inputs[0].replaceChildren();
                (c.opciones || []).forEach(function(value){inputs[0].append(el('option',{value:value},value));});
                if ((c.opciones || []).includes(previous)) inputs[0].value=previous;
            }
            let help=wrapper.querySelector('[data-config-help]');
            if (!help) {help=el('small',{'data-config-help':'true',id:'help_'+c.clave,class:'apply-form__hint'});wrapper.append(help);}
            help.textContent=c.ayuda || ''; help.hidden=!c.ayuda;
            inputs.forEach(function(input){if(c.ayuda)input.setAttribute('aria-describedby',help.id);else input.removeAttribute('aria-describedby');});
        });
        extraSection.hidden = !extraFields.length;
        extraSection.className = 'apply-form__extras';
        form.querySelectorAll('fieldset').forEach(function(section){
            const wrappers=Array.from(section.querySelectorAll('.apply-form__field'));
            if(wrappers.length) section.hidden=wrappers.every(function(w){return w.hidden;});
        });
        configSignature=signature; pendingConfig=null; configNotice.replaceChildren();
    }

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
        const option = Array.from(jobSelect.options).find(function (opt) { return opt.dataset.id === jobKey(job); });
        if (option) jobSelect.selectedIndex = option.index;
        if (job.area) areaSelect.value = job.area;
    }

    function jobKey(job) { return String(job.id || job.puesto + '|' + (job.ciudad || '')); }

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

    function updateJobs(jobs) {
        const signature = JSON.stringify(jobs);
        if (hint) {
            hint.textContent = 'Toca un afiche para verlo en grande.';
            hint.hidden = !jobs.length;
        }
        if (signature === jobsSignature) return;
        const previous = jobSelect.selectedOptions[0];
        const previousId = previous && previous.dataset.id;
        const firstLoad = !loaded;
        if (jobs.length) list.replaceChildren.apply(list, jobs.map(renderJob));
        else renderEmpty('Por ahora no hay convocatorias abiertas. Déjanos tu CV en la bolsa general y te avisaremos cuando aparezca una oportunidad.');

        const options = jobs.map(function (job) {
            return el('option', { value: job.puesto, 'data-id': jobKey(job), 'data-area': job.area || '' }, job.puesto + (job.ciudad ? ' · ' + job.ciudad : ''));
        });
        options.push(el('option', { value: 'Bolsa general', 'data-area': '' }, 'Bolsa general (sin convocatoria específica)'));
        jobSelect.replaceChildren.apply(jobSelect, options);
        const preserved = previousId && options.find(function (opt) { return opt.dataset.id === previousId; });
        jobSelect.selectedIndex = firstLoad ? 0 : preserved ? preserved.index : options.length - 1;
        if (firstLoad && jobs[0] && jobs[0].area) areaSelect.value = jobs[0].area;
        if (previousId && !preserved) {
            setStatus('La convocatoria que elegiste se cerró. Conservamos tus datos; puedes elegir otra o enviar tu CV a la bolsa general.');
        }
        if (current && !jobs.some(function (job) { return jobKey(job) === jobKey(current); })) {
            if (viewer.open) viewer.close();
            current = null;
        }
        jobsSignature = signature;
    }

    function refreshJobs() {
        if (refreshing || submit.disabled || navigator.onLine === false) return;
        refreshing = true;
        const controller = new AbortController();
        const timeout = window.setTimeout(function () { controller.abort(); }, 20000);
        fetch(BOLSA_ENDPOINT, { cache: 'no-store', signal: controller.signal })
            .then(function (r) { if (!r.ok) throw new Error('No se pudo consultar la bolsa'); return r.json(); })
            .then(function (data) {
                if (!data || data.ok !== true || !Array.isArray(data.ofertas)) throw new Error('Respuesta inválida');
                if (submit.disabled) return;
                configureForm(data.formulario);
                updateJobs(data.ofertas);
                loaded = true;
            })
            .catch(function () {
                if (!loaded) renderEmpty('No pudimos cargar las convocatorias en este momento. Reintentaremos automáticamente. Igual puedes dejar tu CV en la bolsa general.');
                else if (hint) {
                    hint.textContent = 'No pudimos actualizar las convocatorias. Reintentaremos automáticamente.';
                    hint.hidden = false;
                }
            })
            .finally(function () {
                window.clearTimeout(timeout);
                refreshing = false;
                list.removeAttribute('aria-busy');
            });
    }

    refreshJobs();
    window.setInterval(function () { if (!document.hidden) refreshJobs(); }, REFRESH_MS);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) refreshJobs(); });
    window.addEventListener('focus', refreshJobs);
    window.addEventListener('online', refreshJobs);

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
                adicionales: Object.fromEntries(extraFields.map(function(key){return [key,form.elements.namedItem(key).value];})),
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
                    formDirty=false;
                    if(pendingConfig) configureForm(pendingConfig);
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
