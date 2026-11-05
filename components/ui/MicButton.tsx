'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MicButtonProps {
  isListening: boolean;
  isSpeaking: boolean;
  onToggle: () => void;
  isSupported: boolean;
}

export default function MicButton({ isListening, isSpeaking, onToggle, isSupported }: MicButtonProps) {
  if (!isSupported) return null;

  const isActive = isListening || isSpeaking;

  const activeColor = isListening
    ? { bg: 'bg-red-500/20', border: 'border-red-400/60', shadow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]', ring: 'border-red-400/40', text: 'text-red-400' }
    : { bg: 'bg-siddhi-cyan/20', border: 'border-siddhi-cyan/60', shadow: 'shadow-[0_0_30px_rgba(0,242,254,0.3)]', ring: 'border-siddhi-cyan/40', text: 'text-siddhi-cyan' };

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onToggle}
      className={`relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
        isActive
          ? `${activeColor.bg} border-2 ${activeColor.border} ${activeColor.shadow}`
          : 'bg-white/[0.07] backdrop-blur-md border border-white/[0.12] hover:bg-white/[0.12] shadow-[0_4px_20px_rgba(0,242,254,0.08)]'
      }`}
    >
      {isListening && (
        <>
          <motion.div
            className={`absolute inset-0 rounded-full border-2 ${activeColor.ring}`}
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className={`absolute inset-0 rounded-full border-2 ${activeColor.ring}`}
            animate={{ scale: [1, 1.7, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </>
      )}

      {isSpeaking && !isListening && (
        <motion.div
          className={`absolute inset-0 rounded-full border-2 ${activeColor.ring}`}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <svg
        className={`w-6 h-6 transition-colors ${isActive ? activeColor.text : 'text-white/70'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        {isListening ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        )}
      </svg>
    </motion.button>
  );
}
