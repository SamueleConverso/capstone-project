import React from "react";
import styled from "styled-components";
import GradientText from "./GradientText";
import GradientButton from "./GradientButton";

const GradientCard = () => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="card__content">
          <GradientText
            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
            animationSpeed={3}
            showBorder={false}
            className="hero-text text-center"
          >
            GameVerse ti dà il benvenuto
          </GradientText>
          <p className="text-white text-center mt-4">
            Il tuo portale di riferimento per connetterti con altri
            videogiocatori e sviluppatori di videogiochi!
          </p>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    width: 400px;
    height: fit-content;
    border-radius: 20px;
    padding: 5px;
    box-shadow: rgba(151, 65, 252, 0.2) 0 15px 30px -5px;
    background-image: linear-gradient(144deg, #af40ff, #5b42f3 50%, #00ddeb);
  }

  .card__content {
    background: rgb(5, 6, 45);
    border-radius: 17px;
    width: 100%;
    height: 100%;
    padding: 20px;
  }
`;

export default GradientCard;
