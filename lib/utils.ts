import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generatePassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }
  return password
}

/**
 * Centralized error message handler
 * Converts technical error messages to user-friendly messages
 * @param error - Error object or string
 * @param context - Optional context for context-specific error handling
 * @returns User-friendly error message
 */
export function getErrorMessage(error: any, context?: 'auth' | 'pdf' | 'password' | 'payment' | 'general'): string {
  const errorStr = String(error?.message || error?.toString() || error || '');
  const lowerError = errorStr.toLowerCase();

  // Authentication errors
  if (context === 'auth' || !context) {
    if (lowerError.includes('invalid login') || lowerError.includes('invalid credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (lowerError.includes('email not confirmed') || lowerError.includes('email_confirmed_at')) {
      return 'Please confirm your email before signing in. Check your inbox for the confirmation email.';
    }
    if (lowerError.includes('user not found')) {
      return 'No account found with this email. Please check your email address.';
    }
    if (lowerError.includes('authentication') || lowerError.includes('401') || lowerError.includes('unauthorized')) {
      return 'Authentication required. Please sign in again.';
    }
    if (lowerError.includes('session')) {
      return 'Your session has expired. Please sign in again.';
    }
  }

  // PDF errors
  if (context === 'pdf') {
    if (lowerError.includes('404') || lowerError.includes('not found')) {
      return 'PDF file not found. Please contact support.';
    }
    if (lowerError.includes('403') || lowerError.includes('access denied')) {
      return 'Access denied. Please ensure you have purchased this course.';
    }
    if (lowerError.includes('401') || lowerError.includes('authentication')) {
      return 'Authentication required. Please sign in again.';
    }
    if (lowerError.includes('network') || lowerError.includes('cors')) {
      return 'Network error. Please check your connection and try again.';
    }
  }

  // Password errors
  if (context === 'password') {
    if (lowerError.includes('same as')) {
      return 'New password must be different from current password';
    }
    if (lowerError.includes('weak')) {
      return 'Password is too weak. Please use a stronger password.';
    }
    if (lowerError.includes('session')) {
      return 'Your session has expired. Please sign in again.';
    }
  }

  // Payment/Account errors
  if (context === 'payment') {
    if (lowerError.includes('missing required environment variables')) {
      return 'Server configuration error. Please contact support.';
    }
    if (lowerError.includes('server error')) {
      return 'Server error. Please try again in a few minutes.';
    }
    if (lowerError.includes('failed to parse')) {
      return 'Communication error with server. Please try again.';
    }
    if (lowerError.includes('already exists')) {
      return 'An account with this email already exists. Please log in instead.';
    }
  }

  // General fallback
  return errorStr || 'An unexpected error occurred. Please try again.';
}
