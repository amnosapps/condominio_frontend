import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import {
  format,
  addDays,
  startOfMonth,
  setMonth,
  isToday,
  isWeekend,
  parseISO,
  differenceInHours,
  startOfDay,
  endOfDay,
  isBefore,
} from "date-fns";
import { pt } from "date-fns/locale"; // Import Portuguese locale

// Styled components for the UI
const CalendarContainer = styled.div`
  width: 90%;
  margin: auto;
  font-family: Arial, sans-serif;
  background-color: #fdfdfd;
  border: 1px solid #ddd;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #4682b4;
  color: white;
`;

const DaysRow = styled.div`
  display: flex;
  background-color: #f4f4f4;
`;

const DayCell = styled.div`
  flex: 1;
  padding: 5px;
  border: 1px solid #ddd;
  min-height: 20px;
  position: relative;
  ${(props) =>
    props.isCurrentDay &&
    css`
      background-color: #e0ffe0;
    `}
  ${(props) =>
    props.isWeekend &&
    css`
      background-color: #fafafa;
    `}
`;

const RoomRow = styled.div`
  display: flex;
  border-top: 1px solid #ddd;
`;

const RoomLabel = styled.div`
  width: 6%;
  padding: 10px;
  background-color: #d3d3d3;
  text-align: center;
  font-weight: bold;
  border-right: 1px solid #ddd;
`;

const ReservationBar = styled.div`
  position: absolute;
  top: ${(props) => (props.stackIndex || 0) * 20}px;
  left: ${(props) => props.offset}%;
  width: ${(props) => props.width}% ;
  background-color: ${(props) =>
    props.isCheckedOut ? "#A9A9A9" : !props.checkinAt ? "#FFA500" : "#5cb85c"};
  color: white;
  padding: 5px;
  border-radius: 3px;
  height: 20px;
  font-size: 12px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;

  &:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
`;

const Tooltip = styled.div`
  visibility: hidden;
  opacity: 0;
  width: 220px;
  background-color: #333;
  color: #fff;
  text-align: left;
  padding: 10px;
  border-radius: 5px;
  position: absolute;
  z-index: 10;
  top: -75px;
  left: 50%;
  transform: translateX(-50%);
  transition: opacity 0.3s ease;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);

  &::after {
    content: "";
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }
`;

// List of month names in Portuguese
const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Main component
const ReservationCalendar = () => {
  const [viewType, setViewType] = useState("7");
  const [currentStartDate, setCurrentStartDate] = useState(new Date());
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);

  const [guestNameFilter, setGuestNameFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  useEffect(() => {
    const mockRooms = [
      { id: 1, number: "101" },
      { id: 2, number: "102" },
      { id: 3, number: "103" },
    ];

    const mockReservations = [
      {
        id: 1,
        guestName: "João da Silva",
        room_number: "101",
        checkin: "2024-11-10T14:00",
        checkout: "2024-11-13T12:00",
        checkin_at: "2024-11-10T14:00",
        checkout_at: "2024-11-13T11:00",
      },
      {
        id: 2,
        guestName: "Maria Oliveira",
        room_number: "101",
        checkin: "2024-11-13T14:00",
        checkout: "2024-11-15T12:00",
        checkin_at: "",
        checkout_at: "2024-11-15T12:00",
      },
    ];

    setRooms(mockRooms.map(room => room.number));
    setReservations(
      mockReservations.map(reservation => ({
        id: reservation.id,
        guestName: reservation.guestName,
        room: reservation.room_number,
        checkin: parseISO(reservation.checkin),
        checkout: parseISO(reservation.checkout),
        checkin_at: reservation.checkin_at ? parseISO(reservation.checkin_at) : null,
        checkout_at: reservation.checkout_at ? parseISO(reservation.checkout_at) : null,
      }))
    );
  }, []);

  const daysInView = Array.from({ length: parseInt(viewType, 10) }, (_, i) => addDays(currentStartDate, i));

  const handlePrev = () => setCurrentStartDate(addDays(currentStartDate, -parseInt(viewType, 10)));
  const handleNext = () => setCurrentStartDate(addDays(currentStartDate, parseInt(viewType, 10)));

  const handleMonthChange = (event) => {
    const selectedMonthIndex = parseInt(event.target.value, 10);
    const newStartDate = setMonth(startOfMonth(currentStartDate), selectedMonthIndex);
    setCurrentStartDate(newStartDate);
  };

  const filteredReservations = reservations.filter((reservation) => {
    const matchesGuestName = reservation.guestName.toLowerCase().includes(guestNameFilter.toLowerCase());
    const matchesDateRange =
      (!startDateFilter || reservation.checkout >= parseISO(startDateFilter)) &&
      (!endDateFilter || reservation.checkin <= parseISO(endDateFilter));
    return matchesGuestName && matchesDateRange;
  });

  const getReservationBars = (room, day) => {
    const roomReservations = filteredReservations
      .filter(reservation => reservation.room === room)
      .filter(reservation =>
        reservation.checkin <= endOfDay(day) && reservation.checkout >= startOfDay(day)
      )
      .sort((a, b) => a.checkin - b.checkin);

    const occupiedSlots = [];
    const gapPercentage = 2;
    const gapBetweenDifferentReservations = 7; // Additional gap between different reservations

    return roomReservations.map((reservation, index, reservations) => {
      const startHour = reservation.checkin > startOfDay(day) ? differenceInHours(reservation.checkin, day) : 0;
      const endHour = reservation.checkout < endOfDay(day)
        ? differenceInHours(reservation.checkout, day)
        : 24;

      const hoursSpan = endHour - startHour;
      const offset = (startHour / 24) * 100;

      // Adjust width to add a small gap between stacked bars
      const width = ((hoursSpan / 24) * 100) - gapPercentage;

      // Add extra gap if the reservation does not overlap with the previous one
      const additionalOffset = index > 0 && reservations[index - 1].checkout < reservation.checkin
        ? gapBetweenDifferentReservations
        : 0;

      let stackIndex = 0;
      while (occupiedSlots[stackIndex] && occupiedSlots[stackIndex].some(
        slot => (startHour < slot.end && endHour > slot.start))) {
        stackIndex++;
      }

      if (!occupiedSlots[stackIndex]) {
        occupiedSlots[stackIndex] = [];
      }
      occupiedSlots[stackIndex].push({ start: startHour, end: endHour });

      const showName = differenceInHours(reservation.checkin, day) === startHour;

      const isCheckedOut = reservation.checkout_at && isBefore(reservation.checkout_at, new Date());
      const checkinAt = reservation.checkin_at;

      return {
        ...reservation,
        offset: offset + additionalOffset,
        width,
        stackIndex,
        showName,
        isCheckedOut,
        checkinAt,
      };
    });
  };

  return (
    <CalendarContainer>
      <CalendarHeader>
        <button onClick={handlePrev}>{"<"}</button>
        <span>{`${format(currentStartDate, "dd MMM yyyy", { locale: pt })} - ${format(addDays(currentStartDate, daysInView.length - 1), "dd MMM yyyy", { locale: pt })}`}</span>
        <button onClick={handleNext}>{">"}</button>
        
        <select onChange={(e) => setViewType(e.target.value)} value={viewType}>
          <option value="7">Vista de 7 Dias</option>
          <option value="15">Vista de 15 Dias</option>
          <option value="30">Vista de 30 Dias</option>
        </select>

        <select onChange={handleMonthChange} value={currentStartDate.getMonth()}>
          {monthNames.map((month, index) => (
            <option key={month} value={index}>
              {month}
            </option>
          ))}
        </select>
      </CalendarHeader>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
        <input
          type="text"
          placeholder="Filtrar por nome"
          value={guestNameFilter}
          onChange={(e) => setGuestNameFilter(e.target.value)}
        />
        <input
          type="date"
          placeholder="Data de início"
          value={startDateFilter}
          onChange={(e) => setStartDateFilter(e.target.value)}
        />
        <input
          type="date"
          placeholder="Data de fim"
          value={endDateFilter}
          onChange={(e) => setEndDateFilter(e.target.value)}
        />
      </div>

      <DaysRow>
        <RoomLabel>Quarto</RoomLabel>
        {daysInView.map((day, dayIndex) => (
          <DayCell key={dayIndex} isCurrentDay={isToday(day)} isWeekend={isWeekend(day)}>
            <strong>{format(day, "EEE dd", { locale: pt })}</strong>
          </DayCell>
        ))}
      </DaysRow>

      {rooms.map(room => (
        <RoomRow key={room}>
          <RoomLabel>{`Quarto ${room}`}</RoomLabel>
          {daysInView.map((day, dayIndex) => (
            <DayCell key={dayIndex}>
              {getReservationBars(room, day).map((reservation) => (
                <ReservationBar
                  key={reservation.id}
                  offset={reservation.offset}
                  width={reservation.width}
                  stackIndex={reservation.stackIndex}
                  isCheckedOut={reservation.isCheckedOut}
                  checkinAt={reservation.checkinAt}
                >
                  {reservation.showName ? reservation.guestName : ""}
                  <Tooltip className="tooltip">
                    <strong>Hóspede:</strong> {reservation.guestName}<br />
                    <strong>Check-in:</strong> {format(reservation.checkin, "dd MMM yyyy HH:mm", { locale: pt })}<br />
                    <strong>Check-out:</strong> {format(reservation.checkout, "dd MMM yyyy HH:mm", { locale: pt })}
                  </Tooltip>
                </ReservationBar>
              ))}
            </DayCell>
          ))}
        </RoomRow>
      ))}
    </CalendarContainer>
  );
};

export default ReservationCalendar;
