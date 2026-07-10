/* ── app.js — Portfolio interactivity ── */

// ── NAV: scroll effect ──
const navbar = document.getElementById('navbar');
const onScroll = () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── PARTICLES ──
(function spawnParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const count = 28;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1;
    const x = Math.random() * 100;
    const delay = Math.random() * 12;
    const duration = Math.random() * 14 + 10;
    const colors = ['#6366f1', '#818cf8', '#a78bfa', '#38bdf8'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    Object.assign(p.style, {
      width: `${size}px`,
      height: `${size}px`,
      left: `${x}%`,
      bottom: '-10px',
      background: color,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    });
    container.appendChild(p);
  }
})();

// ── REVEAL ON SCROLL ──
(function setupReveal() {
  const targets = [
    '.social-section .section-label',
    '.social-card',
    '.section-header',
    '.projects-filter',
    '.project-card',
    '.projects-cta',
    '.contact-cards',
    '.contact-card',
  ];
  targets.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.classList.add('reveal'));
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

// ── PROJECT FILTER ──
(function setupFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !match);
      });
    });
  });
})();

// ── SMOOTH NAV (mobile burger placeholder) ──
document.getElementById('nav-burger')?.addEventListener('click', () => {
  // Simple: toggle nav links visibility on mobile
  const links = document.querySelector('.nav-links');
  if (!links) return;
  const isOpen = links.style.display === 'flex';
  links.style.cssText = isOpen
    ? ''
    : 'display:flex;flex-direction:column;position:absolute;top:68px;left:0;right:0;background:rgba(7,11,20,0.97);backdrop-filter:blur(20px);padding:16px 24px;gap:4px;border-bottom:1px solid rgba(99,120,255,0.15);z-index:99;';
});
