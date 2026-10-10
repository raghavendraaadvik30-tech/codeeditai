/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Internal Ref Section
 * Description:
 * Internal Ref content section with 3 sub-tabs: Web URL, Email, Documents.
 * --------------------------------------------------------
 */

import { useState } from 'react';
import { Globe, Mail } from 'lucide-react';
import { WebUrlTab } from './WebUrlTab';
import { EmailTab } from './EmailTab';
import { cn } from '@/lib/utils';
import type { LinkHistoryType } from '../../types';

export type InternalRefSubTab = 'web' | 'email';

interface InternalRefColumnProps {
  activeSubTab?: InternalRefSubTab;
  onSubTabChange?: (tab: InternalRefSubTab) => void;
  onLinkInserted?: (item: {
    displayText: string;
    target: string;
    targetId?: string;
    type: LinkHistoryType;
    metadata?: Record<string, unknown>;
  }) => void;
}

export function InternalRefColumn({
  activeSubTab = 'web',
  onSubTabChange,
  onLinkInserted,
}: InternalRefColumnProps) {
  const [internalTab, setInternalTab] = useState<InternalRefSubTab>(activeSubTab);
  const currentTab = onSubTabChange ? activeSubTab : internalTab;

  const handleTabChange = (tab: InternalRefSubTab) => {
    setInternalTab(tab);
    onSubTabChange?.(tab);
  };

  const tabs: { id: InternalRefSubTab; label: string; icon: typeof Globe }[] = [
    { id: 'web', label: 'Web URL', icon: Globe },
    { id: 'email', label: 'Email', icon: Mail },
  ];

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3.5 space-y-3 dark:border-[#294564] dark:bg-[#111D29]">
      {/* Sub-Tabs Selector */}
      <div className="grid grid-cols-2 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all select-none cursor-pointer',
                isActive
                  ? 'bg-button-primary text-button-primary-foreground border border-[#C2D9F7] shadow-2xs font-semibold dark:bg-[#1E3A8A] dark:border-[#38BDF8]/40 dark:text-white'
                  : 'bg-white text-[#64748B] hover:bg-slate-50 border border-slate-200 dark:bg-[#111D29] dark:border-[#294564] dark:text-slate-400 dark:hover:text-white'
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-[#2563EB] dark:text-[#38BDF8]" : "text-slate-400")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="w-full">
        {currentTab === 'web' && <WebUrlTab onLinkInserted={onLinkInserted} />}
        {currentTab === 'email' && <EmailTab />}
      </div>
    </div>
  );
}
