import React from 'react';
import TaskCard from './TaskCard';

const TaskList = ({ 
  tasks = [], 
  loading = false, 
  onEditTask, 
  onDeleteTask 
}) => {
  // Local state for sort field
  const [sortField, setSortField] = React.useState('createdAt');

  // Priority ranking for proper comparison
  const priorityRank = { Critical: 4, High: 3, Medium: 2, Low: 1 };

  // Derived sorted tasks
  const sortedTasks = React.useMemo(() => {
    const sorted = [...tasks];
    sorted.sort((a, b) => {
      switch (sortField) {
        case 'createdAt': {
          const ad = new Date(a.createdAt || 0);
          const bd = new Date(b.createdAt || 0);
          return ad - bd;
        }
        case 'dueDate': {
          const ad = new Date(a.dueDate || 0);
          const bd = new Date(b.dueDate || 0);
          return ad - bd;
        }
        case 'priority': {
          const ap = priorityRank[a.priority] || 0;
          const bp = priorityRank[b.priority] || 0;
          return bp - ap; // Critical → Low
        }
        case 'title': {
          return (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' });
        }
        default:
          return 0;
      }
    });
    return sorted;
  }, [tasks, sortField]);

  if (loading) {
    return (
      <div className="task-list-loading">
        <div className="loading-spinner">Loading tasks...</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <h3>No tasks found</h3>
        <p>Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>Tasks ({sortedTasks.length})</h2>
        <div className="sort-options">
          <label>Sort by:&nbsp;</label>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="createdAt">Created Date</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      <div className="task-grid">
        {sortedTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={() => onEditTask(task.id)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;