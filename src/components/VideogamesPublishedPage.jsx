import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import * as Icon from "react-bootstrap-icons";
import { jwtDecode } from "jwt-decode";
import { getVideogames } from "../redux/actions/videogame";
import { getUserById } from "../redux/actions/user";
import { removeVideogame } from "../redux/actions/videogame";
import { useNavigate } from "react-router-dom";

const VideogamesPublishedPage = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const defaultImage = "../../public/assets/img/GameController.png";

  const allVideogames = useSelector((state) => state.videogame.videogames);
  const profileUser = useSelector((state) =>
    state.user.applicationUsers.find((u) => u.applicationUserId === userId)
  );
  const currentUser = useSelector((state) => state.profile.user);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [videogames, setVideogames] = useState([]);
  const [sortMethod, setSortMethod] = useState("newest");

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
    const loadData = async () => {
      setLoading(true);
      try {
        await dispatch(getVideogames());
        if (!profileUser) {
          await dispatch(getUserById(userId));
        }
      } catch (error) {
        setError("Errore nel caricamento dei dati");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch, userId, profileUser]);

  useEffect(() => {
    if (allVideogames && allVideogames.length > 0) {
      const userGames = allVideogames.filter(
        (game) =>
          game.applicationUser &&
          game.applicationUser.applicationUserId === userId
      );

      let sortedGames = [...userGames];
      switch (sortMethod) {
        case "oldest":
          sortedGames.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
          break;
        case "alphabetical":
          sortedGames.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "newest":
        default:
          sortedGames.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
      }

      setVideogames(sortedGames);
    }
  }, [allVideogames, userId, sortMethod]);

  const handleDelete = (e, videogameId) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm("Sei sicuro di voler eliminare questo videogioco?")) {
      dispatch(removeVideogame(videogameId, navigate));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Data non disponibile";
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
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
        <p>Caricamento videogiochi in corso...</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <Icon.ExclamationTriangleFill size={40} />
        <h3>Si è verificato un errore</h3>
        <p>{error}</p>
      </ErrorContainer>
    );
  }

  if (!profileUser) {
    return (
      <ErrorContainer>
        <Icon.PersonX size={40} />
        <h3>Utente non trovato</h3>
        <p>Non è stato possibile trovare l'utente richiesto.</p>
      </ErrorContainer>
    );
  }

  if (!profileUser.isDeveloper) {
    return (
      <EmptyStateContainer>
        <Icon.PersonBadge size={60} />
        <h3>Non è un developer</h3>
        <p>Questo utente non è registrato come sviluppatore.</p>
      </EmptyStateContainer>
    );
  }

  if (!videogames || videogames.length === 0) {
    return (
      <EmptyStateContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Icon.Joystick size={60} />
          <h3>Nessun videogioco pubblicato</h3>
          <p>
            {profileUser.applicationUserId === currentUserId
              ? "Non hai ancora pubblicato nessun videogioco."
              : `${
                  profileUser.displayName || profileUser.firstName
                } non ha ancora pubblicato nessun videogioco.`}
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
            <span className="count">{videogames.length}</span>
            <span className="label">Videogiochi</span>
          </div>

          <div className="filter-controls">
            <select
              value={sortMethod}
              onChange={(e) => setSortMethod(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Più recenti</option>
              <option value="oldest">Più vecchi</option>
              <option value="alphabetical">Ordine alfabetico</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="games-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AnimatePresence mode="popLayout">
          {videogames.map((game, index) => (
            <motion.div
              key={game.videogameId}
              className="game-item"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/videogame-details/${game.videogameId}`)}
            >
              <div className="card-glow" />

              {currentUserId === userId && (
                <motion.button
                  className="delete-btn"
                  onClick={(e) => handleDelete(e, game.videogameId)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon.Trash />
                </motion.button>
              )}

              <div className="card-image">
                {game.picture ? (
                  <img
                    src={`https://localhost:7105/${game.picture}`}
                    alt={game.title}
                  />
                ) : (
                  <img src={defaultImage} alt="Immagine non disponibile" />
                )}
                <div className="card-overlay">
                  <div className="card-badges">
                    <span className="platform-badge">{game.platform}</span>
                    <span className="genre-badge">{game.genre}</span>
                  </div>
                </div>
              </div>

              <div className="card-content">
                <div className="card-header">
                  <h3 className="card-title">{game.title}</h3>
                  <div className="age-rating">{game.ageRating || "NA"}+</div>
                </div>

                {game.subtitle && (
                  <h4 className="card-subtitle">{game.subtitle}</h4>
                )}

                <p className="card-description">
                  {game.description?.length > 100
                    ? `${game.description.substring(0, 100)}...`
                    : game.description}
                </p>

                <div className="card-meta">
                  <div className="meta-item">
                    <Icon.Calendar3 />
                    <span>{formatDate(game.releaseDate)}</span>
                  </div>
                  {game.city && game.country && (
                    <div className="meta-item">
                      <Icon.GeoAlt />
                      <span>{`${game.city}, ${game.country}`}</span>
                    </div>
                  )}
                  <div className="meta-item">
                    <Icon.ChatLeftText />
                    <span>{game.posts?.length || 0} post</span>
                  </div>
                </div>

                <motion.button
                  className="action-btn details-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/videogame-details/${game.videogameId}`);
                  }}
                >
                  <Icon.InfoCircle /> Dettagli e post
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  max-width: 1200px;
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

  .games-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }

  .game-item {
    position: relative;
    background: linear-gradient(145deg, #1a1a2e 0%, #121220 100%);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    cursor: pointer;
    height: 100%;
    display: flex;
    flex-direction: column;

    .card-glow {
      position: absolute;
      height: 100%;
      width: 100%;
      border-radius: 16px;
      box-shadow: inset 0 0 15px rgba(138, 43, 226, 0.3),
        inset 0 0 25px rgba(0, 162, 174, 0.2);
      pointer-events: none;
      z-index: 1;
    }

    .delete-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(220, 53, 69, 0.8);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;

      &:hover {
        background: rgba(220, 53, 69, 1);
      }

      svg {
        font-size: 18px;
      }
    }

    .card-image {
      position: relative;
      width: 100%;
      height: 180px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s ease;
      }

      .card-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        padding: 15px 10px 5px;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
      }

      .card-badges {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        span {
          font-size: 10px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .platform-badge {
          background: linear-gradient(45deg, #7e188d, #9920a9);
          color: white;
        }

        .genre-badge {
          background: linear-gradient(45deg, #00a2ae, #00bbd0);
          color: white;
        }
      }
    }

    &:hover .card-image img {
      transform: scale(1.05);
    }

    .card-content {
      padding: 20px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }

    .card-title {
      color: white;
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0;
    }

    .age-rating {
      background-color: #f44336;
      color: white;
      font-size: 12px;
      font-weight: 700;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-subtitle {
      color: #a0a0b0;
      font-size: 0.95rem;
      margin-top: 0;
      margin-bottom: 15px;
      font-weight: 500;
      font-style: italic;
    }

    .card-description {
      color: #c0c0c7;
      font-size: 0.9rem;
      margin-bottom: 15px;
      line-height: 1.5;
      flex-grow: 1;
    }

    .card-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 15px;
      font-size: 0.85rem;
      color: #a0a0b0;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;

        svg {
          font-size: 1rem;
          color: #05bdc2;
        }
      }
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 10px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.25s ease;
      margin-top: auto;

      svg {
        font-size: 1rem;
      }
    }

    .details-btn {
      background: linear-gradient(45deg, #7e188d, #9920a9);
      color: white;

      &:hover {
        background: linear-gradient(45deg, #9920a9, #7e188d);
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(126, 24, 141, 0.3);
      }
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

    .games-container {
      grid-template-columns: 1fr;
    }
  }

  @media (min-width: 769px) and (max-width: 1200px) {
    .games-container {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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

export default VideogamesPublishedPage;
