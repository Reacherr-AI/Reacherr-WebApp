// src/components/useAgentForm.ts
import { useState } from 'react';
import { AgentFormData, AgentResponseDto, VoiceDto } from './AgentForm.types';

export const useAgentForm = (
  initialData: AgentResponseDto | Partial<AgentFormData> | null,
  availableNumbers: Record<string, string>,
  availableVoices: VoiceDto[]
) => {
  const [formData, setFormData] = useState<AgentFormData>(() => {
    const defaultVoice = availableVoices.length > 0 ? availableVoices[0] : { voiceId: '', speaker: '' };
    const defaultNumberId = Object.keys(availableNumbers).length > 0 ? parseInt(Object.keys(availableNumbers)[0], 10) : null;

    return {
      name: initialData?.name || '',
      description: initialData?.description || '',
      lang: initialData?.lang || 'English',
      numberId: initialData?.numberId || defaultNumberId,
      voice: initialData?.voice || defaultVoice,
      knowledgeBase: initialData?.knowledgeBase || [],
      pendingKnowledgeBases: [],
      welcomeMessage: initialData?.welcomeMessage || '',
      firstSpeaker: (initialData?.firstSpeaker as 'ai' | 'user' | 'ai_dynamic') || 'ai',
      userGreetingType: (initialData?.userGreetingType as 'static' | 'dynamic') || 'static',
      waitDuration: initialData?.waitDuration || 1000,
    };
  });

  return { formData, setFormData };
};