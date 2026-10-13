/* ==========================================================================
   Botão flutuante de WhatsApp com escolha de profissional.
   - Qualquer elemento com [data-wpp-abrir] abre o painel de escolha.
   - [data-wpp-servico="X"] personaliza a mensagem pré-preenchida.
   - [data-wpp-modo="ligar"] abre o mesmo painel, mas com links de telefone.
   ========================================================================== */
(function () {
  'use strict';

  var raiz = document.querySelector('[data-wpp]');
  if (!raiz) return;

  var botao  = raiz.querySelector('.wpp__botao');
  var painel = raiz.querySelector('.wpp__painel');
  var opcoes = painel.querySelectorAll('.wpp__opcao');
  var fundo  = raiz.querySelector('.wpp__fundo');
  var topo   = painel.querySelector('.wpp__topo');
  var titulo = painel.querySelector('#wpp-titulo');
  var subtitulo = painel.querySelector('[data-wpp-subtitulo]');
  var ultimoGatilho = null;

  var TEXTOS = {
    whatsapp: { titulo: 'Com quem você quer falar?', sub: 'Escolha a fisioterapeuta. Respondemos no horário de atendimento.', icone: '#i-whatsapp' },
    ligar:    { titulo: 'Para quem você quer ligar?', sub: 'Escolha a fisioterapeuta. Atendemos no horário de funcionamento.', icone: '#i-telefone' }
  };

  /* Guarda o link original do WhatsApp de cada opção */
  opcoes.forEach(function (a) { a.dataset.wppBase = a.getAttribute('href'); });

  function mensagem(nome, servico) {
    var base = 'Olá, ' + nome + '! Vim pelo site da LA Core e ';
    return servico
      ? base + 'gostaria de saber mais sobre ' + servico + '.'
      : base + 'gostaria de agendar um atendimento.';
  }

  function atualizarLinks(servico, modo) {
    var textos = TEXTOS[modo] || TEXTOS.whatsapp;
    titulo.textContent = textos.titulo;
    subtitulo.textContent = textos.sub;
    topo.dataset.modo = modo || 'whatsapp';
    opcoes.forEach(function (a) {
      a.querySelector('.wpp__seta use').setAttribute('href', textos.icone);
      if (modo === 'ligar') {
        a.href = 'tel:' + a.dataset.tel;
        a.removeAttribute('target');
        return;
      }
      var url = new URL(a.dataset.wppBase);
      url.search = '?text=' + encodeURIComponent(mensagem(a.dataset.wppNome, servico));
      a.href = url.toString();
      a.target = '_blank';
    });
  }

  function abrir(gatilho, servico, modo) {
    ultimoGatilho = gatilho || botao;
    atualizarLinks(servico, modo);
    painel.hidden = false;
    if (fundo) fundo.hidden = false;
    botao.setAttribute('aria-expanded', 'true');
    botao.querySelector('.wpp__rotulo').textContent = 'Fechar';
    opcoes[0].focus();
  }

  function fechar(devolverFoco) {
    if (painel.hidden) return;
    painel.hidden = true;
    if (fundo) fundo.hidden = true;
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
      abrir(gatilho, gatilho.dataset.wppServico, gatilho.dataset.wppModo);
      return;
    }
    if (e.target.closest('[data-wpp-fechar]')) { fechar(true); return; }
    if (!painel.hidden && !raiz.contains(e.target)) fechar(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !painel.hidden) fechar(true);
  });

  /* Ao escolher uma profissional, fecha o painel (a conversa abre em nova aba) */
  opcoes.forEach(function (a) {
    a.addEventListener('click', function () { setTimeout(function () { fechar(false); }, 150); });
  });

  /* Métrica de conversão: todo clique em WhatsApp ou telefone vira evento no GA4 */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[data-wpp-profissional], a[data-tel-profissional]');
    if (!link) return;
    var nome = link.href.indexOf('tel:') === 0 ? 'click_telefone' : 'click_whatsapp';
    var profissional = link.dataset.wppProfissional || link.dataset.telProfissional;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: nome, profissional: profissional });
    if (typeof window.gtag === 'function') {
      window.gtag('event', nome, { profissional: profissional });
    }
  });

  /* Pulso discreto, uma única vez, para chamar atenção sem incomodar */
  setTimeout(function () {
    if (painel.hidden) botao.dataset.pulso = 'true';
  }, 8000);

  atualizarLinks();
})();
