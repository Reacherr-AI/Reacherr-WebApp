// src/components/useAgentForm.ts
import { useState } from 'react';
import { AgentFormData } from './AgentForm.types';

export const useAgentForm = (
  initialData: Partial<AgentFormData> | null,
  availableNumbers: Record<string, string>
) => {
  const [formData, setFormData] = useState<AgentFormData>(() => {
    const defaultNumberId = Object.keys(availableNumbers).length > 0 ? parseInt(Object.keys(availableNumbers)[0], 10) : null;

    return {
      name: initialData?.name || '',
      description: initialData?.description || '',
      numberId: initialData?.numberId || defaultNumberId,
    };
  });

  return { formData, setFormData };
};
