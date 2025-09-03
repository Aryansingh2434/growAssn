export interface Widget {
  id: string;
  type: 'table' | 'card' | 'chart';
  title: string;
  description?: string;
  apiEndpoint: string;
  apiKey?: string;
  dataMapping: Record<string, string>;
  refreshInterval: number; // in seconds
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: WidgetConfig;
  lastUpdated?: Date;
}

export interface WidgetConfig {
  // Table widget config
  showSearch?: boolean;
  showPagination?: boolean;
  itemsPerPage?: number;
  columns?: TableColumn[];
  
  // Card widget config
  cardType?: 'watchlist' | 'gainers' | 'performance' | 'financial';
  showTrend?: boolean;
  
  // Chart widget config
  chartType?: 'line' | 'candlestick';
  timeInterval?: 'daily' | 'weekly' | 'monthly';
  showVolume?: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  format?: 'currency' | 'percentage' | 'number' | 'text';
  sortable?: boolean;
}

export interface ApiResponse {
  data: any;
  status: 'success' | 'error';
  message?: string;
  rateLimitRemaining?: number;
  rateLimitReset?: Date;
}

export interface DashboardState {
  widgets: Widget[];
  selectedWidget: string | null;
  isLoading: boolean;
  error: string | null;
  apiKeys: Record<string, string>;
}

export interface FinancialData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  timestamp: Date;
}

export interface ChartData {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}
