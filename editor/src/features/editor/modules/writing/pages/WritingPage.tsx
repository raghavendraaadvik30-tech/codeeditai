import { WritingProvider } from "../context/WritingContext";
import WritingPanel from "../components/WritingPanel";

export default function WritingPage() {
  return (
    <WritingProvider>
      <WritingPanel />
    </WritingProvider>
  );
}
