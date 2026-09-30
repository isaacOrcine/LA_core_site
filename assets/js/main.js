/* ==========================================================================
   L.A. Core — comportamentos gerais da página
   ========================================================================== */
(function () {
  'use strict';

  var doc = document.documentElement;

  /* ---------- Cabeçalho: sombra ao rolar ---------- */
  var cabecalho = document.querySelector('.cabecalho');
  function aoRolar() { cabecalho.dataset.rolado = String(window.scrollY > 8); }
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  /* ---------- Menu no celular ---------- */
  var menuBotao = document.querySelector('.menu-botao');
  var menu = document.getElementById('menu-movel');

  function alternarMenu(abrir) {
    menu.dataset.aberto = String(abrir);
    menuBotao.setAttribute('aria-expanded', String(abrir));
    menuBotao.querySelector('.menu-botao__texto').textContent = abrir ? 'Fechar' : 'Menu';
    document.body.style.overflow = abrir ? 'hidden' : '';
    /* O menu já tem seu próprio botão de WhatsApp: esconde o flutuante para não sobrepor */
    var wpp = document.querySelector('[data-wpp]');
    if (wpp) wpp.hidden = abrir;
    if (abrir) menu.querySelector('a').focus();
  }
  menuBotao.addEventListener('click', function () {
    alternarMenu(menu.dataset.aberto !== 'true');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a, [data-wpp-abrir]')) alternarMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.dataset.aberto === 'true') { alternarMenu(false); menuBotao.focus(); }
  });

  /* ---------- Tamanho do texto (A- / A / A+) ---------- */
  var botoesEscala = document.querySelectorAll('[data-escala]');
  function aplicarEscala(valor) {
    doc.style.setProperty('--escala-fonte', valor);
    botoesEscala.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.escala === String(valor)));
    });
    try { localStorage.setItem('lacore-escala', valor); } catch (_) {}
  }
  botoesEscala.forEach(function (b) {
    b.addEventListener('click', function () { aplicarEscala(b.dataset.escala); });
  });
  var escalaSalva = getComputedStyle(doc).getPropertyValue('--escala-fonte').trim();
  if (escalaSalva) aplicarEscala(escalaSalva);

  /* ---------- Revelar ao rolar + menu ativo ---------- */
  if ('IntersectionObserver' in window) {
    var obsRevelar = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.dataset.visivel = 'true'; obsRevelar.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.revelar').forEach(function (el) { obsRevelar.observe(el); });

    var linksNav = document.querySelectorAll('.nav__link');
    var obsSecao = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        linksNav.forEach(function (l) {
          if (l.getAttribute('href') === '#' + en.target.id) l.setAttribute('aria-current', 'true');
          else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { obsSecao.observe(s); });
  } else {
    document.querySelectorAll('.revelar').forEach(function (el) { el.dataset.visivel = 'true'; });
  }

  /* ---------- Vídeo: só carrega depois do clique ---------- */
  document.querySelectorAll('[data-video]').forEach(function (moldura) {
    moldura.querySelector('.video__capa').addEventListener('click', function () {
      var v = document.createElement('video');
      v.src = moldura.dataset.videoSrc;
      v.poster = moldura.dataset.videoPoster;
      v.controls = true;
      v.playsInline = true;
      v.setAttribute('aria-label', moldura.dataset.videoTitulo || 'Vídeo da L.A. Core');
      moldura.innerHTML = '';
      moldura.appendChild(v);
      v.play().catch(function () {});
      v.focus();
    });
  });

  /* ---------- Mapa: só carrega depois do clique (economiza dados) ---------- */
  document.querySelectorAll('[data-mapa]').forEach(function (moldura) {
    moldura.querySelector('.mapa__capa').addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = moldura.dataset.mapaSrc;
      f.title = 'Mapa: L.A. Core, Rua Goiás 2367, Ipiranga, Divinópolis';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.allowFullscreen = true;
      moldura.innerHTML = '';
      moldura.appendChild(f);
    });
  });

  /* ---------- Formulário de contato ---------- */
  var form = document.querySelector('[data-formulario]');
  if (form) {
    var statusForm = form.querySelector('[data-status-form]');
    var telefone = form.querySelector('#f-telefone');
    form.elements.inicio.value = String(Date.now());

    /* Máscara (37) 99999-9999 enquanto digita */
    telefone.addEventListener('input', function () {
      var d = telefone.value.replace(/\D/g, '').slice(0, 11);
      var f = d;
      if (d.length > 2)  f = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 7)  f = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
      telefone.value = f;
    });

    function validarCampo(campo) {
      var el = campo.querySelector('input, select, textarea');
      var ok = el.checkValidity();
      if (ok && el === telefone) ok = telefone.value.replace(/\D/g, '').length >= 10;
      if (ok) { delete campo.dataset.erro; el.removeAttribute('aria-invalid'); }
      else    { campo.dataset.erro = ''; el.setAttribute('aria-invalid', 'true'); }
      return ok;
    }

    var campos = form.querySelectorAll('.campo:not(.campo--armadilha)');
    campos.forEach(function (campo) {
      var el = campo.querySelector('input, select, textarea');
      el.addEventListener('blur', function () { if (el.value || el.type === 'checkbox') validarCampo(campo); });
      el.addEventListener('input', function () { if ('erro' in campo.dataset) validarCampo(campo); });
      el.addEventListener('change', function () { if ('erro' in campo.dataset) validarCampo(campo); });
    });

    function mostrarStatus(tipo, texto) {
      statusForm.dataset.tipo = tipo;
      statusForm.textContent = texto;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var primeiroErro = null;
      campos.forEach(function (c) { if (!validarCampo(c) && !primeiroErro) primeiroErro = c; });
      if (primeiroErro) {
        mostrarStatus('erro', 'Falta corrigir alguns campos, indicados em vermelho.');
        primeiroErro.querySelector('input, select, textarea').focus();
        return;
      }

      var enviar = form.querySelector('[type="submit"]');
      enviar.setAttribute('aria-busy', 'true');
      enviar.lastChild.textContent = ' Enviando…';
      delete statusForm.dataset.tipo;

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (r) { return r.json(); })
        .then(function (corpo) {
          if (corpo.ok) { window.location.href = '/obrigado.html'; return; }
          var erro = new Error(corpo.mensagem);
          erro.doServidor = true;
          throw erro;
        })
        .catch(function (err) {
          mostrarStatus('erro', err.doServidor && err.message
            ? err.message
            : 'Não foi possível enviar agora. Tente novamente ou fale conosco pelo WhatsApp.');
          enviar.removeAttribute('aria-busy');
          enviar.lastChild.textContent = ' Enviar mensagem';
        });
    });
  }

  /* ---------- Ano atual no rodapé ---------- */
  document.querySelectorAll('[data-ano]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
