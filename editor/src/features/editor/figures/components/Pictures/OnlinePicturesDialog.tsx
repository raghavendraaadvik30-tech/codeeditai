import React, { useState, useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

interface OnlinePicturesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
}

export const OnlinePicturesDialog: React.FC<OnlinePicturesDialogProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl('');
      setError('');
      setIsLoading(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError('Please paste an image URL');
      return;
    }

    setIsLoading(true);
    setError('');

    // Preload & validate image
    const img = new Image();
    let handled = false;

    const completeInsertion = () => {
      if (handled) return;
      handled = true;
      setIsLoading(false);
      onInsert(trimmedUrl);
      onClose();
    };

    img.onload = completeInsertion;

    img.onerror = () => {
      setIsLoading(false);
      setError('Failed to load image from URL. Please check the link and try again.');
    };

    img.src = trimmedUrl;

    // Safety fallback: if image loading takes too long or CORS prevents onload event
    setTimeout(() => {
      if (!handled) {
        completeInsertion();
      }
    }, 2500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md bg-white p-5 text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-[#111D29] dark:text-slate-100">
        <DialogHeader className="flex flex-row items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <DialogTitle className="text-base font-semibold text-slate-900 dark:text-white">
            Online Pictures
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-3 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Paste image URL here
            </label>
            <Input
              ref={inputRef}
              type="text"
              autoFocus
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              placeholder="https://example.com/image.png"
              className={`w-full text-xs ${
                error
                  ? 'border-red-500 focus-visible:ring-red-500/30'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {error && (
              <p className="mt-1 text-[11px] font-medium text-red-500">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !url.trim()}
              className="bg-[#0078d4] text-white hover:bg-[#005a9e] text-xs font-semibold"
            >
              {isLoading ? 'Loading...' : 'Insert'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
