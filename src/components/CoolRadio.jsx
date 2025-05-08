import React from "react";
import styled from "styled-components";

const CoolRadio = (props) => {
  return (
    <StyledWrapper>
      <div className="container">
        <div className="radio-tile-group">
          <div className="input-container">
            <input
              id="avatar1"
              className="radio-button"
              type="radio"
              name="radio"
              onChange={() => props.onAvatarChange("avatar1")}
            />
            <div className="radio-tile">
              <div className="icon avatar1-icon">
                <img
                  height={60}
                  width={60}
                  src="../../public/assets/img/Avatar1.png"
                />
              </div>
              <label htmlFor="avatar1" className="radio-tile-label"></label>
            </div>
          </div>
          <div className="input-container">
            <input
              id="avatar2"
              className="radio-button"
              type="radio"
              name="radio"
              onChange={() => props.onAvatarChange("avatar2")}
            />
            <div className="radio-tile">
              <div className="icon avatar2-icon">
                <img
                  height={60}
                  width={60}
                  src="../../public/assets/img/Avatar2.png"
                />
              </div>
              <label htmlFor="avatar2" className="radio-tile-label"></label>
            </div>
          </div>
          <div className="input-container">
            <input
              id="avatar3"
              className="radio-button"
              type="radio"
              name="radio"
              onChange={() => props.onAvatarChange("avatar3")}
            />
            <div className="radio-tile">
              <div className="icon avatar3-icon">
                <img
                  height={60}
                  width={60}
                  src="../../public/assets/img/Avatar3.png"
                />
              </div>
              <label htmlFor="avatar3" className="radio-tile-label"></label>
            </div>
          </div>
          <div className="input-container">
            <input
              id="avatar4"
              className="radio-button"
              type="radio"
              name="radio"
              onChange={() => props.onAvatarChange("avatar4")}
            />
            <div className="radio-tile">
              <div className="icon avatar4-icon">
                <img
                  height={60}
                  width={60}
                  src="../../public/assets/img/Avatar4.png"
                />
              </div>
              <label htmlFor="avatar4" className="radio-tile-label"></label>
            </div>
          </div>
          <div className="input-container">
            <input
              id="avatar5"
              className="radio-button"
              type="radio"
              name="radio"
              onChange={() => props.onAvatarChange("avatar5")}
            />
            <div className="radio-tile">
              <div className="icon avatar5-icon">
                <img
                  height={60}
                  width={60}
                  src="../../public/assets/img/Avatar5.png"
                />
              </div>
              <label htmlFor="avatar5" className="radio-tile-label"></label>
            </div>
          </div>
          <div className="input-container">
            <input
              id="avatar6"
              className="radio-button"
              type="radio"
              name="radio"
              onChange={() => props.onAvatarChange("avatar6")}
            />
            <div className="radio-tile">
              <div className="icon avatar6-icon">
                <img
                  height={60}
                  width={60}
                  src="../../public/assets/img/Avatar6.png"
                />
              </div>
              <label htmlFor="avatar6" className="radio-tile-label"></label>
            </div>
          </div>
          <div className="input-container">
            <input
              id="avatar7"
              className="radio-button"
              type="radio"
              name="radio"
              onChange={() => props.onAvatarChange("avatar7")}
            />
            <div className="radio-tile">
              <div className="icon avatar7-icon">
                <img
                  height={60}
                  width={60}
                  src="../../public/assets/img/Avatar7.png"
                />
              </div>
              <label htmlFor="avatar7" className="radio-tile-label"></label>
            </div>
          </div>
          <div className="input-container">
            <input
              id="avatar8"
              className="radio-button"
              type="radio"
              name="radio"
              onChange={() => props.onAvatarChange("avatar8")}
            />
            <div className="radio-tile">
              <div className="icon avatar8-icon">
                <img
                  height={60}
                  width={60}
                  src="../../public/assets/img/Avatar8.png"
                />
              </div>
              <label htmlFor="avatar8" className="radio-tile-label"></label>
            </div>
          </div>
          <div className="input-container">
            <input
              id="avatar9"
              className="radio-button"
              type="radio"
              name="radio"
              onChange={() => props.onAvatarChange("avatar9")}
            />
            <div className="radio-tile">
              <div className="icon avatar9-icon">
                <img
                  height={60}
                  width={60}
                  src="../../public/assets/img/Avatar9.png"
                />
              </div>
              <label htmlFor="avatar9" className="radio-tile-label"></label>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .radio-tile-group {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .radio-tile-group .input-container {
    position: relative;
    height: 80px;
    width: 80px;
    margin: 0.5rem;
  }

  .radio-tile-group .input-container .radio-button {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    margin: 0;
    cursor: pointer;
  }

  .radio-tile-group .input-container .radio-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border: 2px solid #079ad9;
    border-radius: 50%;
    padding: 1rem;
    transition: transform 300ms ease;
  }

  .radio-tile-group .input-container .icon svg {
    fill: #079ad9;
    width: 2rem;
    height: 2rem;
  }

  .radio-tile-group .input-container .radio-tile-label {
    text-align: center;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #079ad9;
  }

  .radio-tile-group .input-container .radio-button:checked + .radio-tile {
    background-color: #079ad9;
    border: 2px solid #079ad9;
    color: white;
    transform: scale(1.1, 1.1);
  }

  .radio-tile-group
    .input-container
    .radio-button:checked
    + .radio-tile
    .icon
    svg {
    fill: white;
    background-color: #079ad9;
  }

  .radio-tile-group
    .input-container
    .radio-button:checked
    + .radio-tile
    .radio-tile-label {
    color: white;
    background-color: #079ad9;
  }
`;

export default CoolRadio;
