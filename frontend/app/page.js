import Link from 'next/link';
export default function Home(){
  return <main className="shell">
    <nav className="nav">
      <div className="brand"><span className="brandMark">U</span> UNUM SAVDO</div>
      <div className="navActions"><Link className="btn btnGhost" href="/login">Kirish</Link><Link className="btn btnPrimary" href="/login">30 kun bepul</Link></div>
    </nav>
    <section className="hero">
      <div>
        <span className="eyebrow">● Savdo nazorati bir joyda</span>
        <h1>Do‘koningizni raqamlar bilan boshqaring.</h1>
        <p className="lead">Savdo, foyda va ombor holatini telefon yoki kompyuterdan kuzating. UNUM muhim o‘zgarishlarni sizga tushunarli qilib ko‘rsatadi.</p>
        <div className="heroActions"><Link className="btn btnAccent" href="/login">Bepul boshlash</Link><a className="btn btnGhost" href="#qanday">Qanday ishlaydi?</a></div>
        <div className="trust">✓ O‘rnatish shart emas &nbsp; ✓ Karta kerak emas &nbsp; ✓ 30 kun bepul</div>
      </div>
      <div className="device">
        <div className="deviceTop"><span>UNUM / Baraka Market</span><span>09:41</span></div>
        <div className="screen">
          <h3>Assalomu alaykum 👋</h3>
          <div className="metricMain"><small>Bugungi savdo</small><strong>8 740 000 so‘m</strong><span>↑ 12% kechagiga nisbatan</span></div>
          <div className="metricGrid"><div className="metric"><small>Yalpi foyda</small><strong>1 940 000</strong></div><div className="metric"><small>Savdolar</small><strong>286 ta</strong></div></div>
          <div className="insight"><b>UNUM TAHLIL</b><p>4 ta mahsulot zaxirasi kamaygan. Coca-Cola 1.5L taxminan 2 kunlik qoldiqqa ega.</p></div>
        </div>
      </div>
    </section>
    <section className="section">
      <div className="sectionHead"><h2>Do‘konda bo‘lmasangiz ham, holatni biling.</h2><p>UNUM SAVDO egaga keraksiz texnik ma’lumot emas, qaror qabul qilish uchun kerakli raqamlarni beradi.</p></div>
      <div className="cards">
        {[['01','Savdo','Bugun, hafta va oy bo‘yicha tushumni kuzating.'],['02','Foyda','Tannarx va sotuv narxi asosida yalpi foydani biling.'],['03','Ombor','Kam qolgan mahsulotlarni vaqtida ko‘ring.'],['04','Tafovut','Hisobdagi qoldiq bilan real qoldiq farqini topishga yordam beradi.'],['05','UNUM tahlil','Tez va sekin sotilayotgan mahsulotlarni ajratadi.'],['06','Masofadan nazorat','Telefon, planshet va kompyuterda bir xil akkaunt.']].map(x=><div className="card" key={x[0]}><div className="cardIcon">{x[0]}</div><h3>{x[1]}</h3><p>{x[2]}</p></div>)}
      </div>
    </section>
    <section className="section" id="qanday">
      <div className="sectionHead"><h2>4 qadam. Tamom.</h2><p>Dasturchi yoki o‘rnatib beradigan odam kerak emas.</p></div>
      <div className="steps">
        {['Telegram orqali kiring','Do‘konni qo‘shing','Mahsulotlarni kiriting','Savdoni boshlang'].map((s,i)=><div className="step" key={s}><span className="stepNum">0{i+1}</span><strong>{s}</strong><span className="muted">UNUM keyingi qadamni ekranda o‘zi ko‘rsatadi.</span></div>)}
      </div>
    </section>
    <section className="section"><div className="cta"><div><h2>30 kun o‘z do‘koningizda sinab ko‘ring.</h2><p>Ma’lumotlaringiz saqlanadi. Karta kiritish shart emas.</p></div><Link className="btn btnAccent" href="/login">UNUM’ni boshlash</Link></div></section>
  </main>
}
