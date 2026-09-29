/**
 * --------------------------------------------------------
 * Module: Figures / Pictures
 * Feature: Picture Constants
 * Description:
 * Constant values, defaults, size constraints, and event names
 * for the Pictures module.
 * --------------------------------------------------------
 */

import type { SampleOnlineImage } from '../types';

export const PICTURE_INSERT_EVENT = "pf-insert-picture";

export const DEFAULT_PICTURE_WIDTH = 360;
export const DEFAULT_PICTURE_HEIGHT = 240;

export const MIN_PICTURE_WIDTH = 30;
export const MIN_PICTURE_HEIGHT = 30;
export const MAX_PICTURE_WIDTH = 1000;
export const MAX_PICTURE_HEIGHT = 800;

export const DEFAULT_PICTURE_TITLE = "Picture";

// Curated high quality sample online images for quick 1-click insertion
export const SAMPLE_ONLINE_IMAGES: SampleOnlineImage[] = [
  {
    title: 'Nature & Landscape',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Technology & Work',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Wildlife & Lion',
    url: 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Abstract Architecture',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  },
];
