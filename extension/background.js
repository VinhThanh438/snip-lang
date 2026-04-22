const API_BASE = 'http://localhost:4000/api';

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
          await chrome.storage.local.set({
            accessToken: data.data.tokens.accessToken,
            refreshToken: data.data.tokens.refreshToken,
            user: data.data.user,
          });
          return { success: true, user: data.data.user };
        }
        case 'LOGOUT': {
          await chrome.storage.local.remove(['accessToken', 'refreshToken', 'user']);
          return { success: true };
        }
        case 'GET_USER': {
          return new Promise((resolve) => {
            chrome.storage.local.get(['user', 'accessToken'], (result) => {
              resolve({ success: true, user: result.user || null, hasToken: !!result.accessToken });
            });
          });
        }
        case 'GET_SETTINGS': {
          return new Promise((resolve) => {
            chrome.storage.local.get(['settings'], (result) => {
              resolve({ success: true, settings: result.settings || { autoTranslate: true, enabled: true } });
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
