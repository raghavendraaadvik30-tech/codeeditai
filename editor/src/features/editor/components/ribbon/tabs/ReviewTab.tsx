/*### `ReviewTab.tsx`

**Purpose:**
Provides review controls in the editor ribbon for managing document changes.

**Responsibilities:**

* Provides Track Changes option.
* Provides Accept All Changes option.
* Provides Reject All Changes option.
* Displays review actions using ribbon buttons.
* Currently uses alerts as placeholders for functionality.

**Hardcoded?** ✅ Yes — the review actions currently display hardcoded alert messages.

**Backend needed?** ❌ Not for the UI, but actual Track Changes requires editor logic.

**Backend needed for:** Storing changes, reviewing change history, accepting/rejecting changes across sessions, and real-time collaboration.
*/

import {
  FileDiff,
  CheckCheck,
  XCircle,
} from "lucide-react";

import RibbonButton from "../controls/RibbonButton";
import RibbonDivider from "../controls/RibbonDivider";

export default function ReviewTab() {
  const trackChanges = () => {
    alert(
      "Track Changes functionality will be implemented in a future version."
    );
  };

  const acceptAll = () => {
    alert(
      "All tracked changes accepted."
    );
  };

  const rejectAll = () => {
    alert(
      "All tracked changes rejected."
    );
  };

  return (
    <div className="flex items-center gap-2">

      {/* Track Changes */}

      <RibbonButton
        icon={<FileDiff className="h-4 w-4" />}
        onClick={trackChanges}
      >
        Track Changes
      </RibbonButton>

      <RibbonDivider />

      {/* Accept All */}

      <RibbonButton
        icon={<CheckCheck className="h-4 w-4" />}
        onClick={acceptAll}
      >
        Accept All
      </RibbonButton>

      {/* Reject All */}

      <RibbonButton
        icon={<XCircle className="h-4 w-4" />}
        onClick={rejectAll}
      >
        Reject All
      </RibbonButton>

    </div>
  );
}