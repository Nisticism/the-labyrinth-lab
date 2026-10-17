// Tiny API client used only by admin components. Wraps fetch with auth header
// + JSON handling. Token lives in sessionStorage so it dies when the tab closes.

const API_BASE = (process.env.REACT_APP_API_BASE || '').replace(/\/$/, '');
const TOKEN_KEY = 'tll_admin_token';

export function getToken() {
  try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
}
export function setToken(t) {
  try { sessionStorage.setItem(TOKEN_KEY, t); } catch {}
}
export function clearToken() {
  try { sessionStorage.removeItem(TOKEN_KEY); } catch {}
}

async function request(method, path, { body, isForm } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (isForm) {
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE}${path}`, { method, headers, body: payload });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!res.ok) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const adminApi = {
  login: (password) => request('POST', '/api/admin/login', { body: { password } }),
  verify: () => request('GET', '/api/admin/verify'),
  fetchGallery: () => request('GET', '/api/gallery'),
  saveGallery: (data) => request('PUT', '/api/admin/gallery', { body: data }),
  deleteImage: (path) => request('DELETE', '/api/admin/image', { body: { path } }),
  upload: (categoryId, files) => {
    const form = new FormData();
    for (const f of files) form.append('images', f);
    return request('POST', `/api/admin/upload/${encodeURIComponent(categoryId)}`, {
      body: form, isForm: true,
    });
  },
};
