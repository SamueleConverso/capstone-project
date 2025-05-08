export const getVideogames = () => {
  return async (dispatch) => {
    try {
      const response = await fetch("https://localhost:7105/api/Videogame", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        dispatch({
          type: "GET_VIDEOGAMES",
          payload: data.videogames,
        });
      } else {
        throw new Error("Errore nella response di getVideogames");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};

export const getVideogame = (videogameId) => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        "https://localhost:7105/api/Videogame/" + videogameId,
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
          type: "GET_VIDEOGAME",
          payload: data.videogame,
        });
        return Promise.resolve(data.videogame);
      } else {
        throw new Error("Errore nella response di getVideogame");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
      return Promise.reject(error);
    }
  };
};

export const createVideogame = (form) => {
  return async (dispatch) => {
    try {
      const response = await fetch("https://localhost:7105/api/Videogame", {
        method: "POST",
        body: form,
      });
      console.log("response", response);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        dispatch(getVideogames());
      } else {
        throw new Error("Errore nella response di createVideogame");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};

export const removeVideogame = (videogameId, navigate) => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        "https://localhost:7105/api/Videogame/" + videogameId,
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
        dispatch(getVideogames());
        navigate("/videogames");
      } else {
        throw new Error("Errore nella response di removeVideogame");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};
