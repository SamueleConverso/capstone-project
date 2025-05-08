import React, { useEffect, useState } from "react";
import styled from "styled-components";
import * as Icon from "react-bootstrap-icons";
import { useDispatch, useSelector } from "react-redux";
import { addCommentLike } from "../redux/actions/commentLike";
import { removeCommentLike } from "../redux/actions/commentLike";
import { removeComment } from "../redux/actions/comment";
import { useNavigate } from "react-router-dom";

function Comment({ comment, userId }) {
  const [liked, setLiked] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const commentLiked = useSelector((state) => state.commentLike.commentLiked);
  const commentUnLiked = useSelector(
    (state) => state.commentLike.commentUnLiked
  );

  const handleDeleteComment = (commentId, e) => {
    if (e) {
      e.stopPropagation();
    }
    dispatch(removeComment(commentId));
  };

  const handleGoToUserPage = (applicationUserId) => {
    navigate("/other-user/" + applicationUserId);
  };

  const handleLike = (e) => {
    if (e) {
      e.stopPropagation();
    }
    const selfCommentLike = comment.commentLikes.find(
      (like) => like.applicationUser.applicationUserId === userId
    );
    if (selfCommentLike) {
      dispatch(removeCommentLike(selfCommentLike.commentLikeId));
      updateCommentLikeIcons();
    } else {
      dispatch(addCommentLike(userId, comment.commentId));
      updateCommentLikeIcons();
    }
  };

  const updateCommentLikeIcons = () => {
    if (comment.commentLikes.length > 0) {
      const selfCommentLike = comment.commentLikes.find(
        (like) => like.applicationUser.applicationUserId === userId
      );
      if (selfCommentLike) {
        setLiked(true);
        return;
      } else {
        setLiked(false);
      }
    } else {
      setLiked(false);
    }
  };

  useEffect(() => {
    updateCommentLikeIcons();
  }, []);

  useEffect(() => {
    updateCommentLikeIcons();
  }, [commentLiked, commentUnLiked, comment]);

  return (
    <CommentWrapper>
      <div className="comment-container">
        <div
          onClick={() =>
            handleGoToUserPage(comment.applicationUser.applicationUserId)
          }
          className="user-img"
        >
          <img
            src={`https://localhost:7105/${comment.applicationUser.picture}`}
          />
        </div>
        <div className="comment-content">
          <div
            onClick={() =>
              handleGoToUserPage(comment.applicationUser.applicationUserId)
            }
            className="user-info"
          >
            <div className="d-flex align-items-center">
              <h5>
                {comment.applicationUser.displayName ||
                  `${comment.applicationUser.firstName} ${comment.applicationUser.lastName}`}
              </h5>
              {comment.applicationUser.applicationUserId === userId && (
                <div
                  onClick={(e) => {
                    handleDeleteComment(comment.commentId, e);
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
          </div>
          <div className="comment-text">
            <p>{comment.text}</p>
          </div>
          <div className="actions">
            <div
              className={`like-button ${liked ? "liked" : ""}`}
              onClick={(e) => handleLike(e)}
            >
              {liked ? <Icon.HeartFill /> : <Icon.Heart />}
              <span>{comment.commentLikes.length}</span>
            </div>
          </div>
        </div>
      </div>
    </CommentWrapper>
  );
}

const CommentWrapper = styled.div`
  margin-bottom: 15px;

  .comment-container {
    display: flex;
    gap: 12px;
    padding: 10px;
    border-radius: 8px;
    background-color: #2a2a2a;
    transition: all 0.2s ease;

    &:hover {
      background-color: #303030;
    }
  }

  .user-img {
    flex-shrink: 0;

    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #00a2ae;
      transition: all 0.2s ease;

      &:hover {
        cursor: pointer;
        transform: scale(1.05);
        box-shadow: 0px 0px 10px #00a2ae;
      }

      &:active {
        cursor: pointer;
        transform: scale(0.98);
        box-shadow: 0px 0px 10px #00a2ae;
      }
    }
  }

  .comment-content {
    flex-grow: 1;
  }

  .user-info {
    h5 {
      margin: 0;
      font-size: 0.95rem;
      color: #fffff0;
    }
  }

  .comment-text {
    margin-top: 3px;

    p {
      font-size: 0.9rem;
      line-height: 1.4;
      margin: 0;
      color: rgba(255, 255, 240, 0.9);
    }
  }

  .actions {
    display: flex;
    margin-top: 8px;

    .like-button {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      padding: 3px 8px;
      border-radius: 15px;
      color: rgba(255, 255, 240, 0.7);
      transition: all 0.2s ease;

      &:hover {
        color: #e81cff;
      }

      &.liked {
        color: #e81cff;
      }

      span {
        font-size: 0.8rem;
      }
    }
  }
`;

export default Comment;
