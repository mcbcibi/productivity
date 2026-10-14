import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { X, Check, Trash2 } from 'lucide-react';

const PRESET_COLORS = [
  '#FF7675', // Coral Red
  '#74B9FF', // Sky Blue
  '#55EFC4', // Mint Green
  '#FDCB6E', // Mustard Yellow
  '#A29BFE', // Lavender
  '#FD79A8', // Pink
  '#00B894', // Emerald
  '#E17055', // Terra Cotta
  '#0984E3', // Deep Blue
  '#6C5CE7', // Royal Purple
];

export const EditListModal = ({ isOpen, onClose, list }) => {
  const { updateList, deleteList, lists } = useTaskContext();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (list) {
      setName(list.name || '');
      setColor(list.color || PRESET_COLORS[0]);
    }
  }, [list]);

  if (!isOpen || !list) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    await updateList(list.id, { name: name.trim(), color });
    setLoading(false);
    onClose();
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete the "${list.name}" list?`)) {
      await deleteList(list.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Edit List</h3>
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
              List Name
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Work, Personal, Shopping..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-brand-yellow text-sm font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
              Color Accent
            </label>
            <div className="flex flex-wrap gap-2.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                >
                  {color === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
            {lists.length > 1 ? (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                title="Delete list"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
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
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
