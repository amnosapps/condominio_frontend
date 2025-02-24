import React, { useState } from "react";
import styled from "styled-components";
import VisitorCreationModal from "../../components/Users/Visitors/VisitorCreationModal";
import VisitorEditModal from "../../components/Users/Visitors/VisitorEditModal";

// Styled Components for Visitors Widget
const Widget = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  max-height: 260px;
  min-height: 260px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #b3b3b3;
  }
`;

const WidgetTitle = styled.h3`
  font-size: 18px;
  color: #1f2937;
  font-weight: 700;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const OpenButton = styled.button`
  background-color: #f46600;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #ff7e21;
  }

  &:active {
    background-color: #3e8e41;
  }

  &:focus {
    outline: none;
  }
`;

const NoVisitorsText = styled.div`
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  margin-top: 100px;
`;

const VisitorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 260px;
  padding-bottom: 20px;
`;

const VisitorItem = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-radius: 8px;
  background: #f9f9f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  border: 1px solid #e9ecef;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    background-color: rgba(0, 123, 255, 0.1);
    border-color: #007bff;
  }
`;

const VisitorImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
`;

const VisitorDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const VisitorName = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const UnitDetails = styled.span`
  font-size: 14px;
  color: #6b7280;
`;

const EntryDate = styled.span`
  font-size: 12px;
  color: #9ca3af;
`;

const ChevronIcon = styled.span`
  font-size: 20px;
  color: #4caf50;
  cursor: pointer;
`;

const VisitorsWidget = ({ visitors, fetchVisitors, selectedCondominium, apartments }) => {
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const openCreationModal = () => setIsCreationModalOpen(true);
  const closeCreationModal = () => setIsCreationModalOpen(false);

  const handleVisitorClick = (visitor) => {
    setSelectedVisitor(visitor);
  };

  const closeEditModal = () => {
    setSelectedVisitor(null);
  };

  // **FILTERING VISITORS WHO HAVE NOT EXITED**
  const activeVisitors = visitors.filter((visitor) => visitor.entry && !visitor.exit_at);

  return (
    <Widget>
      <Header>
        <WidgetTitle>Visitantes Ativos</WidgetTitle>
        <OpenButton onClick={openCreationModal}>+ Visitante</OpenButton>
      </Header>

      {activeVisitors.length > 0 ? (
        <VisitorList>
          {activeVisitors.map((visitor) => (
            <VisitorItem key={visitor.id} onClick={() => handleVisitorClick(visitor)}>
              <VisitorImage
                src={visitor.image_base64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(visitor.name)}`}
                alt={`${visitor.name}'s avatar`}
              />
              <VisitorDetails>
                <VisitorName>{visitor.name || "N/A"}</VisitorName>
                <UnitDetails>Unidade {visitor.apartment_number || "N/A"}</UnitDetails>
                <EntryDate>Entrada: {new Date(visitor.entry).toLocaleDateString("pt-BR")}</EntryDate>
              </VisitorDetails>
              <ChevronIcon>➔</ChevronIcon>
            </VisitorItem>
          ))}
        </VisitorList>
      ) : (
        <NoVisitorsText>Nenhum visitante atualmente no condomínio</NoVisitorsText>
      )}

      {/* Creation Modal */}
      {isCreationModalOpen && (
        <VisitorCreationModal
          onClose={closeCreationModal}
          fetchVisitors={fetchVisitors}
          selectedCondominium={selectedCondominium}
          apartments={apartments}
        />
      )}

      {/* Edit Modal */}
      {selectedVisitor && (
        <VisitorEditModal
          visitor={selectedVisitor}
          onClose={closeEditModal}
          fetchVisitors={fetchVisitors}
          selectedCondominium={selectedCondominium}
        />
      )}
    </Widget>
  );
};

export default VisitorsWidget;
