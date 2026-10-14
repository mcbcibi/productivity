import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
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
    due_date: getTodayDateString(0), // Today
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

export const TaskProvider = ({ children }) => {
  const { user, isConfigured } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI Navigation & Filters
  const [selectedView, setSelectedView] = useState('today'); // 'upcoming', 'today', 'calendar', 'sticky', 'completed'
  const [activeListId, setActiveListId] = useState(null);
  const [activeTagId, setActiveTagId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('manual'); // 'manual', 'due_date', 'priority', 'name', 'created_at'
  const [filterPriority, setFilterPriority] = useState('all'); // 'all', 'high', 'medium', 'low'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'completed', 'overdue'

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Seed sample data in Supabase if empty
  const seedSupabaseData = async () => {
    if (!supabase || !user) return;
    try {
      // Check if user has lists
      const { data: existingLists } = await supabase.from('lists').select('id').limit(1);
      if (existingLists && existingLists.length > 0) return;

      // Seed Lists
      const { data: createdLists, error: listError } = await supabase
        .from('lists')
        .insert([
          { name: 'Personal', color: '#FF7675' },
          { name: 'Work', color: '#74B9FF' },
        ])
        .select();

      if (listError || !createdLists) return;

      const personalList = createdLists.find((l) => l.name === 'Personal') || createdLists[0];
      const workList = createdLists.find((l) => l.name === 'Work') || createdLists[1];

      // Seed Tags
      const { data: createdTags } = await supabase
        .from('tags')
        .insert([
          { name: 'Urgent', color: '#FEE2E2' },
          { name: 'Home', color: '#E0E7FF' },
          { name: 'Project', color: '#FEF3C7' },
        ])
        .select();

      // Seed Tasks
      const { data: createdTasks } = await supabase
        .from('tasks')
        .insert([
          {
            title: 'Research content ideas',
            description: 'Explore trending industry topics, user feedback, and competitive analysis for Q4.',
            list_id: workList.id,
            due_date: getTodayDateString(2),
            priority: 'medium',
            position: 1000,
            sticky_color: '#FEF08A',
            sticky_x: 40,
            sticky_y: 40,
          },
          {
            title: 'Create a database of guest authors',
            description: 'Compile emails, publication links, and outreach statuses in our Notion directory.',
            list_id: workList.id,
            due_date: getTodayDateString(4),
            priority: 'high',
            position: 2000,
            sticky_color: '#BAE6FD',
            sticky_x: 290,
            sticky_y: 40,
          },
          {
            title: "Renew driver's license",
            description: 'Appointment scheduled online. Bring passport, proof of address, and fee receipt.',
            list_id: personalList.id,
            due_date: getTodayDateString(0),
            priority: 'high',
            position: 3000,
            sticky_color: '#BBF7D0',
            sticky_x: 540,
            sticky_y: 40,
          },
          {
            title: 'Consult accountant',
            description: 'Review quarterly deductions and prepare tax write-offs for office equipment.',
            list_id: workList.id,
            due_date: getTodayDateString(1),
            priority: 'low',
            recurrence: 'monthly',
            position: 4000,
            sticky_color: '#FED7AA',
            sticky_x: 40,
            sticky_y: 280,
          },
          {
            title: 'Print business card',
            description: 'Send high-res PDF to local print shop on 350gsm matte paper with spot UV.',
            list_id: personalList.id,
            due_date: getTodayDateString(5),
            priority: 'medium',
            position: 5000,
            sticky_color: '#FBCFE8',
            sticky_x: 290,
            sticky_y: 280,
          },
        ])
        .select();

      // Seed subtask for Renew driver's license
      const renewTask = createdTasks?.find((t) => t.title.includes("Renew driver's license"));
      if (renewTask) {
        await supabase.from('subtasks').insert([
          {
            task_id: renewTask.id,
            title: 'Book DMV appointment',
            is_completed: true,
            position: 1,
          },
        ]);
      }

      // Link tags if tags created
      if (createdTags && createdTasks) {
        const guestTask = createdTasks.find((t) => t.title.includes('guest authors'));
        const urgentTag = createdTags.find((tg) => tg.name === 'Urgent');
        if (guestTask && urgentTag) {
          await supabase.from('task_tags').insert([
            { task_id: guestTask.id, tag_id: urgentTag.id },
          ]);
        }
      }
    } catch (e) {
      console.warn('Seeding warning:', e);
    }
  };

  // Fetch initial data
  const fetchData = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLists([]);
      setTags([]);
      setLoading(false);
      return;
    }

    if (!isConfigured) {
      // Demo / Local storage mode
      try {
        const savedTasks = localStorage.getItem('productivity_demo_tasks');
        const savedLists = localStorage.getItem('productivity_demo_lists');
        const savedTags = localStorage.getItem('productivity_demo_tags');

        setTasks(savedTasks ? JSON.parse(savedTasks) : DEFAULT_TASKS);
        setLists(savedLists ? JSON.parse(savedLists) : DEFAULT_LISTS);
        setTags(savedTags ? JSON.parse(savedTags) : DEFAULT_TAGS);
      } catch (e) {
        console.error('Error loading demo state:', e);
        setTasks(DEFAULT_TASKS);
        setLists(DEFAULT_LISTS);
        setTags(DEFAULT_TAGS);
      }
      setLoading(false);
      return;
    }

    // Supabase connected
    try {
      setLoading(true);

      // Attempt seed first if fresh
      await seedSupabaseData();

      // 1. Fetch lists
      const { data: listsData, error: listsError } = await supabase
        .from('lists')
        .select('*')
        .order('created_at', { ascending: true });

      if (listsError) throw listsError;
      setLists(listsData || []);

      // 2. Fetch tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });

      if (tagsError) throw tagsError;
      setTags(tagsData || []);

      // 3. Fetch tasks with relations in one query
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          list:lists(*),
          subtasks(*),
          task_tags(tag:tags(*))
        `)
        .order('position', { ascending: true });

      if (tasksError) throw tasksError;

      // Ensure subtasks are sorted
      const normalizedTasks = (tasksData || []).map((t) => ({
        ...t,
        subtasks: (t.subtasks || []).sort((a, b) => a.position - b.position),
      }));

      setTasks(normalizedTasks);
    } catch (err) {
      console.error('Error fetching data from Supabase:', err);
      addToast('Failed to load data from Supabase. Falling back to local data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, isConfigured, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Persist demo mode updates to localStorage
  useEffect(() => {
    if (!isConfigured && !loading && user) {
      try {
        localStorage.setItem('productivity_demo_tasks', JSON.stringify(tasks));
        localStorage.setItem('productivity_demo_lists', JSON.stringify(lists));
        localStorage.setItem('productivity_demo_tags', JSON.stringify(tags));
      } catch (err) {
        console.warn('Storage sync error:', err);
      }
    }
  }, [tasks, lists, tags, isConfigured, loading, user]);

  // Realtime Subscriptions
  useEffect(() => {
    if (!isConfigured || !supabase || !user) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subtasks' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lists' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tags' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_tags' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isConfigured, user, fetchData]);

  // OPTIMISTIC TASK ACTIONS

  // 1. Add Task
  const addTask = async (taskPayload) => {
    const tempId = 'temp-' + Date.now();
    const position = tasks.length > 0 ? Math.max(...tasks.map((t) => t.position || 0)) + 1000 : 1000;

    const selectedList = lists.find((l) => l.id === (taskPayload.list_id || activeListId));
    const optimisticTask = {
      id: tempId,
      title: taskPayload.title || 'New Task',
      description: taskPayload.description || '',
      list_id: selectedList ? selectedList.id : (lists[0]?.id || null),
      list: selectedList || lists[0] || null,
      due_date: taskPayload.due_date || (selectedView === 'today' ? getTodayDateString(0) : null),
      priority: taskPayload.priority || 'medium',
      recurrence: taskPayload.recurrence || null,
      is_completed: false,
      completed_at: null,
      position,
      sticky_color: '#FEF08A',
      sticky_x: 40 + (tasks.length % 4) * 20,
      sticky_y: 40 + (tasks.length % 4) * 20,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subtasks: [],
      task_tags: [],
    };

    // Optimistic UI update
    setTasks((prev) => [optimisticTask, ...prev]);

    if (!isConfigured) {
      addToast('Task added locally', 'success');
      return optimisticTask;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: optimisticTask.title,
          description: optimisticTask.description,
          list_id: optimisticTask.list_id,
          due_date: optimisticTask.due_date,
          priority: optimisticTask.priority,
          recurrence: optimisticTask.recurrence,
          is_completed: false,
          position: optimisticTask.position,
          sticky_color: optimisticTask.sticky_color,
          sticky_x: optimisticTask.sticky_x,
          sticky_y: optimisticTask.sticky_y,
        })
        .select(`
          *,
          list:lists(*),
          subtasks(*),
          task_tags(tag:tags(*))
        `)
        .single();

      if (error) throw error;

      // Replace temp task with confirmed DB record
      setTasks((prev) => prev.map((t) => (t.id === tempId ? { ...data, subtasks: [] } : t)));
      if (selectedTaskId === tempId) {
        setSelectedTaskId(data.id);
      }
      return data;
    } catch (err) {
      console.error('Error adding task:', err);
      // Rollback
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      addToast('Failed to add task: ' + (err.message || 'Server error'), 'error');
      return null;
    }
  };

  // 2. Update Task
  const updateTask = async (taskId, updates) => {
    const previousTasks = [...tasks];

    // Optimistic update
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

    if (!isConfigured) {
      return;
    }

    try {
      // Exclude relational joined fields before DB update
      const dbUpdates = { ...updates };
      delete dbUpdates.list;
      delete dbUpdates.subtasks;
      delete dbUpdates.task_tags;

      const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', taskId);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating task:', err);
      // Rollback
      setTasks(previousTasks);
      addToast('Failed to save task changes', 'error');
    }
  };

  // 3. Toggle Complete Task (With Recurrence & Confetti)
  const toggleTaskCompletion = async (taskId) => {
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
        // Safe fallback
      }
    }

    // Handle Recurring Task creation if completed and recurrence exists
    let recurrenceInsert = null;
    if (nextCompleted && task.recurrence) {
      const nextDue = new Date(task.due_date ? task.due_date : new Date());
      if (task.recurrence === 'daily') {
        nextDue.setDate(nextDue.getDate() + 1);
      } else if (task.recurrence === 'weekly') {
        nextDue.setDate(nextDue.getDate() + 7);
      } else if (task.recurrence === 'monthly') {
        nextDue.setMonth(nextDue.getMonth() + 1);
      }

      recurrenceInsert = {
        title: task.title,
        description: task.description,
        list_id: task.list_id,
        due_date: nextDue.toISOString().split('T')[0],
        priority: task.priority,
        recurrence: task.recurrence,
        is_completed: false,
        position: task.position + 100,
        sticky_color: task.sticky_color,
        sticky_x: task.sticky_x,
        sticky_y: task.sticky_y,
      };
    }

    const previousTasks = [...tasks];

    // Optimistic Update
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId ? { ...t, is_completed: nextCompleted, completed_at: completedAt } : t
      );
      if (recurrenceInsert) {
        const optimisticRecurring = {
          ...recurrenceInsert,
          id: 'temp-recurring-' + Date.now(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subtasks: [],
          task_tags: task.task_tags || [],
          list: task.list,
        };
        return [optimisticRecurring, ...updated];
      }
      return updated;
    });

    if (!isConfigured) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: nextCompleted, completed_at: completedAt })
        .eq('id', taskId);

      if (error) throw error;

      if (recurrenceInsert) {
        const { data: recData, error: recError } = await supabase
          .from('tasks')
          .insert(recurrenceInsert)
          .select(`
            *,
            list:lists(*),
            subtasks(*),
            task_tags(tag:tags(*))
          `)
          .single();

        if (recError) throw recError;
        if (recData) {
          setTasks((prev) =>
            prev.map((t) => (t.id.startsWith('temp-recurring-') ? recData : t))
          );
        }
      }
    } catch (err) {
      console.error('Error toggling completion:', err);
      setTasks(previousTasks);
      addToast('Failed to update task status', 'error');
    }
  };

  // 4. Delete Task
  const deleteTask = async (taskId) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }

    if (!isConfigured) {
      addToast('Task deleted', 'info');
      return;
    }

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      addToast('Task deleted', 'info');
    } catch (err) {
      console.error('Error deleting task:', err);
      setTasks(previousTasks);
      addToast('Failed to delete task', 'error');
    }
  };

  // 5. Reorder Tasks (Float Midpoint Algorithm)
  const reorderTasks = async (movedTaskId, targetIndex) => {
    // Current filtered/active task order
    const listCopy = [...tasks];
    const currentIndex = listCopy.findIndex((t) => t.id === movedTaskId);
    if (currentIndex === -1) return;

    const [movedItem] = listCopy.splice(currentIndex, 1);
    listCopy.splice(targetIndex, 0, movedItem);

    // Calculate midpoint position
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

    // Apply to item
    movedItem.position = newPosition;

    // Optimistic UI state
    setTasks([...listCopy]);

    if (!isConfigured) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ position: newPosition })
        .eq('id', movedTaskId);

      if (error) throw error;
    } catch (err) {
      console.error('Error saving reorder:', err);
      fetchData(); // Reset to server state
      addToast('Failed to update task order', 'error');
    }
  };

  // 6. Subtasks CRUD
  const addSubtask = async (taskId, title) => {
    if (!title.trim()) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const tempSubId = 'sub-' + Date.now();
    const position = (task.subtasks?.length || 0) + 1;
    const newSubtask = {
      id: tempSubId,
      task_id: taskId,
      title: title.trim(),
      is_completed: false,
      position,
    };

    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), newSubtask] } : t))
    );

    if (!isConfigured) return;

    try {
      const { data, error } = await supabase
        .from('subtasks')
        .insert({
          task_id: taskId,
          title: newSubtask.title,
          is_completed: false,
          position: newSubtask.position,
        })
        .select()
        .single();

      if (error) throw error;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                subtasks: (t.subtasks || []).map((s) => (s.id === tempSubId ? data : s)),
              }
            : t
        )
      );
    } catch (err) {
      console.error('Error adding subtask:', err);
      setTasks(previousTasks);
      addToast('Failed to add subtask', 'error');
    }
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    const previousTasks = [...tasks];
    let nextState = false;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubs = (t.subtasks || []).map((s) => {
            if (s.id === subtaskId) {
              nextState = !s.is_completed;
              return { ...s, is_completed: nextState };
            }
            return s;
          });
          return { ...t, subtasks: updatedSubs };
        }
        return t;
      })
    );

    if (!isConfigured) return;

    try {
      const { error } = await supabase
        .from('subtasks')
        .update({ is_completed: nextState })
        .eq('id', subtaskId);
      if (error) throw error;
    } catch (err) {
      console.error('Error toggling subtask:', err);
      setTasks(previousTasks);
      addToast('Failed to update subtask', 'error');
    }
  };

  const deleteSubtask = async (taskId, subtaskId) => {
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId) }
          : t
      )
    );

    if (!isConfigured) return;

    try {
      const { error } = await supabase.from('subtasks').delete().eq('id', subtaskId);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting subtask:', err);
      setTasks(previousTasks);
      addToast('Failed to delete subtask', 'error');
    }
  };

  // 7. Lists Management
  const addList = async (name, color = '#74B9FF') => {
    if (!name.trim()) return;
    const tempListId = 'list-' + Date.now();
    const newList = {
      id: tempListId,
      name: name.trim(),
      color,
      created_at: new Date().toISOString(),
    };

    setLists((prev) => [...prev, newList]);

    if (!isConfigured) {
      addToast('List created', 'success');
      return newList;
    }

    try {
      const { data, error } = await supabase
        .from('lists')
        .insert({ name: newList.name, color: newList.color })
        .select()
        .single();

      if (error) throw error;
      setLists((prev) => prev.map((l) => (l.id === tempListId ? data : l)));
      addToast('List created', 'success');
      return data;
    } catch (err) {
      console.error('Error creating list:', err);
      setLists((prev) => prev.filter((l) => l.id !== tempListId));
      addToast('Failed to create list: ' + err.message, 'error');
      return null;
    }
  };

  const updateList = async (listId, updates) => {
    const previousLists = [...lists];
    const previousTasks = [...tasks];

    // Optimistic update for lists and task list relations
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, ...updates } : l))
    );
    setTasks((prev) =>
      prev.map((t) =>
        t.list_id === listId ? { ...t, list: { ...(t.list || {}), ...updates } } : t
      )
    );

    if (!isConfigured) {
      addToast('List updated', 'success');
      return;
    }

    try {
      const { error } = await supabase
        .from('lists')
        .update({ name: updates.name, color: updates.color })
        .eq('id', listId);
      if (error) throw error;
      addToast('List updated', 'success');
    } catch (err) {
      console.error('Error updating list:', err);
      setLists(previousLists);
      setTasks(previousTasks);
      addToast('Failed to update list: ' + err.message, 'error');
    }
  };

  const deleteList = async (listId) => {
    const previousLists = [...lists];
    setLists((prev) => prev.filter((l) => l.id !== listId));
    if (activeListId === listId) {
      setActiveListId(null);
      setSelectedView('today');
    }

    if (!isConfigured) {
      addToast('List deleted', 'info');
      return;
    }

    try {
      const { error } = await supabase.from('lists').delete().eq('id', listId);
      if (error) throw error;
      addToast('List deleted', 'info');
    } catch (err) {
      console.error('Error deleting list:', err);
      setLists(previousLists);
      addToast('Failed to delete list', 'error');
    }
  };

  // 8. Tags Management & Task-Tag linking
  const addTag = async (name, color = '#FEE2E2') => {
    if (!name.trim()) return;
    const tempTagId = 'tag-' + Date.now();
    const newTag = {
      id: tempTagId,
      name: name.trim(),
      color,
      created_at: new Date().toISOString(),
    };

    setTags((prev) => [...prev, newTag]);

    if (!isConfigured) {
      addToast('Tag created', 'success');
      return newTag;
    }

    try {
      const { data, error } = await supabase
        .from('tags')
        .insert({ name: newTag.name, color: newTag.color })
        .select()
        .single();

      if (error) throw error;
      setTags((prev) => prev.map((tg) => (tg.id === tempTagId ? data : tg)));
      addToast('Tag created', 'success');
      return data;
    } catch (err) {
      console.error('Error creating tag:', err);
      setTags((prev) => prev.filter((tg) => tg.id !== tempTagId));
      addToast('Failed to create tag: ' + (err.message || 'Already exists'), 'error');
      return null;
    }
  };

  const updateTag = async (tagId, updates) => {
    const previousTags = [...tags];
    const previousTasks = [...tasks];

    setTags((prev) =>
      prev.map((tg) => (tg.id === tagId ? { ...tg, ...updates } : tg))
    );
    // Update tags embedded in tasks
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

    if (!isConfigured) {
      addToast('Tag updated', 'success');
      return;
    }

    try {
      const { error } = await supabase
        .from('tags')
        .update({ name: updates.name, color: updates.color })
        .eq('id', tagId);
      if (error) throw error;
      addToast('Tag updated', 'success');
    } catch (err) {
      console.error('Error updating tag:', err);
      setTags(previousTags);
      setTasks(previousTasks);
      addToast('Failed to update tag: ' + (err.message || 'Error'), 'error');
    }
  };

  const deleteTag = async (tagId) => {
    const previousTags = [...tags];
    const previousTasks = [...tasks];

    setTags((prev) => prev.filter((tg) => tg.id !== tagId));
    if (activeTagId === tagId) {
      setActiveTagId(null);
    }

    // Remove from tasks
    setTasks((prev) =>
      prev.map((t) => ({
        ...t,
        task_tags: (t.task_tags || []).filter(
          (tt) => (tt.tag?.id || tt.tag_id) !== tagId
        ),
      }))
    );

    if (!isConfigured) {
      addToast('Tag deleted', 'info');
      return;
    }

    try {
      const { error } = await supabase.from('tags').delete().eq('id', tagId);
      if (error) throw error;
      addToast('Tag deleted', 'info');
    } catch (err) {
      console.error('Error deleting tag:', err);
      setTags(previousTags);
      setTasks(previousTasks);
      addToast('Failed to delete tag', 'error');
    }
  };

  const toggleTaskTag = async (taskId, tagId) => {
    const task = tasks.find((t) => t.id === taskId);
    const tag = tags.find((tg) => tg.id === tagId);
    if (!task || !tag) return;

    const hasTag = task.task_tags?.some((tt) => tt.tag?.id === tagId || tt.tag_id === tagId);
    const previousTasks = [...tasks];

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const currentTags = t.task_tags || [];
          const updatedTags = hasTag
            ? currentTags.filter((tt) => (tt.tag?.id || tt.tag_id) !== tagId)
            : [...currentTags, { task_id: taskId, tag_id: tagId, tag }];
          return { ...t, task_tags: updatedTags };
        }
        return t;
      })
    );

    if (!isConfigured) return;

    try {
      if (hasTag) {
        const { error } = await supabase
          .from('task_tags')
          .delete()
          .match({ task_id: taskId, tag_id: tagId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('task_tags')
          .insert({ task_id: taskId, tag_id: tagId });
        if (error) throw error;
      }
    } catch (err) {
      console.error('Error toggling tag:', err);
      setTasks(previousTasks);
      addToast('Failed to update tag', 'error');
    }
  };

  // Sticky Note Position / Color update
  const updateStickyNote = async (taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );

    if (!isConfigured) return;

    try {
      await supabase.from('tasks').update(updates).eq('id', taskId);
    } catch (err) {
      console.error('Error saving sticky note:', err);
    }
  };

  // Filtered & Sorted Tasks calculation
  const filteredTasks = useMemo(() => {
    const todayStr = getTodayDateString(0);
    const in7DaysStr = getTodayDateString(7);

    return tasks.filter((task) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = (task.description || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // 2. Active List Filter
      if (activeListId) {
        if (task.list_id !== activeListId) return false;
      }

      // 3. Active Tag Filter
      if (activeTagId) {
        const hasTag = task.task_tags?.some(
          (tt) => (tt.tag?.id || tt.tag_id) === activeTagId
        );
        if (!hasTag) return false;
      }

      // 4. View Filter (only if not viewing a specific list)
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

      // 5. Priority Filter
      if (filterPriority !== 'all') {
        if (task.priority !== filterPriority) return false;
      }

      // 6. Status Filter
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
    // Manual position sorting (default)
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

    // List counts
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
        // Actions
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
        refetch: fetchData,
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
