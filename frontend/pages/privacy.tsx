import Link from 'next/link';

export default function Privacy() {
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
          <li>يمكنك في أي وقت مسح جميع بياناتك من خلال زر "مسح كل البيانات" في الموقع.</li>
        </ul>
        <div style={{marginTop:32, textAlign:'center'}}>
          <Link href="/" style={{color:'#6366f1', textDecoration:'underline', fontWeight:700, fontSize:16}}>العودة للصفحة الرئيسية</Link>
        </div>
      </main>
    </div>
  );
} 