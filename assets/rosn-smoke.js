/* =========================================================================
   O's by ROSN — gold smoke / ember particle field
   Attaches to <canvas data-rosn-smoke>. Pauses off-screen & on reduced-motion.
   Falls back silently (CSS gradient behind it stays visible) if unsupported.
   ========================================================================= */
(function () {
  'use strict';

  var reduce =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init(canvas) {
    var ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;

    // Low-power / small screens: keep the CSS gradient, skip the sim.
    var lowPower = matchMedia('(max-width: 749px)').matches;
    var dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 2);
    var w = 0, h = 0;
    var particles = [];
    var count = lowPower ? 26 : 60;
    var running = true;
    var raf = null;

    function resize() {
      var r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn() {
      return {
        x: w * (0.5 + (Math.random() - 0.5) * 0.5),
        y: h + Math.random() * 60,
        r: 20 + Math.random() * (lowPower ? 60 : 120),
        vy: -(0.15 + Math.random() * 0.45),
        vx: (Math.random() - 0.5) * 0.25,
        life: 0,
        max: 260 + Math.random() * 260,
        hue: 40 + Math.random() * 12,
        alpha: 0.05 + Math.random() * 0.09,
      };
    }

    for (var i = 0; i < count; i++) {
      var p = spawn();
      p.life = Math.random() * p.max;
      particles.push(p);
    }

    // occasional bright ember sparks
    var embers = [];
    function spawnEmber() {
      embers.push({
        x: w * (0.35 + Math.random() * 0.3),
        y: h * (0.55 + Math.random() * 0.3),
        vy: -(0.4 + Math.random() * 0.9),
        vx: (Math.random() - 0.5) * 0.4,
        r: 0.6 + Math.random() * 1.4,
        life: 0,
        max: 120 + Math.random() * 120,
      });
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.02;
        if (p.life > p.max || p.y < -p.r) {
          particles[i] = spawn();
          continue;
        }
        var t = p.life / p.max;
        var a = p.alpha * Math.sin(t * Math.PI); // fade in/out
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, 'hsla(' + p.hue + ', 85%, 60%, ' + a + ')');
        g.addColorStop(1, 'hsla(' + p.hue + ', 85%, 45%, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!lowPower && Math.random() < 0.25) spawnEmber();
      for (var j = embers.length - 1; j >= 0; j--) {
        var e = embers[j];
        e.life++;
        e.x += e.vx;
        e.y += e.vy;
        if (e.life > e.max) { embers.splice(j, 1); continue; }
        var ea = (1 - e.life / e.max) * 0.9;
        ctx.fillStyle = 'hsla(46, 100%, 72%, ' + ea + ')';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', debounce(resize, 200));

    // Pause when off-screen to save battery
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !running) {
            running = true;
            frame();
          } else if (!en.isIntersecting) {
            running = false;
            if (raf) cancelAnimationFrame(raf);
          }
        });
      }, { threshold: 0.01 }).observe(canvas);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        running = false;
        if (raf) cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        frame();
      }
    });

    frame();
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function boot() {
    if (reduce) return; // gradient fallback stays
    document.querySelectorAll('canvas[data-rosn-smoke]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
