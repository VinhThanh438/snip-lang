import '../config.js';

const API_BASE = globalThis.SNIP_CONFIG.API_URL;

async function getToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['accessToken'], (result) => resolve(result.accessToken || null));
  });
}

async function apiCall(endpoint, method = 'GET', body = null, isRetry = false) {
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Nếu bị lỗi 401 (Hết hạn token) và chưa retry lần nào
  if (res.status === 401 && !isRetry) {
    const refreshToken = await new Promise((resolve) => {
      chrome.storage.local.get(['refreshToken'], (result) => resolve(result.refreshToken || null));
    });

    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          // Cập nhật accessToken mới
          await chrome.storage.local.set({ accessToken: refreshData.data.accessToken });
          // Retry request ban đầu
          return apiCall(endpoint, method, body, true);
        }
      } catch (e) {
        console.error('Failed to refresh token', e);
      }
    }
    
    // Nếu không refresh được thì xoá data (đăng xuất)
    await chrome.storage.local.remove(['accessToken', 'refreshToken', 'user']);
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'API error');
  return data;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const handle = async () => {
    try {
      switch (message.type) {
        case 'TRANSLATE': {
          const data = await apiCall('/translate', 'POST', { text: message.text });
          return { success: true, translation: data.data.translation };
        }
        case 'SAVE_SENTENCE': {
          const data = await apiCall('/sentences', 'POST', {
            text: message.text,
            sourceUrl: message.sourceUrl,
            sourceTitle: message.sourceTitle,
          });
          return { success: true, sentence: data.data };
        }
        case 'LOGIN': {
          const data = await apiCall('/auth/login', 'POST', {
            email: message.email,
            password: message.password,
          });
          const { accessToken, refreshToken } = data.data.tokens;
          const { user } = data.data;

          await chrome.storage.local.set({
            accessToken,
            refreshToken,
            user,
          });

          // Gửi tín hiệu đăng nhập tới tất cả các tab Web
          chrome.tabs.query({}, (tabs) => {
            for (const tab of tabs) {
              chrome.tabs.sendMessage(tab.id, { 
                type: 'EXTENSION_LOGGED_IN', 
                token: accessToken, 
                user 
              }).catch(() => {});
            }
          });

          return { success: true, user };
        }
        case 'LOGOUT': {
          await chrome.storage.local.remove(['accessToken', 'refreshToken', 'user']);
          
          // Gửi tín hiệu đăng xuất tới tất cả các tab Web (localhost:3000)
          chrome.tabs.query({}, (tabs) => {
            for (const tab of tabs) {
              chrome.tabs.sendMessage(tab.id, { type: 'EXTENSION_LOGGED_OUT' }).catch(() => {});
            }
          });

          return { success: true };
        }
        case 'GET_USER': {
          const isOurWebsite = _sender.origin === SNIP_CONFIG.WEB_URL || 
                             (_sender.origin && _sender.origin.includes(SNIP_CONFIG.PROD_WEB_DOMAIN));
          
          return new Promise((resolve) => {
            chrome.storage.local.get(['user', 'accessToken'], (result) => {
              const response = { 
                success: true, 
                user: result.user || null, 
                hasToken: !!result.accessToken 
              };
              // Chỉ trả về token thực sự nếu yêu cầu đến từ trang web chính chủ
              if (isOurWebsite && result.accessToken) {
                response.token = result.accessToken;
              }
              resolve(response);
            });
          });
        }
        case 'GET_SETTINGS': {
          return new Promise((resolve) => {
            chrome.storage.local.get(['settings'], (result) => {
              resolve({ success: true, settings: result.settings || { autoTranslate: true, enabled: true, theme: 'system' } });
            });
          });
        }
        case 'SAVE_SETTINGS': {
          await chrome.storage.local.set({ settings: message.settings });
          return { success: true };
        }
        default:
          return { success: false, error: 'Unknown message type' };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  handle().then(sendResponse);
  return true;
});
