'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeechBubbleProps {
  text: string;
  isVisible: boolean;
  isTyping?: boolean;
}

export default function SpeechBubble({ text, isVisible, isTyping }: SpeechBubbleProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={text}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="relative"
        >
          <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl px-5 py-4 shadow-[0_8px_32px_rgba(0,242,254,0.08)]">
            <div className="absolute -top-2 left-8 w-4 h-4 bg-white/[0.06] border-l border-t border-white/[0.12] rotate-45 backdrop-blur-xl" />
            {isTyping ? (
              <div className="flex items-center gap-1.5 py-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-siddhi-cyan/60"
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-[15px] leading-relaxed text-white/90 font-medium">
                {text}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
