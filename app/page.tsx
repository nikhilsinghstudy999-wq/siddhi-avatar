'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import AmbientBackground from '@/components/ui/AmbientBackground';
import ConversationContainer from '@/components/avatar/ConversationContainer';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useBrowserTTS } from '@/hooks/useBrowserTTS';
import { useConversationOrchestrator } from '@/hooks/useConversationOrchestrator';

export default function SiddhiLandingPage() {
  const {
    state,
    startConversation,
    processUserInput,
    handleChipClick,
    handleClipComplete,
    handleUserStartSpeaking,
    handleUserStopSpeaking,
    setListeningAvatar,
  } = useConversationOrchestrator();

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    resetTranscript,
    isSupported: isSpeechSupported,
    hasInterim,
  } = useSpeechRecognition();

  const prevSpokenText = useRef<string | undefined>(undefined);
  const isTTSActive = useRef(false);
  const conversationStarted = useRef(false);
  const bargeInCooldown = useRef(false);

  const onTTSStart = useCallback(() => {
    isTTSActive.current = true;
  }, []);

  const onTTSEnd = useCallback(() => {
    isTTSActive.current = false;
    handleClipComplete();
  }, [handleClipComplete]);

  const { speak, stop: stopTTS, isSpeaking } = useBrowserTTS(onTTSStart, onTTSEnd);

  useEffect(() => {
    const unlock = () => {
      window.speechSynthesis?.getVoices();
      const warmup = new SpeechSynthesisUtterance('');
      warmup.volume = 0;
      window.speechSynthesis?.speak(warmup);
    };
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
    };
  }, []);

  // Barge-in: if user starts speaking while avatar is talking, cancel TTS
  useEffect(() => {
    if (hasInterim && isTTSActive.current && !bargeInCooldown.current) {
      bargeInCooldown.current = true;
      stopTTS();
      pauseListening();
      setTimeout(() => {
        resumeListening();
        bargeInCooldown.current = false;
      }, 300);
    }
  }, [hasInterim, stopTTS, pauseListening, resumeListening]);

  // Realtime avatar reaction: user starts speaking → LISTENING avatar
  useEffect(() => {
    if (hasInterim && !isTTSActive.current) {
      handleUserStartSpeaking();
    }
  }, [hasInterim, handleUserStartSpeaking]);

  // Final transcript arrived → process input
  useEffect(() => {
    if (transcript && !isListening) {
      handleUserStopSpeaking();
      processUserInput(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, processUserInput, resetTranscript, handleUserStopSpeaking]);

  // Avatar speaks when decision changes
  useEffect(() => {
    const decision = state.lastDecision;

    if (decision.spokenText && decision.spokenText !== prevSpokenText.current) {
      prevSpokenText.current = decision.spokenText;
      stopTTS();
      speak(decision.spokenText);
    }
  }, [state.lastDecision.spokenText, speak, stopTTS]);

  const handleMicToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      stopTTS();
      resetTranscript();
      setListeningAvatar();
      startListening();
    }
  }, [isListening, startListening, stopListening, resetTranscript, setListeningAvatar, stopTTS]);

  const handleStart = useCallback(() => {
    conversationStarted.current = true;
    startConversation();
    setTimeout(() => {
      startListening();
    }, 500);
  }, [startConversation, startListening]);

  const handlePhoneSubmit = useCallback(
    (phone: string) => {
      processUserInput(phone);
    },
    [processUserInput],
  );

  return (
    <main className="relative min-h-screen">
      <AmbientBackground />
      <ConversationContainer
        phase={state.phase}
        avatarState={state.avatarState}
        displayText={state.displayText}
        chips={state.chips}
        userName={state.userName}
        isProcessing={state.isProcessing}
        isListening={isListening}
        isSpeaking={isSpeaking}
        isSpeechSupported={isSpeechSupported}
        onChipSelect={handleChipClick}
        onPhoneSubmit={handlePhoneSubmit}
        onMicToggle={handleMicToggle}
        onStart={handleStart}
        onClipComplete={handleClipComplete}
        interimTranscript={interimTranscript}
      />
    </main>
  );
}
