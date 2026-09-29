import { useEffect } from "react";
import { PICTURE_INSERT_EVENT } from "../constants";
import type { PictureInsertEventDetail } from "../types";

export type PictureEventCallback = (detail: PictureInsertEventDetail) => void;

export default function usePictureEvents(onPictureInsert: PictureEventCallback) {
  useEffect(() => {
    const handleInsertPicture = (event: Event) => {
      const customEvent = event as CustomEvent<PictureInsertEventDetail>;
      if (!customEvent.detail) return;
      if (customEvent.detail.mode !== "titleOnly" && !customEvent.detail.src) return;
      onPictureInsert(customEvent.detail);
    };

    window.addEventListener(PICTURE_INSERT_EVENT, handleInsertPicture);
    return () => {
      window.removeEventListener(PICTURE_INSERT_EVENT, handleInsertPicture);
    };
  }, [onPictureInsert]);
}
