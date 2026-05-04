function applyBlur() {
  const enabled = localStorage.getItem('blurEnabled') !== '0';
  const blurValue = enabled ? 'blur(16px)' : 'none';
  document.querySelectorAll('.main, .topnav, .social-bg').forEach(el => {
    if (el) el.style.backdropFilter = blurValue;
  });
}

function toggleClass(id, className, invert = false) {
  const enabled = localStorage.getItem(id) !== '0';
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
  const enabled = localStorage.getItem('adwaitaEnabled') === '1';
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