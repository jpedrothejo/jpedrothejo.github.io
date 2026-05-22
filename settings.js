function getSettingBooleanState(key, defaultOn) {
  const storedValue = localStorage.getItem(key);
  if (storedValue === '1') return true;
  if (storedValue === '0') return false;
  return defaultOn;
}

const isEnabled = (key, defaultOn = true) => getSettingBooleanState(key, defaultOn);

function applyBlur() {
  const blurEnabled = isEnabled('blurEnabled');
  const glassEnabled = isEnabled('glassEnabled');

  let blurValue = 'none';
  if (blurEnabled) {
    blurValue = glassEnabled ? 'blur(20px) saturate(180%)' : 'blur(16px)';
  }

  document.querySelectorAll('.main, .topnav, .social-bg')
    .forEach(el => {
      el.style.backdropFilter = blurValue;
      el.style.webkitBackdropFilter = blurValue;
    });
}

function toggleClass(id, className, invert = false) {
  const enabled = isEnabled(id);
  const shouldApply = invert ? !enabled : enabled;
  document.documentElement.classList.toggle(className, shouldApply);
}

function applyBg() {
  toggleClass('bgEnabled', 'no-bg', true);
}

function applyDark() {
  toggleClass('darkEnabled', 'light-mode', true);
}

function applyFont() {
  const enabled = isEnabled('adwaitaEnabled', false);
  document.documentElement.classList.toggle('adwaita-font', enabled);
}

function applyLiquidGlass() {
  toggleClass('glassEnabled', 'liquid-glass', false);
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
  document.documentElement.style.backgroundImage = `url(/images/${wallpaper})`;
}

function initializeCheckboxes() {
  document.querySelectorAll('.custom-checkbox[data-setting-key]').forEach(checkbox => {
    const key = checkbox.dataset.settingKey;
    const defaultOnForCheckbox = checkbox.dataset.defaultOn === 'false' ? false : true;

    checkbox.checked = getSettingBooleanState(key, defaultOnForCheckbox);

    checkbox.addEventListener('change', (event) => {
      const isChecked = event.target.checked;
      localStorage.setItem(key, isChecked ? '1' : '0');
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
      applyAllSettings();
    });
  });
}

function applyAllSettings() {
  applyBlur();
  applyBg();
  applyDark();
  applyFont();
  applyAccentColor();
  applyLiquidGlass();
  applyWallpaper();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyAllSettings);
  document.addEventListener('DOMContentLoaded', initializeCheckboxes);
  document.addEventListener('DOMContentLoaded', initializeSelects);
} else {
  applyAllSettings();
  initializeCheckboxes();
  initializeSelects();
}