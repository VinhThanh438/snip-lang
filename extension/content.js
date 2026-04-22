(() => {
  if (window.__sniplangLoaded) return;
  window.__sniplangLoaded = true;

  const STYLES = `
    .sl-tooltip {
      --sl-bg: rgba(255, 255, 255, 0.98);
      --sl-text: #0f172a;
      --sl-border: rgba(0, 0, 0, 0.1);
      --sl-text-muted: #64748b;
      --sl-trans-text: #4f46e5;
      --sl-btn-ghost-bg: rgba(0,0,0,0.05);
      --sl-btn-ghost-hover: rgba(0,0,0,0.1);
      --sl-shadow: 0 10px 30px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
      --sl-close-bg: rgba(0,0,0,0.05);
      --sl-close-hover: rgba(0,0,0,0.1);
      
      position: fixed;
      z-index: 2147483647;
      background: var(--sl-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--sl-border);
      border-radius: 14px;
      padding: 14px 16px;
      min-width: 240px;
      max-width: 360px;
      box-shadow: var(--sl-shadow);
      color: var(--sl-text);
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      animation: sl-in 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
      pointer-events: all;
    }

    @media (prefers-color-scheme: dark) {
      .sl-tooltip {
        --sl-bg: #171721;
        --sl-text: #f1f5f9;
        --sl-border: rgba(255, 255, 255, 0.08);
        --sl-text-muted: #94a3b8;
        --sl-trans-text: #c7d2fe;
        --sl-btn-ghost-bg: rgba(255,255,255,0.07);
        --sl-btn-ghost-hover: rgba(255,255,255,0.12);
        --sl-shadow: 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
        --sl-close-bg: rgba(255,255,255,0.08);
        --sl-close-hover: rgba(255,255,255,0.15);
      }
    }

    @keyframes sl-in {
      from { opacity: 0; transform: translateY(6px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .sl-selected-text {
      font-size: 12px;
      color: var(--sl-text-muted);
      border-left: 2px solid #6366f1;
      padding-left: 8px;
      margin-bottom: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .sl-translation {
      font-size: 14px;
      color: var(--sl-trans-text);
      font-weight: 500;
      margin-bottom: 10px;
      min-height: 20px;
    }
    .sl-spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(99,102,241,0.3);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: sl-spin 0.7s linear infinite;
    }
    @keyframes sl-spin { to { transform: rotate(360deg); } }
    .sl-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .sl-btn {
      flex: 1;
      padding: 7px 12px;
      border: none;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }
    .sl-btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
    }
    .sl-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
    .sl-btn-ghost {
      background: var(--sl-btn-ghost-bg);
      color: var(--sl-text-muted);
      border: 1px solid var(--sl-border);
    }
    .sl-btn-ghost:hover { background: var(--sl-btn-ghost-hover); }
    .sl-status {
      text-align: center;
      font-size: 12px;
      margin-top: 8px;
      padding: 5px 8px;
      border-radius: 6px;
    }
    .sl-status-ok  { background: rgba(34,197,94,0.15); color: #22c55e; }
    .sl-status-err { background: rgba(239,68,68,0.15); color: #ef4444; }
    
    @media (prefers-color-scheme: dark) {
      .sl-status-ok  { color: #86efac; }
      .sl-status-err { color: #fca5a5; }
    }

    .sl-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .sl-logo {
      font-size: 11px;
      font-weight: 700;
      color: #6366f1;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .sl-close {
      width: 20px;
      height: 20px;
      background: var(--sl-close-bg);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      color: var(--sl-text-muted);
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      line-height: 1;
    }
    .sl-close:hover { color: var(--sl-text); background: var(--sl-close-hover); }
    .sl-not-logged {
      text-align: center;
      color: var(--sl-text-muted);
      font-size: 12px;
      padding: 4px 0;
    }
    .sl-not-logged a {
      color: #6366f1;
      text-decoration: none;
      font-weight: 600;
    }
    .sl-trigger {
      position: fixed;
      z-index: 2147483647;
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      font-weight: bold;
      font-size: 16px;
      transition: transform 0.1s ease;
      animation: sl-in 0.15s ease-out;
      user-select: none;
    }
    .sl-trigger:hover { transform: scale(1.1); }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);

  let tooltip = null;
  let triggerIcon = null;
  let selectionTimeout = null;
  let currentSettings = { autoTranslate: true, enabled: true };
  let currentSelectionText = "";

  chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (res) => {
    if (res?.success) currentSettings = res.settings;
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
    triggerIcon.style.top = `${y + 5}px`;
    
    // Ngăn chặn mousedown làm mất icon ngay lập tức
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

  async function showTooltip(text, x, y) {
    const userRes = await sendMsg({ type: 'GET_USER' });
    const isLoggedIn = userRes?.hasToken;

    tooltip = document.createElement('div');
    tooltip.className = 'sl-tooltip';
    
    // Ngăn chặn mousedown làm mất tooltip khi click vào bên trong nó
    tooltip.addEventListener('mousedown', (e) => e.stopPropagation());

    const truncated = text.length > 100 ? text.slice(0, 100) + '…' : text;

    tooltip.innerHTML = `
      <div class="sl-header">
        <span class="sl-logo">✦ SNIP-LANG</span>
        <button class="sl-close" id="sl-close-btn">✕</button>
      </div>
      <div class="sl-selected-text">${truncated}</div>
      <div class="sl-translation" id="sl-translation">
        ${currentSettings.autoTranslate ? '<span class="sl-spinner"></span>' : 'Click "Dịch nhanh"'}
      </div>
      <div class="sl-actions" id="sl-action-container">
        ${isLoggedIn
          ? `<button class="sl-btn sl-btn-primary" id="sl-save-btn">💾 Lưu câu</button>
             <button class="sl-btn sl-btn-ghost" id="sl-trans-btn">🔍 Dịch</button>`
          : `<button class="sl-btn sl-btn-primary" id="sl-trans-btn">🔍 Dịch nhanh</button>
             <div class="sl-not-logged"><a href="http://localhost:3000/login" target="_blank">Đăng nhập</a> để lưu câu</div>`
        }
      </div>
      <div id="sl-status"></div>
    `;

    positionTooltip(tooltip, x, y);
    document.body.appendChild(tooltip);

    document.getElementById('sl-close-btn')?.addEventListener('click', removeAll);

    const translate = async () => {
      const transEl = document.getElementById('sl-translation');
      if (transEl) transEl.innerHTML = '<span class="sl-spinner"></span>';
      const transRes = await sendMsg({ type: 'TRANSLATE', text });
      if (transEl) transEl.textContent = transRes?.translation || '(lỗi dịch)';
    };

    if (currentSettings.autoTranslate) translate();

    document.getElementById('sl-trans-btn')?.addEventListener('click', translate);

    if (isLoggedIn) {
      document.getElementById('sl-save-btn')?.addEventListener('click', async () => {
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
  }

  function positionTooltip(el, x, y) {
    el.style.left = '-9999px';
    el.style.top = '-9999px';
    document.body.appendChild(el);
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = x + 10;
    let top = y + 15;
    if (left + rect.width > vw - 10) left = x - rect.width - 10;
    if (top + rect.height > vh - 10) top = y - rect.height - 10;
    el.style.left = `${Math.max(8, left)}px`;
    el.style.top  = `${Math.max(8, top)}px`;
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
