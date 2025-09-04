// src/hooks/useEnv.ts
'use client';

import { useState, useEffect } from 'react';

export function useEnvVariable(name: string): string | undefined {
  const [value, setValue] = useState<string | undefined>();

  useEffect(() => {
    // This runs only on client side
    setValue(process.env[name]);
  }, [name]);

  return value;
}

// Update your createAIService to use this hook in components