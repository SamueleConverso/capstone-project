import React from "react";
import styled from "styled-components";
import UserDropdownMenu from "./UserDropdownMenu";
import * as Icon from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

const UserCard = (props) => {
  const navigate = useNavigate();
  return (
    <StyledWrapper>
      <div className="profile-card">
        <div className="profile-image">
          <img
            style={{ height: "94px", width: "94px" }}
            src={
              props.user.avatar
                ? props.user.avatar
                : `https://localhost:7105${props.user.picture}`
            }
          />
        </div>
        <div className="profile-info">
          {props.user.title && (
            <p className="text-center m-0">{props.user.title}</p>
          )}
          <div className="d-flex justify-content-center gap-2">
            {props.user.isGamer && <p className="text-center m-0">Gamer</p>}
            {props.user.isDeveloper && (
              <p className="text-center m-0">Developer</p>
            )}
            {props.user.isEditor && <p className="text-center m-0">Editor</p>}
          </div>
          <div className="d-flex justify-content-between">
            <div>
              <p className="profile-name">
                {props.user.firstName} {props.user.lastName}
              </p>
            </div>
            <div className="d-flex justify-content-end">
              <div className="dropdown">
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <Icon.Gear />
                </button>
                <ul className="dropdown-menu">
                  <UserDropdownMenu />
                </ul>
              </div>
            </div>
          </div>
          {props.user.displayName && (
            <div className="profile-title">@{props.user.displayName}</div>
          )}
          {props.user.bio && (
            <div className="profile-bio">{props.user.bio}</div>
          )}
        </div>
        <div className="social-links">
          <button className="social-btn twitter">
            <svg viewBox="0 0 24 24">
              <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z" />
            </svg>
          </button>
          <button className="social-btn instagram">
            <svg viewBox="0 0 24 24">
              <path d="M16.98 0a6.9 6.9 0 0 1 5.08 1.98A6.94 6.94 0 0 1 24 7.02v9.96c0 2.08-.68 3.87-1.98 5.13A7.14 7.14 0 0 1 16.94 24H7.06a7.06 7.06 0 0 1-5.03-1.89A6.96 6.96 0 0 1 0 16.94V7.02C0 2.8 2.8 0 7.02 0h9.96zm.05 2.23H7.06c-1.45 0-2.7.43-3.53 1.25a4.82 4.82 0 0 0-1.3 3.54v9.92c0 1.5.43 2.7 1.3 3.58a5 5 0 0 0 3.53 1.25h9.88a5 5 0 0 0 3.53-1.25 4.73 4.73 0 0 0 1.4-3.54V7.02a5 5 0 0 0-1.3-3.49 4.82 4.82 0 0 0-3.54-1.3zM12 5.76c3.39 0 6.2 2.8 6.2 6.2a6.2 6.2 0 0 1-12.4 0 6.2 6.2 0 0 1 6.2-6.2zm0 2.22a3.99 3.99 0 0 0-3.97 3.97A3.99 3.99 0 0 0 12 15.92a3.99 3.99 0 0 0 3.97-3.97A3.99 3.99 0 0 0 12 7.98z" />
            </svg>
          </button>
          <button className="social-btn linkedin">
            <svg viewBox="0 0 24 24">
              <path d="M22.23 0H1.77C.8 0 0 .8 0 1.77v20.46C0 23.2.8 24 1.77 24h20.46c.98 0 1.77-.8 1.77-1.77V1.77C24 .8 23.2 0 22.23 0zM7.27 20.1H3.65V9.24h3.62V20.1zM5.47 7.76h-.03c-1.22 0-2-.83-2-1.87 0-1.06.8-1.87 2.05-1.87 1.24 0 2 .8 2.02 1.87 0 1.04-.78 1.87-2.05 1.87zM20.34 20.1h-3.63v-5.8c0-1.45-.52-2.45-1.83-2.45-1 0-1.6.67-1.87 1.32-.1.23-.11.55-.11.88v6.05H9.28s.05-9.82 0-10.84h3.63v1.54a3.6 3.6 0 0 1 3.26-1.8c2.39 0 4.18 1.56 4.18 4.89v6.21z" />
            </svg>
          </button>
          <button className="social-btn github">
            <svg viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </button>
        </div>
        <div className="d-flex justify-content-center gap-3">
          <div className="d-flex justify-content-center">
            <button
              className="cta-button"
              onClick={() => {
                navigate("/feed");
              }}
            >
              <Icon.PencilSquare className="me-1 mb-1" />
              Pubblica post
            </button>
          </div>
          <div className="d-flex justify-content-center">
            <button className="cta-button">
              <Icon.PlusSquare className="me-1 mb-1" />
              Crea community
            </button>
          </div>
          {props.user.isDeveloper && (
            <div className="d-flex justify-content-center">
              <button className="cta-button">
                <Icon.Controller className="me-1 mb-1" />
                Pubblica videogioco
              </button>
            </div>
          )}
        </div>
        <div className="stats">
          <div className="stat-item">
            <div className="stat-value">
              {
                props.user.friendList.applicationUserFriends.filter(
                  (friend) =>
                    friend.accepted === true || friend.accepted === "true"
                ).length
              }
            </div>
            <div className="stat-label">Amici</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{props.user.posts.length}</div>
            <div className="stat-label">Post pubblicati</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{props.user.communities.length}</div>
            <div className="stat-label">Community create da te</div>
          </div>
          {props.user.isDeveloper && (
            <div className="stat-item">
              <div className="stat-value">{props.user.videogames.length}</div>
              <div className="stat-label">Videogame</div>
            </div>
          )}
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .profile-card {
    position: relative;
    width: 60vw;
    min-width: 470px;
    background: #212121;
    -webkit-backdrop-filter: blur(48px);
    backdrop-filter: blur(48px);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 12px 12px 12px -20px rgba(0, 0, 0, 0.3);
    transform: perspective(1000px) scale(0.8); /*adjust the scale to view properly*/
    transform-style: preserve-3d;
  }

  .profile-image {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: #f0f2f5;
    margin: 0 auto 1rem;
    overflow: hidden;
    border: 3px solid white;
    box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .profile-image::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 96px;
    background-color: rgba(157, 21, 178, 0.75);
    border-radius: 20px 20px 0 0;
    z-index: -1;
  }

  .profile-info {
    text-align: left;
    margin-bottom: 1.5rem;
  }

  .profile-name {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 0.25rem;
  }

  .profile-title {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
  }

  .profile-bio {
    font-size: 0.85rem;
    color: #777;
    line-height: 1.4;
    margin-bottom: 1.5rem;
  }

  .social-links {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .social-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: #f0f2f5;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .social-btn:hover {
    background: #e4e6e9;
    transform: translateY(-6px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }

  .social-btn svg {
    width: 20px;
    height: 20px;
    fill: #1a1a1a;
    transition: all 0.2s ease;
  }

  .social-btn:hover svg {
    fill: #0066ff;
  }

  /* Specific colors for each social platform */
  .social-btn.twitter:hover svg {
    fill: #1da1f2;
  }
  .social-btn.instagram:hover svg {
    fill: #e4405f;
  }
  .social-btn.linkedin:hover svg {
    fill: #0a66c2;
  }
  .social-btn.github:hover svg {
    fill: #333333;
  }

  .cta-button {
    width: 170px;
    max-width: 200px;
    padding: 0.8rem;
    border: none;
    border-radius: 10px;
    background: #05bdc2;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, background 0.2s;
  }

  .cta-button:hover {
    background: #7e188d;
    transform: translateY(-2px);
  }

  .stats {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }

  .stat-item {
    width: 100px;
    text-align: center;
  }

  .stat-value {
    font-weight: 600;
    color: #1a1a1a;
  }

  .stat-label {
    font-size: 0.8rem;
    color: #666;
  }

  .dropdown-menu {
    background-color: transparent;
    border: none;
  }

  .dropdown-toggle {
    background-color: #05bdc2;
    transition: transform 0.2s, background 0.2s;
  }

  .dropdown-toggle:hover {
    background-color: #7e188d;
    transform: translateY(-2px);
  }

  .dropdown-toggle::after {
    display: none;
  }

  div,
  p {
    color: rgb(205, 205, 205) !important;
  }
`;

export default UserCard;
