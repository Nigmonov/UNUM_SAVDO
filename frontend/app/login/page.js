'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000/api';

const DEV_MODE =
  process.env.NEXT_PUBLIC_DEV_MODE === 'true';

const TELEGRAM_BOT_URL =
  'https://t.me/UnumSavdoUzBot?startapp';

export default function Login() {
  const router = useRouter();

  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  // ---------------------------------------
  // Store tekshirish
  // ---------------------------------------
  async function checkStore(token) {
    try {
      const res = await fetch(`${API}/stores/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const store = await res.json();

        localStorage.setItem(
          'unum_store_id',
          String(store.id)
        );

        router.replace('/dashboard');
        return;
      }

      if (res.status === 404) {
        localStorage.removeItem('unum_store_id');
        router.replace('/onboarding');
        return;
      }

      if (res.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Login muddati tugagan');
      }

      const data = await res.json().catch(() => ({}));

      throw new Error(
        data.detail ||
        "Do‘kon ma'lumotini tekshirib bo‘lmadi"
      );

    } catch (error) {
      throw error;
    }
  }

  // ---------------------------------------
  // Telegram Mini App login
  // ---------------------------------------
  async function telegramLogin() {
    setErr('');
    setLoading(true);

    try {
      const tg = window.Telegram?.WebApp;

      /*
       * 1. Agar UNUM Telegram Mini App ichida
       * ochilgan bo‘lsa, initData mavjud bo‘ladi.
       */
      if (tg?.initData) {
        tg.ready();
        tg.expand();

        const initData = tg.initData;

        const res = await fetch(
          `${API}/auth/telegram-miniapp`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              init_data: initData,
            }),
          }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            data.detail ||
            'Telegram orqali kirib bo‘lmadi'
          );
        }

        if (!data.access_token) {
          throw new Error(
            'Server access token qaytarmadi'
          );
        }

        localStorage.setItem(
          'access_token',
          data.access_token
        );

        await checkStore(data.access_token);

        return;
      }

      /*
       * 2. Agar APK yoki oddiy browser bo‘lsa,
       * Telegram'ni ochamiz.
       */
      window.location.href = TELEGRAM_BOT_URL;

    } catch (error) {
      console.error('Telegram login error:', error);

      setErr(
        error?.message ||
        'Telegram orqali kirishda xatolik yuz berdi'
      );

      setLoading(false);
    }
  }

  // ---------------------------------------
  // Development login
  // ---------------------------------------
  async function devLogin() {
    setErr('');
    setLoading(true);

    try {
      const res = await fetch(
        `${API}/auth/dev-login`,
        {
          method: 'POST',
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.detail ||
          'Test login ishlamadi'
        );
      }

      if (!data.access_token) {
        throw new Error(
          'Server access token qaytarmadi'
        );
      }

      localStorage.setItem(
        'access_token',
        data.access_token
      );

      await checkStore(data.access_token);

    } catch (error) {
      console.error('Dev login error:', error);

      setErr(
        error?.message ||
        'Test login ishlamadi'
      );

      setLoading(false);
    }
  }

  // ---------------------------------------
  // Sahifa ochilganda
  // ---------------------------------------
  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    /*
     * Faqat haqiqiy Telegram Mini App ichida
     * avtomatik login qilamiz.
     */
    if (tg?.initData) {
      const timer = setTimeout(() => {
        telegramLogin();
      }, 300);

      return () => clearTimeout(timer);
    }

    /*
     * APK / oddiy browserda avtomatik Telegram
     * ochilmaydi.
     *
     * Foydalanuvchi tugmani o‘zi bosadi.
     */
    setLoading(false);
  }, []);

  // ---------------------------------------
  // UI
  // ---------------------------------------
  return (
    <div className="authWrap">
      <div className="authCard">

        <div className="brand">
          <span className="brandMark">
            U
          </span>

          UNUM SAVDO
        </div>

        <h1>
          UNUM’ga kiring.
        </h1>

        <p className="muted">
          Telegram orqali xavfsiz kirish
        </p>

        {err && (
          <div className="alert errorBox">
            {err}
          </div>
        )}

        <button
          className="btn btnTelegram"
          onClick={telegramLogin}
          disabled={loading}
        >
          <span className="telegramIcon">
            ➤
          </span>

          {loading
            ? 'Kirilmoqda...'
            : 'Telegram orqali davom etish'}
        </button>

        {DEV_MODE && (
          <button
            className="btn btnGhost devLogin"
            onClick={devLogin}
            disabled={loading}
          >
            Lokal test rejimida kirish
          </button>
        )}

      </div>
    </div>
  );
}