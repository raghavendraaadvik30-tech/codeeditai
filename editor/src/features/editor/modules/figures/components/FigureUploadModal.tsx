/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: Figure Upload & Remote Image URL Modal
 * Description:
 * Modal container allowing users to drag & drop local image files or input image URL endpoints.
 * --------------------------------------------------------
 */

import React, { useState } from 'react';
import { UploadCloud, Link as LinkIcon, X, Check } from 'lucide-react';
import { FIGURE_CATEGORIES } from '../constants';
import type { CreateFigurePayload } from '../types';

interface FigureUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadFile: (file: File, metadata: Partial<CreateFigurePayload>) => void;
  onInsertUrl: (payload: CreateFigurePayload) => void;
}

export const FigureUploadModal: React.FC<FigureUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadFile,
  onInsertUrl,
}) => {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<string>('Diagram');
  const [imageUrl, setImageUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      onUploadFile(file, { title: title || file.name, caption, category });
      onClose();
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    onInsertUrl({
      title: title || 'Inserted Figure',
      src: imageUrl.trim(),
      caption,
      category,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#111D29]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Add New Figure
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="mt-4 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
              tab === 'upload'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
              tab === 'url'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            Image URL
          </button>
        </div>

        {/* Shared Metadata Fields */}
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Figure Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Workflow Diagram"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {FIGURE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Caption
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Figure 1: Architectural diagram."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Tab Contents */}
        {tab === 'upload' ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFileChange(e.dataTransfer.files);
            }}
            className={`mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
              dragOver
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-slate-300 dark:border-slate-700'
            }`}
          >
            <UploadCloud className="h-10 w-10 text-blue-500" />
            <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              Drag & drop an image here, or{' '}
              <label className="cursor-pointer text-blue-600 hover:underline">
                browse files
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files)}
                  className="hidden"
                />
              </label>
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              PNG, JPG, SVG, WebP up to 10MB
            </p>
          </div>
        ) : (
          <form onSubmit={handleUrlSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Direct Image Link (HTTPS)
              </label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700"
              >
                <Check className="h-4 w-4" />
                <span>Add Figure</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
