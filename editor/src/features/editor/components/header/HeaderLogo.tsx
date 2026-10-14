
import docupilotLogo from "../../../../assets/images/docupilot-logo.png";

export default function HeaderLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* DocuPilot logo */}
      <img
        src={docupilotLogo}
        alt="DocuPilot Logo"
        className="h-15 w-15 shrink-0 object-contain"
      />

      {/* Application branding */}
      <div className="flex flex-col justify-center leading-tight">
        <h1 className="text-xl font-extrabold tracking-wide text-[#324480]">
          Docu Pilot
        </h1>

        <p className="mt-1 text-xs font-bold tracking-wider text-[#324480]">
          Doc. Prep. Reimagined!
        </p>
      </div>
    </div>
  );
}



