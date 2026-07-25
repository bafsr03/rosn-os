/* =========================================================================
   O's by ROSN — motion orchestrator
   Requires gsap + ScrollTrigger + Lenis (all vendored locally, loaded first).
   Degrades fully: if libs missing or reduced-motion, content stays visible.
   ========================================================================= */
(function () {
  'use strict';

  var reduce =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var body = document.body;

  // Always mark ready so [data-reveal] elements can never stay stuck hidden.
  function forceVisible() {
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  if (reduce || !hasGSAP) {
    forceVisible();
    initAgeGateBinding(); // age gate must work regardless
    return;
  }

  var gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
  var ST = window.ScrollTrigger;

  document.documentElement.classList.add('rosn-ready');
  body.classList.add('rosn-ready');

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (typeof window.Lenis !== 'undefined' && !isDesignMode()) {
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, lerp: 0.1 });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    if (ST) {
      lenis.on('scroll', ST.update);
      gsap.ticker.add(function (t) {
        lenis.raf(t * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
    window.rosnLenis = lenis;
  }

  function isDesignMode() {
    return !!(window.Shopify && window.Shopify.designMode);
  }

  /* ---------- Reveals ---------- */
  function initReveals() {
    if (!ST) {
      forceVisible();
      return;
    }
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      var mode = el.getAttribute('data-reveal');
      var delay = parseFloat(el.getAttribute('data-reveal-delay')) || 0;
      var from = { opacity: 0 };
      if (mode === 'up') from.y = 40;
      if (mode === 'scale') from.scale = 0.94;
      gsap.fromTo(el, from, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        delay: delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });

    // staggered groups
    gsap.utils.toArray('[data-reveal-group]').forEach(function (group) {
      var kids = group.querySelectorAll('[data-reveal-child]');
      gsap.fromTo(
        kids,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.09,
          scrollTrigger: { trigger: group, start: 'top 82%', once: true },
        }
      );
    });
  }

  /* ---------- Parallax ---------- */
  function initParallax() {
    if (!ST) return;
    gsap.utils.toArray('[data-parallax]').forEach(function (el) {
      var amount = parseFloat(el.getAttribute('data-parallax')) || 0.2;
      gsap.to(el, {
        yPercent: amount * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('[data-parallax-scope]') || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  /* ---------- Stat counters ---------- */
  function initCounters() {
    gsap.utils.toArray('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var decimals = (el.getAttribute('data-count') || '').indexOf('.') > -1 ? 1 : 0;
      var suffix = el.getAttribute('data-count-suffix') || '';
      var obj = { v: 0 };
      var run = function () {
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: function () {
            el.textContent = obj.v.toFixed(decimals) + suffix;
          },
        });
      };
      if (ST) {
        ST.create({ trigger: el, start: 'top 88%', once: true, onEnter: run });
      } else {
        run();
      }
    });
  }

  /* ---------- Marquees ---------- */
  function initMarquees() {
    gsap.utils.toArray('.rosn-marquee').forEach(function (m) {
      var track = m.querySelector('.rosn-marquee__track');
      if (!track) return;
      var dir = m.getAttribute('data-direction') === 'right' ? 1 : -1;
      var speed = parseFloat(m.getAttribute('data-speed')) || 40;
      // duplicate content for seamless loop
      track.innerHTML = track.innerHTML + track.innerHTML;
      var half = track.scrollWidth / 2;
      var x = 0;
      gsap.ticker.add(function () {
        x += (dir * speed) / 60;
        if (dir < 0 && Math.abs(x) >= half) x = 0;
        if (dir > 0 && x >= half) x = 0;
        track.style.transform = 'translateX(' + x + 'px)';
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    if (matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('.rosn-magnetic').forEach(function (el) {
      var strength = parseFloat(el.getAttribute('data-magnetic')) || 0.35;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: mx * strength, y: my * strength, duration: 0.6, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ---------- 3D tilt (flavor cards) ---------- */
  function initTilt() {
    if (matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(el, {
          rotateY: px * 12,
          rotateX: -py * 12,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 900,
        });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power2.out' });
      });
    });
  }

  /* ---------- Pinned horizontal scroll (flavors) ---------- */
  function initHorizontal() {
    if (!ST) return;
    if (matchMedia('(max-width: 989px)').matches) return;
    document.querySelectorAll('[data-hscroll]').forEach(function (scope) {
      var track = scope.querySelector('[data-hscroll-track]');
      if (!track) return;
      var distance = track.scrollWidth - scope.offsetWidth;
      if (distance <= 0) return;
      gsap.to(track, {
        x: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: scope,
          start: 'top top',
          end: '+=' + distance,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    });
  }

  /* ---------- Sticky header state ---------- */
  function initHeaderState() {
    var header = document.querySelector('[data-rosn-header]');
    if (!header) return;
    var update = function () {
      var y = lenis ? lenis.scroll : window.scrollY;
      header.classList.toggle('is-scrolled', y > 40);
    };
    update();
    if (lenis) lenis.on('scroll', update);
    else window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------- Legal scroll-progress ---------- */
  function initProgress() {
    var bar = document.querySelector('[data-rosn-progress]');
    if (!bar) return;
    var update = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var y = lenis ? lenis.scroll : window.scrollY;
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, y / h)) + ')';
    };
    update();
    if (lenis) lenis.on('scroll', update);
    else window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------- Table-of-contents active state ---------- */
  function initToc() {
    if (!ST) return;
    document.querySelectorAll('[data-toc-target]').forEach(function (sec) {
      var id = sec.id;
      var link = document.querySelector('[data-toc-link="' + id + '"]');
      if (!link) return;
      ST.create({
        trigger: sec,
        start: 'top 40%',
        end: 'bottom 40%',
        onToggle: function (self) {
          link.classList.toggle('is-active', self.isActive);
        },
      });
    });
  }

  /* ---------- Custom cursor ---------- */
  function initCursor() {
    if (matchMedia('(hover: none)').matches) return;
    var cur = document.querySelector('.rosn-cursor');
    if (!cur) return;
    var x = 0, y = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
    });
    gsap.ticker.add(function () {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      cur.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    });
    document.querySelectorAll('a, button, [data-cursor-hot]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cur.classList.add('is-hot'); });
      el.addEventListener('mouseleave', function () { cur.classList.remove('is-hot'); });
    });
  }

  /* ---------- Age gate ---------- */
  function initAgeGateBinding() {
    var gate = document.querySelector('[data-age-gate]');
    if (!gate) return;
    var COOKIE = 'rosn_age_ok';
    if (document.cookie.indexOf(COOKIE + '=1') > -1) {
      gate.setAttribute('hidden', '');
      return;
    }
    document.body.classList.add('rosn-lock');
    var yes = gate.querySelector('[data-age-yes]');
    var no = gate.querySelector('[data-age-no]');
    var msg = gate.querySelector('.rosn-age__msg');
    if (yes) yes.addEventListener('click', function () {
      document.cookie = COOKIE + '=1; max-age=' + 60 * 60 * 24 * 30 + '; path=/; SameSite=Lax';
      gate.classList.add('is-leaving');
      document.body.classList.remove('rosn-lock');
      setTimeout(function () { gate.setAttribute('hidden', ''); if (window.rosnLenis) window.rosnLenis.resize(); }, 700);
    });
    if (no) no.addEventListener('click', function () {
      if (msg) msg.textContent = 'You must be 18 or older to enter.';
    });
    // focus for a11y
    if (yes) yes.focus();
  }

  function initAll() {
    initReveals();
    initParallax();
    initCounters();
    initMarquees();
    initMagnetic();
    initTilt();
    initHorizontal();
    initHeaderState();
    initProgress();
    initToc();
    initCursor();
    initAgeGateBinding();
    if (ST) ST.refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Re-init reveals when Shopify theme editor injects sections
  document.addEventListener('shopify:section:load', function () {
    if (ST) ST.refresh();
  });
})();
