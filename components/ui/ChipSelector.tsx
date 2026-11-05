'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChipSelectorProps {
  chips: string[];
  onSelect: (chip: string) => void;
  isVisible: boolean;
}

export default function ChipSelector({ chips, onSelect, isVisible }: ChipSelectorProps) {
  if (!chips.length) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-wrap gap-2.5 justify-center"
        >
          {chips.map((chip, i) => (
            <motion.button
              key={chip}
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 25,
                delay: i * 0.08,
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(chip)}
              className="px-5 py-2.5 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/[0.12] text-white/90 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-siddhi-orange/20 hover:border-siddhi-orange/40 hover:text-white hover:shadow-[0_4px_20px_rgba(255,77,0,0.15)] active:scale-95"
            >
              {chip}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
