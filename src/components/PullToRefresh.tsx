import { ReactNode, useState } from "react";
import { usePullToRefresh } from "../utils/hooks";
import { Loader2, ArrowDown, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function PullToRefresh({ onRefresh, children, className = "", disabled = false }: PullToRefreshProps) {
  const [refreshStatus, setRefreshStatus] = useState<'success' | 'error' | null>(null);

  const handleRefresh = async () => {
    try {
      await onRefresh();
      setRefreshStatus('success');
      setTimeout(() => setRefreshStatus(null), 800);
    } catch (error) {
      setRefreshStatus('error');
      setTimeout(() => setRefreshStatus(null), 1500);
    }
  };

  const { isRefreshing, pullDistance, containerRef } = usePullToRefresh(
    disabled ? async () => { } : handleRefresh
  );

  const showIndicator = pullDistance > 0 || isRefreshing || refreshStatus !== null;
  const shouldTrigger = pullDistance > 60;
  const pullPercentage = Math.min((pullDistance / 60) * 100, 100);

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Pull Indicator */}
      {showIndicator && (
        <div
          className="absolute top-0 left-0 right-0 flex flex-col items-center justify-center z-50"
          style={{
            transform: `translateY(${Math.min(pullDistance, 80) - 80}px)`,
            height: '80px',
          }}
        >
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-700">
            {refreshStatus === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 animate-in zoom-in duration-200" />
            ) : refreshStatus === 'error' ? (
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 animate-in zoom-in duration-200" />
            ) : isRefreshing ? (
              <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
            ) : shouldTrigger ? (
              <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-bounce" />
            ) : (
              <ArrowDown
                className="w-6 h-6 text-gray-400 dark:text-gray-500 transition-transform"
                style={{ transform: `rotate(${(pullDistance / 60) * 180}deg)` }}
              />
            )}
          </div>

          {/* Progress indicator text */}
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            {refreshStatus === 'success' ? (
              <span className="text-green-600 dark:text-green-400">Berhasil diperbarui!</span>
            ) : refreshStatus === 'error' ? (
              <span className="text-red-600 dark:text-red-400">Gagal memperbarui</span>
            ) : isRefreshing ? (
              <span>Memperbarui...</span>
            ) : shouldTrigger ? (
              <span className="text-blue-600 dark:text-blue-400">Lepas untuk refresh</span>
            ) : pullDistance > 0 ? (
              <span>Tarik untuk refresh</span>
            ) : null}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {pullDistance > 0 && !isRefreshing && refreshStatus === null && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-40">
          <div
            className={`h-full transition-all duration-100 ${shouldTrigger
              ? 'bg-blue-600 dark:bg-blue-400'
              : 'bg-gray-400 dark:bg-gray-500'
              }`}
            style={{ width: `${pullPercentage}%` }}
          />
        </div>
      )}

      {/* Content */}
      <div
        className="transition-all duration-200"
        style={{ paddingTop: isRefreshing || refreshStatus !== null ? '80px' : '0' }}
      >
        {children}
      </div>
    </div>
  );
}
