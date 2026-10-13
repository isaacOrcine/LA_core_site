/* ==========================================================================
   LA Core — comportamentos gerais da página
   ========================================================================== */
(function () {
  'use strict';

  var doc = document.documentElement;

  /* ---------- Cabeçalho: sombra ao rolar ---------- */
  var cabecalho = document.querySelector('.cabecalho');
  if (cabecalho) {
    var aoRolar = function () { cabecalho.dataset.rolado = String(window.scrollY > 8); };
    window.addEventListener('scroll', aoRolar, { passive: true });
    aoRolar();
  }

  /* ---------- Barra de ações no celular ----------
     Escondida enquanto os botões do topo estão na tela (seriam repetidos) e
     enquanto a pessoa digita no formulário (o teclado a empurraria para cima). */
  var barra = document.querySelector('[data-barra-acoes]');
  var acoesHero = document.querySelector('.hero__acoes .btn');
  if (barra) {
    var heroVisivel = false, digitando = false;
    var atualizarBarra = function () { barra.dataset.oculta = String(heroVisivel || digitando); };
    if (acoesHero && 'IntersectionObserver' in window) {
      /* Só conta como visível se o botão aparecer inteiro (não só uma beirada) */
      new IntersectionObserver(function (entradas) {
        heroVisivel = entradas[0].intersectionRatio > 0.95;
        atualizarBarra();
      }, { threshold: [0, 0.95, 1] }).observe(acoesHero);
    }
    document.addEventListener('focusin', function (e) {
      digitando = !!e.target.closest('input, select, textarea');
      atualizarBarra();
    });
    document.addEventListener('focusout', function () { digitando = false; atualizarBarra(); });
    atualizarBarra();
  }

  /* ---------- Menu no celular ---------- */
  var menuBotao = document.querySelector('.menu-botao');
  var menu = document.getElementById('menu-movel');

  if (menuBotao && menu) {
    var alternarMenu = function (abrir) {
      menu.dataset.aberto = String(abrir);
      menuBotao.setAttribute('aria-expanded', String(abrir));
      menuBotao.querySelector('.menu-botao__texto').textContent = abrir ? 'Fechar' : 'Menu';
      document.body.style.overflow = abrir ? 'hidden' : '';
      /* O menu já tem seu próprio botão de WhatsApp: esconde o flutuante e a barra para não sobrepor */
      var wpp = document.querySelector('[data-wpp]');
      if (wpp) wpp.hidden = abrir;
      if (barra) barra.hidden = abrir;
      if (abrir) menu.querySelector('a').focus();
    };
    menuBotao.addEventListener('click', function () {
      alternarMenu(menu.dataset.aberto !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a, [data-wpp-abrir]')) alternarMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.dataset.aberto === 'true') { alternarMenu(false); menuBotao.focus(); }
    });
  }

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
      v.setAttribute('aria-label', moldura.dataset.videoTitulo || 'Vídeo da LA Core');
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
      f.title = 'Mapa: LA Core, Rua Goiás 2367, Ipiranga, Divinópolis';
      f.loading = 'lazy';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      /* O mapa só precisa de scripts próprios e de abrir links em nova aba */
      f.sandbox = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox';
      f.allowFullscreen = true;
      moldura.innerHTML = '';
      moldura.appendChild(f);
    });
  });

  /* ---------- Formulário: recolhido no celular, sempre aberto no computador ---------- */
  var caixaForm = document.querySelector('[data-formulario-caixa]');
  if (caixaForm) {
    var telaGrande = window.matchMedia('(min-width: 960px)');
    var ajustarCaixa = function () { if (telaGrande.matches) caixaForm.open = true; };
    ajustarCaixa();
    if (telaGrande.addEventListener) telaGrande.addEventListener('change', ajustarCaixa);
  }

  /* ---------- Status "Aberto agora" (horário de Brasília) ---------- */
  var statusHorario = document.querySelectorAll('[data-status-horario]');
  if (statusHorario.length) {
    /* [abre, fecha] em minutos, por dia da semana (0 = domingo) */
    var HORARIOS = [null, [420, 1200], [420, 1200], [420, 1200], [420, 1200], [420, 1020], [480, 660]];
    var DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    var hora = function (min) { return Math.floor(min / 60) + 'h' + (min % 60 ? String(min % 60).padStart(2, '0') : ''); };

    var calcularStatus = function () {
      var partes = {};
      try {
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
        }).formatToParts(new Date()).forEach(function (p) { partes[p.type] = p.value; });
      } catch (_) { return null; }
      var dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(partes.weekday);
      var agora = (+partes.hour % 24) * 60 + (+partes.minute);
      if (dia < 0 || isNaN(agora)) return null;

      var hoje = HORARIOS[dia];
      if (hoje && agora >= hoje[0] && agora < hoje[1]) {
        return { aberto: true, texto: 'Aberto agora · até às ' + hora(hoje[1]) };
      }
      if (hoje && agora < hoje[0]) {
        return { aberto: false, texto: 'Fechado agora · abre hoje às ' + hora(hoje[0]) };
      }
      for (var i = 1; i <= 7; i++) {
        var d = (dia + i) % 7;
        if (HORARIOS[d]) {
          var quando = i === 1 ? 'amanhã' : DIAS[d];
          return { aberto: false, texto: 'Fechado agora · abre ' + quando + ' às ' + hora(HORARIOS[d][0]) };
        }
      }
      return null;
    };

    var mostrarHorario = function () {
      var st = calcularStatus();
      statusHorario.forEach(function (el) {
        if (!st) { el.hidden = true; return; }
        el.textContent = st.texto;
        el.dataset.aberto = String(st.aberto);
        el.hidden = false;
      });
    };
    mostrarHorario();
    setInterval(mostrarHorario, 60000);
  }

  /* ---------- Formulário de contato ---------- */
  var form = document.querySelector('[data-formulario]');
  if (form) {
    var statusForm = form.querySelector('[data-status-form]');
    var telefone = form.querySelector('#f-telefone');
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
      /* Tempo desde que a página abriu (robôs enviam em menos de 3s). Medido no próprio
         aparelho: não depende de o relógio do celular estar certo. */
      form.elements.tempo.value = String(Math.round(performance.now()));
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
