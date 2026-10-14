import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTaskContext } from '../../context/TaskContext';
import { X, Moon, Sun, HardDrive, Keyboard, RotateCcw, Download } from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const { tasks, lists, tags, resetToDefaultData, addToast } = useTaskContext();

  if (!isOpen) return null;

  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify({ tasks, lists, tags, exportedAt: new Date().toISOString() }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `productivity-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      addToast('Data exported successfully', 'success');
    } catch {
      addToast('Failed to export data', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-5">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Settings</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Appearance Section */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
              Appearance
            </span>
            <div className="flex items-center justify-between p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/70 dark:border-stone-700">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Switch between sleek dark and crisp light themes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-stone-300 dark:bg-brand-yellow transition-colors"
                role="switch"
                aria-checked={theme === 'dark'}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-stone-900 shadow transition-transform ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Storage Mode */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
              Data Storage
            </span>
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/70 dark:border-stone-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                    Local Storage (Offline)
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    All tasks and lists are stored securely in your browser
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                Local
              </span>
            </div>
          </div>

          {/* Local Data Management */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
              Manage Data
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExportData}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                <span>Export JSON</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset all tasks, lists, and tags to default samples?')) {
                    resetToDefaultData();
                  }
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
              Keyboard Shortcuts
            </span>
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/70 dark:border-stone-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 dark:text-stone-300">Quick create task</span>
                <kbd className="px-2 py-0.5 rounded bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 font-mono font-bold text-stone-700 dark:text-stone-200 shadow-xs">
                  N
                </kbd>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 dark:text-stone-300">Focus search bar</span>
                <kbd className="px-2 py-0.5 rounded bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 font-mono font-bold text-stone-700 dark:text-stone-200 shadow-xs">
                  /
                </kbd>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 dark:text-stone-300">Close task details</span>
                <kbd className="px-2 py-0.5 rounded bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 font-mono font-bold text-stone-700 dark:text-stone-200 shadow-xs">
                  Esc
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
