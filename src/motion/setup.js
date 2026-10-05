import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { buildMaster } from './choreography.js';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Wires the whole page: Lenis smooth scroll, loader, 3D scene, master
 * timeline, DOM reveals, project/experience triggers. Returns a cleanup fn.
 */
export function initSite({ canvas, projects }) {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const light = window.matchMedia('(prefers-color-scheme: light)').matches;
  root.classList.toggle('reduced-motion', reduced);

  let disposed = false;
  let exp = null;
  let master = null;
  const timers = [];
  const ctx = gsap.context(() => {});

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  // ── smooth scroll ─────────────────────────────────────
  const lenis = new Lenis({
    duration: 1.15,
    smoothWheel: !reduced,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  lenis.stop();
  root.classList.add('is-loading');
  lenis.on('scroll', ScrollTrigger.update);
  const raf = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  // in-page links go through Lenis; focus moves to the target for keyboard users
  const onClick = (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id === '#') {
      e.preventDefault(); // placeholder project links
      return;
    }
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    lenis.scrollTo(el, { immediate: reduced, duration: 1.6 });
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  };
  document.addEventListener('click', onClick);

  // ── loader lines ──────────────────────────────────────
  const loader = document.getElementById('loader');
  const lines = loader ? [...loader.querySelectorAll('.line')] : [];
  const typed = new Promise((resolve) => {
    let i = 0;
    const step = () => {
      if (disposed) return;
      if (i < lines.length) {
        lines[i++].classList.add('on');
        timers.push(setTimeout(step, reduced ? 40 : 240));
      } else resolve();
    };
    step();
  });

  // ── 3D ────────────────────────────────────────────────
  const fallback = () => {
    root.classList.add('no-webgl');
    canvas.style.display = 'none';
  };
  const fonts = Promise.race([
    document.fonts ? document.fonts.load('800 100px "Bricolage Grotesque"').then(() => document.fonts.ready) : null,
    wait(1800),
  ]);
  const ready = webglAvailable()
    ? import('../three/Experience.js')
        .then(async (m) => {
          await fonts;
          if (disposed) return;
          exp = new m.Experience(canvas, { reduced, light, projects });
        })
        .catch((err) => {
          console.warn('[portfolio] WebGL scene unavailable, using static hero.', err);
          exp = null;
          fallback();
        })
    : (fallback(), fonts);

  Promise.all([typed, Promise.race([ready, wait(8000)])]).then(() => {
    if (disposed) return;
    ctx.add(() => start());
  });

  function start() {
    root.classList.remove('is-loading');
    root.classList.add('is-ready');
    lenis.start();
    ScrollTrigger.refresh();
    if (exp) master = buildMaster(exp, { reduced });

    if (loader) {
      gsap.to(loader, {
        autoAlpha: 0,
        duration: reduced ? 0.2 : 0.6,
        ease: 'power2.out',
        onComplete: () => loader.remove(),
      });
    }

    const introTl = exp ? exp.intro() : null;
    if (!reduced) {
      gsap.from('[data-hero-reveal]', {
        y: 48,
        autoAlpha: 0,
        duration: 1.1,
        stagger: 0.09,
        ease: 'power3.out',
        delay: introTl ? 1.05 : 0.3,
      });
      revealOnScroll();
    }
    sectionTriggers();
  }

  function revealOnScroll() {
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        y: 36,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
      });
    });
  }

  function sectionTriggers() {
    // projects → laptop screen + lit layers
    const cards = gsap.utils.toArray('[data-project]');
    const setActive = (i) => {
      cards.forEach((c, k) => c.classList.toggle('is-active', k === i));
      exp?.setProject(i);
    };
    cards.forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => setActive(i),
        onEnterBack: () => setActive(i),
      });
    });
    ScrollTrigger.create({
      trigger: '#projects',
      start: 'top 60%',
      end: 'bottom 40%',
      onLeave: () => setActive(-1),
      onLeaveBack: () => setActive(-1),
    });

    // experience → brain "learns" each release
    gsap.utils.toArray('[data-release]').forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 72%',
        onEnter: () => {
          el.classList.add('is-on');
          exp?.pulse();
        },
        onEnterBack: () => exp?.pulse(),
        onLeaveBack: () => el.classList.remove('is-on'),
      });
    });

    // big numbers count up once
    gsap.utils.toArray('[data-count]').forEach((el) => {
      const target = Number(el.dataset.count);
      if (reduced) return;
      const o = { v: 0 };
      el.textContent = '0';
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () =>
          gsap.to(o, {
            v: target,
            duration: 1.6,
            ease: 'power3.out',
            onUpdate: () => (el.textContent = String(Math.round(o.v))),
          }),
      });
    });

    // nav: mark current section
    gsap.utils.toArray('.site-nav a[href^="#"]').forEach((a) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      ScrollTrigger.create({
        trigger: target,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => (self.isActive ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')),
      });
    });
  }

  // ── resize: rebuild the master timeline with fresh measurements ──
  let lastW = window.innerWidth;
  let lastH = window.innerHeight;
  let rt;
  const onResize = () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === lastW && Math.abs(h - lastH) < 140) return;
      lastW = w;
      lastH = h;
      if (exp && master) {
        master.kill();
        ScrollTrigger.refresh();
        ctx.add(() => (master = buildMaster(exp, { reduced })));
      }
    }, 250);
  };
  window.addEventListener('resize', onResize);

  return () => {
    disposed = true;
    timers.forEach(clearTimeout);
    clearTimeout(rt);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('click', onClick);
    master?.kill();
    ctx.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
    gsap.ticker.remove(raf);
    lenis.destroy();
    exp?.dispose();
    exp = null;
  };
}
