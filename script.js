(function () {
  'use strict';

  // --- Footer year ---
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // --- Sticky header state ---
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 4);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Mobile nav toggle ---
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- Shared audio infrastructure: one hidden Audio per unique src ---
  // Any <audio> in demos + the hero play button all share the same pool,
  // so the sticky player reflects whatever is currently playing.
  const stickyPlayer = document.getElementById('sticky-player');
  const stickyPlayBtn = document.getElementById('sticky-play');
  const stickyCloseBtn = document.getElementById('sticky-close');
  const stickyTitle = document.getElementById('sticky-title');
  const stickyCurrent = document.getElementById('sticky-current');
  const stickyDuration = document.getElementById('sticky-duration');
  const stickyProgressBar = document.getElementById('sticky-progress-bar');

  let activeAudio = null;
  let activeTitle = '';

  const formatTime = (s) => {
    if (!isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, '0')}`;
  };

  const showSticky = () => {
    stickyPlayer.classList.add('is-visible');
    stickyPlayer.setAttribute('aria-hidden', 'false');
  };
  const hideSticky = () => {
    stickyPlayer.classList.remove('is-visible');
    stickyPlayer.setAttribute('aria-hidden', 'true');
  };

  const updateStickyUi = () => {
    if (!activeAudio) return;
    stickyTitle.textContent = activeTitle || 'Demo';
    stickyCurrent.textContent = formatTime(activeAudio.currentTime);
    stickyDuration.textContent = formatTime(activeAudio.duration);
    const pct = activeAudio.duration
      ? (activeAudio.currentTime / activeAudio.duration) * 100
      : 0;
    stickyProgressBar.style.width = pct + '%';
    stickyPlayBtn.classList.toggle('is-playing', !activeAudio.paused);
  };

  const wireAudio = (audio, title) => {
    audio.addEventListener('play', () => {
      // Pause any other playing audio so only one plays at a time.
      document.querySelectorAll('audio').forEach((a) => {
        if (a !== audio && !a.paused) a.pause();
      });
      activeAudio = audio;
      activeTitle = title;
      showSticky();
      updateStickyUi();
    });
    audio.addEventListener('pause', () => {
      if (activeAudio === audio) updateStickyUi();
    });
    audio.addEventListener('timeupdate', () => {
      if (activeAudio === audio) updateStickyUi();
    });
    audio.addEventListener('ended', () => {
      if (activeAudio === audio) updateStickyUi();
    });
    audio.addEventListener('loadedmetadata', () => {
      if (activeAudio === audio) updateStickyUi();
    });
  };

  // Wire every <audio> on the page using its data-title (or nearest heading).
  document.querySelectorAll('audio').forEach((audio) => {
    const title =
      audio.getAttribute('data-title') ||
      audio.closest('figure')?.querySelector('h3')?.textContent?.trim() ||
      'Demo';
    wireAudio(audio, title);
  });

  // --- Hero demo play button: creates/reuses a hidden Audio element ---
  const heroBtn = document.getElementById('hero-demo-play');
  if (heroBtn) {
    const src = heroBtn.getAttribute('data-src');
    const title = heroBtn.getAttribute('data-title') || 'Demo';
    const heroAudio = new Audio(src);
    heroAudio.preload = 'none';
    wireAudio(heroAudio, title);

    const syncHeroButton = () => {
      heroBtn.classList.toggle('is-playing', !heroAudio.paused);
      heroBtn.querySelector('.demo-play-label').textContent =
        heroAudio.paused ? 'Hear a quick demo' : 'Pause demo';
    };
    heroAudio.addEventListener('play', syncHeroButton);
    heroAudio.addEventListener('pause', syncHeroButton);
    heroAudio.addEventListener('ended', syncHeroButton);

    heroBtn.addEventListener('click', () => {
      if (heroAudio.paused) heroAudio.play();
      else heroAudio.pause();
    });
  }

  // --- Sticky player controls ---
  stickyPlayBtn.addEventListener('click', () => {
    if (!activeAudio) return;
    if (activeAudio.paused) activeAudio.play();
    else activeAudio.pause();
  });
  stickyCloseBtn.addEventListener('click', () => {
    if (activeAudio) activeAudio.pause();
    hideSticky();
  });

  // --- Only one <video> plays at a time; pause audio when a video plays ---
  document.querySelectorAll('video').forEach((video) => {
    video.addEventListener('play', () => {
      document.querySelectorAll('video').forEach((v) => {
        if (v !== video && !v.paused) v.pause();
      });
      document.querySelectorAll('audio').forEach((a) => {
        if (!a.paused) a.pause();
      });
      if (activeAudio && !activeAudio.paused) activeAudio.pause();
    });
  });

  // --- Contact form: submit to Formspree via fetch, show inline status ---
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.className = 'form-status';
      status.textContent = '';

      if (!form.checkValidity()) {
        status.className = 'form-status error';
        status.textContent = 'Please fill in your name, a valid email, and a message.';
        return;
      }

      const action = form.getAttribute('action') || '';
      if (action.includes('REPLACE_WITH_YOUR_FORMSPREE_ID')) {
        status.className = 'form-status error';
        status.textContent = 'Contact form is not configured yet. Please email kim@fudurich.com directly.';
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      try {
        const res = await fetch(action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          form.reset();
          status.className = 'form-status success';
          status.textContent = 'Thanks! Your message has been sent. I\'ll be in touch soon.';
        } else {
          const data = await res.json().catch(() => ({}));
          status.className = 'form-status error';
          status.textContent = (data && data.error) || 'Something went wrong. Please email kim@fudurich.com.';
        }
      } catch {
        status.className = 'form-status error';
        status.textContent = 'Network error. Please email kim@fudurich.com.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }
})();
