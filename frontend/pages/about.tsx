import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { get as idbGet } from 'idb-keyval';

const stages = [
  'تحديد المشكلة القانونية',
  'جمع المعلومات والوثائق',
  'تحليل النصوص القانونية',
  'تحديد القواعد القانونية المنطبقة',
  'تحليل السوابق القضائية',
  'تحليل الفقه القانوني',
  'تحليل الظروف الواقعية',
  'تحديد الحلول القانونية الممكنة',
  'تقييم الحلول القانونية',
  'اختيار الحل الأمثل',
  'صياغة الحل القانوني',
  'تقديم التوصيات',
  'العريضة القانونية النهائية', // المرحلة 13
];

const lightTheme = {
  background: 'linear-gradient(135deg, #e0e7ff 0%, #f7f7fa 100%)',
  card: '#fff',
  border: '#e0e7ff',
  accent: '#4f46e5',
  accent2: '#6366f1',
  text: '#222',
  shadow: '#6366f122',
};
const darkTheme = {
  background: 'linear-gradient(135deg, #232946 0%, #16161a 100%)',
  card: '#232946',
  border: '#393e5c',
  accent: '#a3a8f0',
  accent2: '#6366f1',
  text: '#f7f7fa',
  shadow: '#23294655',
};

// أضف دالة isMobile المحلية
function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 600;
}

export default function About() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    idbGet('legal_dark_mode').then((savedTheme) => {
      if (savedTheme === '1') setDarkMode(true);
    });
  }, []);

  return (
    <div style={{ fontFamily: 'Tajawal, Arial, sans-serif', direction: 'rtl', minHeight: '100vh', background: theme.background, color: theme.text, padding: 0, margin: 0, transition: 'background 0.4s' }}>
      <main style={{ maxWidth: 700, margin: '0 auto', padding: '2.5rem 1rem' }}>
        <div style={{ background: theme.card, borderRadius: 20, boxShadow: `0 2px 16px ${theme.shadow}`, padding: 36, marginBottom: 32, border: `1.5px solid ${theme.border}` }}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:18}}>
            <span style={{fontSize:36}}>⚖️</span>
            <h1 style={{ color: theme.accent, fontWeight: 900, fontSize: 32, margin: 0, letterSpacing: 1 }}>عن المنصة</h1>
          </div>
          <p style={{ fontSize: 19, marginBottom: 22, lineHeight: 2, textAlign:'center' }}>
            <b>منصة التحليل القانوني الذكي</b> هي أداة متقدمة تساعدك على تحليل النصوص القانونية العربية بدقة واحترافية، عبر 13 مرحلة تحليلية متكاملة تغطي جميع الجوانب القانونية، مع دعم التحليل التراكمي المتسلسل (كل مرحلة تعتمد على نتائج السابقة حتى الوصول للعريضة النهائية).
          </p>
          <div style={{margin:'32px 0 18px 0', display:'flex', alignItems:'center', gap:8}}>
            <span style={{fontSize:22}}>🛠️</span>
            <h2 style={{ color: theme.accent2, fontSize: 22, margin: 0 }}>طريقة الاستخدام:</h2>
          </div>
          <ol style={{ fontSize: 17, marginBottom: 18, lineHeight: 2, paddingRight: 24, background: darkMode ? '#181a2a' : '#f5f7ff', borderRadius: 12, padding: '18px 18px 18px 8px', border: `1px solid ${theme.border}` }}>
            <li>احصل على مفتاح Gemini API الخاص بك من <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{color:theme.accent, textDecoration:'underline'}}>Google AI Studio</a>.</li>
            <li>أدخل المفتاح في خانة "مفتاح Gemini API" في الصفحة الرئيسية.</li>
            <li>أدخل النص القانوني الذي ترغب في تحليله واسم القضية (اختياري).</li>
            <li>اختر المرحلة التحليلية المناسبة أو اتبع التسلسل التراكمي.</li>
            <li>اضغط على "ابدأ التحليل" وستظهر لك النتيجة خلال ثوانٍ.</li>
            <li>يمكنك حفظ القضية، تصديرها أو استيرادها لاحقًا.</li>
          </ol>
          <div style={{margin:'32px 0 18px 0', display:'flex', alignItems:'center', gap:8}}>
            <span style={{fontSize:22}}>📋</span>
            <h2 style={{ color: theme.accent2, fontSize: 22, margin: 0 }}>مراحل التحليل القانوني:</h2>
          </div>
          <ul style={{ fontSize: 17, marginBottom: 18, lineHeight: 2, paddingRight: 24, background: darkMode ? '#181a2a' : '#f5f7ff', borderRadius: 12, padding: '18px 18px 18px 8px', border: `1px solid ${theme.border}` }}>
            {stages.map((stage, i) => (
              <li key={i} style={{marginBottom: 4}}><b>{i+1}.</b> {stage}</li>
            ))}
          </ul>
          <div style={{margin:'32px 0 18px 0', display:'flex', alignItems:'center', gap:8}}>
            <span style={{fontSize:22}}>💡</span>
            <h2 style={{ color: theme.accent2, fontSize: 22, margin: 0 }}>ملاحظات هامة:</h2>
          </div>
          <ul style={{ fontSize: 16, marginBottom: 0, lineHeight: 2, paddingRight: 24, background: darkMode ? '#181a2a' : '#f5f7ff', borderRadius: 12, padding: '18px 18px 18px 8px', border: `1px solid ${theme.border}` }}>
            <li>المنصة مجانية حاليًا، وقد تصبح باشتراك لاحقًا.</li>
            <li>كل مستخدم يحتاج لمفتاح Gemini API خاص به (لا تشارك مفتاحك مع الآخرين).</li>
            <li>النتائج تعتمد على دقة النص المدخل وصحة المفتاح.</li>
            <li>لا يتم تخزين أي نصوص أو مفاتيح على خوادمنا.</li>
            <li>جميع القضايا والمفاتيح تحفظ محليًا على جهازك فقط باستخدام قاعدة بيانات المتصفح (IndexedDB)، مع إمكانية تصدير واستيراد القضايا.</li>
            <li>واجهة متجاوبة بالكامل تدعم الوضع الليلي، الخطوط العربية، وRTL.</li>
            <li>يوجد زر لمسح كل البيانات، ومؤشرات تحميل وتنبيهات ذكية.</li>
          </ul>
        </div>
        <div style={{ textAlign: 'center', color: theme.accent2, fontSize: 16, marginTop: 18 }}>
          &larr; <Link href="/" style={{color:theme.accent, textDecoration:'underline', fontWeight:700}}>العودة للصفحة الرئيسية</Link>
        </div>
        <div style={{marginTop:32, background:'#fffbe6', color:'#b7791f', borderRadius:8, padding:'10px 18px', display:'inline-block', fontWeight:700, fontSize:14, boxShadow:'0 1px 4px #b7791f22'}}>
          ⚠️ جميع بياناتك (القضايا والمفاتيح) تحفظ محليًا على جهازك فقط ولا يتم رفعها إلى أي خادم.
        </div>
        <div style={{marginTop:24, textAlign:'center'}}>
          <a href="/privacy" style={{color:theme.accent, textDecoration:'underline', fontWeight:700, fontSize:15}}>سياسة الخصوصية</a>
        </div>
        {/* قسم توعوي حول الأمان والتخزين على Vercel */}
        <div style={{marginTop:36, background:'#e0e7ff', color:'#222', borderRadius:10, padding:'18px 18px', fontWeight:700, fontSize:15, boxShadow:'0 1px 4px #4f46e522', lineHeight:2}}>
          <span style={{color:theme.accent, fontSize:18}}>🔒 ملاحظات حول الأمان والتخزين على Vercel:</span><br/>
          جميع عمليات الحفظ تتم <b>محليًا في متصفحك فقط</b> باستخدام قاعدة بيانات المتصفح (IndexedDB)، ولا يتم إرسال أي بيانات إلى خوادم Vercel أو أي طرف خارجي.<br/>
          <span style={{color:'#b7791f'}}>إذا فتحت الموقع من جهاز أو متصفح جديد، لن تجد بياناتك القديمة لأنها محفوظة محليًا فقط.</span><br/>
          إذا قمت بمسح بيانات المتصفح (Clear Site Data)، ستُحذف القضايا والمفاتيح نهائيًا.<br/>
          <span style={{color:theme.accent2}}>للحفاظ على بياناتك أو نقلها لجهاز آخر، استخدم ميزة تصدير/استيراد القضايا من واجهة الموقع.</span>
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