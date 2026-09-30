'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'http://127.0.0.1:8000/api';

export default function Home() {
  const router = useRouter();

  const [status, setStatus] = useState(
    'Local test rejimida kirilmoqda...'
  );

  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function devLogin() {
      try {
        setStatus('Backendga ulanilmoqda...');
        setError('');

        console.log('API:', API);

        // ==========================================
        // 1. LOCAL DEV LOGIN
        // ==========================================

        const loginResponse = await fetch(
          `${API}/auth/dev-login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
        );

        const loginText = await loginResponse.text();

        console.log(
          'DEV LOGIN STATUS:',
          loginResponse.status
        );

        console.log(
          'DEV LOGIN RESPONSE:',
          loginText
        );

        if (!loginResponse.ok) {
          let detail = loginText;

          try {
            const data = JSON.parse(loginText);
            detail = data.detail || loginText;
          } catch {}

          throw new Error(
            `Dev login xatosi: HTTP ${loginResponse.status} - ${detail}`
          );
        }

        let loginData;

        try {
          loginData = JSON.parse(loginText);
        } catch {
          throw new Error(
            'Backend JSON qaytarmadi'
          );
        }

        const token = loginData.access_token;

        if (!token) {
          throw new Error(
            'Backend access_token qaytarmadi'
          );
        }

        console.log(
          'ACCESS TOKEN OLINDI'
        );

        // Tokenni saqlaymiz
        localStorage.setItem(
          'access_token',
          token
        );

        setStatus(
          "Akkaunt muvaffaqiyatli. Do'kon tekshirilmoqda..."
        );

        // ==========================================
        // 2. STORE CHECK
        // ==========================================

        const storeResponse = await fetch(
          `${API}/stores/me`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const storeText =
          await storeResponse.text();

        console.log(
          'STORE STATUS:',
          storeResponse.status
        );

        console.log(
          'STORE RESPONSE:',
          storeText
        );

        // ==========================================
        // 3. STORE EXISTS
        // ==========================================

        if (storeResponse.ok) {
          let store;

          try {
            store = JSON.parse(storeText);
          } catch {
            throw new Error(
              "Do'kon ma'lumotlari JSON emas"
            );
          }

          console.log(
            "DO'KON TOPILDI:",
            store
          );

          if (store.id) {
            localStorage.setItem(
              'unum_store_id',
              String(store.id)
            );
          }

          setStatus(
            "Do'kon topildi. Dashboard ochilmoqda..."
          );

          if (!cancelled) {
            setTimeout(() => {
              router.replace('/dashboard');
            }, 500);
          }

          return;
        }

        // ==========================================
        // 4. STORE DOES NOT EXIST
        // ==========================================

        if (storeResponse.status === 404) {
          console.log(
            "DO'KON TOPILMADI"
          );

          localStorage.removeItem(
            'unum_store_id'
          );

          setStatus(
            "Do'kon topilmadi. Ro'yxatdan o'tish sahifasi ochilmoqda..."
          );

          if (!cancelled) {
            setTimeout(() => {
              router.replace('/onboarding');
            }, 500);
          }

          return;
        }

        // ==========================================
        // 5. OTHER STORE ERROR
        // ==========================================

        let detail = storeText;

        try {
          const data = JSON.parse(storeText);
          detail = data.detail || storeText;
        } catch {}

        throw new Error(
          `Do'kon API xatosi: HTTP ${storeResponse.status} - ${detail}`
        );

      } catch (err) {
        console.error(
          'LOCAL DEV LOGIN ERROR:',
          err
        );

        if (!cancelled) {
          setStatus(
            'Local login ishlamadi'
          );

          setError(
            err?.message ||
              'Nomaʼlum xatolik'
          );
        }
      }
    }

    devLogin();

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
          'linear-gradient(135deg, #07182b, #0d2945)',
        color: '#fff',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '40px',
            fontWeight: '800',
            marginBottom: '15px',
          }}
        >
          UNUM SAVDO
        </h1>

        <p
          style={{
            fontSize: '18px',
            opacity: 0.85,
            marginBottom: '25px',
          }}
        >
          {status}
        </p>

        {error && (
          <div
            style={{
              background: '#3b1720',
              border: '1px solid #8f3345',
              borderRadius: '10px',
              padding: '15px',
              color: '#ffb8c2',
              textAlign: 'left',
              wordBreak: 'break-word',
            }}
          >
            <strong>Xatolik:</strong>
            <br />
            {error}
          </div>
        )}
      </div>
    </main>
  );
}