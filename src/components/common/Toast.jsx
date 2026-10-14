import React from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useTaskContext();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-200 animate-slide-up ${
              isError
                ? 'bg-red-50/95 dark:bg-red-950/90 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
                : isSuccess
                ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-stone-900/90 dark:bg-stone-100/90 text-white dark:text-stone-900 border-stone-800'
            }`}
          >
            <div className="flex items-center gap-2.5 text-sm font-medium">
              {isError && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
              {!isError && !isSuccess && <Info className="w-4 h-4 text-brand-yellow shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:opacity-75 transition-opacity rounded-md ml-2"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
