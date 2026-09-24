/**
 * --------------------------------------------------------
 * Module: Figures
 * Feature: useFigureUpload React Hook
 * --------------------------------------------------------
 */

import { useState } from "react";
import { figureService } from "../services";
import type { FigureModel, CreateFigurePayload } from "../types";

export function useFigureUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFromFile = async (
    file: File,
    additionalMetadata?: Partial<CreateFigurePayload>
  ): Promise<FigureModel | null> => {
    setUploading(true);
    setError(null);

    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const srcDataUrl = reader.result as string;
          const fallbackTitle = file.name.replace(/\.[^/.]+$/, "");

          const payload: CreateFigurePayload = {
            title: additionalMetadata?.title?.trim() || fallbackTitle,
            src: srcDataUrl,
            caption:
              additionalMetadata?.caption?.trim() ||
              `Figure: ${file.name}`,
            altText:
              additionalMetadata?.altText?.trim() ||
              additionalMetadata?.title?.trim() ||
              file.name,
            category: additionalMetadata?.category || "Photo",
            author: additionalMetadata?.author || "User",
            width: additionalMetadata?.width,
            height: additionalMetadata?.height,
            alignment: additionalMetadata?.alignment,
            fitMode: additionalMetadata?.fitMode,
            tags: additionalMetadata?.tags,
          };

          const newFig = await figureService.createNewFigure(payload);
          setUploading(false);
          resolve(newFig);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to upload image"
          );
          setUploading(false);
          resolve(null);
        }
      };

      reader.onerror = () => {
        setError("Error reading local image file");
        setUploading(false);
        resolve(null);
      };

      reader.readAsDataURL(file);
    });
  };

  return {
    uploading,
    error,
    uploadFromFile,
  };
}
