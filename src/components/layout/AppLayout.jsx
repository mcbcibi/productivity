import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from '../sidebar/Sidebar';
import { TaskList } from '../tasks/TaskList';
import { TaskDetail } from '../tasks/TaskDetail';
import { CalendarView } from '../calendar/CalendarView';
import { StickyWallView } from '../sticky/StickyWallView';
import { SettingsModal } from '../modals/SettingsModal';
import { ToastContainer } from '../common/Toast';

export const AppLayout = () => {
  const {
    selectedTaskId,
    setSelectedTaskId,
    activeTask,
    selectedView,
    activeListId,
  } = useTaskContext();

  const { user } = useAuth();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore when user is actively typing in an input or textarea
      const targetTag = e.target.tagName;
      const isInput = targetTag === 'INPUT' || targetTag === 'TEXTAREA' || e.target.isContentEditable;

      // Esc closes detail pane or settings
      if (e.key === 'Escape') {
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          return;
        }
        if (selectedTaskId) {
          setSelectedTaskId(null);
          return;
        }
      }

      if (isInput) return;

      // 'N' focuses quick add task input
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        const input = document.getElementById('quick-add-task-input');
        if (input) {
          input.focus();
        }
      }

      // '/' focuses search bar
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          if (isSidebarCollapsed) setIsSidebarCollapsed(false);
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTaskId, setSelectedTaskId, isSettingsOpen, isSidebarCollapsed]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-white dark:bg-stone-900 flex relative transition-colors duration-300">
      {/* Left Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Center Main Pane */}
      <main className="flex-1 h-full flex flex-col overflow-hidden relative bg-white dark:bg-stone-900">
        {!activeListId && selectedView === 'calendar' ? (
          <CalendarView />
        ) : !activeListId && selectedView === 'sticky' ? (
          <StickyWallView />
        ) : (
          <TaskList />
        )}
      </main>

      {/* Right Detail Pane */}
      {activeTask && (
        <TaskDetail
          task={activeTask}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {/* Global Modals & Toasts */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Toast Notification Stack */}
      <ToastContainer />
    </div>
  );
};
