/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: LinkPreview Common Component
 * Description:
 * Preview card showing link metadata, protocol, target URL, and quick action controls.
 * --------------------------------------------------------
 */

import { ExternalLink, Globe, Lock, Unlock, Mail, Bookmark, BookOpen } from 'lucide-react';
import type { LinkModel } from '../../types';
import { LinkBadge } from './LinkBadge';

export interface LinkPreviewProps {
  link: LinkModel;
  onNavigate?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}

export function LinkPreview({ link, onNavigate, onEdit, onRemove }: LinkPreviewProps) {
  const isSecure = link.target.startsWith('https://');
  const isEmail = link.target.startsWith('mailto:');
  const isInternal = link.target.startsWith('#');

  const getIcon = () => {
    if (isEmail) return <Mail className="h-4 w-4 text-emerald-500" />;
    if (link.type === 'bookmark') return <Bookmark className="h-4 w-4 text-amber-500" />;
    if (link.type === 'cross_ref') return <BookOpen className="h-4 w-4 text-purple-500" />;
    if (isInternal) return <Bookmark className="h-4 w-4 text-indigo-500" />;
    return <Globe className="h-4 w-4 text-sky-500" />;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 dark:border-slate-800 dark:bg-[#0E1A29]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
            {getIcon()}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-slate-900 truncate dark:text-white">
              {link.displayText || link.target}
            </h4>
            <p className="text-[11px] text-slate-500 truncate dark:text-slate-400">
              {link.target}
            </p>
          </div>
        </div>

        <LinkBadge type={link.type} />
      </div>

      {/* Protocol info & status */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5">
          {link.type === 'external' && (
            isSecure ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <Lock className="h-3 w-3" /> Secure HTTPS
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Unlock className="h-3 w-3" /> Insecure HTTP
              </span>
            )
          )}
          {link.pageNumber && <span>· Page {link.pageNumber}</span>}
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              type="button"
              onClick={onNavigate}
              className="text-xs font-semibold text-[#0078d4] hover:underline"
            >
              Jump
            </button>
          )}
          {link.type === 'external' && (
            <a
              href={link.target}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Edit
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
