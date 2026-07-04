/* ═══════════════════════════════════════════════════════════
   FOR YOU — Main Script
   Clean, performant, no libraries.
═══════════════════════════════════════════════════════════ */

'use strict';

// ── DOM REFS ──────────────────────────────────────────────
const sections       = document.querySelectorAll('.section');
const btnOkay        = document.getElementById('btn-okay');
const btnContinue    = document.getElementById('btn-continue');
const typewriterEl   = document.getElementById('typewriter');
const storyLines     = document.querySelectorAll('.story-line');
const questionBlocks = document.querySelectorAll('.question-block');
const answerBtns     = document.querySelectorAll('.btn-answer');
const finalLines     = document.querySelectorAll('#final-lines .final-line');
const heartWrap      = document.querySelector('.heart-wrap');
const finalSignature = document.querySelector('.final-signature');
const finalPs        = document.querySelector('.final-ps');
const finalPsTexts   = document.querySelectorAll('.final-ps-text');
const finalBg        = document.getElementById('final-bg');
const bgMusic        = document.getElementById('bg-music');
const musicToggle    = document.getElementById('music-toggle');
const iconPlay       = document.getElementById('icon-play');
const iconMute       = document.getElementById('icon-mute');
const butterflyLayer = document.getElementById('butterfly-layer');
const particlesEl    = document.getElementById('particles-canvas');

// ── STATE ─────────────────────────────────────────────────
let currentSection   = 0;
let musicPlaying     = false;
let butterflyTimer   = null;
let storyUnlocked    = false;
let currentQuestion  = 0;
let section4Started  = false;

// ── HELPERS ───────────────────────────────────────────────
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function showSection(index) {
  sections.forEach((s, i) => {
    if (i === currentSection && i !== index) {
      s.classList.add('leaving');
      setTimeout(() => s.classList.remove('leaving', 'active'), 900);
    }
    if (i === index) {
      s.classList.remove('leaving');
      requestAnimationFrame(() => s.classList.add('active'));
    } else if (i !== currentSection) {
      s.classList.remove('active', 'leaving');
    }
  });
  currentSection = index;
}

// ══════════════════════════════════════════════════════════
//  PARTICLES — Section 1
// ══════════════════════════════════════════════════════════
function createParticles() {
  const count = 18;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 3 + Math.random() * 6;
    const left = 5 + Math.random() * 90;
    const dur  = 14 + Math.random() * 18;
    const del  = Math.random() * 20;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      bottom: ${-size}px;
      animation-duration: ${dur}s;
      animation-delay: ${del}s;
    `;
    particlesEl.appendChild(p);
  }
}

// ══════════════════════════════════════════════════════════
//  BUTTERFLIES
// ══════════════════════════════════════════════════════════
const BUTTERFLY_SVG = `
<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
  <g class="butterfly-body" style="transform-origin:30px 20px">
    <!-- Left wings -->
    <ellipse cx="18" cy="16" rx="16" ry="11" fill="rgba(111,168,255,0.45)" transform="rotate(-12,18,16)" class="wing-l"/>
    <ellipse cx="14" cy="26" rx="11" ry="7" fill="rgba(111,168,255,0.32)" transform="rotate(15,14,26)" class="wing-l"/>
    <!-- Right wings -->
    <ellipse cx="42" cy="16" rx="16" ry="11" fill="rgba(111,168,255,0.45)" transform="rotate(12,42,16)" class="wing-r"/>
    <ellipse cx="46" cy="26" rx="11" ry="7" fill="rgba(111,168,255,0.32)" transform="rotate(-15,46,26)" class="wing-r"/>
    <!-- Body -->
    <ellipse cx="30" cy="20" rx="2.5" ry="9" fill="rgba(45,79,124,0.55)"/>
    <!-- Antennae -->
    <line x1="28" y1="12" x2="22" y2="4" stroke="rgba(45,79,124,0.45)" stroke-width="1" stroke-linecap="round"/>
    <circle cx="22" cy="4" r="1.2" fill="rgba(45,79,124,0.45)"/>
    <line x1="32" y1="12" x2="38" y2="4" stroke="rgba(45,79,124,0.45)" stroke-width="1" stroke-linecap="round"/>
    <circle cx="38" cy="4" r="1.2" fill="rgba(45,79,124,0.45)"/>
  </g>
</svg>`;

let activeButterflyCount = 0;
const MAX_BUTTERFLIES    = 4;

function spawnButterfly() {
  if (activeButterflyCount >= MAX_BUTTERFLIES) return;

  activeButterflyCount++;
  const el = document.createElement('div');
  el.className = 'butterfly';

  // Random starting edge
  const edge    = Math.floor(Math.random() * 4); // 0=left,1=right,2=top,3=bottom
  const W       = window.innerWidth;
  const H       = window.innerHeight;
  let startX, startY, endX, endY;

  if (edge === 0)      { startX = -40;    startY = (0.15 + Math.random() * 0.7) * H; endX = W + 40;   endY = (0.1 + Math.random() * 0.8) * H; }
  else if (edge === 1) { startX = W + 40; startY = (0.15 + Math.random() * 0.7) * H; endX = -40;      endY = (0.1 + Math.random() * 0.8) * H; }
  else if (edge === 2) { startX = (0.05 + Math.random() * 0.9) * W; startY = -40; endX = (0.05 + Math.random() * 0.9) * W; endY = H + 40; }
  else                 { startX = (0.05 + Math.random() * 0.9) * W; startY = H + 40; endX = (0.05 + Math.random() * 0.9) * W; endY = -40; }


  const dur    = 7000 + Math.random() * 5000;
  const midX   = (startX + endX) / 2 + (Math.random() - 0.5) * 200;
  const midY   = (startY + endY) / 2 + (Math.random() - 0.5) * 150;

  el.innerHTML = BUTTERFLY_SVG;
  el.style.cssText = `
    left: ${startX}px;
    top: ${startY}px;
    width: ${24 + Math.random() * 14}px;
    opacity: 0;
    transform: rotate(${(Math.random() - 0.5) * 20}deg);
  `;
  butterflyLayer.appendChild(el);

  // Wing flap via CSS on the SVG ellipses
  const style = document.createElement('style');
  const uid   = 'bf-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5);
  style.textContent = `
    .${uid} .wing-l { animation: wingFlap ${0.28 + Math.random() * 0.12}s ease-in-out infinite alternate; transform-origin: 30px 20px; }
    .${uid} .wing-r { animation: wingFlap ${0.28 + Math.random() * 0.12}s ease-in-out infinite alternate-reverse; transform-origin: 30px 20px; }
  `;
  el.classList.add(uid);
  document.head.appendChild(style);

  // Animate path with keyframes via Web Animations API
  const keyframes = [
    { transform: `translate(0px, 0px)`, opacity: 0 },
    { transform: `translate(0px, 0px)`, opacity: 0.7, offset: 0.05 },
    { transform: `translate(${midX - startX}px, ${midY - startY}px)`, opacity: 0.65, offset: 0.5 },
    { transform: `translate(${endX - startX}px, ${endY - startY}px)`, opacity: 0.6, offset: 0.95 },
    { transform: `translate(${endX - startX}px, ${endY - startY}px)`, opacity: 0 },
  ];

  const anim = el.animate(keyframes, {
    duration: dur,
    easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    fill: 'forwards'
  });

  anim.onfinish = () => {
    el.remove();
    style.remove();
    activeButterflyCount--;
  };
}

function scheduleButterflyLoop() {
  const interval = 3500 + Math.random() * 4000;
  butterflyTimer = setTimeout(() => {
    spawnButterfly();
    scheduleButterflyLoop();
  }, interval);
}

// ══════════════════════════════════════════════════════════
//  MUSIC
// ══════════════════════════════════════════════════════════
function startMusic() {
  bgMusic.volume = 0.35;
  bgMusic.play().then(() => {
    musicPlaying = true;
    musicToggle.classList.add('visible');
    iconPlay.classList.remove('hidden');
    iconMute.classList.add('hidden');
  }).catch(() => {
    // Autoplay blocked — show toggle anyway so user can start
    musicToggle.classList.add('visible');
  });
}

function toggleMusic() {
  if (musicPlaying) {
    bgMusic.pause();
    musicPlaying = false;
    iconPlay.classList.add('hidden');
    iconMute.classList.remove('hidden');
  } else {
    bgMusic.play().then(() => {
      musicPlaying = true;
      iconPlay.classList.remove('hidden');
      iconMute.classList.add('hidden');
    });
  }
}

musicToggle.addEventListener('click', toggleMusic);

// ══════════════════════════════════════════════════════════
//  TYPEWRITER — Section 1
// ══════════════════════════════════════════════════════════
const SCRIPT = [
  { text: 'Before you leave this page…', pause: 1200 },
  { text: 'I want to ask you something.', pause: 1000 },
  { text: 'Just…', pause: 800 },
  { text: 'answer honestly.', pause: 0 },
];

async function typeWriter() {
  let fullText = '';

  for (let i = 0; i < SCRIPT.length; i++) {
    const item  = SCRIPT[i];
    if (i > 0) fullText += '\n';
    const chars = item.text.split('');

    for (const ch of chars) {
      fullText += ch;
      typewriterEl.textContent = fullText;
      await wait(52 + Math.random() * 35);
    }

    if (item.pause > 0) await wait(item.pause);
  }

  // Show Okay button
  await wait(400);
  btnOkay.classList.remove('hidden');
  requestAnimationFrame(() => btnOkay.classList.add('show'));
}

// ══════════════════════════════════════════════════════════
//  SECTION 2 — Story lines cascade
// ══════════════════════════════════════════════════════════
async function runStory() {
  const delays = [0, 1000, 1800, 2400, 3000, 3800, 4600, 5200, 6100];

  storyLines.forEach((line, i) => {
    setTimeout(() => {
      line.classList.add('visible');
    }, delays[i]);
  });

  // Show button after last line
  const totalDelay = delays[delays.length - 1] + 1400;
  setTimeout(() => {
    btnContinue.classList.remove('hidden');
    requestAnimationFrame(() => btnContinue.classList.add('show'));
  }, totalDelay);
}

// ══════════════════════════════════════════════════════════
//  HEART BURST
// ══════════════════════════════════════════════════════════
function spawnHeartBurst(x, y) {
  const hearts = ['❤️', '🩷', '💕', '✨'];
  const count  = 5 + Math.floor(Math.random() * 4);

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'heart-burst';
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    const offsetX = (Math.random() - 0.5) * 80;
    el.style.cssText = `
      left: ${x + offsetX}px;
      top: ${y}px;
      animation-delay: ${Math.random() * 200}ms;
      font-size: ${1 + Math.random() * 0.8}rem;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
}

// ══════════════════════════════════════════════════════════
//  SECTION 3 — Questions
// ══════════════════════════════════════════════════════════
function showQuestion(index) {
  const blocks = document.querySelectorAll('.question-block');

  blocks.forEach((b, i) => {
    if (i === index) {
      b.classList.remove('hidden', 'leaving');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => b.classList.add('visible'));
      });
    } else {
      b.classList.remove('visible');
      b.classList.add('hidden');
    }
  });
}

function advanceQuestion(qIdx) {
  if (qIdx < 3) {
    currentQuestion = qIdx + 1;
    showQuestion(currentQuestion);
  } else {
    goToSection(3);
  }
}

function handleAnswer(btn) {
  const isNahh = btn.dataset.nahh === 'true';
  const block  = btn.closest('.question-block');
  const qIdx   = parseInt(block.dataset.q);

  // Lock all buttons immediately
  block.querySelectorAll('.btn-answer').forEach(b => {
    b.disabled = true;
    b.style.pointerEvents = 'none';
  });

  if (isNahh) {
    // ── Nahh path ──────────────────────────────────────────
    btn.classList.add('bounce');
    setTimeout(() => btn.classList.remove('bounce'), 450);

    const nahhMsg   = block.querySelector('.nahh-response');
    const buttonsEl = block.querySelector('.answer-buttons');
    const questionEl = block.querySelector('.question-text');

    // Gently fade out the question + buttons
    questionEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    buttonsEl.style.transition  = 'opacity 0.4s ease, transform 0.4s ease';
    questionEl.style.opacity    = '0';
    questionEl.style.transform  = 'translateY(-8px)';
    buttonsEl.style.opacity     = '0';
    buttonsEl.style.transform   = 'translateY(-8px)';

    setTimeout(() => {
      questionEl.style.display = 'none';
      buttonsEl.style.display  = 'none';
      // Fade in the playful response
      requestAnimationFrame(() => {
        requestAnimationFrame(() => nahhMsg.classList.add('visible'));
      });
    }, 420);

    // After enough reading time, move on
    setTimeout(() => {
      block.classList.add('leaving');
      block.classList.remove('visible');
      setTimeout(() => advanceQuestion(qIdx), 550);
    }, 3400);

  } else {
    // ── Positive path ──────────────────────────────────────
    const rect = btn.getBoundingClientRect();
    const cx   = rect.left + rect.width / 2;
    const cy   = rect.top;

    btn.classList.add('bounce');
    setTimeout(() => btn.classList.remove('bounce'), 450);

    spawnHeartBurst(cx, cy);
    spawnButterfly();

    setTimeout(() => {
      block.classList.add('leaving');
      block.classList.remove('visible');
      setTimeout(() => advanceQuestion(qIdx), 550);
    }, 700);
  }
}

answerBtns.forEach(btn => {
  btn.addEventListener('click', () => handleAnswer(btn));
});

// ══════════════════════════════════════════════════════════
//  SECTION 4 — Ending
// ══════════════════════════════════════════════════════════
async function runSection4() {
  if (section4Started) return;
  section4Started = true;

  // Fade in background image
  setTimeout(() => finalBg.classList.add('visible'), 800);

  // Reveal lines by data-delay
  const allRevealEls = document.querySelectorAll(
    '#final-lines .final-line, .heart-wrap, .final-signature, .final-ps, .final-ps-text'
  );

  allRevealEls.forEach(el => {
    const delay = parseInt(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('visible'), delay);
  });
}

// ══════════════════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════════════════
function goToSection(index) {
  showSection(index);

  if (index === 1 && !storyUnlocked) {
    storyUnlocked = true;
    setTimeout(runStory, 600);
  }

  if (index === 2) {
    // Reset questions to first
    currentQuestion = 0;
    setTimeout(() => showQuestion(0), 600);
  }

  if (index === 3) {
    setTimeout(runSection4, 600);
  }
}

// Okay button → Section 2 + start music
btnOkay.addEventListener('click', () => {
  startMusic();
  goToSection(1);
});

// Continue button → Section 3
btnContinue.addEventListener('click', () => {
  goToSection(2);
});

// ══════════════════════════════════════════════════════════
//  SWIPE / TOUCH NAVIGATION (section 1 & 2 only)
// ══════════════════════════════════════════════════════════
let touchStartY = 0;
let touchStartX = 0;

document.addEventListener('touchstart', e => {
  touchStartY = e.touches[0].clientY;
  touchStartX = e.touches[0].clientX;
}, { passive: true });

document.addEventListener('touchend', e => {
  // No swipe nav — buttons are the intentional gates
}, { passive: true });

// ══════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════
function init() {
  // Show section 1
  sections[0].classList.add('active');

  // Particles
  createParticles();

  // Butterflies (start after a moment)
  setTimeout(scheduleButterflyLoop, 3000);

  // Start typewriter
  setTimeout(typeWriter, 600);

  // Pre-hide section 4 elements (they reveal via JS)
  document.querySelectorAll(
    '#final-lines .final-line, .heart-wrap, .final-signature, .final-ps, .final-ps-text'
  ).forEach(el => {
    el.style.transition = 'opacity 1s ease, transform 1s ease';
  });
}

document.addEventListener('DOMContentLoaded', init);
