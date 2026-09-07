'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

function TelegramCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState('Telegram tasdiqlandi. UNUM ochilmoqda...');

  useEffect(() => {
    async function finishLogin() {
      const token = params.get('token');

      if (!token) {
        setMessage('Login token topilmadi. Qaytadan urinib ko‘ring.');
        return;
      }

      localStorage.setItem('unum_token', token);

      try {
        const response = await fetch(`${API}/stores`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const stores = await response.json();

        if (response.ok && Array.isArray(stores) && stores.length > 0) {
          localStorage.setItem('unum_store_id', stores[0].id);
          router.replace('/dashboard');
          return;
        }

        router.replace('/onboarding');
      } catch {
        router.replace('/onboarding');
      }
    }

    finishLogin();
  }, [params, router]);

  return (
    <div className="authWrap">
      <div className="authCard">
        <div className="brand">
          <span className="brandMark">U</span> UNUM SAVDO
        </div>
        <h1>Kirish tasdiqlandi.</h1>
        <p className="muted">{message}</p>
      </div>
    </div>
  );
}

export default function TelegramCallback() {
  return (
    <Suspense fallback={<div className="authWrap"><div className="authCard">UNUM ochilmoqda...</div></div>}>
      <TelegramCallbackContent />
    </Suspense>
  );
}
