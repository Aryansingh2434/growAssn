import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addWidget } from '../store/dashboardSlice';
import { Widget, WidgetConfig } from '../types';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Input';
import { Card, CardHeader, CardContent } from './ui/Card';
import { generateId, getWidgetSize, getGridPosition } from '../utils';

interface AddWidgetModalProps {
  onClose: () => void;
  existingWidgets: Widget[];
}

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ onClose, existingWidgets }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    type: 'card' as Widget['type'],
    title: '',
    description: '',
    apiEndpoint: '',
    apiKey: '',
    refreshInterval: 30,
    config: {} as WidgetConfig,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.apiEndpoint.trim()) {
      newErrors.apiEndpoint = 'API endpoint/symbol is required';
    }
    
    if (formData.refreshInterval < 5) {
      newErrors.refreshInterval = 'Refresh interval must be at least 5 seconds';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const position = getGridPosition(existingWidgets.length);
    const size = getWidgetSize(formData.type);
    
    const newWidget: Widget = {
      id: generateId(),
      type: formData.type,
      title: formData.title,
      description: formData.description || undefined,
      apiEndpoint: formData.apiEndpoint,
      apiKey: formData.apiKey || undefined,
      refreshInterval: formData.refreshInterval,
      position,
      size,
      config: getDefaultConfig(formData.type),
      dataMapping: {},
    };
    
    dispatch(addWidget(newWidget));
    onClose();
  };

  const getDefaultConfig = (type: Widget['type']): WidgetConfig => {
    switch (type) {
      case 'table':
        return {
          showSearch: true,
          showPagination: true,
          itemsPerPage: 10,
          columns: [
            { key: 'symbol', label: 'Symbol', sortable: true },
            { key: 'price', label: 'Price', format: 'currency', sortable: true },
            { key: 'change', label: 'Change', format: 'currency', sortable: true },
            { key: 'changePercent', label: 'Change %', format: 'percentage', sortable: true },
          ],
        };
      case 'card':
        return {
          cardType: 'watchlist',
          showTrend: true,
        };
      case 'chart':
        return {
          chartType: 'line',
          timeInterval: 'daily',
          showVolume: false,
        };
      default:
        return {};
    }
  };

  const updateFormData = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getExampleEndpoint = (type: Widget['type']) => {
    switch (type) {
      case 'table':
        return 'Multiple symbols (e.g., AAPL,GOOGL,MSFT)';
      case 'card':
        return 'AAPL (or AAPL,GOOGL for multiple)';
      case 'chart':
        return 'AAPL (single symbol only)';
      default:
        return 'AAPL';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Add New Widget</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Widget Type"
                value={formData.type}
                onChange={(e) => updateFormData('type', e.target.value)}
              >
                <option value="card">Finance Card</option>
                <option value="table">Data Table</option>
                <option value="chart">Price Chart</option>
              </Select>
              
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
                label="Stock Symbol(s)"
                value={formData.apiEndpoint}
                onChange={(e) => updateFormData('apiEndpoint', e.target.value)}
                error={errors.apiEndpoint}
                placeholder={getExampleEndpoint(formData.type)}
              />
              
              <Input
                label="Alpha Vantage API Key (Optional)"
                type="password"
                value={formData.apiKey}
                onChange={(e) => updateFormData('apiKey', e.target.value)}
                placeholder="Enter your API key for live data"
              />
              
              <Input
                label="Refresh Interval (seconds)"
                type="number"
                min="5"
                value={formData.refreshInterval}
                onChange={(e) => updateFormData('refreshInterval', parseInt(e.target.value))}
                error={errors.refreshInterval}
              />
              
              {/* Widget type descriptions */}
              <div className="p-4 bg-[var(--primary-button)]/10 border border-[var(--primary-button)]/20 rounded-xl">
                <h4 className="text-sm font-semibold text-[var(--foreground)] mb-2">
                  {formData.type === 'card' && 'Finance Card'}
                  {formData.type === 'table' && 'Data Table'}
                  {formData.type === 'chart' && 'Price Chart'}
                </h4>
                <p className="text-xs text-[var(--secondary-text)] leading-relaxed">
                  {formData.type === 'card' && 'Displays financial data in a compact card format with price, change, and trend indicators.'}
                  {formData.type === 'table' && 'Shows multiple stocks in a sortable table with search and pagination features.'}
                  {formData.type === 'chart' && 'Displays interactive line charts showing price history over time.'}
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Widget
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
