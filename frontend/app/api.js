export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function authHeaders(json = false) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
  const headers = { Authorization: `Bearer ${token}` };
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
}

export function currentStoreId() {
  return typeof window !== 'undefined' ? localStorage.getItem('unum_store_id') : null;
}

export function money(value) {
  return `${Number(value || 0).toLocaleString('uz-UZ')} so‘m`;
}
