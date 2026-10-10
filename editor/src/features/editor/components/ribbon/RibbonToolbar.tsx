/*### `RibbonToolbar.tsx`

**Purpose:**
Provides the main ribbon toolbar and manages navigation between standard editor tabs
and contextual object tabs (Chart Design and Format).

**Responsibilities:**
- Displays Home, Insert, Layout, Review tabs.
- Displays contextual Chart Design and Format tabs when a chart object is selected.
- Manages active tab switching.
- Renders corresponding tab content.
*/

import { useEffect, useRef, useState } from "react";

import HomeTab from "./tabs/HomeTab";
import InsertTab from "./tabs/InsertTab";
import LayoutTab from "./tabs/LayoutTab";
import ReviewTab from "./tabs/ReviewTab";
import CommentsTab from "./tabs/CommentsTab";
import HeaderFooterTab from "./tabs/HeaderFooterTab";
import { useHeaderFooter } from "@/features/editor/modules/document/context/HeaderFooterContext";

const baseTabs = ["Home", "Insert", "Layout", "Review", "Comments"] as const;

type RibbonTab = (typeof baseTabs)[number];

export default function RibbonToolbar() {
  const { isHeaderFooterActive } = useHeaderFooter();
  const [activeTab, setActiveTab] = useState<RibbonTab | "Header & Footer">("Home");
  const previousTabRef = useRef<RibbonTab>("Home");

  useEffect(() => {
    if (isHeaderFooterActive) {
      if (activeTab !== "Header & Footer") {
        previousTabRef.current = (activeTab as RibbonTab) || "Home";
      }
      setActiveTab("Header & Footer");
    } else {
      if (activeTab === "Header & Footer") {
        setActiveTab(previousTabRef.current || "Layout");
      }
    }
  }, [isHeaderFooterActive]);

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
      case "Comments":
        return <CommentsTab />;
      case "Header & Footer":
        return <HeaderFooterTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div
      className="
        border-b
        border-[#E0E7EF]
        bg-white
        dark:border-[#1E3A5F]
        dark:bg-[#0B1620]
      "
    >
      {/* --------------------------------
          RIBBON TABS HEADER
      -------------------------------- */}
      <div className="flex items-center gap-0.5 px-3 pt-1">
        {/* Standard Editor Tabs */}
        {baseTabs.map((tab) => {
          const active = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`
                px-3.5
                py-1
                text-xs
                font-medium
                transition-colors
                cursor-pointer
                ${
                  active
                    ? "text-[#324480] font-bold border-b-2 border-[#324480] bg-transparent dark:text-[#38BDF8] dark:border-[#38BDF8]"
                    : "text-[#324480]/70 hover:text-[#324480] hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-transparent"
                }
              `}
            >
              {tab}
            </button>
          );
        })}

        {/* Contextual Header & Footer Tab */}
        {isHeaderFooterActive && (
          <button
            key="Header & Footer"
            type="button"
            onClick={() => setActiveTab("Header & Footer")}
            className={`
              rounded-t-md
              px-4
              py-1.5
              text-sm
              font-semibold
              transition-colors
              flex
              items-center
              gap-1.5

              ${
                activeTab === "Header & Footer"
                  ? "bg-card text-success-700 border-t-2 border-t-success-600 border-x border-b-0 border-secondary shadow-2xs dark:bg-[#07131E] dark:text-success-400 dark:border-secondary-foreground dark:border-t-success-500"
                  : "text-success-600 hover:bg-success-50/60 dark:text-success-400 dark:hover:bg-muted"
              }
            `}
          >
            <span className="h-2 w-2 rounded-full bg-success-600 animate-pulse" />
            <span>Header &amp; Footer</span>
          </button>
        )}
      </div>

      {/* --------------------------------
          RIBBON CONTENT AREA
      -------------------------------- */}
      <div
        className={`
          border-t
          border-[#E0E7EF]
          bg-white
          px-2
          py-1
          dark:border-[#1E3A5F]
          dark:bg-[#07131E]
          ${activeTab === "Header & Footer" ? "min-h-23.5 bg-white dark:bg-[#081522]" : "min-h-12"}
        `}
      >
        {renderRibbon()}
      </div>
    </div>
  );
}
