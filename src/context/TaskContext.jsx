import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';

const TaskContext = createContext(null);

const DEFAULT_LISTS = [
  { id: 'list-1', name: 'Personal', color: '#FF7675', created_at: new Date().toISOString() },
  { id: 'list-2', name: 'Work', color: '#74B9FF', created_at: new Date().toISOString() },
];

const DEFAULT_TAGS = [
  { id: 'tag-1', name: 'Urgent', color: '#FEE2E2' },
  { id: 'tag-2', name: 'Home', color: '#E0E7FF' },
  { id: 'tag-3', name: 'Project', color: '#FEF3C7' },
];

const getTodayDateString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const DEFAULT_TASKS = [
  {
    id: 'task-1',
    title: 'Research content ideas',
    description: 'Explore trending industry topics, user feedback, and competitive analysis for Q4.',
    list_id: 'list-2',
    due_date: getTodayDateString(2),
    priority: 'medium',
    recurrence: null,
    is_completed: false,
    completed_at: null,
    position: 1000,
    sticky_color: '#FEF08A',
    sticky_x: 40,
    sticky_y: 40,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date().toISOString(),
    subtasks: [],
    task_tags: [{ tag: DEFAULT_TAGS[2] }],
  },
  {
    id: 'task-2',
    title: 'Create a database of guest authors',
    description: 'Compile emails, publication links, and outreach statuses in our Notion directory.',
    list_id: 'list-2',
    due_date: getTodayDateString(4),
    priority: 'high',
    recurrence: null,
    is_completed: false,
    completed_at: null,
    position: 2000,
    sticky_color: '#BAE6FD',
    sticky_x: 290,
    sticky_y: 40,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date().toISOString(),
    subtasks: [
      { id: 'sub-1', title: 'Export contacts from Twitter lists', is_completed: true, position: 1 },
      { id: 'sub-2', title: 'Format spreadsheet columns', is_completed: false, position: 2 },
    ],
    task_tags: [{ tag: DEFAULT_TAGS[0] }, { tag: DEFAULT_TAGS[2] }],
  },
  {
    id: 'task-3',
    title: "Renew driver's license",
    description: 'Appointment scheduled online. Bring passport, proof of address, and fee receipt.',
    list_id: 'list-1',
    due_date: getTodayDateString(0),
    priority: 'high',
    recurrence: null,
    is_completed: false,
    completed_at: null,
    position: 3000,
    sticky_color: '#BBF7D0',
    sticky_x: 540,
    sticky_y: 40,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date().toISOString(),
    subtasks: [
      { id: 'sub-3', title: 'Book DMV appointment', is_completed: true, position: 1 },
    ],
    task_tags: [{ tag: DEFAULT_TAGS[1] }],
  },
  {
    id: 'task-4',
    title: 'Consult accountant',
    description: 'Review quarterly deductions and prepare tax write-offs for office equipment.',
    list_id: 'list-2',
    due_date: getTodayDateString(1),
    priority: 'low',
    recurrence: 'monthly',
    is_completed: false,
    completed_at: null,
    position: 4000,
    sticky_color: '#FED7AA',
    sticky_x: 40,
    sticky_y: 280,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subtasks: [],
    task_tags: [],
  },
  {
    id: 'task-5',
    title: 'Print business card',
    description: 'Send high-res PDF to local print shop on 350gsm matte paper with spot UV.',
    list_id: 'list-1',
    due_date: getTodayDateString(5),
    priority: 'medium',
    recurrence: null,
    is_completed: false,
    completed_at: null,
    position: 5000,
    sticky_color: '#FBCFE8',
    sticky_x: 290,
    sticky_y: 280,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subtasks: [],
    task_tags: [{ tag: DEFAULT_TAGS[2] }],
  },
];

const loadFromStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Failed to read ${key} from localStorage:`, err);
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to save ${key} to localStorage:`, err);
  }
};

export const TaskProvider = ({ children }) => {
  const [lists, setLists] = useState(() => loadFromStorage('productivity_local_lists', DEFAULT_LISTS));
  const [tags, setTags] = useState(() => loadFromStorage('productivity_local_tags', DEFAULT_TAGS));
  const [tasks, setTasks] = useState(() => {
    const stored = loadFromStorage('productivity_local_tasks', DEFAULT_TASKS);
    // Enrich with list references
    return stored.map((t) => ({
      ...t,
      list: DEFAULT_LISTS.find((l) => l.id === t.list_id) || t.list,
    }));
  });
  const [loading] = useState(false);

  // UI Navigation & Filters
  const [selectedView, setSelectedView] = useState('today');
  const [activeListId, setActiveListId] = useState(null);
  const [activeTagId, setActiveTagId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('manual');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync to localStorage
  useEffect(() => {
    saveToStorage('productivity_local_lists', lists);
  }, [lists]);

  useEffect(() => {
    saveToStorage('productivity_local_tags', tags);
  }, [tags]);

  useEffect(() => {
    saveToStorage('productivity_local_tasks', tasks);
  }, [tasks]);

  // 1. Add Task
  const addTask = (taskPayload) => {
    const newId = 'task-' + Date.now();
    const position = tasks.length > 0 ? Math.max(...tasks.map((t) => t.position || 0)) + 1000 : 1000;
    const selectedList = lists.find((l) => l.id === (taskPayload.list_id || activeListId)) || lists[0] || null;

    const newTask = {
      id: newId,
      title: taskPayload.title || 'New Task',
      description: taskPayload.description || '',
      list_id: selectedList?.id || null,
      list: selectedList,
      due_date: taskPayload.due_date || (selectedView === 'today' ? getTodayDateString(0) : null),
      priority: taskPayload.priority || 'medium',
      recurrence: taskPayload.recurrence || null,
      is_completed: false,
      completed_at: null,
      position,
      sticky_color: taskPayload.sticky_color || '#FEF08A',
      sticky_x: taskPayload.sticky_x ?? (40 + (tasks.length % 5) * 30),
      sticky_y: taskPayload.sticky_y ?? (40 + (tasks.length % 5) * 30),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subtasks: [],
      task_tags: [],
    };

    setTasks((prev) => [newTask, ...prev]);
    addToast('Task added', 'success');
    return newTask;
  };

  // 2. Update Task
  const updateTask = (taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, ...updates, updated_at: new Date().toISOString() };
          if (updates.list_id) {
            updated.list = lists.find((l) => l.id === updates.list_id) || t.list;
          }
          return updated;
        }
        return t;
      })
    );
  };

  // 3. Toggle Task Completion (with Recurrence & Confetti)
  const toggleTaskCompletion = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const nextCompleted = !task.is_completed;
    const completedAt = nextCompleted ? new Date().toISOString() : null;

    if (nextCompleted) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#FFD43B', '#729584', '#74B9FF', '#FF7675'],
        });
      } catch {
        // Fallback
      }
    }

    let recurringTask = null;
    if (nextCompleted && task.recurrence) {
      const nextDue = new Date(task.due_date ? task.due_date : new Date());
      if (task.recurrence === 'daily') {
        nextDue.setDate(nextDue.getDate() + 1);
      } else if (task.recurrence === 'weekly') {
        nextDue.setDate(nextDue.getDate() + 7);
      } else if (task.recurrence === 'monthly') {
        nextDue.setMonth(nextDue.getMonth() + 1);
      }

      recurringTask = {
        ...task,
        id: 'task-' + Date.now(),
        due_date: nextDue.toISOString().split('T')[0],
        is_completed: false,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        position: task.position + 100,
      };
    }

    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId ? { ...t, is_completed: nextCompleted, completed_at: completedAt } : t
      );
      if (recurringTask) {
        return [recurringTask, ...updated];
      }
      return updated;
    });
  };

  // 4. Delete Task
  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
    addToast('Task deleted', 'info');
  };

  // 5. Reorder Tasks (Float Midpoint)
  const reorderTasks = (movedTaskId, targetIndex) => {
    const listCopy = [...tasks];
    const currentIndex = listCopy.findIndex((t) => t.id === movedTaskId);
    if (currentIndex === -1) return;

    const [movedItem] = listCopy.splice(currentIndex, 1);
    listCopy.splice(targetIndex, 0, movedItem);

    let newPosition;
    if (targetIndex === 0) {
      const nextPos = listCopy[1]?.position ?? 1000;
      newPosition = nextPos / 2;
    } else if (targetIndex === listCopy.length - 1) {
      const prevPos = listCopy[targetIndex - 1]?.position ?? 1000;
      newPosition = prevPos + 1000;
    } else {
      const prevPos = listCopy[targetIndex - 1]?.position ?? 0;
      const nextPos = listCopy[targetIndex + 1]?.position ?? 2000;
      newPosition = prevPos + (nextPos - prevPos) / 2;
    }

    movedItem.position = newPosition;
    setTasks([...listCopy]);
  };

  // 6. Subtasks
  const addSubtask = (taskId, title) => {
    if (!title.trim()) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newSubtask = {
      id: 'sub-' + Date.now(),
      task_id: taskId,
      title: title.trim(),
      is_completed: false,
      position: (task.subtasks?.length || 0) + 1,
    };

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), newSubtask] } : t))
    );
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubs = (t.subtasks || []).map((s) =>
            s.id === subtaskId ? { ...s, is_completed: !s.is_completed } : s
          );
          return { ...t, subtasks: updatedSubs };
        }
        return t;
      })
    );
  };

  const deleteSubtask = (taskId, subtaskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId) }
          : t
      )
    );
  };

  // 7. Lists
  const addList = (name, color = '#74B9FF') => {
    if (!name.trim()) return;
    const newList = {
      id: 'list-' + Date.now(),
      name: name.trim(),
      color,
      created_at: new Date().toISOString(),
    };
    setLists((prev) => [...prev, newList]);
    addToast('List created', 'success');
    return newList;
  };

  const updateList = (listId, updates) => {
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, ...updates } : l))
    );
    setTasks((prev) =>
      prev.map((t) =>
        t.list_id === listId ? { ...t, list: { ...(t.list || {}), ...updates } } : t
      )
    );
    addToast('List updated', 'success');
  };

  const deleteList = (listId) => {
    setLists((prev) => prev.filter((l) => l.id !== listId));
    if (activeListId === listId) {
      setActiveListId(null);
      setSelectedView('today');
    }
    addToast('List deleted', 'info');
  };

  // 8. Tags
  const addTag = (name, color = '#FEE2E2') => {
    if (!name.trim()) return;
    const newTag = {
      id: 'tag-' + Date.now(),
      name: name.trim(),
      color,
      created_at: new Date().toISOString(),
    };
    setTags((prev) => [...prev, newTag]);
    addToast('Tag created', 'success');
    return newTag;
  };

  const updateTag = (tagId, updates) => {
    setTags((prev) =>
      prev.map((tg) => (tg.id === tagId ? { ...tg, ...updates } : tg))
    );
    setTasks((prev) =>
      prev.map((t) => {
        if (!t.task_tags) return t;
        const updatedTT = t.task_tags.map((tt) => {
          if ((tt.tag?.id || tt.tag_id) === tagId) {
            return { ...tt, tag: { ...(tt.tag || {}), ...updates } };
          }
          return tt;
        });
        return { ...t, task_tags: updatedTT };
      })
    );
    addToast('Tag updated', 'success');
  };

  const deleteTag = (tagId) => {
    setTags((prev) => prev.filter((tg) => tg.id !== tagId));
    if (activeTagId === tagId) {
      setActiveTagId(null);
    }
    setTasks((prev) =>
      prev.map((t) => ({
        ...t,
        task_tags: (t.task_tags || []).filter(
          (tt) => (tt.tag?.id || tt.tag_id) !== tagId
        ),
      }))
    );
    addToast('Tag deleted', 'info');
  };

  const toggleTaskTag = (taskId, tagId) => {
    const tag = tags.find((tg) => tg.id === tagId);
    if (!tag) return;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const currentTags = t.task_tags || [];
          const hasTag = currentTags.some((tt) => (tt.tag?.id || tt.tag_id) === tagId);
          const updatedTags = hasTag
            ? currentTags.filter((tt) => (tt.tag?.id || tt.tag_id) !== tagId)
            : [...currentTags, { task_id: taskId, tag_id: tagId, tag }];
          return { ...t, task_tags: updatedTags };
        }
        return t;
      })
    );
  };

  // Sticky Notes
  const updateStickyNote = (taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  };

  // Reset to Default Sample Data
  const resetToDefaultData = () => {
    setTasks(DEFAULT_TASKS);
    setLists(DEFAULT_LISTS);
    setTags(DEFAULT_TAGS);
    localStorage.removeItem('productivity_local_tasks');
    localStorage.removeItem('productivity_local_lists');
    localStorage.removeItem('productivity_local_tags');
    addToast('Reset to default sample data', 'info');
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    const todayStr = getTodayDateString(0);
    const in7DaysStr = getTodayDateString(7);

    return tasks.filter((task) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = (task.description || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      if (activeListId) {
        if (task.list_id !== activeListId) return false;
      }

      if (activeTagId) {
        const hasTag = task.task_tags?.some(
          (tt) => (tt.tag?.id || tt.tag_id) === activeTagId
        );
        if (!hasTag) return false;
      }

      if (!activeListId) {
        if (selectedView === 'today') {
          if (task.due_date !== todayStr) return false;
        } else if (selectedView === 'upcoming') {
          if (!task.due_date || task.due_date < todayStr || task.due_date > in7DaysStr) {
            return false;
          }
        } else if (selectedView === 'completed') {
          if (!task.is_completed) return false;
        }
      }

      if (filterPriority !== 'all') {
        if (task.priority !== filterPriority) return false;
      }

      if (filterStatus === 'active' && task.is_completed) return false;
      if (filterStatus === 'completed' && !task.is_completed) return false;
      if (filterStatus === 'overdue') {
        if (task.is_completed || !task.due_date || task.due_date >= todayStr) return false;
      }

      return true;
    });
  }, [tasks, searchQuery, activeListId, activeTagId, selectedView, filterPriority, filterStatus]);

  // Sorted Tasks
  const sortedTasks = useMemo(() => {
    const list = [...filteredTasks];
    if (sortOption === 'due_date') {
      return list.sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      });
    }
    if (sortOption === 'priority') {
      const priorityWeight = { high: 1, medium: 2, low: 3 };
      return list.sort((a, b) => (priorityWeight[a.priority] || 4) - (priorityWeight[b.priority] || 4));
    }
    if (sortOption === 'name') {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortOption === 'created_at') {
      return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return list.sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [filteredTasks, sortOption]);

  // Counts for sidebar badges
  const taskCounts = useMemo(() => {
    const todayStr = getTodayDateString(0);
    const in7DaysStr = getTodayDateString(7);

    let todayCount = 0;
    let upcomingCount = 0;
    let calendarCount = 0;
    let stickyCount = 0;

    tasks.forEach((t) => {
      if (!t.is_completed) {
        if (t.due_date === todayStr) todayCount++;
        if (t.due_date && t.due_date >= todayStr && t.due_date <= in7DaysStr) upcomingCount++;
        if (t.due_date) calendarCount++;
      }
      stickyCount++;
    });

    const listCounts = {};
    lists.forEach((l) => {
      listCounts[l.id] = tasks.filter((t) => t.list_id === l.id && !t.is_completed).length;
    });

    return {
      today: todayCount,
      upcoming: upcomingCount,
      calendar: calendarCount,
      sticky: stickyCount,
      lists: listCounts,
    };
  }, [tasks, lists]);

  const activeTask = useMemo(() => {
    return tasks.find((t) => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        lists,
        tags,
        loading,
        filteredTasks: sortedTasks,
        activeTask,
        selectedTaskId,
        setSelectedTaskId,
        selectedView,
        setSelectedView,
        activeListId,
        setActiveListId,
        activeTagId,
        setActiveTagId,
        searchQuery,
        setSearchQuery,
        sortOption,
        setSortOption,
        filterPriority,
        setFilterPriority,
        filterStatus,
        setFilterStatus,
        taskCounts,
        toasts,
        addToast,
        removeToast,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        reorderTasks,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        addList,
        updateList,
        deleteList,
        addTag,
        updateTag,
        deleteTag,
        toggleTaskTag,
        updateStickyNote,
        resetToDefaultData,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
