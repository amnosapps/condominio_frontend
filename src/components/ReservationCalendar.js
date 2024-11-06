import React, { useState, useEffect } from "react";
import axios from "axios";
import styled, { css } from "styled-components";
import {
  format,
  addDays,
  startOfWeek,
  isToday,
  isWeekend,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";

const CalendarContainer = styled.div`
  display: flex;
  max-width: 90%;
  margin: auto;
  font-family: Arial, sans-serif;
  background-color: #fff;
`;

const Calendar = styled.div`
  flex: 1;
  background-color: #e46f65;
`;

const CalendarHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e46f65;
  padding: 1px 50px;

  .header-title {
    font-size: 18px;
    font-weight: 300;
    color: #fff;
  }

  > button {
    background-color: #e46f65;
    color: #fff;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 18px;
    border-radius: 10px;
  }
`;

const CalendarGrid = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
`;

const CalendarDays = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
`;

const CalendarDay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  font-weight: bold;
  background-color: #fff;
  border: 1px solid #ddd;

  ${(props) =>
    props.isCurrentDay &&
    css`
      background-color: #ffe2e2;
      color: #d9534f;
    `}

  ${(props) =>
    props.isWeekend &&
    css`
      background-color: #e5f2ff;
      color: #004085;
    `}

  > h1 {
    font-weight: 300;
    font-size: 15px;
    margin-bottom: -11px;
  }

  > h2 {
    font-weight: 300;
    font-size: 15px;
  }
`;

const CalendarEmptyCell = styled.div`
  background-color: #fff;
`;

const CalendarRow = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
`;

const CalendarApartment = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  font-weight: bold;
  background-color: #f4f4f4;
  border: 1px solid #ddd;

  ${(props) =>
    props.isWeekend &&
    css`
      background-color: #fff;
      color: #5c5c5c;
    `}
`;

const CalendarCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  background-color: #fff;
  position: relative;

  ${(props) =>
    props.isCurrentDay &&
    css`
      background-color: #ffe2e2;
    `}

  ${(props) =>
    props.isWeekend &&
    css`
      background-color: #e5f2ff;
    `}
`;

const Reservation = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #4c92d0;
  color: white;
  border-radius: 3px;
  cursor: pointer;

  > h1 {
    font-size: 0.9em;
    text-align: center;
    font-weight: 500;
    padding: 0px 15px;
  }
`;

/* Sidebar styling */
const ReservationSidebar = styled.div`
  width: 300px;
  padding: 20px;
  background-color: #f9f9f9;
  border-left: 1px solid #ddd;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;

const ReservationCalendar = () => {
  const [currentWeek, setCurrentWeek] = useState(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [apartments, setApartments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    const fetchApartments = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/apartments/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setApartments(response.data.map(apartment => `Apto ${apartment.id}`));
      } catch (error) {
        console.error("Error fetching apartments:", error);
      }
    };

    const fetchReservations = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reservations/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReservations(
          response.data.map(reservation => ({
            name: reservation.guest_name,
            apartment: `Apto ${reservation.apartment}`,
            beginDate: parseISO(reservation.checkin.split("T")[0]),
            endDate: parseISO(reservation.checkout.split("T")[0]),
          }))
        );
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    const loadData = async () => {
      await Promise.all([fetchApartments(), fetchReservations()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handlePrevWeek = () => setCurrentWeek(addDays(currentWeek, -7));
  const handleNextWeek = () => setCurrentWeek(addDays(currentWeek, 7));

  const daysOfWeek = Array.from({ length: 7 }, (_, index) =>
    addDays(currentWeek, index)
  );

  const handleReservationClick = (reservation) => {
    setSelectedReservation(reservation);
  };

  const closeSidebar = () => {
    setSelectedReservation(null);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <CalendarContainer>
      <Calendar>
        <CalendarHeader>
          <button onClick={handlePrevWeek}>{'<'}</button>
          <h2 className="header-title">{`${format(currentWeek, "dd MMM yyy", { locale: ptBR })} - ${format(
            addDays(currentWeek, 6),
            "dd MMM yyy",
            { locale: ptBR }
          )}`}</h2>
          <button onClick={handleNextWeek}>{'>'}</button>
        </CalendarHeader>

        <CalendarGrid>
          <CalendarDays>
            <CalendarEmptyCell />
            {daysOfWeek.map((day, index) => (
              <CalendarDay
                key={index}
                isCurrentDay={isToday(day)}
                isWeekend={isWeekend(day)}
              >
                <h1>{format(day, "dd", { locale: ptBR })}</h1>
                <h2>{format(day, "EE", { locale: ptBR })}</h2>
              </CalendarDay>
            ))}
          </CalendarDays>

          {apartments.map((apartment, index) => (
            <CalendarRow key={index}>
              <CalendarApartment
                isCurrentDay={isToday(daysOfWeek[0])}
                isWeekend={isWeekend(daysOfWeek[0])}
              >
                {apartment}
              </CalendarApartment>
              {daysOfWeek.map((day, dayIndex) => {
                const reservationForCell = reservations.find(
                  (reservation) =>
                    reservation.apartment === apartment &&
                    day >= reservation.beginDate &&
                    day <= reservation.endDate
                );

                const isCurrentDay = isToday(day);
                const isWeekendDay = isWeekend(day);

                return (
                  <CalendarCell
                    key={dayIndex}
                    isCurrentDay={isCurrentDay}
                    isWeekend={isWeekendDay}
                  >
                    {reservationForCell && (
                      <Reservation onClick={() => handleReservationClick(reservationForCell)}>
                        <h1>{reservationForCell.name}</h1>
                      </Reservation>
                    )}
                  </CalendarCell>
                );
              })}
            </CalendarRow>
          ))}
        </CalendarGrid>
      </Calendar>

      {selectedReservation && (
        <ReservationSidebar>
          <CloseButton onClick={closeSidebar}>X</CloseButton>
          <h3>Detalhes da Reserva</h3>
          <p><strong>Nome do Hóspede:</strong> {selectedReservation.name}</p>
          <p><strong>Apartamento:</strong> {selectedReservation.apartment}</p>
          <p><strong>Data de Início:</strong> {format(selectedReservation.beginDate, "dd MMM yyyy", { locale: ptBR })}</p>
          <p><strong>Data de Fim:</strong> {format(selectedReservation.endDate, "dd MMM yyyy", { locale: ptBR })}</p>
        </ReservationSidebar>
      )}
    </CalendarContainer>
  );
};

export default ReservationCalendar;
