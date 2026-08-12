/* ============================================================
   MAIN.JS — Shared functionality across all pages
   Navigation, floating hearts, scroll effects
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initFloatingHearts();
  initScrollEffects();
  setActiveNavLink();
  initCustomCursor();
  initCursorParticles();
  initCollageSpotlight();
  initHeartWebCanvas();
  initVideoAudioController();
});

/* ===== NAVIGATION ===== */
function initNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });
  }
}

/* ===== ACTIVE NAV LINK ===== */
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ===== FLOATING HEARTS ===== */
function initFloatingHearts() {
  const container = document.querySelector('.floating-hearts');
  if (!container) return;

  // Create initial hearts
  for (let i = 0; i < 18; i++) {
    createFloatingHeart(container, i * 1.2);
  }

  // Continuously add new hearts
  setInterval(() => {
    if (container.children.length < 25) {
      createFloatingHeart(container, 0);
    }
  }, 3000);
}

function createFloatingHeart(container, delay) {
  const heart = document.createElement('span');
  heart.classList.add('floating-heart');

  const size = Math.random() * 18 + 10; // 10-28px
  const left = Math.random() * 100; // 0-100%
  const duration = Math.random() * 12 + 8; // 8-20s
  const drift = (Math.random() - 0.5) * 80; // -40 to 40px
  const rotation = (Math.random() - 0.5) * 90; // random rotation

  heart.style.cssText = `
    left: ${left}%;
    font-size: ${size}px;
    animation-duration: ${duration}s;
    animation-delay: ${delay}s;
    --drift: ${drift}px;
    --rotation: ${rotation}deg;
  `;

  container.appendChild(heart);

  // Remove after animation to prevent DOM bloat
  setTimeout(() => {
    if (heart.parentNode) {
      heart.remove();
    }
  }, (duration + delay) * 1000);
}

/* ===== SCROLL EFFECTS ===== */
function initScrollEffects() {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Don't unobserve to allow re-animation if needed
      }
    });
  }, observerOptions);

  // Observe timeline items and other animatable elements
  document.querySelectorAll('.timeline-item, .animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

/* ===== UTILITY: Page transition effect ===== */
function navigateWithTransition(url) {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.3s ease';
  setTimeout(() => {
    window.location.href = url;
  }, 300);
}

// Fade in on page load
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});

/* ===== CUSTOM KISS EMOJI CURSOR ===== */
function initCustomCursor() {
  // Skip on touch devices
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  // Create cursor element
  const cursor = document.createElement('div');
  cursor.classList.add('custom-cursor');
  cursor.textContent = '😘';
  document.body.appendChild(cursor);

  // Create ambient glow
  const glow = document.createElement('div');
  glow.classList.add('cursor-glow');
  document.body.appendChild(glow);

  let cursorX = -100, cursorY = -100;
  let currentX = -100, currentY = -100;
  let rafId = null;

  // Smooth cursor following with requestAnimationFrame
  function updateCursor() {
    // Lerp for silky smooth movement
    currentX += (cursorX - currentX) * 0.25;
    currentY += (cursorY - currentY) * 0.25;

    cursor.style.left = currentX + 'px';
    cursor.style.top = currentY + 'px';
    glow.style.left = currentX + 'px';
    glow.style.top = currentY + 'px';

    rafId = requestAnimationFrame(updateCursor);
  }
  rafId = requestAnimationFrame(updateCursor);

  // Track mouse position
  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
  }, { passive: true });

  // Click animation
  document.addEventListener('mousedown', () => {
    cursor.classList.add('clicking');
  });
  document.addEventListener('mouseup', () => {
    cursor.classList.remove('clicking');
  });

  // Hide when mouse leaves window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    glow.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    glow.style.opacity = '1';
  });
}

/* ===== INTERACTIVE CURSOR HEART PARTICLES ===== */
function initCursorParticles() {
  // Skip on touch devices
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  const hearts = ['♥', '❤', '💗', '💕', '♡', '🩷', '💖'];
  const colors = [
    '#e91e63', '#f48fb1', '#f06292', '#ec407a',
    '#f8bbd0', '#fce4ec', '#d4a5d0', '#e8a0bf'
  ];

  let lastSpawn = 0;
  let particleCount = 0;
  const MAX_PARTICLES = 14;
  const SPAWN_INTERVAL = 90; // ms between particles

  // Track mouse velocity for directional drift
  let lastX = 0, lastY = 0;

  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSpawn < SPAWN_INTERVAL) return;
    if (particleCount >= MAX_PARTICLES) return;

    lastSpawn = now;

    // Calculate velocity for directional particles
    const vx = e.clientX - lastX;
    const vy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    // Skip if barely moving
    if (Math.abs(vx) < 2 && Math.abs(vy) < 2) return;

    spawnParticle(e.clientX, e.clientY, vx, vy);
  }, { passive: true });

  function spawnParticle(x, y, vx, vy) {
    const particle = document.createElement('span');
    particle.classList.add('cursor-particle');

    // Random heart emoji or symbol
    const isEmoji = Math.random() > 0.5;
    if (isEmoji) {
      particle.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    } else {
      particle.textContent = '♥';
      particle.style.color = colors[Math.floor(Math.random() * colors.length)];
    }

    // Size variation
    const size = 8 + Math.random() * 14;
    particle.style.fontSize = size + 'px';

    // Position at cursor
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';

    // Directional drift: particles fly opposite to cursor movement + randomness
    const driftX = -(vx * 1.5) + (Math.random() - 0.5) * 80;
    const driftY = -(vy * 1.5) - 30 - Math.random() * 60; // always float upward
    const spin = (Math.random() - 0.5) * 360;
    const duration = 0.8 + Math.random() * 0.8; // 0.8-1.6s

    particle.style.setProperty('--drift-x', driftX + 'px');
    particle.style.setProperty('--drift-y', driftY + 'px');
    particle.style.setProperty('--spin', spin + 'deg');
    particle.style.setProperty('--particle-duration', duration + 's');

    document.body.appendChild(particle);
    particleCount++;

    // Cleanup after animation
    setTimeout(() => {
      if (particle.parentNode) particle.remove();
      particleCount--;
    }, duration * 1000 + 50);
  }
}

/* ===== HOMEPAGE COLLAGE SPOTLIGHT ===== */
function initCollageSpotlight() {
  const reveal = document.getElementById('collage-reveal');
  if (!reveal) return; // Only exists on homepage

  // Skip on touch devices
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  let targetX = -300, targetY = -300;
  let currentX = -300, currentY = -300;
  let rafId = null;

  function updateSpotlight() {
    // Smooth lerp for fluid spotlight movement
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;

    reveal.style.setProperty('--mx', currentX + 'px');
    reveal.style.setProperty('--my', currentY + 'px');

    rafId = requestAnimationFrame(updateSpotlight);
  }
  rafId = requestAnimationFrame(updateSpotlight);

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  }, { passive: true });

  // Move spotlight off-screen when mouse leaves
  document.addEventListener('mouseleave', () => {
    targetX = -300;
    targetY = -300;
  });
}

/* ===== HOMEPAGE MATRIX HEART CONSTELLATION WEB (PERFORMANCE OPTIMIZED) ===== */
function initHeartWebCanvas() {
  const canvas = document.getElementById('heart-web-canvas');
  if (!canvas) return; // Only present on homepage

  const ctx = canvas.getContext('2d', { alpha: true });
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  });

  let mouse = { x: -1000, y: -1000, active: false };

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  const heartSymbols = ['♥', '💖', '💕', '💗', '✨'];
  const colors = [
    'rgba(233, 30, 99, ',
    'rgba(244, 143, 177, ',
    'rgba(236, 64, 121, ',
    'rgba(212, 165, 208, '
  ];

  let particles = [];

  function initParticles() {
    particles = [];
    const count = Math.floor((width * height) / 45000);
    const particleCount = Math.min(Math.max(count, 18), 32);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        size: 11 + Math.random() * 8,
        symbol: heartSymbols[Math.floor(Math.random() * heartSymbols.length)],
        colorBase: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.35 + Math.random() * 0.4,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  initParticles();

  const maxConnectDistSq = 120 * 120;
  const mouseConnectDistSq = 160 * 160;
  const mouseConnectDist = 160;

  function animate() {
    ctx.clearRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const pLen = particles.length;

    // Update positions & draw particles
    for (let i = 0; i < pLen; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      p.pulse += 0.025;

      // Mouse attraction
      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < mouseConnectDistSq) {
          const dist = Math.sqrt(dSq);
          const force = (mouseConnectDist - dist) / mouseConnectDist;
          p.x += (dx / dist) * force * 0.7;
          p.y += (dy / dist) * force * 0.7;
        }
      }

      // Draw heart node (no expensive shadowBlur)
      ctx.font = `${p.size}px sans-serif`;
      ctx.fillStyle = p.colorBase + p.alpha + ')';
      ctx.fillText(p.symbol, p.x, p.y);

      // Connect to other particles
      for (let j = i + 1; j < pLen; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dSq = dx * dx + dy * dy;

        if (dSq < maxConnectDistSq) {
          const opacity = (1 - Math.sqrt(dSq) / 120) * 0.22;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(233, 30, 99, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Connect to mouse
      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dSq = dx * dx + dy * dy;

        if (dSq < mouseConnectDistSq) {
          const opacity = (1 - Math.sqrt(dSq) / mouseConnectDist) * 0.4;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(244, 143, 177, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ===== SCROLL-BASED VIDEO AUDIO CONTROLLER ===== */
function initVideoAudioController() {
  const videos = document.querySelectorAll('video');
  if (!videos.length) return;

  const visibilityMap = new Map();
  let userInteracted = false;

  // Track user interaction to handle browser autoplay policies
  const handleUserInteraction = () => {
    userInteracted = true;
    updateVideoAudio();
  };

  ['click', 'touchstart', 'pointerdown', 'keydown', 'scroll'].forEach(evt => {
    window.addEventListener(evt, handleUserInteraction, { passive: true, capture: true });
  });

  function updateVideoAudio() {
    if (document.hidden) {
      videos.forEach(v => {
        v.muted = true;
        updateBadge(v, false, 'hidden');
      });
      return;
    }

    // Determine which video is most visible in viewport
    let maxRatio = 0;
    let primaryVideo = null;

    visibilityMap.forEach((ratio, video) => {
      if (ratio > maxRatio && ratio >= 0.35) {
        maxRatio = ratio;
        primaryVideo = video;
      }
    });

    videos.forEach(video => {
      if (video === primaryVideo) {
        // Unmute audio when user is seeing the video
        video.muted = false;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              updateBadge(video, true);
            })
            .catch(err => {
              // If unmuting blocked by browser policy until click
              video.muted = true;
              video.play().catch(() => {});
              updateBadge(video, false, 'tap');
            });
        } else {
          updateBadge(video, !video.muted);
        }
      } else {
        // Mute video when not seeing it / out of view
        video.muted = true;
        updateBadge(video, false, 'out');
      }
    });
  }

  function createOrGetBadge(video) {
    const container = video.closest('.video-frame-border') || video.parentElement;
    if (!container) return null;

    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    let badge = container.querySelector('.video-audio-badge');
    if (!badge) {
      badge = document.createElement('button');
      badge.className = 'video-audio-badge';
      badge.setAttribute('type', 'button');
      badge.setAttribute('aria-label', 'Toggle Video Sound');
      container.appendChild(badge);

      const toggleMute = (e) => {
        e.stopPropagation();
        userInteracted = true;
        video.muted = !video.muted;
        if (!video.muted) {
          video.play().catch(() => {});
        }
        updateBadge(video, !video.muted);
      };

      badge.addEventListener('click', toggleMute);
      video.addEventListener('click', toggleMute);
    }
    return badge;
  }

  function updateBadge(video, isPlayingSound, reason) {
    const badge = createOrGetBadge(video);
    if (!badge) return;

    if (isPlayingSound && !video.muted) {
      badge.classList.add('active');
      badge.innerHTML = '🔊 Sound On';
    } else if (reason === 'tap') {
      badge.classList.remove('active');
      badge.innerHTML = '🔇 Tap for Sound';
    } else {
      badge.classList.remove('active');
      badge.innerHTML = '🔇 Muted';
    }
  }

  // Use IntersectionObserver to track video visibility on screen
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        visibilityMap.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
      });
      updateVideoAudio();
    },
    {
      threshold: [0, 0.1, 0.25, 0.35, 0.5, 0.75, 1.0]
    }
  );

  videos.forEach(video => {
    createOrGetBadge(video);
    observer.observe(video);
  });

  document.addEventListener('visibilitychange', updateVideoAudio);
}

