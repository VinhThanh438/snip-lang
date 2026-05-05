const SNIP_CONFIG = {
  API_URL: 'https://snip-lang-backend.vercel.app/api',
  WEB_URL: 'https://snip-lang.vercel.app',
  PROD_WEB_DOMAIN: 'snip-lang.vercel.app'
};

if (typeof window !== 'undefined') {
  window.SNIP_CONFIG = SNIP_CONFIG;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SNIP_CONFIG = SNIP_CONFIG;
}

