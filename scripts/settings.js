function getSettingBooleanState(key, defaultOn) {
  const storedValue = localStorage.getItem(key);
  if (storedValue === '1') return true;
  if (storedValue === '0') return false;
  return defaultOn;
}

const isEnabled = (key, defaultOn = true) => getSettingBooleanState(key, defaultOn);

function getPreferredLanguage() {
  const storedValue = localStorage.getItem('language');
  if (storedValue === 'en' || storedValue === 'pt-br') {
    return storedValue;
  }

  return window.location.pathname.startsWith('/br/') || window.location.pathname === '/br' ? 'pt-br' : 'en';
}

function getLocalizedPath(pathname = window.location.pathname, language = getPreferredLanguage()) {
  const normalizedPath = pathname === '/br' || pathname === '/br/'
    ? '/'
    : pathname.startsWith('/br/')
      ? pathname.slice(3) || '/'
      : pathname;

  const cleanPath = normalizedPath === '' ? '/' : normalizedPath;

  if (language === 'pt-br') {
    return cleanPath === '/' ? '/br/' : `/br${cleanPath}`;
  }

  return cleanPath;
}

function getLocalizedHref(href, language = getPreferredLanguage()) {
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
    return href;
  }

  const url = new URL(href, window.location.href);
  url.pathname = getLocalizedPath(url.pathname, language);
  return `${url.pathname}${url.search}${url.hash}`;
}

function applyLanguage() {
  const language = getPreferredLanguage();
  const currentPath = window.location.pathname;
  const targetPath = getLocalizedPath(currentPath, language);

  document.documentElement.lang = language === 'pt-br' ? 'pt-BR' : 'en';
  document.documentElement.dataset.language = language;

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    const localizedHref = getLocalizedHref(href, language);
    if (localizedHref !== href) {
      link.setAttribute('href', localizedHref);
    }
  });

  if (targetPath !== currentPath) {
    const targetUrl = `${targetPath}${window.location.search}${window.location.hash}`;
    window.location.replace(targetUrl);
  }
}

function applyBlur() {
  const blurEnabled = isEnabled('blurEnabled');
  const blurValue = blurEnabled ? 'blur(10px) saturate(180%)' : 'none';

  document.querySelectorAll('.main, .topnav, .social-bg, .popup-overlay, .popup-empty')
    .forEach(el => {
      el.style.backdropFilter = blurValue;
      el.style.webkitBackdropFilter = blurValue;
    });

  document.documentElement.classList.toggle('blur-disabled', !blurEnabled);
}


function applyBackgroundBlur() {
  const blurEnabled = isEnabled('backgroundBlur', false);
  const blurValue = blurEnabled ? 'blur(2.5px)' : 'none';
  document.documentElement.style.setProperty('--wallpaper-blur', blurValue);
}

function toggleClass(id, className, invert = false, defaultOn = true) {
  const enabled = isEnabled(id, defaultOn);
  const shouldApply = invert ? !enabled : enabled;
  document.documentElement.classList.toggle(className, shouldApply);
}

function applyBg() {
  toggleClass('bgEnabled', 'no-bg', true);
}

function applyDark() {
  toggleClass('darkEnabled', 'light-mode', true, true);
}

function applyReducedAnimation() {
  toggleClass('reducedAnimation', 'reduced-motion', false, false);
}

function applyFont() {
  let fontFamily = localStorage.getItem('fontFamily') || 'googlesansrounded';
  const boldEnabled = isEnabled('fontBold', false);

  if (!localStorage.getItem('fontFamily')) {
    localStorage.setItem('fontFamily', fontFamily);
  }

  if (fontFamily === 'googlesansbold') {
    fontFamily = 'googlesansrounded';
    localStorage.setItem('fontFamily', fontFamily);
  }

  document.documentElement.classList.toggle('adwaita-font', fontFamily === 'adwaita');
  document.documentElement.classList.toggle('sfpro-font', fontFamily === 'sfpro' && !boldEnabled);
  document.documentElement.classList.toggle('sfpro-bold-font', fontFamily === 'sfpro' && boldEnabled);
  document.documentElement.classList.toggle('google-font', fontFamily === 'googlesansrounded' && !boldEnabled);
  document.documentElement.classList.toggle('google-bold-font', fontFamily === 'googlesansrounded' && boldEnabled);
}

function applySocialLabels() {
  toggleClass('socialLabelsEnabled', 'show-social-labels', false);
}

function applyFigcaptionVisibility() {
  if (localStorage.getItem('hideFigcaptions') !== null && localStorage.getItem('showFigcaptions') === null) {
    const oldValue = localStorage.getItem('hideFigcaptions');
    localStorage.setItem('showFigcaptions', oldValue === '1' ? '0' : '1');
    localStorage.removeItem('hideFigcaptions');
  }

  const showFigcaptions = isEnabled('showFigcaptions', true);
  document.documentElement.classList.toggle('hide-figcaptions', !showFigcaptions);
}

function applyAccentColor() {
  const accent = localStorage.getItem('accentColor') || 'default';
  const experimentalEnabled = isEnabled('experimentalFeaturesEnabled', false);
  const customColor = localStorage.getItem('customAccentColor') || '#5d94c2';
  const customAccentSetting = document.getElementById('custom-accent-setting');

  if (customAccentSetting) {
    customAccentSetting.style.display = experimentalEnabled ? 'flex' : 'none';
  }

  const customWallpaperSetting = document.getElementById('custom-wallpaper-setting');
  if (customWallpaperSetting) {
    customWallpaperSetting.style.display = experimentalEnabled ? 'flex' : 'none';
  }

  const wallpaperSelect = document.querySelector('[data-setting-key="wallpaper"]');
  if (wallpaperSelect) {
    const customOption = wallpaperSelect.querySelector('option[value="custom"]');
    if (customOption) customOption.hidden = !experimentalEnabled;
  }

  Array.from(document.documentElement.classList).forEach(className => {
    if (className.startsWith('accent-')) document.documentElement.classList.remove(className);
  });

  if (experimentalEnabled && customColor) {
    document.documentElement.style.setProperty('--accent-color-primary', `${customColor}22`);
    document.documentElement.style.setProperty('--accent-color-primary-opaque', `${customColor}80`);
    document.documentElement.style.setProperty('--accent-color-hover', `${customColor}33`);
    document.documentElement.style.setProperty('--accent-color-hover-opaque', `${customColor}80`);
    document.documentElement.style.setProperty('--accent-color-button-bg', `${customColor}80`);
    document.documentElement.style.setProperty('--accent-color-button-bg-opaque', `${customColor}80`);
    return;
  }

  document.documentElement.style.removeProperty('--accent-color-primary');
  document.documentElement.style.removeProperty('--accent-color-primary-opaque');
  document.documentElement.style.removeProperty('--accent-color-hover');
  document.documentElement.style.removeProperty('--accent-color-hover-opaque');
  document.documentElement.style.removeProperty('--accent-color-button-bg');
  document.documentElement.style.removeProperty('--accent-color-button-bg-opaque');

  if (accent !== 'default') {
    document.documentElement.classList.add(`accent-${accent}`);
  }
}

function applyWallpaper(animate = false) {
  const wallpaper = localStorage.getItem('wallpaper') || 'background.jpg';
  const root = document.documentElement;

  const applyWallpaperSettings = () => {
    root.classList.toggle('gradient-wallpaper', wallpaper === 'gradient');
    const gradientStatic = wallpaper === 'gradient' && isEnabled('gradientStopMotion', false);
    root.classList.toggle('gradient-static', gradientStatic);

    if (wallpaper === 'gradient') {
      applyGradientSettings();
    } else if (wallpaper === 'no-bg') {
      root.style.setProperty('--wallpaper-image', 'none');
    } else if (wallpaper === 'custom') {
      const experimentalEnabled = isEnabled('experimentalFeaturesEnabled', false);
      const customValue = localStorage.getItem('customWallpaper') || '';
      if (experimentalEnabled && customValue) {
        const isAbsolute = /^(https?:\/\/|\/|data:)/i.test(customValue);
        const url = isAbsolute ? customValue : `/images/${customValue}`;
        root.style.setProperty('--wallpaper-image', `url(${url})`);
      } else {
        root.style.setProperty('--wallpaper-image', `url(/images/background.jpg)`);
      }
    } else {
      root.style.setProperty('--wallpaper-image', `url(/images/${wallpaper})`);
    }

    toggleGradientSettings(wallpaper === 'gradient');
  };

  if (animate) {
    root.classList.remove('wallpaper-transitioning');
    void root.offsetWidth;
    root.classList.add('wallpaper-transitioning');
    window.setTimeout(() => {
      applyWallpaperSettings();
      root.classList.remove('wallpaper-transitioning');
    }, 120);
  } else {
    applyWallpaperSettings();
  }
}

function applyGradientSettings() {
  const customizeColors = isEnabled('gradientCustomizeColors', false);
  const defaultColors = ['#0f172a', '#4f46e5', '#ec4899', '#22d3ee'];
  const colors = [];

  for (let i = 1; i <= 4; i++) {
    const color = localStorage.getItem(`gradientColor${i}`);
    colors.push(color || defaultColors[i - 1]);
  }

  const activeColors = customizeColors ? colors : defaultColors;
  document.documentElement.style.setProperty('--gradient-colors', activeColors.join(', '));
  document.documentElement.style.setProperty('--wallpaper-image', `linear-gradient(135deg, ${activeColors.join(', ')})`);
}

function toggleGradientSettings(show) {
  document.querySelectorAll('.gradient-settings').forEach(el => {
    el.style.display = show ? 'flex' : 'none';
  });
  document.querySelectorAll('.gradient-color-pickers').forEach(el => {
    const customizeColors = isEnabled('gradientCustomizeColors', false);
    el.style.display = show && customizeColors ? 'flex' : 'none';
  });
}

function applyTopbarPosition() {
  const saved = localStorage.getItem('topbarPosition');
  const isMobile = window.matchMedia('(max-width: 600px)').matches;
  const defaultPosition = isMobile ? 'bottom' : 'top';
  const position = saved || defaultPosition;
  const validPositions = ['top', 'bottom', 'left', 'right'];
  const topbarPosition = validPositions.includes(position) ? position : defaultPosition;

  document.documentElement.classList.remove('topbar-top', 'topbar-bottom', 'topbar-left', 'topbar-right');
  document.documentElement.classList.add(`topbar-${topbarPosition}`);

  const select = document.querySelector('[data-setting-key="topbarPosition"]');
  if (select && !saved) {
    select.value = topbarPosition;
  }
}

function applyTopbarMinimized(animate = false) {
  const minimized = isEnabled('topbarMinimized', false);
  const root = document.documentElement;

  root.classList.toggle('topbar-minimized', minimized);
  document.querySelectorAll('.topnav a[data-full-label][data-minimized-label]')
    .forEach(link => {
      link.textContent = minimized ? link.dataset.minimizedLabel : link.dataset.fullLabel;
    });

  if (animate) {
    root.classList.remove('topbar-transitioning');
    void root.offsetWidth;
    root.classList.add('topbar-transitioning');
    window.setTimeout(() => {
      root.classList.remove('topbar-transitioning');
    }, 320);
  }
}

function setupMinimizeButton() {
  const btn = document.getElementById('minimizeBtn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = isEnabled('topbarMinimized', false);
      localStorage.setItem('topbarMinimized', current ? '0' : '1');
      applyTopbarMinimized(true);
      const checkbox = document.querySelector('.custom-checkbox[data-setting-key="topbarMinimized"]');
      if (checkbox) {
        checkbox.checked = !current;
      }
    });
  }
}

function initializeCheckboxes() {
  document.querySelectorAll('.custom-checkbox[data-setting-key]').forEach(checkbox => {
    const key = checkbox.dataset.settingKey;
    const defaultOnForCheckbox = checkbox.dataset.defaultOn === 'false' ? false : true;

    checkbox.checked = getSettingBooleanState(key, defaultOnForCheckbox);

    if (key === 'gradientCustomizeColors') {
      document.querySelectorAll('.gradient-color-pickers').forEach(el => {
        el.style.display = checkbox.checked ? 'flex' : 'none';
      });
    }

    checkbox.addEventListener('change', (event) => {
      const isChecked = event.target.checked;
      if (key === 'experimentalFeaturesEnabled' && isChecked) {
        const password = window.prompt('The settings that will appear ARE experimental. It could break a thing or two, please tell me if it does.Enter the password to enable this:');
        if (password !== 'jpedro') {
          event.target.checked = false;
          localStorage.setItem(key, '0');
          applyAllSettings();
          return;
        }
      }

      localStorage.setItem(key, isChecked ? '1' : '0');
      applyAllSettings(key === 'topbarMinimized');
      if (key === 'gradientCustomizeColors') {
        document.querySelectorAll('.gradient-color-pickers').forEach(el => {
          el.style.display = isChecked ? 'flex' : 'none';
        });
      }
    });
  });
}

function initializeColorPickers() {
  document.querySelectorAll('.custom-color[data-setting-key]').forEach(input => {
    const key = input.dataset.settingKey;
    const savedValue = localStorage.getItem(key);

    if (savedValue) {
      input.value = savedValue;
    }

    input.addEventListener('input', (event) => {
      localStorage.setItem(key, event.target.value);
      applyAllSettings();
    });
  });
}

function initializeSelects() {
  document.querySelectorAll('.custom-select[data-setting-key]').forEach(select => {
    const key = select.dataset.settingKey;
    const savedValue = localStorage.getItem(key);

    if (savedValue) {
      select.value = savedValue;
    }

    select.addEventListener('change', (event) => {
      localStorage.setItem(key, event.target.value);
      applyAllSettings(key === 'topbarMinimized', key === 'wallpaper');
      if (key === 'wallpaper') {
        toggleGradientSettings(event.target.value === 'gradient');
      }
    });
  });

  const wallpaperSelect = document.querySelector('[data-setting-key="wallpaper"]');
  if (wallpaperSelect) {
    toggleGradientSettings(wallpaperSelect.value === 'gradient');
  }
}

function applyAllSettings(animateTopbar = false, animateWallpaper = false) {
  applyLanguage();
  applyBlur();
  applyBackgroundBlur();
  applyBg();
  applyDark();
  applyReducedAnimation();
  applyFont();
  applyAccentColor();
  applySocialLabels();
  applyFigcaptionVisibility();
  applyWallpaper(animateWallpaper);
  applyTopbarPosition();
  applyTopbarMinimized(animateTopbar);
}

applyBg();
applyDark();
applyFont();
applyAccentColor();
applySocialLabels();
applyWallpaper();
applyTopbarPosition();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyAllSettings);
  document.addEventListener('DOMContentLoaded', initializeCheckboxes);
  document.addEventListener('DOMContentLoaded', initializeColorPickers);
  document.addEventListener('DOMContentLoaded', initializeSelects);
  document.addEventListener('DOMContentLoaded', initializeInputs);
  document.addEventListener('DOMContentLoaded', setupMinimizeButton);
  document.addEventListener('DOMContentLoaded', showLanguagePromptIfFirstTime);
} else {
  applyAllSettings();
  initializeCheckboxes();
  initializeColorPickers();
  initializeSelects();
  initializeInputs();
  setupMinimizeButton();
  showLanguagePromptIfFirstTime();
}

function triggerPotatoMode(potatoToggle) {
  const isPotatoModeOn = potatoToggle.checked;
  const settingsToDisable = ['blurEnabled', 'socialLabelsEnabled', 'backgroundBlur'];
  const settingToEnable = 'topbarMinimized';

  settingsToDisable.forEach(key => {
    const targetCheckbox = document.querySelector(`[data-setting-key="${key}"]`);
    if (targetCheckbox) {
      targetCheckbox.checked = !isPotatoModeOn;
      targetCheckbox.disabled = isPotatoModeOn;
      targetCheckbox.closest('.setting-item')?.classList.toggle('disabled-visual', isPotatoModeOn);
      targetCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  const enableTarget = document.querySelector(`[data-setting-key="${settingToEnable}"]`);
  if (enableTarget) {
    enableTarget.checked = isPotatoModeOn;
    enableTarget.dispatchEvent(new Event('change', { bubbles: true }));
  }

  const reducedAnimationTarget = document.querySelector('[data-setting-key="reducedAnimation"]');
  if (reducedAnimationTarget) {
    reducedAnimationTarget.checked = isPotatoModeOn;
    localStorage.setItem('reducedAnimation', isPotatoModeOn ? '1' : '0');
    reducedAnimationTarget.dispatchEvent(new Event('change', { bubbles: true }));
  }

  const wallpaperDropdown = document.querySelector('[data-setting-key="wallpaper"]') || document.getElementById('wallpaper');
  if (wallpaperDropdown) {
    if (isPotatoModeOn) {
      wallpaperDropdown.value = 'no-bg';
    } else {
      wallpaperDropdown.value = 'background.jpg';
    }
    wallpaperDropdown.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function initializeInputs() {
  document.querySelectorAll('.custom-text[data-setting-key]').forEach(input => {
    const key = input.dataset.settingKey;
    const saved = localStorage.getItem(key);
    if (saved) input.value = saved;

    input.addEventListener('input', (event) => {
      localStorage.setItem(key, event.target.value);
      applyAllSettings();
    });
  });

  document.querySelectorAll('.custom-file[data-setting-key]').forEach(input => {
    const key = input.dataset.settingKey;
    const filenameLabel = input.parentElement?.querySelector('.custom-file-label');
    const saved = localStorage.getItem(key);
    if (saved) {
      if (saved.startsWith('data:')) {
        if (filenameLabel) filenameLabel.textContent = 'Selected image';
      } else {
        if (filenameLabel) filenameLabel.textContent = saved;
      }
    }

    input.addEventListener('change', (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        const dataUrl = e.target.result;
        try {
          localStorage.setItem(key, dataUrl);
        } catch (err) {
          console.warn('Failed to store image in localStorage; using filename fallback', err);
          localStorage.setItem(key, file.name);
        }
        if (filenameLabel) filenameLabel.textContent = file.name;
        applyAllSettings(false, true);
      };
      reader.readAsDataURL(file);
    });
  });
}

function showLanguagePromptIfFirstTime() {
  if (localStorage.getItem('languagePromptShown') === '1') return;

  const existing = document.getElementById('languageModalOverlay');
  if (existing) {
    const overlay = existing;
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('show'));
    document.body.classList.add('device-modal-open');
    const buttons = overlay.querySelectorAll('.language-choice-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = btn.dataset.lang === 'pt' ? 'pt-br' : 'en';
        localStorage.setItem('language', lang);
        localStorage.setItem('languagePromptShown', '1');
        applyAllSettings();
        overlay.classList.remove('show');
        overlay.addEventListener('transitionend', function handler() {
          overlay.hidden = true;
          document.body.classList.remove('device-modal-open');
          overlay.removeEventListener('transitionend', handler);
        });
      });
    });
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'device-modal-overlay';
  overlay.id = 'firstTimeLangOverlay';
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add('show'));
  document.body.classList.add('device-modal-open');

  const modal = document.createElement('div');
  modal.className = 'device-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  modal.innerHTML = `
    <h2 id="firstTimeLangTitle">Choose your language</h2>
    <p>Select your preferred language for this website.</p>
    <div style="display:flex; gap:8px; margin-top:12px;">
      <button class="language-choice-btn" data-lang="en" type="button">English</button>
      <button class="language-choice-btn" data-lang="pt-br" type="button">Português</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  modal.querySelectorAll('.language-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      localStorage.setItem('language', lang);
      localStorage.setItem('languagePromptShown', '1');
      applyAllSettings();
      overlay.classList.remove('show');
      overlay.addEventListener('transitionend', function handler() {
        overlay.hidden = true;
        document.body.classList.remove('device-modal-open');
        overlay.removeEventListener('transitionend', handler);
      });
    });
  });
}