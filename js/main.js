/* ============================================
   EKAM 2026 - NAVASOFT ERP
   Main JavaScript
   ============================================ */

(function () {
    'use strict';

    const WHATSAPP_NUMBER = '51949882756';
    const WHATSAPP_MESSAGE = 'Hola, me interesa conocer más sobre la implementación de NAVASOFT por parte de EKAM Perú y solicitar una demostración.';

    function trackCommercialEvent(name, params) {
        if (typeof window.gtag === 'function') {
            window.gtag('event', name, params || {});
        }
        if (window.dataLayer && Array.isArray(window.dataLayer)) {
            window.dataLayer.push({ event: name, ...(params || {}) });
        }
    }

    /* ---- Header scroll ---- */
    const header = document.getElementById('header');
    let lastScrollY = 0;

    function handleHeaderScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 20) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
        lastScrollY = scrollY;
    }

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();

    /* ---- Mobile menu ---- */
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const mobileOverlay = document.getElementById('mobileOverlay');

    function openMenu() {
        mainNav.classList.add('header__nav--open');
        menuToggle.classList.add('header__toggle--active');
        menuToggle.setAttribute('aria-expanded', 'true');
        mobileOverlay.classList.add('mobile-overlay--active');
        mobileOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mainNav.classList.remove('header__nav--open');
        menuToggle.classList.remove('header__toggle--active');
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileOverlay.classList.remove('mobile-overlay--active');
        mobileOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    menuToggle.addEventListener('click', function () {
        const isOpen = mainNav.classList.contains('header__nav--open');
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    mobileOverlay.addEventListener('click', closeMenu);

    document.querySelectorAll('.header__link').forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 1024) {
                closeMenu();
            }
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mainNav.classList.contains('header__nav--open')) {
            closeMenu();
            menuToggle.focus();
        }
    });

    /* ---- Smooth scroll for anchor links ---- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const headerHeight = header.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update URL without scroll
            history.pushState(null, '', targetId);
        });
    });

    /* ---- Active nav link ---- */
    const sections = document.querySelectorAll('section[id], #empresa');
    const navLinks = document.querySelectorAll('.header__link');

    function updateActiveLink() {
        const scrollY = window.scrollY + header.offsetHeight + 100;

        sections.forEach(function (section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(function (link) {
                    link.classList.remove('header__link--active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('header__link--active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });

    /* ---- IntersectionObserver for animations ---- */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        const animateElements = document.querySelectorAll(
            '.challenge-card, .module-card, .sector-card, .trust-strip__item'
        );

        animateElements.forEach(function (el) {
            el.classList.add('animate-on-scroll');
        });

        // Add stagger to grids
        document.querySelectorAll('.challenges__grid, .modules__grid, .sectors__grid, .trust-strip__grid').forEach(function (grid) {
            grid.classList.add('animate-stagger');
        });

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-on-scroll--visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        animateElements.forEach(function (el) {
            observer.observe(el);
        });
    }

    /* ---- Showcase tabs ---- */
    const tabs = document.querySelectorAll('.showcase__tab');
    const panels = document.querySelectorAll('.showcase__panel');

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            const targetTab = this.getAttribute('data-tab');

            // Update tabs
            tabs.forEach(function (t) {
                t.classList.remove('showcase__tab--active');
                t.setAttribute('aria-selected', 'false');
                t.setAttribute('tabindex', '-1');
            });
            this.classList.add('showcase__tab--active');
            this.setAttribute('aria-selected', 'true');
            this.setAttribute('tabindex', '0');

            // Update panels
            panels.forEach(function (panel) {
                panel.classList.remove('showcase__panel--active');
                panel.hidden = true;
            });

            const targetPanel = document.getElementById('panel-' + targetTab);
            if (targetPanel) {
                targetPanel.classList.add('showcase__panel--active');
                targetPanel.hidden = false;
            }
        });

        // Keyboard navigation for tabs
        tab.addEventListener('keydown', function (e) {
            const tabsArray = Array.from(tabs);
            const currentIndex = tabsArray.indexOf(this);

            let newIndex;
            if (e.key === 'ArrowRight') {
                newIndex = (currentIndex + 1) % tabsArray.length;
            } else if (e.key === 'ArrowLeft') {
                newIndex = (currentIndex - 1 + tabsArray.length) % tabsArray.length;
            } else if (e.key === 'Home') {
                newIndex = 0;
            } else if (e.key === 'End') {
                newIndex = tabsArray.length - 1;
            } else {
                return;
            }

            e.preventDefault();
            tabsArray[newIndex].click();
            tabsArray[newIndex].focus();
        });
    });

    /* ---- NAVASOFT image viewer ---- */
    const imageViewer = document.getElementById('imageViewer');
    const imageViewerImage = document.getElementById('imageViewerImage');
    const imageViewerClose = document.getElementById('imageViewerClose');
    const imageViewerTitle = document.getElementById('imageViewerTitle');

    if (imageViewer && imageViewerImage && imageViewerClose) {
        document.querySelectorAll('[data-lightbox-src]').forEach(function (button) {
            button.addEventListener('click', function () {
                const imageSource = this.getAttribute('data-lightbox-src');
                const imageAlt = this.getAttribute('data-lightbox-alt') || 'Vista ampliada de NAVASOFT';

                imageViewerImage.src = imageSource;
                imageViewerImage.alt = imageAlt;
                imageViewerTitle.textContent = imageAlt;
                imageViewer.showModal();
            });
        });

        imageViewerClose.addEventListener('click', function () {
            imageViewer.close();
        });

        imageViewer.addEventListener('click', function (event) {
            if (event.target === imageViewer) {
                imageViewer.close();
            }
        });

        imageViewer.addEventListener('close', function () {
            imageViewerImage.removeAttribute('src');
            imageViewerImage.alt = '';
        });
    }

    /* ---- Inline NAVASOFT video ---- */
    const videoDemoPlay = document.getElementById('videoDemoPlay');
    const videoDemoPlayer = document.getElementById('videoDemoPlayer');

    if (videoDemoPlay && videoDemoPlayer) {
        videoDemoPlayer.addEventListener('loadedmetadata', function () {
            if (videoDemoPlayer.duration > 1.5 && videoDemoPlayer.currentTime === 0) {
                videoDemoPlayer.currentTime = 1;
            }
        }, { once: true });

        videoDemoPlay.addEventListener('click', function () {
            videoDemoPlayer.play().catch(function () {
                // El visitante puede iniciar la reproducción desde los controles.
            });
            videoDemoPlayer.focus();
        });

        videoDemoPlayer.addEventListener('play', function () {
            videoDemoPlay.classList.add('video-demo__play--hidden');
        });

        videoDemoPlayer.addEventListener('pause', function () {
            videoDemoPlay.classList.remove('video-demo__play--hidden');
        });
    }

    /* ---- Contact form ---- */
    const contactForm = document.getElementById('contactForm');
    const formNotification = document.getElementById('formNotification');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Clear previous errors
            contactForm.querySelectorAll('.contact-form__error').forEach(function (err) {
                err.textContent = '';
            });
            contactForm.querySelectorAll('.contact-form__input--error').forEach(function (input) {
                input.classList.remove('contact-form__input--error');
            });

            let isValid = true;
            const fields = [
                { id: 'formName', label: 'Nombre', type: 'required' },
                { id: 'formCompany', label: 'Empresa', type: 'required' },
                { id: 'formPhone', label: 'Teléfono / WhatsApp', type: 'required' },
                { id: 'formSolution', label: 'Solución de interés', type: 'required' }
            ];

            fields.forEach(function (field) {
                const input = document.getElementById(field.id);
                const errorEl = input.parentElement.querySelector('.contact-form__error');
                const value = input.value.trim();

                if (field.type === 'required' && !value) {
                    errorEl.textContent = 'Este campo es obligatorio';
                    input.classList.add('contact-form__input--error');
                    isValid = false;
                }
            });

            if (!isValid) return;

            const name = document.getElementById('formName').value.trim();
            const company = document.getElementById('formCompany').value.trim();
            const phone = document.getElementById('formPhone').value.trim();
            const email = document.getElementById('formEmail').value.trim();
            const solutionSelect = document.getElementById('formSolution');
            const solution = solutionSelect.value ? solutionSelect.options[solutionSelect.selectedIndex].text : 'No especificada';
            const timingSelect = document.getElementById('formTiming');
            const timing = timingSelect && timingSelect.value ? timingSelect.options[timingSelect.selectedIndex].text : 'No especificado';
            const message = document.getElementById('formMessage').value.trim();

            const whatsappMessage = [
                'Hola, quiero agendar una evaluación comercial con EKAM Perú para NAVASOFT.',
                '',
                'Nombre: ' + name,
                'Empresa: ' + company,
                'Teléfono / WhatsApp: ' + phone,
                'Correo: ' + (email || 'No especificado'),
                'Solución de interés: ' + solution,
                'Plazo de evaluación: ' + timing
            ];

            if (message) {
                whatsappMessage.push('Principal necesidad: ' + message);
            }

            const whatsappUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(whatsappMessage.join('\n'));
            trackCommercialEvent('lead_whatsapp_prepared', {
                solution: solutionSelect.value || 'sin_especificar',
                timing: timingSelect && timingSelect.value ? timingSelect.value : 'sin_especificar'
            });
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

            formNotification.hidden = false;
            formNotification.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // Hide notification after 8 seconds
            setTimeout(function () {
                formNotification.hidden = true;
            }, 8000);
        });

        // Clear error on input
        contactForm.querySelectorAll('.contact-form__input, .contact-form__select, .contact-form__textarea').forEach(function (input) {
            input.addEventListener('input', function () {
                this.classList.remove('contact-form__input--error');
                const errorEl = this.parentElement.querySelector('.contact-form__error');
                if (errorEl) errorEl.textContent = '';
            });
        });
    }

    /* ---- WhatsApp button ---- */
    const whatsappBtn = document.getElementById('whatsappBtn');

    if (whatsappBtn) {
        if (WHATSAPP_NUMBER) {
            whatsappBtn.href = 'https://wa.me/' + WHATSAPP_NUMBER.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(WHATSAPP_MESSAGE);
            whatsappBtn.addEventListener('click', function () {
                trackCommercialEvent('whatsapp_floating_click', { source: 'floating_button' });
            });
        } else {
            whatsappBtn.href = '#contacto';
            whatsappBtn.addEventListener('click', function (e) {
                e.preventDefault();
                const contacto = document.getElementById('contacto');
                if (contacto) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = contacto.getBoundingClientRect().top + window.scrollY - headerHeight;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            });
        }
    }

    /* ---- Close mobile menu on resize ---- */
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (window.innerWidth > 1024) {
                closeMenu();
            }
        }, 150);
    });

    /* ============================================
       EKAM ASISTENTE VIRTUAL (Preguntas frecuentes)
       ============================================ */
    const chatbot = document.getElementById('ekamChatbot');
    const chatbotLauncher = document.getElementById('chatbotLauncher');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotPanel = document.getElementById('ekamChatbotPanel');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatbotReplies = document.getElementById('chatbotReplies');
    const chatbotLauncherLabel = document.getElementById('chatbotLauncherLabel');

    if (!chatbot || !chatbotLauncher || !chatbotClose || !chatbotPanel || !chatbotMessages || !chatbotReplies) {
        return;
    }

    const WHATSAPP_CHAT_MESSAGES = {
        general: 'Hola, llego desde el asistente virtual de la web de EKAM Perú. Quisiera recibir información sobre la implementación de NAVASOFT para mi empresa.',
        precios: 'Hola, llego desde el asistente virtual de la web de EKAM Perú. Quisiera solicitar información sobre el precio de implementación de NAVASOFT.',
        demo: 'Hola, llego desde el asistente virtual de la web de EKAM Perú. Quisiera coordinar una demostración de NAVASOFT.',
        soporte: 'Hola, llego desde el asistente virtual de la web de EKAM Perú. Quisiera consultar sobre la capacitación y el soporte relacionado con NAVASOFT.'
    };

    const CHAT_AVATAR = 'assets/images/asistente-ekam-avatar.webp';
    const CHAT_ROBOT = 'assets/images/asistente-ekam.webp';

    const CHAT_MENU = [
        { id: 'ekam', label: '¿Qué es EKAM Perú?' },
        { id: 'navasoft', label: '¿Qué es NAVASOFT?' },
        { id: 'modulos', label: '¿Qué módulos incluye NAVASOFT?' },
        { id: 'implementacion', label: '¿Cómo realiza EKAM la implementación?' },
        { id: 'facturacion', label: 'Facturación electrónica y SUNAT' },
        { id: 'capacitacion', label: 'Capacitación y soporte' },
        { id: 'precios', label: 'Precios de implementación' },
        { id: 'demo', label: 'Solicitar una demostración' },
        { id: 'asesor', label: 'Hablar con un asesor de EKAM' }
    ];

    const CHAT_QUESTIONS = {
        ekam: {
            label: '¿Qué es EKAM Perú?',
            answer: 'EKAM Perú es la empresa que asesora y acompaña a sus clientes en la implementación de soluciones empresariales. Nuestro equipo analiza las necesidades de cada organización e implementa NAVASOFT de acuerdo con sus procesos.',
            actions: [
                { label: 'Conocer NAVASOFT', type: 'question', value: 'navasoft' },
                { label: 'Solicitar una demostración', type: 'question', value: 'demo' }
            ]
        },
        navasoft: {
            label: '¿Qué es NAVASOFT?',
            answer: 'NAVASOFT es un software ERP que permite centralizar procesos administrativos, comerciales, contables y operativos. EKAM Perú se encarga de implementarlo y acompañar a sus clientes durante su puesta en marcha.',
            actions: [
                { label: 'Ver módulos', type: 'question', value: 'modulos' },
                { label: 'Ver capturas del sistema', type: 'capturas' }
            ]
        },
        modulos: {
            label: '¿Qué módulos incluye NAVASOFT?',
            answer: 'NAVASOFT cuenta con soluciones para ventas, inventarios, compras, contabilidad, facturación electrónica, tesorería, clientes y reportes. EKAM Perú ayuda a determinar qué módulos necesita cada empresa.',
            actions: [
                { label: 'Ver capturas del sistema', type: 'capturas' },
                { label: 'Solicitar asesoría', type: 'whatsapp', value: 'general' }
            ]
        },
        implementacion: {
            label: '¿Cómo realiza EKAM la implementación?',
            answer: 'EKAM Perú comienza evaluando los procesos y necesidades de la empresa. A partir de ese análisis se define el alcance de NAVASOFT, su configuración, la capacitación necesaria y el acompañamiento durante la puesta en marcha.',
            actions: [
                { label: 'Solicitar evaluación', type: 'whatsapp', value: 'general' },
                { label: 'Hablar con un asesor', type: 'whatsapp', value: 'general' }
            ]
        },
        facturacion: {
            label: 'Facturación electrónica y SUNAT',
            answer: 'NAVASOFT incluye funcionalidades relacionadas con la emisión y gestión de comprobantes electrónicos. EKAM Perú asesora al cliente para definir la configuración que necesita su empresa.',
            actions: [
                { label: 'Consultar con EKAM Perú', type: 'whatsapp', value: 'general' },
                { label: 'Solicitar demostración', type: 'question', value: 'demo' }
            ]
        },
        capacitacion: {
            label: 'Capacitación y soporte',
            answer: 'EKAM Perú brinda capacitación y acompañamiento para facilitar el uso de NAVASOFT por parte de los usuarios. El alcance del soporte se coordina según las necesidades y el servicio contratado por cada cliente.',
            actions: [
                { label: 'Consultar condiciones', type: 'whatsapp', value: 'soporte' },
                { label: 'Hablar con un asesor', type: 'whatsapp', value: 'general' }
            ]
        },
        precios: {
            label: 'Precios de implementación',
            answer: 'El precio depende de las necesidades de la empresa, los módulos requeridos, el número de usuarios y el alcance de la implementación. Un asesor de EKAM Perú puede preparar una evaluación personalizada.',
            actions: [
                { label: 'Consultar precio por WhatsApp', type: 'whatsapp', value: 'precios' },
                { label: 'Solicitar una demostración', type: 'question', value: 'demo' }
            ]
        },
        demo: {
            label: 'Solicitar una demostración',
            answer: 'EKAM Perú puede coordinar una demostración para mostrarte cómo NAVASOFT puede adaptarse a los procesos de tu empresa.',
            actions: [
                { label: 'Ir al formulario', type: 'formulario' },
                { label: 'Solicitar por WhatsApp', type: 'whatsapp', value: 'demo' }
            ]
        },
        asesor: {
            label: 'Hablar con un asesor de EKAM',
            answer: 'Puedes comunicarte con un asesor de EKAM Perú mediante WhatsApp para recibir atención personalizada.',
            actions: [
                { label: 'Continuar por WhatsApp', type: 'whatsapp', value: 'general', primary: true }
            ]
        }
    };

    let chatBusy = false;
    let chatTimers = [];
    let chatbotHasOpened = false;

    function openChatbot() {
        chatbot.classList.add('chatbot--open');
        chatbotLauncher.setAttribute('aria-expanded', 'true');
        chatbotPanel.setAttribute('aria-hidden', 'false');
        if (chatbotLauncherLabel) {
            chatbotLauncherLabel.classList.add('chatbot__launcher-label--hidden');
        }
        if (chatbotMessages.children.length === 0) {
            resetConversation();
        }
        if (!chatbotHasOpened) {
            chatbotMessages.parentElement.scrollTop = 0;
            chatbotHasOpened = true;
        } else {
            scrollChatToBottom();
        }
        setTimeout(function () {
            chatbotClose.focus({ preventScroll: true });
        }, 0);
    }

    function closeChatbot() {
        chatbot.classList.remove('chatbot--open');
        chatbotLauncher.setAttribute('aria-expanded', 'false');
        chatbotPanel.setAttribute('aria-hidden', 'true');
        setTimeout(function () {
            chatbotLauncher.focus({ preventScroll: true });
        }, 0);
    }

    chatbotLauncher.addEventListener('click', function () {
        if (chatbot.classList.contains('chatbot--open')) {
            closeChatbot();
        } else {
            openChatbot();
        }
    });

    chatbotClose.addEventListener('click', closeChatbot);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && chatbot.classList.contains('chatbot--open')) {
            closeChatbot();
        }
    });

    function scrollChatToBottom() {
        const chatbotBody = chatbotMessages.parentElement;
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
    }

    function focusFirstReply() {
        const firstReply = chatbotReplies.querySelector('button');
        if (firstReply) {
            firstReply.focus({ preventScroll: true });
        }
    }

    function appendMessage(role, text, opts) {
        opts = opts || {};
        const wrap = document.createElement('div');
        wrap.className = 'chatbot__message chatbot__message--' + role + (opts.welcome ? ' chatbot__message--welcome' : '');

        if (role === 'bot') {
            const avatar = document.createElement('img');
            avatar.className = 'chatbot__message-avatar';
            avatar.src = opts.avatarSrc || CHAT_AVATAR;
            avatar.alt = '';
            wrap.appendChild(avatar);
        }

        const bubble = document.createElement('div');
        bubble.className = 'chatbot__message-bubble';

        if (opts.welcome) {
            const robot = document.createElement('img');
            robot.className = 'chatbot__welcome-robot';
            robot.src = CHAT_ROBOT;
            robot.alt = 'Robot asistente virtual de EKAM Perú';
            bubble.appendChild(robot);
        }

        bubble.appendChild(document.createTextNode(text));
        wrap.appendChild(bubble);
        chatbotMessages.appendChild(wrap);
        return wrap;
    }

    function showTyping() {
        const wrap = document.createElement('div');
        wrap.className = 'chatbot__message chatbot__message--bot';
        const avatar = document.createElement('img');
        avatar.className = 'chatbot__message-avatar';
        avatar.src = CHAT_AVATAR;
        avatar.alt = '';
        wrap.appendChild(avatar);
        const bubble = document.createElement('div');
        bubble.className = 'chatbot__message-bubble';
        const typing = document.createElement('span');
        typing.className = 'chatbot__typing';
        typing.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            typing.appendChild(dot);
        }
        bubble.appendChild(typing);
        wrap.appendChild(bubble);
        chatbotMessages.appendChild(wrap);
        scrollChatToBottom();
        return wrap;
    }

    function renderButtons(buttons) {
        chatbotReplies.innerHTML = '';
        buttons.forEach(function (b) {
            const btn = document.createElement('button');
            btn.type = 'button';

            if (typeof b === 'string') {
                btn.className = 'chatbot__action chatbot__action--ghost';
                btn.textContent = CHAT_ACTION_LABELS[b];
                btn.setAttribute('data-action', b);
            } else {
                btn.className = 'chatbot__action chatbot__action--' + (b.primary ? 'primary' : 'ghost');
                btn.setAttribute('data-action', b.type);
                btn.setAttribute('data-value', b.value || '');
                btn.textContent = b.label;
            }

            btn.addEventListener('click', function () {
                handleAction(btn.getAttribute('data-action'), btn.getAttribute('data-value'));
            });
            chatbotReplies.appendChild(btn);
        });
    }

    const CHAT_ACTION_LABELS = {
        menu: 'Volver al menú',
        restart: 'Iniciar de nuevo'
    };

    function renderMenu() {
        chatbotReplies.innerHTML = '';
        CHAT_MENU.forEach(function (q) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'chatbot__reply';
            btn.textContent = q.label;
            btn.addEventListener('click', function () {
                selectQuestion(q.id);
            });
            chatbotReplies.appendChild(btn);
        });

        const restart = document.createElement('button');
        restart.type = 'button';
        restart.className = 'chatbot__action chatbot__action--ghost';
        restart.textContent = 'Iniciar de nuevo';
        restart.addEventListener('click', function () {
            resetConversation();
        });
        chatbotReplies.appendChild(restart);
    }

    function setBusy(busy) {
        chatBusy = busy;
        chatbotReplies.querySelectorAll('button').forEach(function (btn) {
            btn.disabled = busy;
        });
    }

    function selectQuestion(id) {
        if (chatBusy) return;
        const q = CHAT_QUESTIONS[id];
        if (!q) return;

        setBusy(true);
        appendMessage('user', q.label);
        scrollChatToBottom();

        const typing = showTyping();
        const delay = 400 + Math.floor(Math.random() * 300);

        const timer = setTimeout(function () {
            typing.remove();
            appendMessage('bot', q.answer);
            const actionButtons = q.actions.slice();
            actionButtons.push('menu');
            renderButtons(actionButtons);
            scrollChatToBottom();
            setBusy(false);
            focusFirstReply();
        }, delay);
        chatTimers.push(timer);
    }

    function handleAction(type, value) {
        if (chatBusy && type !== 'menu' && type !== 'restart') return;

        if (type === 'menu') {
            renderMenu();
            scrollChatToBottom();
            focusFirstReply();
            return;
        }

        if (type === 'restart') {
            resetConversation(true);
            return;
        }

        if (type === 'question') {
            selectQuestion(value);
            return;
        }

        if (type === 'whatsapp') {
            const msg = WHATSAPP_CHAT_MESSAGES[value] || WHATSAPP_CHAT_MESSAGES.general;
            trackCommercialEvent('chatbot_whatsapp_click', { intent: value || 'general' });
            window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
            return;
        }

        if (type === 'capturas') {
            closeChatbot();
            smoothScrollTo('navasoft');
            return;
        }

        if (type === 'formulario') {
            closeChatbot();
            smoothScrollTo('contacto');
            return;
        }
    }

    function smoothScrollTo(id) {
        const target = document.getElementById(id);
        if (!target) return;
        const headerHeight = header.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        history.pushState(null, '', '#' + id);
    }

    function resetConversation(focusMenuAfterReset) {
        chatTimers.forEach(function (t) { clearTimeout(t); });
        chatTimers = [];
        chatBusy = false;
        chatbotMessages.innerHTML = '';
        chatbotReplies.innerHTML = '';

        appendMessage('bot', '¡Hola! Soy el asistente virtual de EKAM Perú. Puedo ayudarte a conocer nuestros servicios y saber cómo implementamos NAVASOFT en las empresas.', { welcome: true });
        appendMessage('bot', '¿Sobre qué tema deseas información?');
        chatbotMessages.parentElement.scrollTop = 0;

        const typing = showTyping();
        const timer = setTimeout(function () {
            typing.remove();
            renderMenu();
            chatbotMessages.parentElement.scrollTop = 0;
            if (focusMenuAfterReset) {
                focusFirstReply();
            }
        }, 500);
        chatTimers.push(timer);
    }

    if (chatbotLauncherLabel) {
        setTimeout(function () {
            chatbotLauncherLabel.classList.add('chatbot__launcher-label--hidden');
        }, 5000);
    }

    resetConversation();

})();
