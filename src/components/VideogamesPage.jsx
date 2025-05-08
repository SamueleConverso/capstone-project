import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import styled from "styled-components";
import { motion } from "framer-motion";
import * as Icon from "react-bootstrap-icons";
import { getUserById } from "../redux/actions/user";
import { getVideogames } from "../redux/actions/videogame";
import SearchVideogames from "./SearchVideogames";
import VideogameCard from "./VideogameCard";
import PublishVideogameCard from "./PublishVideogameCard";

const VideogamesPage = () => {
  const dispatch = useDispatch();
  const allVideogames = useSelector((state) => state.videogame.videogames);
  const currentUser = useSelector((state) => state.profile.user);
  const [filteredVideogames, setFilteredVideogames] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenreSelect, setShowGenreSelect] = useState(false);
  const [showPlatformSelect, setShowPlatformSelect] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [showGenreOptions, setShowGenreOptions] = useState(false);
  const [showPlatformOptions, setShowPlatformOptions] = useState(false);

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
  }, [currentUserId, dispatch]);

  useEffect(() => {
    setIsLoading(true);
    dispatch(getVideogames())
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [dispatch]);

  useEffect(() => {
    if (allVideogames && allVideogames.length > 0) {
      applyFilters();
    }
  }, [allVideogames, searchQuery, activeFilter, currentUser]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const applyFilters = () => {
    if (!allVideogames) return;

    if (!Array.isArray(allVideogames)) {
      console.error("allVideogames non è un array:", allVideogames);
      return;
    }

    let result = [...allVideogames];

    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((game) => {
        const title = game.title ? game.title.toLowerCase() : "";
        const subtitle = game.subtitle ? game.subtitle.toLowerCase() : "";
        return title.includes(query) || subtitle.includes(query);
      });
    }

    if (selectedGenre) {
      result = result.filter((game) => {
        if (!game.genre) return false;
        return game.genre.toLowerCase().includes(selectedGenre.toLowerCase());
      });
    }

    if (selectedPlatform) {
      result = result.filter((game) => {
        if (!game.platform) return false;
        return game.platform
          .toLowerCase()
          .includes(selectedPlatform.toLowerCase());
      });
    }

    if (activeFilter) {
      switch (activeFilter) {
        case "titleAsc":
          result.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "titleDesc":
          result.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case "newest":
          result.sort(
            (a, b) =>
              new Date(b.releaseDate).getTime() -
              new Date(a.releaseDate).getTime()
          );
          break;
        case "oldest":
          result.sort(
            (a, b) =>
              new Date(a.releaseDate).getTime() -
              new Date(b.releaseDate).getTime()
          );
          break;
        case "myGames":
          if (currentUser) {
            result = result.filter(
              (game) =>
                game.applicationUser &&
                game.applicationUser.applicationUserId ===
                  currentUser.applicationUserId
            );
          }
          break;
        case "friendsGames":
          if (currentUser && currentUser.friendList) {
            const friendIds = currentUser.friendList.applicationUserFriends
              .filter((f) => f.accepted === true)
              .map((f) => f.applicationUser.applicationUserId);

            result = result.filter(
              (game) =>
                game.applicationUser &&
                friendIds.includes(game.applicationUser.applicationUserId)
            );
          }
          break;
        case "mostPosts":
          result.sort(
            (a, b) => (b.posts?.length || 0) - (a.posts?.length || 0)
          );
          break;
        default:
          break;
      }
    }

    setFilteredVideogames(result);
  };

  const toggleFilter = (filter) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter);
    }
  };

  const resetFilters = () => {
    setActiveFilter(null);
    setSearchQuery("");
    setSelectedGenre("");
    setSelectedPlatform("");
    setShowGenreSelect(false);
    setShowPlatformSelect(false);
  };

  const genreOptions = [
    "Action",
    "Adventure",
    "RPG",
    "Strategy",
    "Simulation",
    "Sports",
    "Racing",
    "Shooter",
    "Puzzle",
    "Platformer",
    "Fighting",
    "Horror",
    "Survival",
    "MMORPG",
    "Open World",
    "Visual Novel",
    "Rhythm",
  ];

  const platformOptions = [
    "PC",
    "PlayStation 5",
    "PlayStation 4",
    "Xbox Series X/S",
    "Xbox One",
    "Nintendo Switch",
    "iOS",
    "Android",
    "Mac",
    "Linux",
    "Web Browser",
    "Steam Deck",
    "VR",
    "Nintendo 3DS",
    "Retro Console",
  ];

  const handleGenreFilter = () => {
    setShowGenreSelect(!showGenreSelect);
    if (showGenreSelect) {
      setShowGenreOptions(false);
    }
  };

  const handlePlatformFilter = () => {
    setShowPlatformSelect(!showPlatformSelect);
    if (showPlatformSelect) {
      setShowPlatformOptions(false);
    }
  };

  const applyGenreFilter = (genre) => {
    setSelectedGenre(genre);
    setShowGenreOptions(false);
    applyFilters();
  };

  const applyPlatformFilter = (platform) => {
    setSelectedPlatform(platform);
    setShowPlatformOptions(false);
    applyFilters();
  };

  useEffect(() => {
    if (allVideogames && allVideogames.length > 0) {
      applyFilters();
    }
  }, [
    allVideogames,
    searchQuery,
    activeFilter,
    currentUser,
    selectedGenre,
    selectedPlatform,
  ]);

  return (
    <StyledWrapper>
      <motion.div
        className="videogames-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header">
          <h2>
            <Icon.Controller className="header-icon" /> Videogiochi
          </h2>
          <p>
            Esplora e scopri tutti i videogiochi disponibili sulla piattaforma
          </p>
        </div>

        {currentUser?.isDeveloper && <PublishVideogameCard />}

        <div className="search-container">
          <SearchVideogames onSearch={handleSearch} value={searchQuery} />
        </div>

        <div className="filters-container">
          <div className="filters-header">
            <Icon.Filter className="filter-icon" />
            <h5>Filtra Videogiochi</h5>
          </div>

          <div className="filters-body">
            <div className="filter-badges">
              <motion.div
                className={`filter-badge title-asc-badge ${
                  activeFilter === "titleAsc" ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFilter("titleAsc")}
              >
                <Icon.SortAlphaDown size={14} />
                <span>Titolo (A-Z)</span>
              </motion.div>

              <motion.div
                className={`filter-badge title-desc-badge ${
                  activeFilter === "titleDesc" ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFilter("titleDesc")}
              >
                <Icon.SortAlphaDownAlt size={14} />
                <span>Titolo (Z-A)</span>
              </motion.div>

              <motion.div
                className={`filter-badge newest-badge ${
                  activeFilter === "newest" ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFilter("newest")}
              >
                <Icon.Calendar3 size={14} />
                <span>Più Recenti</span>
              </motion.div>

              <motion.div
                className={`filter-badge oldest-badge ${
                  activeFilter === "oldest" ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFilter("oldest")}
              >
                <Icon.CalendarX size={14} />
                <span>Più Vecchi</span>
              </motion.div>

              <motion.div
                className={`filter-badge genre-badge ${
                  showGenreSelect ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenreFilter}
              >
                <Icon.Tags size={14} />
                <span>Per Genere</span>
              </motion.div>

              <motion.div
                className={`filter-badge platform-badge ${
                  showPlatformSelect ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlatformFilter}
              >
                <Icon.Laptop size={14} />
                <span>Per Piattaforma</span>
              </motion.div>

              {currentUser?.isDeveloper && (
                <motion.div
                  className={`filter-badge my-games-badge ${
                    activeFilter === "myGames" ? "active" : ""
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFilter("myGames")}
                >
                  <Icon.PersonCircle size={14} />
                  <span>Creati da Me</span>
                </motion.div>
              )}

              <motion.div
                className={`filter-badge friends-games-badge ${
                  activeFilter === "friendsGames" ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFilter("friendsGames")}
              >
                <Icon.People size={14} />
                <span>Creati dai Miei Amici</span>
              </motion.div>

              <motion.div
                className={`filter-badge posts-badge ${
                  activeFilter === "mostPosts" ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFilter("mostPosts")}
              >
                <Icon.ChatSquareText size={14} />
                <span>Con Più Post</span>
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

            <div className="select-filters-container">
              {showGenreSelect && (
                <div className="select-container genre-select-container">
                  <div className="custom-select-container">
                    <div
                      className="custom-select-header d-flex align-items-center"
                      onClick={() => setShowGenreOptions(!showGenreOptions)}
                    >
                      <Icon.Tags className="me-2" />
                      <span>
                        {selectedGenre ? selectedGenre : "Seleziona un genere"}
                      </span>
                    </div>
                    {showGenreOptions && (
                      <div className="custom-select-options">
                        <div
                          className="custom-option custom-option-placeholder"
                          onClick={() => {
                            setSelectedGenre("");
                            setShowGenreOptions(false);
                            applyFilters();
                          }}
                        >
                          <span>Tutti i generi</span>
                        </div>
                        {genreOptions.map((genre) => (
                          <div
                            key={genre}
                            className={`custom-option ${
                              selectedGenre === genre ? "selected" : ""
                            }`}
                            onClick={() => applyGenreFilter(genre)}
                          >
                            <span>{genre}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {showPlatformSelect && (
                <div className="select-container platform-select-container">
                  <div className="custom-select-container">
                    <div
                      className="custom-select-header d-flex align-items-center"
                      onClick={() =>
                        setShowPlatformOptions(!showPlatformOptions)
                      }
                    >
                      <Icon.Laptop className="me-2" />
                      <span>
                        {selectedPlatform
                          ? selectedPlatform
                          : "Seleziona una piattaforma"}
                      </span>
                    </div>
                    {showPlatformOptions && (
                      <div className="custom-select-options">
                        <div
                          className="custom-option custom-option-placeholder"
                          onClick={() => {
                            setSelectedPlatform("");
                            setShowPlatformOptions(false);
                            applyFilters();
                          }}
                        >
                          <span>Tutte le piattaforme</span>
                        </div>
                        {platformOptions.map((platform) => (
                          <div
                            key={platform}
                            className={`custom-option ${
                              selectedPlatform === platform ? "selected" : ""
                            }`}
                            onClick={() => applyPlatformFilter(platform)}
                          >
                            <span>{platform}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="results-container">
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Caricamento...</span>
              </div>
              <p>Caricamento videogiochi in corso...</p>
            </div>
          ) : filteredVideogames.length > 0 ? (
            <div className="videogames-grid">
              {filteredVideogames.map((videogame) => (
                <VideogameCard
                  key={videogame.videogameId}
                  videogame={videogame}
                />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <Icon.EmojiDizzy size={40} />
              <p>
                Nessun videogioco trovato con i criteri di ricerca specificati.
              </p>
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
  .videogames-container {
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

  .title-asc-badge {
    background: linear-gradient(45deg, #4267b2, #5b7bd5);

    &.active {
      background: linear-gradient(45deg, #5b7bd5, #4267b2);
      box-shadow: 0 0 15px rgba(66, 103, 178, 0.6);
    }
  }

  .title-desc-badge {
    background: linear-gradient(45deg, #5b7bd5, #4267b2);

    &.active {
      background: linear-gradient(45deg, #4267b2, #5b7bd5);
      box-shadow: 0 0 15px rgba(66, 103, 178, 0.6);
    }
  }

  .newest-badge {
    background: linear-gradient(45deg, #00a2ae, #00bbd0);

    &.active {
      background: linear-gradient(45deg, #00bbd0, #20d6eb);
      box-shadow: 0 0 15px rgba(0, 187, 208, 0.6);
    }
  }

  .oldest-badge {
    background: linear-gradient(45deg, #20d6eb, #00bbd0);

    &.active {
      background: linear-gradient(45deg, #00bbd0, #00a2ae);
      box-shadow: 0 0 15px rgba(0, 187, 208, 0.6);
    }
  }

  .genre-badge {
    background: linear-gradient(45deg, #e67e22, #d35400);

    &.active {
      background: linear-gradient(45deg, #d35400, #e67e22);
      box-shadow: 0 0 15px rgba(230, 126, 34, 0.6);
    }
  }

  .platform-badge {
    background: linear-gradient(45deg, #1abc9c, #16a085);

    &.active {
      background: linear-gradient(45deg, #16a085, #1abc9c);
      box-shadow: 0 0 15px rgba(22, 160, 133, 0.6);
    }
  }

  .my-games-badge {
    background: linear-gradient(45deg, #7e188d, #9920a9);

    &.active {
      background: linear-gradient(45deg, #9920a9, #bd2cd0);
      box-shadow: 0 0 15px rgba(153, 32, 169, 0.6);
    }
  }

  .friends-games-badge {
    background: linear-gradient(45deg, #3498db, #2980b9);

    &.active {
      background: linear-gradient(45deg, #2980b9, #3498db);
      box-shadow: 0 0 15px rgba(41, 128, 185, 0.6);
    }
  }

  .posts-badge {
    background: linear-gradient(45deg, #9b59b6, #8e44ad);

    &.active {
      background: linear-gradient(45deg, #8e44ad, #9b59b6);
      box-shadow: 0 0 15px rgba(155, 89, 182, 0.6);
    }
  }

  .reset-badge {
    background: linear-gradient(45deg, #95a5a6, #7f8c8d);

    &:hover {
      background: linear-gradient(45deg, #7f8c8d, #95a5a6);
    }
  }

  .select-container {
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
    display: flex;
    align-items: center;

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

  .videogames-grid {
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
    .videogames-grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }

  @media (max-width: 576px) {
    .videogames-grid {
      grid-template-columns: 1fr;
    }

    .videogames-container {
      margin: 1rem auto;
    }

    .header h2 {
      font-size: 1.8rem;
    }
  }

  .select-filters-container {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-top: 10px;
  }

  .select-container {
    flex: 1;
    min-width: 250px;
  }

  .genre-select-container .custom-select-header {
    border-left: 3px solid #00a2ae;
  }

  .platform-select-container .custom-select-header {
    border-left: 3px solid #7e188d;
  }
`;

export default VideogamesPage;
