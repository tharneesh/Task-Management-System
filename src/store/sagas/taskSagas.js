import { call, put, takeEvery, takeLatest, all, delay, select } from 'redux-saga/effects';
import { mockApi } from '../../api/mockApi';
import { 
  FETCH_TASKS_REQUEST,
  FETCH_TASKS_SUCCESS,
  FETCH_TASKS_FAILURE,
  CREATE_TASK_REQUEST,
  CREATE_TASK_SUCCESS,
  CREATE_TASK_FAILURE,
  CREATE_TASK_OPTIMISTIC,
  UPDATE_TASK_REQUEST,
  UPDATE_TASK_SUCCESS,
  UPDATE_TASK_FAILURE,
  UPDATE_TASK_OPTIMISTIC,
  DELETE_TASK_REQUEST,
  DELETE_TASK_SUCCESS,
  DELETE_TASK_FAILURE,
  DELETE_TASK_OPTIMISTIC
} from '../actions/taskActions';
import { 
  FETCH_USERS_REQUEST,
  fetchUsersSuccess,
  fetchUsersFailure 
} from '../actions/userActions';
import { 
  FETCH_PROJECTS_REQUEST,
  fetchProjectsSuccess,
  fetchProjectsFailure 
} from '../actions/projectActions';
import { setLoading, setError, clearError } from '../actions/uiActions';

// Helper function to retry API calls
function* retryApiCall(apiCall, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return yield call(apiCall);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      yield delay(1000 * (i + 1)); // Exponential backoff
    }
  }
}

// Fetch tasks saga
function* fetchTasksSaga(action) {
  try {
    yield put(setLoading('tasks', true));
    yield put(clearError('tasks'));
    
    const response = yield call(retryApiCall, () => mockApi.fetchTasks(action.payload));
    
    if (response.success) {
      yield put({ type: FETCH_TASKS_SUCCESS, payload: response.data });
    } else {
      throw new Error('Failed to fetch tasks');
    }
  } catch (error) {
    yield put({ type: FETCH_TASKS_FAILURE, payload: error.message });
    yield put(setError('tasks', error.message));
  } finally {
    yield put(setLoading('tasks', false));
  }
}

// Create task saga with optimistic updates
// Create task saga with optimistic updates
// Create task saga with optimistic updates
function* createTaskSaga(action) {
    // make a stable tempId and temp key
    const tempId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const tempKey = `temp_${tempId}`;
  
    const taskData = action.payload; // your form fields
    const optimisticTask = {
      ...taskData,
      id: tempKey,
      _optimistic: true,
      _saving: true,
      tempId
    };
  
    try {
      // 1) optimistic insert
      yield put({ type: CREATE_TASK_OPTIMISTIC, payload: optimisticTask });
  
      // 2) call API (do NOT send temp fields)
      const response = yield call(retryApiCall, () => mockApi.createTask(taskData));
  
      if (response.success) {
        // 3) IMPORTANT: pass tempId back so reducer can replace temp_<tempId>
        yield put({ type: CREATE_TASK_SUCCESS, payload: { task: response.data, tempId } });
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      // 4) IMPORTANT: use tempId so reducer can remove the optimistic card
      yield put({ type: CREATE_TASK_FAILURE, payload: { tempId, error: error.message } });
      yield put(setError('form', error.message));
    }
  } 
  

// Update task saga with optimistic updates
function* updateTaskSaga(action) {
  const { taskId, updates } = action.payload;
  
  try {
    // Get current task state for rollback
    const state = yield select();
    const currentTask = state.entities.tasks.byId[taskId];
    
    if (!currentTask) {
      throw new Error('Task not found');
    }
    
    // Optimistic update
    yield put({ type: UPDATE_TASK_OPTIMISTIC, payload: { id: taskId, updates, originalTask: currentTask } });
    
    // API call
    const response = yield call(retryApiCall, () => mockApi.updateTask(taskId, updates));
    
    if (response.success) {
      yield put({ type: UPDATE_TASK_SUCCESS, payload: response.data });
    } else {
      throw new Error('Failed to update task');
    }
  } catch (error) {
    yield put({ type: UPDATE_TASK_FAILURE, payload: { id: taskId, originalTask: currentTask, error: error.message } });
    yield put(setError('form', error.message));
  }
}

// Delete task saga with optimistic updates
function* deleteTaskSaga(action) {
  const taskId = action.payload;
  
  try {
    // Get current task state for rollback
    const state = yield select();
    const currentTask = state.entities.tasks.byId[taskId];
    
    if (!currentTask) {
      throw new Error('Task not found');
    }
    
    // Optimistic update
    yield put({ type: DELETE_TASK_OPTIMISTIC, payload: taskId });
    
    // API call
    const response = yield call(retryApiCall, () => mockApi.deleteTask(taskId));
    
    if (response.success) {
      yield put({ type: DELETE_TASK_SUCCESS, payload: taskId });
    } else {
      throw new Error('Failed to delete task');
    }
  } catch (error) {
    yield put({ type: DELETE_TASK_FAILURE, payload: { id: taskId, task: currentTask, error: error.message } });
    yield put(setError('tasks', error.message));
  }
}

// Fetch users saga
function* fetchUsersSaga() {
  try {
    yield put(setLoading('users', true));
    yield put(clearError('users'));
    
    const response = yield call(retryApiCall, () => mockApi.fetchUsers());
    
    if (response.success) {
      yield put(fetchUsersSuccess(response.data));
    } else {
      throw new Error('Failed to fetch users');
    }
  } catch (error) {
    yield put(fetchUsersFailure(error.message));
    yield put(setError('users', error.message));
  } finally {
    yield put(setLoading('users', false));
  }
}

// Fetch projects saga
function* fetchProjectsSaga() {
  try {
    yield put(setLoading('projects', true));
    yield put(clearError('projects'));
    
    const response = yield call(retryApiCall, () => mockApi.fetchProjects());
    
    if (response.success) {
      yield put(fetchProjectsSuccess(response.data));
    } else {
      throw new Error('Failed to fetch projects');
    }
  } catch (error) {
    yield put(fetchProjectsFailure(error.message));
    yield put(setError('projects', error.message));
  } finally {
    yield put(setLoading('projects', false));
  }
}

// Watcher sagas
export function* watchFetchTasks() {
  yield takeLatest(FETCH_TASKS_REQUEST, fetchTasksSaga);
}

export function* watchCreateTask() {
  yield takeLatest(CREATE_TASK_REQUEST, createTaskSaga);
}


export function* watchUpdateTask() {
  yield takeEvery(UPDATE_TASK_REQUEST, updateTaskSaga);
}

export function* watchDeleteTask() {
  yield takeEvery(DELETE_TASK_REQUEST, deleteTaskSaga);
}

export function* watchFetchUsers() {
  yield takeLatest(FETCH_USERS_REQUEST, fetchUsersSaga);
}

export function* watchFetchProjects() {
  yield takeLatest(FETCH_PROJECTS_REQUEST, fetchProjectsSaga);
}

// Root saga
export default function* rootSaga() {
  yield all([
    watchFetchTasks(),
    watchCreateTask(),
    watchUpdateTask(),
    watchDeleteTask(),
    watchFetchUsers(),
    watchFetchProjects()
  ]);
}