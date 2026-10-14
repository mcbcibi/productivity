import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { X, Moon, Sun, CheckCircle, Database, Keyboard, User, LogOut } from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isConfigured, signOut } = useAuth();

  if (!isOpen) return null;

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

          {/* Backend & Sync Status */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
              Backend Status
            </span>
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/70 dark:border-stone-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                    {isConfigured ? 'Supabase Connected' : 'Local / Demo Mode'}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {isConfigured
                      ? 'Realtime sync and Postgres RLS enabled'
                      : 'Add VITE_SUPABASE_URL in .env to connect to your database'}
                  </p>
                </div>
              </div>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  isConfigured
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                }`}
              >
                {isConfigured ? 'Live' : 'Mock'}
              </span>
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

          {/* Account Profile info */}
          {user && (
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
                Account
              </span>
              <div className="flex items-center justify-between p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/70 dark:border-stone-700">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-yellow/30 text-stone-900 dark:text-brand-yellow flex items-center justify-center font-bold text-sm">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate max-w-[190px]">
                      {user.email || 'Demo User'}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {user.isDemo ? 'Demo Session' : 'Supabase Authenticated'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    onClose();
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
