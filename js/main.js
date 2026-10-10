/* =====================================================================
   MAIN.JS — Lógica del sitio (no necesitas editar este archivo para
   cambiar contenido; todo el contenido está en config.js).
   Índice:
     1. Utilidades
     2. Datos generales (nombres, fecha, lugar, enlaces)
     3. Navegación
     4. Cuenta regresiva
     5. Historia, itinerario, vestimenta
     6. Galería: carrusel + lightbox
     7. Hospedaje, regalos, preguntas, contacto
     8. Calendario (.ics)
     9. RSVP: backends (demo / sheets / forms) + interfaz
    10. Animaciones de aparición
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- 1. Utilidades ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Crea un elemento con atributos e hijos. Usa textContent (nunca innerHTML con
  // datos), así ningún texto de config o de invitados puede inyectar código.
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? "" : v);
    }
    children.flat().forEach(c => c && node.append(c));
    return node;
  }
  const setAll = (attr, value) => $$(`[${attr}]`).forEach(n => { n.textContent = value; });

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("is-visible"), 2400);
  }

  async function copiar(texto) {
    try { await navigator.clipboard.writeText(texto); }
    catch {
      const ta = el("textarea", { style: "position:fixed;opacity:0" }); ta.value = texto;
      document.body.append(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
    toast("Copiado");
  }

  // Normaliza códigos: mayúsculas, sin espacios ni acentos ni guiones.
  const normalizarCodigo = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toUpperCase().replace(/[^A-Z0-9]/g, "");

  /* ---------- 2. Datos generales ---------- */
  function renderGenerales() {
    const { novios, evento } = CONFIG;
    setAll("data-nombre1", novios.nombre1);
    setAll("data-nombre2", novios.nombre2);
    setAll("data-iniciales", novios.iniciales);
    setAll("data-fecha-corta", evento.fechaCorta);
    setAll("data-fecha-texto", evento.fechaTexto);
    setAll("data-hora-texto", evento.horaTexto);
    setAll("data-lugar", evento.lugar);
    setAll("data-direccion", evento.direccion);
    setAll("data-ciudad", evento.ciudad);
    setAll("data-fecha-limite", CONFIG.rsvp.fechaLimiteTexto);
    $$("[data-maps]").forEach(a => { a.href = evento.mapsURL; });

    // Textos poéticos: se ocultan los que estén vacíos en config.js
    const poesia = CONFIG.poesia || {};
    $$("[data-poema]").forEach(n => {
      const t = poesia[n.dataset.poema];
      if (typeof t === "string" && t.trim()) n.textContent = t; else n.hidden = true;
    });
    const ep = poesia.epigrafe;
    if (ep && ep.versos && ep.versos.length) {
      ep.versos.forEach(v => $("#epigrafe-versos").append(el("span", { text: v })));
      $("#epigrafe-autor").textContent = ep.autor || "";
    } else {
      $("#epigrafe").hidden = true;
    }

    if (evento.mapaEmbedURL) {
      const cont = $("#mapa-contenedor");
      // El iframe se crea solo cuando el usuario llega a la sección (carga más rápida)
      lazyOnView(cont, () => {
        cont.append(el("iframe", {
          src: evento.mapaEmbedURL, title: `Mapa: ${evento.lugar}`,
          loading: "lazy", referrerpolicy: "no-referrer-when-downgrade"
        }));
      });
      cont.hidden = false;
    }
  }

  function lazyOnView(node, fn) {
    if (!("IntersectionObserver" in window)) return fn();
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); fn(); }
    }, { rootMargin: "300px" });
    io.observe(node);
  }

  /* ---------- 2b. Bienvenida ---------- */
  function renderBienvenida() {
    const b = CONFIG.bienvenida;
    if (!b || (!b.titulo && !(b.parrafos || []).length)) { $("#bienvenida").hidden = true; return; }
    $("#bienvenida-titulo").textContent = b.titulo || "";
    (b.parrafos || []).forEach(t => $("#bienvenida-texto").append(el("p", { text: t })));
  }

  /* ---------- 3. Navegación ---------- */
  function initNav() {
    const nav = $("#nav"), btn = $(".nav__toggle"), menu = $("#nav-menu");
    const cerrar = () => { menu.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-label", "Abrir menú"); };
    btn.addEventListener("click", () => {
      const abierto = menu.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(abierto));
      btn.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    });
    $$("a", menu).forEach(a => a.addEventListener("click", cerrar));
    document.addEventListener("keydown", e => { if (e.key === "Escape") cerrar(); });

    const onScroll = () => nav.classList.toggle("is-solid", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 4. Cuenta regresiva ---------- */
  function initCountdown() {
    const objetivo = new Date(CONFIG.evento.inicioISO).getTime();
    const box = $("#countdown");
    const out = {};
    $$("[data-cd]", box).forEach(n => { out[n.dataset.cd] = n; });
    const dos = n => String(n).padStart(2, "0");

    function tick() {
      const diff = objetivo - Date.now();
      if (diff <= 0) {
        box.classList.add("is-done");
        box.textContent = diff > -1000 * 60 * 60 * 12 ? "¡Hoy es el día!" : "¡Gracias por celebrar con nosotros!";
        return clearInterval(timer);
      }
      const s = Math.floor(diff / 1000);
      out.dias.textContent  = Math.floor(s / 86400);
      out.horas.textContent = dos(Math.floor(s % 86400 / 3600));
      out.min.textContent   = dos(Math.floor(s % 3600 / 60));
      out.seg.textContent   = dos(s % 60);
    }
    const timer = setInterval(tick, 1000);
    tick();
  }

  /* ---------- 5. Historia, itinerario, vestimenta ---------- */
  function renderHistoria() {
    $("#historia-intro").textContent = CONFIG.historia.intro;
    const lista = $("#historia-lista");
    CONFIG.historia.hitos.forEach(h => {
      const conImg = Boolean(h.imagen);
      lista.append(el("li", { class: `story__item reveal${conImg ? "" : " story__item--noimg"}` },
        el("div", { class: "story__body" },
          el("p", { class: "story__date", text: h.fecha }),
          el("h3", { class: "story__title", text: h.titulo }),
          el("p", { class: "story__text", text: h.texto })
        ),
        conImg && el("figure", { class: "story__img" },
          el("img", { src: h.imagen, alt: h.alt || h.titulo, loading: "lazy", decoding: "async", width: "800", height: "1000" }))
      ));
    });
  }

  function renderItinerario() {
    const lista = $("#itinerario-lista");
    CONFIG.itinerario.forEach(i => {
      lista.append(el("li", { class: "timeline__item reveal" },
        el("p", { class: "timeline__time", text: i.hora }),
        el("span", { class: "timeline__dot", "aria-hidden": "true" }),
        el("div", {},
          el("h3", { class: "timeline__title", text: i.titulo }),
          i.texto && el("p", { class: "timeline__text", text: i.texto }))
      ));
    });
  }

  function renderVestimenta() {
    const v = CONFIG.vestimenta;
    setAll("data-vestimenta-tipo", v.tipo);
    setAll("data-vestimenta-desc", v.descripcion);
    const swatch = c => el("li", { class: "swatch" },
      el("span", { class: "swatch__chip", style: `background:${c.hex}`, "aria-hidden": "true" }),
      el("span", { class: "swatch__name", text: c.nombre }),
      c.nota && el("span", { class: "swatch__note", text: c.nota }));
    const sug = v.sugeridos || [], evi = v.noRecomendados || [];
    sug.forEach(c => $("#colores-sugeridos").append(swatch(c)));
    evi.forEach(c => $("#colores-evitar").append(swatch(c)));
    // Oculta cada paleta vacía, y el bloque completo si no hay ninguna
    $("#colores-sugeridos").parentElement.hidden = !sug.length;
    $("#colores-evitar").parentElement.hidden = !evi.length;
    $("#vestimenta-colores").hidden = !sug.length && !evi.length;
    if (v.aviso) { $("#vestimenta-aviso").textContent = v.aviso; $("#vestimenta-aviso").hidden = false; }
  }

  /* ---------- 6. Galería: carrusel + lightbox ---------- */
  function initGaleria() {
    const fotos = CONFIG.galeria;
    const track = $("#galeria-track"), dots = $("#galeria-dots");
    if (!fotos.length) { $("#galeria").hidden = true; return; }

    fotos.forEach((f, i) => {
      track.append(el("li", { class: "carousel__slide", "aria-label": `${i + 1} de ${fotos.length}` },
        el("button", { type: "button", "aria-label": `Ampliar: ${f.alt}`, onclick: () => abrir(i) },
          el("img", { src: f.src, alt: f.alt, loading: i < 2 ? "eager" : "lazy", decoding: "async", width: "800", height: "1000" }))));
      dots.append(el("span"));
    });

    const slides = $$(".carousel__slide", track);
    const paso = dir => {
      const ancho = slides[0].getBoundingClientRect().width + 16;
      track.scrollBy({ left: dir * ancho, behavior: "smooth" });
    };
    $(".carousel__btn--prev").addEventListener("click", () => paso(-1));
    $(".carousel__btn--next").addEventListener("click", () => paso(1));
    track.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") { e.preventDefault(); paso(1); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); paso(-1); }
    });

    // Punto activo según la diapositiva más visible
    const marcar = () => {
      const centro = track.scrollLeft + track.clientWidth / 2;
      let mejor = 0, dist = Infinity;
      slides.forEach((s, i) => {
        const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - centro);
        if (d < dist) { dist = d; mejor = i; }
      });
      $$("span", dots).forEach((d, i) => d.classList.toggle("is-active", i === mejor));
    };
    track.addEventListener("scroll", () => requestAnimationFrame(marcar), { passive: true });
    marcar();

    // --- Lightbox ---
    const lb = $("#lightbox"), img = $("#lightbox-img"), cap = $("#lightbox-cap");
    let actual = 0, ultimoFoco = null;

    function mostrar(i) {
      actual = (i + fotos.length) % fotos.length;
      img.src = fotos[actual].src;
      img.alt = fotos[actual].alt;
      cap.textContent = `${actual + 1} / ${fotos.length}`;
    }
    function abrir(i) {
      ultimoFoco = document.activeElement;
      mostrar(i);
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      $(".lightbox__close", lb).focus();
    }
    function cerrar() {
      lb.hidden = true;
      document.body.style.overflow = "";
      ultimoFoco && ultimoFoco.focus();
    }
    $(".lightbox__close", lb).addEventListener("click", cerrar);
    $(".lightbox__nav--prev", lb).addEventListener("click", () => mostrar(actual - 1));
    $(".lightbox__nav--next", lb).addEventListener("click", () => mostrar(actual + 1));
    lb.addEventListener("click", e => { if (e.target === lb) cerrar(); });
    document.addEventListener("keydown", e => {
      if (lb.hidden) return;
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowRight") mostrar(actual + 1);
      if (e.key === "ArrowLeft") mostrar(actual - 1);
      if (e.key === "Tab") { // Mantiene el foco dentro del visor
        const foc = $$("button", lb);
        const idx = foc.indexOf(document.activeElement);
        e.preventDefault();
        foc[(idx + (e.shiftKey ? -1 : 1) + foc.length) % foc.length].focus();
      }
    });
    // Deslizar con el dedo
    let x0 = null;
    lb.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) mostrar(actual + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* ---------- 7. Hospedaje, regalos, preguntas, contacto ---------- */
  function renderHospedaje() {
    $("#hospedaje-intro").textContent = CONFIG.hospedaje.intro;
    CONFIG.hospedaje.hoteles.forEach(h => {
      $("#hoteles-lista").append(el("li", { class: "card reveal" },
        el("h3", { class: "card__title", text: h.nombre }),
        h.distancia && el("p", { class: "card__meta", text: h.distancia }),
        h.nota && el("p", { class: "card__note", text: h.nota }),
        el("span", { class: "card__spacer" }),
        el("a", { class: "btn btn--ghost", href: h.url, target: "_blank", rel: "noopener", text: h.boton || "Ver ubicación" })));
    });
  }

  function renderRegalos() {
    const r = CONFIG.regalos;
    $("#regalos-mensaje").textContent = r.mensaje;
    // Sin enlaces ni transferencia: se oculta la sección completa
    (r.notas || []).forEach(t => $("#regalos-notas").append(el("p", { text: t })));
    if (!r.enlaces.length && !(r.notas || []).length && !(r.transferencia && r.transferencia.mostrar)) {
      $("#regalos").hidden = true;
      $$('[data-nav="regalos"]').forEach(a => { a.hidden = true; });
      return;
    }
    r.enlaces.forEach(g => {
      $("#regalos-enlaces").append(el("li", {},
        el("a", { class: "gift", href: g.url, target: "_blank", rel: "noopener" },
          el("span", {},
            el("span", { class: "gift__name", text: g.nombre }),
            g.detalle && el("span", { class: "gift__detail", text: g.detalle })),
          el("span", { class: "gift__arrow", "aria-hidden": "true", text: "↗" }))));
    });
    if (r.transferencia && r.transferencia.mostrar) {
      const t = r.transferencia;
      setAll("data-banco", t.banco);
      setAll("data-titular", t.titular);
      setAll("data-clabe", t.clabe.replace(/(\d{3})(\d{3})(\d{11})(\d)/, "$1 $2 $3 $4"));
      setAll("data-concepto", t.concepto);
      $("#copiar-clabe").addEventListener("click", () => copiar(t.clabe));
      $("#transferencia").hidden = false;
    }
  }

  function renderFAQ() {
    const cont = $("#faq-lista");
    CONFIG.faq.forEach((f, i) => {
      const panelId = `faq-panel-${i}`, btnId = `faq-btn-${i}`;
      const panel = el("div", { class: "acc__panel", id: panelId, role: "region", "aria-labelledby": btnId },
        el("div", {}, el("p", { text: f.r })));
      const btn = el("button", {
        class: "acc__btn", id: btnId, type: "button", "aria-expanded": "false", "aria-controls": panelId,
        onclick: () => {
          const abierto = btn.getAttribute("aria-expanded") === "true";
          btn.setAttribute("aria-expanded", String(!abierto));
          panel.classList.toggle("is-open", !abierto);
        }
      }, el("span", { text: f.p }), el("span", { class: "acc__icon", "aria-hidden": "true" }));
      cont.append(el("div", { class: "acc__item reveal" }, el("h3", { style: "margin:0;font-size:inherit" }, btn), panel));
    });
  }

  function renderContacto() {
    const c = CONFIG.contacto;
    const wa = n => `https://wa.me/${n}?text=${encodeURIComponent(c.mensajeWhatsApp)}`;
    $("#wa-novia").href = wa(c.whatsappNovia.numero);
    $("#wa-novio").href = wa(c.whatsappNovio.numero);
    // Oculta los botones sin dato
    $("#wa-novia").hidden = !c.whatsappNovia.numero;
    $("#wa-novio").hidden = !c.whatsappNovio.numero;
    $("#correo").hidden = !c.correo;
    $('[data-wa-nombre="novia"]').textContent = c.whatsappNovia.nombre;
    $('[data-wa-nombre="novio"]').textContent = c.whatsappNovio.nombre;
    $("#correo").href = `mailto:${c.correo}?subject=${encodeURIComponent("Boda " + CONFIG.novios.nombre1 + " y " + CONFIG.novios.nombre2)}`;
  }

  /* ---------- 8. Calendario (.ics) ---------- */
  function initCalendario() {
    $("#btn-calendario").addEventListener("click", () => {
      const e = CONFIG.evento, n = CONFIG.novios;
      const esc = t => String(t).replace(/([,;\\])/g, "\\$1"); // escapado requerido por el formato iCalendar
      const fmt = iso => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      const ics = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Boda//ES", "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:boda-${fmt(e.inicioISO)}@invitacion`,
        `DTSTAMP:${fmt(new Date().toISOString())}`,
        `DTSTART:${fmt(e.inicioISO)}`,
        `DTEND:${fmt(e.finISO)}`,
        `SUMMARY:Boda ${n.nombre1} & ${n.nombre2}`,
        `LOCATION:${esc(`${e.lugar}, ${e.direccion}, ${e.ciudad}`)}`,
        `DESCRIPTION:${location.href.split("#")[0]}`,
        "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:Mañana es la boda", "END:VALARM",
        "END:VEVENT", "END:VCALENDAR"
      ].join("\r\n");
      const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
      const a = el("a", { href: url, download: "boda-paola-carlos.ics" });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });
  }

  /* =====================================================================
     9. RSVP
     ---------------------------------------------------------------------
     Todos los backends exponen la misma interfaz:
       validar(codigo) → { ok, familia, lugares, previa } | { ok:false, error }
       enviar(datos)   → { ok, mensaje } | { ok:false, error }
     "previa" es la confirmación ya registrada para ese código (o null).
     Un código tiene UNA confirmación: si se envía otra, REEMPLAZA a la
     anterior. Así nunca se acumulan más asistentes que los autorizados.
     ===================================================================== */
  const Backends = {

    /* --- DEMO: valida con INVITADOS y guarda en localStorage --- */
    demo: {
      _key: "rsvp_demo_respuestas",
      _leer() { try { return JSON.parse(localStorage.getItem(this._key)) || {}; } catch { return {}; } },
      async validar(codigo) {
        await new Promise(r => setTimeout(r, 350)); // simula la latencia de red
        const inv = INVITADOS[codigo];
        if (!inv) return { ok: false, error: "no_existe" };
        return { ok: true, familia: inv.familia, lugares: inv.lugares, mesa: inv.mesa, previa: this._leer()[codigo] || null };
      },
      async enviar(d) {
        await new Promise(r => setTimeout(r, 500));
        const inv = INVITADOS[d.codigo];
        if (!inv) return { ok: false, error: "no_existe" };
        if (d.asistentes > inv.lugares) return { ok: false, error: "excede", lugares: inv.lugares };
        const todas = this._leer();
        todas[d.codigo] = { ...d, familia: inv.familia, fecha: new Date().toISOString() };
        localStorage.setItem(this._key, JSON.stringify(todas));
        console.table(Object.values(todas)); // Para revisar en la consola durante pruebas
        return { ok: true };
      }
    },

    /* --- SHEETS: Apps Script hace la validación real en el servidor --- */
    sheets: {
      async validar(codigo) {
        const url = `${CONFIG.rsvp.sheetsURL}?accion=validar&codigo=${encodeURIComponent(codigo)}`;
        const r = await fetch(url, { method: "GET", redirect: "follow" });
        return r.json();
      },
      async enviar(d) {
        // text/plain evita la solicitud previa CORS (preflight) que Apps Script no admite
        const r = await fetch(CONFIG.rsvp.sheetsURL, {
          method: "POST", redirect: "follow",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ accion: "confirmar", ...d })
        });
        return r.json();
      }
    },

    /* --- FORMS: valida localmente y abre un Microsoft Form prellenado --- */
    forms: {
      async validar(codigo) {
        const inv = INVITADOS[codigo];
        if (!inv) return { ok: false, error: "no_existe" };
        return { ok: true, familia: inv.familia, lugares: inv.lugares, previa: null };
      },
      urlFormulario(codigo, inv) {
        return CONFIG.rsvp.formsURL
          .replace("CODIGO_AQUI", encodeURIComponent(codigo))
          .replace("FAMILIA_AQUI", encodeURIComponent(inv.familia))
          .replace("LUGARES_AQUI", encodeURIComponent(inv.lugares));
      }
    }
  };

  const MENSAJES = {
    vacio:     "Escribe el código que aparece en tu invitación.",
    no_existe: "No encontramos ese código. Revisa que esté escrito igual que en tu invitación.",
    bloqueado: s => `Demasiados intentos. Espera ${s} segundos e inténtalo de nuevo.`,
    red:       "No pudimos conectar. Revisa tu conexión a internet e inténtalo de nuevo.",
    cerrado:   "El periodo de confirmación terminó.",
    excede:    n => `Tu invitación es para ${n} ${n === 1 ? "persona" : "personas"} como máximo.`,
    nombre:    "Escribe tu nombre completo.",
    nombres:   "Escribe el nombre de cada asistente.",
    config:    "La confirmación aún no está configurada. Avísanos por WhatsApp.",
    generico:  "Ocurrió un error. Inténtalo de nuevo o avísanos por WhatsApp."
  };

  function initRSVP() {
    const cfg = CONFIG.rsvp;
    const modo = Backends[cfg.modo] ? cfg.modo : "demo";
    const api = Backends[modo];

    const pasoCodigo = $("#paso-codigo"), pasoDatos = $("#paso-datos"),
          pasoFinal = $("#paso-final"), pasoCerrado = $("#paso-cerrado");
    const inputCodigo = $("#codigo"), msgCodigo = $("#codigo-msg"), msgDatos = $("#datos-msg");
    const selAsist = $("#asistentes"), bloqueAsist = $("#bloque-asistentes"), nombresBox = $("#nombres-asistentes");

    let sesion = null; // { codigo, familia, lugares, previa }

    if (modo === "demo") $("#rsvp-demo").hidden = false;

    // Formulario cerrado por fecha
    if (Date.now() > new Date(cfg.fechaLimiteISO).getTime()) {
      pasoCodigo.hidden = true; pasoCerrado.hidden = false; return;
    }
    // Configuración incompleta
    if ((modo === "sheets" && !cfg.sheetsURL) || (modo === "forms" && !cfg.formsURL)) {
      pasoCodigo.hidden = true; pasoCerrado.hidden = false;
      pasoCerrado.firstElementChild.textContent = MENSAJES.config; return;
    }

    const mostrar = paso => {
      [pasoCodigo, pasoDatos, pasoFinal].forEach(p => { p.hidden = p !== paso; });
    };
    const mensaje = (nodo, texto, tipo = "error") => {
      nodo.textContent = texto || "";
      nodo.className = `field__msg ${texto ? "is-" + tipo : ""}`;
    };

    /* Control de intentos (disuasorio; la protección real está en el servidor) */
    const Intentos = {
      get() { try { return JSON.parse(sessionStorage.getItem("rsvp_int")) || { n: 0, hasta: 0 }; } catch { return { n: 0, hasta: 0 }; } },
      set(v) { try { sessionStorage.setItem("rsvp_int", JSON.stringify(v)); } catch {} },
      bloqueoRestante() { const v = this.get(); return Math.max(0, Math.ceil((v.hasta - Date.now()) / 1000)); },
      fallo() { const v = this.get(); v.n++; if (v.n >= cfg.maxIntentos) { v.n = 0; v.hasta = Date.now() + 60000; } this.set(v); },
      exito() { this.set({ n: 0, hasta: 0 }); }
    };

    /* --- Paso 1: validar código --- */
    pasoCodigo.addEventListener("submit", async e => {
      e.preventDefault();
      const codigo = normalizarCodigo(inputCodigo.value);
      inputCodigo.value = codigo;
      inputCodigo.removeAttribute("aria-invalid");

      const espera = Intentos.bloqueoRestante();
      if (espera) return mensaje(msgCodigo, MENSAJES.bloqueado(espera));
      if (!codigo) { inputCodigo.setAttribute("aria-invalid", "true"); return mensaje(msgCodigo, MENSAJES.vacio); }

      const btn = $("#btn-validar");
      btn.disabled = true; btn.textContent = "Verificando…";
      mensaje(msgCodigo, "");
      try {
        const res = await api.validar(codigo);
        if (!res.ok) {
          Intentos.fallo();
          inputCodigo.setAttribute("aria-invalid", "true");
          mensaje(msgCodigo, MENSAJES[res.error] || res.mensaje || MENSAJES.generico);
          return;
        }
        Intentos.exito();
        sesion = { codigo, familia: res.familia, lugares: Number(res.lugares), mesa: res.mesa, previa: res.previa };
        modo === "forms" ? mostrarForms() : prepararDatos();
      } catch (err) {
        console.error(err);
        mensaje(msgCodigo, MENSAJES.red);
      } finally {
        btn.disabled = false; btn.textContent = "Continuar";
      }
    });

    /* --- Paso 2: datos --- */
    function prepararDatos() {
      const { familia, lugares, previa } = sesion;
      $("#inv-familia").textContent = familia;
      $("#inv-lugares").textContent = `${lugares} ${lugares === 1 ? "lugar reservado" : "lugares reservados"}`;

      selAsist.innerHTML = "";
      for (let i = 1; i <= lugares; i++) selAsist.append(el("option", { value: i, text: i }));
      selAsist.value = String(lugares);
      $("#asistentes-hint").textContent = `Máximo ${lugares}.`;

      // Si ya respondieron antes, se muestra y se precarga
      const prev = $("#inv-previa");
      if (previa) {
        const f = previa.fecha ? new Date(previa.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "long" }) : "";
        prev.textContent = previa.asistencia === "no"
          ? `Ya registraron que no podrán asistir${f ? " (" + f + ")" : ""}. Si envían de nuevo, se reemplaza la respuesta anterior.`
          : `Ya confirmaron ${previa.asistentes} de ${lugares}${f ? " (" + f + ")" : ""}. Si envían de nuevo, se reemplaza la respuesta anterior.`;
        prev.hidden = false;
        $("#nombre").value = previa.nombre || "";
        $("#telefono").value = previa.telefono || "";
        $("#restricciones").value = previa.restricciones || "";
        $("#comentarios").value = previa.comentarios || "";
        $$('input[name="asistencia"]').forEach(r => { r.checked = r.value === (previa.asistencia || "si"); });
        if (previa.asistentes) selAsist.value = String(Math.min(previa.asistentes, lugares));
      } else {
        prev.hidden = true;
        pasoDatos.reset();
        selAsist.value = String(lugares);
      }
      nombresBox.innerHTML = "";
      generarNombres(previa && previa.nombres ? previa.nombres : []);
      alternarAsistencia();
      mensaje(msgDatos, "");
      mostrar(pasoDatos);
      $("#nombre").focus({ preventScroll: true });
    }

    // Un campo de nombre por asistente
    function generarNombres(prellenados = []) {
      const actuales = $$("input", nombresBox).map(i => i.value);
      const valores = actuales.length ? actuales : prellenados;
      const n = Number(selAsist.value);
      nombresBox.innerHTML = "";
      nombresBox.append(el("p", { class: "field__label", id: "nombres-label", text: "Nombre de cada asistente" }));
      for (let i = 0; i < n; i++) {
        const input = el("input", {
          class: "field__input name-input", type: "text", maxlength: "80",
          "aria-label": `Nombre del asistente ${i + 1}`,
          placeholder: `Asistente ${i + 1}`
        });
        input.value = valores[i] || "";
        nombresBox.append(input);
      }
    }
    selAsist.addEventListener("change", () => generarNombres());

    // El primer asistente se llena con el nombre de quien confirma
    $("#nombre").addEventListener("input", e => {
      const primero = $("input", nombresBox);
      if (primero && (!primero.value || primero.dataset.auto === "1")) {
        primero.value = e.target.value; primero.dataset.auto = "1";
      }
    });

    function alternarAsistencia() {
      const va = $('input[name="asistencia"]:checked').value === "si";
      bloqueAsist.hidden = !va;
    }
    $$('input[name="asistencia"]').forEach(r => r.addEventListener("change", alternarAsistencia));

    $("#btn-volver").addEventListener("click", () => {
      sesion = null; inputCodigo.value = ""; mensaje(msgCodigo, ""); mostrar(pasoCodigo); inputCodigo.focus();
    });

    pasoDatos.addEventListener("submit", async e => {
      e.preventDefault();
      if ($("#sitio_web").value) return; // bot detectado: se ignora en silencio

      const asistencia = $('input[name="asistencia"]:checked').value;
      const nombre = $("#nombre").value.trim();
      const nombres = $$("input", nombresBox).map(i => i.value.trim());
      const asistentes = asistencia === "si" ? Number(selAsist.value) : 0;

      // Validación en el navegador (el servidor vuelve a validar)
      $("#nombre").removeAttribute("aria-invalid");
      if (nombre.length < 3) { $("#nombre").setAttribute("aria-invalid", "true"); $("#nombre").focus(); return mensaje(msgDatos, MENSAJES.nombre); }
      if (asistencia === "si") {
        if (asistentes < 1 || asistentes > sesion.lugares) return mensaje(msgDatos, MENSAJES.excede(sesion.lugares));
        const vacio = $$("input", nombresBox).find(i => !i.value.trim());
        if (vacio) { vacio.focus(); return mensaje(msgDatos, MENSAJES.nombres); }
      }

      const datos = {
        codigo: sesion.codigo,
        asistencia, nombre, asistentes,
        nombres: asistencia === "si" ? nombres.slice(0, asistentes) : [],
        telefono: $("#telefono").value.trim(),
        restricciones: asistencia === "si" ? $("#restricciones").value.trim() : "",
        comentarios: $("#comentarios").value.trim()
      };

      const btn = $("#btn-enviar");
      btn.disabled = true; btn.textContent = "Enviando…";
      mensaje(msgDatos, "");
      try {
        const res = await api.enviar(datos);
        if (!res.ok) {
          const m = res.error === "excede" ? MENSAJES.excede(res.lugares || sesion.lugares) : (MENSAJES[res.error] || res.mensaje || MENSAJES.generico);
          return mensaje(msgDatos, typeof m === "function" ? m() : m);
        }
        sesion.previa = { ...datos, fecha: new Date().toISOString() };
        mostrarFinal(datos);
      } catch (err) {
        console.error(err);
        mensaje(msgDatos, MENSAJES.red);
      } finally {
        btn.disabled = false; btn.textContent = "Enviar confirmación";
      }
    });

    /* --- Paso 3: resultado --- */
    function mostrarFinal(d) {
      if (d.asistencia === "si") {
        $("#final-titulo").textContent = "¡Gracias por confirmar!";
        $("#final-texto").textContent = `Registramos ${d.asistentes} ${d.asistentes === 1 ? "asistente" : "asistentes"} para ${sesion.familia}. Nos vemos el ${CONFIG.evento.fechaTexto.toLowerCase()}.`;
      } else {
        $("#final-titulo").textContent = "Gracias por avisarnos";
        $("#final-texto").textContent = "Lamentamos que no puedan acompañarnos. Los tendremos presentes ese día.";
      }
      const mesa = $("#final-mesa");
      mesa.hidden = !(cfg.mostrarMesa && sesion.mesa && d.asistencia === "si");
      if (!mesa.hidden) mesa.textContent = `Mesa ${sesion.mesa}`;
      $("#btn-editar").hidden = false;
      mostrar(pasoFinal);
      pasoFinal.focus();
    }
    $("#btn-editar").addEventListener("click", () => prepararDatos());

    /* --- Modo Microsoft Forms --- */
    function mostrarForms() {
      $("#final-titulo").textContent = sesion.familia;
      const p = $("#final-texto");
      p.textContent = `Código válido · ${sesion.lugares} ${sesion.lugares === 1 ? "lugar" : "lugares"}. Completa tu confirmación en el formulario.`;
      const a = el("a", {
        class: "btn btn--primary", target: "_blank", rel: "noopener", style: "margin-top:1rem",
        href: Backends.forms.urlFormulario(sesion.codigo, sesion), text: "Abrir formulario"
      });
      p.append(el("br"), a);
      $("#btn-editar").hidden = true;
      mostrar(pasoFinal);
    }

    // Código en la URL: tusitio/?i=K7QM4A (ideal para QR y WhatsApp por familia).
    // También acepta ?codigo=K7QM4A
    const params = new URLSearchParams(location.search);
    const desdeURL = params.get("i") || params.get("codigo");
    if (desdeURL) {
      inputCodigo.value = normalizarCodigo(desdeURL);
      pasoCodigo.requestSubmit ? pasoCodigo.requestSubmit() : pasoCodigo.dispatchEvent(new Event("submit"));
      // Lleva al invitado directo a su confirmación
      setTimeout(() => $("#rsvp").scrollIntoView({ behavior: "smooth" }), 400);
    }
  }

  /* ---------- 10. Animaciones de aparición ---------- */
  function initReveal() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window)) return items.forEach(i => i.classList.add("is-visible"));
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(i => io.observe(i));
  }

  /* ---------- Arranque ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.classList.remove("no-js");
    const pasos = [renderGenerales, renderBienvenida, initNav, initCountdown, renderHistoria, renderItinerario,
      renderVestimenta, initGaleria, renderHospedaje, renderRegalos, renderFAQ, renderContacto,
      initCalendario, initRSVP, initReveal];
    // Si una sección falla (p. ej. un error de dedo en config.js), las demás siguen funcionando
    pasos.forEach(fn => { try { fn(); } catch (err) { console.error(`Error en ${fn.name}:`, err); } });
  });
})();
