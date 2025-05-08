import { getPosts } from "./post";

export const createComment = (form) => {
  return async (dispatch) => {
    try {
      const response = await fetch("https://localhost:7105/api/Comment", {
        method: "POST",
        body: form,
      });
      console.log("response", response);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        dispatch(getPosts());
      } else {
        throw new Error("Errore nella response di createComment");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};

export const removeComment = (commentId) => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        "https://localhost:7105/api/Comment/" + commentId,
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
        throw new Error("Errore nella response di removeComment");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};
