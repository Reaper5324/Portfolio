const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const progress = document.querySelector('.scroll-progress span');
let scrollTicking = false;
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  scrollTicking = false;
};
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(updateProgress);
    scrollTicking = true;
  }
}, { passive: true });

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const previews = document.querySelectorAll('.live-preview');
const activatePreview = (preview) => {
  const frame = preview.querySelector('iframe[data-src]');
  if (!frame) return;
  frame.src = frame.dataset.src;
  frame.removeAttribute('data-src');
};
if ('IntersectionObserver' in window) {
  const previewLoader = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activatePreview(entry.target);
        currentObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '300px 0px' });
  previews.forEach((preview) => previewLoader.observe(preview));
} else {
  previews.forEach(activatePreview);
}
const scalePreview = (preview) => {
  const frame = preview.querySelector('iframe');
  if (!frame) return;
  const scale = Math.min(preview.clientWidth / 1200, preview.clientHeight / 740);
  frame.style.setProperty('--preview-scale', `${scale}`);
  frame.style.height = `${preview.clientHeight / scale}px`;
};
if ('ResizeObserver' in window) {
  const previewObserver = new ResizeObserver((entries) => entries.forEach((entry) => scalePreview(entry.target)));
  previews.forEach((preview) => previewObserver.observe(preview));
} else {
  previews.forEach(scalePreview);
  window.addEventListener('resize', () => previews.forEach(scalePreview), { passive: true });
}

const revealItems = document.querySelectorAll('.section-heading, .project, .manifesto-inner, .package, .addons, .about-image, .about-copy, .contact-inner');
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealItems.forEach((item) => {
    item.classList.add('reveal');
    observer.observe(item);
  });
}

const finePointer = window.matchMedia('(pointer: fine)').matches;
if (finePointer && !reducedMotion) {
  let pointerFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX - window.innerWidth * 0.6;
    pointerY = event.clientY - window.innerHeight * 0.25;
    if (!pointerFrame) pointerFrame = window.requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--orb-x', `${pointerX}px`);
      document.documentElement.style.setProperty('--orb-y', `${pointerY}px`);
      pointerFrame = 0;
    });
  }, { passive: true });

  document.querySelectorAll('.project').forEach((card) => {
    let cardFrame = 0;
    let tiltX = 0;
    let tiltY = 0;
    let spotX = 50;
    let spotY = 50;
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      tiltX = (0.5 - y) * 2.2;
      tiltY = (x - 0.5) * 2.2;
      spotX = x * 100;
      spotY = y * 100;
      if (!cardFrame) cardFrame = window.requestAnimationFrame(() => {
        card.style.setProperty('--tilt-x', `${tiltX}deg`);
        card.style.setProperty('--tilt-y', `${tiltY}deg`);
        card.style.setProperty('--spot-x', `${spotX}%`);
        card.style.setProperty('--spot-y', `${spotY}%`);
        cardFrame = 0;
      });
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}
