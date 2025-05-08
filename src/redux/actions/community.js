export const createCommunity = (form) => {
  return async (dispatch) => {
    try {
      const response = await fetch("https://localhost:7105/api/Community", {
        method: "POST",
        body: form,
      });
      console.log("response", response);
      if (response.ok) {
        const data = await response.json();
        console.log("Community creata:", data);

        dispatch({
          type: "CREATE_COMMUNITY_SUCCESS",
          payload: {},
        });

        dispatch(getCommunities());
        return data;
      } else {
        throw new Error("Errore nella response di createCommunity");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};

export const resetCommunityCreation = () => {
  return {
    type: "RESET_COMMUNITY_CREATION",
  };
};

export const getCommunities = () => {
  return async (dispatch) => {
    try {
      const response = await fetch("https://localhost:7105/api/Community", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        dispatch({
          type: "GET_COMMUNITIES",
          payload: data.communities,
        });
        return { payload: data.communities };
      } else {
        throw new Error("Errore nella response di getCommunities");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};

export const getCommunityById = (communityId) => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        "https://localhost:7105/api/Community/" + communityId,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        dispatch({
          type: "GET_COMMUNITY_BY_ID",
          payload: data.community,
        });
      } else {
        throw new Error("Errore nella response di getCommunityById");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};

export const removeCommunity = (communityId) => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        "https://localhost:7105/api/Community/" + communityId,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("response", response);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        dispatch(getCommunities());
      } else {
        throw new Error("Errore nella response di removeCommunity");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};

export const updateCommunity = (communityId, form) => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        "https://localhost:7105/api/Community/" + communityId,
        {
          method: "PUT",
          body: form,
        }
      );
      console.log("response", response);
      if (response.ok) {
        const data = await response.json();
        console.log("Community modificata:", data);

        dispatch({
          type: "UPDATE_COMMUNITY_SUCCESS",
          payload: {},
        });

        dispatch(getCommunityById(communityId));
        return data;
      } else {
        throw new Error("Errore nella response di updateCommunity");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};

export const resetCommunityUpdate = () => {
  return {
    type: "RESET_COMMUNITY_UPDATE",
  };
};
