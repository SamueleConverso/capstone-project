import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import * as Icon from "react-bootstrap-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { createPost } from "../redux/actions/post.js";
import { jwtDecode } from "jwt-decode";

const PublishPostInVideogame = ({ videogameId, videogameTitle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const [postText, setPostText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLookingForGamers, setIsLookingForGamers] = useState(false);
  const [isLookingForDevelopers, setIsLookingForDevelopers] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [isUserGamer, setIsUserGamer] = useState(false);
  const [isUserDeveloper, setIsUserDeveloper] = useState(false);

  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        const decodedToken = jwtDecode(token);
        setCurrentUserId(decodedToken.id);
        setIsUserGamer(decodedToken.isGamer === "true");
        setIsUserDeveloper(decodedToken.isDeveloper === "true");
      }
    } catch (error) {
      console.error("Errore nel decodificare il token:", error);
    }
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitPost = () => {
    if (!postText.trim()) return;

    setIsSending(true);

    const formData = new FormData();
    formData.append("text", postText);
    formData.append("pictureFile", imageFile);
    formData.append("mood", "");
    formData.append("isLookingForGamers", isLookingForGamers.toString());
    formData.append(
      "isLookingForDevelopers",
      isLookingForDevelopers.toString()
    );
    formData.append("country", "");
    formData.append("city", "");
    formData.append("isInUserFeed", "true");
    formData.append("isInGameFeed", "true");
    formData.append("applicationUserId", currentUserId);
    formData.append("videogameId", videogameId);

    dispatch(createPost(formData))
      .then(() => {
        setIsSuccess(true);
        setTimeout(() => {
          setPostText("");
          setImageFile(null);
          setImagePreview(null);
          setIsLookingForGamers(false);
          setIsLookingForDevelopers(false);
          setIsSending(false);
          setIsExpanded(false);
          setShowImageUpload(false);
          setShowOptions(false);
          setIsSuccess(false);
        }, 1500);
      })
      .catch(() => {
        setIsSending(false);
      });
  };

  return (
    <StyledContainer>
      <AnimatePresence>
        <motion.div
          className={`post-creator ${isExpanded ? "expanded" : ""}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="header">
            <motion.div
              className="game-info"
              whileHover={{ scale: 1.03 }}
              //   whileTap={{ scale: 0.97 }}
            >
              <Icon.Controller className="game-icon" />
              <span>
                Pubblica nuovo post per: <strong>{videogameTitle}</strong>
              </span>
            </motion.div>
          </div>

          <div
            className={`input-area ${isExpanded ? "active" : ""}`}
            onClick={() => !isExpanded && setIsExpanded(true)}
          >
            {!isExpanded ? (
              <div className="placeholder-text">
                <Icon.ChatSquareText className="message-icon" />
                <span>Condividi i tuoi pensieri su questo gioco...</span>
              </div>
            ) : (
              <motion.div
                className="expanded-area"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <textarea
                  placeholder={`Cosa ne pensi di ${videogameTitle}?`}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  autoFocus
                />

                <AnimatePresence>
                  {imagePreview && (
                    <motion.div
                      className="image-preview-container"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="image-preview">
                        <img src={imagePreview} alt="Anteprima" />
                        <button
                          className="remove-image-btn"
                          onClick={handleRemoveImage}
                        >
                          <Icon.X />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showOptions && (
                    <motion.div
                      className="options-container"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="options-grid">
                        {isUserGamer && (
                          <motion.div
                            className={`option-checkbox ${
                              isLookingForGamers ? "active" : ""
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setIsLookingForGamers(!isLookingForGamers)
                            }
                          >
                            <div className="checkbox-icon">
                              {isLookingForGamers ? (
                                <Icon.CheckSquareFill />
                              ) : (
                                <Icon.Square />
                              )}
                            </div>
                            <div className="option-text">
                              <Icon.People className="option-icon gamer" />
                              <span>Cerco altri giocatori</span>
                            </div>
                          </motion.div>
                        )}

                        {isUserDeveloper && (
                          <motion.div
                            className={`option-checkbox ${
                              isLookingForDevelopers ? "active" : ""
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setIsLookingForDevelopers(!isLookingForDevelopers)
                            }
                          >
                            <div className="checkbox-icon">
                              {isLookingForDevelopers ? (
                                <Icon.CheckSquareFill />
                              ) : (
                                <Icon.Square />
                              )}
                            </div>
                            <div className="option-text">
                              <Icon.Code className="option-icon dev" />
                              <span>Cerco sviluppatori</span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showImageUpload && (
                    <motion.div
                      className="file-upload-container"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="file-upload">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          ref={fileInputRef}
                        />
                        <div className="upload-content">
                          <Icon.Upload />
                          <span>Carica un'immagine</span>
                        </div>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="actions-bar">
                  <div className="action-buttons">
                    <motion.button
                      className="action-btn image-btn"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowImageUpload(!showImageUpload)}
                    >
                      <Icon.Image />
                    </motion.button>
                    <motion.button
                      className="action-btn options-btn"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowOptions(!showOptions)}
                    >
                      <Icon.ThreeDots />
                    </motion.button>
                  </div>

                  <div className="submit-container">
                    <motion.button
                      className="cancel-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsExpanded(false);
                        setPostText("");
                        setImageFile(null);
                        setImagePreview(null);
                        setShowImageUpload(false);
                        setShowOptions(false);
                      }}
                    >
                      Annulla
                    </motion.button>

                    <motion.button
                      className={`submit-btn ${
                        !postText.trim() ? "disabled" : ""
                      } ${isSending ? "sending" : ""} ${
                        isSuccess ? "success" : ""
                      }`}
                      whileHover={postText.trim() ? { scale: 1.05 } : {}}
                      whileTap={postText.trim() ? { scale: 0.95 } : {}}
                      onClick={handleSubmitPost}
                      disabled={!postText.trim() || isSending || isSuccess}
                    >
                      {isSuccess ? (
                        <Icon.CheckCircleFill className="success-icon" />
                      ) : isSending ? (
                        <div className="spinner"></div>
                      ) : (
                        <>
                          <span>Pubblica</span>
                          <Icon.SendFill />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  margin-bottom: 30px;

  .post-creator {
    background: linear-gradient(
      145deg,
      rgba(26, 26, 46, 0.9),
      rgba(22, 22, 42, 0.9)
    );
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.05);
    overflow: hidden;
    position: relative;
    transition: all 0.3s ease;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        45deg,
        rgba(126, 24, 141, 0.05),
        rgba(0, 162, 174, 0.05)
      );
      pointer-events: none;
    }

    &.expanded {
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3),
        0 0 20px rgba(126, 24, 141, 0.1);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 15px;

      .game-info {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #fff;
        font-size: 0.9rem;
        background: rgba(0, 0, 0, 0.2);
        padding: 8px 14px;
        border-radius: 20px;
        //cursor: pointer;
        user-select: none;
        border: 1px solid rgba(126, 24, 141, 0.3);

        .game-icon {
          color: rgb(126, 24, 141);
          font-size: 1.2rem;
        }

        strong {
          color: rgb(0, 162, 174);
          font-weight: 600;
          margin-left: 3px;
        }
      }
    }

    .input-area {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.3s ease;
      overflow: hidden;

      &:not(.active) {
        cursor: pointer;

        &:hover {
          background: rgba(0, 0, 0, 0.3);
          border-color: rgba(0, 162, 174, 0.3);
          transform: translateY(-2px);
        }
      }

      .placeholder-text {
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.95rem;

        .message-icon {
          color: rgba(126, 24, 141, 0.8);
          font-size: 1.1rem;
        }
      }

      .expanded-area {
        width: 100%;

        textarea {
          width: 100%;
          min-height: 100px;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 1rem;
          padding: 16px;
          resize: vertical;
          font-family: inherit;

          &::placeholder {
            color: rgba(255, 255, 255, 0.4);
          }
        }

        .image-preview-container {
          display: flex;
          justify-content: center;
          padding: 0 16px 16px;
          overflow: hidden;

          .image-preview {
            position: relative;
            max-width: 200px;
            max-height: 100%;
            overflow: hidden;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

            img {
              width: 100%;
              object-fit: contain;
            }

            .remove-image-btn {
              position: absolute;
              top: 10px;
              right: 10px;
              background: rgba(0, 0, 0, 0.6);
              border: none;
              color: #fff;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s ease;

              &:hover {
                background: rgba(220, 53, 69, 0.8);
              }
            }
          }
        }

        .options-container {
          padding: 0 16px 16px;
          overflow: hidden;

          .options-grid {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .option-checkbox {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.2);
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
              background: rgba(0, 0, 0, 0.3);
            }

            &.active {
              background: rgba(126, 24, 141, 0.15);
              border: 1px solid rgba(126, 24, 141, 0.3);
            }

            .checkbox-icon {
              color: #00a2ae;
              font-size: 1.2rem;
            }

            .option-text {
              display: flex;
              align-items: center;
              gap: 8px;
              color: #fff;

              .option-icon {
                font-size: 1.1rem;

                &.gamer {
                  color: #7e188d;
                }

                &.dev {
                  color: #00a2ae;
                }
              }
            }
          }
        }

        .file-upload-container {
          padding: 0 16px 16px;
          overflow: hidden;

          .file-upload {
            display: block;
            width: 100%;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            border: 1px dashed rgba(0, 162, 174, 0.5);
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background: rgba(0, 0, 0, 0.3);
              border-color: rgba(0, 162, 174, 0.8);
            }

            input {
              display: none;
            }

            .upload-content {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 10px;
              color: rgba(255, 255, 255, 0.7);

              svg {
                font-size: 1.8rem;
                color: rgba(0, 162, 174, 0.8);
              }
            }
          }
        }

        .actions-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);

          .action-buttons {
            display: flex;
            gap: 10px;

            .action-btn {
              width: 38px;
              height: 38px;
              border-radius: 50%;
              border: none;
              background: rgba(0, 0, 0, 0.3);
              color: rgba(255, 255, 255, 0.7);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              font-size: 1.1rem;
              transition: all 0.2s ease;

              &:hover {
                color: #fff;
              }

              &.image-btn:hover {
                background: rgba(0, 162, 174, 0.2);
                color: rgba(0, 162, 174, 1);
              }

              &.options-btn:hover {
                background: rgba(126, 24, 141, 0.2);
                color: rgba(126, 24, 141, 1);
              }
            }
          }

          .submit-container {
            display: flex;
            gap: 10px;

            button {
              border: none;
              border-radius: 20px;
              padding: 8px 16px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            }

            .cancel-btn {
              background: rgba(0, 0, 0, 0.3);
              color: rgba(255, 255, 255, 0.7);

              &:hover {
                background: rgba(0, 0, 0, 0.5);
                color: #fff;
              }
            }

            .submit-btn {
              background: linear-gradient(45deg, #7e188d, #00a2ae);
              color: #fff;
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 20px;
              position: relative;
              overflow: hidden;

              &::before {
                content: "";
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                  90deg,
                  rgba(255, 255, 255, 0) 0%,
                  rgba(255, 255, 255, 0.2) 50%,
                  rgba(255, 255, 255, 0) 100%
                );
                transition: all 0.6s ease;
              }

              &:hover::before {
                left: 100%;
              }

              &:hover {
                box-shadow: 0 0 15px rgba(126, 24, 141, 0.5);
              }

              &.disabled {
                opacity: 0.6;
                cursor: not-allowed;
              }

              &.sending {
                background: #666;
              }

              &.success {
                background: #28a745;

                .success-icon {
                  animation: pulse 1.5s infinite;
                }
              }

              .spinner {
                width: 20px;
                height: 20px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top: 3px solid #fff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
              }
            }
          }
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
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
`;

export default PublishPostInVideogame;
