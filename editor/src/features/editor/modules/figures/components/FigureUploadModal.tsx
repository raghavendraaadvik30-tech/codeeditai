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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-secondary bg-card p-6 shadow-2xl dark:border-muted dark:bg-[#111D29]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-muted dark:border-muted">
          <h3 className="text-base font-semibold text-foreground dark:text-primary-foreground">
            Add New Figure
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted dark:hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="mt-4 flex rounded-xl bg-muted p-1 dark:bg-muted">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
              tab === 'upload'
                ? 'bg-card text-primary shadow-sm dark:bg-secondary dark:text-primary'
                : 'text-secondary-foreground dark:text-muted-foreground'
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
                ? 'bg-card text-primary shadow-sm dark:bg-secondary dark:text-primary'
                : 'text-secondary-foreground dark:text-muted-foreground'
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            Image URL
          </button>
        </div>

        {/* Shared Metadata Fields */}
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-secondary-foreground dark:text-muted-foreground">
              Figure Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Workflow Diagram"
              className="mt-1 w-full rounded-xl border border-secondary bg-muted p-2.5 text-xs outline-none focus:border-primary focus:bg-card dark:border-secondary-foreground dark:bg-secondary dark:text-primary-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-foreground dark:text-muted-foreground">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-xl border border-secondary bg-muted p-2.5 text-xs outline-none focus:border-primary focus:bg-card dark:border-secondary-foreground dark:bg-secondary dark:text-primary-foreground"
            >
              {FIGURE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-foreground dark:text-muted-foreground">
              Caption
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Figure 1: Architectural diagram."
              className="mt-1 w-full rounded-xl border border-secondary bg-muted p-2.5 text-xs outline-none focus:border-primary focus:bg-card dark:border-secondary-foreground dark:bg-secondary dark:text-primary-foreground"
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
                ? 'border-primary bg-primary/50 dark:bg-navy-950/20'
                : 'border-border dark:border-secondary-foreground'
            }`}
          >
            <UploadCloud className="h-10 w-10 text-primary" />
            <p className="mt-2 text-xs font-medium text-secondary-foreground dark:text-muted-foreground">
              Drag & drop an image here, or{' '}
              <label className="cursor-pointer text-primary hover:underline">
                browse files
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files)}
                  className="hidden"
                />
              </label>
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              PNG, JPG, SVG, WebP up to 10MB
            </p>
          </div>
        ) : (
          <form onSubmit={handleUrlSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-foreground dark:text-muted-foreground">
                Direct Image Link (HTTPS)
              </label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                className="mt-1 w-full rounded-xl border border-secondary bg-muted p-2.5 text-xs outline-none focus:border-primary focus:bg-card dark:border-secondary-foreground dark:bg-secondary dark:text-primary-foreground"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-secondary px-4 py-2 text-xs font-medium text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:text-muted-foreground dark:hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
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
