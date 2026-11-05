import { type ClipKey, CLIPS, isLoopingClip } from './decisionEngine';

export type AvatarPhase = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';

export type VideoMode = 'loop' | 'once';

export interface AvatarState {
  phase: AvatarPhase;
  currentClip: ClipKey;
  videoUrl: string;
  mode: VideoMode;
  emotion: string;
  prefetchedClip: ClipKey | null;
  prefetchedUrl: string | null;
}

const PREFETCH_MAP: Record<ClipKey, ClipKey> = {
  IDLE: 'THINK',
  LISTEN: 'THINK',
  THINK: 'VISION',
  GREET: 'BIZ',
  BIZ: 'CHEER',
  CHEER: 'POINT',
  POINT: 'THANKS',
  THANKS: 'IDLE',
  VISION: 'EMPATHY',
  EMPATHY: 'FIRM',
  FIRM: 'VISION',
  NOD: 'IDLE',
  CLARIFY: 'IDLE',
  NUDGE: 'IDLE',
  EXIT: 'IDLE',
  PRICE: 'POINT',
  TIME: 'POINT',
  TRUST: 'POINT',
};

const EMOTION_TO_SPEAK_CLIP: Record<string, ClipKey> = {
  confident: 'FIRM',
  visionary: 'VISION',
  excited: 'VISION',
  empathetic: 'EMPATHY',
  warm: 'EMPATHY',
  reassuring: 'FIRM',
  urgent: 'VISION',
  neutral: 'VISION',
};

export function createInitialState(): AvatarState {
  return {
    phase: 'IDLE',
    currentClip: 'IDLE',
    videoUrl: CLIPS.IDLE,
    mode: 'loop',
    emotion: 'neutral',
    prefetchedClip: 'THINK',
    prefetchedUrl: CLIPS.THINK,
  };
}

export function transitionToIdle(): AvatarState {
  return {
    phase: 'IDLE',
    currentClip: 'IDLE',
    videoUrl: CLIPS.IDLE,
    mode: 'loop',
    emotion: 'neutral',
    prefetchedClip: PREFETCH_MAP.IDLE,
    prefetchedUrl: CLIPS[PREFETCH_MAP.IDLE],
  };
}

export function transitionToListening(): AvatarState {
  return {
    phase: 'LISTENING',
    currentClip: 'IDLE',
    videoUrl: CLIPS.IDLE,
    mode: 'loop',
    emotion: 'neutral',
    prefetchedClip: 'THINK',
    prefetchedUrl: CLIPS.THINK,
  };
}

export function transitionToThinking(): AvatarState {
  return {
    phase: 'THINKING',
    currentClip: 'THINK',
    videoUrl: CLIPS.THINK,
    mode: 'loop',
    emotion: 'neutral',
    prefetchedClip: 'VISION',
    prefetchedUrl: CLIPS.VISION,
  };
}

export function transitionToSpeaking(clipKey: ClipKey, emotion: string): AvatarState {
  const prefetchKey = PREFETCH_MAP[clipKey] || 'IDLE';
  return {
    phase: 'SPEAKING',
    currentClip: clipKey,
    videoUrl: CLIPS[clipKey],
    mode: 'once',
    emotion,
    prefetchedClip: prefetchKey,
    prefetchedUrl: CLIPS[prefetchKey],
  };
}

export function transitionToSpeakingLoop(emotion: string): AvatarState {
  const clipKey = EMOTION_TO_SPEAK_CLIP[emotion] || 'VISION';
  const prefetchOptions: ClipKey[] = ['VISION', 'EMPATHY', 'FIRM'];
  const prefetchKey = prefetchOptions.find((k) => k !== clipKey) || 'EMPATHY';

  return {
    phase: 'SPEAKING',
    currentClip: clipKey,
    videoUrl: CLIPS[clipKey],
    mode: 'loop',
    emotion,
    prefetchedClip: prefetchKey,
    prefetchedUrl: CLIPS[prefetchKey],
  };
}

export { PREFETCH_MAP, EMOTION_TO_SPEAK_CLIP };
