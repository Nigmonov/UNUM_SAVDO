'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';

export default function Register(){
  const router=useRouter();
  useEffect(()=>{ router.replace('/login'); },[router]);
  return <div className="authWrap"><div className="authCard"><p className="muted">Telegram orqali kirish sahifasi ochilmoqda...</p></div></div>;
}
