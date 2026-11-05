'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HologramPortal from '@/components/avatar/HologramPortal';
import SpeechBubble from '@/components/ui/SpeechBubble';
import ChipSelector from '@/components/ui/ChipSelector';
import LeadCapture from '@/components/ui/LeadCapture';
import MicButton from '@/components/ui/MicButton';
import type { ConversationPhase } from '@/hooks/useConversationOrchestrator';
import type { AvatarState } from '@/lib/avatar/avatarStateMachine';

interface ConversationContainerProps {
  phase: ConversationPhase;
  avatarState: AvatarState;
  displayText: string;
  chips: string[];
  userName: string;
  isProcessing: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isSpeechSupported: boolean;
  onChipSelect: (chip: string) => void;
  onPhoneSubmit: (phone: string) => void;
  onMicToggle: () => void;
  onStart: () => void;
  onClipComplete: () => void;
  interimTranscript: string;
}

export default function ConversationContainer({
  phase,
  avatarState,
  displayText,
  chips,
  userName,
  isProcessing,
  isListening,
  isSpeaking,
  isSpeechSupported,
  onChipSelect,
  onPhoneSubmit,
  onMicToggle,
  onStart,
  onClipComplete,
  interimTranscript,
}: ConversationContainerProps) {
  const showLeadForm = phase === 'CAPTURING_PHONE';
  const showChips = chips.length > 0 && !showLeadForm;
  const isStarted = phase !== 'INIT';

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-6 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-6"
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-siddhi-cyan via-white to-siddhi-purple bg-clip-text text-transparent">
          कल्कि इंटेलिजेंस
        </h1>
        <p className="text-white/40 text-xs mt-1 tracking-wider uppercase">
          AI Solutions — Indore, MP
        </p>
      </motion.div>

      <motion.div
        layout
        className="w-full flex flex-col items-center gap-5"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <HologramPortal
          avatarState={avatarState}
          onClipComplete={onClipComplete}
          className="w-[280px] h-[380px] sm:w-[320px] sm:h-[440px]"
        />

        <AnimatePresence>
          {isStarted && (isListening || isSpeaking || isProcessing) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2"
            >
              {isListening && !isProcessing && (
                <span className="flex items-center gap-1.5 text-red-400/80 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  सुन रही हूँ...
                </span>
              )}
              {isProcessing && (
                <span className="flex items-center gap-1.5 text-yellow-400/80 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  सोच रही हूँ...
                </span>
              )}
              {isSpeaking && !isListening && !isProcessing && (
                <span className="flex items-center gap-1.5 text-siddhi-cyan/80 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-siddhi-cyan animate-pulse" />
                  बोल रही हूँ...
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!isStarted ? (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onStart}
            className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-siddhi-cyan/20 to-siddhi-purple/20 border border-siddhi-cyan/30 text-white font-semibold text-lg cursor-pointer shadow-[0_8px_32px_rgba(0,242,254,0.1)] hover:shadow-[0_12px_48px_rgba(0,242,254,0.2)] transition-shadow"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-2xl">🙏</span>
              सिद्धि से बात करें
            </span>
          </motion.button>
        ) : (
          <>
            <div className="w-full max-w-sm">
              <SpeechBubble
                text={displayText}
                isVisible={!!displayText}
                isTyping={isProcessing}
              />
            </div>

            <AnimatePresence>
              {interimTranscript && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-white/40 text-sm italic text-center max-w-sm"
                >
                  &ldquo;{interimTranscript}&rdquo;
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-full max-w-sm">
              <ChipSelector
                chips={chips}
                onSelect={onChipSelect}
                isVisible={showChips}
              />
            </div>

            <div className="w-full max-w-sm">
              <LeadCapture
                isVisible={showLeadForm}
                onSubmit={onPhoneSubmit}
                userName={userName}
              />
            </div>

            <div className="flex items-center gap-4">
              <MicButton
                isListening={isListening}
                isSpeaking={isSpeaking}
                onToggle={onMicToggle}
                isSupported={isSpeechSupported}
              />

              {phase === 'SUCCESS' && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onChipSelect('शुरू से बात करें')}
                  className="px-5 py-2.5 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.1] text-white/70 text-sm font-medium cursor-pointer hover:bg-white/[0.1] transition-all"
                >
                  नई बातचीत
                </motion.button>
              )}
            </div>
          </>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-auto pt-6 text-center"
      >
        <p className="text-white/20 text-[10px] tracking-widest uppercase">
          Powered by Agnes AI — Zero GPU Architecture
        </p>
      </motion.div>
    </div>
  );
}
