const $ = (id) => document.getElementById(id);

function showView(name) {
  ['login', 'main', 'loading'].forEach((v) => {
    $(`view-${v}`)?.classList.toggle('hidden', v !== name);
  });
}

function sendMsg(data) {
  return new Promise((resolve) => chrome.runtime.sendMessage(data, resolve));
}

async function loadSettings() {
  const res = await sendMsg({ type: 'GET_SETTINGS' });
  if (res?.success) {
    $('toggle-extension').checked = res.settings.enabled ?? true;
    $('toggle-auto-translate').checked = res.settings.autoTranslate ?? true;
    $('status-dot').classList.toggle('active', res.settings.enabled ?? true);
  }
}

async function init() {
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
  chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
});

async function onToggleChange() {
  const settings = {
    enabled: $('toggle-extension').checked,
    autoTranslate: $('toggle-auto-translate').checked,
  };
  $('status-dot').classList.toggle('active', settings.enabled);
  await sendMsg({ type: 'SAVE_SETTINGS', settings });
}

$('toggle-extension')?.addEventListener('change', onToggleChange);
$('toggle-auto-translate')?.addEventListener('change', onToggleChange);

init();
