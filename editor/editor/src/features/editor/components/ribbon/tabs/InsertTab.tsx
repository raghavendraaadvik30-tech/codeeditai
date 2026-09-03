/*### `InsertTab.tsx`

**Purpose:**
Provides insert options in the editor ribbon for adding pages, tables, images, links, and symbols.

**Responsibilities:**

* Adds a new page.
* Inserts tables into the editor.
* Inserts images using an image URL.
* Creates hyperlinks.
* Inserts symbols.
* Uses `EditorContext` and `documentModel`.

**Hardcoded?** Partially — table HTML, symbol, and image/link prompts are currently hardcoded.

**Backend needed?** ❌ No. Basic insertion works on the frontend.

**Backend needed for:** Saving inserted content, uploading/storing images, document persistence, collaboration, and document synchronization.
*/

import {
  FilePlus,
  Table,
  Image,
  Link,
  Sigma,
} from "lucide-react";

import RibbonButton from "../controls/RibbonButton";
import RibbonDivider from "../controls/RibbonDivider";

import { useDocumentModel } from "../../../store/documentModel";
import { useEditor } from "../../../context/EditorContext";
//import { documentService } from "../../../services/documentService";

export default function InsertTab() {
  const { addPage } = useDocumentModel();

  const { editorRef } = useEditor();
 
  const insertHTML = (html: string) => {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
  };

  return (
    <div className="flex items-center gap-2">

      {/* Add Page */}

      <RibbonButton
        icon={<FilePlus className="h-4 w-4" />}
        onClick={addPage}
      >
        Add Page
      </RibbonButton>

      <RibbonDivider />

      {/* Table */}

      <RibbonButton
        icon={<Table className="h-4 w-4" />}
        onClick={() =>
          insertHTML(`
<table border="1"
       style="border-collapse:collapse;width:100%;">
<tbody>
<tr>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
</tbody>
</table>
<p><br/></p>
`)
        }
      >
        Table
      </RibbonButton>

      {/* Image */}

      <RibbonButton
        icon={<Image className="h-4 w-4" />}
        onClick={() => {
          const url = window.prompt(
            "Enter image URL"
          );

          if (!url) return;

          insertHTML(
            `<img src="${url}"
                  alt=""
                  style="max-width:100%;" />`
          );
        }}
      >
        Image
      </RibbonButton>

      <RibbonDivider />

      {/* Hyperlink */}

      <RibbonButton
        icon={<Link className="h-4 w-4" />}
        onClick={() => {
          const url = window.prompt(
            "Enter URL"
          );

          if (!url) return;

          document.execCommand(
            "createLink",
            false,
            url
          );
        }}
      >
        Link
      </RibbonButton>

      {/* Symbol */}

      <RibbonButton
        icon={<Sigma className="h-4 w-4" />}
        onClick={() =>
          insertHTML("&#931;")
        }
      >
        Symbol
      </RibbonButton>

    </div>
  );
}