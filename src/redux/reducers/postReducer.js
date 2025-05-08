const initialState = {
  posts: [],
  post: {},
};

const postReducer = (state = initialState, action) => {
  switch (action.type) {
    case "GET_POSTS":
      return {
        ...state,
        posts: action.payload,
      };
    case "GET_POST_BY_ID":
      return {
        ...state,
        post: action.payload,
      };
    default:
      return state;
  }
};

export default postReducer;
