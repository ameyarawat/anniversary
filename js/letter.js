/* ============================================================
   LETTER.JS — Envelope open animation & letter reveal
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initLetter();
});

function initLetter() {
  const envelope = document.querySelector('.envelope');
  const letterPaper = document.querySelector('.letter-paper');

  if (!envelope || !letterPaper) return;

  let isOpened = false;

  envelope.addEventListener('click', () => {
    if (isOpened) return;
    isOpened = true;

    // Start flap opening animation
    envelope.classList.add('opening');

    // After flap opens, slide envelope away and reveal letter
    setTimeout(() => {
      envelope.classList.add('opened');
      letterPaper.classList.add('revealed');

      // Scroll smoothly to the beginning of the letter (accounting for fixed navbar)
      setTimeout(() => {
        const navHeight = 90; // Fixed navbar height (70px) + comfortable breathing margin
        const letterTop = letterPaper.getBoundingClientRect().top + window.pageYOffset;
        const targetScroll = Math.max(0, letterTop - navHeight);

        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }, 300);
    }, 700);
  });

  // Add floating heart decorations around the letter when revealed
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.classList.contains('revealed')) {
        addLetterDecorations();
        observer.disconnect();
      }
    });
  });

  observer.observe(letterPaper, { attributes: true, attributeFilter: ['class'] });
}

function addLetterDecorations() {
  const paper = document.querySelector('.letter-paper');
  if (!paper) return;

  // Add subtle corner hearts
  const positions = [
    { top: '10px', right: '15px' },
    { bottom: '10px', left: '15px' },
  ];

  positions.forEach((pos, i) => {
    const heart = document.createElement('span');
    heart.textContent = '💗';
    heart.style.cssText = `
      position: absolute;
      font-size: 1.2rem;
      opacity: 0;
      animation: fadeIn 0.5s ease-out ${i * 0.2 + 0.5}s forwards;
      pointer-events: none;
      ${Object.entries(pos).map(([k, v]) => `${k}: ${v}`).join('; ')}
    `;
    paper.appendChild(heart);
  });
}
