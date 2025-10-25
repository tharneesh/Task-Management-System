export const FETCH_PROJECTS_REQUEST = 'FETCH_PROJECTS_REQUEST';
export const FETCH_PROJECTS_SUCCESS = 'FETCH_PROJECTS_SUCCESS';
export const FETCH_PROJECTS_FAILURE = 'FETCH_PROJECTS_FAILURE';

export const fetchProjectsRequest = () => ({
  type: FETCH_PROJECTS_REQUEST
});

export const fetchProjectsSuccess = (projects) => ({
  type: FETCH_PROJECTS_SUCCESS,
  payload: projects
});

export const fetchProjectsFailure = (error) => ({
  type: FETCH_PROJECTS_FAILURE,
  payload: error
});
