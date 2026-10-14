import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import {
  X,
  Trash2,
  Calendar,
  Flag,
  Repeat,
  Plus,
  Check,
  CheckSquare,
  Tag as TagIcon,
  ListTodo,
  Pencil,
} from 'lucide-react';
import { AddTagModal } from '../modals/AddTagModal';
import { EditTagModal } from '../modals/EditTagModal';

export const TaskDetail = ({ task, onClose }) => {
  const {
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    lists,
    tags,
    toggleTaskTag,
  } = useTaskContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [listId, setListId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [recurrence, setRecurrence] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);

  // Sync state whenever selected task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setListId(task.list_id || (lists[0]?.id || ''));
      setDueDate(task.due_date || '');
      setPriority(task.priority || 'medium');
      setRecurrence(task.recurrence || '');
    }
  }, [task, lists]);

  if (!task) return null;

  const handleSaveChanges = () => {
    updateTask(task.id, {
      title: title.trim() || 'Untitled Task',
      description: description.trim(),
      list_id: listId || null,
      due_date: dueDate || null,
      priority,
      recurrence: recurrence || null,
    });
    onClose();
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  const handleAddSubtaskSubmit = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  // Subtasks calculation
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.is_completed).length || 0;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Associated tags
  const associatedTagIds = new Set(
    (task.task_tags || []).map((tt) => tt.tag?.id || tt.tag_id)
  );

  return (
    <aside className="w-full lg:w-96 xl:w-[420px] h-full bg-stone-50/80 dark:bg-stone-900/90 border-l border-stone-200/70 dark:border-stone-800 flex flex-col justify-between shrink-0 shadow-lg lg:shadow-none animate-slide-left z-20">
      {/* Top Header */}
      <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(100vh-140px)] space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 dark:border-stone-800">
          <h2 className="text-xl font-bold font-display text-stone-900 dark:text-stone-100">
            Task:
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
            title="Close details (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editable Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full bg-transparent text-lg font-semibold text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-0 border-b border-transparent focus:border-stone-400 dark:focus:border-stone-600 transition-all py-1"
          />
        </div>

        {/* Description Textarea */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details, notes, or links..."
            className="w-full p-3 rounded-xl border border-stone-200/80 dark:border-stone-700 bg-white dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-brand-yellow resize-none transition-all"
          />
        </div>

        {/* Meta Grid: List, Due Date, Priority, Recurrence */}
        <div className="space-y-3.5 bg-white dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-700/60 shadow-2xs">
          {/* List dropdown */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stone-400" />
              List
            </span>
            <select
              value={listId}
              onChange={(e) => setListId(e.target.value)}
              className="pl-3 pr-8 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-brand-yellow cursor-pointer"
            >
              {lists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due date picker */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              Due date
            </span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-brand-yellow"
            />
          </div>

          {/* Priority */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 flex items-center gap-2">
              <Flag className="w-3.5 h-3.5 text-stone-400" />
              Priority
            </span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="pl-3 pr-8 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-brand-yellow cursor-pointer"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Recurrence */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 flex items-center gap-2">
              <Repeat className="w-3.5 h-3.5 text-stone-400" />
              Recurrence
            </span>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
              className="pl-3 pr-8 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-brand-yellow cursor-pointer"
            >
              <option value="">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Tags Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Tags
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
              >
                <Plus className="w-3 h-3" />
                <span>Add Tag</span>
              </button>

              {/* Tag Selection Dropdown */}
              {isTagDropdownOpen && (
                <div className="absolute right-0 top-6 w-48 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 p-2 z-30 animate-scale-up">
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {tags.map((tag) => {
                      const isAttached = associatedTagIds.has(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            toggleTaskTag(task.id, tag.id);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-medium"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span>{tag.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {isAttached && <Check className="w-3.5 h-3.5 text-stone-900 dark:text-white" />}
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsTagDropdownOpen(false);
                                setEditingTag(tag);
                              }}
                              className="p-1 hover:bg-stone-200 dark:hover:bg-stone-600 rounded transition-colors text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                              title="Edit tag"
                            >
                              <Pencil className="w-3 h-3" />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-stone-100 dark:border-stone-700 mt-2 pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTagDropdownOpen(false);
                        setIsAddTagOpen(true);
                      }}
                      className="w-full text-left px-2 py-1 text-xs text-brand-yellow font-semibold hover:underline"
                    >
                      + Create new tag
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Render Active Tag Chips */}
          <div className="flex flex-wrap gap-2">
            {task.task_tags && task.task_tags.length > 0 ? (
              task.task_tags.map((tt) => {
                const tag = tt.tag;
                if (!tag) return null;
                return (
                  <span
                    key={tag.id}
                    className="group/tag inline-flex items-center gap-1 pl-3 pr-1.5 py-1 rounded-full text-xs font-semibold text-stone-800 border border-stone-200/50 shadow-2xs"
                    style={{ backgroundColor: tag.color || '#FEE2E2' }}
                  >
                    <span>{tag.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTag(tag);
                      }}
                      className="opacity-0 group-hover/tag:opacity-100 p-0.5 hover:bg-black/10 rounded-full transition-opacity"
                      title="Edit tag"
                    >
                      <Pencil className="w-2.5 h-2.5 text-stone-700" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleTaskTag(task.id, tag.id)}
                      className="p-0.5 hover:opacity-70 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })
            ) : (
              <p className="text-xs text-stone-400 italic">No tags attached</p>
            )}
          </div>
        </div>

        {/* Subtasks Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Subtasks:
            </label>
            {totalSubtasks > 0 && (
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                {completedSubtasks}/{totalSubtasks} ({progressPercent}%)
              </span>
            )}
          </div>

          {/* Progress bar */}
          {totalSubtasks > 0 && (
            <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-brand-yellow transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* Subtask list */}
          <div className="space-y-2 mb-3">
            {task.subtasks &&
              task.subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200/70 dark:border-stone-700/70 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleSubtask(task.id, sub.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                        sub.is_completed
                          ? 'bg-stone-900 dark:bg-brand-yellow border-stone-900 dark:border-brand-yellow text-white dark:text-stone-900'
                          : 'border-stone-300 dark:border-stone-600'
                      }`}
                    >
                      {sub.is_completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span
                      className={`text-xs sm:text-sm truncate font-medium ${
                        sub.is_completed
                          ? 'line-through text-stone-400 dark:text-stone-500'
                          : 'text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      {sub.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteSubtask(task.id, sub.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-500 transition-all rounded"
                    title="Delete subtask"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
          </div>

          {/* Add New Subtask Input */}
          <form onSubmit={handleAddSubtaskSubmit} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="+ Add New Subtask"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-transparent text-xs sm:text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-600 dark:focus:border-stone-400 transition-colors"
            />
          </form>
        </div>
      </div>

      {/* Footer: Delete Task (outlined) and Save changes (yellow, #FFD43B) */}
      <div className="p-4 sm:p-5 border-t border-stone-200/70 dark:border-stone-800/80 bg-white/70 dark:bg-stone-900/80 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleDelete}
          className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-xs sm:text-sm font-semibold transition-all"
        >
          Delete Task
        </button>

        <button
          type="button"
          onClick={handleSaveChanges}
          className="px-6 py-2.5 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-stone-900 text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.99]"
        >
          Save changes
        </button>
      </div>

      <AddTagModal isOpen={isAddTagOpen} onClose={() => setIsAddTagOpen(false)} />
      <EditTagModal isOpen={Boolean(editingTag)} tag={editingTag} onClose={() => setEditingTag(null)} />
    </aside>
  );
};
