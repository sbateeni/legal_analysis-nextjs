import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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

export default function About() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    // مزامنة الوضع الليلي مع الصفحة الرئيسية
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('legal_dark_mode') : null;
    if (savedTheme === '1') setDarkMode(true);
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
            <b>منصة التحليل القانوني الذكي</b> هي أداة متقدمة تساعدك على تحليل النصوص القانونية العربية بدقة واحترافية، عبر 12 مرحلة تحليلية متكاملة تغطي جميع الجوانب القانونية.
          </p>
          <div style={{margin:'32px 0 18px 0', display:'flex', alignItems:'center', gap:8}}>
            <span style={{fontSize:22}}>🛠️</span>
            <h2 style={{ color: theme.accent2, fontSize: 22, margin: 0 }}>طريقة الاستخدام:</h2>
          </div>
          <ol style={{ fontSize: 17, marginBottom: 18, lineHeight: 2, paddingRight: 24, background: darkMode ? '#181a2a' : '#f5f7ff', borderRadius: 12, padding: '18px 18px 18px 8px', border: `1px solid ${theme.border}` }}>
            <li>احصل على مفتاح Gemini API الخاص بك من <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{color:theme.accent, textDecoration:'underline'}}>Google AI Studio</a>.</li>
            <li>أدخل المفتاح في خانة &quot;مفتاح Gemini API&quot; في الصفحة الرئيسية.</li>
            <li>أدخل النص القانوني الذي ترغب في تحليله.</li>
            <li>اختر المرحلة التحليلية المناسبة.</li>
            <li>اضغط على &quot;ابدأ التحليل&quot; وستظهر لك النتيجة خلال ثوانٍ.</li>
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
          </ul>
        </div>
        <div style={{ textAlign: 'center', color: theme.accent2, fontSize: 16, marginTop: 18 }}>
          &larr; <Link href="/" style={{color:theme.accent, textDecoration:'underline', fontWeight:700}}>العودة للصفحة الرئيسية</Link>
        </div>
      </main>
    </div>
  );
} 