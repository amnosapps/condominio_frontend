import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaPhoneAlt, FaCalendarAlt, FaRegCalendarAlt } from "react-icons/fa";
import VisitorCreationModal from "../../components/Users/Visitors/VisitorCreationModal";
import VisitorEditModal from "../../components/Users/Visitors/VisitorEditModal";
import axios from "axios";
import { useParams } from "react-router-dom";

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
  flex-wrap: wrap;
  gap: 10px;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  width: 300px;
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
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
  align-items: center;
  justify-content: space-between;
  width: 200px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  opacity: ${(props) => (props.isExited ? "0.6" : "1")};
  filter: ${(props) => (props.isExited ? "grayscale(100%)" : "none")};

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f46600;
  display: block;
  margin: 0 auto;
  margin-bottom: 25px;
`;

const VisitorName = styled.h3`
  font-size: 18px;
  color: #333;
  margin-top: 10px;
  text-align: center;
`;

const VisitorInfo = styled.p`
  font-size: 15px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: start;

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

// Main Component
const VisitorsPage = ({ profile }) => {
  const params = useParams();
  const selectedCondominium = params.condominium;
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Date Filter - Default: Last Week to Today
  const today = new Date().toISOString().split("T")[0];
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const [startDate, setStartDate] = useState(lastWeek.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(today);

  // Fetch visitors from the API
  const fetchVisitors = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/visitors/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { condominium: selectedCondominium },
        }
      );

      let visitorsData = response.data;

      // Filter by date range
      visitorsData = visitorsData.filter(visitor => {
        const entryDate = new Date(visitor.entry).toISOString().split("T")[0];
        return entryDate >= startDate && entryDate <= endDate;
      });

      // Sort visitors: First, those who have entered but not exited
      visitorsData.sort((a, b) => {
        if (!a.exit && b.exit) return -1;
        if (a.exit && !b.exit) return 1;
        return new Date(b.entry) - new Date(a.entry);
      });

      setVisitors(visitorsData);
      setFilteredVisitors(visitorsData);
    } catch (error) {
      console.error("Error fetching visitors:", error);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [startDate, endDate]);

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase().trim();
    setSearchTerm(value);
    console.log("Novo searchTerm:",value);

    if (!value) {
      setFilteredVisitors(visitors);
      return;
    }

    const filtered = visitors.filter((visitor) => {
      const name = visitor.name.toLowerCase();
      const apartment = visitor.apartment_number ? String(visitor.apartment_number).toLowerCase() : "";

      const match =
      filterType === "all"
        ? name.includes(value) || apartment.includes(value)
        : filterType === "apartment"
        ? apartment.includes(value)
        : false;

      console.log(`Checando visitante: ${visitor.name}, Apto: ${visitor.apartment_number}, Match: ${match}`);

      return match;
    });

    console.log("visitantes filtrados:", filtered);
    setFilteredVisitors(filtered);
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
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <select
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "14px",
            backgroundColor: "#fff",
            cursor: "pointer",
          }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="apartment">Apartamento</option>
        </select>

        <SearchInput
          placeholder={
            filterType === "all" ? "Buscar Visitante" : "Buscar Apto"}
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>


        <DateInput
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <DateInput
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <CreateButton onClick={toggleCreationModal}>+ Visitante</CreateButton>
      </FiltersRow>

      {/* Visitors List */}
      {filteredVisitors.length > 0 ? (
      <CardContainer>
        {filteredVisitors
          .filter((visitor) => {
            const name = visitor.name?.toLowerCase() || "";
            const apartment = visitor.apartment_number ? String(visitor.apartment_number).toLowerCase() : "";
            const search = searchTerm.toLowerCase().trim();

            console.log(`Visitante: ${name}, Apto: ${apartment}, Busca: ${search}`);

            if (!search) return true;

            if (filterType === "all") {
              return name.includes(search) || apartment.includes(search);
            } else if (filterType === "apartment") {
              return apartment.includes(search);
            }

            return true;
          })
          .map((visitor) => (
            <VisitorCard
              key={visitor.id}
              isExited={!!visitor.exit}
              onClick={() => handleVisitorClick(visitor)}
            >
              <div>
                {visitor.image_base64 ? (
                  <ProfileImage src={visitor.image_base64} alt="Profile" />
                ) : (
                  <ProfileImage
                    src="https://placehold.co/100x100.png"
                    alt="Escolha uma imagem"
                  />
                )}
                <VisitorName>{visitor.name}</VisitorName>
                <VisitorInfo>
                  <FaRegCalendarAlt />
                  {new Date(visitor.entry).toLocaleString("pt-BR")}
                </VisitorInfo>
                {visitor.exit && (
                  <VisitorInfo>
                    <FaCalendarAlt style={{ color: "red" }} />
                    {new Date(visitor.exit).toLocaleString("pt-BR")}
                  </VisitorInfo>
                )}
                <VisitorInfo>
                  <FaPhoneAlt />
                  {visitor.phone || "N/A"}
                </VisitorInfo>
                <VisitorInfo>
                  Unidade: <strong>{visitor.apartment_number}</strong>
                </VisitorInfo>
              </div>
            </VisitorCard>
          ))}
      </CardContainer>
    ) : (
      <NoVisitorsMessage>Nenhum visitante encontrado.</NoVisitorsMessage>
    )}



      {isCreationModalOpen && <VisitorCreationModal onClose={toggleCreationModal} fetchVisitors={fetchVisitors} selectedCondominium={selectedCondominium} />}
      {isEditModalOpen && <VisitorEditModal visitor={selectedVisitor} onClose={toggleEditModal} fetchVisitors={fetchVisitors} selectedCondominium={selectedCondominium} />}
    </Container>
  );
};

export default VisitorsPage;
