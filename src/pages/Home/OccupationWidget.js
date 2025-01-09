import React from "react";
import styled from "styled-components";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

// Styled Components
const Widget = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const WidgetTitle = styled.h3`
  font-size: 18px;
  color: #1f2937;
  font-weight: 700;
  margin-bottom: 20px;
`;

const ChartWrapper = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
`;

const TotalText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
`;

const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LegendColor = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
`;

const LegendText = styled.span`
  font-size: 14px;
  color: #4b5563;
`;

// Mock Data
const MOCK_OVERVIEW = {
  occupied: 35,
  available: 15,
};

// Chart Data
const pieData = {
  labels: ["Occupied", "Available"],
  datasets: [
    {
      data: [MOCK_OVERVIEW.occupied, MOCK_OVERVIEW.available],
      backgroundColor: ["#4CAF50", "#FFC107"],
      hoverBackgroundColor: ["#45A049", "#FFB300"],
      borderWidth: 0,
    },
  ],
};

const ApartmentOccupation = () => {
  const total = MOCK_OVERVIEW.occupied + MOCK_OVERVIEW.available;

  return (
    <Widget>
      <WidgetTitle>Apartment Occupation</WidgetTitle>
      <ChartWrapper>
        <Pie
          data={pieData}
          options={{
            plugins: {
              tooltip: { enabled: false },
              legend: { display: false },
            },
            cutout: "70%",
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
        <TotalText>{total}</TotalText>
      </ChartWrapper>
      <LegendContainer>
        {pieData.labels.map((label, index) => (
          <LegendItem key={label}>
            <LegendColor color={pieData.datasets[0].backgroundColor[index]} />
            <LegendText>{label}</LegendText>
          </LegendItem>
        ))}
      </LegendContainer>
    </Widget>
  );
};

export default ApartmentOccupation;
