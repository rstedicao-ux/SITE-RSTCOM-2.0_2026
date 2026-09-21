/**
 * SEÇÃO SERVIÇOS — RSTCOM (100% TWIST FIDELITY)
 * 1. Transição Horizontal Pinned Contínua (4 Painéis)
 * 2. Painel 3: Diferenciais com Vídeo Fullscreen Local & Rolagem Vertical dos 5 Itens
 * 3. Painel 4: Faixas 3D com rotação 90° no eixo X
 */

(function() {
  'use strict';

  function initServicos() {
    const servicosSection = document.getElementById('servicos');
    if (!servicosSection) return;

    const pinnedWrapper = document.getElementById('servicosPinnedWrapper');
    const horizontalTrack = document.getElementById('servicosHorizontalTrack');
    const diffVerticalTrack = document.getElementById('diffVerticalTrack');
    const diffItems = Array.from(document.querySelectorAll('.diff-vertical-item'));
    const progDots = Array.from(document.querySelectorAll('.diff-prog-dot'));

    // Garantir reprodução imediata de todos os vídeos de background
    const allVideos = Array.from(servicosSection.querySelectorAll('video'));
    allVideos.forEach(v => {
      v.muted = true;
      v.play().catch(() => {});
    });

    let isDesktop = window.innerWidth >= 992;
    let ticking = false;

    function updateScrollEffects() {
      if (!pinnedWrapper || !horizontalTrack) {
        ticking = false;
        return;
      }

      if (!isDesktop) {
        horizontalTrack.style.transform = 'none';
        if (diffVerticalTrack) diffVerticalTrack.style.transform = 'none';
        ticking = false;
        return;
      }

      const rect = pinnedWrapper.getBoundingClientRect();
      const maxScroll = pinnedWrapper.offsetHeight - window.innerHeight;

      if (maxScroll <= 0) {
        ticking = false;
        return;
      }

      // Progresso normalizado [0, 1]
      const p = Math.max(0, Math.min(1, -rect.top / maxScroll));
      const w = window.innerWidth;
      let targetX = 0;

      // [0.00 - 0.20]: Painel 1 (Hero) -> Painel 2 (Branco)
      // [0.20 - 0.35]: Painel 2 -> Painel 3 (Diferenciais Fullscreen)
      // [0.35 - 0.82]: Painel 3 FIXO horizontalmente; os 5 diferenciais rolam verticalmente!
      // [0.82 - 1.00]: Painel 3 -> Painel 4 (Lista 3D)

      if (p < 0.20) {
        const subP = p / 0.20;
        targetX = -subP * w;
        if (diffVerticalTrack && diffItems.length > 0) {
          diffVerticalTrack.style.transform = 'translate3d(0, 0, 0)';
          progDots.forEach((dot, idx) => dot.classList.toggle('active', idx === 0));
        }
      } else if (p < 0.35) {
        const subP = (p - 0.20) / (0.35 - 0.20);
        targetX = -w - (subP * w);
        if (diffVerticalTrack && diffItems.length > 0) {
          diffVerticalTrack.style.transform = 'translate3d(0, 0, 0)';
          progDots.forEach((dot, idx) => dot.classList.toggle('active', idx === 0));
        }
      } else if (p < 0.82) {
        // Painel 3 fixo horizontalmente
        targetX = -2 * w;

        // Rolagem vertical contínua dos 5 diferenciais
        if (diffVerticalTrack && diffItems.length > 0) {
          const diffP = (p - 0.35) / (0.82 - 0.35);
          const maxDiffScroll = (diffItems.length - 1) * window.innerHeight;
          const currentDiffY = diffP * maxDiffScroll;
          diffVerticalTrack.style.transform = `translate3d(0, ${-currentDiffY}px, 0)`;

          const activeIndex = Math.min(diffItems.length - 1, Math.max(0, Math.round(diffP * (diffItems.length - 1))));
          progDots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === activeIndex);
          });
        }
      } else {
        // Transição horizontal para Painel 4
        const subP = (p - 0.82) / (1.00 - 0.82);
        targetX = -(2 * w) - (subP * w);

        if (diffVerticalTrack && diffItems.length > 0) {
          const maxDiffScroll = (diffItems.length - 1) * window.innerHeight;
          diffVerticalTrack.style.transform = `translate3d(0, ${-maxDiffScroll}px, 0)`;
          progDots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === diffItems.length - 1);
          });
        }
      }

      horizontalTrack.style.transform = `translate3d(${targetX}px, 0, 0)`;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    function onResize() {
      isDesktop = window.innerWidth >= 992;
      updateScrollEffects();
    }

    window.addEventListener('resize', onResize, { passive: true });
    updateScrollEffects();

    /* ══════════════════════════════════════════════
       3. FAIXAS 3D — ACESSIBILIDADE TOQUE E TECLADO
       ══════════════════════════════════════════════ */
    const stripItems = Array.from(document.querySelectorAll('.servicos-strip-item'));

    stripItems.forEach((strip) => {
      strip.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'a') return;
        const isCurrentlyActive = strip.classList.contains('is-active');
        stripItems.forEach(s => s.classList.remove('is-active'));
        if (!isCurrentlyActive) {
          strip.classList.add('is-active');
        }
      });

      strip.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const isCurrentlyActive = strip.classList.contains('is-active');
          stripItems.forEach(s => s.classList.remove('is-active'));
          if (!isCurrentlyActive) {
            strip.classList.add('is-active');
          }
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.servicos-strips-list')) {
        stripItems.forEach(s => s.classList.remove('is-active'));
      }
    });

    /* ══════════════════════════════════════════════
       4. REINICIALIZAÇÃO DA ANIMAÇÃO DE ABERTURA
       ══════════════════════════════════════════════ */
    const wordFragments = document.querySelector('.servicos-word-fragments');
    if (wordFragments && window.IntersectionObserver) {
      const fragmentObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const fragments = entry.target.querySelectorAll('.servicos-fragment');
            fragments.forEach(f => {
              f.style.animation = 'none';
              void f.offsetWidth;
              f.style.animation = '';
            });
            fragmentObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      fragmentObserver.observe(wordFragments);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServicos);
  } else {
    initServicos();
  }
})();
