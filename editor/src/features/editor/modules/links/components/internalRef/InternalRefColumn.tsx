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
    <div className="flex flex-col bg-card dark:bg-[#0B1520] border border-secondary dark:border-muted rounded-lg p-2.5 shadow-xs">
      {/* Sub-Tabs Selector */}
      <div className="flex gap-1 p-0.5 mb-2 rounded-md bg-muted dark:bg-[#111D29]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-1 rounded text-10px font-medium transition-all select-none',
                isActive
                  ? 'bg-card text-primary shadow-xs dark:bg-[#1B2A3A] dark:text-primary'
                  : 'text-secondary-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
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
