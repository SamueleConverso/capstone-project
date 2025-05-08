import UserCard from "./UserCard";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useSelector, useDispatch } from "react-redux";
import CoolLoader from "./CoolLoader";
import { getUserById } from "../redux/actions/user.js";
import { useNavigate } from "react-router-dom";
import FriendList from "./FriendList.jsx";
import FriendListToAccept from "./FriendListToAccept.jsx";

function UserPage() {
  //const loginSuccess = useSelector((state) => state.profile.loginSuccess);
  const logout = useSelector((state) => state.profile.logout);
  const user = useSelector((state) => state.profile.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  //const [decodedToken, setDecodedToken] = useState("");

  const hasPendingFriendships = () => {
    if (
      !user ||
      !user.applicationUserFriends ||
      !Array.isArray(user.applicationUserFriends)
    ) {
      return false;
    }

    return user.applicationUserFriends.some(
      (friendship) =>
        friendship.accepted === null || friendship.accepted === false
    );
  };

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token !== null) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          localStorage.removeItem("jwtToken");
          setIsAuthorized(false);
        } else {
          setUserId(decoded.id);
        }
      } catch {
        localStorage.removeItem("jwtToken");
        setIsAuthorized(false);
      }
    } else {
      setIsAuthorized(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      dispatch(getUserById(userId));
    }
  }, [userId]);

  useEffect(() => {
    if (user) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [user]);

  useEffect(() => {
    if (logout) {
      localStorage.removeItem("jwtToken");
      setIsAuthorized(false);
      navigate("/");
      dispatch({ type: "LOGOUT", payload: false });
    }
  }, [logout]);

  return (
    <div>
      {isAuthorized === true && user ? (
        <>
          <div className="d-flex justify-content-center">
            <UserCard user={user} />
          </div>
          <div className="d-flex justify-content-center mb-3">
            <FriendList user={user} />
          </div>
          {hasPendingFriendships() ? (
            <div className="d-flex justify-content-center">
              <FriendListToAccept user={user} />
            </div>
          ) : (
            <></>
          )}
        </>
      ) : (
        <div className="d-flex justify-content-center">
          <CoolLoader />
        </div>
      )}
    </div>
  );
}

export default UserPage;
