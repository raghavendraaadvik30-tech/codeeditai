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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-[#111D29]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Document Permissions
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
                {model.title || "Untitled Document"}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              editableState
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
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
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800 dark:bg-slate-900/50">
            <div>
              <div className="font-medium text-slate-800 dark:text-slate-200">
                Allow Document Editing
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
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
                editableState ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out mt-[3px] ml-[3px] ${
                  editableState ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Access Roles */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Access Permission Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange("Editor")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  permissionRole === "Editor"
                    ? "border-blue-500 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-300 ring-1 ring-blue-500"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                }`}
              >
                <Edit3 className="h-4 w-4 mb-1" />
                <span className="font-medium text-xs">Editor</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Full edits</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("Reviewer")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  permissionRole === "Reviewer"
                    ? "border-blue-500 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-300 ring-1 ring-blue-500"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                }`}
              >
                <Users className="h-4 w-4 mb-1" />
                <span className="font-medium text-xs">Reviewer</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Suggest only</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("Viewer")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  permissionRole === "Viewer"
                    ? "border-blue-500 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-300 ring-1 ring-blue-500"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                }`}
              >
                <Eye className="h-4 w-4 mb-1" />
                <span className="font-medium text-xs">Viewer</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Read-only</span>
              </button>
            </div>
          </div>

          {/* Advanced Protection Options */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Prevent accidental layout resets
              </span>
              <input
                type="checkbox"
                checked={restrictSections}
                onChange={(e) => setRestrictSections(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>

          {!editableState && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/30">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <span>
                Document is currently in <strong>Read-Only</strong> mode. You can switch back to Edit mode anytime using this permissions panel.
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            Apply Permissions
          </button>
        </div>
      </div>
    </div>
  );
}
