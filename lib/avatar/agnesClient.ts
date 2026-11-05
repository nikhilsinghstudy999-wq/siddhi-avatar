export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  speech: string;
  chips: string[];
  detected_track: string | null;
  lead: {
    service_needed: string | null;
    phone: string | null;
    ready_for_quote: boolean;
  };
}

const FALLBACK_RESPONSE: ChatResponse = {
  speech: 'जी, अपना WhatsApp नंबर दीजिए, 24 घंटे में फिक्स्ड-प्राइस कोटेशन भेजते हैं!',
  chips: ['📱 नंबर दें', 'सर्विसेज बताइए'],
  detected_track: null,
  lead: { service_needed: null, phone: null, ready_for_quote: false },
};

export async function sendToAgnesAI(
  messages: ChatMessage[],
  context: { userName?: string; businessName?: string; step: number },
): Promise<ChatResponse> {
  try {
    const trimmed = messages.slice(-2);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: trimmed, context }),
      signal: AbortSignal.timeout(2500),
    });

    if (!res.ok) return FALLBACK_RESPONSE;
    return await res.json();
  } catch {
    return FALLBACK_RESPONSE;
  }
}
