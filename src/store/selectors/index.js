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
    let filtered = tasks.slice();

    // NOTE: Do NOT append optimistic creates here; reducer already inserted them.
    // Remove optimistic deletes if present
    if (optimistic?.pendingDeletes?.length) {
      const toDelete = new Set(optimistic.pendingDeletes);
      filtered = filtered.filter(t => !toDelete.has(t.id));
    }

    // ---- Existing filters (unchanged) ----
    if (filters.projectId) {
      filtered = filtered.filter(task => task.projectId === filters.projectId);
    }
    if (filters.assigneeId) {
      filtered = filtered.filter(task => task.assigneeId === filters.assigneeId);
    }
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }
    if (filters.taskType && filters.taskType !== 'all') {
      filtered = filtered.filter(task => task.taskType === filters.taskType);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        (task.title && task.title.toLowerCase().includes(q)) ||
        (task.description && task.description.toLowerCase().includes(q))
      );
    }

    // ---- Sorting (only if filters already provide sortBy/sortDir) ----
    const sortBy = filters?.sortBy || null;   // e.g., 'dueDate' | 'priority' | 'status' | 'title' | 'createdAt' ...
    const sortDir = (filters?.sortDir || 'asc');
    const dir = sortDir === 'desc' ? -1 : 1;

    if (sortBy) {
      const priorityRank = { High: 3, Medium: 2, Low: 1 };
      const statusRank   = { Todo: 1, 'In Progress': 2, Done: 3 };

      const getVal = (t) => {
        switch (sortBy) {
          case 'priority':   return priorityRank[t.priority] ?? 0;
          case 'status':     return statusRank[t.status] ?? 0;
          case 'dueDate':    return t.dueDate ? new Date(t.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          case 'createdAt':  return t.createdAt ? new Date(t.createdAt).getTime() : 0;
          case 'title':      return (t.title || '').toLowerCase();
          default:           return (t[sortBy] ?? '').toString().toLowerCase();
        }
      };

      filtered = filtered.slice().sort((a, b) => {
        const av = getVal(a), bv = getVal(b);

        if (typeof av === 'number' && typeof bv === 'number') {
          if (av === bv) return String(a.id).localeCompare(String(b.id));
          return (av - bv) * dir;
        }
        const as = String(av), bs = String(bv);
        const cmp = as.localeCompare(bs, undefined, { numeric: true, sensitivity: 'base' });
        if (cmp === 0) return String(a.id).localeCompare(String(b.id)); // stable tie-break
        return cmp * dir;
      });
    }

    // Safety de-dupe by id
    const seen = new Set();
    return filtered.filter(t => (seen.has(t.id) ? false : (seen.add(t.id), true)));
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
