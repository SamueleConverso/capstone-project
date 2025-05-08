import React from "react";
import { useEffect, useState } from "react";
import UserProfileView from "./UserProfileView";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getOtherUserById } from "../redux/actions/user";
import { jwtDecode } from "jwt-decode";
import { getUserById } from "../redux/actions/user";

function OtherUserPage() {
  const { applicationUserId } = useParams();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.profile.user);
  const userToView = useSelector((state) => state.profile.userToView);

  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isGetUserByIdSuccess = useSelector(
    (state) => state.profile.getUserById
  );
  const isGetOtherUserByIdSuccess = useSelector(
    (state) => state.profile.getOtherUserById
  );

  useEffect(() => {
    dispatch({ type: "RESET_GET_USER_AND_OTHER_USER_BY_ID" });
    setIsLoading(true);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    dispatch({ type: "RESET_GET_USER_AND_OTHER_USER_BY_ID" });
    const token = localStorage.getItem("jwtToken");
    const decodedToken = jwtDecode(token);
    setUserId(decodedToken.id);
    console.log(
      "OtherUserPage... dispatching getOtherUserById: ",
      applicationUserId
    );
    dispatch(getOtherUserById(applicationUserId));
  }, [applicationUserId, dispatch]);

  useEffect(() => {
    setIsLoading(true);
    dispatch({ type: "RESET_GET_USER_AND_OTHER_USER_BY_ID" });
    if (userId && applicationUserId === userId) return;
    if (userId) {
      console.log("1. OtherUserPage... dispatching getUserById: ", userId);
      dispatch(getUserById(userId));
    }
  }, [userId, dispatch, applicationUserId]);

  useEffect(() => {
    setIsLoading(true);
    dispatch({ type: "RESET_GET_USER_AND_OTHER_USER_BY_ID" });
    if (applicationUserId === userId) {
      const myUserId = applicationUserId;
      console.log("2. OtherUserPage... dispatching getUserById: ", myUserId);
      dispatch(getUserById(myUserId));
    }
  }, [applicationUserId, userId, dispatch]);

  useEffect(() => {
    if (user && userToView) {
      setIsLoading(false);
    }
  }, [user, userToView]);
  return (
    <div>
      {userToView &&
      user &&
      !isLoading &&
      isGetUserByIdSuccess &&
      isGetOtherUserByIdSuccess ? (
        <UserProfileView profileUser={userToView} />
      ) : (
        <div className="text-center text-white">
          <p>LOADING</p>
        </div>
      )}
    </div>
  );
}

export default OtherUserPage;
