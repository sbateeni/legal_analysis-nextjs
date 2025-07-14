# نظام التحليل القانوني

نظام ذكي للتحليل القانوني باستخدام الذكاء الاصطناعي.

## المتطلبات

- Python 3.9+
- Google API Key

## التثبيت المحلي

1. قم بتثبيت المتطلبات:
```bash
pip install -r requirements.txt
```

2. قم بإنشاء ملف `.env` وأضف مفتاح API الخاص بك:
```
GOOGLE_API_KEY=your_api_key_here
```

3. قم بتشغيل التطبيق:
```bash
python app.py
```

## النشر على Render.com

1. قم بإنشاء حساب على [Render.com](https://render.com)

2. قم بإنشاء خدمة Web جديدة واختر هذا المستودع

3. قم بتكوين المتغيرات البيئية:
   - `GOOGLE_API_KEY`: مفتاح API الخاص بك

4. اضغط على "Deploy"

## المميزات

- تحليل قانوني متقدم
- 12 مرحلة تحليل
- تحقق من دقة النتائج
- واجهة مستخدم عصرية
- دعم اللغة العربية

## الترخيص

MIT 

# تشغيل المشروع على Vercel

## الخطوات:

1. **تأكد من وجود ملف `vercel.json` في جذر المشروع:**
   - هذا الملف يضبط إعدادات Vercel لتشغيل Flask من `app.py`.

2. **أضف متغير البيئة لمفتاح Google Gemini API:**
   - من لوحة تحكم Vercel: Settings > Environment Variables
   - أضف متغير باسم: `GEMINI_API_KEY`
   - ضع فيه مفتاح Google Gemini الخاص بك.

3. **ادفع التغييرات إلى GitHub**
   - Vercel سيقوم بالنشر تلقائيًا.

4. **لا حاجة لـ gunicorn أو gunicorn_config.py في Vercel.**

5. **إذا واجهت مشاكل في static files:**
   - تأكد أن المسارات في Flask تستخدم `url_for('static', filename='...')`.

---

## مصادر:
- [تشغيل Flask على Vercel](https://vercel.com/docs/legacy/v2/builders/python)
- [مثال مشروع Flask على Vercel](https://github.com/vercel/examples/tree/main/python/flask) 