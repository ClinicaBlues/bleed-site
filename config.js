/* =====================================================================
   BLEED — Configuração central da landing page
   Edite SOMENTE este arquivo para trocar links de checkout, WhatsApp
   e IDs de rastreamento. Nenhum dado de cartão passa por este site:
   todo pagamento acontece no Stripe Checkout hospedado.
   ===================================================================== */
window.BLEED_CONFIG = {
  /* ---------- Checkout Stripe (Payment Links hospedados) ----------
     Preencha com os links gerados no painel Stripe.
     COMPLETE tem dois links porque o Stripe não permite preço diferente
     por método de pagamento na mesma sessão:
       - completePix  : R$ 1.300,00 (somente PIX)
       - completeCard : R$ 1.477,00 (cartão, parcelável em até 12x)
     DIGITAL usa um único link (R$ 497,00 — PIX ou cartão em até 12x). */
  checkout: {
    completePix:  "https://buy.stripe.com/fZu4gA6p3fcx6ZS0GCfjG03",   // plink_1UCjVaIvOAfPNkjQc13jTK00 — R$ 1.300 (limite 10 pagamentos)
    completeCard: "https://buy.stripe.com/4gMaEYdRv7K5ac4ahcfjG04",   // plink_1UCjXaIvOAfPNkjQnQEisN7m — R$ 1.477 (limite 10 pagamentos)
    digital:      "https://buy.stripe.com/7sY7sM6p3e8tdog0GCfjG05"    // plink_1UCjZQIvOAfPNkjQjMHY1VVj — R$ 497
  },

  /* Valores exibidos na página (mantenha iguais aos do Stripe). */
  prices: {
    completePix: "R$ 1.300",
    completeCard: "R$ 1.477",
    completeInstallment: "12x de R$ 123,08",
    digital: "R$ 497",
    digitalInstallment: "12x de R$ 44,97"
  },

  /* ---------- Pós-compra (links enviados nas páginas de obrigado) ---------- */
  after: {
    whatsappCommunity: "",   // link de convite do grupo/comunidade BLEED
    ebookUrl: "",            // link de download/acesso ao ebook
    classUrl: ""             // link da aula online
  },

  /* ---------- PIX manual (chave CNPJ da Clínica Blues) ----------
     O PIX não passa pelo Stripe: o aluno paga pela chave e envia o
     comprovante pelo WhatsApp. O acesso é liberado manualmente. */
  pix: {
    key: "28.463.961/0001-51",
    keyType: "CNPJ",
    holder: "Clínica Blues",
    amounts: { complete: "R$ 1.300,00", digital: "R$ 497,00" }
  },

  /* ---------- WhatsApp de dúvidas ---------- */
  whatsapp: {
    number: "5531975219151",
    message: "Olá! Vim pela página do BLEED e gostaria de tirar uma dúvida sobre a formação em controle de hemorragias."
  },

  /* ---------- Rastreamento (deixe vazio para desativar) ---------- */
  tracking: {
    gtmId: "",          // ex.: GTM-XXXXXXX  (se usar GTM, pode deixar os demais vazios)
    ga4Id: "",          // ex.: G-XXXXXXXXXX
    metaPixelId: "",    // ex.: 1234567890
    googleAdsId: "",    // ex.: AW-XXXXXXXXX
    googleAdsConversionLabel: ""   // ex.: AbCdEfGhIj  (conversão "purchase")
  }
};
