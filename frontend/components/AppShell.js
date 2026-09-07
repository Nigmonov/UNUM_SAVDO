'use client';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';

const items = [
  ['/dashboard','Umumiy holat','⌂'],
  ['/pos','Savdo / POS','▣'],
  ['/products','Mahsulotlar','□'],
  ['/sales','Savdo tarixi','↗'],
];

export default function AppShell({children, title, subtitle, action}) {
  const pathname = usePathname();
  const router = useRouter();
  function logout(){localStorage.removeItem('unum_token');localStorage.removeItem('unum_store_id');router.push('/login')}
  return <div className="dash">
    <aside className="side">
      <Link href="/dashboard" className="brand"><span className="brandMark">U</span><span>UNUM SAVDO</span></Link>
      <div className="sideCaption">DO‘KON BOSHQARUVI</div>
      <nav className="menu">
        {items.map(([href,label,icon])=><Link key={href} href={href} className={pathname===href?'active':''}><span className="menuIcon">{icon}</span>{label}</Link>)}
      </nav>
      <div className="sideBottom"><button onClick={logout} className="sideLogout">Chiqish</button></div>
    </aside>
    <main className="main">
      <div className="mobileBrand"><Link href="/dashboard" className="brand"><span className="brandMark">U</span> UNUM</Link><Link href="/pos" className="btn btnAccent">POS</Link></div>
      <div className="topbar"><div><div className="muted">{subtitle}</div><h2 className="pageTitle">{title}</h2></div>{action}</div>
      {children}
    </main>
  </div>
}
