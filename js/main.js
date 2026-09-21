function runPreloader() {
  let preloader = document.getElementById('sitePreloader');
  if (!preloader) {
    preloader = document.createElement('div');
    preloader.className = 'site-preloader';
    preloader.id = 'sitePreloader';
    preloader.innerHTML = `
      <div class="preloader-content">
        <img src="assets/logo rstcom colorida.svg" alt="RSTCOM" class="preloader-logo" />
        <div class="preloader-bar-wrap">
          <div class="preloader-bar" id="preloaderBar"></div>
        </div>
        <div class="preloader-status">
          <span class="preloader-text">CARREGANDO EXPERIÊNCIA</span>
          <span class="preloader-percent" id="preloaderPercent">0%</span>
        </div>
      </div>
    `;
    if (document.body) {
      document.body.prepend(preloader);
    }
  }
  const bar = document.getElementById('preloaderBar');
  const percentText = document.getElementById('preloaderPercent');

  document.body.style.overflow = 'hidden';

  const startTime = Date.now();
  const MIN_DISPLAY_MS = 2500; // Garante tempo para buffer real e transição elegante
  const MAX_WAIT_MS = 6500;    // Limite máximo de segurança

  let currentPercent = 0;
  let targetPercent = 25;
  let allReady = false;
  let isFinished = false;

  function updateTarget(val) {
    if (val > targetPercent) {
      targetPercent = Math.min(100, val);
    }
  }

  // Animação suave e fluida da barra de porcentagem
  const progressTimer = setInterval(() => {
    if (currentPercent < targetPercent) {
      const diff = targetPercent - currentPercent;
      const step = Math.max(1, Math.ceil(diff * 0.16));
      currentPercent = Math.min(100, currentPercent + step);
      if (bar) bar.style.width = currentPercent + '%';
      if (percentText) percentText.textContent = currentPercent + '%';
    }

    const elapsed = Date.now() - startTime;
    if (allReady && elapsed >= MIN_DISPLAY_MS && currentPercent >= 100 && !isFinished) {
      isFinished = true;
      clearInterval(progressTimer);
      finishPreloader();
    }
  }, 25);

  function finishPreloader() {
    if (bar) bar.style.width = '100%';
    if (percentText) percentText.textContent = '100%';

    // Ativa todos os vídeos HTML5 nativos
    const htmlVideos = document.querySelectorAll('video');
    htmlVideos.forEach(v => {
      v.muted = true;
      v.play().catch(() => {});
    });

    // Ativa todos os vídeos Vimeo em iframe
    if (window.Vimeo && window.Vimeo.Player) {
      const vimeoIframes = document.querySelectorAll('iframe[src*="vimeo.com"]');
      vimeoIframes.forEach(iframe => {
        try {
          const player = new Vimeo.Player(iframe);
          player.play().catch(() => {});
        } catch(e) {}
      });
    }

    setTimeout(() => {
      preloader.classList.add('fade-out');
      window.preloaderFinished = true;
      document.body.classList.add('loaded');
      document.body.style.overflow = '';

      setTimeout(() => {
        if (preloader && preloader.parentNode) {
          preloader.parentNode.removeChild(preloader);
        }
      }, 750);
    }, 280);
  }

  // -------------------------------------------------------------
  // MONITORAMENTO DO BUFFER DOS VÍDEOS (HTML5 + VIMEO)
  // -------------------------------------------------------------
  const itemsToTrack = [];

  // 1. Vídeos HTML5 (contato, etc.)
  const htmlVideos = Array.from(document.querySelectorAll('video'));
  htmlVideos.forEach(v => {
    v.preload = 'auto';
    v.muted = true;
    itemsToTrack.push({
      type: 'html5',
      element: v,
      ready: v.readyState >= 3
    });
  });

  // 2. Iframes do Vimeo (Hero e Cards)
  const vimeoIframes = Array.from(document.querySelectorAll('iframe[src*="vimeo.com"]'));
  vimeoIframes.forEach(iframe => {
    itemsToTrack.push({
      type: 'vimeo',
      element: iframe,
      ready: false
    });
  });

  const totalItems = itemsToTrack.length;

  function checkItemReady() {
    const readyCount = itemsToTrack.filter(item => item.ready).length;
    const ratio = totalItems > 0 ? readyCount / totalItems : 1;
    updateTarget(30 + Math.round(ratio * 65));

    if (readyCount >= totalItems) {
      updateTarget(100);
      allReady = true;
    }
  }

  itemsToTrack.forEach(item => {
    if (item.type === 'html5') {
      const v = item.element;
      if (v.readyState >= 3) {
        item.ready = true;
      } else {
        const onCanPlay = () => {
          item.ready = true;
          checkItemReady();
          v.removeEventListener('canplay', onCanPlay);
          v.removeEventListener('playing', onCanPlay);
          v.removeEventListener('loadeddata', onCanPlay);
        };
        v.addEventListener('canplay', onCanPlay);
        v.addEventListener('playing', onCanPlay);
        v.addEventListener('loadeddata', onCanPlay);
      }
    } else if (item.type === 'vimeo') {
      const iframe = item.element;

      const markVimeoDone = () => {
        if (!item.ready) {
          item.ready = true;
          checkItemReady();
        }
      };

      iframe.addEventListener('load', () => {
        setTimeout(markVimeoDone, 500);
      });

      if (window.Vimeo && window.Vimeo.Player) {
        try {
          const player = new Vimeo.Player(iframe);
          player.ready().then(() => {
            player.on('play', markVimeoDone);
            player.on('loaded', markVimeoDone);
            player.on('bufferend', markVimeoDone);
            player.play().catch(() => {});
          }).catch(markVimeoDone);
        } catch(e) {
          iframe.addEventListener('load', markVimeoDone);
        }
      }
    }
  });

  checkItemReady();

  if (totalItems === 0) {
    updateTarget(100);
    allReady = true;
  }

  // Fallback seguro caso conexão externa demore
  setTimeout(() => {
    updateTarget(100);
    allReady = true;
  }, MAX_WAIT_MS);
}

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


/* ════════════════════════════════════════════
   SMART VIDEO VISIBILITY OBSERVER (GPU/CPU Saver)
   Pausa automaticamente vídeos fora da tela e retoma quando entram no viewport
   ════════════════════════════════════════════ */
function initVideoVisibilityObserver() {
  if (!('IntersectionObserver' in window)) return;

  const vimeoMap = new WeakMap();
  function getVimeo(iframe) {
    if (!window.Vimeo || !window.Vimeo.Player) return null;
    if (!vimeoMap.has(iframe)) {
      try {
        vimeoMap.set(iframe, new Vimeo.Player(iframe));
      } catch (e) {
        return null;
      }
    }
    return vimeoMap.get(iframe);
  }

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      const inView = entry.isIntersecting;

      // Não interferir no lightbox ou modal de cases abertos
      if (el.closest('#galleryLightbox') || el.closest('#caseModal')) return;

      if (el.tagName === 'VIDEO') {
        if (inView) {
          if (el.paused && !el.ended) {
            el.play().catch(() => {});
          }
        } else {
          if (!el.paused) {
            el.pause();
          }
        }
      } else if (el.tagName === 'IFRAME' && el.src && el.src.includes('vimeo.com')) {
        const player = getVimeo(el);
        if (inView) {
          if (player) {
            player.play().catch(() => {});
          } else {
            el.contentWindow?.postMessage('{"method":"play"}', '*');
          }
        } else {
          if (player) {
            player.pause().catch(() => {});
          } else {
            el.contentWindow?.postMessage('{"method":"pause"}', '*');
          }
        }
      }
    });
  }, {
    root: null,
    rootMargin: '140px 0px 140px 0px',
    threshold: 0.02
  });

  // Observa todos os vídeos de fundo e cards
  const elementsToObserve = document.querySelectorAll(
    'video.servicos-3d-title-video, video.contato-video-bg, .hero-v2__video-container iframe, .hero-v2__cards iframe'
  );
  elementsToObserve.forEach(el => videoObserver.observe(el));
}

function init() {
  runPreloader();
  initVideoVisibilityObserver();

  // Load hero background video (loads Vimeo iframe for fast streaming)
  const heroVideoBg = document.getElementById('heroVideoBg');
  if (heroVideoBg && !heroVideoBg.querySelector('iframe')) {
    const vimeoSrc = heroVideoBg.getAttribute('data-vimeo-src');
    if (vimeoSrc) {
      const iframe = document.createElement('iframe');
      iframe.src = vimeoSrc;
      iframe.frameBorder = "0";
      iframe.allow = "autoplay; fullscreen; picture-in-picture";
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      iframe.title = "DEMO REEL 10 ANOS RST";
      heroVideoBg.appendChild(iframe);
    }
  }

  /* =============================================
     ANIMAÇÃO 2 - SISTEMA DE PARTÍCULAS NO HERO
     ============================================= */
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
      }
    }

    // Create particles (optimized count for 60fps video playback)
    const COUNT = Math.min(35, Math.floor(heroCanvas.width * heroCanvas.height / 18000));
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
          const distSq = dx * dx + dy * dy;
          if (distSq < 6400) { // 80^2
            const dist = Math.sqrt(distSq);
            const opacity = (1 - dist / 80) * 0.1;
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
      
      // Completely stop RAF loop when hero section is scrolled out of view
      if (window.scrollY > (heroCanvas.height || window.innerHeight)) {
        isAnimating = false;
        animId = null;
        return;
      }

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
    '.servicos-header, .servicos-detalhes-section, ' +
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
    revealElements.forEach(el => revealObserver.observe(el));
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
  
  const filterSubtitles = {
    'conteudo-audiovisual': 'Criamos conteúdos que dão ritmo, identidade e narrativa a eventos e experiências de marca, vídeos de abertura e lançamento, vinhetas, conteúdos para LED, apresentações, highlights e produções desenvolvidas para diferentes formatos e momentos da jornada.',
    'motion-3d-design': 'Transformamos ideias em narrativas visuais por meio de motion graphics, animações, modelagem 3D, MetaHumans, conteúdos anamórficos, projection mapping e soluções gráficas criadas para gerar impacto e ampliar a experiência.',
    'tecnologia-interatividade': 'Desenvolvemos experiências em que o público deixa de apenas assistir e passa a participar. IA, realidade virtual e aumentada, holografia, RFID, telas touch, quizzes, aplicativos e outras soluções digitais conectam conteúdo, tecnologia e interação.',
    'captacao-live': 'Produzimos e operamos conteúdos ao vivo para eventos presenciais, híbridos e digitais. Lives, streaming, transmissões simultâneas, podcasts, captação multicâmera, direção de imagem e operação audiovisual para conectar conteúdo e público em tempo real.',
    'feiras-experiencias': 'Criamos experiências para feiras, congressos e espaços de marca, integrando conteúdo, tecnologia, comunicação e ativações. Projetos pensados para transformar estandes em pontos de interação, relacionamento e conexão entre marcas e públicos.'
  };

  const casesSubtitleEl = document.getElementById('casesSubtitle');

  const filterBtns = document.querySelectorAll('.filter-btn');
  const caseItems  = document.querySelectorAll('.case-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      if (casesSubtitleEl) {
        const text = filterSubtitles[filter];
        if (text) {
          casesSubtitleEl.textContent = text;
          casesSubtitleEl.classList.add('active');
        } else {
          casesSubtitleEl.classList.remove('active');
          casesSubtitleEl.textContent = '';
        }
      }

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
      const tagEl = item.querySelector('.case-item-tag'); const tagTextFromData = item.dataset.tag || (tagTextFromData);
      const imgEl = item.querySelector('.case-item-img');
      const categoryClass = item.dataset.cat;
      
      if (titleEl) {
        const title = titleEl.textContent;
        const tag = tagTextFromData;
        const imgSrc = imgEl ? imgEl.src : '';
        
        stopAllCaseVideos();
        openCase(title, categoryClass, imgSrc, tag, item);
      }
    });
  });





  /* ════════════════════════════════════════════
     PARALLAX SUAVE NA HERO
     ════════════════════════════════════════════ */
  const heroHolo = document.querySelector('.hero-holographic');
  if (heroHolo) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY < window.innerHeight) {
            heroHolo.style.transform = `translateY(${window.scrollY * 0.12}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
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

      // Salva cópia de backup do lead no navegador
      try {
        const leads = JSON.parse(localStorage.getItem('rst_leads') || '[]');
        leads.push({ name: nome, email: email, phone: telefone, business: negocio, message: mensagem, date: new Date().toISOString() });
        localStorage.setItem('rst_leads', JSON.stringify(leads));
      } catch (err) {}

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
      .finally(() => {
        if (formSuccess) {
          formSuccess.innerHTML = "✓ Sua mensagem foi enviada com sucesso! Entraremos em contato em breve.";
          formSuccess.style.color = "#00c6ff";
          formSuccess.classList.add('show');
        }
        form.reset();
        submitBtn.textContent = 'Enviar mensagem';
        submitBtn.disabled = false;
        setTimeout(() => {
          if (formSuccess) formSuccess.classList.remove('show');
        }, 6000);
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
    let autoPlayTimer = null;

    // Layout configuration values
    const baseTranslateX = 200;
    const extraTranslateX = 175;

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

    // Auto-rotation timer (cycles every 3.8s automatically)
    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(() => {
        if (!isDragging) {
          targetProgress = Math.round(targetProgress) + 1;
          startAnimation();
        }
      }, 3800);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    // Render immediately on script load, window load, and resize
    render();
    startAnimation();
    startAutoPlay();

    window.addEventListener('load', () => {
      render();
      startAnimation();
    });

    window.addEventListener('resize', () => {
      render();
    });

    // Touch/Drag events
    const viewport = document.getElementById('carouselViewport');
    let carouselDragMoved = false;
    if (viewport) {
      const handleStart = (e) => {
        if (e.type === 'mousedown') {
          e.preventDefault();
        }
        isDragging = true;
        stopAutoPlay();
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
        startAutoPlay();
      };

      viewport.addEventListener('mousedown', handleStart);
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);

      viewport.addEventListener('touchstart', handleStart, { passive: true });
      viewport.addEventListener('touchmove', handleMove, { passive: true });
      viewport.addEventListener('touchend', handleEnd);
      viewport.style.cursor = 'grab';

      viewport.addEventListener('mouseenter', stopAutoPlay);
      viewport.addEventListener('mouseleave', startAutoPlay);
    }

    // Prev/Next buttons
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        stopAutoPlay();
        targetProgress = Math.round(targetProgress) + 1;
        startAnimation();
        startAutoPlay();
      });
    }
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        stopAutoPlay();
        targetProgress = Math.round(targetProgress) - 1;
        startAnimation();
        startAutoPlay();
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
        stopAutoPlay();
        let diff = idx - (targetProgress % n);
        while (diff > n / 2) diff -= n;
        while (diff < -n / 2) diff += n;

        targetProgress = targetProgress + diff;
        startAnimation();
        startAutoPlay();
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
        stopAutoPlay();
        if (e.deltaX > 10 || e.deltaY > 10) {
          targetProgress = Math.round(targetProgress) + 1;
        } else if (e.deltaX < -10 || e.deltaY < -10) {
          targetProgress = Math.round(targetProgress) - 1;
        }
        startAnimation();
        startAutoPlay();
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
  }

  /* ════════════════════════════════════════════
     CASES CTA — CONTROLE DOS CARDS DE SERVIÇO
     ════════════════════════════════════════════ */
  const ctaViewport = document.getElementById('casesCtaViewport');
  const ctaCards = Array.from(document.querySelectorAll('.cta-service-card, .cta-3d-card'));
  const ctaPrevBtn = document.getElementById('casesCtaPrev');
  const ctaNextBtn = document.getElementById('casesCtaNext');
  const ctaDots = Array.from(document.querySelectorAll('#casesCtaDots .cta-dot'));

  if (ctaCards.length > 0) {
    const N = ctaCards.length;
    let activeIndex = 2; // Default: Eventos Corporativos (Card index 2)

    function setActiveCtaCard(idx) {
      activeIndex = (idx % N + N) % N;
      ctaCards.forEach((card, i) => {
        if (i === activeIndex) {
          card.classList.add('active', 'cta-service-card--featured');
        } else {
          card.classList.remove('active', 'cta-service-card--featured');
        }
      });

      ctaDots.forEach((dot, i) => {
        if (i === activeIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    if (ctaPrevBtn) {
      ctaPrevBtn.addEventListener('click', () => {
        setActiveCtaCard(activeIndex - 1);
      });
    }

    if (ctaNextBtn) {
      ctaNextBtn.addEventListener('click', () => {
        setActiveCtaCard(activeIndex + 1);
      });
    }

    ctaDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        setActiveCtaCard(i);
      });
    });

    ctaCards.forEach((card, i) => {
      card.addEventListener('click', () => {
        setActiveCtaCard(i);
      });
    });
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

        // Salva backup local do inscrito
        try {
          const subs = JSON.parse(localStorage.getItem('rst_subscribers') || '[]');
          subs.push({ name: pendingName, email: pendingEmail, date: new Date().toISOString() });
          localStorage.setItem('rst_subscribers', JSON.stringify(subs));
        } catch (e) {}

        const submitToApi = fetch('/api/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: pendingName,
            email: pendingEmail
          })
        });

        const submitToFormSubmit = fetch('https://formsubmit.co/ajax/contato@rstcom.com.br', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: pendingName,
            email: pendingEmail,
            _subject: `[Newsletter RST] Nova Inscrição — ${pendingName}`
          })
        });

        Promise.allSettled([submitToApi, submitToFormSubmit])
        .finally(() => {
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
  // Função para preparar dados do case
  // ════════════════════════════════════════════
  function prepareCaseData(data) {
    // Mantém a lista de mídia limpa apenas com caminhos válidos de imagens/vídeos locais
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

  // Gerenciamento e controle centralizado de instâncias do player Vimeo
  const vimeoPlayers = new WeakMap();

  function getOrCreateVimeoPlayer(iframe) {
    if (!iframe) return null;
    if (vimeoPlayers.has(iframe)) return vimeoPlayers.get(iframe);
    if (typeof Vimeo !== 'undefined' && Vimeo.Player) {
      try {
        const player = new Vimeo.Player(iframe);
        vimeoPlayers.set(iframe, player);
        return player;
      } catch (err) {
        return null;
      }
    }
    return null;
  }


  // Interrompe e silencia absolutamente todos os vídeos ativos nos cases (grid, modal e lightbox)
  function stopAllCaseVideos() {
    // 1. Pausa e reseta vídeo local do modal do case
    const videoNode = document.getElementById('caseModalHeroVideo');
    if (videoNode) {
      try {
        videoNode.pause();
        videoNode.currentTime = 0;
      } catch (e) {}
    }

    // 2. Destrói e descarrega com segurança qualquer iframe Vimeo do modal de cases
    if (caseModalHeroVideoWrapper) {
      const modalIframes = caseModalHeroVideoWrapper.querySelectorAll('iframe');
      modalIframes.forEach(iframe => {
        try {
          const p = getOrCreateVimeoPlayer(iframe);
          if (p) {
            p.setMuted(true).catch(() => {});
            p.pause().catch(() => {});
            p.unload().catch(() => {});
          }
          iframe.contentWindow?.postMessage('{"method":"pause"}', '*');
          iframe.contentWindow?.postMessage('{"method":"setVolume","value":0}', '*');
        } catch (err) {}
        iframe.src = 'about:blank';
        iframe.remove();
      });
      caseModalHeroVideoWrapper.classList.remove('active');
    }

    // 3. Pausa qualquer vídeo da galeria interna do modal
    if (caseModalGalleryGrid) {
      const galleryVideos = caseModalGalleryGrid.querySelectorAll('video');
      galleryVideos.forEach(v => {
        try {
          v.pause();
          v.currentTime = 0;
        } catch (e) {}
      });
    }

    // 4. Pausa e limpa o Lightbox de galeria
    if (typeof galleryLightboxVideo !== 'undefined' && galleryLightboxVideo) {
      try {
        galleryLightboxVideo.pause();
        galleryLightboxVideo.currentTime = 0;
        galleryLightboxVideo.src = '';
        galleryLightboxVideo.style.display = 'none';
        galleryLightboxVideo.classList.remove('active');
      } catch (e) {}
    }
    if (typeof galleryLightboxIframe !== 'undefined' && galleryLightboxIframe) {
      try {
        const p = getOrCreateVimeoPlayer(galleryLightboxIframe);
        if (p) {
          p.setMuted(true).catch(() => {});
          p.pause().catch(() => {});
          p.unload().catch(() => {});
        }
        galleryLightboxIframe.contentWindow?.postMessage('{"method":"pause"}', '*');
      } catch (err) {}
      galleryLightboxIframe.src = 'about:blank';
      galleryLightboxIframe.style.display = 'none';
      galleryLightboxIframe.classList.remove('active');
    }

    // 5. Pausa e reseta todos os cards de vídeo no grid principal
    const allGridCards = document.querySelectorAll('.case-item--video');
    allGridCards.forEach(card => {
      card.classList.remove('video-playing');
      const v = card.querySelector('video');
      if (v) {
        try {
          v.pause();
          v.currentTime = 0;
        } catch (e) {}
      }
      const ifr = card.querySelector('iframe.case-item-video');
      if (ifr) {
        try {
          const p = getOrCreateVimeoPlayer(ifr);
          if (p) {
            p.setMuted(true).catch(() => {});
            p.pause().catch(() => {});
            p.setCurrentTime(0).catch(() => {});
          }
          ifr.contentWindow?.postMessage('{"method":"pause"}', '*');
          ifr.contentWindow?.postMessage('{"method":"setVolume","value":0}', '*');
        } catch (err) {}
      }
    });
  }

  function openCase(titleText, categoryClass, imgSrc, tagText, element = null) {
    if (!caseModal) return;
    stopAllCaseVideos();

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
        media: element.dataset.media ? element.dataset.media.split(",").map(t => t.trim()).filter(Boolean) : [imgSrc].filter(Boolean),
        vimeoId: element.dataset.vimeoId || "",
        video: !!element.dataset.vimeoId,
        videoSrc: element.dataset.vimeoId ? `https://player.vimeo.com/video/${element.dataset.vimeoId}` : "",
        category: element.dataset.cat || categoryClass || "outro",
        gameUrl: element.dataset.gameUrl || ""
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
        media: [imgSrc].filter(Boolean),
        video: false,
        category: categoryClass || "outro"
      };
    }

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
        caseModalTechPills.appendChild(pill);
      });
    }

    // Render Game Button if present
    let gameBtn = document.getElementById('caseModalGameBtn');
    if (data.gameUrl) {
      if (!gameBtn) {
        gameBtn = document.createElement('a');
        gameBtn.id = 'caseModalGameBtn';
        gameBtn.className = 'case-modal-game-btn';
        gameBtn.target = '_blank';
        gameBtn.rel = 'noopener noreferrer';
        gameBtn.innerHTML = '🎮 Testar Quiz / Game Interativo';
        if (caseModalCtaBtn && caseModalCtaBtn.parentNode) {
          caseModalCtaBtn.parentNode.insertBefore(gameBtn, caseModalCtaBtn);
        }
      }
      gameBtn.href = data.gameUrl;
      gameBtn.style.display = 'inline-flex';
    } else if (gameBtn) {
      gameBtn.style.display = 'none';
    }

    // Render Hero Video setup first
    const videoNode = document.getElementById('caseModalHeroVideo');

    // Render Gallery
    if (caseModalGalleryGrid) {
      caseModalGalleryGrid.innerHTML = '';
      const galleryItemsForLightbox = [];

      // If case has a Vimeo video, add a Vimeo thumbnail tile first
      if (data.vimeoId) {
        const vimeoMediaItem = {
          type: 'vimeo',
          vimeoId: data.vimeoId,
          vimeoHash: data.vimeoHash,
          title: data.title + ' - Vídeo'
        };
        galleryItemsForLightbox.push(vimeoMediaItem);

        const vimeoThumbItem = document.createElement('div');
        vimeoThumbItem.className = 'case-gallery-item case-gallery-vimeo';
        vimeoThumbItem.title = 'Assistir vídeo no Lightbox';
        vimeoThumbItem.style.cssText = 'position:relative;cursor:pointer;background:#111;';

        const thumbImg = document.createElement('img');
        thumbImg.src = `https://vumbnail.com/${data.vimeoId}.jpg`;
        thumbImg.alt = data.title + ' - Vídeo';
        thumbImg.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        thumbImg.onerror = function() {
          this.onerror = null;
          this.src = (data.media && data.media[0]) ? data.media[0] : 'assets/images/case-festival.jpg';
        };

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

        // Click: opens Vimeo video in full-screen Lightbox AND updates hero
        vimeoThumbItem.addEventListener('click', () => {
          window.openLightbox(galleryItemsForLightbox, 0);

          // Update hero video at top
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
        if (!imgUrl || typeof imgUrl !== 'string' || imgUrl.includes('vimeo.com')) return;

        galleryItemsForLightbox.push(imgUrl);
        const lightboxIndex = galleryItemsForLightbox.length - 1;

        const item = document.createElement('div');
        item.className = 'case-gallery-item';
        item.style.cursor = 'pointer';

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

          item.addEventListener('mouseenter', () => {
            galleryVid.play().catch(err => console.log("Gallery play prevented", err));
          });
          item.addEventListener('mouseleave', () => {
            galleryVid.pause();
            galleryVid.currentTime = 0;
          });

          item.addEventListener('click', () => {
            window.openLightbox(galleryItemsForLightbox, lightboxIndex);
          });
        } else {
          const img = document.createElement('img');
          img.src = imgUrl;
          img.alt = data.title;
          img.loading = 'lazy';
          img.onerror = function() {
            this.onerror = null;
            this.src = 'assets/images/case-festival.jpg';
          };
          item.appendChild(img);

          item.addEventListener('click', () => {
            window.openLightbox(galleryItemsForLightbox, lightboxIndex);
          });
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
        const iframeSrc = `https://player.vimeo.com/video/${data.vimeoId}${hashParam}badge=0&autopause=1&autoplay=1&muted=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0`;
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
    stopAllCaseVideos();
    
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
      { name: 'Abras', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo abras.svg', color: '#005ba4' },
      { name: 'Anbima', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo anbima.svg', color: '#004b8d' },
      { name: 'Bauny', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo bauny.svg', color: '#222222' },
      { name: 'Bosch', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo bosch.svg', color: '#e3001b' },
      { name: 'Bridgestone', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo bridgestone 1.svg', color: '#d01216' },
      { name: 'Carrefour', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo carrefour.svg', color: '#004a97' },
      { name: 'Colgate', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo colgate.svg', color: '#e31b23' },
      { name: 'Dongfeng', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo dongfeng.svg', color: '#e4002b' },
      { name: 'Estácio', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo estacio.svg', color: '#005580' },
      { name: 'Finclass', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo finclass.svg', color: '#000000', keepBlack: true },
      { name: 'Grunenthal', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo grunenthal.svg', color: '#009639' },
      { name: 'Grupo SC', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo grupo sc.svg', color: '#003764' },
      { name: 'HBR', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo hbr.svg', color: '#000000', keepBlack: true },
      { name: 'Honda', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo honda.svg', color: '#ff0000' },
      { name: 'InfoMoney', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo infomoney.svg', color: '#002f6c', keepBlack: true },
      { name: 'KPMG', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo kpmg.svg', color: '#00338d' },
      { name: 'Libbs', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo libbs.svg', color: '#47ad33' },
      { name: 'Medison', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo medison.svg', color: '#004785' },
      { name: 'Midea', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo midea.svg', color: '#0060a8' },
      { name: 'Motorola', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo motorola.svg', color: '#000000', keepBlack: true },
      { name: 'Nuvemshop', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo nuvemshop.svg', color: '#2d3dfb' },
      { name: 'PepsiCo', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo pepsico.svg', color: '#004b87' },
      { name: 'Petrobras', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/LOGO PETROBRAS BRANCO 1.svg', color: '#008a4f' },
      { name: 'Pfizer', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo pfizer.svg', color: '#00a3e0' },
      { name: 'Samsung', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo samsung.svg', color: '#034ea2' },
      { name: 'Sanofi', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo branca sanofi 1.svg', color: '#584293' },
      { name: 'Sherwin-Williams', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/LOGO SHERWIN-WILLIAMS.svg', color: '#005ea6', keepBlack: true },
      { name: 'Suvinil', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo suvinil.svg', color: '#f58220' },
      { name: 'Takeda', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo takeda.svg', color: '#e31b23' },
      { name: 'Teva', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo teva.svg', color: '#0083ca' },
      { name: 'Venancio', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo venancio.svg', color: '#ff7700' },
      { name: 'XP', src: 'assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo xp 1.svg', color: '#e5a900', keepBlack: true }
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
  // O iframe do Vimeo é carregado UMA VEZ quando o card aparece na tela.
  // Depois, usamos a API do Vimeo para pausar/tocar sem destruir o player.
  const videoCaseCards = document.querySelectorAll('.case-item--video');
  // (vimeoPlayers e getOrCreateVimeoPlayer definidos centralizadamente no topo do escopo)

  const videoVisibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target.querySelector('.case-item-video');
      if (!video) return;

      if (entry.isIntersecting) {
        // Card entrou no viewport: carrega o iframe pela primeira vez (se ainda não carregou)
        if (video.tagName === 'IFRAME' && !video.src) {
          const vimeoId = video.dataset.vimeoId;
          const vimeoHash = video.dataset.vimeoHash;
          if (vimeoId) {
            const hashParam = vimeoHash ? `h=${vimeoHash}&` : '';
            video.src = `https://player.vimeo.com/video/${vimeoId}?${hashParam}background=1&autoplay=0&loop=1&muted=1`;
          }
        }
        // Se o card está visível mas o mouse não está em cima, mantém pausado (já parou no mouseleave)
      } else {
        // Card saiu do viewport: pausa via API sem destruir o iframe
        if (video.tagName === 'IFRAME' && video.src) {
          const player = getOrCreateVimeoPlayer(video);
          if (player) {
            player.pause().catch(() => {});
          }
        }
        entry.target.classList.remove('video-playing');
      }
    });
  }, { threshold: 0, rootMargin: '150px 0px' });

  videoCaseCards.forEach(item => {
    const video = item.querySelector('.case-item-video');
    if (video) {
      videoVisibilityObserver.observe(item);

      item.addEventListener('mouseenter', () => {
        item.classList.add('video-playing');
        if (video.tagName === 'IFRAME') {
          const vimeoId = video.dataset.vimeoId || video.getAttribute('data-vimeo-id');
          const vimeoHash = video.dataset.vimeoHash || video.getAttribute('data-vimeo-hash');
          if (vimeoId) {
            const hashParam = vimeoHash ? `h=${vimeoHash}&` : '';
            const targetSrc = `https://player.vimeo.com/video/${vimeoId}?${hashParam}background=1&autoplay=1&loop=1&muted=1&autopause=0`;
            if (!video.src || video.src === 'about:blank' || !video.src.includes('autoplay=1')) {
              video.src = targetSrc;
            }
            const player = getOrCreateVimeoPlayer(video);
            if (player) {
              player.setMuted(true).then(() => player.play()).catch(() => {
                video.src = targetSrc;
              });
            }
          }
        } else {
          const videoSrc = video.dataset.videoSrc || video.getAttribute('data-video-src');
          if (videoSrc && !video.src) video.src = videoSrc;
          video.play().catch(err => console.log('Grid video play interrupted', err));
        }
      });

      item.addEventListener('mouseleave', () => {
        item.classList.remove('video-playing');
        if (video.tagName === 'IFRAME' && video.src) {
          // Pausa via API sem destruir o iframe
          const player = getOrCreateVimeoPlayer(video);
          if (player) {
            player.pause().catch(() => {});
            player.setCurrentTime(0).catch(() => {});
          }
        } else if (video.tagName !== 'IFRAME') {
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
  const galleryLightboxIframe = document.getElementById('galleryLightboxIframe');
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
    
    // Pausa vídeo do modal caso esteja tocando ao abrir a galeria em tela cheia
    const modalHeroIframe = caseModalHeroVideoWrapper ? caseModalHeroVideoWrapper.querySelector('iframe.vimeo-embed') : null;
    if (modalHeroIframe) {
      try {
        const p = getOrCreateVimeoPlayer(modalHeroIframe);
        if (p) p.pause().catch(() => {});
        modalHeroIframe.contentWindow?.postMessage('{"method":"pause"}', '*');
      } catch(e) {}
    }
    const modalHeroVid = document.getElementById('caseModalHeroVideo');
    if (modalHeroVid) {
      try { modalHeroVid.pause(); } catch(e) {}
    }

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
      
      // Interrompe imediatamente qualquer vídeo ou áudio ativo
      if (galleryLightboxVideo) {
        try {
          galleryLightboxVideo.pause();
          galleryLightboxVideo.muted = true;
          galleryLightboxVideo.currentTime = 0;
          galleryLightboxVideo.src = '';
        } catch (e) {}
        galleryLightboxVideo.style.display = 'none';
        galleryLightboxVideo.classList.remove('active');
      }
      if (galleryLightboxIframe) {
        try {
          const p = getOrCreateVimeoPlayer(galleryLightboxIframe);
          if (p) {
            p.setMuted(true).catch(() => {});
            p.pause().catch(() => {});
            p.unload().catch(() => {});
          }
          galleryLightboxIframe.contentWindow?.postMessage('{"method":"pause"}', '*');
          galleryLightboxIframe.contentWindow?.postMessage('{"method":"setVolume","value":0}', '*');
        } catch (e) {}
        galleryLightboxIframe.src = 'about:blank';
        galleryLightboxIframe.style.display = 'none';
        galleryLightboxIframe.classList.remove('active');
      }
      if (galleryLightboxImg) {
        galleryLightboxImg.style.display = 'none';
        galleryLightboxImg.classList.remove('active');
      }
      
      document.removeEventListener('keydown', handleLightboxKeyboard);
    }
  }

  // Function to display media at index
  function displayLightboxMedia(index) {
    if (index < 0 || index >= lightboxMediaArray.length) return;
    
    lightboxCurrentIndex = index;
    const mediaItem = lightboxMediaArray[index];

    // Hide all 3 media elements and pause/silence prior audio first
    if (galleryLightboxImg) {
      galleryLightboxImg.classList.remove('active');
      galleryLightboxImg.style.display = 'none';
    }
    if (galleryLightboxVideo) {
      try {
        galleryLightboxVideo.pause();
        galleryLightboxVideo.muted = true;
        galleryLightboxVideo.currentTime = 0;
        galleryLightboxVideo.src = '';
      } catch (e) {}
      galleryLightboxVideo.classList.remove('active');
      galleryLightboxVideo.style.display = 'none';
    }
    if (galleryLightboxIframe) {
      try {
        const p = getOrCreateVimeoPlayer(galleryLightboxIframe);
        if (p) {
          p.setMuted(true).catch(() => {});
          p.pause().catch(() => {});
          p.unload().catch(() => {});
        }
        galleryLightboxIframe.contentWindow?.postMessage('{"method":"pause"}', '*');
      } catch (e) {}
      galleryLightboxIframe.src = 'about:blank';
      galleryLightboxIframe.classList.remove('active');
      galleryLightboxIframe.style.display = 'none';
    }

    const isVimeoObj = typeof mediaItem === 'object' && mediaItem !== null && mediaItem.type === 'vimeo';
    const isVimeoUrl = typeof mediaItem === 'string' && mediaItem.includes('vimeo.com');
    const isVideoFile = typeof mediaItem === 'string' && (mediaItem.endsWith('.mp4') || mediaItem.endsWith('.webm') || mediaItem.endsWith('.mov'));

    if (isVimeoObj || isVimeoUrl) {
      let vId = isVimeoObj ? mediaItem.vimeoId : (mediaItem.match(/video\/(\d+)/) || [])[1];
      let vHash = isVimeoObj ? mediaItem.vimeoHash : '';
      if (vId && galleryLightboxIframe) {
        const hashParam = vHash ? `?h=${vHash}&` : '?';
        galleryLightboxIframe.src = `https://player.vimeo.com/video/${vId}${hashParam}badge=0&autopause=0&autoplay=1&muted=0&title=0&byline=0&portrait=0`;
        galleryLightboxIframe.classList.add('active');
        galleryLightboxIframe.style.display = 'block';
      }
    } else if (isVideoFile) {
      if (galleryLightboxVideo) {
        galleryLightboxVideo.src = mediaItem;
        galleryLightboxVideo.muted = false; // Áudio ativado intencionalmente pelo usuário no modal
        galleryLightboxVideo.volume = 1;
        galleryLightboxVideo.controls = true; // Controles de reprodução, volume e tela cheia acessíveis
        galleryLightboxVideo.classList.add('active');
        galleryLightboxVideo.style.display = 'block';
        galleryLightboxVideo.play().catch(err => console.log("Lightbox video play prevented", err));
      }
    } else {
      if (galleryLightboxImg) {
        const imgSrc = typeof mediaItem === 'string' ? mediaItem : (mediaItem.src || mediaItem.url || 'assets/images/case-festival.jpg');
        galleryLightboxImg.src = imgSrc;
        galleryLightboxImg.alt = `Galeria - Item ${index + 1}`;
        galleryLightboxImg.onerror = function() {
          this.onerror = null;
          this.src = 'assets/images/case-festival.jpg';
        };
        galleryLightboxImg.classList.add('active');
        galleryLightboxImg.style.display = 'block';
      }
    }

    // Update counter
    if (galleryLightboxCurrent) galleryLightboxCurrent.textContent = index + 1;
    if (galleryLightboxTotal) galleryLightboxTotal.textContent = lightboxMediaArray.length;

    // Update active thumbnail
    const thumbs = galleryLightboxThumbnails ? galleryLightboxThumbnails.querySelectorAll('.gallery-lightbox-thumb') : [];
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
    
    lightboxMediaArray.forEach((mediaItem, index) => {
      const thumb = document.createElement('div');
      thumb.className = 'gallery-lightbox-thumb';
      if (index === lightboxCurrentIndex) thumb.classList.add('active');

      const isVimeoObj = typeof mediaItem === 'object' && mediaItem !== null && mediaItem.type === 'vimeo';
      const isVimeoUrl = typeof mediaItem === 'string' && mediaItem.includes('vimeo.com');
      const isVideoFile = typeof mediaItem === 'string' && (mediaItem.endsWith('.mp4') || mediaItem.endsWith('.webm') || mediaItem.endsWith('.mov'));
      
      if (isVimeoObj || isVimeoUrl) {
        let vId = isVimeoObj ? mediaItem.vimeoId : (mediaItem.match(/video\/(\d+)/) || [])[1];
        const img = document.createElement('img');
        img.src = `https://vumbnail.com/${vId}.jpg`;
        img.alt = `Vídeo ${index + 1}`;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        img.onerror = function() { this.src = 'assets/images/case-festival.jpg'; };
        thumb.style.position = 'relative';
        thumb.appendChild(img);

        const playBadge = document.createElement('div');
        playBadge.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:20px;height:20px;background:rgba(0,198,255,0.9);border-radius:50%;display:flex;align-items:center;justify-content:center;pointer-events:none;';
        playBadge.innerHTML = '<svg viewBox="0 0 24 24" fill="#fff" width="10" height="10"><path d="M8 5v14l11-7z"/></svg>';
        thumb.appendChild(playBadge);
      } else if (isVideoFile) {
        const video = document.createElement('video');
        video.src = mediaItem;
        video.muted = true;
        video.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        thumb.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = typeof mediaItem === 'string' ? mediaItem : (mediaItem.src || mediaItem.url || 'assets/images/case-festival.jpg');
        img.alt = `Thumbnail ${index + 1}`;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        img.onerror = function() { this.src = 'assets/images/case-festival.jpg'; };
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


