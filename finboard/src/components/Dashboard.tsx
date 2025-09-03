import React from 'react';
import { Plus, Settings } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { RootState } from '../store';
import { reorderWidgets } from '../store/dashboardSlice';
import { Widget } from '../types';
import { Button } from './ui/Button';
import { ThemeToggle } from './ui/ThemeToggle';
import { TableWidget } from './widgets/TableWidget';
import { CardWidget } from './widgets/CardWidget';
import { ChartWidget } from './widgets/ChartWidget';

interface SortableWidgetProps {
  widget: Widget;
  children: React.ReactNode;
}

const SortableWidget: React.FC<SortableWidgetProps> = ({ widget, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative"
    >
      {/* Drag Handle - only this area responds to drag */}
      <div
        {...listeners}
        className="absolute top-2 left-2 w-6 h-6 cursor-move opacity-0 hover:opacity-100 transition-opacity z-10 bg-[var(--primary-button)]/20 rounded flex items-center justify-center"
        title="Drag to reorder"
      >
        <div className="w-3 h-3 bg-[var(--primary-button)] rounded-sm opacity-60"></div>
      </div>
      {children}
    </div>
  );
};

interface DashboardProps {
  onAddWidget: () => void;
  onOpenSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onAddWidget, onOpenSettings }) => {
  const dispatch = useDispatch();
  const { widgets, isLoading } = useSelector((state: RootState) => state.dashboard);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex((widget) => widget.id === active.id);
      const newIndex = widgets.findIndex((widget) => widget.id === over?.id);
      
      const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex);
      dispatch(reorderWidgets(reorderedWidgets));
    }
  };

  const renderWidget = (widget: Widget) => {
    const widgetContent = (() => {
      switch (widget.type) {
        case 'table':
          return <TableWidget widget={widget} />;
        case 'card':
          return <CardWidget widget={widget} />;
        case 'chart':
          return <ChartWidget widget={widget} />;
        default:
          return <div>Unknown widget type</div>;
      }
    })();

    return (
      <SortableWidget key={widget.id} widget={widget}>
        {widgetContent}
      </SortableWidget>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)] transition-all duration-300">
      {/* Header */}
      <header className="bg-[var(--header-background)] border-b border-[var(--border-color)] px-6 py-6 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary-button)] to-[var(--accent-color)] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)] bg-gradient-to-r from-[var(--primary-button)] to-[var(--accent-color)] bg-clip-text text-transparent">
                FinBoard
              </h1>
              <p className="text-sm text-[var(--secondary-text)]">Customizable Finance Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <Button
              variant="outline"
              onClick={onOpenSettings}
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Button>
            
            <Button
              onClick={onAddWidget}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Widget</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-7xl mx-auto">
        {widgets.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-lg mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--primary-button)] to-[var(--accent-color)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Plus className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3">
                Welcome to FinBoard
              </h3>
              <p className="text-[var(--secondary-text)] mb-8 text-lg leading-relaxed">
                Create your personalized finance dashboard by adding widgets to track stocks, market data, and financial metrics in real-time.
              </p>
              <Button onClick={onAddWidget} className="flex items-center space-x-2 text-lg px-8 py-4">
                <Plus className="w-5 h-5" />
                <span>Add Your First Widget</span>
              </Button>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {widgets.map(renderWidget)}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center px-6 py-3 rounded-xl bg-[var(--primary-button)]/10 text-[var(--primary-button)] border border-[var(--primary-button)]/20 shadow-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--primary-button)] border-t-transparent mr-3"></div>
              <span className="font-medium">Loading dashboard...</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
