import { combineReducers, configureStore } from "@reduxjs/toolkit";
import profileReducer from "../reducers/profileReducer.js";
import userReducer from "../reducers/userReducer.js";
import videogameReducer from "../reducers/videogameReducer.js";
import postReducer from "../reducers/postReducer.js";
import commentLikeReducer from "../reducers/commentLikeReducer.js";
import communityReducer from "../reducers/communityReducer.js";

const mainReducer = combineReducers({
  profile: profileReducer,
  user: userReducer,
  videogame: videogameReducer,
  post: postReducer,
  commentLike: commentLikeReducer,
  community: communityReducer,
});

const store = configureStore({
  reducer: mainReducer,
});

export default store;
