'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

interface UseBrowserTTSReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voiceName: string;
}

export function useBrowserTTS(onStart?: () => void, onEnd?: () => void): UseBrowserTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voiceName, setVoiceName] = useState('');
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const onStartRef = useRef(onStart);
  const onEndRef = useRef(onEnd);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const resolveRef = useRef<(() => void) | null>(null);
  onStartRef.current = onStart;
  onEndRef.current = onEnd;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;

      const hindiVoice =
        voices.find((v) => v.lang === 'hi-IN' && v.localService) ||
        voices.find((v) => v.lang === 'hi-IN') ||
        voices.find((v) => v.lang.startsWith('hi'));

      const indianEnglishVoice =
        voices.find((v) => v.lang === 'en-IN' && v.localService) ||
        voices.find((v) => v.lang === 'en-IN') ||
        voices.find((v) => v.lang.startsWith('en-IN'));

      const anyIndianVoice = voices.find(
        (v) => v.lang.includes('IN') || v.name.toLowerCase().includes('india'),
      );

      selectedVoiceRef.current = hindiVoice || indianEnglishVoice || anyIndianVoice || voices[0];

      if (selectedVoiceRef.current) {
        setVoiceName(selectedVoiceRef.current.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback(
    async (text: string): Promise<void> => {
      if (!isSupported || !text.trim()) return;

      window.speechSynthesis.cancel();

      return new Promise<void>((resolve) => {
        const cleanText = text
          .replace(/[🚀🤖💻📱🎉🙏]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (!cleanText) {
          resolve();
          return;
        }

        resolveRef.current = resolve;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = selectedVoiceRef.current?.lang.startsWith('hi') ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        utterance.volume = 1.0;

        if (selectedVoiceRef.current) {
          utterance.voice = selectedVoiceRef.current;
        }

        currentUtteranceRef.current = utterance;

        utterance.onstart = () => {
          setIsSpeaking(true);
          onStartRef.current?.();
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          currentUtteranceRef.current = null;
          resolveRef.current = null;
          onEndRef.current?.();
          resolve();
        };

        utterance.onerror = (e) => {
          if (e.error === 'canceled' || e.error === 'interrupted') {
            setIsSpeaking(false);
            currentUtteranceRef.current = null;
            resolveRef.current = null;
            resolve();
            return;
          }
          setIsSpeaking(false);
          currentUtteranceRef.current = null;
          resolveRef.current = null;
          resolve();
        };

        window.speechSynthesis.speak(utterance);

        const maxDuration = Math.max(cleanText.length * 120, 25000);
        setTimeout(() => {
          if (currentUtteranceRef.current === utterance && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            currentUtteranceRef.current = null;
            resolveRef.current = null;
            resolve();
          }
        }, maxDuration);
      });
    },
    [isSupported],
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    if (resolveRef.current) {
      resolveRef.current();
      resolveRef.current = null;
    }
    currentUtteranceRef.current = null;
  }, []);

  return { speak, stop, isSpeaking, isSupported, voiceName };
}
