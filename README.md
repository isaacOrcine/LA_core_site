# Site L.A. Core Fisioterapia e Pilates

Site estático (HTML + CSS + JS, sem build) + `api/contato.php` para o formulário.
Hospedagem: Hostinger, plano Sites.

## Ver localmente

```bash
cd lacore-site
python3 -m http.server 8765
# abrir http://localhost:8765
```
O formulário só envia de verdade no servidor (precisa de PHP). Localmente ele mostra a mensagem de erro com a sugestão de usar o WhatsApp — isso é esperado.

## Antes de publicar — checklist de conteúdo

| Item | Onde | Status |
|---|---|---|
| **Domínio** — trocar `lacorefisio.com.br` pelo domínio real | `index.html`, `robots.txt`, `sitemap.xml`, `llms.txt`, `politica-de-privacidade.html` (um "localizar e substituir" resolve) | ⏳ |
| **Logo oficial em SVG** | substituir `assets/img/logo.svg` e `favicon.svg` | ⏳ provisório |
| **Fotos** da estrutura, hero, "Sobre" e das profissionais | `assets/img/` — cada foto em `.avif` + `.jpg` (fallback), já recortadas e sem metadados. Originais em `fotos/` (não publicar essa pasta) | ✅ |
| **Vídeo** de depoimentos (vertical 9:16) | `assets/video/depoimentos.mp4` (H.264 540×960, ~6 MB) + capa `assets/img/video-capa` | ✅ |
| **Formação** das profissionais | `index.html`, blocos marcados com `TODO` | ⏳ |
| **Depoimentos reais** com autorização por escrito | `index.html`, seção `#depoimentos` | ⚠️ **não publicar com os exemplos** |
| **Link do Perfil da Empresa no Google** | `index.html` (botão "Ver avaliações" e rodapé) | ⏳ |
| **Imagem de compartilhamento** 1200×630 | `assets/img/og-lacore.jpg` | ✅ |
| **Ícone Apple** 180×180 | `assets/img/apple-touch-icon.png` | ⏳ |

## Publicar na Hostinger

1. hPanel → **Sites → Gerenciador de Arquivos** → pasta `public_html`.
2. Envie **todo o conteúdo** desta pasta (exceto `README.md`, `PLANO.md` e a pasta `fotos/`), incluindo `.htaccess` e `api/.htaccess`
   (arquivos que começam com ponto ficam ocultos no Mac: `Cmd + Shift + .` para exibir).
3. hPanel → **Segurança → SSL**: ativar o certificado gratuito. O `.htaccess` já força HTTPS.
4. **E-mail do formulário** (recomendado, melhor entrega):
   - hPanel → **E-mails**: criar `contato@SEU-DOMINIO`.
   - Copiar `api/lacore-config.exemplo.php` para **um nível acima** de `public_html` com o nome `lacore-config.php` e preencher a senha.
   - Baixar o [PHPMailer](https://github.com/PHPMailer/PHPMailer/releases) e enviar a pasta `src/` para `public_html/api/PHPMailer/src/`.
   - Sem esses dois passos, o formulário usa o `mail()` da Hostinger (funciona, mas tem mais chance de cair no spam).
5. Enviar uma mensagem de teste pelo formulário e confirmar que chegou em **clinicalacore@gmail.com** (olhar o spam na primeira vez).

## Depois de publicar

- **Google Search Console**: adicionar o domínio e enviar `https://SEU-DOMINIO/sitemap.xml`.
- **Rich Results Test** (search.google.com/test/rich-results): conferir que `MedicalBusiness` e `FAQPage` são reconhecidos.
- **Perfil da Empresa no Google**: criar/verificar, com nome, endereço e telefone **idênticos** aos do site.
- **PageSpeed Insights** (pagespeed.web.dev): meta ≥ 95 no celular, depois de trocar as fotos por versões otimizadas (WebP, ~200 KB cada).
- Testar os botões de WhatsApp em um celular real.

## Estrutura

```
index.html                  página principal
obrigado.html               após enviar o formulário (conversão)
politica-de-privacidade.html
404.html
robots.txt · sitemap.xml · llms.txt    busca e IA
.htaccess                   HTTPS, cache, compressão, segurança
assets/css/tokens.css       paleta e tipografia (mude cores aqui)
assets/css/style.css        estilos
assets/js/whatsapp.js       botão flutuante (computador) / barra de ações (celular), com escolha Anny / Lorena
assets/js/carousel.js       carrossel de fotos
assets/js/main.js           menu, A-/A/A+, barra de ações, "aberto agora", mapa, vídeo, formulário
api/contato.php             envio do formulário por e-mail
```

**Números de WhatsApp:** aparecem como `5537991286155` (Anny) e `5537999398070` (Lorena). Para trocar, "localizar e substituir" em todo o projeto.
