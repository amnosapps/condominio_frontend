import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ReservationsWidget from './ReservationsWidget'
import { Line, Pie } from "react-chartjs-2";
import "chart.js/auto";
import VisitorsWidget from "./VisitorsWidget";
import ApartmentOccupation from "./OccupationWidget";
import axios from "axios";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/utils/loader";
import ReservationCreationModal from "../../components/Reservation/ReservationCreation";
import NotificationsWidget from "./NotificationsWidget";
import LineChart from "./LineChart";
import api from "../../services/api";

// Styled Components
const Container = styled.div`
    display: flex;
    justify-content: start;
    padding: 4px 10px;
    padding-bottom: 20px;
    background-color: #f9f9f9;
    max-width: 100%;
    font-family: "Roboto", sans-serif;
    overflow: auto;

    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: #b3b3b3;
    }
`;

const ChartContainer = styled.div`
  height: 400px; /* Adjust the height as needed */
`;

const DashboardGrid = styled.div`
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 20px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const Column = styled.div`
    display: grid;
    grid-template-rows: auto;
    gap: 10px;
`;

const Widget = styled.div`
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const WidgetTitle = styled.h3`
  font-size: 16px;
  color: #333;
  font-weight: 600;
  /* margin-bottom: 10px; */
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: auto;

  th,
  td {
    text-align: left;
    padding: 10px;
    border: 1px solid #ddd;
  }

  th {
    background: #f5f6fa;
    font-weight: 600;
    color: #333;
  }

  td {
    color: #555;
  }
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100px;
  overflow-y: auto;
`;

const ChatMessage = styled.div`
  display: flex;
  align-items: center;
  background: ${(props) => (props.isUser ? "#4CAF50" : "#f5f5f5")};
  color: ${(props) => (props.isUser ? "#fff" : "#333")};
  padding: 10px;
  border-radius: 10px;
  max-width: 70%;
  margin-left: ${(props) => (props.isUser ? "auto" : "0")};
`;

const ShortcutList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
`;

const ShortcutItem = styled.div`
  background: white;
  color: #333;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px solid #ffa726;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ShortcutIcon = styled.span`
  font-size: 24px;
  margin-bottom: 10px;
  color: #ffa726;
`;

const ShortcutText = styled.span`
  font-size: 12px;
  font-weight: 500;
  text-align: center;
`;

const MOCK_VISITORS = [
  { id: 1, name: "Agatasya", schedule: "06:00 AM - 05:00 PM" },
  { id: 2, name: "Jessica Jane", schedule: "06:00 AM - 05:00 PM" },
  { id: 3, name: "Umar Heru", schedule: "06:00 AM - 05:00 PM" },
  { id: 4, name: "Umar Heru", schedule: "06:00 AM - 05:00 PM" },
];

const MOCK_SHORTCUTS = [
    { id: 1, label: "Apartamentos", path: "/apartments", icon: "🏠" },
    { id: 2, label: "Relatórios", path: "/reports", icon: "📊" },
    { id: 3, label: "Usuários", path: "/users", icon: "👤" },
    { id: 4, label: "Reservas", path: "/occupation", icon: "📅" },
  ];

const MOCK_GUESTS_DATA = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
        {
            label: "Visitantes",
            data: [12, 15, 10, 20, 18, 16, 22],
            borderColor: "#4CAF50",
            backgroundColor: "rgba(76, 175, 80, 0.2)",
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: "#4CAF50",
        },
        {
            label: "Hóspedes",
            data: [8, 10, 12, 5, 7, 9, 6],
            borderColor: "#2196F3",
            backgroundColor: "rgba(33, 150, 243, 0.2)",
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: "#2196F3",
        },
        {
            label: "Moradores",
            data: [5, 6, 8, 4, 3, 7, 5],
            borderColor: "#FF5722",
            backgroundColor: "rgba(255, 87, 34, 0.2)",
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: "#FF5722",
        },
    ],
};

const LoadingText = styled.p`
  font-size: 16px;
  color: #555;
  text-align: center;
`;

// Component
const Dashboard = ({ profile }) => {
    const params = useParams();
    const selectedCondominium = params.condominium;

    const [reservations, setReservations] = useState([]);
    const [apartments, setApartments] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [FilteredApartments, setFilteredApartments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterType, setFilterType] = useState("Temporada");
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const response = await api.get(`/api/notifications/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(response.data);
            const unread = response.data.filter((notif) => !notif.is_read).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

  const fetchReservations = async () => {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await api.get(
            `/api/reservations/`,
            {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    condominium: selectedCondominium, // Replace with actual value
                    start_date: new Date().toISOString(),
                    end_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
                },
            }
        );

        // Remove reservations with checkin_at and sort the rest by nearest check-in date
        const filteredReservations = response.data
            .filter(reservation => !reservation.checkin_at) // Exclude reservations with checkin_at
            .sort((a, b) => {
                const dateA = new Date(a.checkin);
                const dateB = new Date(b.checkin);
                return dateA - dateB; // Sort ascending (nearest date first)
            });

        setReservations(filteredReservations);
    } catch (error) {
        console.error("Error fetching reservations:", error);
    } finally {
        setLoading(false);
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
    fetchApartments()
    fetchNotifications()
  }, []);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <Container>

    {loading ? (
        <LoadingSpinner />
    ) : (
        <DashboardGrid>
            <Column>

                {isModalOpen && (
                    <ReservationCreationModal
                        onClose={toggleModal}
                        fetchReservations={fetchReservations}
                        apartments={FilteredApartments}
                    />
                )}

                <div
                    style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                    alignItems: "stretch",
                    }}
                >
                    
                    <ReservationsWidget 
                        fetchReservations={fetchReservations}
                        selectedCondominium={selectedCondominium}
                        reservations={reservations} onOpen={toggleModal} 
                    />
                    <VisitorsWidget visitors={MOCK_VISITORS} />
                
                </div>
                
                <Widget>
                    <WidgetTitle>Ocupação Semana</WidgetTitle>
                    <ChartContainer>
                        <LineChart reservations={reservations} />
                    </ChartContainer>
                </Widget>
            </Column>

            <Column>
            <Widget>
                <WidgetTitle>Atalhos</WidgetTitle>
                    <ShortcutList>
                    {MOCK_SHORTCUTS.map((shortcut) => (
                        <ShortcutItem
                            key={shortcut.id}
                            onClick={() => {
                            if (selectedCondominium) {
                                const fullPath = `/${selectedCondominium}${shortcut.path}`;
                                window.location.href = fullPath; // Navigate to the constructed path
                            } else {
                                console.error("selectedCondominium is undefined");
                            }
                            }}
                        >
                            <ShortcutIcon>{shortcut.icon}</ShortcutIcon>
                            <ShortcutText>{shortcut.label}</ShortcutText>
                        </ShortcutItem>
                        ))}
                    </ShortcutList>
            </Widget>

            <NotificationsWidget notifications={notifications} setNotifications={setNotifications} />

            <ApartmentOccupation apartments={apartments} />

            </Column>
        </DashboardGrid>
       )}
    </Container>
  );
};

export default Dashboard;
