import React, { useState } from "react";
import styled from "styled-components";
import * as Icon from "react-bootstrap-icons";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  addApplicationUserFriend,
  acceptApplicationUserFriend,
  rejectApplicationUserFriend,
  removeApplicationUserFriend,
} from "../redux/actions/applicationUserFriend";

const SearchedUserCard = ({ user, currentUser }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  if (!user || !currentUser) {
    return null;
  }

  const handleNavigation = () => {
    navigate(`/other-user/${user.applicationUserId}`);
  };

  const isFriend = () => {
    if (
      !currentUser ||
      !currentUser.friendList ||
      !currentUser.friendList.applicationUserFriends
    ) {
      return false;
    }

    return currentUser.friendList.applicationUserFriends.some(
      (friendship) =>
        friendship.applicationUser &&
        friendship.applicationUser.applicationUserId ===
          user.applicationUserId &&
        friendship.accepted === true
    );
  };

  const isPendingFriendRequest = () => {
    if (
      !currentUser ||
      !currentUser.friendList ||
      !currentUser.friendList.applicationUserFriends
    ) {
      return false;
    }

    return currentUser.friendList.applicationUserFriends.some(
      (friendship) =>
        friendship.applicationUser &&
        friendship.applicationUser.applicationUserId ===
          user.applicationUserId &&
        friendship.accepted === null
    );
  };

  const isReceivedFriendRequest = () => {
    if (
      !currentUser ||
      !currentUser.applicationUserFriends ||
      !Array.isArray(currentUser.applicationUserFriends)
    ) {
      return false;
    }

    return currentUser.applicationUserFriends.some(
      (friendship) =>
        friendship.friendList?.applicationUser?.applicationUserId ===
          user.applicationUserId && friendship.accepted === null
    );
  };

  const handleAddFriend = () => {
    if (!currentUser || !currentUser.friendList) return;

    dispatch(
      addApplicationUserFriend(
        user.applicationUserId,
        currentUser.friendList.friendListId,
        null,
        currentUser.applicationUserId
      )
    );
  };

  const handleCancelFriendRequest = () => {
    if (!currentUser || !currentUser.friendList) return;

    const friendship = currentUser.friendList.applicationUserFriends.find(
      (friend) =>
        friend.applicationUser &&
        friend.applicationUser.applicationUserId === user.applicationUserId
    );

    if (friendship) {
      const applicationUserFriendId = friendship.applicationUserFriendId;

      dispatch(
        rejectApplicationUserFriend(
          applicationUserFriendId,
          currentUser.applicationUserId,
          true,
          null,
          true,
          user.applicationUserId
        )
      );
    }
  };

  const handleRemoveFriend = () => {
    if (!currentUser || !currentUser.friendList) return;

    const friendship = currentUser.friendList.applicationUserFriends.find(
      (friend) =>
        friend.applicationUser &&
        friend.applicationUser.applicationUserId === user.applicationUserId
    );

    if (friendship) {
      const applicationUserFriendId = friendship.applicationUserFriendId;

      dispatch(
        removeApplicationUserFriend(
          applicationUserFriendId,
          currentUser,
          true,
          true,
          user.applicationUserId
        )
      );
    }
  };

  const handleAcceptFriendRequest = () => {
    if (!currentUser) return;

    const friendRequest = currentUser.applicationUserFriends.find(
      (friendship) =>
        friendship.friendList?.applicationUser?.applicationUserId ===
        user.applicationUserId
    );

    if (friendRequest) {
      const applicationUserFriendId = friendRequest.applicationUserFriendId;
      const userFriendListId = currentUser.friendList.friendListId;
      const friendId = user.applicationUserId;

      dispatch(
        acceptApplicationUserFriend(
          applicationUserFriendId,
          true,
          userFriendListId,
          friendId,
          currentUser.applicationUserId,
          null,
          true,
          true
        )
      );
    }
  };

  const handleRejectFriendRequest = () => {
    if (!currentUser) return;

    const friendRequest = currentUser.applicationUserFriends.find(
      (friendship) =>
        friendship.friendList?.applicationUser?.applicationUserId ===
        user.applicationUserId
    );

    if (friendRequest) {
      const applicationUserFriendId = friendRequest.applicationUserFriendId;

      dispatch(
        rejectApplicationUserFriend(
          applicationUserFriendId,
          currentUser.applicationUserId,
          true,
          null,
          true,
          user.applicationUserId
        )
      );
    }
  };

  const profileImage = user.avatar
    ? user.avatar
    : `https://localhost:7105${user.picture}`;

  return (
    <StyledUserCard
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="user-card-inner">
        <div
          className="user-card-header"
          onClick={handleNavigation}
          style={{ cursor: "pointer" }}
        >
          <motion.div className="user-avatar" whileHover={{ scale: 1.05 }}>
            <img
              src={profileImage}
              alt={user.displayName || `${user.firstName} ${user.lastName}`}
            />
          </motion.div>
          <div className="user-info">
            <h3 className="user-name">
              {user.firstName} {user.lastName}
            </h3>
            {user.displayName && (
              <span className="user-displayname">@{user.displayName}</span>
            )}
            <div className="user-badges">
              {user.isGamer && (
                <span className="badge gamer-badge">
                  <Icon.Controller size={10} /> Gamer
                </span>
              )}
              {user.isDeveloper && (
                <span className="badge dev-badge">
                  <Icon.Code size={10} /> Developer
                </span>
              )}
              {user.isEditor && (
                <span className="badge editor-badge">
                  <Icon.PencilSquare size={10} /> Editor
                </span>
              )}
            </div>
          </div>
        </div>

        {user.bio && (
          <div className="user-bio">
            <p>
              {user.bio.length > 100
                ? user.bio.substring(0, 100) + "..."
                : user.bio}
            </p>
          </div>
        )}

        <div className="location-info">
          {((user.city && user.city !== "") ||
            (user.country && user.country !== "")) && (
            <div className="location">
              <Icon.GeoAlt className="location-icon" />
              <span>
                {user.city}
                {user.city && user.country ? ", " : ""}
                {user.country}
              </span>
            </div>
          )}
        </div>

        <div className="user-actions">
          {!isFriend() && !isReceivedFriendRequest() && (
            <motion.button
              className={`action-btn add-friend-btn ${
                isPendingFriendRequest() ? "pending" : ""
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={
                isPendingFriendRequest()
                  ? handleCancelFriendRequest
                  : handleAddFriend
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
                <Icon.PersonCheckFill className="btn-icon" /> Accetta
              </motion.button>
              <motion.button
                className="action-btn reject-request-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRejectFriendRequest}
              >
                <Icon.PersonXFill className="btn-icon" /> Rifiuta
              </motion.button>
            </div>
          )}

          {isFriend() && (
            <>
              <div className="is-friend-badge">
                <Icon.PersonCheckFill /> Amici
              </div>
              <motion.button
                className="action-btn remove-friend-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRemoveFriend}
              >
                <Icon.PersonDashFill className="btn-icon" /> Rimuovi amico
              </motion.button>
            </>
          )}

          <motion.button
            className="action-btn view-profile-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNavigation}
          >
            <Icon.PersonLinesFill className="btn-icon" /> Visualizza profilo
          </motion.button>
        </div>
      </div>

      {isHovered && (
        <>
          <div className="glow-effect top-glow"></div>
          <div className="glow-effect bottom-glow"></div>
        </>
      )}
    </StyledUserCard>
  );
};

const StyledUserCard = styled.div`
  height: 100%;
  position: relative;
  background: linear-gradient(145deg, #1a1a1a, #212121);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);

  .user-card-inner {
    position: relative;
    z-index: 1;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .user-card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .user-avatar {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #05bdc2;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3), 0 0 6px rgba(126, 24, 141, 0.4);
    flex-shrink: 0;
  }

  .user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-info {
    flex-grow: 1;
    min-width: 0;
  }

  .user-name {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
    color: #ffffff;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-displayname {
    display: block;
    font-size: 0.85rem;
    color: #9e9e9e;
    margin-bottom: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.4rem;
  }

  .badge {
    display: flex;
    align-items: center;
    padding: 0.15rem 0.5rem;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 500;
    border: 1px solid rgba(255, 255, 255, 0.1);
    white-space: nowrap;
  }

  .badge svg {
    margin-right: 0.2rem;
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

  .user-bio {
    background: rgba(30, 30, 30, 0.4);
    border-radius: 8px;
    padding: 0.8rem;
    margin: 0.8rem 0;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .user-bio p {
    margin: 0;
    color: #bdbdbd;
    font-size: 0.85rem;
    line-height: 1.4;
    overflow: hidden;
  }

  .location-info {
    display: flex;
    align-items: center;
    margin-bottom: 0.8rem;
    color: #9e9e9e;
    font-size: 0.8rem;
  }

  .location {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .location-icon {
    color: #05bdc2;
  }

  .user-actions {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-top: auto;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.6rem 1rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background: linear-gradient(145deg, #1f1f1f, #282828);
    color: #e0e0e0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    font-size: 0.85rem;
    width: 100%;
  }

  .btn-icon {
    margin-right: 0.5rem;
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
    background: linear-gradient(
      145deg,
      rgba(255, 235, 54, 0.28),
      rgb(45, 45, 45)
    );
    color: #9e9e9e;
  }

  .view-profile-btn {
    background: linear-gradient(145deg, #7e188d, #9920a9);
    color: white;
  }

  .view-profile-btn:hover {
    background: linear-gradient(145deg, #9920a9, #7e188d);
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(126, 24, 141, 0.3);
  }

  .is-friend-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: linear-gradient(145deg, #4267b2, #5b7bd5);
    color: white;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.85rem;
    margin-bottom: 0.2rem;
  }

  .friend-request-actions {
    display: flex;
    gap: 0.8rem;
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

  .remove-friend-btn {
    background: linear-gradient(145deg, #b03a3a, #9a3232);
    color: white;
  }

  .remove-friend-btn:hover {
    background: linear-gradient(145deg, #c04040, #b03a3a);
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(176, 58, 58, 0.3);
  }

  /* Glow effects */
  .glow-effect {
    position: absolute;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    filter: blur(30px);
    opacity: 0.4;
    pointer-events: none;
    transition: all 0.5s ease;
  }

  .top-glow {
    top: -50px;
    right: -30px;
    background: radial-gradient(
      circle,
      rgba(5, 189, 194, 0.6) 0%,
      rgba(5, 189, 194, 0) 70%
    );
    animation: pulse 3s infinite alternate;
  }

  .bottom-glow {
    bottom: -50px;
    left: -30px;
    background: radial-gradient(
      circle,
      rgba(126, 24, 141, 0.6) 0%,
      rgba(126, 24, 141, 0) 70%
    );
    animation: pulse 4s infinite alternate-reverse;
  }

  @keyframes pulse {
    0% {
      opacity: 0.3;
      transform: scale(0.8);
    }
    100% {
      opacity: 0.6;
      transform: scale(1.2);
    }
  }
`;

export default SearchedUserCard;
