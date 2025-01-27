import React from "react";
import styled, {keyframes} from "styled-components";

const Widget = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const WidgetTitle = styled.h3`
  font-size: 16px;
  color: #333;
  font-weight: 600;
  margin-bottom: 15px;
`;

const PlaceholderMessage = styled.p`
  font-size: 14px;
  color: #757575;
  text-align: center;
`;

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

const AnimatedIcon = styled.div`
  font-size: 3rem;
  color: #007bff;
  margin-bottom: 1rem;
  animation: ${bounce} 2s infinite;
`;

const VisitorsWidget = () => (
  <Widget>
    <WidgetTitle>Visitantes do Dia</WidgetTitle>
    <PlaceholderMessage>Em Construção</PlaceholderMessage>
    <AnimatedIcon>
        🚧
      </AnimatedIcon>
  </Widget>
);

export default VisitorsWidget;
