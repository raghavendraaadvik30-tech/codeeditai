/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: Figure Business Logic Service
 * Description:
 * Domain service handling figure business rules, schema validations,
 * image aspect ratios, HTML generation, and repository lifecycle delegation.
 * --------------------------------------------------------
 */

import { figureRepository, FigureRepository } from '../repository';
import type { FigureModel, CreateFigurePayload, UpdateFigurePayload } from '../types';
import { CreateFigureSchema, UpdateFigureSchema } from '../schemas';
import { generateFigureHTML } from '../utils';

export class FigureService {
  constructor(private repo: FigureRepository = figureRepository) {}

  async listFigures(): Promise<FigureModel[]> {
    return await this.repo.getAll();
  }

  async getFigureDetails(id: string): Promise<FigureModel> {
    if (!id || !id.trim()) {
      throw new Error('Figure ID is required');
    }
    return await this.repo.getById(id);
  }

  async createNewFigure(payload: CreateFigurePayload): Promise<FigureModel> {
    const validationResult = CreateFigureSchema.safeParse(payload);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((e) => e.message).join(', ');
      throw new Error(`Validation Error: ${errorMsg}`);
    }

    return await this.repo.create(payload);
  }

  async updateFigureDetails(id: string, payload: UpdateFigurePayload): Promise<FigureModel> {
    const validationResult = UpdateFigureSchema.safeParse(payload);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((e) => e.message).join(', ');
      throw new Error(`Validation Error: ${errorMsg}`);
    }

    return await this.repo.update(id, payload);
  }

  exportToHTML(figure: FigureModel): string {
    return generateFigureHTML(figure);
  }

  async deleteFigure(id: string): Promise<void> {
    await this.repo.remove(id);
  }
}

export const figureService = new FigureService();
