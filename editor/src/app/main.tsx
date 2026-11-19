// main.tsx
// PURPOSE:  This is the ENTRY POINT of the React application.
// It connects the React application to the HTML page.

// RESPONSIBILITIES:
// 1. Import React's StrictMode.
// 2. Import createRoot to start React.
// 3. Import the root App component.
// 4. Import global CSS.
// 5. Find the HTML element with id="root".
// 6. Render the <App /> component inside that element.
//
// IMPORTANT: This file should remain very small.

// It should NOT contain:
// - API calls
// - Authentication logic
// - Business logic
// - Database operations
// - Dashboard logic
// - Editor logic
//
// Those responsibilities belong to other modules.
// StrictMode helps detect potential problems in the application during development.

// IMPORTANT:
// StrictMode is mainly a development aid.
// It does not represent a backend or API feature.
import { StrictMode } from "react";


// createRoot is used to create the React root and mount the React application into the HTML DOM.
import { createRoot } from "react-dom/client";


// Import the main/root React component of the application.
// App.tsx contains:
// - AppProvider
// - RouterProvider
// - Application-wide composition
import App from "./App";


// Import global stylesheet.
// This file can contain:
// - Tailwind styles
// - CSS variables
// - Global styles
// - Base styles
import "../index.css";

// Native (Capacitor) start-up. No-op in a normal browser.
import { setupNativeApp } from "./native";
// Long-press opens context menus on iPhone/iPad (iOS never fires contextmenu).
import { installLongPressContextMenu } from "@/shared/platform/touch";

void setupNativeApp();
installLongPressContextMenu();

// CREATE REACT ROOT   document.getElementById("root")
// Finds the HTML element: <div id="root"></div> Usually this is present in index.html.
// The "!" tells TypeScript: "I know this element exists, so don't treat it as null."
// createRoot(...) Creates the React root application.
// render(...) Mounts the React component tree into that root.


createRoot(
  document.getElementById("root")!
).render(


 
  // StrictMode
  // Runs React development checks to help identify unsafe or problematic patterns.
  // Everything inside StrictMode is part of the React application tree.
  // StrictMode does NOT make API calls and does NOT connect to the backend.
  

  <StrictMode>


    {/* App
        This is the root component of your application.
        App.tsx then provides:
        AppProvider
            ↓
        RouterProvider
            ↓
        routes
            ↓
        layouts
            ↓
        pages */}

    <App />


  </StrictMode>
);
