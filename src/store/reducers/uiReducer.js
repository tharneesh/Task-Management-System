import { 
  OPEN_TASK_FORM,
  CLOSE_TASK_FORM,
  SET_FORM_MODE,
  SET_FILTERS,
  CLEAR_FILTERS,
  SET_SEARCH,
  SET_LOADING,
  SET_ERROR,
  CLEAR_ERROR
} from '../actions/uiActions';

const initialState = {
  taskForm: {
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    taskId: null
  },
  filters: {
    projectId: null,
    assigneeId: null,
    status: 'all',
    taskType: 'all',
    search: ''
  },
  loading: {
    tasks: false,
    users: false,
    projects: false
  },
  errors: {
    tasks: null,
    users: null,
    projects: null,
    form: null
  }
};

const uiReducer = (state = initialState, action) => {
  switch (action.type) {
    case OPEN_TASK_FORM:
      return {
        ...state,
        taskForm: {
          isOpen: true,
          mode: action.payload.mode || 'create',
          taskId: action.payload.taskId || null
        }
      };

    case CLOSE_TASK_FORM:
      return {
        ...state,
        taskForm: {
          isOpen: false,
          mode: 'create',
          taskId: null
        },
        errors: {
          ...state.errors,
          form: null
        }
      };

    case SET_FORM_MODE:
      return {
        ...state,
        taskForm: {
          ...state.taskForm,
          mode: action.payload
        }
      };

    case SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };

    case CLEAR_FILTERS:
      return {
        ...state,
        filters: {
          projectId: null,
          assigneeId: null,
          status: 'all',
          taskType: 'all',
          search: ''
        }
      };

    case SET_SEARCH:
      return {
        ...state,
        filters: {
          ...state.filters,
          search: action.payload
        }
      };

    case SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      };

    case SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value
        }
      };

    case CLEAR_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload]: null
        }
      };

    default:
      return state;
  }
};

export default uiReducer;
