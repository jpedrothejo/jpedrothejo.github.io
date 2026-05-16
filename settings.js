// Helper to get the current boolean state of a setting from localStorage
function getSettingBooleanState(key, defaultOn) {
  const storedValue = localStorage.getItem(key);
  if (storedValue === '1') return true; // Explicitly ON
  if (storedValue === '0') return false; // Explicitly OFF
  return defaultOn; // If not set, use default
}

// Determines if a setting is enabled based on localStorage or default
const isEnabled = (key, defaultOn = true) => getSettingBooleanState(key, defaultOn);

function applyBlur() {
  const enabled = isEnabled('blurEnabled');
  const blurValue = enabled ? 'blur(16px)' : 'none';
  document.querySelectorAll('.main, .topnav, .social-bg')
    .forEach(el => el.style.backdropFilter = blurValue);
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
  const enabled = isEnabled('adwaitaEnabled', false); // Adwaita font is off by default
  document.documentElement.classList.toggle('adwaita-font', enabled);
}

function applyLiquidGlass() {
  toggleClass('glassEnabled', 'liquid-glass', false);
}

function applyAccentColor() {
  const accent = localStorage.getItem('accentColor') || 'default'; // Default accent

  // Remove any existing accent classes to ensure only one is active
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

// Initializes the state of all custom checkboxes and attaches event listeners
function initializeCheckboxes() {
  document.querySelectorAll('.custom-checkbox[data-setting-key]').forEach(checkbox => {
    const key = checkbox.dataset.settingKey;
    // Determine defaultOn for the checkbox based on its data attribute, or assume true
    const defaultOnForCheckbox = checkbox.dataset.defaultOn === 'false' ? false : true;

    // Set the initial checked state of the checkbox
    checkbox.checked = getSettingBooleanState(key, defaultOnForCheckbox);

    // Add event listener to update localStorage and re-apply settings on change
    checkbox.addEventListener('change', (event) => {
      const isChecked = event.target.checked;
      localStorage.setItem(key, isChecked ? '1' : '0');
      applyAllSettings(); // Re-apply all settings after a change
    });
  });
}

// Initializes dropdown menus
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

// Apply settings and initialize checkboxes once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyAllSettings);
  document.addEventListener('DOMContentLoaded', initializeCheckboxes);
  document.addEventListener('DOMContentLoaded', initializeSelects);
} else {
  // If DOM is already loaded, apply immediately
  applyAllSettings();
  initializeCheckboxes();
  initializeSelects();
}