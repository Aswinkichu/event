// Toast Notification System - replaces browser alert() calls
// Usage: showToast('message', 'success') | showToast('message', 'error') | showToast('message', 'info')

let toastContainer = null;

function ensureContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

const TOAST_ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

const TOAST_TITLES = {
  success: 'Success',
  error: 'Error',
  info: 'Info',
  warning: 'Warning',
};

export function showToast(message, type = 'info', duration = 4000) {
  const container = ensureContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${TOAST_ICONS[type] || TOAST_ICONS.info}</div>
    <div class="toast-body">
      <div class="toast-title">${TOAST_TITLES[type] || TOAST_TITLES.info}</div>
      <div class="toast-message">${message.replace(/\n/g, '<br>')}</div>
    </div>
    <button class="toast-close" aria-label="Close">&times;</button>
    <div class="toast-progress"><div class="toast-progress-bar"></div></div>
  `;

  // Close button handler
  toast.querySelector('.toast-close').addEventListener('click', () => dismissToast(toast));

  // Set progress bar animation duration
  const progressBar = toast.querySelector('.toast-progress-bar');
  progressBar.style.animationDuration = `${duration}ms`;

  container.appendChild(toast);

  // Trigger entrance animation
  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  // Auto-dismiss
  const timer = setTimeout(() => dismissToast(toast), duration);
  toast._timer = timer;

  return toast;
}

function dismissToast(toast) {
  if (toast._dismissed) return;
  toast._dismissed = true;
  clearTimeout(toast._timer);
  toast.classList.add('toast-exit');
  toast.addEventListener('animationend', () => {
    toast.remove();
  });
}

// Make globally available for inline onclick handlers
window.showToast = showToast;
