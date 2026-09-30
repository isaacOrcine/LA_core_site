<?php
/**
 * L.A. Core — recebe o formulário de contato e envia por e-mail.
 *
 * Envio:
 *   1. SMTP autenticado (recomendado) se existir api/PHPMailer/src/ e o arquivo
 *      de configuração com a senha. Melhor entrega, não cai em spam.
 *   2. Senão, usa mail() do servidor da Hostinger.
 *
 * Credenciais SMTP ficam FORA da pasta pública, em ../../lacore-config.php
 * (um nível acima de public_html). Modelo em api/lacore-config.exemplo.php.
 */

declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const DESTINO        = 'clinicalacore@gmail.com';
const ASSUNTO_PREFIX = '[Site L.A. Core]';
const LIMITE_POR_HORA = 5;
const TEMPO_MINIMO_S  = 3;

function responder(int $status, bool $ok, string $mensagem = ''): void {
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'mensagem' => $mensagem], JSON_UNESCAPED_UNICODE);
    exit;
}

/* Remove quebras de linha: impede injeção de cabeçalhos de e-mail */
function linha(string $v, int $max): string {
    $v = trim(preg_replace('/[\r\n\t]+/', ' ', $v) ?? '');
    return mb_substr($v, 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(405, false, 'Método não permitido.');
}

/* ---- Anti-spam ---- */
if (!empty($_POST['site'])) {
    responder(200, true); // robô: finge sucesso e descarta
}
$inicio = (int) ($_POST['inicio'] ?? 0);
if ($inicio > 0 && (microtime(true) * 1000 - $inicio) < TEMPO_MINIMO_S * 1000) {
    responder(200, true);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$arquivoLimite = sys_get_temp_dir() . '/lacore_' . hash('sha256', $ip);
$envios = [];
if (is_file($arquivoLimite)) {
    $envios = array_filter(
        (array) json_decode((string) file_get_contents($arquivoLimite), true),
        fn($t) => $t > time() - 3600
    );
}
if (count($envios) >= LIMITE_POR_HORA) {
    responder(429, false, 'Você já enviou várias mensagens na última hora.');
}

/* ---- Validação ---- */
$nome        = linha((string) ($_POST['nome'] ?? ''), 100);
$telefone    = linha((string) ($_POST['telefone'] ?? ''), 20);
$email       = linha((string) ($_POST['email'] ?? ''), 120);
$servico     = linha((string) ($_POST['servico'] ?? ''), 80);
$mensagem    = mb_substr(trim((string) ($_POST['mensagem'] ?? '')), 0, 2000);
$consentiu   = ($_POST['consentimento'] ?? '') === 'sim';

$digitos = preg_replace('/\D/', '', $telefone) ?? '';
if ($nome === '' || strlen($digitos) < 10 || $servico === '' || $mensagem === '' || !$consentiu) {
    responder(422, false, 'Preencha todos os campos obrigatórios.');
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(422, false, 'O e-mail informado parece inválido.');
}

/* ---- Monta a mensagem ---- */
$wpp = 'https://wa.me/55' . ltrim($digitos, '0');
$corpo = "Nova mensagem pelo site da L.A. Core\n"
       . "========================================\n\n"
       . "Nome:      {$nome}\n"
       . "Telefone:  {$telefone}\n"
       . "WhatsApp:  {$wpp}\n"
       . "E-mail:    " . ($email ?: '(não informado)') . "\n"
       . "Assunto:   {$servico}\n\n"
       . "Mensagem:\n{$mensagem}\n\n"
       . "----------------------------------------\n"
       . "Enviado em " . date('d/m/Y H:i') . " · consentimento LGPD: sim\n";
$assunto = ASSUNTO_PREFIX . " {$servico} — {$nome}";

/* ---- Envio ---- */
$config = [];
$caminhoConfig = dirname(__DIR__, 2) . '/lacore-config.php';
if (is_file($caminhoConfig)) {
    $config = (array) require $caminhoConfig;
}

$enviado = false;
$phpmailer = __DIR__ . '/PHPMailer/src/PHPMailer.php';

if (!empty($config['smtp_senha']) && is_file($phpmailer)) {
    require $phpmailer;
    require __DIR__ . '/PHPMailer/src/SMTP.php';
    require __DIR__ . '/PHPMailer/src/Exception.php';
    try {
        $m = new PHPMailer\PHPMailer\PHPMailer(true);
        $m->isSMTP();
        $m->Host       = $config['smtp_host'] ?? 'smtp.hostinger.com';
        $m->Port       = (int) ($config['smtp_porta'] ?? 465);
        $m->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
        $m->SMTPAuth   = true;
        $m->Username   = $config['smtp_usuario'];
        $m->Password   = $config['smtp_senha'];
        $m->CharSet    = 'UTF-8';
        $m->setFrom($config['smtp_usuario'], 'Site L.A. Core');
        $m->addAddress(DESTINO);
        if ($email !== '') $m->addReplyTo($email, $nome);
        $m->Subject = $assunto;
        $m->Body    = $corpo;
        $enviado = $m->send();
    } catch (Throwable $e) {
        error_log('[lacore] SMTP: ' . $e->getMessage());
    }
} else {
    $remetente = $config['remetente'] ?? ('nao-responda@' . preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'localhost'));
    $cabecalhos = [
        'From: Site L.A. Core <' . $remetente . '>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];
    if ($email !== '') $cabecalhos[] = 'Reply-To: ' . $nome . ' <' . $email . '>';
    $enviado = mail(DESTINO, '=?UTF-8?B?' . base64_encode($assunto) . '?=', $corpo, implode("\r\n", $cabecalhos));
}

if (!$enviado) {
    responder(500, false, '');
}

$envios[] = time();
@file_put_contents($arquivoLimite, json_encode(array_values($envios)), LOCK_EX);
responder(200, true);
