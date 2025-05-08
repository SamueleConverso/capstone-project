const initialState = {
  commentLiked: false,
  commentUnLiked: false,
};

const commentLikeReducer = (state = initialState, action) => {
  switch (action.type) {
    case "COMMENT_LIKED":
      return {
        ...state,
        commentLiked: action.payload,
      };
    case "COMMENT_UNLIKED":
      return {
        ...state,
        commentUnLiked: action.payload,
      };
    default:
      return state;
  }
};

export default commentLikeReducer;
