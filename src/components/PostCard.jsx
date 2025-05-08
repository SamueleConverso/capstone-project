import React, { useState, useEffect } from "react";
import styled from "styled-components";
import * as Icon from "react-bootstrap-icons";
import CoolInput from "./CoolInput";
import Comment from "./Comment";
import { useDispatch } from "react-redux";
import { createComment } from "../redux/actions/comment.js";
import { jwtDecode } from "jwt-decode";
import { addPostLike } from "../redux/actions/postLike.js";
import { removePostLike } from "../redux/actions/postLike.js";
import { removePost } from "../redux/actions/post.js";
import { addApplicationUserFriend } from "../redux/actions/applicationUserFriend.js";
import { acceptApplicationUserFriend } from "../redux/actions/applicationUserFriend.js";
import { useNavigate } from "react-router-dom";

const PostCard = (props) => {
  const [liked, setLiked] = useState(false);

  const [friendRequestSent, setFriendRequestSent] = useState(false);

  const [showCommentsSection, setShowCommentsSection] = useState(false);
  const [userId, setUserId] = useState("");

  const [text, setText] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = props.user;

  const isUserGamer = () => {
    if (props.post.applicationUser.isGamer) {
      return true;
    } else {
      return false;
    }
  };
  const isUserDeveloper = () => {
    if (props.post.applicationUser.isDeveloper) {
      return true;
    } else {
      return false;
    }
  };

  const checkFriendRequest = () => {
    if (user && user.friendList && user.friendList.applicationUserFriends) {
      const existingRequest = user.friendList.applicationUserFriends.find(
        (friend) =>
          friend.applicationUser?.applicationUserId ===
          props.post.applicationUser.applicationUserId
      );

      if (existingRequest) {
        if (existingRequest.accepted === true) {
          setFriendRequestSent("accepted");
        } else {
          setFriendRequestSent("pending");
        }
        return true;
      }
    }

    if (
      user &&
      user.applicationUserFriends &&
      user.applicationUserFriends.length > 0
    ) {
      const receivedRequest = user.applicationUserFriends.find(
        (friend) =>
          friend.friendList?.applicationUser?.applicationUserId ===
          props.post.applicationUser.applicationUserId
      );

      if (receivedRequest) {
        if (receivedRequest.accepted === true) {
          setFriendRequestSent("accepted");
        } else {
          setFriendRequestSent("received");
        }
        return true;
      }
    }

    setFriendRequestSent(false);
    return false;
  };

  const handleAddFriend = (friendId) => {
    console.log("friendId", friendId);
    console.log("friendListId", user.friendList.friendListId);

    if (checkFriendRequest()) return;

    dispatch(
      addApplicationUserFriend(
        friendId,
        user.friendList.friendListId,
        null,
        userId
      )
    ).then((success) => {
      if (!success) {
        setFriendRequestSent(false);
        console.error("Impossibile inviare la richiesta di amicizia");
      } else {
        setFriendRequestSent("pending");
        console.log("Richiesta di amicizia inviata con successo");
      }
    });
  };

  const handleAcceptFriendRequest = () => {
    const friendRequest = user.applicationUserFriends.find(
      (friend) =>
        friend.friendList?.applicationUser?.applicationUserId ===
        props.post.applicationUser.applicationUserId
    );

    if (friendRequest) {
      const applicationUserFriendId = friendRequest.applicationUserFriendId;
      const userFriendListId = user.friendList.friendListId;
      const friendId = props.post.applicationUser.applicationUserId;
      console.log(applicationUserFriendId);
      console.log(userFriendListId);
      console.log(friendId);
      console.log(userId);
      dispatch(
        acceptApplicationUserFriend(
          applicationUserFriendId,
          true,
          userFriendListId,
          friendId,
          userId,
          null
        )
      );
    } else {
      console.error("Richiesta di amicizia non trovata");
    }
  };

  const showComments = () => {
    setShowCommentsSection(!showCommentsSection);
    props.onInteraction(props.post.postId);
  };

  const handleDeletePost = (postId) => {
    dispatch(removePost(postId));
  };

  const handlePublishComment = (postId) => {
    const formData = new FormData();
    formData.append("text", text);
    formData.append("postId", postId);
    formData.append("applicationUserId", userId);

    dispatch(createComment(formData));

    props.onInteraction(postId);
  };

  const handleAddPostLike = () => {
    const selfPostLike = props.post.postLikes.find(
      (like) => like.applicationUser.applicationUserId === userId
    );
    if (selfPostLike) {
      dispatch(removePostLike(selfPostLike.postLikeId));
    } else {
      dispatch(addPostLike(userId, props.post.postId));
    }
    props.onInteraction(props.post.postId);
  };

  const updatePostLikeIcons = () => {
    if (props.post.postLikes.length > 0) {
      const selfPostLike = props.post.postLikes.find(
        (like) => like.applicationUser.applicationUserId === userId
      );
      if (selfPostLike) {
        setLiked(true);
        return;
      } else {
        setLiked(false);
      }
    } else {
      setLiked(false);
    }
  };

  const handleGoToUserPage = (applicationUserId) => {
    navigate("/other-user/" + applicationUserId);
  };

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    const decodedToken = jwtDecode(token);
    setUserId(decodedToken.id);
    updatePostLikeIcons();
    checkFriendRequest();
  }, []);

  useEffect(() => {
    updatePostLikeIcons();
    checkFriendRequest();
  }, [props.post, user, friendRequestSent]);

  useEffect(() => {
    updatePostLikeIcons();
  }, [userId]);
  return (
    <StyledWrapper showCommentsSection={showCommentsSection}>
      <div className={`postCard ${showCommentsSection ? "with-comments" : ""}`}>
        <div className="postContent">
          <div
            style={{
              backgroundColor: "rgb(255, 255, 240)",
              color: "rgb(54, 69, 79)",
              padding: "8px",
              borderBottom: "3px solid rgb(0, 162, 174)",
            }}
            className="d-flex gap-1"
          >
            <div className="d-flex align-items-center">
              <img
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid transparent",
                  transition:
                    "transform 0.3s, border-color 0.3s, box-shadow 0.3s",
                  cursor: "pointer",
                }}
                src={`https://localhost:7105/${props.post.applicationUser.picture}`}
                onClick={() =>
                  handleGoToUserPage(
                    props.post.applicationUser.applicationUserId
                  )
                }
                className="user-avatar"
              />
            </div>
            <div
              className="d-flex flex-column justify-content-center user-info"
              onClick={() =>
                handleGoToUserPage(props.post.applicationUser.applicationUserId)
              }
            >
              {!props.post.applicationUser.displayName && (
                <p className="user-name">
                  {props.post.applicationUser.firstName}{" "}
                  {props.post.applicationUser.lastName}
                </p>
              )}
              {props.post.applicationUser.displayName && (
                <p className="user-name">
                  {props.post.applicationUser.displayName}
                </p>
              )}
              <div className="d-flex gap-1 user-badges">
                {isUserGamer() && (
                  <div className="user-badge gamer d-flex gap-1">
                    <div>
                      <Icon.Controller />
                    </div>
                    <div>
                      <p>Gamer</p>
                    </div>
                  </div>
                )}
                {isUserDeveloper() && (
                  <div className="user-badge dev d-flex gap-1">
                    <div>
                      <Icon.Code />
                    </div>
                    <div>
                      <p>Developer</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {props.post.applicationUser.applicationUserId !== userId && (
              <div
                onClick={() => {
                  if (friendRequestSent === "received") {
                    handleAcceptFriendRequest();
                  } else if (!friendRequestSent) {
                    handleAddFriend(
                      props.post.applicationUser.applicationUserId
                    );
                  }
                }}
                className="align-self-center d-flex justify-content-center
align-items-center add-friend-button"
                style={{
                  marginLeft: "auto",
                  backgroundColor:
                    friendRequestSent === "accepted"
                      ? "#00A2AE"
                      : friendRequestSent === "pending"
                      ? "#FF9800"
                      : friendRequestSent === "received"
                      ? "#32CD32"
                      : "#7E188D",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  color: "white",
                  cursor:
                    friendRequestSent === "pending" ? "default" : "pointer",
                }}
                title={
                  friendRequestSent === "accepted"
                    ? "Siete amici"
                    : friendRequestSent === "pending"
                    ? "Richiesta di amicizia in attesa"
                    : friendRequestSent === "received"
                    ? "Accetta richiesta di amicizia"
                    : "Aggiungi amico"
                }
              >
                {friendRequestSent === "accepted" ? (
                  <Icon.PersonFillCheck />
                ) : friendRequestSent === "pending" ? (
                  <Icon.HourglassSplit />
                ) : friendRequestSent === "received" ? (
                  <Icon.PersonPlusFill />
                ) : (
                  <Icon.PersonFillAdd />
                )}
              </div>
            )}
            {props.post.applicationUser.applicationUserId === userId && (
              <div
                onClick={() => {
                  handleDeletePost(props.post.postId);
                }}
                className="align-self-center d-flex justify-content-center align-items-center add-friend-button"
                style={{
                  marginLeft: "auto",
                  width: "30px",
                  height: "30px",
                  border: "2px solid red",
                  borderRadius: "50%",
                  color: "red",
                  cursor: "pointer",
                }}
              >
                <Icon.Trash />
              </div>
            )}
          </div>
          <div style={{ padding: "8px" }}>
            {(props.post.isLookingForGamers ||
              props.post.isLookingForDevelopers) && (
              <div className="d-flex justify-content-center gap-2 mt-1 mb-3">
                {props.post.isLookingForGamers && (
                  <div className="looking-for-badge gamer-badge">
                    <span className="d-flex align-items-center gap-1">
                      <Icon.Controller size={12} /> Cerca Gamers
                    </span>
                  </div>
                )}
                {props.post.isLookingForDevelopers && (
                  <div className="looking-for-badge dev-badge">
                    <span className="d-flex align-items-center gap-1">
                      <Icon.Code size={12} /> Cerca Developers
                    </span>
                  </div>
                )}
              </div>
            )}

            {props.post.videogame && (
              <div className="d-flex justify-content-center mb-3">
                <div
                  style={{
                    cursor: "pointer",
                    backgroundColor: "rgba(243, 229, 171, 0.8)",
                    color: "rgb(54, 69, 79)",
                    border: "2px solid #00A2AE",
                    borderRadius: "10px",
                    padding: "8px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                    transition: "all 0.25s ease",
                    position: "relative",
                    overflow: "hidden",
                    animation: "gameCardEntrance 0.5s ease-out",
                  }}
                  className="d-flex gap-2 videogameInPost"
                >
                  <div className="game-glow-effect"></div>
                  {props.post.videogame.picture && (
                    <div className="game-image-container">
                      <img
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid rgba(0, 162, 174, 0.5)",
                          transition: "transform 0.2s ease",
                        }}
                        src={`https://localhost:7105/${props.post.videogame.picture}`}
                        alt={props.post.videogame.title}
                      />
                    </div>
                  )}
                  <div className="d-flex flex-column justify-content-center">
                    <p className="game-title">{props.post.videogame.title}</p>
                    <div className="tech-line"></div>
                  </div>
                </div>
              </div>
            )}
            <div className="mb-2">
              <p>{props.post.text}</p>
            </div>
            {props.post.picture && (
              <div className="d-flex justify-content-center">
                <img
                  style={{ maxWidth: "250px" }}
                  src={`https://localhost:7105/${props.post.picture}`}
                />
              </div>
            )}
            <div className="d-flex justify-content-center my-3">
              <hr
                style={{
                  border: "none",
                  borderRadius: "6px",
                  height: "2px",
                  width: "70%",
                  backgroundColor: "#FFFFF0",
                  opacity: "0.5",
                }}
              />
            </div>
            <div className="d-flex justify-content-around mb-3">
              <div
                onClick={() => {
                  handleAddPostLike();
                }}
                className="align-self-center d-flex justify-content-center align-items-center add-friend-button position-relative"
                style={{
                  backgroundColor: "#7E188D",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                {liked ? <Icon.HeartFill /> : <Icon.Heart />}
                <span className="notification-badge">
                  {props.post.postLikes.length}
                </span>
              </div>
              <div
                onClick={() => {
                  showComments();
                }}
                className="align-self-center d-flex justify-content-center align-items-center add-friend-button position-relative"
                style={{
                  backgroundColor: "#7E188D",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <Icon.ChatDots />
                <span className="notification-badge">
                  {props.post.comments.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showCommentsSection && (
        <div className="commentSection">
          <div className="commentContent">
            <div>
              <p className="text-center my-3">Lascia un commento</p>
              <div className="d-flex justify-content-between">
                <div>
                  <CoolInput
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    text="Commenta..."
                    width={"300px"}
                    height={"100%"}
                  />
                </div>
                <div
                  onClick={() => {
                    if (text !== null && text !== "") {
                      handlePublishComment(props.post.postId);
                    }
                  }}
                  className="me-3 align-self-center d-flex
                  justify-content-center align-items-center add-friend-button"
                  style={{
                    marginLeft: "auto",
                    backgroundColor: "#7E188D",
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  <Icon.PencilSquare />
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-center my-3">
              <hr
                style={{
                  border: "none",
                  borderRadius: "6px",
                  height: "2px",
                  width: "70%",
                  backgroundColor: "#FFFFF0",
                  opacity: "0.5",
                }}
              />
            </div>
            <div className="comments-container">
              {props.post.comments.map((comment) => {
                return (
                  <div key={comment.commentId} className="mb-2">
                    <Comment comment={comment} userId={userId} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .postCard {
    width: 400px;
    //position: relative;
    padding: 3px;
    border-radius: 10px;
    background: linear-gradient(-45deg, #e81cff 0%, #40c9ff 100%);
    transition: border-radius 0.2s ease;

    &.with-comments {
      border-radius: 10px 10px 0 0;
    }
  }

  .postContent {
    background-color: #212121;
    border-radius: 8px;
    // display: flex;
    // flex-direction: column;
    // justify-content: center;
    // gap: 12px;
    color: white;
    overflow: hidden;
    //position: relative;
    ${(props) =>
      props.showCommentsSection &&
      `
        border-radius: 8px 8px 0 0;
      `}
  }

  p {
    margin: 0;
  }

  .videogameInPost {
    transition: all 0.25s ease;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }

  .videogameInPost:hover {
    background-color: rgba(126, 24, 141, 0.9) !important;
    color: white !important;
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0 8px 20px rgba(126, 24, 141, 0.4),
      0 0 15px rgba(0, 162, 174, 0.3) !important;
    border: 2px solid rgba(0, 162, 174, 0.8) !important;
  }

  .videogameInPost:active {
    transform: translateY(1px) scale(0.97);
    box-shadow: 0 3px 10px rgba(126, 24, 141, 0.6) !important;
    border: 2px solid #00a2ae !important;
  }

  .game-image-container {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
  }

  .videogameInPost:hover img {
    transform: scale(1.1);
  }

  .game-title {
    font-weight: 600;
    letter-spacing: 0.5px;
    position: relative;
    transition: all 0.2s ease;
  }

  .videogameInPost:hover .game-title {
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
  }

  .tech-line {
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 162, 174, 0.8),
      transparent
    );
    margin-top: 5px;
    width: 0;
    transition: width 0.3s ease;
  }

  .videogameInPost:hover .tech-line {
    width: 100%;
  }

  .game-glow-effect {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(0, 162, 174, 0.15) 0%,
      transparent 70%
    );
    opacity: 0;
    transform: scale(0.5);
    transition: opacity 0.5s ease, transform 0.5s ease;
    pointer-events: none;
    z-index: -1;
  }

  .videogameInPost:hover .game-glow-effect {
    opacity: 1;
    transform: scale(1);
  }

  @keyframes popIn {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    70% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes gameCardEntrance {
    0% {
      transform: translateY(20px);
      opacity: 0;
      filter: blur(3px);
    }
    50% {
      filter: blur(0);
    }
    70% {
      transform: translateY(-5px);
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .add-friend-button {
    transition: all 0.1s ease;
    //overflow: hidden;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 0 10px rgba(126, 24, 141, 0.7);
      border: 1px solid rgb(0, 162, 174);
    }

    &:active {
      transform: scale(0.8);
      box-shadow: 0 0 15px rgba(126, 24, 141, 0.9);
      border: 1px solid rgb(0, 162, 174);
    }
  }

  .notification-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #00a2ae;
    color: white;
    border-radius: 50%;
    min-width: 18px;
    height: 18px;
    font-size: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 2px;
    font-weight: bold;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
    border: 1px solid white;
  }

  .commentSection {
    width: 400px;
    //position: relative;
    padding: 3px;
    padding-top: 0;
    border-radius: 0 0 10px 10px;
    background: linear-gradient(-45deg, #e81cff 0%, #40c9ff 100%);
  }

  .commentContent {
    background-color: #212121;
    border-radius: 0 0 8px 8px;
    // display: flex;
    // flex-direction: column;
    // justify-content: center;
    // gap: 12px;
    color: white;
    overflow: hidden;
    padding: 8px;
  }

  .comments-container {
    max-height: 350px;
    overflow-y: auto;
    padding-right: 8px;

    &::-webkit-scrollbar {
      width: 8px;
      background-color: #2a2a2a;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(-45deg, #e81cff 0%, #40c9ff 100%);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(-45deg, #d816e6 0%, #32b8f0 100%);
    }

    /* Firefox scrollbar */
    scrollbar-width: thin;
    scrollbar-color: #7e188d #2a2a2a;
  }

  .looking-for-badge {
    padding: 5px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
    animation: popIn 0.3s ease-out;
    transform-origin: center;
    display: inline-flex;
    align-items: center;
    height: 24px;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .gamer-badge {
    background: linear-gradient(45deg, #7e188d, #9920a9);
  }

  .dev-badge {
    background: linear-gradient(45deg, #00a2ae, #00bbd0);
  }

  @keyframes popIn {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    70% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .user-avatar {
    &:hover {
      transform: scale(1.1);
      border-color: #00a2ae;
      box-shadow: 0 0 10px rgba(0, 162, 174, 0.6);
    }
    &:active {
      transform: scale(0.95);
      border-color: #7e188d;
      box-shadow: 0 0 15px rgba(126, 24, 141, 0.7);
    }
  }

  .user-info {
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 8px;
    transition: background-color 0.2s, transform 0.2s;

    &:hover {
      background-color: rgba(0, 162, 174, 0.15);
      transform: translateX(3px);
    }

    &:active {
      background-color: rgba(126, 24, 141, 0.15);
      transform: translateX(5px) scale(0.98);
    }
  }

  .user-name {
    font-weight: 600;
    transition: color 0.2s;
    position: relative;
    display: inline-block;

    &:after {
      content: "";
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #7e188d, #00a2ae);
      transition: width 0.3s ease;
    }

    .user-info:hover & {
      color: #00a2ae;

      &:after {
        width: 100%;
      }
    }
  }

  .user-badges {
    margin-top: 2px;
  }

  .user-badge {
    font-size: 11px;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 10px;
    transition: all 0.2s;

    &.gamer {
      background-color: rgba(126, 24, 141, 0.2);
      color: #e81cff;
      border: 1px solid rgba(126, 24, 141, 0.3);

      .user-info:hover & {
        background-color: rgba(126, 24, 141, 0.4);
        transform: translateY(-1px);
      }
    }

    &.dev {
      background-color: rgba(0, 162, 174, 0.2);
      color: #40c9ff;
      border: 1px solid rgba(0, 162, 174, 0.3);

      .user-info:hover & {
        background-color: rgba(0, 162, 174, 0.4);
        transform: translateY(-1px);
      }
    }
  }
`;

export default PostCard;
