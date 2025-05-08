const initialState = {
  communities: [],
  community: {},
  createdCommunity: null,
  isCreationSuccessful: false,
  updatedCommunity: null,
  isUpdateSuccessful: false,
};

const communityReducer = (state = initialState, action) => {
  switch (action.type) {
    case "GET_COMMUNITIES":
      return {
        ...state,
        communities: action.payload,
      };
    case "GET_COMMUNITY_BY_ID":
      return {
        ...state,
        community: action.payload,
      };
    case "CREATE_COMMUNITY_SUCCESS":
      return {
        ...state,
        createdCommunity: action.payload,
        isCreationSuccessful: true,
      };
    case "UPDATE_COMMUNITY_SUCCESS":
      return {
        ...state,
        updatedCommunity: action.payload,
        isUpdateSuccessful: true,
      };
    case "RESET_COMMUNITY_CREATION":
      return {
        ...state,
        createdCommunity: null,
        isCreationSuccessful: false,
      };
    case "RESET_COMMUNITY_UPDATE":
      return {
        ...state,
        updatedCommunity: null,
        isUpdateSuccessful: false,
      };
    default:
      return state;
  }
};

export default communityReducer;
