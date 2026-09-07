'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

export default function Login() {
  const router = useRouter();
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function telegramLogin() {
    setErr('');
    setLoading(true);
    try {
      const res = await fetch(API + '/auth/telegram/start');
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Telegram loginni boshlab bo‘lmadi');
      window.location.href = data.auth_url;
    } catch (e) {
      setErr(e.message || 'Xatolik yuz berdi');
      setLoading(false);
    }
  }

  async function devLogin() {
    setErr('');
    setLoading(true);
    try {
      const res = await fetch(API + '/auth/dev-login', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Test login ishlamadi');
      localStorage.setItem('unum_token', data.access_token);
      localStorage.removeItem('unum_store_id');
      router.push('/dashboard');
    } catch (e) {
      setErr(e.message || 'Xatolik yuz berdi');
      setLoading(false);
    }
  }

  return (
    <div className="authWrap">
      <div className="authCard">
        <div className="brand"><span className="brandMark">U</span> UNUM SAVDO</div>
        <h1>UNUM’ga kiring.</h1>
        <p className="muted">Email ham, SMS kod ham kerak emas.</p>

        {err && <div className="alert errorBox">{err}</div>}

        <button className="btn btnTelegram" onClick={telegramLogin} disabled={loading}>
          <span className="telegramIcon">➤</span>
          {loading ? 'Kutilmoqda...' : 'Telegram orqali davom etish'}
        </button>

        {DEV_MODE && (
          <button className="btn btnGhost devLogin" onClick={devLogin} disabled={loading}>
            Lokal test rejimida kirish
          </button>
        )}

        <div className="authNote">
          Telegram Web Login ishlatiladi. Serverda Telegram bot processi ishlamaydi.
          Lokal test tugmasi faqat development uchun.
        </div>
      </div>
    </div>
  );
}
