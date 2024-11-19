import React, { useState, useEffect, useRef   } from "react";
import axios from "axios";
import styled, { css, keyframes  } from "styled-components";
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
  startOfWeek
} from "date-fns";
import { ptBR  } from "date-fns/locale"; // Import Portuguese locale
import ReservationModal from "./ReservationModal";

const slideDown = keyframes`
  from {
    transform: translateY(-30%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

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
  background-color: #DE7066;
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
  position: relative; /* Set position relative to contain ReservationBar */
  overflow: hidden; /* Prevents ReservationBar from escaping */
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
  left: ${(props) => Math.min(props.offset, 100)}%; /* Ensure left offset stays within DayCell */
  width: ${(props) => Math.min(props.width, 100)}%; /* Ensure width doesn’t exceed 100% of DayCell */
  background-color: ${(props) =>
    props.isCheckedOut ? "#A9A9A9" : !props.checkinAt ? "#FFA500" : "#5cb85c"};
  color: white;
  padding: 2px;
  height: 30px;
  font-size: 12px;
  text-align: start;
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
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [viewType, setViewType] = useState("7");
  const [currentStartDate, setCurrentStartDate] = useState(new Date());
  const [apartments, setApartments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [guestNameFilter, setGuestNameFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    const fetchApartments = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/apartments/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApartments(response.data.map(apartment => `${apartment.number}`));
      } catch (error) {
        console.error("Error fetching apartments:", error);
      }
    };

    const fetchReservations = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reservations/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReservations(response.data.map(reservation => ({
          id: reservation.id,
          guestName: reservation.guest_name,
          guest_document: reservation.guest_document,
          guests_qty: `${reservation.guests_qty}`,
          apartment: `${reservation.apt_number}`,
          apartment_owner: `${reservation.apt_owner_name}`,
          photos: `${reservation.photo}`,
          checkin: parseISO(reservation.checkin),
          checkout: parseISO(reservation.checkout),
        })));
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

  const getReservationsCountForDay = (day) => {
    return reservations.filter(
      (reservation) => day >= reservation.beginDate && day <= reservation.endDate
    ).length;
  };

  const handleReservationClick = (reservation) => {
    setSelectedReservation(reservation);
  };

  const daysInView = Array.from({ length: parseInt(viewType, 10) }, (_, i) => addDays(currentStartDate, i));
  const daysOfWeek = Array.from({ length: 7 }, (_, index) => addDays(currentWeek, index));

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

  const getReservationBars = (apartment, day) => {
    const roomReservations = filteredReservations
      .filter(reservation => reservation.apartment === apartment)
      .filter(reservation =>
        reservation.checkin <= endOfDay(day) && reservation.checkout >= startOfDay(day)
      )
      .sort((a, b) => a.checkin - b.checkin);

    const occupiedSlots = [];
    const gapPercentage = 2;
    const gapBetweenDifferentReservations = 20;

    return roomReservations.map((reservation, index, reservations) => {
      const startHour = reservation.checkin > startOfDay(day) ? differenceInHours(reservation.checkin, day) : 0;
      const endHour = reservation.checkout < endOfDay(day)
        ? differenceInHours(reservation.checkout, day)
        : 24;

      const hoursSpan = endHour - startHour;
      const offset = (startHour / 24) * 100;

      const width = ((hoursSpan / 24) * 100) - gapPercentage;

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

      const isCheckedOut = reservation.checkout && isBefore(reservation.checkout, new Date());
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

  const updateReservationTime = async (type) => {
    if (!selectedReservation) return;

    const timestamp = new Date().toISOString();
    const updateData = type === "checkin" ? { checkin_at: timestamp } : { checkout_at: timestamp };

    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/reservations/${selectedReservation.id}/`,
        updateData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );
      setSelectedReservation({ ...selectedReservation, ...updateData });
    } catch (error) {
      console.error("Error updating reservation:", error);
    }
  };

  const closeModal = () => {
    setSelectedReservation(null);
  };

  return (
    <CalendarContainer>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
            <input
              type="text"
              placeholder="Filtrar por nome"
              value={guestNameFilter}
              onChange={(e) => setGuestNameFilter(e.target.value)}
            />
            <div>
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
          </div>
          <CalendarHeader>
            <div>
              <div>
              <select onChange={(e) => setViewType(e.target.value)} value={viewType}>
                <option value="7">Vista de 7 Dias</option>
                <option value="15">Vista de 15 Dias</option>
                <option value="30">Vista de 30 Dias</option>
              </select>
              </div>
            </div>
            <div>
              <button onClick={handlePrev}>{"<"}</button>
                <span>{`${format(currentStartDate, "dd MMM yyyy", { locale: ptBR  })} - ${format(addDays(currentStartDate, daysInView.length - 1), "dd MMM yyyy", { locale: ptBR  })}`}</span>
              <button onClick={handleNext}>{">"}</button>
            </div>
            <div>
              <select onChange={handleMonthChange} value={currentStartDate.getMonth()}>
                {monthNames.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </CalendarHeader>
          <DaysRow>
            <RoomLabel>Quarto</RoomLabel>
            {daysInView.map((day, dayIndex) => (
              <DayCell key={dayIndex} isCurrentDay={isToday(day)} isWeekend={isWeekend(day)}>
                <strong>{format(day, "EEE dd", { locale: ptBR  })}</strong>
              </DayCell>
            ))}
          </DaysRow>

          {apartments.map(apartment => (
            <RoomRow key={apartment}>
              <RoomLabel>{`Quarto ${apartment}`}</RoomLabel>
              {daysInView.map((day, dayIndex) => (
                <DayCell key={dayIndex}>
                  {getReservationBars(apartment, day).map((reservation) => (
                    <ReservationBar
                      key={reservation.id}
                      offset={reservation.offset}
                      width={reservation.width}
                      stackIndex={reservation.stackIndex}
                      isCheckedOut={reservation.isCheckedOut}
                      checkinAt={reservation.checkinAt}
                      onClick={() => handleReservationClick(reservation)}
                    >
                      {reservation.showName ? reservation.guestName : ""}
                      <Tooltip className="tooltip">
                        <strong>Hóspede:</strong> {reservation.guestName}<br />
                        <strong>Check-in:</strong> {format(reservation.checkin, "dd MMM yyyy", { locale: ptBR  })}<br />
                        <strong>Check-out:</strong> {format(reservation.checkout, "dd MMM yyyy", { locale: ptBR  })}
                      </Tooltip>
                    </ReservationBar>
                  ))}
                </DayCell>
              ))}
            </RoomRow>
          ))}
            <RoomRow>
              <RoomLabel><strong>Total</strong></RoomLabel>
              {daysOfWeek.map((day, dayIndex) => (
                <DayCell key={dayIndex}>
                  <h2>{getReservationsCountForDay(day)}</h2>
                </DayCell>
              ))}
            </RoomRow>
        </>
      )}
      {selectedReservation && (
          <ReservationModal
            closeModal={closeModal}
            selectedReservation={selectedReservation}
            updateReservationTime={updateReservationTime}
          />
        )}
    </CalendarContainer>
  );
};

export default ReservationCalendar;
