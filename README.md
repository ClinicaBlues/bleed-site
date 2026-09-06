# BLEED — Landing page (bleed.clinicablues.com.br)

Site estático (HTML + CSS + JS puro), sem build, pronto para tráfego pago.
Pagamentos 100% no **Stripe Checkout hospedado** (Payment Links). Nenhum dado de cartão passa pelo site.

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | Landing page completa (hero, dor, método, planos, cronograma, prática, kit, Hot Seats, comunidade, instrutor, escassez, comparador, FAQ, CTA final) |
| `obrigado-complete.html` | Página pós-compra do BLEED COMPLETE (dispara `purchase`) |
| `obrigado-digital.html` | Página pós-compra do BLEED DIGITAL (dispara `purchase`) |
| `privacidade.html` / `termos.html` | LGPD, termos de compra, cancelamento e reembolso |
| `config.js` | **Único arquivo a editar**: links de checkout, WhatsApp, links pós-compra e IDs de tracking |
| `app.js` | Tracking (GTM/GA4/Meta/Ads), UTM, checkout, UI (modal, sticky bar, FAQ) |
| `styles.css` | Identidade visual (preto + branco + vermelho + cinza escuro) |
| `assets/` | Imagens WebP otimizadas, favicon, imagem Open Graph |

## 1. Configurar (`config.js`)

```js
checkout: {
  completePix:  "https://buy.stripe.com/...",  // BLEED COMPLETE — PIX R$ 1.300
  completeCard: "https://buy.stripe.com/...",  // BLEED COMPLETE — Cartão R$ 1.477 (até 12x)
  digital:      "https://buy.stripe.com/..."   // BLEED DIGITAL — R$ 497 (PIX ou cartão até 12x)
},
after: { whatsappCommunity: "...", ebookUrl: "...", classUrl: "..." },
tracking: { gtmId: "GTM-...", ga4Id: "G-...", metaPixelId: "...", googleAdsId: "AW-...", googleAdsConversionLabel: "..." }
```

Enquanto um link de checkout estiver vazio, o botão correspondente abre o WhatsApp com uma mensagem de inscrição (fallback seguro).

## 2. Pagamento

**PIX é manual**, fora do Stripe: o site mostra a chave PIX (CNPJ `28.463.961/0001-51`, favorecido Clínica Blues), o valor e um botão que abre o WhatsApp +55 31 97521-9151 com a mensagem de comprovante pré-preenchida. O acesso (ebook + aula + comunidade) é liberado manualmente pelo WhatsApp após conferência. Chave e valores ficam em `config.js → pix`.

**Cartão** vai para o Stripe Checkout (Payment Links abaixo). Após o pagamento, a página de obrigado pede que o aluno envie a mensagem de confirmação no WhatsApp para receber o material.

### Stripe — o que já está criado (conta Blues, usuária rafaellasouza7722@gmail.com)

| Objeto | ID | Link |
|---|---|---|
| Produto BLEED COMPLETE — Formação + Imersão Presencial | `prod_VD9lAEVGsiKw0z` | preços R$ 1.300 (PIX à vista) e R$ 1.477 (Cartão em até 12x) |
| Produto BLEED DIGITAL — Formação + Comunidade | `prod_VD9nDqTLdwgdEq` | preço R$ 497 |
| Payment Link COMPLETE R$ 1.300 (limite 10 pagamentos, telefone obrigatório) | `plink_1UCjVaIvOAfPNkjQc13jTK00` | https://buy.stripe.com/fZu4gA6p3fcx6ZS0GCfjG03 |
| Payment Link COMPLETE R$ 1.477 (limite 10 pagamentos, telefone obrigatório) | `plink_1UCjXaIvOAfPNkjQnQEisN7m` | https://buy.stripe.com/4gMaEYdRv7K5ac4ahcfjG04 |
| Payment Link DIGITAL R$ 497 (telefone obrigatório) | `plink_1UCjZQIvOAfPNkjQjMHY1VVj` | https://buy.stripe.com/7sY7sM6p3e8tdog0GCfjG05 |

Todos redirecionam após o pagamento para `/obrigado-complete` ou `/obrigado-digital` com `?session_id={CHECKOUT_SESSION_ID}`.

**Pendências verificadas na conta Stripe (06/09/2026):**
- O link de R$ 1.300 (`plink_1UCjVaIvOAfPNkjQc13jTK00`) **não é usado pelo site** (PIX é manual) e foi desativado para evitar pagamento no cartão por R$ 1.300.
- **Parcelamento no cartão** não aparece nas configurações; confirme em *Configurações → Formas de pagamento → Cartões → Parcelamento* (recurso para contas brasileiras). Se não estiver disponível, o link de R$ 1.477 será cobrado à vista no cartão.
- **Tarefa "Ação necessária"**: verificar a identidade de Rafaella Silva Souza até 22/10/2026, senão os repasses (payouts) serão pausados.
- O limite de 10 pagamentos é por link; PIX e cartão somam separadamente. Ajuste manualmente quando a turma fechar (desative o outro link).

O Stripe **não permite preço diferente por meio de pagamento na mesma sessão**, por isso o COMPLETE usa dois Payment Links. O site mostra sempre os dois valores explicados (PIX vs cartão) e o cliente escolhe no modal antes de ir ao checkout.

| Produto | Preço | Meios | Pós-pagamento (redirect) |
|---|---|---|---|
| BLEED COMPLETE — Formação + Imersão Presencial | R$ 1.300,00 | somente PIX | `https://bleed.clinicablues.com.br/obrigado-complete` |
| BLEED COMPLETE — Formação + Imersão Presencial | R$ 1.477,00 | somente cartão, parcelamento até 12x | `https://bleed.clinicablues.com.br/obrigado-complete` |
| BLEED DIGITAL — Formação + Comunidade | R$ 497,00 | PIX + cartão (até 12x) | `https://bleed.clinicablues.com.br/obrigado-digital` |

Descrição do COMPLETE: *Formação BLEED com ebook, aula online, comunidade, 12 meses de Hot Seats, imersão prática presencial, kit individual e certificado.*

Descrição do DIGITAL: *Ebook BLEED, aula online, comunidade BLEED no WhatsApp e 12 meses de acesso aos Hot Seats.*

Configurações recomendadas no painel Stripe:
- **Parcelamento (installments)**: Configurações → Pagamentos → Cartões → ativar parcelamento no Brasil. O número de parcelas e o valor de cada parcela são exibidos no próprio checkout. O site nunca mostra uma parcela diferente da do checkout: os textos `12x de R$ 123,08` / `12x de R$ 44,97` em `config.js` devem ser ajustados para o valor real exibido pelo Stripe (se houver juros repassados, informe aqui o valor com juros).
- **PIX**: ativar em Configurações → Métodos de pagamento.
- **Limitar vagas**: no Payment Link do COMPLETE, ativar "Limitar o número de pagamentos" = 10 (para cada link, somando manualmente PIX + cartão) e desativar o link quando a turma fechar.
- **Confirmação**: "Após o pagamento → Não mostrar página de confirmação → redirecionar para o site" com as URLs acima. O Stripe aceita `?session_id={CHECKOUT_SESSION_ID}` no final da URL de redirecionamento; use isso para o evento `purchase` ter `transaction_id`.
- **Coletar**: nome, e-mail, telefone (para liberar comunidade) e CPF/CNPJ se emitir nota.

O site já envia `utm_*` e `client_reference_id` na URL do Payment Link. O Stripe grava esses valores na sessão de checkout (metadados), permitindo atribuir cada venda à campanha.

## 3. Tracking

Eventos disparados em `dataLayer` (GTM) e também direto para GA4/Meta quando os IDs estão preenchidos:

`page_view` (pixels) • `view_content` • `section_view` • `click_bleed_digital` • `click_bleed_complete` • `begin_checkout` (com valor/moeda) • `purchase` (páginas de obrigado) • `whatsapp_click` • `scroll_depth` (25/50/75/90)

Mapeamento Meta: `view_content`→ViewContent, `begin_checkout`→InitiateCheckout, `purchase`→Purchase, `whatsapp_click`→Contact.

Para máxima precisão do `purchase` (independente do cliente abrir a página de obrigado), configure também um **webhook do Stripe** (`checkout.session.completed`) enviando para a Conversions API da Meta / GA4 Measurement Protocol. Isso é opcional e exige um pequeno backend (Cloudflare Worker ou similar).

## 4. Publicação (feita em 06/09/2026)

| Item | Onde |
|---|---|
| Código | GitHub `ClinicaBlues/bleed-site` (branch `main`) — https://github.com/ClinicaBlues/bleed-site |
| Hospedagem | Vercel, time **clinica-blues** (conta supervisaobluesclinic), projeto `bleed-site` — https://bleed-site.vercel.app |
| Domínio | https://bleed.clinicablues.com.br (Production, SSL automático) |
| DNS (Registro.br, zona avançada) | `CNAME bleed → 7c9c3fb2c0ff5519.vercel-dns-017.com.` e `TXT _vercel → vc-domain-verify=bleed.clinicablues.com.br,0cc762b12ec137ea518d` |

**Para atualizar o site:** edite os arquivos, `git commit` e `git push origin main`. Se a Vercel não fizer o deploy automático (o projeto foi importado por URL, sem a integração GitHub instalada), abra o projeto na Vercel → Deployments → "Redeploy", ou instale a integração GitHub no time clinica-blues.

`vercel.json` já cuida das URLs limpas (`/obrigado-complete`, `/obrigado-digital`) e do cache dos assets.

## 5. Teste local

```bash
python -m http.server 8765 --directory site
```

Abra `http://localhost:8765`. Teste com `?utm_source=meta&utm_campaign=teste` para conferir a persistência dos UTMs (`sessionStorage.bleed_utm`).

## 6. Pendências de conteúdo

- Foto real do **kit BLEED** (hoje há um mockup vetorial em `#kit`); ao ter a foto, troque o SVG por `<img src="assets/kit.webp">`.
- Links reais do ebook, aula e grupo do WhatsApp em `config.js → after`.
- Revisar percentuais/prazos de reembolso em `termos.html` (seção 6) conforme definição da empresa.
