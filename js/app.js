/* ==========================================================================
   Viyan Stays — Coming Soon
   Countdown Timer + Marquee Gallery (10 Hardcoded Images)
   ========================================================================== */

(() => {
  'use strict';

  const CONFIG = {
    targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    storageKey: 'viyanStaysRooms',
    // 10 hardcoded room images — simple, instant, no async scanning
    defaultRooms: [
      './public/images/rooms/1.jpeg',
      './public/images/rooms/2.jpeg',
      './public/images/rooms/3.jpeg',
      './public/images/rooms/4.jpeg',
      './public/images/rooms/5.jpeg',
      './public/images/rooms/6.jpeg',
      './public/images/rooms/7.jpeg',
      './public/images/rooms/8.jpeg',
      './public/images/rooms/9.jpeg',
      './public/images/rooms/10.jpeg',
    ],
  };

  /* ———————————————— Countdown Timer ———————————————— */
  const countdownEl = document.getElementById('countdown');
  if (countdownEl) {
    const digits = countdownEl.querySelectorAll('.countdown-digit');

    function updateCountdown() {
      const diff = CONFIG.targetDate - new Date();
      if (diff <= 0) return setDigits(0, 0, 0, 0);

      setDigits(
        Math.floor(diff / (1000 * 60 * 60 * 24)),
        Math.floor((diff / (1000 * 60 * 60)) % 24),
        Math.floor((diff / (1000 * 60)) % 60),
        Math.floor((diff / 1000) % 60)
      );
    }

    function setDigits(d, h, m, s) {
      const vals = [d, h, m, s];
      digits.forEach((el, i) => {
        el.textContent = String(vals[i]).padStart(2, '0');
      });
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* ———————————————— Marquee Gallery ———————————————— */
  const marquee = document.getElementById('room-marquee');
  if (marquee) {
    function getRoomImages() {
      // Check localStorage for admin-uploaded overrides first
      try {
        const stored = localStorage.getItem(CONFIG.storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((r) => r.src);
          }
        }
      } catch (e) { /* ignore */ }
      // Fallback to hardcoded array
      return CONFIG.defaultRooms;
    }

    function renderMarquee() {
      const images = getRoomImages();
      // Duplicate for seamless infinite scroll
      const allImages = [...images, ...images];
      marquee.innerHTML = allImages
        .map(
          (src) => `
        <div class="w-64 md:w-80 aspect-[4/5] rounded-2xl overflow-hidden shadow-xl flex-shrink-0">
          <img src="${src}" alt="Room" class="w-full h-full object-cover" loading="lazy" />
        </div>
      `
        )
        .join('');
    }

    renderMarquee();

    // Listen for admin localStorage updates
    window.addEventListener('storage', (e) => {
      if (e.key === CONFIG.storageKey) renderMarquee();
    });
  }
})();