// src/lib/env.ts
export function getEnvVariable(name: string): string | undefined {
  // Next.js automatically injects NEXT_PUBLIC_ variables on client
  const value = process.env[name];
  console.log(`getEnvVariable: ${name} =`, value);
  return value;
}