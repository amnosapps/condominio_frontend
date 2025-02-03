import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Doughnut, Bar } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  getYear,
  getMonth,
} from "date-fns";
import LoadingSpinner from "./utils/loader";
import api from "../services/api";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

// Styled Components
const ReportContainer = styled.div`
  padding: 2rem;
  font-family: Arial, sans-serif;
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const StatsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: space-around;
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const StatCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: calc(33% - 2rem);
  min-width: 200px;
  flex: 1;

  @media (max-width: 768px) {
    width: calc(50% - 1rem);
    padding: 1rem;
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 0.8rem;
  }
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #343a40;
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: #6c757d;
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ChartContainer = styled.div`
  width: 80%;
  margin: 2rem auto;
  text-align: center;

  @media (max-width: 768px) {
    width: 95%;
    margin: 1.5rem auto;
  }
`;

const YearNavigation = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 1rem;

  button {
    background-color: #f46600;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #0056b3;
    }

    &:disabled {
      background-color: #d6d6d6;
      cursor: not-allowed;
    }
  }

  span {
    font-size: 1.2rem;
    font-weight: bold;
    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
`;

const ViewSelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 2rem;

  button {
    background-color: #f46600;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #0056b3;
    }

    &.active {
      background-color: #0056b3;
      font-weight: bold;
    }

    @media (max-width: 768px) {
      padding: 6px 10px;
      font-size: 0.9rem;
    }
  }
`;

const OccupationTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const TableHeader = styled.th`
  background-color: #f46600;
  color: white;
  padding: 10px;
  border: 1px solid #dee2e6;
  text-align: left;

  @media (max-width: 768px) {
    padding: 8px;
  }
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  border: 1px solid #dee2e6;

  @media (max-width: 768px) {
    padding: 8px;
  }
`;

const OccupationSection = styled.div`
  margin-top: 3rem;
  text-align: center;

  @media (max-width: 768px) {
    margin-top: 2rem;
  }
`;

function CondominiumReport({ condominium }) {
  const params = useParams();
  const selectedCondominium = condominium || params.condominium;

  const [reservations, setReservations] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState("today");

  useEffect(() => {
    const fetchReservations = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await api.get(
          `/api/reservations/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { condominium: selectedCondominium },
          }
        );
        setReservations(response.data);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    const fetchApartments = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await api.get(
          `/api/apartments/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { condominium: selectedCondominium },
          }
        );
        setApartments(response.data);
      } catch (error) {
        console.error("Error fetching apartments:", error);
      }
    };

    const fetchData = async () => {
      await Promise.all([fetchReservations(), fetchApartments()]);
      setLoading(false);
    };

    if (selectedCondominium) {
      fetchData();
    }
  }, [selectedCondominium]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const filterReservationsByDateRange = (start, end) => {
    return reservations.filter((reservation) => {
      const checkin = reservation.checkin ? parseISO(reservation.checkin) : null;
      return checkin && isWithinInterval(checkin, { start, end });
    });
  };

  const getStats = () => {
    const now = new Date();
    let filteredReservations = [];
    let dateRange = {};

    switch (viewMode) {
      case "today":
        dateRange = { start: startOfDay(now), end: endOfDay(now) };
        break;
      case "week":
        dateRange = { start: startOfWeek(now), end: endOfWeek(now) };
        break;
      case "month":
        dateRange = { start: startOfMonth(now), end: endOfMonth(now) };
        break;
      default:
        dateRange = { start: startOfDay(now), end: endOfDay(now) };
    }

    filteredReservations = filterReservationsByDateRange(
      dateRange.start,
      dateRange.end
    );

    const totalPeople = filteredReservations.reduce(
      (sum, reservation) => sum + (reservation.additional_guests.length + 1),
      0
    );

    const vacantApartments =
      apartments.length - filteredReservations.filter((reservation) =>
        apartments.some(
          (apartment) => apartment.number === reservation.apartment
        )
      ).length;

    return { totalPeople, vacantApartments };
  };

  const getOccupationData = () => {
    const now = new Date();
    let dateRange;

    switch (viewMode) {
      case "today":
        dateRange = { start: startOfDay(now), end: endOfDay(now) };
        break;
      case "week":
        dateRange = { start: startOfWeek(now), end: endOfWeek(now) };
        break;
      case "month":
        dateRange = { start: startOfMonth(now), end: endOfMonth(now) };
        break;
      default:
        dateRange = { start: startOfDay(now), end: endOfDay(now) };
    }

    const filteredReservations = filterReservationsByDateRange(
      dateRange.start,
      dateRange.end
    );

    return apartments
      .filter((apartment) => apartment.type_name === "Temporada") // Filter by "Temporada"
      .map((apartment) => {
        const relatedReservations = filteredReservations.filter(
          (reservation) => reservation.apartment === apartment.id
        );

        const totalGuests = relatedReservations.reduce(
          (sum, reservation) => sum + (reservation.additional_guests.length + 1),
          0
        );

        const totalDaysOccupied = relatedReservations.reduce((sum, reservation) => {
          const checkin = reservation.checkin ? parseISO(reservation.checkin) : null;
          const checkout = reservation.checkout
            ? parseISO(reservation.checkout)
            : null;

          if (checkin && checkout) {
            const overlapStart = checkin > dateRange.start ? checkin : dateRange.start;
            const overlapEnd = checkout < dateRange.end ? checkout : dateRange.end;

            if (
              isWithinInterval(overlapStart, { start: dateRange.start, end: dateRange.end }) ||
              isWithinInterval(overlapEnd, { start: dateRange.start, end: dateRange.end })
            ) {
              const occupiedDays = Math.ceil(
                (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)
              );
              return sum + occupiedDays;
            }
          }
          return sum;
        }, 0);

        return {
          apartment: apartment.number,
          status: relatedReservations.length > 0 ? "Ocupado" : "Livre",
          guests: totalGuests,
          daysOccupied: totalDaysOccupied,
        };
      });
  };

  const occupationData = getOccupationData();

  const { totalPeople, vacantApartments } = getStats();
  const totalApartments = apartments.length;
  const maintenanceApartments = apartments.filter(
    (apartment) => apartment.status === 2
  ).length;

  // Stats Calculation
  const occupiedApartments =
    totalApartments - vacantApartments - maintenanceApartments;

  const occupancyData = {
    labels: ["Ocupado", "Livre", "Manuntenção"],
    datasets: [
      {
        data: [occupiedApartments, vacantApartments, maintenanceApartments],
        backgroundColor: ["#36a2eb", "#4caf50", "#ffce56"],
        hoverBackgroundColor: ["#36a2eb", "#4caf50", "#ffce56"],
      },
    ],
  };

  // Group Reservations by Month for the Selected Year
  const reservationsByMonth = Array(12).fill(0);

  reservations.forEach((reservation) => {
    const checkinDate = reservation.checkin ? parseISO(reservation.checkin) : null;
    const checkoutDate = reservation.checkout ? parseISO(reservation.checkout) : null;

    if (checkinDate && checkoutDate) {
      const checkinYear = getYear(checkinDate);
      const checkoutYear = getYear(checkoutDate);

      // Iterate over all months in the selected year
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(selectedYear, month, 1);
        const monthEnd = new Date(selectedYear, month + 1, 0); // Last day of the month

        // Check if reservation overlaps with the current month
        const overlapsMonth =
          (checkinDate <= monthEnd && checkinDate >= monthStart) || // Check-in during the month
          (checkoutDate >= monthStart && checkoutDate <= monthEnd) || // Check-out during the month
          (checkinDate <= monthStart && checkoutDate >= monthEnd); // Spans the entire month

        if (overlapsMonth) {
          reservationsByMonth[month] += 1; // Count this reservation for the month
        }
      }
    }
  });

  // Add residents to monthly guests count
  apartments
    .filter((apartment) => apartment.type_name === "Moradia")
    .forEach((apartment) => {
      if (apartment.residents?.length) {
        apartment.residents.forEach(() => {
          reservationsByMonth.forEach((_, month) => {
            reservationsByMonth[month] += 1; // Add 1 for each resident
          });
        });
      }
    });

  const guestsByMonthData = {
    labels: [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],
    datasets: [
      {
        label: `Hóspedes por mês (${selectedYear})`,
        data: reservationsByMonth,
        backgroundColor: "#007bff",
        borderColor: "#0056b3",
        borderWidth: 1,
      },
    ],
  };

  return (
    <ReportContainer>
      {/* View Selector */}
      <ViewSelector>
        <button
          onClick={() => setViewMode("today")}
          className={viewMode === "today" ? "active" : ""}
        >
          Hoje
        </button>
        <button
          onClick={() => setViewMode("week")}
          className={viewMode === "week" ? "active" : ""}
        >
          Essa Semana
        </button>
        <button
          onClick={() => setViewMode("month")}
          className={viewMode === "month" ? "active" : ""}
        >
          Esse Mês
        </button>
      </ViewSelector>

      {/* Stats and Table */}
      <StatsGrid>
        <StatCard>
          <StatNumber>{totalPeople}</StatNumber>
          <StatLabel>Pessoas Alocadas</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{totalApartments}</StatNumber>
          <StatLabel>Total de Apartamentos</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{vacantApartments}</StatNumber>
          <StatLabel>Apartamentos Livres</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{maintenanceApartments}</StatNumber>
          <StatLabel>Apartamentos em Manuntenção</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Occupation Section */}
      <OccupationSection>
        <h3>Ocupação por temporada</h3>
        <OccupationTable>
          <thead>
            <tr>
              <TableHeader>Apartamento</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Hóspedes</TableHeader>
              <TableHeader>Dias Ocupados</TableHeader>
            </tr>
          </thead>
          <tbody>
            {occupationData.map((data, index) => (
              <TableRow key={index}>
                <TableCell>{data.apartment}</TableCell>
                <TableCell>{data.status}</TableCell>
                <TableCell>{data.guests}</TableCell>
                <TableCell>{data.daysOccupied}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </OccupationTable>
      </OccupationSection>

      {/* Guests by Month Section */}
      <ChartContainer>
        <h3>Ocupação Total mês/mês</h3>
        <Bar
          data={guestsByMonthData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }}
        />
      </ChartContainer>
    </ReportContainer>
  );
}

export default CondominiumReport;

