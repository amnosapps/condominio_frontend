import React from "react";
import { Line } from "react-chartjs-2";

const normalizeDate = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0); // Normalize to midnight
  return normalized;
};

// Generate Line Chart Data
const generateLineChartData = (reservations) => {
  const currentDate = new Date(); // Get current date
  const weekDates = Array(7)
    .fill(null)
    .map((_, index) => {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - currentDate.getDay() + index); // Get date for each day of the current week
      return normalizeDate(date);
    });

  // Create labels with both day name and date
  const labels = weekDates.map(
    (date, index) =>
      `${["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"][index]} ${date
        .toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        })
        .replace("/", "-")}`
  );

  // Function to calculate total guests for a specific day
  const getTotalGuestsForDay = (day) => {
    return reservations
      .filter(
        (reservation) =>
          normalizeDate(day) >= normalizeDate(reservation.checkin) &&
          normalizeDate(day) <= normalizeDate(reservation.checkout)
      )
      .reduce(
        (totalGuests, reservation) =>
          totalGuests + (reservation.guests_qty + 1), // Total guests including guest count
        0
      );
  };

  // Generate guests data using the function
  const guestsData = weekDates.map((date) => getTotalGuestsForDay(date));

  return {
    labels,
    datasets: [
      {
        label: "Hóspedes",
        data: guestsData,
        borderColor: "#2196F3",
        backgroundColor: "rgba(33, 150, 243, 0.2)",
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#2196F3",
      },
    ],
  };
};

// LineChart Component
const LineChart = ({ reservations }) => {
  const lineChartData = generateLineChartData(reservations);

  return (
    <Line
      data={lineChartData}
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
  );
};

export default LineChart;
