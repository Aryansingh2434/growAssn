# FinBoard - Customizable Finance Dashboard

A modern, customizable finance dashboard built with Next.js, Redux Toolkit, and financial APIs. Create real-time financial widgets with drag-and-drop functionality.

## Features

### 🎯 Core Features
- **Widget Management System**: Add, remove, and rearrange finance widgets
- **Real-time Data**: Live financial data from multiple APIs (Alpha Vantage, Finnhub)
- **Drag & Drop**: Intuitive widget rearrangement with @dnd-kit
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 📊 Widget Types
1. **Finance Cards**: Compact view for watchlists, market gainers, performance data
2. **Data Tables**: Paginated tables with search and filtering capabilities  
3. **Price Charts**: Interactive line charts showing price history over time

### 🔧 Customization
- **Widget Configuration**: Customize each widget's appearance and data source
- **API Integration**: Connect to multiple financial data providers
- **Data Persistence**: Configurations saved in browser storage
- **Export/Import**: Backup and restore dashboard configurations

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Charts**: Chart.js with react-chartjs-2
- **Drag & Drop**: @dnd-kit/core
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### API Keys Setup

To get live financial data, you'll need API keys from financial data providers:

#### Alpha Vantage (Recommended)
1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free account
3. Get your API key
4. Add it in Settings → API Keys

## Usage

### Adding Widgets

1. Click the **"Add Widget"** button in the header
2. Choose widget type (Card, Table, or Chart)
3. Enter a title and stock symbol(s)
4. Configure refresh interval
5. Save to add to dashboard

### Widget Types

#### Finance Cards
- Display individual stock data in card format
- Show price, change, and trend indicators

#### Data Tables  
- Show multiple stocks in table format
- Features: search, pagination, sorting

#### Price Charts
- Interactive line charts for price history
- Support for daily, weekly, monthly intervals

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

This project is licensed under the MIT License.
