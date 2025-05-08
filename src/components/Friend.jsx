import React from "react";
import styled from "styled-components";
import { useEffect } from "react";
import * as Icon from "react-bootstrap-icons";
import { useDispatch, useSelector } from "react-redux";
import { removeApplicationUserFriend } from "../redux/actions/applicationUserFriend";
import { rejectApplicationUserFriend } from "../redux/actions/applicationUserFriend";
import { useNavigate } from "react-router-dom";

const Friend = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.profile.user);
  const isFriendGamer = () => {
    if (props.friend.applicationUser.isGamer) {
      return true;
    } else {
      return false;
    }
  };
  const isFriendDeveloper = () => {
    if (props.friend.applicationUser.isDeveloper) {
      return true;
    } else {
      return false;
    }
  };

  const handleRemoveRequest = (applicationUserFriendId) => {
    dispatch(
      rejectApplicationUserFriend(
        applicationUserFriendId,
        user.applicationUserId,
        true
      )
    );
  };

  const handleRemoveFriend = (applicationUserFriendId) => {
    dispatch(removeApplicationUserFriend(applicationUserFriendId, user, true));
  };

  const handleGoToUserPage = (applicationUserId) => {
    navigate("/other-user/" + applicationUserId);
  };

  useEffect(() => {
    console.log("Friend props:", props.friend);
  }, []);

  return (
    <StyledWrapper>
      <div className="friendCard">
        <div className="friendContent">
          <div
            style={{
              backgroundColor: "rgb(255, 255, 240)",
              color: "rgb(54, 69, 79)",
              padding: "8px",
              borderRadius: "10px",
            }}
            className="d-flex gap-1"
          >
            <div className="d-flex align-items-center">
              <img
                onClick={() =>
                  handleGoToUserPage(
                    props.friend.applicationUser.applicationUserId
                  )
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
                src={`https://localhost:7105/${props.friend.applicationUser.picture}`}
                className="user-avatar"
              />
            </div>
            <div
              style={{ width: "100%" }}
              className="d-flex justify-content-between"
            >
              <div
                onClick={() =>
                  handleGoToUserPage(
                    props.friend.applicationUser.applicationUserId
                  )
                }
                className="d-flex flex-column justify-content-center user-info"
              >
                {!props.friend.applicationUser.displayName && (
                  <p className="user-name">
                    {props.friend.applicationUser.firstName}{" "}
                    {props.friend.applicationUser.lastName}
                  </p>
                )}
                {props.friend.applicationUser.displayName && (
                  <p className="user-name">
                    {props.friend.applicationUser.displayName}
                  </p>
                )}
                <div
                  style={{ fontSize: "12px", marginBottom: "0" }}
                  className="d-flex gap-1 user-badges"
                >
                  {isFriendGamer() && (
                    <div className="d-flex gap-1 user-badge gamer">
                      <div>
                        <Icon.Controller />
                      </div>
                      <div>
                        <p>Gamer</p>
                      </div>
                    </div>
                  )}
                  {isFriendDeveloper() && (
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
              <div className="align-self-center position-relative">
                {(props.friend.accepted === null ||
                  props.friend.accepted === false ||
                  props.friend.accepted === "false") && (
                  <div className="d-flex flex-column gap-1 text-warning align-items-center me-1">
                    <div className="friend-check-icon">
                      <Icon.HourglassSplit className="check-icon text-warning" />
                      <div
                        className="delete-icon"
                        onClick={() => {
                          handleRemoveRequest(
                            props.friend.applicationUserFriendId
                          );
                        }}
                        title="Elimina richiesta"
                      >
                        <Icon.XLg />
                      </div>
                    </div>
                    <p>In attesa...</p>
                  </div>
                )}
                {props.friend.accepted !== null &&
                  props.friend.accepted !== false &&
                  props.friend.accepted !== "false" && (
                    <div className="d-flex flex-column gap-1 text-success align-items-center">
                      <div className="friend-check-icon">
                        <Icon.PersonFillCheck className="check-icon" />
                        <div
                          className="delete-icon"
                          onClick={() => {
                            handleRemoveFriend(
                              props.friend.applicationUserFriendId
                            );
                          }}
                          title="Elimina amicizia"
                        >
                          <Icon.XLg />
                        </div>
                      </div>
                      <p>Siete amici!</p>
                    </div>
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
    border-radius: 10px;
    // display: flex;
    // flex-direction: column;
    // justify-content: center;
    // gap: 12px;
    color: white;
    //overflow: hidden;
  }

  .friend-check-icon {
    position: relative;
    cursor: pointer;
    perspective: 800px; /* Aggiunge prospettiva 3D */
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
  }

  .check-icon,
  .delete-icon {
    position: absolute;
    backface-visibility: hidden;
    transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .check-icon {
    transform: rotateY(0deg);
    color: #28a745;
  }

  .delete-icon {
    transform: rotateY(180deg);
    color: #dc3545;
    opacity: 1;
    border-radius: 50%;
    border: 2px solid #dc3545;
  }

  .friend-check-icon:hover .check-icon {
    transform: rotateY(180deg);
  }

  .friend-check-icon:hover .delete-icon {
    transform: rotateY(0deg);
  }

  .delete-icon:active {
    transform: rotateY(0deg) scale(0.9);
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

export default Friend;
