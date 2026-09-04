/*### `LayoutTab.tsx`

**Purpose:**
Provides page layout controls in the editor ribbon for managing pages, breaks, sections, and page deletion.

**Responsibilities:**

* Adds a new page.
* Inserts a page break.
* Adds a section break.
* Deletes the active page.
* Uses `documentModel` to manage pages and sections.
* Uses `documentService` for page-break HTML.
* Uses `EditorContext` for editor operations.

**Hardcoded?** Partially — layout actions and button labels are defined in the component.

**Backend needed?** ❌ No. Page and layout operations work on the frontend.

**Backend needed for:** Saving page/section changes, document persistence, version history, and collaboration.
*/

import {
  FilePlus,
  Scissors,
  Columns2,
 // PanelTop,
  Trash2,
} from "lucide-react";

import RibbonButton from "../controls/RibbonButton";
import RibbonDivider from "../controls/RibbonDivider";

import { useDocumentModel } from "../../../store/documentModel";
import { useEditor } from "../../../context/EditorContext";

//import HeaderFooterDialog from "../../dialogs/HeaderFooterDialog";

import { documentService } from "../../../services/documentService";

export default function LayoutTab() {
  const {
    
    addPage,
    removePage,
    activePage,
    addSection
  } = useDocumentModel();

  const { editorRef } = useEditor();

  const insertHTML = (html: string) => {
    editorRef.current?.focus();

    document.execCommand(
      "insertHTML",
      false,
      html
    );
  };

  return (
    <div className="flex items-center gap-2">

      {/* Add Page */}

      <RibbonButton
        icon={<FilePlus className="h-4 w-4" />}
        onClick={() => addPage()}
      >
        Add Page
      </RibbonButton>

      <RibbonDivider />

      {/* Page Break */}

      <RibbonButton
        icon={<Scissors className="h-4 w-4" />}
        onClick={() =>
          insertHTML(
            documentService.pageBreakHTML()
          )
        }
      >
        Page Break
      </RibbonButton>

      {/* Section Break */}

      <RibbonButton
        icon={<Columns2 className="h-4 w-4" />}
        onClick={() =>
          addSection(activePage ?? undefined)
            // documentService.sectionBreakHTML()
          
        }
      >
        Section Break
      </RibbonButton>

      <RibbonDivider />

      {/* Header Footer */}

      {/* <HeaderFooterDialog /> */}

      <RibbonDivider />

      {/* Delete Page */}

      <RibbonButton
        icon={<Trash2 className="h-4 w-4" />}
        onClick={() => {
          if (activePage) {
            removePage(activePage);
          }
        }}
      >
        Delete Page
      </RibbonButton>

    </div>
  );
}