# Plano de Trabalho — Site L.A. Core Fisioterapia e Pilates

**Objetivo:** site institucional responsivo, rápido e otimizado para busca (Google + citação por IAs), servindo como canal de captação de pacientes em Divinópolis/MG. Conversão principal = clique no WhatsApp.

---

## 1. Decisões técnicas (recomendação)

| Item | Decisão | Por quê |
|---|---|---|
| **Stack** | HTML5 + CSS3 + JavaScript vanilla, **sem build step** | O plano "Sites" da Hostinger é hospedagem compartilhada (Apache + PHP, **sem Node**). Site estático puro sobe por File Manager/FTP, roda em qualquer lugar, nota ~100 no Lighthouse e não quebra em atualização de dependência. |
| **Páginas** | Single Page (`index.html`) com âncoras + páginas auxiliares (`/obrigado`, `/politica-de-privacidade`, `404`) | Clínica local com poucos serviços converte melhor em página única. Estrutura preparada para virar multipágina depois. |
| **CSS** | CSS puro com Custom Properties (design tokens) + `clamp()` | Sem Tailwind/SASS = sem build. Tokens deixam a paleta da marca centralizada em um lugar. |
| **JS** | Vanilla, módulos pequenos, sem framework | Carrossel, menu, FAQ e WhatsApp não justificam React. |
| **Formulário de e-mail** | PHP nativo (`contato.php`) com PHPMailer via SMTP da Hostinger — *alternativa:* Web3Forms/Formspree | A Hostinger dá e-mail profissional no plano; `mail()` puro cai em spam, SMTP autenticado não. |
| **Fontes** | Self-hosted (.woff2) via `@font-face` | Sem chamada ao Google Fonts = mais rápido e sem cookie de terceiro (LGPD). |
| **Imagens** | WebP + `<picture>` + `loading="lazy"` + `width/height` | CLS zero e LCP baixo. |

> **Alternativa se quiser escalar depois (blog/SEO de conteúdo):** Astro com `output: 'static'`, build local e upload da pasta `dist/`. Exige instalar Node na sua máquina. Não recomendo agora — não é necessário para o escopo atual.

---

## 2. Estrutura de arquivos

```
lacore-site/
├── index.html
├── obrigado.html
├── politica-de-privacidade.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── llms.txt                  # guia para IAs (Claude/ChatGPT/Perplexity)
├── .htaccess                 # HTTPS, www→raiz, cache, compressão, headers
├── favicon.ico / site.webmanifest
├── assets/
│   ├── css/
│   │   ├── tokens.css        # paleta, tipografia, espaçamentos
│   │   └── style.css
│   ├── js/
│   │   ├── main.js           # menu, scroll suave, reveal, FAQ
│   │   ├── carousel.js       # carrossel de fotos
│   │   └── whatsapp.js       # botão flutuante + seleção de profissional
│   ├── img/                  # .webp otimizados + fallback .jpg
│   ├── video/                # vídeo institucional (ou embed)
│   └── fonts/                # .woff2
└── api/
    └── contato.php           # envio do formulário + honeypot + rate limit
```

---

## 3. Design System (derivado da identidade da marca)

### Paleta — `tokens.css`
```css
:root{
  --verde-escuro:  #35512A;  /* âncora da marca, footer, CTAs secundários */
  --verde-oliva:   #7A7357;  /* fundo do logo, seções alternadas */
  --oliva-claro:   #8C9179;  /* fundo da seção de valores (slide 7) */
  --areia:         #B79A79;  /* detalhes, bordas, ícones */
  --dourado:       #CDB07A;  /* logo, destaques, hover */
  --creme:         #EFE8DE;  /* fundo principal */
  --marrom:        #4B3A2C;  /* fundo dos cards/slides escuros, textos fortes */
  --marrom-medio:  #89663E;
  --branco:        #FDFCFA;
}
```
**Regras de uso:** creme como fundo dominante; marrom escuro em cards de destaque e footer; verde escuro/oliva em seções alternadas para ritmo visual; dourado **só** em detalhes e hover (nunca em texto corrido — falha contraste). Todo par texto/fundo validado em **AA (4.5:1)**.

### Tipografia
- **Display/títulos:** serifada elegante (ex.: *Cormorant Garamond* ou *Playfair Display*) — combina com o logo.
- **Corpo/UI:** sans-serif geométrica de traço aberto (ex.: *Poppins* ou *Jost*) — igual aos slides.
- Escala fluida com `clamp()`; corpo mínimo 16px; altura de linha 1.6.

### Outros tokens
Espaçamento em escala 4/8px · raio de borda 16–24px (cards arredondados como na apresentação) · sombras suaves · transições 200–300ms · `prefers-reduced-motion` respeitado.

---

## 4. Seções do site (ordem da página)

| # | Seção | Conteúdo | Observação |
|---|---|---|---|
| 0 | **Header fixo** | Logo, menu, CTA "Agendar" | Compacta no scroll; menu hambúrguer < 900px |
| 1 | **Hero** | Headline + subtítulo + 2 CTAs (WhatsApp / Serviços) + foto ou vídeo de fundo | H1 com palavra-chave local: *"Fisioterapia e Pilates em Divinópolis/MG"* |
| 2 | **Sobre a clínica** | Texto institucional (slide 2) + selos: humanizado, baseado em evidências, individualizado | |
| 3 | **Serviços** ✅ | Cards: Fisioterapia Traumato-Ortopédica · Fisioterapia Pediátrica e Estimulação Precoce · Fisioterapia Geriátrica · Pilates (trio e individual) · Recovery / Liberação Miofascial · Massagem Terapêutica · Avaliação Fisioterapêutica | Cada card com ícone, descrição curta e CTA WhatsApp |
| 4 | **Profissionais** ✅ | Anny Caroline (CREFITO4 417764-F) e Lorena Araújo (CREFITO4 420372-F): foto, especialização, formação, CREFITO, botão WhatsApp individual | Registro CREFITO visível = exigência do COFFITO |
| 5 | **Estrutura (carrossel)** ✅ | Carrossel de fotos do espaço (fotos do slide 10) | Detalhes na seção 5.3 |
| 6 | **Vídeo** ✅ | Vídeo institucional/tour | Detalhes na seção 5.4 |
| 7 | ~~Valores~~ | **Decidido: preços não aparecem no site.** No lugar, CTA "Consulte valores pelo WhatsApp" nos serviços | Mantém flexibilidade de reajuste e leva o lead à conversa |
| 8 | **Depoimentos** ✅ | Carrossel/grid de feedbacks de pacientes + link para avaliações do Google | ⚠️ COFFITO proíbe foto de antes/depois e promessa de resultado. Depoimento com nome e consentimento por escrito. |
| 9 | **Convênios** | GymPass · TotalPass — sem check-in extra, sem horário fixo | Diferencial competitivo forte |
| 10 | **FAQ** | 6–8 perguntas (horários, pagamento, avaliação, aula experimental R$40, pediatria, estacionamento) | Marcação `FAQPage` = rich snippet no Google |
| 11 | **Contato** ✅ | Formulário por e-mail + WhatsApp + telefone + horários + formas de pagamento (Pix/dinheiro) | |
| 12 | **Mapa + endereço** ✅ | Google Maps incorporado (lazy) + endereço completo + **aviso de estacionamento** (slide 9) | |
| 13 | **Footer** | Logo, navegação, redes sociais ✅, CNPJ, CREFITOs, política de privacidade, crédito | |
| — | **Botão flutuante WhatsApp** ✅ | Fixo, canto inferior direito, em todas as telas | Detalhes na seção 5.1 |

---

## 5. Detalhamento das funcionalidades pedidas

### 5.1 Botão flutuante de WhatsApp com escolha de profissional ⭐
- Botão fixo (`position: fixed`, bottom-right, `z-index` alto, safe-area do iPhone).
- **Ao clicar → abre um mini-painel** acima do botão com as duas opções:
  - **Anny Caroline** — *Ortopedia, dor musculoesquelética e Pilates* → `wa.me/5537991286155`
  - **Lorena Araújo** — *Pediatria, estimulação precoce, ortopedia e Pilates* → `wa.me/5537999398070`
- Cada opção com foto circular, nome, especialidade e mensagem pré-preenchida diferente via `?text=` (ex.: *"Olá, Anny! Vim pelo site e gostaria de agendar uma avaliação."*).
- Acessibilidade: `aria-expanded`, navegação por teclado, `Esc` fecha, foco preso no painel aberto.
- Micro-interações: pulso discreto a cada ~8s (desativado com `prefers-reduced-motion`), painel com fade+slide.
- **O mesmo componente é reaproveitado** nos CTAs dos cards de serviço e na seção de profissionais (aí já direcionado à pessoa certa, sem escolha).
- Rastreamento: `dataLayer.push` / evento GA4 `click_whatsapp` com o parâmetro `profissional`.

### 5.2 Formulário de contato por e-mail
- Campos: nome, telefone (máscara), e-mail, serviço de interesse (select), mensagem, checkbox de consentimento LGPD.
- Validação nativa HTML5 + JS, mensagens de erro acessíveis (`aria-live`).
- Envio por `fetch` → `api/contato.php` → SMTP autenticado; resposta inline, sem recarregar; redireciona para `obrigado.html` (página de conversão rastreável).
- Anti-spam: honeypot + campo de tempo mínimo + rate limit por IP (sem CAPTCHA, que atrapalha conversão).
- **Sanitização obrigatória** dos campos antes de montar o e-mail (prevenir header injection).

### 5.3 Carrossel de fotos
- Implementação com **CSS Scroll Snap + JS mínimo** (sem biblioteca): setas, dots, arrasto no touch, autoplay que pausa no hover/foco.
- Acessível: `role="region"` + `aria-roledescription="carrossel"`, botões rotulados, pausável.
- Lazy loading dos slides fora da viewport; primeira imagem com `fetchpriority="high"`.
- Lightbox opcional ao clicar (abre a foto ampliada).

### 5.4 Vídeo
- **Recomendado:** vídeo auto-hospedado `.mp4` (H.264) com `poster`, sem autoplay, `preload="none"` — evita cookies de terceiro e mantém a página leve.
- Se o vídeo for pesado (>15MB) ou já estiver no YouTube/Instagram: **facade** — imagem de capa clicável que só carrega o iframe após o clique (economiza ~1MB de JS do YouTube).
- Marcação `VideoObject` no JSON-LD.

### 5.5 Mapa
- `<iframe>` do Google Maps com `loading="lazy"`, carregado **só após interação** (facade com imagem estática) para não pesar o LCP.
- Ao lado: endereço completo, link "Como chegar" (abre Google Maps/Waze) e o **aviso de estacionamento** da rua Goiás, que é informação útil e real de atendimento.

### 5.6 Redes sociais
- Ícones SVG inline (sem biblioteca de ícones) no footer e no contato: **Instagram** (`https://www.instagram.com/lacorefisio/`), WhatsApp, Google Meu Negócio, Facebook/TikTok/YouTube se existirem.
- `rel="noopener noreferrer"`, `target="_blank"`, `aria-label` descritivo.

---

## 6. SEO + AEO (aparecer no Google e ser citado por IAs) ⭐

### 6.1 Técnico
- `robots.txt` liberando tudo + apontando o sitemap + permitindo explicitamente `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended` (essencial para ser mencionado por IAs).
- `sitemap.xml` com `lastmod`, enviado ao Google Search Console.
- `llms.txt` na raiz: resumo em texto puro da clínica, serviços, profissionais, endereço e horários — formato que assistentes de IA leem bem.
- URLs limpas, HTTPS forçado, canonical, redirect `www` → raiz, 404 personalizada.
- `.htaccess`: Gzip/Brotli, cache-control longo para assets, headers de segurança (`X-Content-Type-Options`, `Referrer-Policy`, CSP básica).

### 6.2 On-page
- **Title:** `Fisioterapia e Pilates em Divinópolis MG | L.A. Core`
- **Meta description** com proposta de valor + localização + CTA.
- Um único `<h1>`; hierarquia H2/H3 correta; `lang="pt-BR"`.
- Palavras-chave locais trabalhadas no texto: *fisioterapia em Divinópolis*, *pilates Divinópolis*, *fisioterapia pediátrica Divinópolis*, *clínica de fisioterapia bairro Ipiranga*, *fisioterapia ortopédica MG*, *estimulação precoce bebê Divinópolis*.
- Open Graph + Twitter Card (preview bonito ao compartilhar no WhatsApp/Instagram).
- Imagens com `alt` descritivo e nomes de arquivo semânticos.

### 6.3 Dados estruturados (JSON-LD) — o que mais pesa para IA
- `MedicalBusiness` / `Physiotherapy`: nome, endereço completo, geo, telefone, `openingHoursSpecification`, `priceRange`, `paymentAccepted`, `areaServed: Divinópolis`, `sameAs` (Instagram, Google).
- `Person` × 2 para Anny e Lorena, com `jobTitle`, `identifier` (CREFITO) e `worksFor`.
- `Service` para cada serviço · `FAQPage` · `VideoObject` · `BreadcrumbList` · `Review`/`AggregateRating` (só com depoimentos reais).

### 6.4 Fora do site (fundamental para busca local)
- Criar/otimizar o **Perfil da Empresa no Google** (Google Meu Negócio) com o mesmo NAP do site — é o que coloca a clínica no mapa e no "perto de mim".
- Consistência de NAP (nome, endereço, telefone) em todos os canais.
- Google Search Console + Google Analytics 4 (com consentimento).

---

## 7. Performance, acessibilidade e responsividade

**Metas:** Lighthouse ≥ 95 em Performance/SEO/Boas práticas e **100 em Acessibilidade**; LCP < 2,0s; CLS < 0,05; peso inicial < 500KB.

- **Mobile-first.** Breakpoints: 360 / 480 / 768 / 1024 / 1280 / 1536px.
- Alvos de toque ≥ 44×44px; sem scroll horizontal; `dvh` para viewport no mobile.
- Navegação completa por teclado, foco visível, skip-link, contraste AA, `prefers-reduced-motion`.
- Teste real em iOS Safari, Chrome Android, Firefox e Edge.

---

## 7-B. Público 60+ — legibilidade e facilidade de uso ⭐

O público da clínica inclui idosos (fisioterapia geriátrica e Pilates). O site é desenhado para eles **sem parecer um site "para idoso"** — as escolhas abaixo melhoram a experiência de todo mundo:

- **Corpo de texto a 19px** (não 16px) e títulos generosos; altura de linha 1.7 e largura máxima de ~65 caracteres por linha.
- **Controle "A- / A / A+"** fixo no cabeçalho para aumentar a fonte de todo o site até 130%, com a preferência salva no navegador.
- **Peso de fonte mínimo 400** — nada de texto fino em cinza claro. Contraste alvo **AAA (7:1)** no texto corrido, acima do mínimo legal.
- **Botões grandes (mín. 56px de altura) e sempre com texto**, nunca só ícone — "Falar no WhatsApp", não um ícone solto.
- **Nada depende de `hover`**: tudo que aparece ao passar o mouse também aparece ao tocar e ao navegar por teclado.
- **Carrossel lento e controlável**: sem avanço automático agressivo, setas grandes, pausa evidente, e as fotos também acessíveis rolando o dedo.
- **Menu simples e sempre visível**, sem submenus aninhados; cabeçalho fixo com o botão de contato à mão em qualquer ponto da página.
- **Telefones clicáveis** (`tel:`) e endereço com botão "Como chegar" — menos digitação.
- **Formulário curto**, rótulos sempre visíveis (nunca só placeholder), erros em texto claro explicando o que corrigir.
- **Animações discretas** e respeito total a `prefers-reduced-motion`; nada de parallax ou movimento que desoriente.
- **Zoom até 200% sem quebrar** o layout e sem scroll horizontal.

---

## 8. Conformidade (COFFITO/CREFITO + LGPD)

Pontos que impactam o conteúdo e precisam ser respeitados no texto do site:
- Exibir **nome e número CREFITO** das profissionais e o responsável técnico.
- **Proibido** prometer/garantir resultado, usar foto de antes e depois, ou anunciar atendimento experimental gratuito de Pilates (Res. COFFITO 424/2013, art. 39) — por isso a aula experimental aparece como **R$40 abatidos da primeira mensalidade**.
- Depoimentos só com autorização escrita do paciente.
- LGPD: política de privacidade, checkbox de consentimento no formulário, informar finalidade e contato do responsável pelos dados.

---

## 9. Fases de execução

> **Status em 19/09/2026:** fases 1 a 5 concluídas e testadas (layout de 320px a 1440px, com e sem A+; painel de WhatsApp; menu; validação do formulário; JSON-LD; contraste). Fase 6 aguarda fotos reais; fase 7 aguarda domínio. Pendências de conteúdo no `README.md`.


| Fase | Entregável | Estimativa |
|---|---|---|
| **1. Fundação** | Estrutura de pastas, `tokens.css` com a paleta, reset, tipografia, header + footer, `.htaccess` | 1 dia |
| **2. Conteúdo estático** | Hero, Sobre, Serviços, Profissionais, Convênios, Valores, FAQ — já responsivos | 2 dias |
| **3. Interatividade** | Botão WhatsApp com seleção, carrossel de fotos, carrossel de depoimentos, vídeo, menu mobile, FAQ acordeão | 1,5 dia |
| **4. Contato e mapa** | Formulário + `contato.php` + SMTP + página de obrigado + mapa com facade | 1 dia |
| **5. SEO/AEO** | robots.txt, sitemap.xml, llms.txt, JSON-LD completo, OG, metas, favicon/manifest | 0,5 dia |
| **6. Otimização** | Compressão de imagens para WebP, auditoria Lighthouse, correções de acessibilidade, testes cross-browser | 1 dia |
| **7. Deploy** | Upload para `public_html` na Hostinger, SSL, domínio, e-mail SMTP, GSC + GA4, teste do formulário em produção | 0,5 dia |

**Total: ~7,5 dias de trabalho efetivo.** As fases 1–3 podem começar imediatamente com conteúdo real da apresentação; o que depende de você está abaixo.

---

## 10. O que preciso de você para destravar

**Resolvido ✅**
- WhatsApp Anny: **(37) 99128-6155** · WhatsApp Lorena: **(37) 99939-8070**
- E-mail de contato: **clinicalacore@gmail.com**
- Preços: **não serão publicados**

**Bloqueador restante:**
1. **Domínio** já contratado? Qual? (ex.: `lacorefisio.com.br`) — necessário para canonical, sitemap e SSL.

**Importantes (posso usar placeholder e trocar depois):**
4. **Logo em vetor** (SVG/PDF/AI) — o do PDF é raster e vai ficar borrado em tela retina.
5. **Fotos** da estrutura em alta resolução (as do slide 10 estão em baixa) e fotos individuais das profissionais.
6. **Vídeo** institucional (arquivo ou link).
7. **Depoimentos** reais de pacientes, com autorização.
8. **Formação completa** das duas (graduação, instituição, pós/especializações, cursos) — hoje só tenho a especialidade resumida.
9. Outras redes sociais além do Instagram e CNPJ para o rodapé.

---

## 11. Checklist de lançamento

- [ ] SSL ativo e HTTPS forçado
- [ ] Formulário testado em produção (chegou na caixa de entrada, não no spam)
- [ ] Todos os links de WhatsApp testados no celular
- [ ] Sitemap enviado no Google Search Console
- [ ] Rich Results Test aprovado (LocalBusiness + FAQ)
- [ ] Lighthouse mobile ≥ 95
- [ ] Perfil da Empresa no Google criado e vinculado
- [ ] Preview de compartilhamento (OG) testado no WhatsApp
- [ ] Testado em iPhone e Android reais
- [ ] Backup do site e acesso ao hPanel documentado
