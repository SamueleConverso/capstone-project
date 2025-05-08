const initialState = {
  loginSuccess: false,
  logout: false,
  user: null,
  navbar: false,
  aurora: false,
  userToView: null,
  getUserById: false,
  getOtherUserById: false,
};

const profileReducer = (state = initialState, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loginSuccess: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        logout: action.payload,
      };
    case "GET_USER_BY_ID":
      return {
        ...state,
        user: action.payload,
      };
    case "TOGGLE_NAVBAR":
      return {
        ...state,
        navbar: action.payload,
      };
    case "TOGGLE_AURORA":
      return {
        ...state,
        aurora: action.payload,
      };
    case "GET_OTHER_USER_BY_ID":
      return {
        ...state,
        userToView: action.payload,
      };
    case "GET_USER_BY_ID_SUCCESS":
      return {
        ...state,
        getUserById: true,
      };
    case "GET_OTHER_USER_BY_ID_SUCCESS":
      return {
        ...state,
        getOtherUserById: true,
      };
    case "RESET_GET_USER_AND_OTHER_USER_BY_ID":
      return {
        ...state,
        getUserById: false,
        getOtherUserById: false,
      };
    default:
      return state;
  }
};

export default profileReducer;
