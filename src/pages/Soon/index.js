import React from 'react';
import styled, { keyframes } from 'styled-components';

// Animation Keyframes
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

// Styled Components
const ConstructionPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f4f4f4;
  text-align: center;
  font-family: Arial, sans-serif;
`;

const AnimatedIcon = styled.div`
  font-size: 5rem;
  color: #007bff;
  margin-bottom: 1rem;
  animation: ${bounce} 2s infinite;
`;

const Message = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const SubMessage = styled.p`
  font-size: 1rem;
  color: #666;
`;

const BackButton = styled.button`
  margin-top: 2rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

function ConstructionPage() {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <ConstructionPageContainer>
      <AnimatedIcon>
        🚧
      </AnimatedIcon>
      <Message>Funcionalidade em construção</Message>
      <SubMessage>Estamos trabalhando duro para liberar mais uma funcionalidade incrível. Aguarde!</SubMessage>
      <BackButton onClick={handleBack}>Voltar</BackButton>
    </ConstructionPageContainer>
  );
}

export default ConstructionPage;
