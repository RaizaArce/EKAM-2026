(function () {
    'use strict';

    const chatbot = document.getElementById('ekamChatbot');
    if (!chatbot) return;

    const launcher = document.getElementById('chatbotLauncher');
    const close = document.getElementById('chatbotClose');
    const panel = document.getElementById('ekamChatbotPanel');
    const messages = document.getElementById('chatbotMessages');
    const replies = document.getElementById('chatbotReplies');
    const label = document.getElementById('chatbotLauncherLabel');
    const whatsapp = 'https://wa.me/51940455332?text=';

    if (!launcher || !close || !panel || !messages || !replies) return;

    const topics = [
        ['EKAM Perú', 'EKAM Perú implementa NAVASOFT, configura la solución según los procesos de cada empresa y acompaña a los usuarios durante la puesta en marcha.'],
        ['NAVASOFT', 'NAVASOFT es un ERP que puede integrar áreas como ventas, inventarios, compras, contabilidad y facturación electrónica.'],
        ['Implementación', 'El proceso incluye conocer la operación, definir el alcance, configurar la solución, capacitar a los usuarios y acompañar la puesta en marcha.'],
        ['Solicitar demostración', 'Un asesor puede revisar tu caso y orientarte sobre una demostración de NAVASOFT.']
    ];

    function addMessage(text, user) {
        const item = document.createElement('div');
        item.className = 'chatbot__message chatbot__message--' + (user ? 'user' : 'bot');
        if (!user) {
            const avatar = document.createElement('img');
            avatar.className = 'chatbot__message-avatar';
            avatar.src = 'assets/images/asistente-ekam-avatar.webp';
            avatar.alt = '';
            item.appendChild(avatar);
        }
        const bubble = document.createElement('div');
        bubble.className = 'chatbot__message-bubble';
        bubble.textContent = text;
        item.appendChild(bubble);
        messages.appendChild(item);
        messages.parentElement.scrollTop = messages.parentElement.scrollHeight;
    }

    function showTopics() {
        replies.innerHTML = '';
        topics.forEach(function (topic) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'chatbot__reply';
            button.textContent = topic[0];
            button.addEventListener('click', function () {
                addMessage(topic[0], true);
                addMessage(topic[1], false);
                showActions(topic[0]);
            });
            replies.appendChild(button);
        });
        const wa = document.createElement('button');
        wa.type = 'button';
        wa.className = 'chatbot__action chatbot__action--primary';
        wa.textContent = 'Hablar por WhatsApp';
        wa.addEventListener('click', function () {
            window.open(whatsapp + encodeURIComponent('Hola, deseo recibir información sobre NAVASOFT y la implementación de EKAM Perú.'), '_blank', 'noopener');
        });
        replies.appendChild(wa);
    }

    function showActions(topic) {
        replies.innerHTML = '';
        const wa = document.createElement('button');
        wa.type = 'button';
        wa.className = 'chatbot__action chatbot__action--primary';
        wa.textContent = 'Hablar por WhatsApp';
        wa.addEventListener('click', function () {
            window.open(whatsapp + encodeURIComponent('Hola, llego desde el asistente virtual de EKAM Perú. Deseo información sobre: ' + topic + '.'), '_blank', 'noopener');
        });
        const back = document.createElement('button');
        back.type = 'button';
        back.className = 'chatbot__action chatbot__action--ghost';
        back.textContent = 'Ver otra consulta';
        back.addEventListener('click', showTopics);
        replies.append(wa, back);
    }

    function open() {
        chatbot.classList.add('chatbot--open');
        launcher.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
        if (label) label.classList.add('chatbot__launcher-label--hidden');
        if (!messages.children.length) {
            addMessage('Hola, soy el asistente virtual de EKAM Perú. Puedo orientarte sobre NAVASOFT y nuestra implementación.', false);
            addMessage('¿Sobre qué tema deseas información?', false);
            showTopics();
        }
        close.focus({ preventScroll: true });
    }

    function hide() {
        chatbot.classList.remove('chatbot--open');
        launcher.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
        launcher.focus({ preventScroll: true });
    }

    launcher.addEventListener('click', function () { chatbot.classList.contains('chatbot--open') ? hide() : open(); });
    close.addEventListener('click', hide);
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && chatbot.classList.contains('chatbot--open')) hide(); });
}());
