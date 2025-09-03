'use client';

import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { Dashboard } from '../components/Dashboard';
import { AddWidgetModal } from '../components/AddWidgetModal';
import { SettingsModal } from '../components/SettingsModal';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

function AppContent() {
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const widgets = useSelector((state: RootState) => state.dashboard.widgets);

  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard
        onAddWidget={() => setShowAddWidget(true)}
        onOpenSettings={() => setShowSettings(true)}
      />
      
      {showAddWidget && (
        <AddWidgetModal
          onClose={() => setShowAddWidget(false)}
          existingWidgets={widgets}
        />
      )}
      
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
