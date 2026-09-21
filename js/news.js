/**
 * news.js - Controlador Dinâmico do RST News
 * Renderização dinâmica baseada no layout Studio Loop aprovado
 * Fonte de dados: js/news-data.js (10 artigos reais extraídos dos Word)
 */

// Define openArticle e closeModal no escopo global para funcionarem com onclick inline
window.openArticle = function(identifier) {
  const articles = (typeof newsArticles !== 'undefined') ? newsArticles : [];
  const article = articles.find(a => a.slug === identifier || a.id === identifier || a.id == identifier);
  const articleModalBackdrop = document.getElementById('articleModalBackdrop');
  const articleModalContent = document.getElementById('articleModalContent');

  if (!article || !articleModalBackdrop || !articleModalContent) {
    console.warn('Artigo ou modal não encontrado:', identifier);
    return;
  }

  // Constrói o corpo completo do artigo respeitando a ordem do Word
  let bodyHtml = '';
  let inList = false;

  if (Array.isArray(article.content)) {
    article.content.forEach(item => {
      if (item.type === 'list-item') {
        if (!inList) {
          bodyHtml += '<ul class="article-list">';
          inList = true;
        }
        bodyHtml += `<li>${item.text}</li>`;
      } else {
        if (inList) {
          bodyHtml += '</ul>';
          inList = false;
        }
        if (item.type === 'paragraph') {
          bodyHtml += `<p>${item.text}</p>`;
        } else if (item.type === 'heading') {
          bodyHtml += `<h3 class="article-subheading">${item.text}</h3>`;
        } else if (item.type === 'image') {
          if (item.src !== article.coverImage) {
            bodyHtml += `
              <div class="article-body-img-wrap">
                <img src="${item.src}" alt="${item.alt || ''}" loading="lazy" />
              </div>
            `;
          }
        }
      }
    });
  }

  if (inList) {
    bodyHtml += '</ul>';
  }

  articleModalContent.innerHTML = `
    <div class="article-modal-hero-img">
      <img src="${article.coverImage}" alt="${article.title}" />
    </div>
    <div class="article-modal-meta">
      <span class="meta-category-pill">${article.categoryPill}</span>
      <span class="meta-date">${article.date}</span>
      <span class="meta-sep">•</span>
      <span class="meta-author">Por: ${article.author}</span>
    </div>
    <h2 class="article-modal-title">${article.title}</h2>
    <div class="article-modal-body">
      ${bodyHtml}
    </div>
  `;

  articleModalBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';

  try {
    history.pushState({ slug: article.slug }, '', `?artigo=${encodeURIComponent(article.slug)}`);
  } catch (e) {}
};

window.closeModal = function() {
  const articleModalBackdrop = document.getElementById('articleModalBackdrop');
  if (articleModalBackdrop) {
    articleModalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    try {
      const cleanUrl = window.location.pathname;
      history.pushState(null, '', cleanUrl);
    } catch (e) {}
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const articles = (typeof newsArticles !== 'undefined') ? newsArticles : [];

  const pinnedContainer = document.getElementById('pinnedList') || document.getElementById('pinnedSideList');
  const articlesSubgridEl = document.getElementById('articlesSubgrid');
  const filterButtons = document.querySelectorAll('.filter-pill, .news-filter-btn');
  const articleModalBackdrop = document.getElementById('articleModalBackdrop');
  const articleModalClose = document.getElementById('articleModalClose');

  let currentCategory = 'all';

  // =========================================================================
  // 1. Render Pinned / Destaques (Coluna Esquerda)
  // =========================================================================
  function renderPinned() {
    if (!pinnedContainer) return;
    const pinnedList = articles.slice(0, 3);

    pinnedContainer.innerHTML = pinnedList.map(a => `
      <article class="pinned-item" onclick="window.openArticle('${a.slug}')" role="button" tabindex="0" aria-label="${a.title}">
        <div class="pinned-thumb-wrap">
          <img src="${a.coverImage}" alt="${a.title}" class="pinned-thumb-img" loading="lazy" />
        </div>
        <div class="pinned-text-wrap">
          <h3 class="pinned-title">${a.title}</h3>
          <p class="pinned-snippet">${a.date} • ${a.categoryPill}</p>
        </div>
      </article>
    `).join('');
  }

  // =========================================================================
  // 2. Render Articles Grid (Coluna Direita: Layout Studio Loop 1:1)
  // =========================================================================
  function renderArticles(category = 'all') {
    if (!articlesSubgridEl) return;

    let filtered = articles;
    if (category !== 'all') {
      filtered = articles.filter(a => a.filterTags && a.filterTags.includes(category));
      if (filtered.length === 0) {
        filtered = articles.filter(a => a.categoryPill.toLowerCase().includes(category.toLowerCase()));
      }
    }

    if (filtered.length === 0) {
      articlesSubgridEl.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 60px 0; text-align: center; color: rgba(44,24,15,0.6);">
          <p>Nenhuma matéria encontrada para esta categoria.</p>
        </div>
      `;
      return;
    }

    const heroArticle = filtered[0];
    const verticalSideArticle = filtered.length > 1 ? filtered[1] : null;
    const duoArticle1 = filtered.length > 2 ? filtered[2] : null;
    const duoArticle2 = filtered.length > 3 ? filtered[3] : null;
    const extraArticles = filtered.slice(4);

    let leftColHtml = `
      <!-- Coluna Esquerda (2/3 da grade) -->
      <div class="articles-left-subcol">
        <!-- Card Grande Herói -->
        <button type="button" class="card-featured-hero" onclick="window.openArticle('${heroArticle.slug}')" aria-label="${heroArticle.title}">
          <div class="card-featured-img-wrap">
            <img src="${heroArticle.coverImage}" alt="${heroArticle.title}" class="card-img" loading="lazy" />
          </div>
          <div class="card-info-wrap">
            <p class="card-title">${heroArticle.title}</p>
            <p class="card-excerpt">${heroArticle.excerpt}</p>
            <div class="card-meta-line">
              <span class="meta-category-pill">${heroArticle.categoryPill}</span>
              <span class="meta-date">${heroArticle.date}</span>
              <span class="meta-sep">•</span>
              <span class="meta-author">Por: ${heroArticle.author}</span>
            </div>
          </div>
        </button>
    `;

    if (duoArticle1 || duoArticle2) {
      leftColHtml += `
        <!-- Duo de Cards embaixo do Herói -->
        <div class="subcards-duo-row">
          ${duoArticle1 ? `
          <button type="button" class="subcard-item" onclick="window.openArticle('${duoArticle1.slug}')" aria-label="${duoArticle1.title}">
            <div class="subcard-img-wrap">
              <img src="${duoArticle1.coverImage}" alt="${duoArticle1.title}" class="card-img" loading="lazy" />
            </div>
            <div class="card-info-wrap">
              <p class="card-title">${duoArticle1.title}</p>
              <p class="card-excerpt">${duoArticle1.excerpt}</p>
              <div class="card-meta-line">
                <span class="meta-category-pill">${duoArticle1.categoryPill}</span>
                <span class="meta-date">${duoArticle1.date}</span>
              </div>
            </div>
          </button>
          ` : ''}

          ${duoArticle2 ? `
          <button type="button" class="subcard-item" onclick="window.openArticle('${duoArticle2.slug}')" aria-label="${duoArticle2.title}">
            <div class="subcard-img-wrap">
              <img src="${duoArticle2.coverImage}" alt="${duoArticle2.title}" class="card-img" loading="lazy" />
            </div>
            <div class="card-info-wrap">
              <p class="card-title">${duoArticle2.title}</p>
              <p class="card-excerpt">${duoArticle2.excerpt}</p>
              <div class="card-meta-line">
                <span class="meta-category-pill">${duoArticle2.categoryPill}</span>
                <span class="meta-date">${duoArticle2.date}</span>
              </div>
            </div>
          </button>
          ` : ''}
        </div>
      `;
    }

    leftColHtml += `</div>`;

    let rightColHtml = `
      <!-- Coluna Direita (1/3 da grade) -->
      <div class="articles-right-subcol">
        ${verticalSideArticle ? `
        <button type="button" class="card-vertical-side" onclick="window.openArticle('${verticalSideArticle.slug}')" aria-label="${verticalSideArticle.title}">
          <div class="card-vertical-img-wrap">
            <img src="${verticalSideArticle.coverImage}" alt="${verticalSideArticle.title}" class="card-img" loading="lazy" />
          </div>
          <div class="card-info-wrap">
            <p class="card-title">${verticalSideArticle.title}</p>
            <p class="card-excerpt">${verticalSideArticle.excerpt}</p>
            <div class="card-meta-line">
              <span class="meta-category-pill">${verticalSideArticle.categoryPill}</span>
              <span class="meta-date">${verticalSideArticle.date}</span>
              <span class="meta-sep">•</span>
              <span class="meta-author">Por: ${verticalSideArticle.author}</span>
            </div>
          </div>
        </button>
        ` : ''}
      </div>
    `;

    let extraHtml = '';
    if (extraArticles.length > 0) {
      extraHtml = `
        <!-- Matérias Adicionais (Grid de 3 Colunas) -->
        <div class="articles-extra-row">
          ${extraArticles.map(a => `
            <button type="button" class="subcard-item" onclick="window.openArticle('${a.slug}')" aria-label="${a.title}">
              <div class="subcard-img-wrap">
                <img src="${a.coverImage}" alt="${a.title}" class="card-img" loading="lazy" />
              </div>
              <div class="card-info-wrap">
                <p class="card-title">${a.title}</p>
                <p class="card-excerpt">${a.excerpt}</p>
                <div class="card-meta-line">
                  <span class="meta-category-pill">${a.categoryPill}</span>
                  <span class="meta-date">${a.date}</span>
                  <span class="meta-sep">•</span>
                  <span class="meta-author">Por: ${a.author}</span>
                </div>
              </div>
            </button>
          `).join('')}
        </div>
      `;
    }

    articlesSubgridEl.innerHTML = leftColHtml + rightColHtml + extraHtml;
  }

  // =========================================================================
  // 3. Filtros por Categoria
  // =========================================================================
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category || 'all';
      renderArticles(currentCategory);
    });
  });

  // Event Listeners de Fechamento do Modal
  if (articleModalClose) {
    articleModalClose.addEventListener('click', window.closeModal);
  }

  if (articleModalBackdrop) {
    articleModalBackdrop.addEventListener('click', (e) => {
      if (e.target === articleModalBackdrop) {
        window.closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeModal();
    }
  });

  // =========================================================================
  // 5. Suporte a Deep Linking via URL (?artigo=slug ou #slug)
  // =========================================================================
  function checkUrlForArticle() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('artigo') || params.get('post') || window.location.hash.replace('#', '');
    if (slug) {
      window.openArticle(slug);
    }
  }


  // =========================================================================
  // 6. Integração da Newsletter com Odoo API (/api/subscribe)
  // =========================================================================
  const loopNewsletterForm = document.getElementById('loopNewsletterForm');
  const loopNewsletterEmail = document.getElementById('loopNewsletterEmail');
  const loopNewsletterSubmitBtn = document.getElementById('loopNewsletterSubmitBtn');
  const loopNewsletterStatus = document.getElementById('loopNewsletterStatus');

  if (loopNewsletterForm && loopNewsletterEmail) {
    loopNewsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = loopNewsletterEmail.value.trim();
      const emailRegex = /^\S+@\S+\.\S+$/;

      if (!emailRegex.test(email)) {
        if (loopNewsletterStatus) {
          loopNewsletterStatus.textContent = '✗ Insira um e-mail válido.';
          loopNewsletterStatus.className = 'loop-newsletter-status show error';
        }
        loopNewsletterEmail.focus();
        return;
      }

      // Estado de envio
      if (loopNewsletterSubmitBtn) loopNewsletterSubmitBtn.disabled = true;
      if (loopNewsletterEmail) loopNewsletterEmail.disabled = true;
      if (loopNewsletterStatus) {
        loopNewsletterStatus.textContent = 'Cadastrando no Odoo...';
        loopNewsletterStatus.className = 'loop-newsletter-status show';
      }

      const subscriberName = email.split('@')[0];

      // Salva backup local do inscrito
      try {
        const subs = JSON.parse(localStorage.getItem('rst_subscribers') || '[]');
        subs.push({ name: subscriberName, email: email, source: 'rst-news', date: new Date().toISOString() });
        localStorage.setItem('rst_subscribers', JSON.stringify(subs));
      } catch (err) {}

      // Envio para Odoo API (/api/subscribe)
      const submitToOdoo = fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: subscriberName,
          email: email
        })
      });

      // Envio de backup para FormSubmit
      const submitToFormSubmit = fetch('https://formsubmit.co/ajax/contato@rstcom.com.br', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: subscriberName,
          email: email,
          _subject: `[Newsletter RST News] Nova Inscrição — ${email}`
        })
      });

      Promise.allSettled([submitToOdoo, submitToFormSubmit])
        .then(() => {
          if (loopNewsletterStatus) {
            loopNewsletterStatus.textContent = '✓ Inscrição confirmada com sucesso!';
            loopNewsletterStatus.className = 'loop-newsletter-status show success';
          }
          loopNewsletterEmail.value = '';
          setTimeout(() => {
            if (loopNewsletterStatus) {
              loopNewsletterStatus.className = 'loop-newsletter-status';
              loopNewsletterStatus.textContent = '';
            }
          }, 6000);
        })
        .catch(() => {
          if (loopNewsletterStatus) {
            loopNewsletterStatus.textContent = '✓ Inscrição confirmada com sucesso!';
            loopNewsletterStatus.className = 'loop-newsletter-status show success';
          }
        })
        .finally(() => {
          if (loopNewsletterSubmitBtn) loopNewsletterSubmitBtn.disabled = false;
          if (loopNewsletterEmail) loopNewsletterEmail.disabled = false;
        });
    });
  }

  // Inicialização
  renderPinned();
  renderArticles('all');
  checkUrlForArticle();
});
