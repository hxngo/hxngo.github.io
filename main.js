// Portfolio interactions — reveal (C), parallax (B), micro (E) via GSAP.
// Graceful fallback: if GSAP is unavailable or reduced-motion, show everything.
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  // ---------- scroll progress bar (fills as you scroll) ----------
  const prog = document.getElementById('scrollProgress');
  if (prog) {
    let pTick = false;
    const updateProg = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
      pTick = false;
    };
    window.addEventListener('scroll', () => {
      if (!pTick) { requestAnimationFrame(updateProg); pTick = true; }
    }, { passive: true });
    window.addEventListener('resize', updateProg, { passive: true });
    window.addEventListener('load', updateProg);
    updateProg();
  }

  // ---------- scroll-aware nav (always on, native scroll) ----------
  const nav = document.querySelector('.nav');
  if (nav) {
    let lastY = window.scrollY, ticking = false;
    function onScroll() {
      const y = window.scrollY;
      const past = y > window.innerHeight * 0.75;
      nav.classList.toggle('nav--solid', past);
      if (past && y > lastY + 6) nav.classList.add('nav--hidden');
      else if (y < lastY - 6 || y < window.innerHeight * 0.75) nav.classList.remove('nav--hidden');
      lastY = y; ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
  }

  // ---------- D · drip fitting before/after slider (works without GSAP) ----------
  (function () {
    const ba = document.getElementById('fitBA');
    if (!ba) return;
    const before = document.getElementById('fitBefore');
    const line = document.getElementById('fitLine');
    const knob = document.getElementById('fitKnob');
    function set(clientX) {
      const r = ba.getBoundingClientRect();
      let p = (clientX - r.left) / r.width;
      p = Math.max(0, Math.min(1, p));
      const pct = (p * 100) + '%';
      before.style.width = pct; line.style.left = pct; knob.style.left = pct;
    }
    let down = false;
    ba.addEventListener('pointerdown', (e) => { down = true; set(e.clientX); ba.setPointerCapture(e.pointerId); });
    ba.addEventListener('pointermove', (e) => { if (down) set(e.clientX); });
    window.addEventListener('pointerup', () => { down = false; });
    // gentle hint on first view (needs GSAP; harmless if absent)
    if (hasGSAP) {
      ScrollTrigger.create({ trigger: ba, start: 'top 78%', once: true, onEnter: () => {
        const o = { v: 62 };
        gsap.to(o, { v: 42, duration: 1.15, ease: 'power2.inOut', onUpdate: () => {
          const w = o.v + '%'; before.style.width = w; line.style.left = w; knob.style.left = w;
        }});
      }});
    }
  })();

  // ---------- fallback: no motion ----------
  if (reduce || !hasGSAP) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    return;
  }

  // ---------- C · reveal (fade-up) for generic .reveal, batched ----------
  gsap.set('.reveal', { opacity: 0, y: 22 });
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    onEnter: (els) => gsap.to(els, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true
    }),
  });
  // hero reveals fire on load (above the fold)
  window.addEventListener('load', () => {
    gsap.to('.hero .reveal', { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.11, delay: 0.15 });
  });

  // ---------- C · hero title line-mask rise (preserves line breaks) ----------
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    heroTitle.querySelectorAll('span').forEach((sp) => {
      sp.classList.remove('reveal'); sp.style.opacity = 1; sp.style.transform = 'none';
      sp.classList.add('line-mask');
      const inner = document.createElement('span');
      inner.className = 'line-inner';
      inner.innerHTML = sp.innerHTML;
      sp.innerHTML = '';
      sp.appendChild(inner);
    });
    gsap.set('.hero__title .line-inner', { yPercent: 115 });
    gsap.to('.hero__title .line-inner', { yPercent: 0, duration: 0.95, ease: 'power4.out', stagger: 0.09, delay: 0.25 });
  }
  // contact title: handled by the generic .reveal fade-up

  // ---------- B · parallax removed — drip hero has edge content that must not crop ----------

  // ---------- E · hover zoom limited to YouTube-linked images (STAI, RAG) ----------
  // handled purely in CSS: .video-link:hover img { scale }

  // keep ScrollTrigger in sync after images/fonts load
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
