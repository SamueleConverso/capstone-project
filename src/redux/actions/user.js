export const getUserById = (id) => {
  return async (dispatch) => {
    dispatch({ type: "RESET_GET_USER_AND_OTHER_USER_BY_ID" });
    try {
      const response = await fetch(
        "https://localhost:7105/api/ApplicationUser/" + id,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("jwtToken"),
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        dispatch({
          type: "GET_USER_BY_ID",
          payload: data.applicationUser,
        });
        dispatch({
          type: "GET_USER_BY_ID_SUCCESS",
          payload: true,
        });
      } else {
        throw new Error("Errore nella response di getUserById");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};

export const getOtherUserById = (id) => {
  return async (dispatch) => {
    dispatch({ type: "RESET_GET_USER_AND_OTHER_USER_BY_ID" });
    try {
      const response = await fetch(
        "https://localhost:7105/api/ApplicationUser/" + id,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("jwtToken"),
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        dispatch({
          type: "GET_OTHER_USER_BY_ID",
          payload: data.applicationUser,
        });
        dispatch({
          type: "GET_OTHER_USER_BY_ID_SUCCESS",
          payload: true,
        });
      } else {
        throw new Error("Errore nella response di getUserById");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};

export const getAllUsers = () => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        "https://localhost:7105/api/ApplicationUser",
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("jwtToken"),
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        dispatch({
          type: "GET_ALL_USERS",
          payload: data.applicationUsers,
        });
      } else {
        throw new Error("Errore nella response di getAllUsers");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};

export const removeUser = (applicationUserId, navigate) => {
  return async () => {
    try {
      const response = await fetch(
        "https://localhost:7105/api/ApplicationUser/" + applicationUserId,
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
        navigate("/");
      } else {
        throw new Error("Errore nella response di removeUser");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};
