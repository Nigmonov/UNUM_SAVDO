'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000/api';

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState('Telegram tekshirilmoqda...');

  useEffect(() => {
    let cancelled = false;

    async function login() {
      try {
        setStatus('Telegram ulanmoqda...');

        // Telegram WebApp scriptini yuklash
        if (!window.Telegram?.WebApp) {
          await new Promise((resolve, reject) => {
            const existing = document.querySelector(
              'script[src="https://telegram.org/js/telegram-web-app.js"]'
            );

            if (existing) {
              existing.addEventListener('load', resolve, {
                once: true,
              });

              // Script allaqachon yuklangan bo‘lsa
              if (window.Telegram?.WebApp) {
                resolve();
              }

              return;
            }

            const script = document.createElement('script');

            script.src =
              'https://telegram.org/js/telegram-web-app.js';

            script.async = true;

            script.onload = resolve;

            script.onerror = () => {
              reject(
                new Error(
                  'Telegram WebApp scriptini yuklab bo‘lmadi'
                )
              );
            };

            document.head.appendChild(script);
          });
        }

        // Telegram API paydo bo‘lishini kutamiz
        let tg = null;

        for (let i = 0; i < 50; i++) {
          tg = window.Telegram?.WebApp;

          if (tg) {
            break;
          }

          await new Promise((resolve) =>
            setTimeout(resolve, 100)
          );
        }

        if (!tg) {
          throw new Error(
            'Telegram WebApp topilmadi. Ilovani Telegram ichidan Open App orqali oching.'
          );
        }

        tg.ready();
        tg.expand();

        const initData = tg.initData;

        console.log(
          'Telegram WebApp mavjud:',
          !!tg
        );

        console.log(
          'initData mavjud:',
          !!initData
        );

        if (!initData) {
          throw new Error(
            'Telegram initData kelmadi. Botdagi Open App orqali qayta oching.'
          );
        }

        if (cancelled) return;

        setStatus('Telegram orqali kirilmoqda...');

        // Backendga Telegram initData yuborish
        const authResponse = await fetch(
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

        const authData =
          await authResponse.json().catch(() => ({}));

        console.log(
          'Telegram auth response:',
          authResponse.status,
          authData
        );

        if (!authResponse.ok) {
          throw new Error(
            authData.detail ||
              'Telegram orqali kirib bo‘lmadi'
          );
        }

        if (!authData.access_token) {
          throw new Error(
            'Server access token qaytarmadi'
          );
        }

        // JWT saqlaymiz
        localStorage.setItem(
          'access_token',
          authData.access_token
        );

        setStatus('Do‘kon maʼlumotlari tekshirilmoqda...');

        // Do‘konni tekshiramiz
        const storeResponse = await fetch(
          `${API}/stores/me`,
          {
            method: 'GET',
            headers: {
              Authorization:
                `Bearer ${authData.access_token}`,
            },
          }
        );

        const storeData =
          await storeResponse.json().catch(() => ({}));

        console.log(
          'Store response:',
          storeResponse.status,
          storeData
        );

        // Do‘kon mavjud
        if (storeResponse.ok) {
          localStorage.setItem(
            'unum_store_id',
            String(storeData.id)
          );

          setStatus('Dashboard ochilmoqda...');

          router.replace('/dashboard');

          return;
        }

        // Do‘kon hali yaratilmagan
        if (storeResponse.status === 404) {
          localStorage.removeItem(
            'unum_store_id'
          );

          setStatus('Do‘kon yaratish sahifasi ochilmoqda...');

          router.replace('/onboarding');

          return;
        }

        throw new Error(
          storeData.detail ||
            'Do‘kon maʼlumotini olishda xatolik'
        );

      } catch (error) {
        console.error(
          'UNUM Telegram login error:',
          error
        );

        if (!cancelled) {
          setStatus(
            error?.message ||
              'Telegram orqali kirishda xatolik yuz berdi'
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
        padding: '24px',
        background: '#f4f8ed',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          textAlign: 'center',
          padding: '40px 24px',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 20px',
            borderRadius: '18px',
            background: '#07130f',
            color: '#baff00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: '800',
          }}
        >
          U
        </div>

        <h1
          style={{
            marginBottom: '12px',
            fontSize: '28px',
          }}
        >
          UNUM SAVDO
        </h1>

        <p
          style={{
            fontSize: '16px',
            color: '#5d6b63',
          }}
        >
          {status}
        </p>
      </div>
    </main>
  );
}