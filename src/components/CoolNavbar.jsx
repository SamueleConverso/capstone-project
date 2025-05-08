import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as Icon from "react-bootstrap-icons";

const CoolNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  return (
    <StyledWrapper>
      <div className="d-flex mt-3">
        <div className="nav">
          <div className="container">
            <img
              onClick={() => {
                navigate("/");
                dispatch({ type: "TOGGLE_NAVBAR", payload: false });
                dispatch({ type: "TOGGLE_AURORA", payload: true });
              }}
              className="btnImg"
              style={{ width: "40px" }}
              src="../../public/assets/img/GameVerseLogo.png"
            />

            <div
              className="btn"
              onClick={() => {
                navigate("/feed");
                dispatch({ type: "TOGGLE_NAVBAR", payload: true });
                dispatch({ type: "TOGGLE_AURORA", payload: false });
              }}
            >
              Feed
            </div>
            <div className="btn">Community</div>
            <div
              className="btn"
              onClick={() => {
                navigate("/user");
                dispatch({ type: "TOGGLE_NAVBAR", payload: true });
                dispatch({ type: "TOGGLE_AURORA", payload: false });
              }}
            >
              <Icon.PersonCircle className="navIcon" />
              <p>dd</p>
            </div>
            <svg
              className="outline"
              overflow="visible"
              width={400}
              height={60}
              viewBox="0 0 400 60"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                className=""
                pathLength={100}
                x={0}
                y={0}
                width={400}
                height={60}
                fill="transparent"
                strokeWidth={5}
              />
            </svg>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .outline {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .rect {
    stroke-dashoffset: 5;
    stroke-dasharray: 0 0 10 40 10 40;
    transition: 0.5s;
    stroke: #05bdc2;
  }

  .nav {
    position: relative;
    width: 400px;
    height: 80px;
  }

  .container:hover .outline .rect {
    transition: 999999s;
    stroke-dashoffset: 1;
    stroke-dasharray: 0;
  }

  .container {
    position: absolute;
    inset: 0;
    background: #212121;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding: 0.5em;
    border: 2px solid #05bdc2;
    border-radius: 10px;
  }

  .btn {
    padding: 0.5em 1.5em;
    color: #fff;
    cursor: pointer;
    transition: 0.1s;
  }

  .btnImg {
    padding: 0;
    color: #fff;
    cursor: pointer;
    transition: 0.1s;
  }

  .btn:hover {
    background: #7e188d;
    border-radius: 10px;
  }

  .btnImg:hover {
    background: #7e188d;
    border-radius: 50%;
  }

  .btn:nth-child(1):hover ~ svg .rect {
    stroke-dashoffset: 0;
    stroke-dasharray: 0 2 8 73.3 8 10.7;
  }

  .btn:nth-child(2):hover ~ svg .rect {
    stroke-dashoffset: 0;
    stroke-dasharray: 0 12.6 9.5 49.3 9.5 31.6;
  }

  .btn:nth-child(3):hover ~ svg .rect {
    stroke-dashoffset: 0;
    stroke-dasharray: 0 24.5 8.5 27.5 8.5 55.5;
  }

  .btn:nth-child(4):hover ~ svg .rect {
    stroke-dashoffset: 0;
    stroke-dasharray: 0 34.7 6.9 10.2 6.9 76;
  }

  .btn:hover ~ .outline .rect {
    stroke-dashoffset: 0;
    stroke-dasharray: 0 0 10 40 10 40;
    transition: 0.5s !important;
  }

  .moveLogo {
    transform: translateX(-70px);
  }

  .navIconDiv {
    padding: 0.5em 1.5em;
  }

  .navIconDiv:hover {
    padding: 1em 3em;
  }

  .navIcon {
    color: white;
  }

  .navIcon:hover {
    cursor: pointer;
    background-color: #7e188d;
    border-radius: 50%;
  }

  p {
    margin: 0;
  }
`;

export default CoolNavbar;
