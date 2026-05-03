// ─── Nav scroll behaviour ─────────────────────────────────────────────────
const nav = document.getElementById('nav');
const mobileNav = document.getElementById('mobileNav');
const burger = document.getElementById('burger');
let menuOpen = false;

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Trigger on load
if (window.scrollY > 40) nav.classList.add('scrolled');

// Burger menu
burger?.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileNav?.classList.toggle('open', menuOpen);
  const spans = burger.querySelectorAll('span');
  if (menuOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

// Close mobile nav on link click
mobileNav?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    menuOpen = false;
    mobileNav.classList.remove('open');
    burger?.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ─── Active nav link ──────────────────────────────────────────────────────
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    a.classList.add('active');
  }
});

// ─── Scroll reveal ────────────────────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => observer.observe(el));

// ─── Stagger children ─────────────────────────────────────────────────────
document.querySelectorAll('.stagger > *').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.1}s`;
  el.classList.add('reveal');
  observer.observe(el);
});
