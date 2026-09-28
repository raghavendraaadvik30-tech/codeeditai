import React, { useState, useEffect, useRef } from 'react';
import { Globe, ExternalLink, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, ClipboardPaste } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import type { OnlinePicturesDialogProps } from '../types';
import { validateImageUrl } from '../utils';

export type { OnlinePicturesDialogProps };

interface ImageValidationState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  dimensions?: { width: number; height: number };
}

export const OnlinePicturesDialog: React.FC<OnlinePicturesDialogProps> = ({
  isOpen,
  onClose,
  onInsert,
  isPopupBlocked = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [url, setUrl] = useState('');
  const [popupBlocked, setPopupBlocked] = useState(isPopupBlocked);
  const [imageState, setImageState] = useState<ImageValidationState>({ status: 'idle' });
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Sync blocked state when prop updates
  useEffect(() => {
    setPopupBlocked(isPopupBlocked);
  }, [isPopupBlocked]);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setUrl('');
      setImageState({ status: 'idle' });
      const timer = setTimeout(() => {
        urlInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle URL changes & validation
  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      setImageState({ status: 'idle' });
      return;
    }

    const validation = validateImageUrl(trimmed);
    if (!validation.isValid) {
      setImageState({
        status: 'error',
        error: validation.error || 'Please enter a valid image URL starting with http:// or https://',
      });
      return;
    }

    setImageState({ status: 'loading' });
    let cancelled = false;

    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        setImageState({
          status: 'error',
          error: 'Unable to load this image. Please copy the direct image address.',
        });
        return;
      }
      setImageState({
        status: 'success',
        dimensions: { width: img.naturalWidth, height: img.naturalHeight },
      });
    };

    img.onerror = () => {
      if (cancelled) return;
      setImageState({
        status: 'error',
        error: 'Unable to load this image. Please copy the direct image address.',
      });
    };

    img.src = trimmed;

    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  const handleOpenGoogleImages = (queryToSearch?: string) => {
    const q = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    const googleImagesUrl = q
      ? `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(q)}`
      : 'https://www.google.com/imghp?hl=en';

    const newWindow = window.open(googleImagesUrl, '_blank', 'noopener,noreferrer');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      setPopupBlocked(true);
    } else {
      setPopupBlocked(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
        }
      }
    } catch {
      urlInputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageState.status === 'success' && url.trim()) {
      onInsert(url.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md bg-white p-5 text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-[#111D29] dark:text-slate-100 rounded-xl">
        <DialogHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                Online Picture
              </DialogTitle>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Search Google Images &amp; paste the image address
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-3 space-y-3">
          {/* Popup Blocker Alert */}
          {popupBlocked ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <p className="font-medium">Please allow pop-ups to open Google Images.</p>
                <button
                  type="button"
                  onClick={() => handleOpenGoogleImages()}
                  className="mt-1.5 inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 underline hover:no-underline"
                >
                  <span>Click here to open Google Images</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/60 p-2.5 text-xs text-slate-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-slate-300">
              <ExternalLink className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  Google Images opened in a new tab.
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Search &amp; select an image, right-click and choose <strong>"Copy image address"</strong>, then paste it here.
                </p>
              </div>
            </div>
          )}

          {/* Quick Search on Google Images input */}
          <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex gap-1.5">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleOpenGoogleImages();
                  }
                }}
                placeholder="Search Google Images (e.g. lion, mountain)..."
                className="h-8 text-xs bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => handleOpenGoogleImages()}
                className="h-8 shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-2.5 rounded-md flex items-center gap-1"
              >
                <span>Search</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Paste Image Address Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Paste image address</span>
                </label>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  <ClipboardPaste className="h-3 w-3" />
                  <span>Paste</span>
                </button>
              </div>

              <Input
                ref={urlInputRef}
                type="text"
                value={url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                placeholder="https://..."
                className={`w-full h-8 text-xs font-mono rounded-md ${
                  imageState.status === 'error'
                    ? 'border-red-500 focus-visible:ring-red-500/30'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              />

              {/* Error Message */}
              {imageState.status === 'error' && (
                <div className="mt-2 flex items-start gap-1.5 rounded-md bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <span>{imageState.error || 'Unable to load this image. Please copy the direct image address.'}</span>
                </div>
              )}
            </div>

            {/* Image Preview Box */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-2.5 min-h-[120px] flex flex-col items-center justify-center">
              {imageState.status === 'loading' && (
                <div className="flex flex-col items-center gap-1.5 text-slate-500 dark:text-slate-400 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-xs">Validating image preview...</span>
                </div>
              )}

              {imageState.status === 'success' && (
                <div className="flex flex-col items-center w-full">
                  <div className="relative max-h-36 w-full flex items-center justify-center overflow-hidden rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-black/30 p-1">
                    <img
                      src={url.trim()}
                      alt="Preview"
                      className="max-h-32 max-w-full object-contain rounded"
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between w-full px-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Ready to insert</span>
                    </span>
                    {imageState.dimensions && (
                      <span className="font-mono">
                        {imageState.dimensions.width} × {imageState.dimensions.height} px
                      </span>
                    )}
                  </div>
                </div>
              )}

              {(imageState.status === 'idle' || imageState.status === 'error') && (
                <div className="text-center py-2 text-slate-400 dark:text-slate-500">
                  <ImageIcon className="h-6 w-6 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">
                    {imageState.status === 'error'
                      ? 'No image preview available'
                      : 'Image preview will appear here'}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8 text-xs rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={imageState.status !== 'success'}
                className="h-8 bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold px-4 rounded-md shadow-xs disabled:opacity-50"
              >
                Insert into Document
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
