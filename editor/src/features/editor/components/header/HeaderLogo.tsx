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
import docupilotLogo from "@/assets/images/docupilot-logo.png";

export default function HeaderLogo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* White rounded shield tile */}
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-lg
          bg-white
          border
          border-[#E0E7EF]
          text-[#324480]
          shadow-xs
          dark:bg-[#132742]
          dark:border-[#1E3A5F]
          dark:text-[#38BDF8]
        "
      >
        <img
          src={docupilotLogo}
          alt="DocuPilot Logo"
          className="h-auto w-[140px] object-contain"
        />
      </div>

      {/* DOCUMENT PORTAL title */}
      <div className="leading-tight">
        <h1
          className="
            text-xl
            font-extrabold
            tracking-wider
            text-[#324480]
            dark:text-white
          "
        >
          Docu Pilot
        </h1>

        <h6
          className="
            text-xs
            font-extrabold
            tracking-wider
            text-[#324480]
            dark:text-white
          "
        >
          Doc. Prep. Reimagined!
        </h6>
      </div>
    </div>
  );
}
