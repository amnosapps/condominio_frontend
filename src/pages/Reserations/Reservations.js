import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import { FaRegCalendarAlt } from "react-icons/fa";
import ReservationModal from "../../components/ReservationModal";
import ReservationCreationModal from "../../components/Reservation/ReservationCreation";

import { MdWarning } from "react-icons/md"; // Warning icon for alerts

import {
  format,
} from "date-fns";

import { ptBR  } from "date-fns/locale"; 
import api from "../../services/api";

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 98%;
  background: #f9f9f9;
  font-family: 'Roboto', sans-serif;
  padding: 20px; /* Added margin */
`;

const CreateButton = styled.button`
  margin-left: 10px;
  background: #F46600;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background:rgb(255, 135, 50);
  }
`;

const NavButton = styled.button`
    color: ${(props) => (props.active ? '#F46600' : '#737373')};
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s;
    background: none;
    border: none;
    align-items: center;
    gap: 10px;

    &:hover {
        color: #F46600;
        cursor: pointer;
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

const Tab = styled.button`
  background: ${(props) => (props.active ? "#e6f7ff" : "transparent")};
  color: ${(props) => (props.active ? "#0056d2" : "#555")};
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background: ${(props) => (props.active ? "#e6f7ff" : "#f5f5f5")};
  }
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const TableContainer = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse; /* Prevent spacing between table cells */
  table-layout: fixed; /* Make column widths consistent */
`;

const TableHeader = styled.thead`
  background: #f1f1f1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  th {
    text-align: center; /* Center-align */
    padding: 12px; /* Ensure consistent padding */
    font-size: 14px;
    color: #555;
    border-bottom: 1px solid #e5e5e5;
    box-sizing: border-box; /* Include padding in element width */
  }
`;

const TableBody = styled.tbody`
  td {
    text-align: center; /* Match header alignment */
    padding: 12px; /* Match padding with header */
    font-size: 14px;
    color: #333;
    border-bottom: 1px solid #e5e5e5;
    box-sizing: border-box; /* Include padding in element width */

    &:last-child {
      text-align: center;
    }
  }
`;

const Badge = styled.span`
  background: ${(props) =>
    props.status === "In Progress"
      ? "#4caf50" // Green for "In Progress"
      : props.status === "Completed"
      ? "#2196f3" // Blue for "Completed"
      : props.status === "Canceled"
      ? "#f44336" // Red for "Canceled"
      : "#ff9800"}; // Orange for "Pending"
  color: white;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase; /* Ensures consistent uppercase styling */
`;

const ReservationRow = styled.tr`
  cursor: pointer;
  &:hover {
    background: #f9f9f9;
  }
`;

const ProfileCell = styled.div`
  display: flex;
  align-items: center;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px 1px;
  /* background: #fff; */
  /* border-bottom: 1px solid #e5e5e5; */
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 15px;
  border-radius: 8px;
  background: ${(props) => props.bgColor || "#f5f5f5"};
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
`;

const StatValue = styled.div`
  font-size: 22px;
  font-weight: bold;
  color: ${(props) => props.color || "#333"};
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #777;
`;

const DatePickerContainer = styled.div`
  position: relative;

  .react-datepicker {
    position: absolute;
    top: -30px;
    left: -10px;
    z-index: 200;
  }
`;

const AlertContainer = styled.div`
  background: #ffebee; /* Light red background */
  border-left: 5px solid #d32f2f; /* Dark red border */
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AlertItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #d32f2f;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const WarningIcon = styled(MdWarning)`
  color: #d32f2f;
  font-size: 20px;
`;


// Main Component
const ReservationsPage = ({ profile }) => {
  const params = useParams();
  const selectedCondominium = params.condominium;
  const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
  });

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [FilteredApartments, setFilteredApartments] = useState([]);
  const [filterType, setFilterType] = useState("Todos");

  const [searchTerm, setSearchTerm] = useState("");

  const [pendingActions, setPendingActions] = useState([]);
  
  const handleReservationClick = (reservation) => {
    setSelectedReservation(reservation);
  };

  const closeModal = () => {
    setSelectedReservation(null);
  };

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await api.get(`/api/reservations/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          condominium: selectedCondominium,
          start_date: selectedDateRange.startDate.toISOString(),
          end_date: selectedDateRange.endDate.toISOString(),
        },
      });
  
      identifyPendingActions(response.data);
  
      const updatedReservations = response.data.map((res) => {
        const pending = pendingActions.find((p) => p.id === res.id);
        return pending ? { ...res, pendingStatus: pending.pendingStatus } : res;
      });
  
      setReservations(updatedReservations);
      applyFilter("All", updatedReservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const identifyPendingActions = (data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for comparison
  
    const noExitReservations = data
      .filter((res) =>
        new Date(res.checkout) <= today && 
        !res.checkout_at &&
        res.checkin_at && res.active
      )
      .map((res) => ({ ...res, pendingStatus: "NoExit" })); // Mark as NoExit
  
    const noShowReservations = data
      .filter((res) =>
        new Date(res.checkin) < today && 
        !res.checkin_at && 
        res.active
      )
      .map((res) => ({ ...res, pendingStatus: "NoShow" })); // Mark as NoShow
  
    const pending = [...noExitReservations, ...noShowReservations];
  
    setPendingActions(pending);
  };

  const applyFilter = (filterType, data = reservations) => {
    let filtered;
  
    if (filterType === "Current") {
      filtered = data.filter((res) => res.checkin_at && !res.checkout_at);
    } else if (filterType === "Finalizada") {
      filtered = data.filter((res) => res.checkin_at && res.checkout_at);
    } else if (filterType === "All") {
      filtered = data;
    } else if (filterType === "Future") {
      filtered = data.filter((res) => !res.checkin_at && !res.checkout_at);
    } else if (filterType === "Canceled") {
      filtered = data.filter((res) => !res.active);
    } else if (filterType === "Pending") {
      filtered = pendingActions; // Use pending reservations
    }
  
    // Apply search term filter for both guest name and apto (Apartment Number)
    if (searchTerm) {
      filtered = filtered.filter(
        (res) =>
          res.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          res.apt_number.toString().includes(searchTerm)
      );
    }
  
    setFilteredReservations(filtered);
    setActiveTab(filterType);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  
    let filtered = reservations;
  
    if (value.trim() !== "") {
      filtered = reservations.filter((res) => {
        if (filterType === "name") {
          return res.guest_name.toLowerCase().includes(value.toLowerCase());
        } else if (filterType === "apartment") {
          return res.apt_number.toString().includes(value);
        } else if (filterType === "reservation") {
          return res.id.toString().includes(value);
        }
        return false;
      });
    }
  
    setFilteredReservations(filtered);
  };

  const handleDateRangeChange = (dates) => {
    const [startDate, endDate] = dates;
    setSelectedDateRange({ startDate, endDate });
    if (startDate && endDate) {
      fetchReservations(); // Refetch reservations with the new date range
    }
  };

  const fetchApartments = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await api.get(`/api/apartments/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { condominium: selectedCondominium },
      });

      
      const filteredApartments = response.data.filter((apartment) =>
        filterType === "Todos" ? true : apartment.type_name === filterType
    );
    
        setApartments(response.data)
        setFilteredApartments(filteredApartments);
    } catch (error) {
      console.error("Error fetching apartments:", error);
    }
  };

  useEffect(() => {
      fetchReservations();
      fetchApartments();
    }, [selectedDateRange]);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  console.log(profile)

  return (
    <Container>
      {/* Header */}
      <StatsContainer>
        <StatCard bgColor="#e3f2fd"> {/* Soft Light Blue for "Total" */}
          <StatValue color="#1e88e5">{reservations.length}</StatValue> {/* Medium Blue for contrast */}
          <StatLabel>Total</StatLabel>
        </StatCard>
        <StatCard bgColor="#e3f2fd"> {/* Soft Light Blue for "Total" */}
          <StatValue color="#1e88e5">
            {reservations.filter((res) => res.checkin_at && res.checkout_at).length}
          </StatValue> {/* Medium Blue for contrast */}
          <StatLabel>Finalizadas</StatLabel>
        </StatCard>
        <StatCard bgColor="#e8f5e9"> {/* Soft Light Green for "Em Curso" */}
          <StatValue color="#43a047">
            {reservations.filter((res) => res.checkin_at && !res.checkout_at).length}
          </StatValue> {/* Medium Green */}
          <StatLabel>Em Curso</StatLabel>
        </StatCard>
        <StatCard bgColor="#fff3e0"> {/* Soft Light Orange for "Previstas" */}
          <StatValue color="#fb8c00">
            {reservations.filter((res) => !res.checkin_at && !res.checkout_at).length}
          </StatValue> {/* Medium Orange */}
          <StatLabel>Previstas</StatLabel>
        </StatCard>
        <StatCard bgColor="#ffebee"> {/* Soft Light Red for "Canceladas" */}
          <StatValue color="#e53935">
            {reservations.filter((res) => !res.active).length}
          </StatValue> {/* Medium Red */}
          <StatLabel>Canceladas</StatLabel>
        </StatCard>
      </StatsContainer>

      {/* Filters */}
      <FiltersRow>
        <div>
            <Tab onClick={() => setShowDatePicker((prev) => !prev)} style={{ alignContent: 'center', fontSize: '14px' }}>
                <FaRegCalendarAlt />
                <span style={{ cursor: 'pointer', marginLeft: '10px' }}>{`${format(selectedDateRange.startDate, "dd MMM yyyy", { locale: ptBR  })} - ${format(selectedDateRange.endDate, "dd MMM yyyy", { locale: ptBR  })}`}</span>
            </Tab>
            <Tab active={activeTab === "All"} onClick={() => applyFilter("All")}>
                Todas Reservas
            </Tab>
            <Tab active={activeTab === "Pending"} onClick={() => applyFilter("Pending")}>
              Pendentes {pendingActions.length > 0 && `(${pendingActions.length})`}
            </Tab>
            <Tab active={activeTab === "Finalizada"} onClick={() => applyFilter("Finalizada")}>
              Finalizadas
            </Tab>
            <Tab active={activeTab === "Current"} onClick={() => applyFilter("Current")}>
                Em Curso
            </Tab>
            <Tab active={activeTab === "Future"} onClick={() => applyFilter("Future")}>
                Previstas
            </Tab>
            <Tab active={activeTab === "Canceled"} onClick={() => applyFilter("Canceled")}>
                Canceladas
            </Tab>
        </div>
        <div>
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
              <option value="name">Nome</option>
              <option value="apartment">Apto</option>
              <option value="reservation">Reserva</option>
            </select>

            <SearchInput
              placeholder={
                filterType === "name"
                  ? "Buscar Hóspede"
                  : filterType === "apartment"
                  ? "Buscar Apto"
                  : "Buscar Reserva"
              }
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <CreateButton onClick={toggleModal}>
          + Reserva
        </CreateButton>
      </FiltersRow>

      {/* Date Picker */}
      <DatePickerContainer>
      {showDatePicker && (
        <DatePicker
          selected={selectedDateRange.startDate}
          onChange={handleDateRangeChange}
          startDate={selectedDateRange.startDate}
          endDate={selectedDateRange.endDate}
          selectsRange
          inline
          dateFormat="dd/MM/yyyy"
          locale="pt-BR"
        />
      )}
      </DatePickerContainer>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <th>Apto</th>
              <th>Reserva</th>
              <th>Hóspede</th>
              <th>Estadia</th>
              <th>Ocupantes</th>
              <th>Status</th>
            </tr>
          </TableHeader>
          <TableBody>
            {filteredReservations.map((reservation) => (
              <ReservationRow key={reservation.id} onClick={() => handleReservationClick(reservation)}>
                
                <td>{reservation.apt_number}</td>
                <td>#{reservation.id}</td>
                
                <td>
                  <ProfileCell>
                    <ProfileImage
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        reservation.guest_name
                      )}`}
                      alt={`${reservation.guest_name}`}
                    />
                    {reservation.guest_name}
                  </ProfileCell>
                </td>
                <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <span>{new Date(reservation.checkin).toLocaleDateString("pt-BR")}</span>
                        <div style={{ flexGrow: 1, height: '1px', backgroundColor: '#ccc' }}></div>
                        <span>{new Date(reservation.checkout).toLocaleDateString("pt-BR")}</span>
                    </div>
                </td>
                <td>{(reservation.guests_qty || 0) + 1}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {/* Show Pending Badge for NoShow or NoExit */}
                    {reservation.pendingStatus === "NoExit" && (
                      <Badge status="Canceled" style={{ background: "#d32f2f" }}>
                        NoExit
                      </Badge>
                    )}
                    {reservation.pendingStatus === "NoShow" && (
                      <Badge status="Canceled" style={{ background: "#f57c00" }}>
                        NoShow
                      </Badge>
                    )}

                    <Badge
                      status={
                        !reservation.active
                          ? "Canceled"
                          : reservation.checkin_at && !reservation.checkout_at
                          ? "In Progress"
                          : reservation.checkin_at && reservation.checkout_at
                          ? "Completed"
                          : "Pending"
                      }
                    >
                      {!reservation.active
                        ? "Cancelada"
                        : reservation.checkin_at && !reservation.checkout_at
                        ? "Em Curso"
                        : reservation.checkin_at && reservation.checkout_at
                        ? "Finalizada"
                        : "Prevista"}
                    </Badge>
                    
                  </div>
                </td>
              </ReservationRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedReservation && (
         <ReservationModal
          closeModal={closeModal}
          selectedReservation={selectedReservation}
          fetchReservations={fetchReservations}
          selectedCondominium={selectedCondominium}
          profile={profile}
        />
      )}

      {isModalOpen && (
        <ReservationCreationModal
          onClose={toggleModal}
          fetchReservations={fetchReservations}
          apartments={FilteredApartments}
        />
      )}
    </Container>
  );
};

export default ReservationsPage;
