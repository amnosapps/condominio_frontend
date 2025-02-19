import { useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import styled from "styled-components";

// Styled Components
const ConsentModal = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #f9f9f9;
  color: black;
  padding: 15px 25px;
  border-radius: 10px;
  border: 2px solid orange;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  display: ${(props) => (props.show ? "flex" : "none")};
  align-items: center;
  justify-content: space-between;
  width: 80%;
  max-width: 600px;
  z-index: 9999;
  flex-wrap: wrap;
  gap: 10px;

  @media (max-width: 768px) {
    width: 90%;
  }
`;

const AcceptButton = styled.button`
  background-color: orange;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  margin-left: auto;
  white-space: nowrap;

  &:hover {
    background-color: #e69500;
  }

  svg {
    margin-right: 8px;
  }
`;

const ConsentText = styled.p`
  flex: 1;
  max-width: 75%;
`;

const PrivacyLink = styled.a`
  color: orange;
  text-decoration: none;
  font-weight: bold;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

const ConsentIcon = styled(FaCheckCircle)`
  margin-right: 10px;
`;

const Wrapper = styled.div`
  width: 100%;
  max-width: 600px;
  margin: auto;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-top: 50px;
  overflow-y: auto;
  height: 90vh;
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 768px) {
    max-width: 350px;
    height: auto;
  }
`;

const GuestFormCookie = () => {
  const [userConsent, setUserConsent] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já aceitou os termos no localStorage
    const consentGiven = localStorage.getItem("userConsent");
    if (consentGiven === "true") {
      setUserConsent(true);
    }
  }, []);

  const handleAcceptConsent = () => {
    setUserConsent(true);
    localStorage.setItem("UserConfirmTermsOfUse", "true"); 
  };

  return (
    <>
      {/* Consent Banner */}
      <UserConsentBanner showConsent={userConsent} onAccept={handleAcceptConsent} />
      <Wrapper>
        {/* Rest of the content*/}
      </Wrapper>
    </>
  );
};

const UserConsentBanner = ({ onAccept, showConsent }) => {
  return (
    <ConsentModal show={!showConsent}>
      <ConsentText>
        Ao aceitar, você concorda com o uso dos seus dados pelo Igoove para melhorar a experiência e personalizar conteúdos. Veja mais em nossa 
        <PrivacyLink href="/"> política de privacidade</PrivacyLink>.
      </ConsentText>
      <AcceptButton onClick={onAccept}>
        <ConsentIcon />
        Aceitar
      </AcceptButton>
    </ConsentModal>
  );
};

export default GuestFormCookie;
