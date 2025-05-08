import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { getCommunities } from "../redux/actions/community";
import { getUserById, getOtherUserById } from "../redux/actions/user";
import { jwtDecode } from "jwt-decode";
import CommunityCard from "./CommunityCard";
import * as Icon from "react-bootstrap-icons";

const UserCommunitiesView = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const allCommunities = useSelector((state) => state.community.communities);
  const currentUser = useSelector((state) => state.profile.user);
  const otherUser = useSelector((state) => state.profile.userToView);

  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [createdCommunities, setCreatedCommunities] = useState([]);
  const [memberCommunities, setMemberCommunities] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortMethod, setSortMethod] = useState("newest");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isUserInfoLoaded, setIsUserInfoLoaded] = useState(false);
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        const decodedToken = jwtDecode(token);
        setLoggedInUserId(decodedToken.id);
      }
    } catch (error) {
      console.error("Errore nel decodificare il token:", error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setLoadingUser(true);

    dispatch(getCommunities());

    if (loggedInUserId && loggedInUserId === userId) {
      if (currentUser) {
        setProfileUser(currentUser);
        setLoadingUser(false);
      } else {
        dispatch(getUserById(userId))
          .then(() => setLoadingUser(false))
          .catch(() => setLoadingUser(false));
      }
    } else if (userId) {
      dispatch(getOtherUserById(userId))
        .then(() => setLoadingUser(false))
        .catch(() => setLoadingUser(false));
    }
  }, [dispatch, userId, loggedInUserId]);

  useEffect(() => {
    if (loggedInUserId === userId && currentUser) {
      setProfileUser(currentUser);
      setLoadingUser(false);
    } else if (otherUser && otherUser.applicationUserId === userId) {
      setProfileUser(otherUser);
      setLoadingUser(false);
    }
  }, [currentUser, otherUser, userId, loggedInUserId]);

  useEffect(() => {
    if (
      allCommunities &&
      allCommunities.length > 0 &&
      userId &&
      loggedInUserId
    ) {
      const userCreated = allCommunities.filter(
        (community) =>
          community.applicationUser?.applicationUserId === userId &&
          !community.isDeleted
      );

      const userMember = allCommunities.filter(
        (community) =>
          community.applicationUser?.applicationUserId !== userId &&
          !community.isDeleted &&
          community.communityApplicationUsers?.some(
            (cau) => cau.applicationUser?.applicationUserId === userId
          )
      );

      setCreatedCommunities(userCreated);
      setMemberCommunities(userMember);
      setIsUserInfoLoaded(true);
      setLoading(false);

      applyFiltersAndSort(
        userCreated,
        userMember,
        activeFilter,
        sortMethod,
        typeFilter
      );
    }
  }, [allCommunities, userId, loggedInUserId]);

  const applyFiltersAndSort = (created, member, filter, sort, type) => {
    let communities = [];

    if (filter === "created") {
      communities = [...created];
    } else if (filter === "member") {
      communities = [...member];
    } else {
      communities = [...created, ...member];
    }

    if (type !== "all") {
      communities = communities.filter(
        (community) => community.type && community.type.includes(type)
      );
    }

    switch (sort) {
      case "oldest":
        communities.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      case "mostMembers":
        communities.sort(
          (a, b) =>
            (b.communityApplicationUsers?.length || 0) -
            (a.communityApplicationUsers?.length || 0)
        );
        break;
      case "fewestMembers":
        communities.sort(
          (a, b) =>
            (a.communityApplicationUsers?.length || 0) -
            (b.communityApplicationUsers?.length || 0)
        );
        break;
      case "newest":
      default:
        communities.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }

    setFilteredCommunities(communities);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    applyFiltersAndSort(
      createdCommunities,
      memberCommunities,
      filter,
      sortMethod,
      typeFilter
    );
  };

  const handleSortChange = (method) => {
    setSortMethod(method);
    applyFiltersAndSort(
      createdCommunities,
      memberCommunities,
      activeFilter,
      method,
      typeFilter
    );
  };

  const handleTypeFilterChange = (type) => {
    setTypeFilter(type);
    applyFiltersAndSort(
      createdCommunities,
      memberCommunities,
      activeFilter,
      sortMethod,
      type
    );
  };

  const getProfileImage = () => {
    if (!profileUser) return "https://via.placeholder.com/80";

    if (profileUser.avatar) {
      return profileUser.avatar;
    } else if (profileUser.picture) {
      return `https://localhost:7105${profileUser.picture}`;
    }
    return "https://via.placeholder.com/80";
  };

  if (loading || loadingUser) {
    return (
      <LoadingContainer>
        <div className="loading-content">
          <div className="spinner"></div>
          <h3>Caricamento in corso</h3>
          <div className="loading-progress">
            <div className="progress-item">
              <span className="progress-label">Recupero dati utente...</span>
              <Icon.Person
                className={`loading-icon ${!loadingUser ? "completed" : ""}`}
              />
            </div>
            <div className="progress-item">
              <span className="progress-label">Caricamento community...</span>
              <Icon.PeopleFill
                className={`loading-icon ${!loading ? "completed" : ""}`}
              />
            </div>
          </div>
        </div>
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

  if (
    isUserInfoLoaded &&
    createdCommunities.length === 0 &&
    memberCommunities.length === 0
  ) {
    return (
      <StyledWrapper>
        <motion.div
          className="profile-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to={`/other-user/${profileUser.applicationUserId}`}
            className="user-info-link"
          >
            <div className="user-info">
              <img
                src={getProfileImage()}
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
                </div>
              </div>
            </div>
          </Link>

          <div className="header-content">
            <h1>
              {loggedInUserId === userId
                ? "Le mie community"
                : "Community dell'utente"}
            </h1>
          </div>
        </motion.div>

        <motion.div
          className="no-communities-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Icon.PeopleFill size={60} />
          <h3>Nessuna community trovata</h3>
          <p>
            {loggedInUserId === userId
              ? "Non hai ancora creato o partecipato a nessuna community."
              : "Questo utente non ha ancora creato o partecipato a nessuna community."}
          </p>
        </motion.div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <motion.div
        className="profile-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          to={`/other-user/${profileUser.applicationUserId}`}
          className="user-info-link"
        >
          <div className="user-info">
            <img
              src={getProfileImage()}
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
              </div>
            </div>
          </div>
        </Link>

        <div className="header-content">
          <h1>
            {loggedInUserId === userId
              ? "Le mie community"
              : "Community dell'utente"}
          </h1>
          <div className="community-stats">
            <motion.div
              className="stat-item"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="stat-value">{createdCommunities.length}</span>
              <span className="stat-label">
                <Icon.PersonFill className="stat-icon" /> Create
              </span>
            </motion.div>
            <motion.div
              className="stat-item"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="stat-value">{memberCommunities.length}</span>
              <span className="stat-label">
                <Icon.PeopleFill className="stat-icon" /> Partecipate
              </span>
            </motion.div>
            <motion.div
              className="stat-item"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="stat-value">
                {createdCommunities.length + memberCommunities.length}
              </span>
              <span className="stat-label">
                <Icon.Grid3x3GapFill className="stat-icon" /> Totali
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="filters-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="filters-header">
          <Icon.Filter className="filter-icon" />
          <h5>Filtra community</h5>
        </div>

        <div className="filter-badges">
          <motion.button
            className={`filter-badge ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => handleFilterChange("all")}
            whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)" }}
            whileTap={{ y: 1, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)" }}
          >
            <Icon.Grid className="badge-icon" />
            <span>Tutte</span>
          </motion.button>

          <motion.button
            className={`filter-badge created-badge ${
              activeFilter === "created" ? "active" : ""
            }`}
            onClick={() => handleFilterChange("created")}
            whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)" }}
            whileTap={{ y: 1, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)" }}
          >
            <Icon.PersonFill className="badge-icon" />
            <span>Create</span>
          </motion.button>

          <motion.button
            className={`filter-badge member-badge ${
              activeFilter === "member" ? "active" : ""
            }`}
            onClick={() => handleFilterChange("member")}
            whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)" }}
            whileTap={{ y: 1, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)" }}
          >
            <Icon.PeopleFill className="badge-icon" />
            <span>Partecipate</span>
          </motion.button>

          <motion.button
            className={`filter-badge newest-badge ${
              sortMethod === "newest" ? "active" : ""
            }`}
            onClick={() => handleSortChange("newest")}
            whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)" }}
            whileTap={{ y: 1, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)" }}
          >
            <Icon.SortNumericDown className="badge-icon" />
            <span>Più recenti</span>
          </motion.button>

          <motion.button
            className={`filter-badge oldest-badge ${
              sortMethod === "oldest" ? "active" : ""
            }`}
            onClick={() => handleSortChange("oldest")}
            whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)" }}
            whileTap={{ y: 1, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)" }}
          >
            <Icon.SortNumericUp className="badge-icon" />
            <span>Più vecchie</span>
          </motion.button>

          <motion.button
            className={`filter-badge most-badge ${
              sortMethod === "mostMembers" ? "active" : ""
            }`}
            onClick={() => handleSortChange("mostMembers")}
            whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)" }}
            whileTap={{ y: 1, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)" }}
          >
            <Icon.PeopleFill className="badge-icon" />
            <span>Più membri</span>
          </motion.button>

          <motion.button
            className={`filter-badge fewest-badge ${
              sortMethod === "fewestMembers" ? "active" : ""
            }`}
            onClick={() => handleSortChange("fewestMembers")}
            whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)" }}
            whileTap={{ y: 1, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)" }}
          >
            <Icon.Person className="badge-icon" />
            <span>Meno membri</span>
          </motion.button>

          <motion.button
            className={`filter-badge type-all-badge ${
              typeFilter === "all" ? "active" : ""
            }`}
            onClick={() => handleTypeFilterChange("all")}
            whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)" }}
            whileTap={{ y: 1, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)" }}
          >
            <Icon.Collection className="badge-icon" />
            <span>Tutti i tipi</span>
          </motion.button>

          <motion.button
            className={`filter-badge type-gaming-badge ${
              typeFilter === "Gaming" ? "active" : ""
            }`}
            onClick={() => handleTypeFilterChange("Gaming")}
            whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)" }}
            whileTap={{ y: 1, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)" }}
          >
            <Icon.Controller className="badge-icon" />
            <span>Gaming</span>
          </motion.button>

          <motion.button
            className={`filter-badge type-dev-badge ${
              typeFilter === "Development" ? "active" : ""
            }`}
            onClick={() => handleTypeFilterChange("Development")}
            whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)" }}
            whileTap={{ y: 1, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)" }}
          >
            <Icon.Code className="badge-icon" />
            <span>Development</span>
          </motion.button>
        </div>
      </motion.div>

      {filteredCommunities.length === 0 ? (
        <motion.div
          className="no-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Icon.Search size={50} />
          <h3>Nessuna community trovata con questi filtri</h3>
          <p>Prova a cambiare i filtri per visualizzare più community.</p>
          <motion.button
            className="reset-btn"
            onClick={() => {
              setActiveFilter("all");
              setSortMethod("newest");
              setTypeFilter("all");
              applyFiltersAndSort(
                createdCommunities,
                memberCommunities,
                "all",
                "newest",
                "all"
              );
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon.ArrowCounterclockwise className="me-2" />
            Reimposta filtri
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          className="communities-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AnimatePresence>
            {filteredCommunities.map((community, index) => (
              <motion.div
                key={community.communityId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="community-item"
              >
                <CommunityCard
                  community={community}
                  loggedInUserId={loggedInUserId}
                  forceOwner={
                    community.applicationUser?.applicationUserId === userId &&
                    userId === loggedInUserId
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  max-width: 1100px;
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

    .user-info-link {
      text-decoration: none;
      color: inherit;
      display: block;
      margin-bottom: 1.5rem;
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-5px);
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      z-index: 1;
      background: rgba(30, 30, 30, 0.6);
      border-radius: 12px;
      padding: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(40, 40, 40, 0.7);
        border-color: rgba(0, 162, 174, 0.4);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      }

      .user-avatar {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #05bdc2;
        background: #1a1a1a;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3),
          0 0 8px rgba(126, 24, 141, 0.5);
        transition: all 0.3s ease;
      }

      .user-details {
        h1 {
          font-size: 1.6rem;
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
        }
      }
    }

    .header-content {
      position: relative;
      z-index: 1;
      text-align: center;

      h1,
      h2 {
        font-size: 1.8rem;
        font-weight: 600;
        margin: 0 0 1.5rem;
        color: #ffffff;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .community-stats {
        display: flex;
        justify-content: center;
        gap: 2rem;

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(30, 30, 30, 0.6);
          border-radius: 12px;
          padding: 0.75rem 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          min-width: 120px;

          &:hover {
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            border-color: rgba(0, 162, 174, 0.5);
          }

          .stat-value {
            font-size: 1.8rem;
            font-weight: 700;
            color: #05bdc2;
            line-height: 1;
          }

          .stat-label {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.3rem;
            font-size: 0.85rem;
            color: #9e9e9e;
            margin-top: 0.5rem;
          }
        }

        .stat-item:nth-child(1) .stat-value {
          color: #7e188d;
        }

        .stat-item:nth-child(2) .stat-value {
          color: #05bdc2;
        }

        .stat-item:nth-child(3) .stat-value {
          color: #e67e22;
        }
      }
    }
  }

  .filters-container {
    width: 100%;
    padding: 1.2rem;
    background: linear-gradient(
      135deg,
      rgba(78, 9, 121, 0.95),
      rgba(0, 162, 174, 0.85)
    );
    border-radius: 15px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 15px rgba(126, 24, 141, 0.4),
      inset 0 1px 1px rgba(255, 255, 255, 0.2);
    position: relative;
    backdrop-filter: blur(5px);
    margin-bottom: 2rem;
    z-index: 10;
  }

  .filters-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .filters-header h5 {
    font-weight: 600;
    margin: 0;
    letter-spacing: 0.5px;
  }

  .filter-icon {
    font-size: 1.2rem;
    animation: pulse 2s infinite;
  }

  .filter-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }

  .filter-badge {
    padding: 8px 15px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.25s ease;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;
    background: transparent;

    &::before {
      content: "";
      position: absolute;
      top: -10px;
      left: -10px;
      width: 150%;
      height: 150%;
      background: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.3) 0%,
        transparent 70%
      );
      opacity: 0;
      transition: opacity 0.3s ease;
      transform: scale(0.5);
      z-index: 0;
    }

    &:hover {
      &::before {
        opacity: 1;
        transform: scale(1);
      }
    }

    &.active {
      background: linear-gradient(45deg, #7e188d, #9920a9);
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25),
        0 0 15px rgba(255, 255, 255, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.8);

      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: white;
        animation: shimmer 2s infinite;
      }
    }
  }

  .created-badge {
    background: linear-gradient(
      45deg,
      rgba(126, 24, 141, 0.7),
      rgba(153, 32, 169, 0.4)
    );
    &.active {
      background: linear-gradient(45deg, #7e188d, #9920a9);
      box-shadow: 0 0 15px rgba(126, 24, 141, 0.6);
    }
  }

  .member-badge {
    background: linear-gradient(
      45deg,
      rgba(0, 162, 174, 0.7),
      rgba(5, 189, 194, 0.4)
    );
    &.active {
      background: linear-gradient(45deg, #00a2ae, #05bdc2);
      box-shadow: 0 0 15px rgba(0, 162, 174, 0.6);
    }
  }

  .newest-badge {
    background: linear-gradient(
      45deg,
      rgba(231, 76, 60, 0.7),
      rgba(192, 57, 43, 0.4)
    );
    &.active {
      background: linear-gradient(45deg, #e74c3c, #c0392b);
      box-shadow: 0 0 15px rgba(231, 76, 60, 0.6);
    }
  }

  .oldest-badge {
    background: linear-gradient(
      45deg,
      rgba(52, 152, 219, 0.7),
      rgba(41, 128, 185, 0.4)
    );
    &.active {
      background: linear-gradient(45deg, #3498db, #2980b9);
      box-shadow: 0 0 15px rgba(52, 152, 219, 0.6);
    }
  }

  .most-badge {
    background: linear-gradient(
      45deg,
      rgba(46, 204, 113, 0.7),
      rgba(39, 174, 96, 0.4)
    );
    &.active {
      background: linear-gradient(45deg, #2ecc71, #27ae60);
      box-shadow: 0 0 15px rgba(46, 204, 113, 0.6);
    }
  }

  .fewest-badge {
    background: linear-gradient(
      45deg,
      rgba(155, 89, 182, 0.7),
      rgba(142, 68, 173, 0.4)
    );
    &.active {
      background: linear-gradient(45deg, #9b59b6, #8e44ad);
      box-shadow: 0 0 15px rgba(155, 89, 182, 0.6);
    }
  }

  .type-all-badge {
    background: linear-gradient(
      45deg,
      rgba(52, 73, 94, 0.7),
      rgba(44, 62, 80, 0.4)
    );
    &.active {
      background: linear-gradient(45deg, #34495e, #2c3e50);
      box-shadow: 0 0 15px rgba(52, 73, 94, 0.6);
    }
  }

  .type-gaming-badge {
    background: linear-gradient(
      45deg,
      rgba(230, 126, 34, 0.7),
      rgba(211, 84, 0, 0.4)
    );
    &.active {
      background: linear-gradient(45deg, #e67e22, #d35400);
      box-shadow: 0 0 15px rgba(230, 126, 34, 0.6);
    }
  }

  .type-dev-badge {
    background: linear-gradient(
      45deg,
      rgba(26, 188, 156, 0.7),
      rgba(22, 160, 133, 0.4)
    );
    &.active {
      background: linear-gradient(45deg, #1abc9c, #16a085);
      box-shadow: 0 0 15px rgba(26, 188, 156, 0.6);
    }
  }

  .communities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  .no-communities-container,
  .no-results {
    text-align: center;
    padding: 3rem 1rem;
    color: #e0e0e0;
    background: linear-gradient(
      145deg,
      rgba(26, 26, 36, 0.6),
      rgba(30, 30, 40, 0.5)
    );
    border-radius: 15px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    margin-top: 2rem;

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
      margin: 0 auto;
      margin-bottom: 1.5rem;
    }
  }

  .reset-btn {
    background: linear-gradient(45deg, #7e188d, #9920a9);
    border: none;
    color: white;
    padding: 0.6rem 1.2rem;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    display: inline-flex;
    align-items: center;

    &:hover {
      background: linear-gradient(45deg, #9920a9, #7e188d);
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
    }

    &:active {
      transform: translateY(1px);
    }
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @media (max-width: 768px) {
    padding: 1rem;

    .profile-header {
      padding: 1.5rem;

      .user-info {
        flex-direction: column;
        text-align: center;
        gap: 1rem;

        .user-details .user-badges {
          justify-content: center;
        }
      }

      .header-content {
        .community-stats {
          flex-direction: column;
          gap: 1rem;
          align-items: center;

          .stat-item {
            width: 80%;
            min-width: auto;
          }
        }
      }
    }
  }
`;

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

      .loading-icon {
        color: rgba(255, 255, 255, 0.5);
        animation: pulse 1.5s infinite ease-in-out;

        &.completed {
          color: #4caf50;
          animation: none;
        }
      }
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
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
    100% {
      opacity: 1;
    }
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
  min-height: 40vh;

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
    max-width: 400px;
  }
`;

export default UserCommunitiesView;
