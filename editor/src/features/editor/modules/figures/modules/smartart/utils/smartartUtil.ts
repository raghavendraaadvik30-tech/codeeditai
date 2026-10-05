import type { SmartArtCategory, SmartArtModel } from '../types/smartart.types';
import { SMARTART_LAYOUTS, SMARTART_COLOR_SCHEMES, ALL_SMARTART_LAYOUTS } from '../constants/smartart.constants';

/**
 * Returns the default figure caption for a SmartArt based on its layout name
 */
export function getDefaultSmartArtCaption(
  smartArtOrLayout?: { layout?: string; layoutId?: string; title?: string } | string
): string {
  if (!smartArtOrLayout) return 'Figure: SmartArt';
  if (typeof smartArtOrLayout === 'string') {
    const layout = ALL_SMARTART_LAYOUTS.find((l) => l.id === smartArtOrLayout);
    return `Figure: ${layout ? layout.name : smartArtOrLayout} SmartArt`;
  }
  const layoutId = smartArtOrLayout.layoutId || smartArtOrLayout.layout;
  const layout = ALL_SMARTART_LAYOUTS.find((l) => l.id === layoutId);
  const name = layout ? layout.name : smartArtOrLayout.title || 'SmartArt';
  return `Figure: ${name} SmartArt`;
}

/**
 * Checks whether the current caption matches the default caption format
 */
export function isDefaultSmartArtCaption(caption?: string, currentLayout?: string): boolean {
  if (!caption || !caption.trim()) return true;
  const trimmed = caption.trim();
  if (currentLayout && trimmed === getDefaultSmartArtCaption(currentLayout)) return true;
  return ALL_SMARTART_LAYOUTS.some((l) => trimmed === `Figure: ${l.name} SmartArt`);
}

/**
 * Returns the effective figure caption for a SmartArt model
 */
export function getEffectiveSmartArtCaption(
  smartArt: { caption?: string; layout?: string; layoutId?: string; title?: string }
): string {
  if (smartArt.caption && smartArt.caption.trim()) {
    return smartArt.caption.trim();
  }
  return getDefaultSmartArtCaption(smartArt);
}

/**
 * Creates a complete default SmartArtModel with safe defaults for a given category and layout
 */
export function createDefaultSmartArtModel(
  categoryOrLayoutId: SmartArtCategory | string = 'List',
  maybeLayoutId?: string
): SmartArtModel {
  const foundByLayout = ALL_SMARTART_LAYOUTS.find((l) => l.id === categoryOrLayoutId);
  let category: SmartArtCategory = 'List';
  let layout = ALL_SMARTART_LAYOUTS[0];

  if (foundByLayout) {
    category = foundByLayout.category;
    layout = foundByLayout;
  } else {
    category = (categoryOrLayoutId as SmartArtCategory) || 'List';
    const layoutsForCat = SMARTART_LAYOUTS[category] || SMARTART_LAYOUTS.List;
    layout = layoutsForCat.find((l) => l.id === maybeLayoutId) || layoutsForCat[0];
  }

  const now = new Date().toISOString();
  const id = `smartart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    id,
    category,
    layout: layout.id,
    layoutId: layout.id,
    title: layout.name,
    nodes: JSON.parse(JSON.stringify(layout.defaultNodes)),
    colorScheme: SMARTART_COLOR_SCHEMES[0].id, // 'colorful'
    style: 'flat',
    direction: 'ltr',
    width: 640,
    height: 360,
    alignment: 'center',
    caption: getDefaultSmartArtCaption(layout.id),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Generates document figure HTML representing the SmartArt object.
 * Similar to Charts, this uses an empty `.editor-smartart-mount` anchor
 * that React hydration populates with interactive nodes, text editing,
 * and resize handlers.
 */
export function generateSmartArtHTML(smartArt: SmartArtModel): string {
  const currentLayoutId = smartArt.layoutId || smartArt.layout;
  const normalizedSmartArt: SmartArtModel = {
    ...smartArt,
    layout: currentLayoutId,
    layoutId: currentLayoutId,
  };
  const effectiveCaption = getEffectiveSmartArtCaption(normalizedSmartArt);
  const smartArtWithCaption: SmartArtModel = {
    ...normalizedSmartArt,
    caption: effectiveCaption,
  };
  const encodedConfig = encodeURIComponent(JSON.stringify(smartArtWithCaption));
  const alignStyle =
    smartArt.alignment === 'left'
      ? 'margin-left: 0; margin-right: auto; text-align: left;'
      : smartArt.alignment === 'right'
      ? 'margin-left: auto; margin-right: 0; text-align: right;'
      : 'margin-left: auto; margin-right: auto; text-align: center;';

  return `
<figure id="${smartArt.id}" class="editor-figure editor-smartart-figure" data-smartart-figure="true" data-smartart-id="${smartArt.id}" data-smartart-category="${smartArt.category}" data-smartart-layout="${currentLayoutId}" data-smartart-config="${encodedConfig}" contenteditable="false" oncontextmenu="event.preventDefault();" style="${alignStyle} width: ${smartArt.width}px; max-width: 100%; margin-top: 14px; margin-bottom: 14px; display: block; user-select: none;">
  <div class="editor-smartart-mount" data-smartart-mount-id="${smartArt.id}" style="width: 100%; position: relative;"></div>
  <figcaption data-smartart-caption="true" style="margin-top: 6px; font-size: 10.5pt; font-weight: 600; color: #475569; text-align: center; font-family: Calibri, 'Segoe UI', Arial, sans-serif; outline: none; border-bottom: 1px dashed transparent; cursor: pointer; min-height: 1.2em; user-select: text;">${effectiveCaption}</figcaption>
</figure>
<p><br/></p>
`.trim();
}
