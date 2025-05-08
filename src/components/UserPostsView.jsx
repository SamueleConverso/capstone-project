import React, { useState, useEffect, use } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { getUserById, getOtherUserById } from "../redux/actions/user";
import { jwtDecode } from "jwt-decode";
import EnhancedPostCard from "./EnhancedPostCard";
import * as Icon from "react-bootstrap-icons";

const UserPostsView = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.profile.user);
  const otherUser = useSelector((state) =>
    state.user.applicationUsers.find((u) => u.applicationUserId === userId)
  );
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [sortMethod, setSortMethod] = useState("newest");
  const [activePostId, setActivePostId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isUserSet, setIsUserSet] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        const decodedToken = jwtDecode(token);
        setCurrentUserId(decodedToken.id);
      }
    } catch (error) {
      console.error("Errore nel decodificare il token:", error);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      console.log("Current user:", currentUser);
    }

    if (otherUser) {
      console.log("Other user:", otherUser);
    }

    if (currentUser && otherUser && currentUserId && !isUserSet) {
      if (currentUser.applicationUserId === otherUser.applicationUserId) {
        console.log("Proviamo con questo ID:", currentUserId);
        dispatch(getUserById(currentUserId));
        setIsUserSet(true);
      }
    }
  }, [currentUser, otherUser, currentUserId]);

  useEffect(() => {
    setLoading(true);

    if (otherUser) {
      setProfileUser(otherUser);
      setLoading(false);
      return;
    }

    if (currentUser && currentUser.applicationUserId === userId) {
      console.log("Utente corrente:", currentUser);
      setProfileUser(currentUser);
      setLoading(false);
      return;
    }

    if (userId) {
      dispatch(getUserById(userId))
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          console.error("Errore nel recuperare i dati utente:", error);
          setLoading(false);
        });
    }
  }, [dispatch, userId, currentUser, otherUser]);

  useEffect(() => {
    if (otherUser && otherUser.applicationUserId === userId) {
      setProfileUser(otherUser);
    }
  }, [otherUser, userId]);

  useEffect(() => {
    if (currentUser && currentUser.applicationUserId === userId) {
      setProfileUser(currentUser);
    }
  }, [currentUser, userId]);

  useEffect(() => {
    if (profileUser && profileUser.posts) {
      const validPosts = profileUser.posts.filter(
        (post) =>
          !post.isDeleted &&
          post.deletedAt === null &&
          (!post.isHidden || post.isHidden === false)
      );

      let sortedPosts;
      switch (sortMethod) {
        case "oldest":
          sortedPosts = [...validPosts].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
          break;
        case "mostLiked":
          sortedPosts = [...validPosts].sort(
            (a, b) =>
              (b.postLikes ? b.postLikes.length : 0) -
              (a.postLikes ? a.postLikes.length : 0)
          );
          break;
        case "mostCommented":
          sortedPosts = [...validPosts].sort(
            (a, b) =>
              (b.comments ? b.comments.length : 0) -
              (a.comments ? a.comments.length : 0)
          );
          break;
        case "newest":
        default:
          sortedPosts = [...validPosts].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
      }

      setPosts(sortedPosts);
    }
  }, [profileUser, sortMethod]);

  const handlePostInteraction = (postId) => {
    setActivePostId(postId);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Icon.Controller size={30} />
        </motion.div>
        <p>Caricamento post in corso...</p>
      </LoadingContainer>
    );
  }

  if (!profileUser) {
    return (
      <ErrorContainer>
        <Icon.ExclamationTriangleFill size={40} />
        <h3>Utente non trovato</h3>
        <p>
          Non è stato possibile trovare l'utente richiesto. La ricerca è
          avvenuta con ID: {userId}
        </p>
      </ErrorContainer>
    );
  }

  if (!profileUser.posts || profileUser.posts.length === 0) {
    return (
      <EmptyStateContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Icon.JournalX size={60} />
          <h3>Nessun post disponibile</h3>
          <p>
            {profileUser.applicationUserId === currentUserId
              ? "Non hai ancora pubblicato nessun post. Condividi qualcosa con la community!"
              : `${
                  profileUser.displayName || profileUser.firstName
                } non ha ancora pubblicato nessun post.`}
          </p>
        </motion.div>
      </EmptyStateContainer>
    );
  }

  const profileImage = profileUser.avatar
    ? profileUser.avatar
    : profileUser.picture
    ? `https://localhost:7105${profileUser.picture}`
    : "https://via.placeholder.com/80";

  return (
    <StyledWrapper>
      <motion.div
        className="profile-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="user-info">
          <img
            src={profileImage}
            alt={
              profileUser.displayName ||
              `${profileUser.firstName} ${profileUser.lastName}`
            }
            className="user-avatar"
          />
          <div className="user-details">
            <h1>
              {profileUser.displayName ||
                `${profileUser.firstName} ${profileUser.lastName}`}
            </h1>
            <div className="user-badges">
              {profileUser.isGamer && (
                <span className="badge gamer-badge">
                  <Icon.Controller size={14} /> Gamer
                </span>
              )}
              {profileUser.isDeveloper && (
                <span className="badge dev-badge">
                  <Icon.Code size={14} /> Developer
                </span>
              )}
              {profileUser.isEditor && (
                <span className="badge editor-badge">
                  <Icon.PencilSquare size={14} /> Editor
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="posts-header">
          <div className="posts-count">
            <span className="count">{posts.length}</span>
            <span className="label">Post</span>
          </div>

          <div className="filter-controls">
            <select
              value={sortMethod}
              onChange={(e) => setSortMethod(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Più recenti</option>
              <option value="oldest">Più vecchi</option>
              <option value="mostLiked">Più apprezzati</option>
              <option value="mostCommented">Più commentati</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="posts-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AnimatePresence mode="popLayout">
          {posts.map((post, index) => (
            <motion.div
              key={post.postId}
              className="post-item"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <EnhancedPostCard
                post={post}
                user={currentUser}
                isProfileView={true}
                authorUser={profileUser}
                onInteraction={handlePostInteraction}
                isActive={post.postId === activePostId}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;

  .profile-header {
    background: linear-gradient(145deg, #1a1a1a, #212121);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(126, 24, 141, 0.2),
      inset 0 1px 1px rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.05);
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(
        circle,
        rgba(126, 24, 141, 0.1) 0%,
        rgba(0, 162, 174, 0.05) 30%,
        transparent 70%
      );
      transform: rotate(-45deg);
      z-index: 0;
      pointer-events: none;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      z-index: 1;
      margin-bottom: 2rem;

      .user-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #05bdc2;
        background: #1a1a1a;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3),
          0 0 8px rgba(126, 24, 141, 0.5);
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.05);
          border-color: #7e188d;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3),
            0 0 15px rgba(126, 24, 141, 0.7);
        }
      }

      .user-details {
        h1 {
          font-size: 1.8rem;
          font-weight: 600;
          margin: 0 0 0.5rem;
          color: #ffffff;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .user-badges {
          display: flex;
          gap: 0.5rem;

          .badge {
            display: flex;
            align-items: center;
            gap: 0.3rem;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .gamer-badge {
            background: linear-gradient(
              90deg,
              rgba(126, 24, 141, 0.7),
              rgba(153, 32, 169, 0.4)
            );
            border-color: rgba(126, 24, 141, 0.5);
          }

          .dev-badge {
            background: linear-gradient(
              90deg,
              rgba(0, 162, 174, 0.7),
              rgba(0, 187, 208, 0.4)
            );
            border-color: rgba(0, 162, 174, 0.5);
          }

          .editor-badge {
            background: linear-gradient(
              90deg,
              rgba(155, 89, 182, 0.7),
              rgba(142, 68, 173, 0.4)
            );
            border-color: rgba(155, 89, 182, 0.5);
          }
        }
      }
    }

    .posts-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 1;

      .posts-count {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: rgba(30, 30, 30, 0.6);
        border-radius: 12px;
        padding: 0.75rem 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          border-color: rgba(0, 162, 174, 0.5);
        }

        .count {
          font-size: 1.8rem;
          font-weight: 700;
          color: #00a2ae;
          line-height: 1;
        }

        .label {
          font-size: 0.9rem;
          color: #9e9e9e;
          margin-top: 0.25rem;
        }
      }

      .filter-controls {
        .sort-select {
          background: rgba(30, 30, 30, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e0e0e0;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          outline: none;
          position: relative;

          &:hover,
          &:focus {
            border-color: #05bdc2;
            box-shadow: 0 0 0 2px rgba(5, 189, 194, 0.2);
          }

          option {
            background: #212121;
            color: #e0e0e0;
          }
        }
      }
    }
  }

  .posts-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  }

  .post-item {
    width: 100%;
    max-width: 550px;
  }

  @media (max-width: 768px) {
    padding: 1rem;

    .profile-header {
      padding: 1.5rem;

      .user-info {
        flex-direction: column;
        text-align: center;
        gap: 1rem;

        .user-details {
          .user-badges {
            justify-content: center;
          }
        }
      }

      .posts-header {
        flex-direction: column;
        gap: 1rem;

        .filter-controls {
          width: 100%;

          .sort-select {
            width: 100%;
          }
        }
      }
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #e0e0e0;

  .loading-spinner {
    color: #05bdc2;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    opacity: 0.8;
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #e0e0e0;
  text-align: center;

  svg {
    color: #dc3545;
    margin-bottom: 1rem;
  }

  h3 {
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  p {
    opacity: 0.8;
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  color: #e0e0e0;
  text-align: center;

  svg {
    color: #7e188d;
    margin-bottom: 1.5rem;
    opacity: 0.7;
  }

  h3 {
    margin-bottom: 1rem;
    font-weight: 600;
    font-size: 1.5rem;
  }

  p {
    opacity: 0.7;
    max-width: 400px;
    line-height: 1.6;
  }
`;

export default UserPostsView;
