/**
 * Categorizes and formats error messages for consistent error handling
 */
import { LinearError, LinearErrorType } from '@linear/sdk';

export function categorizeError(error: unknown): string {
  if (error instanceof LinearError) {
    // Handle Linear-specific errors with proper type checking
    const errorType = error.type;

    // Map error types to user-friendly messages
    const errorMessages: Record<string, string> = {
      authentication_error: 'Authentication failed. Please check your Linear API key.',
      not_found: 'The requested resource was not found. Please check your Linear configuration.',
      ratelimited: 'Rate limit exceeded. Please try again later.',
      validation_error: 'Invalid data provided. Please check your input.',
      network_error: 'Network error occurred. Please check your internet connection.',
      bad_request: 'Invalid request. Please check your input.',
      lock_timeout: 'Operation timed out. Please try again.',
      internal_error: 'An internal server error occurred. Please try again later.'
    };

    return errorType ? errorMessages[errorType] || `Linear API error: ${error.message}` : 'Unknown Linear API error';
  }

  if (error instanceof Error) {
    // Handle specific error cases with improved context
    const message = error.message.toLowerCase();
    
    if (message.includes('team')) {
      return 'No team found. Please create a team in Linear before creating issues.';
    }
    if (message.includes('label')) {
      return 'Error loading issue labels. Some labels may not be displayed correctly.';
    }
    if (message.includes('api key')) {
      return 'Authentication error: Please check your Linear API key.';
    }
    if (message.includes('permission')) {
      return 'Permission error: Your API key may not have the required access.';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}
