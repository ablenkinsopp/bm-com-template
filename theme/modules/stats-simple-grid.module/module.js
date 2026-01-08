document.addEventListener('DOMContentLoaded', () => {
  const duration = 1500;
  const easeOutQuad = t => t * (2 - t);

  const animateNumber = el => {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const animate = el.dataset.animate === 'true';

    // If animation is off, just snap to final value once

    const start = 0;
    const startTime = performance.now();

    const step = now => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuad(progress);
      const value = start + (target - start) * eased;
      el.textContent = value.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio === 1) {
          animateNumber(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { root: null, threshold: 1 }
  );

  document.querySelectorAll('.stat-number').forEach(el => {
    observer.observe(el);
  });
});
