import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initialState } from '../three/Experience.js';

/**
 * ONE master scroll-scrubbed timeline for the stack, laptop, brain and logos.
 * Timeline time is measured in viewport heights: 1 unit = 100vh of scroll,
 * so every keyframe is placed at the scroll position of a real DOM section.
 * Rule: the 3D object always sits on the opposite side of the text.
 */
export function buildMaster(exp, { reduced }) {
  const vh = window.innerHeight;
  const { hw, hh, mobile } = exp.layout;
  const S = exp.state;
  const scrollY = window.scrollY;
  const total = Math.max(1, (document.documentElement.scrollHeight - vh) / vh);

  const sec = (id) => {
    const el = document.getElementById(id);
    const top = el.getBoundingClientRect().top + scrollY;
    return { s: top / vh, e: (top + el.offsetHeight) / vh - 1, el };
  };
  const H = sec('hero');
  const A = sec('about');
  const Y = sec('layers');
  const T = sec('stack');
  const P = sec('projects');
  const E = sec('experience');
  const C = sec('achievements');
  const N = sec('contact');

  const R = mobile ? 0 : Math.min(hw * 0.46, hw - 2);
  const Lx = -R;
  const dim = mobile ? 0.28 : 1; // on mobile the 3D stays soft behind text
  const off = -hw * 1.7;

  // ── poses ───────────────────────────────────────────────
  const side = (x, o = {}) =>
    mobile
      ? { stackX: 0, stackY: 1.25, stackS: 0.42, lapX: 0, lapY: -0.35, lapS: 0.55, stackOp: dim, lapOp: dim, ...o.m }
      : { stackX: x, stackY: 1.2, stackS: 0.55, lapX: x, lapY: -1.05, lapS: 0.82, stackOp: 1, lapOp: 1, ...o.d };

  const hero = mobile
    ? { stackX: 0, stackY: 1.85, stackS: 0.36, lapX: 0, lapY: 0.72, lapS: 0.5, lapRotY: -0.5 }
    : { stackX: R, stackY: 1.2, stackS: 0.55, lapX: R, lapY: -1.05, lapS: 0.82, lapRotY: -0.5 };

  Object.assign(S, initialState(), hero, {
    brainX: mobile ? 0 : hw * 0.3,
    brainY: mobile ? 0.2 : -0.1,
    brainS: mobile ? 0.5 : reduced ? 1 : 0.6,
    brainRotY: reduced ? 0.2 : -0.5,
  });

  const tl = gsap.timeline({ paused: true });
  const at = (t) => Math.min(Math.max(0, t), total);
  const to = (vars, start, dur, ease = 'power2.inOut') => {
    tl.to(S, { ...vars, duration: Math.max(0.01, dur), ease }, at(start));
  };

  // backdrop name drifts sideways across the whole page
  tl.fromTo('.backdrop-name', { xPercent: 0 }, { xPercent: -32, ease: 'none', duration: total }, 0);
  if (!reduced) tl.fromTo(S, { scroll: 0 }, { scroll: total, ease: 'none', duration: total }, 0);
  void H;

  // ── 3 · About: objects move left, text right ───────────
  to({ ...side(Lx), lapRotY: 0.5 }, A.s - 0.85, 0.8);

  // ── 4 · Exploded stack (sticky ~300vh) ─────────────────
  to(
    mobile
      ? { stackX: 0, stackY: 1.35, stackS: 0.58, stackOp: 1, lapY: -hh * 2.6 }
      : { stackX: hw * 0.27, stackY: -0.1, stackS: 1.0, stackOp: 1, lapY: -hh * 2.6 },
    Y.s - 0.9,
    0.9
  );
  if (!reduced) to({ stackSpin: Math.PI * 2 }, Y.s + 0.05, Y.e - Y.s - 0.15, 'power1.inOut');
  to({ explode: 1 }, Y.s + 0.05, 0.45);
  to({ explode: 0 }, Y.e - 0.55, 0.45);

  const labels = gsap.utils.toArray('[data-layer-label]');
  gsap.set(labels, { clearProps: 'all' });
  labels.forEach((el, i) => {
    const start = Y.s + 0.4 + i * 0.7;
    tl.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' }, at(start));
    to({ [`glow${i}`]: 0.9 }, start, 0.2, 'power2.out');
    to({ [`glow${i}`]: 0 }, i < 2 ? start + 0.7 : Y.e - 0.55, 0.25);
    el.classList.toggle('is-last', i === labels.length - 1);
  });
  tl.to(labels, { autoAlpha: 0, y: -24, duration: 0.25, stagger: 0.04, ease: 'power2.in' }, at(Y.e - 0.4));

  // ── 5 · Tech stack: slabs merged, laptop back, objects left; logos fly through ──
  to({ ...side(Lx, { d: { stackY: 1.15, stackS: 0.5, lapY: -0.95, lapS: 0.75 } }), lapRotY: 0.45 }, Y.e, 0.95);
  to({ logoFade: 1 }, T.s - 0.4, 0.3, 'none');
  to({ logoP: 1 }, T.s - 0.3, Math.max(0.6, T.e - T.s - 0.15), 'none');
  to({ logoFade: 0 }, T.e - 0.05, 0.6, 'power1.in');

  // ── 6 · Projects: laptop swings, lid opens wider ───────
  to(
    mobile
      ? { stackY: 1.75, stackS: 0.34, lapY: 0.35, lapS: 0.62, lapRotY: reduced ? 0 : -1.2 }
      : { stackX: Lx, stackY: 1.75, stackS: 0.42, lapX: Lx, lapY: -0.4, lapS: 1.0, lapRotY: reduced ? 0.2 : -1.2, lapRotX: 0.3 },
    P.s - 0.9,
    0.85
  );
  if (!reduced) {
    const mid = (P.s + P.e) / 2;
    to({ lapRotY: 0.15, lapRotX: 0.42, lid: 1.22 }, P.s, mid - P.s, 'sine.inOut');
    to({ lapRotY: -0.5, lapRotX: 0.3, lid: 1 }, mid, P.e - mid, 'sine.inOut');
  }

  // ── 7 · Experience: stack + laptop slide off, brain fades in ──
  to({ stackX: off, lapX: off, stackOp: 0, lapOp: 0 }, E.s - 0.9, 0.8, 'power2.in');
  to({ brainOp: mobile ? 0.38 : 0.5 }, E.s - 0.7, 0.8, 'power1.out');
  if (!reduced) {
    to(
      { brainS: mobile ? 0.85 : 1.3, brainRotY: 0.5, brainRotX: -0.08 },
      E.s - 0.7,
      Math.max(0.5, E.e - E.s + 1.1),
      'none'
    );
  }
  to({ brainOp: 0 }, E.e, 0.7, 'power1.in');

  // ── 8 · Achievements: stack + laptop return on the left ──
  to(
    {
      ...side(Lx, { d: { stackY: 1.15, stackS: 0.5, lapY: -0.95, lapS: 0.78 } }),
      lapRotY: reduced ? 0.2 : 0.45,
      lapRotX: 0.32,
    },
    E.e + 0.05,
    0.9,
    'power3.out'
  );

  // ── 9 · Contact ─────────────────────────────────────────
  to(
    {
      ...side(Lx, { d: { stackY: 1.2, stackS: 0.6, lapY: -1.0, lapS: 0.85 } }),
      lapRotY: reduced ? 0.2 : 0.35,
      ...(reduced ? {} : { stackSpin: Math.PI * 2.5 }),
    },
    N.s - 0.9,
    0.85
  );

  tl.set({}, {}, total); // pad duration so time === scroll / vh

  // record every tween's start values once, then rewind
  tl.progress(1).progress(0);

  const st = ScrollTrigger.create({
    trigger: document.documentElement,
    start: 0,
    end: 'max',
    scrub: reduced ? true : 0.9,
    animation: tl,
  });
  tl.progress(st.progress);

  return {
    tl,
    kill() {
      st.kill();
      tl.kill();
      gsap.set(labels, { clearProps: 'all' });
    },
  };
}
