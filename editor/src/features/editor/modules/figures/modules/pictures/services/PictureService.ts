/**
 * --------------------------------------------------------
 * Module: Figures / Pictures
 * Feature: Picture Service
 * Description:
 * Service class handling picture dispatch events, image file processing,
 * and online picture catalog retrieval.
 * --------------------------------------------------------
 */

import { PICTURE_INSERT_EVENT, SAMPLE_ONLINE_IMAGES } from '../constants';
import type { PictureInsertEventDetail, PictureInsertMode, SampleOnlineImage } from '../types';

export class PictureService {
  /**
   * Dispatches a custom window event to insert a picture into the active editor.
   */
  insertPicture(detail: PictureInsertEventDetail): void {
    if (!detail) return;
    if (detail.mode !== "titleOnly" && !detail.src) return;
    window.dispatchEvent(
      new CustomEvent(PICTURE_INSERT_EVENT, {
        detail,
      })
    );
  }

  /**
   * Dispatches a custom window event to insert only a title/caption into the active editor.
   */
  insertTitleOnly(caption?: string): void {
    this.insertPicture({
      mode: "titleOnly",
      caption,
    });
  }

  /**
   * Reads a local image file and triggers picture insertion.
   */
  processImageFile(file: File, mode: PictureInsertMode = "withTitle"): void {
    if (!file.type.startsWith("image/")) {
      console.warn("Selected file is not a valid image format:", file.type);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result as string;
      if (!imageData) return;

      this.insertPicture({
        src: imageData,
        name: file.name,
        mode,
      });
    };

    reader.onerror = (err) => {
      console.error("FileReader error reading local image:", err);
    };

    reader.readAsDataURL(file);
  }

  /**
   * Retrieves sample online pictures for quick insertion.
   */
  getSampleOnlineImages(): SampleOnlineImage[] {
    return SAMPLE_ONLINE_IMAGES;
  }
}

export const pictureService = new PictureService();
export default pictureService;
