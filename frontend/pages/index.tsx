import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
// إزالة استيراد useSession, signIn, signOut
import { saveApiKey, loadApiKey, addCase, getAllCases, clearAllCases } from '../utils/db';
import { set as idbSet, get as idbGet } from 'idb-keyval';

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

const FINAL_STAGE = 'المرحلة الثالثة عشرة: العريضة القانونية النهائية';
const ALL_STAGES = [...STAGES, FINAL_STAGE];

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

// أضف دالة تساعد في معرفة إذا كان العرض صغير (جوال)
function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 600;
}

// تعريف نوع المرحلة التحليلية (للاستخدام في التايب)
type AnalysisHistoryItem = {
  id: string;
  stageIndex: number;
  stage: string;
  input: string;
  output: string;
  date: string;
};

export default function Home() {
  // إزالة كل كود متعلق بالجلسة أو زر تسجيل الدخول/الخروج
  const [apiKey, setApiKey] = useState('');
  const [caseNameInput, setCaseNameInput] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const prevApiKey = useRef("");
  // const router = useRouter();

  // لكل مرحلة: نص، نتيجة، تحميل، خطأ، إظهار نتيجة
  // مربع نص واحد فقط
  const [mainText, setMainText] = useState('');
  const [stageResults, setStageResults] = useState<(string|null)[]>(() => Array(ALL_STAGES.length).fill(null));
  const [stageLoading, setStageLoading] = useState<boolean[]>(() => Array(ALL_STAGES.length).fill(false));
  const [stageErrors, setStageErrors] = useState<(string|null)[]>(() => Array(ALL_STAGES.length).fill(null));
  const [stageShowResult, setStageShowResult] = useState<boolean[]>(() => Array(ALL_STAGES.length).fill(false));

  // حالة العريضة النهائية
  const [finalPetitionLoading, setFinalPetitionLoading] = useState(false);
  const [finalPetitionError, setFinalPetitionError] = useState<string|null>(null);
  const [finalPetitionResult, setFinalPetitionResult] = useState<string|null>(null);

  const theme = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    // تحميل مفتاح API من قاعدة البيانات عند بدء التشغيل
    loadApiKey().then(val => {
      if (val) setApiKey(val);
    });
    // حفظ واسترجاع الوضع الليلي من IndexedDB
    idbGet('legal_dark_mode').then((savedTheme) => {
      if (savedTheme === '1') setDarkMode(true);
    });
  }, []);

  useEffect(() => {
    // حفظ مفتاح API في قاعدة البيانات عند تغييره
    if (apiKey) saveApiKey(apiKey);
  }, [apiKey]);

  useEffect(() => {
    idbSet('legal_dark_mode', darkMode ? '1' : '0');
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

  // دالة تحليل مرحلة واحدة
  const handleAnalyzeStage = async (idx: number) => {
    // إذا كانت المرحلة الأخيرة (العريضة النهائية)
    if (idx === ALL_STAGES.length - 1) {
      setStageLoading(arr => arr.map((v, i) => i === idx ? true : v));
      setStageErrors(arr => arr.map((v, i) => i === idx ? null : v));
      setStageResults(arr => arr.map((v, i) => i === idx ? null : v));
      setStageShowResult(arr => arr.map((v, i) => i === idx ? false : v));
      if (!apiKey) {
        setStageErrors(arr => arr.map((v, i) => i === idx ? 'يرجى إدخال مفتاح Gemini API الخاص بك أولاً.' : v));
        setStageLoading(arr => arr.map((v, i) => i === idx ? false : v));
        return;
      }
      const summaries = stageResults.slice(0, idx).filter(r => !!r);
      if (summaries.length === 0) {
        setStageErrors(arr => arr.map((v, i) => i === idx ? 'يرجى تحليل المراحل أولاً قبل توليد العريضة النهائية.' : v));
        setStageLoading(arr => arr.map((v, i) => i === idx ? false : v));
        return;
      }
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: mainText, stageIndex: -1, apiKey, previousSummaries: summaries, finalPetition: true }),
        });
        const data = await res.json();
        if (res.ok) {
          setStageResults(arr => arr.map((v, i) => i === idx ? data.analysis : v));
          setTimeout(() => setStageShowResult(arr => arr.map((v, i) => i === idx ? true : v)), 100);
        } else {
          setStageErrors(arr => arr.map((v, i) => i === idx ? (data.error || 'حدث خطأ أثناء توليد العريضة النهائية') : v));
        }
      } catch {
        setStageErrors(arr => arr.map((v, i) => i === idx ? 'تعذر الاتصال بالخادم' : v));
      } finally {
        setStageLoading(arr => arr.map((v, i) => i === idx ? false : v));
      }
      return;
    }
    setStageLoading(arr => arr.map((v, i) => i === idx ? true : v));
    setStageErrors(arr => arr.map((v, i) => i === idx ? null : v));
    setStageResults(arr => arr.map((v, i) => i === idx ? null : v));
    setStageShowResult(arr => arr.map((v, i) => i === idx ? false : v));
    if (!apiKey) {
      setStageErrors(arr => arr.map((v, i) => i === idx ? 'يرجى إدخال مفتاح Gemini API الخاص بك أولاً.' : v));
      setStageLoading(arr => arr.map((v, i) => i === idx ? false : v));
      return;
    }
    const text = mainText;
    if (!text.trim()) {
      setStageErrors(arr => arr.map((v, i) => i === idx ? 'يرجى إدخال تفاصيل القضية.' : v));
      setStageLoading(arr => arr.map((v, i) => i === idx ? false : v));
      return;
    }
    // جمع ملخصات المراحل السابقة (النتائج غير الفارغة فقط)
    // منطق تراكمي: كل مرحلة تعتمد على جميع النتائج السابقة (حتى الفارغة، لكن يمكن تجاهل الفارغة)
    let previousSummaries = stageResults.slice(0, idx).filter(r => !!r);
    // حدود الطول (تقريبي: 8000 tokens ≈ 24,000 حرف)
    const MAX_CHARS = 24000;
    let totalLength = previousSummaries.reduce((acc, cur) => acc + (cur?.length || 0), 0);
    // إذا تجاوز الطول، احذف أقدم النتائج حتى لا يتجاوز الحد
    while (totalLength > MAX_CHARS && previousSummaries.length > 1) {
      previousSummaries = previousSummaries.slice(1);
      totalLength = previousSummaries.reduce((acc, cur) => acc + (cur?.length || 0), 0);
    }
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, stageIndex: idx, apiKey, previousSummaries }),
      });
      const data = await res.json();
      if (res.ok) {
        setStageResults(arr => arr.map((v, i) => i === idx ? data.analysis : v));
        setTimeout(() => setStageShowResult(arr => arr.map((v, i) => i === idx ? true : v)), 100);
        // حفظ التحليل في نفس القضية
        const caseName = caseNameInput.trim() ? caseNameInput.trim() : `قضية بدون اسم - ${Date.now()}`;
        const newStage = {
          id: `${idx}-${btoa(unescape(encodeURIComponent(text))).slice(0,8)}-${Date.now()}`,
          stageIndex: idx,
          stage: ALL_STAGES[idx],
          input: text,
          output: data.analysis,
          date: new Date().toISOString(),
        };
        let newCaseId = `${caseName}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
        // أضف القضية مباشرة عبر دالة addCase
        await addCase({
          id: newCaseId,
          name: caseName,
          createdAt: newStage.date,
          stages: [newStage],
        });
      } else {
        if (data.error && data.error.includes('429')) {
          setStageErrors(arr => arr.map((v, i) => i === idx ? 'لقد تجاوزت الحد المسموح به لعدد الطلبات على خدمة Gemini API. يرجى الانتظار دقيقة ثم إعادة المحاولة. إذا تكررت المشكلة، استخدم مفتاح API آخر أو راجع إعدادات حسابك في Google AI Studio.' : v));
        } else {
          setStageErrors(arr => arr.map((v, i) => i === idx ? (data.error || 'حدث خطأ أثناء التحليل') : v));
        }
      }
    } catch {
      setStageErrors(arr => arr.map((v, i) => i === idx ? 'تعذر الاتصال بالخادم' : v));
    } finally {
      setStageLoading(arr => arr.map((v, i) => i === idx ? false : v));
    }
  };

  // دالة توليد العريضة النهائية
  const handleGenerateFinalPetition = async () => {
    setFinalPetitionLoading(true);
    setFinalPetitionError(null);
    setFinalPetitionResult(null);
    if (!apiKey) {
      setFinalPetitionError('يرجى إدخال مفتاح Gemini API الخاص بك أولاً.');
      setFinalPetitionLoading(false);
      return;
    }
    const summaries = stageResults.filter(r => !!r);
    if (summaries.length === 0) {
      setFinalPetitionError('يرجى تحليل المراحل أولاً قبل توليد العريضة النهائية.');
      setFinalPetitionLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: mainText, stageIndex: -1, apiKey, previousSummaries: summaries, finalPetition: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setFinalPetitionResult(data.analysis);
        // إضافة العريضة النهائية كمرحلة خاصة في آخر قضية محفوظة
        try {
          let cases = await getAllCases();
          if (cases.length > 0) {
            const lastCaseIdx = 0; // أحدث قضية في الأعلى
            const finalStage = {
              id: `final-${Date.now()}`,
              stageIndex: 999,
              stage: FINAL_STAGE,
              input: mainText,
              output: data.analysis,
              date: new Date().toISOString(),
            };
            // تحقق من عدم وجود عريضة نهائية مكررة
            if (!cases[lastCaseIdx].stages.some((s: AnalysisHistoryItem) => s.stageIndex === 999)) {
              cases[lastCaseIdx].stages.push(finalStage);
              await idbSet('legal_cases', JSON.stringify(cases));
            }
          }
        } catch {}
      } else {
        setFinalPetitionError(data.error || 'حدث خطأ أثناء توليد العريضة النهائية');
      }
    } catch {
      setFinalPetitionError('تعذر الاتصال بالخادم');
    } finally {
      setFinalPetitionLoading(false);
    }
  };

  // إظهار النموذج مباشرة لأي مستخدم
  return (
    <>
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
        {/* حذف كل كود أو رسالة متعلقة بـ localStorageError أو تنبيه localStorage */}
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
          <nav style={{display:'flex', flexDirection:'column', alignItems:'center', gap: isMobile() ? 10 : 14}}>
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
              {/* روابط التنقل */}
              <Link href="/about" style={{
                color: '#fff', background: '#4f46e5cc', borderRadius: 8, padding: isMobile() ? '4px 10px' : '4px 14px', fontWeight: 700, fontSize: isMobile() ? 14 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
              }}>؟ تعليمات</Link>
              <Link href="/history" style={{
                color: '#fff', background: '#6366f1cc', borderRadius: 8, padding: isMobile() ? '4px 10px' : '4px 14px', fontWeight: 700, fontSize: isMobile() ? 14 : 16, textDecoration: 'none', boxShadow: '0 1px 4px #0002', letterSpacing: 1, transition: 'background 0.2s',
              }}>📑 قائمة القضايا</Link>
            </div>
          </nav>
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
              <div style={{ color: '#888', fontSize: 13, marginTop: 6 }}>
                <span>يمكنك الحصول على المفتاح من <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{color:theme.accent, textDecoration:'underline'}}>Google AI Studio</a></span>
              </div>
            </div>
            {/* مربع نص واحد لتفاصيل القضية */}
            <div style={{
              background: theme.card,
              borderRadius: 14,
              boxShadow: `0 2px 12px ${theme.shadow}`,
              padding: isMobile() ? 12 : 22,
              marginBottom: 28,
              border: `1.5px solid ${theme.border}`,
            }}>
              {/* مربع إدخال اسم القضية في رأس مربع التفاصيل */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, color: theme.accent2, fontSize: 15 }}>📛 اسم القضية:</label>
                <input
                  type="text"
                  value={caseNameInput}
                  onChange={e => setCaseNameInput(e.target.value)}
                  placeholder="أدخل اسم القضية (مثال: قضية إيجار 2024)"
                  style={{ width: '100%', borderRadius: 8, border: `1.5px solid ${theme.input}`, padding: isMobile() ? 8 : 12, fontSize: isMobile() ? 15 : 16, marginBottom: 0, outline: 'none', boxShadow: `0 1px 4px ${theme.shadow}`, background: darkMode ? '#181a2a' : '#fff', color: theme.text, transition: 'background 0.3s' }}
                  required
                />
              </div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, color: theme.accent, fontSize: 16 }}>📄 تفاصيل القضية:</label>
              <textarea
                value={mainText}
                onChange={e => setMainText(e.target.value)}
                rows={6}
                style={{ width: '100%', borderRadius: 8, border: `1.5px solid ${theme.input}`, padding: isMobile() ? 8 : 12, fontSize: isMobile() ? 15 : 16, marginBottom: 0, resize: 'vertical', outline: 'none', boxShadow: `0 1px 4px ${theme.shadow}`, background: darkMode ? '#181a2a' : '#fff', color: theme.text, transition: 'background 0.3s' }}
                placeholder="أدخل تفاصيل القضية هنا..."
                required
              />
            </div>
            {/* عرض جميع المراحل */}
            {ALL_STAGES.map((stage, idx) => (
              <div key={stage} style={{
                background: theme.card,
                borderRadius: 14,
                boxShadow: `0 2px 12px ${theme.shadow}`,
                padding: isMobile() ? 12 : 22,
                marginBottom: 28,
                border: `1.5px solid ${theme.border}`,
              }}>
                <div style={{ fontWeight: 800, color: theme.accent, fontSize: 18, marginBottom: 8 }}>{stage}</div>
                {/* ملخص التحليل السابق */}
                {idx > 0 && stageResults[idx-1] && (
                  <div style={{
                    background: theme.resultBg,
                    borderRadius: 8,
                    boxShadow: `0 1px 4px ${theme.shadow}`,
                    padding: 10,
                    marginBottom: 10,
                    border: `1px solid ${theme.input}`,
                    color: theme.text,
                    fontSize: 15,
                    opacity: 0.95,
                  }}>
                    <b>ملخص المرحلة السابقة:</b>
                    <div style={{ whiteSpace: 'pre-line', marginTop: 4 }}>{stageResults[idx-1]}</div>
                  </div>
                )}
                {/* إذا كانت المرحلة الأخيرة، غير نص الزر */}
                <button
                  type="button"
                  disabled={stageLoading[idx]}
                  onClick={() => handleAnalyzeStage(idx)}
                  style={{ width: '100%', background: `linear-gradient(90deg, ${theme.accent2} 0%, ${theme.accent} 100%)`, color: '#fff', border: 'none', borderRadius: 8, padding: isMobile() ? '10px 0' : '14px 0', fontSize: isMobile() ? 16 : 19, fontWeight: 800, cursor: stageLoading[idx] ? 'not-allowed' : 'pointer', marginTop: 8, boxShadow: `0 2px 8px ${theme.accent}33`, letterSpacing: 1, transition: 'background 0.2s', position:'relative' }}
                >
                  {stageLoading[idx] ? (
                    <span style={{display:'inline-flex', alignItems:'center', gap:8}}>
                      <span className="spinner" style={{display:'inline-block', width:20, height:20, border:'3px solid #fff', borderTop:`3px solid ${theme.accent2}`, borderRadius:'50%', animation:'spin 1s linear infinite', verticalAlign:'middle'}}></span>
                      {idx === ALL_STAGES.length - 1 ? '⏳ جاري توليد العريضة النهائية...' : '⏳ جاري التحليل...'}
                    </span>
                  ) : (
                    idx === ALL_STAGES.length - 1 ? '📜 توليد العريضة القانونية النهائية' : `📜 تحليل ${stage}`
                  )}
                </button>
                {stageErrors[idx] && <div style={{ color: theme.errorText, background: theme.errorBg, borderRadius: 8, padding: 12, marginTop: 12, textAlign: 'center', fontWeight: 700, fontSize: 15, boxShadow: `0 1px 4px ${theme.errorText}22` }}>❌ {stageErrors[idx]}</div>}
                {stageResults[idx] && (
                  <div style={{
                    background: theme.resultBg,
                    borderRadius: 12,
                    boxShadow: `0 2px 12px ${theme.shadow}`,
                    padding: 18,
                    marginTop: 16,
                    border: `1.5px solid ${theme.input}`,
                    color: theme.text,
                    opacity: stageShowResult[idx] ? 1 : 0,
                    transform: stageShowResult[idx] ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'opacity 0.7s, transform 0.7s',
                  }}>
                    <h3 style={{ color: theme.accent, marginBottom: 10, fontSize: 17, fontWeight: 800, letterSpacing: 1 }}>🔍 نتيجة التحليل</h3>
                    <div style={{ whiteSpace: 'pre-line', fontSize: 16, lineHeight: 2 }}>{stageResults[idx]}</div>
                  </div>
                )}
              </div>
            ))}
            <footer style={{ textAlign: 'center', color: '#888', marginTop: 32, fontSize: 15 }}>
              &copy; {new Date().getFullYear()} منصة التحليل القانوني الذكي
              <div style={{marginTop:18, background:'#fffbe6', color:'#b7791f', borderRadius:8, padding:'10px 18px', display:'inline-block', fontWeight:700, fontSize:14, boxShadow:'0 1px 4px #b7791f22'}}>
                ⚠️ جميع بياناتك (القضايا والمفاتيح) تحفظ محليًا على جهازك فقط ولا يتم رفعها إلى أي خادم.
                <button onClick={async () => { await clearAllCases(); await idbSet('legal_dark_mode', '0'); window.location.reload(); }} style={{marginRight:12, background:'#ff6b6b', color:'#fff', border:'none', borderRadius:8, padding:'6px 16px', fontWeight:800, fontSize:14, cursor:'pointer', boxShadow:'0 1px 4px #ff6b6b22', marginLeft:8}}>مسح كل البيانات</button>
              </div>
            </footer>
          </main>
      </div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
      `}</style>
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
    </>
  );
} 