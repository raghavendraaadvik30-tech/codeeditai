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
} from "lucide-react";

import { parseUploadedFile } from "../../utils/fileImportUtil";
import { documentService, type DocumentMeta } from "../../services/documentService";
import { printService } from "../../services/printService";

import { Button } from "@/shared/components/ui/button";
import ThemeToggle from "@/shared/components/theme/themeToggle";

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

import { useDocumentModel } from "../../store/documentModel";
import { useEditor } from "../../context/EditorContext";

export default function HeaderActions() {
  const {
    model,
    save,
    saveAs,
    updateTitle,
    setPageHtml,
    setActivePage,
    removePage,
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { title, html } = await parseUploadedFile(file);

      updateTitle(title);

      const firstPageId = model.pages[0]?.id;
      if (firstPageId) {
        // If extra pages were inserted previously, remove them so the document starts cleanly on page 1
        for (let i = 1; i < model.pages.length; i++) {
          removePage(model.pages[i].id);
        }

        // Set uploaded content directly on page 1
        setPageHtml(firstPageId, html);
        setActivePage(firstPageId);
      }

      // Immediately place in Protected View and ask permission to edit
      setIsEditable(false);
      setPendingPermissionFile({ fileName: file.name });

      // Scroll smoothly to the top of page 1
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error processing file upload:", err);
    }
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

  const handleExportDocx = () => {
    const fullHtml = model.pages
      .map((p) => {
        const pageEl = document.querySelector(`[data-page-id="${p.id}"]`);
        const editable = pageEl?.querySelector("[contenteditable]");
        return editable ? (editable as HTMLElement).innerHTML : (model.pageHtml[p.id] || "");
      })
      .filter((h) => h.trim().length > 0)
      .join('<div class="page-break" style="page-break-after:always;"></div>');

    const meta: DocumentMeta = {
      id: model.id,
      title: model.title || "Document",
      author: "Editor User",
      savedAt: Date.now(),
      version: 1,
    };

    const blob = documentService.exportDOCX(meta, fullHtml || "<p></p>");
    const safeTitle = (model.title || "document").replace(/[^a-zA-Z0-9_\-\s]/g, "").trim() || "document";
    documentService.download(blob, `${safeTitle}.docx`);
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
          h-8
          gap-1.5
          px-2
          text-xs

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
          h-8
          gap-1.5
          px-2
          text-xs

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
          h-8
          gap-1.5
          px-2
          text-xs

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
          h-8
          gap-1.5
          px-2
          text-xs
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


      {/* =================================
          THEME TOGGLE
      ================================= */}

      <ThemeToggle />

    </div>
  );
}