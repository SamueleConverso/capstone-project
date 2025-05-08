import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import * as Icon from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeVideogame } from "../redux/actions/videogame";
import { jwtDecode } from "jwt-decode";

const VideogameCard = ({ videogame }) => {
  const defaultImage = "../../public/assets/img/GameController.png";
  const defaultUserImage = "../../public/assets/img/DefaultUser.png";
  const [currentUserId, setCurrentUserId] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  const formatDate = (dateString) => {
    if (!dateString) return "Data non disponibile";
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };
  const handleDelete = (e) => {
    e.stopPropagation();

    if (window.confirm("Sei sicuro di voler eliminare questo videogioco?")) {
      dispatch(removeVideogame(videogame.videogameId, navigate));
    }
  };

  const isAuthor =
    videogame.applicationUser &&
    currentUserId &&
    videogame.applicationUser.applicationUserId === currentUserId;

  return (
    <StyledCard
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="card-glow" />

      {isAuthor && (
        <motion.button
          className="delete-btn"
          onClick={handleDelete}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Icon.Trash />
        </motion.button>
      )}

      <div className="card-image">
        {videogame.picture ? (
          <img
            src={`https://localhost:7105/${videogame.picture}`}
            alt={videogame.title}
          />
        ) : (
          <img src={defaultImage} alt="Immagine non disponibile" />
        )}
        <div className="card-overlay">
          <div className="card-badges">
            <span className="platform-badge">{videogame.platform}</span>
            <span className="genre-badge">{videogame.genre}</span>
          </div>
        </div>
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{videogame.title}</h3>
          <div className="age-rating">{videogame.ageRating}+</div>
        </div>

        <h4 className="card-subtitle">{videogame.subtitle}</h4>

        <p className="card-description">
          {videogame.description?.length > 100
            ? `${videogame.description.substring(0, 100)}...`
            : videogame.description}
        </p>

        {videogame.applicationUser && (
          <Link
            to={`/other-user/${videogame.applicationUser.applicationUserId}`}
            className="user-card-link"
          >
            <motion.div
              className="user-card"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="user-avatar">
                {videogame.applicationUser.picture ? (
                  <img
                    src={`https://localhost:7105${videogame.applicationUser.picture}`}
                    alt={
                      videogame.applicationUser.displayName ||
                      `${videogame.applicationUser.firstName} ${videogame.applicationUser.lastName}`
                    }
                  />
                ) : (
                  <img src={defaultUserImage} alt="Avatar utente" />
                )}
              </div>
              <div className="user-info">
                <span className="user-name">
                  {videogame.applicationUser.displayName ||
                    `${videogame.applicationUser.firstName} ${videogame.applicationUser.lastName}`}
                </span>
                <div className="user-badges">
                  {videogame.applicationUser.isGamer && (
                    <span className="gamer-badge">
                      <Icon.Controller className="me-1" />
                      Gamer
                    </span>
                  )}
                  {videogame.applicationUser.isDeveloper && (
                    <span className="dev-badge">
                      <Icon.Code className="me-1" />
                      Developer
                    </span>
                  )}
                </div>
              </div>
              <Icon.ChevronRight className="navigate-icon" />
            </motion.div>
          </Link>
        )}

        <div className="card-meta">
          <div className="meta-item">
            <Icon.Calendar3 />
            <span>{formatDate(videogame.releaseDate)}</span>
          </div>
          {videogame.city && videogame.country && (
            <div className="meta-item">
              <Icon.GeoAlt />
              <span>{`${videogame.city}, ${videogame.country}`}</span>
            </div>
          )}
          <div className="meta-item">
            <Icon.ChatLeftText />
            <span>{videogame.posts?.length || 0} post</span>
          </div>
        </div>

        <div className="card-actions">
          <motion.button
            onClick={() => {
              navigate(`/videogame-details/${videogame.videogameId}`);
            }}
            className="action-btn purchase-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon.InfoCircle /> Dettagli e post
          </motion.button>

          {videogame.link && (
            <motion.button
              className="action-btn posts-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon.Link /> Sito
            </motion.button>
          )}
        </div>
      </div>
    </StyledCard>
  );
};

const StyledCard = styled(motion.div)`
  position: relative;
  width: 100%;
  background: linear-gradient(145deg, #1a1a2e 0%, #121220 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;

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

      .price-badge {
        margin-left: auto;
        background: linear-gradient(45deg, #4caf50, #2e7d32);
        color: white;
      }
    }
  }

  &:hover .card-image img {
    transform: scale(1.05);
  }

  .card-content {
    padding: 20px;
    flex: 1;
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

  .user-card-link {
    text-decoration: none;
    display: block;
    margin: 10px 0 15px;
  }

  .user-card {
    display: flex;
    align-items: center;
    background: linear-gradient(145deg, #232338 0%, #1d1d30 100%);
    border-radius: 12px;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid rgba(138, 43, 226, 0.2);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    position: relative;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 12px;
    border: 2px solid rgba(0, 162, 174, 0.6);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .user-info {
    flex: 1;
  }

  .user-name {
    color: #ffffff;
    font-size: 0.95rem;
    font-weight: 600;
    display: block;
    margin-bottom: 3px;
  }

  .user-badges {
    display: flex;
    gap: 8px;

    span {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .gamer-badge {
      background: linear-gradient(45deg, #00a2ae, #00bbd0);
      background: linear-gradient(45deg, #7e188d, #9920a9);
      color: white;
    }

    .dev-badge {
      background: linear-gradient(45deg, #00a2ae, #00bbd0);
      color: white;
    }
  }

  .navigate-icon {
    color: #05bdc2;
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1rem;
  }

  .card-description {
    color: #c0c0c7;
    font-size: 0.9rem;
    margin-bottom: 15px;
    line-height: 1.5;
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

  .card-actions {
    display: flex;
    gap: 8px;
    margin-top: auto;

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 8px 12px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.25s ease;

      svg {
        font-size: 1rem;
      }
    }

    .details-btn {
      background: linear-gradient(45deg, #3a3a50, #4a4a67);
      color: #ffffff;
      flex: 1;

      &:hover {
        background: linear-gradient(45deg, #4a4a67, #3a3a50);
      }
    }

    .posts-btn {
      background: linear-gradient(45deg, #00a2ae, #00bbd0);
      color: white;
      flex: 1;

      &:hover {
        background: linear-gradient(45deg, #00bbd0, #00a2ae);
      }
    }

    .purchase-btn {
      background: linear-gradient(45deg, #7e188d, #9920a9);
      color: white;
      flex: 1;

      &:hover {
        background: linear-gradient(45deg, #9920a9, #7e188d);
      }
    }
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
`;

export default VideogameCard;
