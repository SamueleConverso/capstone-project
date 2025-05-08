import React from "react";
import Friend from "./Friend";
import * as Icon from "react-bootstrap-icons";
import styled from "styled-components";

function FriendList(props) {
  return (
    <>
      {props.user.friendList.applicationUserFriends.length > 0 ? (
        <div
          style={{
            width: "fit-content",
            backgroundColor: "#212121",
            color: "white",
            padding: "12px",
            border: "2px solid #7E188D",
            borderRadius: "10px",
          }}
          className="d-flex flex-column gap-2"
        >
          <HeaderBadge>
            <div className="badge-icon">
              <Icon.PeopleFill />
            </div>
            <p className="m-0 text-center">Amicizie confermate o in attesa</p>
            <div className="glow"></div>
          </HeaderBadge>
          {props.user.friendList.applicationUserFriends.map((friend) => (
            <Friend
              key={friend.applicationUser.applicationUserId}
              friend={friend}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            width: "428px",
            backgroundColor: "#212121",
            color: "white",
            padding: "12px",
            border: "2px solid #7E188D",
            borderRadius: "10px",
          }}
          className="d-flex flex-column"
        >
          <HeaderBadge>
            <div className="badge-icon">
              <Icon.PeopleFill />
            </div>
            <p className="m-0 text-center">Amicizie confermate o in attesa</p>
            <div className="glow"></div>
          </HeaderBadge>
          <p className="mb-0 mt-2 text-secondary text-center">
            Nessuna amico aggiunto ancora...
          </p>
        </div>
      )}
    </>
  );
}

const HeaderBadge = styled.div`
  position: relative;
  width: fit-content;
  background: linear-gradient(135deg, #05bdc2, #038e91);
  color: white;
  padding: 8px 20px;
  border-radius: 12px;
  align-self: center;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(5, 189, 194, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(5, 189, 194, 0.4);
  }

  .badge-icon {
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    animation: pulse 2s infinite ease-in-out;
  }

  .glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0) 70%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  &:hover .glow {
    opacity: 1;
    animation: glowEffect 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  @keyframes glowEffect {
    0% {
      transform: translate(-50%, -50%) scale(0.8);
      opacity: 0;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 0;
    }
  }
`;

export default FriendList;
