# Video Assets — 18-Clip Matrix (14 Available + 4 Smart Fallbacks)

## Folder Structure

```
public/videos/
├── 01_BASE/          → Continuous ambient loops
├── 02_FUNNEL/        → Core 5-step lead capture flow
├── 03_SPEAK/         → Dynamic conversational responses
├── 04_REACT/         → Micro-gestures & recovery
└── 05_OBJECTION/     → Trust & objection busters
```

## Available Clips (14)

### 01_BASE — Ambient Loops
| File | Emotion | Duration | Loop |
|------|---------|----------|------|
| v01_base_idle.mp4 | Neutral breathing, micro-blinks, warm smile | 4s | ✅ Yes |
| v03_base_think.mp4 | Glances up-right, finger taps chin, processing | 3s | ✅ Yes |

### 02_FUNNEL — Lead Capture Flow
| File | Emotion | Duration | Loop |
|------|---------|----------|------|
| v04_fn_greet.mp4 | Elegant Namaste greeting, hands unfold | 6s | ❌ No |
| v05_fn_biz.mp4 | Warm smile, open palm gesture | 5s | ❌ No |
| v06_fn_cheer.mp4 | Animated joyful smile, soft clap | 4.5s | ❌ No |
| v07_fn_point.mp4 | Looks at HUD, types, points downward | 6.5s | ❌ No |

### 03_SPEAK — Dynamic Responses
| File | Emotion | Duration | Loop |
|------|---------|----------|------|
| v09_spk_vision.mp4 | Big upward tech/scale gestures | 5.5s | ❌ No |
| v10_spk_empathy.mp4 | Sincere hand on chest, understanding | 5s | ❌ No |
| v11_spk_firm.mp4 | Confident, authoritative delivery | 5s | ❌ No |

### 04_REACT — Micro-Gestures
| File | Emotion | Duration | Loop |
|------|---------|----------|------|
| v14_rx_nudge.mp4 | Playful lean-in, point to chips | 4s | ❌ No |
| v15_rx_exit.mp4 | Open hand up, "wait a second" | 4s | ❌ No |

### 05_OBJECTION — Trust Busters
| File | Emotion | Duration | Loop |
|------|---------|----------|------|
| v16_obj_price.mp4 | Palms open forward, transparent rate | 5.5s | ❌ No |
| v17_obj_time.mp4 | Index finger tap, 24h timeline | 4.5s | ❌ No |
| v18_obj_trust.mp4 | Hand over heart, Indore/DP Act trust | 5s | ❌ No |

## Smart Fallback Mapping (4 Missing Clips)

| Missing Clip | Fallback To | Reason |
|-------------|-------------|--------|
| v02_base_listen.mp4 | v01_base_idle.mp4 | Breathing loop works for listening state |
| v08_fn_thanks.mp4 | v04_fn_greet.mp4 | Namaste gesture is close enough for success |
| v12_rx_nod.mp4 | v11_spk_firm.mp4 | Confident posture works for agreement |
| v13_rx_clarify.mp4 | v03_base_think.mp4 | Thinking face works for "didn't catch that" |

## Video Specs

- **Codec**: H.264 MP4
- **Audio**: NONE (strip with `ffmpeg -i input.mp4 -an -c:v copy output.mp4`)
- **Framing**: Medium-close, tripod, fixed collarbone position
- **Background**: Even green screen (#00FF00) or clean studio
