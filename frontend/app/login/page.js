'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000/api';

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState('Telegram orqali kirilmoqda...');

  useEffect(() => {
    let cancelled = false;

    function loadTelegramScript() {
      return new Promise((resolve, reject) => {
        // Script allaqachon yuklangan bo'lsa
        if (window.Telegram?.WebApp) {
          resolve();
          return;
        }

        const existing = document.querySelector(
          'script[src="https://telegram.org/js/telegram-web-app.js"]'
        );

        if (existing) {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
          return;
        }

        const script = document.createElement('script');

        script.src =
          'https://telegram.org/js/telegram-web-app.js';

        script.async = true;

        script.onload = () => resolve();

        script.onerror = () =>
          reject(new Error('Telegram WebApp script yuklanmadi'));

        document.head.appendChild(script);
      });
    }

    async function login() {
      try {
        setStatus('Telegram tekshirilmoqda...');

        await loadTelegramScript();

        if (cancelled) return;

        const tg = window.Telegram?.WebApp;

        if (!tg) {
          throw new Error(
            'Telegram WebApp topilmadi'
          );
        }

        tg.ready();
        tg.expand();

        console.log('Telegram version:', tg.version);
        console.log('Telegram platform:', tg.platform);
        console.log('Telegram initData:', tg.initData);

        if (!tg.initData) {
          setStatus(
            "Telegram ma'lumotlari kelmadi. Bot ichidagi Open App orqali oching."
          );

          console.error(
            'Telegram initData bo‘sh:',
            tg
          );

          return;
        }

        setStatus('Hisob tekshirilmoqda...');

        // Telegram login
        const authResponse = await fetch(
          `${API}/auth/telegram-miniapp`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              init_data: tg.initData,
            }),
          }
        );

        const authData = await authResponse.json();

        if (!authResponse.ok) {
          throw new Error(
            authData.detail ||
              'Telegram orqali kirishda xatolik'
          );
        }

        const token = authData.access_token;

        if (!token) {
          throw new Error(
            'Access token backenddan kelmadi'
          );
        }

        localStorage.setItem(
          'access_token',
          token
        );

        setStatus("Do'kon tekshirilmoqda...");

        // Do'konni tekshirish
        const storeResponse = await fetch(
          `${API}/stores/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (storeResponse.ok) {
          const store = await storeResponse.json();

          localStorage.setItem(
            'unum_store_id',
            String(store.id)
          );

          router.replace('/dashboard');
          return;
        }

        if (storeResponse.status === 404) {
          localStorage.removeItem(
            'unum_store_id'
          );

          router.replace('/onboarding');
          return;
        }

        const errorData =
          await storeResponse.json().catch(() => ({}));

        throw new Error(
          errorData.detail ||
            "Do'konni tekshirishda xatolik"
        );

      } catch (error) {
        console.error(
          'UNUM SAVDO login error:',
          error
        );

        if (!cancelled) {
          setStatus(
            `Xatolik: ${error.message}`
          );
        }
      }
    }

    login();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #07111f, #0d2138)',
        color: '#fff',
        padding: '20px',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '500px',
        }}
      >
        <h1
          style={{
            fontSize: '40px',
            fontWeight: '800',
            marginBottom: '16px',
          }}
        >
          UNUM SAVDO
        </h1>

        <p
          style={{
            fontSize: '18px',
            opacity: 0.85,
          }}
        >
          {status}
        </p>
      </div>
    </main>
  );
}