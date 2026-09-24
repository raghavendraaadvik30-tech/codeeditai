/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Document Utility Functions
 * Description:
 * Pure utility functions for word count calculations, page count
 * estimations, and formatted date timestamps.
 * --------------------------------------------------------
 */

import { WORDS_PER_PAGE_AVERAGE } from '../constants';

export const calculateWordCount = (text: string): number => {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
};

export const calculateEstimatedPages = (wordCount: number): number => {
  if (wordCount <= 0) return 1;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_PAGE_AVERAGE));
};

export const formatTimestamp = (isoString: string): string => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};
