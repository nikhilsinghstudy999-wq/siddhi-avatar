'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LeadCaptureProps {
  isVisible: boolean;
  onSubmit: (phone: string) => void;
  userName: string;
}

export default function LeadCapture({ isVisible, onSubmit, userName }: LeadCaptureProps) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const clean = phone.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      setError('कृपया सही 10 अंकों का WhatsApp नंबर डालें');
      return;
    }

    setIsSubmitting(true);
    onSubmit(clean);
    setTimeout(() => {
      setIsSubmitting(false);
      setPhone('');
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.form
          initial={{ opacity: 0, y: 20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onSubmit={handleSubmit}
          className="w-full overflow-hidden"
        >
          <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,242,254,0.06)]">
            <label className="block text-xs text-white/50 mb-2 font-medium uppercase tracking-wider">
              {userName} जी, अपना WhatsApp नंबर दर्ज करें
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d\s-]/g, '');
                    setPhone(val);
                    setError('');
                  }}
                  placeholder="98765 43210"
                  maxLength={15}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-base font-medium placeholder:text-white/25 focus:outline-none focus:border-siddhi-cyan/50 focus:shadow-[0_0_20px_rgba(0,242,254,0.1)] transition-all"
                />
              </div>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-siddhi-orange to-orange-500 text-white font-semibold text-sm cursor-pointer disabled:opacity-50 shadow-[0_4px_20px_rgba(255,77,0,0.25)] hover:shadow-[0_6px_30px_rgba(255,77,0,0.35)] transition-shadow"
              >
                {isSubmitting ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  'भेजें'
                )}
              </motion.button>
            </div>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-xs mt-2 font-medium"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
