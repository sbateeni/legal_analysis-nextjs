import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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

type AnalysisHistoryItem = {
  id: string;
  stageIndex: number;
  stage: string;
  input: string;
  output: string;
  date: string;
};

export default function History() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? darkTheme : lightTheme;
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('legal_dark_mode') : null;
    if (savedTheme === '1') setDarkMode(true);
    const savedHistory = typeof window !== 'undefined' ? localStorage.getItem('legal_analysis_history') : null;
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('legal_analysis_history', JSON.stringify(history));
  }, [history]);

  const handleDelete = (id: string) => {
    setHistory(h => h.filter(item => item.id !== id));
  };

  return (
    <div style={{ fontFamily: 'Tajawal, Arial, sans-serif', direction: 'rtl', minHeight: '100vh', background: theme.background, color: theme.text, padding: 0, margin: 0, transition: 'background 0.4s' }}>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2.5rem 1rem' }}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:18}}>
          <span style={{fontSize:32}}>📑</span>
          <h1 style={{ color: theme.accent, fontWeight: 900, fontSize: 28, margin: 0, letterSpacing: 1 }}>سجل مراحل التحليل</h1>
        </div>
        {history.length === 0 ? (
          <div style={{textAlign:'center', color:theme.accent2, fontSize:18, marginTop:40}}>لا يوجد تحليلات محفوظة بعد.</div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:24}}>
            {history.map(item => (
              <div key={item.id} style={{ background: theme.card, borderRadius: 16, boxShadow: `0 2px 12px ${theme.shadow}`, border: `1.5px solid ${theme.border}`, padding: 24, position:'relative', transition:'box-shadow 0.2s' }}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
                  <div style={{color:theme.accent2, fontWeight:700, fontSize:17}}>
                    <span style={{fontSize:20}}>🧩</span> {STAGES[item.stageIndex]}
                  </div>
                  <div style={{fontSize:14, color:'#888'}}>{new Date(item.date).toLocaleString('ar-EG')}</div>
                </div>
                <div style={{marginBottom:10}}>
                  <span style={{fontWeight:600, color:theme.accent}}>النص المدخل:</span>
                  <div style={{background:darkMode?'#181a2a':'#f5f7ff', borderRadius:8, padding:'8px 12px', marginTop:4, fontSize:16, whiteSpace:'pre-line', border:`1px solid ${theme.border}`}}>{item.input}</div>
                </div>
                <div style={{marginBottom:10}}>
                  <span style={{fontWeight:600, color:theme.accent}}>مخرجات التحليل:</span>
                  <div style={{background:darkMode?'#181a2a':'#f5f7ff', borderRadius:8, padding:'8px 12px', marginTop:4, fontSize:16, whiteSpace:'pre-line', border:`1px solid ${theme.border}`}}>{item.output}</div>
                </div>
                <button onClick={() => handleDelete(item.id)} style={{position:'absolute', left:18, top:18, background:'#ff6b6b', color:'#fff', border:'none', borderRadius:8, padding:'6px 16px', fontWeight:700, fontSize:15, cursor:'pointer', boxShadow:'0 1px 4px #ff6b6b33', transition:'background 0.2s'}}>حذف</button>
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', color: theme.accent2, fontSize: 16, marginTop: 32 }}>
          &larr; <Link href="/" style={{color:theme.accent, textDecoration:'underline', fontWeight:700}}>العودة للصفحة الرئيسية</Link>
        </div>
      </main>
    </div>
  );
} 