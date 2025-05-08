import React, { useEffect, useState } from "react";
import styled from "styled-components";
import * as Icon from "react-bootstrap-icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("/feed");

  const token = localStorage.getItem("jwtToken");
  let userId = null;
  let userInfo = null;

  try {
    if (token) {
      const decoded = jwtDecode(token);
      userId = decoded.id;
      userInfo = {
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        displayName: decoded.displayName,
        picture: decoded.picture,
        avatar: decoded.avatar,
        isGamer: decoded.isGamer === "true",
        isDeveloper: decoded.isDeveloper === "true",
      };
    }
  } catch (error) {
    console.error("Errore nel decodificare il token:", error);
  }

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  const handleGoToCurrentUserPage = () => {
    if (!userId) return;
    navigate("/other-user/" + userId);
    dispatch({ type: "TOGGLE_NAVBAR", payload: true });
    dispatch({ type: "TOGGLE_AURORA", payload: false });
  };

  const navItems = [
    {
      path: "/feed",
      icon: <Icon.Rss />,
      label: "Feed",
      onClick: () => {
        navigate("/feed");
        dispatch({ type: "TOGGLE_NAVBAR", payload: true });
        dispatch({ type: "TOGGLE_AURORA", payload: false });
      },
    },
    {
      path: "/find-friends",
      icon: <Icon.Search />,
      label: "Cerca",
      onClick: () => navigate("/find-friends"),
    },
    {
      path: "/communities",
      icon: <Icon.People />,
      label: "Community",
      onClick: () => navigate("/communities"),
    },
    {
      path: "/videogames",
      icon: <Icon.Controller />,
      label: "Videogames",
      onClick: () => navigate("/videogames"),
    },
    {
      path: `/other-user/${userId}`,
      icon: <Icon.PersonCircle />,
      label: "Profilo",
      onClick: handleGoToCurrentUserPage,
    },
    {
      path: "/logout",
      icon: <Icon.BoxArrowLeft />,
      label: "Logout",
      onClick: () => {
        localStorage.removeItem("jwtToken");
        navigate("/");
        dispatch({ type: "LOGIN_SUCCESS", payload: false });
        dispatch({ type: "LOGOUT", payload: true });
      },
    },
  ];

  return (
    // <StyledWrapper>
    //   <div className="superDiv d-flex">
    //     <div className="containerDiv d-flex mt-3 gap-5">
    //       <div
    //         onClick={() => {
    //           navigate("/");
    //           dispatch({ type: "TOGGLE_NAVBAR", payload: false });
    //           dispatch({ type: "TOGGLE_AURORA", payload: true });
    //         }}
    //         className="navbarBtn"
    //       >
    //         <img
    //           style={{ width: "100px", height: "100px" }}
    //           src="../../public/assets/img/GameVerseLogo.png"
    //         />
    //       </div>

    //       <div
    //         onClick={() => {
    //           navigate("/feed");
    //           dispatch({ type: "TOGGLE_NAVBAR", payload: true });
    //           dispatch({ type: "TOGGLE_AURORA", payload: false });
    //         }}
    //         className="navbarBtn d-flex flex-column justify-content-center align-items-center gap-1"
    //       >
    //         <Icon.Rss className="text-white" />
    //         <p>Feed</p>
    //       </div>

    //       <div
    //         onClick={() => {
    //           navigate("/find-friends");
    //         }}
    //         className="navbarBtn d-flex flex-column justify-content-center align-items-center gap-1"
    //       >
    //         <Icon.Search className="text-white" />
    //         <p>Cerca</p>
    //       </div>

    //       <div
    //         onClick={() => {
    //           navigate("/communities");
    //         }}
    //         className="navbarBtn d-flex flex-column justify-content-center align-items-center gap-1"
    //       >
    //         <Icon.People className="text-white" />
    //         <p>Community</p>
    //       </div>

    //       <div
    //         onClick={() => {
    //           navigate("/videogames");
    //         }}
    //         className="navbarBtn d-flex flex-column justify-content-center align-items-center gap-1"
    //       >
    //         <Icon.Controller className="text-white" />
    //         <p>Videogames</p>
    //       </div>

    //       <div
    //         onClick={() => {
    //           handleGoToCurrentUserPage();
    //         }}
    //         className="navbarBtn d-flex flex-column justify-content-center align-items-center gap-1"
    //       >
    //         <Icon.PersonCircle className="text-white" />
    //         <p>Profilo</p>
    //       </div>
    //       <div
    //         onClick={() => {
    //           localStorage.removeItem("jwtToken");
    //           navigate("/");
    //           dispatch({ type: "LOGIN_SUCCESS", payload: false });
    //           dispatch({ type: "LOGOUT", payload: true });
    //         }}
    //         className="navbarBtn d-flex flex-column justify-content-center align-items-center gap-1"
    //         style={{
    //           width: "100px",
    //           height: "100px",
    //           cursor: "pointer",
    //         }}
    //       >
    //         <Icon.BoxArrowLeft className="text-white" />
    //         <p>Logout</p>
    //       </div>
    //     </div>
    //   </div>
    // </StyledWrapper>
    <NavContainer>
      <NavContent>
        <LogoContainer
          onClick={() => {
            navigate("/");
            dispatch({ type: "TOGGLE_NAVBAR", payload: false });
            dispatch({ type: "TOGGLE_AURORA", payload: true });
          }}
        >
          <motion.img
            whileHover={{
              scale: 1.08,
              rotate: 5,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 5,
              },
            }}
            whileTap={{ scale: 0.9, rotate: -5 }}
            src="/assets/img/GameVerseLogo.png"
            alt="GameVerse Logo"
          />
        </LogoContainer>

        {userInfo && (
          <UserProfileBox
            onClick={handleGoToCurrentUserPage}
            whileHover={{
              scale: 1.03,
              boxShadow: "0 0 20px rgba(5, 189, 194, 0.4)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            <UserAvatar>
              {userInfo.picture ? (
                <img
                  src={`https://localhost:7105/${userInfo.picture}`}
                  alt="Profile"
                />
              ) : (
                <DefaultAvatar>
                  {userInfo.displayName?.charAt(0) ||
                    userInfo.firstName?.charAt(0) ||
                    "U"}
                </DefaultAvatar>
              )}
            </UserAvatar>
            <UserInfo>
              <UserName>
                {userInfo.displayName ||
                  `${userInfo.firstName} ${userInfo.lastName}`}
              </UserName>
              <UserTags>
                {userInfo.isGamer && (
                  <Tag $gamer="true">
                    <Icon.Controller className="me-1" />
                    Gamer
                  </Tag>
                )}
                {userInfo.isDeveloper && (
                  <Tag $developer="true">
                    <Icon.Code className="me-1" />
                    Developer
                  </Tag>
                )}
              </UserTags>
            </UserInfo>
          </UserProfileBox>
        )}

        <NavItems>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              $active={activeTab === item.path ? "true" : "false"}
              onClick={item.onClick}
            >
              <IconWrapper
                whileHover={{
                  scale: 1.01,
                  y: -8,
                  transition: {
                    type: "spring",
                    stiffness: 200,
                    damping: 8,
                    velocity: 1,
                  },
                }}
                whileTap={{
                  scale: 0.85,
                  transition: {
                    type: "spring",
                    stiffness: 800,
                    damping: 15,
                  },
                }}
                active={activeTab === item.path}
              >
                {item.icon}
                <ItemLabel>{item.label}</ItemLabel>

                {activeTab === item.path && (
                  <ActiveIndicator
                    layoutId="activeIndicator"
                    transition={{
                      type: "spring",
                      stiffness: 900,
                      damping: 25,
                    }}
                  />
                )}
              </IconWrapper>
            </NavItem>
          ))}
        </NavItems>
      </NavContent>
    </NavContainer>
  );
};

// const StyledWrapper = styled.div`
//   //   .superDiv {
//   //     transform: translateX(-25px);
//   //   }

//   .containerDiv {
//     padding: 10px 10px;
//     background-color: #212121;
//     border: 2px solid #05bdc2;
//     border-radius: 18px;
//   }

//   .navLogo {
//     width: 70px;
//   }

//   p {
//     color: white;
//     margin: 0;
//     align-self: center;
//   }

//   .navbarBtn {
//     cursor: pointer;
//     width: 98px;
//     height: 98px;
//     border-radius: 50%;
//     position: relative;
//     overflow: hidden;
//     transition: transform 0.3s ease;
//   }

//   .navbarBtn::before {
//     content: "";
//     position: absolute;
//     top: 50%;
//     left: 50%;
//     width: 0;
//     height: 0;
//     background-color: #7e188d;
//     border-radius: 50%;
//     transform: translate(-50%, -50%);
//     opacity: 0;
//     transition: width 0.4s ease, height 0.4s ease, opacity 0.4s ease;
//     z-index: -1;
//   }

//   .navbarBtn:hover {
//     transform: translateY(-3px);
//   }

//   .navbarBtn:hover::before {
//     width: 150%;
//     height: 150%;
//     opacity: 1;
//   }

//   .navbarBtn:active {
//     transform: scale(0.95) translateY(-2px);
//     transition: transform 0.1s ease;
//   }

//   .navbarBtn::after {
//     content: "";
//     position: absolute;
//     top: 50%;
//     left: 50%;
//     width: 0;
//     height: 0;
//     background-color: rgba(255, 255, 255, 0.6);
//     border-radius: 50%;
//     transform: translate(-50%, -50%);
//     opacity: 0;
//     z-index: 0;
//   }

//   .navbarBtn:active::after {
//     animation: clickRipple 0.1s ease;
//   }

//   @keyframes clickRipple {
//     0% {
//       width: 0;
//       height: 0;
//       opacity: 0.8;
//     }
//     100% {
//       width: 180%;
//       height: 180%;
//       opacity: 0;
//     }
//   }
// `;

const NavContainer = styled.nav`
  margin-top: 30px;
  position: relative;
  //width: 100%;
  padding: 0.5rem;
  z-index: 100;
`;

const NavContent = styled.div`
  background: rgba(33, 33, 33, 0.85);
  backdrop-filter: blur(10px);
  border: 2px solid #05bdc2;
  box-shadow: 0 0 15px rgba(5, 189, 194, 0.3),
    inset 0 0 10px rgba(5, 189, 194, 0.1);
  border-radius: 18px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const LogoContainer = styled.div`
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(5, 189, 194, 0.2),
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.15s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    z-index: -1;
  }

  &:hover::before {
    opacity: 1;
  }

  img {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }
`;

const NavItems = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 576px) {
    gap: 0.75rem;
  }
`;

const NavItem = styled.div`
  position: relative;
  cursor: pointer;
`;

const IconWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  width: 90px;
  height: 90px;
  color: ${(props) => (props.$active ? "#ffffff" : "rgba(255, 255, 255, 0.7)")};
  position: relative;
  border-radius: 45px;
  background: ${(props) =>
    props.$active
      ? "linear-gradient(135deg, rgba(126, 24, 141, 0.3), rgba(5, 189, 194, 0.3))"
      : "transparent"};
  overflow: hidden;
  transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);

  svg {
    font-size: 1.5rem;
    filter: drop-shadow(
      0 0 2px ${(props) => (props.$active ? "#05bdc2" : "transparent")}
    );
    transition: all 0.15s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at center,
      rgba(5, 189, 194, 0.4) 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.2s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    z-index: -1;
  }

  &:hover {
    color: white;
    background: linear-gradient(
      135deg,
      rgba(126, 24, 141, 0.4),
      rgba(5, 189, 194, 0.4)
    );
    box-shadow: 0 0 15px rgba(5, 189, 194, 0.3);

    &::before {
      opacity: 1;
    }

    svg {
      filter: drop-shadow(0 0 5px #05bdc2);
      transform: translateY(-2px);
    }
  }

  &:active {
    transform: scale(0.9);
  }
`;

const ItemLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-shadow: 0 0 5px rgba(5, 189, 194, 0.5);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);

  ${IconWrapper}:hover & {
    transform: translateY(-2px);
  }
`;

const ActiveIndicator = styled(motion.div)`
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #7e188d, #05bdc2);
  box-shadow: 0 0 14px rgba(5, 189, 194, 0.5);
`;

const UserProfileBox = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.9rem;
  background: linear-gradient(
    135deg,
    rgba(126, 24, 141, 0.2),
    rgba(5, 189, 194, 0.2)
  );
  border: 1px solid rgba(5, 189, 194, 0.4);
  border-radius: 14px;
  padding: 0.6rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 1.5rem;

  @media (max-width: 992px) {
    margin-right: 0;
    margin-bottom: 0.6rem;
  }
`;

const UserAvatar = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #05bdc2;
  box-shadow: 0 0 15px rgba(5, 189, 194, 0.4);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DefaultAvatar = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7e188d, #05bdc2);
  color: white;
  font-size: 1.4rem;
  font-weight: 600;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.6);
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 100px;
`;

const UserName = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 0 5px rgba(5, 189, 194, 0.7);
  margin-bottom: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
`;

const UserTags = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Tag = styled.span`
  font-size: 0.65rem;
  padding: 0.1rem 0.5rem;
  border-radius: 8px;
  background: ${(props) =>
    props.$gamer
      ? "linear-gradient(90deg, #7e188d, #9a1d97)"
      : props.$developer
      ? "linear-gradient(90deg, #05bdc2, #04a6ab)"
      : "linear-gradient(90deg, #333, #555)"};
  color: white;
  font-weight: 500;
  box-shadow: 0 0 8px
    ${(props) =>
      props.$gamer
        ? "rgba(126, 24, 141, 0.5)"
        : props.$developer
        ? "rgba(5, 189, 194, 0.5)"
        : "rgba(50, 50, 50, 0.3)"};
`;

export default Navbar;
