/**Purpose:**
Provides the main header/navigation bar for the document editor.

**What it does:**

* Renders the application logo using `HeaderLogo`.
* Displays header-level actions using `HeaderActions`.
* Displays the logged-in user's information using `UserProfile`.
* Uses a flexible layout to keep the logo on the left and actions/profile on the right.
* Supports both **light and dark themes**.
* Maintains a fixed header height and bottom border for consistent editor layout.

**Component Flow:**

```text
EditorHeader
│
├── HeaderLogo
│
├── Flexible Space
│
├── HeaderActions
│
└── UserProfile
```

**Backend:**
No direct API/backend communication. 
It is a UI layout component that composes reusable header components.
*/
import { useState, useRef } from "react";

import {
  Save,
  FileDown,
  FileText,
  FilePlus2,
  CheckCircle2,
  Upload,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";

import { parseUploadedFile, type ImportedPageLayout } from "../../utils/fileImportUtil";
import { documentService } from "../../services/documentService";
import { printService } from "../../services/printService";

import { Button } from "@/shared/components/ui/button";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import { useDocumentModel, type DocumentModel } from "../../store/documentModel";
import { useEditor } from "../../context/EditorContext";

export default function HeaderActions() {
  const {
    model,
    save,
    saveAs,
    setActivePage,
    insertUploadedDocument,
    savedDocuments,
  } = useDocumentModel();

  const {
    editorRef,
    setIsEditable,
    pendingPermissionFile,
    setPendingPermissionFile,
  } = useEditor();

  const [savedFlash, setSavedFlash] =
    useState(false);

  const [saveAsOpen, setSaveAsOpen] =
    useState(false);

  const [saveAsName, setSaveAsName] =
    useState(model.title);

  // Document Limit Alert for Upload (Max 10 Documents)
  const [showLimitAlert, setShowLimitAlert] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{
    title: string;
    pagesToImport: string[];
    fileName: string;
    pageLayout?: ImportedPageLayout;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const executeUpload = (
    title: string,
    pagesToImport: string[],
    pageLayout?: ImportedPageLayout
  ) => {
    insertUploadedDocument(title, pagesToImport, pageLayout);
    setIsEditable(true);
    setPendingPermissionFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { title, html, pages, pageLayout } = await parseUploadedFile(file);

      const pagesToImport =
        pages && pages.length > 0 ? pages : [html || "<p><br/></p>"];

      const docTitle = title || file.name.replace(/\.[^/.]+$/, "");

      // Check current document count across savedDocuments and active model
      const seen = new Set<string>();
      savedDocuments.forEach((d) => seen.add(d.id));
      if (!seen.has(model.id)) seen.add(model.id);
      const totalCount = seen.size;

      if (totalCount >= 10) {
        setPendingUpload({
          title: docTitle,
          pagesToImport,
          fileName: file.name,
          pageLayout,
        });
        setShowLimitAlert(true);
        return;
      }

      executeUpload(docTitle, pagesToImport, pageLayout);
    } catch (err) {
      console.error("Error processing file upload:", err);
    }
  };

  const handleConfirmUpload = () => {
    setShowLimitAlert(false);
    if (!pendingUpload) return;
    const { title, pagesToImport, pageLayout } = pendingUpload;
    setPendingUpload(null);
    executeUpload(title, pagesToImport, pageLayout);
  };

  const handleCancelUpload = () => {
    setShowLimitAlert(false);
    setPendingUpload(null);
  };

  const handleEnableEditing = () => {
    setIsEditable(true);
    setPendingPermissionFile(null);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);

    const firstPageId = model.pages[0]?.id;
    if (firstPageId) {
      setActivePage(firstPageId);
    }

    setTimeout(() => {
      const firstPageEl = firstPageId
        ? (document.querySelector(
            `section[data-page-id="${firstPageId}"] [contenteditable="true"]`
          ) as HTMLElement | null)
        : null;

      const editor =
        firstPageEl ||
        editorRef.current ||
        (document.querySelector('[contenteditable="true"]') as HTMLElement | null);

      if (editor) {
        editor.focus();
        try {
          const sel = window.getSelection();
          if (sel) {
            const range = document.createRange();
            range.selectNodeContents(editor);
            range.collapse(true); // Place cursor at the start of page 1
            sel.removeAllRanges();
            sel.addRange(range);
          }
        } catch {
          // ignore
        }
        editor.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

  /* --------------------------------
     SAVE
  -------------------------------- */

  const doSave = () => {
    save();

    setSavedFlash(true);

    window.setTimeout(() => {
      setSavedFlash(false);
    }, 1500);
  };

  /* --------------------------------
     SAVE AS
  -------------------------------- */

  const doSaveAs = () => {
    const title = saveAsName.trim();

    if (!title) return;

    saveAs(title);

    setSaveAsOpen(false);

    setSavedFlash(true);

    window.setTimeout(() => {
      setSavedFlash(false);
    }, 1500);
  };

  /* --------------------------------
     EXPORT DOCX
  -------------------------------- */

  const handleExportDocx = async () => {
    try {
      const updatedPageHtml: Record<string, string> = { ...model.pageHtml };
      const pages = model.pages && model.pages.length > 0
        ? model.pages
        : [{ id: "p1", sectionId: model.sections?.[0]?.id || "s1" }];

      pages.forEach((p) => {
        const pageContentEl =
          (document.querySelector(`[data-editor-page="${p.id}"]`) as HTMLElement | null) ||
          (document.querySelector(`section[data-page-id="${p.id}"] [data-editor-page]`) as HTMLElement | null) ||
          (document.querySelector(`section[data-page-id="${p.id}"] [contenteditable="true"]`) as HTMLElement | null) ||
          (document.querySelector(`[data-page-id="${p.id}"] [contenteditable]`) as HTMLElement | null);
        if (pageContentEl) {
          updatedPageHtml[p.id] = pageContentEl.innerHTML;
        }
      });
      const activeModel: DocumentModel = {
        ...model,
        pages,
        sections: model.sections && model.sections.length > 0
          ? model.sections
          : [{
              id: "s1",
              header: "",
              footer: "",
              differentFirstPage: false,
              differentOddEven: false,
              firstHeader: "",
              firstFooter: "",
              evenHeader: "",
              evenFooter: "",
              showPageNumbers: false,
            }],
        pageHtml: updatedPageHtml,
      };

      const blob = await documentService.exportDOCX(activeModel, {
        tableAutoFitMode: "fixed",
        exportMarkupMode: "markup",
      });
      const safeTitle = (model.title || "document").replace(/[^a-zA-Z0-9_\-\s]/g, "").trim() || "document";
      documentService.download(blob, `${safeTitle}.docx`);
    } catch (err) {
      console.error("Failed to generate DOCX:", err);
    }
  };

  /* --------------------------------
     EXPORT PDF / PRINT
  -------------------------------- */

  const handleExportPdf = () => {
    printService.printDocument();
  };

  return (
    <div className="flex items-center gap-1">

      {/* =================================
          SAVE
      ================================= */}

      <Button
        variant="ghost"
        size="sm"
        className="
          h-9
          gap-2
          px-3
          text-sm

          text-slate-600
          hover:bg-slate-100
          hover:text-slate-900

          dark:text-slate-300
          dark:hover:bg-slate-800
          dark:hover:text-white
        "
        onClick={doSave}
        title="Save"
      >
        <Save className="h-3.5 w-3.5" />

        <span>Save</span>

        {savedFlash && (
          <CheckCircle2
            className="
              h-3.5
              w-3.5
              text-green-600
              dark:text-green-400
            "
          />
        )}
      </Button>


      {/* =================================
          SAVE AS
      ================================= */}

      <Dialog
        open={saveAsOpen}
        onOpenChange={(open) => {
          setSaveAsOpen(open);

          if (open) {
            setSaveAsName(model.title);
          }
        }}
      >
        <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="
              h-9
              gap-2
              px-3
              text-sm

              text-slate-600
              hover:bg-slate-100
              hover:text-slate-900

              dark:text-slate-300
              dark:hover:bg-slate-800
              dark:hover:text-white
            "
            title="Save As"
          >
            <FilePlus2 className="h-4 w-4" />

            <span>Save As</span>
          </Button>
        }
        />

        <DialogContent
          className="
            max-w-sm

            bg-white
            text-slate-900

            dark:border-slate-700
            dark:bg-[#0D1A26]
            dark:text-slate-100
          "
        >
          <DialogHeader>
            <DialogTitle>
              Save As
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label
              className="
                text-xs
                text-slate-600
                dark:text-slate-300
              "
            >
              Document title
            </Label>

            <Input
              value={saveAsName}
              onChange={(e) =>
                setSaveAsName(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  doSaveAs();
                }
              }}
              placeholder="Enter document title"
              className="
                border-slate-300
                bg-white
                text-slate-900

                dark:border-slate-700
                dark:bg-[#07131E]
                dark:text-slate-100
                dark:placeholder:text-slate-500
              "
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() =>
                setSaveAsOpen(false)
              }
              className="
                text-slate-600
                hover:bg-slate-100

                dark:text-slate-300
                dark:hover:bg-slate-800
              "
            >
              Cancel
            </Button>

            <Button onClick={doSaveAs}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* =================================
          DOCX
      ================================= */}

      <Button
        variant="ghost"
        size="sm"
        className="
          h-9
          gap-2
          px-3
          text-sm

          text-slate-600
          hover:bg-slate-100
          hover:text-slate-900

          dark:text-slate-300
          dark:hover:bg-slate-800
          dark:hover:text-white
        "
        onClick={handleExportDocx}
        title="Export DOCX"
      >
        <FileText className="h-3.5 w-3.5" />

        <span>DOCX</span>
      </Button>


      {/* =================================
          PDF
      ================================= */}

      <Button
        variant="ghost"
        size="sm"
         className="
          h-9
          gap-2
          px-3
          text-sm

          text-slate-600
          hover:bg-slate-100
          hover:text-slate-900

          dark:text-slate-300
          dark:hover:bg-slate-800
          dark:hover:text-white
        "
        onClick={handleExportPdf}
        title="Export PDF"
      >
        <FileDown className="h-3.5 w-3.5" />

        <span>PDF</span>
      </Button>




      {/* =================================
          UPLOAD (FROM FILE MANAGER)
      ================================= */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.doc,.html,.htm,.txt,.text,.md,.markdown,.json,.rtf,text/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button
        variant="ghost"
        size="sm"
         className="
          h-9
          gap-2
          px-3
          text-sm

          text-slate-600
          hover:bg-slate-100
          hover:text-slate-900

          dark:text-slate-300
          dark:hover:bg-slate-800
          dark:hover:text-white
        "
        onClick={handleUploadClick}
        title="Upload Document from File Manager"
      >
        <Upload className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        <span>Upload</span>
      </Button>

      {/* Top Permission Prompt for File Upload (Word-Style Protected View Top Banner) */}
      {pendingPermissionFile && (
        <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between border-b border-amber-300 bg-amber-50 px-6 py-2 shadow-md dark:border-amber-800 dark:bg-[#1a2332] animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500 text-white shadow-xs">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                Protected View:
              </span>
              <span className="text-xs text-amber-800 dark:text-amber-300">
                Uploaded &ldquo;{pendingPermissionFile.fileName}&rdquo; from file manager. Editing is restricted for your protection.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={handleEnableEditing}
              className="h-7 px-4 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs rounded-md"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPendingPermissionFile(null)}
              className="h-7 px-2 text-xs text-amber-800 hover:bg-amber-200/60 dark:text-amber-300 dark:hover:bg-amber-900/40"
            >
              Keep Read-Only
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================
          DOCUMENT LIMIT REACHED MODAL (MAX 10 DOCUMENTS ON UPLOAD)
      ============================================================ */}
      {showLimitAlert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-limit-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-5 shadow-2xl dark:border-amber-900/60 dark:bg-[#0c1929]">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 id="upload-limit-dialog-title" className="text-sm font-bold text-slate-900 dark:text-white">
                  Document Limit Reached
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Maximum 10 documents allowed
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-xl bg-amber-50/80 p-3.5 text-xs leading-relaxed text-amber-950 dark:bg-amber-950/30 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/40">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <span>
                  You have reached the maximum limit of 10 documents. To insert a new document, the oldest document will be removed. If you want to keep any existing document, please save it in the File Manager before continuing.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelUpload}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUpload}
                className="flex items-center gap-1.5 rounded-xl bg-[#0078d4] px-4 py-2 text-xs font-semibold text-white hover:bg-[#005a9e] transition-colors shadow-sm"
              >
                <span>Continue</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
