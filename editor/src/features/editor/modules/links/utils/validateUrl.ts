/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: URL Validation Utility
 * Description:
 * Pure utility functions for validating, normalizing, and sanitizing
 * URL strings, detecting insecure protocols and potential typos.
 * --------------------------------------------------------
 */

export interface UrlValidationResult {
  isValid: boolean;
  isSecure: boolean;
  isInternal: boolean;
  isEmail: boolean;
  protocol?: string;
  normalizedUrl: string;
  error?: string;
  warning?: string;
}

export const validateUrl = (rawUrl: string): UrlValidationResult => {
  if (!rawUrl || !rawUrl.trim()) {
    return {
      isValid: false,
      isSecure: false,
      isInternal: false,
      isEmail: false,
      normalizedUrl: '',
      error: 'URL cannot be empty',
    };
  }

  const trimmed = rawUrl.trim();

  // Internal document anchor
  if (trimmed.startsWith('#')) {
    const isValidAnchor = trimmed.length > 1;
    return {
      isValid: isValidAnchor,
      isSecure: true,
      isInternal: true,
      isEmail: false,
      protocol: '#',
      normalizedUrl: trimmed,
      error: isValidAnchor ? undefined : 'Internal anchor target is empty',
    };
  }

  // Email mailto
  if (trimmed.toLowerCase().startsWith('mailto:')) {
    const emailPart = trimmed.substring(7).split('?')[0];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(emailPart);
    return {
      isValid,
      isSecure: true,
      isInternal: false,
      isEmail: true,
      protocol: 'mailto:',
      normalizedUrl: trimmed,
      error: isValid ? undefined : 'Invalid email address in mailto target',
    };
  }

  // Check for common typo prefixes
  if (/^htps?:\/\//i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    return {
      isValid: false,
      isSecure: false,
      isInternal: false,
      isEmail: false,
      normalizedUrl: trimmed,
      error: 'Typo in URL protocol scheme (e.g. "htps://" instead of "https://")',
    };
  }

  // Normalize: if user enters example.com or www.example.com without protocol, default to https://
  let normalized = trimmed;
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    normalized = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(normalized);
    const isSecure = parsed.protocol === 'https:';
    const isHttp = parsed.protocol === 'http:';

    if (!['http:', 'https:', 'ftp:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return {
        isValid: false,
        isSecure: false,
        isInternal: false,
        isEmail: false,
        normalizedUrl: normalized,
        error: `Unsupported protocol scheme "${parsed.protocol}"`,
      };
    }

    return {
      isValid: true,
      isSecure,
      isInternal: false,
      isEmail: parsed.protocol === 'mailto:',
      protocol: parsed.protocol,
      normalizedUrl: parsed.toString(),
      warning: isHttp ? 'Insecure HTTP connection; consider using HTTPS' : undefined,
    };
  } catch {
    return {
      isValid: false,
      isSecure: false,
      isInternal: false,
      isEmail: false,
      normalizedUrl: normalized,
      error: 'Malformed URL format',
    };
  }
};

export const sanitizeUrl = (url: string): string => {
  const result = validateUrl(url);
  return result.isValid ? result.normalizedUrl : '#';
};
