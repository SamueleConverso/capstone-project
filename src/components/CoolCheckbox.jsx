import React from "react";
import styled from "styled-components";

const CoolCheckbox = (props) => {
  return (
    <StyledWrapper>
      <div className="cyberpunk-checkbox-container">
        <label className="cyber-checkbox text-white">
          <input
            type="checkbox"
            checked={props.checked}
            onChange={props.onChange}
          />
          <span className="checkbox">
            <span className="core" />
            <span className="ring" />
            <span className="check-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={22}
                height={22}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00FFFF"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
          </span>
          <div className="glow-layer" />
          <div className="pulse-layer" />
          <div className="glitch-layer" />
          &nbsp; &nbsp; &nbsp; {props.text}
        </label>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .cyberpunk-checkbox-container {
    position: relative;
  }

  .cyber-checkbox {
    position: relative;
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  .cyber-checkbox input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .checkbox {
    position: relative;
    width: 30px;
    height: 30px;
    background: linear-gradient(135deg, #1a0033, #0a0f1f);
    border: 2px solid #ff00ff;
    border-radius: 8px;
    box-shadow: inset 3px 3px 6px rgba(0, 0, 0, 0.5),
      inset -3px -3px 6px rgba(51, 25, 77, 0.2), 0 0 10px rgba(255, 0, 255, 0.3);
    transition: all 0.3s ease;
    transform: translateZ(10px);
  }

  .check-icon {
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
    transition: all 0.3s ease;
  }

  .label-text {
    margin-left: 10px;
    font-size: 18px;
    font-weight: bold;
    color: #ff00ff;
    text-shadow: 0 0 5px rgba(255, 0, 255, 0.5);
    transition: all 0.3s ease;
  }

  .glow-layer {
    position: absolute;
    inset: -10px;
    border-radius: 12px;
    background: radial-gradient(
      circle,
      rgba(255, 0, 255, 0.2),
      transparent 70%
    );
    filter: blur(15px);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  .glitch-layer {
    position: absolute;
    inset: 0;
    border-radius: 8px;
    background: transparent;
    opacity: 0;
    z-index: 1;
  }

  .cyber-checkbox:hover .checkbox {
    transform: translateZ(15px) scale(1.05);
    box-shadow: inset 3px 3px 6px rgba(0, 0, 0, 0.5),
      inset -3px -3px 6px rgba(51, 25, 77, 0.3), 0 0 15px rgba(255, 0, 255, 0.5);
  }

  .cyber-checkbox:hover .label-text {
    color: #00ffff;
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.7);
  }

  .cyber-checkbox:hover .glow-layer {
    opacity: 0.5;
  }

  .cyber-checkbox input:checked + .checkbox {
    background: linear-gradient(135deg, #00ffff, #0a0f1f);
    border-color: #00ffff;
    box-shadow: inset 3px 3px 6px rgba(0, 0, 0, 0.5),
      inset -3px -3px 6px rgba(0, 255, 255, 0.2),
      0 0 15px rgba(0, 255, 255, 0.5);
    animation: glitch 0.5s ease forwards;
  }

  .cyber-checkbox input:checked + .checkbox .check-icon {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
    animation: check-bounce 0.4s ease-out;
  }

  .cyber-checkbox input:checked ~ .label-text {
    color: #00ffff;
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.7);
  }

  .cyber-checkbox input:checked ~ .glow-layer {
    background: radial-gradient(
      circle,
      rgba(0, 255, 255, 0.2),
      transparent 70%
    );
    opacity: 1;
  }

  .cyber-checkbox input:checked ~ .glitch-layer {
    opacity: 1;
    animation: glitch-flash 0.5s ease forwards;
  }

  /* Animations */
  @keyframes glitch {
    0% {
      transform: translateZ(10px) skew(0deg);
    }
    20% {
      transform: translateZ(15px) skew(5deg);
    }
    40% {
      transform: translateZ(10px) skew(-3deg);
    }
    60% {
      transform: translateZ(15px) skew(2deg);
    }
    80% {
      transform: translateZ(10px) skew(-1deg);
    }
    100% {
      transform: translateZ(15px) skew(0deg);
    }
  }

  @keyframes glitch-flash {
    0%,
    100% {
      opacity: 0;
    }
    10% {
      opacity: 0.5;
      background: rgba(255, 0, 255, 0.1);
      transform: translate(2px, -1px);
    }
    30% {
      opacity: 0.3;
      background: rgba(0, 255, 255, 0.1);
      transform: translate(-1px, 2px);
    }
    50% {
      opacity: 0.4;
      background: rgba(255, 0, 255, 0.1);
      transform: translate(1px, -2px);
    }
    70% {
      opacity: 0.2;
      background: rgba(0, 255, 255, 0.1);
      transform: translate(-2px, 1px);
    }
  }

  @keyframes check-bounce {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }

  .checkbox {
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateZ(10px) translateY(0);
    }
    50% {
      transform: translateZ(12px) translateY(-3px);
    }
  }

  .cyber-checkbox:hover .checkbox {
    animation: none;
  }
`;

export default CoolCheckbox;
