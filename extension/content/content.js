(() => {
  if (window.__sniplangLoaded) return;
  window.__sniplangLoaded = true;

  let tooltip = null;
  let triggerIcon = null;
  let selectionTimeout = null;
  let currentSettings = { autoTranslate: true, enabled: true };
  let currentSelectionText = "";

  chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (res) => {
    if (res?.success) currentSettings = res.settings;
  });

  // Theo dõi token cục bộ để phát hiện đăng xuất trên Web
  let lastLocalToken = localStorage.getItem('token');

  function syncAuth() {
    chrome.runtime.sendMessage({ type: 'GET_USER' }, (res) => {
      const origin = window.location.origin;
      const isOurWebsite = origin === window.SNIP_CONFIG.WEB_URL || 
                          origin.includes(window.SNIP_CONFIG.PROD_WEB_DOMAIN) ||
                          origin.includes('localhost:3000') ||
                          origin.includes('127.0.0.1:3000');
      
      if (!isOurWebsite) return;

      const localToken = localStorage.getItem('token');
      const localUser = localStorage.getItem('user');

      // Nếu vừa đăng xuất trên Web (Token từ có thành không) -> Đồng bộ sang Extension
      if (lastLocalToken && !localToken) {
        chrome.runtime.sendMessage({ type: 'LOGOUT' });
      }
      lastLocalToken = localToken;

      if (res?.success) {
        if (res.token) {
          // Extension đang có Token
          if (!localToken) {
            // Web không có Token: Chỉ đồng bộ nếu đang ở trang login (chủ động đăng nhập)
            // Và phải đảm bảo không phải vừa mới đăng xuất xong (check URL)
            if (window.location.pathname === '/login' && !window.location.search.includes('logout=true')) {
              localStorage.setItem('token', res.token);
              if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
              window.location.href = '/dashboard';
            }
          } else if (localToken !== res.token) {
            // Cả hai có nhưng khác nhau: Ưu tiên Extension (Master)
            localStorage.setItem('token', res.token);
            if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
            window.location.reload();
          }
        } else if (localToken) {
          // Web có Token nhưng Extension không có: Đồng bộ sang Extension
          chrome.runtime.sendMessage({
            type: 'SYNC_AUTH',
            token: localToken,
            user: localUser ? JSON.parse(localUser) : null
          });
        }
      }
    });
  }

  // Chạy lúc load trang
  syncAuth();

  // Lắng nghe thay đổi localStorage để đồng bộ Logout từ Web sang Extension (từ tab khác)
  window.addEventListener('storage', (e) => {
    if (e.key === 'token' && !e.newValue) {
      chrome.runtime.sendMessage({ type: 'LOGOUT' });
    }
  });

  // Đồng bộ ngay khi người dùng tương tác với trang
  document.addEventListener('mousedown', () => {
    syncAuth();
  }, { passive: true });

  // Kiểm tra định kỳ (để bắt kịp các thay đổi cùng tab)
  setInterval(syncAuth, 1000);

  // Đánh chặn hành động Click vào nút Đăng xuất để đồng bộ ngay lập tức
  document.addEventListener('click', (e) => {
    const target = e.target;
    const logoutBtn = target.closest('#sl-logout-btn');
    if (logoutBtn || (target.textContent && (target.textContent.includes('Đăng xuất') || target.textContent.includes('Log out')))) {
      chrome.runtime.sendMessage({ type: 'LOGOUT' });
    }
  }, true);

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'EXTENSION_LOGGED_OUT') {
      if (window.location.origin === window.SNIP_CONFIG.WEB_URL || window.location.origin.includes(window.SNIP_CONFIG.PROD_WEB_DOMAIN)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    if (message.type === 'EXTENSION_LOGGED_IN') {
      // Đăng nhập chéo: Nếu đang mở trang web của ứng dụng thì lưu token và reload
      if (window.location.origin === window.SNIP_CONFIG.WEB_URL || window.location.origin.includes(window.SNIP_CONFIG.PROD_WEB_DOMAIN)) {
        localStorage.setItem('token', message.token);
        localStorage.setItem('user', JSON.stringify(message.user));
        
        // Nếu đang ở trang login thì chuyển sang dashboard, ngược lại thì reload để cập nhật trạng thái
        if (window.location.pathname === '/login') {
          window.location.href = '/dashboard';
        } else {
          window.location.reload();
        }
      }
    }

    if (message.type === 'SETTINGS_UPDATED') {
      currentSettings = message.settings;
      if (!currentSettings.enabled) removeAll();
      
      // Nếu tooltip đang mở, cập nhật theme ngay lập tức
      if (tooltip) {
        tooltip.className = `sl-tooltip ${getThemeClass()}`;
      }
    }
  });

  function removeAll() {
    if (tooltip) { tooltip.remove(); tooltip = null; }
    if (triggerIcon) { triggerIcon.remove(); triggerIcon = null; }
  }

  function sendMsg(data) {
    return new Promise((resolve) => chrome.runtime.sendMessage(data, resolve));
  }

  function showTriggerIcon(x, y, text) {
    removeAll();
    currentSelectionText = text;

    triggerIcon = document.createElement('div');
    triggerIcon.className = 'sl-trigger';
    triggerIcon.innerHTML = '✦';
    triggerIcon.style.left = `${x + 5}px`;
    triggerIcon.style.top = `${y + 10}px`;
    
    triggerIcon.addEventListener('mousedown', (e) => e.stopPropagation());

    document.body.appendChild(triggerIcon);

    triggerIcon.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showTooltip(currentSelectionText, x, y);
      if (triggerIcon) {
        triggerIcon.remove();
        triggerIcon = null;
      }
    });
  }

  function getThemeClass() {
    const theme = currentSettings.theme || 'system';
    if (theme === 'dark') return 'sl-dark';
    if (theme === 'light') return 'sl-light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'sl-dark' : 'sl-light';
  }

  async function showTooltip(text, x, y) {
    const userRes = await sendMsg({ type: 'GET_USER' });
    const isLoggedIn = userRes?.hasToken;

    tooltip = document.createElement('div');
    tooltip.className = `sl-tooltip ${getThemeClass()}`;
    
    // Ngăn chặn mousedown làm mất tooltip khi click vào bên trong nó
    tooltip.addEventListener('mousedown', (e) => e.stopPropagation());

    const truncated = text.length > 100 ? text.slice(0, 100) + '…' : text;

    tooltip.innerHTML = `
      <div class="sl-header">
        <span class="sl-logo">✦ SNIP-LANG</span>
        <button class="sl-close" id="sl-close-btn">✕</button>
      </div>
      <div class="sl-body">
        <div class="sl-selected-text">${truncated}</div>
        <div class="sl-translation" id="sl-translation">
          ${currentSettings.autoTranslate ? '<span class="sl-spinner"></span>' : 'Vui lòng bật "Tự động dịch" trong Cài đặt Extension.'}
        </div>
      </div>
      <div class="sl-actions" id="sl-action-container">
        <button class="sl-btn sl-btn-ghost" id="sl-dashboard-btn">🌐 Web</button>
        <button class="sl-btn sl-btn-primary" id="sl-save-btn">💾 Lưu câu</button>
        ${!currentSettings.autoTranslate ? `<button class="sl-btn sl-btn-ghost" id="sl-trans-btn">🔍 Dịch nhanh</button>` : ''}
      </div>
      <div id="sl-status"></div>
    `;

    positionTooltip(tooltip, x, y);
    document.body.appendChild(tooltip);
    makeDraggable(tooltip);

    document.getElementById('sl-close-btn')?.addEventListener('click', removeAll);

    const translate = async () => {
      const transEl = document.getElementById('sl-translation');
      if (transEl) transEl.innerHTML = '<span class="sl-spinner"></span>';
      const transRes = await sendMsg({ type: 'TRANSLATE', text });
      if (transEl) transEl.textContent = transRes?.translation || '(lỗi dịch)';
    };

    if (currentSettings.autoTranslate) translate();

    document.getElementById('sl-trans-btn')?.addEventListener('click', translate);
    
    document.getElementById('sl-dashboard-btn')?.addEventListener('click', () => {
      window.open(`${window.SNIP_CONFIG.WEB_URL}/dashboard`, '_blank');
    });

    document.getElementById('sl-save-btn')?.addEventListener('click', async () => {
      if (!isLoggedIn) {
        window.open(`${window.SNIP_CONFIG.WEB_URL}/login`, '_blank');
        return;
      }
      
      const btn = document.getElementById('sl-save-btn');
      if (btn) { btn.textContent = '⏳...'; btn.disabled = true; }
      const res = await sendMsg({
        type: 'SAVE_SENTENCE',
        text,
        sourceUrl: location.href,
        sourceTitle: document.title,
      });
      const statusEl = document.getElementById('sl-status');
      if (statusEl) {
        statusEl.className = `sl-status ${res?.success ? 'sl-status-ok' : 'sl-status-err'}`;
        statusEl.textContent = res?.success ? '✓ Đã lưu!' : `✗ ${res?.error}`;
      }
      if (btn) btn.textContent = res?.success ? '✓' : '✗';
    });
  }

  function makeDraggable(el) {
    const header = el.querySelector('.sl-header');
    if (!header) return;

    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    header.style.cursor = 'grab';

    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      header.style.cursor = 'grabbing';
      
      startX = e.clientX;
      startY = e.clientY;
      
      const rect = el.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      e.preventDefault();
      e.stopPropagation();
    });

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      el.style.left = `${initialLeft + dx}px`;
      el.style.top = `${initialTop + dy}px`;
      el.style.right = 'auto';
      el.style.bottom = 'auto';
    };

    const onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        header.style.cursor = 'grab';
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Clean up when element is removed
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node === el) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            observer.disconnect();
          }
        });
      });
    });
    observer.observe(document.body, { childList: true });
  }

  function positionTooltip(el, x, y) {
    el.style.left = '-9999px';
    el.style.top = '-9999px';
    el.style.maxHeight = 'none'; // Reset trước khi tính toán
    document.body.appendChild(el);
    
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    let left = x - rect.width + 20; 
    let top = y + 15;

    // Ngăn chặn tràn bên trái/phải
    if (left < 10) left = 10;
    if (left + rect.width > vw - 10) left = vw - rect.width - 10;
    
    // Nếu tràn phía dưới, đẩy Tooltip lên trên dòng bôi đen
    if (top + rect.height > vh - 10) {
      top = y - rect.height - 15;
    }

    // Nếu Tooltip quá dài (tràn cả trên lẫn dưới), cố định ở giữa và cho phép cuộn
    if (top < 10) {
      top = 10;
      el.style.height = `${vh - 40}px`;
      const body = el.querySelector('.sl-body');
      if (body) body.style.overflowY = 'auto';
    }

    el.style.left = `${left}px`;
    el.style.top  = `${top}px`;
    el.style.right = 'auto';
    el.style.bottom = 'auto';
  }

  document.addEventListener('mouseup', (e) => {
    // Nếu click vào icon hoặc tooltip thì không làm gì cả
    if (triggerIcon && triggerIcon.contains(e.target)) return;
    if (tooltip && tooltip.contains(e.target)) return;

    clearTimeout(selectionTimeout);
    selectionTimeout = setTimeout(() => {
      if (!currentSettings.enabled) return;

      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || text.length < 2 || text.length > 2000 || !/[a-zA-Z]/.test(text)) {
        // Chỉ remove khi không có selection và click ra ngoài
        return;
      }

      showTriggerIcon(e.clientX, e.clientY, text);
    }, 200);
  });

  document.addEventListener('mousedown', (e) => {
    // Nếu click ra ngoài hoàn toàn mới xoá
    if (tooltip && !tooltip.contains(e.target)) removeAll();
    if (triggerIcon && !triggerIcon.contains(e.target)) removeAll();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') removeAll();
  });
})();
