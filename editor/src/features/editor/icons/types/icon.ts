export type IconCategory =
  | "All"
  | "Animals"
  | "Education"
  | "Communication"
  | "Analytics"
  | "Security"
  | "Weather"
  | "Food & Drink"
  | "Tools & Building"
  | "Commerce"
  | "Arrows";

export interface IconItem {
  id: string;
  name: string;
  category: IconCategory;
  svg: string;
  keywords?: string[];
  favorite?: boolean;
}

export interface IconFilter {
  category?: IconCategory;
  search?: string;
  favoritesOnly?: boolean;
}
