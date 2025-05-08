import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { motion } from "framer-motion";
import * as Icon from "react-bootstrap-icons";
import {
  addCommunityApplicationUser,
  removeCommunityApplicationUser,
} from "../redux/actions/communityApplicationUser";
import { removeCommunity } from "../redux/actions/community";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const CommunityCard = ({ community, loggedInUserId, forceOwner }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.profile.user);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasGaming = community.type?.includes("Gaming");

  const hasDevelopment = community.type?.includes("Development");

  const hasBothTypes = hasGaming && hasDevelopment;

  const isUserCompatibleWithCommunity = () => {
    if (!currentUser) return true;

    if (hasBothTypes) return true;

    if (hasGaming && !hasDevelopment && !currentUser.isGamer) return false;

    if (hasDevelopment && !hasGaming && !currentUser.isDeveloper) return false;

    return true;
  };

  const getIncompatibilityMessage = () => {
    if (!isUserCompatibleWithCommunity()) {
      if (hasGaming && !hasDevelopment) {
        return "Solo Gamers";
      } else if (hasDevelopment && !hasGaming) {
        return "Solo Developers";
      }
    }
    return "";
  };

  const isMember = community.communityApplicationUsers?.some(
    (cau) =>
      cau.applicationUser?.applicationUserId ===
      (currentUser?.applicationUserId || loggedInUserId)
  );

  const isOwner =
    forceOwner ||
    community.applicationUser?.applicationUserId ===
      currentUser?.applicationUserId;

  const handleDeleteCommunity = (e) => {
    e.preventDefault();
    if (showDeleteConfirm) {
      dispatch(removeCommunity(community.communityId));
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleJoin = () => {
    if (!currentUser) return;

    dispatch(
      addCommunityApplicationUser(
        currentUser.applicationUserId,
        community.communityId
      )
    );
  };

  const handleLeave = () => {
    if (!currentUser) return;

    const userCommunityRelation = community.communityApplicationUsers?.find(
      (cau) =>
        cau.applicationUser?.applicationUserId ===
        currentUser?.applicationUserId
    );

    if (userCommunityRelation) {
      dispatch(
        removeCommunityApplicationUser(
          userCommunityRelation.communityApplicationUserId
        )
      );
    }
  };

  const memberCount = community.communityApplicationUsers?.length || 0;
  const percentFull = (memberCount / community.maxMembers) * 100;

  return (
    <StyledCard
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="cover-container">
        {community.cover ? (
          <img
            src={community.cover}
            alt={`${community.name} cover`}
            className="cover-image"
          />
        ) : (
          <div
            className={`cover-placeholder ${hasBothTypes ? "dual-type" : ""}`}
          >
            {hasGaming && <Icon.Controller size={hasBothTypes ? 24 : 30} />}
            {hasDevelopment && (
              <Icon.CodeSquare size={hasBothTypes ? 24 : 30} />
            )}
          </div>
        )}

        <div className="community-badges">
          {hasGaming && (
            <div className="community-badge gaming">
              <Icon.Controller className="badge-icon" />
              <span>Gaming</span>
            </div>
          )}

          {hasDevelopment && (
            <div className="community-badge development">
              <Icon.CodeSquare className="badge-icon" />
              <span>Development</span>
            </div>
          )}
        </div>

        {community.isPrivate && (
          <div className="privacy-badge">
            <Icon.LockFill />
          </div>
        )}
      </div>

      <div className="community-info">
        <div className="community-header">
          <div className="community-image">
            {community.picture ? (
              <img src={community.picture} alt={community.name} />
            ) : (
              <div className="image-placeholder">
                {community.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="community-titles">
            <h3>{community.name}</h3>
            {community.extraName && <h4>{community.extraName}</h4>}
          </div>
        </div>

        <div className="community-description">
          <p>{community.description}</p>
          {community.extraDescription && (
            <p className="extra-description">{community.extraDescription}</p>
          )}
        </div>

        <div className="community-meta">
          <div className="created-info">
            <Icon.Calendar3 className="meta-icon" />
            <span>
              Creata il{" "}
              {format(new Date(community.createdAt), "d MMMM yyyy", {
                locale: it,
              })}
            </span>
          </div>

          <div className="members-info">
            <Icon.PeopleFill className="meta-icon" />
            <span>
              {memberCount} / {community.maxMembers} membri
            </span>
          </div>
        </div>

        <div className="members-progress-container">
          <div className="members-progress">
            <div
              className={`progress-bar ${
                percentFull >= 90
                  ? "almost-full"
                  : percentFull >= 50
                  ? "half-full"
                  : ""
              }`}
              style={{ width: `${percentFull}%` }}
            ></div>
          </div>
        </div>

        <div className="community-actions">
          {isOwner ? (
            <>
              <Link
                to={`/community-details/${community.communityId}`}
                className="owner-button"
              >
                <Icon.GearFill className="btn-icon" />
                <span>Gestisci</span>
              </Link>
              <button
                className={`delete-button ${
                  showDeleteConfirm ? "confirm" : ""
                }`}
                onClick={handleDeleteCommunity}
              >
                {showDeleteConfirm ? (
                  <>
                    <Icon.ExclamationTriangleFill className="btn-icon" />
                    <span>Conferma</span>
                  </>
                ) : (
                  <>
                    <Icon.TrashFill className="btn-icon" />
                    <span>Elimina</span>
                  </>
                )}
              </button>
            </>
          ) : isMember ? (
            <>
              <Link
                to={`/community-details/${community.communityId}`}
                className="visit-button"
              >
                <Icon.BoxArrowInRight className="btn-icon" />
                <span>Visita</span>
              </Link>
              <button className="leave-button" onClick={handleLeave}>
                <Icon.DoorOpenFill className="btn-icon" />
                <span>Esci</span>
              </button>
            </>
          ) : (
            <button
              className="join-button"
              onClick={handleJoin}
              disabled={
                memberCount >= community.maxMembers ||
                !isUserCompatibleWithCommunity()
              }
            >
              {memberCount >= community.maxMembers ? (
                <>
                  <Icon.ExclamationCircleFill className="btn-icon" />
                  <span>Piena</span>
                </>
              ) : !isUserCompatibleWithCommunity() ? (
                <>
                  <Icon.ExclamationTriangleFill className="btn-icon" />
                  <span>{getIncompatibilityMessage()}</span>
                </>
              ) : (
                <>
                  <Icon.PersonPlusFill className="btn-icon" />
                  <span>Unisciti</span>
                </>
              )}
            </button>
          )}

          {community.link && (
            <a
              href={community.link}
              target="_blank"
              rel="noopener noreferrer"
              className="external-button"
            >
              <Icon.BoxArrowUpRight className="btn-icon" />
              <span>Link</span>
            </a>
          )}
        </div>

        {community.applicationUser && (
          <Link
            to={`/other-user/${community.applicationUser.applicationUserId}`}
            className="creator-info"
          >
            <div className="creator-avatar">
              {community.applicationUser.picture ? (
                <img
                  src={`https://localhost:7105/${community.applicationUser.picture}`}
                  alt={
                    community.applicationUser.displayName ||
                    `${community.applicationUser.firstName} ${community.applicationUser.lastName}`
                  }
                />
              ) : (
                <Icon.PersonCircle />
              )}
            </div>
            <div className="creator-name">
              <span>Creata da</span>
              <strong>
                {community.applicationUser.displayName ||
                  `${community.applicationUser.firstName} ${community.applicationUser.lastName}` ||
                  "Utente"}
              </strong>
              <div className="creator-badges">
                {community.applicationUser.isGamer && (
                  <span className="creator-badge gamer">
                    <Icon.Controller className="me-1" />
                    <span className="badge-text">Gamer</span>
                  </span>
                )}
                {community.applicationUser.isDeveloper && (
                  <span className="creator-badge developer">
                    <Icon.Code className="me-1" />
                    <span className="badge-text">Developer</span>
                  </span>
                )}
              </div>
            </div>
          </Link>
        )}
      </div>
    </StyledCard>
  );
};

const StyledCard = styled(motion.div)`
  background: linear-gradient(
    135deg,
    rgba(22, 22, 30, 0.95),
    rgba(30, 30, 40, 0.9)
  );
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2), 0 0 10px rgba(140, 20, 160, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(126, 24, 141, 0.2);

  &:hover {
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(140, 20, 160, 0.2);
    border-color: rgba(126, 24, 141, 0.4);
  }

  .cover-container {
    height: 120px;
    position: relative;
    overflow: hidden;

    .cover-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .cover-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #4b0082, #7e188d);
      color: rgba(255, 255, 255, 0.3);

      &.dual-type {
        background: linear-gradient(135deg, #4b0082, #05bdc2, #7e188d);
        gap: 20px;
      }
    }

    &:hover .cover-image {
      transform: scale(1.05);
    }
  }

  .community-badges {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    gap: 8px;
  }

  .community-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 600;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(3px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

    &.gaming {
      color: #7e188d;
    }

    &.development {
      color: #05bdc2;
    }

    .badge-icon {
      font-size: 0.8rem;
    }
  }

  .privacy-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    color: #ff5a5a;
    backdrop-filter: blur(3px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .community-info {
    padding: 15px;
  }

  .community-header {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    position: relative;

    .community-image {
      width: 60px;
      height: 60px;
      border-radius: 15px;
      overflow: hidden;
      border: 2px solid rgba(126, 24, 141, 0.7);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #7e188d, #05bdc2);
        color: white;
        font-size: 1.5rem;
        font-weight: bold;
      }
    }

    .community-titles {
      display: flex;
      flex-direction: column;
      justify-content: center;

      h3 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
        color: white;
        line-height: 1.3;
      }

      h4 {
        margin: 0;
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.6);
        font-weight: 500;
      }
    }
  }

  .community-description {
    margin-bottom: 15px;

    p {
      margin: 0 0 8px;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.4;

      &.extra-description {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.8rem;
        font-style: italic;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .community-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 8px;

    .created-info,
    .members-info {
      display: flex;
      align-items: center;
      gap: 5px;

      .meta-icon {
        color: #05bdc2;
      }
    }
  }

  .members-progress-container {
    margin-bottom: 15px;

    .members-progress {
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;

      .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #05bdc2, #7e188d);
        border-radius: 3px;
        transition: width 0.3s ease;

        &.half-full {
          background: linear-gradient(90deg, #05bdc2, #e67e22);
        }

        &.almost-full {
          background: linear-gradient(90deg, #e67e22, #ff5a5a);
        }
      }
    }
  }

  .community-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 15px;
    flex-wrap: wrap;

    button,
    a {
      flex: 1;
      min-width: 90px;
      padding: 8px;
      border-radius: 8px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;

      .btn-icon {
        font-size: 0.9rem;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.7;
      }
    }

    .join-button {
      background: linear-gradient(135deg, #7e188d, #05bdc2);
      color: white;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 5px 10px rgba(126, 24, 141, 0.3);
      }

      &:disabled {
        background: linear-gradient(135deg, #444, #555);
      }
    }

    .leave-button {
      background: rgba(255, 90, 90, 0.2);
      color: #ff5a5a;

      &:hover {
        background: rgba(255, 90, 90, 0.4);
      }
    }

    .visit-button {
      background: linear-gradient(135deg, #05bdc2, #00a2ae);
      color: white;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 10px rgba(0, 162, 174, 0.3);
      }
    }

    .owner-button {
      background: linear-gradient(135deg, #e67e22, #d35400);
      color: white;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 10px rgba(230, 126, 34, 0.3);
      }
    }

    .external-button {
      background: rgba(255, 255, 255, 0.1);
      color: #ccc;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }
    }

    .delete-button {
      background: rgba(255, 90, 90, 0.2);
      color: #ff5a5a;

      &:hover {
        background: rgba(255, 90, 90, 0.4);
      }

      &.confirm {
        background: linear-gradient(135deg, #ff5a5a, #ff0000);
        color: white;
        animation: pulse 1.2s infinite;

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 90, 90, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 90, 90, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 90, 90, 0);
          }
        }
      }
    }
  }

  .creator-info {
    display: flex;
    align-items: center;
    gap: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 10px;
    text-decoration: none;
    cursor: pointer;
    border-radius: 8px;
    padding: 10px;
    margin-top: 5px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
      transform: translateY(-2px);
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      background: rgba(255, 255, 255, 0.08);
    }

    .creator-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #333;
      transition: transform 0.2s ease;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      svg {
        color: #666;
        font-size: 15px;
      }
    }

    &:hover .creator-avatar {
      transform: scale(1.1);
    }

    .creator-name {
      display: flex;
      flex-direction: column;
      font-size: 0.7rem;

      span {
        color: #777;
      }

      strong {
        color: #ccc;
        font-size: 0.75rem;
        transition: color 0.2s ease;
      }
    }

    &:hover .creator-name strong {
      color: white;
    }
  }

  .creator-badges {
    display: flex;
    gap: 4px;
    margin-top: 2px;
  }

  .creator-badge {
    font-size: 9px;
    padding: 1px 5px;
    border-radius: 8px;
    line-height: 1.2;
    display: flex;
    align-items: center;
    justify-content: center;

    &.developer {
      background: rgba(5, 189, 194, 0.2);
      color: #05bdc2;
    }

    &.gamer {
      background: rgba(126, 24, 141, 0.2);
      color: #9920a9;
    }

    .badge-text {
      display: inline-flex;
      align-items: center;
    }
  }
`;

export default CommunityCard;
