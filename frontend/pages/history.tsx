import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { saveCases, loadCases } from '../utils/db';

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

// تعريف نوع جديد للمحادثة
interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  date: string;
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
  // بحث عن القضايا
  const [search, setSearch] = useState('');
  // إضافة مرحلة جديدة
  const [addStageId, setAddStageId] = useState<string | null>(null);
  const [newStageIndex, setNewStageIndex] = useState<number>(0);
  const [newStageInput, setNewStageInput] = useState<string>('');
  const [addingStage, setAddingStage] = useState(false);

  // تحويل البيانات القديمة (history) إلى بنية قضايا عند أول تحميل
  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('legal_dark_mode') : null;
    if (savedTheme === '1') setDarkMode(true);
    // جلب القضايا من IndexedDB فقط
    loadCases().then(dbCases => {
      if (dbCases && dbCases.length > 0) {
        // تأكد أن كل قضية تحتوي على مصفوفة chats
        setCases(dbCases.map(c => ({ ...c, chats: c.chats || [] })));
      } else {
        // تحويل البيانات القديمة (مرة واحدة فقط)
        const savedHistory = typeof window !== 'undefined' ? localStorage.getItem('legal_analysis_history') : null;
        if (savedHistory) {
          const history: AnalysisHistoryItem[] = JSON.parse(savedHistory);
          const cases: Case[] = history.map((item) => ({
            id: item.id,
            name: `قضية: ${item.input.split(' ').slice(0, 5).join(' ')}...`,
            createdAt: item.date,
            stages: [item],
          }));
          setCases(cases);
          saveCases(cases);
          localStorage.removeItem('legal_analysis_history');
        }
      }
    });
  }, []);

  useEffect(() => {
    saveCases(cases);
  }, [cases]);

  const handleDeleteCase = (id: string) => {
    setCases(cs => cs.filter(c => c.id !== id));
    if (selectedCaseId === id) setSelectedCaseId(null);
  };

  // حذف مرحلة من قضية
  const handleDeleteStage = (caseId: string, stageId: string) => {
    setCases(cs => cs.map(c => c.id === caseId ? {
      ...c,
      stages: c.stages.filter(s => s.id !== stageId)
    } : c));
  };

  // تصدير القضايا كملف JSON
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(cases, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'legal_cases.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // استيراد القضايا من ملف JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      if (typeof ev.target?.result === 'string') {
        try {
          const imported = JSON.parse(ev.target.result);
          if (Array.isArray(imported)) {
            // دمج القضايا (مع استبعاد التكرار حسب id)
            const merged = [...cases];
            imported.forEach((c: Case) => {
              if (!merged.some(cc => cc.id === c.id)) merged.push(c);
            });
            setCases(merged);
          } else {
            alert('صيغة الملف غير صحيحة!');
          }
        } catch {
          alert('فشل في قراءة الملف!');
        }
      }
    };
    reader.readAsText(file);
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
        {/* أزرار التصدير والاستيراد + البحث */}
        <div style={{display:'flex', flexDirection: isMobile() ? 'column' : 'row', gap:14, justifyContent:'center', alignItems:'center', marginBottom:18}}>
          <button onClick={handleExport} style={{background:`linear-gradient(90deg, ${theme.accent2} 0%, ${theme.accent} 100%)`, color:'#fff', border:'none', borderRadius:8, padding:'10px 22px', fontWeight:800, fontSize:16, cursor:'pointer', boxShadow:'0 2px 8px #4f46e522', letterSpacing:1, transition:'background 0.2s'}}>⬇️ تصدير القضايا</button>
          <label style={{background:`linear-gradient(90deg, ${theme.accent} 0%, ${theme.accent2} 100%)`, color:'#fff', borderRadius:8, padding:'10px 22px', fontWeight:800, fontSize:16, cursor:'pointer', boxShadow:'0 2px 8px #6366f122', display:'inline-block', letterSpacing:1, transition:'background 0.2s'}}>
            ⬆️ استيراد قضايا
            <input type="file" accept="application/json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 ابحث عن قضية..." style={{flex:1, minWidth:180, maxWidth:320, borderRadius:8, border:`1.5px solid ${theme.accent2}`, padding:'10px 14px', fontSize:15, outline:'none', background:darkMode?'#232946':'#fff', color:theme.text, boxShadow:'0 1px 4px #6366f122'}} />
        </div>
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
                  {c.stages.map((stage) => (
                    <div key={stage.id} style={{background:theme.resultBg, borderRadius:12, boxShadow:`0 1px 6px ${theme.shadow}`, border:`1px solid ${theme.border}`, padding:isMobile()?10:18, position:'relative'}}>
                      <div style={{color:theme.accent2, fontWeight:700, fontSize:17, marginBottom:6}}><span style={{fontSize:18}}>🧩</span> {STAGES[stage.stageIndex]}</div>
                      <div style={{fontWeight:600, color:theme.accent, marginBottom:4}}>النص المدخل:</div>
                      <div style={{background:darkMode?'#181a2a':'#f5f7ff', borderRadius:8, padding:'8px 12px', fontSize:16, whiteSpace:'pre-line', border:`1px solid ${theme.border}`, marginBottom:8}}>{stage.input}</div>
                      <div style={{fontWeight:600, color:theme.accent, marginBottom:4}}>مخرجات التحليل:</div>
                      <div style={{background:darkMode?'#181a2a':'#f5f7ff', borderRadius:8, padding:'8px 12px', fontSize:16, whiteSpace:'pre-line', border:`1px solid ${theme.border}`}}>{stage.output}</div>
                      <div style={{fontSize:13, color:'#888', marginTop:6}}>تاريخ المرحلة: {new Date(stage.date).toLocaleString('ar-EG')}</div>
                      <button onClick={() => handleDeleteStage(c.id, stage.id)} style={{position:'absolute', left:14, top:14, background:'#ff6b6b', color:'#fff', border:'none', borderRadius:8, padding:isMobile()?'4px 8px':'5px 12px', fontWeight:700, fontSize:isMobile()?12:14, cursor:'pointer', boxShadow:'0 1px 4px #ff6b6b33', transition:'background 0.2s'}}>حذف المرحلة</button>
                    </div>
                  ))}
                  {/* واجهة المحادثة */}
                  <ChatBox caseObj={c} setCases={setCases} theme={theme} darkMode={darkMode} />
                </div>
                <button onClick={() => handleDeleteCase(c.id)} style={{marginTop:18, background:'#ff6b6b', color:'#fff', border:'none', borderRadius:8, padding:isMobile()?'7px 14px':'8px 22px', fontWeight:700, fontSize:isMobile()?14:16, cursor:'pointer', boxShadow:'0 1px 4px #ff6b6b33', transition:'background 0.2s'}}>حذف القضية</button>
              </div>
            ))}
          </div>
        ) : (
          // عرض القضايا في مربعات
          <div style={{display:'flex', flexWrap:'wrap', gap:24, justifyContent:'center'}}>
            {cases.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(c => (
              <div key={c.id} style={{background:theme.card, borderRadius:16, boxShadow:`0 2px 12px ${theme.shadow}`, border:`1.5px solid ${theme.border}`, padding:isMobile()?12:24, width: isMobile() ? '100%' : 340, cursor:'pointer', transition:'box-shadow 0.2s', position:'relative'}} onClick={() => setSelectedCaseId(c.id)}>
                <div style={{fontWeight:800, fontSize:20, color:theme.accent, marginBottom:8}}>{c.name}</div>
                <div style={{fontSize:14, color:'#888', marginBottom:10}}>تاريخ الإنشاء: {new Date(c.createdAt).toLocaleString('ar-EG')}</div>
                <div style={{fontSize:15, color:theme.accent2}}>عدد المراحل: {c.stages.length}</div>
                <button onClick={e => {e.stopPropagation(); handleDeleteCase(c.id);}} style={{position:'absolute', left:18, top:18, background:`linear-gradient(90deg, #ff6b6b 0%, #ffb6b6 100%)`, color:'#fff', border:'none', borderRadius:8, padding:isMobile()?'7px 14px':'8px 18px', fontWeight:800, fontSize:isMobile()?14:16, cursor:'pointer', boxShadow:'0 1px 4px #ff6b6b33', transition:'background 0.2s'}}>حذف</button>
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', color: theme.accent2, fontSize: 16, marginTop: 32 }}>
          <button onClick={()=>setSelectedCaseId(null)} style={{background:`linear-gradient(90deg, ${theme.accent2} 0%, ${theme.accent} 100%)`, color:'#fff', border:'none', borderRadius:8, padding:'8px 22px', fontWeight:800, fontSize:16, cursor:'pointer', boxShadow:'0 2px 8px #6366f122', marginBottom:10, letterSpacing:1, transition:'background 0.2s'}}>← العودة للصفحة الرئيسية</button>
        </div>
      </main>
    </div>
  );
}

function ChatBox({ caseObj, setCases, theme, darkMode }: { caseObj: any, setCases: any, theme: any, darkMode: boolean }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [localApiKey, setLocalApiKey] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalApiKey(window.localStorage.getItem('gemini_api_key') || '');
    }
  }, []);
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!input.trim()) return;
    if (!localApiKey) { setError('يرجى إدخال مفتاح Gemini API في الصفحة الرئيسية أولاً.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, stageIndex: 0, apiKey: localApiKey }),
      });
      const data = await res.json();
      if (res.ok) {
        const newMsg = {
          id: Math.random().toString(36).slice(2),
          question: input,
          answer: data.analysis,
          date: new Date().toISOString(),
        };
        setCases((prev: any) => prev.map((c: any) => c.id === caseObj.id ? { ...c, chats: [...(c.chats||[]), newMsg] } : c));
        setInput('');
      } else {
        setError(data.error || 'حدث خطأ أثناء التحليل');
      }
    } catch {
      setError('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{marginTop:18, background:darkMode?'#181a2a':'#f5f7ff', borderRadius:12, border:`1px solid ${theme.border}`, padding:14}}>
      <div style={{fontWeight:700, color:theme.accent, marginBottom:8, fontSize:16}}>💬 تحدث مع مخرجات القضية</div>
      <form onSubmit={handleSend} style={{display:'flex', gap:8, marginBottom:10}}>
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="اكتب سؤالك أو استفسارك..." style={{flex:1, borderRadius:8, border:`1.5px solid ${theme.accent2}`, padding:10, fontSize:15, outline:'none', background:darkMode?'#232946':'#fff', color:theme.text}} disabled={loading} />
        <button type="submit" disabled={loading || !input.trim()} style={{background:theme.accent2, color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontWeight:700, fontSize:15, cursor:loading?'not-allowed':'pointer'}}>إرسال</button>
      </form>
      {error && <div style={{color:'#ff6b6b', fontWeight:700, marginBottom:8}}>{error}</div>}
      <div style={{display:'flex', flexDirection:'column', gap:10, marginTop:8}}>
        {(caseObj.chats||[]).length === 0 && <div style={{color:'#888', fontSize:14}}>لا توجد محادثات بعد.</div>}
        {(caseObj.chats||[]).map((msg: ChatMessage) => (
          <div key={msg.id} style={{background:darkMode?'#232946':'#fff', borderRadius:8, border:`1px solid ${theme.accent2}22`, padding:10}}>
            <div style={{fontWeight:700, color:theme.accent2, marginBottom:4, fontSize:15}}>سؤالك:</div>
            <div style={{marginBottom:6, fontSize:15}}>{msg.question}</div>
            <div style={{fontWeight:700, color:theme.accent, marginBottom:4, fontSize:15}}>الرد:</div>
            <div style={{fontSize:15, whiteSpace:'pre-line'}}>{msg.answer}</div>
            <div style={{fontSize:12, color:'#888', marginTop:4}}>بتاريخ: {new Date(msg.date).toLocaleString('ar-EG')}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 