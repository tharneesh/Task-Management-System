import { 
  FETCH_USERS_REQUEST,
  FETCH_USERS_SUCCESS,
  FETCH_USERS_FAILURE
} from '../actions/userActions';

const initialState = {
  byId: {},
  allIds: []
};

const usersReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USERS_REQUEST:
      return state;

    case FETCH_USERS_SUCCESS:
      // Normalize the users data
      const normalizedUsers = action.payload.reduce((acc, user) => {
        acc.byId[user.id] = user;
        acc.allIds.push(user.id);
        return acc;
      }, { byId: {}, allIds: [] });

      return {
        byId: normalizedUsers.byId,
        allIds: normalizedUsers.allIds
      };

    case FETCH_USERS_FAILURE:
      return state;

    default:
      return state;
  }
};

export default usersReducer;
