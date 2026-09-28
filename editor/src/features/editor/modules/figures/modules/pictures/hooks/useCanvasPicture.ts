import { useCallback } from "react";
import type { CanvasPicture } from "../types";

export default function useCanvasPicture(onChange?: (picture: CanvasPicture) => void) {
  const move = useCallback(
    (picture: CanvasPicture, x: number, y: number) => {
      const updated = { ...picture, x, y };
      onChange?.(updated);
      return updated;
    },
    [onChange]
  );

  const resize = useCallback(
    (picture: CanvasPicture, width: number, height: number) => {
      const updated = { ...picture, width, height };
      onChange?.(updated);
      return updated;
    },
    [onChange]
  );

  const rotate = useCallback(
    (picture: CanvasPicture, deg: number) => {
      const updated = { ...picture, rotate: deg };
      onChange?.(updated);
      return updated;
    },
    [onChange]
  );

  return { move, resize, rotate };
}
