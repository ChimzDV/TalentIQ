

// -------------------------------------------------------------
// 1. AUDIO SYNTHESIZER ENGINE (Web Audio API)
// -------------------------------------------------------------
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlayingMusic = false;
    this.audioElement = new Audio('/audio/carrots.mp3');
    this.audioElement.loop = true;
    this.audioElement.volume = 0.50; // Pleasant background volume
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.15, this.ctx.currentTime); // Low master volume for synth effects
    this.masterGain.connect(this.ctx.destination);
  }

  // Plays the carrots.mp3 song loop
  startAmbientMusic() {
    if (this.isPlayingMusic) return;
    this.isPlayingMusic = true;

    this.audioElement.play().catch(err => {
      console.log("Autoplay blocked, waiting for interaction:", err);
      // Wait for user interaction to play
      const startOnInteract = () => {
        if (this.isPlayingMusic) {
          this.audioElement.play().catch(e => { });
        }
        window.removeEventListener('click', startOnInteract);
        window.removeEventListener('touchstart', startOnInteract);
      };
      window.addEventListener('click', startOnInteract);
      window.addEventListener('touchstart', startOnInteract);
    });
  }

  stopAmbientMusic() {
    this.isPlayingMusic = false;
    this.audioElement.pause();
  }

  // Mechanical typing ticks
  playKeyTick() {
    if (!this.ctx || this.ctx.state === 'suspended') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200 + Math.random() * 800, now);

    gain.gain.setValueAtTime(0.008, now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Audio Glitch effect sweep
  playGlitchSound() {
    if (!this.ctx || this.ctx.state === 'suspended') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.linearRampToValueAtTime(400, now + 0.2);

    filter.type = 'peaking';
    filter.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Success Chord Beeps
  playSuccessSound() {
    if (!this.ctx || this.ctx.state === 'suspended') return;
    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50];

    freqs.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.05, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + index * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.5);
    });
  }

  // Failure buzzer
  playFailSound() {
    if (!this.ctx || this.ctx.state === 'suspended') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.setValueAtTime(110, now + 0.1);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Checkbox tick tone
  playCheckSound() {
    if (!this.ctx || this.ctx.state === 'suspended') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(880.00, now + 0.05);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  toggle() {
    if (this.isPlayingMusic) {
      this.stopAmbientMusic();
      return false;
    } else {
      this.startAmbientMusic();
      return true;
    }
  }
}

const audio = new AudioEngine();

// -------------------------------------------------------------
// 2. BACKGROUND PARTICLE CANVAS ENGINE
// -------------------------------------------------------------
class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById('particle-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.maxParticles = 60;
    this.theme = 'dark';

    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);
  }

  init() {
    window.addEventListener('resize', this.resize);
    this.resize();
    this.createParticles();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.newParticle());
    }
  }

  newParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      radius: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? '#38BDF8' : '#3B82F6'
    };
  }

  setTheme(theme) {
    this.theme = theme;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

      if (this.theme === 'dark') {
        this.ctx.fillStyle = p.color;
      } else {
        this.ctx.fillStyle = '#A3A3A3';
      }

      this.ctx.globalAlpha = p.opacity;
      this.ctx.fill();
    });

    this.ctx.globalAlpha = 1.0;
    requestAnimationFrame(this.animate);
  }
}

const particles = new ParticleSystem();
particles.init();

// -------------------------------------------------------------
// 2.5. BUTTERFLY VISUAL THEME ENGINE
// -------------------------------------------------------------
class ButterflyManager {
  constructor() {
    this.active = false;
    this.activeCount = 0;
    this.maxOnScreen = 4; // Keeps 3-5 butterflies active at any given time
  }

  startSpawning() {
    if (this.active) return;
    this.active = true;

    // Spawn initial staggered butterflies across screen width
    for (let i = 0; i < this.maxOnScreen; i++) {
      this.spawnOne({
        startLeft: Math.random() * window.innerWidth,
        startTop: Math.random() * (window.innerHeight - 200) + 100
      });
    }
  }

  stopSpawning() {
    this.active = false;
    // Remove all floating butterflies when stopping spawning
    const activeFlappers = document.querySelectorAll('.butterfly');
    activeFlappers.forEach(el => {
      if (el.style.zIndex != '35') { // Do not kill landing butterfly if active
        el.remove();
        this.activeCount = Math.max(0, this.activeCount - 1);
      }
    });
  }

  spawnOne(options = {}) {
    if (!this.active && !options.force) return;
    this.activeCount++;

    const div = document.createElement('div');
    div.className = 'butterfly';
    div.innerHTML = `<svg viewBox="0 0 100 80">
      <path d="M 50 40 C 35 15, 10 20, 15 45 C 18 55, 35 55, 50 40 C 65 55, 82 55, 85 45 C 90 20, 65 15, 50 40 Z" />
      <path d="M 50 40 C 40 50, 25 65, 30 75 C 33 80, 45 70, 50 40 C 55 70, 67 80, 70 75 C 75 65, 60 50, 50 40 Z" />
    </svg>`;

    const colors = ['#38BDF8', '#3B82F6', '#FFFFFF', '#C084FC', '#E9D5FF'];
    div.style.color = options.color || colors[Math.floor(Math.random() * colors.length)];

    const size = options.size || (Math.random() * 12 + 15); // 15px to 27px
    div.style.width = `${size}px`;
    div.style.height = `${size * 0.8}px`;

    // Depth layering: -1 for behind cards (above overlay), 25 for front
    const zIndex = options.zIndex || (Math.random() > 0.55 ? 25 : -1);
    div.style.zIndex = zIndex;

    if (zIndex === -1) {
      div.style.filter = `blur(${Math.random() * 1.5 + 0.5}px)`;
      div.style.opacity = '0.6';
    } else {
      div.style.filter = 'none';
      div.style.opacity = '0.85';
    }

    document.body.appendChild(div);

    const startLeft = options.startLeft !== undefined ? options.startLeft : -50;
    const startTop = options.startTop !== undefined ? options.startTop : (Math.random() * (window.innerHeight - 200) + 100);
    const direction = options.direction || 1;

    let currentLeft = startLeft;
    let currentTop = startTop;

    const speedX = options.speedX || (Math.random() * 1.0 + 0.8);
    const frequency = options.frequency || (Math.random() * 0.008 + 0.004);
    const speedFlap = options.speedFlap || (0.12 + Math.random() * 0.08);
    div.querySelector('svg').style.animationDuration = `${speedFlap}s`;

    const self = this;
    function animateButterfly() {
      currentLeft += speedX * direction;
      currentTop += Math.sin(currentLeft * frequency) * 1.6 + (Math.random() - 0.5) * 0.4;

      div.style.left = `${currentLeft}px`;
      div.style.top = `${currentTop}px`;

      const angle = Math.cos(currentLeft * frequency) * 12;
      div.style.transform = `rotate(${angle + (direction === -1 ? 180 : 0)}deg)`;

      const out = direction === 1 ? (currentLeft > window.innerWidth + 50) : (currentLeft < -50);
      if (out || currentTop < -100 || currentTop > window.innerHeight + 100) {
        div.remove();
        self.activeCount = Math.max(0, self.activeCount - 1);
        // Maintain active count limits dynamically
        if (self.active && self.activeCount < self.maxOnScreen) {
          self.spawnOne();
        }
      } else {
        requestAnimationFrame(animateButterfly);
      }
    }

    animateButterfly();
  }
}

const butterflies = new ButterflyManager();

// Special Landing Butterfly on White Screen
function spawnLandingButterfly() {
  const div = document.createElement('div');
  div.className = 'butterfly';
  div.innerHTML = `<svg viewBox="0 0 100 80">
    <path d="M 50 40 C 35 15, 10 20, 15 45 C 18 55, 35 55, 50 40 C 65 55, 82 55, 85 45 C 90 20, 65 15, 50 40 Z" fill="currentColor" />
    <path d="M 50 40 C 40 50, 25 65, 30 75 C 33 80, 45 70, 50 40 C 55 70, 67 80, 70 75 C 75 65, 60 50, 50 40 Z" fill="currentColor" />
  </svg>`;

  div.style.color = '#38BDF8';
  div.style.width = '38px';
  div.style.height = '30px';
  div.style.zIndex = '35'; // Above white screen contents
  div.style.left = '-40px';
  div.style.top = `${window.innerHeight / 2 - 80}px`;

  document.body.appendChild(div);

  let left = -40;
  let top = window.innerHeight / 2 - 80;
  let step = 0;

  const textElement = document.getElementById('page-two-text-1');
  const targetRect = textElement.getBoundingClientRect();
  const targetLeft = targetRect.right + 25;
  const targetTop = targetRect.top - 12;

  function flyToTarget() {
    if (step < 85) {
      step += 1;
      left += (targetLeft - left) * 0.045;
      top += (targetTop - top) * 0.045;
      div.style.left = `${left}px`;
      div.style.top = `${top}px`;
      requestAnimationFrame(flyToTarget);
    } else {
      // Land wings flap slower
      div.querySelector('svg').style.animationDuration = '0.9s';

      // Stand still for 2.2 seconds then take off
      setTimeout(() => {
        div.querySelector('svg').style.animationDuration = '0.12s';
        flyAway();
      }, 2200);
    }
  }

  function flyAway() {
    let awayStep = 0;
    function animateAway() {
      awayStep += 1;
      left += 2.2;
      top -= 1.8 + Math.sin(awayStep * 0.08) * 1.8;

      div.style.left = `${left}px`;
      div.style.top = `${top}px`;

      if (left > window.innerWidth + 40 || top < -100) {
        div.remove();
      } else {
        requestAnimationFrame(animateAway);
      }
    }
    animateAway();
  }

  flyToTarget();
}

// Spawns 8 vertical drifting ending butterflies
function spawnEndingButterflies() {
  butterflies.stopSpawning();
  for (let i = 0; i < 9; i++) {
    setTimeout(() => {
      const div = document.createElement('div');
      div.className = 'butterfly';
      div.innerHTML = `<svg viewBox="0 0 100 80">
        <path d="M 50 40 C 35 15, 10 20, 15 45 C 18 55, 35 55, 50 40 C 65 55, 82 55, 85 45 C 90 20, 65 15, 50 40 Z" fill="currentColor" />
        <path d="M 50 40 C 40 50, 25 65, 30 75 C 33 80, 45 70, 50 40 C 55 70, 67 80, 70 75 C 75 65, 60 50, 50 40 Z" fill="currentColor" />
      </svg>`;

      const colors = ['#38BDF8', '#3B82F6', '#FFFFFF', '#C084FC', '#F472B6'];
      div.style.color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 15 + 24; // 24px to 39px
      div.style.width = `${size}px`;
      div.style.height = `${size * 0.8}px`;
      div.style.zIndex = '-1';
      div.style.opacity = '0.7';

      let left = Math.random() * window.innerWidth;
      let top = window.innerHeight + 40;
      div.style.left = `${left}px`;
      div.style.top = `${top}px`;

      document.body.appendChild(div);

      const speedY = Math.random() * 0.7 + 0.5;
      let time = 0;

      function driftUp() {
        time += 0.04;
        top -= speedY;
        left += Math.sin(time * 0.8) * 0.6;

        div.style.left = `${left}px`;
        div.style.top = `${top}px`;

        if (top < window.innerHeight * 0.4) {
          const ratio = top / (window.innerHeight * 0.4);
          div.style.opacity = `${Math.max(0, ratio * 0.7)}`;
        }

        if (top < -50 || parseFloat(div.style.opacity) <= 0) {
          div.remove();
        } else {
          requestAnimationFrame(driftUp);
        }
      }
      driftUp();
    }, i * 550);
  }
}


// -------------------------------------------------------------
// 3. TYPEWRITER TIMING MODULE
// -------------------------------------------------------------
function typeText(container, text, options = {}) {
  return new Promise((resolve) => {
    const delay = options.delay !== undefined ? options.delay : 35;
    const isHtml = options.isHtml || false;
    const isMuted = options.isMuted || false;
    const customClass = options.class || '';

    const line = document.createElement('div');
    if (customClass) {
      line.className = customClass;
    }
    container.appendChild(line);

    if (isHtml) {
      line.innerHTML = text;
      resolve();
      return;
    }

    let charIndex = 0;
    const cursor = document.createElement('span');
    cursor.className = 'terminal-cursor';
    line.appendChild(cursor);

    function type() {
      if (charIndex < text.length) {
        cursor.insertAdjacentText('beforebegin', text[charIndex]);
        charIndex++;

        if (!isMuted && Math.random() > 0.3) {
          audio.playKeyTick();
        }

        setTimeout(type, delay + (Math.random() - 0.5) * 15);
      } else {
        cursor.remove();
        resolve();
      }
    }

    type();
  });
}

// -------------------------------------------------------------
// 4. EASTER EGG MANAGER
// -------------------------------------------------------------
let carrotClicks = 0;
const devNoteModal = document.getElementById('dev-note-modal');

document.getElementById('carrot-icon').addEventListener('click', () => {
  carrotClicks++;

  const icon = document.getElementById('carrot-icon');
  icon.classList.add('carrot-shake');
  setTimeout(() => icon.classList.remove('carrot-shake'), 500);

  audio.playKeyTick();

  if (carrotClicks >= 7) {
    carrotClicks = 0;
    showToast('Secure Core unlocked. Accessing Developer Notes...');
    audio.playSuccessSound();

    // Open Modal
    devNoteModal.classList.remove('hidden');
    setTimeout(() => {
      devNoteModal.style.opacity = '1';
      devNoteModal.querySelector('.glass-panel').style.transform = 'scale(1)';
    }, 50);
  }
});

document.getElementById('btn-close-dev-note').addEventListener('click', () => {
  devNoteModal.style.opacity = '0';
  devNoteModal.querySelector('.glass-panel').style.transform = 'scale(0.9)';
  setTimeout(() => devNoteModal.classList.add('hidden'), 300);
});

// Screen Toast helper
function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'glass-panel px-4 py-3 rounded-lg border-cyber-cyan text-xs font-mono text-cyber-cyan shadow-lg pointer-events-auto flex items-center gap-2 max-w-xs';
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(-30px)';
  toast.style.transition = 'all 0.3s ease-out';

  toast.innerHTML = `<i class="fa-solid fa-microchip animate-pulse"></i> <span>${message}</span>`;
  container.appendChild(toast);

  // Animate toast entry
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }, 50);

  // Dismissal
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Input logs for code typing
let keyBuffer = '';
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    keyBuffer = '';
    return;
  }

  if (e.key.length === 1) {
    keyBuffer += e.key.toLowerCase();
    if (keyBuffer.length > 20) {
      keyBuffer = keyBuffer.slice(-20);
    }
    checkKeyboardTriggers();
  }
});

function checkKeyboardTriggers() {
  if (keyBuffer.endsWith('whoami')) {
    audio.playSuccessSound();
    showToast('Someone who enjoys talking to Carrots.');
    keyBuffer = '';
  }
  if (keyBuffer.endsWith('smile')) {
    audio.playSuccessSound();
    showToast('Access Granted. Thank you for smiling.');
    keyBuffer = '';
  }
}

// Konami Code Sequence
const konamiKeys = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiStep = 0;

window.addEventListener('keydown', (e) => {
  if (e.key === konamiKeys[konamiStep]) {
    konamiStep++;
    if (konamiStep === konamiKeys.length) {
      audio.playSuccessSound();
      showToast('Hidden Achievement: Professional Teaser Detected.');
      konamiStep = 0;
    }
  } else {
    konamiStep = e.key === konamiKeys[0] ? 1 : 0;
  }
});

// -------------------------------------------------------------
// 5. AUDIO CONTROLLER BAR CONTROL
// -------------------------------------------------------------
const audioPanel = document.getElementById('audio-panel');
const audioIcon = document.getElementById('audio-icon');
const audioStatusText = document.getElementById('audio-status-text');
const audioBars = document.querySelectorAll('.audio-bar');

audioPanel.addEventListener('click', () => {
  const isPlaying = audio.toggle();
  if (isPlaying) {
    audioIcon.className = 'fas fa-volume-up text-cyber-cyan';
    audioStatusText.innerText = 'ONLINE';
    audioStatusText.style.color = 'var(--color-cyan)';

    // Add visual equalizer animation class
    audioBars.forEach(bar => bar.classList.add('audio-bar-active'));
  } else {
    audioIcon.className = 'fas fa-volume-mute text-cyber-muted';
    audioStatusText.innerText = 'MUTED';
    audioStatusText.style.color = 'var(--color-muted)';

    // Remove visual equalizer animation class
    audioBars.forEach(bar => bar.classList.remove('audio-bar-active'));
  }
});

// -------------------------------------------------------------
// 6. BRIEFING SEQUENCE TRANSITIONS (TIMELINE FLOW)
// -------------------------------------------------------------
const stageActivation = document.getElementById('stage-activation');
const stageTerminalBoot = document.getElementById('stage-terminal-boot');
const stageScanSequence = document.getElementById('stage-scan-sequence');
const stagePageTwo = document.getElementById('stage-page-two');
const stageMemoryLogs = document.getElementById('stage-memory-logs');
const stageEvidence = document.getElementById('stage-evidence');
const stageFinalMessage = document.getElementById('stage-final-message');
const stageEnding = document.getElementById('stage-ending');

// STAGE 0 -> STAGE 1 (Authorization to Terminal Boot)
document.getElementById('btn-activate').addEventListener('click', async () => {
  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      await document.documentElement.webkitRequestFullscreen();
    }
  } catch (e) {
    console.log('Fullscreen request bypassed');
  }

  // Audio initialization
  audio.init();
  // Resume AudioContext (required by Chrome)
  if (audio.ctx && audio.ctx.state === "suspended") {
    audio.ctx.resume();
  }

  // Start the music
  audio.audioElement.play()
    .then(() => {
      audio.isPlayingMusic = true;
    })
    .catch(err => console.log(err));
  audioPanel.classList.remove('hidden');
  audioPanel.classList.add('flex');
  audioIcon.className = 'fas fa-volume-up text-cyber-cyan';
  audioStatusText.innerText = 'ONLINE';
  audioStatusText.style.color = 'var(--color-cyan)';
  audioBars.forEach(bar => bar.classList.add('audio-bar-active'));
  document.getElementById('top-carrot-container').classList.remove('hidden');

  // Fade out screen
  stageActivation.style.opacity = '0';
  stageActivation.style.transform = 'scale(0.95)';

  setTimeout(() => {
    stageActivation.classList.add('hidden');
    stageTerminalBoot.classList.remove('hidden');
    setTimeout(() => {
      stageTerminalBoot.style.opacity = '1';
      runTerminalBoot();
    }, 50);
  }, 700);
});

// Stage 1 terminal typing scripts
async function runTerminalBoot() {
  const container = document.getElementById('boot-terminal-log');

  // Spawn quiet intro butterfly
  butterflies.spawnOne({ force: true, startLeft: -35, startTop: window.innerHeight * 0.4, speedX: 1.2, size: 32, zIndex: 25 });

  await typeText(container, 'Initializing system...', { delay: 20 });
  await new Promise(r => setTimeout(r, 600));

  await typeText(container, 'Target Detected...', { delay: 30 });
  await new Promise(r => setTimeout(r, 400));

  await typeText(container, 'Codename: CARROTS', { delay: 40, class: 'text-white font-bold' });
  await new Promise(r => setTimeout(r, 400));

  await typeText(container, 'Security Clearance: Restricted', { delay: 30, class: 'text-red-400 font-semibold' });
  await new Promise(r => setTimeout(r, 600));

  await typeText(container, 'Loading diagnostic modules...', { delay: 20 });
  await new Promise(r => setTimeout(r, 800));

  await typeText(container, 'Scanning target profile attributes...', { delay: 30 });
  await new Promise(r => setTimeout(r, 600));

  const items = [
    'Kindness Detected',
    'Humor Detected',
    'Professional Teaser Detected',
    'Beautiful Smile Detected',
    'Big Glowing Eyes Detected',
    'Beautiful Voice... Confirmed.'
  ];

  for (const item of items) {
    await typeText(container, `✔ ${item}`, { delay: 35, class: 'text-emerald-400 font-semibold' });
    await new Promise(r => setTimeout(r, 300));
  }

  await new Promise(r => setTimeout(r, 1200));
  await typeText(container, 'Warning: One anomaly detected in profile databases...', { delay: 30, class: 'text-amber-400' });
  await new Promise(r => setTimeout(r, 800));

  await typeText(container, 'Subject insists she doesn\'t like me.', { delay: 45, class: 'text-cyber-cyan italic font-bold' });

  // Show boot button
  const cont = document.getElementById('boot-continue-container');
  cont.style.opacity = '1';
}

// STAGE 1 -> STAGE 2 (Terminal Boot to Scan Engine)
document.getElementById('btn-boot-continue').addEventListener('click', () => {
  audio.playKeyTick();

  stageTerminalBoot.style.opacity = '0';
  stageTerminalBoot.style.transform = 'translateY(-10px)';

  setTimeout(() => {
    stageTerminalBoot.classList.add('hidden');
    stageScanSequence.classList.remove('hidden');
    setTimeout(() => {
      stageScanSequence.style.opacity = '1';
      runScanSequence();
    }, 50);
  }, 700);
});

// Stage 2 scan engine progress
async function runScanSequence() {
  const container = document.getElementById('scan-terminal-log');
  const progressBar = document.getElementById('scan-progress-bar');
  const progressText = document.getElementById('scan-progress-percentage');

  await typeText(container, 'Searching for vulnerabilities...', { delay: 30 });
  await typeText(container, 'Finding a way in...', { delay: 30 });

  // Animate progress to 40%
  progressBar.style.width = '40%';
  await animateProgressText(0, 40, 1500, progressText);

  await typeText(container, 'Attempt #1: Password Guessing...', { delay: 30 });
  await new Promise(r => setTimeout(r, 500));
  audio.playFailSound();
  await typeText(container, 'Result: FAILED (Permission Denied)', { delay: 20, class: 'text-red-500 font-bold' });

  await new Promise(r => setTimeout(r, 600));

  // Progress to 75%
  progressBar.style.width = '75%';
  await animateProgressText(40, 75, 1200, progressText);

  await typeText(container, 'Attempt #2: Bribery...', { delay: 30 });
  await new Promise(r => setTimeout(r, 550));
  audio.playFailSound();
  await typeText(container, 'Result: FAILED (Subject cannot be bought)', { delay: 20, class: 'text-red-500 font-bold' });

  await new Promise(r => setTimeout(r, 800));

  await typeText(container, 'Attempt #3: Compliment Injection...', { delay: 35 });
  await typeText(container, 'Processing payload delivery...', { delay: 20 });

  // Progress to 100%
  progressBar.style.width = '100%';
  await animateProgressText(75, 100, 2000, progressText);

  await typeText(container, 'Result: Payload Executed.', { delay: 20, class: 'text-emerald-400 font-semibold' });
  await new Promise(r => setTimeout(r, 600));

  await typeText(container, '"Your smile is beautiful."', { delay: 45, class: 'text-white italic cyber-glow-cyan' });
  await new Promise(r => setTimeout(r, 500));
  await typeText(container, 'Feedback: No response.', { delay: 20, class: 'text-cyber-muted' });

  await new Promise(r => setTimeout(r, 800));
  await typeText(container, 'Retrying sequence...', { delay: 20 });
  await typeText(container, '"Your eyes are unfairly pretty."', { delay: 45, class: 'text-white italic cyber-glow-cyan' });
  await new Promise(r => setTimeout(r, 500));
  await typeText(container, 'Feedback: Still pretending not to care.', { delay: 20, class: 'text-cyber-muted' });

  await new Promise(r => setTimeout(r, 1000));
  await typeText(container, 'Retrying sequence...', { delay: 20 });
  await typeText(container, '"I still think your voice is one of my favorite things about you."', { delay: 50, class: 'text-white italic cyber-glow-cyan' });

  await new Promise(r => setTimeout(r, 1500));
  await typeText(container, 'System paused. Unknown response state encountered...', { delay: 25, class: 'text-amber-400 animate-pulse' });

  await new Promise(r => setTimeout(r, 1000));
  triggerScreenGlitch();
}

// Progress percentage increments
function animateProgressText(start, end, duration, element) {
  return new Promise((resolve) => {
    const range = end - start;
    let current = start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));

    const timer = setInterval(() => {
      current += increment;
      element.innerText = `${current}%`;
      if (current === end) {
        clearInterval(timer);
        resolve();
      }
    }, stepTime);
  });
}

// Intense glitch and transition
function triggerScreenGlitch() {
  audio.playGlitchSound();
  document.body.classList.add('glitch-active');

  setTimeout(() => {
    const whiteFlash = document.getElementById('white-flash');
    whiteFlash.style.display = 'block';

    // Fade in white
    setTimeout(() => {
      whiteFlash.style.opacity = '1';
    }, 50);

    setTimeout(() => {
      document.body.classList.remove('glitch-active');
      stageScanSequence.classList.add('hidden');

      particles.setTheme('light');
      stagePageTwo.classList.remove('hidden');
      stagePageTwo.style.opacity = '1';

      // Fade out white-flash overlay so page two content is visible and clickable
      whiteFlash.style.opacity = '0';
      setTimeout(() => {
        whiteFlash.style.display = 'none';
      }, 800);

      runPageTwoSequence();
    }, 800);
  }, 1200);
}

// Page Two typewriter animation with fallback
async function runPageTwoSequence() {
  const text1 = document.getElementById('page-two-text-1');
  const text2 = document.getElementById('page-two-text-2');
  const btnContainer = document.getElementById('page-two-btn-container');

  // Spawn landing butterfly scene
  setTimeout(() => {
    spawnLandingButterfly();
  }, 1500);

  // Clear content before typing
  text1.innerHTML = '';
  text2.innerHTML = '';
  btnContainer.style.opacity = '0';

  let sequenceFinished = false;

  // Fallback Timer: Ensure button shows after 5 seconds even if typewriter hangs
  const fallbackTimeout = setTimeout(() => {
    if (!sequenceFinished) {
      sequenceFinished = true;
      text1.innerHTML = "Guess some things aren't meant to be hacked.";
      text2.innerHTML = "They're meant to be understood.";
      btnContainer.style.opacity = '1';
    }
  }, 5000);

  try {
    // Type first line
    await typeText(text1, "Guess some things aren't meant to be hacked.", { delay: 45 });
    if (sequenceFinished) return;
    await new Promise(r => setTimeout(r, 600));

    // Type second line
    if (sequenceFinished) return;
    await typeText(text2, "They're meant to be understood.", { delay: 50 });
    if (sequenceFinished) return;

    // Show continue button
    clearTimeout(fallbackTimeout);
    sequenceFinished = true;
    btnContainer.style.opacity = '1';
  } catch (err) {
    console.error("Page Two animation error:", err);
    clearTimeout(fallbackTimeout);
    sequenceFinished = true;
    text1.innerHTML = "Some things aren't meant to be hacked.";
    text2.innerHTML = "They're meant to be understood.";
    btnContainer.style.opacity = '1';
  }
}

// STAGE 3 -> STAGE 4 (Page Two to Memory Logs)
document.getElementById('btn-page-two-continue').addEventListener('click', () => {
  audio.playKeyTick();

  const whiteFlash = document.getElementById('white-flash');
  whiteFlash.style.display = 'block';
  whiteFlash.style.opacity = '1';

  setTimeout(() => {
    particles.setTheme('dark');
    stagePageTwo.classList.add('hidden');

    whiteFlash.style.opacity = '0';
    setTimeout(() => whiteFlash.style.display = 'none', 800);

    stageMemoryLogs.classList.remove('hidden');
    setTimeout(() => {
      stageMemoryLogs.style.opacity = '1';
      runMemoryLogsSequence();
    }, 50);
  }, 500);
});

// Stagger memory cards reveal
function runMemoryLogsSequence() {
  butterflies.startSpawning();
  const cards = document.querySelectorAll('.memory-card');

  cards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('reveal-active');
      audio.playKeyTick();
    }, index * 300);
  });

  setTimeout(() => {
    const btn = document.getElementById('btn-memory-continue');
    btn.style.opacity = '1';
  }, cards.length * 300 + 400);
}

// STAGE 4 -> STAGE 5 (Memory Logs to Evidence)
document.getElementById('btn-memory-continue').addEventListener('click', () => {
  audio.playKeyTick();

  stageMemoryLogs.style.opacity = '0';
  stageMemoryLogs.style.transform = 'translateY(-10px)';

  setTimeout(() => {
    stageMemoryLogs.classList.add('hidden');
    stageEvidence.classList.remove('hidden');
    setTimeout(() => {
      stageEvidence.style.opacity = '1';
      runEvidenceSequence();
    }, 50);
  }, 700);
});

// Stagger verification typewriter question
async function runEvidenceSequence() {
  const container = document.getElementById('verify-question-container');
  const btnWrapper = document.getElementById('verify-buttons-wrapper');

  container.innerHTML = '';
  btnWrapper.style.opacity = '0';

  // Reset buttons placement to default stylesheet margins/alignment
  const btnNo = document.getElementById('btn-verify-no');
  btnNo.style.left = '';
  btnNo.style.top = '20px';
  btnNo.style.transform = '';
  btnNo.removeAttribute('disabled');

  const btnYes = document.getElementById('btn-verify-yes');
  btnYes.removeAttribute('disabled');

  await typeText(container, 'Before this mission can be completed...', { delay: 30 });
  await new Promise(r => setTimeout(r, 500));
  await typeText(container, 'One final verification is required.', { delay: 30 });
  await new Promise(r => setTimeout(r, 500));
  await typeText(container, 'You enjoy teasing me way too much.', { delay: 35 });
  await new Promise(r => setTimeout(r, 500));
  await typeText(container, 'Just accept that You love me?', { delay: 35, class: 'text-white font-bold' });

  // Show YES and NO buttons
  setTimeout(() => {
    btnWrapper.style.opacity = '1';
    setupVerificationInteractivity();
  }, 300);
}

// Setup Interactive NO and YES logic (Evasive NO updates)
function setupVerificationInteractivity() {
  const btnYes = document.getElementById('btn-verify-yes');
  const btnNo = document.getElementById('btn-verify-no');
  const wrapper = document.getElementById('verify-buttons-wrapper');
  const cardBody = document.getElementById('verification-card-body');
  const container = document.getElementById('verify-question-container');

  let noButtonAttempts = 0;
  let hasFadedOut = false;

  // Timeout fallback at 20 seconds
  const timeoutId = setTimeout(() => {
    triggerNoButtonFadeOut();
  }, 20000);

  // Trigger playful lockout fade-out
  function triggerNoButtonFadeOut() {
    if (hasFadedOut) return;
    hasFadedOut = true;
    clearTimeout(timeoutId);

    // Unbind movement proximity listeners
    cardBody.removeEventListener('mousemove', onMouseMove);

    // Animate escape lockout
    btnNo.style.transition = 'all 1.0s cubic-bezier(0.25, 0.8, 0.25, 1)';
    btnNo.style.opacity = '0';
    btnNo.style.transform = 'scale(0.3) rotate(60deg)';
    btnNo.setAttribute('disabled', 'true');

    // Smoothly center the YES button
    btnYes.style.transition = 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
    btnYes.style.left = '50%';
    btnYes.style.transform = 'translateX(-50%)';

    // Output playful teaser response below the question
    typeText(container, "😂 I think we both know that wasn't going to work.", { delay: 35, class: 'text-amber-400 font-bold mt-4 font-sans' });
  }

  // Escaping coordinates offset calculation
  function escapeNoButton() {
    if (hasFadedOut) return;

    noButtonAttempts++;
    if (noButtonAttempts >= 10) {
      triggerNoButtonFadeOut();
      return;
    }

    audio.playFailSound();

    const wrapperWidth = wrapper.clientWidth;
    const wrapperHeight = wrapper.clientHeight;
    const btnWidth = btnNo.offsetWidth;
    const btnHeight = btnNo.offsetHeight;

    // Movement boundaries
    const maxLeft = wrapperWidth - btnWidth - 15;
    const minLeft = 15;
    const maxTop = wrapperHeight - btnHeight - 15;
    const minTop = 15;

    const newLeft = Math.random() * (maxLeft - minLeft) + minLeft;
    const newTop = Math.random() * (maxTop - minTop) + minTop;

    // Apply smooth 300-400ms transition positions
    btnNo.style.transition = 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    btnNo.style.left = `${newLeft}px`;
    btnNo.style.top = `${newTop}px`;

    const rot = (Math.random() - 0.5) * 26;
    btnNo.style.transform = `rotate(${rot}deg)`;

    // Mobile Vibration
    if (navigator.vibrate) {
      navigator.vibrate([40]);
    }

    showFloatingTeaser(newLeft, newTop);
  }

  // Floating messages nearby spawner
  function showFloatingTeaser(x, y) {
    const messages = [
      "Nice try 😏",
      "Fima bums.",
      "Access denied.",
      "Professional teaser detected.",
      "You're too slow 😂"
    ];
    const msgText = messages[Math.floor(Math.random() * messages.length)];

    const span = document.createElement('span');
    span.className = 'absolute font-mono text-xs text-cyber-cyan select-none pointer-events-none z-30';
    span.innerText = msgText;
    span.style.left = `${x + 10}px`;
    span.style.top = `${y - 20}px`;
    span.style.opacity = '0';
    span.style.transition = 'all 0.6s ease-out';

    wrapper.appendChild(span);

    setTimeout(() => {
      span.style.opacity = '1';
      span.style.transform = 'translateY(-12px)';
    }, 20);

    setTimeout(() => {
      span.style.opacity = '0';
      setTimeout(() => span.remove(), 600);
    }, 1200);
  }

  // Proximity triggers on desktop
  function onMouseMove(e) {
    if (hasFadedOut) return;

    const btnRect = btnNo.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;
    const distance = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

    if (distance < 75) {
      escapeNoButton();
    }
  }

  cardBody.addEventListener('mousemove', onMouseMove);

  btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Stop click triggers instantly
    escapeNoButton();
  });

  // Freeze elements
  function freezeButtons() {
    cardBody.removeEventListener('mousemove', onMouseMove);
    btnYes.setAttribute('disabled', 'true');
    btnNo.setAttribute('disabled', 'true');
  }

  // YES Click handler
  btnYes.addEventListener('click', async () => {
    freezeButtons();
    clearTimeout(timeoutId);
    audio.playSuccessSound();

    const questionContainer = document.getElementById('verify-question-container');
    questionContainer.style.opacity = '0';
    wrapper.style.opacity = '0';

    await new Promise(r => setTimeout(r, 600));
    questionContainer.classList.add('hidden');
    wrapper.classList.add('hidden');

    const termContainer = document.getElementById('verify-terminal-container');
    termContainer.classList.remove('hidden');
    termContainer.innerHTML = '';

    await typeText(termContainer, 'Analyzing response...', { delay: 25 });
    await new Promise(r => setTimeout(r, 400));
    await typeText(termContainer, '██████████████████', { delay: 15 });
    await new Promise(r => setTimeout(r, 100));
    await typeText(termContainer, '100%', { delay: 25, class: 'text-white font-bold' });
    await new Promise(r => setTimeout(r, 1000));

    await typeText(termContainer, '😂 Analysis Complete...', { delay: 30 });
    await new Promise(r => setTimeout(r, 400));
    await typeText(termContainer, 'Fima bums...', { delay: 30, class: 'text-amber-400' });
    await new Promise(r => setTimeout(r, 450));
    await typeText(termContainer, 'You really went looking for the "No" button first, didn\'t you?', { delay: 35 });
    await new Promise(r => setTimeout(r, 550));
    await typeText(termContainer, 'Nice try, Carrots.', { delay: 35, class: 'text-cyber-cyan italic' });
    await new Promise(r => setTimeout(r, 600));
    await typeText(termContainer, 'Mission Log Updated:', { delay: 25 });
    await typeText(termContainer, '✓ Professional Teaser Confirmed', { delay: 30, class: 'text-emerald-400 font-bold' });

    // Transition out
    await new Promise(r => setTimeout(r, 3800));
    transitionToFinalMessage();
  });
}

// STAGE 5 -> STAGE 6 (Transition from Verification to Final Message)
function transitionToFinalMessage() {
  stageEvidence.style.opacity = '0';
  stageEvidence.style.transform = 'translateY(-10px)';

  // Fade in final screen background image over 3-4 seconds with slow Ken Burns scale
  const endingBg = document.getElementById('ending-background');
  const endingBgOverlay = document.getElementById('ending-background-overlay');
  if (endingBg) {
    endingBg.classList.add('active');
  }
  if (endingBgOverlay) {
    endingBgOverlay.classList.add('active');
  }

  setTimeout(() => {
    stageEvidence.classList.add('hidden');
    stageFinalMessage.classList.remove('hidden');
    setTimeout(() => {
      stageFinalMessage.style.opacity = '1';
      runFinalMessageSequence();
    }, 50);
  }, 700);
}

// Final Message Typewriter Lines
async function runFinalMessageSequence() {
  const container = document.getElementById('final-message-log');

  await typeText(container, 'You once sent me a reel and said...', { delay: 40 });
  await new Promise(r => setTimeout(r, 600));

  await typeText(container, '"If only you were this romantic."', { delay: 50, class: 'text-white font-semibold italic border-l-2 border-cyber-cyan pl-3 py-1 my-2 bg-cyber-sec/30' });
  await new Promise(r => setTimeout(r, 1200));

  await typeText(container, 'Truth is...', { delay: 40 });
  await new Promise(r => setTimeout(r, 600));

  await typeText(container, 'I could\'ve copied it.', { delay: 35 });
  await new Promise(r => setTimeout(r, 400));

  await typeText(container, 'But that would\'ve been someone else\'s idea.', { delay: 35 });
  await new Promise(r => setTimeout(r, 600));

  await typeText(container, 'So I built something instead.', { delay: 40, class: 'text-white' });
  await new Promise(r => setTimeout(r, 600));

  await typeText(container, 'Because that\'s what I know how to do.', { delay: 35 });
  await new Promise(r => setTimeout(r, 800));

  await typeText(container, 'And somehow...', { delay: 45 });
  await new Promise(r => setTimeout(r, 600));

  await typeText(container, 'making this was a lot more fun knowing it was doing it for Baby Ruth.', { delay: 45, class: 'text-cyber-cyan font-bold cyber-glow-cyan' });

  const btnCont = document.getElementById('final-btn-container');
  btnCont.style.opacity = '1';
}

// STAGE 6 -> STAGE 7 (Final Message to Exit Terminal)
document.getElementById('btn-exit-program').addEventListener('click', () => {
  audio.playGlitchSound();

  stageFinalMessage.style.opacity = '0';
  stageFinalMessage.style.transform = 'scale(0.95)';

  setTimeout(() => {
    stageFinalMessage.classList.add('hidden');
    stageEnding.classList.remove('hidden');
    setTimeout(() => {
      stageEnding.style.opacity = '1';
      runEndingSequence();
    }, 50);
  }, 700);
});

// Close logs save sequence & PS
async function runEndingSequence() {
  const container = document.getElementById('ending-terminal-log');

  await typeText(container, 'Saving Session...', { delay: 30 });
  await new Promise(r => setTimeout(r, 800));

  await typeText(container, 'favorite_person.log', { delay: 35, class: 'text-white' });
  await new Promise(r => setTimeout(r, 500));

  audio.playSuccessSound();
  await typeText(container, 'Saved Successfully.', { delay: 20, class: 'text-emerald-400 font-semibold' });

  // 5 seconds pause
  await new Promise(r => setTimeout(r, 5000));

  container.style.opacity = '0';
  setTimeout(() => {
    container.innerHTML = '';
    container.style.opacity = '1';

    // Spawn ending vertical drifting butterflies
    spawnEndingButterflies();

    document.getElementById('ending-ps-container').classList.remove('hidden');

    const psHeader = document.getElementById('ending-ps-header');
    const psBody = document.getElementById('ending-ps-body');
    const psSmile = document.getElementById('ending-ps-smile');
    const psFooter = document.getElementById('ending-ps-footer');

    setTimeout(() => {
      psHeader.style.opacity = '1';

      setTimeout(() => {
        psBody.style.opacity = '1';

        setTimeout(() => {
          psSmile.style.opacity = '1';
          psSmile.style.transform = 'scale(1.1)';
          audio.playSuccessSound();

          setTimeout(() => {
            psFooter.style.opacity = '1';
          }, 1000);
        }, 800);
      }, 1000);
    }, 300);
  }, 500);
}

// Start playing music loop as soon as the script parses/loads
