import { LinearClient } from '@linear/sdk';

// Initialize Linear client
export const getLinearClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_LINEAR_API_KEY;
  if (!apiKey) {
    throw new Error('Linear API key not found');
  }
  return new LinearClient({ apiKey });
};
