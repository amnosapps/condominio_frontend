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
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: space-around;
`;

const StatCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 200px;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #343a40;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: #6c757d;
`;

const ChartContainer = styled.div`
  width: 80%;
  margin: 2rem auto;
  text-align: center;
`;

const YearNavigation = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 1rem;

  button {
    background-color: #de7066;
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
  }
`;

const ViewSelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 2rem;

  button {
    background-color: #de7066;
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
  }
`;

const OccupationTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
  font-size: 0.9rem;
`;

const TableHeader = styled.th`
  background-color: #de7066;
  color: white;
  padding: 10px;
  border: 1px solid #dee2e6;
  text-align: left;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  border: 1px solid #dee2e6;
`;

const OccupationSection = styled.div`
  margin-top: 3rem;
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
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/reservations/`,
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
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/apartments/`,
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
    return <p>Loading...</p>;
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
      apartments.length -
      filteredReservations.filter((reservation) =>
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
    
        return apartments.map((apartment) => {
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
    
            if (isWithinInterval(overlapStart, { start: dateRange.start, end: dateRange.end }) ||
                isWithinInterval(overlapEnd, { start: dateRange.start, end: dateRange.end })) {
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
    (apartment) => apartment.is_under_maintenance
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
    if (checkinDate && getYear(checkinDate) === selectedYear) {
      const checkinMonth = getMonth(checkinDate);
      reservationsByMonth[checkinMonth] +=
        reservation.additional_guests.length + 1;
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

  const handleYearChange = (direction) => {
    if (direction === "prev") {
      setSelectedYear((prevYear) => prevYear - 1);
    } else if (direction === "next") {
      setSelectedYear((prevYear) => prevYear + 1);
    }
  };

  return (
    <ReportContainer>
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
      <h3>Ocupação por Apartamento</h3>
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

      <OccupationSection>
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
        <h3>Hóspedes por mês</h3>
        <YearNavigation>
          <button
            onClick={() => handleYearChange("prev")}
            disabled={selectedYear <= new Date().getFullYear() - 2}
          >
            Ano Anterior
          </button>
          <span>{selectedYear}</span>
          <button
            onClick={() => handleYearChange("next")}
            disabled={selectedYear >= new Date().getFullYear() + 2}
          >
            Próximo Ano
          </button>
        </YearNavigation>
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
