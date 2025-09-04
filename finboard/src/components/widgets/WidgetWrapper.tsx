import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, Settings, RefreshCw } from 'lucide-react';
import { Widget } from '../../types';
import { removeWidget, updateWidget } from '../../store/dashboardSlice';
import { Button } from '../ui/Button';
import { LoadingOverlay } from '../ui/Loading';
import { cn } from '../../utils';
import { WidgetConfig } from './WidgetConfig';

interface WidgetWrapperProps {
  widget: Widget;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({
  widget,
  children,
  isLoading = false,
  error = null,
  onRefresh,
}) => {
  const dispatch = useDispatch();
  const [showConfig, setShowConfig] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this widget?')) {
      dispatch(removeWidget(widget.id));
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleConfigSave = (updatedWidget: Partial<Widget>) => {
    dispatch(updateWidget({ id: widget.id, ...updatedWidget }));
    setShowConfig(false);
  };

  return (
    <div className="relative bg-[var(--card-background)] rounded-2xl border border-[var(--border-color)] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
      {/* Widget Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-gradient-to-r from-[var(--primary-button)]/5 to-[var(--accent-color)]/5 rounded-t-2xl">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-[var(--foreground)] truncate">
            {widget.title}
          </h3>
          {widget.description && (
            <p className="text-sm text-[var(--secondary-text)] truncate mt-1">
              {widget.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-[var(--primary-button)]/10 transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfig(true)}
            className="p-2 rounded-lg hover:bg-[var(--primary-button)]/10 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="p-2 rounded-lg text-[var(--error-color)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Widget Content */}
      <div className="relative">
        {isLoading && <LoadingOverlay />}
        
        {error ? (
          <div className="p-6 text-center">
            <div className="text-[var(--error-color)] text-sm mb-4">
              <p className="font-semibold">Error loading data</p>
              <p className="mt-2 text-[var(--secondary-text)]">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-3"
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="p-6">
            {children}
          </div>
        )}
      </div>

      {/* Last Updated */}
      {widget.lastUpdated && (
        <div className="px-6 py-3 border-t border-[var(--border-color)] text-xs text-[var(--secondary-text)] bg-[var(--primary-button)]/5 rounded-b-2xl">
          Last updated: {new Date(widget.lastUpdated).toLocaleTimeString()}
        </div>
      )}

      {/* Configuration Modal */}
      {showConfig && (
        <WidgetConfig
          widget={widget}
          onSave={handleConfigSave}
          onClose={() => setShowConfig(false)}
        />
      )}
    </div>
  );
};
