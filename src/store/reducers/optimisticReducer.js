import { 
  CREATE_TASK_OPTIMISTIC,
  CREATE_TASK_SUCCESS,
  CREATE_TASK_FAILURE,
  UPDATE_TASK_OPTIMISTIC,
  UPDATE_TASK_SUCCESS,
  UPDATE_TASK_FAILURE,
  DELETE_TASK_OPTIMISTIC,
  DELETE_TASK_SUCCESS,
  DELETE_TASK_FAILURE
} from '../actions/taskActions';

const initialState = {
  pendingCreates: [],
  pendingUpdates: {},
  pendingDeletes: []
};

const optimisticReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_TASK_OPTIMISTIC: {
      const optimisticId = action.payload?.id;
      if (!optimisticId || state.pendingCreates.includes(optimisticId)) return state;
      return { ...state, pendingCreates: [...state.pendingCreates, optimisticId] };
    }
    case CREATE_TASK_SUCCESS: {
      const tempKey = action.payload?.tempId ? `temp_${action.payload.tempId}` : null;
      if (!tempKey) return state;
      return { ...state, pendingCreates: state.pendingCreates.filter(id => id !== tempKey) };
    }
    case CREATE_TASK_FAILURE: {
      const tempKey = action.payload?.tempId ? `temp_${action.payload.tempId}` : null;
      if (!tempKey) return state;
      return { ...state, pendingCreates: state.pendingCreates.filter(id => id !== tempKey) };
    }

    // ----- UPDATE -----
    case UPDATE_TASK_OPTIMISTIC: {
      const { id, originalTask } = action.payload || {};
      if (!id) return state;
      return { ...state, pendingUpdates: { ...state.pendingUpdates, [id]: originalTask } };
    }
    case UPDATE_TASK_SUCCESS: {
      const doneId = action.payload?.id;
      if (!doneId) return state;
      const { [doneId]: _removed, ...rest } = state.pendingUpdates;
      return { ...state, pendingUpdates: rest };
    }
    case UPDATE_TASK_FAILURE: {
      const failId = action.payload?.id;
      if (!failId) return state;
      const { [failId]: _removed, ...rest } = state.pendingUpdates;
      return { ...state, pendingUpdates: rest };
    }

    // ----- DELETE -----
    case DELETE_TASK_OPTIMISTIC: {
      const taskId = action.payload;
      if (taskId == null || state.pendingDeletes.includes(taskId)) return state;
      return { ...state, pendingDeletes: [...state.pendingDeletes, taskId] };
    }
    case DELETE_TASK_SUCCESS: {
      const taskId = action.payload;
      if (taskId == null) return state;
      return { ...state, pendingDeletes: state.pendingDeletes.filter(id => id !== taskId) };
    }
    case DELETE_TASK_FAILURE: {
      const taskId = action.payload?.id;
      if (taskId == null) return state;
      return { ...state, pendingDeletes: state.pendingDeletes.filter(id => id !== taskId) };
    }

    default:
      return state;
  }
};

export default optimisticReducer;
