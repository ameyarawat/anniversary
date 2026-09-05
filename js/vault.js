/* ============================================================
   VAULT.JS — Client-side AES-GCM Encrypted Private Memories
   Decryption engine for photos, videos, and personal texts.
   Zero plaintext PII stored in GitHub repository.
   ============================================================ */

const VAULT_STORAGE_KEY = 'anniversary_vault_passcode';
let cachedContent = null;
const decryptedObjectUrls = {};

document.addEventListener('DOMContentLoaded', () => {
  initVault();
});

async function initVault() {
  // 1. Check URL hash for passcode (e.g., #key=12082025 or #12082025)
  const hash = window.location.hash.replace('#', '');
  let passcode = null;
  if (hash.startsWith('key=') || hash.startsWith('code=')) {
    passcode = hash.split('=')[1];
  } else if (/^\d{8}$/.test(hash)) {
    passcode = hash;
  }

  // 2. Check sessionStorage
  if (!passcode) {
    passcode = sessionStorage.getItem(VAULT_STORAGE_KEY);
  }

  // 3. Inject unlock button into navbar
  injectUnlockUI();

  // 4. If passcode present, attempt auto-unlock
  if (passcode) {
    const success = await attemptUnlock(passcode, false);
    if (success) {
      sessionStorage.setItem(VAULT_STORAGE_KEY, passcode);
    }
  }
}

/* ===== CRYPTO ENGINE (AES-256-GCM via Web Crypto API) ===== */
async function decryptBuffer(encryptedBuffer, password) {
  const salt = encryptedBuffer.slice(0, 16);
  const iv = encryptedBuffer.slice(16, 28);
  const ciphertext = encryptedBuffer.slice(28);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  return await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    ciphertext
  );
}

/* ===== ATTEMPT UNLOCK ===== */
async function attemptUnlock(password, isUserTriggered = true) {
  try {
    const resp = await fetch('vault/content.enc');
    if (!resp.ok) return false;

    const arrayBuffer = await resp.arrayBuffer();
    const decryptedBytes = await decryptBuffer(arrayBuffer, password);
    const decryptedJson = new TextDecoder().decode(decryptedBytes);
    cachedContent = JSON.parse(decryptedJson);

    // Save valid passcode
    sessionStorage.setItem(VAULT_STORAGE_KEY, password);

    // Apply personal content to the page
    applyPersonalContent(cachedContent);

    // Load and decrypt media for current page
    loadPageDecryptedMedia(password);

    // Update unlock UI
    updateUnlockUI(true);

    if (isUserTriggered) {
      showUnlockCelebration();
    }
    return true;
  } catch (err) {
    console.warn('Vault decryption failed or incorrect passcode.');
    if (isUserTriggered) {
      showUnlockError();
    }
    return false;
  }
}

/* ===== APPLY PERSONAL TEXTS TO DOM ===== */
function applyPersonalContent(data) {
  // Brand name in navbar
  const brands = document.querySelectorAll('.nav-brand');
  brands.forEach(b => {
    b.innerHTML = `<span class="heart-icon">💗</span> ${data.brand_name || 'Forever & Always'}`;
  });

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Home page
  if (currentPage === '' || currentPage === 'index.html') {
    if (data.home_title) document.title = data.home_title;
    const nameEl = document.querySelector('.welcome-name');
    if (nameEl && data.home_name) nameEl.textContent = data.home_name;
    const greetingEl = document.querySelector('.welcome-greeting');
    if (greetingEl && data.home_greeting) greetingEl.innerHTML = data.home_greeting;
  }

  // Our Story page
  if (currentPage === 'our-story.html') {
    if (data.story_title) document.title = data.story_title;
    const subtitle = document.querySelector('.page-header .subtitle');
    if (subtitle && data.story_subtitle) subtitle.textContent = data.story_subtitle;

    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length >= 7) {
      // Milestone 1
      if (data.m1_date) timelineItems[0].querySelector('.timeline-date').textContent = data.m1_date;
      if (data.m1_caption) timelineItems[0].querySelector('.timeline-caption').textContent = data.m1_caption;
      // Milestone 2
      if (data.m2_caption) timelineItems[1].querySelector('.timeline-caption').textContent = data.m2_caption;
      // Milestone 3
      if (data.m3_caption) timelineItems[2].querySelector('.timeline-caption').textContent = data.m3_caption;
      // Milestone 4
      if (data.m4_date) timelineItems[3].querySelector('.timeline-date').textContent = data.m4_date;
      if (data.m4_caption) timelineItems[3].querySelector('.timeline-caption').textContent = data.m4_caption;
      // Milestone 5
      if (data.m5_date) timelineItems[4].querySelector('.timeline-date').textContent = data.m5_date;
      if (data.m5_caption) timelineItems[4].querySelector('.timeline-caption').textContent = data.m5_caption;
      // Milestone 6
      if (data.m6_date) timelineItems[5].querySelector('.timeline-date').textContent = data.m6_date;
      if (data.m6_title) timelineItems[5].querySelector('.timeline-title').textContent = data.m6_title;
      if (data.m6_caption) timelineItems[5].querySelector('.timeline-caption').textContent = data.m6_caption;
      // Milestone 7
      if (data.m7_date) timelineItems[6].querySelector('.timeline-date').textContent = data.m7_date;
      if (data.m7_caption) timelineItems[6].querySelector('.timeline-caption').textContent = data.m7_caption;
    }
  }

  // Gallery page
  if (currentPage === 'gallery.html') {
    if (data.gallery_title) document.title = data.gallery_title;
    const videoFrames = document.querySelectorAll('.video-frame');
    if (videoFrames.length >= 2 && data.gallery_video2_caption) {
      const cap2 = videoFrames[1].querySelector('.video-caption');
      if (cap2) cap2.textContent = data.gallery_video2_caption;
    }
  }

  // Letter page
  if (currentPage === 'letter.html') {
    if (data.letter_title) document.title = data.letter_title;
    const head = document.querySelector('.letter-header');
    if (head && data.letter_header) head.textContent = data.letter_header;
    const body = document.querySelector('.letter-body');
    if (body && data.letter_body) body.innerHTML = data.letter_body;
    const closing = document.querySelector('.letter-closing');
    if (closing && data.letter_closing) closing.textContent = data.letter_closing;
    const videoCap = document.querySelector('.letter-video-container .video-caption');
    if (videoCap && data.letter_video_caption) videoCap.textContent = data.letter_video_caption;
  }

  // Cute Notes page
  if (currentPage === 'cute-notes.html') {
    if (data.notes_title) document.title = data.notes_title;
    const note11 = document.querySelector('#note-11 .note-text');
    if (note11 && data.note_11_text) note11.textContent = data.note_11_text;
  }

  // Closing page
  if (currentPage === 'closing.html') {
    if (data.closing_title) document.title = data.closing_title;
    const msgHead = document.querySelector('.closing-message h2');
    if (msgHead && data.closing_heading) msgHead.textContent = data.closing_heading;
    const sig = document.querySelector('.final-heart-container p:last-child');
    if (sig && data.closing_signature) sig.textContent = data.closing_signature;
  }
}

/* ===== LOAD & DECRYPT MEDIA ===== */
async function loadPageDecryptedMedia(password) {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // 1. Photos for Gallery & Collage
  // Preload and decrypt photos (1-18)
  for (let i = 1; i <= 18; i++) {
    decryptMediaFile(`vault/photo-${String(i).padStart(2, '0')}.enc`, password, 'image/jpeg', (url) => {
      // Update gallery card data-img
      const card = document.querySelector(`.gallery-card[data-img*="memory-${String(i).padStart(2, '0')}"]`);
      if (card) {
        card.setAttribute('data-img', url);
        const backImg = card.querySelector('.gallery-flip-back img');
        if (backImg) backImg.src = url;
      }

      // Update background collage
      const collageImgs = document.querySelectorAll(`.photo-collage-bg img[src*="memory-${String(i).padStart(2, '0')}"]`);
      collageImgs.forEach(img => {
        img.src = url;
      });
    });
  }

  // 2. Videos for Gallery
  if (currentPage === 'gallery.html') {
    const videoFrames = document.querySelectorAll('.video-frame-border');
    if (videoFrames.length >= 2) {
      // Video 1
      decryptMediaFile('vault/video-gallery-1.enc', password, 'video/mp4', (url) => {
        replacePlaceholderWithVideo(videoFrames[0], url);
      });
      // Video 2
      decryptMediaFile('vault/video-gallery-2.enc', password, 'video/mp4', (url) => {
        replacePlaceholderWithVideo(videoFrames[1], url);
      });
    }
  }

  // 3. Video for Letter
  if (currentPage === 'letter.html') {
    const letterVideoFrame = document.querySelector('.letter-video-container .video-frame-border');
    if (letterVideoFrame) {
      decryptMediaFile('vault/video-letter.enc', password, 'video/mp4', (url) => {
        replacePlaceholderWithVideo(letterVideoFrame, url);
      });
    }
  }
}

function replacePlaceholderWithVideo(container, videoBlobUrl) {
  const existingImg = container.querySelector('img');
  if (!existingImg) return;

  const video = document.createElement('video');
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.src = videoBlobUrl;
  video.style.cssText = 'width: 100%; display: block; border-radius: var(--radius-md); object-fit: contain; background: linear-gradient(135deg, var(--bg-mid), var(--bg-end));';

  existingImg.replaceWith(video);

  // Trigger main.js video audio controller if available
  if (window.initVideoAudioController) {
    window.initVideoAudioController();
  }
}

async function decryptMediaFile(path, password, mimeType, onReady) {
  if (decryptedObjectUrls[path]) {
    onReady(decryptedObjectUrls[path]);
    return;
  }

  try {
    const resp = await fetch(path);
    if (!resp.ok) return;
    const arrayBuffer = await resp.arrayBuffer();
    const decryptedBytes = await decryptBuffer(arrayBuffer, password);
    const blob = new Blob([decryptedBytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    decryptedObjectUrls[path] = url;
    onReady(url);
  } catch (err) {
    console.error(`Failed to decrypt ${path}:`, err);
  }
}

/* ===== UNLOCK UI (MODAL & BADGE) ===== */
function injectUnlockUI() {
  // Floating / Navbar Unlock Button
  const navLinks = document.querySelector('.nav-links');
  const unlockBtn = document.createElement('li');
  unlockBtn.className = 'vault-nav-item';
  unlockBtn.innerHTML = `
    <button id="vault-unlock-btn" class="vault-unlock-trigger" title="Unlock our private memories" aria-label="Unlock Private Memories">
      🔒 <span class="vault-btn-text">Unlock</span>
    </button>
  `;
  if (navLinks) {
    navLinks.appendChild(unlockBtn);
  }

  // Modal HTML
  const modal = document.createElement('div');
  modal.id = 'vault-modal';
  modal.className = 'vault-modal';
  modal.innerHTML = `
    <div class="vault-modal-backdrop"></div>
    <div class="vault-modal-card">
      <button class="vault-modal-close" aria-label="Close modal">✕</button>
      <div class="vault-modal-icon">🔐💗</div>
      <h3>Our Secret Key</h3>
      <p>Enter our special anniversary date to unlock our private photos, videos & memories 💕</p>
      <form id="vault-form">
        <input type="password" id="vault-passcode-input" placeholder="e.g. DDMMYYYY" autocomplete="off" required>
        <button type="submit" class="vault-submit-btn">Unlock Memories 💖</button>
      </form>
      <p id="vault-error" class="vault-error-msg" style="display: none;">That's not our special date! Try again 🥹💗</p>
    </div>
  `;
  document.body.appendChild(modal);

  // Event Listeners
  const trigger = document.getElementById('vault-unlock-btn');
  const closeBtn = modal.querySelector('.vault-modal-close');
  const backdrop = modal.querySelector('.vault-modal-backdrop');
  const form = document.getElementById('vault-form');
  const input = document.getElementById('vault-passcode-input');

  const openModal = () => {
    modal.classList.add('active');
    input.value = '';
    input.focus();
  };

  const closeModal = () => {
    modal.classList.remove('active');
  };

  if (trigger) trigger.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;

      const submitBtn = form.querySelector('.vault-submit-btn');
      submitBtn.textContent = 'Unlocking... 🌸';
      submitBtn.disabled = true;

      const ok = await attemptUnlock(val, true);
      submitBtn.textContent = 'Unlock Memories 💖';
      submitBtn.disabled = false;

      if (ok) {
        closeModal();
      }
    });
  }
}

function updateUnlockUI(isUnlocked) {
  const trigger = document.getElementById('vault-unlock-btn');
  if (trigger && isUnlocked) {
    trigger.innerHTML = `🔓 <span class="vault-btn-text">Unlocked</span>`;
    trigger.classList.add('unlocked');
    trigger.title = 'Private memories unlocked 💗';
  }
}

function showUnlockError() {
  const errMsg = document.getElementById('vault-error');
  const card = document.querySelector('.vault-modal-card');
  if (errMsg) errMsg.style.display = 'block';
  if (card) {
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 600);
  }
}

function showUnlockCelebration() {
  // Trigger heart burst
  const container = document.querySelector('.floating-hearts') || document.body;
  for (let i = 0; i < 25; i++) {
    const heart = document.createElement('span');
    heart.textContent = ['💖', '💗', '💕', '💍', '✨'][Math.floor(Math.random() * 5)];
    heart.style.cssText = `
      position: fixed;
      left: ${window.innerWidth / 2 + (Math.random() - 0.5) * 200}px;
      top: ${window.innerHeight / 2 + (Math.random() - 0.5) * 200}px;
      font-size: ${Math.random() * 24 + 16}px;
      pointer-events: none;
      z-index: 99999;
      animation: vaultBurst 1.5s ease-out forwards;
    `;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1500);
  }
}
