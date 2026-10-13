<?php
/**
 * MODELO — não coloque a senha real aqui.
 *
 * Copie este arquivo para UM NÍVEL ACIMA de public_html, com o nome
 * lacore-config.php, e preencha a senha.
 *
 *   /home/uXXXXXXX/domains/lacorefisioterapia.com.br/lacore-config.php   ← aqui
 *   /home/uXXXXXXX/domains/lacorefisioterapia.com.br/public_html/        ← site
 *
 * Envio pelo Gmail da clínica (as mensagens chegam na própria caixa):
 *   1. Conta Google → Segurança → ative a verificação em duas etapas.
 *   2. Crie uma "senha de app" em myaccount.google.com/apppasswords e cole abaixo
 *      (sem espaços). A senha normal do Gmail NÃO funciona por SMTP.
 *
 * Alternativa: uma caixa criada no hPanel (Hostinger → E-mails), por exemplo
 * contato@lacorefisioterapia.com.br, com smtp_host 'smtp.hostinger.com'.
 */
return [
    'smtp_host'    => 'smtp.gmail.com',
    'smtp_porta'   => 465,
    'smtp_usuario' => 'clinicalacore@gmail.com',
    'smtp_senha'   => 'SENHA-DE-APP-DO-GMAIL',
];
