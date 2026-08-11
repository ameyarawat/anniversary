/* ============================================================
   NOTES.JS — Flip card interactions
   Click to flip, click outside to flip back
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initFlipCards();
});

function initFlipCards() {
  const flipCards = document.querySelectorAll('.flip-card');

  flipCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();

      // Close all other cards first
      flipCards.forEach(other => {
        if (other !== card) other.classList.remove('flipped');
      });

      // Toggle this card
      card.classList.toggle('flipped');
    });

    // Keyboard support
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Click to flip this note card');

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();

        flipCards.forEach(other => {
          if (other !== card) other.classList.remove('flipped');
        });
        card.classList.toggle('flipped');
      }
    });
  });

  // Click anywhere outside a card to close all
  document.addEventListener('click', () => {
    flipCards.forEach(card => card.classList.remove('flipped'));
  });
}
