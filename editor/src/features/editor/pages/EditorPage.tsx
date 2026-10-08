/*
**Purpose:**
Acts as the entry point for the document editor page by setting up
the required providers and rendering the main editor layout.

**Responsibilities:**

* Wraps the editor with DocumentModelProvider to manage document data.
* Wraps the editor with AuditProvider to manage audit information.
* Wraps the editor with EditorProvider to manage editor UI state.
* Provides all required module-level contexts.
* Renders EditorLayout as the main editor interface.
*/

import { EditorProvider } from "../context/EditorContext";
import { AuditProvider } from "../context/AuditContext";

import { DocumentModelProvider } from "../store/documentModel";

import { TableProvider } from "../modules/tables/context";
import { HeaderFooterProvider } from "../modules/document/context/HeaderFooterContext";
import { TrackChangesProvider } from "../modules/trackChanges/context";

import { FigureProvider } from "../modules/figures/context";
import { ChartProvider } from "../modules/figures/modules/chart/context";
import { SmartArtProvider } from "../modules/figures/modules/smartart/context";

import { ReferencesProvider } from "../modules/reference/components/ReferencesContext";

import EditorLayout from "../layouts/EditorLayout";

export default function EditorPage() {
  return (
    <DocumentModelProvider>
      <AuditProvider>
        <EditorProvider>
          <TrackChangesProvider>
            <HeaderFooterProvider>
              <TableProvider>
                <FigureProvider>
                  <ChartProvider>
                    <SmartArtProvider>
                      <ReferencesProvider>
                        <EditorLayout />
                      </ReferencesProvider>
                    </SmartArtProvider>
                  </ChartProvider>
                </FigureProvider>
              </TableProvider>
            </HeaderFooterProvider>
          </TrackChangesProvider>
        </EditorProvider>
      </AuditProvider>
    </DocumentModelProvider>
  );
}