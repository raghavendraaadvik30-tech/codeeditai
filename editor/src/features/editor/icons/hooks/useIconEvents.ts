import { useEffect } from "react";

type IconEventCallback = (iconName: string) => void;

export default function useIconEvents(onIconInsert: IconEventCallback) {
  useEffect(() => {
    const handleIconInsert = (event: Event) => {
      const customEvent = event as CustomEvent<{
        iconName?: string;
        icon?: string | { id: string };
      }>;

      let iconName = customEvent.detail?.iconName;
      if (!iconName) {
        if (typeof customEvent.detail?.icon === "string") {
          iconName = customEvent.detail.icon;
        } else if (typeof customEvent.detail?.icon === "object" && customEvent.detail?.icon?.id) {
          iconName = customEvent.detail.icon.id;
        }
      }

      if (!iconName) return;
      onIconInsert(iconName);
    };

    window.addEventListener("pf-insert-icon", handleIconInsert);
    return () => {
      window.removeEventListener("pf-insert-icon", handleIconInsert);
    };
  }, [onIconInsert]);
}
