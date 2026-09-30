/* ==========================================================================
   Botão flutuante de WhatsApp com escolha de profissional.
   - Qualquer elemento com [data-wpp-abrir] abre o painel de escolha.
   - [data-wpp-servico="X"] personaliza a mensagem pré-preenchida.
   ========================================================================== */
(function () {
  'use strict';

  var raiz = document.querySelector('[data-wpp]');
  if (!raiz) return;

  var botao  = raiz.querySelector('.wpp__botao');
  var painel = raiz.querySelector('.wpp__painel');
  var opcoes = painel.querySelectorAll('.wpp__opcao');
  var ultimoGatilho = null;

  function mensagem(nome, servico) {
    var base = 'Olá, ' + nome + '! Vim pelo site da L.A. Core e ';
    return servico
      ? base + 'gostaria de saber mais sobre ' + servico + '.'
      : base + 'gostaria de agendar um atendimento.';
  }

  function atualizarLinks(servico) {
    opcoes.forEach(function (a) {
      var url = new URL(a.href);
      url.search = '?text=' + encodeURIComponent(mensagem(a.dataset.wppNome, servico));
      a.href = url.toString();
    });
  }

  function abrir(gatilho, servico) {
    ultimoGatilho = gatilho || botao;
    atualizarLinks(servico);
    painel.hidden = false;
    botao.setAttribute('aria-expanded', 'true');
    botao.querySelector('.wpp__rotulo').textContent = 'Fechar';
    opcoes[0].focus();
  }

  function fechar(devolverFoco) {
    if (painel.hidden) return;
    painel.hidden = true;
    botao.setAttribute('aria-expanded', 'false');
    botao.querySelector('.wpp__rotulo').textContent = 'Fale conosco';
    if (devolverFoco && ultimoGatilho) ultimoGatilho.focus();
  }

  botao.addEventListener('click', function () {
    painel.hidden ? abrir(botao) : fechar(true);
  });

  document.addEventListener('click', function (e) {
    var gatilho = e.target.closest('[data-wpp-abrir]');
    if (gatilho) {
      e.preventDefault();
      e.stopPropagation();
      abrir(gatilho, gatilho.dataset.wppServico);
      return;
    }
    if (!painel.hidden && !raiz.contains(e.target)) fechar(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !painel.hidden) fechar(true);
  });

  /* Ao escolher uma profissional, fecha o painel (a conversa abre em nova aba) */
  opcoes.forEach(function (a) {
    a.addEventListener('click', function () { setTimeout(function () { fechar(false); }, 150); });
  });

  /* Métrica de conversão: todo clique em link de WhatsApp vira evento no GA4 */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[data-wpp-profissional]');
    if (!link) return;
    var evento = { event: 'click_whatsapp', profissional: link.dataset.wppProfissional };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(evento);
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'click_whatsapp', { profissional: evento.profissional });
    }
  });

  /* Pulso discreto, uma única vez, para chamar atenção sem incomodar */
  setTimeout(function () {
    if (painel.hidden) botao.dataset.pulso = 'true';
  }, 8000);

  atualizarLinks();
})();
