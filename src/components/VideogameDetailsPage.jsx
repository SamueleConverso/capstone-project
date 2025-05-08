import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import * as Icon from "react-bootstrap-icons";
import { jwtDecode } from "jwt-decode";
import { getUserById, getOtherUserById } from "../redux/actions/user";
import { getVideogame, removeVideogame } from "../redux/actions/videogame";
import { getPosts } from "../redux/actions/post";
import VideogamePost from "./VideogamePost";
import PublishPostInVideogame from "./PublishPostInVideogame";

const VideogameDetailsPage = () => {
  const { videogameId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const videogame = useSelector((state) => state.videogame.videogame);
  const currentUser = useSelector((state) => state.profile.user);
  const otherUser = useSelector((state) => state.profile.userToView);
  const allPosts = useSelector((state) => state.post.posts);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("newest");
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showDevInfo, setShowDevInfo] = useState(false);

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
    if (videogameId) {
      setIsLoading(true);
      dispatch(getVideogame(videogameId))
        .catch((error) => {
          console.error("Errore nel caricare il videogioco:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [videogameId]);

  useEffect(() => {
    if (currentUserId) {
      dispatch(getUserById(currentUserId));
    }
  }, [currentUserId, dispatch]);

  useEffect(() => {
    if (
      videogame?.applicationUser &&
      videogame?.applicationUser?.applicationUserId !== currentUserId
    ) {
      dispatch(getOtherUserById(videogame.applicationUser.applicationUserId));
    }
  }, [videogame, currentUserId, dispatch]);

  useEffect(() => {
    dispatch(getPosts());
  }, [dispatch]);

  useEffect(() => {
    if (allPosts && videogame) {
      const gamePosts = allPosts.filter((post) => {
        return (
          post.videogame && post.videogame.videogameId === videogame.videogameId
        );
      });

      setFilteredPosts(gamePosts);
      applyPostFilter(gamePosts, activeFilter);
    }
  }, [allPosts, videogame, activeFilter]);

  const formatReleaseDate = (dateString) => {
    if (!dateString) return "Data non disponibile";
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const toggleFilter = (filter) => {
    if (activeFilter === filter) {
      setActiveFilter("newest");
    } else {
      setActiveFilter(filter);
      applyPostFilter(filteredPosts, filter);
    }
  };

  const applyPostFilter = useCallback(
    (posts, filter) => {
      if (!posts) return [];

      let result = [...posts];

      switch (filter) {
        case "newest":
          result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case "oldest":
          result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case "friendsPosts":
          if (currentUser && currentUser.friendList) {
            const friendIds = currentUser.friendList.applicationUserFriends
              .filter((f) => f.accepted === true)
              .map((f) => f.applicationUser.applicationUserId);

            result = result.filter(
              (post) =>
                post.applicationUser &&
                friendIds.includes(post.applicationUser.applicationUserId)
            );
          }
          break;
        case "mostComments":
          result.sort(
            (a, b) => (b.comments?.length || 0) - (a.comments?.length || 0)
          );
          break;
        case "mostLikes":
          result.sort(
            (a, b) => (b.postLikes?.length || 0) - (a.postLikes?.length || 0)
          );
          break;
        case "lookingForGamers":
          result = result.filter((post) => post.isLookingForGamers === true);
          break;
        case "lookingForDevelopers":
          result = result.filter(
            (post) => post.isLookingForDevelopers === true
          );
          break;
        default:
          break;
      }

      setFilteredPosts(result);
    },
    [currentUser]
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsHeaderVisible(scrollPosition < 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleDeleteVideogame = () => {
    if (window.confirm("Sei sicuro di voler eliminare questo videogioco?")) {
      dispatch(removeVideogame(videogameId, navigate));
    }
  };

  const isOwner = () => {
    return (
      videogame?.applicationUser &&
      currentUser &&
      videogame.applicationUser.applicationUserId ===
        currentUser.applicationUserId
    );
  };

  const handleUserClick = () => {
    if (videogame?.applicationUser) {
      navigate(`/other-user/${videogame.applicationUser.applicationUserId}`);
    }
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="loading-content"
        >
          <div className="spinner"></div>
          <h3>Caricamento in corso...</h3>
        </motion.div>
      </LoadingContainer>
    );
  }

  if (!videogame) {
    return (
      <ErrorContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Icon.ExclamationTriangleFill size={60} />
          <h3>Videogioco non trovato</h3>
          <p>Il videogioco richiesto non è disponibile o è stato rimosso.</p>
          <BackButton
            as={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/videogames")}
          >
            <Icon.ArrowLeftCircle /> Vai ai videogiochi
          </BackButton>
        </motion.div>
      </ErrorContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <HeaderSection>
          <HeaderOverlay />

          <motion.div
            className="nav-buttons"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isOwner() && (
              <motion.button
                className="delete-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDeleteVideogame}
              >
                <Icon.Trash size={18} />
                <span>Elimina Videogioco</span>
              </motion.button>
            )}
          </motion.div>

          <AnimatePresence>
            {isHeaderVisible && (
              <motion.div
                className="header-content"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="title-section">
                  <h1>{videogame.title}</h1>
                  {videogame.subtitle && <h2>{videogame.subtitle}</h2>}
                </div>

                <div className="header-badges">
                  <span className="platform-badge">{videogame.platform}</span>
                  <span className="genre-badge">{videogame.genre}</span>
                  <span className="age-badge">{videogame.ageRating}+</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </HeaderSection>

        <MainCard>
          <ContentSection>
            <LeftColumn>
              <GameImageContainer
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: imageLoaded ? 1 : 0,
                  y: imageLoaded ? 0 : 20,
                }}
                transition={{ duration: 0.5 }}
              >
                {videogame.picture ? (
                  <img
                    src={`https://localhost:7105${videogame.picture}`}
                    alt={videogame.title}
                    onLoad={() => setImageLoaded(true)}
                  />
                ) : (
                  <img
                    src={"../../public/assets/img/GameController.png"}
                    alt={videogame.title}
                    onLoad={() => setImageLoaded(true)}
                  />
                )}

                <div className="image-overlay">
                  <div className="tech-line tech-line-1"></div>
                  <div className="tech-line tech-line-2"></div>
                  <div className="tech-circle"></div>
                </div>
              </GameImageContainer>

              <GameInfoCard
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CardHeader>
                  <div className="header-icon">
                    <Icon.InfoCircle size={20} />
                  </div>
                  <h3>Informazioni di base</h3>
                </CardHeader>

                <InfoItem>
                  <Icon.Calendar3 className="icon" />
                  <div className="info-content">
                    <span className="label">Data di rilascio</span>
                    <span className="value">
                      {formatReleaseDate(videogame.releaseDate)}
                    </span>
                  </div>
                </InfoItem>

                <InfoItem>
                  <Icon.GeoAlt className="icon" />
                  <div className="info-content">
                    <span className="label">Origine</span>
                    <span className="value">
                      {videogame.city && videogame.country
                        ? `${videogame.city}, ${videogame.country}`
                        : "Non specificato"}
                    </span>
                  </div>
                </InfoItem>

                {videogame.contributors && (
                  <InfoItem>
                    <Icon.People className="icon" />
                    <div className="info-content">
                      <span className="label">Collaboratori</span>
                      <span className="value">{videogame.contributors}</span>
                    </div>
                  </InfoItem>
                )}

                {videogame.link && (
                  <InfoItem>
                    <Icon.Link45deg className="icon" />
                    <div className="info-content">
                      <span className="label">Sito Web</span>
                      <a
                        href={
                          videogame.link.startsWith("http")
                            ? videogame.link
                            : `https://${videogame.link}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="website-link"
                      >
                        Visita il sito
                        <Icon.BoxArrowUpRight size={12} />
                      </a>
                    </div>
                  </InfoItem>
                )}

                <motion.button
                  className="show-more-btn"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? (
                    <>
                      <Icon.ChevronUp size={16} /> Nascondi dettagli
                    </>
                  ) : (
                    <>
                      <Icon.ChevronDown size={16} /> Mostra più dettagli
                    </>
                  )}
                </motion.button>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      className="extra-details"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {videogame.extraDescription && (
                        <p className="extra-description">
                          {videogame.extraDescription}
                        </p>
                      )}

                      {videogame.video && (
                        <div className="video-container">
                          <h4>
                            <Icon.PlayCircle /> Video di presentazione
                          </h4>
                          <div className="video-wrapper">
                            <video
                              src={`https://localhost:7105${videogame.video}`}
                              controls
                              poster={`https://localhost:7105${videogame.picture}`}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </GameInfoCard>

              {videogame.applicationUser && (
                <DeveloperCard
                  as={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <CardHeader>
                    <div className="header-icon">
                      <Icon.PersonBadge size={20} />
                    </div>
                    <h3>Sviluppatore</h3>
                  </CardHeader>

                  <DevProfileSection onClick={handleUserClick}>
                    <div className="dev-avatar">
                      <img
                        src={`https://localhost:7105${videogame.applicationUser.picture}`}
                        alt={
                          videogame.applicationUser.displayName ||
                          `${videogame.applicationUser.firstName} ${videogame.applicationUser.lastName}`
                        }
                      />
                      <div className="avatar-glow"></div>
                    </div>

                    <div className="dev-info">
                      <h4>
                        {videogame.applicationUser.displayName ||
                          `${videogame.applicationUser.firstName} ${videogame.applicationUser.lastName}`}
                      </h4>

                      <div className="dev-badges">
                        {videogame.applicationUser.isGamer && (
                          <span className="dev-badge gamer">
                            <Icon.Controller className="badge-icon" />
                            Gamer
                          </span>
                        )}
                        {videogame.applicationUser.isDeveloper && (
                          <span className="dev-badge developer">
                            <Icon.Code className="badge-icon" />
                            Developer
                          </span>
                        )}
                      </div>

                      <div className="location-info">
                        {videogame.applicationUser.city &&
                          videogame.applicationUser.country && (
                            <span>
                              <Icon.GeoAlt size={12} />
                              {videogame.applicationUser.city},{" "}
                              {videogame.applicationUser.country}
                            </span>
                          )}
                      </div>
                    </div>

                    <Icon.ChevronRight className="navigate-icon" />
                  </DevProfileSection>

                  <motion.button
                    className="show-more-btn"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowDevInfo(!showDevInfo)}
                  >
                    {showDevInfo ? (
                      <>
                        <Icon.ChevronUp size={16} /> Nascondi informazioni
                      </>
                    ) : (
                      <>
                        <Icon.ChevronDown size={16} /> Mostra informazioni
                      </>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {showDevInfo && (
                      <motion.div
                        className="dev-extra-info"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {videogame.applicationUser.bio && (
                          <div className="bio-section">
                            <h5>
                              <Icon.ChatQuote size={14} /> Biografia
                            </h5>
                            <p>{videogame.applicationUser.bio}</p>
                          </div>
                        )}

                        {videogame.applicationUser.isDeveloper && (
                          <div className="role-section">
                            <h5>
                              <Icon.Briefcase size={14} /> Ruolo
                            </h5>
                            <p className="dev-role">
                              {videogame.applicationUser.developerRole ===
                                "projectManager" && "Project Manager"}
                              {videogame.applicationUser.developerRole ===
                                "programmer" && "Programmatore"}
                              {videogame.applicationUser.developerRole ===
                                "designer" && "Designer"}
                              {videogame.applicationUser.developerRole ===
                                "artist" && "Artista"}
                              {videogame.applicationUser.developerRole ===
                                "soundDesigner" && "Sound Designer"}
                              {!videogame.applicationUser.developerRole &&
                                "Non specificato"}
                            </p>
                          </div>
                        )}

                        <motion.button
                          className="visit-profile-btn"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleUserClick}
                        >
                          <Icon.PersonLinesFill size={16} />
                          Visita profilo completo
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </DeveloperCard>
              )}
            </LeftColumn>

            <RightColumn>
              <DescriptionCard
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CardHeader>
                  <div className="header-icon">
                    <Icon.FileEarmarkText size={20} />
                  </div>
                  <h3>Descrizione</h3>
                </CardHeader>

                <div className="description-content">
                  <p>{videogame.description}</p>
                </div>

                <div className="tech-deco tech-deco-1"></div>
                <div className="tech-deco tech-deco-2"></div>
              </DescriptionCard>

              <PostsSection
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <CardHeader className="with-filters">
                  <div className="header-left">
                    <div className="header-icon">
                      <Icon.ChatSquareText size={20} />
                    </div>
                    <h3>Post relativi a questo gioco</h3>
                  </div>

                  <span className="posts-count">
                    {filteredPosts?.length || 0} post
                  </span>
                </CardHeader>

                <FiltersContainer>
                  <div className="filters-header">
                    <Icon.Filter className="filter-icon" />
                    <h5>Filtra Post</h5>
                  </div>

                  <div className="filter-badges">
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
                      className={`filter-badge friends-badge ${
                        activeFilter === "friendsPosts" ? "active" : ""
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFilter("friendsPosts")}
                    >
                      <Icon.People size={14} />
                      <span>Amici</span>
                    </motion.div>

                    <motion.div
                      className={`filter-badge comments-badge ${
                        activeFilter === "mostComments" ? "active" : ""
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFilter("mostComments")}
                    >
                      <Icon.ChatLeftText size={14} />
                      <span>Più Commenti</span>
                    </motion.div>

                    <motion.div
                      className={`filter-badge likes-badge ${
                        activeFilter === "mostLikes" ? "active" : ""
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFilter("mostLikes")}
                    >
                      <Icon.Heart size={14} />
                      <span>Più Like</span>
                    </motion.div>

                    <motion.div
                      className={`filter-badge gamers-badge ${
                        activeFilter === "lookingForGamers" ? "active" : ""
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFilter("lookingForGamers")}
                    >
                      <Icon.Controller size={14} />
                      <span>Cerca Gamers</span>
                    </motion.div>

                    <motion.div
                      className={`filter-badge devs-badge ${
                        activeFilter === "lookingForDevelopers" ? "active" : ""
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFilter("lookingForDevelopers")}
                    >
                      <Icon.Code size={14} />
                      <span>Cerca Developers</span>
                    </motion.div>
                  </div>
                </FiltersContainer>

                <div className="posts-list">
                  {filteredPosts && filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                      <div key={post.postId} className="my-3">
                        <VideogamePost
                          post={post}
                          currentUserId={currentUserId}
                        />
                      </div>
                    ))
                  ) : (
                    <NoPosts>
                      <Icon.X size={40} />
                      <h4>Nessun post trovato</h4>
                      <p>
                        Non ci sono ancora post relativi a questo videogioco o
                        nessun post corrisponde ai filtri selezionati.
                      </p>
                    </NoPosts>
                  )}
                </div>
              </PostsSection>
            </RightColumn>
          </ContentSection>
          <div className="mt-5">
            <PublishPostInVideogame
              videogameId={videogame.videogameId}
              videogameTitle={videogame.title}
            />
          </div>
        </MainCard>
      </ContentWrapper>
      <GlowEffect />
    </PageContainer>
  );
};

const PageContainer = styled.div`
  position: relative;
  width: 100%;
  overflow-x: hidden;
  min-height: 100vh;
  //background: linear-gradient(145deg, #1a1a1a, #212121);
  padding-bottom: 60px;

  /* Aggiungiamo un pattern di sfondo sottile */
  &:before {
    content: "";
    position: fixed;
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
    z-index: -2;
    pointer-events: none;
  }
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 576px) {
    padding: 0 15px;
  }
`;

const MainCard = styled.div`
  position: relative;
  width: 100%;
  margin: -50px auto 0;
  //background: linear-gradient(145deg, #1a1a1a, #212121);
  background: linear-gradient(
    145deg,
    rgba(26, 26, 46, 0.9),
    rgba(22, 22, 42, 0.9)
  );
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  color: #e0e0e0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(126, 24, 141, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  z-index: 10;

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

  @media (max-width: 576px) {
    padding: 1.5rem;
  }
`;

const GlowEffect = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(126, 24, 141, 0.1) 0%,
    rgba(0, 162, 174, 0.05) 30%,
    transparent 70%
  );
  z-index: -1;
`;

const HeaderSection = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 20px 20px 0 0; // Aggiungi border-radius in alto
  background-size: cover;
  background-position: center;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 30px 30px;

  .nav-buttons {
    position: absolute;
    top: 30px;
    left: 30px;
    display: flex;
    gap: 15px;
    z-index: 10;

    button {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(18, 18, 32, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      padding: 8px 16px;
      border-radius: 30px;
      font-size: 0.9rem;
      cursor: pointer;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(30, 30, 50, 0.8);
      }

      &.delete-btn {
        background: rgba(220, 53, 69, 0.3);

        &:hover {
          background: rgba(220, 53, 69, 0.5);
        }
      }
    }
  }

  .header-content {
    position: relative;
    width: 100%;
    max-width: 1100px;
    z-index: 5;
    text-align: center; // Aggiunto per centrare il testo
    display: flex;
    flex-direction: column;
    align-items: center; // Aggiunto per centrare i figli

    .title-section {
      margin-bottom: 16px;

      h1 {
        font-size: 3.2rem;
        color: white;
        margin: 0;
        font-weight: 700;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        line-height: 1.1;
      }

      h2 {
        font-size: 1.5rem;
        color: rgba(255, 255, 255, 0.8);
        margin: 8px 0 0;
        font-weight: 400;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        font-style: italic;
      }
    }

    .header-badges {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;

      span {
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      }

      .platform-badge {
        background: linear-gradient(
          45deg,
          rgba(126, 24, 141, 0.8),
          rgba(153, 32, 169, 0.8)
        );
        color: white;
      }

      .genre-badge {
        background: linear-gradient(
          45deg,
          rgba(0, 162, 174, 0.8),
          rgba(0, 187, 208, 0.8)
        );
        color: white;
      }

      .age-badge {
        background: rgba(244, 67, 54, 0.8);
        color: white;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        padding: 0;
      }
    }
  }

  @media (max-width: 768px) {
    height: 350px;
    padding: 0 20px 20px;

    .nav-buttons {
      top: 20px;
      left: 20px;

      button {
        padding: 6px 12px;
        font-size: 0.8rem;

        span {
          display: none;
        }
      }
    }

    .header-content {
      .title-section {
        h1 {
          font-size: 2.3rem;
        }

        h2 {
          font-size: 1.1rem;
        }
      }
    }
  }

  @media (max-width: 576px) {
    height: 300px;

    .header-content {
      .title-section {
        h1 {
          font-size: 1.8rem;
        }

        h2 {
          font-size: 1rem;
        }
      }

      .header-badges {
        gap: 8px;

        span {
          padding: 4px 10px;
          font-size: 0.75rem;
        }

        .age-badge {
          width: 30px;
          height: 30px;
        }
      }
    }
  }
`;

const HeaderOverlay = styled.div`
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   width: 100%;
  //   height: 100%;
  //   background: linear-gradient(
  //     to bottom,
  //     rgba(18, 18, 32, 0.5) 0%,
  //     rgba(18, 18, 32, 0.8) 60%,
  //     rgba(18, 18, 32, 1) 100%
  //   );
  //   z-index: 1;
`;

const ContentSection = styled.div`
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(300px, 2fr);
  gap: 30px;
  position: relative;
  z-index: 10;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 576px) {
    gap: 20px;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const GameImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 380px;
  border-radius: 16px;
  overflow: hidden;
  background-color: rgba(26, 26, 46, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .placeholder-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.3);
    background: linear-gradient(145deg, #1a1a2e 0%, #16162a 100%);
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      transparent 70%,
      rgba(18, 18, 32, 0.8) 100%
    );
    pointer-events: none;

    .tech-line {
      position: absolute;
      height: 2px;
      background: rgba(0, 162, 174, 0.5);
      box-shadow: 0 0 10px rgba(0, 162, 174, 0.8);
    }

    .tech-line-1 {
      width: 80%;
      bottom: 30px;
      left: 10%;
      animation: techLine 8s infinite linear;
    }

    .tech-line-2 {
      width: 40%;
      bottom: 40px;
      right: 0;
      animation: techLine 5s infinite linear;
    }

    .tech-circle {
      position: absolute;
      width: 100px;
      height: 100px;
      border: 2px solid rgba(126, 24, 141, 0.5);
      border-radius: 50%;
      bottom: 50px;
      left: 20px;
      box-shadow: 0 0 15px rgba(126, 24, 141, 0.3);
      opacity: 0.3;
      animation: pulse 3s infinite ease-in-out;
    }
  }

  &:hover img {
    transform: scale(1.05);
  }

  &:after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      45deg,
      rgba(126, 24, 141, 0.2) 0%,
      transparent 50%
    );
    pointer-events: none;
  }

  @keyframes techLine {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.5;
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;

  &.with-filters {
    justify-content: space-between;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .posts-count {
      background: rgba(126, 24, 141, 0.2);
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(126, 24, 141, 0.3);
    }
  }

  .header-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      rgba(126, 24, 141, 0.2),
      rgba(0, 162, 174, 0.2)
    );
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.9);

    svg {
      filter: drop-shadow(0 0 5px rgba(0, 162, 174, 0.5));
    }
  }

  h3 {
    margin: 0;
    color: white;
    font-size: 1.4rem;
    font-weight: 600;
  }
`;

const GameInfoCard = styled.div`
  background: linear-gradient(
    145deg,
    rgba(26, 26, 46, 0.9),
    rgba(22, 22, 42, 0.9)
  );
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);

  .show-more-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(
      45deg,
      rgba(126, 24, 141, 0.2),
      rgba(0, 162, 174, 0.2)
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    padding: 10px;
    border-radius: 10px;
    margin-top: 20px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(
        45deg,
        rgba(126, 24, 141, 0.3),
        rgba(0, 162, 174, 0.3)
      );
    }
  }

  .extra-details {
    overflow: hidden;

    .extra-description {
      background: rgba(0, 0, 0, 0.2);
      padding: 15px;
      border-radius: 10px;
      margin-top: 15px;
      font-style: italic;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.95rem;
      line-height: 1.5;
      border-left: 3px solid rgba(0, 162, 174, 0.5);
    }

    .video-container {
      margin-top: 20px;

      h4 {
        color: white;
        font-size: 1rem;
        margin: 0 0 10px;
        display: flex;
        align-items: center;
        gap: 8px;

        svg {
          color: #7e188d;
        }
      }

      .video-wrapper {
        width: 100%;
        height: auto;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);

        video {
          width: 100%;
          display: block;
        }
      }
    }
  }
`;

const InfoItem = styled.div`
  display: flex;
  margin-bottom: 20px;

  &.price-item {
    .value.price {
      color: #4caf50;
      font-weight: 700;
    }
  }

  .icon {
    width: 24px;
    height: 24px;
    margin-right: 15px;
    color: rgba(0, 162, 174, 0.9);
  }

  .info-content {
    display: flex;
    flex-direction: column;

    .label {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.85rem;
      margin-bottom: 4px;
    }

    .value {
      color: white;
      font-size: 1rem;
    }

    .website-link {
      color: #00a2ae;
      display: flex;
      align-items: center;
      gap: 5px;
      text-decoration: none;
      font-size: 0.95rem;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const DeveloperCard = styled.div`
  background: linear-gradient(
    145deg,
    rgba(26, 26, 46, 0.9),
    rgba(22, 22, 42, 0.9)
  );
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);

  .show-more-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(
      45deg,
      rgba(126, 24, 141, 0.2),
      rgba(0, 162, 174, 0.2)
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    padding: 10px;
    border-radius: 10px;
    margin-top: 20px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(
        45deg,
        rgba(126, 24, 141, 0.3),
        rgba(0, 162, 174, 0.3)
      );
    }
  }

  .dev-extra-info {
    overflow: hidden;
    margin-top: 15px;

    .bio-section,
    .role-section {
      background: rgba(0, 0, 0, 0.2);
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 15px;

      h5 {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;
        margin: 0 0 8px;
        display: flex;
        align-items: center;
        gap: 5px;

        svg {
          color: #00a2ae;
        }
      }

      p {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
        line-height: 1.5;
        margin: 0;
      }

      .dev-role {
        color: #7e188d;
        font-weight: 600;
      }
    }

    .visit-profile-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: linear-gradient(45deg, #7e188d, #9920a9);
      color: white;
      padding: 10px;
      border-radius: 10px;
      cursor: pointer;
      border: none;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 10px rgba(126, 24, 141, 0.3);

      &:hover {
        background: linear-gradient(45deg, #9920a9, #7e188d);
        box-shadow: 0 6px 15px rgba(126, 24, 141, 0.4);
      }
    }
  }
`;

const DevProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);

    .avatar-glow {
      opacity: 0.8;
    }

    .navigate-icon {
      transform: translateX(5px);
      opacity: 1;
    }
  }

  .dev-avatar {
    position: relative;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-glow {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      box-shadow: 0 0 15px rgba(0, 162, 174, 0.6);
      opacity: 0.4;
      transition: opacity 0.3s ease;
    }
  }

  .dev-info {
    flex: 1;

    h4 {
      color: white;
      font-size: 1rem;
      margin: 0 0 5px;
      font-weight: 600;
    }

    .dev-badges {
      display: flex;
      gap: 8px;
      margin-bottom: 5px;

      .dev-badge {
        font-size: 0.7rem;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 2px 6px;
        border-radius: 10px;
        font-weight: 600;

        &.gamer {
          background: linear-gradient(45deg, #7e188d, #9920a9);
          color: white;
        }

        &.developer {
          background: linear-gradient(45deg, #00a2ae, #00bbd0);
          color: white;
        }

        .badge-icon {
          font-size: 0.7rem;
        }
      }
    }

    .location-info {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.6);
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .navigate-icon {
    color: rgba(255, 255, 255, 0.5);
    font-size: 1.2rem;
    opacity: 0.7;
    transition: all 0.3s ease;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  //background: #121220;

  .loading-content {
    text-align: center;

    h3 {
      color: white;
      font-weight: 500;
      margin-top: 20px;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(0, 162, 174, 0.3);
      border-top: 3px solid #7e188d;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
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
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  background: #121220;
  color: white;
  text-align: center;

  svg {
    color: rgba(244, 67, 54, 0.8);
    margin-bottom: 20px;
  }

  h3 {
    font-size: 1.8rem;
    margin-bottom: 10px;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 25px;
    max-width: 400px;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(
    45deg,
    rgba(126, 24, 141, 0.8),
    rgba(0, 162, 174, 0.8)
  );
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  &:hover {
    box-shadow: 0 6px 15px rgba(126, 24, 141, 0.5);
    transform: translateY(-2px);
  }
`;

const DescriptionCard = styled.div`
  background: linear-gradient(
    145deg,
    rgba(26, 26, 46, 0.9),
    rgba(22, 22, 42, 0.9)
  );
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;

  .description-content {
    position: relative;
    z-index: 2;

    p {
      color: rgba(255, 255, 255, 0.85);
      font-size: 1rem;
      line-height: 1.7;
      white-space: pre-wrap;
      margin: 0;
    }
  }

  .tech-deco {
    position: absolute;
    border-radius: 50%;
    opacity: 0.1;
    z-index: 1;

    &.tech-deco-1 {
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, #7e188d 0%, transparent 70%);
      bottom: -100px;
      right: -50px;
    }

    &.tech-deco-2 {
      width: 150px;
      height: 150px;
      border: 2px solid #00a2ae;
      top: -50px;
      left: 30px;
    }
  }
`;

const PostsSection = styled.div`
  background: linear-gradient(
    145deg,
    rgba(26, 26, 46, 0.9),
    rgba(22, 22, 42, 0.9)
  );
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);

  .posts-list {
    margin-top: 20px;
    max-height: 800px;
    overflow-y: auto;
    padding-right: 10px;

    /* Scrollbar styling */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, #7e188d, #00a2ae);
      border-radius: 10px;
    }
  }
`;

const FiltersContainer = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 14px;
  padding: 15px;
  margin-top: 15px;
  margin-bottom: 20px;

  .filters-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    h5 {
      margin: 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.95rem;
      font-weight: 500;
    }

    .filter-icon {
      color: #00a2ae;
    }
  }

  .filter-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    .filter-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &.active {
        background: linear-gradient(
          45deg,
          rgba(126, 24, 141, 0.3),
          rgba(0, 162, 174, 0.3)
        );
        border: 1px solid rgba(0, 162, 174, 0.4);
        color: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      &.newest-badge.active {
        //background: linear-gradient(45deg, #7e188d, #9920a9);
        background: linear-gradient(45deg, #ff9800, #ff5722);
      }

      &.oldest-badge.active {
        //background: linear-gradient(45deg, #00a2ae, #00bbd0);
        background: linear-gradient(45deg, #2196f3, #3f51b5);
      }

      &.friends-badge.active {
        background: linear-gradient(45deg, #8e44ad, #3498db);
      }

      &.comments-badge.active {
        background: linear-gradient(45deg, #e67e22, #f39c12);
      }

      &.likes-badge.active {
        background: linear-gradient(45deg, #e74c3c, #c0392b);
      }

      &.gamers-badge.active {
        //background: linear-gradient(45deg, #ff9800, #ff5722);
        background: linear-gradient(45deg, #7e188d, #9920a9);
      }

      &.devs-badge.active {
        //background: linear-gradient(45deg, #2196f3, #3f51b5);
        background: linear-gradient(45deg, #00a2ae, #00bbd0);
      }
    }
  }
`;

const NoPosts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 14px;
  padding: 30px 20px;
  color: rgba(255, 255, 255, 0.7);

  svg {
    color: rgba(255, 255, 255, 0.3);
    margin-bottom: 15px;
  }

  h4 {
    color: white;
    margin: 0 0 10px;
    font-size: 1.2rem;
  }

  p {
    max-width: 300px;
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0;
  }
`;

export default VideogameDetailsPage;
