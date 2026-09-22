'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000/api';

export default function Onboarding() {
  const router = useRouter();

  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function checkStore() {
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const res = await fetch(`${API}/stores/me`, {
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

        if (res.status === 401) {
          localStorage.removeItem('access_token');
          router.replace('/login');
          return;
        }

        if (res.status !== 404) {
          const data = await res.json().catch(() => ({}));
          setErr(
            data.detail ||
            "Do‘kon ma'lumotini tekshirishda xatolik"
          );
        }
      } catch (error) {
        console.error(error);
        setErr('Server bilan bog‘lanib bo‘lmadi');
      } finally {
        setLoading(false);
      }
    }

    checkStore();
  }, [router]);

  async function submit(e) {
    e.preventDefault();

    setErr('');
    setCreating(true);

    const token = localStorage.getItem('access_token');

    if (!token) {
      router.replace('/login');
      return;
    }

    const fd = new FormData(e.currentTarget);

    const body = {
      name: fd.get('name'),
      category: fd.get('category'),
      address: fd.get('address') || null,
    };

    try {
      const res = await fetch(`${API}/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('access_token');
          router.replace('/login');
          return;
        }

        if (res.status === 409) {
          router.replace('/dashboard');
          return;
        }

        setErr(data.detail || 'Xatolik yuz berdi');
        return;
      }

      localStorage.setItem(
        'unum_store_id',
        String(data.id)
      );

      router.replace('/dashboard');
    } catch (error) {
      console.error(error);
      setErr('Server bilan bog‘lanib bo‘lmadi');
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="authWrap">
        <div className="authCard">
          <div className="brand">
            <span className="brandMark">U</span>
            UNUM SAVDO
          </div>

          <p className="muted">
            Do‘kon ma'lumotlari tekshirilmoqda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="authWrap">
      <div className="authCard">

        <div className="brand">
          <span className="brandMark">U</span>
          UNUM SAVDO
        </div>

        <h1>Do‘koningizni yarating.</h1>

        <p className="muted">
          Buni faqat bir marta qilasiz.
          Keyingi kirishda UNUM sizni to‘g‘ridan-to‘g‘ri
          dashboardga olib kiradi.
        </p>

        <form className="form" onSubmit={submit}>

          <div className="field">
            <label>Do‘kon nomi</label>

            <input
              name="name"
              placeholder="Masalan: Baraka Market"
              required
              disabled={creating}
            />
          </div>

          <div className="field">
            <label>Do‘kon turi</label>

            <select
              name="category"
              defaultValue="Oziq-ovqat"
              disabled={creating}
            >
              <option value="Oziq-ovqat">
                Oziq-ovqat
              </option>

              <option value="Kiyim-kechak">
                Kiyim-kechak
              </option>

              <option value="Telefon aksessuarlari">
                Telefon aksessuarlari
              </option>

              <option value="Kosmetika">
                Kosmetika
              </option>

              <option value="Qurilish mollari">
                Qurilish mollari
              </option>

              <option value="Boshqa">
                Boshqa
              </option>
            </select>
          </div>

          <div className="field">
            <label>Manzil (ixtiyoriy)</label>

            <input
              name="address"
              placeholder="Masalan: Toshkent, Chilonzor"
              disabled={creating}
            />
          </div>

          {err && (
            <div className="error">
              {err}
            </div>
          )}

          <button
            className="btn btnAccent"
            type="submit"
            disabled={creating}
          >
            {creating
              ? 'Yaratilmoqda...'
              : 'Do‘konni yaratish'}
          </button>

        </form>
      </div>
    </div>
  );
}