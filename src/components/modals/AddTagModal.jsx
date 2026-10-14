import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { X, Check } from 'lucide-react';

const PASTEL_COLORS = [
  '#FEE2E2', // Pastel Red
  '#E0E7FF', // Pastel Indigo
  '#FEF3C7', // Pastel Amber
  '#DCFCE7', // Pastel Green
  '#F3E8FF', // Pastel Purple
  '#FFE4E6', // Pastel Rose
  '#E0F2FE', // Pastel Sky
  '#F1F5F9', // Pastel Slate
];

export const AddTagModal = ({ isOpen, onClose }) => {
  const { addTag } = useTaskContext();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PASTEL_COLORS[0]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    await addTag(name, color);
    setLoading(false);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Add New Tag</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
              Tag Name
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Urgent, Design, Review..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-brand-yellow text-sm font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
              Pastel Chip Color
            </label>
            <div className="flex flex-wrap gap-2.5">
              {PASTEL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border border-stone-300 dark:border-stone-600 flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                  style={{ backgroundColor: c }}
                  aria-label={`Select tag color ${c}`}
                >
                  {color === c && <Check className="w-4 h-4 text-stone-800 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 text-sm font-semibold text-stone-900 bg-brand-yellow hover:bg-brand-yellowHover rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Tag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
