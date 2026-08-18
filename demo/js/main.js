/* ==========================================================================
   ESCULTISMO PARAGUAYO — Archivo Digital
   Renderizado de secciones a partir de datos_linea.js y datos_futuro.js
   (window.DATOS_LINEA / window.DATOS_FUTURO). Sin dependencias.
   Soporte ES ⇄ GN (guaraní): window.I18N_GN, DATOS_LINEA_GN, DATOS_FUTURO_GN.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- i18n ---------- */

  var I18N_ES = {
    'cat.fundacion': 'Fundación',
    'cat.guerra': 'Guerra del Chaco',
    'cat.movimiento': 'Movimiento',
    'cat.cultura': 'Cultura',
    'cat.persona': 'Persona',
    'era.0': 'Los orígenes',
    'era.1': 'La antesala del Chaco',
    'era.2': 'La Guerra del Chaco',
    'era.3': 'La reconstrucción',
    'era.4': 'La Asociación de Scouts del Paraguay',
    'era.5': 'La FEPE y el presente',
    'era.5.rango': '1994 – hoy',
    'stats.eventos': 'eventos documentados',
    'stats.personas': 'personas en la historia',
    'stats.anios': 'años de historia · 1913 – presente',
    'filtro.todas': 'Todas',
    'tl.continua.anio': '2026',
    'tl.continua.chip': 'El archivo continúa',
    'tl.continua.titulo': 'La historia sigue viva',
    'personas.clave': 'Clave',
    'personas.mas': 'Leer más',
    'personas.menos': 'Leer menos',
    'citas.prev': 'Cita anterior',
    'citas.next': 'Cita siguiente',
    'citas.label': 'Seleccionar cita',
    'nav.abrir': 'Abrir menú',
    'nav.cerrar': 'Cerrar menú',
    'idioma.label': 'Idioma'
  };

  var I18N_GN = window.I18N_GN || {};

  var LANG = 'es';
  try {
    if (localStorage.getItem('scout-lang') === 'gn') LANG = 'gn';
  } catch (e) {}

  function t(key) {
    if (LANG === 'gn' && I18N_GN[key] != null) return I18N_GN[key];
    return I18N_ES[key] != null ? I18N_ES[key] : key;
  }

  function getLinea() {
    return (LANG === 'gn' && window.DATOS_LINEA_GN) ? window.DATOS_LINEA_GN : (window.DATOS_LINEA || {});
  }
  function getFuturo() {
    return (LANG === 'gn' && window.DATOS_FUTURO_GN) ? window.DATOS_FUTURO_GN : (window.DATOS_FUTURO || {});
  }

  var LINEA = getLinea();
  var FUTURO = getFuturo();

  var eventos = Array.isArray(LINEA.eventos) ? LINEA.eventos : [];
  var personas = Array.isArray(LINEA.personas) ? LINEA.personas : [];
  var citas = Array.isArray(LINEA.citas) ? LINEA.citas : [];
  var temas = Array.isArray(LINEA.temas) ? LINEA.temas : [];
  var ejes = Array.isArray(FUTURO.ejes) ? FUTURO.ejes : [];
  var fases = Array.isArray(FUTURO.fases) ? FUTURO.fases : [];

  function cats() {
    return {
      fundacion: t('cat.fundacion'),
      guerra: t('cat.guerra'),
      movimiento: t('cat.movimiento'),
      cultura: t('cat.cultura'),
      persona: t('cat.persona')
    };
  }

  function eras() {
    return [
      { desde: 1912, hasta: 1919, titulo: t('era.0'), rango: '1912 – 1919' },
      { desde: 1920, hasta: 1931, titulo: t('era.1'), rango: '1920 – 1931' },
      { desde: 1932, hasta: 1935, titulo: t('era.2'), rango: '1932 – 1935' },
      { desde: 1936, hasta: 1959, titulo: t('era.3'), rango: '1936 – 1959' },
      { desde: 1960, hasta: 1993, titulo: t('era.4'), rango: '1960 – 1993' },
      { desde: 1994, hasta: Infinity, titulo: t('era.5'), rango: t('era.5.rango') }
    ];
  }

  var FLECHA_IZQ = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  var FLECHA_DER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

  var citasTimer = null;
  var personasLoadBound = false;

  /* ---------- Utilidades ---------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function parseAnio(a) {
    if (typeof a === 'number') return a;
    var m = String(a).match(/\d{4}/);
    return m ? parseInt(m[0], 10) : null;
  }

  function eraDe(anio) {
    var ERAS = eras();
    var y = parseAnio(anio);
    if (y == null) return ERAS.length;
    for (var i = 0; i < ERAS.length; i++) {
      if (y >= ERAS[i].desde && y <= ERAS[i].hasta) return i;
    }
    return ERAS.length - 1;
  }

  function monograma(nombre) {
    var limpio = String(nombre || '').replace(/\(.*\)/, '').trim();
    var partes = limpio.split(/\s+/).filter(Boolean);
    var iniciales = (partes[0] ? partes[0].charAt(0) : '') + (partes[1] ? partes[1].charAt(0) : '');
    return (iniciales || '?').toUpperCase();
  }

  /* ---------- i18n estático (data-i18n en el HTML) ---------- */

  function aplicarI18nEstatico() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!el.dataset.origHtml) el.dataset.origHtml = el.innerHTML;
      var gn = (LANG === 'gn') ? I18N_GN[key] : undefined;
      el.innerHTML = (gn != null) ? gn : el.dataset.origHtml;
    });
  }

  /* ---------- 3 · Misión: intro + cifras ---------- */

  function renderMision() {
    var intro = document.getElementById('misionIntro');
    if (intro) intro.textContent = LINEA.intro || '';

    var cont = document.getElementById('stats');
    if (!cont) return;
    var anios = 2026 - 1913 + 1;
    var stats = [
      { n: eventos.length, label: t('stats.eventos') },
      { n: personas.length, label: t('stats.personas') },
      { n: anios, label: t('stats.anios') }
    ];
    cont.innerHTML = stats.map(function (s) {
      return '<div class="stat reveal"><span class="stat-num">' + s.n + '</span><span class="stat-label">' + esc(s.label) + '</span></div>';
    }).join('');
  }

  /* ---------- 4 · Línea de tiempo ---------- */

  function renderTimeline() {
    var cont = document.getElementById('timeline');
    if (!cont) return;

    var CATS = cats();
    var ERAS = eras();

    var ordenados = eventos.slice().sort(function (a, b) {
      var ya = parseAnio(a.anio);
      var yb = parseAnio(b.anio);
      if (ya == null && yb == null) return 0;
      if (ya == null) return 1;
      if (yb == null) return -1;
      return ya - yb;
    });

    var html = '';
    var eraActual = -1;

    ordenados.forEach(function (ev, i) {
      var era = eraDe(ev.anio);
      if (era < ERAS.length && era !== eraActual) {
        html += '<div class="tl-era reveal" data-era="' + era + '">' +
          '<span class="tl-era-titulo">' + esc(ERAS[era].titulo) + '</span>' +
          '<span class="tl-era-rango">' + esc(ERAS[era].rango) + '</span>' +
          '</div>';
        eraActual = era;
      }
      var cat = CATS[ev.categoria] ? ev.categoria : 'movimiento';
      html += '<article class="tl-item reveal" data-cat="' + esc(ev.categoria || '') + '" data-era="' + era + '" style="--d:' + ((i % 6) * 70) + 'ms">' +
        '<div class="tl-rail"><span class="tl-dot tl-dot-' + esc(cat) + '"></span></div>' +
        '<div class="tl-card">' +
          '<div class="tl-meta">' +
            '<span class="tl-anio">' + esc(ev.anio) + '</span>' +
            (CATS[ev.categoria] ? '<span class="chip chip-' + esc(ev.categoria) + '">' + esc(CATS[ev.categoria]) + '</span>' : '') +
          '</div>' +
          '<h3 class="tl-titulo">' + esc(ev.titulo) + '</h3>' +
          '<p class="tl-desc">' + esc(ev.descripcion) + '</p>' +
        '</div>' +
      '</article>';
    });

    /* Tarjeta final: el archivo continúa */
    html += '<article class="tl-item tl-continua reveal">' +
      '<div class="tl-rail"><span class="tl-dot tl-dot-oro"></span></div>' +
      '<div class="tl-card">' +
        '<div class="tl-meta">' +
          '<span class="tl-anio">' + esc(t('tl.continua.anio')) + '</span>' +
          '<span class="chip chip-oro">' + esc(t('tl.continua.chip')) + '</span>' +
        '</div>' +
        '<h3 class="tl-titulo">' + esc(t('tl.continua.titulo')) + '</h3>' +
        '<p class="tl-desc">' + esc(FUTURO.vision || '') + '</p>' +
      '</div>' +
    '</article>';

    cont.innerHTML = html;
    renderFiltros();
  }

  function renderFiltros() {
    var cont = document.getElementById('filtros');
    if (!cont) return;

    var CATS = cats();

    var html = '<button class="filtro is-activo" type="button" data-filtro="todas">' + esc(t('filtro.todas')) + '</button>';
    Object.keys(CATS).forEach(function (k) {
      html += '<button class="filtro" type="button" data-filtro="' + k + '">' +
        '<span class="filtro-punto" aria-hidden="true"></span>' + esc(CATS[k]) +
        '</button>';
    });
    cont.innerHTML = html;

    cont.onclick = function (e) {
      var btn = e.target.closest('.filtro');
      if (btn) aplicarFiltro(btn.getAttribute('data-filtro'));
    };
  }

  function aplicarFiltro(cat) {
    var btns = document.querySelectorAll('.filtro');
    btns.forEach(function (b) {
      b.classList.toggle('is-activo', b.getAttribute('data-filtro') === cat);
    });
    var items = document.querySelectorAll('.tl-item');
    var erasConItems = {};
    items.forEach(function (item) {
      var coincide = cat === 'todas' || item.getAttribute('data-cat') === cat || item.classList.contains('tl-continua');
      if (coincide) erasConItems[item.getAttribute('data-era')] = true;
      if (coincide) {
        item.style.display = '';

        requestAnimationFrame(function () {
          requestAnimationFrame(function () { item.classList.remove('filtrado'); });
        });
      } else {
        item.classList.add('filtrado');
        setTimeout(function () {
          if (item.classList.contains('filtrado')) item.style.display = 'none';
        }, 360);
      }
    });

    document.querySelectorAll('.tl-era').forEach(function (div) {
      div.style.display = erasConItems[div.getAttribute('data-era')] ? '' : 'none';
    });
  }

  /* ---------- 5 · Personas ---------- */

  function renderPersonas() {
    var cont = document.getElementById('personasGrid');
    if (!cont) return;

    var clave = ['William Paats', 'Ernesto Pérez Acosta', 'Zacarías Battilana'];

    cont.innerHTML = personas.map(function (p, i) {
      var esClave = clave.some(function (c) { return (p.nombre || '').indexOf(c) !== -1; });
      return '<article class="persona-card reveal' + (esClave ? ' persona-clave' : '') + '" style="--d:' + ((i % 6) * 60) + 'ms">' +
        '<div class="persona-mono" aria-hidden="true">' + esc(monograma(p.nombre)) + '</div>' +
        (esClave ? '<span class="persona-tag">' + esc(t('personas.clave')) + '</span>' : '') +
        '<h3 class="persona-nombre">' + esc(p.nombre) + '</h3>' +
        '<p class="persona-rol">' + esc(p.rol) + '</p>' +
        '<p class="persona-bio">' + esc(p.bio) + '</p>' +
        '<button class="persona-mas" type="button" aria-expanded="false" hidden>' + esc(t('personas.mas')) + '</button>' +
        '<p class="persona-periodo">' + esc(p.periodo || '') + '</p>' +
      '</article>';
    }).join('');

    cont.querySelectorAll('.persona-card').forEach(function (card) {
      var bio = card.querySelector('.persona-bio');
      var btn = card.querySelector('.persona-mas');
      if (!bio || !btn) return;
      btn.addEventListener('click', function () {
        var abierto = card.classList.toggle('abierto');
        btn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
        btn.textContent = abierto ? t('personas.menos') : t('personas.mas');
      });
    });

    function verificarDesbordes() {
      cont.querySelectorAll('.persona-card').forEach(function (card) {
        var bio = card.querySelector('.persona-bio');
        var btn = card.querySelector('.persona-mas');
        if (!bio || !btn) return;
        btn.hidden = bio.scrollHeight <= bio.clientHeight + 4;
      });
    }

    verificarDesbordes();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(verificarDesbordes);
    }
    if (!personasLoadBound) {
      personasLoadBound = true;
      window.addEventListener('load', function () {
        setTimeout(verificarDesbordes, 150);
      });
    }
  }

  /* ---------- 6 · Historias / Temas ---------- */

  function renderTemas() {
    var cont = document.getElementById('temasScroll');
    if (!cont) return;
    cont.innerHTML = temas.map(function (tema, i) {
      return '<article class="tema-card reveal" style="--d:' + (i * 90) + 'ms">' +
        '<span class="tema-num" aria-hidden="true">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<h3 class="tema-titulo">' + esc(tema.titulo) + '</h3>' +
        '<p class="tema-desc">' + esc(tema.descripcion) + '</p>' +
      '</article>';
    }).join('');
  }

  /* ---------- 7 · Citas ---------- */

  function renderCitas() {
    var cont = document.getElementById('citasCarousel');
    if (!cont || !citas.length) return;

    if (citasTimer) { clearInterval(citasTimer); citasTimer = null; }

    cont.innerHTML =
      '<div class="citas-viewport">' +
        '<div class="citas-track">' +
          citas.map(function (c) {
            return '<figure class="cita-slide">' +
              '<blockquote class="cita-texto">' + esc(c.texto) + '</blockquote>' +
              '<figcaption class="cita-contexto">' + esc(c.contexto) + '</figcaption>' +
            '</figure>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="citas-controls">' +
        '<button class="cita-btn cita-prev" type="button" aria-label="' + esc(t('citas.prev')) + '">' + FLECHA_IZQ + '</button>' +
        '<div class="cita-dots" role="tablist" aria-label="' + esc(t('citas.label')) + '"></div>' +
        '<button class="cita-btn cita-next" type="button" aria-label="' + esc(t('citas.next')) + '">' + FLECHA_DER + '</button>' +
      '</div>';

    var track = cont.querySelector('.citas-track');
    var dots = cont.querySelector('.cita-dots');
    var n = citas.length;
    var idx = 0;
    var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    citas.forEach(function (_, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'cita-dot';
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', 'Cita ' + (i + 1) + ' de ' + n);
      d.addEventListener('click', function () { ir(i); });
      dots.appendChild(d);
    });

    function ir(i) {
      idx = (i + n) % n;
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      Array.prototype.forEach.call(dots.children, function (d, j) {
        d.classList.toggle('is-activo', j === idx);
        d.setAttribute('aria-selected', j === idx ? 'true' : 'false');
      });
    }

    function siguiente() { ir(idx + 1); }
    function anterior() { ir(idx - 1); }

    cont.querySelector('.cita-next').addEventListener('click', siguiente);
    cont.querySelector('.cita-prev').addEventListener('click', anterior);

    function arrancar() {
      detener();
      if (!reducido && n > 1) citasTimer = setInterval(siguiente, 6000);
    }
    function detener() {
      if (citasTimer) { clearInterval(citasTimer); citasTimer = null; }
    }

    cont.addEventListener('mouseenter', detener);
    cont.addEventListener('mouseleave', arrancar);
    cont.addEventListener('focusin', detener);
    cont.addEventListener('focusout', arrancar);

    ir(0);
    arrancar();
  }

  /* ---------- 8 · El proyecto ---------- */

  function renderProyecto() {
    var v = document.getElementById('proyectoVision');
    if (v) v.textContent = FUTURO.vision || '';

    var ej = document.getElementById('ejesGrid');
    if (ej) {
      ej.innerHTML = ejes.map(function (e, i) {
        var detalles = (e.detalles || []).map(function (d) {
          return '<li>' + esc(d) + '</li>';
        }).join('');
        return '<article class="eje-card reveal" style="--d:' + ((i % 3) * 90) + 'ms">' +
          '<span class="eje-num" aria-hidden="true">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<h3 class="eje-titulo">' + esc(e.titulo) + '</h3>' +
          '<p class="eje-sub">' + esc(e.subtitulo) + '</p>' +
          '<p class="eje-desc">' + esc(e.descripcion) + '</p>' +
          (detalles ? '<ul class="eje-detalles">' + detalles + '</ul>' : '') +
        '</article>';
      }).join('');
    }

    var fs = document.getElementById('fases');
    if (fs) {
      fs.setAttribute('aria-label', t('proyecto.fasesAria'));
      fs.innerHTML = '<ol class="fases-lista">' + fases.map(function (f, i) {
        return '<li class="fase reveal" style="--d:' + (i * 120) + 'ms">' +
          '<div class="fase-cabeza">' +
            '<span class="fase-num" aria-hidden="true">' + (i + 1) + '</span>' +
            '<span class="fase-tiempo">' + esc(f.tiempo) + '</span>' +
          '</div>' +
          '<h3 class="fase-titulo">' + esc(f.titulo) + '</h3>' +
          '<p class="fase-desc">' + esc(f.descripcion) + '</p>' +
        '</li>';
      }).join('') + '</ol>';
    }

    var ff = document.getElementById('fraseFinal');
    if (ff) ff.textContent = FUTURO.frase_final || '';
  }

  /* ---------- Navegación ---------- */

  function initNav() {
    var nav = document.getElementById('nav');
    var toggle = document.querySelector('.nav-toggle');
    var links = document.getElementById('navLinks');
    if (!nav) return;

    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 24);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var abierto = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', abierto ? 'true' : 'false');
        toggle.setAttribute('aria-label', abierto ? t('nav.cerrar') : t('nav.abrir'));
      });
      links.addEventListener('click', function (e) {
        if (e.target.closest('a')) {
          nav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.setAttribute('aria-label', t('nav.abrir'));
        }
      });
    }
  }

  /* ---------- Cambio de idioma ---------- */

  function initLangSwitch() {
    var btn = document.getElementById('langSwitch');
    if (!btn) return;

    function etiqueta() {
      btn.textContent = (LANG === 'gn') ? 'Español' : 'Avañe\'ẽ';
      btn.setAttribute('aria-label', t('idioma.label'));
    }

    btn.addEventListener('click', function () {
      LANG = (LANG === 'gn') ? 'es' : 'gn';
      try { localStorage.setItem('scout-lang', LANG); } catch (e) {}
      document.documentElement.lang = LANG;
      reRender();
    });

    etiqueta();
    document.documentElement.lang = LANG;
  }

  /* ---------- Revelado al hacer scroll ---------- */

  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ---------- Re-render tras cambiar idioma ---------- */

  function reRender() {
    LINEA = getLinea();
    FUTURO = getFuturo();
    eventos = Array.isArray(LINEA.eventos) ? LINEA.eventos : [];
    personas = Array.isArray(LINEA.personas) ? LINEA.personas : [];
    citas = Array.isArray(LINEA.citas) ? LINEA.citas : [];
    temas = Array.isArray(LINEA.temas) ? LINEA.temas : [];
    ejes = Array.isArray(FUTURO.ejes) ? FUTURO.ejes : [];
    fases = Array.isArray(FUTURO.fases) ? FUTURO.fases : [];

    aplicarI18nEstatico();
    renderMision();
    renderTimeline();
    renderPersonas();
    renderTemas();
    renderCitas();
    renderProyecto();
    initReveal();
  }

  /* ---------- Arranque ---------- */

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reduced-motion');
    }
    aplicarI18nEstatico();
    renderMision();
    renderTimeline();
    renderPersonas();
    renderTemas();
    renderCitas();
    renderProyecto();
    initNav();
    initLangSwitch();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
