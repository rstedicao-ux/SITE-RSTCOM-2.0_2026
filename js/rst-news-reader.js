/* ═══════════════════════════════════════════════════════════
   RST NEWS VIEWER — Leitor de Newsletter em Imagem PNG
   Abre a newsletter completa (1920px) com scroll vertical
   ═══════════════════════════════════════════════════════════ */

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
    image: "assets/Seção Newsletters/Experiências que transformam conteúdo científico em conexão/newletter junho 2026_menor.jpg"
  },
  {
    id: 2,
    title: "Como Transformar Comunicação em Experiências que Ninguém Esquece",
    date: "Maio de 2026",
    tag: "Tendências RSTcom",
    image: "assets/Seção Newsletters/Como transformar comunicação em experiências que ninguem esquece/newsletter maio 2027.jpg"
  },
  {
    id: 3,
    title: "Sua marca pode marcar pontos nesta Copa do Mundo ⚽",
    date: "Abril de 2026",
    tag: "Estratégia de Marca",
    image: "assets/Seção Newsletters/Sua marca pode marcar pontos nesta Copa do Mundo/newsletter copa do mundo abril_V2.jpg"
  },
  {
    id: 4,
    title: "O tempo é o maior vilão (ou aliado) da sua empresa em 2026 ⏳",
    date: "Março de 2026",
    tag: "Estratégia",
    image: "assets/Seção Newsletters/O tempo é o maior vilão(ou aliado) da sua empresa em 2026/newsletter Março 2026(Motores de Dados)_v2.jpg"
  },
  {
    id: 5,
    title: "A Nova Era da Inteligência Artificial na Comunicação",
    date: "Fevereiro de 2026",
    tag: "Inteligência Artificial",
    image: "assets/Seção Newsletters/A nova era da Inteligência Artificial na Comunicação/newsletter fevereiro 2026(IA).jpg"
  },
  {
    id: 6,
    title: "Sherwin-Williams Brilha na FEICON: Inovação e Interatividade",
    date: "Junho de 2025",
    tag: "Feiras",
    image: "assets/Seção Newsletters/Sherwin-Williams brilha na FEICON_Inovação e Interatividade/newsletter FEICON - 05.06.25_11H38_700X.jpg"
  },
  {
    id: 7,
    title: "Do Macro ao Micro: Como a Libbs Usa Tecnologia Interativa",
    date: "Setembro de 2025",
    tag: "Tendências RSTcom",
    image: "assets/Seção Newsletters/Do macro ao micro/newsletter_libbs_sogesp 2025_25.09_17h47.jpg"
  },
  {
    id: 8,
    title: "RFID em Foco: Conectando Produtos e Inovações",
    date: "Novembro de 2025",
    tag: "Tecnologia",
    image: "assets/Seção Newsletters/RFID em foco_Conectando produtos e inovações/NEWS NOV 2025 - MIDEA.jpg"
  },
  {
    id: 9,
    title: "Photo Opp: quando a experiência se transforma em uma lembrança",
    date: "Abril de 2025",
    tag: "Tendências RSTcom",
    image: "assets/Seção Newsletters/Photo Opp_Quando a experiência se transforma em uma lembrança/NEWS ABRIL 16.04 - 18h48.jpg"
  }
];

/* ═══════════════════════════════════════════════
   VIEWER CLASS
   ═══════════════════════════════════════════════ */
class RSTNewsViewer {
  constructor() {
    this.currentIndex = 0;
    this.overlay = null;
    this._build();
  }

  _build() {
    const el = document.createElement('div');
    el.id = 'rst-news-overlay';
    el.className = 'rnv-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'RST News Viewer');

    el.innerHTML = `
      <div class="rnv-backdrop"></div>
      <div class="rnv-shell" id="rnvShell">

        <!-- Botão fechar -->
        <button class="rnv-close" id="rnvClose" aria-label="Fechar newsletter">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <!-- Header info -->
        <div class="rnv-info-bar" id="rnvInfoBar">
          <div class="rnv-info-left">
            <span class="rnv-tag" id="rnvTag"></span>
            <span class="rnv-date" id="rnvDate"></span>
          </div>
          <div class="rnv-info-right">
            <span class="rnv-credit">News desenvolvida pela RSTcom</span>
            <span class="rnv-counter" id="rnvCounter"></span>
          </div>
        </div>

        <!-- Área de scroll da imagem -->
        <div class="rnv-scroll-area" id="rnvScrollArea">
          <img class="rnv-news-img" id="rnvNewsImg" src="" alt="" />
        </div>

        <!-- Seta anterior -->
        <button class="rnv-arrow rnv-arrow-prev" id="rnvPrev" aria-label="Newsletter anterior">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <!-- Seta próxima -->
        <button class="rnv-arrow rnv-arrow-next" id="rnvNext" aria-label="Próxima newsletter">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <!-- Dots -->
        <div class="rnv-dots" id="rnvDots">
          ${RST_NEWSLETTERS.map((_, i) => `<button class="rnv-dot" data-index="${i}" aria-label="Newsletter ${i + 1}"></button>`).join('')}
        </div>

      </div>
    `;

    document.body.appendChild(el);
    this.overlay = el;

    /* Events */
    el.querySelector('#rnvClose').addEventListener('click', () => this.close());
    el.querySelector('.rnv-backdrop').addEventListener('click', () => this.close());
    el.querySelector('#rnvPrev').addEventListener('click', () => this._go(this.currentIndex - 1));
    el.querySelector('#rnvNext').addEventListener('click', () => this._go(this.currentIndex + 1));

    el.querySelectorAll('.rnv-dot').forEach(btn => {
      btn.addEventListener('click', e => this._go(parseInt(e.currentTarget.dataset.index)));
    });

    document.addEventListener('keydown', e => {
      if (!this._isOpen()) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') this._go(this.currentIndex + 1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') this._go(this.currentIndex - 1);
      if (e.key === 'Escape') this.close();
    });

    /* Swipe */
    let tx = 0;
    const scrollArea = el.querySelector('#rnvScrollArea');
    scrollArea.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    scrollArea.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 60) dx < 0 ? this._go(this.currentIndex + 1) : this._go(this.currentIndex - 1);
    }, { passive: true });
  }

  _render(idx) {
    const n = RST_NEWSLETTERS[idx];
    if (!n) return;

    const img = document.getElementById('rnvNewsImg');
    const tagEl = document.getElementById('rnvTag');
    const dateEl = document.getElementById('rnvDate');
    const counter = document.getElementById('rnvCounter');
    const scrollArea = document.getElementById('rnvScrollArea');

    setTimeout(() => {
      let imgSrcPath = n.image;
      if (window.location.pathname.includes('/mobile/') && !imgSrcPath.startsWith('../')) {
        imgSrcPath = '../' + imgSrcPath;
      }
      img.src = imgSrcPath;
      img.alt = n.title;
      img.onload = () => {
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
      };
    }, 180);

    tagEl.textContent = n.tag;
    dateEl.textContent = n.date;
    counter.textContent = `${idx + 1} / ${RST_NEWSLETTERS.length}`;
    scrollArea.scrollTop = 0;

    /* Dots */
    document.querySelectorAll('.rnv-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });

    /* Arrows */
    const prev = document.getElementById('rnvPrev');
    const next = document.getElementById('rnvNext');
    prev.disabled = idx === 0;
    next.disabled = idx === RST_NEWSLETTERS.length - 1;
  }

  _go(idx) {
    if (idx < 0 || idx >= RST_NEWSLETTERS.length) return;
    this.currentIndex = idx;
    this._render(idx);
    window.location.hash = 'news-' + idx;
  }

  open(idx = 0) {
    this.currentIndex = idx;
    this._render(idx);
    this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    window.location.hash = 'news-' + idx;
  }

  close() {
    this.overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (window.location.hash && window.location.hash.startsWith('#news-')) {
      if (window.history && window.history.pushState) {
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
      } else {
        window.location.hash = "";
      }
    }
  }

  _isOpen() {
    return this.overlay.classList.contains('open');
  }
}

/* ═══════════════════════════════════════════════
   INICIALIZAÇÃO
   ═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const viewer = new RSTNewsViewer();

  /* Clique nos cards do deck */
  const newsDeck = document.getElementById('newsDeck');
  if (newsDeck) {
    newsDeck.addEventListener('click', e => {
      const card = e.target.closest('.news-card-edition');
      if (!card) return;
      if (e.target.closest('a[href]')) return;
      const idxStr = card.dataset.index;
      if (!idxStr || idxStr === 'none') return; // sem PNG disponível
      const idx = parseInt(idxStr);
      if (isNaN(idx)) return;
      viewer.open(idx);
    });

    newsDeck.querySelectorAll('.news-card-edition').forEach(card => {
      if (card.dataset.index && card.dataset.index !== 'none') {
        card.style.cursor = 'pointer';
        card.title = 'Clique para ler a newsletter';
      }
    });
  }

  window.rstNewsViewer = viewer;
});
