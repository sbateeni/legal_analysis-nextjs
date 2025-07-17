import React, { useState } from 'react';
import Link from 'next/link';

export default function Privacy() {
  const [darkMode, setDarkMode] = useState(false);
  function isMobile() {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 600;
  }
  return (
    <div style={{fontFamily:'Tajawal, Arial, sans-serif', direction:'rtl', minHeight:'100vh', background:'#f7f7fa', color:'#222', padding:'0 1rem'}}>
      <main style={{maxWidth:700, margin:'0 auto', padding:'2.5rem 1rem'}}>
        <h1 style={{color:'#4f46e5', fontWeight:900, fontSize:32, marginBottom:18, letterSpacing:1}}>سياسة الخصوصية</h1>
        <p style={{fontSize:18, lineHeight:2, marginBottom:24}}>
          نحن في <b>منصة التحليل القانوني الذكي</b> نولي خصوصيتك أهمية قصوى. جميع بياناتك (القضايا، التحليلات، مفاتيح Gemini API) تحفظ محليًا على جهازك فقط باستخدام <b>قاعدة بيانات المتصفح (IndexedDB)</b> ولا يتم رفعها أو مشاركتها مع أي خادم أو طرف ثالث.
        </p>
        <ul style={{fontSize:16, marginBottom:24, lineHeight:2, paddingRight:24, background:'#f5f7ff', borderRadius:12, padding:'18px 18px 18px 8px', border:'1px solid #e0e7ff'}}>
          <li>لا نقوم بجمع أو تخزين أي بيانات شخصية على خوادمنا.</li>
          <li>جميع العمليات الحسابية والتحليلية تتم محليًا في متصفحك.</li>
          <li>يمكنك في أي وقت مسح جميع بياناتك من خلال زر &quot;مسح كل البيانات&quot; في الموقع.</li>
        </ul>
        <div style={{marginTop:32, textAlign:'center'}}>
          <Link href="/" style={{color:'#6366f1', textDecoration:'underline', fontWeight:700, fontSize:16}}>العودة للصفحة الرئيسية</Link>
        </div>
      </main>
      {/* Bottom Navigation للموبايل */}
      {isMobile() && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100vw',
          background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
          boxShadow: '0 -2px 12px #0002',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '7px 0 3px 0',
          zIndex: 100,
        }}>
          <Link href="/" style={{color:'#fff', textAlign:'center', fontSize:22, flex:1, textDecoration:'none'}}>
            <div>🏠</div>
            <div style={{fontSize:11, marginTop:2}}>الرئيسية</div>
          </Link>
          <Link href="/history" style={{color:'#fff', textAlign:'center', fontSize:22, flex:1, textDecoration:'none'}}>
            <div>📑</div>
            <div style={{fontSize:11, marginTop:2}}>القضايا</div>
          </Link>
          <Link href="/about" style={{color:'#fff', textAlign:'center', fontSize:22, flex:1, textDecoration:'none'}}>
            <div>❓</div>
            <div style={{fontSize:11, marginTop:2}}>عن المنصة</div>
          </Link>
          <button onClick={() => setDarkMode(dm => !dm)} style={{background:'none', border:'none', color:'#fff', fontSize:22, flex:1, textAlign:'center', cursor:'pointer', outline:'none'}}>
            <div>{darkMode ? '🌙' : '☀️'}</div>
            <div style={{fontSize:11, marginTop:2}}>الوضع</div>
          </button>
        </nav>
      )}
    </div>
  );
} 