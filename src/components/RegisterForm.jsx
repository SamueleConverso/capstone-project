import React from "react";
import styled from "styled-components";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { register } from "../redux/actions/account.js";
import CoolSwitch from "./CoolSwitch";
import CoolRadio from "./CoolRadio";
import ChooseFile from "./ChooseFile";
import CoolCheckbox from "./CoolCheckbox";
import DeveloperRole from "./DeveloperRole";
import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton.jsx";
import GradientButton from "./GradientButton.jsx";

const RegisterForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showAvatar, setShowAvatar] = useState(true);
  const [avatar, setAvatar] = useState("");
  const [pictureFile, setPictureFile] = useState(null);
  //const [coverFile, setCoverFile] = useState(null);
  const [picture, setPicture] = useState("");
  const [isGamer, setIsGamer] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [developerRole, setDeveloperRole] = useState("");
  const [bio, setBio] = useState("");
  const [title, setTitle] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  const [isFavouriteListPrivate, setIsFavouriteListPrivate] = useState(false);
  const [isFriendListPrivate, setIsFriendListPrivate] = useState(false);
  const [autoAcceptFriendRequests, setAutoAcceptFriendRequests] =
    useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const urlToFile = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error("Errore nella conversione dell'immagine:", error);
      return null;
    }
  };

  const handleAvatarChange = async (selectedAvatar) => {
    setAvatar("");
    setPicture("");

    const avatarPath = `../../public/assets/img/${selectedAvatar}.png`;

    try {
      const avatarFile = await urlToFile(avatarPath, `${selectedAvatar}.png`);
      setPictureFile(avatarFile);
    } catch (error) {
      console.error("Errore nel caricamento dell'avatar:", error);
    }
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("birthDate", birthDate);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("country", country);
    formData.append("city", city);
    formData.append("displayName", displayName);
    // formData.append("avatar", null);
    // formData.append("picture", null);
    formData.append("isGamer", isGamer ? isGamer : "false");
    formData.append("isDeveloper", isDeveloper ? isDeveloper : "false");
    formData.append("isEditor", isEditor ? isEditor : "false");
    formData.append("developerRole", developerRole);
    formData.append("bio", bio);
    formData.append("title", title);
    formData.append("isHidden", isHidden ? isHidden : "false");
    formData.append(
      "isFavouriteListPrivate",
      isFavouriteListPrivate ? isFavouriteListPrivate : "false"
    );
    formData.append(
      "isFriendListPrivate",
      isFriendListPrivate ? isFriendListPrivate : "false"
    );
    formData.append(
      "autoAcceptFriendRequests",
      autoAcceptFriendRequests ? autoAcceptFriendRequests : "false"
    );

    // formData.append("pictureFile", pictureFile);

    if (pictureFile) {
      formData.append("pictureFile", pictureFile);
    }

    // formData.append("coverFile", null);

    console.log("pictureFile", pictureFile);

    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    dispatch(register(formData, navigate));
  };

  return (
    <>
      <StyledWrapper>
        <div className="form-container mb-5">
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              if (
                firstName &&
                lastName &&
                birthDate &&
                email &&
                password &&
                (isDeveloper || isGamer)
              ) {
                handleSubmit();
              }
            }}
          >
            <div className="form-group">
              <div className="d-flex flex-row justify-content-end gap-1">
                <label className="m-0 align-self-center" htmlFor="password">
                  Hai già un account?
                </label>
                <a
                  style={{
                    cursor: "pointer",
                    color: "#e81cff",
                    textDecoration: "underline",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/login");
                  }}
                >
                  Login
                </a>
              </div>
            </div>
            <div className="form-group d-flex flex-row">
              <div>
                <label htmlFor="firstName">
                  Nome <span className="text-danger">*</span>
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  name="firstName"
                  id="firstName"
                  type="text"
                />
              </div>
              <div>
                <label htmlFor="lastName">
                  Cognome <span className="text-danger">*</span>
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  name="lastName"
                  id="lastName"
                  type="text"
                />
              </div>
              <div>
                <label htmlFor="displayName">Nome visualizzato</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  name="displayName"
                  id="displayName"
                  type="text"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="birthDate">
                Data di nascita <span className="text-danger">*</span>
              </label>
              <input
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                name="birthDate"
                id="birthDate"
                type="date"
              />
            </div>
            <div className="form-group d-flex flex-row justify-content-center">
              <div>
                <label htmlFor="email">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  name="email"
                  id="email"
                  type="email"
                />
              </div>
              <div>
                <label htmlFor="password">
                  Password <span className="text-danger">*</span>
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  name="password"
                  id="password"
                  type="password"
                />
              </div>
            </div>

            <div className="form-group d-flex flex-row justify-content-center">
              <div>
                <label htmlFor="country">Stato</label>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  name="country"
                  id="country"
                  type="text"
                />
              </div>
              <div>
                <label htmlFor="city">Città</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  name="city"
                  id="city"
                  type="text"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="p-0 m-0">Immagine del profilo</label>
            </div>
            <div
              style={{
                border: "2px solid #222",
                padding: "14px",
                borderRadius: "10px",
              }}
            >
              <div className="d-flex justify-content-center">
                <CoolSwitch
                  checked={showAvatar}
                  onChange={() => {
                    setShowAvatar(!showAvatar);
                  }}
                />
              </div>
              <div className="form-group">
                <label className="text-center">
                  {showAvatar ? "Scegli un avatar" : "Carica una foto"}
                </label>
              </div>

              {showAvatar && (
                <div>
                  <CoolRadio
                    onAvatarChange={(selectedAvatar) =>
                      handleAvatarChange(selectedAvatar)
                    }
                  />
                </div>
              )}
              {!showAvatar && (
                <div>
                  <ChooseFile onFileSelect={(file) => setPictureFile(file)} />
                </div>
              )}
            </div>
            <div className="form-group">
              <label>
                Ti stai registrando come (selezione multipla consentita){" "}
                <span className="text-danger">*</span>
              </label>
            </div>
            <div className="d-flex flex-column gap-2">
              <CoolCheckbox
                checked={isGamer}
                onChange={() => {
                  setIsGamer(!isGamer);
                }}
                text="Videogiocatore"
              />
              <CoolCheckbox
                checked={isDeveloper}
                onChange={() => {
                  setIsDeveloper(!isDeveloper);
                }}
                text="Sviluppatore"
              />
            </div>
            {isDeveloper && (
              <div className="form-group">
                <label className="p-0 m-0">Ruolo di sviluppatore</label>
                <DeveloperRole
                  onDeveloperRoleChange={(selectedDeveloperRole) =>
                    setDeveloperRole(selectedDeveloperRole)
                  }
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="bio">Biografia</label>
              <textarea
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                }}
                cols={100}
                rows={100}
                id="bio"
                name="bio"
              />
            </div>
            <div className="form-group">
              <label htmlFor="title">Titolo</label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                name="title"
                id="title"
                type="text"
              />
            </div>

            <div className="d-flex justify-content-center">
              <GradientButton text="REGISTRATI" type="submit" />
            </div>
          </form>
        </div>
      </StyledWrapper>
    </>
  );
};

const StyledWrapper = styled.div`
  .form-container {
    width: 600px;
    background: linear-gradient(#212121, rgb(0, 0, 0)) padding-box,
      linear-gradient(145deg, transparent 35%, #e81cff, #40c9ff) border-box;
    border: 2px solid transparent;
    padding: 32px 24px;
    font-size: 14px;
    font-family: inherit;
    color: white;
    display: flex;
    flex-direction: column;
    gap: 20px;
    box-sizing: border-box;
    border-radius: 16px;
    background-size: 200% 100%;
    animation: gradient 3s ease infinite;
  }

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }

    50% {
      background-position: 100% 50%;
    }

    100% {
      background-position: 0% 50%;
    }
  }

  .form-container button:active {
    scale: 0.95;
  }

  .form-container .form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-container .form-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .form-container .form-group label {
    display: block;
    margin-bottom: 5px;
    color: #717171;
    font-weight: 600;
    font-size: 12px;
  }

  .form-container .form-group input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 8px;
    color: #fff;
    font-family: inherit;
    background-color: transparent;
    border: 1px solid #414141;
  }

  .form-container .form-group textarea {
    width: 100%;
    padding: 12px 16px;
    border-radius: 8px;
    resize: none;
    color: #fff;
    height: 96px;
    border: 1px solid #414141;
    background-color: transparent;
    font-family: inherit;
  }

  .form-container .form-group input::placeholder {
    opacity: 0.5;
  }

  .form-container .form-group input:focus {
    outline: none;
    border-color: #e81cff;
  }

  .form-container .form-group textarea:focus {
    outline: none;
    border-color: #e81cff;
  }

  .form-container .form-submit-btn {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    align-self: flex-start;
    font-family: inherit;
    color: #717171;
    font-weight: 600;
    width: 40%;
    background: #313131;
    border: 1px solid #414141;
    padding: 12px 16px;
    font-size: inherit;
    gap: 8px;
    margin-top: 8px;
    cursor: pointer;
    border-radius: 6px;
  }

  .form-container .form-submit-btn:hover {
    background-color: #fff;
    border-color: #fff;
  }
`;

export default RegisterForm;
