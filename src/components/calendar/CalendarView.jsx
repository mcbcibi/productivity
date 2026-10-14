import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Flag,
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView = () => {
  const { tasks, setSelectedTaskId, addTask } = useTaskContext();

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of current month
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Total days in month
  const totalDays = new Date(year, month + 1, 0).getDate();
  // Total days in previous month
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Build calendar matrix
  const days = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      dayNumber: prevMonthTotalDays - i,
      isCurrentMonth: false,
      dateString: new Date(year, month - 1, prevMonthTotalDays - i).toISOString().split('T')[0],
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(year, month, i);
    days.push({
      dayNumber: i,
      isCurrentMonth: true,
      dateString: d.toISOString().split('T')[0],
    });
  }

  // Next month leading days to complete 35 or 42 grid cells
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      dayNumber: i,
      isCurrentMonth: false,
      dateString: new Date(year, month + 1, i).toISOString().split('T')[0],
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const handleAddOnDate = (dateString) => {
    const title = prompt('Enter new task for ' + dateString + ':');
    if (title && title.trim()) {
      addTask({
        title: title.trim(),
        due_date: dateString,
        priority: 'medium',
      });
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-5 sm:p-8 flex flex-col">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-stone-900 dark:text-stone-100 tracking-tight">
            Calendar
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Overview of scheduled tasks by due date
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-stone-800 dark:text-stone-200 px-3 min-w-[140px] text-center">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-bold text-stone-400 dark:text-stone-500 uppercase py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
        {days.map((item, index) => {
          const isToday = item.dateString === todayStr;
          const dayTasks = tasks.filter((t) => t.due_date === item.dateString);

          return (
            <div
              key={index}
              onClick={() => handleAddOnDate(item.dateString)}
              className={`min-h-[95px] p-2 rounded-2xl border flex flex-col justify-between transition-all group relative cursor-pointer ${
                item.isCurrentMonth
                  ? isToday
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-brand-yellow/80 shadow-xs'
                    : 'bg-white dark:bg-stone-900/60 border-stone-200/70 dark:border-stone-800/70 hover:border-stone-300 dark:hover:border-stone-700'
                  : 'bg-stone-50/50 dark:bg-stone-900/20 border-stone-100 dark:border-stone-800/40 opacity-50'
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday
                      ? 'bg-brand-yellow text-stone-900 font-extrabold shadow-2xs'
                      : 'text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {item.dayNumber}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddOnDate(item.dateString);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
                  title="Add task for this date"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Tasks in this day */}
              <div className="space-y-1 mt-1 overflow-y-auto max-h-[70px]">
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTaskId(t.id);
                    }}
                    className={`text-[11px] font-medium px-2 py-1 rounded-lg truncate transition-all flex items-center gap-1.5 shadow-2xs ${
                      t.is_completed
                        ? 'line-through bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500'
                        : 'bg-stone-100/90 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:scale-[1.02]'
                    }`}
                    title={t.title}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: t.list?.color || '#FFD43B' }}
                    />
                    <span className="truncate">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
