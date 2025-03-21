/**
 * Categorizes and formats error messages for consistent error handling
 */
export function categorizeError(err: unknown): string {
  if (err instanceof Error) {
    const message = err.message.toLowerCase();
    
    if (message.includes('team')) {
      return `Team configuration error: ${err.message}`;
    }
    if (message.includes('api key')) {
      return 'Authentication error: Please check your Linear API key.';
    }
    if (message.includes('permission')) {
      return 'Permission error: Your API key may not have the required access.';
    }
    
    return err.message;
  }
  
  return 'Failed to complete operation. Please check your Linear configuration.';
}
