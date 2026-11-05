'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  evaluateDecisionSync,
  getIdleDecision,
  type DecisionResult,
} from '@/lib/avatar/decisionEngine';
import {
  createInitialState,
  transitionToIdle,
  transitionToListening,
  transitionToThinking,
  transitionToSpeaking,
  transitionToSpeakingLoop,
  type AvatarState,
} from '@/lib/avatar/avatarStateMachine';
import { submitLead, type LeadData } from '@/lib/avatar/leadCapture';
import { sendToAgnesAI, type ChatMessage } from '@/lib/avatar/agnesClient';

export type ConversationPhase =
  | 'INIT'
  | 'GREETING'
  | 'ASKING_NAME'
  | 'ASKING_BUSINESS'
  | 'QUALIFYING'
  | 'CAPTURING_PHONE'
  | 'SUCCESS'
  | 'FALLBACK_CHAT';

interface ConversationState {
  phase: ConversationPhase;
  step: number;
  userName: string;
  businessName: string;
  industry: string;
  phone: string;
  lastDecision: DecisionResult;
  avatarState: AvatarState;
  displayText: string;
  chips: string[];
  isProcessing: boolean;
  leadSubmitted: boolean;
  messages: ChatMessage[];
  lastInput: string;
  isUserSpeaking: boolean;
}

const SERVICE_CHIPS = [
  'Scale Leads & Sales',
  'AI Bots & Automation',
  'Web / App Development',
];

export function useConversationOrchestrator() {
  const [state, setState] = useState<ConversationState>({
    phase: 'INIT',
    step: 0,
    userName: '',
    businessName: '',
    industry: '',
    phone: '',
    lastDecision: getIdleDecision(),
    avatarState: createInitialState(),
    displayText: '',
    chips: [],
    isProcessing: false,
    leadSubmitted: false,
    messages: [],
    lastInput: '',
    isUserSpeaking: false,
  });

  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    const currentPhase = stateRef.current.phase;
    if (currentPhase === 'SUCCESS' || currentPhase === 'INIT') return;

    inactivityTimer.current = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        avatarState: transitionToSpeaking('NUDGE', 'warm'),
        displayText: 'कुछ पूछना चाहते हैं? बस बोलिए या टाइप कीजिए!',
        lastDecision: evaluateDecisionSync('', prev.step, prev.userName, 'nudge'),
      }));
    }, 15000);
  }, []);

  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [state.phase, resetInactivityTimer]);

  const startConversation = useCallback(() => {
    const decision = evaluateDecisionSync('', 0);
    setState((prev) => ({
      ...prev,
      phase: 'GREETING',
      step: 0,
      lastDecision: decision,
      avatarState: transitionToSpeaking(decision.clipKey, decision.emotion),
      displayText: decision.spokenText,
      chips: ['जी हाँ, बताता हूँ', 'बाद में बात करें'],
    }));
  }, []);

  const handleClipComplete = useCallback(() => {
    const s = stateRef.current;
    if (s.avatarState.phase === 'SPEAKING' && !s.isUserSpeaking) {
      setState((prev) => ({
        ...prev,
        avatarState: transitionToIdle(),
      }));
    }
  }, []);

  const handleUserStartSpeaking = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isUserSpeaking: true,
      avatarState: transitionToListening(),
    }));
  }, []);

  const handleUserStopSpeaking = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isUserSpeaking: false,
    }));
  }, []);

  const setListeningAvatar = useCallback(() => {
    setState((prev) => ({
      ...prev,
      avatarState: transitionToListening(),
      displayText: 'सुन रही हूँ... बोलिए',
      chips: [],
    }));
  }, []);

  const setThinkingAvatar = useCallback(() => {
    setState((prev) => ({
      ...prev,
      avatarState: transitionToThinking(),
      displayText: 'सोच रही हूँ...',
      chips: [],
    }));
  }, []);

  const processUserInput = useCallback(
    async (input: string) => {
      if (!input.trim()) return;

      setState((prev) => ({
        ...prev,
        isProcessing: true,
        lastInput: input,
        isUserSpeaking: false,
        avatarState: transitionToThinking(),
        displayText: 'सोच रही हूँ...',
        chips: [],
      }));

      resetInactivityTimer();

      const s = stateRef.current;
      const newMessages: ChatMessage[] = [
        ...s.messages,
        { role: 'user' as const, content: input },
      ];

      if (s.phase === 'ASKING_NAME' || (s.phase === 'GREETING' && s.step >= 1)) {
        if (!s.userName && input.length > 1) {
          const name = input.replace(/जी|ji|sir|madam|my name is|mera naam/gi, '').trim();
          const decision = evaluateDecisionSync(input, s.step, name, 'greeting');
          setState((prev) => ({
            ...prev,
            userName: name,
            phase: 'ASKING_BUSINESS',
            step: decision.nextStep,
            lastDecision: decision,
            avatarState: transitionToSpeaking(decision.clipKey, decision.emotion),
            displayText: decision.spokenText,
            chips: [],
            isProcessing: false,
            messages: newMessages,
          }));
          return;
        }
      }

      if (s.phase === 'ASKING_BUSINESS') {
        const business = input.trim();
        const decision = evaluateDecisionSync(input, s.step, s.userName, 'business');
        setState((prev) => ({
          ...prev,
          businessName: business,
          industry: input,
          phase: 'QUALIFYING',
          step: decision.nextStep,
          lastDecision: decision,
          avatarState: transitionToSpeaking(decision.clipKey, decision.emotion),
          displayText: decision.spokenText,
          chips: SERVICE_CHIPS,
          isProcessing: false,
          messages: newMessages,
        }));
        return;
      }

      if (s.phase === 'QUALIFYING') {
        const decision = evaluateDecisionSync(input, s.step, s.userName, 'service');
        setState((prev) => ({
          ...prev,
          phase: 'CAPTURING_PHONE',
          step: 3,
          lastDecision: decision,
          avatarState: transitionToSpeaking(decision.clipKey, decision.emotion),
          displayText: decision.spokenText,
          chips: ['WhatsApp नंबर दें', 'बाद में बताता हूँ'],
          isProcessing: false,
          messages: newMessages,
        }));
        return;
      }

      if (s.phase === 'CAPTURING_PHONE') {
        const phoneClean = input.replace(/\D/g, '').slice(-10);
        if (phoneClean.length === 10) {
          const leadData: LeadData = {
            name: s.userName || 'Indian Founder',
            businessName: s.businessName || 'Not Specified',
            phone: phoneClean,
            industry: s.industry || 'General',
            serviceInterest: s.lastInput,
            transcript: newMessages.map((m, i) => ({
              role: m.role,
              text: m.content,
              timestamp: i,
            })),
          };

          const result = await submitLead(leadData);
          const decision = evaluateDecisionSync('', 4, s.userName);

          setState((prev) => ({
            ...prev,
            phone: phoneClean,
            phase: 'SUCCESS',
            step: 5,
            lastDecision: decision,
            avatarState: transitionToSpeaking('THANKS', 'warm'),
            displayText: decision.spokenText,
            chips: result.success ? ['धन्यवाद!', 'और जानें'] : ['ठीक है'],
            leadSubmitted: result.success,
            isProcessing: false,
            messages: newMessages,
          }));
          return;
        }

        const clarifyDecision = evaluateDecisionSync('', s.step, s.userName, 'clarify');
        setState((prev) => ({
          ...prev,
          displayText: 'कृपया सही 10 अंकों का WhatsApp नंबर बताइए।',
          avatarState: transitionToSpeaking('CLARIFY', 'neutral'),
          lastDecision: clarifyDecision,
          chips: ['नंबर दर्ज करें'],
          isProcessing: false,
        }));
        return;
      }

      if (s.phase === 'SUCCESS') {
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          avatarState: transitionToIdle(),
          displayText:
            'आपका दिन शुभ और मंगलमय हो! किसी भी सवाल के लिए हम यहाँ हैं।',
          chips: ['शुरू से बात करें', 'धन्यवाद'],
        }));
        return;
      }

      try {
        const aiResponse = await sendToAgnesAI(newMessages, {
          userName: s.userName,
          businessName: s.businessName,
          step: s.step,
        });

        const decision = evaluateDecisionSync(
          aiResponse.speech,
          s.step,
          s.userName,
          aiResponse.detected_track || undefined,
        );

        setState((prev) => ({
          ...prev,
          lastDecision: decision,
          avatarState: transitionToSpeakingLoop(decision.emotion),
          displayText: aiResponse.speech,
          chips: aiResponse.chips.length > 0 ? aiResponse.chips : SERVICE_CHIPS,
          isProcessing: false,
          messages: [
            ...newMessages,
            { role: 'assistant' as const, content: aiResponse.speech },
          ],
        }));
      } catch {
        const fallbackDecision = evaluateDecisionSync('', s.step, s.userName, 'error');
        setState((prev) => ({
          ...prev,
          lastDecision: fallbackDecision,
          avatarState: transitionToSpeakingLoop('empathetic'),
          displayText: 'कृपया अपना WhatsApp नंबर बताइए!',
          chips: ['नंबर दें', 'बाद में'],
          isProcessing: false,
        }));
      }
    },
    [resetInactivityTimer],
  );

  const handleChipClick = useCallback(
    (chip: string) => {
      const cleanChip = chip.replace(/[🚀🤖💻📱🎉]/g, '').trim();

      if (cleanChip === 'ठीक है' || cleanChip === 'शुरू से बात करें') {
        setState({
          phase: 'INIT',
          step: 0,
          userName: '',
          businessName: '',
          industry: '',
          phone: '',
          lastDecision: getIdleDecision(),
          avatarState: createInitialState(),
          displayText: '',
          chips: [],
          isProcessing: false,
          leadSubmitted: false,
          messages: [],
          lastInput: '',
          isUserSpeaking: false,
        });
        return;
      }

      if (cleanChip === 'धन्यवाद' || cleanChip === 'बाद में बात करें') {
        return;
      }

      processUserInput(cleanChip);
    },
    [processUserInput],
  );

  return {
    state,
    startConversation,
    processUserInput,
    handleChipClick,
    handleClipComplete,
    handleUserStartSpeaking,
    handleUserStopSpeaking,
    setListeningAvatar,
    setThinkingAvatar,
    resetInactivityTimer,
  };
}
