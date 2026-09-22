/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: Figure Data Repository
 * Description:
 * Data access and transformation abstraction layer mapping raw DTOs
 * to strongly-typed internal FigureModel domain entities.
 * --------------------------------------------------------
 */

import { figureApi } from '../api';
import type { FigureModel, FigureDTO, CreateFigurePayload, UpdateFigurePayload } from '../types';
import { DEFAULT_FIGURE } from '../constants';

export class FigureRepository {
  private mapDtoToModel(dto: FigureDTO): FigureModel {
    return {
      id: dto.figure_id,
      title: dto.title_text,
      caption: dto.caption_text,
      altText: dto.alt_text,
      src: dto.image_url,
      width: dto.img_width,
      height: dto.img_height,
      alignment: dto.align_mode,
      fitMode: dto.fit_mode,
      aspectRatioLock: dto.lock_aspect_ratio,
      borderWidth: dto.border_width,
      borderColor: dto.border_color,
      borderRadius: dto.border_radius,
      shadow: dto.has_shadow,
      author: dto.creator,
      category: dto.cat_tag,
      tags: dto.tags_list,
      createdAt: dto.created_timestamp,
      updatedAt: dto.updated_timestamp,
    };
  }

  async getAll(): Promise<FigureModel[]> {
    const dtos = await figureApi.fetchFigures();
    if (!dtos.length) {
      return [];
    }
    return dtos.map((dto) => this.mapDtoToModel(dto));
  }

  async getById(id: string): Promise<FigureModel> {
    const dto = await figureApi.fetchFigureById(id);
    if (!dto) {
      return { ...DEFAULT_FIGURE, id };
    }
    return this.mapDtoToModel(dto);
  }

  async create(payload: CreateFigurePayload): Promise<FigureModel> {
    const dto = await figureApi.createFigure(payload);
    return this.mapDtoToModel(dto);
  }

  async update(id: string, payload: UpdateFigurePayload): Promise<FigureModel> {
    const dto = await figureApi.updateFigure(id, payload);
    return this.mapDtoToModel(dto);
  }

  async remove(id: string): Promise<void> {
    await figureApi.deleteFigure(id);
  }
}

export const figureRepository = new FigureRepository();
