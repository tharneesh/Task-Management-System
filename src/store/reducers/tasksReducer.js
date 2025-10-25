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

const initialState = {
  byId: {},
  allIds: []
};

const tasksReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TASKS_REQUEST:
      return state; // No state change for request

    case FETCH_TASKS_SUCCESS:
      // Normalize the tasks data
      const normalizedTasks = action.payload.reduce((acc, task) => {
        acc.byId[task.id] = task;
        acc.allIds.push(task.id);
        return acc;
      }, { byId: {}, allIds: [] });

      return {
        byId: normalizedTasks.byId,
        allIds: normalizedTasks.allIds
      };

    case FETCH_TASKS_FAILURE:
      return state; // Keep existing state on failure

      case CREATE_TASK_OPTIMISTIC: {
        // Expect payload: { tempId, ...fields }
        const { tempId, ...fields } = action.payload;
        const tempKey = `temp_${tempId}`;
      
        // Don’t duplicate if somehow present
        if (state.byId[tempKey]) return state;
      
        return {
          byId: {
            ...state.byId,
            [tempKey]: {
              id: tempKey,
              ...fields,
              _optimistic: true,
              _saving: true,
              tempId
            }
          },
          allIds: state.allIds.includes(tempKey)
            ? state.allIds
            : [...state.allIds, tempKey]
        };
      }
      
      case CREATE_TASK_SUCCESS: {
        // Expect payload: { task, tempId }
        const { task, tempId } = action.payload || {};
        const tempKey = tempId ? `temp_${tempId}` : null;
      
        // Start from current state
        let byId = { ...state.byId };
        let allIds = [...state.allIds];
      
        // If we know which optimistic to replace, remove it first
        if (tempKey && byId[tempKey]) {
          delete byId[tempKey];
          allIds = allIds.filter(id => id !== tempKey);
        }
      
        // Upsert the real task
        byId[task.id] = task;
        if (!allIds.includes(task.id)) allIds.push(task.id);
      
        // Optional safety de-dupe by real id (in case it already existed)
        allIds = Array.from(new Set(allIds));
      
        return { byId, allIds };
      }
      
      case CREATE_TASK_FAILURE: {
        // Expect payload: { tempId, error }
        const { tempId } = action.payload || {};
        const tempKey = tempId ? `temp_${tempId}` : null;
      
        if (!tempKey) return state;
      
        const { [tempKey]: _removed, ...rest } = state.byId;
        return {
          byId: rest,
          allIds: state.allIds.filter(id => id !== tempKey)
        };
      }
      

    case UPDATE_TASK_OPTIMISTIC:
      // Update task optimistically
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            ...action.payload.updates
          }
        }
      };

    case UPDATE_TASK_SUCCESS:
      // Confirm the update
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: action.payload
        }
      };

    case UPDATE_TASK_FAILURE:
      // Revert optimistic update
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: action.payload.originalTask
        }
      };

    case DELETE_TASK_OPTIMISTIC:
      // Remove task optimistically
      const { [action.payload]: deleted, ...remainingAfterDelete } = state.byId;
      return {
        byId: remainingAfterDelete,
        allIds: state.allIds.filter(id => id !== action.payload)
      };

    case DELETE_TASK_SUCCESS:
      // Confirm deletion (already removed optimistically)
      return state;

    case DELETE_TASK_FAILURE:
      // Restore deleted task
      return {
        byId: {
          ...state.byId,
          [action.payload.id]: action.payload
        },
        allIds: [...state.allIds, action.payload.id]
      };

    default:
      return state;
  }
};

export default tasksReducer;
