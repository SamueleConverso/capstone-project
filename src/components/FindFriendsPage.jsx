import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserById, getAllUsers } from "../redux/actions/user";
import { jwtDecode } from "jwt-decode";
import styled from "styled-components";
import CoolSearch from "./CoolSearch";
import SearchedUserCard from "./SearchedUserCard";
import { motion } from "framer-motion";
import * as Icon from "react-bootstrap-icons";

const FindFriendsPage = () => {
  const dispatch = useDispatch();
  const allUsers = useSelector((state) => state.user.allUsers);
  const currentUser = useSelector((state) => state.profile.user);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    if (currentUserId) {
      dispatch(getUserById(currentUserId));
    }
  }, [currentUserId]);

  useEffect(() => {
    setIsLoading(true);
    dispatch(getAllUsers())
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [dispatch]);

  useEffect(() => {
    console.log("useEffect - searchQuery cambiato:", searchQuery);
    if (allUsers && allUsers.length > 0) {
      applyFilters();
    }
  }, [allUsers, searchQuery, activeFilters, currentUser]);

  const handleSearch = (query) => {
    console.log("Nuova query di ricerca:", query);
    setSearchQuery(query);
  };
  const toggleFilter = (filter) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f) => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const resetFilters = () => {
    setActiveFilters([]);
    setSearchQuery("");
  };

  const applyFilters = () => {
    if (!allUsers) return;

    // Assicuriamoci che allUsers sia un array
    if (!Array.isArray(allUsers)) {
      console.error("allUsers non è un array:", allUsers);
      return;
    }

    console.log("Numero utenti disponibili:", allUsers.length);

    allUsers.forEach((user) => {
      console.log(
        `Utente: ${user.firstName} ${user.lastName} (${user.displayName})`
      );
    });

    let result = [...allUsers];

    console.log("Utenti disponibili:", allUsers);

    if (currentUserId) {
      const beforeFilter = result.length;
      result = result.filter(
        (user) => user.applicationUserId !== currentUserId
      );
      console.log(
        `Rimosso utente corrente: ${beforeFilter} → ${result.length} utenti`
      );
    }

    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      console.log("Cerco:", query);

      const beforeFilter = result.length;

      result = result.filter((user) => {
        const firstName = user.firstName ? user.firstName.toLowerCase() : "";
        const lastName = user.lastName ? user.lastName.toLowerCase() : "";
        const displayName = user.displayName
          ? user.displayName.toLowerCase()
          : "";

        const firstNameMatch = firstName.includes(query);
        const lastNameMatch = lastName.includes(query);
        const displayNameMatch = displayName.includes(query);

        console.log(
          `Controllo utente: ${user.firstName} ${user.lastName} (${user.displayName})`
        );
        console.log(
          `  - firstName: "${firstName}" include "${query}"? ${firstNameMatch}`
        );
        console.log(
          `  - lastName: "${lastName}" include "${query}"? ${lastNameMatch}`
        );
        console.log(
          `  - displayName: "${displayName}" include "${query}"? ${displayNameMatch}`
        );
        console.log(
          `  - Match complessivo: ${
            firstNameMatch || lastNameMatch || displayNameMatch
          }`
        );

        return firstNameMatch || lastNameMatch || displayNameMatch;
      });

      console.log(
        `Filtro per query "${query}": ${beforeFilter} → ${result.length} utenti`
      );
    }

    if (activeFilters.length > 0) {
      result = result.filter((user) => {
        for (const filter of activeFilters) {
          if (filter === "gamer" && !user.isGamer) return false;
          if (filter === "developer" && !user.isDeveloper) return false;
          if (filter === "editor" && !user.isEditor) return false;

          if (filter === "friends" && currentUser && currentUser.friendList) {
            const isFriend = currentUser.friendList.applicationUserFriends.some(
              (friendship) =>
                friendship.applicationUser &&
                friendship.applicationUser.applicationUserId ===
                  user.applicationUserId &&
                friendship.accepted === true
            );
            if (!isFriend) return false;
          }

          if (
            filter === "notFriends" &&
            currentUser &&
            currentUser.friendList
          ) {
            const isFriend = currentUser.friendList.applicationUserFriends.some(
              (friendship) =>
                friendship.applicationUser &&
                friendship.applicationUser.applicationUserId ===
                  user.applicationUserId &&
                friendship.accepted === true
            );
            if (isFriend) return false;
          }

          if (
            filter === "pendingRequests" &&
            currentUser &&
            currentUser.friendList
          ) {
            const isPending =
              currentUser.friendList.applicationUserFriends.some(
                (friendship) =>
                  friendship.applicationUser &&
                  friendship.applicationUser.applicationUserId ===
                    user.applicationUserId &&
                  friendship.accepted === null
              );
            if (!isPending) return false;
          }
        }
        return true;
      });
    }

    console.log("Utenti filtrati finali:", result.length);
    setFilteredUsers(result);
  };

  console.log("Rendering con filteredUsers:", filteredUsers);

  console.log("currentUser:", currentUser);

  return (
    <StyledWrapper>
      <motion.div
        className="find-friends-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header">
          <h2>
            <Icon.PeopleFill className="header-icon" /> Cerca Nuovi Amici
          </h2>
          <p>Trova e connettiti con altri utenti della piattaforma</p>
        </div>

        <div className="search-container">
          <CoolSearch onSearch={handleSearch} value={searchQuery} />
        </div>

        <div className="filters-container">
          <div className="filters-header">
            <Icon.Filter className="filter-icon" />
            <h5>Filtra Utenti</h5>
          </div>

          <div className="filters-body">
            <div className="filter-badges">
              <motion.div
                className={`filter-badge gamer-badge ${
                  activeFilters.includes("gamer") ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFilter("gamer")}
              >
                <Icon.Controller size={14} />
                <span>Gamer</span>
              </motion.div>

              <motion.div
                className={`filter-badge dev-badge ${
                  activeFilters.includes("developer") ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFilter("developer")}
              >
                <Icon.Code size={14} />
                <span>Developer</span>
              </motion.div>

              <motion.div
                className={`filter-badge friends-badge ${
                  activeFilters.includes("friends") ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFilter("friends")}
              >
                <Icon.People size={14} />
                <span>Già Amici</span>
              </motion.div>

              <motion.div
                className={`filter-badge not-friends-badge ${
                  activeFilters.includes("notFriends") ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFilter("notFriends")}
              >
                <Icon.PersonAdd size={14} />
                <span>Non Amici</span>
              </motion.div>

              <motion.div
                className={`filter-badge pending-badge ${
                  activeFilters.includes("pendingRequests") ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFilter("pendingRequests")}
              >
                <Icon.Clock size={14} />
                <span>Richieste Inviate</span>
              </motion.div>

              <motion.div
                className="filter-badge reset-badge"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
              >
                <Icon.ArrowCounterclockwise size={14} />
                <span>Reset Filtri</span>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="results-container">
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Caricamento...</span>
              </div>
              <p>Caricamento utenti in corso...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="users-grid">
              {filteredUsers.map((user) => (
                <SearchedUserCard
                  key={user.applicationUserId}
                  user={user}
                  currentUser={currentUser}
                />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <Icon.EmojiDizzy size={40} />
              <p>Nessun utente trovato con i criteri di ricerca specificati.</p>
              <button className="reset-btn" onClick={resetFilters}>
                Reimposta filtri
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .find-friends-container {
    max-width: 1100px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .header-icon {
    margin-right: 0.5rem;
    color: #05bdc2;
  }

  .header h2 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .header p {
    font-size: 1rem;
    color: #9e9e9e;
  }

  .search-container {
    margin-bottom: 2rem;
    display: flex;
    justify-content: center;
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

  .filters-body {
    position: relative;
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
      transform: translateY(-3px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);

      &::before {
        opacity: 1;
        transform: scale(1);
      }
    }

    &:active {
      transform: translateY(1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }

    &.active {
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

  .gamer-badge {
    background: linear-gradient(45deg, #7e188d, #9920a9);

    &.active {
      background: linear-gradient(45deg, #9920a9, #bd2cd0);
      box-shadow: 0 0 15px rgba(153, 32, 169, 0.6);
    }
  }

  .dev-badge {
    background: linear-gradient(45deg, #00a2ae, #00bbd0);

    &.active {
      background: linear-gradient(45deg, #00bbd0, #20d6eb);
      box-shadow: 0 0 15px rgba(0, 187, 208, 0.6);
    }
  }

  .editor-badge {
    background: linear-gradient(45deg, #9b59b6, #8e44ad);

    &.active {
      background: linear-gradient(45deg, #8e44ad, #9b59b6);
      box-shadow: 0 0 15px rgba(155, 89, 182, 0.6);
    }
  }

  .friends-badge {
    background: linear-gradient(45deg, #4267b2, #5b7bd5);

    &.active {
      background: linear-gradient(45deg, #5b7bd5, #4267b2);
      box-shadow: 0 0 15px rgba(66, 103, 178, 0.6);
    }
  }

  .not-friends-badge {
    background: linear-gradient(45deg, #3498db, #2980b9);

    &.active {
      background: linear-gradient(45deg, #2980b9, #3498db);
      box-shadow: 0 0 15px rgba(41, 128, 185, 0.6);
    }
  }

  .pending-badge {
    background: linear-gradient(45deg, #e67e22, #d35400);

    &.active {
      background: linear-gradient(45deg, #d35400, #e67e22);
      box-shadow: 0 0 15px rgba(230, 126, 34, 0.6);
    }
  }

  .reset-badge {
    background: linear-gradient(45deg, #95a5a6, #7f8c8d);

    &:hover {
      background: linear-gradient(45deg, #7f8c8d, #95a5a6);
    }
  }

  .users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .loading-spinner,
  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #bdbdbd;
    padding: 3rem 0;
    text-align: center;
  }

  .no-results {
    svg {
      margin-bottom: 1rem;
      opacity: 0.6;
    }

    p {
      font-size: 1.1rem;
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
    .users-grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }

  @media (max-width: 576px) {
    .users-grid {
      grid-template-columns: 1fr;
    }

    .find-friends-container {
      margin: 1rem auto;
    }

    .header h2 {
      font-size: 1.8rem;
    }
  }
`;

export default FindFriendsPage;
