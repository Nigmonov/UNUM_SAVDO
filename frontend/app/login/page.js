'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000/api';

export default function Home() {
  const router = useRouter();

  const [status, setStatus] = useState('Telegram tekshirilmoqda...');

  async function loginWithTelegram() {
    try {
      const tg = window.Telegram?.WebApp;

      if (!tg) {
        setStatus('Telegram ilovasida oching');
        return;
      }

      tg.ready();
      tg.expand();

      const initData = tg.initData;

      if (!initData) {
        setStatus('Telegram maʼlumoti olinmadi');
        return;
      }

      setStatus('Telegram orqali kirilmoqda...');

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

      // Do‘konni tekshiramiz
      const storeRes = await fetch(
        `${API}/stores/me`,
        {
          headers: {
            Authorization:
              `Bearer ${data.access_token}`,
          },
        }
      );

      if (storeRes.ok) {
        const store = await storeRes.json();

        localStorage.setItem(
          'unum_store_id',
          String(store.id)
        );

        router.replace('/dashboard');
        return;
      }

      if (storeRes.status === 404) {
        localStorage.removeItem('unum_store_id');

        router.replace('/onboarding');
        return;
      }

      throw new Error(
        'Do‘kon maʼlumotini tekshirib bo‘lmadi'
      );

    } catch (error) {
      console.error(
        'Telegram login error:',
        error
      );

      setStatus(
        error?.message ||
        'Telegram orqali kirishda xatolik'
      );
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loginWithTelegram();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '420px',
        }}
      >
        <h1>UNUM SAVDO</h1>

        <p>
          {status}
        </p>
      </div>
    </main>
  );
}