import React from "react";
import styled from "styled-components";
import * as Icon from "react-bootstrap-icons";
import { acceptApplicationUserFriend } from "../redux/actions/applicationUserFriend";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { rejectApplicationUserFriend } from "../redux/actions/applicationUserFriend";

const FriendToAccept = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.profile.user);

  const isFriendToAcceptGamer = () => {
    if (props.friendToAccept.isGamer) {
      return true;
    } else {
      return false;
    }
  };
  const isFriendToAcceptDeveloper = () => {
    if (props.friendToAccept.isDeveloper) {
      return true;
    } else {
      return false;
    }
  };

  const handleAcceptFriendRequest = (applicationUserFriendId) => {
    const userFriendListId = user.friendList.friendListId;
    const friendId = props.friendToAccept.applicationUserId;
    const userId = user.applicationUserId;
    dispatch(
      acceptApplicationUserFriend(
        applicationUserFriendId,
        true,
        userFriendListId,
        friendId,
        userId,
        navigate,
        true
      )
    );
  };

  const handleRejectFriend = (applicationUserFriendId) => {
    dispatch(
      rejectApplicationUserFriend(
        applicationUserFriendId,
        user.applicationUserId,
        true
      )
    );
  };

  const handleGoToUserPage = (applicationUserId) => {
    navigate("/other-user/" + applicationUserId);
  };

  return (
    <StyledWrapper>
      <div className="friendCard">
        <div className="friendContent">
          <div
            style={{
              backgroundColor: "rgb(255, 255, 240)",
              color: "rgb(54, 69, 79)",
              padding: "8px",
            }}
            className="d-flex gap-1"
          >
            <div className="d-flex align-items-center">
              <img
                onClick={() =>
                  handleGoToUserPage(props.friendToAccept.applicationUserId)
                }
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid transparent",
                  transition:
                    "transform 0.3s, border-color 0.3s, box-shadow 0.3s",
                  cursor: "pointer",
                }}
                src={`https://localhost:7105/${props.friendToAccept.picture}`}
                className="user-avatar"
              />
            </div>

            <div
              style={{ width: "100%" }}
              className="d-flex justify-content-between"
            >
              <div
                onClick={() =>
                  handleGoToUserPage(props.friendToAccept.applicationUserId)
                }
                className="d-flex flex-column justify-content-center user-info"
              >
                {!props.friendToAccept.displayName && (
                  <p className="user-name">
                    {props.friendToAccept.firstName}{" "}
                    {props.friendToAccept.lastName}
                  </p>
                )}
                {props.friendToAccept.displayName && (
                  <p className="user-name">
                    {props.friendToAccept.displayName}
                  </p>
                )}
                <div
                  style={{ fontSize: "12px", marginBottom: "0" }}
                  className="d-flex gap-1 user-badges"
                >
                  {isFriendToAcceptGamer() && (
                    <div className="d-flex gap-1 user-badge gamer">
                      <div>
                        <Icon.Controller />
                      </div>
                      <div>
                        <p>Gamer</p>
                      </div>
                    </div>
                  )}
                  {isFriendToAcceptDeveloper() && (
                    <div className="d-flex gap-1 user-badge dev">
                      <div>
                        <Icon.Code />
                      </div>
                      <div>
                        <p>Developer</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className=" align-self-center">
                {(props.requestStatus.accepted === null ||
                  props.requestStatus.accepted === false ||
                  props.requestStatus.accepted === "false") && (
                  <div className="d-flex gap-2">
                    <div
                      className="action-button accept-button"
                      onClick={() =>
                        handleAcceptFriendRequest(
                          props.requestStatus.applicationUserFriendId
                        )
                      }
                    >
                      <Icon.Check />
                    </div>
                    <div
                      className="action-button reject-button"
                      onClick={() => {
                        handleRejectFriend(
                          props.requestStatus.applicationUserFriendId
                        );
                      }}
                    >
                      <Icon.X />
                    </div>
                  </div>
                )}
                {props.requestStatus.accepted !== null &&
                  props.requestStatus.accepted !== false &&
                  props.requestStatus.accepted !== "false" && (
                    <p>Accettata da te!</p>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  p {
    margin: 0;
  }

  .friendCard {
    width: 400px;
    //position: relative;
    padding: 3px;
    border-radius: 10px;
    background: linear-gradient(-45deg, #e81cff 0%, #40c9ff 100%);
    transition: border-radius 0.2s ease;
  }

  .friendContent {
    background-color: #212121;
    border-radius: 8px;
    // display: flex;
    // flex-direction: column;
    // justify-content: center;
    // gap: 12px;
    color: white;
    overflow: hidden;
  }

  .action-button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
    user-select: none; /* Previene la selezione del testo durante il click */
  }

  .action-button.accept-button:active,
  .action-button.reject-button:active {
    transform: scale(0.9);
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.3);
  }

  .accept-button {
    background: linear-gradient(-45deg, #2ecc71, #27ae60);
    color: white;
  }

  .accept-button:hover {
    background: linear-gradient(-45deg, #27ae60, #2ecc71);
    transform: scale(1.1);
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.25);
  }

  .reject-button {
    background: linear-gradient(-45deg, #e74c3c, #c0392b);
    color: white;
  }

  .reject-button:hover {
    background: linear-gradient(-45deg, #c0392b, #e74c3c);
    transform: scale(1.1);
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.25);
  }

  .user-avatar {
    &:hover {
      transform: scale(1.1);
      border-color: #00a2ae;
      box-shadow: 0 0 10px rgba(0, 162, 174, 0.6);
    }
    &:active {
      transform: scale(0.95);
      border-color: #7e188d;
      box-shadow: 0 0 15px rgba(126, 24, 141, 0.7);
    }
  }

  .user-info {
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 8px;
    transition: background-color 0.2s, transform 0.2s;

    &:hover {
      background-color: rgba(0, 162, 174, 0.15);
      transform: translateX(3px);
    }

    &:active {
      background-color: rgba(126, 24, 141, 0.15);
      transform: translateX(5px) scale(0.98);
    }
  }

  .user-name {
    font-weight: 600;
    transition: color 0.2s;
    position: relative;
    display: inline-block;

    &:after {
      content: "";
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #7e188d, #00a2ae);
      transition: width 0.3s ease;
    }

    .user-info:hover & {
      color: #00a2ae;

      &:after {
        width: 100%;
      }
    }
  }

  .user-badges {
    margin-top: 2px;
    margin-bottom: 0;
  }

  .user-badge {
    font-size: 11px;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 10px;
    transition: all 0.2s;

    &.gamer {
      background-color: rgba(126, 24, 141, 0.2);
      color: #e81cff;
      border: 1px solid rgba(126, 24, 141, 0.3);

      .user-info:hover & {
        background-color: rgba(126, 24, 141, 0.4);
        transform: translateY(-1px);
      }
    }

    &.dev {
      background-color: rgba(0, 162, 174, 0.2);
      color: #40c9ff;
      border: 1px solid rgba(0, 162, 174, 0.3);

      .user-info:hover & {
        background-color: rgba(0, 162, 174, 0.4);
        transform: translateY(-1px);
      }
    }
  }
`;

export default FriendToAccept;
