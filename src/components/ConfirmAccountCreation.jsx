import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircleFill } from "react-bootstrap-icons";
import GradientButton from "./GradientButton";

const ConfirmAccountCreation = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <StyledWrapper>
      <ConfirmationCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <SuccessIcon
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.2,
          }}
        >
          <CheckCircleFill size={80} />
        </SuccessIcon>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Title>Registrazione Completata!</Title>

          <Message>
            Il tuo account GameVerse è stato creato con successo. Benvenuto
            nella comunità! Accedi ora per iniziare la tua avventura.
          </Message>
        </motion.div>

        <ButtonContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <GradientButton text="ACCEDI ORA" onClick={handleLogin} />
        </ButtonContainer>

        <PulseCircle
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
          }}
        />
      </ConfirmationCard>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 2rem;
`;

const ConfirmationCard = styled(motion.div)`
  width: 550px;
  background: linear-gradient(#212121, rgb(0, 0, 0)) padding-box,
    linear-gradient(145deg, transparent 35%, #e81cff, #40c9ff) border-box;
  border: 2px solid transparent;
  padding: 3rem 2.5rem;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #7e188d, #05bdc2);
    box-shadow: 0 0 25px rgba(5, 189, 194, 0.8);
  }
`;

const SuccessIcon = styled(motion.div)`
  margin-bottom: 1.5rem;
  color: #05bdc2;
  filter: drop-shadow(0 0 8px rgba(5, 189, 194, 0.7));
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
  background: linear-gradient(90deg, #e81cff, #40c9ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
  text-shadow: 0 0 20px rgba(232, 28, 255, 0.3);
`;

const Message = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.85);
`;

const ButtonContainer = styled(motion.div)`
  margin-top: 1rem;
  z-index: 10;
`;

const PulseCircle = styled(motion.div)`
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(5, 189, 194, 0.2) 0%,
    rgba(126, 24, 141, 0.1) 50%,
    transparent 70%
  );
  z-index: 1;
`;

export default ConfirmAccountCreation;
