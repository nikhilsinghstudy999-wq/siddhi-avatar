'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  pauseListening: () => void;
  resumeListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
  hasInterim: boolean;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [hasInterim, setHasInterim] = useState(false);
  const recognitionRef = useRef<any>(null);
  const shouldRestartRef = useRef(false);
  const restartDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userStoppedRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'hi-IN';
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      if (final) {
        setTranscript(final.trim());
        setInterimTranscript('');
        setHasInterim(false);
      }
      if (interim) {
        setInterimTranscript(interim);
        setHasInterim(true);
      }
    };

    recognition.onend = () => {
      if (shouldRestartRef.current && !userStoppedRef.current) {
        restartDelayRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch {}
        }, 50);
      } else {
        setIsListening(false);
        setHasInterim(false);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        shouldRestartRef.current = false;
        setIsListening(false);
        return;
      }
      if (shouldRestartRef.current && !userStoppedRef.current) {
        restartDelayRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch {}
        }, 100);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldRestartRef.current = false;
      if (restartDelayRef.current) clearTimeout(restartDelayRef.current);
      try { recognition.abort(); } catch {}
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    userStoppedRef.current = false;
    shouldRestartRef.current = true;
    setTranscript('');
    setInterimTranscript('');
    setHasInterim(false);
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {}
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    userStoppedRef.current = true;
    shouldRestartRef.current = false;
    if (restartDelayRef.current) clearTimeout(restartDelayRef.current);
    try {
      recognitionRef.current.stop();
    } catch {}
    setIsListening(false);
    setHasInterim(false);
  }, []);

  const pauseListening = useCallback(() => {
    if (!recognitionRef.current) return;
    userStoppedRef.current = true;
    shouldRestartRef.current = false;
    if (restartDelayRef.current) clearTimeout(restartDelayRef.current);
    try {
      recognitionRef.current.stop();
    } catch {}
  }, []);

  const resumeListening = useCallback(() => {
    if (!recognitionRef.current) return;
    userStoppedRef.current = false;
    shouldRestartRef.current = true;
    setTranscript('');
    setInterimTranscript('');
    setHasInterim(false);
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {}
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setHasInterim(false);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    resetTranscript,
    isSupported,
    hasInterim,
  };
}
