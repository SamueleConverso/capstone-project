// function Footer() {
//   return (
//     <footer className="mt-5">
//       <div
//         style={{
//           borderTop: "1px solid rgb(255, 255, 255)",
//           width: "100%",
//           backgroundColor: "rgba(2, 0, 32, 0.9)",
//         }}
//       >
//         <div className="text-center py-3">
//           <p className="text-white">&copy; Samuele Converso - 2025</p>
//           <p className="text-white">GameVerse</p>
//           <p className="text-white">Epicode Capstone Project</p>
//         </div>
//       </div>
//     </footer>
//   );
// }

// export default Footer;

import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import * as Icon from "react-bootstrap-icons";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <FooterWrapper>
      <GlowEffect />

      <TechLine className="tech-line-1" />
      <TechLine className="tech-line-2" />

      <FooterContent>
        <BrandSection>
          <LogoContainer>
            <motion.div
              className="logo-glow"
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.05, 1],
              }}
              transition={{ repeat: Infinity, duration: 3 }}
            />
            <h2 className="brand-name">GameVerse</h2>
          </LogoContainer>
          <p className="tagline">
            Il portale che unisce giocatori e sviluppatori di videogiochi
          </p>

          <SocialLinks>
            <SocialButton
              whileHover={{ y: -3, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon.Github />
            </SocialButton>
            <SocialButton
              whileHover={{ y: -3, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon.Linkedin />
            </SocialButton>
            <SocialButton
              whileHover={{ y: -3, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon.Twitter />
            </SocialButton>
            <SocialButton
              whileHover={{ y: -3, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon.Discord />
            </SocialButton>
          </SocialLinks>
        </BrandSection>

        <LinksSection>
          <FooterColumn>
            <h3>Navigazione</h3>
            <ul>
              <FooterLink whileHover={{ x: 5 }}>
                <Icon.HouseFill className="link-icon" />
                <span>Home</span>
              </FooterLink>
              <FooterLink whileHover={{ x: 5 }}>
                <Icon.Controller className="link-icon" />
                <span>Videogiochi</span>
              </FooterLink>
              <FooterLink whileHover={{ x: 5 }}>
                <Icon.PeopleFill className="link-icon" />
                <span>Community</span>
              </FooterLink>
              <FooterLink whileHover={{ x: 5 }}>
                <Icon.PersonPlusFill className="link-icon" />
                <span>Trova Amici</span>
              </FooterLink>
            </ul>
          </FooterColumn>

          <FooterColumn>
            <h3>Contattaci</h3>
            <ContactItem>
              <Icon.EnvelopeFill className="contact-icon" />
              <span>info@gameverse.com</span>
            </ContactItem>
            <ContactItem>
              <Icon.TelephoneFill className="contact-icon" />
              <span>+39 123 456 7890</span>
            </ContactItem>
            <ContactItem>
              <Icon.GeoAltFill className="contact-icon" />
              <span>Via dei Videogiochi, 42 - Roma</span>
            </ContactItem>
          </FooterColumn>

          <FooterColumn>
            <h3>Informazioni</h3>
            <ul>
              <FooterLink whileHover={{ x: 5 }}>
                <Icon.InfoCircleFill className="link-icon" />
                <span>Chi siamo</span>
              </FooterLink>
              <FooterLink whileHover={{ x: 5 }}>
                <Icon.ShieldLockFill className="link-icon" />
                <span>Privacy Policy</span>
              </FooterLink>
              <FooterLink whileHover={{ x: 5 }}>
                <Icon.FileTextFill className="link-icon" />
                <span>Termini di servizio</span>
              </FooterLink>
              <FooterLink whileHover={{ x: 5 }}>
                <Icon.QuestionCircleFill className="link-icon" />
                <span>FAQ</span>
              </FooterLink>
            </ul>
          </FooterColumn>
        </LinksSection>
      </FooterContent>

      <CopyrightBar>
        <p>
          &copy; 2025 GameVerse by Samuele Converso - Epicode Capstone Project
        </p>
        <TechBadge>
          <span className="pulse-dot" />
          System Online
        </TechBadge>
      </CopyrightBar>
    </FooterWrapper>
  );
}

const FooterWrapper = styled.footer`
  position: relative;
  background: linear-gradient(
    180deg,
    rgba(18, 18, 32, 0.95) 0%,
    rgba(15, 15, 25, 0.98) 100%
  );
  border-top: 1px solid rgba(126, 24, 141, 0.5);
  color: #e0e0e0;
  padding: 30px 0 0;
  margin-top: 20px;
  overflow: hidden;
  box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.2),
    0 -5px 10px rgba(126, 24, 141, 0.1);
`;

const GlowEffect = styled.div`
  position: absolute;
  top: -150px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 200px;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 162, 174, 0.15) 0%,
    rgba(126, 24, 141, 0.1) 50%,
    transparent 70%
  );
  opacity: 0.6;
  pointer-events: none;
`;

const TechLine = styled.div`
  position: absolute;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 162, 174, 0.5),
    transparent
  );
  box-shadow: 0 0 10px rgba(0, 162, 174, 0.8);

  &.tech-line-1 {
    top: 10px;
    width: 80%;
    left: 10%;
    animation: techLine 8s infinite linear;
  }

  &.tech-line-2 {
    bottom: 75px;
    width: 60%;
    right: 0;
    animation: techLine 5s infinite linear;
  }

  @keyframes techLine {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const BrandSection = styled.div`
  flex: 1;
  min-width: 280px;

  .tagline {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 10px;
    max-width: 280px;
  }
`;

const LogoContainer = styled.div`
  position: relative;
  display: inline-block;

  .brand-name {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(90deg, #e81cff, #40c9ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 1px;
    position: relative;
    z-index: 2;
  }

  .logo-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 140%;
    height: 160%;
    background: radial-gradient(
      ellipse at center,
      rgba(126, 24, 141, 0.3) 0%,
      rgba(0, 162, 174, 0.2) 40%,
      transparent 80%
    );
    filter: blur(20px);
    border-radius: 50%;
    z-index: 1;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const SocialButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(40, 40, 50, 0.6);
  border: 1px solid rgba(126, 24, 141, 0.4);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  &:hover {
    color: #05bdc2;
    background: rgba(30, 30, 40, 0.8);
    border-color: #05bdc2;
    box-shadow: 0 0 15px rgba(5, 189, 194, 0.5);
  }

  &:active {
    transform: scale(0.9);
  }
`;

const LinksSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  flex: 2;
  justify-content: space-around;

  @media (max-width: 576px) {
    flex-direction: column;
    gap: 30px;
  }
`;

const FooterColumn = styled.div`
  min-width: 200px;

  h3 {
    position: relative;
    font-size: 1.3rem;
    margin-bottom: 20px;
    padding-bottom: 10px;
    color: #fff;

    &:after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, #7e188d, #05bdc2);
      border-radius: 2px;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
`;

const FooterLink = styled(motion.li)`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: color 0.2s ease;

  .link-icon {
    margin-right: 10px;
    color: #05bdc2;
    font-size: 0.9rem;
    transition: transform 0.2s ease;
  }

  span {
    font-size: 0.95rem;
  }

  &:hover {
    color: #fff;

    .link-icon {
      transform: scale(1.2);
      color: #7e188d;
    }
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.7);

  .contact-icon {
    margin-right: 10px;
    color: #05bdc2;
    font-size: 0.9rem;
  }

  span {
    font-size: 0.95rem;
  }
`;

const CopyrightBar = styled.div`
  //margin-top: 30px;
  padding: 0 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);

  p {
    margin: 0;
  }

  @media (max-width: 576px) {
    flex-direction: column;
    text-align: center;
  }
`;

const TechBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(5, 189, 194, 0.3);
  font-size: 0.8rem;
  font-family: monospace;
  letter-spacing: 0.5px;
  color: #05bdc2;

  .pulse-dot {
    width: 8px;
    height: 8px;
    background: #05bdc2;
    border-radius: 50%;
    display: inline-block;
    animation: pulse 2s infinite ease-in-out;
  }

  @keyframes pulse {
    0% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.5;
    }
  }
`;

export default Footer;
