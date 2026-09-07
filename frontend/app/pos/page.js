'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import AppShell from '../../components/AppShell';
import {API,authHeaders,currentStoreId,money} from '../api';

export default function Pos(){
 const r=useRouter(); const [products,setProducts]=useState([]); const [cart,setCart]=useState([]); const [query,setQuery]=useState(''); const [err,setErr]=useState(''); const [done,setDone]=useState(''); const [busy,setBusy]=useState(false); const input=useRef(null);
 async function load(){const store=currentStoreId();if(!store){r.push('/dashboard');return}const res=await fetch(`${API}/stores/${store}/products`,{headers:authHeaders()});const d=await res.json();if(res.ok)setProducts(d);else if(res.status===401)r.push('/login');else setErr(d.detail||'Xatolik')}
 useEffect(()=>{load();setTimeout(()=>input.current?.focus(),100)},[]);
 const filtered=useMemo(()=>{const x=query.trim().toLowerCase();if(!x)return products.slice(0,18);return products.filter(p=>p.name.toLowerCase().includes(x)||(p.barcode||'').toLowerCase().includes(x)).slice(0,18)},[products,query]);
 function add(p){setDone('');setErr('');if(p.stock_qty<=0){setErr(`${p.name}: omborda qolmagan`);return}setCart(c=>{const old=c.find(x=>x.id===p.id);if(old){if(old.qty>=p.stock_qty){setErr(`${p.name}: ombordagi maksimal miqdor tanlandi`);return c}return c.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x)}return [...c,{...p,qty:1}]});setQuery('');setTimeout(()=>input.current?.focus(),0)}
 function key(e){if(e.key==='Enter'){e.preventDefault();const exact=products.find(p=>p.barcode&&p.barcode===query.trim());if(exact)add(exact);else if(filtered.length===1)add(filtered[0])}}
 function qty(id,d){setCart(c=>c.map(x=>x.id===id?{...x,qty:Math.max(0,Math.min(x.stock_qty,x.qty+d))}:x).filter(x=>x.qty>0))}
 const total=cart.reduce((s,x)=>s+Number(x.sale_price)*x.qty,0);
 async function checkout(){if(!cart.length)return;setBusy(true);setErr('');setDone('');const store=currentStoreId();const res=await fetch(`${API}/stores/${store}/sales/checkout`,{method:'POST',headers:authHeaders(true),body:JSON.stringify({items:cart.map(x=>({product_id:x.id,quantity:x.qty}))})});const d=await res.json();setBusy(false);if(!res.ok){setErr(d.detail||'Savdo bajarilmadi');return}setDone(`${money(d.total_amount)} savdo muvaffaqiyatli saqlandi`);setCart([]);await load();setTimeout(()=>input.current?.focus(),0)}
 return <AppShell title="Savdo / POS" subtitle="Barcode skaner yoki qidiruv orqali tez savdo">
  <div className="posGrid"><section><div className="scanBox"><span className="scanLabel">BARCODE / QIDIRUV</span><input ref={input} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={key} placeholder="Barcode skanerlang yoki mahsulot nomini yozing"/><span className="scanHint">USB skaner odatda Enter yuboradi — UNUM mahsulotni avtomatik topadi.</span></div>{err&&<div className="alert errorBox">{err}</div>}{done&&<div className="alert successBox">✓ {done}</div>}<div className="productTiles">{filtered.map(p=><button key={p.id} className="productTile" onClick={()=>add(p)}><span className="tileName">{p.name}</span><span className="tilePrice">{money(p.sale_price)}</span><span className={p.stock_qty<=p.min_stock_qty?'tileStock low':'tileStock'}>{p.stock_qty} dona</span></button>)}</div></section>
  <aside className="cart"><div className="cartHead"><div><span className="muted">Joriy savdo</span><h3>Savatcha</h3></div><b>{cart.reduce((s,x)=>s+x.qty,0)} dona</b></div><div className="cartItems">{cart.length?cart.map(x=><div className="cartItem" key={x.id}><div><b>{x.name}</b><small>{money(x.sale_price)} × {x.qty}</small></div><div className="qty"><button onClick={()=>qty(x.id,-1)}>−</button><b>{x.qty}</b><button onClick={()=>qty(x.id,1)}>+</button></div></div>):<div className="emptyCart"><b>Savatcha bo‘sh</b><span>Mahsulotni skanerlang.</span></div>}</div><div className="cartTotal"><span>Jami</span><strong>{money(total)}</strong></div><button disabled={!cart.length||busy} className="btn btnAccent checkout" onClick={checkout}>{busy?'Saqlanmoqda…':'SOTUVNI YAKUNLASH'}</button></aside></div>
 </AppShell>
}
