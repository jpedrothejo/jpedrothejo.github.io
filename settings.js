const isEnabled = (key, defaultOn = true) => 
  localStorage.getItem(key) !== (defaultOn ? '0' : '1');

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
  const enabled = localStorage.getItem('adwaitaEnabled') === '1'; // Keeping strict for off-by-default
  document.documentElement.classList.toggle('adwaita-font', enabled);
}

function applyAllSettings() {
  applyBlur();
  applyBg();
  applyDark();
  applyFont();
}

// Apply settings once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyAllSettings);
} else {
  // If DOM is already loaded, apply immediately
  applyAllSettings();
}