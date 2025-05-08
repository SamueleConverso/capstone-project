import React, { useState, useEffect } from "react";
import styled from "styled-components";
import * as Icon from "react-bootstrap-icons";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getUserById, getOtherUserById } from "../redux/actions/user";
import { addApplicationUserFriend } from "../redux/actions/applicationUserFriend";
import { jwtDecode } from "jwt-decode";
import FriendList from "./FriendList";
import FriendListToAccept from "./FriendListToAccept";
import {
  acceptApplicationUserFriend,
  rejectApplicationUserFriend,
  removeApplicationUserFriend,
} from "../redux/actions/applicationUserFriend";

const UserProfileView = () => {
  const { userId } = useParams();
  const currentUser = useSelector((state) => state.profile.user);
  const otherUser = useSelector((state) => state.profile.userToView);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showBio, setShowBio] = useState(false);
  const [showFriendList, setShowFriendList] = useState(true);
  const [showFriendRequests, setShowFriendRequests] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [profileUser, setProfileUser] = useState(null);
  const [profileUserSet, setProfileUserSet] = useState(false);
  const [profileUserSetToOtherUser, setProfileUserSetToOtherUser] =
    useState(false);
  const [currentUserSet, setCurrentUserSet] = useState(false);

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
    if (!loggedInUserId) return;

    setLoading(true);
    setLoadingUser(true);

    if (loggedInUserId === userId) {
      if (currentUser) {
        setProfileUser(currentUser);
        setLoadingUser(false);
        setLoading(false);
      } else {
        dispatch(getUserById(userId))
          .then(() => {
            setLoadingUser(false);
            setLoading(false);
          })
          .catch(() => {
            setLoadingUser(false);
            setLoading(false);
          });
      }
    } else {
      dispatch(getOtherUserById(userId))
        .then(() => {
          setLoadingUser(false);
          setLoading(false);
        })
        .catch(() => {
          setLoadingUser(false);
          setLoading(false);
        });
    }
  }, [dispatch, userId, loggedInUserId, currentUser]);

  useEffect(() => {
    if (loggedInUserId === userId && currentUser) {
      setProfileUser(currentUser);
      setLoadingUser(false);
      setLoading(false);
    } else if (otherUser && otherUser.applicationUserId === userId) {
      setProfileUser(otherUser);
      setLoadingUser(false);
      setLoading(false);
    }
  }, [currentUser, otherUser, userId, loggedInUserId]);

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
              <span className="progress-label">Caricamento profilo...</span>
              <Icon.FileEarmarkPerson
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

  const activeUser = loggedInUserId === userId ? currentUser : profileUser;

  const isFriend = () => {
    if (
      !activeUser ||
      !activeUser.friendList ||
      !activeUser.friendList.applicationUserFriends
    ) {
      return false;
    }

    return activeUser.friendList.applicationUserFriends.some(
      (friendship) =>
        friendship.applicationUser &&
        friendship.applicationUser.applicationUserId ===
          profileUser.applicationUserId &&
        friendship.accepted === true
    );
  };

  const isPendingFriendRequest = () => {
    if (
      !activeUser ||
      !activeUser.friendList ||
      !activeUser.friendList.applicationUserFriends
    ) {
      return false;
    }

    return activeUser.friendList.applicationUserFriends.some(
      (friendship) =>
        friendship.applicationUser &&
        friendship.applicationUser.applicationUserId ===
          profileUser.applicationUserId &&
        friendship.accepted === null
    );
  };

  const handleFriendRequest = () => {
    dispatch(
      addApplicationUserFriend(
        profileUser.applicationUserId,
        currentUser.friendList.friendListId,
        null,
        currentUser.applicationUserId
      )
    );
  };

  const isReceivedFriendRequest = () => {
    if (
      !activeUser ||
      !activeUser.applicationUserFriends ||
      !Array.isArray(activeUser.applicationUserFriends)
    ) {
      return false;
    }

    return activeUser.applicationUserFriends.some(
      (friendship) =>
        friendship.friendList?.applicationUser?.applicationUserId ===
          profileUser.applicationUserId && friendship.accepted === null
    );
  };

  const handleAcceptFriendRequest = () => {
    const friendRequest = activeUser.applicationUserFriends.find(
      (friendship) =>
        friendship.friendList?.applicationUser?.applicationUserId ===
        profileUser.applicationUserId
    );

    if (friendRequest) {
      const applicationUserFriendId = friendRequest.applicationUserFriendId;
      const userFriendListId = activeUser.friendList.friendListId;
      const friendId = profileUser.applicationUserId;

      dispatch(
        acceptApplicationUserFriend(
          applicationUserFriendId,
          true,
          userFriendListId,
          friendId,
          activeUser.applicationUserId,
          null,
          true,
          true
        )
      );
    }
  };

  const handleRejectFriendRequest = () => {
    const friendRequest = activeUser.applicationUserFriends.find(
      (friendship) =>
        friendship.friendList?.applicationUser?.applicationUserId ===
        profileUser.applicationUserId
    );

    if (friendRequest) {
      const applicationUserFriendId = friendRequest.applicationUserFriendId;

      dispatch(
        rejectApplicationUserFriend(
          applicationUserFriendId,
          activeUser.applicationUserId,
          true,
          null,
          true,
          profileUser.applicationUserId
        )
      );
    }
  };

  const handleRemoveFriend = () => {
    const friendship = activeUser.friendList.applicationUserFriends.find(
      (friend) =>
        friend.applicationUser &&
        friend.applicationUser.applicationUserId ===
          profileUser.applicationUserId
    );

    if (friendship) {
      const applicationUserFriendId = friendship.applicationUserFriendId;

      dispatch(
        removeApplicationUserFriend(
          applicationUserFriendId,
          activeUser,
          true,
          true,
          profileUser.applicationUserId
        )
      );
    }
  };

  const handleCancelFriendRequest = () => {
    const friendship = activeUser.friendList.applicationUserFriends.find(
      (friend) =>
        friend.applicationUser &&
        friend.applicationUser.applicationUserId ===
          profileUser.applicationUserId
    );

    if (friendship) {
      const applicationUserFriendId = friendship.applicationUserFriendId;

      dispatch(
        rejectApplicationUserFriend(
          applicationUserFriendId,
          activeUser.applicationUserId,
          true,
          null,
          true,
          profileUser.applicationUserId
        )
      );
    }
  };

  const handleMessage = () => {
    console.log("Invia messaggio a", profileUser.displayName);
  };

  const getPostCount = () => {
    return profileUser.posts ? profileUser.posts.length : 0;
  };

  const getFriendCount = () => {
    if (
      profileUser.friendList &&
      profileUser.friendList.applicationUserFriends
    ) {
      return profileUser.friendList.applicationUserFriends.filter(
        (friend) => friend.accepted === true
      ).length;
    }
    return 0;
  };

  const getVideogameCount = () => {
    return profileUser.videogames ? profileUser.videogames.length : 0;
  };

  const hasUserCommunities = () => {
    return (
      (profileUser.communities && profileUser.communities.length > 0) ||
      (profileUser.communityApplicationUsers &&
        profileUser.communityApplicationUsers.length > 0)
    );
  };

  const getCommunityCount = () => {
    return profileUser.communities ? profileUser.communities.length : 0;
  };

  const getMemberCommunitiesCount = () => {
    if (!profileUser.communityApplicationUsers) return 0;

    const createdCommunityIds = profileUser.communities
      ? profileUser.communities.map((community) => community.communityId)
      : [];

    return profileUser.communityApplicationUsers.filter(
      (membership) =>
        !createdCommunityIds.includes(membership.community?.communityId)
    ).length;
  };

  const profileImage = profileUser.avatar
    ? profileUser.avatar
    : `https://localhost:7105${profileUser.picture}`;

  if (!currentUser) {
    return <div>Non ancora caricato</div>;
  }

  return (
    <StyledWrapper>
      <motion.div
        className="profile-card mt-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="profile-header">
          <motion.div
            className="profile-image"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img src={profileImage} alt={profileUser.displayName} />
          </motion.div>
          <div className="header-content">
            <div className="profile-titles">
              {profileUser.title && (
                <div className="user-title">{profileUser.title}</div>
              )}
              <div className="user-badges">
                {profileUser.isGamer && (
                  <motion.span
                    className="badge gamer-badge"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon.Controller className="badge-icon" /> Gamer
                  </motion.span>
                )}
                {profileUser.isDeveloper && (
                  <motion.span
                    className="badge dev-badge"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon.Code className="badge-icon" /> Developer
                  </motion.span>
                )}
                {profileUser.isEditor && (
                  <motion.span
                    className="badge editor-badge"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon.PencilSquare className="badge-icon" /> Editor
                  </motion.span>
                )}
              </div>
            </div>
            <div className="name-section">
              <h2 className="profile-name">
                {profileUser.firstName} {profileUser.lastName}
              </h2>
              {profileUser.displayName && (
                <div className="profile-username">
                  @{profileUser.displayName}
                </div>
              )}
            </div>
            <div className="location-info">
              {((profileUser.city && profileUser.city !== "") ||
                (profileUser.country && profileUser.country !== "")) && (
                <div className="location">
                  <Icon.GeoAlt className="location-icon" />
                  <span>
                    {profileUser.city}
                    {profileUser.city && profileUser.country ? ", " : ""}
                    {profileUser.country}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {profileUser.bio && (
          <motion.div
            className="profile-bio"
            initial={{ height: showBio ? "auto" : "60px" }}
            animate={{ height: showBio ? "auto" : "60px" }}
            transition={{ duration: 0.3 }}
          >
            <p>{profileUser.bio}</p>
            {profileUser.bio.length > 100 && (
              <button
                className="bio-toggle"
                onClick={() => setShowBio(!showBio)}
              >
                {showBio ? "Mostra meno" : "Mostra tutto"}
              </button>
            )}
          </motion.div>
        )}

        <div className="profile-actions">
          {!isFriend() &&
            !isReceivedFriendRequest() &&
            currentUser.applicationUserId !== profileUser.applicationUserId && (
              <motion.button
                className={`action-btn add-friend-btn ${
                  isPendingFriendRequest() ? "pending" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={
                  isPendingFriendRequest()
                    ? handleCancelFriendRequest
                    : handleFriendRequest
                }
              >
                {isPendingFriendRequest() ? (
                  <>
                    <Icon.XCircle className="btn-icon" /> Annulla richiesta
                  </>
                ) : (
                  <>
                    <Icon.PersonPlus className="btn-icon" /> Aggiungi amico
                  </>
                )}
              </motion.button>
            )}

          {isReceivedFriendRequest() && (
            <div className="friend-request-actions">
              <motion.button
                className="action-btn accept-request-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAcceptFriendRequest}
              >
                <Icon.PersonCheckFill className="btn-icon" /> Accetta richiesta
              </motion.button>
              <motion.button
                className="action-btn reject-request-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRejectFriendRequest}
              >
                <Icon.PersonXFill className="btn-icon" /> Rifiuta richiesta
              </motion.button>
            </div>
          )}

          {isFriend() && (
            <div className="friend-actions">
              <motion.button
                className="action-btn message-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMessage}
              >
                <Icon.Chat className="btn-icon" /> Messaggio
              </motion.button>
              <motion.button
                className="action-btn remove-friend-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRemoveFriend}
              >
                <Icon.PersonDashFill className="btn-icon" /> Rimuovi amico
              </motion.button>
            </div>
          )}

          <motion.button
            className="action-btn view-posts-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              navigate(`/user-posts/${profileUser.applicationUserId}`)
            }
          >
            <Icon.Collection className="btn-icon" /> Visualizza post
          </motion.button>

          {hasUserCommunities() && (
            <motion.button
              className="action-btn communities-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                navigate(`/user-communities/${profileUser.applicationUserId}`)
              }
            >
              <Icon.PeopleFill className="btn-icon" /> Community
            </motion.button>
          )}

          {profileUser.isDeveloper && profileUser.videogames.length > 0 && (
            <motion.button
              className="action-btn games-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                navigate(`/user-games/${profileUser.applicationUserId}`)
              }
            >
              <Icon.Joystick className="btn-icon" /> Videogiochi
            </motion.button>
          )}
        </div>

        {activeUser &&
          activeUser.applicationUserId === profileUser.applicationUserId && (
            <div className="d-flex justify-content-center gap-2 mb-4">
              <div>
                <motion.button
                  className="action-btn friends-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFriendList((prev) => !prev)}
                >
                  <Icon.PeopleFill className="btn-icon" />{" "}
                  {showFriendList ? "Nascondi amici" : "Mostra amici"}
                </motion.button>
              </div>
              <div>
                <motion.button
                  className="action-btn requests-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFriendRequests((prev) => !prev)}
                >
                  <Icon.PersonPlusFill className="btn-icon" />{" "}
                  {showFriendRequests
                    ? "Nascondi richieste"
                    : "Richieste di amicizia"}
                </motion.button>
              </div>
            </div>
          )}

        <div className="social-links">
          <motion.button
            className="social-btn twitter"
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg viewBox="0 0 24 24">
              <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z" />
            </svg>
          </motion.button>
          <motion.button
            className="social-btn twitch"
            whileHover={{ scale: 1.2, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Icon.Twitch />
          </motion.button>
          <motion.button
            className="social-btn discord"
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Icon.Discord />
          </motion.button>
          <motion.button
            className="social-btn steam"
            whileHover={{ scale: 1.2, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Icon.Steam />
          </motion.button>
        </div>

        <div className="profile-stats">
          <motion.div
            className="stat-item"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="stat-value">{getFriendCount()}</div>
            <div className="stat-label">
              <Icon.People className="stat-icon" /> Amici
            </div>
          </motion.div>

          <motion.div
            className="stat-item"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="stat-value">{getPostCount()}</div>
            <div className="stat-label">
              <Icon.FilePost className="stat-icon" /> Post
            </div>
          </motion.div>

          <motion.div
            className="stat-item"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="stat-value">{getCommunityCount()}</div>
            <div className="stat-label">
              <Icon.PeopleFill className="stat-icon" /> Community create
            </div>
          </motion.div>

          <motion.div
            className="stat-item"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="stat-value">{getMemberCommunitiesCount()}</div>
            <div className="stat-label">
              <Icon.PersonBadge className="stat-icon" /> Community partecipate
            </div>
          </motion.div>

          {profileUser.isDeveloper && (
            <motion.div
              className="stat-item"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="stat-value">{getVideogameCount()}</div>
              <div className="stat-label">
                <Icon.Controller className="stat-icon" /> Giochi pubblicati
              </div>
            </motion.div>
          )}
        </div>

        <div className="join-date">
          <Icon.CalendarCheck className="join-icon" />
          Membro dal{" "}
          {new Date(profileUser.createdAt).toLocaleDateString("it-IT", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </motion.div>
      {activeUser &&
        activeUser.applicationUserId === profileUser.applicationUserId && (
          <div className="friends-container">
            {showFriendList && activeUser.friendList && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <FriendList user={activeUser} />
              </motion.div>
            )}

            {showFriendRequests && activeUser.friendList && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <FriendListToAccept user={activeUser} />
              </motion.div>
            )}
          </div>
        )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .profile-card {
    position: relative;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    background: linear-gradient(145deg, #1a1a1a, #212121);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 2rem;
    color: #e0e0e0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(126, 24, 141, 0.2),
      inset 0 1px 1px rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.05);
    overflow: hidden;
  }

  .profile-card::before {
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

  .profile-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 1;
  }

  .profile-image {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    border: 3px solid #05bdc2;
    background: #1a1a1a;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3), 0 0 8px rgba(126, 24, 141, 0.5);
    position: relative;
  }

  .profile-image::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      145deg,
      rgba(126, 24, 141, 0.3),
      rgba(0, 162, 174, 0.2)
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .profile-image:hover::after {
    opacity: 1;
  }

  .profile-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .header-content {
    flex-grow: 1;
  }

  .profile-titles {
    margin-bottom: 0.5rem;
  }

  .user-title {
    font-size: 0.9rem;
    color: #05bdc2;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .user-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .badge {
    display: flex;
    align-items: center;
    background: rgba(30, 30, 30, 0.6);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .badge-icon {
    margin-right: 0.3rem;
    font-size: 0.9rem;
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

  .name-section {
    margin-bottom: 0.75rem;
  }

  .profile-name {
    font-size: 1.7rem;
    font-weight: 600;
    margin: 0 0 0.2rem 0;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .profile-username {
    font-size: 1rem;
    color: #9e9e9e;
  }

  .location-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #9e9e9e;
    font-size: 0.9rem;
  }

  .location {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .location-icon {
    color: #05bdc2;
  }

  .profile-bio {
    background: rgba(30, 30, 30, 0.4);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .profile-bio p {
    margin: 0;
    line-height: 1.6;
    color: #bdbdbd;
  }

  .bio-toggle {
    background: none;
    border: none;
    color: #05bdc2;
    cursor: pointer;
    font-size: 0.9rem;
    position: absolute;
    bottom: 0.5rem;
    right: 1rem;
    padding: 0.2rem 0.5rem;
    background: rgba(30, 30, 30, 0.8);
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .bio-toggle:hover {
    color: #7e188d;
    transform: translateY(-2px);
  }

  .profile-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 2;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.2rem;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background: linear-gradient(145deg, #1f1f1f, #282828);
    color: #e0e0e0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    font-size: 0.9rem;
    flex-grow: 1;
  }

  .btn-icon {
    margin-right: 0.5rem;
    font-size: 1rem;
  }

  .add-friend-btn {
    background: linear-gradient(145deg, #05bdc2, #049ba0);
    color: white;
  }

  .add-friend-btn:hover {
    background: linear-gradient(145deg, #06d6dc, #05bdc2);
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(5, 189, 194, 0.3);
  }

  .add-friend-btn.pending {
    //background: linear-gradient(145deg,rgba(219, 213, 102, 0.78),rgba(226, 255, 62, 0.3));
    background: linear-gradient(
      145deg,
      rgba(255, 235, 54, 0.28),
      rgb(45, 45, 45)
    );
    color: #9e9e9e;
    cursor: pointer;
  }

  .message-btn {
    background: linear-gradient(145deg, #7e188d, #9920a9);
    color: white;
  }

  .message-btn:hover {
    background: linear-gradient(145deg, #9920a9, #7e188d);
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(126, 24, 141, 0.3);
  }

  .view-posts-btn {
    background: linear-gradient(145deg, #3d3d3d, #2d2d2d);
  }

  .view-posts-btn:hover {
    background: linear-gradient(145deg, #4a4a4a, #3d3d3d);
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
    color: #05bdc2;
  }

  .games-btn {
    background: linear-gradient(145deg, #3d3d3d, #2d2d2d);
  }

  .games-btn:hover {
    background: linear-gradient(145deg, #4a4a4a, #3d3d3d);
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
    color: #7e188d;
  }

  .social-links {
    display: flex;
    gap: 0.8rem;
    margin-bottom: 1.5rem;
    justify-content: center;
  }

  .social-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(145deg, #212121, #2c2c2c);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    color: #9e9e9e;
    font-size: 1.2rem;
    transition: all 0.3s ease;
  }

  .social-btn svg {
    width: 20px;
    height: 20px;
    fill: #9e9e9e;
    transition: fill 0.3s ease;
  }

  .social-btn:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }

  .social-btn.twitter:hover svg {
    fill: #1da1f2;
  }

  .social-btn.twitch:hover {
    color: #9146ff;
  }

  .social-btn.discord:hover {
    color: #7289da;
  }

  .social-btn.steam:hover {
    color: #00adee;
  }

  .profile-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 1;
  }

  .stat-item {
    background: rgba(30, 30, 30, 0.4);
    border-radius: 10px;
    padding: 1rem;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
  }

  .stat-item:hover {
    background: rgba(40, 40, 40, 0.6);
    border-color: rgba(5, 189, 194, 0.3);
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 0.2rem;
  }

  .stat-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    font-size: 0.85rem;
    color: #9e9e9e;
  }

  .stat-icon {
    color: #05bdc2;
  }

  .join-date {
    text-align: center;
    font-size: 0.85rem;
    color: #757575;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  }

  .join-icon {
    color: #05bdc2;
  }

  @media (max-width: 768px) {
    .profile-header {
      flex-direction: column;
      text-align: center;
    }

    .header-content {
      width: 100%;
    }

    .user-badges {
      justify-content: center;
    }

    .profile-actions {
      flex-direction: column;
    }

    .action-btn {
      width: 100%;
    }
  }

  @media (max-width: 576px) {
    .profile-card {
      padding: 1.5rem;
    }

    .profile-stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .friends-btn {
    background: linear-gradient(145deg, #3d3d3d, #2d2d2d);
  }

  .friends-btn:hover {
    background: linear-gradient(145deg, #4a4a4a, #3d3d3d);
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
    color: #05bdc2;
  }

  .requests-btn {
    background: linear-gradient(145deg, #3d3d3d, #2d2d2d);
  }

  .requests-btn:hover {
    background: linear-gradient(145deg, #4a4a4a, #3d3d3d);
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
    color: #7e188d;
  }

  .friends-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .friend-request-actions {
    display: flex;
    gap: 1rem;
    width: 100%;
  }

  .accept-request-btn {
    background: linear-gradient(145deg, #32cd32, #2fb62f);
    color: white;
    flex: 1;
  }

  .accept-request-btn:hover {
    background: linear-gradient(145deg, #38e038, #32cd32);
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(50, 205, 50, 0.3);
  }

  .reject-request-btn {
    background: linear-gradient(145deg, #dc3545, #c82333);
    color: white;
    flex: 1;
  }

  .reject-request-btn:hover {
    background: linear-gradient(145deg, #e04353, #dc3545);
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(220, 53, 69, 0.3);
  }

  .friend-actions {
    display: flex;
    gap: 1rem;
    width: 100%;
  }

  .remove-friend-btn {
    background: linear-gradient(145deg, #b03a3a, #9a3232);
    color: white;
    flex: 1;
  }

  .remove-friend-btn:hover {
    background: linear-gradient(145deg, #c04040, #b03a3a);
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(176, 58, 58, 0.3);
  }

  .communities-btn {
    background: linear-gradient(145deg, #7e188d, #9920a9);
    color: white;
  }

  .communities-btn:hover {
    background: linear-gradient(145deg, #9920a9, #7e188d);
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(126, 24, 141, 0.3);
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

export default UserProfileView;
