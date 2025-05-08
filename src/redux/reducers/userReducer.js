const initialState = {
  applicationUsers: [],
  allUsers: [],
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case "GET_USER_BY_ID":
    case "GET_OTHER_USER_BY_ID": {
      const u = action.payload;
      return {
        ...state,
        applicationUsers: [
          ...state.applicationUsers.filter(
            (x) => x.applicationUserId !== u.applicationUserId
          ),
          u,
        ],
      };
    }
    case "GET_ALL_USERS": {
      return {
        ...state,
        allUsers: action.payload,
      };
    }
    default:
      return state;
  }
};

export default userReducer;
