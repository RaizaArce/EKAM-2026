/* ============================================
   EKAM 2026 - NAVASOFT ERP
   Main JavaScript
   ============================================ */

(function () {
    'use strict';

    // TODO: colocar número oficial de WhatsApp de EKAM.
    const WHATSAPP_NUMBER = '';

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
    const sections = document.querySelectorAll('section[id]');
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
            '.challenge-card, .pillar-card, .module-card, .sector-card, .trust-strip__item, .about__feature, .about__visual-card'
        );

        animateElements.forEach(function (el) {
            el.classList.add('animate-on-scroll');
        });

        // Add stagger to grids
        document.querySelectorAll('.challenges__grid, .pillars__grid, .modules__grid, .sectors__grid, .trust-strip__grid').forEach(function (grid) {
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
            });
            this.classList.add('showcase__tab--active');
            this.setAttribute('aria-selected', 'true');

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
                { id: 'formPhone', label: 'Teléfono', type: 'required' },
                { id: 'formEmail', label: 'Correo', type: 'email' }
            ];

            fields.forEach(function (field) {
                const input = document.getElementById(field.id);
                const errorEl = input.parentElement.querySelector('.contact-form__error');
                const value = input.value.trim();

                if (field.type === 'required' && !value) {
                    errorEl.textContent = 'Este campo es obligatorio';
                    input.classList.add('contact-form__input--error');
                    isValid = false;
                } else if (field.type === 'email' && !value) {
                    errorEl.textContent = 'Este campo es obligatorio';
                    input.classList.add('contact-form__input--error');
                    isValid = false;
                } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errorEl.textContent = 'Ingresa un correo válido';
                    input.classList.add('contact-form__input--error');
                    isValid = false;
                }
            });

            if (!isValid) return;

            // Demo: show notification
            formNotification.hidden = false;
            formNotification.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // Reset form after delay
            setTimeout(function () {
                contactForm.reset();
            }, 100);

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
            whatsappBtn.href = 'https://wa.me/' + WHATSAPP_NUMBER.replace(/[^0-9]/g, '') + '?text=Hola%2C%20me%20interesa%20conocer%20NAVASOFT%20ERP';
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

})();
