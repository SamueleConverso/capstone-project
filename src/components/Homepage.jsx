import Aurora from "./Aurora";
import GradientText from "./GradientText";
import GradientCard from "./GradientCard";
import Orb from "./Orb";
import GradientButton from "./GradientButton";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function Homepage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showButtons, setShowButtons] = useState(true);

  const loginSuccess = useSelector((state) => state.profile.loginSuccess);
  const logout = useSelector((state) => state.profile.logout);

  const handleRegister = () => {
    navigate("/register");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const updateComponents = () => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      dispatch({ type: "TOGGLE_NAVBAR", payload: true });
      dispatch({ type: "TOGGLE_AURORA", payload: false });
      setShowButtons(false);
    } else {
      dispatch({ type: "TOGGLE_NAVBAR", payload: false });
      dispatch({ type: "TOGGLE_AURORA", payload: true });
      setShowButtons(true);
    }
  };

  useEffect(() => {
    updateComponents();
  }, []);

  useEffect(() => {
    updateComponents();
  }, [loginSuccess, logout]);
  return (
    <>
      <div className="d-flex justify-content-center">
        <img
          style={{ width: "300px" }}
          src="../../public/assets/img/GameVerseLogo.png"
        />
      </div>

      <div className="d-flex justify-content-center">
        <GradientCard></GradientCard>
      </div>
      {showButtons && (
        <div className="d-flex justify-content-center my-5 gap-5">
          <GradientButton text="REGISTRATI" onClick={handleRegister} />
          <GradientButton text="LOGIN" onClick={handleLogin} />
        </div>
      )}
    </>
  );
}

export default Homepage;
