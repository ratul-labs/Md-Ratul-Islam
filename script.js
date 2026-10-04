/* ==========================================================
   RATUL LABS — script.js  (vanilla JS, no dependencies)
   ========================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduce = reduceQuery.matches;
  reduceQuery.addEventListener && reduceQuery.addEventListener('change', function (e) { reduce = e.matches; });
  var cfg = window.RATUL_LABS_CONFIG || {};
  var refreshBg = function () {};

  /* ---------- 1. Config → DOM ---------- */
  function applyConfig() {
    var social = cfg.social || {};
    $$('[data-social]').forEach(function (el) {
      var key = el.getAttribute('data-social');
      var url = (social[key] || '').trim();
      if (key === 'email' && url && !/^mailto:/i.test(url)) url = 'mailto:' + url;
      if (url) {
        el.setAttribute('href', url);
        if (key !== 'email') { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener noreferrer'); }
        el.classList.remove('is-empty');
        el.removeAttribute('aria-disabled');
      } else {
        el.removeAttribute('href');
        el.setAttribute('role', 'link');
        el.setAttribute('aria-disabled', 'true');
        el.setAttribute('title', 'Link coming soon');
        el.classList.add('is-empty');
      }
    });

    var projects = cfg.projects || {};
    $$('[data-project]').forEach(function (a) {
      var p = projects[a.getAttribute('data-project')];
      if (p && p.url) { a.href = p.url; a.hidden = false; }
    });
    $$('[data-project-note]').forEach(function (n) {
      var p = projects[n.getAttribute('data-project-note')];
      if (p && p.url) n.textContent = 'PROJECT_URL: ' + p.url.replace(/^https?:\/\//, '');
    });

    $$('[data-fill]').forEach(function (n) {
      var v = cfg[n.getAttribute('data-fill')];
      if (v) n.textContent = v;
    });
    var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- 2. Theme toggle ---------- */
  function initTheme() {
    var btn = $('#theme-toggle');
    var meta = document.querySelector('meta[name="theme-color"]');
    function apply(t, save) {
      root.setAttribute('data-theme', t);
      btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      if (meta) meta.setAttribute('content', t === 'dark' ? '#050810' : '#F3F6FB');
      if (save) { try { localStorage.setItem('ratul-labs-theme', t); } catch (e) {} }
      refreshBg();
    }
    apply(root.getAttribute('data-theme') || 'dark', false);
    btn.addEventListener('click', function () {
      apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });
  }

  /* ---------- 3. Navigation (scroll state, mobile menu, scrollspy) ---------- */
  function initNav() {
    var nav = $('#nav'), links = $('#primary-nav'), btn = $('#menu-btn');
    var linkEls = $$('#primary-nav a');

    function setOpen(open) {
      links.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      root.classList.toggle('menu-open', open);
    }
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    linkEls.forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1000) setOpen(false); });

    var sections = $$('[data-nav]');
    var ticking = false;
    function onScroll() {
      var y = window.scrollY;
      nav.classList.toggle('scrolled', y > 24);
      if (!reduce && y < 1800) root.style.setProperty('--sy', y);

      var probe = y + window.innerHeight * 0.38, current = '';
      sections.forEach(function (s) { if (s.offsetTop <= probe) current = s.getAttribute('data-nav'); });
      linkEls.forEach(function (a) {
        var on = a.getAttribute('data-link') === current;
        a.classList.toggle('active', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
  }

  /* ---------- 4. Scroll reveal + "in view" triggers ---------- */
  function initReveal() {
    var targets = $$('.reveal, .chain, .road, .vwords');
    if (!('IntersectionObserver' in window)) { targets.forEach(function (t) { t.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---------- 5. Number counters ---------- */
  function initCounters() {
    var els = $$('[data-count]');
    if (!els.length || reduce || !('IntersectionObserver' in window)) return;
    els.forEach(function (el) { el.textContent = '0'; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, end = parseInt(el.getAttribute('data-count'), 10), t0 = performance.now(), dur = 1400;
        (function step(now) {
          var k = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(end * e);
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 6. Custom cursor (desktop only) ---------- */
  function initCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var dot = document.createElement('div'), ring = document.createElement('div');
    dot.className = 'cursor-dot'; ring.className = 'cursor-ring';
    dot.setAttribute('aria-hidden', 'true'); ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring); document.body.appendChild(dot);
    root.classList.add('has-cursor');

    var mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      document.body.classList.remove('cursor-out');
    }, { passive: true });
    document.addEventListener('mouseleave', function () { document.body.classList.add('cursor-out'); });
    document.addEventListener('mouseover', function (e) {
      var hot = e.target.closest && e.target.closest('a[href], button, .rnode, .proj, .module, .social, .step');
      ring.classList.toggle('hover', !!hot);
    });
    (function loop() {
      rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 7. Ambient particle background ---------- */
  function initBackground() {
    var c = $('#bg'), ctx = c && c.getContext && c.getContext('2d');
    if (!ctx) return;
    var w, h, dpr, pts = [], rgb = '77,163,255', raf = 0;

    function readColor() { rgb = getComputedStyle(root).getPropertyValue('--particle').trim() || rgb; }
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = w < 760 ? 26 : Math.min(70, Math.round(w * h / 26000));
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22, r: Math.random() * 1.3 + .5 });
      }
      draw(false);
    }
    function draw(move) {
      ctx.clearRect(0, 0, w, h);
      var i, j, p, q, dx, dy, d;
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        if (move) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
        }
        ctx.fillStyle = 'rgba(' + rgb + ',.55)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        for (j = i + 1; j < pts.length; j++) {
          q = pts[j]; dx = p.x - q.x; dy = p.y - q.y; d = dx * dx + dy * dy;
          if (d < 12100) {
            ctx.strokeStyle = 'rgba(' + rgb + ',' + (0.16 * (1 - d / 12100)).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
    }
    function loop() { draw(true); raf = requestAnimationFrame(loop); }
    function start() { if (!reduce && !raf) raf = requestAnimationFrame(loop); }
    function stop() { cancelAnimationFrame(raf); raf = 0; }

    refreshBg = function () { readColor(); draw(false); };
    readColor(); size(); start();
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 150); });
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  }

  /* ---------- 8. Hero: dots travelling along the connecting lines ---------- */
  function initHeroFlow() {
    var svg = $('.hero-svg'); if (!svg) return;
    var layer = $('.dots', svg), NS = 'http://www.w3.org/2000/svg';
    var flows = $$('[data-flow]', svg).map(function (p) {
      var sp = p.classList.contains('spine');
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('r', sp ? 4 : 3);
      c.setAttribute('class', 'fdot' + (sp ? ' sp' : ''));
      c.style.opacity = 0;
      layer.appendChild(c);
      return { p: p, c: c, len: p.getTotalLength(), period: +p.getAttribute('data-period') || 8, delay: +p.getAttribute('data-delay') || 0, dur: +p.getAttribute('data-dur') || 2.4 };
    });
    var raf = 0;
    function tick(now) {
      var t = now / 1000;
      flows.forEach(function (f) {
        var ph = (((t - f.delay) % f.period) + f.period) % f.period;
        if (ph < f.dur) {
          var k = ph / f.dur, pt = f.p.getPointAtLength(k * f.len);
          f.c.setAttribute('cx', pt.x); f.c.setAttribute('cy', pt.y);
          f.c.style.opacity = Math.sin(Math.PI * k).toFixed(2);
        } else { f.c.style.opacity = 0; }
      });
      raf = requestAnimationFrame(tick);
    }
    if (reduce) {
      /* static fallback: show the spine marker at the middle */
      var s = flows[flows.length - 1], pt = s.p.getPointAtLength(s.len * 0.5);
      s.c.setAttribute('cx', pt.x); s.c.setAttribute('cy', pt.y); s.c.style.opacity = 1;
      return;
    }
    if (!('IntersectionObserver' in window)) { raf = requestAnimationFrame(tick); return; }
    new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { if (!raf) raf = requestAnimationFrame(tick); }
      else { cancelAnimationFrame(raf); raf = 0; }
    }).observe(svg);
  }

  /* ---------- 9. "How I think" stepper ---------- */
  function initThink() {
    var chain = $('#think-chain'), note = $('#think-note');
    if (!chain || !note) return;
    var TEXT = [
      "Every project starts with something that isn't working well for someone.",
      "Ask who is affected and why it happens. Listen before building.",
      "Look at what already exists, what the data says, and what has been tried.",
      "Sketch the system: who uses it, and what flows through it.",
      "Turn the design into something that runs, however small it is.",
      "Test the assumptions with real use. Expect to be wrong sometimes.",
      "Take what the experiment taught and change the design.",
      "A result that works for the problem it started with."
    ];
    var steps = $$('.step', chain), idx = 0, timer = 0, touched = false;
    note.setAttribute('aria-live', 'off');

    function set(i) {
      idx = i;
      steps.forEach(function (s, j) { s.setAttribute('aria-pressed', String(j === i)); });
      note.textContent = TEXT[i];
    }
    function user(i) {
      touched = true; clearInterval(timer);
      note.setAttribute('aria-live', 'polite');
      set(i);
    }
    steps.forEach(function (s, i) {
      s.addEventListener('click', function () { user(i); });
      s.addEventListener('mouseenter', function () { user(i); });
      s.addEventListener('focus', function () { user(i); });
    });
    if (reduce || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (en) {
      if (touched) return;
      clearInterval(timer);
      if (en[0].isIntersecting) timer = setInterval(function () { set((idx + 1) % steps.length); }, 2600);
    }, { threshold: 0.5 }).observe(chain);
  }

  /* ---------- 10. Research radar ---------- */
  function initRadar() {
    var radar = $('#radar'); if (!radar) return;
    var DATA = {
      ai:     { id: 'AREA_01 / AI', title: 'Artificial Intelligence', text: 'How machines learn from data, and how that can support everyday decisions and real problems.', rel: ['data', 'is'] },
      iot:    { id: 'AREA_02 / IoT', title: 'IoT', text: 'Connecting physical devices to digital systems so they can sense, report and respond in real situations.', rel: ['sus', 'data'] },
      data:   { id: 'AREA_03 / DATA', title: 'Data & Decision Making', text: 'Turning raw data into clear information that helps people make better choices.', rel: ['ai', 'is'] },
      is:     { id: 'AREA_04 / INFO_SYSTEMS', title: 'Information Systems', text: 'How information moves through an organisation, and how smart systems make that flow useful.', rel: ['data', 'net'] },
      sus:    { id: 'AREA_05 / SUSTAINABILITY', title: 'Sustainable Technology', text: 'Technology that cuts waste and supports a more sustainable Bangladesh. Nobayon grew from this area.', rel: ['iot', 'impact'] },
      edtech: { id: 'AREA_06 / EDTECH', title: 'Educational Technology', text: 'Digital tools that help students learn, find direction and grow. PassionPath lives here.', rel: ['impact', 'data'] },
      net:    { id: 'AREA_07 / NETWORKING', title: 'Networking & Infrastructure', text: 'The infrastructure that connects systems, and how data travels between them reliably.', rel: ['is', 'iot'] },
      impact: { id: 'AREA_08 / SOCIAL_IMPACT', title: 'Technology & Social Impact', text: 'Judging technology by the difference it makes for real people and communities.', rel: ['sus', 'edtech'] }
    };
    var nodes = $$('.rnode', radar), lines = $$('.rline', radar), panel = $('.radar-panel');
    var pid = $('#rp-id'), pt = $('#rp-title'), px = $('#rp-text'), pr = $('#rp-rel');

    function show(key) {
      var d = DATA[key]; if (!d) return;
      nodes.forEach(function (n) { n.classList.toggle('active', n.getAttribute('data-k') === key); });
      lines.forEach(function (l) { l.classList.toggle('on', l.getAttribute('data-k') === key); });
      pid.textContent = d.id; pt.textContent = d.title; px.textContent = d.text;
      pr.textContent = 'CONNECTED_TO: ' + d.rel.map(function (k) { return DATA[k].title.split(' ')[0].toUpperCase(); }).join(', ');
      panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
    }
    nodes.forEach(function (n) {
      var k = n.getAttribute('data-k');
      n.setAttribute('aria-label', DATA[k].title);
      ['mouseenter', 'focus', 'click'].forEach(function (ev) { n.addEventListener(ev, function () { show(k); }); });
    });
  }

  /* ---------- 11. Project cards ---------- */
  function initProjects() {
    $$('.explore').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.proj');
        var open = !card.classList.contains('open');
        card.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', String(open));
        if (btn.firstChild && btn.firstChild.nodeType === 3) btn.firstChild.nodeValue = open ? 'Hide details ' : 'Explore project ';
      });
    });
  }

  /* ---------- boot ---------- */
  applyConfig();
  initTheme();
  initNav();
  initReveal();
  initCounters();
  initCursor();
  initBackground();
  initHeroFlow();
  initThink();
  initRadar();
  initProjects();
})();
