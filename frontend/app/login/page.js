'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API =const API =const API =
  'https://unum-savdo-t1lg-lcv1ybzf-dilshodnigmonov8-2576.vercel.app/api';


export default function Home() {
  const router = useRouter();

  const [status, setStatus] = useState('Boshlanmoqda...');
  const [debug, setDebug] = useState([]);

  function log(message) {
    console.log(message);
    setDebug((prev) => [...prev, message]);
  }

  useEffect(() => {
    let cancelled = false;

    async function login() {
      try {
        log(`Frontend: ${window.location.origin}`);
        log(`API: ${API}`);

        // ==========================================
        // 1. TELEGRAM WEB APP
        // ==========================================

        setStatus('Telegram tekshirilmoqda...');

        const tg = window.Telegram?.WebApp;

        if (!tg) {
          throw new Error(
            'Telegram WebApp topilmadi'
          );
        }

        tg.ready();
        tg.expand();

        log(`Telegram version: ${tg.version || 'unknown'}`);
        log(`Telegram platform: ${tg.platform || 'unknown'}`);
        log(
          `initData uzunligi: ${tg.initData?.length || 0}`
        );

        if (!tg.initData) {
          throw new Error(
            'Telegram initData kelmadi'
          );
        }

        // ==========================================
        // 2. BACKEND CONNECTION TEST
        // ==========================================

        setStatus('Backend tekshirilmoqda...');

        log('Backend GET / so‘rovi yuborilmoqda...');

        let healthResponse;

        try {
          healthResponse = await fetch(
            `${API}/`,
            {
              method: 'GET',
              headers: {
                Accept: 'application/json',
              },
            }
          );
        } catch (error) {
          log(`BACKEND NETWORK ERROR: ${error.message}`);

          throw new Error(
            `Backendga ulanib bo‘lmadi: ${error.message}`
          );
        }

        log(
          `Backend HTTP status: ${healthResponse.status}`
        );

        const healthText =
          await healthResponse.text();

        log(
          `Backend response: ${healthText.slice(0, 300)}`
        );

        if (!healthResponse.ok) {
          throw new Error(
            `Backend / javobi: HTTP ${healthResponse.status}`
          );
        }

        // ==========================================
        // 3. TELEGRAM AUTH
        // ==========================================

        setStatus('Telegram akkaunt tekshirilmoqda...');

        log(
          'POST /auth/telegram-miniapp yuborilmoqda...'
        );

        let authResponse;

        try {
          authResponse = await fetch(
            `${API}/auth/telegram-miniapp`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({
                init_data: tg.initData,
              }),
            }
          );
        } catch (error) {
          log(`AUTH NETWORK ERROR: ${error.message}`);

          throw new Error(
            `Auth request yuborilmadi: ${error.message}`
          );
        }

        log(
          `AUTH HTTP status: ${authResponse.status}`
        );

        const authText =
          await authResponse.text();

        log(
          `AUTH response: ${authText.slice(0, 500)}`
        );

        if (!authResponse.ok) {
          throw new Error(
            `Telegram login HTTP ${authResponse.status}: ${authText}`
          );
        }

        let authData;

        try {
          authData = JSON.parse(authText);
        } catch {
          throw new Error(
            'Backend JSON qaytarmadi'
          );
        }

        const token = authData.access_token;

        if (!token) {
          throw new Error(
            'Backend access_token qaytarmadi'
          );
        }

        log('JWT token olindi');

        localStorage.setItem(
          'access_token',
          token
        );

        // ==========================================
        // 4. STORE CHECK
        // ==========================================

        setStatus("Do'kon tekshirilmoqda...");

        log('GET /stores/me yuborilmoqda...');

        let storeResponse;

        try {
          storeResponse = await fetch(
            `${API}/stores/me`,
            {
              method: 'GET',
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch (error) {
          log(
            `STORE NETWORK ERROR: ${error.message}`
          );

          throw new Error(
            `Do'kon requesti yuborilmadi: ${error.message}`
          );
        }

        log(
          `STORE HTTP status: ${storeResponse.status}`
        );

        const storeText =
          await storeResponse.text();

        log(
          `STORE response: ${storeText.slice(0, 500)}`
        );

        // ==========================================
        // 5. DO'KON BOR
        // ==========================================

        if (storeResponse.ok) {
          const store = JSON.parse(storeText);

          log(
            `Do'kon topildi: ${store.name || store.id}`
          );

          localStorage.setItem(
            'unum_store_id',
            String(store.id)
          );

          setStatus(
            "Do'kon topildi. Dashboardga o'tilmoqda..."
          );

          setTimeout(() => {
            router.replace('/dashboard');
          }, 500);

          return;
        }

        // ==========================================
        // 6. DO'KON YO'Q
        // ==========================================

        if (storeResponse.status === 404) {
          log("Do'kon hali mavjud emas");

          localStorage.removeItem(
            'unum_store_id'
          );

          setStatus(
            "Do'kon topilmadi. Ro'yxatdan o'tish sahifasiga o'tilmoqda..."
          );

          setTimeout(() => {
            router.replace('/onboarding');
          }, 500);

          return;
        }

        // ==========================================
        // 7. STORE OTHER ERROR
        // ==========================================

        throw new Error(
          `Do'kon API xatosi: HTTP ${storeResponse.status}`
        );

      } catch (error) {
        console.error(
          'UNUM SAVDO ERROR:',
          error
        );

        if (!cancelled) {
          setStatus(
            `XATOLIK: ${error.message}`
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
        background: '#07182b',
        color: '#fff',
        padding: '40px 20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '700px',
          margin: '100px auto',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            fontSize: '40px',
            marginBottom: '20px',
          }}
        >
          UNUM SAVDO
        </h1>

        <div
          style={{
            background: '#10243b',
            borderRadius: '12px',
            padding: '25px',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              marginBottom: '20px',
            }}
          >
            {status}
          </h2>

          <div
            style={{
              background: '#06111f',
              borderRadius: '8px',
              padding: '15px',
              fontSize: '14px',
              lineHeight: '1.7',
              wordBreak: 'break-word',
            }}
          >
            {debug.map((item, index) => (
              <div key={index}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}