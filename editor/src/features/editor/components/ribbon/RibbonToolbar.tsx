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
import HeaderFooterTab from "./tabs/HeaderFooterTab";
import { useHeaderFooter } from "@/features/editor/document/context/HeaderFooterContext";

const baseTabs = ["Home", "Insert", "Layout", "Review"] as const;

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
        border-gray-200
        dark:border-slate-800
        bg-white
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
                  ? "bg-white text-emerald-700 border-t-2 border-t-emerald-600 border-x border-b-0 border-slate-200 shadow-2xs dark:bg-[#07131E] dark:text-emerald-400 dark:border-slate-700 dark:border-t-emerald-500"
                  : "text-emerald-600 hover:bg-emerald-50/60 dark:text-emerald-400 dark:hover:bg-slate-800"
              }
            `}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
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
          border-slate-200
          bg-white
          px-2
          py-1
          dark:border-slate-800
          dark:bg-[#07131E]
          ${activeTab === "Header & Footer" ? "min-h-[94px] bg-[#fbfcfd] dark:bg-[#081522]" : "min-h-[48px]"}
        `}
      >
        {renderRibbon()}
      </div>
    </div>
  );
}