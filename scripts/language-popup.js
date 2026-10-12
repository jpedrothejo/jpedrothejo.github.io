(function () {
  function normalizeLanguage(value) {
    return value === 'pt' || value === 'pt-br' ? 'pt-br' : 'en';
  }

  function closeLanguagePopup(overlay) {
    if (!overlay) return;
    overlay.classList.remove('show');
    overlay.addEventListener('transitionend', function handler() {
      overlay.hidden = true;
      document.body.classList.remove('device-modal-open');
      overlay.removeEventListener('transitionend', handler);
    }, { once: true });
  }

  function setLanguageAndClose(lang, overlay) {
    const normalized = normalizeLanguage(lang);
    localStorage.setItem('language', normalized);
    localStorage.setItem('languagePromptShown', '1');

    if (typeof window.applyAllSettings === 'function') {
      window.applyAllSettings();
    }

    if (overlay) {
      closeLanguagePopup(overlay);
    }
  }

  function showLanguagePopup(options = {}) {
    const firstTime = Boolean(options.firstTime);
    if (firstTime && localStorage.getItem('languagePromptShown') === '1') return;

    const existing = document.getElementById('languageModalOverlay') || document.getElementById('firstTimeLangOverlay');
    if (existing) {
      existing.hidden = false;
      requestAnimationFrame(() => existing.classList.add('show'));
      document.body.classList.add('device-modal-open');
      existing.querySelectorAll('.language-choice-btn').forEach(button => {
        button.onclick = () => setLanguageAndClose(button.dataset.lang, existing);
      });
      return existing;
    }

    const overlay = document.createElement('div');
    overlay.className = 'device-modal-overlay';
    overlay.id = firstTime ? 'firstTimeLangOverlay' : 'languageModalOverlay';
    overlay.hidden = false;

    const modal = document.createElement('div');
    modal.className = 'device-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', firstTime ? 'firstTimeLangTitle' : 'languageModalTitle');

    modal.innerHTML = `
      <h2 id="${firstTime ? 'firstTimeLangTitle' : 'languageModalTitle'}">Choose your language // Escolha seu idioma</h2>
      <p>${firstTime ? 'Pick your preferred language for the best experience.' : 'Pick your preferred language for the best experience.'}</p>
      <p>${firstTime ? 'Escolha seu idioma preferido para a melhor experiência.' : 'Escolha seu idioma preferido para a melhor experiência.'}</p>
      <div class="language-modal-actions">
        <button class="language-choice-btn" data-lang="en" type="button">English</button>
        <button class="language-choice-btn" data-lang="pt-br" type="button">Português</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
    document.body.classList.add('device-modal-open');

    overlay.addEventListener('click', event => {
      if (event.target === overlay) {
        closeLanguagePopup(overlay);
      }
    });

    modal.querySelectorAll('.language-choice-btn').forEach(button => {
      button.addEventListener('click', () => setLanguageAndClose(button.dataset.lang, overlay));
    });

    return overlay;
  }

  window.showLanguagePopup = showLanguagePopup;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (localStorage.getItem('languagePromptShown') !== '1') {
        showLanguagePopup({ firstTime: true });
      }
    }, { once: true });
  } else if (localStorage.getItem('languagePromptShown') !== '1') {
    showLanguagePopup({ firstTime: true });
  }
})();
