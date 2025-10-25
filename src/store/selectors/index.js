import { createSelector } from 'reselect';

// Base selectors
const getEntities = (state) => state.entities;
const getUI = (state) => state.ui;
const getOptimistic = (state) => state.optimistic;

// Entity selectors
export const getTasks = createSelector(
  [getEntities],
  (entities) => entities.tasks
);

export const getUsers = createSelector(
  [getEntities],
  (entities) => entities.users
);

export const getProjects = createSelector(
  [getEntities],
  (entities) => entities.projects
);

// Task selectors
export const getAllTasks = createSelector(
  [getTasks],
  (tasks) => tasks.allIds.map(id => tasks.byId[id])
);

export const getTaskById = createSelector(
  [getTasks, (state, taskId) => taskId],
  (tasks, taskId) => tasks.byId[taskId]
);

// User selectors
export const getAllUsers = createSelector(
  [getUsers],
  (users) => users.allIds.map(id => users.byId[id])
);

export const getUserById = createSelector(
  [getUsers, (state, userId) => userId],
  (users, userId) => users.byId[userId]
);

// Project selectors
export const getAllProjects = createSelector(
  [getProjects],
  (projects) => projects.allIds.map(id => projects.byId[id])
);

export const getProjectById = createSelector(
  [getProjects, (state, projectId) => projectId],
  (projects, projectId) => projects.byId[projectId]
);

// UI selectors
export const getTaskFormState = createSelector(
  [getUI],
  (ui) => ui.taskForm
);

export const getFilters = createSelector(
  [getUI],
  (ui) => ui.filters
);

export const getLoading = createSelector(
  [getUI],
  (ui) => ui.loading
);

export const getErrors = createSelector(
  [getUI],
  (ui) => ui.errors
);

// Complex selectors
export const getFilteredTasks = createSelector(
  [getAllTasks, getFilters, getOptimistic],
  (tasks, filters, optimistic) => {
    // Start from tasks already in state (includes any optimistic inserts from the reducer)
    let filtered = tasks.slice();

    // Remove tasks that are optimistically pending delete
    if (optimistic?.pendingDeletes?.length) {
      const toDelete = new Set(optimistic.pendingDeletes);
      filtered = filtered.filter(t => !toDelete.has(t.id));
    }

    // Apply filters
    if (filters.projectId) {
      filtered = filtered.filter(t => t.projectId === filters.projectId);
    }
    if (filters.assigneeId) {
      filtered = filtered.filter(t => t.assigneeId === filters.assigneeId);
    }
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    if (filters.taskType && filters.taskType !== 'all') {
      filtered = filtered.filter(t => t.taskType === filters.taskType);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Safety: de-dupe by id in case anything slipped through
    const seen = new Set();
    filtered = filtered.filter(t => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });

    return filtered;
  }
);

export const getUsersForProject = createSelector(
  [getAllUsers, (state, projectId) => projectId],
  (users, projectId) => {
    if (!projectId) return users;
    return users.filter(user => user.projectIds && user.projectIds.includes(projectId));
  }
);

export const getTasksWithDetails = createSelector(
  [getFilteredTasks, getAllUsers, getAllProjects],
  (tasks, users, projects) => {
    return tasks.map(task => ({
      ...task,
      assignee: users.find(user => user.id === task.assigneeId),
      project: projects.find(project => project.id === task.projectId)
    }));
  }
);

// Optimistic state selectors
export const getOptimisticState = createSelector(
  [getOptimistic],
  (optimistic) => optimistic
);

export const isTaskPending = createSelector(
  [getOptimistic, (state, taskId) => taskId],
  (optimistic, taskId) => {
    return optimistic.pendingCreates.includes(taskId) ||
           optimistic.pendingUpdates[taskId] ||
           optimistic.pendingDeletes.includes(taskId);
  }
);
