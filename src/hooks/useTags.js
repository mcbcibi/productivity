import { useTaskContext } from '../context/TaskContext';

export const useTags = () => {
  const { tags, activeTagId, setActiveTagId, addTag, updateTag, deleteTag, toggleTaskTag } = useTaskContext();

  return {
    tags,
    activeTagId,
    setActiveTagId,
    addTag,
    updateTag,
    deleteTag,
    toggleTaskTag,
  };
};
