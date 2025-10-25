import { 
  FETCH_PROJECTS_REQUEST,
  FETCH_PROJECTS_SUCCESS,
  FETCH_PROJECTS_FAILURE
} from '../actions/projectActions';

const initialState = {
  byId: {},
  allIds: []
};

const projectsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PROJECTS_REQUEST:
      return state;

    case FETCH_PROJECTS_SUCCESS:
      // Normalize the projects data
      const normalizedProjects = action.payload.reduce((acc, project) => {
        acc.byId[project.id] = project;
        acc.allIds.push(project.id);
        return acc;
      }, { byId: {}, allIds: [] });

      return {
        byId: normalizedProjects.byId,
        allIds: normalizedProjects.allIds
      };

    case FETCH_PROJECTS_FAILURE:
      return state;

    default:
      return state;
  }
};

export default projectsReducer;
