import { getPosts } from "./post";

export const addPostLike = (applicationUserId, postId) => {
  return async (dispatch) => {
    try {
      const response = await fetch("https://localhost:7105/api/PostLike", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationUserId: applicationUserId,
          postId: postId,
        }),
      });
      console.log("response", response);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        dispatch(getPosts());
      } else {
        throw new Error("Errore nella response di addPostLike");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};

export const removePostLike = (postLikeId) => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        "https://localhost:7105/api/PostLike/" + postLikeId,
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
        throw new Error("Errore nella response di removePostLike");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};
