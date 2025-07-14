import logging
from flask import Flask, render_template, request, jsonify, Response, session
import google.generativeai as genai
import os
from dotenv import load_dotenv
import traceback
import json
from analysis_stages import STAGES_DETAILS, get_stage_prompt
import time
import secrets
import gc  # إضافة garbage collector

# Configure logging with colors
class ColoredFormatter(logging.Formatter):
    """Custom formatter with colors"""
    grey = "\x1b[38;21m"
    blue = "\x1b[38;5;39m"
    yellow = "\x1b[38;5;226m"
    red = "\x1b[38;5;196m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"

    def __init__(self, fmt):
        super().__init__()
        self.fmt = fmt
        self.FORMATS = {
            logging.DEBUG: self.grey + self.fmt + self.reset,
            logging.INFO: self.blue + self.fmt + self.reset,
            logging.WARNING: self.yellow + self.fmt + self.reset,
            logging.ERROR: self.red + self.fmt + self.reset,
            logging.CRITICAL: self.bold_red + self.fmt + self.reset
        }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt)
        return formatter.format(record)

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
fmt = ColoredFormatter('%(asctime)s - %(levelname)s - %(message)s')
ch.setFormatter(fmt)
logger.addHandler(ch)

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# إضافة مفتاح سري للتطبيق
app.secret_key = secrets.token_hex(16)

# تكوين Gunicorn
timeout = 300  # 5 دقائق
max_requests = 1000
max_requests_jitter = 50

def cleanup_resources():
    """تنظيف الموارد وتحرير الذاكرة"""
    gc.collect()

# Define the 12 stages in order
STAGES = [
    "المرحلة الأولى: تحديد المشكلة القانونية",
    "المرحلة الثانية: جمع المعلومات والوثائق",
    "المرحلة الثالثة: تحليل النصوص القانونية",
    "المرحلة الرابعة: تحديد القواعد القانونية المنطبقة",
    "المرحلة الخامسة: تحليل السوابق القضائية",
    "المرحلة السادسة: تحليل الفقه القانوني",
    "المرحلة السابعة: تحليل الظروف الواقعية",
    "المرحلة الثامنة: تحديد الحلول القانونية الممكنة",
    "المرحلة التاسعة: تقييم الحلول القانونية",
    "المرحلة العاشرة: اختيار الحل الأمثل",
    "المرحلة الحادية عشرة: صياغة الحل القانوني",
    "المرحلة الثانية عشرة: تقديم التوصيات"
]

# Check if running on Render
IS_RENDER = os.environ.get('RENDER', False)

def get_api_key():
    """Get API key from header or session only (Vercel mode)"""
    try:
        # أولاً: من الهيدر
        api_key = request.headers.get('X-API-Key')
        if api_key and len(api_key.strip()) > 0:
            logger.info(f"🔑 تم استرجاع مفتاح API من الهيدر: {api_key[:5]}...")
            return api_key
        # ثانياً: من الجلسة
        if 'api_key' in session:
            api_key = session['api_key']
            logger.info(f"🔑 تم استرجاع مفتاح API من الجلسة: {api_key[:5]}...")
            if not api_key or len(api_key.strip()) == 0:
                logger.error("❌ مفتاح API فارغ في الجلسة")
                return None
            return api_key
        # لا يوجد مفتاح
        logger.error("❌ لم يتم العثور على مفتاح API. يجب على كل مستخدم إرسال مفتاحه الخاص في كل طلب.")
        return None
    except Exception as e:
        logger.error(f"❌ خطأ في الحصول على مفتاح API: {str(e)}")
        return None

def verify_api_key(api_key):
    """Verify if the API key is valid"""
    try:
        if not api_key or len(api_key.strip()) == 0:
            logger.error("❌ مفتاح API فارغ")
            return False
            
        # تكوين Gemini مع المفتاح
        genai.configure(api_key=api_key)
        
        try:
            # محاولة إنشاء نموذج بسيط للتحقق
            model = genai.GenerativeModel('models/gemini-2.0-flash-001')
            response = model.generate_content("Test")
            
            if response is None:
                logger.error("❌ فشل في الحصول على استجابة من API")
                return False
                
            return True
        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ تفاصيل الخطأ: {error_msg}")
            
            if "API_KEY_INVALID" in error_msg:
                logger.error("❌ مفتاح API غير صالح. يرجى التأكد من صحة المفتاح")
                logger.error("💡 تلميح: قم بزيارة https://makersuite.google.com/app/apikey للحصول على مفتاح جديد")
                logger.error("💡 تأكد من نسخ المفتاح بشكل صحيح وعدم وجود مسافات إضافية")
            elif "API_KEY_EXPIRED" in error_msg:
                logger.error("❌ مفتاح API منتهي الصلاحية")
                logger.error("💡 تلميح: قم بإنشاء مفتاح جديد من Google AI Studio")
            elif "QUOTA_EXCEEDED" in error_msg:
                logger.error("❌ تم تجاوز الحد المسموح به من الطلبات")
                logger.error("💡 تلميح: انتظر قليلاً أو قم بترقية حسابك")
            elif "PERMISSION_DENIED" in error_msg:
                logger.error("❌ لا يوجد لديك صلاحية لاستخدام هذا المفتاح")
                logger.error("💡 تلميح: تأكد من تفعيل Gemini API في مشروعك")
            elif "RESOURCE_EXHAUSTED" in error_msg:
                logger.error("❌ تم استنفاد موارد API")
                logger.error("💡 تلميح: انتظر قليلاً أو قم بترقية حسابك")
            else:
                logger.error(f"❌ خطأ في التحقق من مفتاح API: {error_msg}")
                logger.error("💡 تلميح: تأكد من صحة المفتاح وإمكانية الوصول إلى Gemini API")
            return False
            
    except Exception as e:
        logger.error(f"❌ خطأ غير متوقع في التحقق من مفتاح API: {str(e)}")
        logger.error("💡 تلميح: تأكد من صحة المفتاح وإمكانية الوصول إلى Gemini API")
        return False

def verify_and_enhance_analysis(model, stage, analysis, text):
    """Verify and enhance the analysis for accuracy and completeness"""
    try:
        logger.info(f"🔍 جاري التحقق من دقة تحليل {stage}")
        # تقسيم النص إلى أجزاء أصغر إذا كان طويلاً
        max_text_length = 4000  # الحد الأقصى للنص
        if len(text) > max_text_length:
            text = text[:max_text_length] + "..."
        # Create verification prompt
        verification_prompt = f"""
        قم بمراجعة وتحسين التحليل التالي للمرحلة: {stage}
        
        النص الأصلي:
        {text}
        
        التحليل الحالي:
        {analysis}
        
        قم بما يلي:
        1. تحقق من دقة المعلومات القانونية
        2. تأكد من تغطية جميع جوانب المرحلة
        3. أضف أي معلومات قانونية مهمة مفقودة
        4. تحقق من تناسق الاستنتاجات مع النص الأصلي
        5. قم بتحسين الصياغة والوضوح
        
        قدم التحليل المحسن مع شرح التغييرات التي تمت.
        """
        try:
            response = model.generate_content(verification_prompt)
            if response and response.text:
                enhanced_analysis = response.text
                logger.info(f"✅ تم تحسين تحليل {stage}")
                return enhanced_analysis
            else:
                logger.warning(f"⚠️ لم يتم الحصول على تحليل محسن لـ {stage}")
                return analysis
        except Exception as e:
            logger.error(f"❌ خطأ في تحسين التحليل: {str(e)}")
            return analysis
    except Exception as e:
        logger.error(f"❌ خطأ في التحقق من تحليل {stage}: {str(e)}")
        return analysis
    finally:
        cleanup_resources()

def generate_analysis(text, stage_index):
    """Generate analysis for a single stage only (no loop)"""
    try:
        logger.info("🚀 بدء عملية التحليل القانوني...")
        logger.info(f"📝 النص المدخل: {text[:100]}...")
        # تقسيم النص إلى أجزاء أصغر إذا كان طويلاً
        max_text_length = 4000  # الحد الأقصى للنص
        if len(text) > max_text_length:
            text = text[:max_text_length] + "..."
        logger.info("⚙️ تهيئة نموذج Gemini...")
        model = genai.GenerativeModel('models/gemini-2.0-flash-001')
        # تحليل مرحلة واحدة فقط
        stage = STAGES[stage_index]
        logger.info(f"\n📊 المرحلة {stage_index + 1}/12: {stage}")
        logger.info("🔍 جاري تحليل المرحلة...")
        prompt = get_stage_prompt(stage, text)
        logger.debug(f"Prompt for {stage}: {prompt[:200]}...")
        # Get initial analysis with retry mechanism and timeout
        max_retries = 3 if IS_RENDER else 1
        retry_count = 0
        initial_analysis = None
        while retry_count < max_retries:
            try:
                response = model.generate_content(prompt)
                if response and response.text:
                    initial_analysis = response.text
                    logger.info(f"✅ تم اكتمال التحليل الأولي لـ {stage}")
                    break
                else:
                    logger.warning(f"⚠️ استجابة فارغة للمرحلة: {stage}")
                    retry_count += 1
                    if retry_count < max_retries:
                        logger.info(f"🔄 إعادة المحاولة {retry_count + 1}/{max_retries}...")
                        time.sleep(2)
            except Exception as e:
                logger.error(f"❌ خطأ في تحليل المرحلة {stage} (محاولة {retry_count + 1}): {str(e)}")
                retry_count += 1
                if retry_count < max_retries:
                    logger.info(f"🔄 إعادة المحاولة {retry_count + 1}/{max_retries}...")
                    time.sleep(2)
                else:
                    raise
        if initial_analysis:
            try:
                enhanced_analysis = verify_and_enhance_analysis(model, stage, initial_analysis, text)
                result = {
                    'stage': stage,
                    'description': STAGES_DETAILS[stage]['description'],
                    'key_points': STAGES_DETAILS[stage]['key_points'],
                    'analysis': enhanced_analysis,
                    'status': 'completed',
                    'stage_index': stage_index,
                    'total_stages': len(STAGES)
                }
            except Exception as e:
                logger.error(f"❌ خطأ في التحقق من تحليل {stage}: {str(e)}")
                result = {
                    'stage': stage,
                    'description': STAGES_DETAILS[stage]['description'],
                    'key_points': STAGES_DETAILS[stage]['key_points'],
                    'analysis': initial_analysis,
                    'status': 'completed',
                    'stage_index': stage_index,
                    'total_stages': len(STAGES)
                }
        else:
            logger.warning(f"⚠️ فشل جميع محاولات تحليل المرحلة: {stage}")
            result = {
                'stage': stage,
                'description': STAGES_DETAILS[stage]['description'],
                'key_points': STAGES_DETAILS[stage]['key_points'],
                'analysis': "لم يتم الحصول على تحليل لهذه المرحلة بعد عدة محاولات",
                'status': 'error',
                'stage_index': stage_index,
                'total_stages': len(STAGES)
            }
        # Stream the result for this stage فقط
        yield f"data: {json.dumps(result, ensure_ascii=False)}\n\n"
    except Exception as e:
        logger.error(f"❌ خطأ في generate_analysis: {str(e)}")
        logger.error(f"تفاصيل الخطأ: {traceback.format_exc()}")
        error_result = {
            'error': str(e),
            'status': 'error',
            'stage_index': stage_index,
            'total_stages': len(STAGES)
        }
        yield f"data: {json.dumps(error_result, ensure_ascii=False)}\n\n"
    finally:
        cleanup_resources()

@app.route('/')
def index():
    logger.info("📄 تم تحميل الصفحة الرئيسية")
    return render_template('index.html', stages=STAGES_DETAILS)

@app.route('/api', methods=['GET'])
def api_info():
    """API information and instructions endpoint"""
    api_info = {
        "name": "Legal Analysis API",
        "version": "1.0",
        "description": "API for legal text analysis using Google's Gemini AI",
        "endpoints": {
            "/analyze": {
                "method": "POST",
                "description": "Analyze legal text through 12 stages",
                "parameters": {
                    "text": "The legal text to analyze",
                    "stage": "Stage index (0-11) to analyze"
                },
                "headers": {
                    "X-API-Key": "Your Google API key"
                },
                "response": "Server-sent events (SSE) with analysis results"
            },
            "/test_api": {
                "method": "POST",
                "description": "Test if your API key is valid",
                "parameters": {
                    "api_key": "Your Google API key to test"
                },
                "response": {
                    "status": "success/error",
                    "message": "Result message",
                    "details": "Detailed information",
                    "help": "Helpful information if there's an error"
                }
            }
        },
        "api_key_instructions": {
            "how_to_get": [
                "1. قم بزيارة Google AI Studio: https://makersuite.google.com/app/apikey",
                "2. سجل الدخول باستخدام حساب Google الخاص بك",
                "3. انقر على 'Create API Key'",
                "4. انسخ المفتاح الجديد"
            ],
            "how_to_use": [
                "1. قم بإرسال المفتاح في رأس الطلب X-API-Key",
                "2. أو قم بتعيينه في الجلسة باستخدام نقطة النهاية /set_api_key",
                "3. أو قم بتعيينه في ملف .env كمتغير GOOGLE_API_KEY",
                "4. يمكنك اختبار المفتاح باستخدام نقطة النهاية /test_api"
            ],
            "requirements": [
                "يجب أن يكون المفتاح صالحاً وغير منتهي الصلاحية",
                "يجب أن يكون لديك حساب Google مفعل",
                "يجب أن تكون في منطقة مدعومة من Google AI"
            ],
            "troubleshooting": [
                "إذا كان المفتاح غير صالح، تأكد من نسخه بشكل صحيح",
                "إذا انتهت صلاحية المفتاح، قم بإنشاء مفتاح جديد",
                "إذا تجاوزت الحد المسموح به، انتظر أو قم بترقية حسابك",
                "استخدم نقطة النهاية /test_api لاختبار المفتاح قبل استخدامه"
            ]
        },
        "example": {
            "request": {
                "url": "/analyze",
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "X-API-Key": "your-api-key-here"
                },
                "body": {
                    "text": "نص قانوني للتحليل...",
                    "stage": 0
                }
            },
            "response": {
                "data": {
                    "stage": "المرحلة الأولى: تحديد المشكلة القانونية",
                    "description": "تحديد وتوضيح المشكلة القانونية الرئيسية في النص",
                    "key_points": ["نقطة 1", "نقطة 2", "نقطة 3"],
                    "analysis": "تحليل النص...",
                    "status": "completed",
                    "stage_index": 0
                }
            }
        }
    }
    return jsonify(api_info)

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        # Get API key
        api_key = get_api_key()
        if not api_key:
            return jsonify({
                'error': 'API key is required',
                'details': 'Please provide a valid Google API key in the X-API-Key header or set it in the session'
            }), 401
        # التحقق من صحة المفتاح
        if not verify_api_key(api_key):
            return jsonify({
                'error': 'Invalid API key',
                'details': 'The provided API key is invalid or has expired. Please check your API key and try again.'
            }), 401
        # Configure Gemini API with the provided key
        genai.configure(api_key=api_key)
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'Invalid request',
                'details': 'Request body must be JSON'
            }), 400
        text = data.get('text', '')
        stage_index = data.get('stage', 0)
        if not text:
            return jsonify({
                'error': 'No text provided',
                'details': 'Please provide the legal text to analyze'
            }), 400
        if stage_index < 0 or stage_index >= len(STAGES):
            logger.warning("⚠️ رقم مرحلة غير صحيح")
            return jsonify({
                'error': 'Invalid stage number',
                'details': f'Stage number must be between 0 and {len(STAGES)-1}'
            }), 400
        logger.info(f"🔄 بدء طلب تحليل جديد للمرحلة {stage_index + 1}")
        def generate():
            try:
                # إرسال إشعار ببدء التحليل
                yield f"data: {json.dumps({'status': 'started', 'stage_index': stage_index, 'total_stages': len(STAGES)}, ensure_ascii=False)}\n\n"
                # تحليل المرحلة الحالية
                for result in generate_analysis(text, stage_index):
                    yield result
                # إرسال إشعار بانتهاء التحليل
                yield f"data: {json.dumps({'status': 'completed', 'stage_index': stage_index, 'total_stages': len(STAGES)}, ensure_ascii=False)}\n\n"
            except Exception as e:
                logger.error(f"Error in generate: {str(e)}")
                error_data = json.dumps({
                    'error': str(e),
                    'status': 'error',
                    'details': 'An error occurred while generating the analysis'
                }, ensure_ascii=False)
                yield f"data: {error_data}\n\n"
        return Response(generate(), mimetype='text/event-stream')
    except Exception as e:
        logger.error(f"Error in analyze endpoint: {str(e)}")
        return jsonify({
            'error': str(e),
            'details': 'An unexpected error occurred while processing your request'
        }), 500

@app.route('/set_api_key', methods=['POST'])
def set_api_key():
    """Set API key in session"""
    try:
        data = request.get_json()
        if not data:
            logger.error("❌ طلب غير صالح: لا يوجد بيانات JSON")
            return jsonify({
                'error': 'Invalid request',
                'details': 'Request body must be JSON',
                'help': 'Send a POST request with {"api_key": "your-api-key"}'
            }), 400
            
        api_key = data.get('api_key')
        logger.info(f"🔑 محاولة حفظ مفتاح API: {api_key[:5]}...")
        
        if not api_key or len(api_key.strip()) == 0:
            logger.error("❌ مفتاح API فارغ")
            return jsonify({
                'error': 'API key is required',
                'details': 'Please provide a valid Google API key',
                'help': 'Get your API key from https://makersuite.google.com/app/apikey'
            }), 400
            
        # التحقق من صحة المفتاح قبل حفظه
        if not verify_api_key(api_key):
            logger.error("❌ فشل التحقق من صحة المفتاح")
            return jsonify({
                'error': 'Invalid API key',
                'details': 'The provided API key is invalid or has expired. Please check your API key and try again.',
                'help': 'Visit https://makersuite.google.com/app/apikey to get a new API key'
            }), 400
            
        # حفظ المفتاح في الجلسة
        session['api_key'] = api_key
        logger.info("✅ تم حفظ مفتاح API في الجلسة بنجاح")
        
        # التحقق من حفظ المفتاح
        saved_key = session.get('api_key')
        if saved_key != api_key:
            logger.error("❌ فشل التحقق من حفظ المفتاح في الجلسة")
            return jsonify({
                'error': 'Failed to save API key',
                'details': 'The API key could not be saved in the session',
                'help': 'Please try again or contact support'
            }), 500
            
        return jsonify({
            'status': 'success',
            'message': 'API key saved successfully',
            'details': 'The API key has been validated and saved in your session',
            'next_steps': 'You can now use the /analyze endpoint to analyze legal texts'
        })
        
    except Exception as e:
        logger.error(f"❌ خطأ في حفظ مفتاح API: {str(e)}")
        return jsonify({
            'error': str(e),
            'details': 'An unexpected error occurred while setting the API key',
            'help': 'Make sure you are sending a valid JSON request with an API key'
        }), 500

@app.route('/clear_api_key', methods=['POST'])
def clear_api_key():
    """Clear API key from session"""
    try:
        session.pop('api_key', None)
        return jsonify({'status': 'success', 'message': 'API key cleared successfully'})
    except Exception as e:
        logger.error(f"Error clearing API key: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/test_api', methods=['POST'])
def test_api():
    """Test if the API key is valid"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'Invalid request',
                'details': 'Request body must be JSON',
                'help': 'Send a POST request with {"api_key": "your-api-key"}'
            }), 400
            
        api_key = data.get('api_key')
        
        if not api_key or len(api_key.strip()) == 0:
            return jsonify({
                'error': 'API key is required',
                'details': 'Please provide a valid Google API key',
                'help': 'Get your API key from https://makersuite.google.com/app/apikey'
            }), 400
            
        # التحقق من تنسيق المفتاح
        if not api_key.startswith("AI") or len(api_key) < 20:
            return jsonify({
                'status': 'error',
                'message': 'Invalid API key format',
                'details': 'API key must start with "AI" and be at least 20 characters long',
                'help': 'Get a valid API key from https://makersuite.google.com/app/apikey'
            }), 400
            
        # تكوين Gemini مع المفتاح
        genai.configure(api_key=api_key)
        
        try:
            # محاولة إنشاء نموذج بسيط للتحقق
            model = genai.GenerativeModel('models/gemini-2.0-flash-001')
            response = model.generate_content("Test")
            
            if response is None:
                return jsonify({
                    'status': 'error',
                    'message': 'Failed to get response from API',
                    'details': 'The API key is valid but no response was received',
                    'help': 'Try again or contact support if the problem persists'
                }), 400
                
            return jsonify({
                'status': 'success',
                'message': 'API key is valid',
                'details': 'The API key has been successfully validated',
                'next_steps': 'You can now use this API key for analysis'
            })
            
        except Exception as e:
            error_msg = str(e)
            if "API_KEY_INVALID" in error_msg:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid API key',
                    'details': 'The provided API key is not valid',
                    'help': 'Get a new API key from https://makersuite.google.com/app/apikey'
                }), 400
            elif "API_KEY_EXPIRED" in error_msg:
                return jsonify({
                    'status': 'error',
                    'message': 'Expired API key',
                    'details': 'The provided API key has expired',
                    'help': 'Create a new API key from Google AI Studio'
                }), 400
            elif "QUOTA_EXCEEDED" in error_msg:
                return jsonify({
                    'status': 'error',
                    'message': 'Quota exceeded',
                    'details': 'You have exceeded your API quota',
                    'help': 'Wait a while or upgrade your account'
                }), 400
            else:
                return jsonify({
                    'status': 'error',
                    'message': 'API test failed',
                    'details': str(e),
                    'help': 'Check your API key and try again'
                }), 400
                
    except Exception as e:
        logger.error(f"Error testing API key: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Unexpected error',
            'details': str(e),
            'help': 'Make sure you are sending a valid JSON request with an API key'
        }), 500

@app.route('/analyze_stage', methods=['POST'])
def analyze_stage():
    try:
        data = request.get_json()
        text = data.get('text', '')
        stage_idx = int(data.get('stage_idx', 0))
        api_key = data.get('api_key')
        if not api_key:
            return jsonify({'status': 'error', 'error': 'مطلوب مفتاح API'}), 401
        if not text:
            return jsonify({'status': 'error', 'error': 'يرجى إدخال النص القانوني'}), 400
        if stage_idx < 0 or stage_idx >= len(STAGES):
            return jsonify({'status': 'error', 'error': 'رقم مرحلة غير صحيح'}), 400
        # تحقق من صحة المفتاح
        if not verify_api_key(api_key):
            return jsonify({'status': 'error', 'error': 'مفتاح API غير صالح'}), 401
        genai.configure(api_key=api_key)
        # تحليل مرحلة واحدة فقط
        analysis_result = None
        for result in generate_analysis(text, stage_idx):
            try:
                data = json.loads(result.replace('data: ', ''))
                if data.get('status') == 'completed' or data.get('status') == 'error':
                    analysis_result = data
                    break
            except Exception:
                continue
        if analysis_result:
            if analysis_result.get('status') == 'completed':
                return jsonify({'status': 'success', 'result': analysis_result['analysis']})
            else:
                return jsonify({'status': 'error', 'error': analysis_result.get('analysis', 'حدث خطأ أثناء التحليل')})
        else:
            return jsonify({'status': 'error', 'error': 'لم يتم الحصول على نتيجة التحليل'}), 500
    except Exception as e:
        return jsonify({'status': 'error', 'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("🌐 بدء تشغيل تطبيق Flask...")
    app.run(debug=True) 