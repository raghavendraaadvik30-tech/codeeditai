/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Document Permissions & Access Control Dialog
 * Description:
 * Modal interface allowing users to inspect and configure editing permissions,
 * toggle Read-Only vs Edit Mode, and manage document protection settings.
 * --------------------------------------------------------
 */

import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Unlock,
  Users,
  Eye,
  Edit3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useEditor } from "@/features/editor/context/EditorContext";
import { useDocumentModel } from "@/features/editor/store/documentModel";

export function PermissionsDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { isEditable, setIsEditable } = useEditor();
  const { model } = useDocumentModel();

  // Local state for permissions management
  const [editableState, setEditableState] = useState<boolean>(isEditable);
  const [permissionRole, setPermissionRole] = useState<"Editor" | "Reviewer" | "Viewer">(
    isEditable ? "Editor" : "Viewer"
  );
  const [restrictSections, setRestrictSections] = useState(false);

  if (!isOpen) return null;

  const handleApply = () => {
    setIsEditable(editableState);
    onClose();
  };

  const handleRoleChange = (role: "Editor" | "Reviewer" | "Viewer") => {
    setPermissionRole(role);
    if (role === "Viewer") {
      setEditableState(false);
    } else {
      setEditableState(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-xl border border-secondary bg-card p-5 shadow-2xl dark:border-muted dark:bg-[#111D29]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-muted dark:border-muted">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary dark:bg-navy-950/60 dark:text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground dark:text-primary-foreground">
                Document Permissions
              </h3>
              <p className="text-[11px] text-muted-foreground dark:text-muted-foreground truncate max-w-60">
                {model.title || "Untitled Document"}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              editableState
                ? "bg-success-100 text-success-700 dark:bg-success-950/50 dark:text-success-400"
                : "bg-warning-100 text-warning-700 dark:bg-warning-950/50 dark:text-warning-400"
            }`}
          >
            {editableState ? (
              <>
                <Unlock className="h-3 w-3" /> Can Edit
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" /> Read Only
              </>
            )}
          </span>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 text-xs">
          {/* Quick Lock / Unlock Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-secondary p-3 dark:border-muted dark:bg-secondary/50">
            <div>
              <div className="font-medium text-foreground dark:text-muted-foreground">
                Allow Document Editing
              </div>
              <div className="text-[11px] text-muted-foreground dark:text-muted-foreground">
                When disabled, typing and canvas modifications are locked.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextState = !editableState;
                setEditableState(nextState);
                if (!nextState) setPermissionRole("Viewer");
                else setPermissionRole("Editor");
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                editableState ? "bg-primary" : "bg-secondary dark:bg-secondary-foreground"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-card shadow-md transition-transform duration-200 ease-in-out mt-0.75 ml-0.75 ${
                  editableState ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Access Roles */}
          <div>
            <label className="block text-[11px] font-semibold text-secondary-foreground dark:text-muted-foreground uppercase tracking-wider mb-2">
              Access Permission Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange("Editor")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  permissionRole === "Editor"
                    ? "border-primary bg-primary/50 text-primary/90 dark:border-primary dark:bg-navy-950/30 dark:text-navy-300 ring-1 ring-primary"
                    : "border-secondary hover:bg-muted dark:border-muted dark:hover:bg-muted/60 text-secondary-foreground dark:text-muted-foreground"
                }`}
              >
                <Edit3 className="h-4 w-4 mb-1" />
                <span className="font-medium text-xs">Editor</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Full edits</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("Reviewer")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  permissionRole === "Reviewer"
                    ? "border-primary bg-primary/50 text-primary/90 dark:border-primary dark:bg-navy-950/30 dark:text-navy-300 ring-1 ring-primary"
                    : "border-secondary hover:bg-muted dark:border-muted dark:hover:bg-muted/60 text-secondary-foreground dark:text-muted-foreground"
                }`}
              >
                <Users className="h-4 w-4 mb-1" />
                <span className="font-medium text-xs">Reviewer</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Suggest only</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("Viewer")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  permissionRole === "Viewer"
                    ? "border-primary bg-primary/50 text-primary/90 dark:border-primary dark:bg-navy-950/30 dark:text-navy-300 ring-1 ring-primary"
                    : "border-secondary hover:bg-muted dark:border-muted dark:hover:bg-muted/60 text-secondary-foreground dark:text-muted-foreground"
                }`}
              >
                <Eye className="h-4 w-4 mb-1" />
                <span className="font-medium text-xs">Viewer</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Read-only</span>
              </button>
            </div>
          </div>

          {/* Advanced Protection Options */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] text-secondary-foreground dark:text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success-500" />
                Prevent accidental layout resets
              </span>
              <input
                type="checkbox"
                checked={restrictSections}
                onChange={(e) => setRestrictSections(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
            </div>
          </div>

          {!editableState && (
            <div className="flex items-start gap-2 rounded-lg bg-warning-50 p-2.5 text-xs text-warning-800 dark:bg-warning-950/30 dark:text-warning-300 border border-warning-200/60 dark:border-warning-900/30">
              <AlertCircle className="h-4 w-4 shrink-0 text-warning-600 dark:text-warning-400 mt-0.5" />
              <span>
                Document is currently in <strong>Read-Only</strong> mode. You can switch back to Edit mode anytime using this permissions panel.
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-muted dark:border-muted">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:text-muted-foreground dark:hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-md bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            Apply Permissions
          </button>
        </div>
      </div>
    </div>
  );
}
