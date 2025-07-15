import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
// إزالة استيراد useSession, signIn, signOut
import { saveApiKey, loadApiKey, saveHistory, loadHistory } from '../utils/db';

const STAGES = [
  'المرحلة الأولى: تحديد المشكلة القانونية',
  'المرحلة الثانية: جمع المعلومات والوثائق',
  'المرحلة الثالثة: تحليل النصوص القانونية',
  'المرحلة الرابعة: تحديد القواعد القانونية المنطبقة',
  'المرحلة الخامسة: تحليل السوابق القضائية',
  'المرحلة السادسة: تحليل الفقه القانوني',
  'المرحلة السابعة: تحليل الظروف الواقعية',
  'المرحلة الثامنة: تحديد الحلول القانونية الممكنة',
  'المرحلة التاسعة: تقييم الحلول القانونية',
  'المرحلة العاشرة: اختيار الحل الأمثل',
  'المرحلة الحادية عشرة: صياغة الحل القانوني',
  'المرحلة الثانية عشرة: تقديم التوصيات',
];

const lightTheme = {
  background: 'linear-gradient(135deg, #e0e7ff 0%, #f7f7fa 100%)',
  card: '#fff',
  border: '#e0e7ff',
  input: '#c7d2fe',
  text: '#222',
  accent: '#4f46e5',
  accent2: '#6366f1',
  resultBg: 'linear-gradient(135deg, #f5f7ff 0%, #e0e7ff 100%)',
  errorBg: '#fff0f0',
  errorText: '#e53e3e',
  shadow: '#6366f122',
};
const darkTheme = {
  background: 'linear-gradient(135deg, #232946 0%, #16161a 100%)',
  card: '#232946',
  border: '#393e5c',
  input: '#393e5c',
  text: '#f7f7fa',
  accent: '#a3a8f0',
  accent2: '#6366f1',
  resultBg: 'linear-gradient(135deg, #232946 0%, #393e5c 100%)',
  errorBg: '#3a1a1a',
  errorText: '#ff6b6b',
  shadow: '#23294655',
};

// دوال تشفير وفك تشفير بسيطة (Base64)
function encode(str: string) {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return '';
  }
}
function decode(str: string) {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return '';
  }
}

// أضف دالة تساعد في معرفة إذا كان العرض صغير (جوال)
function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 600;
}

export default function Home() {
  // إزالة كل كود متعلق بالجلسة أو زر تسجيل الدخول/الخروج
  const [text, setText] = useState('');
  const [stageIndex, setStageIndex] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [localStorageError, setLocalStorageError] = useState(false);
  const prevApiKey = useRef("");

  const theme = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    // تحميل مفتاح API من قاعدة البيانات عند بدء التشغيل
    loadApiKey().then(val => {
      if (val) setApiKey(val);
    });
    // تحميل سجل التحليل من قاعدة البيانات (اختياري)
    // loadHistory().then(h => { ... });
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('legal_dark_mode') : null;
    if (savedTheme === '1') setDarkMode(true);
  }, []);

  useEffect(() => {
    // حفظ مفتاح API في قاعدة البيانات عند تغييره
    if (apiKey) saveApiKey(apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('legal_dark_mode', darkMode ? '1' : '0');
  }, [darkMode]);

  // حفظ بيانات المستخدم عند تسجيل الدخول
  // إزالة كود متعلق بالجلسة

  // حفظ apiKey في Blob Storage عند تغييره
  useEffect(() => {
    // إزالة كود متعلق بالجلسة
    if (apiKey && apiKey !== prevApiKey.current) {
      // إزالة كود متعلق بالجلسة
      prevApiKey.current = apiKey;
    }
  }, [apiKey]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setShowResult(false);
    if (!apiKey) {
      setError('يرجى إدخال مفتاح Gemini API الخاص بك أولاً.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, stageIndex, apiKey }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.analysis);
        setTimeout(() => setShowResult(true), 100); // أنيميشن ظهور النتيجة
        // حفظ التحليل في LocalStorage
        const history = JSON.parse(localStorage.getItem('legal_analysis_history') || '[]');
        history.unshift({
          id: uuidv4(),
          stageIndex,
          stage: STAGES[stageIndex],
          input: text,
          output: data.analysis,
          date: new Date().toISOString(),
        });
        localStorage.setItem('legal_analysis_history', JSON.stringify(history.slice(0, 30)));
        // حفظ السجل في قاعدة البيانات
        saveHistory(history.slice(0, 30));
      } else {
        setError(data.error || 'حدث خطأ أثناء التحليل');
      }
    } catch {
      setError('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // دالة لتصدير المفتاح كملف نصي
  function exportApiKey() {
    const blob = new Blob([apiKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gemini_api_key.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  // دالة لاستيراد المفتاح من ملف
  function importApiKey(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      if (typeof ev.target?.result === 'string') {
        setApiKey(ev.target.result.trim());
      }
    };
    reader.readAsText(file);
  }

  // إظهار النموذج مباشرة لأي مستخدم
  return (
    <div style={{
      fontFamily: 'Tajawal, Arial, sans-serif',
      direction: 'rtl',
      minHeight: '100vh',
      background: theme.background,
      color: theme.text,
      padding: 0,
      margin: 0,
      transition: 'background 0.4s',
    }}>
      {/* تنبيه في حال تعذر استخدام LocalStorage */}
      {localStorageError && (
        <div style={{background:'#fff0f0', color:'#e53e3e', borderRadius:8, padding:16, margin:'16px auto', maxWidth:500, textAlign:'center', fontWeight:700, fontSize:16, boxShadow:'0 1px 4px #e53e3e22'}}>
          ⚠️ لم يتمكن الموقع من حفظ مفتاح Gemini API على هذا الجهاز.<br/>
          قد يكون السبب أنك تستخدم وضع التصفح الخاص (Incognito/Private) أو متصفح لا يدعم LocalStorage.<br/>
          يرجى تجربة متصفح آخر أو الخروج من وضع التصفح الخاص.
        </div>
      )}
      {/* شريط علوي جديد */}
      <header style={{
        width: '100%',
        background: `linear-gradient(90deg, ${theme.accent2} 0%, ${theme.accent} 100%)`,
        color: '#fff',
        padding: isMobile() ? '16px 0 10px 0' : '18px 0 12px 0',
        marginBottom: 32,
        boxShadow: '0 2px 8px #0002',
        textAlign: 'center',
        letterSpacing: 1,
        fontWeight: 800,
        fontSize: isMobile() ? 22 : 26,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        display: 'block',
        position: 'relative',
      }}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap: isMobile() ? 10 : 14}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:12}}>
            <span style={{fontSize: isMobile() ? 26 : 30}}>⚖️</span>
            <span>منصة التحليل القانوني الذكي</span>
          </div>
          <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'center', gap:isMobile() ? 8 : 18, marginTop: isMobile() ? 2 : 6}}>
            {/* زر الوضع الليلي */}
            <button
              onClick={() => setDarkMode(dm => !dm)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: isMobile() ? 22 : 26, color: '#fff', outline: 'none',
                transition: 'color 0.2s',
                padding: 0,
              }}
              aria-label="تبديل الوضع الليلي"
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
            {/* رابط صفحة التعليمات */}
            <Link href="/about" style={{
              color: '#fff', background: '#4f46e5cc', borderRadius: 8, padding: isMobile() ? '4px 10px' : '4px 14px', fontWeight: 700, fontSize: isMobile() ? 14 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
            }}>؟ تعليمات</Link>
            {/* رابط سجل التحليل */}
            <Link href="/history" style={{
              color: '#fff', background: '#6366f1cc', borderRadius: 8, padding: isMobile() ? '4px 10px' : '4px 14px', fontWeight: 700, fontSize: isMobile() ? 14 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
            }}>📑 السجل</Link>
          </div>
        </div>
      </header>
      {/* إذا لم يكن المستخدم مسجلاً، عرض رسالة ترحيبية فقط */}
      {/* إزالة كود متعلق بالجلسة */}
      <main style={{
        maxWidth: 600,
        width: '100%',
        margin: '0 auto',
        padding: isMobile() ? '1rem 0.5rem' : '2rem 1rem',
      }}>
          {/* خانة مفتاح API */}
          <div style={{
            background: theme.card,
            borderRadius: 14,
            boxShadow: `0 2px 12px ${theme.shadow}`,
            padding: isMobile() ? 10 : 18,
            marginBottom: isMobile() ? 16 : 28,
            border: `1.5px solid ${theme.border}`,
            width: '100%',
            boxSizing: 'border-box',
          }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, color: theme.accent, fontSize: 16 }}>🔑 مفتاح Gemini API الخاص بك:</label>
            <input
              type="text"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="أدخل مفتاح Gemini API هنا..."
              style={{ width: '100%', borderRadius: 8, border: `1.5px solid ${theme.input}`, padding: isMobile() ? 8 : 12, fontSize: isMobile() ? 15 : 16, marginBottom: 0, outline: 'none', boxShadow: `0 1px 4px ${theme.shadow}`, background: darkMode ? '#181a2a' : '#fff', color: theme.text, transition: 'background 0.3s' }}
              dir="ltr"
              required
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button type="button" onClick={exportApiKey} style={{ background: theme.accent2, color: '#fff', border: 'none', borderRadius: 8, padding: isMobile() ? '6px 10px' : '8px 18px', fontWeight: 700, fontSize: isMobile() ? 14 : 15, cursor: 'pointer', boxShadow: `0 1px 4px ${theme.accent2}22` }}>⬇️ تصدير المفتاح</button>
              <label style={{ background: theme.accent, color: '#fff', borderRadius: 8, padding: isMobile() ? '6px 10px' : '8px 18px', fontWeight: 700, fontSize: isMobile() ? 14 : 15, cursor: 'pointer', boxShadow: `0 1px 4px ${theme.accent}22`, display: 'inline-block' }}>
                ⬆️ استيراد مفتاح
                <input type="file" accept=".txt" onChange={importApiKey} style={{ display: 'none' }} />
              </label>
            </div>
            <div style={{ color: '#888', fontSize: 13, marginTop: 6 }}>
              <span>يمكنك الحصول على المفتاح من <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{color:theme.accent, textDecoration:'underline'}}>Google AI Studio</a></span>
            </div>
          </div>
          {/* نموذج التحليل */}
          <form onSubmit={handleAnalyze} style={{
            background: theme.card,
            borderRadius: 14,
            boxShadow: `0 2px 12px ${theme.shadow}`,
            padding: 28,
            marginBottom: 28,
            border: `1.5px solid ${theme.border}`,
          }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, color: theme.accent, fontSize: 16 }}>📄 النص القانوني:</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={6}
              style={{ width: '100%', borderRadius: 8, border: `1.5px solid ${theme.input}`, padding: isMobile() ? 8 : 12, fontSize: isMobile() ? 15 : 16, marginBottom: 16, resize: 'vertical', outline: 'none', boxShadow: `0 1px 4px ${theme.shadow}`, background: darkMode ? '#181a2a' : '#fff', color: theme.text, transition: 'background 0.3s' }}
              placeholder="أدخل النص القانوني هنا..."
              required
            />
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, color: theme.accent, fontSize: 16 }}>🧩 اختر المرحلة:</label>
            <select
              value={stageIndex}
              onChange={e => setStageIndex(Number(e.target.value))}
              style={{ width: '100%', borderRadius: 8, border: `1.5px solid ${theme.input}`, padding: 12, fontSize: 16, marginBottom: 16, outline: 'none', boxShadow: `0 1px 4px ${theme.shadow}`, background: darkMode ? '#232946' : '#f5f7ff', color: theme.text, transition: 'background 0.3s' }}
            >
              {STAGES.map((stage, idx) => (
                <option key={stage} value={idx}>{stage}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', background: `linear-gradient(90deg, ${theme.accent2} 0%, ${theme.accent} 100%)`, color: '#fff', border: 'none', borderRadius: 8, padding: isMobile() ? '10px 0' : '14px 0', fontSize: isMobile() ? 16 : 19, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8, boxShadow: `0 2px 8px ${theme.accent}33`, letterSpacing: 1, transition: 'background 0.2s' }}
            >
              {loading ? '⏳ جاري التحليل...' : '🚀 ابدأ التحليل'}
            </button>
          </form>
          {/* رسائل الخطأ */}
          {error && <div style={{ color: theme.errorText, background: theme.errorBg, borderRadius: 8, padding: 16, marginBottom: 16, textAlign: 'center', fontWeight: 700, fontSize: 16, boxShadow: `0 1px 4px ${theme.errorText}22` }}>❌ {error}</div>}
          {/* نتيجة التحليل */}
          {result && (
            <div style={{
              background: theme.resultBg,
              borderRadius: 16,
              boxShadow: `0 2px 12px ${theme.shadow}`,
              padding: 28,
              marginBottom: 24,
              border: `1.5px solid ${theme.input}`,
              color: theme.text,
              opacity: showResult ? 1 : 0,
              transform: showResult ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.7s, transform 0.7s',
            }}>
              <h2 style={{ color: theme.accent, marginBottom: 16, fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>🔍 نتيجة التحليل</h2>
              <div style={{ whiteSpace: 'pre-line', fontSize: 17, lineHeight: 2 }}>{result}</div>
            </div>
          )}
          <footer style={{ textAlign: 'center', color: '#888', marginTop: 32, fontSize: 15 }}>
            &copy; {new Date().getFullYear()} منصة التحليل القانوني الذكي
          </footer>
        </main>
    </div>
  );
} 