import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import * as Icon from "react-bootstrap-icons";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

const PostFilters = ({ onApplyFilters, resetFilters }) => {
  const [activeFilter, setActiveFilter] = useState(null);
  const [showVideogameSelect, setShowVideogameSelect] = useState(false);
  const [showCustomOptions, setShowCustomOptions] = useState(false);
  const [selectedGame, setSelectedGame] = useState("");
  const isInitialRender = useRef(true);
  const videogames = useSelector((state) => state.videogame.videogames);
  const [currentUserId, setCurrentUserId] = useState("");
  const user = useSelector((state) => state.profile.user);

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
    if (isInitialRender.current) {
      setActiveFilter("recent");
      applyFilter("recent");
      isInitialRender.current = false;
    }
  }, []);

  const handleFilterClick = (filterType) => {
    console.log("Filter clicked:", filterType);
    if (activeFilter === filterType) {
      setActiveFilter(null);
      resetFilters();

      if (filterType === "game") {
        setShowVideogameSelect(false);
        setShowCustomOptions(false);
      }
    } else {
      setActiveFilter(filterType);
      applyFilter(filterType);
    }

    if (filterType !== "game") {
      setShowVideogameSelect(false);
      setShowCustomOptions(false);
    }
  };

  const applyFilter = (filterType) => {
    console.log("Applying filter:", filterType);
    switch (filterType) {
      case "gamers":
        onApplyFilters(
          (posts) => posts.filter((post) => post.isLookingForGamers === true),
          "gamers"
        );
        break;
      case "developers":
        onApplyFilters(
          (posts) =>
            posts.filter((post) => post.isLookingForDevelopers === true),
          "developers"
        );
        break;
      case "friends":
        onApplyFilters(
          (posts) =>
            posts.filter((post) => {
              if (
                !user ||
                !user.friendList ||
                !user.friendList.applicationUserFriends
              )
                return false;

              return user.friendList.applicationUserFriends.some(
                (friend) =>
                  friend.applicationUser &&
                  friend.applicationUser.applicationUserId ===
                    post.applicationUser?.applicationUserId &&
                  friend.accepted === true
              );
            }),
          "friends"
        );
        break;
      case "game":
        setShowVideogameSelect(!showVideogameSelect);
        if (selectedGame) {
          applyGameFilter(selectedGame);
        }
        break;
      case "myposts":
        onApplyFilters(
          (posts) =>
            posts.filter(
              (post) =>
                post.applicationUser?.applicationUserId === currentUserId
            ),
          "myposts"
        );
        break;
      case "recent":
        onApplyFilters(
          (posts) =>
            [...posts].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            ),
          "recent"
        );
        break;
      case "oldest":
        onApplyFilters(
          (posts) =>
            [...posts].sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            ),
          "oldest"
        );
        break;
      case "popular":
        onApplyFilters(
          (posts) =>
            [...posts].sort((a, b) => b.postLikes.length - a.postLikes.length),
          "popular"
        );
        break;
      case "interactions":
        onApplyFilters(
          (posts) =>
            [...posts].sort(
              (a, b) =>
                b.postLikes.length +
                b.comments.length -
                (a.postLikes.length + a.comments.length)
            ),
          "interactions"
        );
        break;
      case "reset":
        resetFilters();
        setActiveFilter(null);
        setSelectedGame("");
        setShowVideogameSelect(false);
        break;
      default:
        break;
    }
  };

  const applyGameFilter = (gameId) => {
    if (gameId) {
      onApplyFilters(
        (posts) =>
          posts.filter(
            (post) => post.videogame && post.videogame.videogameId === gameId
          ),
        `game-${gameId}`
      );
    }
  };

  useEffect(() => {
    if (selectedGame && activeFilter === "game") {
      applyGameFilter(selectedGame);
    }
  }, [selectedGame]);

  return (
    <StyledWrapper>
      <div className="filters-container">
        <div className="filters-header">
          <Icon.Filter className="filter-icon" />
          <h5>Filtra Post</h5>
        </div>

        <div className="filters-body">
          <div className="filter-badges">
            <div
              className={`filter-badge gamer-badge ${
                activeFilter === "gamers" ? "active" : ""
              }`}
              onClick={() => handleFilterClick("gamers")}
            >
              <Icon.Controller size={14} />
              <span>Cerca Gamers</span>
            </div>

            <div
              className={`filter-badge dev-badge ${
                activeFilter === "developers" ? "active" : ""
              }`}
              onClick={() => handleFilterClick("developers")}
            >
              <Icon.Code size={14} />
              <span>Cerca Developers</span>
            </div>

            <div
              className={`filter-badge game-badge ${
                activeFilter === "game" ? "active" : ""
              }`}
              onClick={() => handleFilterClick("game")}
            >
              <Icon.Joystick size={14} />
              <span>Per Videogioco</span>
            </div>

            <div
              className={`filter-badge my-posts-badge ${
                activeFilter === "myposts" ? "active" : ""
              }`}
              onClick={() => handleFilterClick("myposts")}
            >
              <Icon.PersonBadge size={14} />
              <span>Creati da Me</span>
            </div>

            <div
              className={`filter-badge friends-badge ${
                activeFilter === "friends" ? "active" : ""
              }`}
              onClick={() => handleFilterClick("friends")}
            >
              <Icon.People size={14} />
              <span>Post degli Amici</span>
            </div>

            <div
              className={`filter-badge time-badge ${
                activeFilter === "recent" ? "active" : ""
              }`}
              onClick={() => handleFilterClick("recent")}
            >
              <Icon.Clock size={14} />
              <span>Più Recenti</span>
            </div>

            <div
              className={`filter-badge time-badge-alt ${
                activeFilter === "oldest" ? "active" : ""
              }`}
              onClick={() => handleFilterClick("oldest")}
            >
              <Icon.ClockHistory size={14} />
              <span>Più Vecchi</span>
            </div>

            <div
              className={`filter-badge likes-badge ${
                activeFilter === "popular" ? "active" : ""
              }`}
              onClick={() => handleFilterClick("popular")}
            >
              <Icon.HeartFill size={14} />
              <span>Più Popolari</span>
            </div>

            <div
              className={`filter-badge interaction-badge ${
                activeFilter === "interactions" ? "active" : ""
              }`}
              onClick={() => handleFilterClick("interactions")}
            >
              <Icon.ChatHeartFill size={14} />
              <span>Più Interazioni</span>
            </div>

            <div
              className="filter-badge reset-badge"
              onClick={() => handleFilterClick("reset")}
            >
              <Icon.ArrowCounterclockwise size={14} />
              <span>Reimposta</span>
            </div>
          </div>

          {showVideogameSelect && (
            <div className="game-select-container">
              <div className="custom-select-container">
                <div
                  className="custom-select-header d-flex align-items-center"
                  onClick={() => setShowCustomOptions(!showCustomOptions)}
                >
                  {selectedGame ? (
                    <img
                      src={`https://localhost:7105${
                        videogames.find(
                          (game) => game.videogameId === selectedGame
                        )?.picture
                      }`}
                      className="game-thumbnail me-2"
                      alt="Thumbnail"
                    />
                  ) : (
                    <Icon.Controller className="me-2" />
                  )}
                  {selectedGame
                    ? videogames.find(
                        (game) => game.videogameId === selectedGame
                      )?.title
                    : "Seleziona un videogioco"}
                </div>
                {showCustomOptions && (
                  <div className="custom-select-options">
                    <div
                      className="custom-option custom-option-placeholder"
                      onClick={() => {
                        setSelectedGame("");
                        setShowCustomOptions(false);
                        if (activeFilter === "game") {
                          resetFilters();
                        }
                      }}
                    >
                      <span>Seleziona un videogioco</span>
                    </div>
                    {videogames &&
                      videogames.map((game) => (
                        <div
                          key={game.videogameId}
                          className={`custom-option ${
                            selectedGame === game.videogameId ? "selected" : ""
                          }`}
                          onClick={() => {
                            setSelectedGame(game.videogameId);
                            setShowCustomOptions(false);
                          }}
                        >
                          {game.picture && (
                            <img
                              src={`https://localhost:7105${game.picture}`}
                              alt={game.title}
                              className="game-thumbnail"
                            />
                          )}
                          <span>{game.title}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .filters-container {
    width: 100%;
    max-width: 800px;
    padding: 12px;
    background: linear-gradient(
      135deg,
      rgba(78, 9, 121, 0.95),
      rgba(0, 162, 174, 0.85)
    );
    border-radius: 15px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 15px rgba(126, 24, 141, 0.4),
      inset 0 1px 1px rgba(255, 255, 255, 0.2);
    //overflow: hidden;
    position: relative;
    backdrop-filter: blur(5px);
    z-index: 4;
  }

  .filters-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 1;
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
    z-index: 5;
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

  .my-posts-badge {
    background: linear-gradient(45deg, #1abc9c, #16a085);

    &.active {
      background: linear-gradient(45deg, #16a085, #1abc9c);
      box-shadow: 0 0 15px rgba(22, 160, 133, 0.6);
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

  .friends-badge {
    background: linear-gradient(45deg, #4267b2, #5b7bd5);

    &.active {
      background: linear-gradient(45deg, #5b7bd5, #4267b2);
      box-shadow: 0 0 15px rgba(66, 103, 178, 0.6);
    }
  }

  .game-badge {
    background: linear-gradient(45deg, #9b59b6, #8e44ad);

    &.active {
      background: linear-gradient(45deg, #8e44ad, #9b59b6);
      box-shadow: 0 0 15px rgba(155, 89, 182, 0.6);
    }
  }

  .time-badge {
    background: linear-gradient(45deg, #3498db, #2980b9);

    &.active {
      background: linear-gradient(45deg, #2980b9, #3498db);
      box-shadow: 0 0 15px rgba(41, 128, 185, 0.6);
    }
  }

  .time-badge-alt {
    background: linear-gradient(45deg, #2c3e50, #34495e);

    &.active {
      background: linear-gradient(45deg, #34495e, #2c3e50);
      box-shadow: 0 0 15px rgba(52, 73, 94, 0.6);
    }
  }

  .likes-badge {
    background: linear-gradient(45deg, #e74c3c, #c0392b);

    &.active {
      background: linear-gradient(45deg, #c0392b, #e74c3c);
      box-shadow: 0 0 15px rgba(231, 76, 60, 0.6);
    }
  }

  .interaction-badge {
    background: linear-gradient(45deg, #d35400, #e67e22);

    &.active {
      background: linear-gradient(45deg, #e67e22, #d35400);
      box-shadow: 0 0 15px rgba(230, 126, 34, 0.6);
    }
  }

  .reset-badge {
    background: linear-gradient(45deg, #95a5a6, #7f8c8d);

    &:hover {
      background: linear-gradient(45deg, #7f8c8d, #95a5a6);
    }
  }

  .game-select-container {
    margin-top: 15px;
    display: flex;
    justify-content: center;
    animation: fadeIn 0.3s ease-out;
    position: relative;
    z-index: 998;
  }

  .custom-select-container {
    background-color: rgba(33, 33, 33, 0.9);
    border: 2px solid #7e188d;
    border-radius: 12px;
    width: 280px;
    position: relative;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.25);
    overflow: visible;
    z-index: 999;
  }

  .custom-select-header {
    height: 47px;
    padding: 8px 12px;
    border-radius: 10px;
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;

    &:hover {
      background-color: rgba(126, 24, 141, 0.2);
    }
  }

  .custom-select-options {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    width: 100%;
    max-height: 220px;
    overflow-y: auto;
    background-color: rgba(33, 33, 33, 0.99);
    border: 2px solid #7e188d;
    border-radius: 10px;
    padding: 5px;
    z-index: 1000;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    animation: slideDown 0.2s ease-out;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #7e188d;
      border-radius: 3px;
    }
  }

  .custom-option {
    border-radius: 8px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #ccc;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 3px;

    &:hover {
      background-color: rgba(126, 24, 141, 0.2);
      color: #fff;
    }

    &.selected {
      background-color: rgba(126, 24, 141, 0.3);
      color: #fff;
    }

    &.custom-option-placeholder {
      font-style: italic;
      color: #888;
    }
  }

  .game-thumbnail {
    width: 30px;
    height: 30px;
    object-fit: cover;
    border-radius: 5px;
    border: 1px solid rgba(126, 24, 141, 0.3);
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

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export default PostFilters;
