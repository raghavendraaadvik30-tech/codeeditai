/*### `RibbonToolbar.tsx`

**Purpose:**
Provides the main ribbon toolbar and manages navigation between editor tabs.

**Responsibilities:**

* Displays Home, Insert, Layout, and Review tabs.
* Tracks the currently active tab.
* Renders the corresponding tab content.
* Handles tab switching.
* Provides light/dark mode styling.
* Acts as the main container for ribbon controls.

**Hardcoded?** ✅ Partially — tab names and available tabs are defined in the component.

**Backend needed?** ❌ No. Tab switching and UI rendering are frontend functionality.

**Backend needed for:** Saving toolbar-related document changes, user preferences, or synchronizing editor actions.
*/

import { useState } from "react";

import HomeTab from "./tabs/HomeTab";
import InsertTab from "./tabs/InsertTab";
import LayoutTab from "./tabs/LayoutTab";

import ReviewTab from "./tabs/ReviewTab";


const tabs = [
  "Home",
  "Insert",
  "Layout",
  "Review",
  
] as const;

type RibbonTab = (typeof tabs)[number];

export default function RibbonToolbar() {
  const [activeTab, setActiveTab] =
    useState<RibbonTab>("Home");

  const renderRibbon = () => {
    switch (activeTab) {
      case "Home":
        return <HomeTab />;

      case "Insert":
        return <InsertTab />;

      case "Layout":
        return <LayoutTab />;

      
      case "Review":
        return <ReviewTab />;

    

      default:
        return <HomeTab />;
    }
  };

  return (
    <div
      className="
        border-b
        border-gray-200
        dark:border-slate-800
        bg-white
        dark:bg-[#0B1620]
      "
    >
      {/* --------------------------------
          RIBBON TABS
      -------------------------------- */}

      <div
        className="
          flex
          items-center
          gap-0.5
          px-3
          pt-1
        "
      >
        {tabs.map((tab) => {
          const active = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`
                rounded-t-md
                px-4
                py-1.5
                text-sm
                font-medium
                transition-colors

                ${
                  active
                    ? "bg-blue-50 text-blue-700 border border-b-0 border-gray-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-slate-700"
                    : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }
              `}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* --------------------------------
          RIBBON CONTENT
      -------------------------------- */}

      <div
        className="
          min-h-[48px]
          border-t
          border-slate-200
          bg-white
          px-3
          py-1

          dark:border-slate-800
          dark:bg-[#07131E]
        "
      >
        {renderRibbon()}
      </div>
    </div>
  );
}