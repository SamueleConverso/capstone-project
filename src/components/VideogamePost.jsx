import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import * as Icon from "react-bootstrap-icons";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { addPostLike, removePostLike } from "../redux/actions/postLike";
import { createComment, removeComment } from "../redux/actions/comment";
import { removePost } from "../redux/actions/post";
import {
  addCommentLike,
  removeCommentLike,
} from "../redux/actions/commentLike";

const VideogamePost = ({ post, currentUserId }) => {
  const [expanded, setExpanded] = useState(false);
  const [showCommentsSection, setShowCommentsSection] = useState(false);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [userId, setUserId] = useState(currentUserId || "");
  const [commentsVisible, setCommentsVisible] = useState(3);
  const commentInputRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const allPosts = useSelector((state) => state.post?.posts || []);

  const updatedPost = allPosts.find((p) => p.postId === post.postId) || post;

  const formatDate = (dateString) => {
    if (!dateString) return "Data non disponibile";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return "Adesso";
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minuti fa`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} ore fa`;
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)} giorni fa`;
    } else {
      return date.toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  };

  const getPostText = () => {
    if (!post.text) return "";

    if (post.text.length > 200 && !expanded) {
      return post.text.substring(0, 200) + "...";
    }

    return post.text;
  };

  const handleUserClick = () => {
    if (post.applicationUser) {
      navigate(`/other-user/${post.applicationUser.applicationUserId}`);
    }
  };

  const handleToggleLike = (e) => {
    e.stopPropagation();

    const selfPostLike = updatedPost.postLikes?.find(
      (like) => like.applicationUser?.applicationUserId === userId
    );

    if (selfPostLike) {
      dispatch(removePostLike(selfPostLike.postLikeId));
    } else {
      dispatch(addPostLike(userId, updatedPost.postId));
    }
  };

  const handleToggleComments = (e) => {
    e.stopPropagation();
    setShowCommentsSection(!showCommentsSection);

    if (!showCommentsSection) {
      setTimeout(() => {
        if (commentInputRef.current) {
          commentInputRef.current.focus();
        }
      }, 300);
    }
  };

  const handlePublishComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const formData = new FormData();
    formData.append("text", commentText);
    formData.append("postId", updatedPost.postId);
    formData.append("applicationUserId", userId);

    dispatch(createComment(formData));
    setCommentText("");
  };

  const handleDeleteComment = (commentId, e) => {
    e.stopPropagation();
    if (window.confirm("Sei sicuro di voler eliminare questo commento?")) {
      dispatch(removeComment(commentId));
    }
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

  const handleShowMoreComments = (e) => {
    e.stopPropagation();
    if (commentsVisible < (updatedPost.comments?.length || 0)) {
      setCommentsVisible(updatedPost.comments.length);
    } else {
      setCommentsVisible(3);
    }
  };

  const updatePostLikeStatus = () => {
    if (!updatedPost.postLikes || !userId) return;

    const selfPostLike = updatedPost.postLikes.find(
      (like) => like.applicationUser?.applicationUserId === userId
    );

    setLiked(!!selfPostLike);
  };

  const handleDeletePost = (e) => {
    e.stopPropagation();
    if (window.confirm("Sei sicuro di voler eliminare questo post?")) {
      dispatch(removePost(post.postId));
    }
  };

  useEffect(() => {
    if (!userId) {
      try {
        const token = localStorage.getItem("jwtToken");
        if (token) {
          const decodedToken = jwtDecode(token);
          setUserId(decodedToken.id);
        }
      } catch (error) {
        console.error("Errore nel decodificare il token:", error);
      }
    }
  }, []);

  useEffect(() => {
    updatePostLikeStatus();
  }, [updatedPost.postLikes, userId]);

  return (
    <PostContainer
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5 }}
    >
      <PostHeader>
        <UserInfo onClick={handleUserClick}>
          <UserAvatar
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            as={motion.div}
          >
            <img
              src={`https://localhost:7105${post.applicationUser?.picture}`}
              alt={post.applicationUser?.displayName || "Utente"}
            />
          </UserAvatar>

          <UserDetails>
            <UserName>
              {post.applicationUser?.displayName ||
                `${post.applicationUser?.firstName} ${post.applicationUser?.lastName}` ||
                "Utente"}
            </UserName>

            <UserBadges>
              {post.applicationUser?.isGamer && (
                <Badge className="gamer">
                  <Icon.Controller size={12} /> Gamer
                </Badge>
              )}
              {post.applicationUser?.isDeveloper && (
                <Badge className="dev">
                  <Icon.Code size={12} /> Developer
                </Badge>
              )}
            </UserBadges>
          </UserDetails>
        </UserInfo>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <PostDate>
            <Icon.Calendar3 size={12} />
            <span>{formatDate(post.createdAt)}</span>
          </PostDate>

          {userId === post.applicationUser?.applicationUserId && (
            <DeletePostButton
              onClick={handleDeletePost}
              as={motion.button}
              whileHover={{ color: "#ff3b5c", scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon.Trash size={14} />
            </DeletePostButton>
          )}
        </div>
      </PostHeader>

      <PostTags>
        {post.isLookingForGamers && (
          <Tag className="looking-for-gamers">
            <Icon.Controller size={12} /> Cerca Gamers
          </Tag>
        )}
        {post.isLookingForDevelopers && (
          <Tag className="looking-for-devs">
            <Icon.Code size={12} /> Cerca Developers
          </Tag>
        )}
      </PostTags>

      <PostContent>
        <PostText>
          {getPostText()}
          {post.text && post.text.length > 200 && (
            <ExpandButton
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? "Mostra meno" : "Mostra tutto"}
            </ExpandButton>
          )}
        </PostText>

        {post.picture && (
          <PostImage
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://localhost:7105/${post.picture}`, "_blank");
            }}
            as={motion.div}
            whileHover={{ scale: 1.03 }}
          >
            <img
              src={`https://localhost:7105${post.picture}`}
              alt="Immagine post"
            />
          </PostImage>
        )}
      </PostContent>

      <PostFooter>
        <FooterStat
          as={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={liked ? "active" : ""}
          onClick={handleToggleLike}
        >
          {liked ? <Icon.HeartFill size={14} /> : <Icon.Heart size={14} />}
          <span>{updatedPost.postLikes?.length || 0} Mi piace</span>
        </FooterStat>

        <FooterStat
          as={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={showCommentsSection ? "active" : ""}
          onClick={handleToggleComments}
        >
          <Icon.ChatLeftTextFill size={14} />
          <span>{updatedPost.comments?.length || 0} Commenti</span>
        </FooterStat>
      </PostFooter>
      <AnimatePresence>
        {showCommentsSection && (
          <CommentsSection
            as={motion.div}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CommentForm>
              <CommentInput
                ref={commentInputRef}
                placeholder="Scrivi un commento..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <CommentButton
                as={motion.button}
                whileHover={{ scale: 1.05, backgroundColor: "#7E188D" }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePublishComment}
                disabled={!commentText.trim()}
              >
                <Icon.Send size={14} />
              </CommentButton>
            </CommentForm>

            {updatedPost.comments?.length > 0 ? (
              <CommentsList>
                {(updatedPost.comments || [])
                  .slice()
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, commentsVisible)
                  .map((comment, index) => (
                    <CommentItem
                      key={comment.commentId}
                      as={motion.div}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <CommentAvatar
                        onClick={() =>
                          navigate(
                            `/other-user/${comment.applicationUser?.applicationUserId}`
                          )
                        }
                      >
                        <img
                          src={`https://localhost:7105${comment.applicationUser?.picture}`}
                          alt={comment.applicationUser?.displayName || "Utente"}
                        />
                      </CommentAvatar>
                      <CommentContent>
                        <CommentHeader>
                          <div className="author-section">
                            <CommentAuthor
                              onClick={() =>
                                navigate(
                                  `/other-user/${comment.applicationUser?.applicationUserId}`
                                )
                              }
                            >
                              {comment.applicationUser?.displayName ||
                                `${comment.applicationUser?.firstName} ${comment.applicationUser?.lastName}`}
                            </CommentAuthor>

                            <CommentBadges>
                              {comment.applicationUser?.isGamer && (
                                <CommentBadge className="gamer">
                                  <Icon.Controller size={10} /> Gamer
                                </CommentBadge>
                              )}
                              {comment.applicationUser?.isDeveloper && (
                                <CommentBadge className="dev">
                                  <Icon.Code size={10} /> Developer
                                </CommentBadge>
                              )}
                            </CommentBadges>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <CommentDate>
                              {formatDate(comment.createdAt)}
                            </CommentDate>
                            {userId ===
                              comment.applicationUser?.applicationUserId && (
                              <DeleteCommentButton
                                onClick={(e) =>
                                  handleDeleteComment(comment.commentId, e)
                                }
                                as={motion.button}
                                whileHover={{ color: "#ff3b5c" }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Icon.Trash size={12} />
                              </DeleteCommentButton>
                            )}
                          </div>
                        </CommentHeader>
                        <CommentText>{comment.text}</CommentText>
                        <CommentLikeButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCommentLike(comment.commentId);
                          }}
                          className={
                            hasUserLikedComment(comment.commentId)
                              ? "active"
                              : ""
                          }
                        >
                          {hasUserLikedComment(comment.commentId) ? (
                            <Icon.HeartFill size={12} />
                          ) : (
                            <Icon.Heart size={12} />
                          )}
                          <span>{comment.commentLikes?.length || 0}</span>
                        </CommentLikeButton>
                      </CommentContent>
                    </CommentItem>
                  ))}

                {updatedPost.comments?.length > 3 && (
                  <ShowMoreButton
                    onClick={handleShowMoreComments}
                    as={motion.button}
                    whileHover={{ backgroundColor: "rgba(0, 162, 174, 0.1)" }}
                  >
                    {commentsVisible < updatedPost.comments.length
                      ? `Mostra altri ${
                          updatedPost.comments.length - commentsVisible
                        } commenti`
                      : "Mostra meno commenti"}
                  </ShowMoreButton>
                )}
              </CommentsList>
            ) : (
              <NoComments>
                <Icon.ChatLeftDots size={24} />
                <p>Non ci sono ancora commenti. Sii il primo a commentare!</p>
              </NoComments>
            )}
          </CommentsSection>
        )}
      </AnimatePresence>
      <TechGlow className="tech-glow" />
    </PostContainer>
  );
};

const PostContainer = styled.div`
  position: relative;
  background: linear-gradient(145deg, #1a1a2e 0%, #16162a 100%);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2), 0 0 15px rgba(126, 24, 141, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(126, 24, 141, 0.3),
      0 0 10px rgba(0, 162, 174, 0.2);
    border: 1px solid rgba(0, 162, 174, 0.3);

    .tech-glow {
      opacity: 1;
    }
  }
`;

const TechGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  border-radius: 14px;
  box-shadow: inset 0 0 20px rgba(0, 162, 174, 0.3),
    inset 0 0 30px rgba(126, 24, 141, 0.2);
  opacity: 0;
  transition: opacity 0.4s ease;
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 5px;
  border-radius: 30px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const UserAvatar = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(0, 162, 174, 0.6);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-weight: 600;
  color: #ffffff;
  font-size: 0.95rem;
  margin-bottom: 4px;
`;

const UserBadges = styled.div`
  display: flex;
  gap: 6px;
`;

const Badge = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;

  &.gamer {
    background: linear-gradient(45deg, #7e188d, #9920a9);
    color: white;
  }

  &.dev {
    background: linear-gradient(45deg, #00a2ae, #00bbd0);
    color: white;
  }
`;

const PostDate = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;

  svg {
    color: #00a2ae;
  }
`;

const PostTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
`;

const Tag = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;

  &.looking-for-gamers {
    background: linear-gradient(45deg, #7e188d, #9920a9);
    color: white;
    box-shadow: 0 2px 6px rgba(126, 24, 141, 0.3);
  }

  &.looking-for-devs {
    background: linear-gradient(45deg, #00a2ae, #00bbd0);
    color: white;
    box-shadow: 0 2px 6px rgba(0, 162, 174, 0.3);
  }
`;

const PostContent = styled.div`
  margin-bottom: 15px;
  //cursor: pointer;
`;

const PostText = styled.div`
  color: #e0e0e0;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 15px;
  white-space: pre-wrap;
  word-break: break-word;
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: #00a2ae;
  cursor: pointer;
  padding: 0;
  margin-left: 6px;
  font-size: 0.85rem;

  &:hover {
    text-decoration: underline;
    color: #7e188d;
  }
`;

const PostImage = styled.div`
  cursor: pointer;
  margin-top: 15px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);

  img {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
  }
`;

const PostFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 12px;
  margin-top: 12px;
`;

const FooterStat = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  background: none;
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    color: #7e188d;
  }

  &:nth-child(2) svg {
    color: #00a2ae;
  }

  &:nth-child(3) svg {
    color: #9920a9;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
  }

  &.active {
    background-color: rgba(126, 24, 141, 0.1);

    &:nth-child(1) {
      color: #ff6b81;
    }

    &:nth-child(2) {
      color: #00a2ae;
    }
  }
`;

const CommentsSection = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
`;

const CommentForm = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
`;

const CommentInput = styled.textarea`
  flex: 1;
  background: rgba(30, 30, 30, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px;
  color: #e0e0e0;
  font-size: 0.9rem;
  resize: none;
  min-height: 60px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #00a2ae;
    box-shadow: 0 0 0 2px rgba(0, 162, 174, 0.2);
  }
`;

const CommentButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: linear-gradient(45deg, #00a2ae, #00bbd0);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  align-self: flex-end;
  transition: all 0.2s ease;

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
  }
`;

const CommentsList = styled.div`
  max-height: 350px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #7e188d, #00a2ae);
    border-radius: 3px;
  }
`;

const CommentItem = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const CommentAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(0, 162, 174, 0.5);
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    border-color: #7e188d;
  }
`;

const CommentContent = styled.div`
  flex: 1;
  background: rgba(30, 30, 30, 0.4);
  border-radius: 12px;
  padding: 10px;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;

  .author-section {
    display: flex;
    flex-direction: column;
  }
`;

const CommentAuthor = styled.span`
  font-weight: 600;
  font-size: 0.85rem;
  color: #ffffff;
  cursor: pointer;

  &:hover {
    color: #00a2ae;
  }
`;

const CommentDate = styled.span`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
`;

const CommentText = styled.p`
  margin: 0 0 8px;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #e0e0e0;
  word-break: break-word;
`;

const CommentLikeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 12px;

  &:hover,
  &.active {
    color: #ff6b81;
  }

  &.active svg {
    color: #ff6b81;
  }
`;

const ShowMoreButton = styled.button`
  width: 100%;
  background: rgba(30, 30, 30, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #00a2ae;
  padding: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 162, 174, 0.1);
    border-color: rgba(0, 162, 174, 0.3);
  }
`;

const NoComments = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.5);

  svg {
    margin-bottom: 10px;
  }

  p {
    text-align: center;
    font-size: 0.9rem;
  }
`;

const DeleteCommentButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 95, 87, 0.1);
  }
`;

const ViewDetailsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(45deg, #7e188d, #00a2ae);
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);

  &:hover {
    box-shadow: 0 5px 15px rgba(126, 24, 141, 0.4),
      0 0 10px rgba(0, 162, 174, 0.3);
    background: linear-gradient(45deg, #9920a9, #00bbd0);
  }
`;

const DeletePostButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 95, 87, 0.1);
  }
`;

const CommentBadges = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 3px;
`;

const CommentBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.55rem;
  padding: 1px 5px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;

  &.gamer {
    background: linear-gradient(45deg, #7e188d, #9920a9);
    color: white;
  }

  &.dev {
    background: linear-gradient(45deg, #00a2ae, #00bbd0);
    color: white;
  }
`;

export default VideogamePost;
