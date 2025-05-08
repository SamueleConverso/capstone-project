import React from "react";
import { useEffect, useState } from "react";
import UserProfileView from "./UserProfileView";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getOtherUserById } from "../redux/actions/user";
import { jwtDecode } from "jwt-decode";
import { getUserById } from "../redux/actions/user";
import styled from "styled-components";
import * as Icon from "react-bootstrap-icons";

function OtherUserPage() {
  const { applicationUserId } = useParams();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.profile.user);
  const userToView = useSelector((state) => state.profile.userToView);

  const [loadingProgress, setLoadingProgress] = useState({
    currentUser: false,
    otherUser: false,
  });

  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isGetUserByIdSuccess = useSelector(
    (state) => state.profile.getUserById
  );
  const isGetOtherUserByIdSuccess = useSelector(
    (state) => state.profile.getOtherUserById
  );

  useEffect(() => {
    if (user) {
      setLoadingProgress((prev) => ({ ...prev, currentUser: true }));
    }
  }, [user]);

  useEffect(() => {
    if (userToView) {
      setLoadingProgress((prev) => ({ ...prev, otherUser: true }));
    }
  }, [userToView]);

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
        <LoadingContainer>
          <div className="loading-content">
            <div className="spinner"></div>
            <h3>Caricamento profilo utente...</h3>
            <div className="loading-progress">
              <div
                className={`progress-item ${
                  loadingProgress.currentUser ? "completed" : ""
                }`}
              >
                <span className="progress-label">Profilo personale</span>
                {loadingProgress.currentUser ? (
                  <Icon.CheckCircleFill className="check-icon" />
                ) : (
                  <Icon.HourglassSplit className="loading-icon" />
                )}
              </div>
              <div
                className={`progress-item ${
                  loadingProgress.otherUser ? "completed" : ""
                }`}
              >
                <span className="progress-label">Profilo utente</span>
                {loadingProgress.otherUser ? (
                  <Icon.CheckCircleFill className="check-icon" />
                ) : (
                  <Icon.HourglassSplit className="loading-icon" />
                )}
              </div>
            </div>
          </div>
        </LoadingContainer>
      )}
    </div>
  );
}

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;

  .loading-content {
    text-align: center;
    background: linear-gradient(
      145deg,
      rgba(26, 26, 46, 0.9),
      rgba(22, 22, 42, 0.9)
    );
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.05);
    max-width: 400px;
    width: 100%;

    h3 {
      color: white;
      font-weight: 500;
      margin: 15px 0 20px;
    }

    .spinner {
      width: 60px;
      height: 60px;
      border: 3px solid rgba(0, 162, 174, 0.2);
      border-right: 3px solid #7e188d;
      border-bottom: 3px solid #00a2ae;
      border-radius: 50%;
      animation: spin 1.2s linear infinite;
      margin: 0 auto;
    }

    .loading-progress {
      margin-top: 25px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      padding: 15px;
    }

    .progress-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 15px;
      background: rgba(30, 30, 50, 0.5);
      border-radius: 8px;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.05);

      &.completed {
        background: rgba(0, 162, 174, 0.2);
        border-color: rgba(0, 162, 174, 0.3);
      }

      .progress-label {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.8);
      }

      .check-icon {
        color: #4caf50;
        animation: fadeIn 0.5s ease;
      }

      .loading-icon {
        color: rgba(255, 255, 255, 0.5);
        animation: pulse 1.5s infinite ease-in-out;
      }
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes pulse {
      0% {
        opacity: 0.5;
        transform: scale(1);
      }
      50% {
        opacity: 1;
        transform: scale(1.1);
      }
      100% {
        opacity: 0.5;
        transform: scale(1);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  }
`;

export default OtherUserPage;
