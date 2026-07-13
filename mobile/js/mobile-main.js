/* ═══════════════════════════════════════════════════════════
   RSTCOM MOBILE MAIN JAVASCRIPT
   → Organizado, modular e sem animações/canvas pesados.
   → Focado em alta performance e UX nativa.
   ═══════════════════════════════════════════════════════════ */

// 1. DATA: NEWSLETTERS DA RSTCOM (Caminhos relativos corrigidos para ../assets)
const RST_NEWSLETTERS = [
  {
    id: 0,
    title: "CBGO 2026: Tecnologia, narrativa e ambientação no estande da Libbs",
    date: "Julho de 2026",
    tag: "Feiras",
    image: "assets/Seção Newsletters/CBGO 2026/newsletter julho 2026.png"
  },
  {
    id: 1,
    title: "Experiências que transformam conteúdo científico em conexão",
    date: "Junho de 2026",
    tag: "Feiras",
    image: "../assets/Seção Newsletters/Experiências que transformam conteúdo científico em conexão/newletter junho 2026_menor.jpg"
  },
  {
    id: 2,
    title: "Como Transformar Comunicação em Experiências que Ninguém Esquece",
    date: "Maio de 2026",
    tag: "Tendências RSTcom",
    image: "../assets/Seção Newsletters/Como transformar comunicação em experiências que ninguem esquece/newsletter maio 2027.jpg"
  },
  {
    id: 3,
    title: "Sua marca pode marcar pontos nesta Copa do Mundo ⚽",
    date: "Abril de 2026",
    tag: "Estratégia de Marca",
    image: "../assets/Seção Newsletters/Sua marca pode marcar pontos nesta Copa do Mundo/newsletter copa do mundo abril_V2.jpg"
  },
  {
    id: 4,
    title: "O tempo é o maior vilão (ou aliado) da sua empresa em 2026 ⏳",
    date: "Março de 2026",
    tag: "Estratégia",
    image: "../assets/Seção Newsletters/O tempo é o maior vilão(ou aliado) da sua empresa em 2026/newsletter Março 2026(Motores de Dados)_v2.jpg"
  },
  {
    id: 5,
    title: "A Nova Era da Inteligência Artificial na Comunicação",
    date: "Fevereiro de 2026",
    tag: "Inteligência Artificial",
    image: "../assets/Seção Newsletters/A nova era da Inteligência Artificial na Comunicação/newsletter fevereiro 2026(IA).jpg"
  },
  {
    id: 6,
    title: "Sherwin-Williams Brilha na FEICON: Inovação e Interatividade",
    date: "Junho de 2025",
    tag: "Feiras",
    image: "../assets/Seção Newsletters/Sherwin-Williams brilha na FEICON_Inovação e Interatividade/newsletter FEICON - 05.06.25_11H38_700X.jpg"
  },
  {
    id: 7,
    title: "Do Macro ao Micro: Como a Libbs Usa Tecnologia Interativa",
    date: "Setembro de 2025",
    tag: "Tendências RSTcom",
    image: "../assets/Seção Newsletters/Do macro ao micro/newsletter_libbs_sogesp 2025_25.09_17h47.jpg"
  },
  {
    id: 8,
    title: "RFID em Foco: Conectando Produtos e Inovações",
    date: "Novembro de 2025",
    tag: "Tecnologia",
    image: "../assets/Seção Newsletters/RFID em foco_Conectando produtos e inovações/NEWS NOV 2025 - MIDEA.jpg"
  },
  {
    id: 9,
    title: "Photo Opp: quando a experiência se transforma em uma lembrança",
    date: "Abril de 2025",
    tag: "Tendências RSTcom",
    image: "../assets/Seção Newsletters/Photo Opp_Quando a experiência se transforma em uma lembrança/NEWS ABRIL 16.04 - 18h48.jpg"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  
  // Helper slugifier
  const slugify = (text) => {
    return text.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  /* ════════════════════════════════════════════
     MENU MOBILE (HAMBURGUER)
     ════════════════════════════════════════════ */
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  const links = document.querySelectorAll('.nav-link');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const isOpen = menuBtn.classList.toggle('open');
      navLinks.classList.toggle('open', isOpen);
    });

    // Fechar menu ao clicar em qualquer link
    links.forEach(link => {
      link.addEventListener('click', () => {
        menuBtn.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ════════════════════════════════════════════
     SPY SCROLL: NAVEGAÇÃO ATIVA
     ════════════════════════════════════════════ */
  const sections = document.querySelectorAll('section, header');
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        links.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35, rootMargin: '0px' });

  sections.forEach(sec => spyObserver.observe(sec));

  /* ════════════════════════════════════════════
     CONTADOR DE NÚMEROS (STATS ANIMATION)
     ════════════════════════════════════════════ */
  const statNumbers = document.querySelectorAll('.stat-num-val');
  const statsSection = document.getElementById('sobre');
  let statsAnimated = false;

  const animateStats = () => {
    statNumbers.forEach(stat => {
      const target = parseInt(stat.dataset.target, 10);
      const prefix = stat.dataset.prefix || '';
      const suffix = stat.dataset.suffix || '';
      let current = 0;
      const duration = 1200; // ms
      const startTime = performance.now();

      const updateCount = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing out quad
        const easeProgress = progress * (2 - progress);
        current = Math.round(easeProgress * target);
        stat.textContent = `${prefix}${current}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          stat.textContent = `${prefix}${target}${suffix}`;
        }
      };

      requestAnimationFrame(updateCount);
    });
  };

  if (statsSection && statNumbers.length > 0) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
          statsAnimated = true;
          animateStats();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    statsObserver.observe(statsSection);
  }

  /* ════════════════════════════════════════════
     ACORDEÃO DE SERVIÇOS (LIGHTWEIGHT TOGGLE)
     ════════════════════════════════════════════ */
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = item.querySelector('.accordion-content');
      const isActive = item.classList.contains('active');

      // Fecha todos os outros itens
      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.accordion-content').style.maxHeight = null;
        }
      });

      // Toggle item atual
      if (isActive) {
        item.classList.remove('active');
        content.style.maxHeight = null;
      } else {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  /* ════════════════════════════════════════════
     FILTRO DE CASES (TRANSIÇÃO SUAVE)
     ════════════════════════════════════════════ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const caseCards = document.querySelectorAll('.mobile-case-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.dataset.filter;

      caseCards.forEach(card => {
        const cardCats = card.dataset.cat.split(' ');
        if (filterVal === 'all' || cardCats.includes(filterVal)) {
          card.style.display = 'block';
          // Pequeno delay para animar opacidade
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          card.style.transition = 'opacity 0.25s, transform 0.25s';
          setTimeout(() => { card.style.display = 'none'; }, 250);
        }
      });
    });
  });

  /* ════════════════════════════════════════════
     MODAL DE CASES & VÍDEO
     ════════════════════════════════════════════ */
  const caseModal = document.getElementById('caseModal');
  const caseModalClose = document.getElementById('caseModalClose');
  const modalHeroBg = document.getElementById('modalHeroBg');
  const modalHeroVideoWrapper = document.getElementById('modalHeroVideoWrapper');
  const modalTag = document.getElementById('modalTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalClient = document.getElementById('modalClient');
  const modalDate = document.getElementById('modalDate');
  const modalLocation = document.getElementById('modalLocation');
  const modalDesc = document.getElementById('modalDesc');
  const modalChallenge = document.getElementById('modalChallenge');
  const modalTechPills = document.getElementById('modalTechPills');
  const modalGalleryGrid = document.getElementById('modalGalleryGrid');
  const modalCtaBtn = document.getElementById('modalCtaBtn');

  let activeModalCtaCategory = 'outro';
  let lightboxMediaList = [];

  const openCaseModal = (card) => {
    const title = card.dataset.title;
    const slug = slugify(title);
    if (slug) {
      window.location.hash = 'case-' + slug;
    }
    const client = card.dataset.client || "Cliente RSTCOM";
    const date = card.dataset.date || "Ano 2025";
    const location = card.dataset.location || "São Paulo, Brasil";
    const tag = card.dataset.tag || "Caso de Sucesso";
    const desc = card.dataset.desc || "";
    const challenge = card.dataset.challenge || "";
    const techs = (card.dataset.techs || "").split(",");
    const vimeoId = card.dataset.vimeoId;
    const vimeoHash = card.dataset.vimeoHash;
    const imgEl = card.querySelector('.case-item-img') || card.querySelector('.mobile-deck-img');
    const mainImg = imgEl ? imgEl.src : '';
    
    activeModalCtaCategory = card.dataset.cat ? card.dataset.cat.split(' ')[0] : 'outro';

    // Injeta textos basicos
    modalTitle.textContent = title;
    modalTag.textContent = tag;
    modalClient.textContent = client;
    modalDate.textContent = date;
    modalLocation.textContent = location;
    modalDesc.textContent = desc;
    modalChallenge.textContent = challenge;

    // Ajusta cores da tag
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
      'outro': 'var(--white)'
    };
    const activeColor = catColors[activeModalCtaCategory] || 'var(--white)';
    modalTag.style.color = activeColor;
    modalTag.style.borderColor = activeColor + '33';
    modalTag.style.background = activeColor + '11';

    // Injeta Tech pills
    modalTechPills.innerHTML = '';
    techs.forEach(t => {
      if (t.trim()) {
        const pill = document.createElement('span');
        pill.className = 'case-tech-pill';
        pill.textContent = t.trim();
        modalTechPills.appendChild(pill);
      }
    });

    // Injeta Hero Video ou Imagem de Fundo
    modalHeroVideoWrapper.innerHTML = '';
    if (vimeoId) {
      modalHeroVideoWrapper.classList.add('active');
      modalHeroBg.style.backgroundImage = 'none';
      const hashParam = vimeoHash ? `?h=${vimeoHash}&` : '?';
      
      const iframe = document.createElement('iframe');
      // muted=0 para o mobile poder tocar com audio ao clique do usuario
      iframe.src = `https://player.vimeo.com/video/${vimeoId}${hashParam}badge=0&autopause=0&autoplay=1&muted=0&playsinline=1&title=0&byline=0&portrait=0`;
      iframe.frameBorder = '0';
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      modalHeroVideoWrapper.appendChild(iframe);
    } else {
      modalHeroVideoWrapper.classList.remove('active');
      modalHeroBg.style.backgroundImage = `url("${mainImg}")`;
    }

    // Injeta Galeria Dinâmica
    modalGalleryGrid.innerHTML = '';
    lightboxMediaList = [];

    // Se tiver vídeo Vimeo, adiciona o thumbnail de play na galeria
    if (vimeoId) {
      const vimeoThumb = document.createElement('div');
      vimeoThumb.className = 'case-gallery-item';
      vimeoThumb.style.cssText = 'position:relative;cursor:pointer;';
      vimeoThumb.innerHTML = `
        <img src="https://vumbnail.com/${vimeoId}.jpg" alt="Assistir vídeo" onerror="this.src='${mainImg}'" />
        <div class="case-item-play-icon">
          <svg viewBox="0 0 24 24" fill="#0A0A0A" width="18" height="18"><path d="M8 5v14l11-7z"/></svg>
        </div>
      `;
      vimeoThumb.addEventListener('click', () => {
        // Recarrega o video principal no topo
        modalHeroVideoWrapper.innerHTML = '';
        const hashParam = vimeoHash ? `?h=${vimeoHash}&` : '?';
        const iframe = document.createElement('iframe');
        iframe.src = `https://player.vimeo.com/video/${vimeoId}${hashParam}badge=0&autopause=0&autoplay=1&muted=0&playsinline=1&title=0&byline=0&portrait=0`;
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay; fullscreen; picture-in-picture';
        modalHeroVideoWrapper.appendChild(iframe);
        modalHeroVideoWrapper.classList.add('active');
        // Scroll suave de volta para o topo do modal
        caseModal.scrollTo({ top: 0, behavior: 'smooth' });
      });
      modalGalleryGrid.appendChild(vimeoThumb);
    }

    // Adiciona imagens extras (Mock dinâmico baseado em categorias reais do projeto)
    const galleryMocks = {
      'festival': ['../assets/images/case-festival.jpg', '../assets/images/case-led.jpg'],
      'convencao': ['../assets/images/case-conference.jpg', '../assets/images/case-b2b.jpg'],
      'feira': ['../assets/images/case-fair.jpg', '../assets/images/case-led.jpg'],
      'tecnologia': ['../assets/images/case-led.jpg', '../assets/images/case-launch.jpg'],
      'estande': ['../assets/images/case-fair.jpg', '../assets/images/case-conference.jpg']
    };

    const extraImages = galleryMocks[activeModalCtaCategory] || ['../assets/images/case-festival.jpg', '../assets/images/case-led.jpg'];
    
    // Sempre adiciona a imagem principal
    lightboxMediaList.push(mainImg);
    extraImages.forEach(img => lightboxMediaList.push(img));

    lightboxMediaList.forEach((mediaUrl, idx) => {
      const item = document.createElement('div');
      item.className = 'case-gallery-item';
      item.style.cursor = 'pointer';
      item.innerHTML = `<img src="${mediaUrl}" alt="Gallery Item" loading="lazy" />`;
      item.addEventListener('click', () => {
        openLightbox(lightboxMediaList, idx);
      });
      modalGalleryGrid.appendChild(item);
    });

    // Exibe o modal
    caseModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeCaseModal = () => {
    if (window.location.hash && window.location.hash.startsWith('#case-')) {
      if (window.history && window.history.pushState) {
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
      } else {
        window.location.hash = "";
      }
    }
    caseModal.classList.remove('active');
    document.body.style.overflow = '';
    modalHeroVideoWrapper.innerHTML = ''; // Limpa iframe para parar som
  };

  caseCards.forEach(card => {
    card.addEventListener('click', () => openCaseModal(card));
  });

  /* ════════════════════════════════════════════
     BRAND AUTHORITY FLOATING LOGOS
     ════════════════════════════════════════════ */
  const brandSection = document.querySelector('.brand-authority');
  const logosContainer = document.getElementById('brandLogosContainer');

  if (brandSection && logosContainer) {
    const brands = [
      { name: 'Libbs', src: '../assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo libbs.svg', color: '#005a9c', hoverGlow: 'rgba(0, 90, 156, 0.4)' },
      { name: 'Dongfeng', src: '../assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo dongfeng.svg', color: '#e4002b', hoverGlow: 'rgba(228, 0, 43, 0.4)' },
      { name: 'Pfizer', src: '../assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo pfizer.svg', color: '#00a3e0', hoverGlow: 'rgba(0, 163, 224, 0.4)' },
      { name: 'Honda', src: '../assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo honda.svg', color: '#ff0000', hoverGlow: 'rgba(255, 0, 0, 0.4)' },
      { name: 'PepsiCo', src: '../assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo pepsico.svg', color: '#004b87', hoverGlow: 'rgba(0, 75, 135, 0.4)' },
      { name: 'Sherwin-Williams', src: '../assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo_sherwin_suvinil.svg', color: '#005ea6', hoverGlow: 'rgba(0, 94, 166, 0.4)' },
      { name: 'Sanofi', src: '../assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo branca sanofi 1.svg', color: '#59d2fe', hoverGlow: 'rgba(89, 210, 254, 0.4)' },
      { name: 'Bridgestone', src: '../assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo bridgestone 1.svg', color: '#ff0000', hoverGlow: 'rgba(255, 0, 0, 0.4)' },
      { name: 'Carrefour', src: '../assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo carrefour.svg', color: '#004a97', hoverGlow: 'rgba(0, 74, 151, 0.4)' },
      { name: 'Grunenthal', src: '../assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo grunenthal.svg', color: '#009639', hoverGlow: 'rgba(0, 150, 57, 0.4)' },
      { name: 'InfoMoney', src: '../assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo infomoney.svg', color: '#002f6c', hoverGlow: 'rgba(0, 47, 108, 0.4)' },
      { name: 'Takeda', src: '../assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo takeda.svg', color: '#e31b23', hoverGlow: 'rgba(227, 27, 35, 0.4)' },
      { name: 'Teva', src: '../assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo teva.svg', color: '#0083ca', hoverGlow: 'rgba(0, 131, 202, 0.4)' },
      { name: 'XP', src: '../assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo xp 1.svg', color: '#ffcc00', hoverGlow: 'rgba(255, 204, 0, 0.4)' },
      { name: 'Petrobras', src: '../assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/LOGO PETROBRAS BRANCO 1.svg', color: '#008a4f', hoverGlow: 'rgba(0, 138, 79, 0.4)' },
      { name: 'Logo 1', src: '../assets/HOME/LOGO CLIENTES SEPARADAS(MOVIMENTO)/logo 1.svg', color: '#ffffff', hoverGlow: 'rgba(255, 255, 255, 0.3)' }
    ];

    // Filter to show 10 logos on mobile
    const mobileBrands = brands.slice(0, 10);

    // Create DOM elements
    mobileBrands.forEach((brand, idx) => {
      const item = document.createElement('div');
      item.className = 'brand-logo-item';
      item.style.zIndex = 1;

      // Wrapper for floating CSS animation
      const floatWrap = document.createElement('div');
      floatWrap.className = 'brand-logo-float';

      // Inner transition elements
      const inner = document.createElement('div');
      inner.className = 'brand-logo-inner';
      inner.style.setProperty('--hover-color-glow', brand.hoverGlow);
      inner.style.setProperty('--brand-color', brand.color);
      
      // Cascading delays for entrance animation
      const groupDelay = ((idx % 3) * 100) + 'ms';
      inner.style.transitionDelay = groupDelay;

      if (brand.isInline) {
        inner.innerHTML = brand.svg;
      } else {
        const img = document.createElement('img');
        img.src = brand.src;
        img.alt = brand.name;
        img.loading = 'lazy';
        inner.appendChild(img);
      }

      floatWrap.appendChild(inner);
      item.appendChild(floatWrap);
      logosContainer.appendChild(item);
    });

    // Intersection Observer for viewport entrance animation
    const brandObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          brandSection.classList.add('in-view');
          brandObserver.unobserve(brandSection);
        }
      });
    }, { threshold: 0.1 });
    brandObserver.observe(brandSection);
  }

  if (caseModalClose) {
    caseModalClose.addEventListener('click', closeCaseModal);
  }

  // Ação CTA dentro do Modal de Detalhes
  if (modalCtaBtn) {
    modalCtaBtn.addEventListener('click', () => {
      closeCaseModal();
      // Pre-seleciona categoria no form de contato
      const selectElement = document.getElementById('formNegocio');
      if (selectElement) {
        const availableOptions = ['captacao', 'corporativo', 'feira', 'convencao', 'tecnologia', 'audiovisual', 'estande'];
        if (availableOptions.includes(activeModalCtaCategory)) {
          selectElement.value = activeModalCtaCategory;
        } else {
          selectElement.value = 'outro';
        }
      }

      // Pre-escreve mensagem
      const textareaElement = document.getElementById('formMensagem');
      if (textareaElement) {
        textareaElement.value = `Olá! Gostaria de solicitar um orçamento sobre soluções semelhantes ao case "${modalTitle.textContent}".`;
      }

      // Scroll suave para formulário
      setTimeout(() => {
        const contactSection = document.getElementById('contato');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    });
  }

  // CTA Principal da seção Cases
  const mainCtaBtn = document.getElementById('caseCtaBtn');
  if (mainCtaBtn) {
    mainCtaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const contactSection = document.getElementById('contato');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* ════════════════════════════════════════════
     LIGHTBOX DE IMAGENS DA GALERIA
     ════════════════════════════════════════════ */
  const lightbox = document.getElementById('lightbox');
  const lightboxMedia = document.getElementById('lightboxMedia');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');

  let lightboxActiveIndex = 0;
  let currentLightboxList = [];

  const openLightbox = (mediaList, index) => {
    currentLightboxList = mediaList;
    lightboxActiveIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
  };

  const updateLightbox = () => {
    const url = currentLightboxList[lightboxActiveIndex];
    lightboxMedia.src = url;
    lightboxCounter.textContent = `${lightboxActiveIndex + 1} / ${currentLightboxList.length}`;
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    lightboxMedia.src = '';
  };

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', () => {
      lightboxActiveIndex = (lightboxActiveIndex - 1 + currentLightboxList.length) % currentLightboxList.length;
      updateLightbox();
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', () => {
      lightboxActiveIndex = (lightboxActiveIndex + 1) % currentLightboxList.length;
      updateLightbox();
    });
  }

  /* ════════════════════════════════════════════
     RST NEWS: LEITOR DE NEWSLETTER EM MODAL
     ════════════════════════════════════════════ */
  const newsModal = document.getElementById('newsModal');
  const newsModalClose = document.getElementById('newsModalClose');
  const newsModalImg = document.getElementById('newsModalImg');
  const newsModalTag = document.getElementById('newsModalTag');
  const newsModalDate = document.getElementById('newsModalDate');
  const newsModalTitle = document.getElementById('newsModalTitle');
  const newsModalExcerpt = document.getElementById('newsModalExcerpt');

  const openNewsModal = (edition) => {
    newsModalImg.src = edition.image;
    newsModalImg.alt = edition.title;
    newsModalTag.textContent = edition.tag;
    newsModalDate.textContent = edition.date;
    newsModalTitle.textContent = edition.title;
    newsModalExcerpt.textContent = edition.excerpt || "Confira a edição completa da nossa newsletter acima contendo todas as tendências, tecnologias de painéis de LED e novidades mais quentes do setor audiovisual corporativo.";

    newsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Set hash for news item
    window.location.hash = 'news-' + edition.id;
  };

  const closeNewsModal = () => {
    if (window.location.hash && window.location.hash.startsWith('#news-')) {
      if (window.history && window.history.pushState) {
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
      } else {
        window.location.hash = "";
      }
    }
    newsModal.classList.remove('active');
    document.body.style.overflow = '';
    newsModalImg.src = '';
  };

  // Click handler para os cards de news da home
  const newsCards = document.querySelectorAll('.mobile-news-card');
  newsCards.forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.index, 10);
      const editionData = RST_NEWSLETTERS[idx];
      if (editionData) {
        // Encontra o trecho da descrição direto do card
        const excerpt = card.querySelector('.news-card-excerpt').textContent;
        openNewsModal({
          ...editionData,
          excerpt: excerpt
        });
      }
    });
  });

  if (newsModalClose) {
    newsModalClose.addEventListener('click', closeNewsModal);
  }

  /* ════════════════════════════════════════════
     FORMULÁRIOS E VALIDAÇÃO (SEM BUGS)
     ════════════════════════════════════════════ */
  
  // 1. Newsletter Form
  const newsForm = document.getElementById('newsForm');
  const newsStatusMsg = document.getElementById('newsStatusMsg');

  if (newsForm && newsStatusMsg) {
    newsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsEmail');
      const nameInput = document.getElementById('newsName');
      const submitBtn = newsForm.querySelector('.news-submit-btn') || newsForm.querySelector('button[type="submit"]');

      if (!nameInput.value.trim()) {
        showNewsStatus("Por favor, digite seu nome.", "error");
        return;
      }
      if (!emailInput.value.trim() || !validateEmail(emailInput.value)) {
        showNewsStatus("Por favor, digite um e-mail corporativo válido.", "error");
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Processando...</span>';

        fetch('/api/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: nameInput.value.trim(),
            email: emailInput.value.trim()
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Server error');
          }
          return response.json();
        })
        .then(data => {
          showNewsStatus("Inscrição realizada com sucesso! Bem-vindo.", "success");
          newsForm.reset();
        })
        .catch(err => {
          console.error("Erro na inscrição:", err);
          showNewsStatus("Ocorreu um erro. Tente novamente mais tarde.", "error");
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        });
      }
    });
  }

  const showNewsStatus = (msg, type) => {
    newsStatusMsg.textContent = msg;
    newsStatusMsg.className = `news-status-msg ${type}`;
  };

  // 2. Contato Form
  const contatoForm = document.getElementById('contatoForm');

  if (contatoForm) {
    contatoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nome = document.getElementById('formNome');
      const email = document.getElementById('formEmail');
      const telefone = document.getElementById('formTelefone');
      const negocio = document.getElementById('formNegocio');
      const mensagem = document.getElementById('formMensagem');
      const submitBtn = contatoForm.querySelector('.form-submit-btn') || contatoForm.querySelector('button[type="submit"]');

      if (!nome || !nome.value.trim()) { alert("Por favor, preencha o campo Nome."); nome?.focus(); return; }
      if (!email || !email.value.trim() || !validateEmail(email.value)) { alert("Por favor, insira um e-mail válido."); email?.focus(); return; }
      if (!telefone || !telefone.value.trim()) { alert("Por favor, insira seu telefone."); telefone?.focus(); return; }
      if (!negocio || negocio.value === "") { alert("Por favor, selecione seu tipo de negócio."); negocio?.focus(); return; }
      if (!mensagem || !mensagem.value.trim()) { alert("Por favor, insira sua mensagem."); mensagem?.focus(); return; }

      // Assunto do e-mail
      const negocioText = negocio.options[negocio.selectedIndex]?.text || '';
      const assunto = `[Site RST Mobile] ${negocioText} — ${nome.value.trim()}`;

      // Desabilita botão e muda texto
      if (submitBtn) {
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
      }

      fetch("https://formsubmit.co/ajax/contato@rstcom.com.br", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: nome.value.trim(),
          email: email.value.trim(),
          phone: telefone.value.trim(),
          business: negocioText,
          message: mensagem.value.trim(),
          _subject: assunto,
          _replyto: email.value.trim(),
          _captcha: false
        })
      })
      .then(response => {
        if (response.ok) {
          // Send to Vercel Serverless Odoo Contact API in the background (non-blocking)
          fetch("/api/contact", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name: nome.value.trim(),
              email: email.value.trim(),
              phone: telefone.value.trim(),
              business: negocioText,
              message: mensagem.value.trim()
            })
          })
          .catch(odooErr => console.error("Non-blocking Odoo contact registration failed:", odooErr));

          alert("Sua mensagem foi enviada com sucesso! Nossa equipe entrará em contato em breve.");
          contatoForm.reset();
        } else {
          throw new Error("Erro no servidor");
        }
      })
      .catch(error => {
        console.error("Erro no envio:", error);
        alert("Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente mais tarde.");
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.textContent = 'Enviar Orçamento';
          submitBtn.disabled = false;
        }
      });
    });
  }

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Hash-based Routing (Deeplinking) for Mobile
  const handleHashRouting = () => {
    const hash = window.location.hash;
    if (!hash) return;

    if (hash.startsWith('#case-')) {
      const slug = hash.replace('#case-', '');
      // Try to find the mobile case card matching this slug
      const cards = document.querySelectorAll('.mobile-case-card, .mobile-deck-card, .case-item');
      const matchedCard = Array.from(cards).find(card => {
        return card.dataset.title && slugify(card.dataset.title) === slug;
      });

      if (matchedCard) {
        openCaseModal(matchedCard);
      }
    } else if (hash.startsWith('#news-')) {
      const idx = parseInt(hash.replace('#news-', ''), 10);
      if (!isNaN(idx) && idx >= 0 && idx < RST_NEWSLETTERS.length) {
        const editionData = RST_NEWSLETTERS[idx];
        if (editionData) {
          // Find matching mobile news card in the DOM to get the excerpt text if possible
          const newsCard = Array.from(document.querySelectorAll('.mobile-news-card')).find(c => parseInt(c.dataset.index, 10) === idx);
          const excerpt = newsCard ? newsCard.querySelector('.news-card-excerpt').textContent : "";
          openNewsModal({
            ...editionData,
            excerpt: excerpt
          });
        }
      }
    }
  };

  // Hook hashchange listener
  window.addEventListener('hashchange', handleHashRouting);

  // Hook load listener
  window.addEventListener('load', () => {
    setTimeout(handleHashRouting, 500);
  });

});
