import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Widget, ChartData } from '../../types';
import { WidgetWrapper } from './WidgetWrapper';
import { financialApiService } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartWidgetProps {
  widget: Widget;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ widget }) => {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartType = widget.config.chartType || 'line';
  const timeInterval = widget.config.timeInterval || 'daily';

  const fetchData = async () => {
    if (!widget.apiKey || !widget.apiEndpoint) {
      setError('API key and symbol are required. Please configure the widget in Settings.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await financialApiService.fetchChartData(
        widget.apiKey,
        widget.apiEndpoint,
        timeInterval,
        'alphavantage'
      );
      
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch chart data');
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
  }, [widget.apiKey, widget.apiEndpoint, timeInterval, widget.refreshInterval]);

  const chartData = {
    labels: data.map(item => item.timestamp.toLocaleDateString()),
    datasets: [
      {
        label: `${widget.apiEndpoint} Price`,
        data: data.map(item => item.close),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: chartType === 'line',
        tension: 0.1,
        pointRadius: 1,
        pointHoverRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            return context[0].label;
          },
          label: (context: any) => {
            if (context.datasetIndex === 0) {
              return `Price: $${context.parsed.y.toFixed(2)}`;
            } else {
              return `Volume: ${context.parsed.y.toLocaleString()}`;
            }
          },
          afterLabel: (context: any) => {
            if (context.datasetIndex === 0 && data[context.dataIndex]) {
              const point = data[context.dataIndex];
              return [
                `Open: $${point.open.toFixed(2)}`,
                `High: $${point.high.toFixed(2)}`,
                `Low: $${point.low.toFixed(2)}`,
                `Close: $${point.close.toFixed(2)}`,
              ];
            }
            return [];
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 8,
          font: {
            size: 11,
          },
        },
      },
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            callback: function(value: any) {
              return '$' + value.toFixed(2);
            },
            font: {
              size: 11,
            },
          },
        },
      },
    };  return (
    <WidgetWrapper
      widget={widget}
      isLoading={isLoading}
      error={error}
      onRefresh={fetchData}
    >
      <div style={{ height: '300px' }}>
        {data.length > 0 ? (
          <Line
            data={chartData}
            options={chartOptions}
          />
        ) : !isLoading && (
          <div className="flex items-center justify-center h-full text-gray-500">
            No chart data available
          </div>
        )}
      </div>
      
      {data.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <span className="font-medium">Period:</span> {timeInterval}
            </div>
            <div>
              <span className="font-medium">Data Points:</span> {data.length}
            </div>
          </div>
        </div>
      )}
    </WidgetWrapper>
  );
};
