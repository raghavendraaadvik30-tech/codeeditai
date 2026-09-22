import { ICON_LIST } from "../data/iconList";
import type { IconItem, IconCategory } from "../types/icon";

class IconService {
  getAllIcons(): IconItem[] {
    return ICON_LIST;
  }

  searchIcons(text: string): IconItem[] {
    if (!text.trim()) {
      return this.getAllIcons();
    }
    const q = text.toLowerCase();
    return ICON_LIST.filter(
      (icon) =>
        icon.name.toLowerCase().includes(q) ||
        icon.category.toLowerCase().includes(q) ||
        icon.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  }

  getIconsByCategory(category: IconCategory): IconItem[] {
    if (category === "All") return this.getAllIcons();
    return ICON_LIST.filter((icon) => icon.category === category);
  }

  getIcon(id: string): IconItem | undefined {
    return ICON_LIST.find((icon) => icon.id === id);
  }

  insertIcon(icon: IconItem | string): void {
    const iconName = typeof icon === "string" ? icon : icon.id;
    window.dispatchEvent(
      new CustomEvent("pf-insert-icon", {
        detail: {
          iconName,
          icon: typeof icon === "object" ? icon : this.getIcon(iconName),
        },
      })
    );
  }
}

const iconService = new IconService();
export default iconService;
