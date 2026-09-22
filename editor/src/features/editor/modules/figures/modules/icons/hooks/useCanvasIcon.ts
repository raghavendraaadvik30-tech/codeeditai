import { useCallback } from "react";
import type { CanvasIcon } from "../types/canvasIcon";

export default function useCanvasIcon(onChange?: (icon: CanvasIcon) => void) {
  const move = useCallback(
    (icon: CanvasIcon, x: number, y: number) => {
      const updated = { ...icon, x, y };
      onChange?.(updated);
      return updated;
    },
    [onChange]
  );

  const resize = useCallback(
    (icon: CanvasIcon, width: number, height: number) => {
      const updated = { ...icon, width, height };
      onChange?.(updated);
      return updated;
    },
    [onChange]
  );

  return { move, resize };
}
