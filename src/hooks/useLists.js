import { useTaskContext } from '../context/TaskContext';

export const useLists = () => {
  const { lists, activeListId, setActiveListId, addList, updateList, deleteList, taskCounts } = useTaskContext();

  return {
    lists,
    activeListId,
    setActiveListId,
    addList,
    updateList,
    deleteList,
    taskCounts: taskCounts?.lists || {},
  };
};
