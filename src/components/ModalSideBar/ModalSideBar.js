import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { FaHeadset } from "react-icons/fa";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: #f5f5f5;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Title = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.5rem;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 1rem;
  color: #555;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #333;

  &:hover {
    color: red;
  }
`;

const ContactModal = ({ onClose }) => {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <TitleContainer>
            <FaHeadset size={24} />
            <Title>Entre em contato</Title>
          </TitleContainer>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>
        <ContactInfo>
            <p>Email: contato@igoove.com.br</p>
            {/* <p>Phone: (83) 0000-0000</p>  */}
        </ContactInfo>
      </ModalContainer>
    </ModalOverlay>
  );
};

// Type checking with PropTypes
ContactModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default ContactModal;
