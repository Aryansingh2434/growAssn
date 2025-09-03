import React, { useState } from 'react';
import { X, Key, Download, Upload } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setApiKey } from '../store/dashboardSlice';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardHeader, CardContent } from './ui/Card';
import { validateApiKey } from '../utils';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const { apiKeys, widgets } = useSelector((state: RootState) => state.dashboard);
  
  const [formData, setFormData] = useState({
    alphaVantageKey: apiKeys.alphavantage || '',
    finnhubKey: apiKeys.finnhub || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (formData.alphaVantageKey && !validateApiKey(formData.alphaVantageKey, 'alphavantage')) {
      newErrors.alphaVantageKey = 'Invalid Alpha Vantage API key format';
    }
    
    if (formData.finnhubKey && !validateApiKey(formData.finnhubKey, 'finnhub')) {
      newErrors.finnhubKey = 'Invalid Finnhub API key format';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    if (formData.alphaVantageKey) {
      dispatch(setApiKey({ provider: 'alphavantage', key: formData.alphaVantageKey }));
    }
    
    if (formData.finnhubKey) {
      dispatch(setApiKey({ provider: 'finnhub', key: formData.finnhubKey }));
    }
    
    onClose();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleExportConfig = () => {
    const config = {
      widgets,
      apiKeys,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finboard-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target?.result as string);
        // In a real app, you'd dispatch actions to restore the config
        console.log('Imported config:', config);
        alert('Configuration imported successfully!');
      } catch (error) {
        alert('Failed to import configuration. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Settings</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* API Keys Section */}
            <div>
              <h3 className="text-md font-medium text-[var(--foreground)] mb-3 flex items-center">
                <Key className="w-4 h-4 mr-2" />
                API Keys
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    label="Alpha Vantage API Key"
                    type="password"
                    value={formData.alphaVantageKey}
                    onChange={(e) => updateFormData('alphaVantageKey', e.target.value)}
                    error={errors.alphaVantageKey}
                    placeholder="Enter your Alpha Vantage API key"
                  />
                  <p className="text-xs text-[var(--muted-text)] mt-1">
                    Get your free API key from{' '}
                    <a
                      href="https://www.alphavantage.co/support/#api-key"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary-button)] hover:underline"
                    >
                      alphavantage.co
                    </a>
                  </p>
                </div>
                
                <div>
                  <Input
                    label="Finnhub API Key (Optional)"
                    type="password"
                    value={formData.finnhubKey}
                    onChange={(e) => updateFormData('finnhubKey', e.target.value)}
                    error={errors.finnhubKey}
                    placeholder="Enter your Finnhub API key"
                  />
                  <p className="text-xs text-[var(--muted-text)] mt-1">
                    Get your API key from{' '}
                    <a
                      href="https://finnhub.io/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary-button)] hover:underline"
                    >
                      finnhub.io
                    </a>
                  </p>
                </div>
                
                <Button type="submit" className="w-full">
                  Save API Keys
                </Button>
              </form>
            </div>

            {/* Dashboard Configuration */}
            <div className="border-t border-[var(--border-color)] pt-6">
              <h3 className="text-md font-medium text-[var(--foreground)] mb-3">
                Dashboard Configuration
              </h3>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleExportConfig}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Configuration</span>
                </Button>
                
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportConfig}
                    className="hidden"
                    id="import-config"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('import-config')?.click()}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import Configuration</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Usage Information */}
            <div className="border-t border-[var(--border-color)] pt-6">
              <h3 className="text-md font-medium text-[var(--foreground)] mb-3">
                Usage Information
              </h3>
              
              <div className="space-y-2 text-sm text-[var(--secondary-text)]">
                <div className="flex justify-between">
                  <span>Total Widgets:</span>
                  <span className="font-medium text-[var(--foreground)]">{widgets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>API Keys Configured:</span>
                  <span className="font-medium text-[var(--foreground)]">{Object.keys(apiKeys).length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
