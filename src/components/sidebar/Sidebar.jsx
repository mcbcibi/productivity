import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  StickyNote,
  ListFilter,
  Plus,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  X,
  Trash2,
  Pencil,
} from 'lucide-react';
import { AddListModal } from '../modals/AddListModal';
import { AddTagModal } from '../modals/AddTagModal';
import { EditListModal } from '../modals/EditListModal';
import { EditTagModal } from '../modals/EditTagModal';

export const Sidebar = ({ isCollapsed, setIsCollapsed, onOpenSettings }) => {
  const {
    selectedView,
    setSelectedView,
    activeListId,
    setActiveListId,
    activeTagId,
    setActiveTagId,
    searchQuery,
    setSearchQuery,
    taskCounts,
    lists,
    tags,
    deleteList,
    setSelectedTaskId,
  } = useTaskContext();

  const { user, signOut } = useAuth();

  const [isAddListOpen, setIsAddListOpen] = useState(false);
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [editingTag, setEditingTag] = useState(null);

  const navItems = [
    { id: 'upcoming', label: 'Upcoming', icon: Clock, count: taskCounts.upcoming },
    { id: 'today', label: 'Today', icon: CheckCircle2, count: taskCounts.today },
    { id: 'calendar', label: 'Calendar', icon: Calendar, count: taskCounts.calendar },
    { id: 'sticky', label: 'Sticky Wall', icon: StickyNote, count: taskCounts.sticky },
  ];

  const handleSelectView = (viewId) => {
    setSelectedView(viewId);
    setActiveListId(null);
    if (viewId === 'sticky' || viewId === 'calendar') {
      setSelectedTaskId(null);
    }
  };

  const handleSelectList = (listId) => {
    setActiveListId(listId);
    setSelectedView(null);
  };

  const handleToggleTag = (tagId) => {
    if (activeTagId === tagId) {
      setActiveTagId(null);
    } else {
      setActiveTagId(tagId);
    }
  };

  return (
    <>
      <aside
        className={`h-full bg-sidebar-light dark:bg-sidebar-dark border-r border-stone-200/70 dark:border-stone-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-0 md:w-20 overflow-hidden' : 'w-72 sm:w-80 shrink-0'
        }`}
      >
        {/* Top Header & Search */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* Menu Title & Toggle */}
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h2 className="text-xl font-bold font-display text-stone-900 dark:text-stone-100 tracking-tight">
                Menu
              </h2>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
              title={isCollapsed ? 'Expand menu' : 'Collapse menu'}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Live Search Bar */}
          {!isCollapsed && (
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                id="search-input"
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 text-stone-800 dark:text-stone-100 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-brand-yellow font-medium transition-all"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="absolute right-2.5 top-2.5 px-1.5 py-0.5 text-[10px] text-stone-400 font-mono bg-stone-100 dark:bg-stone-700 rounded border border-stone-200 dark:border-stone-600">
                  /
                </kbd>
              )}
            </div>
          )}

          {/* TASKS Section */}
          <div>
            {!isCollapsed && (
              <span className="block text-[11px] font-bold tracking-wider text-stone-400 dark:text-stone-500 uppercase px-2 mb-2">
                Tasks
              </span>
            )}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = !activeListId && selectedView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectView(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-stone-200/90 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                    title={item.label}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-stone-900 dark:text-brand-yellow' : 'text-stone-500'}`} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>
                    {!isCollapsed && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                          isActive
                            ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-xs'
                            : 'bg-stone-200/70 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-stone-200/60 dark:border-stone-800/60 pt-3" />

          {/* LISTS Section */}
          <div>
            {!isCollapsed && (
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-bold tracking-wider text-stone-400 dark:text-stone-500 uppercase">
                  Lists
                </span>
              </div>
            )}
            <div className="space-y-1">
              {lists.map((list) => {
                const isActive = activeListId === list.id;
                const count = taskCounts?.lists?.[list.id] || 0;
                return (
                  <div
                    key={list.id}
                    className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-stone-200/90 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                    onClick={() => handleSelectList(list.id)}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-3 h-3 rounded-md shrink-0 shadow-xs"
                        style={{ backgroundColor: list.color || '#74B9FF' }}
                      />
                      {!isCollapsed && <span className="truncate">{list.name}</span>}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                            isActive
                              ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100'
                              : 'bg-stone-200/70 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                          }`}
                        >
                          {count}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingList(list);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-300/50 dark:hover:bg-stone-700/50 transition-all rounded"
                          title="Edit list"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {lists.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteList(list.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all rounded"
                            title="Delete list"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add New List Button */}
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={() => setIsAddListOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/40 dark:hover:bg-stone-800/40 transition-colors font-medium mt-1"
                >
                  <Plus className="w-4 h-4 text-stone-400" />
                  <span>Add New List</span>
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-stone-200/60 dark:border-stone-800/60 pt-3" />

          {/* TAGS Section */}
          <div>
            {!isCollapsed && (
              <span className="block text-[11px] font-bold tracking-wider text-stone-400 dark:text-stone-500 uppercase px-2 mb-2.5">
                Tags
              </span>
            )}
            {!isCollapsed && (
              <div className="flex flex-wrap gap-2 px-1">
                {tags.map((tag) => {
                  const isTagActive = activeTagId === tag.id;
                  return (
                    <div
                      key={tag.id}
                      className="group/tag inline-flex items-center"
                    >
                      <button
                        onClick={() => handleToggleTag(tag.id)}
                        className={`inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-semibold transition-all border ${
                          isTagActive
                            ? 'ring-2 ring-stone-900 dark:ring-white scale-105 shadow-sm'
                            : 'opacity-90 hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor: tag.color || '#FEE2E2',
                          color: '#1c1917',
                          borderColor: isTagActive ? '#1c1917' : 'rgba(0,0,0,0.06)',
                        }}
                      >
                        <span>{tag.name}</span>
                        {isTagActive && <X className="w-3 h-3 ml-0.5 stroke-[2.5]" />}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTag(tag);
                          }}
                          className="opacity-0 group-hover/tag:opacity-100 p-0.5 hover:bg-black/10 rounded-full transition-opacity ml-0.5"
                          title="Edit tag"
                        >
                          <Pencil className="w-2.5 h-2.5 text-stone-700" />
                        </span>
                      </button>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsAddTagOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-stone-600 dark:text-stone-300 bg-stone-200/70 dark:bg-stone-800 hover:bg-stone-300/80 dark:hover:bg-stone-700 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Tag</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Settings & Sign Out */}
        <div className="p-3 sm:p-4 border-t border-stone-200/70 dark:border-stone-800/80 bg-stone-100/50 dark:bg-stone-900/50 space-y-1">
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-stone-500" />
            {!isCollapsed && <span>Settings</span>}
          </button>

          <button
            type="button"
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 text-stone-500 hover:text-red-600" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Modals */}
      <AddListModal isOpen={isAddListOpen} onClose={() => setIsAddListOpen(false)} />
      <AddTagModal isOpen={isAddTagOpen} onClose={() => setIsAddTagOpen(false)} />
      <EditListModal isOpen={Boolean(editingList)} list={editingList} onClose={() => setEditingList(null)} />
      <EditTagModal isOpen={Boolean(editingTag)} tag={editingTag} onClose={() => setEditingTag(null)} />
    </>
  );
};
