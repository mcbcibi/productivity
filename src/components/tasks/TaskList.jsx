import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { TaskItem } from './TaskItem';
import {
  Plus,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Calendar,
  Flag,
  Sparkles,
  ChevronDown,
  X,
  Layers,
} from 'lucide-react';

export const TaskList = () => {
  const {
    filteredTasks,
    activeTask,
    selectedTaskId,
    setSelectedTaskId,
    selectedView,
    activeListId,
    activeTagId,
    setActiveTagId,
    lists,
    tags,
    addTask,
    reorderTasks,
    sortOption,
    setSortOption,
    filterPriority,
    setFilterPriority,
    filterStatus,
    setFilterStatus,
    loading,
  } = useTaskContext();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [quickDueDate, setQuickDueDate] = useState('');
  const [quickPriority, setQuickPriority] = useState('medium');
  const [showCompleted, setShowCompleted] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Determine Title & Count
  const currentList = lists.find((l) => l.id === activeListId);
  const currentTag = tags.find((tg) => tg.id === activeTagId);

  let viewTitle = 'Today';
  if (currentList) {
    viewTitle = currentList.name;
  } else if (selectedView === 'upcoming') {
    viewTitle = 'Upcoming';
  } else if (selectedView === 'calendar') {
    viewTitle = 'Calendar';
  } else if (selectedView === 'sticky') {
    viewTitle = 'Sticky Wall';
  } else if (selectedView === 'completed') {
    viewTitle = 'Completed Tasks';
  }

  // Active vs Completed Tasks separation
  const activeTasks = filteredTasks.filter((t) => !t.is_completed);
  const completedTasks = filteredTasks.filter((t) => t.is_completed);

  const activeCount = activeTasks.length;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await addTask({
      title: newTaskTitle.trim(),
      due_date: quickDueDate || (selectedView === 'today' ? new Date().toISOString().split('T')[0] : null),
      priority: quickPriority,
      list_id: activeListId || (lists[0]?.id || null),
    });

    setNewTaskTitle('');
    setQuickDueDate('');
  };

  // Drag and Drop handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    reorderTasks(draggedTaskId, targetIndex);
    setDraggedTaskId(null);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-5 sm:p-8 flex flex-col justify-between">
      <div className="space-y-6 max-w-4xl mx-auto w-full">
        {/* Title & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Large bold view title with count badge */}
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-stone-900 dark:text-stone-100 tracking-tight">
              {viewTitle}
            </h1>
            <span className="px-3 py-1 rounded-xl text-base font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60 shadow-2xs">
              {activeCount}
            </span>
          </div>

          {/* Sort & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {/* Sort Dropdown */}
            <div className="relative inline-flex items-center">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 shadow-2xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                <span>Sort:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-transparent text-stone-900 dark:text-stone-100 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="manual">Manual (Drag)</option>
                  <option value="due_date">Due date</option>
                  <option value="priority">Priority</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="created_at">Date created</option>
                </select>
              </div>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 shadow-2xs">
              <Flag className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-transparent text-stone-900 dark:text-stone-100 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-stone-900 dark:text-stone-100 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Tag Active Indicator */}
            {activeTagId && currentTag && (
              <button
                onClick={() => setActiveTagId(null)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200"
              >
                <span>Tag: {currentTag.name}</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* "+ Add New Task" Quick Input Row */}
        <form
          onSubmit={handleQuickAdd}
          className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 hover:border-stone-300 dark:hover:border-stone-700 transition-all focus-within:border-stone-400 dark:focus-within:border-stone-600 focus-within:bg-white dark:focus-within:bg-stone-900 shadow-2xs"
        >
          <div className="w-5 h-5 rounded-md border border-stone-300 dark:border-stone-600 flex items-center justify-center text-stone-400 shrink-0">
            <Plus className="w-3.5 h-3.5" />
          </div>

          <input
            id="quick-add-task-input"
            type="text"
            placeholder="+ Add New Task (Press Enter)"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
          />

          {/* Quick Due Date picker */}
          <input
            type="date"
            value={quickDueDate}
            onChange={(e) => setQuickDueDate(e.target.value)}
            className="hidden sm:block text-xs rounded-lg px-2 py-1 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 focus:outline-none"
            title="Set due date"
          />

          {/* Quick Priority picker */}
          <select
            value={quickPriority}
            onChange={(e) => setQuickPriority(e.target.value)}
            className="hidden sm:block text-xs rounded-lg px-2 py-1 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 focus:outline-none"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="px-3.5 py-1.5 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-stone-900 text-xs font-bold transition-all disabled:opacity-40 shrink-0 shadow-2xs"
          >
            Add
          </button>
        </form>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse border border-stone-200/50 dark:border-stone-700/50"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && activeTasks.length === 0 && completedTasks.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-sage-50 dark:bg-stone-800 flex items-center justify-center text-sage-600 dark:text-brand-yellow mb-3 shadow-inner">
              <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
              All clear for now!
            </h3>
            <p className="text-sm text-stone-400 max-w-sm mt-1">
              No tasks found in this view. Press <kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-xs font-mono font-bold">N</kbd> or type in the input above to create one.
            </p>
          </div>
        )}

        {/* Active Tasks List */}
        {!loading && activeTasks.length > 0 && (
          <div className="space-y-2.5">
            {activeTasks.map((task, idx) => (
              <TaskItem
                key={task.id}
                task={task}
                isSelected={selectedTaskId === task.id}
                onSelect={(id) => setSelectedTaskId(id)}
                draggable={sortOption === 'manual'}
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx)}
              />
            ))}
          </div>
        )}

        {/* Completed Tasks Section */}
        {!loading && completedTasks.length > 0 && (
          <div className="pt-6 border-t border-stone-200/60 dark:border-stone-800/80">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors mb-3"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  showCompleted ? '' : '-rotate-90'
                }`}
              />
              <span>Completed ({completedTasks.length})</span>
            </button>

            {showCompleted && (
              <div className="space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    onSelect={(id) => setSelectedTaskId(id)}
                    draggable={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer subtle hint */}
      <div className="pt-8 text-center text-xs text-stone-400 dark:text-stone-500 font-medium hidden sm:block max-w-4xl mx-auto w-full">
        Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-semibold">N</kbd> to add task, <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-semibold">/</kbd> to search, <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-semibold">Esc</kbd> to close details.
      </div>
    </div>
  );
};
