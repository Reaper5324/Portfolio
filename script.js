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
  window.addEventListener('pointermove', (event) => {
    document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
    document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
  }, { passive: true });

  document.querySelectorAll('.project').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty('--tilt-x', `${(0.5 - y) * 2.2}deg`);
      card.style.setProperty('--tilt-y', `${(x - 0.5) * 2.2}deg`);
      card.style.setProperty('--spot-x', `${x * 100}%`);
      card.style.setProperty('--spot-y', `${y * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}
