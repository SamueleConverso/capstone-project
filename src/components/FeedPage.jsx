import React from "react";
import PublishPostCard from "./PublishPostCard";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getVideogames } from "../redux/actions/videogame.js";
import { getPosts } from "../redux/actions/post.js";
import SearchPosts from "./SearchPosts.jsx";
import PostCard from "./PostCard.jsx";
import PostFilters from "./PostFilters.jsx";
import { getUserById } from "../redux/actions/user.js";
import { jwtDecode } from "jwt-decode";
import EnhancedPostCard from "./EnhancedPostCard.jsx";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { getAllUsers } from "../redux/actions/user.js";
import * as Icon from "react-bootstrap-icons";

function FeedPage() {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.post.posts);
  const user = useSelector((state) => state.profile.user);
  const [userId, setUserId] = React.useState(null);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isFilterActive, setIsFilterActive] = useState(true);
  const [initialSortApplied, setInitialSortApplied] = useState(false);
  const [activeFilterFunction, setActiveFilterFunction] = useState(null);
  const [activeFilterType, setActiveFilterType] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");

  const [activePostId, setActivePostId] = useState(null);
  const activePostRef = useRef(null);
  const scrollPositionRef = useRef(0);

  const [isLoadingVideogames, setIsLoadingVideogames] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(true);

  const isLoading =
    isLoadingVideogames || isLoadingPosts || isLoadingUser || isLoadingAllUsers;

  const [loadingProgress, setLoadingProgress] = useState({
    videogames: false,
    posts: false,
    user: false,
    allUsers: false,
  });

  useEffect(() => {
    setIsLoadingVideogames(true);
    dispatch(getVideogames())
      .then(() => {
        setIsLoadingVideogames(false);
        setLoadingProgress((prev) => ({ ...prev, videogames: true }));
      })
      .catch((error) => {
        console.error("Errore nel caricare i videogiochi:", error);
        setIsLoadingVideogames(false);
      });

    setIsLoadingPosts(true);
    dispatch(getPosts())
      .then(() => {
        setIsLoadingPosts(false);
        setLoadingProgress((prev) => ({ ...prev, posts: true }));
      })
      .catch((error) => {
        console.error("Errore nel caricare i post:", error);
        setIsLoadingPosts(false);
      });

    setIsLoadingUser(true);
    const token = localStorage.getItem("jwtToken");
    const decodedToken = jwtDecode(token);
    setUserId(decodedToken.id);

    dispatch(getUserById(decodedToken.id))
      .then(() => {
        setIsLoadingUser(false);
        setLoadingProgress((prev) => ({ ...prev, user: true }));
      })
      .catch((error) => {
        console.error("Errore nel caricare l'utente:", error);
        setIsLoadingUser(false);
      });

    setIsLoadingAllUsers(true);
    dispatch(getAllUsers())
      .then(() => {
        setIsLoadingAllUsers(false);
        setLoadingProgress((prev) => ({ ...prev, allUsers: true }));
      })
      .catch((error) => {
        console.error("Errore nel caricare tutti gli utenti:", error);
        setIsLoadingAllUsers(false);
      });
  }, []);

  useEffect(() => {
    if (!initialSortApplied && posts && posts.length > 0) {
      console.log("Ordino per la prima volta");
      const sortedPosts = [...posts].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setFilteredPosts(sortedPosts);
      setIsFilterActive(true);
      setInitialSortApplied(true);
    }
  }, [posts, initialSortApplied]);

  const saveScrollPosition = () => {
    scrollPositionRef.current = window.scrollY;
  };

  useEffect(() => {
    if (activePostId) {
      const activeElement =
        document.getElementById(`post-${activePostId}`) ||
        activePostRef.current;

      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "auto",
          block: "center",
        });
        scrollPositionRef.current = 0;
      } else if (scrollPositionRef.current > 0) {
        window.scrollTo(0, scrollPositionRef.current);
      }
    }
  }, [filteredPosts, activePostId]);

  useEffect(() => {
    if (initialSortApplied && posts && posts.length > 0) {
      if (isFilterActive && activeFilterFunction) {
        const validPosts = posts.filter(
          (post) =>
            post.applicationUser !== null &&
            post.deletedAt === null &&
            (post.isDeleted === false || post.isDeleted === null) &&
            (post.isHidden === false || post.isHidden === null) &&
            post.isInUserFeed === true
        );
        setFilteredPosts(activeFilterFunction(validPosts));
      } else if (!isFilterActive) {
        setFilteredPosts(posts);
      }
    }
  }, [posts, isFilterActive, activeFilterFunction]);

  useEffect(() => {
    if (userId) {
      dispatch(getUserById(userId));
    }
  }, [userId]);

  useEffect(() => {
    if (posts && !isFilterActive) {
      saveScrollPosition();
      setFilteredPosts(posts);
    }
  }, [posts, isFilterActive]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    saveScrollPosition();
    setActivePostId(null);

    applyAllFilters(query, activeFilterFunction);
  };

  const applyAllFilters = (query, filterFunc) => {
    if (posts) {
      const validPosts = posts.filter(
        (post) =>
          post.applicationUser !== null &&
          post.deletedAt === null &&
          (post.isDeleted === false || post.isDeleted === null) &&
          (post.isHidden === false || post.isHidden === null) &&
          post.isInUserFeed === true
      );

      let filtered = validPosts;
      if (query && query.trim() !== "") {
        filtered = filtered.filter(
          (post) =>
            post.text && post.text.toLowerCase().includes(query.toLowerCase())
        );
      }

      if (filterFunc) {
        filtered = filterFunc(filtered);
      }

      setFilteredPosts(filtered);
      setIsFilterActive(true);
    }
  };

  const handleApplyFilters = (filterFunction, filterType) => {
    saveScrollPosition();
    setActivePostId(null);
    setActiveFilterFunction(() => filterFunction);
    setActiveFilterType(filterType);

    applyAllFilters(searchQuery, filterFunction);
  };

  const handleResetFilters = () => {
    saveScrollPosition();
    setActivePostId(null);
    setFilteredPosts(posts);
    setIsFilterActive(false);
    setActiveFilterFunction(null);
    setActiveFilterType("none");
    setSearchQuery("");
  };

  const handlePostInteraction = (postId) => {
    if (!postId) return;

    console.log("Interazione con il post:", postId);

    scrollPositionRef.current = window.scrollY;

    setActivePostId(postId);
  };

  const validPosts = filteredPosts
    ? filteredPosts.filter(
        (post) =>
          post.applicationUser !== null &&
          post.deletedAt === null &&
          (post.isDeleted === false || post.isDeleted === null) &&
          (post.isHidden === false || post.isHidden === null) &&
          post.isInUserFeed === true
      )
    : [];

  if (isLoading) {
    return (
      <LoadingContainer>
        <div className="loading-content">
          <div className="spinner"></div>
          <h3>Caricamento del feed in corso...</h3>
          <div className="loading-progress">
            <div
              className={`progress-item ${
                loadingProgress.posts ? "completed" : ""
              }`}
            >
              <span className="progress-label">Post</span>
              {loadingProgress.posts ? (
                <Icon.CheckCircleFill className="check-icon" />
              ) : (
                <Icon.HourglassSplit className="loading-icon" />
              )}
            </div>
            <div
              className={`progress-item ${
                loadingProgress.videogames ? "completed" : ""
              }`}
            >
              <span className="progress-label">Videogiochi</span>
              {loadingProgress.videogames ? (
                <Icon.CheckCircleFill className="check-icon" />
              ) : (
                <Icon.HourglassSplit className="loading-icon" />
              )}
            </div>
            <div
              className={`progress-item ${
                loadingProgress.user ? "completed" : ""
              }`}
            >
              <span className="progress-label">Profilo utente</span>
              {loadingProgress.user ? (
                <Icon.CheckCircleFill className="check-icon" />
              ) : (
                <Icon.HourglassSplit className="loading-icon" />
              )}
            </div>
            <div
              className={`progress-item ${
                loadingProgress.allUsers ? "completed" : ""
              }`}
            >
              <span className="progress-label">Utenti</span>
              {loadingProgress.allUsers ? (
                <Icon.CheckCircleFill className="check-icon" />
              ) : (
                <Icon.HourglassSplit className="loading-icon" />
              )}
            </div>
          </div>
        </div>
      </LoadingContainer>
    );
  }

  return (
    <StyledWrapper>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="content-container"
      >
        <div className="d-flex justify-content-center mt-1 mb-5">
          <PublishPostCard />
        </div>
        <SearchPosts onSearch={handleSearch} value={searchQuery} />
        <div className="d-flex justify-content-center mt-2 mb-5">
          <PostFilters
            onApplyFilters={handleApplyFilters}
            resetFilters={handleResetFilters}
          />
        </div>

        <motion.div
          className="posts-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatePresence
            mode="popLayout"
            key={isFilterActive ? `filter-${activeFilterType}` : "all"}
          >
            {validPosts.map((post, index) => {
              return (
                <motion.div
                  key={post.postId}
                  id={`post-${post.postId}`}
                  ref={post.postId === activePostId ? activePostRef : null}
                  className="post-item"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  style={{ willChange: "transform" }}
                >
                  <EnhancedPostCard
                    post={post}
                    user={user}
                    onInteraction={handlePostInteraction}
                    isActive={post.postId === activePostId}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </StyledWrapper>
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

const StyledWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;

  .content-container {
    width: 100%;
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
`;

export default FeedPage;
