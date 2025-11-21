import { ReactNode } from "react";
import { MobileHeader } from "./MobileHeader";

interface MobileScreenWrapperProps {
  children: ReactNode;
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  actions?: ReactNode;
  className?: string;
}

export function MobileScreenWrapper({
  children,
  title,
  showBackButton = false,
  onBack,
  showSearch = false,
  onSearch,
  actions,
  className = "",
}: MobileScreenWrapperProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <MobileHeader
          title={title}
          showBackButton={showBackButton}
          onBack={onBack}
          showSearch={showSearch}
          onSearch={onSearch}
          actions={actions}
        />
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-auto ${className}`}>
        {children}
      </div>
    </div>
  );
}
