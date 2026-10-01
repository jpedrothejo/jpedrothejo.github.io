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

  if (cleanPath === '/archived.html' || cleanPath.startsWith('/archived/')) {
    return cleanPath;
  }

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
  const storedMainBlur = Number(localStorage.getItem('mainBlurLevel') ?? 10);
  const mainBlur = Number.isFinite(storedMainBlur) ? Math.min(20, Math.max(0, storedMainBlur)) : 10;
  const blurValue = blurEnabled ? 'blur(10px) saturate(180%)' : 'none';

  document.documentElement.style.setProperty('--main-blur', `${mainBlur}px`);
  document.documentElement.style.setProperty('--main-saturation', blurEnabled ? '180%' : '100%');

  document.querySelectorAll('.topnav, .social-bg, .popup-overlay, .popup-empty')
    .forEach(el => {
      el.style.backdropFilter = blurValue;
      el.style.webkitBackdropFilter = blurValue;
    });

  document.documentElement.classList.toggle('blur-disabled', !blurEnabled);
}


function applyBackgroundBlur() {
  const blurEnabled = isEnabled('backgroundBlur', true);
  const storedBlur = Number(localStorage.getItem('wallpaperBlurLevel') ?? 2.5);
  const blurLevel = Number.isFinite(storedBlur) ? Math.min(20, Math.max(0, storedBlur)) : 2.5;
  const blurValue = blurEnabled && blurLevel > 0 ? `blur(${blurLevel}px)` : 'none';
  document.documentElement.style.setProperty('--wallpaper-blur', blurValue);
}

function applySurfaceOpacity() {
  const mainOpacity = Math.min(100, Math.max(0, Number(localStorage.getItem('mainOpacity') ?? 78)));
  const cardOpacity = Math.min(100, Math.max(0, Number(localStorage.getItem('cardOpacity') ?? 78)));
  document.documentElement.style.setProperty('--main-opacity', `${mainOpacity}%`);
  document.documentElement.style.setProperty('--card-opacity', `${cardOpacity}%`);
}

function toggleClass(id, className, invert = false, defaultOn = true) {
  const enabled = isEnabled(id, defaultOn);
  const shouldApply = invert ? !enabled : enabled;
  document.documentElement.classList.toggle(className, shouldApply);
}

function applyBg() {
  toggleClass('bgEnabled', 'no-bg', true);
}

function applyReducedAnimation() {
  toggleClass('reducedAnimation', 'reduced-motion', false, false);
}

function applyFont() {
  let fontFamily = localStorage.getItem('fontFamily') || 'plusjakarta';
  const selectedFontFamily = fontFamily;
  const boldEnabled = isEnabled('fontBold', false);
  const customFontData = localStorage.getItem('customFontData') || '';
  const hasCustomFont = /^data:[^;]+;base64,/.test(customFontData);
  if (!localStorage.getItem('fontFamily')) localStorage.setItem('fontFamily', fontFamily);
  if (fontFamily === 'googlesansbold') fontFamily = 'googlesansrounded';
  if (fontFamily === 'custom' && !hasCustomFont) {
    fontFamily = 'plusjakarta';
  }
  const customFontSetting = document.getElementById('custom-font-setting');
  if (customFontSetting) customFontSetting.style.display = selectedFontFamily === 'custom' ? 'flex' : 'none';
  const boldSetting = document.querySelector('[data-setting-key="fontBold"]')?.closest('.setting-item');
  if (boldSetting) boldSetting.style.display = fontFamily === 'adwaita' ? 'none' : '';
  const customFontStyle = document.getElementById('custom-font-face');
  if (hasCustomFont) {
    const style = customFontStyle || document.createElement('style');
    style.id = 'custom-font-face';
    style.textContent = `@font-face { font-family: UserCustomFont; src: url("${customFontData}"); font-display: swap; }`;
    if (!customFontStyle) document.head.appendChild(style);
  } else {
    customFontStyle?.remove();
  }
  document.documentElement.classList.toggle('adwaita-font', fontFamily === 'adwaita');
  document.documentElement.classList.toggle('sfpro-font', fontFamily === 'sfpro' && !boldEnabled);
  document.documentElement.classList.toggle('sfpro-bold-font', fontFamily === 'sfpro' && boldEnabled);
  document.documentElement.classList.toggle('google-font', fontFamily === 'googlesansrounded' && !boldEnabled);
  document.documentElement.classList.toggle('google-bold-font', fontFamily === 'googlesansrounded' && boldEnabled);
  document.documentElement.classList.toggle('inter-font', fontFamily === 'inter' && !boldEnabled);
  document.documentElement.classList.toggle('inter-bold-font', fontFamily === 'inter' && boldEnabled);
  document.documentElement.classList.toggle('plus-jakarta-font', fontFamily === 'plusjakarta' && !boldEnabled);
  document.documentElement.classList.toggle('plus-jakarta-bold-font', fontFamily === 'plusjakarta' && boldEnabled);
  document.documentElement.classList.toggle('arial-font', fontFamily === 'arial' && !boldEnabled);
  document.documentElement.classList.toggle('arial-bold-font', fontFamily === 'arial' && boldEnabled);
  document.documentElement.classList.toggle('custom-font', fontFamily === 'custom' && hasCustomFont);
  document.documentElement.classList.toggle('custom-font-bold', fontFamily === 'custom' && hasCustomFont && boldEnabled);
}

function setExperimentalSettingsAccess(unlocked) {
  document.querySelectorAll('.experimental-settings-section').forEach(section => {
    section.hidden = !unlocked;
  });
  document.querySelectorAll('.settings-main').forEach(main => {
    main.classList.toggle('experimental-settings-unlocked', unlocked);
  });
}

function setExperimentalSettingsVisibility(visible, animate = true) {
  document.querySelectorAll('.experimental-settings').forEach(settings => {
    if (!visible) {
      settings.hidden = true;
      settings.classList.remove('is-visible');
      return;
    }

    settings.hidden = false;
    settings.classList.remove('is-visible');
    if (animate && !document.documentElement.classList.contains('reduced-motion')) {
      void settings.offsetHeight;
      requestAnimationFrame(() => settings.classList.add('is-visible'));
    } else {
      settings.classList.add('is-visible');
    }
  });
}

function showExperimentalUnlockToast(message) {
  let toast = document.querySelector('.easter-egg-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'easter-egg-toast';
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(window.easterEggToastTimeout);
  window.easterEggToastTimeout = window.setTimeout(() => { toast.hidden = true; }, 2200);
}

function setupJ7PrimePopupUnlock() {
  if (localStorage.getItem('experimentalFeaturesUnlocked') === '1') return;

  document.addEventListener('click', event => {
    const trigger = event.target instanceof Element
      ? event.target.closest('.device-card-trigger[data-device-title]')
      : null;
    if (!trigger || !/j7 prime/i.test(trigger.dataset.deviceTitle || '')
      || localStorage.getItem('experimentalFeaturesUnlocked') === '1') return;

    const popupOpens = Number(sessionStorage.getItem('j7PrimePopupOpens') || 0) + 1;
    sessionStorage.setItem('j7PrimePopupOpens', String(popupOpens));
    if (popupOpens < 3) return;

    const portuguese = document.documentElement.lang === 'pt-BR';
    if (popupOpens < 7) {
      const remaining = 7 - popupOpens;
      showExperimentalUnlockToast(portuguese
        ? `Faltam ${remaining} popups para ativar o modo experimental.`
        : `${remaining} more popup opens to enable Experimental Mode.`);
      return;
    }

    localStorage.setItem('experimentalFeaturesUnlocked', '1');
    localStorage.setItem('experimentalFeaturesEnabled', '1');
    sessionStorage.removeItem('j7PrimePopupOpens');
    setExperimentalSettingsAccess(true);
    document.querySelectorAll('[data-setting-key="experimentalFeaturesEnabled"]').forEach(checkbox => {
      checkbox.checked = true;
      checkbox.disabled = false;
      checkbox.closest('.setting-item')?.classList.remove('experimental-locked');
    });
    setExperimentalSettingsVisibility(true);
    applyAllSettings();
    showExperimentalUnlockToast(portuguese
      ? 'Modo experimental ativado!'
      : 'Experimental Mode enabled!');
  });
}

setupJ7PrimePopupUnlock();

function applySocialLabels() {
  toggleClass('socialLabelsEnabled', 'show-social-labels', false);
}

function applyFigcaptionVisibility() {
  const showFigcaptions = isEnabled('showFigcaptions', true);
  document.documentElement.classList.toggle('hide-figcaptions', !showFigcaptions);
}

function applyAccentColor() {
  const accent = localStorage.getItem('accentColor') || 'nord';
  const root = document.documentElement;
  const customOption = document.querySelector('[data-setting-key="accentColor"] option[value="custom"]');
  if (customOption) customOption.hidden = accent !== 'custom';

  root.classList.remove('accent-navy', 'accent-nord', 'accent-custom');
  const customColor = localStorage.getItem('customAccentColor') || '#5d94c2';
  const colorMatch = /^#([0-9a-f]{6})$/i.exec(customColor);
  const customProperties = [
    '--accent-color-primary', '--accent-color-primary-opaque', '--accent-color-hover',
    '--accent-color-hover-opaque', '--accent-color-button-bg', '--accent-color-button-bg-opaque',
    '--accent-color-glow', '--accent-color-link'
  ];

  if (accent === 'custom' && colorMatch) {
    const channels = colorMatch[1].match(/.{2}/g).map(channel => parseInt(channel, 16));
    const [red, green, blue] = channels;
    const linkColor = channels.map(channel => Math.round(channel + (255 - channel) * 0.58));
    root.classList.add('accent-custom');
    root.style.setProperty('--accent-color-primary', `rgba(${red}, ${green}, ${blue}, 0.12)`);
    root.style.setProperty('--accent-color-primary-opaque', `rgba(${red}, ${green}, ${blue}, 0.58)`);
    root.style.setProperty('--accent-color-hover', `rgba(${red}, ${green}, ${blue}, 0.24)`);
    root.style.setProperty('--accent-color-hover-opaque', `rgba(${red}, ${green}, ${blue}, 0.85)`);
    root.style.setProperty('--accent-color-button-bg', `rgba(${red}, ${green}, ${blue}, 0.48)`);
    root.style.setProperty('--accent-color-button-bg-opaque', `rgba(${red}, ${green}, ${blue}, 0.72)`);
    root.style.setProperty('--accent-color-glow', `rgba(${red}, ${green}, ${blue}, 0.34)`);
    root.style.setProperty('--accent-color-link', `rgb(${linkColor.join(', ')})`);
  } else {
    customProperties.forEach(property => root.style.removeProperty(property));
    if (accent === 'navy' || accent === 'nord') root.classList.add(`accent-${accent}`);
  }
}

function applyWallpaper(animate = false) {
  const savedWallpaper = localStorage.getItem('wallpaper') || 'pattern';
  const customWallpaper = localStorage.getItem('customWallpaper') || '';
  const hasCustomWallpaper = /^data:image\/[^;]+;base64,/.test(customWallpaper);
  const wallpaper = savedWallpaper === 'custom' && !hasCustomWallpaper ? 'pattern' : savedWallpaper;
  const root = document.documentElement;
  const customWallpaperSetting = document.getElementById('custom-wallpaper-setting');
  if (customWallpaperSetting) customWallpaperSetting.style.display = savedWallpaper === 'custom' ? 'flex' : 'none';
  const applyWallpaperSettings = () => {
    root.classList.toggle('gradient-wallpaper', wallpaper === 'gradient');
    root.classList.toggle('gradient-static', wallpaper === 'gradient' && isEnabled('gradientStopMotion', false));
    root.classList.toggle('pattern-wallpaper', wallpaper === 'pattern');
    if (wallpaper === 'gradient') {
      applyGradientSettings();
    } else if (wallpaper === 'custom' && hasCustomWallpaper) {
      root.style.setProperty('--wallpaper-image', `url("${customWallpaper}")`);
    } else if (wallpaper === 'no-bg' || wallpaper === 'pattern') {
      root.style.setProperty('--wallpaper-image', 'none');
    } else {
      root.style.setProperty('--wallpaper-image', `url(/images/${wallpaper})`);
    }
    toggleGradientSettings(wallpaper === 'gradient');
  };
  if (animate) {
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

    if (key === 'experimentalFeaturesEnabled') {
      const unlocked = localStorage.getItem('experimentalFeaturesUnlocked') === '1';
      setExperimentalSettingsAccess(unlocked || checkbox.checked);
      checkbox.disabled = !unlocked && !checkbox.checked;
      checkbox.closest('.setting-item')?.classList.toggle('experimental-locked', checkbox.disabled);
      checkbox.title = document.documentElement.lang === 'pt-BR'
        ? 'Abra o popup do J7 Prime 7 vezes para desbloquear o Modo Experimental.'
        : 'Open the J7 Prime popup 7 times to unlock Experimental Mode.';
      setExperimentalSettingsVisibility(checkbox.checked, false);
    }

    if (key === 'gradientCustomizeColors') {
      document.querySelectorAll('.gradient-color-pickers').forEach(el => {
        el.style.display = checkbox.checked ? 'flex' : 'none';
      });
    }

    checkbox.addEventListener('change', event => {
      const isChecked = event.target.checked;
      if (key === 'experimentalFeaturesEnabled' && isChecked
        && localStorage.getItem('experimentalFeaturesUnlocked') !== '1') {
        event.target.checked = false;
        event.target.disabled = true;
        event.target.closest('.setting-item')?.classList.add('experimental-locked');
        return;
      }

      localStorage.setItem(key, isChecked ? '1' : '0');
      applyAllSettings(key === 'topbarMinimized');
      if (key === 'experimentalFeaturesEnabled') {
        setExperimentalSettingsVisibility(isChecked);
        event.target.disabled = localStorage.getItem('experimentalFeaturesUnlocked') !== '1';
        event.target.closest('.setting-item')?.classList.toggle('experimental-locked', event.target.disabled);
      }
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
      if (key === 'customAccentColor') {
        localStorage.setItem('accentColor', 'custom');
        const accentSelect = document.querySelector('[data-setting-key="accentColor"]');
        const customOption = accentSelect?.querySelector('option[value="custom"]');
        if (customOption) customOption.hidden = false;
        if (accentSelect) accentSelect.value = 'custom';
      }
      applyAllSettings();
    });
  });
}

function initializeRangeInputs() {
  document.querySelectorAll('.experimental-range[data-setting-key]').forEach(input => {
    const key = input.dataset.settingKey;
    const value = localStorage.getItem(key) ?? input.value;
    input.value = value;
    const settingItem = input.closest('.setting-item');
    const output = settingItem?.querySelector('output');
    const rangeLabel = settingItem?.querySelector('[data-range-label]');
    const updateValueText = () => {
      const valueText = `${input.value}${input.dataset.unit || ''}`;
      if (output) {
        output.value = valueText;
        output.textContent = valueText;
      }
      if (rangeLabel) rangeLabel.textContent = `${input.dataset.label} (${valueText})`;
    };
    updateValueText();
    input.addEventListener('input', () => {
      localStorage.setItem(key, input.value);
      updateValueText();
      applyAllSettings();
    });
  });
}

function resetSettingsToDefaults() {
  const settingKeys = [
    'socialLabelsEnabled', 'showFigcaptions', 'topbarMinimized', 'fontBold', 'fontFamily',
    'language', 'topbarPosition', 'wallpaper', 'accentColor', 'blurEnabled', 'backgroundBlur',
    'reducedAnimation', 'potatoEnabled', 'experimentalFeaturesEnabled', 'experimentalFeaturesUnlocked', 'customAccentColor',
    'customFontData', 'customWallpaper', 'mainOpacity', 'cardOpacity', 'mainBlurLevel', 'wallpaperBlurLevel', 'cardBlurLevel',
    'gradientCustomizeColors', 'gradientStopMotion', 'gradientColor1', 'gradientColor2', 'gradientColor3', 'gradientColor4'
  ];
  settingKeys.forEach(key => localStorage.removeItem(key));
  sessionStorage.removeItem('j7PrimePopupOpens');
  localStorage.setItem('language', getPreferredLanguage());
  localStorage.setItem('languagePromptShown', '1');
  window.location.reload();
}

function setEasterEggText(enabled) {
  document.documentElement.classList.toggle('easter-egg-active', enabled);
  if (!enabled) return;

  const eggAccent = {
    '--accent-color-primary': 'rgba(48, 126, 220, 0.2)',
    '--accent-color-primary-opaque': 'rgba(48, 126, 220, 0.72)',
    '--accent-color-hover': 'rgba(74, 153, 245, 0.28)',
    '--accent-color-hover-opaque': 'rgba(74, 153, 245, 0.85)',
    '--accent-color-button-bg': 'rgba(45, 125, 220, 0.72)',
    '--accent-color-button-bg-opaque': 'rgba(45, 125, 220, 0.92)',
    '--accent-color-glow': 'rgba(61, 145, 255, 0.42)',
    '--accent-color-link': '#a4d4ff'
  };
  Object.entries(eggAccent).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });

  const replaceText = root => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim() || node.nodeValue.trim() === 'Teardrop' || node.parentElement?.closest('script, style, .easter-egg-control, .easter-egg-toast')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => { node.nodeValue = node.nodeValue.replace(/\S(?:.*\S)?/, 'Teardrop'); });
  };
  replaceText(document.body);
  document.querySelectorAll('img').forEach(image => {
    image.removeAttribute('srcset');
    image.src = '/images/profile pic 2.jpg';
    image.alt = 'Teardrop';
  });
  document.documentElement.style.setProperty('--wallpaper-image', 'url("/images/profile pic 2.jpg")');
  document.title = 'Teardrop';

  if (!window.easterEggObserver) {
    window.easterEggObserver = new MutationObserver(() => {
      replaceText(document.body);
      document.querySelectorAll('img:not([data-easter-egg-image])').forEach(image => {
        image.dataset.easterEggImage = 'true';
        image.removeAttribute('srcset');
        image.src = '/images/profile pic 2.jpg';
        image.alt = 'Teardrop';
      });
    });
    window.easterEggObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
}

function updateModeIndicator() {
  let indicator = document.querySelector('.mode-indicator');
  if (!indicator) {
    indicator = document.createElement('button');
    indicator.className = 'mode-indicator';
    indicator.type = 'button';
    indicator.addEventListener('click', () => {
      if (localStorage.getItem('easterEggEnabled') !== '1') return;
      localStorage.removeItem('easterEggEnabled');
      sessionStorage.removeItem('easterEggClicks');
      window.location.reload();
    });
    document.body.appendChild(indicator);
  }
  const easterEggEnabled = localStorage.getItem('easterEggEnabled') === '1';
  const experimentalEnabled = isEnabled('experimentalFeaturesEnabled', false);
  const portuguese = document.documentElement.lang === 'pt-BR';
  indicator.textContent = easterEggEnabled
    ? (portuguese ? 'Voltar ao normal' : 'Revert back to normal')
    : (portuguese ? 'Modo Experimental' : 'Experimental Mode');
  indicator.hidden = !easterEggEnabled && !experimentalEnabled;
  indicator.classList.toggle('easter-egg-control', easterEggEnabled);
  document.documentElement.classList.toggle('mode-indicator-visible', !indicator.hidden);
}

function setupProfileEasterEgg() {
  document.querySelectorAll('.profile-avatar img').forEach(image => {
    image.addEventListener('click', () => {
      if (localStorage.getItem('easterEggEnabled') === '1') return;
      const clicks = Number(sessionStorage.getItem('easterEggClicks') || 0) + 1;
      sessionStorage.setItem('easterEggClicks', String(clicks));
      if (clicks >= 3) {
        let toast = document.querySelector('.easter-egg-toast');
        if (!toast) {
          toast = document.createElement('div');
          toast.className = 'easter-egg-toast';
          toast.setAttribute('aria-live', 'polite');
          document.body.appendChild(toast);
        }
        const portuguese = document.documentElement.lang === 'pt-BR';
        toast.textContent = clicks >= 7
          ? (portuguese ? 'Easter egg desbloqueado!' : 'Easter egg unlocked!')
          : (portuguese ? `Faltam ${7 - clicks} cliques para o easter egg` : `${7 - clicks} clicks left for the easter egg`);
        toast.hidden = false;
        window.clearTimeout(window.easterEggToastTimeout);
        window.easterEggToastTimeout = window.setTimeout(() => { toast.hidden = true; }, 2200);
      }
      if (clicks >= 7) {
        localStorage.setItem('easterEggEnabled', '1');
        setEasterEggText(true);
        updateModeIndicator();
      }
    });
  });
}

function initializeLocalTime() {
  const clock = document.getElementById('current-time');
  if (!clock) return;
  const update = () => {
    if (localStorage.getItem('easterEggEnabled') === '1') {
      clock.textContent = 'Teardrop';
      return;
    }
    const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date());
    clock.textContent = document.documentElement.lang === 'pt-BR'
      ? `agora são ${time} para o jpedro rn`
      : `it is ${time} for jpedro rn`;
  };
  update();
  window.setInterval(update, 30000);
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
  applySurfaceOpacity();
  applyBg();
  applyReducedAnimation();
  applyFont();
  applyAccentColor();
  applySocialLabels();
  applyFigcaptionVisibility();
  applyWallpaper(animateWallpaper);
  applyTopbarPosition();
  applyTopbarMinimized(animateTopbar);
  updateModeIndicator();
}

applyBg();
applyFont();
applyAccentColor();
applySocialLabels();
applyWallpaper();
applyTopbarPosition();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyAllSettings);
  document.addEventListener('DOMContentLoaded', initializeCheckboxes);
  document.addEventListener('DOMContentLoaded', initializeColorPickers);
  document.addEventListener('DOMContentLoaded', initializeRangeInputs);
  document.addEventListener('DOMContentLoaded', initializeSelects);
  document.addEventListener('DOMContentLoaded', initializeInputs);
  document.addEventListener('DOMContentLoaded', setupMinimizeButton);
  document.addEventListener('DOMContentLoaded', showLanguagePromptIfFirstTime);
  document.addEventListener('DOMContentLoaded', setupProfileEasterEgg);
  document.addEventListener('DOMContentLoaded', initializeLocalTime);
  document.addEventListener('DOMContentLoaded', () => setEasterEggText(localStorage.getItem('easterEggEnabled') === '1'));
} else {
  applyAllSettings();
  initializeCheckboxes();
  initializeColorPickers();
  initializeRangeInputs();
  initializeSelects();
  initializeInputs();
  setupMinimizeButton();
  showLanguagePromptIfFirstTime();
  setupProfileEasterEgg();
  initializeLocalTime();
  setEasterEggText(localStorage.getItem('easterEggEnabled') === '1');
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
      wallpaperDropdown.value = 'pattern';
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
        if (filenameLabel) filenameLabel.textContent = key === 'customFontData' ? 'Custom font loaded' : 'Selected image';
      } else {
        if (filenameLabel) filenameLabel.textContent = saved;
      }
    }

    if (key === 'customFontData') {
      input.addEventListener('change', event => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = loadEvent => {
          const dataUrl = loadEvent.target.result;
          const error = input.parentElement?.querySelector('.custom-font-error');
          try {
            localStorage.setItem(key, dataUrl);
          } catch (storageError) {
            if (error) error.hidden = false;
            console.warn('Failed to store the custom font in localStorage', storageError);
            return;
          }
          if (error) error.hidden = true;
          if (filenameLabel) filenameLabel.textContent = file.name;
          applyAllSettings();
        };
        reader.readAsDataURL(file);
      });
      return;
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