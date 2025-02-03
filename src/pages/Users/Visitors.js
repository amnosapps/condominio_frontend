import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaPhoneAlt, FaCalendarAlt, FaRegCalendarAlt } from "react-icons/fa";
import VisitorCreationModal from "../../components/Users/Visitors/VisitorCreationModal";
import VisitorEditModal from "../../components/Users/Visitors/VisitorEditModal";

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 98%;
  background: #f9f9f9;
  font-family: "Roboto", sans-serif;
  padding: 20px;
`;

const CreateButton = styled.button`
  margin-left: 10px;
  background: #f46600;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background: rgb(255, 135, 50);
  }
`;

const FiltersRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  width: 300px;
`;

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
`;

const VisitorCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 200px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px 25px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const VisitorName = styled.h3`
  font-size: 18px;
  color: #333;
  margin-bottom: 5px;
`;

const VisitorInfo = styled.p`
  font-size: 14px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #f46600;
  }
`;

const NoVisitorsMessage = styled.div`
  margin-top: 20px;
  font-size: 16px;
  color: #777;
  text-align: center;
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  background-color: ${(props) => (props.color ? props.color : '#F46600')};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-right: 15px;
`;

// Mock Data
const mockVisitors = [
  {
    id: 1,
    name: "John Doe",
    visit_date: "2025-01-20",
    unit_number: "101",
    phone: "(555) 123-4567",
  },
  {
    id: 2,
    name: "Jane Smith",
    visit_date: "2025-01-21",
    unit_number: "102",
    phone: "(555) 987-6543",
  },
  {
    id: 3,
    name: "Michael Johnson",
    visit_date: "2025-01-22",
    unit_number: "203",
    phone: "(555) 456-7890",
  },
];

const VisitorsPage = ({ profile }) => {
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Use mock data for this example
    setVisitors(mockVisitors);
    setFilteredVisitors(mockVisitors);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setFilteredVisitors(visitors);
    } else {
      const filtered = visitors.filter((visitor) =>
        visitor.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredVisitors(filtered);
    }
  };

  const handleVisitorClick = (visitor) => {
    setSelectedVisitor(visitor);
    setIsEditModalOpen(true);
  };

  const toggleCreationModal = () => setIsCreationModalOpen(!isCreationModalOpen);

  const toggleEditModal = () => {
    setSelectedVisitor(null);
    setIsEditModalOpen(false);
  };

  return (
    <Container>
      {/* Filters */}
      <FiltersRow>
        <SearchInput
          placeholder="Buscar Visitante"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <CreateButton onClick={toggleCreationModal}>+ Visitante</CreateButton>
      </FiltersRow>

      {/* Visitors List */}
      {filteredVisitors.length > 0 ? (
        <CardContainer>
          {filteredVisitors.map((visitor) => (
            <VisitorCard key={visitor.id} onClick={() => handleVisitorClick(visitor)}>
              <div>
                <Avatar>
                    {visitor.avatar ? (
                        <img src={visitor.avatar} alt={visitor.name} />
                    ) : (
                        visitor.name?.charAt(0).toUpperCase() || '?'
                    )}
                </Avatar>
                <VisitorName>{visitor.name}</VisitorName>
                <VisitorInfo>
                  <FaRegCalendarAlt />
                  {new Date(visitor.visit_date).toLocaleDateString()}
                </VisitorInfo>
                <VisitorInfo>
                  <FaPhoneAlt />
                  {visitor.phone}
                </VisitorInfo>
                <VisitorInfo>Unidade: {visitor.unit_number}</VisitorInfo>
              </div>
            </VisitorCard>
          ))}
        </CardContainer>
      ) : (
        <NoVisitorsMessage>Nenhum visitante encontrado.</NoVisitorsMessage>
      )}

      {/* Visitor Creation Modal */}
      {isCreationModalOpen && (
        <VisitorCreationModal
          onClose={toggleCreationModal}
          fetchVisitors={() => setVisitors(mockVisitors)} // Update with actual API call
        />
      )}

      {/* Visitor Edit Modal */}
      {isEditModalOpen && (
        <VisitorEditModal
          visitor={selectedVisitor}
          onClose={toggleEditModal}
          fetchVisitors={() => setVisitors(mockVisitors)} // Update with actual API call
        />
      )}
    </Container>
  );
};

export default VisitorsPage;
