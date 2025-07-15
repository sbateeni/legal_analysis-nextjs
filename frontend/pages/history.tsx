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
  resultBg: 'linear-gradient(135deg, #f5f7ff 0%, #e0e7ff 100%)',
};
const darkTheme = {
  background: 'linear-gradient(135deg, #232946 0%, #16161a 100%)',
  card: '#232946',
  border: '#393e5c',
  accent: '#a3a8f0',
  accent2: '#6366f1',
  text: '#f7f7fa',
  shadow: '#23294655',
  resultBg: 'linear-gradient(135deg, #232946 0%, #393e5c 100%)',
};

type AnalysisHistoryItem = {
  id: string;
  stageIndex: number;
  stage: string;
  input: string;
  output: string;
  date: string;
};

// تعريف نوع جديد للقضية
interface Case {
  id: string;
  name: string;
  createdAt: string;
  stages: AnalysisHistoryItem[];
}

function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 600;
}

export default function History() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? darkTheme : lightTheme;
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [editNameId, setEditNameId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState<string>('');

  // تحويل البيانات القديمة (history) إلى بنية قضايا عند أول تحميل
  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('legal_dark_mode') : null;
    if (savedTheme === '1') setDarkMode(true);
    const savedCases = typeof window !== 'undefined' ? localStorage.getItem('legal_cases') : null;
    if (savedCases) {
      setCases(JSON.parse(savedCases));
    } else {
      // تحويل البيانات القديمة
      const savedHistory = typeof window !== 'undefined' ? localStorage.getItem('legal_analysis_history') : null;
      if (savedHistory) {
        const history: AnalysisHistoryItem[] = JSON.parse(savedHistory);
        // تجميع التحليلات في قضايا حسب النص المدخل الأول (أو كل تحليل قضية منفصلة)
        const cases: Case[] = history.map((item, idx) => ({
          id: item.id,
          name: `قضية: ${item.input.split(' ').slice(0, 5).join(' ')}...`,
          createdAt: item.date,
          stages: [item],
        }));
        setCases(cases);
        localStorage.setItem('legal_cases', JSON.stringify(cases));
        localStorage.removeItem('legal_analysis_history');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('legal_cases', JSON.stringify(cases));
  }, [cases]);

  const handleDeleteCase = (id: string) => {
    setCases(cs => cs.filter(c => c.id !== id));
    if (selectedCaseId === id) setSelectedCaseId(null);
  };

  // واجهة القضايا
  return (
    <div style={{ fontFamily: 'Tajawal, Arial, sans-serif', direction: 'rtl', minHeight: '100vh', background: theme.background, color: theme.text, padding: 0, margin: 0, transition: 'background 0.4s' }}>
      <main style={{
        maxWidth: 900,
        width: '100%',
        margin: '0 auto',
        padding: isMobile() ? '1rem 0.5rem' : '2.5rem 1rem',
      }}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:18}}>
          <span style={{fontSize:32}}>📑</span>
          <h1 style={{ color: theme.accent, fontWeight: 900, fontSize: 28, margin: 0, letterSpacing: 1 }}>قائمة القضايا</h1>
        </div>
        {cases.length === 0 ? (
          <div style={{textAlign:'center', color:theme.accent2, fontSize:18, marginTop:40}}>لا يوجد قضايا محفوظة بعد.</div>
        ) : selectedCaseId ? (
          // تفاصيل القضية المختارة
          <div style={{marginBottom:32}}>
            <button onClick={() => setSelectedCaseId(null)} style={{marginBottom:18, background:theme.accent2, color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontWeight:700, fontSize:16, cursor:'pointer', boxShadow:'0 1px 4px #6366f122'}}>← العودة للقضايا</button>
            {cases.filter(c => c.id === selectedCaseId).map(c => (
              <div key={c.id} style={{background:theme.card, borderRadius:16, boxShadow:`0 2px 12px ${theme.shadow}`, border:`1.5px solid ${theme.border}`, padding:isMobile()?12:24, marginBottom:18}}>
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
                  {editNameId === c.id ? (
                    <>
                      <input
                        type="text"
                        value={editNameValue}
                        onChange={e => setEditNameValue(e.target.value)}
                        style={{fontWeight:800, fontSize:22, color:theme.accent, border:'1px solid '+theme.accent2, borderRadius:8, padding:'4px 10px', outline:'none', width: isMobile() ? 180 : 320}}
                      />
                      <button onClick={() => {
                        setCases(cs => cs.map(cc => cc.id === c.id ? {...cc, name: editNameValue} : cc));
                        setEditNameId(null);
                      }} style={{background:theme.accent2, color:'#fff', border:'none', borderRadius:8, padding:'6px 14px', fontWeight:700, fontSize:15, cursor:'pointer'}}>حفظ</button>
                      <button onClick={() => setEditNameId(null)} style={{background:'#eee', color:theme.accent2, border:'none', borderRadius:8, padding:'6px 14px', fontWeight:700, fontSize:15, cursor:'pointer'}}>إلغاء</button>
                    </>
                  ) : (
                    <>
                      <span style={{fontWeight:800, fontSize:22, color:theme.accent}}>{c.name}</span>
                      <button onClick={() => {setEditNameId(c.id); setEditNameValue(c.name);}} style={{background:theme.accent2, color:'#fff', border:'none', borderRadius:8, padding:'5px 12px', fontWeight:700, fontSize:14, cursor:'pointer'}}>تعديل الاسم</button>
                    </>
                  )}
                </div>
                <div style={{fontSize:15, color:'#888', marginBottom:18}}>تاريخ الإنشاء: {new Date(c.createdAt).toLocaleString('ar-EG')}</div>
                <div style={{display:'flex', flexDirection:'column', gap:18}}>
                  {c.stages.map((stage, idx) => (
                    <div key={stage.id} style={{background:theme.resultBg, borderRadius:12, boxShadow:`0 1px 6px ${theme.shadow}`, border:`1px solid ${theme.border}`, padding:isMobile()?10:18}}>
                      <div style={{color:theme.accent2, fontWeight:700, fontSize:17, marginBottom:6}}><span style={{fontSize:18}}>🧩</span> {STAGES[stage.stageIndex]}</div>
                      <div style={{fontWeight:600, color:theme.accent, marginBottom:4}}>النص المدخل:</div>
                      <div style={{background:darkMode?'#181a2a':'#f5f7ff', borderRadius:8, padding:'8px 12px', fontSize:16, whiteSpace:'pre-line', border:`1px solid ${theme.border}`, marginBottom:8}}>{stage.input}</div>
                      <div style={{fontWeight:600, color:theme.accent, marginBottom:4}}>مخرجات التحليل:</div>
                      <div style={{background:darkMode?'#181a2a':'#f5f7ff', borderRadius:8, padding:'8px 12px', fontSize:16, whiteSpace:'pre-line', border:`1px solid ${theme.border}`}}>{stage.output}</div>
                      <div style={{fontSize:13, color:'#888', marginTop:6}}>تاريخ المرحلة: {new Date(stage.date).toLocaleString('ar-EG')}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleDeleteCase(c.id)} style={{marginTop:18, background:'#ff6b6b', color:'#fff', border:'none', borderRadius:8, padding:isMobile()?'7px 14px':'8px 22px', fontWeight:700, fontSize:isMobile()?14:16, cursor:'pointer', boxShadow:'0 1px 4px #ff6b6b33', transition:'background 0.2s'}}>حذف القضية</button>
              </div>
            ))}
          </div>
        ) : (
          // عرض القضايا في مربعات
          <div style={{display:'flex', flexWrap:'wrap', gap:24, justifyContent:'center'}}>
            {cases.map(c => (
              <div key={c.id} style={{background:theme.card, borderRadius:16, boxShadow:`0 2px 12px ${theme.shadow}`, border:`1.5px solid ${theme.border}`, padding:isMobile()?12:24, width: isMobile() ? '100%' : 340, cursor:'pointer', transition:'box-shadow 0.2s', position:'relative'}} onClick={() => setSelectedCaseId(c.id)}>
                <div style={{fontWeight:800, fontSize:20, color:theme.accent, marginBottom:8}}>{c.name}</div>
                <div style={{fontSize:14, color:'#888', marginBottom:10}}>تاريخ الإنشاء: {new Date(c.createdAt).toLocaleString('ar-EG')}</div>
                <div style={{fontSize:15, color:theme.accent2}}>عدد المراحل: {c.stages.length}</div>
                <button onClick={e => {e.stopPropagation(); handleDeleteCase(c.id);}} style={{position:'absolute', left:18, top:18, background:'#ff6b6b', color:'#fff', border:'none', borderRadius:8, padding:isMobile()?'5px 10px':'6px 16px', fontWeight:700, fontSize:isMobile()?13:15, cursor:'pointer', boxShadow:'0 1px 4px #ff6b6b33', transition:'background 0.2s'}}>حذف</button>
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