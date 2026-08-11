/* ============================================================
   CLOSING.JS — Days counter & heart burst animation
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCounter();
  initHeartBurst();
});

/* ===== DAYS TOGETHER COUNTER ===== */
function initCounter() {
  const startDate = new Date('2025-08-12T00:00:00');

  function updateCounter() {
    const now = new Date();
    const diff = now - startDate;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const daysEl = document.getElementById('counter-days');
    const hoursEl = document.getElementById('counter-hours');
    const minutesEl = document.getElementById('counter-minutes');
    const secondsEl = document.getElementById('counter-seconds');

    if (daysEl) daysEl.textContent = days;
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  // Update immediately and then every second
  updateCounter();
  setInterval(updateCounter, 1000);
}

/* ===== HEART BURST ANIMATION ===== */
function initHeartBurst() {
  const container = document.querySelector('.heart-burst');
  if (!container) return;

  // Create initial burst
  setTimeout(() => {
    createHeartBurst(container, 20);
  }, 1000);

  // Create periodic bursts
  setInterval(() => {
    createHeartBurst(container, 8);
  }, 6000);
}

function createHeartBurst(container, count) {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const hearts = ['❤️', '💗', '💕', '💖', '💓', '♥️', '🩷'];

  for (let i = 0; i < count; i++) {
    const heart = document.createElement('span');
    heart.classList.add('burst-heart');
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];

    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const distance = 150 + Math.random() * 250;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 100;
    const rot = (Math.random() - 0.5) * 120;

    heart.style.cssText = `
      left: ${centerX}px;
      top: ${centerY}px;
      font-size: ${0.8 + Math.random() * 1.2}rem;
      --tx: ${tx}px;
      --ty: ${ty}px;
      --rot: ${rot}deg;
      animation-delay: ${i * 0.05}s;
    `;

    container.appendChild(heart);

    // Clean up after animation
    setTimeout(() => {
      if (heart.parentNode) heart.remove();
    }, 3500);
  }
}
