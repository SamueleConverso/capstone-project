import React from "react";
import styled from "styled-components";
import { useState, useEffect } from "react";
import ChooseFile from "./ChooseFile";
import CoolCheckbox from "./CoolCheckbox";
import * as Icon from "react-bootstrap-icons";
import CoolInput from "./CoolInput";
import { useSelector, useDispatch } from "react-redux";
import { createPost } from "../redux/actions/post.js";
import { jwtDecode } from "jwt-decode";

const PublishPostCard = () => {
  const [showInput, setShowInput] = useState(false);
  const [showCheckboxes, setShowCheckboxes] = useState(false);

  const [showVideogameSelect, setShowVideogameSelect] = useState(false);
  const [showCustomOptions, setShowCustomOptions] = useState(false);

  const videogames = useSelector((state) => state.videogame.videogames);

  const dispatch = useDispatch();

  const [text, setText] = useState("");
  const [pictureFile, setPictureFile] = useState(null);
  //const [picture, setPicture] = useState("");
  // const [mood, setMood] = useState("");
  const [isLookingForGamers, setIsLookingForGamers] = useState(false);
  const [isLookingForDevelopers, setIsLookingForDevelopers] = useState(false);
  // const [country, setCountry] = useState("");
  // const [city, setCity] = useState("");
  const [isInUserFeed, setIsInUserFeed] = useState(false);
  const [isInGameFeed, setIsInGameFeed] = useState(false);
  const [userId, setUserId] = useState("");
  const [selectedGame, setSelectedGame] = useState("");

  const [isUserGamer, setIsUserGamer] = useState(false);
  const [isUserDeveloper, setIsUserDeveloper] = useState(false);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("text", text);
    formData.append("pictureFile", pictureFile);
    formData.append("mood", "");
    formData.append(
      "isLookingForGamers",
      isLookingForGamers ? isLookingForGamers : "false"
    );
    formData.append(
      "isLookingForDevelopers",
      isLookingForDevelopers ? isLookingForDevelopers : "false"
    );
    formData.append("country", "");
    formData.append("city", "");
    formData.append("isInUserFeed", isInUserFeed ? isInUserFeed : "false");
    formData.append("isInGameFeed", isInGameFeed ? isInGameFeed : "false");
    formData.append("applicationUserId", userId);
    formData.append("videogameId", selectedGame);

    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    dispatch(createPost(formData));
  };

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");

    const decodedToken = jwtDecode(token);

    setUserId(decodedToken.id);
    setIsInUserFeed(true);

    if (decodedToken.isGamer === "true") {
      setIsUserGamer(true);
    }

    if (decodedToken.isDeveloper === "true") {
      setIsUserDeveloper(true);
    }
  }, []);

  useEffect(() => {
    if (selectedGame !== null && selectedGame !== "") {
      setIsInGameFeed(true);
    } else {
      setIsInGameFeed(false);
    }
  }, [selectedGame]);
  return (
    <StyledWrapper>
      <div className="coolBackground">
        <div className="d-flex flex-row gap-2">
          <div className="container_chat_bot">
            <div className="container-chat-options">
              <div className="chat">
                <div className="chat-bot">
                  <textarea
                    id="chat_bot"
                    name="chat_bot"
                    placeholder="Pubblica qualcosa..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
                <div className="options">
                  <div className="btns-add">
                    <button
                      onClick={() => {
                        setShowInput(!showInput);
                      }}
                    >
                      <Icon.Image />
                    </button>
                    <button onClick={() => setShowCheckboxes(!showCheckboxes)}>
                      <svg
                        viewBox="0 0 24 24"
                        height={20}
                        width={20}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm0 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zm0-8h6m-3-3v6"
                          strokeWidth={2}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setShowVideogameSelect(!showVideogameSelect);
                        setShowCustomOptions(!showCustomOptions);
                      }}
                    >
                      <Icon.Controller></Icon.Controller>
                    </button>
                    {showVideogameSelect && (
                      <div className="custom-select-container">
                        <div
                          className="custom-select-header d-flex align-items-center"
                          onClick={() =>
                            setShowCustomOptions(!showCustomOptions)
                          }
                        >
                          {selectedGame ? (
                            <img
                              src={`https://localhost:7105${
                                videogames.find(
                                  (game) => game.videogameId === selectedGame
                                )?.picture
                              }`}
                              className="game-thumbnail me-2"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "../../public/assets/img/GameController.png";
                              }}
                            />
                          ) : (
                            <></>
                          )}
                          {selectedGame
                            ? videogames.find(
                                (game) => game.videogameId === selectedGame
                              )?.title
                            : "Seleziona un videogioco"}
                        </div>
                        {showCustomOptions && (
                          <div className="custom-select-options">
                            <div
                              className="custom-option custom-option-placeholder"
                              onClick={() => {
                                setSelectedGame("");
                                setShowCustomOptions(!showCustomOptions);
                              }}
                            >
                              <span>Seleziona un videogioco</span>
                            </div>
                            {videogames &&
                              videogames.map((game) => (
                                <div
                                  key={game.videogameId}
                                  className={`custom-option ${
                                    selectedGame === game.videogameId
                                      ? "selected"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    setSelectedGame(game.videogameId);
                                    setShowCustomOptions(!showCustomOptions);
                                  }}
                                >
                                  {game.picture ? (
                                    <img
                                      src={`https://localhost:7105${game.picture}`}
                                      alt={game.title}
                                      className="game-thumbnail"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          "../../public/assets/img/GameController.png";
                                      }}
                                    />
                                  ) : (
                                    <img
                                      src={
                                        "../../public/assets/img/GameController.png"
                                      }
                                      alt={game.title}
                                      className="game-thumbnail"
                                    />
                                  )}
                                  <span>{game.title}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    className="btn-submit"
                    onClick={() => {
                      if (text && text !== "") {
                        handleSubmit();
                      }
                    }}
                  >
                    <i>
                      <svg viewBox="0 0 512 512">
                        <path
                          fill="currentColor"
                          d="M473 39.05a24 24 0 0 0-25.5-5.46L47.47 185h-.08a24 24 0 0 0 1 45.16l.41.13l137.3 58.63a16 16 0 0 0 15.54-3.59L422 80a7.07 7.07 0 0 1 10 10L226.66 310.26a16 16 0 0 0-3.59 15.54l58.65 137.38c.06.2.12.38.19.57c3.2 9.27 11.3 15.81 21.09 16.25h1a24.63 24.63 0 0 0 23-15.46L478.39 64.62A24 24 0 0 0 473 39.05"
                        />
                      </svg>
                    </i>
                  </button>
                </div>
              </div>
            </div>
            {showCheckboxes && (
              <div className="mt-3 d-flex flex-column gap-3">
                {isUserGamer && (
                  <CoolCheckbox
                    text="In cerca di gamer?"
                    checked={isLookingForGamers}
                    onChange={() => setIsLookingForGamers(!isLookingForGamers)}
                  />
                )}
                {isUserDeveloper && (
                  <CoolCheckbox
                    text="In cerca di sviluppatori?"
                    checked={isLookingForDevelopers}
                    onChange={() =>
                      setIsLookingForDevelopers(!isLookingForDevelopers)
                    }
                  />
                )}
              </div>
            )}
            {showInput && (
              <div className="mt-3">
                <ChooseFile onFileSelect={(file) => setPictureFile(file)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .container_chat_bot {
    display: flex;
    flex-direction: column;
    width: 500px;
  }

  .container-chat-options {
    height: 200px;
    border: 2px solid #7e188d;
  }

  .chat-bot {
    height: 100%;
  }

  #chat_bot {
    height: 100%;
  }

  .chat {
    justify-content: space-between;
  }

  .container_chat_bot .container-chat-options {
    position: relative;
    display: flex;
    background: linear-gradient(
      to bottom right,
      #7e7e7e,
      #363636,
      #363636,
      #363636,
      #363636
    );
    border-radius: 16px;
    padding: 1.5px;
    //overflow: hidden;

    &::after {
      position: absolute;
      content: "";
      top: -10px;
      left: -10px;
      background: radial-gradient(
        ellipse at center,
        #ffffff,
        rgba(255, 255, 255, 0.3),
        rgba(255, 255, 255, 0.1),
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0)
      );
      width: 30px;
      height: 30px;
      filter: blur(1px);
    }
  }

  .container_chat_bot .container-chat-options .chat {
    display: flex;
    flex-direction: column;
    background-color: rgba(33, 33, 33, 0.9);
    border-radius: 15px;
    width: 100%;
    overflow: hidden;
  }

  .container_chat_bot .container-chat-options .chat .chat-bot {
    position: relative;
    display: flex;
  }

  .container_chat_bot .chat .chat-bot textarea {
    background-color: transparent;
    border-radius: 16px;
    border: none;
    width: 100%;
    height: 50px;
    color: #ffffff;
    font-family: sans-serif;
    font-size: 12px;
    font-weight: 400;
    padding: 10px;
    resize: none;
    outline: none;

    &::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 5px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #555;
      cursor: pointer;
    }

    &::placeholder {
      color: #f3f6fd;
      transition: all 0.3s ease;
    }
    &:focus::placeholder {
      color: transparent;
    }
  }

  .container_chat_bot .chat .options {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 10px;
  }

  .container_chat_bot .chat .options .btns-add {
    display: flex;
    gap: 8px;

    & button {
      display: flex;
      color: rgba(255, 255, 255, 0.42);
      background-color: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        color: #ffffff;
      }
    }
  }

  .container_chat_bot .chat .options .btn-submit {
    display: flex;
    padding: 2px;
    background-image: linear-gradient(to top, #292929, #555555, #292929);
    border-radius: 10px;
    box-shadow: inset 0 6px 2px -4px rgba(255, 255, 255, 0.5);
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.15s ease;

    & i {
      width: 30px;
      height: 30px;
      padding: 6px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      backdrop-filter: blur(3px);
      color: #8b8b8b;
    }
    & svg {
      transition: all 0.3s ease;
    }
    &:hover svg {
      color: #f3f6fd;
      filter: drop-shadow(0 0 5px #ffffff);
    }

    &:focus svg {
      color: #f3f6fd;
      filter: drop-shadow(0 0 5px #ffffff);
      transform: scale(1.2) rotate(45deg) translateX(-2px) translateY(1px);
    }

    &:active {
      transform: scale(0.92);
    }
  }

  .container_chat_bot .tags {
    padding: 14px 0;
    display: flex;
    color: #ffffff;
    font-size: 10px;
    gap: 4px;

    & span {
      padding: 4px 8px;
      background-color: #1b1b1b;
      border: 1.5px solid #363636;
      border-radius: 10px;
      cursor: pointer;
      user-select: none;
    }
    // display: none;
  }

  .custom-select-container {
    position: absolute;
    background-color: #212121;
    border: 2px solid #7e188d;
    border-radius: 8px;
    margin-top: 5px;
    width: 250px;
    z-index: 10;
    left: 144px;
    top: 136px;
  }

  .custom-select-header {
    height: 47px;
    padding: 8px 12px;
    border-radius: 8px;
    border-bottom: 1px solid #363636;
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;

    &:hover {
      background-color: #2a2a2a;
    }
  }

  .custom-select-options {
    max-height: 200px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #7e188d;
      border-radius: 3px;
    }
  }

  .custom-option {
    border-radius: 8px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #ccc;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: #2a2a2a;
      color: #fff;
    }

    &.selected {
      background-color: rgba(126, 24, 141, 0.3);
      color: #fff;
    }

    &.custom-option-placeholder {
      font-style: italic;
      color: #888;
    }
  }

  .game-thumbnail {
    width: 30px;
    height: 30px;
    object-fit: cover;
    border-radius: 5px;
  }

  .coolBackground {
    padding: 8px;
    border-radius: 1rem;
    background-color: #4158d0;
    background-image: linear-gradient(
      43deg,
      #4158d0 0%,
      #c850c0 46%,
      #ffcc70 100%
    );
    box-shadow: rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset,
      rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset,
      rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset,
      rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px,
      rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px,
      rgba(0, 0, 0, 0.09) 0px 32px 16px;
  }
`;

export default PublishPostCard;
