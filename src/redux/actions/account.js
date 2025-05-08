import { jwtDecode } from "jwt-decode";

export const register = (form, navigate) => {
  return async () => {
    try {
      const response = await fetch(
        "https://localhost:7105/api/Account/register",
        {
          method: "POST",
          body: form,
        }
      );
      console.log("response", response);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        navigate("/registration-success");
      } else {
        throw new Error("Errore nella response di register");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};

export const login = (email, password, navigate) => {
  return async (dispatch) => {
    try {
      const response = await fetch("https://localhost:7105/api/Account/login", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        localStorage.setItem("jwtToken", data.token);
        localStorage.getItem("jwtToken");
        const decoded = jwtDecode(data.token);
        const userId = decoded.id;
        console.log("ID decodificato:", userId);
        dispatch({ type: "LOGIN_SUCCESS", payload: true });
        dispatch({ type: "LOGOUT", payload: false });
        console.log("SONO QUI");
        navigate("/other-user/" + userId);
      } else {
        dispatch({ type: "LOGIN_SUCCESS", payload: false });
        dispatch({ type: "LOGOUT", payload: true });
        throw new Error("Errore nella response di login");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};
