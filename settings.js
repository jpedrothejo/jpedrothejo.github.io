function getSettingBooleanState(key, defaultOn) {
  const storedValue = localStorage.getItem(key);
  if (storedValue === '1') return true;
  if (storedValue === '0') return false;
  return defaultOn;
}

const isEnabled = (key, defaultOn = true) => getSettingBooleanState(key, defaultOn);

function applyBlur() {
  const blurEnabled = isEnabled('blurEnabled');
  const blurValue = blurEnabled ? 'blur(20px) saturate(180%)' : 'none';

  document.querySelectorAll('.main, .topnav, .social-bg')
    .forEach(el => {
      el.style.backdropFilter = blurValue;
      el.style.webkitBackdropFilter = blurValue;
    });

  document.documentElement.classList.toggle('blur-disabled', !blurEnabled);
}

function applyCardBgBlur() {
  const blurLevel = localStorage.getItem('cardBgBlur') || 'light';
  const blurAmounts = {
    none: 'none',
    light: 'blur(12.5px)',
    medium: 'blur(25px)',
    heavy: 'blur(50px)'
  };
  const blurValue = blurAmounts[blurLevel] || blurAmounts.light;
  const finalValue = blurValue === 'none' ? 'none' : `${blurValue} saturate(180%)`;

  document.querySelectorAll('.card-bg')
    .forEach(el => {
      el.style.backdropFilter = finalValue;
      el.style.webkitBackdropFilter = finalValue;
    });
}

function applyBackgroundBlur() {
  const blurLevel = localStorage.getItem('backgroundBlur') || 'none';
  const blurAmounts = {
    none: 'none',
    light: 'blur(12.5px)',
    medium: 'blur(25px)',
    heavy: 'blur(32.5px)'
  };
  const blurValue = blurAmounts[blurLevel] || blurAmounts.none;
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
  toggleClass('darkEnabled', 'light-mode', true);
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

function applyAccentColor() {
  const accent = localStorage.getItem('accentColor') || 'default';

  Array.from(document.documentElement.classList).forEach(className => {
    if (className.startsWith('accent-')) document.documentElement.classList.remove(className);
  });

  if (accent !== 'default') {
    document.documentElement.classList.add(`accent-${accent}`);
  }
}

function applyWallpaper() {
  const wallpaper = localStorage.getItem('wallpaper') || 'background.jpg';
  document.documentElement.classList.toggle('gradient-wallpaper', wallpaper === 'gradient');
  const gradientStatic = wallpaper === 'gradient' && isEnabled('gradientStopMotion', false);
  document.documentElement.classList.toggle('gradient-static', gradientStatic);

  if (wallpaper === 'gradient') {
    applyGradientSettings();
  } else if (wallpaper === 'no-bg') {
    document.documentElement.style.setProperty('--wallpaper-image', 'none');
  } else {
    document.documentElement.style.setProperty('--wallpaper-image', `url(/images/${wallpaper})`);
  }

  toggleGradientSettings(wallpaper === 'gradient');
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
  const position = localStorage.getItem('topbarPosition') || 'bottom';
  const validPositions = ['top', 'bottom', 'left', 'right'];
  const topbarPosition = validPositions.includes(position) ? position : 'bottom';

  document.documentElement.classList.remove('topbar-top', 'topbar-bottom', 'topbar-left', 'topbar-right');
  document.documentElement.classList.add(`topbar-${topbarPosition}`);
}

function applyTopbarMinimized() {
  const minimized = isEnabled('topbarMinimized', false);
  document.documentElement.classList.toggle('topbar-minimized', minimized);
  document.querySelectorAll('.topnav a[data-full-label][data-minimized-label]')
    .forEach(link => {
      link.textContent = minimized ? link.dataset.minimizedLabel : link.dataset.fullLabel;
    });
}

function setupMinimizeButton() {
  const btn = document.getElementById('minimizeBtn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = isEnabled('topbarMinimized', false);
      localStorage.setItem('topbarMinimized', current ? '0' : '1');
      applyTopbarMinimized();
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
      localStorage.setItem(key, isChecked ? '1' : '0');
      applyAllSettings();
      if (key === 'gradientCustomizeColors') {
        document.querySelectorAll('.gradient-color-pickers').forEach(el => {
          el.style.display = isChecked ? 'flex' : 'none';
        });
      }
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
      applyAllSettings();
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

function applyAllSettings() {
  applyBlur();
  applyCardBgBlur();
  applyBackgroundBlur();
  applyBg();
  applyDark();
  applyReducedAnimation();
  applyFont();
  applyAccentColor();
  applySocialLabels();
  applyWallpaper();
  applyTopbarPosition();
  applyTopbarMinimized();
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
  document.addEventListener('DOMContentLoaded', initializeSelects);
  document.addEventListener('DOMContentLoaded', setupMinimizeButton);
} else {
  applyAllSettings();
  initializeCheckboxes();
  initializeSelects();
  setupMinimizeButton();
}

function triggerPotatoMode(potatoToggle) {
  const isPotatoModeOn = potatoToggle.checked;
  const settingsToDisable = ['blurEnabled', 'socialLabelsEnabled'];
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