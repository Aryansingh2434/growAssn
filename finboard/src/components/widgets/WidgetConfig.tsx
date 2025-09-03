import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Widget } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { validateApiKey } from '../../utils';

interface WidgetConfigProps {
  widget: Widget;
  onSave: (updatedWidget: Partial<Widget>) => void;
  onClose: () => void;
}

export const WidgetConfig: React.FC<WidgetConfigProps> = ({ widget, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: widget.title,
    description: widget.description || '',
    apiEndpoint: widget.apiEndpoint,
    apiKey: widget.apiKey || '',
    refreshInterval: widget.refreshInterval,
    config: { ...widget.config },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.apiEndpoint.trim()) {
      newErrors.apiEndpoint = 'API endpoint is required';
    }
    
    if (formData.apiKey && !validateApiKey(formData.apiKey, 'alphavantage')) {
      newErrors.apiKey = 'Invalid API key format';
    }
    
    if (formData.refreshInterval < 5) {
      newErrors.refreshInterval = 'Refresh interval must be at least 5 seconds';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(formData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateConfig = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, [field]: value }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Widget Configuration</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Widget Title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                error={errors.title}
                placeholder="Enter widget title"
              />
              
              <Input
                label="Description (Optional)"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Enter widget description"
              />
              
              <Input
                label="API Endpoint"
                value={formData.apiEndpoint}
                onChange={(e) => updateFormData('apiEndpoint', e.target.value)}
                error={errors.apiEndpoint}
                placeholder="e.g., AAPL for Alpha Vantage"
              />
              
              <Input
                label="API Key (Optional)"
                type="password"
                value={formData.apiKey}
                onChange={(e) => updateFormData('apiKey', e.target.value)}
                error={errors.apiKey}
                placeholder="Enter your API key"
              />
              
              <Input
                label="Refresh Interval (seconds)"
                type="number"
                min="5"
                value={formData.refreshInterval}
                onChange={(e) => updateFormData('refreshInterval', parseInt(e.target.value))}
                error={errors.refreshInterval}
              />
              
              {/* Widget-specific configuration */}
              {widget.type === 'table' && (
                <div className="space-y-3">
                  <h4 className="font-medium text-[var(--foreground)]">Table Configuration</h4>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.config.showSearch || false}
                      onChange={(e) => updateConfig('showSearch', e.target.checked)}
                      className="rounded border-[var(--border-color)] text-[var(--primary-button)] focus:ring-[var(--primary-button)]"
                    />
                    <span className="text-sm text-[var(--foreground)]">Show search</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.config.showPagination || false}
                      onChange={(e) => updateConfig('showPagination', e.target.checked)}
                      className="rounded border-[var(--border-color)] text-[var(--primary-button)] focus:ring-[var(--primary-button)]"
                    />
                    <span className="text-sm text-[var(--foreground)]">Show pagination</span>
                  </label>
                  
                  <Input
                    label="Items per page"
                    type="number"
                    min="5"
                    max="100"
                    value={formData.config.itemsPerPage || 10}
                    onChange={(e) => updateConfig('itemsPerPage', parseInt(e.target.value))}
                  />
                </div>
              )}
              
              {widget.type === 'card' && (
                <div className="space-y-3">
                  <h4 className="font-medium text-[var(--foreground)]">Card Configuration</h4>
                  
                  <Select
                    label="Card Type"
                    value={formData.config.cardType || 'watchlist'}
                    onChange={(e) => updateConfig('cardType', e.target.value)}
                  >
                    <option value="watchlist">Watchlist</option>
                    <option value="gainers">Market Gainers</option>
                    <option value="performance">Performance Data</option>
                    <option value="financial">Financial Data</option>
                  </Select>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.config.showTrend || false}
                      onChange={(e) => updateConfig('showTrend', e.target.checked)}
                      className="rounded border-[var(--border-color)] text-[var(--primary-button)] focus:ring-[var(--primary-button)]"
                    />
                    <span className="text-sm text-[var(--foreground)]">Show trend indicators</span>
                  </label>
                </div>
              )}
              
              {widget.type === 'chart' && (
                <div className="space-y-3">
                  <h4 className="font-medium text-[var(--foreground)]">Chart Configuration</h4>
                  
                  <Select
                    label="Chart Type"
                    value={formData.config.chartType || 'line'}
                    onChange={(e) => updateConfig('chartType', e.target.value)}
                  >
                    <option value="line">Line Chart</option>
                    <option value="candlestick">Candlestick</option>
                  </Select>
                  
                  <Select
                    label="Time Interval"
                    value={formData.config.timeInterval || 'daily'}
                    onChange={(e) => updateConfig('timeInterval', e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Select>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.config.showVolume || false}
                      onChange={(e) => updateConfig('showVolume', e.target.checked)}
                      className="rounded border-[var(--border-color)] text-[var(--primary-button)] focus:ring-[var(--primary-button)]"
                    />
                    <span className="text-sm text-[var(--foreground)]">Show volume</span>
                  </label>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
