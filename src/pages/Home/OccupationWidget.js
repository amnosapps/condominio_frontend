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
  max-height: 270px;
`;

const WidgetTitle = styled.h3`
  font-size: 18px;
  color: #1f2937;
  font-weight: 700;
  margin-bottom: 20px;
`;

const ChartWrapper = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
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
  flex-direction: row;
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

// ApartmentOccupation Component
const ApartmentOccupation = ({ apartments }) => {
  // Calculate totals based on apartment statuses
  const totalAvailable = apartments.filter((apt) => apt.status === 0).length;
  const totalOccupied = apartments.filter((apt) => apt.status === 1).length;
  const totalMaintenance = apartments.filter((apt) => apt.status === 2).length;
  const total = totalOccupied + totalAvailable + totalMaintenance;

  // Chart Data
  const pieData = {
    labels: ["Ocupado", "Disponível", "Manuntenção"],
    datasets: [
      {
        data: [totalOccupied, totalAvailable, totalMaintenance],
        backgroundColor: ["#FF9800", "#2196F3", "#BDBDBD"], // Azul, Cinza, Laranja
        hoverBackgroundColor: ["#FB8C00", "#1E88E5", "#9E9E9E"], // Darker shades
        borderWidth: 0,
      },
    ],
  };

  return (
    <Widget>
      <WidgetTitle>Apartamentos</WidgetTitle>
      <ChartWrapper>
        <Pie
          data={pieData}
          options={{
            plugins: {
              tooltip: {
                enabled: true,
                callbacks: {
                  label: function (tooltipItem) {
                    const value = tooltipItem.raw; // Gets the value for the hovered segment
                    const label = tooltipItem.label; // Gets the label for the hovered segment
                    return `${label}: ${value}`;
                  },
                },
              },
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
