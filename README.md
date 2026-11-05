# KALKI SIDDHI — Virtual AI Avatar Landing Page

Ultra-low latency (<1ms), zero-GPU, high-converting conversational AI landing page for **Kalki Intelligence** (Indore, MP).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER CLIENT (0ms GPU)                      │
│                                                                  │
│  User Speech (hi-IN) ──► Web Speech API (native, ₹0)           │
│                                │                                 │
│                                ▼                                 │
│              Weighted FSM Decision Engine (<0.1ms)              │
│           6 quick-cache patterns → 0 API calls                  │
│                                │                                 │
│          ┌─────────────────────┼─────────────────────┐          │
│          ▼                     ▼                     ▼          │
│   Golden MP3 Tracks    Browser SpeechSynthesis   Video Swap    │
│   (pre-cached)         (hi-IN voice, dynamic)   (dual-buffer) │
└──────────────────────────────┬──────────────────────────────────┘
                               │ ONLY on unmatched input
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              VERCEL EDGE (agnes-2.0-flash free tier)            │
│                                                                  │
│  /api/chat                          /api/lead                    │
│  • 6 regex quick-cache hits         • Lazy Supabase init        │
│  • Only 2 msgs sent (not full)      • <35ms edge insert         │
│  • 3s hard timeout → fallback       • Graceful offline mode     │
│  • max_tokens: 120 (minimal)                                    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE (Free Tier)                         │
│  • avatar_leads table (RLS + DP Act compliant)                 │
│  • Optional webhook → WhatsApp/Telegram notification            │
└─────────────────────────────────────────────────────────────────┘
```

## Free-Tier Optimization Strategy

| Component | Service | Cost | Latency |
|-----------|---------|------|---------|
| STT | Browser Web Speech API | ₹0 | <5ms |
| Video FSM | Client-side regex engine | ₹0 | <0.1ms |
| Quick Cache | 6 regex patterns in /api/chat | ₹0 | <1ms |
| AI Fallback | Agnes `agnes-2.0-flash` | Free (1,500 req/5hr) | ~200ms |
| TTS (scripted) | Pre-cached golden MP3s | ₹0 | <10ms |
| TTS (dynamic) | Browser SpeechSynthesis (hi-IN) | ₹0 | <50ms |
| Lead Storage | Supabase Edge Insert | Free tier | <35ms |
| Hosting | Vercel Edge | Free tier | Global CDN |

**Result: ~95% of conversations cost ₹0 and never hit the Agnes API.**

## 14-Video Asset Matrix (4 Smart Fallbacks)

```
public/videos/
├── 01_BASE/          → Ambient loops (idle, think)
├── 02_FUNNEL/        → Lead capture flow (greet, biz, cheer, point)
├── 03_SPEAK/         → Dynamic responses (vision, empathy, firm)
├── 04_REACT/         → Micro-gestures (nudge, exit)
└── 05_OBJECTION/     → Trust busters (price, time, trust)
```

**Missing clips mapped to nearest available:**
- v02_listen → v01_idle (breathing loop)
- v08_thanks → v04_greet (namaste gesture)
- v12_nod → v11_firm (confident posture)
- v13_clarify → v03_think (thinking face)

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Framer Motion (spring physics)
- **Database**: Supabase (Edge-compatible, RLS enabled)
- **AI**: Agnes AI `agnes-2.0-flash` (free tier, 256K context)
- **STT**: Native Web Speech API (hi-IN, zero cost)
- **TTS**: Golden MP3s (scripted) + Browser SpeechSynthesis (dynamic)
- **Video**: 14 pre-recorded H.264 MP4 clips (dual-buffer crossfade)
- **Hosting**: Vercel Edge (global CDN, immutable caching)

## Quick Start

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
# Optional: AGNES_AI_API_KEY (works without it — uses cached responses)

# 3. Supabase — run supabase/migration.sql in SQL Editor

# 4. Audio — place golden MP3 tracks in public/audio/
#    (see public/audio/README.md for exact filenames & scripts)

# 5. Dev
npm run dev
```

## Production

```bash
npm run build
vercel --prod
```

## Agnes AI Integration (Hardcoded Free-Tier Optimized)

- **Model**: `agnes-2.0-flash` (1,500 free requests per 5 hours)
- **Endpoint**: `https://apihub.agnes-ai.com/v1/chat/completions`
- **Auth**: `Authorization: Bearer YOUR_API_KEY`
- **Max tokens**: 120 (minimal response, saves quota)
- **Context sent**: Last 2 messages only (not full history)
- **Timeout**: 3 seconds hard cap → instant fallback
- **Quick cache**: 6 regex patterns serve common inputs without API call
- **No TTS/STT from Agnes**: Browser-native APIs handle all audio

## File Structure

```
├── app/
│   ├── api/
│   │   ├── lead/route.ts    # Lazy Supabase init, graceful offline
│   │   └── chat/route.ts    # 6 quick-cache + Agnes fallback (3s timeout)
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx             # Orchestrator: golden MP3 → browser TTS → video
│   ├── not-found.tsx
│   └── global-error.tsx
├── components/
│   ├── avatar/
│   │   ├── HologramPortal.tsx       # Dual-buffer video crossfade
│   │   └── ConversationContainer.tsx # Full conversation UI
│   └── ui/
│       ├── SpeechBubble.tsx         # Glassmorphism text display
│       ├── ChipSelector.tsx         # Spring-animated tap chips
│       ├── LeadCapture.tsx          # WhatsApp number form
│       ├── MicButton.tsx            # Voice trigger with pulse
│       └── AmbientBackground.tsx    # Morphing blob background
├── hooks/
│   ├── useSpeechRecognition.ts      # Web Speech API (hi-IN)
│   ├── useAudioPlayer.ts            # Golden MP3 playback
│   ├── useBrowserTTS.ts             # SpeechSynthesis for dynamic text
│   └── useConversationOrchestrator.ts # Full state machine
├── lib/avatar/
│   ├── decisionEngine.ts    # Weighted FSM, 18 clip keys, emotion mapping
│   ├── leadCapture.ts       # Lead submission client
│   └── agnesClient.ts       # 4s timeout, 2-msg trim, fallback
├── public/
│   ├── videos/              # 14 MP4 clips in 5 subfolders
│   └── audio/               # Golden Hindi tracks (upload separately)
├── supabase/
│   └── migration.sql        # Full schema + RLS + indexes
├── vercel.json              # Immutable caching for video/audio
├── middleware.ts            # Security headers
└── .env.example
```

## Latency Budget

| Stage | Component | Location | Target |
|-------|-----------|----------|--------|
| Speech Detection | Web Speech API | Client | <5ms |
| Quick Cache Match | Regex patterns | Edge | <1ms |
| Clip Decision | Weighted FSM | Client Memory | <0.1ms |
| Video Swap | Dual-Buffer Opacity | Client Decoder | 0ms |
| Golden Audio | Pre-cached MP3 | Client Cache | <10ms |
| Browser TTS | SpeechSynthesis | Client | <50ms |
| AI Fallback | Agnes 2.0 Flash | Edge (3s cap) | ~200ms |
| Lead Insert | Supabase REST | Edge → DB | <35ms |

## License

Private — Kalki Intelligence, Indore, MP
