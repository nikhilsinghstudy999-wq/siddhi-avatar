export type ClipKey =
  | 'IDLE'
  | 'LISTEN'
  | 'THINK'
  | 'GREET'
  | 'BIZ'
  | 'CHEER'
  | 'POINT'
  | 'THANKS'
  | 'VISION'
  | 'EMPATHY'
  | 'FIRM'
  | 'NOD'
  | 'CLARIFY'
  | 'NUDGE'
  | 'EXIT'
  | 'PRICE'
  | 'TIME'
  | 'TRUST';

export interface DecisionResult {
  clipKey: ClipKey;
  videoUrl: string;
  nextStep: number;
  spokenText: string;
  emotion: 'neutral' | 'warm' | 'excited' | 'confident' | 'empathetic' | 'urgent' | 'reassuring';
}

const CLIPS: Record<ClipKey, string> = {
  IDLE:    '/videos/01_BASE/v01_base_idle.mp4',
  LISTEN:  '/videos/01_BASE/v01_base_idle.mp4',
  THINK:   '/videos/01_BASE/v03_base_think.mp4',
  GREET:   '/videos/02_FUNNEL/v04_fn_greet.mp4',
  BIZ:     '/videos/02_FUNNEL/v05_fn_biz.mp4',
  CHEER:   '/videos/02_FUNNEL/v06_fn_cheer.mp4',
  POINT:   '/videos/02_FUNNEL/v07_fn_point.mp4',
  THANKS:  '/videos/02_FUNNEL/v04_fn_greet.mp4',
  VISION:  '/videos/03_SPEAK/v09_spk_vision.mp4',
  EMPATHY: '/videos/03_SPEAK/v10_spk_empathy.mp4',
  FIRM:    '/videos/03_SPEAK/v11_spk_firm.mp4',
  NOD:     '/videos/03_SPEAK/v11_spk_firm.mp4',
  CLARIFY: '/videos/01_BASE/v03_base_think.mp4',
  NUDGE:   '/videos/04_REACT/v14_rx_nudge.mp4',
  EXIT:    '/videos/04_REACT/v15_rx_exit.mp4',
  PRICE:   '/videos/05_OBJECTION/v16_obj_price.mp4',
  TIME:    '/videos/05_OBJECTION/v17_obj_time.mp4',
  TRUST:   '/videos/05_OBJECTION/v18_obj_trust.mp4',
};

const LOOPING_CLIPS = new Set<ClipKey>(['IDLE', 'LISTEN', 'THINK']);

interface IntentScore {
  clipKey: ClipKey;
  weight: number;
  emotion: DecisionResult['emotion'];
  spokenText: string;
}

const OBJECTION_PATTERNS: Array<{
  regex: RegExp;
  clipKey: ClipKey;
  weight: number;
  emotion: DecisionResult['emotion'];
  spokenText: string;
}> = [
  {
    regex: /rate|price|cost|kitna|charges|kharcha|paisa|महंगा|कीमत|खर्च|budget|rupay|₹|rupee/i,
    clipKey: 'PRICE',
    weight: 100,
    emotion: 'reassuring',
    spokenText: 'हमारे यहाँ हर सर्विस की शुरुआत पारदर्शी रेट से होती है। डिजाइन मात्र 299 रुपये से, और कस्टम AI बॉट्स 7,999 से। कोई छुपा चार्ज नहीं। आप अपना WhatsApp नंबर दीजिए, 24 घंटे में पूरा कोटेशन भेज देंगे!',
  },
  {
    regex: /time|din|kab|delivery|speed|jaldi|ghante|समय|कब|जल्दी|deadline|week|month|महीना|हफ्ता/i,
    clipKey: 'TIME',
    weight: 100,
    emotion: 'confident',
    spokenText: 'हम महीनों का समय बर्बाद नहीं करते। कल्कि इंटेलिजेंस में हर प्रोजेक्ट का लिखित स्कोप और पक्की डिलीवरी डेट 24 घंटे के अंदर आपके हाथ में होती है!',
  },
  {
    regex: /trust|safe|bharosa|dhoka|fraud|scam|विश्वास|भरोसा|सेफ|legit|real|असली/i,
    clipKey: 'TRUST',
    weight: 100,
    emotion: 'reassuring',
    spokenText: 'कल्कि इंटेलिजेंस इंदौर, मध्य प्रदेश से पूरे भारत में काम करती है। आपका पूरा डेटा 100% सेफ है और हम डिजिटल पर्सनल डेटा प्रोटेक्शन एक्ट का पूरी तरह पालन करते हैं!',
  },
];

const FUNNEL_PATTERNS: Array<{
  regex: RegExp;
  clipKey: ClipKey;
  weight: number;
  emotion: DecisionResult['emotion'];
  spokenText: string;
}> = [
  {
    regex: /haan|yes|sahi|ok|ठीक|हाँ|जरूर|bilkul|absolutely|sure|okay/i,
    clipKey: 'NOD',
    weight: 80,
    emotion: 'warm',
    spokenText: 'बहुत बढ़िया! आगे बढ़ते हैं।',
  },
  {
    regex: /nahi|no|not|नहीं|नही|cant|cannot|dont|mat|dont want/i,
    clipKey: 'EMPATHY',
    weight: 70,
    emotion: 'empathetic',
    spokenText: 'कोई बात नहीं! जब आप तैयार हों, हम यहीं हैं।',
  },
  {
    regex: /kya|what|how|kaise|क्या|कैसे|बताओ|tell|explain|samjha/i,
    clipKey: 'VISION',
    weight: 60,
    emotion: 'confident',
    spokenText: 'हम 35 से ज़्यादा सर्विसेज देते हैं — AI बॉट्स, वेबसाइट, SEO, ऐप डेवलपमेंट, और ऑटोमेशन। बताइए आपके बिजनेस को क्या चाहिए?',
  },
  {
    regex: /\d{10}|whatsapp|number|phone|mob|call|नंबर|फोन|मोबाइल/i,
    clipKey: 'POINT',
    weight: 90,
    emotion: 'warm',
    spokenText: 'बिल्कुल! अपना 10 अंकों का WhatsApp नंबर दीजिए, हमारी टीम 24 घंटे में पूरा फिक्स्ड-प्राइस कोटेशन भेजेगी!',
  },
];

export function isLoopingClip(clipKey: ClipKey): boolean {
  return LOOPING_CLIPS.has(clipKey);
}

export function evaluateDecisionSync(
  rawInput: string,
  currentStep: number,
  userName?: string,
  context?: string,
): DecisionResult {
  const input = rawInput.toLowerCase().trim();

  const candidates: IntentScore[] = [];

  for (const pattern of OBJECTION_PATTERNS) {
    if (pattern.regex.test(input)) {
      candidates.push({
        clipKey: pattern.clipKey,
        weight: pattern.weight,
        emotion: pattern.emotion,
        spokenText: pattern.spokenText,
      });
    }
  }

  for (const pattern of FUNNEL_PATTERNS) {
    if (pattern.regex.test(input)) {
      candidates.push({
        clipKey: pattern.clipKey,
        weight: pattern.weight,
        emotion: pattern.emotion,
        spokenText: pattern.spokenText,
      });
    }
  }

  if (input.length < 2) {
    candidates.push({
      clipKey: 'CLARIFY',
      weight: 50,
      emotion: 'neutral',
      spokenText: 'माफ़ कीजिए, क्या आप दोबारा बता सकते हैं?',
    });
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.weight - a.weight);
    const winner = candidates[0];
    return {
      clipKey: winner.clipKey,
      videoUrl: CLIPS[winner.clipKey],
      nextStep: currentStep,
      spokenText: winner.spokenText,
      emotion: winner.emotion,
    };
  }

  return getFunnelDecision(currentStep, userName, context);
}

function getFunnelDecision(
  currentStep: number,
  userName?: string,
  context?: string,
): DecisionResult {
  const name = userName || '';

  switch (currentStep) {
    case 0:
      return {
        clipKey: 'GREET',
        videoUrl: CLIPS.GREET,
        nextStep: 1,
        spokenText:
          'नमस्ते! प्रणाम। मैं सिद्धि हूँ, कल्कि इंटेलिजेंस इंदौर से आपकी AI कंसलटेंट। हम भारतीय बिजनेसेज को AI बॉट्स, वेबसाइट्स और ऑटोमेशन से 10 गुना तेज़ी से ग्रो कराते हैं। क्या मैं आपका शुभ नाम जान सकती हूँ?',
        emotion: 'warm',
      };
    case 1:
      return {
        clipKey: 'BIZ',
        videoUrl: CLIPS.BIZ,
        nextStep: 2,
        spokenText: `बहुत-बहुत स्वागत है${name ? ' ' + name + ' जी' : ''}! आपकी कंपनी या बिजनेस का क्या नाम है, और आप किस फील्ड में काम करते हैं?`,
        emotion: 'warm',
      };
    case 2:
      return {
        clipKey: 'CHEER',
        videoUrl: CLIPS.CHEER,
        nextStep: 3,
        spokenText: `अरे वाह! यह तो बहुत ही शानदार सेक्टर है${name ? ' ' + name + ' जी' : ''}! आजकल इस फील्ड में सही ऑटोमेशन लग जाए तो बिजनेस 24 घंटे दौड़ता है। हम 35 से ज़्यादा सर्विसेज देते हैं — आप क्या चाहते हैं?`,
        emotion: 'excited',
      };
    case 3:
      return {
        clipKey: 'POINT',
        videoUrl: CLIPS.POINT,
        nextStep: 3,
        spokenText:
          'मैं बस आपके बिजनेस के लिए सबसे सही सॉल्यूशन और फिक्स्ड-प्राइस प्लान मैच कर रही हूँ। यह पूरी रिपोर्ट और 24 घंटे का पक्का कोटेशन मैं आपको कहाँ भेजूँ? कृपया अपना WhatsApp नंबर बताइए!',
        emotion: 'warm',
      };
    case 4:
      return {
        clipKey: 'THANKS',
        videoUrl: CLIPS.THANKS,
        nextStep: 5,
        spokenText: `बहुत-बहुत धन्यवाद${name ? ' ' + name + ' जी' : ''}! आपकी डिटेल्स दर्ज हो चुकी हैं। हमारी टेक्निकल टीम 24 घंटे में आपका फिक्स्ड-प्राइस प्रपोजल WhatsApp पर भेज देगी। आपका दिन शुभ और मंगलमय हो!`,
        emotion: 'warm',
      };
    default: {
      return {
        clipKey: 'VISION',
        videoUrl: CLIPS.VISION,
        nextStep: currentStep,
        spokenText: name
          ? `${name} जी, हम AI बॉट्स, वेबसाइट, SEO, ऐप डेवलपमेंट — सब कुछ फिक्स्ड प्राइस में देते हैं। अपना WhatsApp नंबर दीजिए, पूरी रिपोर्ट भेजते हैं!`
          : 'हमारी 35 से ज़्यादा सर्विसेज हैं। अपना WhatsApp नंबर दीजिए, पूरी रिपोर्ट भेजते हैं!',
        emotion: 'confident',
      };
    }
  }
}

export function getInitialDecision(): DecisionResult {
  return {
    clipKey: 'GREET',
    videoUrl: CLIPS.GREET,
    nextStep: 1,
    spokenText:
      'नमस्ते! प्रणाम। मैं सिद्धि हूँ, कल्कि इंटेलिजेंस इंदौर से आपकी AI कंसलटेंट। क्या मैं आपका शुभ नाम जान सकती हूँ?',
    emotion: 'warm',
  };
}

export function getIdleDecision(): DecisionResult {
  return {
    clipKey: 'IDLE',
    videoUrl: CLIPS.IDLE,
    nextStep: 0,
    spokenText: '',
    emotion: 'neutral',
  };
}

export function getThinkDecision(currentStep: number): DecisionResult {
  return {
    clipKey: 'THINK',
    videoUrl: CLIPS.THINK,
    nextStep: currentStep,
    spokenText: '',
    emotion: 'neutral',
  };
}

export function getNudgeDecision(currentStep: number): DecisionResult {
  return {
    clipKey: 'NUDGE',
    videoUrl: CLIPS.NUDGE,
    nextStep: currentStep,
    spokenText: 'कुछ पूछना चाहते हैं? बस बोलिए या टाइप कीजिए!',
    emotion: 'warm',
  };
}

export { CLIPS, LOOPING_CLIPS };
