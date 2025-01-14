import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useParams } from "react-router-dom";

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 98%;
  background: #f9f9f9;
  font-family: 'Roboto', sans-serif;
  padding: 20px; /* Added margin */
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 20px; /* Add padding for alignment */
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const HeaderTitle = styled.h1`
  font-size: 22px;
  font-weight: bold;
  color: #333;
`;

const CreateButton = styled.button`
  background: #0056d2;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background: #003a96;
  }
`;

const FiltersRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f5f5;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  background: ${(props) => (props.active ? "#e6f7ff" : "transparent")};
  color: ${(props) => (props.active ? "#0056d2" : "#555")};
  border: none;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse; /* Prevent spacing between table cells */
  table-layout: fixed; /* Make column widths consistent */
`;

const TableHeader = styled.thead`
  background: #f5f5f5;

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
    props.status === "Fulfilled"
      ? "#4caf50"
      : props.status === "Unfulfilled"
      ? "#ff9800"
      : "#e91e63"};
  color: white;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
`;

const ReservationRow = styled.tr`
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
  padding: 20px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 15px;
  border-radius: 8px;
  background: ${(props) => props.bgColor || "#f5f5f5"};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

// Main Component
const ReservationsPage = ({ condominium }) => {
  const params = useParams();
  const selectedCondominium = condominium || params.condominium;
  const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState("Active");

  // Fetch reservations from the API
  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/reservations/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            condominium: selectedCondominium,
            start_date: new Date().toISOString(),
            end_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
          },
        }
      );
      setReservations(response.data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderTitle>Reservas</HeaderTitle>
        <CreateButton>+ Reserva</CreateButton>
      </Header>

      <StatsContainer>
        <StatCard bgColor="#e6f7ff">
          <StatValue color="#0056d2">1046</StatValue>
          <StatLabel>Total</StatLabel>
        </StatCard>
        <StatCard bgColor="#fff7e6">
          <StatValue color="#ff9800">159</StatValue>
          <StatLabel>Em Curso</StatLabel>
        </StatCard>
        <StatCard bgColor="#f3e5f5">
          <StatValue color="#9c27b0">624</StatValue>
          <StatLabel>Futuras</StatLabel>
        </StatCard>
      </StatsContainer>

      {/* Filters */}
      <FiltersRow>
        <div>
          <Tab active={activeTab === "Active"} onClick={() => setActiveTab("Active")}>
            Em Curso
          </Tab>
          <Tab active={activeTab === "Unfulfilled"} onClick={() => setActiveTab("Unfulfilled")}>
            Futuras
          </Tab>
          <Tab active={activeTab === "All"} onClick={() => setActiveTab("All")}>
            Totas Reservas
          </Tab>
        </div>
        <SearchInput placeholder="Buscar Reserva / Hóspede" />
      </FiltersRow>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <th>ID</th>
              <th>Hóspede</th>
              <th>Checkin</th>
              <th>Checkout</th>
              <th>Acompanhantes</th>
              <th>Status</th>
            </tr>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <ReservationRow key={reservation.id}>
                <td>{reservation.id}</td>
                
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
                <td>{new Date(reservation.checkin).toLocaleDateString()}</td>
                <td>{new Date(reservation.checkout).toLocaleDateString()}</td>
                <td>{reservation.guests_qty || 0}</td>
                <td>
                  <Badge status="Authorized">Authorized</Badge>
                </td>
              </ReservationRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ReservationsPage;
