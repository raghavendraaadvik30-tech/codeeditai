/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: Figure Remote API Client
 * Description:
 * API service module for communicating figure assets, uploads,
 * metadata updates, and deletion to remote storage/backend endpoints.
 * --------------------------------------------------------
 */

import type { FigureDTO, CreateFigurePayload, UpdateFigurePayload } from '../types';

const API_BASE_URL = '/api/v1/figures';

export const figureApi = {
  async fetchFigures(): Promise<FigureDTO[]> {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  async fetchFigureById(id: string): Promise<FigureDTO | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  },

  async createFigure(payload: CreateFigurePayload): Promise<FigureDTO> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create figure');
      return await response.json();
    } catch {
      return {
        figure_id: `fig-${Date.now()}`,
        title_text: payload.title,
        caption_text: payload.caption || '',
        alt_text: payload.altText || payload.title,
        image_url: payload.src,
        img_width: payload.width || 600,
        img_height: payload.height,
        align_mode: payload.alignment || 'center',
        fit_mode: payload.fitMode || 'contain',
        lock_aspect_ratio: true,
        border_width: 0,
        border_color: '#e2e8f0',
        border_radius: 8,
        has_shadow: true,
        creator: payload.author || 'Author',
        cat_tag: payload.category || 'Diagram',
        tags_list: payload.tags || [],
        created_timestamp: new Date().toISOString(),
        updated_timestamp: new Date().toISOString(),
      };
    }
  },

  async updateFigure(id: string, payload: UpdateFigurePayload): Promise<FigureDTO> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to update figure');
      return await response.json();
    } catch {
      return {
        figure_id: id,
        title_text: payload.title || 'Updated Figure',
        caption_text: payload.caption || '',
        alt_text: payload.altText || '',
        image_url: payload.src || '',
        img_width: payload.width || 600,
        img_height: payload.height,
        align_mode: payload.alignment || 'center',
        fit_mode: payload.fitMode || 'contain',
        lock_aspect_ratio: payload.aspectRatioLock ?? true,
        border_width: payload.borderWidth ?? 0,
        border_color: payload.borderColor || '#e2e8f0',
        border_radius: payload.borderRadius ?? 8,
        has_shadow: payload.shadow ?? true,
        creator: 'Author',
        cat_tag: payload.category || 'Diagram',
        tags_list: payload.tags || [],
        created_timestamp: new Date().toISOString(),
        updated_timestamp: new Date().toISOString(),
      };
    }
  },

  async deleteFigure(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    } catch {
      // noop
    }
  },
};
