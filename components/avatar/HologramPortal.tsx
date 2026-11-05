'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { AvatarState } from '@/lib/avatar/avatarStateMachine';

interface HologramPortalProps {
  avatarState: AvatarState;
  onClipComplete?: () => void;
  className?: string;
}

export default function HologramPortal({
  avatarState,
  onClipComplete,
  className = '',
}: HologramPortalProps) {
  const vidA = useRef<HTMLVideoElement>(null);
  const vidB = useRef<HTMLVideoElement>(null);
  const [activeBuffer, setActiveBuffer] = useState<'A' | 'B'>('A');
  const [isReady, setIsReady] = useState(false);
  const currentClipRef = useRef<string>('');
  const onClipCompleteRef = useRef(onClipComplete);
  onClipCompleteRef.current = onClipComplete;

  const getActivePlayer = useCallback(
    () => (activeBuffer === 'A' ? vidA.current : vidB.current),
    [activeBuffer],
  );

  const getInactivePlayer = useCallback(
    () => (activeBuffer === 'A' ? vidB.current : vidA.current),
    [activeBuffer],
  );

  useEffect(() => {
    const { videoUrl, mode } = avatarState;

    if (videoUrl === currentClipRef.current) return;
    currentClipRef.current = videoUrl;

    const nextPlayer = getInactivePlayer();
    const currentPlayer = getActivePlayer();
    if (!nextPlayer) return;

    nextPlayer.src = videoUrl;
    nextPlayer.loop = mode === 'loop';
    nextPlayer.load();

    const canPlay = () => {
      nextPlayer
        .play()
        .then(() => {
          if (currentPlayer) {
            currentPlayer.style.opacity = '0';
            currentPlayer.style.zIndex = '1';
          }
          nextPlayer.style.opacity = '1';
          nextPlayer.style.zIndex = '2';
          setActiveBuffer(activeBuffer === 'A' ? 'B' : 'A');
          setIsReady(true);
        })
        .catch(() => {});
    };

    nextPlayer.oncanplay = canPlay;

    nextPlayer.onended = () => {
      if (mode === 'once' && onClipCompleteRef.current) {
        onClipCompleteRef.current();
      }
    };

    return () => {
      nextPlayer.oncanplay = null;
      nextPlayer.onended = null;
    };
  }, [avatarState.videoUrl, avatarState.mode, getActivePlayer, getInactivePlayer, activeBuffer]);

  useEffect(() => {
    const { prefetchedUrl } = avatarState;
    if (!prefetchedUrl) return;

    const currentPlayer = getActivePlayer();
    if (!currentPlayer) return;

    const prefetchVideo = document.createElement('video');
    prefetchVideo.preload = 'auto';
    prefetchVideo.src = prefetchedUrl;
    prefetchVideo.load();
  }, [avatarState.prefetchedUrl, getActivePlayer]);

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_50%_60%,rgba(0,242,254,0.12)_0%,transparent_70%)] border border-cyan-500/20 shadow-[0_0_60px_rgba(0,242,254,0.12)] ${className}`}
    >
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-44 h-3 rounded-full border border-cyan-400/60 shadow-[0_0_20px_#00f2fe] opacity-60 animate-pulse pointer-events-none z-10" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-10 rounded-[28px]" />

      <video
        ref={vidA}
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none opacity-1"
        style={{ zIndex: activeBuffer === 'A' ? 2 : 1 }}
      />

      <video
        ref={vidB}
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none opacity-0"
        style={{ zIndex: activeBuffer === 'B' ? 2 : 1 }}
      />

      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-siddhi-dark/80 z-20">
          <div className="w-12 h-12 border-2 border-siddhi-cyan/30 border-t-siddhi-cyan rounded-full animate-spin" />
        </div>
      )}

      <PhaseIndicator phase={avatarState.phase} emotion={avatarState.emotion} />
    </div>
  );
}

function PhaseIndicator({ phase, emotion }: { phase: string; emotion: string }) {
  const phaseColors: Record<string, string> = {
    IDLE: 'bg-white/20',
    LISTENING: 'bg-blue-400/30',
    THINKING: 'bg-yellow-400/30',
    SPEAKING: 'bg-siddhi-cyan/30',
  };

  return (
    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${phaseColors[phase] || 'bg-white/20'} animate-pulse`} />
      <span className="text-[9px] text-white/30 uppercase tracking-wider font-medium">
        {phase === 'SPEAKING' ? emotion : phase}
      </span>
    </div>
  );
}
