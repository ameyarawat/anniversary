/* ============================================================
   GALLERY.JS — Flip-card style gallery
   Cards show text on front, photo on back.
   Click card to flip and reveal photo.
   Click outside or another card to flip back.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initGalleryFlipCards();
});

function initGalleryFlipCards() {
  const cards = document.querySelectorAll('.gallery-card[data-img]');
  if (cards.length === 0) return;

  cards.forEach(card => {
    const imgSrc = card.getAttribute('data-img');
    const caption = card.getAttribute('data-caption') || '';
    const originalContent = card.innerHTML;

    // Rebuild card as a flip card
    card.classList.add('gallery-flip');
    card.innerHTML = `
      <div class="gallery-flip-inner">
        <div class="gallery-flip-front">${originalContent}</div>
        <div class="gallery-flip-back">
          <img src="${imgSrc}" alt="${caption}" loading="lazy">
          <p class="gallery-flip-caption">${caption}</p>
        </div>
      </div>
    `;

    // Click to flip this card (and close others)
    card.addEventListener('click', (e) => {
      e.stopPropagation();

      // Close all other cards
      cards.forEach(other => {
        if (other !== card) other.classList.remove('flipped');
      });

      // Toggle this card
      card.classList.toggle('flipped');
    });
  });

  // Click anywhere outside a card to close all
  document.addEventListener('click', () => {
    cards.forEach(card => card.classList.remove('flipped'));
  });
}
