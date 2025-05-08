import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import * as Icon from "react-bootstrap-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { addPostLike, removePostLike } from "../redux/actions/postLike";
import { createComment, removeComment } from "../redux/actions/comment";
import { removePost } from "../redux/actions/post";
import { useNavigate } from "react-router-dom";
import {
  addApplicationUserFriend,
  acceptApplicationUserFriend,
  rejectApplicationUserFriend,
} from "../redux/actions/applicationUserFriend";
import {
  addCommentLike,
  removeCommentLike,
} from "../redux/actions/commentLike";

const EnhancedPostCard = ({
  post,
  user,
  isProfileView = false,
  authorUser,
  onInteraction,
  isActive,
}) => {
  const [liked, setLiked] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [showCommentsSection, setShowCommentsSection] = useState(false);
  const [userId, setUserId] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(3);
  const commentInputRef = useRef(null);
  const [isCurrentUserIdSetByToken, setIsCurrentUserIdSetByToken] =
    useState(false);
  const cardRef = useRef(null);

  const allPosts = useSelector((state) => state.post?.posts || []);

  const updatedPost = allPosts.find((p) => p.postId === post.postId) || post;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isUserGamer = () =>
    updatedPost.applicationUser && updatedPost.applicationUser.isGamer;
  const isUserDeveloper = () =>
    updatedPost.applicationUser && updatedPost.applicationUser.isDeveloper;

  const isCommentUserGamer = (comment) =>
    comment.applicationUser && comment.applicationUser.isGamer;

  const isCommentUserDeveloper = (comment) =>
    comment.applicationUser && comment.applicationUser.isDeveloper;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return "Adesso";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? "minuto" : "minuti"} fa`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "ora" : "ore"} fa`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? "giorno" : "giorni"} fa`;
    } else {
      return date.toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  };

  const checkFriendRequest = () => {
    if (!user || !updatedPost.applicationUser) return false;

    if (user.friendList && user.friendList.applicationUserFriends) {
      const existingRequest = user.friendList.applicationUserFriends.find(
        (friend) =>
          friend.applicationUser?.applicationUserId ===
          updatedPost.applicationUser.applicationUserId
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

    if (user.applicationUserFriends && user.applicationUserFriends.length > 0) {
      const receivedRequest = user.applicationUserFriends.find(
        (friend) =>
          friend.friendList?.applicationUser?.applicationUserId ===
          updatedPost.applicationUser.applicationUserId
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

  const handleAddFriend = () => {
    if (!user || !updatedPost.applicationUser) return;

    console.log(user);

    const friendId = updatedPost.applicationUser.applicationUserId;
    const fromUserId = userId;
    const friendListId = user.friendList.friendListId;

    console.log("DEBUG addFriend -> friendId:", friendId);
    console.log("DEBUG addFriend -> fromUserId:", fromUserId);
    console.log("DEBUG addFriend -> friendListId:", friendListId);

    if (checkFriendRequest()) return;

    dispatch(
      addApplicationUserFriend(
        friendId,
        user.friendList.friendListId,
        null,
        userId
      )
    ).then((success) => {
      console.log("DEBUG addFriend dispatch result success:", success);
      if (!success) {
        setFriendRequestSent(false);
        console.error("Impossibile inviare la richiesta di amicizia");
      } else {
        setFriendRequestSent("pending");
        console.log("Richiesta di amicizia inviata con successo");
        console.log("DEBUG Richiesta di amicizia inviata con successo", {
          friendId,
          fromUserId,
          friendListId,
        });
      }
    });
  };

  const handleAcceptFriendRequest = () => {
    if (!user || !updatedPost.applicationUser) return;

    const friendRequest = user.applicationUserFriends.find(
      (friend) =>
        friend.friendList?.applicationUser?.applicationUserId ===
        updatedPost.applicationUser.applicationUserId
    );

    if (friendRequest) {
      const applicationUserFriendId = friendRequest.applicationUserFriendId;
      const userFriendListId = user.friendList.friendListId;
      const friendId = updatedPost.applicationUser.applicationUserId;

      dispatch(
        acceptApplicationUserFriend(
          applicationUserFriendId,
          true,
          userFriendListId,
          friendId,
          userId,
          null,
          true,
          true
        )
      );
    } else {
      console.error("Richiesta di amicizia non trovata");
    }
  };

  const handleCancelFriendRequest = () => {
    if (!user || !updatedPost.applicationUser) return;

    const friendship = user.friendList.applicationUserFriends.find(
      (friend) =>
        friend.applicationUser &&
        friend.applicationUser.applicationUserId ===
          updatedPost.applicationUser.applicationUserId
    );

    if (friendship) {
      const applicationUserFriendId = friendship.applicationUserFriendId;

      dispatch(
        rejectApplicationUserFriend(
          applicationUserFriendId,
          userId,
          true,
          null,
          true,
          updatedPost.applicationUser.applicationUserId
        )
      );
    }
  };

  const toggleCommentsSection = () => {
    const currentCard = cardRef.current;
    if (currentCard) {
      currentCard.classList.add("animating");
    }

    setShowCommentsSection(!showCommentsSection);
    onInteraction(updatedPost.postId);

    setTimeout(() => {
      if (currentCard) {
        currentCard.classList.remove("animating");
      }
    }, 800);

    if (!showCommentsSection) {
      setTimeout(() => {
        if (commentInputRef.current) {
          commentInputRef.current.focus();
        }
      }, 300);
    }
  };

  const handleDeletePost = () => {
    if (window.confirm("Sei sicuro di voler eliminare questo post?")) {
      dispatch(removePost(updatedPost.postId));
    }
  };

  const handlePublishComment = () => {
    if (!commentText.trim()) return;

    const formData = new FormData();
    formData.append("text", commentText);
    formData.append("postId", updatedPost.postId);
    formData.append("applicationUserId", userId);

    dispatch(createComment(formData));
    setCommentText("");
    onInteraction(updatedPost.postId);
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm("Sei sicuro di voler eliminare questo commento?")) {
      dispatch(removeComment(commentId));
      onInteraction(updatedPost.postId);
    }
  };

  const handleToggleLike = () => {
    const selfPostLike = updatedPost.postLikes?.find(
      (like) => like.applicationUser?.applicationUserId === userId
    );

    if (selfPostLike) {
      dispatch(removePostLike(selfPostLike.postLikeId));
    } else {
      dispatch(addPostLike(userId, updatedPost.postId));
    }

    onInteraction(updatedPost.postId);
  };

  const handleToggleCommentLike = (commentId) => {
    const comment = updatedPost.comments.find((c) => c.commentId === commentId);
    if (!comment) return;

    const selfCommentLike = comment.commentLikes?.find(
      (like) => like.applicationUser?.applicationUserId === userId
    );

    if (selfCommentLike) {
      dispatch(removeCommentLike(selfCommentLike.commentLikeId));
    } else {
      dispatch(addCommentLike(userId, commentId));
    }

    onInteraction(updatedPost.postId);
  };

  const hasUserLikedComment = (commentId) => {
    const comment = updatedPost.comments?.find(
      (c) => c.commentId === commentId
    );
    if (!comment || !comment.commentLikes) return false;

    return comment.commentLikes.some(
      (like) => like.applicationUser?.applicationUserId === userId
    );
  };

  const updatePostLikeStatus = () => {
    if (!updatedPost.postLikes || !userId) return;

    const selfPostLike = updatedPost.postLikes.find(
      (like) => like.applicationUser?.applicationUserId === userId
    );

    setLiked(!!selfPostLike);
  };

  const handleGoToUserPage = (applicationUserId) => {
    navigate(`/other-user/${applicationUserId}`);
  };

  const handleShowMoreComments = () => {
    if (commentsVisible < (updatedPost.comments?.length || 0)) {
      setCommentsVisible(updatedPost.comments.length);
    } else {
      setCommentsVisible(3);
    }
  };

  const getPostText = () => {
    if (!updatedPost.text) return "";

    if (updatedPost.text.length > 280 && !isExpanded) {
      return updatedPost.text.substring(0, 280) + "...";
    }

    return updatedPost.text;
  };

  useEffect(() => {
    if (isCurrentUserIdSetByToken) return;
    try {
      const token = localStorage.getItem("jwtToken");
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.id);
      setIsCurrentUserIdSetByToken(true);
    } catch (error) {
      console.error("Errore nel decodificare il token:", error);
      setIsCurrentUserIdSetByToken(false);
    }
    //dispatch(getPosts());
  }, []);

  useEffect(() => {
    updatePostLikeStatus();
    checkFriendRequest();
  }, [post, user]);

  useEffect(() => {
    updatePostLikeStatus();
  }, [updatedPost.postLikes, userId]);

  useEffect(() => {
    updatePostLikeStatus();
    checkFriendRequest();

    const currentCard = cardRef.current;

    if (currentCard) {
      currentCard.classList.remove("animating");
    }
  }, [updatedPost, user, allPosts]);

  const postOwner = isProfileView ? authorUser : updatedPost.applicationUser;

  const profileImage = postOwner?.avatar
    ? postOwner.avatar
    : `https://localhost:7105${postOwner?.picture}`;

  useEffect(() => {
    const currentCard = cardRef.current;

    return () => {
      if (currentCard) {
        currentCard.classList.remove("animating");
      }
    };
  }, []);

  return (
    <StyledCard
      active={isActive}
      as={motion.div}
      layout
      id={`post-${updatedPost.postId}`}
      ref={cardRef}
      transition={{ layout: { duration: 0.3, type: "spring" } }}
    >
      <div className="post-header">
        <div
          className="user-profile"
          onClick={() => handleGoToUserPage(postOwner?.applicationUserId)}
        >
          <motion.img
            src={profileImage}
            alt={
              postOwner?.displayName ||
              `${postOwner?.firstName} ${postOwner?.lastName}`
            }
            className="profile-image"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
          <div className="user-info">
            <h4>
              {postOwner?.displayName ||
                `${postOwner?.firstName} ${postOwner?.lastName}`}
            </h4>
            <div className="badges">
              {isUserGamer() && (
                <span className="badge gamer">
                  <Icon.Controller size={12} /> Gamer
                </span>
              )}
              {isUserDeveloper() && (
                <span className="badge developer">
                  <Icon.Code size={12} /> Developer
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="post-actions">
          <span className="post-date">{formatDate(updatedPost.createdAt)}</span>
          {postOwner?.applicationUserId !== userId ? (
            <motion.button
              className={`friend-btn ${
                friendRequestSent ? friendRequestSent : ""
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (friendRequestSent === "received") {
                  handleAcceptFriendRequest();
                } else if (friendRequestSent === "pending") {
                  handleCancelFriendRequest();
                } else if (!friendRequestSent) {
                  handleAddFriend();
                }
              }}
              title={
                friendRequestSent === "accepted"
                  ? "Siete amici"
                  : friendRequestSent === "pending"
                  ? "Annulla richiesta di amicizia"
                  : friendRequestSent === "received"
                  ? "Accetta richiesta di amicizia"
                  : "Aggiungi amico"
              }
            >
              {friendRequestSent === "accepted" ? (
                <Icon.PersonCheckFill />
              ) : friendRequestSent === "pending" ? (
                <Icon.XCircle />
              ) : friendRequestSent === "received" ? (
                <Icon.PersonPlusFill />
              ) : (
                <Icon.PersonPlusFill />
              )}
            </motion.button>
          ) : (
            <motion.button
              className="delete-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDeletePost}
              title="Elimina post"
            >
              <Icon.Trash />
            </motion.button>
          )}
        </div>
      </div>

      {(updatedPost.isLookingForGamers ||
        updatedPost.isLookingForDevelopers) && (
        <div className="looking-for-tags">
          {updatedPost.isLookingForGamers && (
            <motion.span
              className="looking-tag gamer"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <Icon.Controller size={12} /> Cerca Gamers
            </motion.span>
          )}
          {updatedPost.isLookingForDevelopers && (
            <motion.span
              className="looking-tag developer"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
            >
              <Icon.Code size={12} /> Cerca Developers
            </motion.span>
          )}
        </div>
      )}

      <div className="post-content">
        <p className="post-text">
          {getPostText()}
          {updatedPost.text && updatedPost.text.length > 280 && (
            <button
              className="expand-btn"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Mostra meno" : "Mostra tutto"}
            </button>
          )}
        </p>

        {!updatedPost.videogame && (
          <div
            className="hover-activator"
            style={{
              height: "2px",
              opacity: 0.01,
              margin: "10px 0",
              background:
                "linear-gradient(90deg, transparent, rgba(0, 162, 174, 0.3), transparent)",
              transform: "translateZ(0)",
              willChange: "opacity",
            }}
          />
        )}

        {updatedPost.videogame && (
          <motion.div
            className="game-tag"
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() =>
              navigate(
                `/videogame-details/${updatedPost.videogame.videogameId}`
              )
            }
          >
            {updatedPost.videogame.picture ? (
              <img
                src={`https://localhost:7105/${updatedPost.videogame.picture}`}
                alt={updatedPost.videogame.title}
                className="game-image"
              />
            ) : (
              <img
                src={"../../public/assets/img/GameController.png"}
                alt={updatedPost.videogame.title}
                className="game-image"
              />
            )}
            <div className="game-info">
              <span className="game-title">{updatedPost.videogame.title}</span>
              <div className="tech-line"></div>
            </div>
            <div className="game-hover-effect"></div>
          </motion.div>
        )}

        {updatedPost.picture && (
          <motion.div
            className="post-image-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <img
              src={`https://localhost:7105/${updatedPost.picture}`}
              alt="Immagine post"
              className="post-image"
              onClick={() =>
                window.open(
                  `https://localhost:7105/${updatedPost.picture}`,
                  "_blank"
                )
              }
            />
          </motion.div>
        )}
      </div>

      <div className="engagement-bar">
        <motion.button
          className={`engagement-btn like-btn ${liked ? "active" : ""}`}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={handleToggleLike}
        >
          {liked ? <Icon.HeartFill size={18} /> : <Icon.Heart size={18} />}
          <span className="count">{updatedPost.postLikes?.length || 0}</span>
        </motion.button>

        <motion.button
          className={`engagement-btn comment-btn ${
            showCommentsSection ? "active" : ""
          }`}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={toggleCommentsSection}
        >
          <Icon.ChatLeftText size={18} />
          <span className="count">{updatedPost.comments?.length || 0}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showCommentsSection && (
          <motion.div
            className="comments-section"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            layout="position"
            layoutId={`comments-${updatedPost.postId}`}
          >
            <div className="comment-input-container">
              <motion.textarea
                ref={commentInputRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Scrivi un commento..."
                className="comment-input"
                rows="2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              />
              <motion.button
                className="post-comment-btn"
                whileHover={{ scale: 1.1, backgroundColor: "#7E188D" }}
                whileTap={{ scale: 0.9 }}
                disabled={!commentText.trim()}
                onClick={handlePublishComment}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Icon.Send />
              </motion.button>
            </div>

            {updatedPost.comments?.length > 0 ? (
              <div className="comments-list">
                {(updatedPost.comments || [])
                  .slice()
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, commentsVisible)
                  .map((comment, index) => (
                    <motion.div
                      key={comment.commentId}
                      className="comment"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="avatar-container">
                        <img
                          src={`https://localhost:7105${comment.applicationUser?.picture}`}
                          alt={comment.applicationUser?.displayName}
                          className="comment-avatar"
                          onClick={() =>
                            handleGoToUserPage(
                              comment.applicationUser?.applicationUserId
                            )
                          }
                        />
                      </div>

                      <div className="comment-content">
                        <div className="comment-header">
                          <div className="comment-author-container">
                            <h5
                              className="comment-author"
                              onClick={() =>
                                handleGoToUserPage(
                                  comment.applicationUser?.applicationUserId
                                )
                              }
                            >
                              {comment.applicationUser?.displayName ||
                                `${comment.applicationUser?.firstName} ${comment.applicationUser?.lastName}`}
                            </h5>
                            <div className="comment-badges">
                              {isCommentUserGamer(comment) && (
                                <span className="badge gamer">
                                  <Icon.Controller size={10} /> Gamer
                                </span>
                              )}
                              {isCommentUserDeveloper(comment) && (
                                <span className="badge developer">
                                  <Icon.Code size={10} /> Developer
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="comment-time">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="comment-text">{comment.text}</p>
                        <div className="comment-footer">
                          <button
                            className={`comment-like-btn ${
                              hasUserLikedComment(comment.commentId)
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              handleToggleCommentLike(comment.commentId)
                            }
                          >
                            {hasUserLikedComment(comment.commentId) ? (
                              <Icon.HeartFill size={14} />
                            ) : (
                              <Icon.Heart size={14} />
                            )}
                            <span>{comment.commentLikes?.length || 0}</span>
                          </button>

                          {comment.applicationUser?.applicationUserId ===
                            userId && (
                            <button
                              className="comment-delete-btn"
                              onClick={() =>
                                handleDeleteComment(comment.commentId)
                              }
                              title="Elimina commento"
                            >
                              <Icon.Trash size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                {updatedPost.comments && updatedPost.comments.length > 3 && (
                  <button
                    className="show-more-btn"
                    onClick={handleShowMoreComments}
                  >
                    {commentsVisible < updatedPost.comments.length
                      ? `Mostra altri ${
                          updatedPost.comments.length - commentsVisible
                        } commenti`
                      : "Mostra meno"}
                  </button>
                )}
              </div>
            ) : (
              <div className="no-comments">
                <Icon.ChatLeftDots size={30} />
                <p>Non ci sono ancora commenti. Sii il primo a commentare!</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </StyledCard>
  );
};

const StyledCard = styled.div`
  position: relative;
  width: 100%;
  background: linear-gradient(145deg, #1a1a1a, #212121);
  border-radius: 16px;
  overflow: hidden;
  color: #e0e0e0;
  will-change: transform, box-shadow;
  transform: translateZ(0);
  backface-visibility: hidden;
  box-shadow: ${(props) =>
    props.active
      ? "0 15px 35px rgba(0, 0, 0, 0.4), 0 0 20px rgba(126, 24, 141, 0.3), 0 0 10px rgba(0, 162, 174, 0.2)"
      : "0 10px 25px rgba(0, 0, 0, 0.3), 0 0 10px rgba(126, 24, 141, 0.2)"};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid
    ${(props) =>
      props.active ? "rgba(126, 24, 141, 0.3)" : "rgba(255, 255, 255, 0.05)"};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${(props) =>
      props.active
        ? "0 15px 35px rgba(0, 0, 0, 0.4), 0 0 25px rgba(126, 24, 141, 0.4), 0 0 15px rgba(0, 162, 174, 0.3)"
        : "0 15px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(126, 24, 141, 0.25)"};
    z-index: 1;
  }

  &.animating {
    will-change: transform, box-shadow;
    pointer-events: auto;
    transition: none;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    opacity: 0.01;
    pointer-events: none;
    background: rgba(0, 162, 174, 0.1);
    transform: translateZ(0);
    will-change: opacity;
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: rgba(255, 255, 240, 0.03);
    border-bottom: 2px solid rgba(0, 162, 174, 0.7);
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(126, 24, 141, 0.3) 20%,
        rgba(0, 162, 174, 0.3) 50%,
        rgba(126, 24, 141, 0.3) 80%,
        transparent 100%
      );
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 8px;
      border-radius: 30px;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }

      .profile-image {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 2px solid transparent;
        transition: border-color 0.3s ease;
        object-fit: cover;
        background-color: #1a1a1a;

        &:hover {
          border-color: #00a2ae;
        }
      }

      .user-info {
        h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: white;
          transition: color 0.2s ease;

          &:hover {
            color: #00a2ae;
          }
        }

        .badges {
          display: flex;
          gap: 8px;
          margin-top: 4px;

          .badge {
            font-size: 0.7rem;
            padding: 2px 8px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 4px;

            &.gamer {
              background: rgba(126, 24, 141, 0.2);
              color: #e81cff;
              border: 1px solid rgba(126, 24, 141, 0.3);
            }

            &.developer {
              background: rgba(0, 162, 174, 0.2);
              color: #40c9ff;
              border: 1px solid rgba(0, 162, 174, 0.3);
            }
          }
        }
      }
    }

    .post-actions {
      display: flex;
      align-items: center;
      gap: 12px;

      .friend-btn,
      .delete-btn {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;

        &.accepted {
          background-color: #00a2ae;
          color: white;
        }

        &.pending {
          background-color: #ff9800;
          color: white;
        }

        &.received {
          background-color: #32cd32;
          color: white;
        }

        &:not(.accepted):not(.pending):not(.received) {
          background-color: #7e188d;
          color: white;
        }
      }

      .delete-btn {
        background-color: transparent;
        border: 2px solid #dc3545;
        color: #dc3545;

        &:hover {
          background-color: rgba(220, 53, 69, 0.2);
        }
      }

      .post-date {
        font-size: 0.8rem;
        color: #9e9e9e;
        white-space: nowrap;
      }
    }
  }

  .looking-for-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 20px 0;

    .looking-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;

      &.gamer {
        background: linear-gradient(45deg, #7e188d, #9920a9);
        color: white;
      }

      &.developer {
        background: linear-gradient(45deg, #00a2ae, #00bbd0);
        color: white;
      }
    }
  }

  .post-content {
    padding: 16px 20px;

    .post-text {
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 16px;
      white-space: pre-wrap;
      word-break: break-word;

      .expand-btn {
        background: none;
        border: none;
        color: #00a2ae;
        cursor: pointer;
        padding: 0;
        margin-left: 8px;
        font-size: 0.85rem;

        &:hover {
          text-decoration: underline;
          color: #7e188d;
        }
      }
    }

    .post-image-container {
      margin-top: 16px;
      text-align: center;
      border-radius: 12px;
      overflow: hidden;
      background-color: rgba(0, 0, 0, 0.3);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);

      .post-image {
        max-width: 100%;
        max-height: 400px;
        object-fit: contain;
        cursor: pointer;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.02);
        }
      }
    }

    .game-tag {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 16px;
      background: rgba(243, 229, 171, 0.1);
      border: 2px solid rgba(0, 162, 174, 0.5);
      border-radius: 12px;
      padding: 10px 12px;
      cursor: pointer;
      position: relative;
      overflow: hidden;

      .game-image {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .game-info {
        flex-grow: 1;

        .game-title {
          font-weight: 600;
          font-size: 1rem;
          color: #e0e0e0;
          transition: color 0.3s ease;
        }

        .tech-line {
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 162, 174, 0.8),
            transparent
          );
          margin-top: 8px;
          width: 0;
          transition: width 0.4s ease;
        }
      }

      .game-hover-effect {
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
        z-index: 0;
      }

      &:hover {
        border-color: rgba(0, 162, 174, 0.8);
        background: rgba(126, 24, 141, 0.2);

        .game-image {
          transform: scale(1.1);
        }

        .game-title {
          color: #40c9ff;
        }

        .tech-line {
          width: 100%;
        }

        .game-hover-effect {
          opacity: 1;
          transform: scale(1);
        }
      }
    }
  }

  .engagement-bar {
    display: flex;
    justify-content: space-around;
    padding: 12px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    .engagement-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 24px;
      background: rgba(30, 30, 30, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: #9e9e9e;
      cursor: pointer;
      transition: all 0.2s ease;

      .count {
        font-weight: 600;
        font-size: 0.9rem;
      }

      &.like-btn {
        &.active {
          color: #ff6b81;
          background-color: rgba(255, 107, 129, 0.1);
          border-color: rgba(255, 107, 129, 0.3);
        }

        &:hover:not(.active) {
          color: #ff6b81;
        }
      }

      &.comment-btn {
        &.active {
          color: #00a2ae;
          background-color: rgba(0, 162, 174, 0.1);
          border-color: rgba(0, 162, 174, 0.3);
        }

        &:hover:not(.active) {
          color: #00a2ae;
        }
      }

      &.share-btn {
        &:hover {
          color: #7e188d;
        }
      }

      &:hover {
        transform: translateY(-3px);
        background: rgba(40, 40, 40, 0.9);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }
    }
  }

  .comments-section {
    background-color: rgba(20, 20, 20, 0.6);
    padding: 16px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    overflow: hidden;

    .comment-input-container {
      display: flex;
      gap: 10px;
      margin-bottom: 16px;

      .comment-input {
        flex-grow: 1;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background-color: rgba(30, 30, 30, 0.6);
        padding: 10px 12px;
        color: #e0e0e0;
        resize: none;
        transition: all 0.2s ease;
        font-family: inherit;

        &:focus {
          outline: none;
          border-color: #00a2ae;
          box-shadow: 0 0 0 2px rgba(0, 162, 174, 0.2);
        }

        &::placeholder {
          color: #9e9e9e;
        }
      }

      .post-comment-btn {
        width: 36px;
        height: 36px;
        border-radius: 18px;
        border: none;
        background-color: #00a2ae;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        align-self: flex-end;
        transition: all 0.2s ease;

        &:disabled {
          background-color: #3a3a3a;
          color: #9e9e9e;
          cursor: not-allowed;
        }
      }
    }

    .comments-list {
      max-height: 400px;
      overflow-y: auto;
      padding-right: 6px;

      /* Scrollbar styling */
      &::-webkit-scrollbar {
        width: 6px;
        background-color: #2a2a2a;
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: linear-gradient(-45deg, #7e188d 0%, #00a2ae 100%);
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(-45deg, #9920a9 0%, #00bbd0 100%);
      }

      /* Firefox scrollbar */
      scrollbar-width: thin;
      scrollbar-color: #7e188d #2a2a2a;

      .comment {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        overflow: visible;

        .avatar-container {
          width: 36px;
          height: 36px;
          overflow: visible;
          position: relative;
          z-index: 1;
        }

        .comment-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          cursor: pointer;
          transition: transform 0.2s ease;
          position: absolute;
          top: 0;
          left: 0;

          &:hover {
            transform: scale(1.1);
            z-index: 10;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }
        }

        .comment-content {
          flex-grow: 1;
          background-color: rgba(30, 30, 30, 0.4);
          border-radius: 12px;
          padding: 10px 12px;

          .comment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;

            .comment-author-container {
              display: flex;
              flex-direction: column;
              gap: 2px;
            }

            .comment-author {
              margin: 0;
              font-size: 0.9rem;
              font-weight: 600;
              cursor: pointer;
              color: #e0e0e0;
              transition: color 0.2s ease;

              &:hover {
                color: #00a2ae;
              }
            }

            .comment-badges {
              display: flex;
              gap: 5px;

              .badge {
                font-size: 0.65rem;
                padding: 1px 6px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 3px;

                &.gamer {
                  background: rgba(126, 24, 141, 0.2);
                  color: #e81cff;
                  border: 1px solid rgba(126, 24, 141, 0.3);
                }

                &.developer {
                  background: rgba(0, 162, 174, 0.2);
                  color: #40c9ff;
                  border: 1px solid rgba(0, 162, 174, 0.3);
                }
              }
            }

            .comment-time {
              font-size: 0.7rem;
              color: #9e9e9e;
              margin-top: 2px;
            }
          }

          .comment-text {
            margin: 0 0 8px;
            font-size: 0.9rem;
            line-height: 1.4;
            color: #d0d0d0;
          }

          .comment-footer {
            display: flex;
            justify-content: flex-start;
            gap: 10px;

            .comment-like-btn {
              display: flex;
              align-items: center;
              gap: 4px;
              background: none;
              border: none;
              font-size: 0.8rem;
              color: #9e9e9e;
              cursor: pointer;
              padding: 2px 6px;
              border-radius: 12px;
              transition: all 0.2s ease;

              &.active {
                color: #ff6b81;
                background-color: rgba(255, 107, 129, 0.1);
              }

              &:hover:not(.active) {
                color: #ff6b81;
                background-color: rgba(255, 107, 129, 0.05);
              }
            }

            .comment-delete-btn {
              display: flex;
              align-items: center;
              justify-content: center;
              background: none;
              border: none;
              color: #9e9e9e;
              cursor: pointer;
              padding: 2px 6px;
              border-radius: 12px;
              transition: all 0.2s ease;

              &:hover {
                color: #dc3545;
                background-color: rgba(220, 53, 69, 0.1);
              }
            }
          }
        }
      }

      .show-more-btn {
        width: 100%;
        background-color: rgba(30, 30, 30, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #00a2ae;
        padding: 8px 0;
        cursor: pointer;
        border-radius: 8px;
        margin-top: 10px;
        font-size: 0.9rem;
        transition: all 0.2s ease;

        &:hover {
          background-color: rgba(0, 162, 174, 0.1);
          border-color: rgba(0, 162, 174, 0.3);
        }
      }
    }

    .no-comments {
      text-align: center;
      padding: 30px 0;
      color: #9e9e9e;

      svg {
        margin-bottom: 12px;
        opacity: 0.7;
      }

      p {
        font-size: 0.9rem;
        max-width: 300px;
        margin: 0 auto;
      }
    }
  }

  @media (max-width: 576px) {
    .post-header {
      padding: 12px 16px;

      .user-profile {
        gap: 8px;

        .profile-image {
          width: 40px;
          height: 40px;
        }

        .user-info {
          h4 {
            font-size: 0.9rem;
          }

          .badges {
            .badge {
              font-size: 0.65rem;
              padding: 1px 6px;
            }
          }
        }
      }

      .post-actions {
        gap: 8px;

        .post-date {
          font-size: 0.7rem;
        }
      }
    }

    .post-content {
      padding: 12px 16px;

      .post-text {
        font-size: 0.9rem;
      }
    }

    .engagement-bar {
      padding: 10px;

      .engagement-btn {
        padding: 6px 12px;
        gap: 4px;

        .count {
          font-size: 0.8rem;
        }
      }
    }
  }
`;

export default EnhancedPostCard;
