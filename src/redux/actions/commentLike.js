import { getPosts } from "./post";

export const addCommentLike = (applicationUserId, commentId) => {
  return async (dispatch) => {
    try {
      const response = await fetch("https://localhost:7105/api/CommentLike", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationUserId: applicationUserId,
          commentId: commentId,
        }),
      });
      console.log("response", response);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        dispatch(getPosts());
        dispatch({
          type: "COMMENT_LIKED",
          payload: true,
        });
        dispatch({
          type: "COMMENT_UNLIKED",
          payload: false,
        });
      } else {
        dispatch({
          type: "COMMENT_LIKED",
          payload: false,
        });
        dispatch({
          type: "COMMENT_UNLIKED",
          payload: false,
        });
        throw new Error("Errore nella response di addCommentLike");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};

export const removeCommentLike = (commentLikeId) => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        "https://localhost:7105/api/CommentLike/" + commentLikeId,
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
        dispatch({
          type: "COMMENT_LIKED",
          payload: false,
        });
        dispatch({
          type: "COMMENT_UNLIKED",
          payload: true,
        });
      } else {
        dispatch({
          type: "COMMENT_LIKED",
          payload: false,
        });
        dispatch({
          type: "COMMENT_UNLIKED",
          payload: false,
        });
        throw new Error("Errore nella response di removeCommentLike");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};
