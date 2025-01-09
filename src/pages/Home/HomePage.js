import React from "react";
import styled from "styled-components";
import { Line, Pie } from "react-chartjs-2";
import "chart.js/auto";

// Styled Components
const Container = styled.div`
  padding: 20px;
  background-color: #f9f9f9;
  min-height: 100vh;
  font-family: "Roboto", sans-serif;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  display: grid;
  grid-template-rows: auto;
  gap: 20px;
`;

const Widget = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const WidgetTitle = styled.h3`
  font-size: 16px;
  color: #333;
  font-weight: 600;
  margin-bottom: 10px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

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
  height: 200px;
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

// Mock Data
const MOCK_RESERVATIONS = [
  { id: 1, guest: "Jennifer Lopes", room: "Room 23B", dates: "17 Aug - 19 Aug" },
  { id: 2, guest: "Benjamin", room: "Room 22A", dates: "18 Aug - 19 Aug" },
  { id: 3, guest: "Lugatio Anderson", room: "Room 25A", dates: "20 Aug - 22 Aug" },
];

const MOCK_VISITORS = [
  { id: 1, name: "Agatasya", schedule: "06:00 AM - 05:00 PM" },
  { id: 2, name: "Jessica Jane", schedule: "06:00 AM - 05:00 PM" },
  { id: 3, name: "Umar Heru", schedule: "06:00 AM - 05:00 PM" },
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
      label: "Guests",
      data: [5, 8, 10, 4, 7, 9, 6],
      fill: false,
      borderColor: "#4CAF50",
      tension: 0.1,
    },
  ],
};

// Component
const Dashboard = () => {
  return (
    <Container>
      <DashboardGrid>
        <Column>
            
            <Widget>
                <WidgetTitle>Guests Overview</WidgetTitle>
                <Line data={MOCK_GUESTS_DATA} />
            </Widget>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                }}
            >
                <Widget>
                    <WidgetTitle>Reservations Today</WidgetTitle>
                    <Table>
                    <thead>
                        <tr>
                        <th>Guest</th>
                        <th>Room</th>
                        <th>Dates</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_RESERVATIONS.map((res) => (
                        <tr key={res.id}>
                            <td>{res.guest}</td>
                            <td>{res.room}</td>
                            <td>{res.dates}</td>
                        </tr>
                        ))}
                    </tbody>
                    </Table>
                </Widget>

                <Widget>
                    <WidgetTitle>Visitors Today</WidgetTitle>
                    <Table>
                    <thead>
                        <tr>
                        <th>Name</th>
                        <th>Schedule</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_VISITORS.map((visitor) => (
                        <tr key={visitor.id}>
                            <td>{visitor.name}</td>
                            <td>{visitor.schedule}</td>
                        </tr>
                        ))}
                    </tbody>
                    </Table>
                </Widget>
            </div>
        </Column>

        <Column>
            <Widget>
                <WidgetTitle>Apartment Occupation</WidgetTitle>
                <Pie
                data={{
                    labels: ["Occupied", "Available"],
                    datasets: [
                    {
                        data: [MOCK_OVERVIEW.occupied, MOCK_OVERVIEW.available],
                        backgroundColor: ["#4CAF50", "#FFC107"],
                    },
                    ],
                }}
                />
          </Widget>

          {/* Notifications */}
            <Widget>
                <WidgetTitle>Notifications</WidgetTitle>
                <ChatContainer>
                {MOCK_NOTIFICATIONS.map((notif, index) => (
                    <ChatMessage key={index}>{notif.message}</ChatMessage>
                ))}
                </ChatContainer>
            </Widget>
        </Column>
      </DashboardGrid>
    </Container>
  );
};

export default Dashboard;
