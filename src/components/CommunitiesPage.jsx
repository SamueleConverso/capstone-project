import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import * as Icon from "react-bootstrap-icons";
import { getUserById, getAllUsers } from "../redux/actions/user";
import {
  getCommunities,
  createCommunity,
  resetCommunityCreation,
} from "../redux/actions/community";
import { addCommunityApplicationUser } from "../redux/actions/communityApplicationUser";
import SearchCommunities from "./SearchCommunities";
import CommunityCard from "./CommunityCard";

const CommunitiesPage = () => {
  const dispatch = useDispatch();
  const allCommunities = useSelector((state) => state.community.communities);
  const currentUser = useSelector((state) => state.profile.user);
  const allUsers = useSelector((state) => state.user.allUsers);
  const isCreationSuccessful = useSelector(
    (state) => state.community.isCreationSuccessful
  );
  const createdCommunity = useSelector(
    (state) => state.community.createdCommunity
  );
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  // const [isLoading, setIsLoading] = useState(true);
  const [showTypeSelect, setShowTypeSelect] = useState(false);
  const [showTypeOptions, setShowTypeOptions] = useState(false);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [showFriendSelect, setShowFriendSelect] = useState(false);
  const [showFriendOptions, setShowFriendOptions] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [createdCommunityInfo, setCreatedCommunityInfo] = useState(null);

  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);
  const [isLoadingCurrentUser, setIsLoadingCurrentUser] = useState(true);
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(true);

  const isLoading =
    isLoadingCommunities || isLoadingCurrentUser || isLoadingAllUsers;

  const [loadingProgress, setLoadingProgress] = useState({
    communities: false,
    currentUser: false,
    allUsers: false,
  });

  const [picturePreview, setPicturePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [formData, setFormData] = useState({
    type: { Gaming: true, Development: false },
    name: "",
    extraName: "",
    description: "",
    extraDescription: "",
    pictureFile: null,
    coverFile: null,
    link: "",
    isPrivate: "false",
    isHidden: "false",
    maxMembers: "2",
  });

  const getTypeString = () => {
    const { Gaming, Development } = formData.type;
    if (Gaming && Development) return "Gaming / Development";
    if (Gaming) return "Gaming";
    if (Development) return "Development";
    return "Gaming";
  };

  const handleTypeToggle = (type) => {
    if (type === "Gaming" && !currentUser?.isGamer) {
      return;
    }

    if (type === "Development" && !currentUser?.isDeveloper) {
      return;
    }

    if (
      currentUser?.isGamer &&
      !currentUser?.isDeveloper &&
      type === "Gaming" &&
      formData.type[type]
    ) {
      return;
    }

    if (
      !currentUser?.isGamer &&
      currentUser?.isDeveloper &&
      type === "Development" &&
      formData.type[type]
    ) {
      return;
    }

    if (
      formData.type[type] &&
      !Object.entries(formData.type).some(
        ([key, value]) => key !== type && value === true
      )
    ) {
      return;
    }

    setFormData({
      ...formData,
      type: {
        ...formData.type,
        [type]: !formData.type[type],
      },
    });
  };

  useEffect(() => {
    if (currentUser) {
      setFormData((prevData) => ({
        ...prevData,
        type: {
          Gaming: currentUser.isGamer ? true : false,
          Development:
            !currentUser.isGamer && currentUser.isDeveloper ? true : false,
        },
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    setIsLoadingAllUsers(true);
    dispatch(getAllUsers())
      .then(() => {
        setIsLoadingAllUsers(false);
        setLoadingProgress((prev) => ({ ...prev, allUsers: true }));
      })
      .catch((error) => {
        console.error("Errore nel caricare gli utenti:", error);
        setIsLoadingAllUsers(false);
      });
  }, [dispatch]);

  useEffect(() => {
    setIsLoadingCurrentUser(true);
    try {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        const decodedToken = jwtDecode(token);
        setCurrentUserId(decodedToken.id);

        // Carica le informazioni dell'utente corrente usando l'ID dal token
        dispatch(getUserById(decodedToken.id))
          .then(() => {
            setIsLoadingCurrentUser(false);
            setLoadingProgress((prev) => ({ ...prev, currentUser: true }));
          })
          .catch((error) => {
            console.error("Errore nel caricare l'utente:", error);
            setIsLoadingCurrentUser(false);
          });
      } else {
        setIsLoadingCurrentUser(false);
      }
    } catch (error) {
      console.error("Errore nel decodificare il token:", error);
      setIsLoadingCurrentUser(false);
    }
  }, [dispatch]);

  useEffect(() => {
    const minRequiredMembers = Math.max(2, 1 + selectedFriends.length);

    if (parseInt(formData.maxMembers) < minRequiredMembers) {
      setFormData((prevData) => ({
        ...prevData,
        maxMembers: minRequiredMembers.toString(),
      }));
    }
  }, [selectedFriends]);

  useEffect(() => {
    if (currentUserId) {
      dispatch(getUserById(currentUserId));
    }
  }, [currentUserId, dispatch]);

  useEffect(() => {
    setIsLoadingCommunities(true);
    dispatch(getCommunities())
      .then(() => {
        setIsLoadingCommunities(false);
        setLoadingProgress((prev) => ({ ...prev, communities: true }));
      })
      .catch((error) => {
        console.error("Errore nel caricare le community:", error);
        setIsLoadingCommunities(false);
      });
  }, [dispatch]);

  useEffect(() => {
    if (allCommunities) {
      applyFilters();
    }
  }, [allCommunities, searchQuery, activeFilter, selectedType]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const applyFilters = () => {
    if (!allCommunities) return;

    if (!Array.isArray(allCommunities)) {
      console.error("allCommunities non è un array:", allCommunities);
      return;
    }

    let result = [...allCommunities];

    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((community) => {
        const name = community.name ? community.name.toLowerCase() : "";
        const description = community.description
          ? community.description.toLowerCase()
          : "";
        const extraName = community.extraName
          ? community.extraName.toLowerCase()
          : "";
        const extraDescription = community.extraDescription
          ? community.extraDescription.toLowerCase()
          : "";
        return (
          name.includes(query) ||
          description.includes(query) ||
          extraName.includes(query) ||
          extraDescription.includes(query)
        );
      });
    }

    if (selectedType) {
      result = result.filter((community) =>
        community.type.toLowerCase().includes(selectedType.toLowerCase())
      );
    }

    if (activeFilter) {
      switch (activeFilter) {
        case "nameAsc":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "nameDesc":
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "newest":
          result.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case "oldest":
          result.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          break;
        case "mostMembers":
          result.sort(
            (a, b) =>
              (b.communityApplicationUsers?.length || 0) -
              (a.communityApplicationUsers?.length || 0)
          );
          break;
        case "myCommunities":
          if (currentUser) {
            result = result.filter(
              (community) =>
                community.applicationUser &&
                community.applicationUser.applicationUserId ===
                  currentUser.applicationUserId
            );
          }
          break;
        default:
          break;
      }
    }

    setFilteredCommunities(result);
  };

  const toggleFilter = (filter) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter);
    }
  };

  const resetFilters = () => {
    setActiveFilter(null);
    setSearchQuery("");
    setSelectedType("");
    setShowTypeSelect(false);
  };

  const handleTypeFilter = () => {
    setShowTypeSelect(!showTypeSelect);
    if (showTypeSelect) {
      setShowTypeOptions(false);
    }
  };

  const applyTypeFilter = (type) => {
    setSelectedType(type);
    setShowTypeOptions(false);
    applyFilters();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "maxMembers") {
      const minAllowed = Math.max(2, 1 + selectedFriends.length);

      const validValue = Math.max(parseInt(value) || minAllowed, minAllowed);

      setFormData({
        ...formData,
        maxMembers: validValue.toString(),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData({
        ...formData,
        [name]: files[0],
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === "pictureFile") {
          setPicturePreview(reader.result);
        } else if (name === "coverFile") {
          setCoverPreview(reader.result);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked.toString(),
    });
  };

  const toggleFriendSelection = (friend) => {
    const isSelected = selectedFriends.some(
      (f) => f.applicationUserId === friend.applicationUserId
    );

    if (isSelected) {
      setSelectedFriends(
        selectedFriends.filter(
          (f) => f.applicationUserId !== friend.applicationUserId
        )
      );
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const getFriendsList = () => {
    if (
      !currentUser ||
      !currentUser.friendList ||
      !currentUser.friendList.applicationUserFriends
    ) {
      return [];
    }

    let friends = currentUser.friendList.applicationUserFriends
      .filter((friend) => friend.accepted === true)
      .map((friend) => friend.applicationUser);

    if (formData.type.Gaming && !formData.type.Development) {
      friends = friends.filter((friend) => friend.isGamer);
    } else if (!formData.type.Gaming && formData.type.Development) {
      friends = friends.filter((friend) => friend.isDeveloper);
    }

    return friends;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submittedName = formData.name;
    const submittedDescription = formData.description;

    const form = new FormData();
    form.append("type", getTypeString());
    form.append("name", formData.name);
    form.append("extraName", formData.extraName || "");
    form.append("description", formData.description);
    form.append("extraDescription", formData.extraDescription || "");
    form.append("link", formData.link || "");
    form.append("isPrivate", formData.isPrivate);
    form.append("isHidden", formData.isHidden);
    form.append("maxMembers", formData.maxMembers);
    form.append("createdAt", new Date().toISOString());
    form.append("applicationUserId", currentUserId || "");

    if (formData.pictureFile) {
      form.append("pictureFile", formData.pictureFile);
    }

    if (formData.coverFile) {
      form.append("coverFile", formData.coverFile);
    }

    try {
      await dispatch(createCommunity(form));

      setCreatedCommunityInfo({
        name: submittedName,
        description: submittedDescription,
        timestamp: new Date(),
      });

      setFormData({
        type: { Gaming: true, Development: false },
        name: "",
        extraName: "",
        description: "",
        extraDescription: "",
        pictureFile: null,
        coverFile: null,
        link: "",
        isPrivate: "false",
        isHidden: "false",
        maxMembers: "2",
      });
      setPicturePreview(null);
      setCoverPreview(null);
      //setSelectedFriends([]);
      setShowPublishForm(false);
    } catch (error) {
      console.error("Errore durante la creazione della community:", error);
    } finally {
      //setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log(
      "useEffect triggered - isCreationSuccessful:",
      isCreationSuccessful
    );
    console.log("createdCommunityInfo:", createdCommunityInfo);
    console.log("selectedFriends:", selectedFriends);

    const addFriendsToCommunity = async () => {
      if (isCreationSuccessful && createdCommunityInfo) {
        console.log("Condizioni soddisfatte, tentativo di aggiungere membri");

        try {
          const communitiesResponse = await dispatch(getCommunities());
          console.log("Community recuperate:", communitiesResponse?.payload);

          if (communitiesResponse?.payload) {
            const userCommunities = communitiesResponse.payload.filter(
              (c) => c.applicationUser?.applicationUserId === currentUserId
            );

            console.log("Community dell'utente:", userCommunities);

            userCommunities.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            console.log("Community ordinate per data:", userCommunities);

            const foundCommunity = userCommunities.find(
              (c) =>
                c.name === createdCommunityInfo.name &&
                c.description === createdCommunityInfo.description
            );

            console.log("Community trovata:", foundCommunity);

            if (foundCommunity) {
              let membersAdded = 0;

              console.log("Aggiungo il creatore come membro:", currentUserId);
              const creatorAdded = await dispatch(
                addCommunityApplicationUser(
                  currentUserId,
                  foundCommunity.communityId
                )
              );

              if (creatorAdded) {
                console.log("Creatore aggiunto con successo alla community");
              }

              for (const friend of selectedFriends) {
                console.log(
                  "Tentativo di aggiungere il membro:",
                  friend.applicationUserId
                );
                const success = await dispatch(
                  addCommunityApplicationUser(
                    friend.applicationUserId,
                    foundCommunity.communityId
                  )
                );
                if (success) membersAdded++;
              }

              console.log(
                `${membersAdded} amici aggiunti alla community su ${selectedFriends.length} tentativi, più il creatore`
              );
            } else {
              console.error(
                "Community creata non trovata nell'elenco delle community"
              );
            }
          }

          setSelectedFriends([]);
          setCreatedCommunityInfo(null);
        } catch (error) {
          console.error("Errore durante l'aggiunta degli amici:", error);
        } finally {
          dispatch(resetCommunityCreation());
        }
      }
    };

    if (isCreationSuccessful) {
      addFriendsToCommunity();
    }
  }, [
    isCreationSuccessful,
    createdCommunityInfo,
    selectedFriends,
    currentUserId,
    dispatch,
  ]);

  if (isLoading) {
    return (
      <LoadingContainer>
        <div className="loading-content">
          <div className="spinner"></div>
          <h3>Caricamento delle community in corso...</h3>
          <div className="loading-progress">
            <div
              className={`progress-item ${
                loadingProgress.communities ? "completed" : ""
              }`}
            >
              <span className="progress-label">Community</span>
              {loadingProgress.communities ? (
                <Icon.CheckCircleFill className="check-icon" />
              ) : (
                <Icon.HourglassSplit className="loading-icon" />
              )}
            </div>
            <div
              className={`progress-item ${
                loadingProgress.currentUser ? "completed" : ""
              }`}
            >
              <span className="progress-label">Profilo utente</span>
              {loadingProgress.currentUser ? (
                <Icon.CheckCircleFill className="check-icon" />
              ) : (
                <Icon.HourglassSplit className="loading-icon" />
              )}
            </div>
            <div
              className={`progress-item ${
                loadingProgress.allUsers ? "completed" : ""
              }`}
            >
              <span className="progress-label">Utenti</span>
              {loadingProgress.allUsers ? (
                <Icon.CheckCircleFill className="check-icon" />
              ) : (
                <Icon.HourglassSplit className="loading-icon" />
              )}
            </div>
          </div>
        </div>
      </LoadingContainer>
    );
  }

  return (
    <StyledWrapper>
      <motion.div
        className="communities-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header">
          <h2>
            <Icon.People className="header-icon" /> Community
          </h2>
          <p>
            Unisciti o crea community per condividere passioni e progetti con
            altri appassionati
          </p>
        </div>

        {currentUser && (
          <motion.div
            className="publish-toggle"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowPublishForm(!showPublishForm)}
          >
            {showPublishForm ? (
              <>
                <Icon.XCircleFill className="icon" />
                <span>Chiudi form creazione</span>
              </>
            ) : (
              <>
                <Icon.PlusCircleFill className="icon" />
                <span>Crea una nuova community</span>
              </>
            )}
          </motion.div>
        )}

        <AnimatePresence>
          {showPublishForm && currentUser && (
            <motion.div
              className="publish-form-container"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmit} className="publish-form">
                <h3>
                  <Icon.PlusSquareFill className="form-icon" /> Crea una nuova
                  Community
                </h3>

                <div className="form-group">
                  <label>
                    <Icon.TagsFill className="input-icon" /> Tipo di Community *
                  </label>
                  <div className="type-selector">
                    <div
                      className={`type-option ${
                        formData.type.Gaming ? "active" : ""
                      } ${!currentUser?.isGamer ? "disabled" : ""}`}
                      onClick={() => handleTypeToggle("Gaming")}
                    >
                      <Icon.Controller /> Gaming
                      {formData.type.Gaming && (
                        <Icon.CheckCircleFill className="type-selected" />
                      )}
                      {!currentUser?.isGamer && (
                        <div className="type-disabled-overlay">
                          <Icon.LockFill />
                        </div>
                      )}
                    </div>
                    <div
                      className={`type-option ${
                        formData.type.Development ? "active" : ""
                      } ${!currentUser?.isDeveloper ? "disabled" : ""}`}
                      onClick={() => handleTypeToggle("Development")}
                    >
                      <Icon.CodeSquare /> Development
                      {formData.type.Development && (
                        <Icon.CheckCircleFill className="type-selected" />
                      )}
                      {!currentUser?.isDeveloper && (
                        <div className="type-disabled-overlay">
                          <Icon.LockFill />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="selected-types">
                    Tipi selezionati: <strong>{getTypeString()}</strong>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <Icon.TypeBold className="input-icon" /> Nome Community *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Nome della community"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <Icon.TypeItalic className="input-icon" /> Nome Extra
                    </label>
                    <input
                      type="text"
                      name="extraName"
                      value={formData.extraName}
                      onChange={handleInputChange}
                      placeholder="Sottotitolo o nome alternativo (opzionale)"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <Icon.ChatQuoteFill className="input-icon" /> Descrizione *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descrivi la tua community..."
                    required
                    rows={3}
                    className="form-textarea"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>
                    <Icon.ChatSquareQuoteFill className="input-icon" />{" "}
                    Descrizione Extra
                  </label>
                  <textarea
                    name="extraDescription"
                    value={formData.extraDescription}
                    onChange={handleInputChange}
                    placeholder="Dettagli aggiuntivi sulla community (opzionale)"
                    rows={2}
                    className="form-textarea"
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <Icon.ImageFill className="input-icon" /> Immagine Profilo
                    </label>
                    <div className="file-upload-container">
                      <input
                        type="file"
                        name="pictureFile"
                        onChange={handleFileChange}
                        accept="image/*"
                        id="pictureFile"
                        className="file-input"
                      />
                      <label htmlFor="pictureFile" className="file-label">
                        <Icon.Upload /> Scegli immagine
                      </label>
                      {picturePreview && (
                        <div className="image-preview">
                          <img src={picturePreview} alt="Anteprima profilo" />
                          <button
                            type="button"
                            className="remove-image"
                            onClick={() => {
                              setPicturePreview(null);
                              setFormData({ ...formData, pictureFile: null });
                            }}
                          >
                            <Icon.XCircleFill />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>
                      <Icon.Image className="input-icon" /> Immagine Copertina
                    </label>
                    <div className="file-upload-container">
                      <input
                        type="file"
                        name="coverFile"
                        onChange={handleFileChange}
                        accept="image/*"
                        id="coverFile"
                        className="file-input"
                      />
                      <label htmlFor="coverFile" className="file-label">
                        <Icon.Upload /> Scegli copertina
                      </label>
                      {coverPreview && (
                        <div className="image-preview wide">
                          <img src={coverPreview} alt="Anteprima copertina" />
                          <button
                            type="button"
                            className="remove-image"
                            onClick={() => {
                              setCoverPreview(null);
                              setFormData({ ...formData, coverFile: null });
                            }}
                          >
                            <Icon.XCircleFill />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <Icon.Link45deg className="input-icon" /> Link Esterno
                    </label>
                    <input
                      type="text"
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      placeholder="URL esterno (opzionale)"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <Icon.PeopleFill className="input-icon" /> Numero max
                      membri *
                    </label>
                    <input
                      type="number"
                      name="maxMembers"
                      value={formData.maxMembers}
                      onChange={handleInputChange}
                      placeholder="Numero massimo di membri"
                      required
                      min={Math.max(2, 1 + selectedFriends.length)}
                      max="100"
                      className="form-input"
                    />
                    <small className="form-text text-info">
                      {selectedFriends.length > 1
                        ? `Minimo richiesto: ${Math.max(
                            2,
                            1 + selectedFriends.length
                          )} (tu + ${selectedFriends.length} amici)`
                        : "Minimo richiesto: 2 membri"}
                    </small>
                  </div>
                </div>

                <div className="form-row checkbox-row">
                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      name="isPrivate"
                      checked={formData.isPrivate === "true"}
                      onChange={handleCheckboxChange}
                      className="form-checkbox"
                    />
                    <label htmlFor="isPrivate">
                      <Icon.LockFill className="input-icon" /> Community Privata
                    </label>
                  </div>
                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      id="isHidden"
                      name="isHidden"
                      checked={formData.isHidden === "true"}
                      onChange={handleCheckboxChange}
                      className="form-checkbox"
                    />
                    <label htmlFor="isHidden">
                      <Icon.EyeSlashFill className="input-icon" /> Community
                      Nascosta
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <Icon.PersonPlusFill className="input-icon" /> Aggiungi
                    Amici
                  </label>
                  <div className="friends-select-container">
                    <div
                      className="custom-select-header"
                      onClick={() => setShowFriendOptions(!showFriendOptions)}
                    >
                      <Icon.PeopleFill className="select-icon" />
                      <span>
                        {selectedFriends.length > 0
                          ? `${selectedFriends.length} amici selezionati`
                          : "Seleziona amici da aggiungere"}
                      </span>
                      <Icon.ChevronDown className="arrow-icon" />
                    </div>

                    {showFriendOptions && (
                      <div className="custom-select-options">
                        {getFriendsList().length > 0 ? (
                          getFriendsList().map((friend) => (
                            <div
                              key={friend.applicationUserId}
                              className={`friend-option ${
                                selectedFriends.some(
                                  (f) =>
                                    f.applicationUserId ===
                                    friend.applicationUserId
                                )
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() => toggleFriendSelection(friend)}
                            >
                              <div className="friend-avatar">
                                {friend.picture ? (
                                  <img
                                    src={`https://localhost:7105/${friend.picture}`}
                                    alt={
                                      friend.displayName ||
                                      `${friend.firstName} ${friend.lastName}`
                                    }
                                  />
                                ) : (
                                  <Icon.PersonCircle />
                                )}
                              </div>
                              <div className="friend-info">
                                <span className="friend-name">
                                  {friend.displayName ||
                                    `${friend.firstName} ${friend.lastName}`}
                                </span>
                                <div className="friend-badges">
                                  {friend.isDeveloper && (
                                    <span className="friend-badge developer">
                                      Developer
                                    </span>
                                  )}
                                  {friend.isGamer && (
                                    <span className="friend-badge gamer">
                                      Gamer
                                    </span>
                                  )}
                                  {friend.isEditor && (
                                    <span className="friend-badge editor">
                                      Editor
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="select-checkbox">
                                {selectedFriends.some(
                                  (f) =>
                                    f.applicationUserId ===
                                    friend.applicationUserId
                                ) && (
                                  <Icon.CheckCircleFill className="check-icon" />
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-friends">
                            <Icon.EmojiDizzy />
                            <span>Nessun amico disponibile</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedFriends.length > 0 && (
                    <div className="selected-friends-list">
                      {selectedFriends.map((friend) => (
                        <div
                          key={friend.applicationUserId}
                          className="selected-friend-tag"
                        >
                          {friend.displayName ||
                            `${friend.firstName} ${friend.lastName}`}
                          <Icon.XCircle
                            className="remove-friend"
                            onClick={() => toggleFriendSelection(friend)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <motion.button
                    type="submit"
                    className="submit-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner"></div>
                        <span>Pubblicazione in corso...</span>
                      </>
                    ) : (
                      <>
                        <Icon.SendFill />
                        <span>Pubblica Community</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    className="cancel-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPublishForm(false)}
                  >
                    <Icon.XCircleFill />
                    <span>Annulla</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="search-container">
          <SearchCommunities onSearch={handleSearch} value={searchQuery} />
        </div>

        <div className="filters-container">
          <div className="filters-header">
            <Icon.Filter className="filter-icon" />
            <h5>Filtra Community</h5>
          </div>
          <div className="filters-body">
            <div className="filter-badges">
              <motion.div
                className={`filter-badge name-asc-badge ${
                  activeFilter === "nameAsc" ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFilter("nameAsc")}
              >
                <Icon.SortAlphaDown size={14} />
                <span>Nome (A-Z)</span>
              </motion.div>

              <motion.div
                className={`filter-badge name-desc-badge ${
                  activeFilter === "nameDesc" ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFilter("nameDesc")}
              >
                <Icon.SortAlphaDownAlt size={14} />
                <span>Nome (Z-A)</span>
              </motion.div>

              <motion.div
                className={`filter-badge newest-badge ${
                  activeFilter === "newest" ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFilter("newest")}
              >
                <Icon.Calendar3 size={14} />
                <span>Più Recenti</span>
              </motion.div>

              <motion.div
                className={`filter-badge oldest-badge ${
                  activeFilter === "oldest" ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFilter("oldest")}
              >
                <Icon.CalendarX size={14} />
                <span>Più Vecchie</span>
              </motion.div>

              <motion.div
                className={`filter-badge type-badge ${
                  showTypeSelect ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTypeFilter}
              >
                <Icon.TagsFill size={14} />
                <span>Per Tipo</span>
              </motion.div>

              <motion.div
                className={`filter-badge members-badge ${
                  activeFilter === "mostMembers" ? "active" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFilter("mostMembers")}
              >
                <Icon.PeopleFill size={14} />
                <span>Più Membri</span>
              </motion.div>

              {currentUser && (
                <motion.div
                  className={`filter-badge my-communities-badge ${
                    activeFilter === "myCommunities" ? "active" : ""
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFilter("myCommunities")}
                >
                  <Icon.PersonCircle size={14} />
                  <span>Create da Me</span>
                </motion.div>
              )}

              <motion.div
                className="filter-badge reset-badge"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
              >
                <Icon.ArrowCounterclockwise size={14} />
                <span>Reset Filtri</span>
              </motion.div>
            </div>

            <div className="select-filters-container">
              {showTypeSelect && (
                <div className="select-container type-select-container">
                  <div className="custom-select-container">
                    <div
                      className="custom-select-header d-flex align-items-center"
                      onClick={() => setShowTypeOptions(!showTypeOptions)}
                    >
                      <Icon.TagsFill className="me-2" />
                      <span>
                        {selectedType ? selectedType : "Seleziona un tipo"}
                      </span>
                    </div>
                    {showTypeOptions && (
                      <div className="custom-select-options">
                        <div
                          className="custom-option custom-option-placeholder"
                          onClick={() => {
                            setSelectedType("");
                            setShowTypeOptions(false);
                            applyFilters();
                          }}
                        >
                          <span>Tutti i tipi</span>
                        </div>
                        <div
                          className={`custom-option ${
                            selectedType === "Gaming" ? "selected" : ""
                          }`}
                          onClick={() => applyTypeFilter("Gaming")}
                        >
                          <Icon.Controller className="option-icon" />
                          <span>Gaming</span>
                        </div>
                        <div
                          className={`custom-option ${
                            selectedType === "Development" ? "selected" : ""
                          }`}
                          onClick={() => applyTypeFilter("Development")}
                        >
                          <Icon.CodeSquare className="option-icon" />
                          <span>Development</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="results-container">
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Caricamento...</span>
              </div>
              <p>Caricamento community in corso...</p>
            </div>
          ) : filteredCommunities.length > 0 ? (
            <div className="communities-grid">
              {filteredCommunities.map((community) => (
                <CommunityCard
                  key={community.communityId}
                  community={community}
                />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <Icon.EmojiDizzy size={40} />
              <p>
                Nessuna community trovata con i criteri di ricerca specificati.
              </p>
              <button className="reset-btn" onClick={resetFilters}>
                Reimposta filtri
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .communities-container {
    max-width: 1100px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .header-icon {
    margin-right: 0.5rem;
    color: #05bdc2;
  }

  .header h2 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .header p {
    font-size: 1rem;
    color: #9e9e9e;
  }

  .search-container {
    margin-bottom: 2rem;
    display: flex;
    justify-content: center;
  }

  .publish-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: linear-gradient(135deg, #7e188d, #9920a9);
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    margin-bottom: 25px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(126, 24, 141, 0.4);
    transition: all 0.3s ease;

    .icon {
      font-size: 1.3rem;
    }

    &:hover {
      box-shadow: 0 6px 20px rgba(126, 24, 141, 0.6);
      transform: translateY(-2px);
    }
  }

  .publish-form-container {
    background: linear-gradient(
      135deg,
      rgba(25, 25, 35, 0.9),
      rgba(30, 30, 45, 0.8)
    );
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(126, 24, 141, 0.2);
    backdrop-filter: blur(10px);
    margin-bottom: 2.5rem;
    border: 1px solid rgba(126, 24, 141, 0.3);
    //overflow: hidden;
  }

  .publish-form {
    h3 {
      color: white;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 8px;

      .form-icon {
        color: #05bdc2;
      }
    }

    .form-row {
      display: flex;
      gap: 20px;
      margin-bottom: 1rem;

      @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
      }
    }

    .form-group {
      margin-bottom: 1.2rem;
      flex: 1;

      label {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #ccc;
        margin-bottom: 8px;
        font-weight: 500;
        font-size: 14px;

        .input-icon {
          color: #05bdc2;
        }
      }
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: 10px 12px;
      background: rgba(20, 20, 30, 0.8);
      border: 1px solid rgba(126, 24, 141, 0.4);
      border-radius: 8px;
      color: white;
      font-size: 14px;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: #05bdc2;
        box-shadow: 0 0 0 2px rgba(5, 189, 194, 0.2);
      }

      &::placeholder {
        color: #666;
      }
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .type-selector {
      display: flex;
      gap: 15px;
      margin-bottom: 10px;

      .type-option {
        position: relative;
        flex: 1;
        padding: 12px;
        background: rgba(40, 40, 55, 0.6);
        border: 1px solid rgba(126, 24, 141, 0.3);
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: #ccc;
        cursor: pointer;
        transition: all 0.3s ease;

        svg {
          font-size: 1.8rem;
          opacity: 0.8;
        }

        &:hover {
          background: rgba(50, 50, 70, 0.6);
          transform: translateY(-2px);
        }

        &.active {
          background: linear-gradient(
            135deg,
            rgba(126, 24, 141, 0.5),
            rgba(5, 189, 194, 0.3)
          );
          border-color: rgba(5, 189, 194, 0.7);
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);

          svg {
            opacity: 1;
            color: #05bdc2;
          }
        }

        &.disabled {
          opacity: 0.6;
          cursor: not-allowed;
          border-color: rgba(255, 0, 0, 0.3);

          &:hover {
            background: rgba(40, 40, 55, 0.6);
            transform: none;
          }
        }

        .type-disabled-overlay {
          position: absolute;
          top: 5px;
          right: 5px;
          color: rgba(255, 0, 0, 0.7);
          font-size: 16px;
        }
      }
    }

    .file-upload-container {
      position: relative;

      .file-input {
        position: absolute;
        width: 0.1px;
        height: 0.1px;
        opacity: 0;
        overflow: hidden;
        z-index: -1;
      }

      .file-label {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px;
        background: linear-gradient(
          135deg,
          rgba(126, 24, 141, 0.4),
          rgba(5, 189, 194, 0.3)
        );
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px dashed rgba(255, 255, 255, 0.3);

        &:hover {
          background: linear-gradient(
            135deg,
            rgba(126, 24, 141, 0.5),
            rgba(5, 189, 194, 0.4)
          );
        }
      }

      .image-preview {
        margin-top: 10px;
        position: relative;
        width: 100px;
        height: 100px;
        overflow: hidden;
        border-radius: 8px;
        border: 2px solid rgba(5, 189, 194, 0.5);

        &.wide {
          width: 100%;
          height: 80px;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-image {
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(0, 0, 0, 0.6);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: rgba(255, 0, 0, 0.8);
          }
        }
      }
    }

    .checkbox-row {
      margin-top: 10px;

      .checkbox-group {
        display: flex;
        align-items: center;
        gap: 10px;

        label {
          margin-bottom: 0;
          cursor: pointer;
        }

        .form-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #05bdc2;
          cursor: pointer;
        }
      }
    }

    .friends-select-container {
      position: relative;
      z-index: 10;

      .custom-select-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 15px;
        background: rgba(20, 20, 30, 0.8);
        border: 1px solid rgba(126, 24, 141, 0.4);
        border-radius: 8px;
        color: #ccc;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;

        .select-icon {
          color: #05bdc2;
        }

        .arrow-icon {
          margin-left: auto;
          transition: transform 0.3s ease;
        }

        &:hover {
          background: rgba(30, 30, 45, 0.8);
        }
      }

      .custom-select-options {
        position: absolute;
        top: calc(100% + 5px);
        left: 0;
        width: 100%;
        max-height: 250px;
        overflow-y: auto;
        background: rgba(25, 25, 35, 0.95);
        border: 1px solid rgba(126, 24, 141, 0.4);
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        z-index: 20;

        &::-webkit-scrollbar {
          width: 8px;
        }

        &::-webkit-scrollbar-track {
          background: rgba(30, 30, 45, 0.5);
          border-radius: 4px;
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(126, 24, 141, 0.7);
          border-radius: 4px;
        }

        .friend-option {
          display: flex;
          align-items: center;
          padding: 10px 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.2s ease;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background: rgba(126, 24, 141, 0.2);
          }

          &.selected {
            background: rgba(5, 189, 194, 0.2);
          }

          .friend-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            background: #333;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            svg {
              font-size: 24px;
              color: #666;
            }
          }

          .friend-info {
            flex: 1;

            .friend-name {
              display: block;
              color: #ccc;
              font-weight: 500;
            }

            .friend-badge {
              display: inline-block;
              font-size: 10px;
              padding: 2px 6px;
              border-radius: 10px;
              margin-top: 4px;

              &.developer {
                background: rgba(5, 189, 194, 0.3);
                color: #05bdc2;
              }
            }
          }

          .select-checkbox {
            margin-left: 10px;

            .check-icon {
              color: #05bdc2;
              font-size: 20px;
            }
          }
        }

        .no-friends {
          padding: 20px;
          text-align: center;
          color: #666;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;

          svg {
            font-size: 24px;
          }
        }
      }
    }

    .selected-friends-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;

      .selected-friend-tag {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(5, 189, 194, 0.2);
        color: #05bdc2;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 12px;

        .remove-friend {
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            color: #ff5a5a;
          }
        }
      }
    }

    .form-actions {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 2rem;

      button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 10px 20px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
      }

      .submit-btn {
        background: linear-gradient(135deg, #7e188d, #05bdc2);
        color: white;

        &:hover {
          box-shadow: 0 5px 15px rgba(126, 24, 141, 0.5);
        }

        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      }

      .cancel-btn {
        background: rgba(50, 50, 60, 0.7);
        color: #ccc;

        &:hover {
          background: rgba(70, 70, 80, 0.8);
        }
      }
    }
  }

  .filters-container {
    width: 100%;
    padding: 1.2rem;
    background: linear-gradient(
      135deg,
      rgba(78, 9, 121, 0.95),
      rgba(0, 162, 174, 0.85)
    );
    border-radius: 15px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 15px rgba(126, 24, 141, 0.4),
      inset 0 1px 1px rgba(255, 255, 255, 0.2);
    position: relative;
    backdrop-filter: blur(5px);
    margin-bottom: 2rem;
    z-index: 10;
  }

  .filters-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .filters-header h5 {
    font-weight: 600;
    margin: 0;
    letter-spacing: 0.5px;
  }

  .filter-icon {
    font-size: 1.2rem;
    animation: pulse 2s infinite;
  }

  .filters-body {
    position: relative;
  }

  .filter-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }

  .filter-badge {
    padding: 8px 15px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.25s ease;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;
    background: transparent;

    &::before {
      content: "";
      position: absolute;
      top: -10px;
      left: -10px;
      width: 150%;
      height: 150%;
      background: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.3) 0%,
        transparent 70%
      );
      opacity: 0;
      transition: opacity 0.3s ease;
      transform: scale(0.5);
      z-index: 0;
    }

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);

      &::before {
        opacity: 1;
        transform: scale(1);
      }
    }

    &:active {
      transform: translateY(1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }

    &.active {
      background: linear-gradient(45deg, #7e188d, #9920a9);
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25),
        0 0 15px rgba(255, 255, 255, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.8);

      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: white;
        animation: shimmer 2s infinite;
      }
    }
  }

  .name-asc-badge {
    background: linear-gradient(45deg, #4267b2, #5b7bd5);

    &.active {
      background: linear-gradient(45deg, #5b7bd5, #4267b2);
      box-shadow: 0 0 15px rgba(66, 103, 178, 0.6);
    }
  }

  .name-desc-badge {
    background: linear-gradient(45deg, #5b7bd5, #4267b2);

    &.active {
      background: linear-gradient(45deg, #4267b2, #5b7bd5);
      box-shadow: 0 0 15px rgba(66, 103, 178, 0.6);
    }
  }

  .newest-badge {
    background: linear-gradient(45deg, #00a2ae, #00bbd0);

    &.active {
      background: linear-gradient(45deg, #00bbd0, #20d6eb);
      box-shadow: 0 0 15px rgba(0, 187, 208, 0.6);
    }
  }

  .oldest-badge {
    background: linear-gradient(45deg, #20d6eb, #00bbd0);

    &.active {
      background: linear-gradient(45deg, #00bbd0, #00a2ae);
      box-shadow: 0 0 15px rgba(0, 187, 208, 0.6);
    }
  }

  .type-badge {
    background: linear-gradient(45deg, #e67e22, #d35400);

    &.active {
      background: linear-gradient(45deg, #d35400, #e67e22);
      box-shadow: 0 0 15px rgba(230, 126, 34, 0.6);
    }
  }

  .members-badge {
    background: linear-gradient(45deg, #1abc9c, #16a085);

    &.active {
      background: linear-gradient(45deg, #16a085, #1abc9c);
      box-shadow: 0 0 15px rgba(22, 160, 133, 0.6);
    }
  }

  .my-communities-badge {
    background: linear-gradient(45deg, #7e188d, #9920a9);

    &.active {
      background: linear-gradient(45deg, #9920a9, #bd2cd0);
      box-shadow: 0 0 15px rgba(153, 32, 169, 0.6);
    }
  }

  .reset-badge {
    background: linear-gradient(45deg, #95a5a6, #7f8c8d);

    &:hover {
      background: linear-gradient(45deg, #7f8c8d, #95a5a6);
    }
  }

  .select-container {
    margin-top: 15px;
    display: flex;
    justify-content: center;
    animation: fadeIn 0.3s ease-out;
    position: relative;
    z-index: 998;
  }

  .custom-select-container {
    background-color: rgba(33, 33, 33, 0.9);
    border: 2px solid #7e188d;
    border-radius: 12px;
    width: 280px;
    position: relative;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.25);
    overflow: visible;
    z-index: 999;
  }

  .custom-select-header {
    height: 47px;
    padding: 8px 12px;
    border-radius: 10px;
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;

    &:hover {
      background-color: rgba(126, 24, 141, 0.2);
    }
  }

  .custom-select-options {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    width: 100%;
    max-height: 220px;
    overflow-y: auto;
    background-color: rgba(33, 33, 33, 0.99);
    border: 2px solid #7e188d;
    border-radius: 10px;
    padding: 5px;
    z-index: 1000;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    animation: slideDown 0.2s ease-out;

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
    margin-bottom: 3px;

    .option-icon {
      color: #05bdc2;
    }

    &:hover {
      background-color: rgba(126, 24, 141, 0.2);
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

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .communities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  .loading-spinner,
  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #bdbdbd;
    padding: 3rem 0;
    text-align: center;
  }

  .no-results {
    svg {
      margin-bottom: 1rem;
      opacity: 0.6;
    }

    p {
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
    }
  }

  .reset-btn {
    background: linear-gradient(45deg, #7e188d, #9920a9);
    border: none;
    color: white;
    padding: 0.6rem 1.2rem;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

    &:hover {
      background: linear-gradient(45deg, #9920a9, #7e188d);
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
    }

    &:active {
      transform: translateY(1px);
    }
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @media (max-width: 768px) {
    .communities-grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
  }

  @media (max-width: 576px) {
    .communities-grid {
      grid-template-columns: 1fr;
    }

    .communities-container {
      margin: 1rem auto;
    }

    .header h2 {
      font-size: 1.8rem;
    }
  }

  .select-filters-container {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-top: 10px;
  }

  .select-container {
    flex: 1;
    min-width: 250px;
  }

  .type-select-container .custom-select-header {
    border-left: 3px solid #e67e22;
  }

  .friend-badges {
    display: flex;
    gap: 5px;
    margin-top: 3px;
  }

  .friend-badge {
    display: inline-block;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 10px;

    &.developer {
      background: rgba(5, 189, 194, 0.3);
      color: #05bdc2;
    }

    &.gamer {
      background: rgba(126, 24, 141, 0.3);
      color: #9920a9;
    }

    &.editor {
      background: rgba(230, 126, 34, 0.3);
      color: #e67e22;
    }
  }

  .type-selected {
    position: absolute;
    top: 10px;
    right: 10px;
    color: #05bdc2;
    font-size: 16px;
  }

  .selected-types {
    margin-top: 10px;
    font-size: 14px;
    color: #ccc;
    text-align: center;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;

  .loading-content {
    text-align: center;
    background: linear-gradient(
      145deg,
      rgba(26, 26, 46, 0.9),
      rgba(22, 22, 42, 0.9)
    );
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.05);
    max-width: 400px;
    width: 100%;

    h3 {
      color: white;
      font-weight: 500;
      margin: 15px 0 20px;
    }

    .spinner {
      width: 60px;
      height: 60px;
      border: 3px solid rgba(0, 162, 174, 0.2);
      border-right: 3px solid #7e188d;
      border-bottom: 3px solid #00a2ae;
      border-radius: 50%;
      animation: spin 1.2s linear infinite;
      margin: 0 auto;
    }

    .loading-progress {
      margin-top: 25px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      padding: 15px;
    }

    .progress-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 15px;
      background: rgba(30, 30, 50, 0.5);
      border-radius: 8px;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.05);

      &.completed {
        background: rgba(0, 162, 174, 0.2);
        border-color: rgba(0, 162, 174, 0.3);
      }

      .progress-label {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.8);
      }

      .check-icon {
        color: #4caf50;
        animation: fadeIn 0.5s ease;
      }

      .loading-icon {
        color: rgba(255, 255, 255, 0.5);
        animation: pulse 1.5s infinite ease-in-out;
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
        opacity: 0.5;
        transform: scale(1);
      }
      50% {
        opacity: 1;
        transform: scale(1.1);
      }
      100% {
        opacity: 0.5;
        transform: scale(1);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  }
`;

export default CommunitiesPage;
