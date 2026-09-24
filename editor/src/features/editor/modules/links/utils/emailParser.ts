/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Email Link Parser & Formatter
 * Description:
 * Pure utility functions for converting mailto: URI strings into structured
 * EmailLinkData objects and formatting structured data into valid mailto: links.
 * --------------------------------------------------------
 */

import type { EmailLinkData } from '../types';

export const buildMailtoUri = (data: EmailLinkData): string => {
  const { to, subject, body, cc, bcc } = data;
  const params: string[] = [];

  if (subject && subject.trim()) {
    params.push(`subject=${encodeURIComponent(subject.trim())}`);
  }

  if (body && body.trim()) {
    params.push(`body=${encodeURIComponent(body.trim())}`);
  }

  if (cc && cc.trim()) {
    params.push(`cc=${encodeURIComponent(cc.trim())}`);
  }

  if (bcc && bcc.trim()) {
    params.push(`bcc=${encodeURIComponent(bcc.trim())}`);
  }

  const queryString = params.length > 0 ? `?${params.join('&')}` : '';
  const cleanTo = to.trim();
  return `mailto:${cleanTo}${queryString}`;
};

export const buildGmailWebUri = (data: EmailLinkData): string => {
  const { to, subject, body } = data;
  const params: string[] = ['view=cm', 'fs=1', 'tf=1'];
  if (to && to.trim()) params.push(`to=${encodeURIComponent(to.trim())}`);
  if (subject && subject.trim()) params.push(`su=${encodeURIComponent(subject.trim())}`);
  if (body && body.trim()) params.push(`body=${encodeURIComponent(body.trim())}`);
  return `https://mail.google.com/mail/u/0/?${params.join('&')}`;
};

export const parseMailtoUri = (uri: string): EmailLinkData => {
  if (!uri || !uri.toLowerCase().startsWith('mailto:')) {
    return { to: '' };
  }

  const raw = uri.substring(7);
  const [recipientPart, queryPart] = raw.split('?');
  const to = decodeURIComponent(recipientPart || '');

  const data: EmailLinkData = { to };

  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    if (params.has('subject')) data.subject = params.get('subject') || '';
    if (params.has('body')) data.body = params.get('body') || '';
    if (params.has('cc')) data.cc = params.get('cc') || '';
    if (params.has('bcc')) data.bcc = params.get('bcc') || '';
  }

  return data;
};
