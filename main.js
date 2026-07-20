// Scroll-reveal with IntersectionObserver + staggered hero load
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('.reveal');

  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // stagger siblings that share a parent group
          const sibs = Array.from(el.parentElement.querySelectorAll(':scope > .reveal'));
          const idx = sibs.indexOf(el);
          el.style.transitionDelay = (idx > 0 ? Math.min(idx, 5) * 80 : 0) + 'ms';
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  items.forEach((el) => io.observe(el));

  // hero staggers immediately on load
  window.addEventListener('load', () => {
    document.querySelectorAll('.hero .reveal').forEach((el, i) => {
      el.style.transitionDelay = i * 110 + 'ms';
      el.classList.add('in');
    });
  });

  // scroll-aware nav: solid bg past hero, hide on scroll-down / show on scroll-up
  const nav = document.querySelector('.nav');
  let lastY = window.scrollY;
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const past = y > window.innerHeight * 0.75;
    nav.classList.toggle('nav--solid', past);
    if (past && y > lastY + 6) nav.classList.add('nav--hidden');
    else if (y < lastY - 6 || y < window.innerHeight * 0.75) nav.classList.remove('nav--hidden');
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
})();
