/*
**Purpose:**
Acts as the **entry point for the document editor page** by setting up the required providers and rendering the main editor layout.

**Responsibilities:**

* Wraps the editor with `DocumentModelProvider` to manage the **document data and page content**.
* Wraps the editor with `EditorProvider` to manage **editor UI state**, such as panels, zoom, selection, and editing state.
* Renders `EditorLayout`, which contains the complete editor interface.
* Ensures all child editor components can access the required shared state through React Context.

**In short:**

> `EditorPage.tsx` serves as the **main composition/root component for the editor**, connecting the document state, editor state, and overall editor layout together.

*/

import { EditorProvider } from "../context/EditorContext";
import { DocumentModelProvider } from "../store/documentModel";
import { TableProvider } from "../tables/context";
import { HeaderFooterProvider } from "../document/context/HeaderFooterContext";
import { TrackChangesProvider } from "../modules/trackChanges/context";
import { FigureProvider } from "../modules/figures/context";
import { ChartProvider } from "../modules/figures/modules/chart/context";
import { SmartArtProvider } from "../modules/figures/modules/smartart/context";
import EditorLayout from "../layouts/EditorLayout";

export default function EditorPage() {
  return (
    <DocumentModelProvider>
      <EditorProvider>
        <TrackChangesProvider>
          <HeaderFooterProvider>
            <TableProvider>
              <FigureProvider>
                <ChartProvider>
                  <SmartArtProvider>
                    <EditorLayout />
                  </SmartArtProvider>
                </ChartProvider>
              </FigureProvider>
            </TableProvider>
          </HeaderFooterProvider>
        </TrackChangesProvider>
      </EditorProvider>
    </DocumentModelProvider>
  );
}
