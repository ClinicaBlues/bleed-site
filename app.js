/* BLEED — app.js : tracking, UTM, checkout, UI */
(function () {
  var C = window.BLEED_CONFIG || {};
  var T = C.tracking || {};
  window.dataLayer = window.dataLayer || [];

  /* ---------- UTM capture (persistida na sessão) ---------- */
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid", "ttclid"];
  function readUTM() {
    var out = {};
    try {
      var q = new URLSearchParams(location.search), found = false;
      UTM_KEYS.forEach(function (k) { if (q.get(k)) { out[k] = q.get(k); found = true; } });
      if (found) { sessionStorage.setItem("bleed_utm", JSON.stringify(out)); return out; }
      var s = sessionStorage.getItem("bleed_utm"); if (s) return JSON.parse(s);
    } catch (e) {}
    return out;
  }
  var UTM = readUTM();
  var REF = (function () { try { var r = sessionStorage.getItem("bleed_ref"); if (!r) { r = "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); sessionStorage.setItem("bleed_ref", r); } return r; } catch (e) { return "b" + Date.now().toString(36); } })();

  /* ---------- Pixels ---------- */
  function loadScript(src, cb) { var s = document.createElement("script"); s.async = true; s.src = src; if (cb) s.onload = cb; document.head.appendChild(s); }
  if (T.gtmId) {
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    loadScript("https://www.googletagmanager.com/gtm.js?id=" + T.gtmId);
  }
  if (T.ga4Id || T.googleAdsId) {
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    gtag("js", new Date());
    if (T.ga4Id) gtag("config", T.ga4Id, { send_page_view: true });
    if (T.googleAdsId) gtag("config", T.googleAdsId);
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + (T.ga4Id || T.googleAdsId));
  }
  if (T.metaPixelId) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", T.metaPixelId); fbq("track", "PageView");
  }

  /* ---------- Event helper ---------- */
  var META_MAP = { view_content: "ViewContent", begin_checkout: "InitiateCheckout", purchase: "Purchase", whatsapp_click: "Contact", click_bleed_digital: "ViewContent", click_bleed_complete: "ViewContent" };
  function track(name, params) {
    params = params || {};
    params.utm = UTM; params.client_reference_id = REF;
    window.dataLayer.push(Object.assign({ event: name }, params));
    if (window.gtag && (T.ga4Id || T.googleAdsId)) {
      var p = Object.assign({}, params); delete p.utm;
      gtag("event", name, p);
      if (name === "purchase" && T.googleAdsId && T.googleAdsConversionLabel) gtag("event", "conversion", { send_to: T.googleAdsId + "/" + T.googleAdsConversionLabel, value: params.value, currency: "BRL", transaction_id: params.transaction_id || "" });
    }
    if (window.fbq && T.metaPixelId) {
      var mp = { content_name: params.item_name || params.content_name, value: params.value, currency: params.value ? "BRL" : undefined };
      if (META_MAP[name]) fbq("track", META_MAP[name], mp); else fbq("trackCustom", name, mp);
    }
  }
  window.bleedTrack = track;

  /* ---------- Checkout URLs ---------- */
  var PRODUCTS = {
    completePix: { name: "BLEED COMPLETE (PIX)", value: 1300, url: (C.checkout || {}).completePix },
    completeCard: { name: "BLEED COMPLETE (Cartão)", value: 1477, url: (C.checkout || {}).completeCard },
    digital: { name: "BLEED DIGITAL", value: 497, url: (C.checkout || {}).digital }
  };
  function waLink(msg) { var w = C.whatsapp || {}; return "https://wa.me/" + (w.number || "") + "?text=" + encodeURIComponent(msg || w.message || ""); }
  function checkoutURL(key) {
    var p = PRODUCTS[key]; if (!p || !p.url) return null;
    var u = new URL(p.url);
    Object.keys(UTM).forEach(function (k) { u.searchParams.set(k, UTM[k]); });
    u.searchParams.set("client_reference_id", REF);
    return u.toString();
  }
  function goCheckout(key) {
    var p = PRODUCTS[key];
    track("begin_checkout", { item_name: p.name, value: p.value, currency: "BRL", items: [{ item_name: p.name, price: p.value, quantity: 1 }] });
    var url = checkoutURL(key);
    if (url) { location.href = url; }
    else { location.href = waLink("Olá! Quero me inscrever no " + p.name + " pela página do BLEED. Pode me enviar o link de pagamento?"); }
  }
  window.bleedCheckout = goCheckout;

  /* ---------- DOM ready ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    track("view_content", { item_name: "BLEED Landing", content_name: "BLEED Landing" });

    /* WhatsApp links */
    document.querySelectorAll("[data-wa]").forEach(function (a) {
      a.href = waLink(); a.target = "_blank"; a.rel = "noopener";
      a.addEventListener("click", function () { track("whatsapp_click", { content_name: a.getAttribute("data-wa") || "float" }); });
    });

    /* Product buttons -> modal (PIX manual | cartão Stripe) */
    var modal = document.getElementById("modal"), PIX = C.pix || {}, current = "complete";
    var PR = C.prices || {};
    var PLAN = {
      complete: { title: "BLEED Complete", pix: PR.completePix, pixFull: (PIX.amounts || {}).complete, card: PR.completeCard, cardNote: "em até 12x", key: "completeCard", value: 1300, fine: "Imersão 03 OUT 2026 • Clínica Blues • Belo Horizonte • 10 vagas", label: "BLEED COMPLETE (Formação + Imersão 03/10)" },
      digital:  { title: "BLEED Digital",  pix: PR.digital,     pixFull: (PIX.amounts || {}).digital,  card: PR.digital,      cardNote: "ou " + (PR.digitalInstallment || "12x"), key: "digital", value: 497, fine: "Acesso liberado após a confirmação do pagamento", label: "BLEED DIGITAL (Formação + Comunidade)" }
    };
    function showStep(id) { modal.querySelectorAll(".step").forEach(function (st) { st.hidden = st.id !== id; }); }
    function openModal(plan) {
      if (!modal) { goCheckout(PLAN[plan].key); return; }
      current = plan; var P = PLAN[plan];
      modal.querySelector("#mt").textContent = P.title;
      modal.querySelectorAll(".m-pix-amount").forEach(function (e) { e.textContent = P.pix; });
      modal.querySelectorAll(".m-pix-amount-full").forEach(function (e) { e.textContent = P.pixFull || P.pix; });
      modal.querySelector(".m-card-amount").textContent = P.card;
      modal.querySelector(".m-card-note").textContent = P.cardNote;
      modal.querySelector(".m-fine").textContent = P.fine;
      showStep("m-choose");
      modal.classList.add("on"); document.body.style.overflow = "hidden";
    }
    function pixMessage(plan) {
      var P = PLAN[plan];
      return "Olá! Fiz o PIX de " + (P.pixFull || P.pix) + " para a chave " + (PIX.key || "") + " (" + (PIX.holder || "Clínica Blues") + ") referente ao " + P.label + ".\n\nSegue o comprovante em anexo.\nNome completo: \nE-mail: \n\nAguardo o ebook, a aula e o acesso à comunidade BLEED.";
    }
    window.bleedPixMessage = pixMessage;
    document.querySelectorAll("[data-buy]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        var k = b.getAttribute("data-buy");
        if (k === "digital") { track("click_bleed_digital", { item_name: "BLEED DIGITAL", value: 497 }); openModal("digital"); }
        else if (k === "complete") { track("click_bleed_complete", { item_name: "BLEED COMPLETE", value: 1477 }); openModal("complete"); }
        else if (k === "completePix" || k === "completeCard") { goCheckout(k); }
      });
    });
    if (modal) {
      var close = function () { modal.classList.remove("on"); document.body.style.overflow = ""; };
      modal.querySelector(".x").addEventListener("click", close);
      modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
      modal.querySelector("[data-pay=card]").addEventListener("click", function (e) { e.preventDefault(); goCheckout(PLAN[current].key); });
      modal.querySelector("[data-pay=pix]").addEventListener("click", function (e) {
        e.preventDefault();
        track("pix_selected", { item_name: PLAN[current].label, value: PLAN[current].value, currency: "BRL" });
        modal.querySelector("#pix-wa").href = waLink(pixMessage(current));
        modal.querySelector("#pix-key").textContent = PIX.key || "";
        showStep("m-pix");
      });
      modal.querySelector("#pix-wa").addEventListener("click", function () {
        track("begin_checkout", { item_name: PLAN[current].label + " (PIX)", value: PLAN[current].value, currency: "BRL" });
        track("whatsapp_click", { content_name: "pix_receipt_" + current });
      });
      modal.querySelector("#m-back").addEventListener("click", function (e) { e.preventDefault(); showStep("m-choose"); });
      modal.querySelector("#pix-copy").addEventListener("click", function () {
        var btn = this, key = PIX.key || "";
        var done = function () { btn.textContent = "Copiada ✓"; setTimeout(function () { btn.textContent = "Copiar chave"; }, 2000); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(key).then(done, done);
        else { var t = document.createElement("textarea"); t.value = key; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (err) {} document.body.removeChild(t); done(); }
      });
    }

    /* Prices from config */
    var P = C.prices || {};
    document.querySelectorAll("[data-price]").forEach(function (el) { var v = P[el.getAttribute("data-price")]; if (v) el.textContent = v; });

    /* Reveal on scroll */
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .12 });
      document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });
    } else document.querySelectorAll(".rv").forEach(function (el) { el.classList.add("in"); });

    /* Sticky mobile bar */
    var sticky = document.getElementById("sticky"), plans = document.getElementById("planos"), hero = document.querySelector(".hero");
    if (sticky) {
      var mode = "complete";
      var btn = sticky.querySelector(".btn"), title = sticky.querySelector(".info b"), sub = sticky.querySelector(".info small");
      function setMode(m) {
        mode = m; sticky.querySelectorAll(".sw button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-m") === m); });
        if (m === "digital") { title.textContent = "BLEED DIGITAL"; sub.textContent = P.digital + " ou " + P.digitalInstallment; btn.textContent = "QUERO ENTRAR"; btn.setAttribute("data-buy", "digital"); }
        else { title.textContent = "BLEED COMPLETE"; sub.textContent = "03 OUT • 10 VAGAS • " + P.completePix + " PIX"; btn.textContent = "QUERO MINHA VAGA"; btn.setAttribute("data-buy", "complete"); }
      }
      sticky.querySelectorAll(".sw button").forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-m")); }); });
      setMode("complete");
      var seenPlans = false;
      var onStickyScroll = function () {
        var y = window.scrollY; sticky.classList.toggle("on", y > (hero ? hero.offsetHeight * .6 : 400));
        if (plans && !seenPlans && y + window.innerHeight > plans.offsetTop + 200) { seenPlans = true; sticky.classList.add("plans"); }
      };
      window.addEventListener("scroll", onStickyScroll, { passive: true });
      window.addEventListener("resize", onStickyScroll);
      setInterval(onStickyScroll, 700); /* fallback para navegadores que não disparam scroll em rolagem programática */
    }

    /* Scroll depth */
    var marks = [25, 50, 75, 90], fired = {};
    var onDepth = function () {
      var h = document.documentElement, pct = Math.round((h.scrollTop + window.innerHeight) / h.scrollHeight * 100);
      marks.forEach(function (m) { if (pct >= m && !fired[m]) { fired[m] = 1; track("scroll_depth", { percent: m }); } });
    };
    window.addEventListener("scroll", onDepth, { passive: true });
    setInterval(onDepth, 1000);

    /* Section views (view_content granular) */
    if ("IntersectionObserver" in window) {
      var seen = {};
      var so = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !seen[e.target.id]) { seen[e.target.id] = 1; track("section_view", { section: e.target.id }); } }); }, { threshold: .3 });
      ["planos", "cronograma", "kit", "hotseats", "instrutor", "faq"].forEach(function (id) { var el = document.getElementById(id); if (el) so.observe(el); });
    }
  });
})();
