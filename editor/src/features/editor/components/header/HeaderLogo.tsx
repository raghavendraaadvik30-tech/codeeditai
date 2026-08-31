/*
Purpose:
HeaderLogo.tsx is a reusable header component that displays the Document Editor application logo and application name.

What each part does
FileText – Provides the document/file icon from lucide-react.
Logo container – Displays the icon inside a blue, rounded square with a subtle shadow.
Document Editor – Displays the application name next to the logo.
Typography – Uses Tailwind CSS classes for font size, weight, spacing, and text colors.
Dark mode – Supports dark theme using dark: Tailwind classes.
Responsive/reusable – The component can be placed anywhere in the application header without additional logic.
No backend/API logic – This component is purely presentational and does not communicate with the backend or manage application state.
*/

import { FileText } from "lucide-react";

export default function HeaderLogo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Logo */}
      <div
        className="
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-xl
          bg-blue-600
          text-white
          shadow-sm
        "
      >
        <FileText className="h-4 w-4" />
      </div>

      {/* Document Information */}
      <div className="leading-tight">
        <h1
          className="
            text-[17px]
            font-semibold
            text-gray-900
            dark:text-white"
        >
          Document Editor
        </h1>

        <p
          className="
            text-xs
            text-gray-500
            dark:text-slate-400
          "
        >
        
        </p>
      </div>
    </div>
  );
}