import axios from 'axios';
import { ApiResponse, FinancialData, ChartData } from '../types';

class FinancialApiService {
  private rateLimits: Map<string, { remaining: number; resetTime: Date }> = new Map();

  async checkRateLimit(provider: string): Promise<boolean> {
    const limit = this.rateLimits.get(provider);
    if (!limit) return true;
    
    if (limit.remaining <= 0 && new Date() < limit.resetTime) {
      throw new Error(`Rate limit exceeded for ${provider}. Resets at ${limit.resetTime.toLocaleTimeString()}`);
    }
    
    return true;
  }

  updateRateLimit(provider: string, remaining: number, resetTime: Date) {
    this.rateLimits.set(provider, { remaining, resetTime });
  }

  async fetchAlphaVantageData(
    apiKey: string,
    function_name: string,
    symbol: string,
    interval?: string
  ): Promise<ApiResponse> {
    try {
      await this.checkRateLimit('alphavantage');
      
      const params: Record<string, string> = {
        function: function_name,
        symbol,
        apikey: apiKey,
      };
      
      if (interval) {
        params.interval = interval;
      }

      const response = await axios.get('https://www.alphavantage.co/query', {
        params,
        timeout: 10000,
      });

      // Check for specific Alpha Vantage error messages
      if (response.data['Error Message']) {
        return {
          data: null,
          status: 'error',
          message: `Alpha Vantage Error: ${response.data['Error Message']}`,
        };
      }

      if (response.data['Note']) {
        return {
          data: null,
          status: 'error',
          message: 'API call frequency limit reached. Please wait and try again later.',
        };
      }

      if (response.data['Information']) {
        return {
          data: null,
          status: 'error',
          message: `Alpha Vantage: ${response.data['Information']}`,
        };
      }

      return {
        data: response.data,
        status: 'success',
      };
    } catch (error: any) {
      if (error.response?.status === 429) {
        return {
          data: null,
          status: 'error',
          message: 'Rate limit exceeded. Please wait before making more requests.',
        };
      }
      
      return {
        data: null,
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch data from Alpha Vantage',
      };
    }
  }

  async fetchFinnhubData(
    apiKey: string,
    endpoint: string,
    params: Record<string, string | number> = {}
  ): Promise<ApiResponse> {
    try {
      await this.checkRateLimit('finnhub');
      
      const response = await axios.get(`https://finnhub.io/api/v1/${endpoint}`, {
        params: { ...params, token: apiKey },
        timeout: 10000,
      });

      return {
        data: response.data,
        status: 'success',
      };
    } catch (error: unknown) {
      return {
        data: null,
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch data from Finnhub',
      };
    }
  }

  async fetchStockQuote(apiKey: string, symbol: string, provider: 'alphavantage' | 'finnhub'): Promise<FinancialData | null> {
    try {
      // If no API key, throw specific error
      if (!apiKey) {
        throw new Error('API key is required. Please add your API key in Settings.');
      }

      let response: ApiResponse;
      
      if (provider === 'alphavantage') {
        response = await this.fetchAlphaVantageData(apiKey, 'GLOBAL_QUOTE', symbol);
        
        if (response.status === 'error') {
          throw new Error(response.message || 'Failed to fetch data from Alpha Vantage');
        }
        
        if (response.status === 'success' && response.data && (response.data as Record<string, any>)['Global Quote']) {
          const quote = (response.data as Record<string, any>)['Global Quote'];
          return {
            symbol: quote['01. symbol'],
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
            timestamp: new Date(),
          };
        }
      } else if (provider === 'finnhub') {
        response = await this.fetchFinnhubData(apiKey, 'quote', { symbol });
        
        if (response.status === 'error') {
          throw new Error(response.message || 'Failed to fetch data from Finnhub');
        }
        
        if (response.status === 'success' && response.data && (response.data as Record<string, any>).c) {
          const data = response.data as Record<string, any>;
          return {
            symbol,
            price: data.c,
            change: data.d,
            changePercent: data.dp,
            timestamp: new Date(data.t * 1000),
          };
        }
      }
      
      throw new Error(`No valid data received for symbol ${symbol}. Please check the symbol or try again later.`);
    } catch (error: unknown) {
      console.error(`Error fetching stock quote for ${symbol}:`, error);
      throw error; // Re-throw to let widget handle the error
    }
  }

  private getMockStockData(symbol: string): FinancialData {
    // Generate realistic mock data for demo purposes
    const basePrice = Math.random() * 200 + 50; // Random price between $50-$250
    const changePercent = (Math.random() - 0.5) * 10; // Random change between -5% to +5%
    const change = basePrice * (changePercent / 100);
    
    return {
      symbol,
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000),
      timestamp: new Date(),
    };
  }

  async fetchMarketGainers(apiKey: string, provider: 'alphavantage' | 'finnhub'): Promise<FinancialData[]> {
    try {
      // If no API key, throw specific error
      if (!apiKey) {
        throw new Error('API key is required. Please add your API key in Settings.');
      }

      if (provider === 'alphavantage') {
        const response = await this.fetchAlphaVantageData(apiKey, 'TOP_GAINERS_LOSERS', '');
        
        if (response.status === 'error') {
          throw new Error(response.message || 'Failed to fetch market gainers from Alpha Vantage');
        }
        
        if (response.status === 'success' && response.data && (response.data as Record<string, any>).top_gainers) {
          return (response.data as Record<string, any>).top_gainers.slice(0, 10).map((stock: Record<string, string>) => ({
            symbol: stock.ticker,
            price: parseFloat(stock.price),
            change: parseFloat(stock.change_amount),
            changePercent: parseFloat(stock.change_percentage.replace('%', '')),
            volume: parseInt(stock.volume),
            timestamp: new Date(),
          }));
        }
      }
      
      throw new Error('No market gainer data available. Please try again later.');
    } catch (error: unknown) {
      console.error('Error fetching market gainers:', error);
      throw error; // Re-throw to let widget handle the error
    }
  }

  private getMockMarketGainers(): FinancialData[] {
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
    return symbols.map(symbol => ({
      symbol,
      price: parseFloat((Math.random() * 200 + 50).toFixed(2)),
      change: parseFloat((Math.random() * 10 + 2).toFixed(2)), // Always positive for gainers
      changePercent: parseFloat((Math.random() * 8 + 1).toFixed(2)), // 1-9% gain
      volume: Math.floor(Math.random() * 10000000),
      timestamp: new Date(),
    }));
  }

  async fetchChartData(
    apiKey: string,
    symbol: string,
    interval: 'daily' | 'weekly' | 'monthly',
    provider: 'alphavantage' | 'finnhub'
  ): Promise<ChartData[]> {
    try {
      // If no API key, throw specific error
      if (!apiKey) {
        throw new Error('API key is required. Please add your API key in Settings.');
      }

      if (provider === 'alphavantage') {
        const functionMap = {
          daily: 'TIME_SERIES_DAILY',
          weekly: 'TIME_SERIES_WEEKLY',
          monthly: 'TIME_SERIES_MONTHLY',
        };
        
        const response = await this.fetchAlphaVantageData(apiKey, functionMap[interval], symbol);
        
        if (response.status === 'error') {
          throw new Error(response.message || 'Failed to fetch chart data from Alpha Vantage');
        }
        
        if (response.status === 'success' && response.data) {
          const timeSeriesKey = Object.keys(response.data).find(key => 
            key.includes('Time Series')
          );
          
          if (timeSeriesKey) {
            const timeSeries = (response.data as Record<string, any>)[timeSeriesKey];
            return Object.entries(timeSeries)
              .slice(0, 100) // Limit to last 100 data points
              .map(([date, data]: [string, unknown]) => ({
                timestamp: new Date(date),
                open: parseFloat((data as Record<string, string>)['1. open']),
                high: parseFloat((data as Record<string, string>)['2. high']),
                low: parseFloat((data as Record<string, string>)['3. low']),
                close: parseFloat((data as Record<string, string>)['4. close']),
                volume: parseInt((data as Record<string, string>)['5. volume']),
              }))
              .reverse(); // Chronological order
          }
        }
      }
      
      throw new Error(`No chart data available for ${symbol}. Please check the symbol or try again later.`);
    } catch (error: unknown) {
      console.error('Error fetching chart data:', error);
      throw error; // Re-throw to let widget handle the error
    }
  }
}

export const financialApiService = new FinancialApiService();
