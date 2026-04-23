const $ = (id) => document.getElementById(id);

function showView(name) {
  ['login', 'main', 'loading'].forEach((v) => {
    $(`view-${v}`)?.classList.toggle('hidden', v !== name);
  });
}

function sendMsg(data) {
  return new Promise((resolve) => chrome.runtime.sendMessage(data, resolve));
}

async function applyTheme(theme) {
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.body.classList.toggle('light-mode', !isDark);
  document.body.classList.toggle('dark-mode', isDark);
}

async function loadSettings() {
  const res = await sendMsg({ type: 'GET_SETTINGS' });
  if (res?.success) {
    $('toggle-extension').checked = res.settings.enabled ?? true;
    $('toggle-auto-translate').checked = res.settings.autoTranslate ?? true;
    $('select-theme').value = res.settings.theme ?? 'system';
    $('status-dot').classList.toggle('active', res.settings.enabled ?? true);
    applyTheme(res.settings.theme ?? 'system');
  }
}

async function init() {
  if ($('register-link')) {
    $('register-link').href = `${window.SNIP_CONFIG.WEB_URL}/login`;
  }
  
  showView('loading');
  const res = await sendMsg({ type: 'GET_USER' });

  if (res?.user && res?.hasToken) {
    $('user-name').textContent = res.user.displayName || 'User';
    $('user-email').textContent = res.user.email || '';
    $('user-avatar').textContent = (res.user.displayName || 'U')[0].toUpperCase();
    await loadSettings();
    showView('main');
  } else {
    showView('login');
  }
}

$('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('login-btn');
  const errEl = $('login-error');
  const email = $('inp-email').value.trim();
  const password = $('inp-password').value;

  btn.textContent = 'Đang đăng nhập...';
  btn.disabled = true;
  errEl.classList.add('hidden');

  const res = await sendMsg({ type: 'LOGIN', email, password });

  if (res?.success) {
    await init();
  } else {
    errEl.textContent = res?.error || 'Đăng nhập thất bại';
    errEl.classList.remove('hidden');
    btn.textContent = 'Đăng nhập';
    btn.disabled = false;
  }
});

$('btn-logout')?.addEventListener('click', async () => {
  await sendMsg({ type: 'LOGOUT' });
  showView('login');
});

$('btn-dashboard')?.addEventListener('click', () => {
  chrome.tabs.create({ url: `${window.SNIP_CONFIG.WEB_URL}/dashboard` });
});

async function onToggleChange() {
  const settings = {
    enabled: $('toggle-extension').checked,
    autoTranslate: $('toggle-auto-translate').checked,
    theme: $('select-theme').value,
  };
  $('status-dot').classList.toggle('active', settings.enabled);
  applyTheme(settings.theme);
  await sendMsg({ type: 'SAVE_SETTINGS', settings });

  // Thông báo cho các tab để cập nhật ngay lập tức
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_UPDATED', settings }).catch(() => {});
    });
  });
}

$('toggle-extension')?.addEventListener('change', onToggleChange);
$('toggle-auto-translate')?.addEventListener('change', onToggleChange);
$('select-theme')?.addEventListener('change', onToggleChange);

init();
