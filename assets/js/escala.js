/* Roda antes da primeira pintura (por isso fica no <head>, sem defer):
   tira a classe "no-js" e aplica o tamanho de texto escolhido (A- / A / A+),
   evitando o "salto" de layout. Fica em arquivo próprio para a CSP não
   precisar de 'unsafe-inline'. */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');
  try {
    var e = localStorage.getItem('lacore-escala');
    if (e === '0.9' || e === '1' || e === '1.2') {
      document.documentElement.style.setProperty('--escala-fonte', e);
    }
  } catch (_) {}
})();
