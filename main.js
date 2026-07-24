// Portfolio interactions — reveal (C), parallax (B), micro (E) via GSAP.
// Graceful fallback: if GSAP is unavailable or reduced-motion, show everything.
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

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

  // ---------- fallback: no motion ----------
  if (reduce || !hasGSAP) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

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

  // ---------- B · parallax on photographic hero images only (not UI screenshots) ----------
  document.querySelectorAll('.bleed:not(.bleed--frame) img').forEach((img) => {
    gsap.set(img, { scale: 1.14 });
    gsap.fromTo(img, { yPercent: -7 }, {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: img.closest('.bleed'), start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  // ---------- E · hover zoom limited to YouTube-linked images (STAI, RAG) ----------
  // handled purely in CSS: .video-link:hover img { scale }

  // keep ScrollTrigger in sync after images/fonts load
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
