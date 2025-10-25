import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import FilterBar from './FilterBar';

import { 
  getFilteredTasks,
  getTaskFormState,
  getAllUsers,
  getAllProjects,
  getFilters,
  getLoading,
  getErrors
} from '../store/selectors';

import {
  fetchTasksRequest,
  createTaskRequest,
  updateTaskRequest,
  deleteTaskRequest
} from '../store/actions/taskActions';

import {
  fetchUsersRequest
} from '../store/actions/userActions';

import {
  fetchProjectsRequest
} from '../store/actions/projectActions';

import {
  openTaskForm,
  closeTaskForm,
  setFilters
} from '../store/actions/uiActions';

const TaskDashboard = () => {
  const dispatch = useDispatch();

  // Connect to Redux state
  const tasks = useSelector(getFilteredTasks);
  const taskForm = useSelector(getTaskFormState);
  const users = useSelector(getAllUsers);
  const projects = useSelector(getAllProjects);
  const filters = useSelector(getFilters);
  const loading = useSelector(getLoading);
  const errors = useSelector(getErrors);

  // Fetch initial data on component mount
  React.useEffect(() => {
    dispatch(fetchUsersRequest());
    dispatch(fetchProjectsRequest());
  }, [dispatch]);

  // Fetch tasks when filters change (including initial load)
  React.useEffect(() => {
    dispatch(fetchTasksRequest(filters));
  }, [dispatch, filters.projectId, filters.assigneeId, filters.status, filters.taskType, filters.search]);

  // Event handlers
  const handleCreateTask = () => {
    dispatch(openTaskForm('create'));
  };

  const handleEditTask = (taskId) => {
    dispatch(openTaskForm('edit', taskId));
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTaskRequest(taskId));
    }
  };

  const handleFormSubmit = React.useCallback((formData) => {
    
    if (taskForm.mode === 'create') {
      dispatch(createTaskRequest(formData));
    } else {
      dispatch(updateTaskRequest(taskForm.taskId, formData));
    }
    dispatch(closeTaskForm());
  }, [dispatch, taskForm.mode, taskForm.taskId, loading.tasks]);

  const handleFormClose = () => {
    dispatch(closeTaskForm());
    localStorage.removeItem('taskFormData');
  };

  const handleFiltersChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  return (
    <div className="task-dashboard">
      <header className="dashboard-header">
        <h1>Task Management Dashboard</h1>
        <button 
          className="create-task-btn"
          onClick={handleCreateTask}
        >
          + Create Task
        </button>
      </header>

      {/* Show error messages */}
      {errors.tasks && (
        <div className="error-banner">
          Error: {errors.tasks}
        </div>
      )}

      <FilterBar
        filters={filters}
        projects={projects}
        users={users}
        onFiltersChange={handleFiltersChange}
      />

      <TaskList
        tasks={tasks}
        loading={loading.tasks}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />

      <TaskForm
        isOpen={taskForm.isOpen}
        mode={taskForm.mode}
        initialData={taskForm.taskId ? tasks.find(t => t.id === taskForm.taskId) : null}
        users={users}
        projects={projects}
        loading={loading.tasks}
        onSubmit={handleFormSubmit}
        onClose={handleFormClose}
      />
    </div>
  );
};

export default TaskDashboard;