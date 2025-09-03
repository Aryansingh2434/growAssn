import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Widget, FinancialData } from '../../types';
import { WidgetWrapper } from './WidgetWrapper';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { formatCurrency, formatPercentage, getColorForChange } from '../../utils';
import { financialApiService } from '../../services/api';

interface TableWidgetProps {
  widget: Widget;
}

export const TableWidget: React.FC<TableWidgetProps> = ({ widget }) => {
  const [data, setData] = useState<FinancialData[]>([]);
  const [filteredData, setFilteredData] = useState<FinancialData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = widget.config.itemsPerPage || 10;
  const showSearch = widget.config.showSearch !== false;
  const showPagination = widget.config.showPagination !== false;

  const fetchData = async () => {
    if (!widget.apiKey) {
      setError('API key is required. Please add your API key in Settings.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For demo purposes, we'll fetch some sample stocks
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
      const promises = symbols.map(symbol => 
        financialApiService.fetchStockQuote(widget.apiKey!, symbol, 'alphavantage')
      );
      
      const results = await Promise.allSettled(promises);
      const validData: FinancialData[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value !== null) {
          validData.push(result.value);
        } else if (result.status === 'rejected') {
          console.warn(`Failed to fetch data for ${symbols[index]}:`, result.reason);
        }
      });
      
      if (validData.length === 0) {
        setError('No data could be retrieved. Please check your API key and try again.');
      } else {
        setData(validData);
        setFilteredData(validData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (widget.refreshInterval > 0) {
      const interval = setInterval(fetchData, widget.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [widget.apiKey, widget.refreshInterval]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = data.filter(item =>
        item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
    setCurrentPage(1);
  }, [searchTerm, data]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <WidgetWrapper
      widget={widget}
      isLoading={isLoading}
      error={error}
      onRefresh={fetchData}
    >
      <div className="space-y-4">
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search symbols..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-1 text-xs font-medium text-gray-500 uppercase">Symbol</th>
                <th className="text-right py-2 px-1 text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="text-right py-2 px-1 text-xs font-medium text-gray-500 uppercase">Change</th>
                <th className="text-right py-2 px-1 text-xs font-medium text-gray-500 uppercase">Change %</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={item.symbol} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-1 text-sm font-medium text-gray-900">{item.symbol}</td>
                  <td className="py-2 px-1 text-sm text-right">{formatCurrency(item.price)}</td>
                  <td className={`py-2 px-1 text-sm text-right ${getColorForChange(item.change)}`}>
                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                  </td>
                  <td className={`py-2 px-1 text-sm text-right ${getColorForChange(item.changePercent)}`}>
                    {formatPercentage(item.changePercent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            No data available
          </div>
        )}

        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </WidgetWrapper>
  );
};
