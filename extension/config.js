const SNIP_CONFIG = {
  API_URL: 'http://localhost:4000/api',
  WEB_URL: 'http://localhost:3000',
  PROD_WEB_DOMAIN: 'snip-lang.com'
};

if (typeof window !== 'undefined') {
  window.SNIP_CONFIG = SNIP_CONFIG;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SNIP_CONFIG = SNIP_CONFIG;
}

