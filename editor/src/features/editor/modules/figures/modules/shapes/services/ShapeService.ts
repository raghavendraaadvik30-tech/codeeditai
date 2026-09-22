import { WORD_SHAPES, SHAPE_CATEGORIES } from "../data/wordShapes";
import type { ShapeItem, ShapeCategory } from "../types/shape";

class ShapeService {
  getAllShapes(): ShapeItem[] {
    return WORD_SHAPES;
  }

  getCategories(): ShapeCategory[] {
    return SHAPE_CATEGORIES;
  }

  getShapesByCategory(category: ShapeCategory): ShapeItem[] {
    return WORD_SHAPES.filter((s) => s.group === category);
  }

  searchShapes(query: string): ShapeItem[] {
    if (!query.trim()) return this.getAllShapes();
    const q = query.toLowerCase();
    return WORD_SHAPES.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.group.toLowerCase().includes(q)
    );
  }

  insertShape(shapeType: string): void {
    window.dispatchEvent(
      new CustomEvent("pf-insert-shape", {
        detail: { type: shapeType },
      })
    );
  }
}

const shapeService = new ShapeService();
export default shapeService;
