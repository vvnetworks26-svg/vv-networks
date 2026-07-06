import React, { memo } from "react";
import WidgetLauncher from "./WidgetLauncher";
import WidgetContainer from "./WidgetContainer";
import DeveloperOverlay from "./DeveloperOverlay";

interface LeadFlowWidgetProps {
  onBookDemo: () => void;
}

/** Drop-in floating widget — place once inside <LeadFlowProvider> */
const LeadFlowWidget = memo(function LeadFlowWidget({ onBookDemo }: LeadFlowWidgetProps) {
  return (
    <>
      {/* Floating bottom-right stack */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-4">
        <WidgetContainer onBookDemo={onBookDemo} />
        <WidgetLauncher />
      </div>

      {/* Dev overlay — hidden by default, toggle Ctrl+Shift+D */}
      <DeveloperOverlay />
    </>
  );
});

export default LeadFlowWidget;
