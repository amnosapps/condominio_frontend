import React from "react";
import styled from "styled-components";

// Styled Components
const SidebarContainer = styled.div`
  width: 450px;
  height: 100vh;
  background-color: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  font-family: 'Roboto', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    color: #333;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 20px;
`;

const ActionIcon = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    color: #000;
  }
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: bold;
  color: #2e2e2e;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: #666;
  margin: 5px 0 20px 0;
`;

const Badge = styled.span`
  background: ${(props) => (props.isCheckedIn ? "#4CAF50" : "#FFC107")};
  color: white;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 15px;
  font-weight: bold;
  margin-left: 10px;
`;

const Section = styled.div`
  margin-top: 20px;
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const InfoIcon = styled.div`
  font-size: 20px;
  color: #666;
  margin-right: 15px;
`;

const InfoText = styled.div`
  font-size: 15px;
  color: #2e2e2e;

  span {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
    font-size: 14px;
    color: #888;
  }
`;

const AgentRow = styled.div`
  display: flex;
  align-items: center;
  margin-top: 15px;
`;

const AgentAvatar = styled.img`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  margin-right: 10px;
`;

const AgentName = styled.div`
  font-size: 14px;
  color: #333;
  font-weight: bold;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 30px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px 15px;
  font-size: 14px;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: ${(props) => props.bgColor || "#2196f3"};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => props.hoverColor || "#1976d2"};
  }
`;

const Footer = styled.div`
  margin-top: auto;
  font-size: 12px;
  color: #888;
  text-align: center;
  margin-bottom: 10px;
`;

// Mock Data
const mockReservation = {
  guestName: "Gabrielle Dujardin",
  status: "Attente de visite",
  address: "58 rue de la Fontaine au Roi 75010 PARIS",
  dossierStatus: "Dossier locatif",
  dossierProgress: "100%",
  phone: "+33 6 60 15 55 37",
  email: "gaby.dujardin@gmail.com",
  agentName: "Mathéo Delacroix",
  agentAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
};

const ReservationSidebar = ({ onClose }) => {
  return (
    <SidebarContainer>
      <Header>
        <CloseButton onClick={onClose}>✕</CloseButton>
        <HeaderActions>
          <ActionIcon>📅</ActionIcon>
          <ActionIcon>📂</ActionIcon>
          <ActionIcon>🗑️</ActionIcon>
        </HeaderActions>
      </Header>
      <Title>{mockReservation.guestName}</Title>
      <Subtitle>
        {mockReservation.address}
        <Badge>{mockReservation.status}</Badge>
      </Subtitle>
      <Section>
        <InfoRow>
          <InfoIcon>📂</InfoIcon>
          <InfoText>
            <span>Dossier</span>
            {mockReservation.dossierStatus} - {mockReservation.dossierProgress}
          </InfoText>
        </InfoRow>
        <InfoRow>
          <InfoIcon>📞</InfoIcon>
          <InfoText>
            <span>Phone</span>
            {mockReservation.phone}
          </InfoText>
        </InfoRow>
        <InfoRow>
          <InfoIcon>✉️</InfoIcon>
          <InfoText>
            <span>Email</span>
            {mockReservation.email}
          </InfoText>
        </InfoRow>
        <InfoRow>
          <InfoIcon>📌</InfoIcon>
          <InfoText>
            <span>Status</span>
            {mockReservation.status}
          </InfoText>
        </InfoRow>
        <AgentRow>
          <AgentAvatar src={mockReservation.agentAvatar} alt="Agent" />
          <AgentName>{mockReservation.agentName}</AgentName>
        </AgentRow>
      </Section>
      <ActionButtons>
        <ActionButton bgColor="#4CAF50" hoverColor="#45A049">
          Planifier un RDV
        </ActionButton>
        <ActionButton bgColor="#F44336" hoverColor="#E53935">
          Archiver
        </ActionButton>
      </ActionButtons>
      <Footer>Reservation ID: 12345</Footer>
    </SidebarContainer>
  );
};

export default ReservationSidebar;
