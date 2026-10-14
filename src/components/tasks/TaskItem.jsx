import React from 'react';
import { useTaskContext } from '../../context/TaskContext';
import {
  Calendar,
  ChevronRight,
  Check,
  CheckSquare2,
  Square,
  Flag,
  ListTodo,
  GripVertical,
  Repeat,
} from 'lucide-react';

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return null;
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';

  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isOverdue = (dateStr, isCompleted) => {
  if (!dateStr || isCompleted) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr < today;
};

export const TaskItem = ({
  task,
  isSelected,
  onSelect,
  onDragStart,
  onDragOver,
  onDrop,
  draggable = true,
}) => {
  const { toggleTaskCompletion } = useTaskContext();

  const formattedDate = formatDisplayDate(task.due_date);
  const overdue = isOverdue(task.due_date, task.is_completed);

  // Subtask progress
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.is_completed).length || 0;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Priority color
  const priorityColor =
    task.priority === 'high'
      ? 'text-red-500 fill-red-500/20'
      : task.priority === 'medium'
      ? 'text-amber-500 fill-amber-500/20'
      : 'text-blue-400 fill-blue-400/20';

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => onSelect(task.id)}
      className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-180 cursor-pointer ${
        isSelected
          ? 'bg-stone-100/90 dark:bg-stone-800/90 border-stone-300 dark:border-stone-700 shadow-sm'
          : 'bg-white dark:bg-stone-900/60 border-stone-200/70 dark:border-stone-800/70 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 flex-1">
        {/* Drag handle */}
        {draggable && (
          <div
            className="hidden group-hover:flex items-center text-stone-300 dark:text-stone-600 cursor-grab active:cursor-grabbing shrink-0 mt-0.5"
            onClick={(e) => e.stopPropagation()}
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}

        {/* Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleTaskCompletion(task.id);
          }}
          className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all mt-0.5 ${
            task.is_completed
              ? 'bg-stone-900 dark:bg-brand-yellow border-stone-900 dark:border-brand-yellow text-white dark:text-stone-900'
              : 'border-stone-300 dark:border-stone-600 hover:border-stone-500 bg-white dark:bg-stone-800'
          }`}
          aria-label={task.is_completed ? 'Mark task incomplete' : 'Mark task complete'}
        >
          {task.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Content & Meta Row */}
        <div className="flex flex-col min-w-0 flex-1 pr-2">
          {/* Title Row */}
          <div className="flex items-center gap-2">
            <span
              className={`text-sm sm:text-base font-medium truncate transition-all ${
                task.is_completed
                  ? 'line-through text-stone-400 dark:text-stone-500'
                  : 'text-stone-800 dark:text-stone-100'
              }`}
            >
              {task.title}
            </span>

            {/* Recurrence Badge */}
            {task.recurrence && (
              <span
                className="shrink-0 p-0.5 rounded text-stone-400 hover:text-stone-600 dark:text-stone-500"
                title={`Repeats ${task.recurrence}`}
              >
                <Repeat className="w-3 h-3" />
              </span>
            )}

            {/* Priority flag if high or low */}
            {task.priority && task.priority !== 'medium' && (
              <Flag className={`w-3.5 h-3.5 shrink-0 ${priorityColor}`} />
            )}
          </div>

          {/* Small Meta Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-xs text-stone-500 dark:text-stone-400">
            {/* Due Date */}
            {formattedDate && (
              <div
                className={`flex items-center gap-1 font-medium ${
                  overdue ? 'text-red-500 dark:text-red-400 font-semibold' : ''
                }`}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>{formattedDate}</span>
              </div>
            )}

            {/* N Subtasks Badge */}
            {totalSubtasks > 0 && (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                <ListTodo className="w-3 h-3 text-stone-400" />
                <span>
                  {completedSubtasks}/{totalSubtasks} Subtasks
                </span>
                {/* Mini progress bar */}
                <div className="w-10 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-yellow rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* List Chip */}
            {task.list && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] font-medium text-stone-600 dark:text-stone-300">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: task.list.color || '#74B9FF' }}
                />
                <span className="truncate max-w-[100px]">{task.list.name}</span>
              </div>
            )}

            {/* Tag Pills */}
            {task.task_tags && task.task_tags.length > 0 && (
              <div className="hidden sm:flex items-center gap-1">
                {task.task_tags.slice(0, 2).map((tt) => {
                  const tag = tt.tag;
                  if (!tag) return null;
                  return (
                    <span
                      key={tag.id || tag.name}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium text-stone-800 shadow-2xs"
                      style={{ backgroundColor: tag.color || '#FEE2E2' }}
                    >
                      {tag.name}
                    </span>
                  );
                })}
                {task.task_tags.length > 2 && (
                  <span className="text-[10px] text-stone-400">+{task.task_tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right chevron */}
      <div className="flex items-center pl-2 text-stone-300 dark:text-stone-600 group-hover:text-stone-500 dark:group-hover:text-stone-400 group-hover:translate-x-0.5 transition-all">
        <ChevronRight className="w-5 h-5" />
      </div>
    </div>
  );
};
