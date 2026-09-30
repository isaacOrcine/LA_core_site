/* ==========================================================================
   Carrossel acessível sem dependências.
   Base em CSS scroll-snap: funciona com o dedo mesmo sem JavaScript.
   Avanço automático lento (7s), pausa ao passar o mouse, focar ou tocar,
   e desligado por padrão para quem prefere menos movimento.
   ========================================================================== */
(function () {
  'use strict';

  var INTERVALO = 7000;
  var menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-carrossel]').forEach(function (carrossel) {
    var trilho   = carrossel.querySelector('.carrossel__trilho');
    var slides   = Array.prototype.slice.call(trilho.children);
    var pontos   = carrossel.querySelector('.carrossel__pontos');
    var btnAnt   = carrossel.querySelector('[data-anterior]');
    var btnProx  = carrossel.querySelector('[data-proximo]');
    var btnPausa = carrossel.querySelector('[data-pausa]');
    var status   = carrossel.querySelector('[data-status]');

    var atual = 0;
    var posicoes = 1;
    var timer = null;
    var pausadoPeloUsuario = menosMovimento;
    var emInteracao = false;

    function passo() {
      var gap = parseFloat(getComputedStyle(trilho).columnGap) || 0;
      return slides[0].getBoundingClientRect().width + gap;
    }

    function porTela() {
      return Math.max(1, Math.round((trilho.clientWidth + 1) / passo()));
    }

    function montarPontos() {
      posicoes = slides.length - porTela() + 1;
      pontos.innerHTML = '';
      for (var i = 0; i < posicoes; i++) {
        var li = document.createElement('li');
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'carrossel__ponto';
        b.setAttribute('aria-label', 'Ir para a foto ' + (i + 1));
        b.dataset.indice = i;
        li.appendChild(b);
        pontos.appendChild(li);
      }
      marcar();
    }

    function marcar() {
      pontos.querySelectorAll('.carrossel__ponto').forEach(function (b, i) {
        if (i === atual) b.setAttribute('aria-current', 'true');
        else b.removeAttribute('aria-current');
      });
    }

    function irPara(i, anunciar) {
      atual = (i + posicoes) % posicoes;
      trilho.scrollTo({ left: atual * passo(), behavior: menosMovimento ? 'auto' : 'smooth' });
      marcar();
      if (anunciar) status.textContent = 'Foto ' + (atual + 1) + ' de ' + slides.length + ': ' +
        (slides[atual].querySelector('figcaption') || {}).textContent;
    }

    /* Sincroniza o índice quando a pessoa arrasta com o dedo */
    var rolagem;
    trilho.addEventListener('scroll', function () {
      clearTimeout(rolagem);
      rolagem = setTimeout(function () {
        var i = Math.round(trilho.scrollLeft / passo());
        if (i !== atual) { atual = Math.min(i, posicoes - 1); marcar(); }
      }, 90);
    }, { passive: true });

    btnAnt.addEventListener('click',  function () { irPara(atual - 1, true); });
    btnProx.addEventListener('click', function () { irPara(atual + 1, true); });
    pontos.addEventListener('click', function (e) {
      var b = e.target.closest('.carrossel__ponto');
      if (b) irPara(+b.dataset.indice, true);
    });
    trilho.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); irPara(atual + 1, true); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); irPara(atual - 1, true); }
    });

    /* --- Avanço automático --- */
    function rodando() { return !pausadoPeloUsuario && !emInteracao; }
    function agendar() {
      clearInterval(timer);
      if (rodando()) timer = setInterval(function () { irPara(atual + 1, false); }, INTERVALO);
    }
    function atualizarBotaoPausa() {
      btnPausa.setAttribute('aria-pressed', String(pausadoPeloUsuario));
      btnPausa.querySelector('span').textContent = pausadoPeloUsuario ? 'Reproduzir' : 'Pausar';
      btnPausa.querySelector('use').setAttribute('href', pausadoPeloUsuario ? '#i-play' : '#i-pausa');
    }
    btnPausa.addEventListener('click', function () {
      pausadoPeloUsuario = !pausadoPeloUsuario;
      atualizarBotaoPausa();
      agendar();
    });

    ['mouseenter', 'focusin', 'touchstart'].forEach(function (ev) {
      carrossel.addEventListener(ev, function () { emInteracao = true; agendar(); }, { passive: true });
    });
    ['mouseleave', 'focusout'].forEach(function (ev) {
      carrossel.addEventListener(ev, function (e) {
        if (ev === 'focusout' && carrossel.contains(e.relatedTarget)) return;
        emInteracao = false; agendar();
      });
    });

    /* Só roda quando está visível na tela */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          if (en.isIntersecting) agendar(); else clearInterval(timer);
        });
      }, { threshold: 0.35 }).observe(carrossel);
    }

    var redim;
    window.addEventListener('resize', function () {
      clearTimeout(redim);
      redim = setTimeout(function () { montarPontos(); irPara(Math.min(atual, posicoes - 1), false); }, 200);
    });

    montarPontos();
    atualizarBotaoPausa();
  });
})();
