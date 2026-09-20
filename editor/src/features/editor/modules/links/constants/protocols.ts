/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Protocol Constants
 * Description:
 * Supported URI scheme definitions, protocol validation sets,
 * and security rules for hyperlink insertion.
 * --------------------------------------------------------
 */

export const SUPPORTED_PROTOCOLS = [
  'https://',
  'http://',
  'mailto:',
  'tel:',
  'ftp://',
  '#',
] as const;

export const SAFE_PROTOCOLS = ['https:', 'http:', 'mailto:', 'tel:'] as const;

export const INSECURE_PROTOCOLS = ['http:'] as const;

export const DEFAULT_PROTOCOLS_MAP: Record<string, string> = {
  https: 'https://',
  http: 'http://',
  mailto: 'mailto:',
  tel: 'tel:',
  anchor: '#',
};
