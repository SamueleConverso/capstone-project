import React from "react";
import styled from "styled-components";

const DeveloperRole = (props) => {
  return (
    <StyledWrapper>
      <div className="container">
        <div className="radio-tile-group">
          <div className="input-container">
            <input
              id="projectManager"
              className="radio-button"
              type="radio"
              name="developerRole"
              onChange={() => props.onDeveloperRoleChange("projectManager")}
            />
            <div className="radio-tile">
              <div className="icon projectManager-icon"></div>
              <label htmlFor="projectManager" className="radio-tile-label">
                Project Manager
              </label>
            </div>
          </div>
          <div className="input-container">
            <input
              id="soundDesigner"
              className="radio-button"
              type="radio"
              name="developerRole"
              onChange={() => props.onDeveloperRoleChange("soundDesigner")}
            />
            <div className="radio-tile">
              <div className="icon soundDesigner-icon"></div>
              <label htmlFor="soundDesigner" className="radio-tile-label">
                Sound designer
              </label>
            </div>
          </div>
          <div className="input-container">
            <input
              id="graphicDesigner"
              className="radio-button"
              type="radio"
              name="developerRole"
              onChange={() => props.onDeveloperRoleChange("graphicDesigner")}
            />
            <div className="radio-tile">
              <div className="icon graphicDesigner-icon"></div>
              <label htmlFor="graphicDesigner" className="radio-tile-label">
                Graphic designer
              </label>
            </div>
          </div>
          <div className="input-container">
            <input
              id="3dArtist"
              className="radio-button"
              type="radio"
              name="developerRole"
              onChange={() => props.onDeveloperRoleChange("3dArtist")}
            />
            <div className="radio-tile">
              <div className="icon 3dArtist-icon"></div>
              <label htmlFor="3dArtist" className="radio-tile-label">
                3D Artist
              </label>
            </div>
          </div>
          <div className="input-container">
            <input
              id="2dArtist"
              className="radio-button"
              type="radio"
              name="developerRole"
              onChange={() => props.onDeveloperRoleChange("2dArtist")}
            />
            <div className="radio-tile">
              <div className="icon 2dArtist-icon"></div>
              <label htmlFor="2dArtist" className="radio-tile-label">
                2D Artist
              </label>
            </div>
          </div>
          <div className="input-container">
            <input
              id="betaTester"
              className="radio-button"
              type="radio"
              name="developerRole"
              onChange={() => props.onDeveloperRoleChange("betaTester")}
            />
            <div className="radio-tile">
              <div className="icon betaTester-icon"></div>
              <label htmlFor="betaTester" className="radio-tile-label">
                BETA TESTER
              </label>
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

export default DeveloperRole;
