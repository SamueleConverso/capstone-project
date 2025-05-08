import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import * as Icon from "react-bootstrap-icons";
import { useDispatch, useSelector } from "react-redux";
import { createVideogame } from "../redux/actions/videogame";
import { video } from "framer-motion/client";

const PublishVideogameCard = () => {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useSelector((state) => state.profile.user);

  const [selectedGenres, setSelectedGenres] = useState([""]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([""]);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    extraDescription: "",
    genre: "",
    picture: "",
    cover: "",
    video: "",
    link: "",
    releaseDate: null,
    platform: "",
    ageRating: 18,
    contributors: "",
    price: 0,
    isHidden: false,
    isAvailableForPurchase: false,
    country: "",
    city: "",
    applicationUserId: "",
  });
  const [formFile, setFormFile] = useState(null);

  useEffect(() => {
    const validGenres = selectedGenres.filter((genre) => genre !== "");
    if (validGenres.length > 0) {
      setFormData((prev) => ({
        ...prev,
        genre: validGenres.join(" / "),
      }));
    }
  }, [selectedGenres]);

  useEffect(() => {
    const validPlatforms = selectedPlatforms.filter(
      (platform) => platform !== ""
    );
    if (validPlatforms.length > 0) {
      setFormData((prev) => ({
        ...prev,
        platform: validPlatforms.join(" / "),
      }));
    }
  }, [selectedPlatforms]);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleGenreChange = (index, value) => {
    const newGenres = [...selectedGenres];
    newGenres[index] = value;
    setSelectedGenres(newGenres);
  };

  const handlePlatformChange = (index, value) => {
    const newPlatforms = [...selectedPlatforms];
    newPlatforms[index] = value;
    setSelectedPlatforms(newPlatforms);
  };

  const addGenre = () => {
    if (selectedGenres.length < 5) {
      setSelectedGenres([...selectedGenres, ""]);
    }
  };

  const removeGenre = (index) => {
    if (selectedGenres.length > 1) {
      const newGenres = selectedGenres.filter((_, i) => i !== index);
      setSelectedGenres(newGenres);
    }
  };

  const addPlatform = () => {
    if (selectedPlatforms.length < 5) {
      setSelectedPlatforms([...selectedPlatforms, ""]);
    }
  };

  const removePlatform = (index) => {
    if (selectedPlatforms.length > 1) {
      const newPlatforms = selectedPlatforms.filter((_, i) => i !== index);
      setSelectedPlatforms(newPlatforms);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();

    const updatedFormData = {
      ...formData,
      applicationUserId: user.applicationUserId,
    };

    for (const [key, value] of Object.entries(updatedFormData)) {
      submitData.append(key, value);
    }

    // if (formFile) {
    //   submitData.append("pictureFile", formFile);
    // }

    if (formFile) {
      submitData.append("pictureFile", formFile);
    } else {
      try {
        const defaultImagePath = "../../public/assets/img/GameController.png";
        const defaultImageFile = await urlToFile(
          defaultImagePath,
          "GameController.png"
        );
        if (defaultImageFile) {
          submitData.append("pictureFile", defaultImageFile);
        }
      } catch (error) {
        console.error(
          "Errore nel caricamento dell'immagine predefinita:",
          error
        );
      }
    }

    dispatch(createVideogame(submitData))
      .then(() => {
        setFormData({
          title: "",
          subtitle: "",
          description: "",
          extraDescription: "",
          genre: "",
          picture: "",
          cover: "",
          video: "",
          link: "",
          releaseDate: null,
          platform: "",
          ageRating: 18,
          contributors: "",
          price: 0,
          isHidden: false,
          isAvailableForPurchase: false,
          country: "",
          city: "",
          applicationUserId: "",
        });
        setSelectedGenres([""]);
        setSelectedPlatforms([""]);
        setFormFile(null);
        setPreviewImg(null);
        setIsExpanded(false);
        setIsSubmitting(false);
      })
      .catch((error) => {
        console.error("Errore durante la pubblicazione del videogioco:", error);
        setIsSubmitting(false);
      });
  };

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

  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        applicationUserId: user.applicationUserId,
      }));
    }
  }, [user]);

  return (
    <StyledCard
      initial={false}
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={{
        expanded: { height: "auto", opacity: 1 },
        collapsed: { height: "100px", opacity: 1 },
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="header" onClick={handleToggleExpand}>
        <div className="header-content">
          <Icon.Controller className="header-icon" />
          <h3>Pubblica un Nuovo Videogioco</h3>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Icon.ChevronDown className="toggle-icon" />
        </motion.div>
      </div>

      {isExpanded && (
        <motion.div
          className="form-container"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="title">
                  <Icon.Type /> Titolo*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Titolo del videogioco"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="subtitle">
                  <Icon.TextIndentLeft /> Sottotitolo
                </label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="Sottotitolo o slogan del gioco"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">
                  <Icon.CardText /> Descrizione*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descrivi brevemente il tuo gioco"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="form-group full-width">
                <label htmlFor="extraDescription">
                  <Icon.CardHeading /> Descrizione Extra
                </label>
                <textarea
                  id="extraDescription"
                  name="extraDescription"
                  value={formData.extraDescription}
                  onChange={handleInputChange}
                  placeholder="Dettagli aggiuntivi sul gioco"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group full-width">
                <label htmlFor="genre">
                  <Icon.Tags /> Generi* (max 5)
                </label>
                <div className="multi-select-container">
                  {selectedGenres.map((genre, index) => (
                    <div key={`genre-${index}`} className="select-item">
                      <div className="custom-select">
                        <select
                          id={`genre-${index}`}
                          value={genre}
                          onChange={(e) =>
                            handleGenreChange(index, e.target.value)
                          }
                          required={index === 0}
                          className="styled-select genre-select"
                        >
                          <option value="" disabled>
                            Seleziona un genere
                          </option>
                          <option value="Action">Action</option>
                          <option value="Adventure">Adventure</option>
                          <option value="RPG">RPG</option>
                          <option value="Strategy">Strategy</option>
                          <option value="Simulation">Simulation</option>
                          <option value="Sports">Sports</option>
                          <option value="Racing">Racing</option>
                          <option value="Shooter">Shooter</option>
                          <option value="Puzzle">Puzzle</option>
                          <option value="Platformer">Platformer</option>
                          <option value="Fighting">Fighting</option>
                          <option value="Horror">Horror</option>
                          <option value="Survival">Survival</option>
                          <option value="MMORPG">MMORPG</option>
                          <option value="Open World">Open World</option>
                          <option value="Visual Novel">Visual Novel</option>
                          <option value="Rhythm">Rhythm</option>
                        </select>
                      </div>
                      {index > 0 && (
                        <motion.button
                          type="button"
                          className="remove-item-btn"
                          onClick={() => removeGenre(index)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Icon.DashCircleFill />
                        </motion.button>
                      )}
                    </div>
                  ))}
                  {selectedGenres.length < 5 && selectedGenres[0] !== "" && (
                    <motion.button
                      type="button"
                      className="add-item-btn"
                      onClick={addGenre}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Icon.PlusCircleFill /> Aggiungi Genere
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="platform">
                  <Icon.Laptop /> Piattaforme* (max 5)
                </label>
                <div className="multi-select-container">
                  {selectedPlatforms.map((platform, index) => (
                    <div key={`platform-${index}`} className="select-item">
                      <div className="custom-select">
                        <select
                          id={`platform-${index}`}
                          value={platform}
                          onChange={(e) =>
                            handlePlatformChange(index, e.target.value)
                          }
                          required={index === 0}
                          className="styled-select platform-select"
                        >
                          <option value="" disabled>
                            Seleziona una piattaforma
                          </option>
                          <option value="PC">PC</option>
                          <option value="PlayStation 5">PlayStation 5</option>
                          <option value="PlayStation 4">PlayStation 4</option>
                          <option value="Xbox Series X/S">
                            Xbox Series X/S
                          </option>
                          <option value="Xbox One">Xbox One</option>
                          <option value="Nintendo Switch">
                            Nintendo Switch
                          </option>
                          <option value="iOS">iOS</option>
                          <option value="Android">Android</option>
                          <option value="Mac">Mac</option>
                          <option value="Linux">Linux</option>
                          <option value="Web Browser">Web Browser</option>
                          <option value="Steam Deck">Steam Deck</option>
                          <option value="VR">VR</option>
                          <option value="Nintendo 3DS">Nintendo 3DS</option>
                          <option value="Retro Console">Retro Console</option>
                        </select>
                      </div>
                      {index > 0 && (
                        <motion.button
                          type="button"
                          className="remove-item-btn"
                          onClick={() => removePlatform(index)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Icon.DashCircleFill />
                        </motion.button>
                      )}
                    </div>
                  ))}
                  {selectedPlatforms.length < 5 &&
                    selectedPlatforms[0] !== "" && (
                      <motion.button
                        type="button"
                        className="add-item-btn"
                        onClick={addPlatform}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Icon.PlusCircleFill /> Aggiungi Piattaforma
                      </motion.button>
                    )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="ageRating">
                  <Icon.ExclamationTriangle /> Classificazione Età*
                </label>
                <input
                  type="number"
                  id="ageRating"
                  name="ageRating"
                  value={formData.ageRating}
                  onChange={handleInputChange}
                  min="0"
                  max="18"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">
                  <Icon.GlobeEuropeAfrica /> Paese
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Paese di sviluppo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">
                  <Icon.GeoAlt /> Città
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Città di sviluppo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="releaseDate">
                  <Icon.CalendarDate /> Data di Rilascio*
                </label>
                <input
                  type="date"
                  id="releaseDate"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contributors">
                  <Icon.People /> Contributori
                </label>
                <input
                  type="text"
                  id="contributors"
                  name="contributors"
                  value={formData.contributors}
                  onChange={handleInputChange}
                  placeholder="Nomi dei contributori"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="link">
                  <Icon.Link45deg /> Link
                </label>
                <input
                  type="url"
                  id="link"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="Link al sito ufficiale o store"
                />
              </div>

              <div className="form-group image-upload full-width">
                <label htmlFor="gamePicture">
                  <Icon.Image /> Immagine del Gioco
                </label>
                <div className="upload-container">
                  <div className="image-preview">
                    {previewImg ? (
                      <>
                        <img src={previewImg} alt="Anteprima" />
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => {
                            setPreviewImg(null);
                            setFormFile(null);
                          }}
                        >
                          <Icon.XCircleFill />
                        </button>
                      </>
                    ) : (
                      <div className="placeholder">
                        <Icon.Image />
                        <span>Seleziona un'immagine</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="gamePicture"
                    name="gamePicture"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <label htmlFor="gamePicture" className="file-label">
                    <Icon.Upload /> Carica Immagine
                  </label>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <motion.button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setIsExpanded(false);
                  setFormData({
                    title: "",
                    subtitle: "",
                    description: "",
                    extraDescription: "",
                    genre: "",
                    picture: "",
                    cover: "",
                    video: "",
                    link: "",
                    releaseDate: null,
                    platform: "",
                    ageRating: 18,
                    contributors: "",
                    price: 0,
                    isHidden: false,
                    isAvailableForPurchase: false,
                    country: "",
                    city: "",
                    applicationUserId: "",
                  });
                  setSelectedGenres([""]);
                  setSelectedPlatforms([""]);
                  setFormFile(null);
                  setPreviewImg(null);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting}
              >
                <Icon.X /> Annulla
              </motion.button>

              <motion.button
                type="submit"
                className="submit-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" /> Pubblicazione...
                  </>
                ) : (
                  <>
                    <Icon.CloudUpload /> Pubblica Videogioco
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}
    </StyledCard>
  );
};

const StyledCard = styled(motion.div)`
  width: 100%;
  background: linear-gradient(145deg, #1e1e30, #252540);
  border-radius: 16px;
  margin-bottom: 30px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #7e188d, #00a2ae, #7e188d);
    z-index: 2;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 25px;
    cursor: pointer;
    min-height: 100px;

    &:hover {
      background: linear-gradient(145deg, #252540, #2a2a45);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .header-icon {
      font-size: 2rem;
      color: #05bdc2;
      filter: drop-shadow(0 0 8px rgba(5, 189, 194, 0.5));
    }

    h3 {
      color: white;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .toggle-icon {
      color: #05bdc2;
      font-size: 1.5rem;
    }
  }

  .form-container {
    padding: 0 25px 25px;

    form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;

      .full-width {
        grid-column: span 2;
      }
    }

    .form-group {
      position: relative;

      label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #a0a0b0;
        font-size: 0.95rem;
        font-weight: 500;
        margin-bottom: 8px;

        svg {
          color: #05bdc2;
          font-size: 1.1rem;
        }
      }

      input,
      textarea,
      select {
        width: 100%;
        padding: 12px 15px;
        background-color: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: white;
        font-size: 0.95rem;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: #05bdc2;
          box-shadow: 0 0 0 2px rgba(5, 189, 194, 0.3);
        }

        &::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
      }

      textarea {
        resize: vertical;
        min-height: 80px;
      }

      &.image-upload {
        .upload-container {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-top: 10px;
        }

        .image-preview {
          width: 150px;
          height: 150px;
          border-radius: 8px;
          overflow: hidden;
          background-color: rgba(0, 0, 0, 0.2);
          border: 1px dashed rgba(255, 255, 255, 0.2);
          position: relative;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            gap: 10px;
            color: rgba(255, 255, 255, 0.3);

            svg {
              font-size: 2rem;
            }

            span {
              font-size: 0.8rem;
              text-align: center;
            }
          }

          .remove-btn {
            position: absolute;
            top: 5px;
            right: 5px;
            background: rgba(0, 0, 0, 0.7);
            border: none;
            border-radius: 50%;
            width: 25px;
            height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #ff4d4d;
            padding: 0;

            svg {
              font-size: 1.1rem;
            }
          }
        }

        .file-input {
          display: none;
        }

        .file-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 15px;
          background: linear-gradient(45deg, #00a2ae, #05bdc2);
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          margin: 0;

          svg {
            font-size: 1.3rem;
            color: #ffeb3b;
            filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
            animation: pulse 2s infinite ease-in-out;
          }

          &:hover {
            background: linear-gradient(45deg, #05bdc2, #00a2ae);
            transform: translateY(-2px);

            svg {
              color: #fff176;
              transform: scale(1.1);
            }
          }

          &:active {
            transform: translateY(0);
          }

          @keyframes pulse {
            0% {
              opacity: 0.8;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.1);
            }
            100% {
              opacity: 0.8;
              transform: scale(1);
            }
          }
        }
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      margin-top: 10px;

      button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.3s ease;

        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        svg {
          font-size: 1.1rem;
        }
      }

      .cancel-btn {
        background-color: rgba(255, 255, 255, 0.1);
        color: #e0e0e0;

        &:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.15);
        }
      }

      .submit-btn {
        background: linear-gradient(45deg, #7e188d, #9920a9);
        color: white;
        position: relative;
        overflow: hidden;

        svg {
          font-size: 1.2rem;
          color: #f0f0f0;
          filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.3));
          animation: floatUpload 3s infinite ease-in-out;
          transition: all 0.3s ease;
        }

        &:hover:not(:disabled) {
          background: linear-gradient(45deg, #9920a9, #7e188d);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(126, 24, 141, 0.4);

          svg {
            color: #ffffff;
            filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.6));
            animation: floatUploadFast 1.5s infinite ease-in-out;
          }
        }

        &:active:not(:disabled) {
          transform: translateY(0);
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes floatUpload {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes floatUploadFast {
          0% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-4px) scale(1.1);
          }
          100% {
            transform: translateY(0) scale(1);
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

  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr !important;

      .full-width {
        grid-column: span 1 !important;
      }
    }
  }

  .multi-select-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .select-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .custom-select {
    position: relative;
    flex: 1;
  }

  .styled-select {
    width: 100%;
    padding: 12px 15px;
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    appearance: none;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #05bdc2;
      box-shadow: 0 0 0 2px rgba(5, 189, 194, 0.3);
    }

    &.genre-select {
      border-left: 4px solid #00bbd0;

      &:focus {
        border-left-color: #00bbd0;
        box-shadow: 0 0 0 2px rgba(0, 187, 208, 0.3);
      }

      option {
        background-color: #1a1a2e;
      }
    }

    &.platform-select {
      border-left: 4px solid #9920a9;

      &:focus {
        border-left-color: #9920a9;
        box-shadow: 0 0 0 2px rgba(153, 32, 169, 0.3);
      }

      option {
        background-color: #1a1a2e;
      }
    }
  }

  .add-item-btn,
  .remove-item-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
    color: white;
    padding: 0;
  }

  .add-item-btn {
    gap: 5px;
    padding: 8px 15px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    font-size: 0.9rem;
    margin-top: 5px;
    color: #05bdc2;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(5, 189, 194, 0.15);
    }

    svg {
      font-size: 1.1rem;
    }
  }

  .remove-item-btn {
    width: 30px;
    height: 30px;
    font-size: 1.2rem;
    color: #ff6b6b;
    transition: all 0.3s ease;

    &:hover {
      color: #ff4757;
    }
  }
`;

export default PublishVideogameCard;
