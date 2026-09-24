import React, { useState, useEffect, useRef } from 'react';
import { Globe, Search, ExternalLink, Image as ImageIcon, Info, Check } from 'lucide-react';
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

// Curated high quality sample online images for quick 1-click insertion
const SAMPLE_ONLINE_IMAGES = [
  {
    title: 'Nature & Landscape',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Technology & Work',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Wildlife & Lion',
    url: 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Abstract Architecture',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  },
];

export const OnlinePicturesDialog: React.FC<OnlinePicturesDialogProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setUrl('');
      setError('');
      setIsLoading(false);
      setSelectedPreset(null);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleOpenGoogleImages = () => {
    const query = searchQuery.trim();
    const googleImagesUrl = query
      ? `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`
      : 'https://www.google.com/imghp';
    window.open(googleImagesUrl, '_blank', 'noopener,noreferrer');
  };

  const validateAndInsert = (imageUrlToTest: string) => {
    const trimmedUrl = imageUrlToTest.trim();

    if (!trimmedUrl) {
      setError('Please enter or paste a valid image URL');
      return;
    }

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://') && !trimmedUrl.startsWith('data:image/')) {
      setError('Image URL must begin with http:// or https://');
      return;
    }

    setIsLoading(true);
    setError('');

    // Preload and validate image loading
    const img = new Image();
    let handled = false;

    const completeInsertion = () => {
      if (handled) return;
      handled = true;
      setIsLoading(false);
      onInsert(trimmedUrl);
      onClose();
    };

    img.onload = () => {
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        if (!handled) {
          handled = true;
          setIsLoading(false);
          setError('Unable to load this image. Please choose another image or URL.');
        }
        return;
      }
      completeInsertion();
    };

    img.onerror = () => {
      if (!handled) {
        handled = true;
        setIsLoading(false);
        setError('Unable to load this image. Please choose another image or check the link.');
      }
    };

    img.src = trimmedUrl;

    // Timeout fallback if image loading stalls
    setTimeout(() => {
      if (!handled) {
        completeInsertion();
      }
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndInsert(url);
  };

  const handlePresetSelect = (presetUrl: string) => {
    setSelectedPreset(presetUrl);
    setUrl(presetUrl);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-[#111D29] dark:text-slate-100">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900 dark:text-white">
                Online Pictures
              </DialogTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Search Google Images or paste image address
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* STEP 1: Search Google Images */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-blue-500" />
              <span>Search Google Images</span>
            </label>
            <div className="flex gap-2">
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
                placeholder="Search term (e.g. lion, nature, technology)..."
                className="text-xs bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700"
              />
              <Button
                type="button"
                onClick={handleOpenGoogleImages}
                className="bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-semibold shrink-0 flex items-center gap-1.5 px-3"
              >
                <span>Search Google</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-950/50 p-2 rounded border border-slate-200/60 dark:border-slate-800/60">
              <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
              <span>
                Google Images will open in a new tab. Right-click your chosen image → select <strong>'Copy image address'</strong>, paste it below, and click <strong>Insert</strong>.
              </span>
            </div>
          </div>

          {/* STEP 2: Paste Image URL Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
                <span>Selected Image URL</span>
              </label>
              <Input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setUrl(e.target.value);
                  setSelectedPreset(null);
                  if (error) setError('');
                }}
                placeholder="https://images.unsplash.com/photo-... or copied image address"
                className={`w-full text-xs font-mono ${
                  error
                    ? 'border-red-500 focus-visible:ring-red-500/30'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              />
              {error && (
                <p className="mt-1 text-[11px] font-medium text-red-500 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{error}</span>
                </p>
              )}
            </div>

            {/* Quick Sample Presets */}
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Or pick a quick sample image:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_ONLINE_IMAGES.map((preset) => {
                  const isSelected = selectedPreset === preset.url;
                  return (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => handlePresetSelect(preset.url)}
                      className={`flex items-center gap-2 p-1.5 rounded-md border text-left text-xs transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="h-8 w-8 rounded object-cover shrink-0"
                      />
                      <span className="truncate text-[11px] font-medium flex-1">
                        {preset.title}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
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
                className="bg-[#0078d4] text-white hover:bg-[#005a9e] text-xs font-semibold px-4"
              >
                {isLoading ? 'Validating Image...' : 'Insert into Document'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
