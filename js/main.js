/* =============================================
   RSTCOM — main.js
   Animações Premium (inspiradas em referências Pinterest)
   1. Cursor Magnético (todo o site)
   2. Sistema de Partículas no Hero (Canvas)
   3. Counter Animado + Barra de Progresso (Quem Somos)
   4. Glitch no Título de Serviços (Serviços)
   5. Magnetic Hover nos Cards
   6. Scroll Reveal com Intersection Observer
   7. 3D Tilt nos cards CTA
   8. Parallax suave no Hero
   ============================================= */

function init() {
  window.preloaderFinished = false;

  // Load hero background video immediately to hide latency behind the preloader
  const heroVideoBg = document.getElementById('heroVideoBg');
  if (heroVideoBg) {
    const vimeoSrc = heroVideoBg.getAttribute('data-vimeo-src');
    if (vimeoSrc && !heroVideoBg.querySelector('iframe')) {
      const iframe = document.createElement('iframe');
      iframe.src = vimeoSrc;
      iframe.frameBorder = "0";
      iframe.allow = "autoplay; fullscreen; picture-in-picture";
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      iframe.title = "DEMO REEL 10 ANOS RST";
      heroVideoBg.appendChild(iframe);
    }
  }

  /* ════════════════════════════════════════════
     PRELOADER INTRO
     ════════════════════════════════════════════ */
  const preloader = document.getElementById('preloader');
  const preloaderFill = document.getElementById('preloaderFill');
  const canvas = document.getElementById('preloaderCanvas');

  if (preloader && preloaderFill && canvas) {
    document.body.style.overflow = 'hidden';
    
    const ctx = canvas.getContext('2d');
    const dprScale = 0.5; // Render canvas at 50% internal resolution to guarantee 60fps on 4K/high-DPI screens
    let width = canvas.width = Math.floor(window.innerWidth * dprScale);
    let height = canvas.height = Math.floor(window.innerHeight * dprScale);

    const handlePreloaderResize = () => {
      width = canvas.width = Math.floor(window.innerWidth * dprScale);
      height = canvas.height = Math.floor(window.innerHeight * dprScale);
    };
    window.addEventListener('resize', handlePreloaderResize);

    const numStars = 40;
    const stars = [];
    const colors = [
      '#ffffff', // White
      '#00C6FF', // Cyan
      '#F45C74', // Coral
      '#3A7BD5', // Blue
      '#FFE600'  // Yellow
    ];

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 1200,
        z: Math.random() * 1000,
        size: Math.random() * 2 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let warpSpeed = 1;
    let isWarping = false;
    let animationFrameId;

    function draw() {
      if (isWarping) {
        ctx.fillStyle = 'rgba(10, 10, 10, 0.18)';
      } else {
        ctx.fillStyle = '#0A0A0A';
      }
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      stars.forEach(star => {
        star.z -= warpSpeed;

        if (star.z <= 0) {
          star.z = 1000;
          star.x = (Math.random() - 0.5) * 1200;
          star.y = (Math.random() - 0.5) * 1200;
        }

        const k = 400 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const r = star.size * k * 0.45;

          if (isWarping) {
            const prevK = 400 / (star.z + warpSpeed * 1.5);
            const pppx = star.x * prevK + cx;
            const pppy = star.y * prevK + cy;
            ctx.beginPath();
            ctx.strokeStyle = star.color;
            ctx.lineWidth = Math.min(r, 4.5);
            ctx.moveTo(px, py);
            ctx.lineTo(pppx, pppy);
            ctx.stroke();
          } else {
            ctx.fillStyle = star.color;
            const size = Math.min(r, 5);
            ctx.fillRect(px - size/2, py - size/2, size, size);
          }
        }
      });

      if (isWarping) {
        warpSpeed = Math.min(warpSpeed + 0.5, 35); // Cap warpSpeed to keep calculations and coordinate bounds stable
      }

      animationFrameId = requestAnimationFrame(draw);
    }

    draw();

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 12 + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        preloaderFill.style.width = '100%';

        // Trigger Warp Zoom transition
        setTimeout(() => {
          isWarping = true;

          setTimeout(() => {
            preloader.classList.add('fade-out');
            document.body.classList.add('loaded');
            window.preloaderFinished = true;

            // Trigger hero particles immediately as the preloader fades
            if (typeof window.triggerHeroParticles === 'function') {
              window.triggerHeroParticles();
            }

            // Trigger scroll reveal entrance transitions as the preloader fades
            if (typeof window.startScrollReveal === 'function') {
              window.startScrollReveal();
            }

            setTimeout(() => {
              document.body.style.overflow = '';
              cancelAnimationFrame(animationFrameId);
              window.removeEventListener('resize', handlePreloaderResize);
            }, 1400);
          }, 800);
        }, 400);
      } else {
        preloaderFill.style.width = progress + '%';
        warpSpeed = 1 + (progress / 15);
      }
    }, 80);
  }

  /* ════════════════════════════════════════════
     ANIMAÇÃO 1 — CURSOR MAGNÉTICO
     Ref Pinterest: efeito de cursor fluido premium
     ════════════════════════════════════════════ */
  const cursorDot  = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');

  if (cursorDot && cursorRing && window.matchMedia('(hover: hover)').matches) {
    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;
    let dotX   = 0, dotY   = 0;
    let raf;

    // Faster dot, slower ring (lag effect)
    const dotSpeed  = 0.85;
    const ringSpeed = 0.12;

    const cursorWrapper = document.querySelector('.magnetic-cursor');

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Auto dark contrast cursor inside .nova-era (white background section)
      const isInsideLightSection = e.target && e.target.closest && e.target.closest('.nova-era');
      if (isInsideLightSection) {
        cursorDot.classList.add('cursor-dark');
        cursorRing.classList.add('cursor-dark');
        if (cursorWrapper) cursorWrapper.classList.add('cursor-dark-wrapper');
      } else {
        cursorDot.classList.remove('cursor-dark');
        cursorRing.classList.remove('cursor-dark');
        if (cursorWrapper) cursorWrapper.classList.remove('cursor-dark-wrapper');
      }
    });

    function animateCursor() {
      // Lerp (linear interpolation) for smooth follow
      dotX  += (mouseX - dotX)  * dotSpeed;
      dotY  += (mouseY - dotY)  * dotSpeed;
      ringX += (mouseX - ringX) * ringSpeed;
      ringY += (mouseY - ringY) * ringSpeed;

      cursorDot.style.left  = dotX  + 'px';
      cursorDot.style.top   = dotY  + 'px';
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top  = ringY + 'px';

      raf = requestAnimationFrame(animateCursor);
    }
    raf = requestAnimationFrame(animateCursor);

    // Hover state on interactive elements
    const hoverTargets = document.querySelectorAll(
      'a, button, .nova-card, .case-item, .sc-card, .cta-3d-card, .filter-btn'
    );
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
    });

    // Click pulse
    window.addEventListener('mousedown', () => cursorRing.classList.add('click'));
    window.addEventListener('mouseup',   () => cursorRing.classList.remove('click'));

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity  = '0';
      cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity  = '1';
      cursorRing.style.opacity = '1';
    });
  }


  /* ════════════════════════════════════════════
     ANIMAÇÃO 2 — SISTEMA DE PARTÍCULAS NO HERO
     Ref Pinterest: bokeh particles / floating dots
     ════════════════════════════════════════════ */
  const heroCanvas = document.getElementById('heroParticles');
  if (heroCanvas && !window.matchMedia('(hover: none)').matches) {
    const heroCtx = heroCanvas.getContext('2d');
    let particles = [];
    let animId;
    let mouse = { x: -999, y: -999 };

    function resizeCanvas() {
      heroCanvas.width  = heroCanvas.offsetWidth;
      heroCanvas.height = heroCanvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse in hero
    heroCanvas.parentElement.addEventListener('mousemove', (e) => {
      const rect = heroCanvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    heroCanvas.parentElement.addEventListener('mouseleave', () => {
      mouse.x = -999; mouse.y = -999;
    });

    // Particle class
    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x     = Math.random() * heroCanvas.width;
        this.y     = Math.random() * heroCanvas.height;
        this.size  = Math.random() * 3 + 1;
        this.alpha = Math.random() * 0.5 + 0.1;
        this.vx    = (Math.random() - 0.5) * 0.4;
        this.vy    = (Math.random() - 0.5) * 0.4 - 0.15;
        this.color = this.pickColor();
        this.life  = 0;
        this.maxLife = Math.random() * 300 + 150;
      }
      pickColor() {
        const colors = [
          'rgba(255,255,255,',
          'rgba(255,140,66,',
          'rgba(244,92,116,',
          'rgba(0,198,255,',
          'rgba(255,230,0,'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }
      update() {
        this.life++;
        this.x += this.vx;
        this.y += this.vy;

        // Mouse repulsion
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.8;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }

        // Damping
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Fade in/out
        const halfLife = this.maxLife / 2;
        if (this.life < 40) {
          this.alpha = (this.life / 40) * 0.5;
        } else if (this.life > this.maxLife - 40) {
          this.alpha = ((this.maxLife - this.life) / 40) * 0.5;
        }

        if (this.life >= this.maxLife) this.reset();
        if (this.x < -10 || this.x > heroCanvas.width + 10 ||
            this.y < -10 || this.y > heroCanvas.height + 10) {
          this.reset();
        }
      }
      draw() {
        heroCtx.beginPath();
        heroCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        heroCtx.fillStyle = this.color + this.alpha + ')';
        heroCtx.fill();

        // Glow
        heroCtx.beginPath();
        heroCtx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        const gradient = heroCtx.createRadialGradient(
          this.x, this.y, 0, this.x, this.y, this.size * 3
        );
        gradient.addColorStop(0, this.color + (this.alpha * 0.3) + ')');
        gradient.addColorStop(1, this.color + '0)');
        heroCtx.fillStyle = gradient;
        heroCtx.fill();
      }
    }

    // Create particles
    const COUNT = Math.min(80, Math.floor(heroCanvas.width * heroCanvas.height / 8000));
    for (let i = 0; i < COUNT; i++) {
      const p = new Particle();
      p.life = Math.random() * p.maxLife; // stagger starts
      particles.push(p);
    }

    // Draw connection lines
    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const opacity = (1 - dist / 100) * 0.12;
            heroCtx.beginPath();
            heroCtx.strokeStyle = `rgba(255,255,255,${opacity})`;
            heroCtx.lineWidth = 0.5;
            heroCtx.moveTo(a.x, a.y);
            heroCtx.lineTo(b.x, b.y);
            heroCtx.stroke();
          }
        }
      }
    }

    let isAnimating = false;
    function animateParticles() {
      if (!isAnimating || !window.preloaderFinished) return;
      heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
      drawConnections();
      particles.forEach(p => { p.update(); p.draw(); });
      animId = requestAnimationFrame(animateParticles);
    }

    window.triggerHeroParticles = () => {
      if (!isAnimating && window.preloaderFinished) {
        isAnimating = true;
        animateParticles();
      }
    };

    // Pause when hero is not visible
    const heroSection = document.getElementById('home');
    const heroObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          isAnimating = false;
          if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
          }
        } else {
          if (!isAnimating && window.preloaderFinished) {
            isAnimating = true;
            animateParticles();
          }
        }
      });
    }, { threshold: 0 });
    heroObserver.observe(heroSection);
  }


  /* ════════════════════════════════════════════
     ANIMAÇÃO 3 — COUNTER ANIMADO + BARRA DE PROGRESSO
     Ref Pinterest: animated number reveal / morphing
     Local: Quem Somos
     ════════════════════════════════════════════ */
  function animateCounter(el, target, prefix = '', suffix = '', duration = 1400) {
    let start = 0;
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(ease * target);
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(update);
  }

  const statNums = document.querySelectorAll('.stat-num[data-target]');
  const statBars = document.querySelectorAll('.stat-bar-fill[data-width]');

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate all stats at once when first stat enters view
        statNums.forEach(el => {
          const target = parseInt(el.dataset.target, 10);
          const prefix = el.dataset.prefix || '';
          const suffix = el.dataset.suffix || '';
          animateCounter(el, target, prefix, suffix);
        });
        statBars.forEach(bar => {
          const width = bar.dataset.width;
          setTimeout(() => { bar.style.width = width + '%'; }, 200);
        });
        counterObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });

  if (statNums.length > 0) counterObserver.observe(statNums[0].closest('.qs-right') || statNums[0]);


  /* ════════════════════════════════════════════
     ANIMAÇÃO 4 — GLITCH EFFECT no TÍTULO SERVIÇOS
     Ref Pinterest: glitch text / distortion reveal
     Local: Serviços
     ════════════════════════════════════════════ */
  const servicosTitle = document.querySelector('.servicos-title');
  if (servicosTitle) {
    const glitchObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Trigger glitch multiple times
          function triggerGlitch() {
            servicosTitle.classList.add('glitch-active');
            setTimeout(() => servicosTitle.classList.remove('glitch-active'), 400);
          }
          triggerGlitch();
          setTimeout(triggerGlitch, 600);
          setTimeout(triggerGlitch, 1100);
          // Repeat randomly
          setInterval(() => {
            if (Math.random() > 0.6) triggerGlitch();
          }, 3500);
          glitchObserver.disconnect();
        }
      });
    }, { threshold: 0.5 });
    glitchObserver.observe(servicosTitle);
  }


  /* ════════════════════════════════════════════
     ANIMAÇÃO 5 — MAGNETIC HOVER NOS CARDS
     Ref Pinterest: magnetic pull / elastic hover
     Local: Nova Era cards + Serviço cards
     ════════════════════════════════════════════ */
  function addMagneticEffect(selector, strength = 0.3) {
    document.querySelectorAll(selector).forEach(card => {
      card.addEventListener('mousemove', (e) => {
        if (window.innerWidth <= 900) return;
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) * strength;
        const dy = (e.clientY - cy) * strength;
        card.style.transform = `translate(${dx}px, ${dy}px) scale(1.03)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)';
        setTimeout(() => { card.style.transition = ''; }, 500);
      });
    });
  }

  addMagneticEffect('.servico-icon-item', 0.25);
  addMagneticEffect('.social-link', 0.35);


  // Unused 3D Tilt for .nova-card removed to prevent conflicts with the new fanned perspective deck layout.


  /* ════════════════════════════════════════════
     ANIMAÇÃO 7 — 3D CARD TILT NOS CTA CARDS
     Local: Cases — CTA section
     ════════════════════════════════════════════ */
  document.querySelectorAll('.cta-3d-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 900) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      const rotX = (-y / rect.height) * 18;
      const rotY = ( x / rect.width)  * 18;
      card.style.transform =
        `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.08)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });


  /* ════════════════════════════════════════════
     ANIMAÇÃO 8 — SCROLL REVEAL COM INTERSECTION OBSERVER
     ════════════════════════════════════════════ */
  const revealElements = document.querySelectorAll(
    '.qs-container, .nova-era-title-block, .nova-era-left, .nova-era-center, ' +
    '.servicos-header, .servicos-carousel-viewport, .servicos-detalhes-section, ' +
    '.cases-header, .cases-filter, .cases-grid, .cases-cta-section, ' +
    '.contato-left, .contato-right, ' +
    '.footer-container'
  );

  revealElements.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = entry.target.parentElement
          ? Array.from(entry.target.parentElement.children)
          : [];
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = (idx * 80) + 'ms';
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  // Expose function globally to trigger only after preloader starts fading out
  window.startScrollReveal = () => {
    revealElements.forEach(el => revealObserver.observe(el));
  };


  /* ════════════════════════════════════════════
     NAVBAR SCROLL
     ════════════════════════════════════════════ */
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Função Throttle simples para evitar gargalos durante scroll contínuo
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  const throttledHighlightNav = throttle(highlightNav, 80);

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    throttledHighlightNav();
  }, { passive: true });

  function highlightNav() {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120)
        current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }


  /* ════════════════════════════════════════════
     HAMBURGER MENU
     ════════════════════════════════════════════ */
  const hamburger         = document.getElementById('navHamburger');
  const navLinksContainer = document.getElementById('navLinks');

  if (hamburger) {
    hamburger.addEventListener('click', () =>
      navLinksContainer.classList.toggle('open')
    );
  }
  navLinksContainer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () =>
      navLinksContainer.classList.remove('open')
    );
  });

  // Fechar menu ao clicar fora do navbar
  document.addEventListener('click', (e) => {
    const navbar = document.getElementById('navbar');
    if (navbar && !navbar.contains(e.target)) {
      navLinksContainer.classList.remove('open');
    }
  });


  /* ════════════════════════════════════════════
     CASES FILTER
     ════════════════════════════════════════════ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const caseItems  = document.querySelectorAll('.case-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      let visibleIdx = 0;
      caseItems.forEach((item) => {
        const cats = item.dataset.cat ? item.dataset.cat.split(' ') : [];
        const match = filter === 'all' || cats.includes(filter);
        if (match) {
          item.style.display = '';
          item.classList.remove('hidden');
          setTimeout(() => item.classList.add('visible'), visibleIdx * 35 + 15);
          visibleIdx++;
        } else {
          item.classList.add('hidden');
          item.style.display = 'none';
        }
      });
    });
  });

  // 🎬 CLICK HANDLER PARA ABRIR CASES NO MODAL
  caseItems.forEach(item => {
    item.addEventListener('click', () => {
      const titleEl = item.querySelector('.case-item-title');
      const tagEl = item.querySelector('.case-item-tag');
      const imgEl = item.querySelector('.case-item-img');
      const categoryClass = item.dataset.cat;
      
      if (titleEl) {
        const title = titleEl.textContent;
        const tag = tagEl ? tagEl.textContent : '';
        const imgSrc = imgEl ? imgEl.src : '';
        
        openCase(title, categoryClass, imgSrc, tag, item);
      }
    });
  });


  /* ════════════════════════════════════════════
     INTERACTIVE 3D DECK & CURSOR TRAIL ENGINE
     ════════════════════════════════════════════ */
  // 1. Original smoke trail for Nova Era
  const novaSection = document.getElementById('casos-av');
  const cursorCanvas = document.getElementById('novaCursorCanvas');

  if (novaSection && cursorCanvas) {
    const ctx = cursorCanvas.getContext('2d');
    let particles = [];
    let trailColor = 'rgba(50, 50, 50, 0.4)'; // Default soft dark-grey smoke
    let isVisible = false;
    let animId = null;

    function resize() {
      cursorCanvas.width = novaSection.offsetWidth;
      cursorCanvas.height = novaSection.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Track mouse position relative to the section
    let mouse = { x: -999, y: -999, active: false };

    novaSection.addEventListener('mousemove', (e) => {
      if (!isVisible || window.innerWidth <= 900) return;
      const rect = novaSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;

      // Spawn smoke / star dust particles
      const count = Math.min(3, Math.max(1, Math.round(Math.random() * 2)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: mouse.x,
          y: mouse.y,
          vx: (Math.random() - 0.5) * 1.8,
          vy: -Math.random() * 1.2 - 0.4,
          size: Math.random() * 8 + 4,
          color: trailColor,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.01
        });
      }

      if (!animId) {
        animate();
      }
    });

    novaSection.addEventListener('mouseleave', () => {
      mouse.active = false;
    });

    // Change trail color when hovering over deck cards
    const deckCards = novaSection.querySelectorAll('.nova-deck-card');
    deckCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        const idx = card.dataset.index;
        if (idx === '0') {
          trailColor = 'rgba(0, 198, 255, 0.6)'; // Cyan
        } else if (idx === '1') {
          trailColor = 'rgba(244, 92, 116, 0.6)'; // Coral
        } else if (idx === '2') {
          trailColor = 'rgba(255, 230, 0, 0.6)'; // Yellow
        }
      });
      card.addEventListener('mouseleave', () => {
        trailColor = 'rgba(50, 50, 50, 0.4)';
      });
    });

    function animate() {
      if (!isVisible || particles.length === 0) {
        ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
        animId = null;
        return;
      }

      ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, p.color);
        grad.addColorStop(0.3, p.color);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(animate);
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = null;
        } else if (isVisible && particles.length > 0 && !animId) {
          animate();
        }
      });
    }, { threshold: 0 });
    observer.observe(novaSection);
  }

  // 2. Glowing colored bubbles trail for Services
  const servicosSection = document.getElementById('servicos');
  const servicosCanvas = document.getElementById('servicosCursorCanvas');

  if (servicosSection && servicosCanvas) {
    const ctx = servicosCanvas.getContext('2d');
    let particles = [];
    let activeColor = '#FF5E36';
    let isVisible = false;
    let animId = null;

    const colors = ['#FF5E36', '#FFAE34', '#FF3B30', '#FF2D55', '#FFE600', '#00C6FF', '#B5179E'];

    function resize() {
      servicosCanvas.width = servicosSection.offsetWidth;
      servicosCanvas.height = servicosSection.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let mouse = { x: -999, y: -999, active: false };

    servicosSection.addEventListener('mousemove', (e) => {
      if (!isVisible || window.innerWidth <= 900) return;
      const rect = servicosSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;

      // Spawn glowing colored bubbles
      const count = Math.min(3, Math.max(1, Math.round(Math.random() * 2)));
      for (let i = 0; i < count; i++) {
        const size = Math.random() * 4.5 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        particles.push({
          x: mouse.x,
          y: mouse.y,
          vx: (Math.random() - 0.5) * 3.5,
          vy: (Math.random() - 0.5) * 3 - 0.8, // slight upward float
          size: size,
          color: color,
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015
        });
      }

      if (!animId) {
        drawTrail();
      }
    });

    servicosSection.addEventListener('mouseleave', () => {
      mouse.active = false;
    });

    // Change color based on hovered card
    const cards = servicosSection.querySelectorAll('.sc-card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        const colorsList = ['#00C6FF', '#F45C74', '#FFE600', '#B5179E', '#FF5E36'];
        const idx = parseInt(card.dataset.index) || 0;
        activeColor = colorsList[idx % colorsList.length];
      });
      card.addEventListener('mouseleave', () => {
        activeColor = '#FF5E36';
      });
    });

    function drawTrail() {
      if (!isVisible || particles.length === 0) {
        ctx.clearRect(0, 0, servicosCanvas.width, servicosCanvas.height);
        animId = null;
        return;
      }

      ctx.clearRect(0, 0, servicosCanvas.width, servicosCanvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        p.vx *= 0.98;
        p.vy *= 0.98;

        if (p.alpha <= 0 || p.size <= 0.1) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();

        p.size -= 0.05;
      }

      animId = requestAnimationFrame(drawTrail);
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = null;
        } else if (isVisible && particles.length > 0 && !animId) {
          drawTrail();
        }
      });
    }, { threshold: 0 });
    observer.observe(servicosSection);
  }


  /* ════════════════════════════════════════════
     PARALLAX SUAVE NA HERO
     ════════════════════════════════════════════ */
  const heroHolo = document.querySelector('.hero-holographic');
  if (heroHolo) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      heroHolo.style.transform = `translateY(${scrollY * 0.12}px)`;
    }, { passive: true });
  }


  /* ════════════════════════════════════════════
     FORM SUBMIT — envia e-mail organizado para contato@rstcom.com.br
     ════════════════════════════════════════════ */
  const form        = document.getElementById('contatoForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = document.getElementById('formSubmitBtn');

      const nome      = (document.getElementById('formNome')?.value      || '').trim();
      const email     = (document.getElementById('formEmail')?.value     || '').trim();
      const telefone  = (document.getElementById('formTelefone')?.value  || '').trim();
      const negocioEl = document.getElementById('formNegocio');
      const negocio   = negocioEl?.options[negocioEl.selectedIndex]?.text || '';
      const mensagem  = (document.getElementById('formMensagem')?.value  || '').trim();

      if (!nome || !email) {
        submitBtn.textContent = '⚠ Preencha nome e e-mail';
        submitBtn.style.background = 'rgba(255,80,80,0.9)';
        setTimeout(() => {
          submitBtn.textContent = 'Enviar mensagem';
          submitBtn.style.background = '';
        }, 2500);
        return;
      }

      const assunto = negocio && negocio !== 'Tipo de negócio'
        ? `[Site RST] ${negocio} — ${nome}`
        : `[Site RST] Novo contato — ${nome}`;

      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;

      // Timeout helper
      const fetchWithTimeout = (url, options, timeout = 7000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
      };

      const emailPromise = fetchWithTimeout("https://formsubmit.co/ajax/contato@rstcom.com.br", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: nome,
          email: email,
          phone: telefone || "Não informado",
          business: negocio || "Não informado",
          message: mensagem || "(nenhuma mensagem)",
          _subject: assunto,
          _replyto: email,
          _captcha: false
        })
      });

      const odooPromise = fetchWithTimeout("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: nome,
          email: email,
          phone: telefone || "",
          business: negocio || "",
          message: mensagem || ""
        })
      });

      Promise.allSettled([emailPromise, odooPromise])
      .then(results => {
        const emailSuccess = results[0].status === 'fulfilled' && results[0].value.ok;
        const odooSuccess = results[1].status === 'fulfilled' && results[1].value.ok;

        if (emailSuccess || odooSuccess) {
          formSuccess.innerHTML = "✓ Sua mensagem foi enviada! Entraremos em contato em breve.";
          formSuccess.style.color = "#00c6ff";
          formSuccess.classList.add('show');
          form.reset();
        } else {
          throw new Error("Erro no envio");
        }
      })
      .catch(error => {
        console.error("Erro no envio:", error);
        formSuccess.innerHTML = "⚠ Ocorreu um erro ao enviar. Tente novamente mais tarde.";
        formSuccess.style.color = "#ff5050";
        formSuccess.classList.add('show');
      })
      .finally(() => {
        submitBtn.textContent = 'Enviar mensagem';
        submitBtn.disabled = false;
        setTimeout(() => formSuccess.classList.remove('show'), 6000);
      });
    });
    });
  }



  /* ════════════════════════════════════════════
     SMOOTH SCROLL ÂNCORAS
     ════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* ════════════════════════════════════════════
     CONTATO INFO HOVER
     ════════════════════════════════════════════ */
  document.querySelectorAll('.contato-info-item').forEach(item => {
    item.addEventListener('mouseenter', () =>
      item.style.transform = 'translateX(8px)'
    );
    item.addEventListener('mouseleave', () =>
      item.style.transform = ''
    );
  });


  /* ════════════════════════════════════════════
     ANIMAÇÃO EXTRA — RIPPLE NOS BOTÕES
     ════════════════════════════════════════════ */
  document.querySelectorAll('.hero-cta, .telas-led-btn, .cases-cta-btn, .form-submit').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect   = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size   = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        width: ${size}px; height: ${size}px;
        left: ${e.clientX - rect.left - size/2}px;
        top:  ${e.clientY - rect.top  - size/2}px;
        background: rgba(255,255,255,.25);
        transform: scale(0);
        animation: ripple .55s linear;
        pointer-events: none;
      `;
      const existingStyle = document.getElementById('ripple-style');
      if (!existingStyle) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = '@keyframes ripple { to { transform: scale(3); opacity: 0; } }';
        document.head.appendChild(style);
      }
      const prevPos = this.style.position;
      if (!prevPos || prevPos === 'static') this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  /* ════════════════════════════════════════════
     ANIMAÇÃO EXTRA — 3D COVERFLOW CAROUSEL
     ════════════════════════════════════════════ */
  const track = document.getElementById('carouselTrack');
  const cards = Array.from(document.querySelectorAll('.sc-card'));
  const btnPrev = document.getElementById('carouselPrev');
  const btnNext = document.getElementById('carouselNext');

  if (track && cards.length > 0) {
    const n = cards.length;
    let targetProgress = 2; // center on idx 2
    let currentProgress = 2;
    let dragStartProgress = 2;
    let dragStartX = 0;
    let isDragging = false;
    let animationFrameId = null;

    // Layout configuration values
    const baseTranslateX = 170;
    const extraTranslateX = 150;

    function getCardStyles(diff) {
      const absDiff = Math.abs(diff);
      const sign = Math.sign(diff);

      let tx = 0;
      let tz = -300;
      let scale = 0.7;
      let opacity = 0;
      let zIndex = 0;
      let pointerEvents = 'none';

      if (absDiff < 1) {
        const t = absDiff;
        tx = diff * baseTranslateX;
        tz = 50 - t * 120; // 50px to -70px
        scale = 1.08 - t * 0.13; // 1.08 to 0.95
        opacity = 1 - t * 0.4; // 1.0 to 0.6
        zIndex = Math.round(10 - t * 5);
        pointerEvents = 'auto';
      } else if (absDiff < 2) {
        const t = absDiff - 1; // 0 to 1
        tx = sign * (baseTranslateX + t * extraTranslateX);
        tz = -70 - t * 80; // -70px to -150px
        scale = 0.95 - t * 0.1;
        opacity = 0.6 - t * 0.35;
        zIndex = Math.round(5 - t * 3);
        pointerEvents = 'auto';
      } else if (absDiff < 2.5) {
        const t = (absDiff - 2) * 2; // 0 to 1
        tx = sign * (baseTranslateX + extraTranslateX + t * 40);
        tz = -150 - t * 50;
        scale = 0.85 - t * 0.15;
        opacity = 0.25 - t * 0.25;
        zIndex = 1;
        pointerEvents = 'none';
      }

      // Compute final Y-rotation
      const finalRotateY = -diff * 25;

      return {
        transform: `translateX(${tx}px) translateZ(${tz}px) rotateY(${finalRotateY}deg) scale(${scale})`,
        opacity: Math.max(0, Math.min(1, opacity)),
        zIndex: zIndex,
        pointerEvents: pointerEvents
      };
    }

    function render() {
      // Loop currentProgress to range [0, n]
      let normProgress = currentProgress % n;
      if (normProgress < 0) normProgress += n;

      cards.forEach((card, i) => {
        let diff = i - normProgress;
        while (diff > n / 2) diff -= n;
        while (diff < -n / 2) diff += n;

        const styles = getCardStyles(diff);
        card.style.transform = styles.transform;
        card.style.opacity = styles.opacity;
        card.style.zIndex = styles.zIndex;
        card.style.pointerEvents = styles.pointerEvents;

        if (Math.abs(diff) < 0.5) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    }

    function animate() {
      if (isDragging) {
        currentProgress += (targetProgress - currentProgress) * 0.18;
      } else {
        currentProgress += (targetProgress - currentProgress) * 0.08;
      }

      render();

      if (Math.abs(targetProgress - currentProgress) > 0.001 || isDragging) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        currentProgress = targetProgress;
        render();
        animationFrameId = null;
      }
    }

    function startAnimation() {
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(animate);
      }
    }

    function snapToNearest() {
      targetProgress = Math.round(targetProgress);
      targetProgress = (targetProgress % n + n) % n;
      currentProgress = (currentProgress % n + n) % n;
      startAnimation();
    }

    // Touch/Drag events
    const viewport = document.getElementById('carouselViewport');
    let carouselDragMoved = false;
    if (viewport) {
      const handleStart = (e) => {
        if (e.type === 'mousedown') {
          e.preventDefault();
        }
        isDragging = true;
        dragStartX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        carouselDragMoved = false;
        dragStartProgress = targetProgress;
        viewport.style.cursor = 'grabbing';
        startAnimation();
      };

      const handleMove = (e) => {
        if (!isDragging) return;
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const deltaX = clientX - dragStartX;
        if (Math.abs(deltaX) > 6) {
          carouselDragMoved = true;
        }

        const sensitivity = 450; // pixels to scroll 1 slide
        targetProgress = dragStartProgress - (deltaX / sensitivity);
      };

      const handleEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        viewport.style.cursor = 'grab';
        snapToNearest();
      };

      viewport.addEventListener('mousedown', handleStart);
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);

      viewport.addEventListener('touchstart', handleStart, { passive: true });
      viewport.addEventListener('touchmove', handleMove, { passive: true });
      viewport.addEventListener('touchend', handleEnd);
      viewport.style.cursor = 'grab';
    }

    // Prev/Next buttons
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        targetProgress = Math.round(targetProgress) + 1;
        startAnimation();
      });
    }
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        targetProgress = Math.round(targetProgress) - 1;
        startAnimation();
      });
    }

    // Clicking slide to center it
    cards.forEach((card, idx) => {
      card.addEventListener('click', (e) => {
        if (carouselDragMoved) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        let diff = idx - (targetProgress % n);
        while (diff > n / 2) diff -= n;
        while (diff < -n / 2) diff += n;

        targetProgress = targetProgress + diff;
        startAnimation();
      });
    });

    // Mouse wheel support
    let lastWheelTime = 0;
    if (viewport) {
      viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const now = performance.now();
        if (now - lastWheelTime < 250) return;

        lastWheelTime = now;
        if (e.deltaX > 10 || e.deltaY > 10) {
          targetProgress = Math.round(targetProgress) + 1;
        } else if (e.deltaX < -10 || e.deltaY < -10) {
          targetProgress = Math.round(targetProgress) - 1;
        }
        startAnimation();
      }, { passive: false });
    }

    // 3D Tilt on active card
    document.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 900) return;
      if (isDragging) return;
      const activeCard = document.querySelector('.sc-card.active');
      if (!activeCard) return;

      const rect = activeCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        const rotX = -((y - rect.height / 2) / rect.height) * 15;
        const rotY = ((x - rect.width / 2) / rect.width) * 15;
        activeCard.style.transform = `translateX(0) translateZ(50px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.1)`;
      } else {
        if (Math.abs(targetProgress - currentProgress) < 0.01) {
          activeCard.style.transform = `translateX(0) translateZ(50px) rotateY(0deg) scale(1.08)`;
        }
      }
    });

    // Interactive details list hovers (Dynamic Visual Preview Panel)
    // With dual-image crossfade: after hovering for 2.5s, switches to 2nd image and keeps cycling
    const detalheItems = document.querySelectorAll('.detalhe-item');
    const previewPanes = document.querySelectorAll('.preview-pane');

    // Map each service to its two images (relative paths from css/ — corrected to root-relative)
    const serviceImages = {
      webinars: [
        "assets/SEÇÃO SERVIÇOS/webinar e eventos híbridos/rs=w_1280,h_720.webp",
        "assets/SEÇÃO SERVIÇOS/webinar e eventos híbridos/rs=w_1240,h_620,cg_true.webp"
      ],
      estandes: [
        "assets/SEÇÃO SERVIÇOS/Confecção de Estande/rs=w_1280,h_853.webp",
        "assets/SEÇÃO SERVIÇOS/Confecção de Estande/rs=w_1280,h_853 (1).webp"
      ],
      realidade: [
        "assets/SEÇÃO SERVIÇOS/Realidade Aumentada/download (2).webp",
        "assets/SEÇÃO SERVIÇOS/Realidade Aumentada/download (3).webp"
      ],
      mapping: [
        "assets/SEÇÃO SERVIÇOS/Mapping/cr=w_1240,h_620.webp",
        "assets/SEÇÃO SERVIÇOS/Mapping/rs=w_984,h_984 (2).webp"
      ],
      led: [
        "assets/SEÇÃO SERVIÇOS/Telas de led/rs=w_1240,h_620,cg_true.webp",
        "assets/SEÇÃO SERVIÇOS/Telas de led/5.jpg"
      ]
    };

    let currentSwitchTimer = null;
    let currentCycleTimer = null;

    function stopImageCycle() {
      if (currentSwitchTimer) { clearTimeout(currentSwitchTimer); currentSwitchTimer = null; }
      if (currentCycleTimer) { clearInterval(currentCycleTimer); currentCycleTimer = null; }
    }

    function startImageCycle(pane, images) {
      // Show image 1 as base
      pane.style.backgroundImage = `url('${images[0]}')`;
      pane.style.setProperty('--after-bg', `url('${images[1]}')`);
      pane.classList.remove('img-switching');

      let showingSecond = false;

      function toggleImage() {
        showingSecond = !showingSecond;
        if (showingSecond) {
          // Crossfade to image 2 via ::after
          pane.style.setProperty('--after-bg', `url('${images[1]}')`);
          pane.classList.add('img-switching');
        } else {
          // Crossfade back to image 1
          pane.classList.remove('img-switching');
          // After transition finishes, swap base so ::after can re-enter
          setTimeout(() => {
            pane.style.backgroundImage = `url('${images[0]}')`;
          }, 700);
        }
      }

      // Start switching after 2.5s, then cycle every 2.5s
      currentSwitchTimer = setTimeout(() => {
        toggleImage();
        currentCycleTimer = setInterval(toggleImage, 2500);
      }, 2500);
    }

    // Auto-rotation variables
    const serviceIds = ['webinars', 'estandes', 'realidade', 'mapping', 'led'];
    let autoRotateIndex = 0;
    let autoRotateInterval = null;
    let resumeAutoRotateTimeout = null;

    function showService(previewId) {
      // Stop current image cycle
      stopImageCycle();

      // Deactivate all panes
      previewPanes.forEach(pane => {
        pane.classList.remove('active', 'img-switching');
      });
      const defaultPane = document.querySelector('.default-pane');
      if (defaultPane) defaultPane.classList.remove('active');

      // Highlight text item
      detalheItems.forEach(item => {
        if (item.dataset.preview === previewId) {
          item.classList.add('active-highlight');
        } else {
          item.classList.remove('active-highlight');
        }
      });

      // Activate preview pane
      const targetPane = document.querySelector(`.${previewId}-pane`);
      if (targetPane) {
        targetPane.classList.add('active');

        // Start image cycle if images exist
        const images = serviceImages[previewId];
        if (images && images.length >= 2) {
          startImageCycle(targetPane, images);
        }
      }
    }

    function startAutoRotation() {
      stopAutoRotation();
      autoRotateInterval = setInterval(() => {
        autoRotateIndex = (autoRotateIndex + 1) % serviceIds.length;
        showService(serviceIds[autoRotateIndex]);
      }, 4500); // 4.5 seconds per service rotation
    }

    function stopAutoRotation() {
      if (autoRotateInterval) { clearInterval(autoRotateInterval); autoRotateInterval = null; }
      if (resumeAutoRotateTimeout) { clearTimeout(resumeAutoRotateTimeout); resumeAutoRotateTimeout = null; }
    }

    detalheItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        const previewId = item.dataset.preview;
        if (!previewId) return;

        // Stop auto rotation and show hovered item immediately
        stopAutoRotation();
        
        // Sync index so we resume from the hovered one
        const idx = serviceIds.indexOf(previewId);
        if (idx !== -1) autoRotateIndex = idx;

        showService(previewId);
      });
    });

    // Resume auto-rotation when mouse leaves list container
    const listContainer = document.querySelector('.detalhes-lista-container');
    if (listContainer) {
      listContainer.addEventListener('mouseleave', () => {
        stopAutoRotation();
        resumeAutoRotateTimeout = setTimeout(() => {
          startAutoRotation();
        }, 2000); // Resume auto-rotation after 2 seconds of inactivity
      });
    }

    // Start auto-rotation on load
    showService(serviceIds[0]);
    startAutoRotation();

    // Initial positioning
    render();
  }

  /* ════════════════════════════════════════════
     ANIMAÇÃO EXTRA — CASES CTA 3D STACKED CAROUSEL
     ════════════════════════════════════════════ */
  const ctaViewport = document.getElementById('casesCtaViewport');
  const ctaCards = Array.from(document.querySelectorAll('.cta-3d-card'));

  if (ctaViewport && ctaCards.length > 0) {
    const N = ctaCards.length;
    let targetProgress = 0;
    let currentProgress = 0;
    let hoverProgress = 0; // 0 = stacked, 1 = spreaded (hovered)
    let targetHover = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartProgress = 0;
    let animationFrameId = null;

    // Piecewise coordinate system based on relative diff and hoverProgress
    function getCardStyles(diff, h) {
      // Stacked State coordinates (h = 0)
      let tx_s = 0, ty_s = 0, tz_s = 0;
      let rx_s = 0, ry_s = 0, rz_s = 0;
      let op_s = 0;
      let zi_s = 0;

      // Spreaded State coordinates (h = 1)
      let tx_p = 0, ty_p = 0, tz_p = 0;
      let rx_p = 0, ry_p = 0, rz_p = 0;
      let op_p = 0;
      let zi_p = 0;

      // 1. Compute Stacked values
      if (diff >= 0 && diff <= 3) {
        tx_s = diff * 12;
        ty_s = diff * 8;
        tz_s = diff * -40;
        rx_s = 4 - diff * 2;
        ry_s = -8 + diff * 7;
        rz_s = -4 + diff * 2;
        op_s = 1 - diff * 0.15;
        zi_s = Math.round(10 - diff * 2);
      } else if (diff < 0) {
        // Fly-out to the left when swiped/pulled
        const t = Math.max(-1, diff); // cap fly-out range
        tx_s = t * 320;
        ty_s = t * -20;
        tz_s = t * -50 + 50; // comes forward slightly then goes back
        rx_s = 4 + t * 15;
        ry_s = -8 + t * 45;
        rz_s = -4 + t * 10;
        op_s = 1 + diff; // fades out quickly as diff goes negative
        zi_s = 12; // keep above others during swipe
      } else {
        // Cards far behind in the stack
        tx_s = 36;
        ty_s = 24;
        tz_s = -120 - (diff - 3) * 30;
        rx_s = -2;
        ry_s = 13;
        rz_s = 2;
        op_s = Math.max(0, 0.55 - (diff - 3) * 0.2);
        zi_s = 1;
      }

      // 2. Compute Spreaded (Coverflow) values
      if (diff >= -2.5 && diff <= 2.5) {
        // Horizontal distribution
        tx_p = diff * 190;
        ty_p = Math.abs(diff) * 12; // slight V-shape layout
        tz_p = -Math.abs(diff) * 60 + 30; // center is closer to viewer
        rx_p = 10 - Math.abs(diff) * 2;
        ry_p = -diff * 22; // rotate outwards
        rz_p = -diff * 4;
        op_p = 1 - Math.max(0, Math.abs(diff) - 1.5) * 0.5; // fade outer cards
        zi_p = Math.round(10 - Math.abs(diff) * 2);
      } else {
        // Hide off-screen cards
        const sign = Math.sign(diff);
        tx_p = sign * 500;
        ty_p = 30;
        tz_p = -250;
        rx_p = 5;
        ry_p = -sign * 45;
        rz_p = -sign * 10;
        op_p = 0;
        zi_p = 0;
      }

      // 3. Interpolate between Stacked (0) and Spreaded (1) using h
      const tx = (1 - h) * tx_s + h * tx_p;
      const ty = (1 - h) * ty_s + h * ty_p;
      const tz = (1 - h) * tz_s + h * tz_p;
      const rx = (1 - h) * rx_s + h * rx_p;
      const ry = (1 - h) * ry_s + h * ry_p;
      const rz = (1 - h) * rz_s + h * rz_p;
      const opacity = Math.max(0, Math.min(1, (1 - h) * op_s + h * op_p));
      const zIndex = Math.round((1 - h) * zi_s + h * zi_p);

      // Only allow pointer-events on the center-ish card in coverflow,
      // or the front-most card in stacked mode
      let pointerEvents = 'none';
      if (h > 0.5) {
        if (Math.abs(diff) < 1.1) pointerEvents = 'auto';
      } else {
        if (Math.abs(diff) < 0.5) pointerEvents = 'auto';
      }

      return {
        transform: `translate3d(${tx}px, ${ty}px, ${tz}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
        opacity: opacity,
        zIndex: zIndex,
        pointerEvents: pointerEvents
      };
    }

    function render() {
      let normProgress = currentProgress % N;
      if (normProgress < 0) normProgress += N;

      ctaCards.forEach((card, i) => {
        let diff = i - normProgress;
        // Find shortest path wrap-around
        while (diff > N / 2) diff -= N;
        while (diff < -N / 2) diff += N;

        const styles = getCardStyles(diff, hoverProgress);
        card.style.transform = styles.transform;
        card.style.opacity = styles.opacity;
        card.style.zIndex = styles.zIndex;
        card.style.pointerEvents = styles.pointerEvents;

        if (Math.abs(diff) < 0.5) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    }

    function animate() {
      // Smoothly interpolate currentProgress and hoverProgress
      const progressDamp = isDragging ? 0.18 : 0.08;
      currentProgress += (targetProgress - currentProgress) * progressDamp;
      hoverProgress += (targetHover - hoverProgress) * 0.08;

      render();

      const progressDiff = Math.abs(targetProgress - currentProgress);
      const hoverDiff = Math.abs(targetHover - hoverProgress);

      if (progressDiff > 0.001 || hoverDiff > 0.001 || isDragging) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        currentProgress = targetProgress;
        hoverProgress = targetHover;
        render();
        animationFrameId = null;
      }
    }

    function startAnimation() {
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(animate);
      }
    }

    function snapToNearest() {
      targetProgress = Math.round(targetProgress);
      // Infinite carousel indexing
      targetProgress = (targetProgress % N + N) % N;
      currentProgress = (currentProgress % N + N) % N;
      startAnimation();
    }

    // Touch & Drag interaction handlers
    ctaViewport.ctaDragMoved = false;
    const handleStart = (e) => {
      if (e.type === 'mousedown') {
        e.preventDefault();
      }
      isDragging = true;
      dragStartX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      ctaViewport.ctaDragMoved = false;
      dragStartProgress = targetProgress;
      ctaViewport.style.cursor = 'grabbing';
      startAnimation();
    };

    const handleMove = (e) => {
      if (!isDragging) return;
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - dragStartX;
      if (Math.abs(deltaX) > 6) {
        ctaViewport.ctaDragMoved = true;
      }
      const sensitivity = 360; // Pixels to scroll 1 slide
      targetProgress = dragStartProgress - (deltaX / sensitivity);
    };

    const handleEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      ctaViewport.style.cursor = 'grab';
      snapToNearest();
    };

    ctaViewport.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    ctaViewport.addEventListener('touchstart', handleStart, { passive: true });
    ctaViewport.addEventListener('touchmove', handleMove, { passive: true });
    ctaViewport.addEventListener('touchend', handleEnd);

    // Mouseenter / Mouseleave for fanning/spreading layout
    ctaViewport.addEventListener('mouseenter', () => {
      targetHover = 1;
      startAnimation();
    });

    ctaViewport.addEventListener('mouseleave', () => {
      targetHover = 0;
      startAnimation();
    });

    // Click to center cards
    ctaCards.forEach((card, idx) => {
      card.addEventListener('click', (e) => {
        if (ctaViewport.ctaDragMoved) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        let diff = idx - (targetProgress % N);
        while (diff > N / 2) diff -= N;
        while (diff < -N / 2) diff += N;

        targetProgress = targetProgress + diff;
        startAnimation();
      });
    });

    // Mouse wheel support
    let lastWheelTime = 0;
    ctaViewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheelTime < 250) return;
      lastWheelTime = now;

      if (e.deltaX > 10 || e.deltaY > 10) {
        targetProgress = Math.round(targetProgress) + 1;
      } else if (e.deltaX < -10 || e.deltaY < -10) {
        targetProgress = Math.round(targetProgress) - 1;
      }
      startAnimation();
    }, { passive: false });

    // Active Card 3D tilt on mouse hover
    ctaViewport.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 900) return;
      if (isDragging) return;
      const activeCard = ctaViewport.querySelector('.cta-3d-card.active');
      if (!activeCard) return;

      const rect = activeCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        const rotX = -((y - rect.height / 2) / rect.height) * 12;
        const rotY = ((x - rect.width / 2) / rect.width) * 12;
        
        // Base transform coordinates for active center card
        const baseH = hoverProgress;
        const tx = baseH * 0; // center
        const ty = baseH * 0;
        const tz = (1 - baseH) * 0 + baseH * 30; // 30px offset when hovered
        
        activeCard.style.transform = `translate3d(${tx}px, ${ty}px, ${tz + 40}px) rotateX(${rotX + 4}deg) rotateY(${rotY}deg) scale(1.06)`;
      } else {
        // Render will restore the default position when target matches progress
        if (Math.abs(targetProgress - currentProgress) < 0.01) {
          render();
        }
      }
    });

    // Initial render
    render();
  }

  /* ════════════════════════════════════════════
     RST NEWS - INTERACTIVE NEWSLETTER
     ════════════════════════════════════════════ */
  const newsForm = document.getElementById('newsForm');
  const newsEmailInput = document.getElementById('newsEmail');
  const newsStatusMsg = document.getElementById('newsStatusMsg');
  const newsSubmitBtn = document.getElementById('newsSubmitBtn');
  const newsDeck = document.getElementById('newsDeck');
  const newsPrevBtn = document.getElementById('newsPrevBtn');
  const newsNextBtn = document.getElementById('newsNextBtn');
  const newsDeckDots = document.getElementById('newsDeckDots');
  const newsTopicBadges = document.querySelectorAll('.news-topic-badge');

  // Newsletter Deck states
  if (newsDeck) {
    const newsCards = Array.from(newsDeck.querySelectorAll('.news-card-edition'));
    const totalNewsCards = newsCards.length;
    let currentNewsIndex = 0;


    function renderNewsDeck(index) {
      newsCards.forEach((card, i) => {
        card.classList.remove('active');
        // Calculate offset relative to active card
        let diff = i - index;
        
        // 3D positioning
        if (diff === 0) {
          card.classList.add('active');
          card.style.transform = 'translate3d(0, 0, 0) rotateY(0deg) scale(1)';
          card.style.opacity = '1';
          card.style.zIndex = '5';
          card.style.pointerEvents = 'auto';
        } else if (diff === 1 || (diff === -(totalNewsCards - 1) && totalNewsCards > 2)) {
          card.style.transform = 'translate3d(30px, 0, -60px) rotateY(-8deg) scale(0.92)';
          card.style.opacity = '0.65';
          card.style.zIndex = '3';
          card.style.pointerEvents = 'none';
        } else if (diff === -1 || (diff === (totalNewsCards - 1) && totalNewsCards > 2)) {
          card.style.transform = 'translate3d(-30px, 0, -60px) rotateY(8deg) scale(0.92)';
          card.style.opacity = '0.65';
          card.style.zIndex = '3';
          card.style.pointerEvents = 'none';
        } else {
          card.style.transform = 'translate3d(0, 0, -120px) scale(0.8)';
          card.style.opacity = '0';
          card.style.zIndex = '1';
          card.style.pointerEvents = 'none';
        }
      });

      // Update dots
      if (newsDeckDots) {
        const dots = Array.from(newsDeckDots.querySelectorAll('.deck-dot'));
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === index);
        });
      }


    }

    function changeNewsCard(nextIndex) {
      currentNewsIndex = (nextIndex + totalNewsCards) % totalNewsCards;
      renderNewsDeck(currentNewsIndex);
    }

    // Prev / Next bindings
    if (newsPrevBtn) {
      newsPrevBtn.addEventListener('click', () => changeNewsCard(currentNewsIndex - 1));
    }
    if (newsNextBtn) {
      newsNextBtn.addEventListener('click', () => changeNewsCard(currentNewsIndex + 1));
    }

    // Dots binding
    if (newsDeckDots) {
      newsDeckDots.querySelectorAll('.deck-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          const idx = parseInt(dot.dataset.index, 10);
          changeNewsCard(idx);
        });
      });
    }

    // Topics badges binding (toggles selection)
    newsTopicBadges.forEach(badge => {
      badge.addEventListener('click', () => {
        badge.classList.toggle('active');
      });
    });

    // Hover cards direct click centering
    newsCards.forEach((card, idx) => {
      card.addEventListener('click', () => {
        if (idx !== currentNewsIndex) changeNewsCard(idx);
      });
    });

    // Auto-advance news deck every 8 seconds
    let newsInterval = setInterval(() => changeNewsCard(currentNewsIndex + 1), 8000);
    const stopNewsAuto = () => clearInterval(newsInterval);
    const startNewsAuto = () => {
      clearInterval(newsInterval);
      newsInterval = setInterval(() => changeNewsCard(currentNewsIndex + 1), 8000);
    };

    newsDeck.parentElement.addEventListener('mouseenter', stopNewsAuto);
    newsDeck.parentElement.addEventListener('mouseleave', startNewsAuto);

    // Initial render of newsletter deck
    renderNewsDeck(currentNewsIndex);
  }

  // Newsletter Consent Modal elements
  const newsConsentModal = document.getElementById('newsConsentModal');
  const closeNewsModalBtn = document.getElementById('closeNewsModalBtn');
  const consentCheckbox = document.getElementById('consentCheckbox');
  const confirmNewsBtn = document.getElementById('confirmNewsBtn');
  const newsModalContent = document.querySelector('#newsConsentModal .news-modal-content');
  const newsModalContainer = document.querySelector('#newsConsentModal .news-modal-container');
  const newsNameInput = document.getElementById('newsName');

  let pendingEmail = '';
  let pendingName = '';

  if (newsForm && newsConsentModal) {
    newsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = newsEmailInput.value.trim();
      const name = newsNameInput ? newsNameInput.value.trim() : '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // Status message reset
      newsStatusMsg.classList.remove('show', 'success', 'error');

      if (!name) {
        newsStatusMsg.textContent = '✗ Por favor, insira seu nome.';
        newsStatusMsg.classList.add('show', 'error');
        if (newsNameInput) {
          newsNameInput.classList.add('shake');
          setTimeout(() => newsNameInput.classList.remove('shake'), 500);
        }
        return;
      }

      if (!emailRegex.test(email)) {
        newsStatusMsg.textContent = '✗ Insira um e-mail corporativo válido.';
        newsStatusMsg.classList.add('show', 'error');
        newsEmailInput.classList.add('shake');
        setTimeout(() => newsEmailInput.classList.remove('shake'), 500);
        return;
      }

      // Store values in memory
      pendingEmail = email;
      pendingName = name;

      // Reset modal inputs state before showing
      consentCheckbox.checked = false;
      consentCheckbox.disabled = false;
      confirmNewsBtn.disabled = true;
      
      // Clear any previous success screen
      const successScreen = newsConsentModal.querySelector('.news-modal-success');
      if (successScreen) successScreen.remove();
      newsModalContent.style.display = 'flex';

      // Open Modal
      newsConsentModal.classList.add('active');
    });

    // Toggle button active state based on checkbox check
    if (consentCheckbox && confirmNewsBtn) {
      consentCheckbox.addEventListener('change', () => {
        confirmNewsBtn.disabled = !consentCheckbox.checked;
      });
    }

    // Modal Close
    const closeModal = () => {
      newsConsentModal.classList.remove('active');
    };

    if (closeNewsModalBtn) {
      closeNewsModalBtn.addEventListener('click', closeModal);
    }
    const modalOverlay = newsConsentModal.querySelector('.news-modal-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', closeModal);
    }

    // Confirm button
    if (confirmNewsBtn) {
      confirmNewsBtn.addEventListener('click', () => {
        confirmNewsBtn.disabled = true;
        consentCheckbox.disabled = true;
        
        // Show sending state
        const originalText = confirmNewsBtn.textContent;
        confirmNewsBtn.textContent = 'Processando...';

        // Send to Vercel Serverless Odoo API
        fetch('/api/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: pendingName,
            email: pendingEmail
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Server error');
          }
          return response.json();
        })
        .then(data => {
          // Reset inputs on the main form to allow subsequent signups
          if (newsEmailInput) {
            newsEmailInput.disabled = false;
            newsEmailInput.value = '';
          }
          if (newsNameInput) {
            newsNameInput.disabled = false;
            newsNameInput.value = '';
          }

          if (newsStatusMsg) {
            newsStatusMsg.textContent = '✓ Cadastro efetuado com sucesso!';
            newsStatusMsg.classList.add('show', 'success');
            // Clear status message after a few seconds
            setTimeout(() => {
              newsStatusMsg.classList.remove('show', 'success');
              newsStatusMsg.textContent = '';
            }, 4000);
          }

          // Switch to success screen
          newsModalContent.style.display = 'none';

          const successContainer = document.createElement('div');
          successContainer.className = 'news-modal-success';
          successContainer.innerHTML = `
            <div class="success-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width: 28px; height: 28px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 class="news-modal-title">Inscrição Concluída!</h3>
            <p class="news-modal-text">Obrigado por se inscrever, <strong>${pendingName}</strong>. Em breve você começará a receber nossas novidades.</p>
            <button class="news-modal-confirm-btn" id="successCloseBtn">Fechar</button>
          `;

          newsModalContainer.appendChild(successContainer);

          const successCloseBtn = document.getElementById('successCloseBtn');
          if (successCloseBtn) {
            successCloseBtn.addEventListener('click', () => {
              closeModal();
              consentCheckbox.disabled = false;
            });
          }
        })
        .catch(err => {
          console.error('Error subscribing to newsletter:', err);
          alert('Ocorreu um erro ao processar sua inscrição. Por favor, tente novamente mais tarde.');
          confirmNewsBtn.disabled = false;
          consentCheckbox.disabled = false;
        })
        .finally(() => {
          confirmNewsBtn.textContent = originalText;
        });
      });
    }
  }


  /* ════════════════════════════════════════════
     CASE DETAILS SYSTEM & MODAL INTERACTION
     ════════════════════════════════════════════ */
  const caseModal = document.getElementById('caseModal');
  const caseModalClose = document.getElementById('caseModalClose');
  const caseModalOverlay = document.getElementById('caseModalOverlay');
  const caseModalTitle = document.getElementById('caseModalTitle');
  const caseModalTag = document.getElementById('caseModalTag');
  const caseModalDesc = document.getElementById('caseModalDesc');
  const caseModalChallenge = document.getElementById('caseModalChallenge');
  const caseModalClient = document.getElementById('caseModalClient');
  const caseModalDate = document.getElementById('caseModalDate');
  const caseModalLocation = document.getElementById('caseModalLocation');
  const caseModalTechPills = document.getElementById('caseModalTechPills');
  const caseModalGalleryGrid = document.getElementById('caseModalGalleryGrid');
  const caseModalHeroBg = document.getElementById('caseModalHeroBg');
  const caseModalHeroVideoWrapper = document.getElementById('caseModalHeroVideoWrapper');
  const caseModalCtaBtn = document.getElementById('caseModalCtaBtn');

  /* ════════════════════════════════════════════════════════════════════════════════
     📋 GUIA PARA ADICIONAR/EDITAR CASES
     ════════════════════════════════════════════════════════════════════════════════
     
     INSTRUÇÕES:
     
     1. Cada case é uma chave dentro do objeto "casesDb" abaixo
     2. A chave deve ser o "slug" do nome (ex: "beauty-fair-bauny")
     3. Preencha os campos conforme descrito abaixo:
     
     ───────────────────────────────────────────────────────────────────────────────
     CAMPOS DISPONÍVEIS:
     ───────────────────────────────────────────────────────────────────────────────
     
     ✓ title (string) 
       → Nome do case que aparece no modal
       → Exemplo: "Beauty Fair Bauny"
     
     ✓ client (string)
       → Nome do cliente
       → Exemplo: "Grupo Bauny"
     
     ✓ date (string)
       → Data ou período do evento
       → Exemplo: "Março 2024" ou "2024"
     
     ✓ location (string)
       → Local do evento
       → Exemplo: "São Paulo, SP"
     
     ✓ tag (string)
       → Categoria do case (aparece no modal)
       → Opções: "Festival", "Convenção", "Corporativo & B2B", "Lançamento", "Feira"
     
     ✓ desc (string)
       → Descrição completa do projeto
       → O que foi feito, escopo, resultados
       → Mínimo 1-2 parágrafos
     
     ✓ challenge (string)
       → Qual era o desafio técnico/criativo
       → Como foi resolvido
     
     ✓ techs (array de strings)
       → Tecnologias/serviços utilizados
       → Exemplo: ["Painéis LED", "Som Surround", "Motion Graphics"]
       → Mínimo 3-5 itens
     
  /* ════════════════════════════════════════════════════════════════════════════════
     DOCUMENTAÇÃO DO BANCO DE DADOS DE CASES
     ════════════════════════════════════════════════════════════════════════════════
     Este banco de dados (casesDb) contém os detalhes de cada case para exibição no modal.
     Cada item deve ter a estrutura abaixo:
     
     "slug-do-case": {
       client: "Nome do Cliente",
       date: "Ano ou Mês/Ano",
       location: "Cidade, UF",
       tag: "Categoria Exibida",
       title: "Título do Case",
       desc: "Descrição detalhada...",
       challenge: "Desafio técnico...",
       techs: ["Tecnologia 1", "Tecnologia 2"],
       media: ["caminho/imagem1.jpg", "caminho/imagem2.jpg"],
       video: true/false,
       videoSrc: "caminho/video.mp4",
       category: "categoria-de-filtro"
     }
     ════════════════════════════════════════════════════════════════════════════════
  */

  const casesDb = {
    "d2c-summit": {
      client: "Nuvemshop",
      date: "Outubro 2025",
      location: "VIBRA São Paulo, SP",
      tag: "Captação, Corporativo & B2B",
      title: "D2C SUMMIT",
      desc: "O Nuvemshop D2C Summit é o maior evento voltado a marcas de venda direta ao consumidor no Brasil. A RSTCOM foi responsável pela montagem de painéis de LED curvos gigantescos de alta definição e de uma cenografia digital imersiva, integrando tecnologia de vídeo de ponta com um ambiente elegante e focado em negócios.",
      challenge: "Instalar e calibrar painéis de LED curvos monumentais integrados a servidores de mídia de baixa latência em um palco de grande porte com sincronia de áudio Dolby Atmos.",
      techs: ["Painéis LED P1.8", "Servidores de Mídia Dedicados", "Cenografia Digital Curva", "Som Dolby Atmos", "Processadores Calibre"],
      media: [
        "assets/SEÇÃO AUDIOVISUAL/D2C SUMMIT/WhatsApp Image 2025-09-30 at 10.34.11 (1).jpeg",
        "assets/SEÇÃO AUDIOVISUAL/D2C SUMMIT/WhatsApp Image 2025-09-30 at 10.34.21 (1).jpeg",
        "assets/SEÇÃO AUDIOVISUAL/D2C SUMMIT/WhatsApp Image 2025-09-30 at 10.34.29 (1).jpeg"
      ],
      vimeoId: "1204604687",
      vimeoHash: "79d2c53bdb",
      video: true,
      videoSrc: "",
      category: "captacao b2b"
    },
    "anbima": {
      client: "ANBIMA",
      date: "Dezembro 2025",
      location: "Grand Hyatt, SP",
      tag: "Captação",
      title: "ANBIMA",
      desc: "O Encontro Anual da ANBIMA é o principal fórum de debate sobre o mercado de capitais no Brasil. Para este projeto, a RSTCOM desenvolveu um sistema híbrido de transmissão ao vivo de alta disponibilidade, aliado a painéis de LED panorâmicos no auditório físico, garantindo que investidores e palestrantes globais estivessem perfeitamente integrados.",
      challenge: "Proporcionar uma transmissão interativa de ultra-baixa latência integrada à cenografia do palco físico e gerenciar múltiplos canais de áudio de tradução simultânea.",
      techs: ["Transmissão WebRTC", "Painel LED 18x3.5m", "Sonorização de Auditório", "Câmeras 4K PTZ", "NDI IP Video Roteamento"],
      media: [
        "assets/SEÇÃO AUDIOVISUAL/ANBIMA/WhatsApp Image 2025-12-19 at 13.55.06 (1).jpeg",
        "assets/SEÇÃO AUDIOVISUAL/ANBIMA/WhatsApp Image 2025-12-19 at 13.55.20.jpeg"
      ],
      vimeoId: "1204604953",
      vimeoHash: "0e727372bb",
      video: true,
      videoSrc: "",
      category: "captacao"
    },
    "ernest-young": {
      client: "EY (Ernst & Young)",
      date: "Outubro 2025",
      location: "WTC Golden Hall, SP",
      tag: "Captação, Corporativo",
      title: "ERNEST YOUNG",
      desc: "A tradicional premiação e convenção anual da Ernst & Young (EY) reuniu os principais líderes empresariais da América Latina. A RSTCOM projetou toda a engenharia de audiovisual do evento, entregando painéis de LED curvos de alta definição, sonorização profissional com calibração acústica avançada para atrações musicais e orquestra ao vivo, além de direção multicâmera e transmissão global.",
      challenge: "Capturar e sonorizar uma orquestra ao vivo no palco secundário em sincronia perfeita com as exibições de mídia de alta definição no painel de LED principal, mantendo a precisão na transmissão de vídeo e o timecode das luzes.",
      techs: ["Direção Multicâmera NDI", "Sonorização de Orquestra", "Painéis LED P1.5", "Iluminação Robótica", "Timecode SMPTE"],
      media: [
        "assets/SEÇÃO AUDIOVISUAL/ERNEST YOUNG/WhatsApp Image 2025-10-28 at 20.46.35.jpeg",
        "assets/SEÇÃO AUDIOVISUAL/ERNEST YOUNG/WhatsApp Image 2025-10-28 at 20.47.10 (1).jpeg",
        "assets/SEÇÃO AUDIOVISUAL/ERNEST YOUNG/WhatsApp Image 2025-10-28 at 20.56.01.jpeg"
      ],
      vimeoId: "1204605116",
      vimeoHash: "e6bcf16ba7",
      video: true,
      videoSrc: "",
      category: "captacao b2b"
    },
    "besponsa-pfizer": {
client: "Pfizer",
date: "2020",
location: "São Paulo, SP",
tag: "Tecnologia",
title: "Besponsa Pfizer",
desc: "Produção audiovisual completa para a Pfizer com a criação de uma tela touch interativa para apresentação do produto Besponsa. Uma experiência imersiva que conectou os profissionais de saúde ao produto por meio de tecnologia de ponta.",
challenge: "Desenvolver uma interface touch sofisticada e intuitiva capaz de apresentar os dados clínicos do produto de forma visual e impactante, garantindo a melhor experiência possível ao público médico.",
techs: ["Tela Touch Interativa", "Produção Audiovisual", "Motion Graphics", "UX Design Médico", "Apresentação Imersiva"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/BESPONSA/rs=w_1280,h_1280.webp",
"assets/SEÇÃO PRINCIPAIS CASES/BESPONSA/rs=w_1280,h_1280 (1).webp",
"assets/SEÇÃO PRINCIPAIS CASES/BESPONSA/CAPA.webp"
],
vimeoId: "497299264",
vimeoHash: "3af3758e8b",
video: true,
videoSrc: "",
category: "tecnologia"
},
    "expo-business-fair-2024": {
client: "MultiExpo Group",
date: "Julho 2024",
location: "Transamerica Expo Center, SP",
tag: "Feira",
title: "Expo Business Fair 2024",
desc: "Montagem completa de estandes imersivos para as principais marcas participantes. A RSTCOM projetou e montou ambientes que utilizaram telas touch screen e simuladores de realidade virtual.",
challenge: "Montagem estrutural em tempo recorde de múltiplos estandes com tecnologia interativa integrada. Realizamos pré-montagem em nossa fábrica e calibração remota de software dias antes.",
techs: ["Desenho 3D de Estandes", "Telas Touch Capacitivas", "Simuladores VR", "Cenografia Sustentável", "Iluminação LED Inteligente"],
media: [
"assets/images/case-fair.jpg",
"assets/images/case-b2b.jpg",
"assets/images/case-award.jpg"
],
video: false,
category: "feira"
},
    "gala-de-premiacao-corporativa": {
client: "Grupo Varejista Alpha",
date: "Dezembro 2024",
location: "Sala São Paulo, SP",
tag: "Convenção",
title: "Gala de Premiação Corporativa",
desc: "Uma noite inesquecível de celebração e reconhecimento. A RSTCOM foi responsável por toda a infraestrutura técnica e de sonorização, garantindo qualidade acústica perfeita.",
challenge: "Manter a integridade arquitetônica da histórica Sala São Paulo sem comprometer a acústica natural. Usamos caixas de som acústicas direcionais calibradas milimetricamente por software de predição sonora.",
techs: ["Sonorização Direcional", "Predição Acústica EASE", "Iluminação Cênica Premium", "Painel LED P1.5", "Transmissão 4K"],
media: [
"assets/images/case-award.jpg",
"assets/images/case-conference.jpg",
"assets/images/case-led.jpg"
],
video: false,
category: "convencao"
},
    "midea-febrava-2025": {
client: "Midea",
date: "2025",
location: "São Paulo, SP",
tag: "Tecnologia",
title: "Midea Febrava 2025",
desc: "Estande tecnológico da Midea na Febrava 2025, a principal feira de refrigeração e ar condicionado da América Latina. A RSTCOM foi responsável pela montagem de painéis de LED de altíssima definição, sonorização profissional e cenografia digital interativa.",
challenge: "Desenvolver e sincronizar sistemas de exibição de vídeo em múltiplos painéis de LED integrados à cenografia do estande em um pavilhão de feiras com alto fluxo e interferência.",
techs: ["Painéis LED de Alta Definição", "Sonorização Direcional", "Cenografia Digital", "Sincronização de Vídeo", "Motion Graphics"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/MIDEA FEBRAVA 2025/rs=w_1280,h_853.webp",
"assets/SEÇÃO PRINCIPAIS CASES/MIDEA FEBRAVA 2025/rs=w_1280,h_853 (1).webp",
"assets/SEÇÃO PRINCIPAIS CASES/MIDEA FEBRAVA 2025/rs=w_1280,h_854.webp",
"assets/SEÇÃO PRINCIPAIS CASES/MIDEA FEBRAVA 2025/rs=w_1280,h_854 (1).webp",
"assets/SEÇÃO PRINCIPAIS CASES/MIDEA FEBRAVA 2025/rs=w_1280,h_854 (2).webp",
"assets/SEÇÃO PRINCIPAIS CASES/MIDEA FEBRAVA 2025/rs=w_1280,h_854 (3).webp",
"assets/SEÇÃO PRINCIPAIS CASES/MIDEA FEBRAVA 2025/rs=w_1280,h_854 (4).webp"
],
vimeoId: "1204615618",
video: true,
videoSrc: "",
category: "tecnologia"
},
    "cbgo-2026": {
client: "CBGO",
date: "2026",
location: "São Paulo, SP",
tag: "Feira",
title: "CBGO 2026",
desc: "Evento de grande escala da CBGO 2026 com infraestrutura audiovisual completa. A RSTCOM gerenciou toda a produção técnica, desde cenografia até transmissão de conteúdo em alta definição.",
challenge: "Coordenar múltiplos vídeos, câmeras e sistemas de áudio em sincronismo perfeito durante todo o evento, garantindo qualidade profissional e experiência imersiva.",
techs: ["Painéis de LED Gigantes", "Transmissão Ao Vivo 4K", "Sonorização Surround", "Sincronização SMPTE", "Cenografia Digital Interativa"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/CBGO 2026/capa.jpeg",
"assets/SEÇÃO PRINCIPAIS CASES/CBGO 2026/20260530_091846.jpg",
"assets/SEÇÃO PRINCIPAIS CASES/CBGO 2026/20260530_091931 (1).jpg"
],
vimeoId: "1204618351",
vimeoHash: "b957346352",
video: true,
videoSrc: "",
category: "fair"
},
    "feicon-2025": {
client: "FEICON",
date: "2025",
location: "São Paulo, SP",
tag: "Feira",
title: "FEICON 2025",
desc: "Produção completa para a FEICON 2025 com estandes imersivos e tecnologia interativa. A RSTCOM desenvolveu ambientes de alta tecnologia com telas de LED e sistemas de projeção sofisticados.",
challenge: "Criar múltiplos estandes interativos com tecnologia sincronizada, mantendo operação contínua durante todo o período da feira e garantindo impacto visual máximo.",
techs: ["Telas LED Interativas", "Projeções Mapeadas", "Painéis Touch Screen", "Iluminação Programada", "Estruturas Modulares"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/FEICON 2025/CAPA.jpg",
"assets/SEÇÃO PRINCIPAIS CASES/FEICON 2025/DSC04544.jpg",
"assets/SEÇÃO PRINCIPAIS CASES/FEICON 2025/DSC04641.jpg"
],
video: false,
category: "fair"
},
    "feicon-2026": {
client: "FEICON",
date: "2026",
location: "São Paulo, SP",
tag: "Feira",
title: "FEICON 2026",
desc: "Continuação da série de feiras FEICON. A RSTCOM mantém-se como fornecedora oficial de infraestrutura audiovisual e estandes tecnológicos para a maior feira de construção do país.",
challenge: "Elevar o impacto visual da edição 2026 com novas tecnologias, incluindo sistemas de realidade aumentada e projeções interativas.",
techs: ["Realidade Aumentada", "Projeções Interativas", "Painéis LED Modular", "Iluminação Dinâmica", "Estruturas 3D Customizadas"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/FEICON 2026/RIVA1195.jpg",
"assets/SEÇÃO PRINCIPAIS CASES/FEICON 2026/RIVA1239.jpg",
"assets/SEÇÃO PRINCIPAIS CASES/FEICON 2026/RIVA1286.jpg"
],
vimeoId: "1204618523",
video: true,
videoSrc: "",
category: "fair"
},
    "haus-decor-2025": {
client: "Haus Decor",
date: "2025",
location: "São Paulo, SP",
tag: "Feira",
title: "HAUS DECOR 2025",
desc: "Participação da RSTCOM na Haus Decor 2025 com instalação de sistemas audiovisuais e cenografia imersiva. Um showcase de tecnologia aplicada ao design e decoração.",
challenge: "Integrar tecnologia de forma discreta e elegante, mantendo o foco na experiência estética enquanto oferecia elementos de interatividade.",
techs: ["Projeção Mapeada", "Iluminação Cênica", "Sistemas de Áudio Ambiente", "Cenografia Digital", "Motion Graphics"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/HAUS DECOR 2025/DSC08895.jpg",
"assets/SEÇÃO PRINCIPAIS CASES/HAUS DECOR 2025/DSC08918.jpg",
"assets/SEÇÃO PRINCIPAIS CASES/HAUS DECOR 2025/DSC08924.jpg",
"assets/SEÇÃO PRINCIPAIS CASES/HAUS DECOR 2025/DSC09016.jpg",
"assets/SEÇÃO PRINCIPAIS CASES/HAUS DECOR 2025/DSC09023.jpg",
"assets/SEÇÃO PRINCIPAIS CASES/HAUS DECOR 2025/DSC09052.jpg",
"assets/SEÇÃO PRINCIPAIS CASES/HAUS DECOR 2025/DSC09126.jpg",
"assets/SEÇÃO PRINCIPAIS CASES/HAUS DECOR 2025/DSC09160.jpg",
"assets/SEÇÃO PRINCIPAIS CASES/HAUS DECOR 2025/DSC09175.jpg"
],
vimeoId: "1204618851",
video: true,
videoSrc: "",
category: "fair"
},
    "haus-decor-2026": {
client: "Haus Decor",
date: "2026",
location: "São Paulo, SP",
tag: "Feira",
title: "HAUS DECOR 2026",
desc: "Edição 2026 da Haus Decor com expansão de infraestrutura audiovisual. A RSTCOM apresenta novas soluções de visualização e interatividade aplicadas ao design.",
challenge: "Expandir a presença tecnológica mantendo a elegância e sofisticação esperada pelo público de design e decoração.",
techs: ["Displays OLED", "Sistemas de Som Envolvente", "Iluminação Inteligente", "Interatividade Gestual", "Cenografia Modular"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/HAUS DECOR 2026/0E0A2943.jpg",
"assets/SEÇÃO PRINCIPAIS CASES/HAUS DECOR 2026/0E0A2953.jpg",
"assets/SEÇÃO PRINCIPAIS CASES/HAUS DECOR 2026/0E0A2965.jpg"
],
video: false,
category: "fair"
},
    "grupo-sc": {
      client: "Grupo SC",
      date: "2026",
      location: "Santa Cruz, SP",
      tag: "Convenção, Audiovisual",
      title: "GRUPO SC",
      desc: "Produção corporativa para o Grupo SC com foco em comunicação interna e alinhamento estratégico. A RSTCOM desenvolveu uma experiência audiovisual imersiva para a convenção anual.",
      challenge: "Criar uma narrativa visual coerente e impactante que comunicasse os valores e objetivos da empresa para todos os stakeholders.",
      techs: ["Painéis de LED Gigantes", "Sonorização Imersiva", "Projeção Mapeada 3D", "Motion Graphics Customizados", "Sistema de Transmissão"],
      media: [
        "assets/SEÇÃO PRINCIPAIS CASES/GRUPO SC/capa.jpg",
        "assets/SEÇÃO PRINCIPAIS CASES/GRUPO SC/1.jpg",
        "assets/SEÇÃO PRINCIPAIS CASES/GRUPO SC/2.jpg",
        "assets/SEÇÃO PRINCIPAIS CASES/GRUPO SC/3.jpg",
        "assets/SEÇÃO PRINCIPAIS CASES/GRUPO SC/4.jpg",
        "assets/SEÇÃO PRINCIPAIS CASES/GRUPO SC/6.jpg"
      ],
      vimeoId: "1204619503",
      video: true,
      videoSrc: "",
      category: "convencao audiovisual"
    },
    "beauty-fair-bauny": {
      client: "Grupo Bauny",
      date: "Março 2024",
      location: "São Paulo, SP",
      tag: "Feira",
      title: "Beauty Fair Bauny",
      desc: "A Beauty Fair Bauny é um dos maiores eventos de beleza e bem-estar da América Latina. A RSTCOM foi responsável pela produção audiovisual completa do evento, incluindo a cenografia com painéis de LED de alta resolução, sonorização profissional e transmissão ao vivo para canais digitais.",
      challenge: "Criar uma experiência imersiva em um espaço dinâmico com múltiplos palcos simultâneos, garantindo sincronização perfeita entre áudio, vídeo e iluminação. Implementar sistema de transmissão robusta para cobertura em tempo real nas redes sociais.",
      techs: ["Painéis LED de Alta Resolução", "Sonorização Envolvente", "Transmissão 4K", "Motion Graphics", "Sistema de Sincronização SMPTE"],
      media: [
        "assets/SEÇÃO PRINCIPAIS CASES/BEAUTY FAIR BAUNY/rs=w_1280,h_693.webp",
        "assets/SEÇÃO PRINCIPAIS CASES/BEAUTY FAIR BAUNY/rs=w_1280,h_693 (1).webp",
        "assets/SEÇÃO PRINCIPAIS CASES/BEAUTY FAIR BAUNY/rs=w_1280,h_693 (2).webp",
        "assets/SEÇÃO PRINCIPAIS CASES/BEAUTY FAIR BAUNY/rs=w_1280,h_693 (3).webp"
      ],
      vimeoId: "1204613874",
      video: true,
      videoSrc: "",
      category: "fair"
    },
    "estacio-rock-in-rio": {
client: "Estácio & Rock in Rio",
date: "2023",
location: "Rio de Janeiro, RJ",
tag: "Tecnologia, Audiovisual",
title: "Estácio Rock in Rio",
desc: "Ativação institucional da Estácio durante o Rock in Rio, um dos maiores festivais de música do mundo. A RSTCOM criou uma zona interativa com experiência audiovisual imersiva para aproximar a universidade do público jovem.",
challenge: "Criar uma experiência audiovisual impactante em ambiente festival com alto ruído ambiental, sincronizando conteúdo digital interativo com sistema de som profissional.",
techs: ["Estrutura LED Modular", "Sonorização de Zona", "Motion Graphics Interativo", "Transmissão 4K", "Audio Visual Integrado"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/ESTACIO ROCK IN RIO/rs=w_403,h_831.webp"
],
vimeoId: "1204615839",
video: true,
videoSrc: "",
category: "tecnologia audiovisual"
},
    "5-anos-keytruda-msd": {
client: "MSD (Merck Sharp & Dohme)",
date: "2023",
location: "São Paulo, SP",
tag: "Tecnologia",
title: "5 Anos Keytruda MSD",
desc: "Celebração dos 5 anos do Keytruda no mercado com evento audiovisual de impacto. A RSTCOM desenvolveu conteúdo digital imersivo, sistema de projeção e produção audiovisual completa para a apresentação corporativa.",
challenge: "Criar conteúdo de impacto que comunicasse a evolução e importância do medicamento ao longo dos anos, com sincronização precisa de áudio, vídeo e iluminação.",
techs: ["Projeção Mapeada", "Motion Graphics", "Sonorização Premium", "Transmissão 4K", "Direção Multicâmera"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/KEYTRUDA/rs=w_1240,h_620,cg_true.webp",
"assets/SEÇÃO PRINCIPAIS CASES/KEYTRUDA/rs=w_1280,h_591.webp",
"assets/SEÇÃO PRINCIPAIS CASES/KEYTRUDA/rs=w_1280,h_591 (1).webp",
"assets/SEÇÃO PRINCIPAIS CASES/KEYTRUDA/rs=w_1280,h_591 (2).webp"
],
vimeoId: "1204616034",
video: true,
videoSrc: "",
category: "tecnologia"
},
    "convencao-honda": {
client: "Honda",
date: "2023",
location: "São Paulo, SP",
tag: "Convenção, Audiovisual",
title: "Convenção Honda",
desc: "Convenção de revendedores Honda com foco em alinhamento de objetivos e lançamento de novos modelos. A RSTCOM produziu toda a infraestrutura audiovisual, iluminação e transmissão de alta fidelidade.",
challenge: "Transmitir informações complexas sobre novos modelos com visibilidade total para todos os revendedores em um auditório grande, gerando impacto visual máximo e áudio imersivo.",
techs: ["Painéis LED", "Transmissão Multicâmera", "Sonorização Profissional", "NDI Streaming", "Iluminação Cênica"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/CONVENÇÃO HONDA/rs=w_1240,h_620,cg_true.webp",
"assets/SEÇÃO PRINCIPAIS CASES/CONVENÇÃO HONDA/rs=w_984,h_492.webp",
"assets/SEÇÃO PRINCIPAIS CASES/CONVENÇÃO HONDA/rs=w_984,h_492 (1).webp",
"assets/SEÇÃO PRINCIPAIS CASES/CONVENÇÃO HONDA/rs=w_984,h_492 (2).webp",
"assets/SEÇÃO PRINCIPAIS CASES/CONVENÇÃO HONDA/rs=w_984,h_984.webp"
],
vimeoId: "1204616447",
video: true,
videoSrc: "",
category: "convencao audiovisual"
},
    "sogesp-2025": {
client: "Libbs & Sogesp",
date: "2025",
location: "São Paulo, SP",
tag: "Estande, Tecnologia",
title: "Sogesp 2025",
desc: "Convenção médica e corporativa em parceria com a Libbs durante a SOGESP 2025. A RSTCOM projetou toda a infraestrutura audiovisual de ponta, incluindo painéis de LED para apresentação de dados e transmissão multicâmera de alta fidelidade.",
challenge: "Coordenar a transição dinâmica de apresentações e gerenciar exibições simultâneas em múltiplos palcos com transmissão ao vivo de ultra-baixa latência.",
techs: ["Painéis de LED", "Transmissão Multicâmera", "Sonorização Profissional", "Motion Graphics", "Direção de Imagem"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/SOGESP 2025 - LIBBS/rs=w_1240,h_620,cg_true.webp",
"assets/SEÇÃO PRINCIPAIS CASES/SOGESP 2025 - LIBBS/rs=w_600,cg_true.webp",
"assets/SEÇÃO PRINCIPAIS CASES/SOGESP 2025 - LIBBS/rs=w_600,cg_true (1).webp",
"assets/SEÇÃO PRINCIPAIS CASES/SOGESP 2025 - LIBBS/rs=w_600,cg_true (2).webp",
"assets/SEÇÃO PRINCIPAIS CASES/SOGESP 2025 - LIBBS/rs=w_600,cg_true,m.webp",
"assets/SEÇÃO PRINCIPAIS CASES/SOGESP 2025 - LIBBS/rs=w_600,cg_true,m (1).webp",
"assets/SEÇÃO PRINCIPAIS CASES/SOGESP 2025 - LIBBS/rs=w_600,cg_true,m (2).webp"
],
vimeoId: "1204618045",
video: true,
videoSrc: "",
category: "estande tecnologia"
},
    "elmex-colgate": {
client: "Colgate",
date: "2025",
location: "São Paulo, SP",
tag: "Convenção, Audiovisual",
title: "Elmex Colgate",
desc: "Projeção mapeada e ativação de tecnologia interativa de alta definição para o lançamento de Elmex pela Colgate. A RSTCOM projetou toda a experiência de projeção mapeada tridimensional, integrando sonorização profissional e iluminação cênica de impacto.",
challenge: "Calibrar com extrema precisão os projetores de alta luminosidade em superfícies tridimensionais complexas, garantindo alinhamento perfeito de pixel e sincronia absoluta com a trilha sonora e efeitos cênicos.",
techs: ["Projeção Mapeada 3D", "Sonorização Imersiva", "Iluminação Cênica", "Sincronização de Vídeo", "Motion Graphics"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/ELMEX COLGATE/cr=w_1240,h_620.webp",
"assets/SEÇÃO PRINCIPAIS CASES/ELMEX COLGATE/rs=w_984,h_984.webp",
"assets/SEÇÃO PRINCIPAIS CASES/ELMEX COLGATE/rs=w_984,h_984 (1).webp",
"assets/SEÇÃO PRINCIPAIS CASES/ELMEX COLGATE/rs=w_984,h_984 (2).webp"
],
vimeoId: "1204616236",
video: true,
videoSrc: "",
category: "convencao audiovisual"
},
    "convencao-carrefour": {
client: "Carrefour",
date: "2025",
location: "São Paulo, SP",
tag: "Convenção",
title: "Convenção Carrefour",
desc: "Convenção anual do Grupo Carrefour reunindo colaboradores e líderes para alinhamento estratégico e premiação. A RSTCOM projetou e montou toda a cenografia, sonorização acústica de alta definição, direção artística multicâmera e transmissão interna robusta.",
challenge: "Proporcionar uma experiência audiovisual imersiva e integrada para um grande número de participantes, mantendo o dinamismo e a sincronização perfeita entre apresentadores presenciais e exibições virtuais.",
techs: ["Painéis de LED", "Sonorização Profissional", "Direção Multicâmera", "Cenografia Customizada", "Transmissão Interna"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/CONVENÇÃO CARREFOUR/rs=w_1240,h_620,cg_true (1).webp",
"assets/SEÇÃO PRINCIPAIS CASES/CONVENÇÃO CARREFOUR/rs=w_1280,h_716.webp",
"assets/SEÇÃO PRINCIPAIS CASES/CONVENÇÃO CARREFOUR/rs=w_1280,h_718.webp",
"assets/SEÇÃO PRINCIPAIS CASES/CONVENÇÃO CARREFOUR/rs=w_1280,h_721.webp",
"assets/SEÇÃO PRINCIPAIS CASES/CONVENÇÃO CARREFOUR/rs=w_1280,h_721 (1).webp"
],
vimeoId: "1204614142",
video: true,
videoSrc: "",
category: "convencao"
},
    "libbs-brain": {
client: "Libbs",
date: "2025",
location: "São Paulo, SP",
tag: "Feiras, Tecnologia",
title: "Libbs Brain",
desc: "Desenvolvimento de plataforma interativa e produção audiovisual para a initiative Libbs Brain. A RSTCOM projetou uma experiência visual imersiva e de alta definição, integrando painéis informativos digitais.",
challenge: "Integrar apresentações de dados de forma intuitiva e visualmente impactante, garantindo engajamento e perfeita visualização das informações.",
techs: ["Painéis Interativos", "Cenografia Digital", "Motion Graphics", "UX/UI Design", "Sonorização de Ambiente"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/LIBBS BRAIN/CAPA.webp",
"assets/SEÇÃO PRINCIPAIS CASES/LIBBS BRAIN/download.webp",
"assets/SEÇÃO PRINCIPAIS CASES/LIBBS BRAIN/download (1).webp"
],
video: false,
category: "fair tecnologia"
},
    "town-hall-pfizer": {
client: "Pfizer",
date: "2025",
location: "São Paulo, SP",
tag: "Feiras, Tecnologia",
title: "Town Hall Pfizer",
desc: "Town Hall corporativo da Pfizer para comunicação de resultados e estratégia organizacional. A RSTCOM gerenciou toda a infraestrutura audiovisual e a transmissão em tempo real de alta definição para múltiplas sedes.",
challenge: "Garantir transmissão de ultra-baixa latência com qualidade de vídeo de alta resolução para múltiplos sites simultâneos com áudio bidirecional sem atrasos.",
techs: ["Transmissão WebRTC", "Câmeras PTZ", "Sinal NDI Roteado", "Redundância de Rede", "Sonorização de Grande Porte"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/TOWN HALL PFIZER/rs=w_1240,h_620,cg_true.webp",
"assets/SEÇÃO PRINCIPAIS CASES/TOWN HALL PFIZER/rs=w_1280,h_720.webp",
"assets/SEÇÃO PRINCIPAIS CASES/TOWN HALL PFIZER/rs=w_1280,h_720 (1).webp",
"assets/SEÇÃO PRINCIPAIS CASES/TOWN HALL PFIZER/rs=w_1280,h_720 (2).webp",
"assets/SEÇÃO PRINCIPAIS CASES/TOWN HALL PFIZER/rs=w_1280,h_1737.webp"
],
vimeoId: "1204616858",
video: true,
videoSrc: "",
category: "fair tecnologia"
},
    "pepsico": {
client: "PepsiCo",
date: "2025",
location: "São Paulo, SP",
tag: "Convenção",
title: "PepsiCo",
desc: "Grande convenção de negócios PepsiCo com múltiplos segmentos de produtos. A RSTCOM realizou captação, edição e transmissão profissional de conteúdo audiovisual, com estúdios físicos interativos e painéis dinâmicos.",
challenge: "Gerenciar múltiplos estúdios simultâneos com edição ao vivo e transmissão para canais corporativos e plataformas externas de forma integrada.",
techs: ["Direção Multicâmera", "Edição ao Vivo", "Streaming Profissional", "Motion Graphics", "Painéis de LED"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/CONVENÇÃO PEPSICO/rs=w_1280,h_855.webp",
"assets/SEÇÃO PRINCIPAIS CASES/CONVENÇÃO PEPSICO/rs=w_1280.webp",
"assets/SEÇÃO PRINCIPAIS CASES/CONVENÇÃO PEPSICO/rs=w_1280 (1).webp",
"assets/SEÇÃO PRINCIPAIS CASES/CONVENÇÃO PEPSICO/rs=w_1280 (2).webp",
"assets/SEÇÃO PRINCIPAIS CASES/CONVENÇÃO PEPSICO/rs=w_1280,h_855 (1).webp",
"assets/SEÇÃO PRINCIPAIS CASES/CONVENÇÃO PEPSICO/rs=w_1280,h_855 (2).webp"
],
vimeoId: "1204617251",
video: true,
videoSrc: "",
category: "convencao"
},
    "lancamento-sanofi": {
client: "Sanofi",
date: "2025",
location: "São Paulo, SP",
tag: "B2B, Audiovisual",
title: "Lançamento Sanofi",
desc: "Lançamento oficial de novos medicamentos e tratamentos pela Sanofi, com experiência imersiva e interativa. A RSTCOM coordenou toda a infraestrutura audiovisual, sonorização profissional e projeção mapeada para o evento.",
challenge: "Calibrar projetores e painéis de LED para criar um ambiente tridimensional contínuo que envolvesse os participantes em uma narrativa científica impactante.",
techs: ["Projeção Mapeada", "Painéis de LED", "Sonorização Profissional", "Iluminação Cênica", "Transmissão Ao Vivo"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/LANÇAMENTO DUPIXENT SANOFI/rs=w_1240,h_620,cg_true (1).webp",
"assets/SEÇÃO PRINCIPAIS CASES/LANÇAMENTO DUPIXENT SANOFI/rs=w_1280,h_1280.webp",
"assets/SEÇÃO PRINCIPAIS CASES/LANÇAMENTO DUPIXENT SANOFI/rs=w_1280,h_960.webp",
"assets/SEÇÃO PRINCIPAIS CASES/LANÇAMENTO DUPIXENT SANOFI/rs=w_1280,h_960 (1).webp",
"assets/SEÇÃO PRINCIPAIS CASES/LANÇAMENTO DUPIXENT SANOFI/rs=w_1280,h_960 (2).webp"
],
vimeoId: "1204617103",
video: true,
videoSrc: "",
category: "b2b audiovisual"
},
    "synvisc-one-sanofi": {
client: "Sanofi",
date: "2025",
location: "São Paulo, SP",
tag: "Tecnologia",
title: "Synvisc One Sanofi",
desc: "Ativação audiovisual de alta tecnologia e projeção mapeada para o produto Synvisc One da Sanofi. A RSTCOM projetou uma experiência interativa e de impacto visual para profissionais da saúde e parceiros.",
challenge: "Sincronizar exibições em múltiplos monitores e projetores integrados à cenografia tridimensional do evento.",
techs: ["Painéis Interativos", "Projeções Mapeadas", "Motion Graphics", "Sonorização Cênica", "Sistemas de Sinal Roteado"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/SYNCISC ONE SANOFI/download.webp",
"assets/SEÇÃO PRINCIPAIS CASES/SYNCISC ONE SANOFI/download (1).webp",
"assets/SEÇÃO PRINCIPAIS CASES/SYNCISC ONE SANOFI/download (2).webp",
"assets/SEÇÃO PRINCIPAIS CASES/SYNCISC ONE SANOFI/download (3).webp"
],
vimeoId: "1204617397",
video: true,
videoSrc: "",
category: "tecnologia"
},
    "leadership-doterra": {
client: "doTERRA",
date: "2025",
location: "São Paulo, SP",
tag: "Convenção, Audiovisual",
title: "Leadership doTERRA",
desc: "Convenção anual de liderança dōTERRA reunindo consultores de bem-estar de todo o país. A RSTCOM projetou e executou toda a cenografia imersiva com painéis de LED monumentais, iluminação robótica e sistema de som de alta definição.",
challenge: "Garantir impacto visual máximo e sonorização nítida em um pavilhão de convenções de grande escala, mantendo a transmissão para o público virtual.",
techs: ["Painéis de LED Gigantes", "Sonorização de Grande Porte", "Iluminação Robótica", "Direção Multicâmera", "Transmissão Híbrida"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/LEADERSHIP doTERRA/rs=w_1240,h_620,cg_true,m.webp",
"assets/SEÇÃO PRINCIPAIS CASES/LEADERSHIP doTERRA/rs=w_1280,h_591.webp",
"assets/SEÇÃO PRINCIPAIS CASES/LEADERSHIP doTERRA/rs=w_1280,h_591 (1).webp",
"assets/SEÇÃO PRINCIPAIS CASES/LEADERSHIP doTERRA/rs=w_1280,h_591 (2).webp"
],
vimeoId: "1204617616",
video: true,
videoSrc: "",
category: "convencao audiovisual"
},
    "6-premio-saint-gobain": {
client: "Saint-Gobain",
date: "2023",
location: "São Paulo, SP",
tag: "Corporativo & B2B",
title: "6º Prêmio Saint-Gobain",
desc: "Cerimônia de premiação Saint-Gobain reconhecendo líderes em inovação da construção civil. A RSTCOM executou a produção audiovisual completa com transmissão ao vivo. O projeto contou com convite interativo em realidade aumentada e exposição virtual dos projetos em realidade virtual.",
challenge: "Criar uma cerimônia de premiação memorável e interativa, integrando realidade aumentada no convite físico e realidade virtual para a exposição dos projetos concorrentes no local do evento.",
techs: ["Realidade Aumentada", "Realidade Virtual", "Painéis LED Premium", "Transmissão HD", "Câmeras Multicâmera", "Iluminação de Palco"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/6º PRÊMIO SAINT-GOBAIN/CAPA.png"
],
vimeoId: "1204617814",
video: true,
videoSrc: "",
category: "b2b"
},
    "rinvoq-abbvie": {
client: "AbbVie",
date: "2023",
location: "São Paulo, SP",
tag: "Audiovisual",
title: "Rinvoq AbbVie",
desc: "Lançamento de medicamento Rinvoq pela farmacêutica AbbVie com evento de impacto corporativo. A RSTCOM desenvolveu experiência audiovisual para comunicar benefícios terapêuticos.",
challenge: "Apresentar dados científicos complexos de forma visualmente atrativa e didática.",
techs: ["Motion Graphics Científicos", "Projeção de Dados", "Transmissão 4K", "Sonorização Premium"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/RINVOQ ABBVIE/rs=w_1240,h_620,cg_true,m.webp",
"assets/SEÇÃO PRINCIPAIS CASES/RINVOQ ABBVIE/rs=w_1280,h_591.webp",
"assets/SEÇÃO PRINCIPAIS CASES/RINVOQ ABBVIE/rs=w_1280,h_591 (1).webp",
"assets/SEÇÃO PRINCIPAIS CASES/RINVOQ ABBVIE/rs=w_1280,h_591 (2).webp"
],
vimeoId: "1204618195",
video: true,
videoSrc: "",
category: "audiovisual"
},
    "abras-convencao": {
client: "ABRAS",
date: "2025",
location: "São Paulo, SP",
tag: "Convenção, Audiovisual",
title: "ABRAS Convenção",
desc: "Produção audiovisual completa para o ABRAS com infraestrutura de evento de grande porte. A RSTCOM foi responsável pela montagem completa de cenografia, painéis de LED e toda a experiência visual do evento.",
challenge: "Integrar múltiplas tecnologias e criar uma experiência visual imersiva que conectasse o público ao projeto de forma impactante e memorável.",
techs: ["Painéis de LED", "Cenografia Digital", "Sonorização Profissional", "Direção Multicâmera", "Produção Audiovisual"],
media: [
"assets/SEÇÃO PRINCIPAIS CASES/ABRAS/capa.jpeg",
"assets/SEÇÃO PRINCIPAIS CASES/ABRAS/WhatsApp Image 2025-11-13 at 17.50.52.jpeg",
"assets/SEÇÃO PRINCIPAIS CASES/ABRAS/WhatsApp Image 2025-11-13 at 17.50.53.jpeg"
],
video: false,
category: "convencao audiovisual"
}
  };

  // Helper slugifier
  function slugify(text) {
    return text.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  // ════════════════════════════════════════════
  // Função para preparar dados do case (adiciona videoSrc ao media automaticamente)
  // ════════════════════════════════════════════
  function prepareCaseData(data) {
    // Se houver videoSrc e não estiver já em media, adiciona automaticamente
    if (data.videoSrc && data.videoSrc.trim() !== '' && !data.media.includes(data.videoSrc)) {
      // Cria uma cópia do array para não modificar o original
      const newMedia = [...data.media];
      // Adiciona o vídeo ao final do array
      newMedia.push(data.videoSrc);
      // Retorna um novo objeto com o media atualizado
      return { ...data, media: newMedia };
    }
    return data;
  }

  // Helper slugifier
  function slugify(text) {
    return text.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  // Pre-fill cache for DOM selection and cursors inside modal
  let activeModalCtaCategory = 'outro';

  function openCase(titleText, categoryClass, imgSrc, tagText, element = null) {
    if (!caseModal) return;

    // Check if slug is in our custom database
    const slug = slugify(titleText);
    if (slug) {
      window.location.hash = 'case-' + slug;
    }
    let data = null;

    // Prefer data from HTML element attributes if present
    if (element && element.dataset.title) {
      data = {
        client: element.dataset.client || "Cliente RSTCOM",
        date: element.dataset.date || "Ano 2024",
        location: element.dataset.location || "São Paulo, Brasil",
        tag: element.dataset.tag || element.querySelector('.case-item-tag')?.textContent || tagText || "Caso de Sucesso",
        title: element.dataset.title || titleText,
        desc: element.dataset.desc || `O projeto ${titleText} foi planejado e executado pela RSTCOM com tecnologia de ponta e infraestrutura audiovisual completa. Desenvolvemos soluções personalizadas que garantiram o sucesso absoluto da experiência.`,
        challenge: element.dataset.challenge || "Integrar múltiplas tecnologias inovadoras sob um cronograma rigoroso. Nossa equipe técnica assegurou redundância de rede e operação contínua durante todo o projeto.",
        techs: (element.dataset.techs || "Painéis de LED,Sonorização de Alta Fidelidade,Cenografia Digital").split(",").map(t => t.trim()),
        media: element.dataset.media ? element.dataset.media.split(",").map(t => t.trim()) : [imgSrc || "assets/images/case-festival.jpg"],
        vimeoId: element.dataset.vimeoId || "",
        video: !!element.dataset.vimeoId,
        videoSrc: element.dataset.vimeoId ? `https://player.vimeo.com/video/${element.dataset.vimeoId}` : "",
        category: element.dataset.cat || categoryClass || "outro"
      };

      // Enrich from casesDb if available (e.g. for media list or specific metadata if missing in HTML)
      const dbData = casesDb[slug];
      if (dbData) {
        if (!element.dataset.media && dbData.media) data.media = dbData.media;
        if (dbData.vimeoHash) data.vimeoHash = dbData.vimeoHash;
      }
    } else {
      data = casesDb[slug];
    }

    // Fallback: build details dynamically if not defined in casesDb and no element attributes
    if (!data) {
      data = {
        client: "Cliente RSTCOM",
        date: "Ano 2024",
        location: "São Paulo, Brasil",
        tag: tagText || "Caso de Sucesso",
        title: titleText,
        desc: `O projeto ${titleText} foi planejado e executado pela RSTCOM com tecnologia de ponta e infraestrutura audiovisual completa. Desenvolvemos soluções personalizadas que garantiram o sucesso absoluto da experiência.`,
        challenge: "Integrar múltiplas tecnologias inovadoras sob um cronograma rigoroso. Nossa equipe técnica assegurou redundância de rede e operação contínua durante todo o projeto.",
        techs: ["Painéis de LED", "Sonorização de Alta Fidelidade", "Cenografia Digital", "Redundância Técnica", "Direção de Imagem"],
        media: [
          imgSrc || "assets/images/case-festival.jpg",
          "assets/images/case-led.jpg",
          "assets/images/case-conference.jpg"
        ],
        video: false,
        category: categoryClass || "outro"
      };
    }

    // 🎯 IMPORTANTE: Preparar dados (adiciona videoSrc ao media se existir)
    data = prepareCaseData(data);

    // Keep record of category for Contact pre-filling
    activeModalCtaCategory = data.category || categoryClass || 'outro';

    // Render contents into DOM
    if (caseModalTitle) caseModalTitle.textContent = data.title;
    if (caseModalTag) {
      caseModalTag.textContent = data.tag;
      // Style tag colors dynamically based on category
      const catColors = {
        'festival': 'var(--coral)',
        'convencao': 'var(--orange)',
        'corporativo': 'var(--cyan)',
        'lancamento': 'var(--pink)',
        'feira': 'var(--yellow)',
        'captacao': 'var(--cyan)',
        'tecnologia': 'var(--cyan)',
        'audiovisual': 'var(--coral)',
        'estande': 'var(--orange)',
        'b2b': 'var(--cyan)',
        'fair': 'var(--yellow)',
        'outro': 'var(--white)'
      };
      const primaryCat = (data.category || '').split(' ')[0] || 'outro';
      const activeColor = catColors[primaryCat] || catColors[data.category] || 'var(--white)';
      caseModalTag.style.color = activeColor;
      caseModalTag.style.borderColor = activeColor + '33';
      caseModalTag.style.background = activeColor + '11';
    }
    if (caseModalDesc) caseModalDesc.textContent = data.desc;
    if (caseModalChallenge) caseModalChallenge.textContent = data.challenge;
    
    if (caseModalClient) caseModalClient.textContent = data.client;
    if (caseModalDate) caseModalDate.textContent = data.date;
    if (caseModalLocation) caseModalLocation.textContent = data.location;

    // Render Tech Pills
    if (caseModalTechPills) {
      caseModalTechPills.innerHTML = '';
      data.techs.forEach(tech => {
        const pill = document.createElement('span');
        pill.className = 'case-tech-pill';
        pill.textContent = tech;
        
        // Add magnetic cursor hover hooks
        if (typeof cursorRing !== 'undefined') {
          pill.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
          pill.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
        }
        caseModalTechPills.appendChild(pill);
      });
    }

    // Render Hero Video setup first
    const videoNode = document.getElementById('caseModalHeroVideo');

    // Render Gallery
    if (caseModalGalleryGrid) {
      caseModalGalleryGrid.innerHTML = '';

      // If case has a Vimeo video, add a Vimeo thumbnail tile first
      if (data.vimeoId) {
        const vimeoThumbItem = document.createElement('div');
        vimeoThumbItem.className = 'case-gallery-item case-gallery-vimeo';
        vimeoThumbItem.title = 'Assistir vídeo';
        vimeoThumbItem.style.cssText = 'position:relative;cursor:pointer;background:#111;';

        // Use Vimeo's thumbnail API
        const thumbImg = document.createElement('img');
        thumbImg.src = `https://vumbnail.com/${data.vimeoId}.jpg`;
        thumbImg.alt = data.title + ' - Vídeo';
        thumbImg.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        thumbImg.onerror = () => { thumbImg.src = 'assets/images/case-festival.jpg'; };

        const playIcon = document.createElement('div');
        playIcon.style.cssText = `
          position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
          width:52px;height:52px;border-radius:50%;
          background:rgba(255,255,255,0.92);display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 20px rgba(0,0,0,0.5);transition:transform .2s;
          pointer-events:none;
        `;
        playIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="#0A0A0A" width="22" height="22"><path d="M8 5v14l11-7z"/></svg>`;

        const vimeoLabel = document.createElement('span');
        vimeoLabel.style.cssText = `
          position:absolute;bottom:6px;left:50%;transform:translateX(-50%);
          background:rgba(0,198,255,0.85);color:#fff;font-size:10px;font-weight:700;
          padding:2px 8px;border-radius:20px;letter-spacing:.5px;white-space:nowrap;
          pointer-events:none;
        `;
        vimeoLabel.textContent = 'VÍDEO';

        vimeoThumbItem.appendChild(thumbImg);
        vimeoThumbItem.appendChild(playIcon);
        vimeoThumbItem.appendChild(vimeoLabel);

        // Hover: scale play icon
        vimeoThumbItem.addEventListener('mouseenter', () => { playIcon.style.transform = 'translate(-50%,-50%) scale(1.15)'; });
        vimeoThumbItem.addEventListener('mouseleave', () => { playIcon.style.transform = 'translate(-50%,-50%) scale(1)'; });

        // Click: inject Vimeo iframe into hero and show it
        vimeoThumbItem.addEventListener('click', () => {
          // Remove any existing iframe
          const old = caseModalHeroVideoWrapper ? caseModalHeroVideoWrapper.querySelector('iframe.vimeo-embed') : null;
          if (old) old.remove();

          const videoNode2 = document.getElementById('caseModalHeroVideo');
          if (videoNode2) { videoNode2.pause(); videoNode2.style.display = 'none'; }

          const hashParam = data.vimeoHash ? `?h=${data.vimeoHash}&` : '?';
          const iframeSrc = `https://player.vimeo.com/video/${data.vimeoId}${hashParam}badge=0&autopause=0&autoplay=1&player_id=0&app_id=58479&title=0&byline=0&portrait=0`;
          const iframe = document.createElement('iframe');
          iframe.src = iframeSrc;
          iframe.className = 'vimeo-embed';
          iframe.frameBorder = '0';
          iframe.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share';
          iframe.referrerPolicy = 'strict-origin-when-cross-origin';
          iframe.style.cssText = 'border:none;';

          if (caseModalHeroVideoWrapper) {
            caseModalHeroVideoWrapper.appendChild(iframe);
            caseModalHeroVideoWrapper.classList.add('active');
          }
          if (caseModalHeroBg) caseModalHeroBg.style.backgroundImage = 'none';
        });

        caseModalGalleryGrid.appendChild(vimeoThumbItem);
      }
      data.media.forEach(imgUrl => {
        const item = document.createElement('div');
        item.className = 'case-gallery-item';
        
        // Check if gallery item is a video
        if (imgUrl.endsWith('.mp4')) {
          const galleryVid = document.createElement('video');
          galleryVid.src = imgUrl;
          galleryVid.muted = true;
          galleryVid.loop = true;
          galleryVid.playsInline = true;
          galleryVid.preload = 'metadata';
          galleryVid.style.width = '100%';
          galleryVid.style.height = '100%';
          galleryVid.style.objectFit = 'cover';
          item.appendChild(galleryVid);
          
          // Play inline video in gallery on hover
          item.addEventListener('mouseenter', () => {
            galleryVid.play().catch(err => console.log("Gallery play prevented", err));
          });
          item.addEventListener('mouseleave', () => {
            galleryVid.pause();
            galleryVid.currentTime = 0;
          });

          // Click on gallery video opens lightbox
          item.addEventListener('click', () => {
            // Find the index of this video in data.media
            const mediaIndex = data.media.indexOf(imgUrl);
            window.openLightbox(data.media, mediaIndex >= 0 ? mediaIndex : 0);
            
            // Also update hero (for context)
            if (caseModalHeroBg) {
              caseModalHeroBg.style.backgroundImage = 'none';
            }
            if (caseModalHeroVideoWrapper) {
              caseModalHeroVideoWrapper.classList.add('active');
            }
            if (videoNode) {
              videoNode.src = imgUrl;
              videoNode.currentTime = 0;
              videoNode.play().catch(err => console.log("Hero play prevented", err));
            }
          });
        } else {
          const img = document.createElement('img');
          img.src = imgUrl;
          img.alt = data.title;
          img.loading = 'lazy';
          item.appendChild(img);

          // Click on gallery image opens lightbox
          item.addEventListener('click', () => {
            // Find the index of this image in data.media
            const mediaIndex = data.media.indexOf(imgUrl);
            window.openLightbox(data.media, mediaIndex >= 0 ? mediaIndex : 0);
            
            // Also update hero (for context)
            if (caseModalHeroVideoWrapper) {
              caseModalHeroVideoWrapper.classList.remove('active');
            }
            if (videoNode) {
              videoNode.pause();
            }
            if (caseModalHeroBg) {
              caseModalHeroBg.style.backgroundImage = `url("${imgUrl}")`;
            }
          });
        }

        // Add magnetic cursor hover hooks
        if (typeof cursorRing !== 'undefined') {
          item.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
          item.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
        }

        caseModalGalleryGrid.appendChild(item);
      });
    }

    // Render Hero background
    if (caseModalHeroBg) {
      if (data.video) {
        caseModalHeroBg.style.backgroundImage = 'none';
      } else {
        caseModalHeroBg.style.backgroundImage = `url("${data.media[0]}")`;
      }
    }

    // Play project header video (Vimeo or local)
    if (data.video) {
      if (caseModalHeroVideoWrapper) caseModalHeroVideoWrapper.classList.add('active');

      if (data.vimeoId) {
        // === VIMEO EMBED ===
        // Remove any existing iframe first
        const existingIframe = caseModalHeroVideoWrapper ? caseModalHeroVideoWrapper.querySelector('iframe.vimeo-embed') : null;
        if (existingIframe) existingIframe.remove();

        // Pause local video if it exists
        if (videoNode) { videoNode.pause(); videoNode.src = ''; videoNode.style.display = 'none'; }

        const hashParam = data.vimeoHash ? `?h=${data.vimeoHash}&` : '?';
        const iframeSrc = `https://player.vimeo.com/video/${data.vimeoId}${hashParam}badge=0&autopause=0&autoplay=1&muted=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0`;
        const vimeoIframe = document.createElement('iframe');
        vimeoIframe.src = iframeSrc;
        vimeoIframe.className = 'vimeo-embed';
        vimeoIframe.frameBorder = '0';
        vimeoIframe.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share';
        vimeoIframe.referrerPolicy = 'strict-origin-when-cross-origin';
        vimeoIframe.style.cssText = 'border:none;';
        if (caseModalHeroVideoWrapper) caseModalHeroVideoWrapper.appendChild(vimeoIframe);
      } else {
        // === LOCAL VIDEO ===
        // Remove any Vimeo iframe if present
        const existingIframe = caseModalHeroVideoWrapper ? caseModalHeroVideoWrapper.querySelector('iframe.vimeo-embed') : null;
        if (existingIframe) existingIframe.remove();

        if (videoNode) {
          videoNode.style.display = '';
          // Reset wrapper style for local video
          if (caseModalHeroVideoWrapper) {
            caseModalHeroVideoWrapper.style.position = '';
            caseModalHeroVideoWrapper.style.paddingBottom = '';
            caseModalHeroVideoWrapper.style.height = '';
            caseModalHeroVideoWrapper.style.overflow = '';
          }
          const targetSrc = data.videoSrc || "assets/HOME/background em movimento/demoreel.mp4";
          if (!videoNode.src.endsWith(targetSrc)) {
            videoNode.src = targetSrc;
          }
          videoNode.currentTime = 0;
          videoNode.play().catch(err => console.log("Auto-play prevented", err));
        }
      }
    } else {
      if (caseModalHeroVideoWrapper) caseModalHeroVideoWrapper.classList.remove('active');
      if (videoNode) videoNode.pause();
    }

    // Open Modal with high-performance Layer Promotion
    caseModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';  // ← BLOQUEIA SCROLL AO ABRIR
    caseModal.setAttribute('aria-hidden', 'false');
    
    // Small delay to allow display layout calculation then add active transitions
    requestAnimationFrame(() => {
      caseModal.classList.add('active');
      document.body.classList.add('modal-open');
    });
  }

  function closeCase() {
    if (!caseModal) return;
    
    // Clear hash without causing a page jump
    if (window.location.hash && window.location.hash.startsWith('#case-')) {
      if (window.history && window.history.pushState) {
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
      } else {
        window.location.hash = "";
      }
    }

    // Fade out modal
    caseModal.classList.remove('active');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';  // ← RESTAURA O SCROLL
    caseModal.setAttribute('aria-hidden', 'true');
    
    // Stop local video playback
    const videoNode = document.getElementById('caseModalHeroVideo');
    if (videoNode) videoNode.pause();

    // Remove Vimeo iframe to stop playback & free memory
    const vimeoIframe = caseModalHeroVideoWrapper ? caseModalHeroVideoWrapper.querySelector('iframe.vimeo-embed') : null;
    if (vimeoIframe) {
      vimeoIframe.remove();
      // Reset wrapper styles
      if (caseModalHeroVideoWrapper) {
        caseModalHeroVideoWrapper.style.position = '';
        caseModalHeroVideoWrapper.style.paddingBottom = '';
        caseModalHeroVideoWrapper.style.height = '';
        caseModalHeroVideoWrapper.style.overflow = '';
      }
      if (videoNode) videoNode.style.display = '';
    }

    // After fade-out transition, toggle display to none
    setTimeout(() => {
      caseModal.style.display = 'none';
    }, 500);
  }

  // Close triggers
  if (caseModalClose) caseModalClose.addEventListener('click', closeCase);
  if (caseModalOverlay) caseModalOverlay.addEventListener('click', closeCase);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && caseModal && caseModal.classList.contains('active')) {
      closeCase();
    }
  });



  // Old Nova Era deck click handlers removed in favor of brand authority section

  // Attach click handlers to CTA coverflow cards to scroll and filter the main cases grid
  const cta3dCards = document.querySelectorAll('.cta-3d-card');
  cta3dCards.forEach(card => {
    card.addEventListener('click', () => {
      // Prevent scrolling/filtering if this click was a drag gesture release
      const ctaViewport = document.getElementById('casesCtaViewport');
      if (ctaViewport && ctaViewport.ctaDragMoved) {
        ctaViewport.ctaDragMoved = false;
        return;
      }

      const idx = card.getAttribute('data-index');
      let filterCategory = "all";

      if (idx === "0") filterCategory = "captacao";
      else if (idx === "1") filterCategory = "audiovisual";
      else if (idx === "2") filterCategory = "fair";
      else if (idx === "3") filterCategory = "b2b";

      // 1. Scroll smoothly to the cases section
      const casesSection = document.getElementById('cases');
      if (casesSection) {
        casesSection.scrollIntoView({ behavior: 'smooth' });
      }

      // 2. Select and trigger click on the matching filter button
      const filterBtn = document.querySelector(`.filter-btn[data-filter="${filterCategory}"]`);
      if (filterBtn) {
        filterBtn.click();
      }
    });
  });

  /* ════════════════════════════════════════════
     BRAND AUTHORITY FLOATING LOGOS & FIELD EFFECT
     ════════════════════════════════════════════ */
  const brandSection = document.querySelector('.brand-authority');
  const logosContainer = document.getElementById('brandLogosContainer');

  if (brandSection && logosContainer) {
    logosContainer.innerHTML = '';

    const brands = [
      { name: 'Libbs', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo libbs.svg', color: '#47ad33' },
      { name: 'Dongfeng', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo dongfeng.svg', color: '#e4002b' },
      { name: 'Pfizer', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo pfizer.svg', color: '#00a3e0' },
      { name: 'Honda', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo honda.svg', color: '#ff0000' },
      { name: 'PepsiCo', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo pepsico.svg', color: '#004b87' },
      { name: 'Sherwin-Williams', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/LOGO SHERWIN-WILLIAMS.svg', color: '#005ea6', keepBlack: true },
      { name: 'Suvinil', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo suvinil.svg', color: '#f58220' },
      { name: 'Sanofi', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo branca sanofi 1.svg', color: '#584293' },
      { name: 'Bridgestone', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo bridgestone 1.svg', color: '#d01216' },
      { name: 'Carrefour', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo carrefour.svg', color: '#004a97' },
      { name: 'Grunenthal', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo grunenthal.svg', color: '#009639' },
      { name: 'InfoMoney', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo infomoney.svg', color: '#002f6c', keepBlack: true },
      { name: 'Takeda', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo takeda.svg', color: '#e31b23' },
      { name: 'Teva', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo teva.svg', color: '#0083ca' },
      { name: 'XP', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo xp 1.svg', color: '#e5a900', keepBlack: true },
      { name: 'Petrobras', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/LOGO PETROBRAS BRANCO 1.svg', color: '#008a4f' },
      
      // New Brands
      { name: 'Midea', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo midea.svg', color: '#0060a8' },
      { name: 'Abras', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo abras.svg', color: '#005ba4' },
      { name: 'Grupo SC', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo grupo sc.svg', color: '#003764' },
      { name: 'Colgate', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo colgate.svg', color: '#e31b23' },
      { name: 'Estácio', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo estacio.svg', color: '#005580' },
      { name: 'Bosch', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo bosch.svg', color: '#e3001b' },
      { name: 'Samsung', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo samsung.svg', color: '#034ea2' },
      { name: 'Medison', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo medison.svg', color: '#004785' },
      { name: 'Bauny', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo bauny.svg', color: '#222222' },
      { name: 'Nuvemshop', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo nuvemshop.svg', color: '#2d3dfb' },
      { name: 'Anbima', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo anbima.svg', color: '#004b8d' }
    ];

    const grid = document.createElement('div');
    grid.className = 'brand-grid-layout';

    brands.forEach(brand => {
      const card = document.createElement('div');
      card.className = 'brand-grid-card' + (brand.keepBlack ? ' brand-grid-card--keep-black' : '');
      card.style.setProperty('--brand-hover-color', brand.color);

      // Spotlight glow overlay
      const glow = document.createElement('div');
      glow.className = 'brand-card-glow';
      card.appendChild(glow);

      const img = document.createElement('img');
      img.src = brand.src + '?v=3';
      img.alt = brand.name;
      img.className = 'brand-card-img';
      img.loading = 'lazy';
      if (brand.style) {
        img.style.cssText = brand.style;
      }

      card.appendChild(img);
      grid.appendChild(card);

      // 3D Perspective Tilt & Parallax Mouse Move Event
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const dx = (x - xc) / xc; // Range: -1 to 1
        const dy = (y - yc) / yc; // Range: -1 to 1

        // Max rotation: 10 degrees
        const rotateX = (-dy * 10).toFixed(2);
        const rotateY = (dx * 10).toFixed(2);

        // Apply 3D tilt style
        card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-5px) scale(1.03)';
        
        // Dynamic shadow shift opposite to the mouse
        card.style.boxShadow = (-dx * 12).toFixed(2) + 'px ' + (-dy * 12).toFixed(2) + 'px 32px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.02)';

        // Inner logo depth translation (Parallax)
        const baseTransform = brand.style ? brand.style + ' ' : '';
        img.style.transform = baseTransform + 'translate3d(' + (dx * 8).toFixed(2) + 'px, ' + (dy * 8).toFixed(2) + 'px, 30px) scale(1.06)';

        // Spotlight glow follow
        glow.style.background = 'radial-gradient(150px circle at ' + x + 'px ' + y + 'px, ' + brand.color + '1c, transparent 80%)';
      });

      card.addEventListener('mouseleave', () => {
        // Smoothly transition back to default state
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
        card.style.boxShadow = '';
        img.style.transform = brand.style ? brand.style : 'translate3d(0, 0, 0) scale(1)';
        glow.style.background = 'transparent';
      });
    });

    logosContainer.appendChild(grid);
  }

  // Modal CTA button action
  if (caseModalCtaBtn) {
    caseModalCtaBtn.addEventListener('click', () => {
      // 1. Close Modal
      closeCase();

      // 2. Select corresponding select dropdown in contact form
      const selectElement = document.getElementById('formNegocio');
      if (selectElement) {
        // Map category back to dropdown option values
        let mappedVal = 'outro';
        const modalCats = (activeModalCtaCategory || '').split(' ');
        const availableOptions = ['captacao', 'corporativo', 'feira', 'convencao', 'tecnologia', 'audiovisual', 'estande'];
        // Find the first matching category in the modal category list
        const match = modalCats.find(c => availableOptions.includes(c));
        if (match) {
          mappedVal = match;
        } else {
          // Compatibility fallbacks for older classifications
          if (modalCats.includes('b2b') || modalCats.includes('corporativo')) mappedVal = 'corporativo';
          else if (modalCats.includes('fair') || modalCats.includes('feira')) mappedVal = 'feira';
          else if (modalCats.includes('convencao')) mappedVal = 'convencao';
          else if (modalCats.includes('captacao')) mappedVal = 'captacao';
          else if (modalCats.includes('tecnologia')) mappedVal = 'tecnologia';
          else if (modalCats.includes('audiovisual')) mappedVal = 'audiovisual';
          else if (modalCats.includes('estande')) mappedVal = 'estande';
        }
        
        selectElement.value = mappedVal;
      }

      // Pre-fill message area with project inquiry hint
      const textareaElement = document.getElementById('formMensagem');
      const caseTitle = caseModalTitle?.textContent || 'projeto';
      if (textareaElement) {
        textareaElement.value = `Olá! Gostaria de solicitar um orçamento e saber mais informações sobre soluções semelhantes ao case "${caseTitle}".`;
      }

      // 3. Smooth scroll to contact form after modal animation is done
      setTimeout(() => {
        const contactSection = document.getElementById('contato');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    });
  }

  // Hover-to-play logic for video case cards in main grid
  // + IntersectionObserver para pré-carregar vídeos antes de entrar no viewport
  const videoCaseCards = document.querySelectorAll('.case-item--video');

  const videoVisibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target.querySelector('.case-item-video');
      if (!video) return;

      if (entry.isIntersecting) {
        // Card entrou no viewport (ou está próximo): pré-carrega o vídeo imediatamente
        if (video.tagName === 'IFRAME') {
          const vimeoId = video.dataset.vimeoId;
          const vimeoHash = video.dataset.vimeoHash;
          if (vimeoId && !video.src) {
            const hashParam = vimeoHash ? `h=${vimeoHash}&` : '';
            video.src = `https://player.vimeo.com/video/${vimeoId}?${hashParam}background=1&autoplay=1&loop=1&muted=1`;
          }
        } else {
          const videoSrc = video.dataset.videoSrc || video.getAttribute('data-video-src');
          if (videoSrc && !video.src) {
            video.src = videoSrc;
          }
        }
      } else {
        // Card saiu do viewport: pausa e libera o src para economizar memória/banda
        if (video.tagName === 'IFRAME') {
          if (video.src) {
            video.removeAttribute('src');
          }
        } else {
          if (video.src && !video.paused) {
            video.pause();
          }
          if (!entry.target.classList.contains('video-playing') && video.src) {
            const savedSrc = video.dataset.videoSrc;
            video.removeAttribute('src');
            video.load();
            if (savedSrc) video.dataset.videoSrc = savedSrc;
          }
        }
        entry.target.classList.remove('video-playing');
      }
    });
  }, { threshold: 0, rootMargin: '250px 0px' }); // 250px de margem para carregar antes de aparecer na tela

  videoCaseCards.forEach(item => {
    const video = item.querySelector('.case-item-video');
    if (video) {
      videoVisibilityObserver.observe(item);

      item.addEventListener('mouseenter', () => {
        item.classList.add('video-playing');
        if (video.tagName === 'IFRAME') {
          const vimeoId = video.dataset.vimeoId;
          const vimeoHash = video.dataset.vimeoHash;
          if (vimeoId) {
            if (!video.src) {
              const hashParam = vimeoHash ? `h=${vimeoHash}&` : '';
              video.src = `https://player.vimeo.com/video/${vimeoId}?${hashParam}background=1&autoplay=1&loop=1&muted=1`;
            } else if (typeof Vimeo !== 'undefined') {
              const player = new Vimeo.Player(video);
              player.play().catch(err => console.log("Vimeo play interrupted", err));
            }
          }
        } else {
          const videoSrc = video.dataset.videoSrc || video.getAttribute('data-video-src');
          if (videoSrc && !video.src) {
            video.src = videoSrc;
          }
          video.play().catch(err => console.log("Grid video play interrupted", err));
        }
      });

      item.addEventListener('mouseleave', () => {
        item.classList.remove('video-playing');
        if (video.tagName === 'IFRAME') {
          if (video.src && typeof Vimeo !== 'undefined') {
            const player = new Vimeo.Player(video);
            player.pause().catch(err => console.log("Vimeo pause interrupted", err));
            player.setCurrentTime(0).catch(err => {});
          }
        } else {
          video.pause();
          video.currentTime = 0;
        }
      });
    }
  });

  // Old deck video hover handlers removed

  /* ════════════════════════════════════════════
     GALLERY LIGHTBOX INITIALIZATION
     ════════════════════════════════════════════ */
  const galleryLightbox = document.getElementById('galleryLightbox');
  const galleryLightboxOverlay = document.getElementById('galleryLightboxOverlay');
  const galleryLightboxClose = document.getElementById('galleryLightboxClose');
  const galleryLightboxContent = document.getElementById('galleryLightboxContent');
  const galleryLightboxImg = document.getElementById('galleryLightboxImg');
  const galleryLightboxVideo = document.getElementById('galleryLightboxVideo');
  const galleryLightboxPrev = document.getElementById('galleryLightboxPrev');
  const galleryLightboxNext = document.getElementById('galleryLightboxNext');
  const galleryLightboxCurrent = document.getElementById('galleryLightboxCurrent');
  const galleryLightboxTotal = document.getElementById('galleryLightboxTotal');
  const galleryLightboxThumbnails = document.getElementById('galleryLightboxThumbnails');

  let lightboxMediaArray = [];
  let lightboxCurrentIndex = 0;

  // Function to open lightbox
  function openLightbox(mediaArray, startIndex = 0) {
    lightboxMediaArray = mediaArray;
    lightboxCurrentIndex = startIndex;
    
    if (galleryLightbox && mediaArray.length > 0) {
      galleryLightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      displayLightboxMedia(startIndex);
      renderLightboxThumbnails();
      
      // Add keyboard support
      document.addEventListener('keydown', handleLightboxKeyboard);
    }
  }

  // Function to close lightbox
  function closeLightbox() {
    if (galleryLightbox) {
      galleryLightbox.classList.remove('active');
      document.body.style.overflow = '';
      
      // Stop any playing videos
      if (galleryLightboxVideo) {
        galleryLightboxVideo.pause();
        galleryLightboxVideo.src = '';
      }
      
      document.removeEventListener('keydown', handleLightboxKeyboard);
    }
  }

  // Function to display media at index
  function displayLightboxMedia(index) {
    if (index < 0 || index >= lightboxMediaArray.length) return;
    
    lightboxCurrentIndex = index;
    const mediaUrl = lightboxMediaArray[index];
    const isVideo = mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm') || mediaUrl.endsWith('.mov');

    // Hide both elements first
    if (galleryLightboxImg) galleryLightboxImg.classList.remove('active');
    if (galleryLightboxVideo) galleryLightboxVideo.classList.remove('active');

    if (isVideo) {
      if (galleryLightboxVideo) {
        galleryLightboxVideo.src = mediaUrl;
        galleryLightboxVideo.classList.add('active');
        galleryLightboxVideo.play().catch(err => console.log("Lightbox video play prevented", err));
      }
    } else {
      if (galleryLightboxImg) {
        galleryLightboxImg.src = mediaUrl;
        galleryLightboxImg.alt = `Galeria - Item ${index + 1}`;
        galleryLightboxImg.classList.add('active');
      }
    }

    // Update counter
    if (galleryLightboxCurrent) galleryLightboxCurrent.textContent = index + 1;
    if (galleryLightboxTotal) galleryLightboxTotal.textContent = lightboxMediaArray.length;

    // Update active thumbnail
    const thumbs = galleryLightboxThumbnails.querySelectorAll('.gallery-lightbox-thumb');
    thumbs.forEach((thumb, i) => {
      if (i === index) {
        thumb.classList.add('active');
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        thumb.classList.remove('active');
      }
    });
  }

  // Function to render thumbnails
  function renderLightboxThumbnails() {
    if (!galleryLightboxThumbnails) return;
    
    galleryLightboxThumbnails.innerHTML = '';
    
    lightboxMediaArray.forEach((mediaUrl, index) => {
      const thumb = document.createElement('div');
      thumb.className = 'gallery-lightbox-thumb';
      if (index === lightboxCurrentIndex) thumb.classList.add('active');

      const isVideo = mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm') || mediaUrl.endsWith('.mov');
      
      if (isVideo) {
        const video = document.createElement('video');
        video.src = mediaUrl;
        video.muted = true;
        video.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        thumb.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = mediaUrl;
        img.alt = `Thumbnail ${index + 1}`;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        thumb.appendChild(img);
      }

      thumb.addEventListener('click', () => displayLightboxMedia(index));
      galleryLightboxThumbnails.appendChild(thumb);
    });
  }

  // Keyboard navigation
  function handleLightboxKeyboard(e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      lightboxCurrentIndex = (lightboxCurrentIndex - 1 + lightboxMediaArray.length) % lightboxMediaArray.length;
      displayLightboxMedia(lightboxCurrentIndex);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      lightboxCurrentIndex = (lightboxCurrentIndex + 1) % lightboxMediaArray.length;
      displayLightboxMedia(lightboxCurrentIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
    }
  }

  // Event listeners for lightbox controls
  if (galleryLightboxClose) {
    galleryLightboxClose.addEventListener('click', closeLightbox);
  }

  if (galleryLightboxOverlay) {
    galleryLightboxOverlay.addEventListener('click', closeLightbox);
  }

  if (galleryLightboxPrev) {
    galleryLightboxPrev.addEventListener('click', () => {
      lightboxCurrentIndex = (lightboxCurrentIndex - 1 + lightboxMediaArray.length) % lightboxMediaArray.length;
      displayLightboxMedia(lightboxCurrentIndex);
    });
  }

  if (galleryLightboxNext) {
    galleryLightboxNext.addEventListener('click', () => {
      lightboxCurrentIndex = (lightboxCurrentIndex + 1) % lightboxMediaArray.length;
      displayLightboxMedia(lightboxCurrentIndex);
    });
  }

  // Make lightbox functions global for use in case modal
  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;

  // Register new magnetic hover hooks
  if (typeof cursorRing !== 'undefined') {
    const newInteractiveElements = document.querySelectorAll(
      '.news-control-btn, .deck-dot, .news-topic-badge, .news-submit-btn, .news-card-edition, ' +
      '.case-modal-close, .case-modal-cta-btn, .gallery-lightbox-close, .gallery-lightbox-nav'
    );
    newInteractiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
    });
  }

  // Hash-based Routing (Deeplinking) for cases and news
  function handleHashRouting() {
    const hash = window.location.hash;
    if (!hash) return;

    if (hash.startsWith('#case-')) {
      const slug = hash.replace('#case-', '');
      // Try to find the desktop case item card matching this slug
      const caseItems = document.querySelectorAll('.case-item');
      const matchedItem = Array.from(caseItems).find(item => {
        const titleEl = item.querySelector('.case-item-title');
        return titleEl && slugify(titleEl.textContent) === slug;
      });

      if (matchedItem) {
        matchedItem.click();
      } else {
        // Fallback: look up in database
        const caseData = casesDb[slug];
        if (caseData) {
          openCase(caseData.title, caseData.category, caseData.media[0], caseData.tag);
        }
      }
    } else if (hash.startsWith('#news-')) {
      const idx = parseInt(hash.replace('#news-', ''), 10);
      if (!isNaN(idx) && idx >= 0) {
        if (window.rstNewsViewer && typeof window.rstNewsViewer.open === 'function') {
          window.rstNewsViewer.open(idx);
        } else {
          // If viewer is not ready yet, wait for DOMContentLoaded or load
          window.addEventListener('load', () => {
            if (window.rstNewsViewer && typeof window.rstNewsViewer.open === 'function') {
              window.rstNewsViewer.open(idx);
            }
          }, { once: true });
        }
      }
    }
  }

  // Hook hashchange listener
  window.addEventListener('hashchange', handleHashRouting);

  // Hook load listener to run after DOM is fully ready and preloader is finishing
  window.addEventListener('load', () => {
    setTimeout(handleHashRouting, 500);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Copyright year dinâmico
(function() {
  const yearEl = document.getElementById('copyrightYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

/* ════════════════════════════════════════════════════
   CURSOR CUSTOM — cursor seta + rastro colorido sutil
   ════════════════════════════════════════════════════ */
(function initPixelCursor() {
  if (window.innerWidth <= 900) return; // Desabilitado em mobile/touch

  // Esconde cursor nativo
  document.documentElement.style.cursor = 'none';

  // ── Cursor SVG — seta estilo padrão, mas pixelada/colorida
  const cursorEl = document.createElement('div');
  cursorEl.id = 'pixel-cursor';
  cursorEl.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="image-rendering:pixelated; display:block;">
      <!-- Seta de cursor padrão, estilo pixel -->
      <polygon points="2,2 2,18 6,14 9,21 11,20 8,13 14,13" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>
  `;
  cursorEl.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    pointer-events: none;
    z-index: 9999999;
    transform: translate(0, 0);
    will-change: transform;
  `;
  document.body.appendChild(cursorEl);

  // ── Canvas para o rastro de pixels (transparente — sem fundo preto)
  const canvas = document.createElement('canvas');
  canvas.id = 'pixel-trail-canvas';
  canvas.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 9999997;
  `;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    // Salva pixels antes de redimensionar (evita apagar tudo)
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Paleta de cores vibrantes
  const palette = [
    '#FF2D55', '#FF9500', '#FFCC00', '#34C759',
    '#00C6FF', '#5856D6', '#BF5AF2', '#4ECDC4'
  ];

  let particles = [];
  let lastMx = -999, lastMy = -999;
  const PIXEL_SIZE = 4; // pixels pequenos e discretos

  document.addEventListener('mousemove', (e) => {
    const mx = e.clientX;
    const my = e.clientY;

    // Posiciona cursor
    cursorEl.style.transform = `translate(${mx}px, ${my}px)`;

    // Rastro sutil: apenas 1-2 partículas, só a cada 6px de movimento
    const dist = Math.hypot(mx - lastMx, my - lastMy);
    if (dist > 6) {
      const count = 1 + (dist > 14 ? 1 : 0); // máx 2 partículas
      for (let i = 0; i < count; i++) {
        particles.push({
          x: mx + (Math.random() - 0.5) * 8,
          y: my + (Math.random() - 0.5) * 8,
          size: PIXEL_SIZE,
          color: palette[Math.floor(Math.random() * palette.length)],
          alpha: 0.75,
          decay: 0.045 + Math.random() * 0.02,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -(Math.random() * 0.8 + 0.3)
        });
      }
      lastMx = mx;
      lastMy = my;
    }
  });

  document.addEventListener('mouseleave', () => { cursorEl.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursorEl.style.opacity = '1'; });

  // ── Render loop — clearRect em vez de preencher com preto
  function render() {
    // Limpa APENAS as áreas onde havia partículas (performance + sem tela preta)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) { particles.splice(i, 1); continue; }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.fillStyle = p.color;
      // Snap para grid de pixels (look retro)
      ctx.fillRect(
        Math.round(p.x / PIXEL_SIZE) * PIXEL_SIZE,
        Math.round(p.y / PIXEL_SIZE) * PIXEL_SIZE,
        p.size, p.size
      );
      ctx.restore();
    }

    requestAnimationFrame(render);
  }

  render();
})();
