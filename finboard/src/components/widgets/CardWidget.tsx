import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Widget, FinancialData } from '../../types';
import { WidgetWrapper } from './WidgetWrapper';
import { formatCurrency, formatPercentage, getColorForChange, getBgColorForChange } from '../../utils';
import { financialApiService } from '../../services/api';

interface CardWidgetProps {
  widget: Widget;
}

export const CardWidget: React.FC<CardWidgetProps> = ({ widget }) => {
  const [data, setData] = useState<FinancialData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardType = widget.config.cardType || 'watchlist';
  const showTrend = widget.config.showTrend !== false;

  const fetchData = async () => {
    if (!widget.apiKey) {
      setError('API key is required. Please add your API key in Settings.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let result: FinancialData[] = [];

      if (cardType === 'gainers') {
        result = await financialApiService.fetchMarketGainers(widget.apiKey, 'alphavantage');
      } else {
        // For watchlist, performance, and financial data, fetch specific symbols
        const symbols = widget.apiEndpoint.split(',').map(s => s.trim());
        const promises = symbols.map(symbol => 
          financialApiService.fetchStockQuote(widget.apiKey!, symbol, 'alphavantage')
        );
        
        const results = await Promise.allSettled(promises);
        result = [];
        
        results.forEach((res, index) => {
          if (res.status === 'fulfilled' && res.value !== null) {
            result.push(res.value);
          } else if (res.status === 'rejected') {
            console.warn(`Failed to fetch data for ${symbols[index]}:`, res.reason);
          }
        });
        
        if (result.length === 0) {
          throw new Error('No data could be retrieved for the specified symbols');
        }
      }
      
      setData(result);
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
  }, [widget.apiKey, widget.refreshInterval, cardType, widget.apiEndpoint]);

  const renderCard = (item: FinancialData, index: number) => (
    <div
      key={`${item.symbol}-${index}`}
      className={`p-4 rounded-xl border-2 ${getBgColorForChange(item.change)} backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-[var(--foreground)] text-lg">{item.symbol}</h4>
          <p className="text-xl font-bold text-[var(--foreground)] mt-2">
            {formatCurrency(item.price)}
          </p>
        </div>
        
        <div className="text-right">
          <div className={`flex items-center ${getColorForChange(item.change)}`}>
            {showTrend && (
              item.change >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )
            )}
            <span className="text-sm font-medium">
              {formatPercentage(item.changePercent)}
            </span>
          </div>
          <div className={`text-sm ${getColorForChange(item.change)}`}>
            {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
          </div>
        </div>
      </div>

      {cardType === 'performance' && item.volume && (
        <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
          <div className="flex justify-between text-xs text-[var(--muted-text)]">
            <span>Volume</span>
            <span>{item.volume.toLocaleString()}</span>
          </div>
        </div>
      )}

      {cardType === 'financial' && item.marketCap && (
        <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
          <div className="flex justify-between text-xs text-[var(--muted-text)]">
            <span>Market Cap</span>
            <span>{formatCurrency(item.marketCap)}</span>
          </div>
        </div>
      )}
    </div>
  );

  const getCardTitle = () => {
    switch (cardType) {
      case 'gainers':
        return 'Top Gainers';
      case 'performance':
        return 'Performance Data';
      case 'financial':
        return 'Financial Data';
      default:
        return 'Watchlist';
    }
  };

  return (
    <WidgetWrapper
      widget={widget}
      isLoading={isLoading}
      error={error}
      onRefresh={fetchData}
    >
      <div className="space-y-3">
        {cardType === 'gainers' && (
          <div className="text-sm text-[var(--secondary-text)] mb-4 font-medium">
            Top performing stocks today
          </div>
        )}

        {data.length > 0 ? (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data.slice(0, cardType === 'gainers' ? 5 : 10).map(renderCard)}
          </div>
        ) : !isLoading && (
          <div className="text-center py-12 text-[var(--muted-text)]">
            <div className="w-16 h-16 bg-[var(--primary-button)]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <p className="font-medium text-[var(--secondary-text)]">No data available</p>
          </div>
        )}
      </div>
    </WidgetWrapper>
  );
};
