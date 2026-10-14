import React, { useState, useRef } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { Plus, Trash2, GripHorizontal, Palette, Sparkles } from 'lucide-react';

const STICKY_PALETTE = [
  '#FEF08A', // Yellow
  '#FED7AA', // Peach / Orange
  '#BAE6FD', // Sky Blue
  '#BBF7D0', // Mint Green
  '#FBCFE8', // Soft Pink
  '#DDD6FE', // Lavender
];

export const StickyWallView = () => {
  const { tasks, addTask, updateStickyNote, deleteTask, updateTask } = useTaskContext();

  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleAddNewSticky = () => {
    const randomColor = STICKY_PALETTE[Math.floor(Math.random() * STICKY_PALETTE.length)];
    const randomX = 30 + ((tasks.length * 40) % 400);
    const randomY = 30 + ((tasks.length * 30) % 250);

    addTask({
      title: 'Quick Note',
      description: 'Write down an idea, reminder or inspiration...',
      sticky_color: randomColor,
      sticky_x: randomX,
      sticky_y: randomY,
    });
  };

  // Dragging logic
  const handleMouseDown = (e, task) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.closest('button')) {
      return;
    }
    setDraggingId(task.id);
    const cardRect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - cardRect.left,
      y: e.clientY - cardRect.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingId || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    let newX = e.clientX - containerRect.left - dragOffset.x;
    let newY = e.clientY - containerRect.top - dragOffset.y;

    // Boundaries
    newX = Math.max(10, Math.min(newX, containerRect.width - 260));
    newY = Math.max(10, Math.min(newY, containerRect.height - 240));

    updateStickyNote(draggingId, {
      sticky_x: Math.round(newX),
      sticky_y: Math.round(newY),
    });
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="flex-1 h-full relative overflow-hidden p-6 sm:p-8 select-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:20px_20px]"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between relative z-10 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-stone-900 dark:text-stone-100 tracking-tight">
            Sticky Wall
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Freeform canvas with draggable post-it notes
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddNewSticky}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-yellow hover:bg-brand-yellowHover text-stone-900 text-sm font-bold shadow-md transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Sticky Note</span>
        </button>
      </div>

      {/* Canvas Sticky Notes */}
      {tasks.map((task) => {
        const x = task.sticky_x ?? 50;
        const y = task.sticky_y ?? 50;
        const bg = task.sticky_color || '#FEF08A';

        return (
          <div
            key={task.id}
            onMouseDown={(e) => handleMouseDown(e, task)}
            style={{
              position: 'absolute',
              left: `${x}px`,
              top: `${y}px`,
              backgroundColor: bg,
              zIndex: draggingId === task.id ? 40 : 20,
            }}
            className={`w-64 sm:w-72 p-4 rounded-2xl shadow-sticky border border-black/5 flex flex-col justify-between transition-shadow cursor-grab active:cursor-grabbing group ${
              draggingId === task.id ? 'scale-105 shadow-2xl' : 'hover:-translate-y-1'
            }`}
          >
            {/* Note Header */}
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/10">
                <div className="flex items-center gap-1.5 text-stone-700/60">
                  <GripHorizontal className="w-4 h-4" />
                </div>

                <div className="flex items-center gap-1">
                  {/* Color Palettes Picker */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    {STICKY_PALETTE.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => updateStickyNote(task.id, { sticky_color: c })}
                        className="w-3.5 h-3.5 rounded-full border border-black/20 hover:scale-125 transition-transform"
                        style={{ backgroundColor: c }}
                        title="Change note color"
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-stone-700/60 hover:text-red-600 transition-colors rounded"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Editable Title */}
              <input
                type="text"
                value={task.title}
                onChange={(e) => updateTask(task.id, { title: e.target.value })}
                className="w-full bg-transparent font-bold text-stone-900 text-sm focus:outline-none placeholder-stone-600/50 mb-1"
                placeholder="Note Title"
              />

              {/* Editable Body */}
              <textarea
                rows={4}
                value={task.description || ''}
                onChange={(e) => updateTask(task.id, { description: e.target.value })}
                className="w-full bg-transparent text-xs text-stone-800 placeholder-stone-600/40 focus:outline-none resize-none leading-relaxed"
                placeholder="Type note details here..."
              />
            </div>

            {/* Note Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-black/5 text-[10px] text-stone-700/70 font-medium">
              <span>{task.due_date ? `Due: ${task.due_date}` : 'Sticky Note'}</span>
              <span>{task.priority || 'Normal'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
