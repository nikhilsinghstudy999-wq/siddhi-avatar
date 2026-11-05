import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const AGNES_API = 'https://apihub.agnes-ai.com/v1/chat/completions';
const AGNES_MODEL = 'agnes-2.0-flash';

const SYSTEM_PROMPT = `You are Siddhi, AI consultant for Kalki Intelligence Indore. Qualify visitors in ≤3 turns. Reply JSON only, ≤25 words per speech field.

Services: Growth(Ads,SEO,SMM), AI(Chatbots,Automation), Build(Web,App,E-com). Prices from ₹299.

Schema:
{"speech":"Hindi/Hinglish reply","chips":["opt1","opt2"],"detected_track":"Growth|AI|Build|null","lead":{"service_needed":"str|null","phone":"str|null","ready_for_quote":false}}`;

const QUICK_CACHE: Array<{ match: RegExp; response: any }> = [
  {
    match: /hi|hello|hey|namaste|नमस्ते|हैलो/i,
    response: {
      speech: 'नमस्ते! मैं सिद्धि हूँ, आपकी AI कंसलटेंट। बताइए आपके बिजनेस का नाम?',
      chips: ['बिजनेस बताएं', 'सर्विसेज जानें'],
      detected_track: null,
      lead: { service_needed: null, phone: null, ready_for_quote: false },
    },
  },
  {
    match: /service|servic|क्या करत|what do you|offer/i,
    response: {
      speech: 'हम 35+ सर्विसेज देते हैं — AI बॉट्स, वेबसाइट, SEO, ऐप डेवलपमेंट। आप किस फील्ड में हैं?',
      chips: ['🚀 Growth & Marketing', '🤖 AI & Automation', '💻 Web & App'],
      detected_track: null,
      lead: { service_needed: null, phone: null, ready_for_quote: false },
    },
  },
  {
    match: /price|rate|cost|कितना|महंगा|budget|₹|rupee/i,
    response: {
      speech: 'डिजाइन ₹299 से, AI बॉट ₹7,999 से। कोई छुपा चार्ज नहीं। नंबर दीजिए, 24 घंटे में कोटेशन!',
      chips: ['📱 नंबर दें', 'और जानें'],
      detected_track: 'Growth',
      lead: { service_needed: null, phone: null, ready_for_quote: false },
    },
  },
  {
    match: /time|kitna din|kab|deadline|कब|समय|जल्दी/i,
    response: {
      speech: 'हर प्रोजेक्ट का लिखित स्कोप और डिलीवरी 24 घंटे में। कोई महीनों का वेस्ट नहीं!',
      chips: ['📱 नंबर दें', 'सर्विसेज बताइए'],
      detected_track: null,
      lead: { service_needed: null, phone: null, ready_for_quote: false },
    },
  },
  {
    match: /whatsapp|number|phone|contact|नंबर|फोन|संपर्क/i,
    response: {
      speech: 'बिल्कुल! अपना 10 अंकों का WhatsApp नंबर दीजिए, टीम तुरंत कोटेशन भेजेगी!',
      chips: ['📱 नंबर दर्ज करें'],
      detected_track: null,
      lead: { service_needed: null, phone: null, ready_for_quote: true },
    },
  },
  {
    match: /thanks|thank|धन्यवाद|shukriya|bye|good/i,
    response: {
      speech: 'धन्यवाद! आपका दिन शुभ हो। किसी भी सवाल के लिए हम यहाँ हैं!',
      chips: ['शुरू से बात करें'],
      detected_track: null,
      lead: { service_needed: null, phone: null, ready_for_quote: false },
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();
    const lastMsg = messages?.[messages.length - 1]?.content?.toLowerCase() || '';

    for (const cached of QUICK_CACHE) {
      if (cached.match.test(lastMsg)) {
        return NextResponse.json(cached.response, {
          headers: { 'Cache-Control': 'no-cache' },
        });
      }
    }

    const apiKey = process.env.AGNES_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        speech: `${context?.userName || ''} जी, हम 35+ सर्विसेज में AI बॉट्स, वेबसाइट और ऑटोमेशन देते हैं। WhatsApp नंबर दीजिए!`,
        chips: ['📱 नंबर दें', 'सर्विसेज बताइए'],
        detected_track: null,
        lead: { service_needed: null, phone: null, ready_for_quote: false },
      });
    }

    const agnesMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.slice(-2),
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    try {
      const response = await fetch(AGNES_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: AGNES_MODEL,
          messages: agnesMessages,
          temperature: 0.6,
          max_tokens: 80,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.error(`[Agnes] HTTP ${response.status}`);
        throw new Error(`Agnes returned ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) throw new Error('Empty Agnes response');

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');

      const parsed = JSON.parse(jsonMatch[0]);

      return NextResponse.json({
        speech: parsed.speech || 'जी, बताइए कैसे मदद कर सकती हूँ?',
        chips: parsed.chips || ['📱 नंबर दें'],
        detected_track: parsed.detected_track || null,
        lead: parsed.lead || { service_needed: null, phone: null, ready_for_quote: false },
      });
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      if (fetchErr.name === 'AbortError') {
        console.warn('[Agnes] 3s timeout — serving fallback');
      }
      throw fetchErr;
    }
  } catch (err: any) {
    console.error('[Chat API]', err.message);
    return NextResponse.json({
      speech: 'जी, अपना WhatsApp नंबर दीजिए, हमारी टीम 24 घंटे में संपर्क करेगी!',
      chips: ['📱 नंबर दें', 'बाद में बात करें'],
      detected_track: null,
      lead: { service_needed: null, phone: null, ready_for_quote: false },
    });
  }
}
