import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import * as Icon from "react-bootstrap-icons";
import { jwtDecode } from "jwt-decode";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import {
  getCommunityById,
  removeCommunity,
  updateCommunity,
} from "../redux/actions/community";
import {
  addCommunityApplicationUser,
  removeCommunityApplicationUser,
} from "../redux/actions/communityApplicationUser";
import { createPost, getPosts } from "../redux/actions/post";
import { getUserById, getAllUsers } from "../redux/actions/user";

import VideogamePost from "./VideogamePost";

const CommunityDetailsPage = () => {
  const { communityId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const community = useSelector((state) => state.community.community);
  const currentUser = useSelector((state) => state.profile.user);
  const allPosts = useSelector((state) => state.post.posts);
  const allUsers = useSelector((state) => state.user.allUsers);

  const [currentUserId, setCurrentUserId] = useState(null);

  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("newest");
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [availableFriends, setAvailableFriends] = useState([]);

  const [isLoadingCommunity, setIsLoadingCommunity] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingCurrentUser, setIsLoadingCurrentUser] = useState(true);
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(true);

  const isLoading =
    isLoadingCommunity ||
    isLoadingPosts ||
    isLoadingCurrentUser ||
    isLoadingAllUsers;

  const [loadingProgress, setLoadingProgress] = useState({
    community: false,
    posts: false,
    currentUser: false,
    allUsers: false,
  });

  const [formData, setFormData] = useState({
    type: "",
    name: "",
    extraName: "",
    description: "",
    extraDescription: "",
    link: "",
    isPrivate: "",
    isHidden: "",
    maxMembers: "",
    pictureFile: null,
    coverFile: null,
  });

  const [postFormData, setPostFormData] = useState({
    text: "",
    pictureFile: null,
    isLookingForGamers: false,
    isLookingForDevelopers: false,
  });
  const [picturePreview, setPicturePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [postPicturePreview, setPostPicturePreview] = useState(null);

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const postFileInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsLoadingCurrentUser(true);
    try {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        const decodedToken = jwtDecode(token);
        setCurrentUserId(decodedToken.id);

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
    if (communityId) {
      setIsLoadingCommunity(true);
      dispatch(getCommunityById(communityId))
        .then(() => {
          setIsLoadingCommunity(false);
          setLoadingProgress((prev) => ({ ...prev, community: true }));
        })
        .catch((error) => {
          console.error("Errore nel caricare la community:", error);
          setIsLoadingCommunity(false);
        });
    }
  }, [communityId, dispatch]);

  useEffect(() => {
    setIsLoadingPosts(true);
    dispatch(getPosts())
      .then(() => {
        setIsLoadingPosts(false);
        setLoadingProgress((prev) => ({ ...prev, posts: true }));
      })
      .catch((error) => {
        console.error("Errore nel caricare i post:", error);
        setIsLoadingPosts(false);
      });
  }, [dispatch]);

  useEffect(() => {
    if (community && community.communityId) {
      setFormData({
        type: community.type || "",
        name: community.name || "",
        extraName: community.extraName || "",
        description: community.description || "",
        extraDescription: community.extraDescription || "",
        link: community.link || "",
        isPrivate: community.isPrivate ? "true" : "false",
        isHidden: community.isHidden ? "true" : "false",
        maxMembers: community.maxMembers?.toString() || "10",
        pictureFile: null,
        coverFile: null,
      });
    }
  }, [community]);

  useEffect(() => {
    if (currentUser && allUsers && allUsers.length > 0 && community) {
      console.log("Debug amicizie:");
      console.log("currentUser:", currentUser);
      console.log("allUsers:", allUsers.length);
      console.log(
        "amicizie in uscita:",
        currentUser.friendList?.applicationUserFriends?.length || 0
      );
      console.log(
        "amicizie in entrata:",
        currentUser.applicationUserFriends?.length || 0
      );

      let userFriends = [];

      if (currentUser.friendList?.applicationUserFriends?.length > 0) {
        console.log("Elaborazione amicizie in uscita");
        const outgoingFriends = currentUser.friendList.applicationUserFriends
          .filter(
            (friendship) =>
              friendship.accepted === true && !friendship.isDeleted
          )
          .map((friendship) => {
            const friend = allUsers.find(
              (user) =>
                user.applicationUserId ===
                friendship.applicationUser?.applicationUserId
            );
            if (!friend)
              console.log(
                "Amico non trovato:",
                friendship.applicationUser?.applicationUserId
              );
            return friend;
          })
          .filter((friend) => friend !== undefined);

        console.log("Amici in uscita trovati:", outgoingFriends.length);
        userFriends = [...userFriends, ...outgoingFriends];
      }

      if (currentUser.applicationUserFriends?.length > 0) {
        console.log("Elaborazione amicizie in entrata");
        const incomingFriends = currentUser.applicationUserFriends
          .filter(
            (friendship) =>
              friendship.accepted === true && !friendship.isDeleted
          )
          .map((friendship) => {
            const friend = allUsers.find(
              (user) =>
                user.applicationUserId ===
                friendship.friendList?.applicationUser?.applicationUserId
            );
            if (!friend)
              console.log(
                "Amico non trovato:",
                friendship.friendList?.applicationUser?.applicationUserId
              );
            return friend;
          })
          .filter((friend) => friend !== undefined);

        console.log("Amici in entrata trovati:", incomingFriends.length);
        userFriends = [...userFriends, ...incomingFriends];
      }

      userFriends = Array.from(
        new Set(userFriends.map((a) => a.applicationUserId))
      ).map((id) => userFriends.find((a) => a.applicationUserId === id));

      console.log("Totale amici unici:", userFriends.length);
      console.log("Amici trovati:", userFriends);

      const existingMemberIds =
        community.communityApplicationUsers?.map(
          (cau) => cau.applicationUser?.applicationUserId
        ) || [];

      console.log("Membri esistenti:", existingMemberIds);

      const filteredFriends = userFriends.filter(
        (friend) => !existingMemberIds.includes(friend.applicationUserId)
      );

      console.log("Amici disponibili dopo filtro:", filteredFriends.length);
      setAvailableFriends(filteredFriends || []);
    }
  }, [currentUser, allUsers, community]);

  useEffect(() => {
    if (allPosts && community) {
      let communityPosts = allPosts.filter(
        (post) => post.community?.communityId === community.communityId
      );

      if (community.isPrivate && !isMember() && !isOwner()) {
        communityPosts = [];
      }

      const sortedPosts = applyPostFilter(communityPosts, activeFilter);
      setFilteredPosts(sortedPosts);
    }
  }, [allPosts, community, activeFilter, currentUserId]);

  const isOwner = () => {
    if (!community || !currentUserId) return false;
    return community.applicationUser?.applicationUserId === currentUserId;
  };

  const isMember = () => {
    if (!community || !currentUserId) return false;
    return community.communityApplicationUsers?.some(
      (cau) => cau.applicationUser?.applicationUserId === currentUserId
    );
  };

  const toggleFilter = (filter) => {
    setActiveFilter(filter === activeFilter ? "newest" : filter);
  };

  const applyPostFilter = useCallback((posts, filter) => {
    if (!posts || posts.length === 0) return [];

    let filteredPosts = [...posts];

    switch (filter) {
      case "newest":
        return filteredPosts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "oldest":
        return filteredPosts.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case "mostComments":
        return filteredPosts.sort(
          (a, b) => (b.comments?.length || 0) - (a.comments?.length || 0)
        );
      case "mostLikes":
        return filteredPosts.sort(
          (a, b) => (b.postLikes?.length || 0) - (a.postLikes?.length || 0)
        );
      case "lookingForGamers":
        return filteredPosts
          .filter((post) => post.isLookingForGamers)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "lookingForDevelopers":
        return filteredPosts
          .filter((post) => post.isLookingForDevelopers)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return filteredPosts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "maxMembers") {
      if (value === "" || (parseInt(value) >= 1 && parseInt(value) <= 100)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTypeChange = (e) => {
    setFormData((prev) => ({ ...prev, type: e.target.value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked ? "true" : "false" }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));

      const reader = new FileReader();
      reader.onload = (e) => {
        if (name === "pictureFile") setPicturePreview(e.target.result);
        else if (name === "coverFile") setCoverPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateCommunity = (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("Type", formData.type);
    form.append("Name", formData.name);
    form.append("ExtraName", formData.extraName || "");
    form.append("Description", formData.description);
    form.append("ExtraDescription", formData.extraDescription || "");
    form.append("Link", formData.link || "");
    form.append("IsPrivate", formData.isPrivate);
    form.append("IsHidden", formData.isHidden);
    form.append("MaxMembers", formData.maxMembers);
    form.append("UpdatedAt", new Date().toISOString());

    if (formData.pictureFile) {
      form.append("PictureFile", formData.pictureFile);
    }

    if (formData.coverFile) {
      form.append("CoverFile", formData.coverFile);
    }

    dispatch(updateCommunity(communityId, form))
      .then(() => {
        setShowEditForm(false);
        setPicturePreview(null);
        setCoverPreview(null);
      })
      .catch((error) => {
        console.error("Errore durante l'aggiornamento della community:", error);
      });
  };

  const handleDeleteCommunity = () => {
    if (showDeleteConfirm) {
      dispatch(removeCommunity(communityId))
        .then(() => {
          navigate("/communities");
        })
        .catch((error) => {
          console.error(
            "Errore durante l'eliminazione della community:",
            error
          );
        });
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleAddMember = (userId) => {
    if (!userId) return;

    dispatch(addCommunityApplicationUser(userId, communityId))
      .then(() => {
        dispatch(getCommunityById(communityId));
      })
      .catch((error) => {
        console.error("Errore durante l'aggiunta del membro:", error);
      });
  };

  const handleRemoveMember = (communityApplicationUserId) => {
    if (!communityApplicationUserId) return;

    dispatch(removeCommunityApplicationUser(communityApplicationUserId))
      .then(() => {
        dispatch(getCommunityById(communityId));
      })
      .catch((error) => {
        console.error("Errore durante la rimozione del membro:", error);
      });
  };

  const handlePostInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPostFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePostFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostFormData((prev) => ({ ...prev, pictureFile: file }));

      const reader = new FileReader();
      reader.onload = (e) => setPostPicturePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPost = (e) => {
    e.preventDefault();

    if (!postFormData.text.trim() && !postFormData.pictureFile) {
      alert("Inserisci del testo o un'immagine per pubblicare il post");
      return;
    }

    const formData = new FormData();
    formData.append("Text", postFormData.text);
    formData.append("IsLookingForGamers", postFormData.isLookingForGamers);
    formData.append(
      "IsLookingForDevelopers",
      postFormData.isLookingForDevelopers
    );
    formData.append("IsInCommunityFeed", true);
    formData.append("CommunityId", communityId);
    formData.append("ApplicationUserId", currentUserId);

    if (postFormData.pictureFile) {
      formData.append("PictureFile", postFormData.pictureFile);
    }

    dispatch(createPost(formData))
      .then(() => {
        setPostFormData({
          text: "",
          pictureFile: null,
          isLookingForGamers: false,
          isLookingForDevelopers: false,
        });
        setPostPicturePreview(null);
        setShowCreatePost(false);
        dispatch(getPosts());
      })
      .catch((error) => {
        console.error("Errore durante la pubblicazione del post:", error);
      });
  };

  const formatCreationDate = (dateString) => {
    if (!dateString) return "Data non disponibile";
    return format(new Date(dateString), "d MMMM yyyy", { locale: it });
  };

  const handleJoinCommunity = () => {
    dispatch(addCommunityApplicationUser(currentUserId, communityId)).then(
      () => {
        dispatch(getCommunityById(communityId));
      }
    );
  };

  const handleLeaveCommunity = () => {
    const userMembership = community.communityApplicationUsers?.find(
      (cau) => cau.applicationUser?.applicationUserId === currentUserId
    );

    if (userMembership) {
      dispatch(
        removeCommunityApplicationUser(
          userMembership.communityApplicationUserId
        )
      ).then(() => {
        dispatch(getCommunityById(communityId));
      });
    }
  };

  const getCommunityType = () => {
    if (!community.type) return "";

    if (
      community.type.includes("Gaming") &&
      community.type.includes("Development")
    ) {
      return "Gaming / Development";
    } else if (community.type.includes("Gaming")) {
      return "Gaming";
    } else if (community.type.includes("Development")) {
      return "Development";
    }

    return community.type;
  };

  const hasType = (type) => {
    return community.type?.includes(type);
  };

  const removeImagePreview = (type) => {
    if (type === "picture") {
      setPicturePreview(null);
      setFormData((prev) => ({ ...prev, pictureFile: null }));
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else if (type === "cover") {
      setCoverPreview(null);
      setFormData((prev) => ({ ...prev, coverFile: null }));
      if (coverInputRef.current) coverInputRef.current.value = "";
    } else if (type === "post") {
      setPostPicturePreview(null);
      setPostFormData((prev) => ({ ...prev, pictureFile: null }));
      if (postFileInputRef.current) postFileInputRef.current.value = "";
    }
  };

  const triggerFileInput = (ref) => {
    ref.current?.click();
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <div className="loading-content">
          <div className="spinner"></div>
          <h3>Caricamento della community in corso...</h3>
          <div className="loading-progress">
            <div
              className={`progress-item ${
                loadingProgress.community ? "completed" : ""
              }`}
            >
              <span className="progress-label">Dati della community</span>
              {loadingProgress.community ? (
                <Icon.CheckCircleFill className="check-icon" />
              ) : (
                <Icon.HourglassSplit className="loading-icon" />
              )}
            </div>
            <div
              className={`progress-item ${
                loadingProgress.posts ? "completed" : ""
              }`}
            >
              <span className="progress-label">Post</span>
              {loadingProgress.posts ? (
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

  if (!community || !community.communityId) {
    return (
      <ErrorContainer>
        <Icon.ExclamationTriangleFill size={50} />
        <h3>Community non trovata</h3>
        <p>La community richiesta non esiste o è stata eliminata.</p>
        <Link to="/communities">
          <BackButton>
            <Icon.ArrowLeft size={20} />
            Torna alle Community
          </BackButton>
        </Link>
      </ErrorContainer>
    );
  }

  const canViewPosts = !community.isPrivate || isMember() || isOwner();

  return (
    <PageContainer>
      <ContentWrapper>
        <HeaderSection
          style={{
            backgroundImage: community.cover
              ? `url(https://localhost:7105${community.cover})`
              : "linear-gradient(135deg, #7e188d, #00a2ae)",
          }}
        >
          <HeaderOverlay />

          <motion.div
            className="nav-buttons"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StyledLink to="/communities">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon.ArrowLeft size={18} />
                <span>Torna alle Community</span>
              </motion.button>
            </StyledLink>

            {isOwner() && (
              <>
                <motion.button
                  className="edit-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEditForm(!showEditForm)}
                >
                  <Icon.PencilFill size={18} />
                  <span>Modifica Community</span>
                </motion.button>

                <motion.button
                  className={`delete-btn ${showDeleteConfirm ? "confirm" : ""}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteCommunity}
                >
                  {showDeleteConfirm ? (
                    <>
                      <Icon.ExclamationTriangleFill size={18} />
                      <span>Conferma Eliminazione</span>
                    </>
                  ) : (
                    <>
                      <Icon.Trash size={18} />
                      <span>Elimina Community</span>
                    </>
                  )}
                </motion.button>
              </>
            )}
          </motion.div>

          <AnimatePresence>
            {isHeaderVisible && (
              <motion.div
                className="header-content"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="community-image">
                  {community.picture ? (
                    <img
                      src={`https://localhost:7105${community.picture}`}
                      alt={community.name}
                    />
                  ) : (
                    <div className="image-placeholder">
                      {community.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="title-section">
                  <h1>{community.name}</h1>
                  {community.extraName && <h2>{community.extraName}</h2>}
                </div>

                <div className="header-badges">
                  {hasType("Gaming") && (
                    <span className="type-badge gaming">
                      <Icon.Controller size={16} />
                      Gaming
                    </span>
                  )}

                  {hasType("Development") && (
                    <span className="type-badge development">
                      <Icon.CodeSquare size={16} />
                      Development
                    </span>
                  )}

                  {community.isPrivate && (
                    <span className="privacy-badge">
                      <Icon.LockFill size={14} />
                      Privata
                    </span>
                  )}

                  <span className="members-badge">
                    <Icon.People size={16} />
                    {community.communityApplicationUsers?.length || 0} /{" "}
                    {community.maxMembers} membri
                  </span>

                  <span className="date-badge">
                    <Icon.Calendar3 size={14} />
                    Creata il {formatCreationDate(community.createdAt)}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </HeaderSection>

        <MainCard>
          <ContentSection>
            <LeftColumn>
              <InfoCard
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CardHeader>
                  <div className="header-icon">
                    <Icon.InfoCircle size={20} />
                  </div>
                  <h3>Informazioni</h3>
                </CardHeader>

                <div className="description-content">
                  <p>{community.description}</p>
                  {community.extraDescription && (
                    <p className="extra-description">
                      {community.extraDescription}
                    </p>
                  )}
                </div>

                {community.link && (
                  <div className="link-section">
                    <InfoItem>
                      <Icon.Link45deg className="icon" />
                      <div className="info-content">
                        <span className="label">Link esterno</span>
                        <a
                          href={
                            community.link.startsWith("http")
                              ? community.link
                              : `https://${community.link}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="website-link"
                        >
                          {community.link}
                          <Icon.BoxArrowUpRight size={12} />
                        </a>
                      </div>
                    </InfoItem>
                  </div>
                )}

                <div className="community-actions">
                  {isOwner() ? (
                    <motion.button
                      className="manage-members-btn"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowManageMembers(!showManageMembers)}
                    >
                      <Icon.PeopleFill size={18} />
                      Gestisci Membri
                    </motion.button>
                  ) : isMember() ? (
                    <motion.button
                      className="leave-btn"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleLeaveCommunity}
                    >
                      <Icon.DoorOpenFill size={18} />
                      Esci dalla Community
                    </motion.button>
                  ) : (
                    <motion.button
                      className="join-btn"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleJoinCommunity}
                      disabled={
                        (community.communityApplicationUsers?.length || 0) >=
                        community.maxMembers
                      }
                    >
                      {(community.communityApplicationUsers?.length || 0) >=
                      community.maxMembers ? (
                        <>
                          <Icon.ExclamationCircleFill size={18} />
                          Community piena
                        </>
                      ) : (
                        <>
                          <Icon.PersonPlusFill size={18} />
                          Unisciti alla Community
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </InfoCard>

              <CreatorCard
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <CardHeader>
                  <div className="header-icon">
                    <Icon.PersonBadge size={20} />
                  </div>
                  <h3>Creatore</h3>
                </CardHeader>

                <Link
                  to={`/other-user/${community.applicationUser?.applicationUserId}`}
                  className="creator-profile"
                >
                  <div className="creator-avatar">
                    <img
                      src={`https://localhost:7105${community.applicationUser?.picture}`}
                      alt={community.applicationUser?.displayName || "Creatore"}
                    />
                    <div className="avatar-glow"></div>
                  </div>

                  <div className="creator-info">
                    <h4>
                      {community.applicationUser?.displayName ||
                        `${community.applicationUser?.firstName} ${community.applicationUser?.lastName}` ||
                        "Utente"}
                    </h4>

                    <div className="creator-badges">
                      {community.applicationUser?.isGamer && (
                        <span className="creator-badge gamer">
                          <Icon.Controller className="badge-icon" />
                          Gamer
                        </span>
                      )}
                      {community.applicationUser?.isDeveloper && (
                        <span className="creator-badge developer">
                          <Icon.Code className="badge-icon" />
                          Developer
                        </span>
                      )}
                    </div>

                    <div className="location-info">
                      {(community.applicationUser?.city ||
                        community.applicationUser?.country) && (
                        <span>
                          <Icon.GeoAlt size={12} />
                          {community.applicationUser?.city}
                          {community.applicationUser?.city &&
                          community.applicationUser?.country
                            ? ", "
                            : ""}
                          {community.applicationUser?.country}
                        </span>
                      )}
                    </div>
                  </div>

                  <Icon.ChevronRight className="navigate-icon" />
                </Link>
              </CreatorCard>

              <MembersCard
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <CardHeader>
                  <div className="header-icon">
                    <Icon.People size={20} />
                  </div>
                  <h3>Membri</h3>
                  <div className="member-count">
                    {community.communityApplicationUsers?.length || 0} /{" "}
                    {community.maxMembers}
                  </div>
                </CardHeader>

                <div className="members-list">
                  {community.communityApplicationUsers?.map((member) => (
                    <div
                      key={member.communityApplicationUserId}
                      className="member-item"
                    >
                      <Link
                        to={`/other-user/${member.applicationUser?.applicationUserId}`}
                        className="member-avatar"
                      >
                        <img
                          src={`https://localhost:7105${member.applicationUser?.picture}`}
                          alt={member.applicationUser?.displayName || "Membro"}
                        />
                      </Link>

                      <div className="member-info">
                        <Link
                          to={`/other-user/${member.applicationUser?.applicationUserId}`}
                          className="member-name"
                        >
                          {member.applicationUser?.displayName ||
                            `${member.applicationUser?.firstName} ${member.applicationUser?.lastName}` ||
                            "Utente"}
                        </Link>

                        <div className="member-badges">
                          {member.applicationUser?.isGamer && (
                            <span className="member-badge gamer">
                              <Icon.Controller size={10} />
                              <span className="badge-text">Gamer</span>
                            </span>
                          )}
                          {member.applicationUser?.isDeveloper && (
                            <span className="member-badge developer">
                              <Icon.Code size={10} />
                              <span className="badge-text">Developer</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {isOwner() &&
                        member.applicationUser?.applicationUserId !==
                          community.applicationUser?.applicationUserId && (
                          <motion.button
                            className="remove-member-btn"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              handleRemoveMember(
                                member.communityApplicationUserId
                              )
                            }
                          >
                            <Icon.X size={14} />
                          </motion.button>
                        )}
                    </div>
                  ))}

                  {isOwner() &&
                    community.communityApplicationUsers?.length <
                      community.maxMembers && (
                      <motion.button
                        className="add-member-btn"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddMembers(true)}
                      >
                        <Icon.PersonPlusFill size={20} />
                        <span>Aggiungi membri</span>
                      </motion.button>
                    )}
                </div>
              </MembersCard>
            </LeftColumn>

            <RightColumn>
              {canViewPosts && isMember() && (
                <PublishPostCard
                  as={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {showCreatePost ? (
                    <div className="post-form-container">
                      <form onSubmit={handleSubmitPost} className="post-form">
                        <CardHeader>
                          <div className="header-icon">
                            <Icon.PencilSquare size={20} />
                          </div>
                          <h3>Crea nuovo post</h3>
                        </CardHeader>

                        <textarea
                          name="text"
                          placeholder="Cosa vuoi condividere con la community?"
                          value={postFormData.text}
                          onChange={handlePostInputChange}
                          className="post-textarea"
                        />

                        <div className="post-options">
                          <div className="file-upload-container">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePostFileChange}
                              className="file-input"
                              ref={postFileInputRef}
                              hidden
                            />
                            <motion.button
                              type="button"
                              className="upload-btn"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => triggerFileInput(postFileInputRef)}
                            >
                              <Icon.Image size={16} />
                              Aggiungi immagine
                            </motion.button>

                            {postPicturePreview && (
                              <div className="image-preview">
                                <img src={postPicturePreview} alt="Anteprima" />
                                <button
                                  type="button"
                                  className="remove-image"
                                  onClick={() => removeImagePreview("post")}
                                >
                                  <Icon.X size={14} />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="tag-options">
                            <label
                              className={`checkbox-container gamer-checkbox ${
                                !hasType("Gaming") ? "disabled" : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                name="isLookingForGamers"
                                checked={postFormData.isLookingForGamers}
                                onChange={handlePostInputChange}
                                disabled={!hasType("Gaming")}
                              />
                              <span className="custom-checkbox"></span>
                              <span className="checkbox-text">
                                <Icon.Controller size={14} /> Cerco Gamers
                              </span>
                            </label>

                            <label
                              className={`checkbox-container dev-checkbox ${
                                !hasType("Development") ? "disabled" : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                name="isLookingForDevelopers"
                                checked={postFormData.isLookingForDevelopers}
                                onChange={handlePostInputChange}
                                disabled={!hasType("Development")}
                              />
                              <span className="custom-checkbox"></span>
                              <span className="checkbox-text">
                                <Icon.Code size={14} /> Cerco Developers
                              </span>
                            </label>
                          </div>
                        </div>

                        <div className="form-actions">
                          <motion.button
                            type="submit"
                            className="publish-btn"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            disabled={
                              !postFormData.text && !postFormData.pictureFile
                            }
                          >
                            <Icon.Send size={16} />
                            Pubblica
                          </motion.button>

                          <motion.button
                            type="button"
                            className="cancel-btn"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              setShowCreatePost(false);
                              setPostFormData({
                                text: "",
                                pictureFile: null,
                                isLookingForGamers: false,
                                isLookingForDevelopers: false,
                              });
                              setPostPicturePreview(null);
                            }}
                          >
                            <Icon.X size={16} />
                            Annulla
                          </motion.button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div
                      className="create-post-prompt"
                      onClick={() => setShowCreatePost(true)}
                    >
                      <Icon.PencilSquare size={24} />
                      <span>Crea un nuovo post nella community</span>
                    </div>
                  )}
                </PublishPostCard>
              )}

              <PostsSection
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <CardHeader className="with-filters">
                  <div className="header-left">
                    <div className="header-icon">
                      <Icon.ChatSquareText size={20} />
                    </div>
                    <h3>Post della community</h3>
                  </div>

                  <span className="posts-count">
                    {filteredPosts?.length || 0} post
                  </span>
                </CardHeader>

                {!canViewPosts ? (
                  <PrivateContent>
                    <Icon.LockFill size={40} />
                    <h3>Contenuto privato</h3>
                    <p>
                      I post di questa community sono visibili solo ai membri.
                    </p>
                    {!isMember() && !isOwner() && (
                      <motion.button
                        className="join-now-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleJoinCommunity}
                        disabled={
                          (community.communityApplicationUsers?.length || 0) >=
                          community.maxMembers
                        }
                      >
                        <Icon.PersonPlusFill size={18} />
                        Unisciti ora
                      </motion.button>
                    )}
                  </PrivateContent>
                ) : (
                  <>
                    <FiltersContainer>
                      <div className="filters-header">
                        <Icon.Filter className="filter-icon" />
                        <h5>Filtra Post</h5>
                      </div>

                      <div className="filter-badges">
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
                          <span>Più Vecchi</span>
                        </motion.div>

                        <motion.div
                          className={`filter-badge comments-badge ${
                            activeFilter === "mostComments" ? "active" : ""
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleFilter("mostComments")}
                        >
                          <Icon.ChatLeftText size={14} />
                          <span>Più Commenti</span>
                        </motion.div>

                        <motion.div
                          className={`filter-badge likes-badge ${
                            activeFilter === "mostLikes" ? "active" : ""
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleFilter("mostLikes")}
                        >
                          <Icon.Heart size={14} />
                          <span>Più Like</span>
                        </motion.div>

                        <motion.div
                          className={`filter-badge gamers-badge ${
                            activeFilter === "lookingForGamers" ? "active" : ""
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleFilter("lookingForGamers")}
                        >
                          <Icon.Controller size={14} />
                          <span>Cerca Gamers</span>
                        </motion.div>

                        <motion.div
                          className={`filter-badge devs-badge ${
                            activeFilter === "lookingForDevelopers"
                              ? "active"
                              : ""
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleFilter("lookingForDevelopers")}
                        >
                          <Icon.Code size={14} />
                          <span>Cerca Developers</span>
                        </motion.div>
                      </div>
                    </FiltersContainer>

                    <div className="posts-list">
                      {filteredPosts && filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                          <div key={post.postId} className="my-3">
                            <VideogamePost
                              post={post}
                              currentUserId={currentUserId}
                            />
                          </div>
                        ))
                      ) : (
                        <NoPosts>
                          <Icon.X size={40} />
                          <h4>Nessun post trovato</h4>
                          <p>
                            {isMember()
                              ? "Non ci sono ancora post in questa community. Sii il primo a pubblicare!"
                              : "Non ci sono post che corrispondono ai filtri selezionati."}
                          </p>
                          {isMember() && (
                            <motion.button
                              className="create-first-post-btn"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowCreatePost(true)}
                            >
                              <Icon.PencilSquare size={18} />
                              Crea il primo post
                            </motion.button>
                          )}
                        </NoPosts>
                      )}
                    </div>
                  </>
                )}
              </PostsSection>
            </RightColumn>
          </ContentSection>
        </MainCard>
      </ContentWrapper>

      <AnimatePresence>
        {showEditForm && (
          <ModalOverlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditForm(false)}
          >
            <ModalContent
              as={motion.div}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <h3>Modifica Community</h3>
                <motion.button
                  className="close-btn"
                  onClick={() => setShowEditForm(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon.X size={24} />
                </motion.button>
              </ModalHeader>

              <form onSubmit={handleUpdateCommunity}>
                <ModalBody>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tipo di Community</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleTypeChange}
                        className="form-select"
                        required
                      >
                        <option value="">Seleziona un tipo</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Development">Development</option>
                        <option value="Gaming / Development">
                          Gaming / Development
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Nome Community</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Sottotitolo (opzionale)</label>
                      <input
                        type="text"
                        name="extraName"
                        value={formData.extraName}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Descrizione</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-textarea"
                      required
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Descrizione Estesa (opzionale)</label>
                    <textarea
                      name="extraDescription"
                      value={formData.extraDescription}
                      onChange={handleInputChange}
                      className="form-textarea"
                    ></textarea>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Link Esterno (opzionale)</label>
                      <input
                        type="text"
                        name="link"
                        value={formData.link}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Numero Massimo Membri</label>
                      <input
                        type="number"
                        name="maxMembers"
                        min="1"
                        max="100"
                        value={formData.maxMembers}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row images-row">
                    <div className="form-group">
                      <label>Foto Profilo (opzionale)</label>
                      <input
                        type="file"
                        accept="image/*"
                        name="pictureFile"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        hidden
                      />
                      <motion.button
                        type="button"
                        className="file-upload-btn"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => triggerFileInput(fileInputRef)}
                      >
                        <Icon.Upload size={16} />
                        Carica immagine
                      </motion.button>

                      {(picturePreview || community.picture) && (
                        <div className="image-preview">
                          <img
                            src={
                              picturePreview ||
                              `https://localhost:7105${community.picture}`
                            }
                            alt="Anteprima"
                          />
                          {picturePreview && (
                            <button
                              type="button"
                              className="remove-image"
                              onClick={() => removeImagePreview("picture")}
                            >
                              <Icon.X size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Immagine di Copertina (opzionale)</label>
                      <input
                        type="file"
                        accept="image/*"
                        name="coverFile"
                        onChange={handleFileChange}
                        ref={coverInputRef}
                        hidden
                      />
                      <motion.button
                        type="button"
                        className="file-upload-btn"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => triggerFileInput(coverInputRef)}
                      >
                        <Icon.Upload size={16} />
                        Carica copertina
                      </motion.button>

                      {(coverPreview || community.cover) && (
                        <div className="image-preview wide">
                          <img
                            src={
                              coverPreview ||
                              `https://localhost:7105${community.cover}`
                            }
                            alt="Anteprima copertina"
                          />
                          {coverPreview && (
                            <button
                              type="button"
                              className="remove-image"
                              onClick={() => removeImagePreview("cover")}
                            >
                              <Icon.X size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-row checkboxes-row">
                    <div className="form-group">
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          id="isPrivate"
                          name="isPrivate"
                          checked={formData.isPrivate === "true"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isPrivate: e.target.checked ? "true" : "false",
                            })
                          }
                          className="form-checkbox"
                        />
                        <label htmlFor="isPrivate">
                          <Icon.LockFill size={14} /> Community Privata
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          id="isHidden"
                          name="isHidden"
                          checked={formData.isHidden === "true"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isHidden: e.target.checked ? "true" : "false",
                            })
                          }
                          className="form-checkbox"
                        />
                        <label htmlFor="isHidden">
                          <Icon.EyeSlashFill size={14} /> Nascondi dalla ricerca
                        </label>
                      </div>
                    </div>
                  </div>
                </ModalBody>

                <ModalFooter>
                  <motion.button
                    type="button"
                    className="cancel-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowEditForm(false)}
                  >
                    <Icon.X size={16} />
                    Annulla
                  </motion.button>

                  <motion.button
                    type="submit"
                    className="save-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon.Check2 size={16} />
                    Salva Modifiche
                  </motion.button>
                </ModalFooter>
              </form>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddMembers && (
          <ModalOverlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddMembers(false)}
          >
            <ModalContent
              className="small-modal"
              as={motion.div}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <h3>Aggiungi Membri</h3>
                <motion.button
                  className="close-btn"
                  onClick={() => setShowAddMembers(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon.X size={24} />
                </motion.button>
              </ModalHeader>

              <ModalBody>
                <div className="friends-list">
                  {availableFriends && availableFriends.length > 0 ? (
                    availableFriends.map((friend) => (
                      <motion.div
                        key={friend.applicationUserId}
                        className="friend-item"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="friend-avatar">
                          <img
                            src={`https://localhost:7105${friend.picture}`}
                            alt={friend.displayName || "Amico"}
                          />
                        </div>

                        <div className="friend-info">
                          <span className="friend-name">
                            {friend.displayName ||
                              `${friend.firstName} ${friend.lastName}` ||
                              "Utente"}
                          </span>

                          <div className="friend-badges">
                            {friend.isGamer && (
                              <span className="friend-badge gamer">
                                <Icon.Controller size={10} /> Gamer
                              </span>
                            )}
                            {friend.isDeveloper && (
                              <span className="friend-badge developer">
                                <Icon.Code size={10} /> Developer
                              </span>
                            )}
                          </div>
                        </div>

                        <motion.button
                          className="add-friend-btn"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            handleAddMember(friend.applicationUserId)
                          }
                        >
                          <Icon.PersonPlusFill size={16} />
                        </motion.button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="no-friends">
                      <Icon.EmojiDizzy size={30} />
                      <p>
                        Non hai amici disponibili da aggiungere alla community.
                      </p>
                    </div>
                  )}
                </div>
              </ModalBody>

              <ModalFooter>
                <motion.button
                  className="close-modal-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddMembers(false)}
                >
                  <Icon.Check2 size={16} />
                  Chiudi
                </motion.button>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showManageMembers && (
          <ModalOverlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowManageMembers(false)}
          >
            <ModalContent
              className="small-modal"
              as={motion.div}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <h3>Gestione Membri</h3>
                <motion.button
                  className="close-btn"
                  onClick={() => setShowManageMembers(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon.X size={24} />
                </motion.button>
              </ModalHeader>

              <ModalBody>
                <div className="members-management-list">
                  {community.communityApplicationUsers?.length > 0 ? (
                    <div>
                      <div className="members-count-info">
                        <div className="members-count">
                          <Icon.People size={16} />
                          <span>
                            {community.communityApplicationUsers?.length || 0} /{" "}
                            {community.maxMembers} membri
                          </span>
                        </div>
                        {community.communityApplicationUsers?.length <
                          community.maxMembers && (
                          <motion.button
                            className="add-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setShowManageMembers(false);
                              setShowAddMembers(true);
                            }}
                          >
                            <Icon.PersonPlusFill size={16} />
                            Aggiungi membri
                          </motion.button>
                        )}
                      </div>

                      {community.communityApplicationUsers?.map((member) => (
                        <motion.div
                          key={member.communityApplicationUserId}
                          className="member-management-item"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="member-avatar">
                            <img
                              src={`https://localhost:7105${member.applicationUser?.picture}`}
                              alt={
                                member.applicationUser?.displayName || "Membro"
                              }
                            />
                          </div>

                          <div className="member-info">
                            <span className="member-name">
                              {member.applicationUser?.displayName ||
                                `${member.applicationUser?.firstName} ${member.applicationUser?.lastName}` ||
                                "Utente"}
                            </span>

                            <div className="member-badges">
                              {member.applicationUser?.isGamer && (
                                <span className="member-badge gamer">
                                  <Icon.Controller size={10} /> Gamer
                                </span>
                              )}
                              {member.applicationUser?.isDeveloper && (
                                <span className="member-badge developer">
                                  <Icon.Code size={10} /> Developer
                                </span>
                              )}
                            </div>
                          </div>

                          {member.applicationUser?.applicationUserId !==
                          community.applicationUser?.applicationUserId ? (
                            <motion.button
                              className="remove-member-btn"
                              whileHover={{
                                scale: 1.1,
                                backgroundColor: "rgba(255, 59, 92, 0.8)",
                              }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                handleRemoveMember(
                                  member.communityApplicationUserId
                                )
                              }
                            >
                              <Icon.PersonDashFill size={16} />
                              <span>Rimuovi</span>
                            </motion.button>
                          ) : (
                            <div className="owner-badge">
                              <Icon.StarFill size={14} />
                              <span>Creatore</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-members">
                      <Icon.EmojiDizzy size={30} />
                      <p>Non ci sono membri in questa community.</p>
                    </div>
                  )}
                </div>
              </ModalBody>

              <ModalFooter>
                <motion.button
                  className="close-modal-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowManageMembers(false)}
                >
                  <Icon.Check2 size={16} />
                  Chiudi
                </motion.button>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      <GlowEffect />
    </PageContainer>
  );
};

const PageContainer = styled.div`
  margin-top: 50px;
  position: relative;
  width: 100%;
  overflow-x: hidden;
  min-height: 100vh;
  padding-bottom: 60px;

  &:before {
    content: "";
    position: fixed;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(126, 24, 141, 0.1) 0%,
      rgba(0, 162, 174, 0.05) 30%,
      transparent 70%
    );
    transform: rotate(-45deg);
    z-index: -2;
    pointer-events: none;
  }
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 576px) {
    padding: 0 15px;
  }
`;

const MainCard = styled.div`
  position: relative;
  width: 100%;
  margin: -50px auto 0;
  background: linear-gradient(
    145deg,
    rgba(26, 26, 46, 0.9),
    rgba(22, 22, 42, 0.9)
  );
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  color: #e0e0e0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(126, 24, 141, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  z-index: 10;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(126, 24, 141, 0.1) 0%,
      rgba(0, 162, 174, 0.05) 30%,
      transparent 70%
    );
    transform: rotate(-45deg);
    z-index: 0;
    pointer-events: none;
  }

  @media (max-width: 576px) {
    padding: 1.5rem;
  }
`;

const GlowEffect = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(126, 24, 141, 0.1) 0%,
    rgba(0, 162, 174, 0.05) 30%,
    transparent 70%
  );
  z-index: -1;
`;

const HeaderSection = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  border-radius: 20px 20px 0 0;
  background-size: cover;
  background-position: center;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 30px 30px;

  .nav-buttons {
    position: absolute;
    top: 30px;
    left: 30px;
    display: flex;
    gap: 15px;
    z-index: 10;

    button {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(18, 18, 32, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      padding: 8px 16px;
      border-radius: 30px;
      font-size: 0.9rem;
      cursor: pointer;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(30, 30, 50, 0.8);
      }

      &.edit-btn {
        background: rgba(0, 162, 174, 0.3);

        &:hover {
          background: rgba(0, 162, 174, 0.5);
        }
      }

      &.delete-btn {
        background: rgba(220, 53, 69, 0.3);

        &:hover {
          background: rgba(220, 53, 69, 0.5);
        }

        &.confirm {
          background: rgba(220, 53, 69, 0.7);
        }
      }
    }
  }

  .header-content {
    position: relative;
    width: 100%;
    max-width: 1100px;
    z-index: 5;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;

    .community-image {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
      margin-bottom: 20px;

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
        background: linear-gradient(135deg, #7e188d, #00a2ae);
        color: white;
        font-size: 3rem;
        font-weight: bold;
      }
    }

    .title-section {
      margin-bottom: 16px;

      h1 {
        font-size: 3.2rem;
        color: white;
        margin: 0;
        font-weight: 700;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        line-height: 1.1;
      }

      h2 {
        font-size: 1.5rem;
        color: rgba(255, 255, 255, 0.8);
        margin: 8px 0 0;
        font-weight: 400;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        font-style: italic;
      }
    }

    .header-badges {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;

      span {
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .type-badge {
        &.gaming {
          background: linear-gradient(
            45deg,
            rgba(126, 24, 141, 0.8),
            rgba(153, 32, 169, 0.8)
          );
          color: white;
        }

        &.development {
          background: linear-gradient(
            45deg,
            rgba(0, 162, 174, 0.8),
            rgba(0, 187, 208, 0.8)
          );
          color: white;
        }
      }

      .privacy-badge {
        background: rgba(244, 67, 54, 0.6);
        color: white;
      }

      .members-badge,
      .date-badge {
        background: rgba(0, 0, 0, 0.4);
        color: white;
      }
    }
  }

  @media (max-width: 768px) {
    height: 350px;
    padding: 0 20px 20px;

    .nav-buttons {
      top: 20px;
      left: 20px;

      button {
        padding: 6px 12px;
        font-size: 0.8rem;

        span {
          display: none;
        }
      }
    }

    .header-content {
      .community-image {
        width: 90px;
        height: 90px;
        margin-bottom: 15px;
      }

      .title-section {
        h1 {
          font-size: 2.3rem;
        }

        h2 {
          font-size: 1.1rem;
        }
      }
    }
  }

  @media (max-width: 576px) {
    height: 300px;

    .header-content {
      .community-image {
        width: 70px;
        height: 70px;
        margin-bottom: 10px;
      }

      .title-section {
        h1 {
          font-size: 1.8rem;
        }

        h2 {
          font-size: 1rem;
        }
      }

      .header-badges {
        gap: 8px;

        span {
          padding: 4px 10px;
          font-size: 0.75rem;
        }
      }
    }
  }
`;

const HeaderOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(18, 18, 32, 0.5) 0%,
    rgba(18, 18, 32, 0.8) 70%,
    rgba(18, 18, 32, 0.95) 100%
  );
  z-index: 1;
`;

const ContentSection = styled.div`
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(300px, 2fr);
  gap: 30px;
  position: relative;
  z-index: 10;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;

  &.with-filters {
    justify-content: space-between;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .header-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      rgba(126, 24, 141, 0.2),
      rgba(0, 162, 174, 0.2)
    );
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.9);

    svg {
      filter: drop-shadow(0 0 5px rgba(0, 162, 174, 0.5));
    }
  }

  h3 {
    margin: 0;
    color: white;
    font-size: 1.4rem;
    font-weight: 600;
  }

  .member-count {
    margin-left: auto;
    background: rgba(126, 24, 141, 0.2);
    color: white;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(126, 24, 141, 0.3);
  }
`;

const InfoCard = styled.div`
  background: linear-gradient(
    145deg,
    rgba(26, 26, 46, 0.95),
    rgba(22, 22, 42, 0.95)
  );
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle,
      rgba(126, 24, 141, 0.1) 0%,
      rgba(0, 162, 174, 0.05) 30%,
      transparent 70%
    );
    z-index: 0;
    pointer-events: none;
  }

  .description-content {
    position: relative;
    z-index: 1;

    p {
      color: rgba(255, 255, 255, 0.85);
      font-size: 1rem;
      line-height: 1.7;
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .extra-description {
      color: rgba(255, 255, 255, 0.7);
      font-style: italic;
      padding: 10px;
      border-left: 3px solid rgba(0, 162, 174, 0.5);
      background: rgba(0, 0, 0, 0.2);
      border-radius: 0 8px 8px 0;
    }
  }

  .link-section {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .community-actions {
    display: flex;
    justify-content: center;
    margin-top: 25px;

    button {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 600;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

      &.join-btn {
        background: linear-gradient(45deg, #7e188d, #9920a9);
        color: white;

        &:hover {
          background: linear-gradient(45deg, #9920a9, #b026d5);
          box-shadow: 0 6px 20px rgba(126, 24, 141, 0.4);
        }

        &:disabled {
          background: rgba(126, 24, 141, 0.3);
          color: rgba(255, 255, 255, 0.6);
          cursor: not-allowed;
        }
      }

      &.leave-btn {
        background: rgba(255, 59, 92, 0.3);
        color: rgba(255, 255, 255, 0.9);

        &:hover {
          background: rgba(255, 59, 92, 0.5);
          box-shadow: 0 6px 20px rgba(255, 59, 92, 0.3);
        }
      }

      &.manage-members-btn {
        background: linear-gradient(45deg, #00a2ae, #00bbd0);
        color: white;

        &:hover {
          background: linear-gradient(45deg, #00bbd0, #20d6eb);
          box-shadow: 0 6px 20px rgba(0, 162, 174, 0.4);
        }
      }
    }
  }
`;

const InfoItem = styled.div`
  display: flex;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;

  &:last-child {
    margin-bottom: 0;
  }

  .icon {
    width: 24px;
    height: 24px;
    margin-right: 15px;
    color: rgba(0, 162, 174, 0.9);
  }

  .info-content {
    display: flex;
    flex-direction: column;

    .label {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.85rem;
      margin-bottom: 4px;
    }

    .value {
      color: white;
      font-size: 1rem;
    }

    .website-link {
      color: #00a2ae;
      display: flex;
      align-items: center;
      gap: 5px;
      text-decoration: none;
      font-size: 0.95rem;
      transition: color 0.2s ease;

      &:hover {
        color: #7e188d;
        text-decoration: underline;
      }

      svg {
        transition: transform 0.2s ease;
      }

      &:hover svg {
        transform: translate(2px, -2px);
      }
    }
  }
`;

const CreatorCard = styled.div`
  background: linear-gradient(
    145deg,
    rgba(26, 26, 46, 0.95),
    rgba(22, 22, 42, 0.95)
  );
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 60%;
    height: 60%;
    background: radial-gradient(
      circle,
      rgba(0, 162, 174, 0.1) 0%,
      transparent 70%
    );
    border-radius: 50%;
    pointer-events: none;
  }

  .creator-profile {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: inherit;
    padding: 15px;
    border-radius: 12px;
    transition: all 0.3s ease;
    background: rgba(20, 20, 30, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.05);
    position: relative;
    overflow: hidden;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      background: rgba(30, 30, 50, 0.5);

      .avatar-glow {
        opacity: 0.8;
      }

      .navigate-icon {
        transform: translateX(5px);
        opacity: 1;
      }
    }

    .creator-avatar {
      position: relative;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 15px;
      border: 2px solid rgba(0, 162, 174, 0.6);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-glow {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-shadow: 0 0 15px rgba(126, 24, 141, 0.6),
          inset 0 0 10px rgba(0, 162, 174, 0.8);
        opacity: 0.4;
        transition: opacity 0.3s ease;
        border-radius: 50%;
      }
    }

    .creator-info {
      flex: 1;

      h4 {
        margin: 0 0 8px;
        font-size: 1.1rem;
        color: white;
      }

      .creator-badges {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;

        .creator-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          padding: 3px 8px;
          border-radius: 10px;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;

          &.gamer {
            background: linear-gradient(45deg, #7e188d, #9920a9);
            color: white;
            box-shadow: 0 2px 6px rgba(126, 24, 141, 0.3);
          }

          &.developer {
            background: linear-gradient(45deg, #00a2ae, #00bbd0);
            color: white;
            box-shadow: 0 2px 6px rgba(0, 162, 174, 0.3);
          }
        }
      }

      .location-info {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);

        span {
          display: flex;
          align-items: center;
          gap: 5px;
        }
      }
    }

    .navigate-icon {
      color: rgba(255, 255, 255, 0.5);
      font-size: 1.2rem;
      opacity: 0.7;
      transition: all 0.3s ease;
    }
  }
`;

const MembersCard = styled.div`
  background: linear-gradient(
    145deg,
    rgba(26, 26, 46, 0.95),
    rgba(22, 22, 42, 0.95)
  );
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  position: relative;

  .members-list {
    max-height: 300px;
    overflow-y: auto;
    padding-right: 10px;
    margin-right: -10px;

    /* Scrollbar styling */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, #7e188d, #00a2ae);
      border-radius: 10px;
    }

    .member-item {
      display: flex;
      align-items: center;
      padding: 10px;
      margin-bottom: 8px;
      background: rgba(30, 30, 50, 0.4);
      border-radius: 10px;
      transition: all 0.2s ease;
      position: relative;

      &:hover {
        background: rgba(40, 40, 60, 0.5);
      }

      .member-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 12px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        transition: all 0.2s ease;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        &:hover {
          border-color: rgba(0, 162, 174, 0.8);
        }
      }

      .member-info {
        flex: 1;

        .member-name {
          font-size: 0.9rem;
          color: white;
          text-decoration: none;
          display: block;
          margin-bottom: 3px;
          transition: color 0.2s ease;

          &:hover {
            color: #00a2ae;
          }
        }

        .member-badges {
          display: flex;
          gap: 5px;

          .member-badge {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.7rem;
            font-weight: 600;

            &.gamer {
              background: linear-gradient(45deg, #7e188d, #9920a9);
              color: white;
            }

            &.developer {
              background: linear-gradient(45deg, #00a2ae, #00bbd0);
              color: white;
            }

            .badge-text {
              margin-left: 2px;
            }
          }
        }
      }

      .remove-member-btn {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 59, 92, 0.2);
        border: none;
        color: rgba(255, 59, 92, 0.7);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255, 59, 92, 0.5);
          color: white;
        }
      }
    }

    .add-member-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 12px;
      background: rgba(0, 162, 174, 0.2);
      border: 1px dashed rgba(0, 162, 174, 0.5);
      border-radius: 10px;
      color: rgba(0, 162, 174, 0.9);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 10px;

      &:hover {
        background: rgba(0, 162, 174, 0.3);
        border-color: rgba(0, 162, 174, 0.8);
      }
    }
  }
`;

const PublishPostCard = styled.div`
  background: linear-gradient(
    145deg,
    rgba(26, 26, 46, 0.95),
    rgba(22, 22, 42, 0.95)
  );
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  position: relative;

  .create-post-prompt {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: rgba(40, 40, 60, 0.5);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px dashed rgba(255, 255, 255, 0.1);

    svg {
      font-size: 1.8rem;
      color: rgba(126, 24, 141, 0.8);
    }

    span {
      color: rgba(255, 255, 255, 0.8);
      font-size: 1rem;
    }

    &:hover {
      background: rgba(126, 24, 141, 0.2);
      border-color: rgba(126, 24, 141, 0.5);
      transform: translateY(-3px);

      svg {
        color: rgba(126, 24, 141, 1);
      }
    }
  }

  .post-form-container {
    width: 100%;

    .post-form {
      width: 100%;

      .post-textarea {
        width: 100%;
        padding: 15px;
        border-radius: 10px;
        background: rgba(30, 30, 30, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 1rem;
        resize: none;
        min-height: 120px;
        margin-bottom: 15px;
        font-family: inherit;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: rgba(0, 162, 174, 0.8);
          box-shadow: 0 0 0 2px rgba(0, 162, 174, 0.2);
        }
      }

      .post-options {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 15px;

        .file-upload-container {
          flex: 1;
          min-width: 200px;

          .upload-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 15px;
            background: rgba(30, 30, 50, 0.6);
            border: 1px solid rgba(0, 162, 174, 0.4);
            border-radius: 8px;
            color: rgba(0, 162, 174, 0.9);
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s ease;

            &:hover {
              background: rgba(0, 162, 174, 0.2);
            }
          }

          .image-preview {
            margin-top: 10px;
            position: relative;
            width: 100%;
            height: 120px;
            border-radius: 8px;
            overflow: hidden;
            border: 2px solid rgba(0, 162, 174, 0.5);

            img {
              width: 100%;
              height: 100%;
              object-fit: contain;
              background: rgba(0, 0, 0, 0.3);
            }

            .remove-image {
              position: absolute;
              top: 8px;
              right: 8px;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: rgba(0, 0, 0, 0.6);
              border: none;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              cursor: pointer;
              transition: all 0.2s ease;

              &:hover {
                background: rgba(255, 59, 92, 0.8);
              }
            }
          }
        }

        .tag-options {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;

          .checkbox-container {
            position: relative;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            padding: 8px 15px;
            border-radius: 12px;
            transition: all 0.2s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(30, 30, 50, 0.4);

            &:hover {
              background: rgba(40, 40, 60, 0.6);
            }

            &.gamer-checkbox {
              &:hover .custom-checkbox {
                border-color: rgba(126, 24, 141, 0.8);
                box-shadow: 0 0 5px rgba(126, 24, 141, 0.3);
              }

              input:checked ~ .custom-checkbox {
                background: linear-gradient(45deg, #7e188d, #9920a9);
                border-color: #7e188d;
              }
            }

            &.dev-checkbox {
              &:hover .custom-checkbox {
                border-color: rgba(0, 162, 174, 0.8);
                box-shadow: 0 0 5px rgba(0, 162, 174, 0.3);
              }

              input:checked ~ .custom-checkbox {
                background: linear-gradient(45deg, #00a2ae, #00bbd0);
                border-color: #00a2ae;
              }
            }

            input {
              position: absolute;
              opacity: 0;
              cursor: pointer;
              height: 0;
              width: 0;
            }

            .custom-checkbox {
              position: relative;
              height: 18px;
              width: 18px;
              border-radius: 4px;
              background-color: rgba(20, 20, 35, 0.6);
              border: 1px solid rgba(255, 255, 255, 0.2);
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              justify-content: center;

              &:after {
                content: "";
                position: absolute;
                display: none;
                width: 6px;
                height: 10px;
                border: solid white;
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
                top: 2px;
              }
            }

            input:checked ~ .custom-checkbox:after {
              display: block;
            }

            input:focus ~ .custom-checkbox {
              box-shadow: 0 0 0 2px rgba(0, 162, 174, 0.3);
            }

            .checkbox-text {
              display: flex;
              align-items: center;
              gap: 6px;
              color: rgba(255, 255, 255, 0.9);
              font-size: 0.9rem;
              font-weight: 500;
            }
          }

          .checkbox-container.disabled {
            opacity: 0.4;
            cursor: not-allowed;
            background: rgba(20, 20, 30, 0.4);
            border-color: rgba(255, 255, 255, 0.05);

            &:hover {
              background: rgba(20, 20, 30, 0.4);
              transform: none;
            }

            .checkbox-text {
              color: rgba(255, 255, 255, 0.5);
            }

            .custom-checkbox {
              background-color: rgba(20, 20, 30, 0.5);
              border-color: rgba(255, 255, 255, 0.1);
            }

            input:disabled ~ .custom-checkbox {
              border-color: rgba(255, 255, 255, 0.1);
            }
          }
        }
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 15px;
        margin-top: 15px;

        button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .publish-btn {
          background: linear-gradient(45deg, #7e188d, #00a2ae);
          color: white;

          &:hover {
            background: linear-gradient(45deg, #9920a9, #00bbd0);
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
          }

          &:disabled {
            background: #555;
            cursor: not-allowed;
            transform: none !important;
            box-shadow: none !important;
          }
        }

        .cancel-btn {
          background: rgba(50, 50, 70, 0.6);
          color: rgba(255, 255, 255, 0.8);

          &:hover {
            background: rgba(70, 70, 90, 0.8);
          }
        }
      }
    }
  }
`;

const PostsSection = styled.div`
  background: linear-gradient(
    145deg,
    rgba(26, 26, 46, 0.95),
    rgba(22, 22, 42, 0.95)
  );
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  position: relative;

  .posts-list {
    margin-top: 20px;
    max-height: 800px;
    overflow-y: auto;
    padding-right: 10px;

    /* Scrollbar styling */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, #7e188d, #00a2ae);
      border-radius: 10px;
    }
  }
`;

const FiltersContainer = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 14px;
  padding: 15px;
  margin-top: 15px;
  margin-bottom: 20px;

  .filters-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    h5 {
      margin: 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.95rem;
      font-weight: 500;
    }

    .filter-icon {
      color: #00a2ae;
    }
  }

  .filter-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    .filter-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
      }

      &.active {
        background: linear-gradient(
          45deg,
          rgba(126, 24, 141, 0.3),
          rgba(0, 162, 174, 0.3)
        );
        border: 1px solid rgba(0, 162, 174, 0.4);
        color: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      &.newest-badge.active {
        background: linear-gradient(45deg, #ff9800, #ff5722);
      }

      &.oldest-badge.active {
        background: linear-gradient(45deg, #2196f3, #3f51b5);
      }

      &.comments-badge.active {
        background: linear-gradient(45deg, #e67e22, #f39c12);
      }

      &.likes-badge.active {
        background: linear-gradient(45deg, #e74c3c, #c0392b);
      }

      &.gamers-badge.active {
        background: linear-gradient(45deg, #7e188d, #9920a9);
      }

      &.devs-badge.active {
        background: linear-gradient(45deg, #00a2ae, #00bbd0);
      }
    }
  }
`;

const PrivateContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 50px 20px;
  color: rgba(255, 255, 255, 0.7);

  svg {
    color: rgba(126, 24, 141, 0.6);
    margin-bottom: 20px;
  }

  h3 {
    color: white;
    margin: 0 0 10px;
  }

  p {
    max-width: 300px;
    margin: 0 0 25px;
  }

  .join-now-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(45deg, #7e188d, #9920a9);
    border: none;
    color: white;
    padding: 10px 20px;
    border-radius: 30px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(126, 24, 141, 0.4);
    }

    &:disabled {
      background: #555;
      cursor: not-allowed;
    }
  }
`;

const NoPosts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 14px;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.7);

  svg {
    color: rgba(255, 255, 255, 0.3);
    margin-bottom: 15px;
  }

  h4 {
    color: white;
    margin: 0 0 10px;
    font-size: 1.2rem;
  }

  p {
    max-width: 300px;
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0 0 20px;
  }

  .create-first-post-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(45deg, #00a2ae, #00bbd0);
    border: none;
    color: white;
    padding: 10px 20px;
    border-radius: 30px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 162, 174, 0.4);
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: linear-gradient(145deg, #1a1a2e, #16162a);
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(126, 24, 141, 0.3);
  border: 1px solid rgba(126, 24, 141, 0.3);
  position: relative;

  &.small-modal {
    max-width: 500px;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #7e188d, #00a2ae);
    border-radius: 4px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h3 {
    margin: 0;
    color: white;
    font-size: 1.4rem;
  }

  .close-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;

    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }
  }
`;

const ModalBody = styled.div`
  padding: 30px;

  .form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 15px;
    }

    &.images-row {
      align-items: flex-start;
    }

    &.checkboxes-row {
      margin-top: 30px;

      .checkbox-group {
        display: flex;
        align-items: center;
        gap: 10px;

        label {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }

  .form-group {
    flex: 1;
    margin-bottom: 20px;

    label {
      display: block;
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 8px;
    }

    .form-select,
    .form-input,
    .form-textarea {
      width: 100%;
      padding: 12px 15px;
      background: rgba(30, 30, 45, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: white;
      font-size: 0.95rem;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: #00a2ae;
        box-shadow: 0 0 0 2px rgba(0, 162, 174, 0.2);
      }
    }

    .form-textarea {
      min-height: 100px;
      resize: vertical;
    }
  }

  .image-preview {
    margin-top: 10px;
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 10px;
    overflow: hidden;
    border: 2px solid rgba(0, 162, 174, 0.5);

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
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 59, 92, 0.8);
      }
    }
  }

  .file-upload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px;
    background: rgba(30, 30, 45, 0.6);
    border: 1px dashed rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(126, 24, 141, 0.1);
      border-color: rgba(126, 24, 141, 0.3);
    }
  }

  .friends-list {
    max-height: 300px;
    overflow-y: auto;
    padding-right: 10px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, #7e188d, #00a2ae);
      border-radius: 10px;
    }

    .friend-item {
      display: flex;
      align-items: center;
      padding: 12px 15px;
      background: rgba(30, 30, 45, 0.6);
      border-radius: 10px;
      margin-bottom: 10px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.2s ease;

      &:hover {
        background: rgba(40, 40, 60, 0.7);
        transform: translateY(-2px);
      }

      .friend-avatar {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 15px;
        border: 2px solid rgba(255, 255, 255, 0.1);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .friend-info {
        flex: 1;

        .friend-name {
          font-size: 1rem;
          color: white;
          margin-bottom: 5px;
          display: block;
        }

        .friend-badges {
          display: flex;
          gap: 6px;

          .friend-badge {
            display: inline-block;
            font-size: 0.7rem;
            padding: 2px 8px;
            border-radius: 10px;

            &.gamer {
              background: rgba(126, 24, 141, 0.2);
              color: #d688e3;
            }

            &.developer {
              background: rgba(0, 162, 174, 0.2);
              color: #6adbe5;
            }
          }
        }
      }

      .add-friend-btn {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        background: rgba(0, 162, 174, 0.2);
        border: 1px solid rgba(0, 162, 174, 0.4);
        color: rgba(0, 162, 174, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(0, 162, 174, 0.4);
          color: white;
        }
      }
    }

    .no-friends {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      padding: 30px 20px;
      color: rgba(255, 255, 255, 0.6);
      text-align: center;

      svg {
        font-size: 2.5rem;
        opacity: 0.6;
      }

      p {
        max-width: 250px;
        line-height: 1.5;
      }
    }
  }

  .members-management-list {
    max-height: 350px;
    overflow-y: auto;
    padding-right: 10px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, #7e188d, #00a2ae);
      border-radius: 10px;
    }

    .members-count-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .members-count {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(0, 0, 0, 0.2);
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.9);
      }

      .add-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(45deg, #00a2ae, #00bbd0);
        border: none;
        padding: 8px 15px;
        border-radius: 20px;
        color: white;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          box-shadow: 0 2px 10px rgba(0, 162, 174, 0.4);
        }
      }
    }

    .member-management-item {
      display: flex;
      align-items: center;
      padding: 12px 15px;
      background: rgba(30, 30, 45, 0.6);
      border-radius: 10px;
      margin-bottom: 10px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.2s ease;

      &:hover {
        background: rgba(40, 40, 60, 0.7);
      }

      .member-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 12px;
        border: 2px solid rgba(255, 255, 255, 0.1);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .member-info {
        flex: 1;

        .member-name {
          font-size: 0.95rem;
          color: white;
          margin-bottom: 4px;
          display: block;
        }

        .member-badges {
          display: flex;
          gap: 5px;

          .member-badge {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.7rem;
            font-weight: 600;

            &.gamer {
              background: rgba(126, 24, 141, 0.2);
              color: #d688e3;
            }

            &.developer {
              background: rgba(0, 162, 174, 0.2);
              color: #6adbe5;
            }
          }
        }
      }

      .remove-member-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 20px;
        background: rgba(255, 59, 92, 0.3);
        border: 1px solid rgba(255, 59, 92, 0.4);
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255, 59, 92, 0.5);
        }
      }

      .owner-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 20px;
        background: rgba(255, 193, 7, 0.2);
        border: 1px solid rgba(255, 193, 7, 0.4);
        color: rgba(255, 193, 7, 0.9);
        font-size: 0.8rem;
      }
    }

    .no-members {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      padding: 30px 20px;
      color: rgba(255, 255, 255, 0.6);
      text-align: center;

      svg {
        font-size: 2.5rem;
        opacity: 0.6;
      }

      p {
        max-width: 250px;
        line-height: 1.5;
      }
    }
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .save-btn {
    background: linear-gradient(45deg, #7e188d, #00a2ae);
    color: white;
    border: none;

    &:hover {
      box-shadow: 0 5px 15px rgba(126, 24, 141, 0.3);
    }
  }

  .cancel-btn {
    background: rgba(40, 40, 60, 0.6);
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover {
      background: rgba(60, 60, 80, 0.6);
    }
  }

  .close-modal-btn {
    background: linear-gradient(45deg, #7e188d, #00a2ae);
    color: white;
    border: none;

    &:hover {
      box-shadow: 0 5px 15px rgba(126, 24, 141, 0.3);
    }
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

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  color: white;
  text-align: center;

  svg {
    color: rgba(244, 67, 54, 0.8);
    margin-bottom: 20px;
  }

  h3 {
    font-size: 1.8rem;
    margin-bottom: 10px;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 25px;
    max-width: 400px;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(
    45deg,
    rgba(126, 24, 141, 0.8),
    rgba(0, 162, 174, 0.8)
  );
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  &:hover {
    box-shadow: 0 6px 15px rgba(126, 24, 141, 0.5);
    transform: translateY(-2px);
    background: linear-gradient(
      45deg,
      rgba(126, 24, 141, 1),
      rgba(0, 162, 174, 1)
    );
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: inline-block;

  &:hover,
  &:focus,
  &:active {
    text-decoration: none;
    color: inherit;
  }
`;

export default CommunityDetailsPage;
