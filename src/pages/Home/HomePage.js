import React from "react";
import styled from "styled-components";
import ReservationsWidget from './ReservationsWidget'
import { Line, Pie } from "react-chartjs-2";
import "chart.js/auto";
import VisitorsWidget from "./VisitorsWidget";
import ApartmentOccupation from "./OccupationWidget";

// Styled Components
const Container = styled.div`
    display: flex;
    justify-content: center;
    padding: 20px;
    background-color: #f9f9f9;
    /* max-width: 100vh; */
    /* min-height: 100vh; */
    font-family: "Roboto", sans-serif;
    overflow: auto;
`;

const ChartContainer = styled.div`
  height: 400px; /* Adjust the height as needed */
`;

const DashboardGrid = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 30px;

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

// Mock Data
const MOCK_RESERVATIONS = [
    {
      id: 1,
      guest: "Jennifer Lopes",
      room: "Room 23B",
      dates: "17 Aug - 19 Aug",
      image: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    {
      id: 2,
      guest: "Benjamin",
      room: "Room 22A",
      dates: "18 Aug - 19 Aug",
      image: "https://randomuser.me/api/portraits/men/2.jpg",
    },
    {
      id: 3,
      guest: "Lugatio Anderson",
      room: "Room 25A",
      dates: "20 Aug - 22 Aug",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    {
      id: 4,
      guest: "Lugatio Anderson",
      room: "Room 25A",
      dates: "20 Aug - 22 Aug",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
    },
  ];

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
    { id: 4, label: "Reservas", path: "/reservations", icon: "📅" },
  ];

const MOCK_NOTIFICATIONS = [
  { id: 1, message: "Reservation for Room 23B is pending check-in." },
  { id: 2, message: "Maintenance scheduled for Room 303." },
];

const MOCK_OVERVIEW = {
  occupied: 35,
  available: 15,
};

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

// Component
const Dashboard = () => {
  return (
    <Container>
      <DashboardGrid>
        <Column>

            <div
                style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                alignItems: "stretch",
                }}
            >
                <ReservationsWidget reservations={MOCK_RESERVATIONS} />
                <VisitorsWidget visitors={MOCK_VISITORS} />
            
            </div>
            
            <Widget>
                <WidgetTitle>Ocupação Semana</WidgetTitle>
                <ChartContainer>
                    <Line
                        data={MOCK_GUESTS_DATA}
                        options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                            position: "top",
                            labels: {
                                font: {
                                size: 14,
                                },
                            },
                            },
                            tooltip: {
                            enabled: true,
                            callbacks: {
                                label: (context) => {
                                return `${context.dataset.label}: ${context.raw}`;
                                },
                            },
                            },
                        },
                        scales: {
                            x: {
                            grid: {
                                display: false,
                            },
                            ticks: {
                                font: {
                                size: 12,
                                },
                            },
                            },
                            y: {
                            beginAtZero: true,
                            ticks: {
                                font: {
                                size: 12,
                                },
                            },
                            },
                        },
                        }}
                    />
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
                    onClick={() => (window.location.href = shortcut.path)}
                    >
                    <ShortcutIcon>{shortcut.icon}</ShortcutIcon>
                    <ShortcutText>{shortcut.label}</ShortcutText>
                    </ShortcutItem>
                ))}
                </ShortcutList>
          </Widget>

          <Widget>
            <WidgetTitle>Notifications</WidgetTitle>
            <ChatContainer>
              {MOCK_NOTIFICATIONS.map((notif, index) => (
                <ChatMessage key={index}>{notif.message}</ChatMessage>
              ))}
            </ChatContainer>
          </Widget>

          <ApartmentOccupation />

        </Column>
      </DashboardGrid>
    </Container>
  );
};

export default Dashboard;
