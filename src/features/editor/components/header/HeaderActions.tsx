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
import { useState } from "react";

import {
  Save,
  FileDown,
  FileText,
  History,
  FilePlus2,
  CheckCircle2,
} from "lucide-react";

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

export default function HeaderActions() {
  const {
    model,
    save,
    saveAs,
    history,
    restore,
    refreshHistory,
  } = useDocumentModel();

  const [savedFlash, setSavedFlash] =
    useState(false);

  const [saveAsOpen, setSaveAsOpen] =
    useState(false);

  const [saveAsName, setSaveAsName] =
    useState(model.title);

  const [historyOpen, setHistoryOpen] =
    useState(false);

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
        title="Export DOCX"
      >
        <FileText className="h-4 w-4" />

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
        title="Export PDF"
      >
        <FileDown className="h-4 w-4" />

        <span>PDF</span>
      </Button>


      {/* =================================
          HISTORY
      ================================= */}

      <Dialog
        open={historyOpen}
        onOpenChange={(open) => {
          setHistoryOpen(open);

          if (open) {
            refreshHistory();
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
            title="Version History"
          >
            <History className="h-4 w-4" />

            <span>Upload</span>
          </Button>
        }
        />

        <DialogContent
          className="
            max-w-md

            bg-white
            text-slate-900

            dark:border-slate-700
            dark:bg-[#0D1A26]
            dark:text-slate-100
          "
        >
          <DialogHeader>
            <DialogTitle>
              Version History
            </DialogTitle>
          </DialogHeader>

          <div
            className="
              max-h-80
              overflow-y-auto
              rounded-md
              border

              border-slate-200

              dark:border-slate-700
            "
          >
            {history.length === 0 && (
              <div
                className="
                  p-4
                  text-sm

                  text-slate-500

                  dark:text-slate-400
                "
              >
                No saved versions yet.
              </div>
            )}

            {history.map((item, index) => (
              <button
                key={`${item.id}-${item.savedAt}-${index}`}
                type="button"
                onClick={() => {
                  restore(item.id);
                  setHistoryOpen(false);
                }}
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  gap-3
                  border-b
                  px-3
                  py-2.5
                  text-left
                  text-sm
                  last:border-b-0

                  border-slate-200

                  hover:bg-slate-100

                  dark:border-slate-700
                  dark:hover:bg-slate-800
                "
              >
                <span
                  className="
                    truncate
                    font-medium

                    text-slate-800

                    dark:text-slate-100
                  "
                >
                  {item.title}
                </span>

                <span
                  className="
                    shrink-0
                    text-xs

                    text-slate-500

                    dark:text-slate-400
                  "
                >
                  {new Date(
                    item.savedAt
                  ).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>


      {/* =================================
          THEME TOGGLE
      ================================= */}

      <ThemeToggle />

    </div>
  );
}