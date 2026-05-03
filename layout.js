// Inject shared nav + footer into every page

function getNav() {
  return `
<nav class="nav" id="nav">
  <div class="nav__inner">
    <a href="index.html" class="nav__logo">
      <span class="nav__logo-name">The Synagogues JWC</span>
    </a>
    <ul class="nav__links">
      <li><a href="about.html">About</a></li>
      <li><a href="services.html">Services</a></li>
      <li><a href="events.html">Events</a></li>
      <li><a href="podcast.html">Podcast</a></li>
      <li><a href="contact.html">Contact</a></li>
      <li><a href="give.html" class="nav__give">Give</a></li>
      <li><a href="https://apostleglenmonama.com" target="_blank" rel="noopener" class="nav__apostle">Apostle's Website ↗</a></li>
    </ul>
    <div class="nav__cta">
      <a href="https://member.thesynagogues.com" target="_blank">Member Portal</a>
    </div>
    <button class="nav__burger" id="burger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
<div class="nav__mobile" id="mobileNav">
  <a href="about.html">About</a>
  <a href="services.html">Services</a>
  <a href="events.html">Events</a>
  <a href="podcast.html">Podcast</a>
  <a href="contact.html">Contact</a>
  <a href="give.html" class="nav__give">Give</a>
  <a href="https://apostleglenmonama.com" target="_blank" rel="noopener" class="nav__apostle">Apostle's Website ↗</a>
  <a href="https://member.thesynagogues.com" target="_blank" class="nav__campushub">Member Portal</a>
</div>`;
}

function getFooter() {
  return `
<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div>
        <div class="footer__brand-name">The Synagogues JWC</div>
        <div class="footer__brand-sub">Home of the Word</div>
        <p class="footer__brand-desc">
          A prophetic apostolic ministry rooted in the Word of God, committed to raising a generation of purpose-driven believers.
        </p>
      </div>
      <div>
        <p class="footer__heading">Navigate</p>
        <ul class="footer__links">
          <li><a href="about.html">About</a></li>
          <li><a href="services.html">Services</a></li>
          <li><a href="events.html">Events</a></li>
          <li><a href="podcast.html">Podcast</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="give.html">Give Online</a></li>
        </ul>
      </div>
      <div>
        <p class="footer__heading">Services</p>
        <ul class="footer__links">
          <li><a href="services.html#friday">Friday Night Prayer</a></li>
          <li><a href="services.html#sunday">Sunday Service</a></li>
          <li><a href="services.html#seventh">7th Week Sunday</a></li>
          <li><a href="events.html">Events Calendar</a></li>
        </ul>
      </div>
      <div>
        <p class="footer__heading">Connect</p>
        <ul class="footer__links">
          <li><a href="contact.html">Contact Us</a></li>
          <li><a href="give.html">Give Online</a></li>
          <li><a href="https://member.thesynagogues.com" target="_blank">Member Portal</a></li>
          <li><a href="https://apostleglenmonama.com" target="_blank">Apostle's Website ↗</a></li>
          <li><a href="podcast.html">Podcast</a></li>
        </ul>
        <div style="margin-top:20px">
          <p style="font-size:12px;color:rgba(255,255,255,0.3);margin-bottom:8px">HQ Address</p>
          <p style="font-size:13px;color:rgba(255,255,255,0.5);line-height:1.6">
            The Synagogues JWC<br>
            Langrand Road<br>
            Vereeniging, 1929
          </p>
        </div>
      </div>
    </div>
    <div class="footer__bottom">
      <p class="footer__copy">© ${new Date().getFullYear()} The Synagogues. All rights reserved.</p>
      <p class="footer__campushub">
        Member app powered by <a href="https://member.thesynagogues.com" target="_blank">Campus Hub</a>
      </p>
    </div>
  </div>
</footer>`;
}

// Inject into page
document.getElementById('nav-placeholder')?.insertAdjacentHTML('afterend', getNav());
document.getElementById('footer-placeholder')?.insertAdjacentHTML('beforebegin', getFooter());


// ── Animated number counter for stats ──────────────────────────────────────
function animateCounter(el, target, duration) {
  const start = performance.now();
  const isSymbol = isNaN(parseInt(target));
  if (isSymbol) return;
  const num = parseInt(target);
  const suffix = target.replace(/[0-9]/g, '');
  const update = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * num) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}

const statObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const numEl = e.target.querySelector('.stat__num');
      if (numEl && !numEl.dataset.animated) {
        numEl.dataset.animated = '1';
        animateCounter(numEl, numEl.textContent.trim(), 1200);
      }
      statObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat').forEach(el => statObserver.observe(el));

// ── Subtle parallax on hero ──────────────────────────────────────────────────
const heroVid = document.querySelector('.hero__video');
if (heroVid) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroVid.style.transform = `translateY(${y * 0.25}px)`;
    }
  }, { passive: true });
}

// ── Magnetic hover on primary buttons ──────────────────────────────────────
document.querySelectorAll('.btn--primary').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 8;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * 8;
    btn.style.transform = `translate(${x}px, ${y}px) translateY(-2px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});