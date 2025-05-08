import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Homepage from "./components/Homepage";
import Squares from "./components/Squares";
import Footer from "./components/Footer";
import Aurora from "./components/Aurora";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";
import UserPage from "./components/UserPage";
import FeedPage from "./components/FeedPage";
import CoolNavbar from "./components/CoolNavbar";
import Navbar from "./components/Navbar";
import { useSelector, useDispatch } from "react-redux";
//import PostCard from "./components/PublishPostCard";
import OtherUserPage from "./components/OtherUserPage";
import UserPostsView from "./components/UserPostsView";
import FindFriendsPage from "./components/FindFriendsPage";
import VideogamesPage from "./components/VideogamesPage";
import VideogameDetailsPage from "./components/VideogameDetailsPage";
// import PostDetailsPage from "./components/PostDetailsPage";
import VideogamesPublishedPage from "./components/VideogamesPublishedPage";
import CommunitiesPage from "./components/CommunitiesPage";
import CommunityDetailsPage from "./components/CommunityDetailsPage";
import UserCommunitiesView from "./components/UserCommunitiesView";
//import UserProfileView from "./components/UserProfileView";
import ConfirmAccountCreation from "./components/ConfirmAccountCreation";

function App() {
  const dispatch = useDispatch();

  // const [showNavbar, setShowNavbar] = useState(false);
  // const [showAurora, setShowAurora] = useState(false);

  const navbar = useSelector((state) => state.profile.navbar);
  const aurora = useSelector((state) => state.profile.aurora);

  const loginSuccess = useSelector((state) => state.profile.loginSuccess);
  const logout = useSelector((state) => state.profile.logout);

  const updateComponents = () => {
    const currentPath = window.location.pathname;
    const mainElement = document.querySelector("main");
    if (mainElement) {
      if (
        currentPath === "/" ||
        currentPath === "/login" ||
        currentPath === "/register"
      ) {
        mainElement.style.alignContent = "center";
        // setShowNavbar(false);
        // setShowAurora(true);
        dispatch({ type: "TOGGLE_NAVBAR", payload: false });
        dispatch({ type: "TOGGLE_AURORA", payload: true });
        if (currentPath === "/" && localStorage.getItem("jwtToken")) {
          mainElement.style.alignContent = "start";
          dispatch({ type: "TOGGLE_NAVBAR", payload: true });
          dispatch({ type: "TOGGLE_AURORA", payload: false });
        }
      } else if (localStorage.getItem("jwtToken")) {
        mainElement.style.alignContent = "start";
        // setShowNavbar(true);
        // setShowAurora(false);
        dispatch({ type: "TOGGLE_NAVBAR", payload: true });
        dispatch({ type: "TOGGLE_AURORA", payload: false });
      }
    }
  };

  useEffect(() => {
    updateComponents();
  }, [navbar, aurora, loginSuccess, logout]);

  useEffect(() => {
    updateComponents();
  }, []);

  return (
    <Router>
      {aurora && (
        <Aurora
          colorStops={["#FF00FF", "#00FFFF", "#FF00FF"]}
          blend={0.6}
          amplitude={1.0}
          speed={0.5}
        />
      )}
      <Squares
        speed={0.2}
        squareSize={160}
        direction="diagonal" // up, down, left, right, diagonal
        borderColor="#acb5b5"
        hoverFillColor="#222"
      />
      <main>
        {navbar && (
          <div className="d-flex justify-content-center">
            {/* <img
            style={{ width: "300px" }}
            src="../public/assets/img/GameVerseLogo.png"
          /> */}
            {/* <CoolNavbar /> */}
            <Navbar />
          </div>
        )}
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/registration-success"
            element={<ConfirmAccountCreation />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route
            path="/other-user/:applicationUserId"
            element={<OtherUserPage />}
          />
          <Route path="/user-posts/:userId" element={<UserPostsView />} />
          <Route path="/find-friends" element={<FindFriendsPage />} />
          <Route path="/videogames" element={<VideogamesPage />} />
          <Route
            path="/videogame-details/:videogameId"
            element={<VideogameDetailsPage />}
          />
          <Route
            path="/user-games/:userId"
            element={<VideogamesPublishedPage />}
          />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route
            path="/community-details/:communityId"
            element={<CommunityDetailsPage />}
          />
          <Route
            path="/user-communities/:userId"
            element={<UserCommunitiesView />}
          />
          <Route path="*" element={<Homepage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
