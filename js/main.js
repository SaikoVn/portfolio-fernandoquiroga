/**
 * PORTFOLIO - FERNANDO GABRIEL QUIROGA
 * Dynamic Background FX & Scroll-Driven Section Transitions
 */

(() => {
  'use strict';

  /* ======================================================================
     1. SCROLL-DRIVEN SECTION REVEAL / EXIT (APPEAR & DISAPPEAR)
     ====================================================================== */
  const initScrollTransitions = () => {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.site-nav__menu a');
    if (!sections.length) return;

    // Enable CSS transitions progressively
    document.documentElement.classList.add('js-scroll-active');

    const updateSections = () => {
      const vh = window.innerHeight;
      const scrollY = window.scrollY;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionBottom = rect.bottom;
        const sectionHeight = rect.height;

        // Calculate visibility: is the section currently active in viewport?
        // Active window: section center is within middle 70% of viewport
        const isInView = sectionTop < vh * 0.85 && sectionBottom > vh * 0.15;
        const isPassedAbove = sectionBottom <= vh * 0.15;
        const isBelow = sectionTop >= vh * 0.85;

        if (isInView) {
          section.classList.add('section--active');
          section.classList.remove('section--passed');
          section.classList.remove('section--below');

          // Highlight corresponding navbar link
          const id = section.getAttribute('id');
          if (id) {
            navLinks.forEach((link) => {
              const href = link.getAttribute('href');
              if (href === `#${id}`) {
                link.classList.add('site-nav__link--active');
              } else {
                link.classList.remove('site-nav__link--active');
              }
            });
          }
        } else if (isPassedAbove) {
          // Scrolled past upwards: disappear smoothly
          section.classList.remove('section--active');
          section.classList.add('section--passed');
          section.classList.remove('section--below');
        } else if (isBelow) {
          // Waiting below viewport: disappear smoothly
          section.classList.remove('section--active');
          section.classList.remove('section--passed');
          section.classList.add('section--below');
        }
      });
    };

    // Use IntersectionObserver as primary trigger with scroll fallback
    const observer = new IntersectionObserver(
      (entries) => {
        updateSections();
      },
      {
        root: null,
        rootMargin: '-10% 0px -10% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((sec) => observer.observe(sec));

    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateSections();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );

    // Initial check on load
    updateSections();
  };

  /* ======================================================================
     2. INTERACTIVE PARTICLES & CYBER MATRIX BACKGROUND
     ====================================================================== */
  const initBackgroundParticles = () => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles = [];
    const particleCount = 42;
    const maxDistance = 130;

    let mouse = {
      x: -1000,
      y: -1000,
      radius: 120,
    };

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.size = Math.random() * 1.8 + 1;
        // Technical hues: electric blue, cyan, subtle purple
        const colors = [
          'rgba(56, 189, 248, ', // Cyan
          'rgba(47, 129, 247, ', // Royal blue
          'rgba(99, 102, 241, ', // Indigo
        ];
        this.baseColor = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.45 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Mouse interaction: subtle repulsion
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 1.8;
          this.y -= Math.sin(angle) * force * 1.8;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.baseColor + this.alpha + ')';
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    let animationId = null;
    let isVisible = true;

    const animate = () => {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);

      // Connect near particles with laser lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.16;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(56, 139, 253, ${lineAlpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });

    window.addEventListener(
      'mousemove',
      (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      },
      { passive: true }
    );

    window.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    // Pause when tab not visible to save CPU/battery
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
      if (isVisible) {
        animate();
      } else if (animationId) {
        cancelAnimationFrame(animationId);
      }
    });

    resize();
    initParticles();
    animate();
  };

  /* ======================================================================
     3. BOOTSTRAP ON DOM READY
     ====================================================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initScrollTransitions();
      initBackgroundParticles();
    });
  } else {
    initScrollTransitions();
    initBackgroundParticles();
  }
})();
