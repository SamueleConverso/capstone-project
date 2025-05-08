export const createPost = (form) => {
  return async (dispatch) => {
    try {
      const response = await fetch("https://localhost:7105/api/Post", {
        method: "POST",
        body: form,
      });
      console.log("response", response);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        dispatch(getPosts());
      } else {
        throw new Error("Errore nella response di createPost");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};

export const getPosts = () => {
  return async (dispatch) => {
    try {
      const response = await fetch("https://localhost:7105/api/Post", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        dispatch({
          type: "GET_POSTS",
          payload: data.posts,
        });
      } else {
        throw new Error("Errore nella response di getPosts");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};

export const removePost = (postId) => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        "https://localhost:7105/api/Post/" + postId,
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
        dispatch(getPosts());
      } else {
        throw new Error("Errore nella response di removePost");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};

export const getPostById = (postId) => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        "https://localhost:7105/api/Post/" + postId,
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
          type: "GET_POST_BY_ID",
          payload: data.post,
        });
      } else {
        throw new Error("Errore nella response di getPostById");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};
