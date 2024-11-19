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
  font-family: 'Roboto', Arial, sans-serif;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #DE7066;
  color: white;
  font-weight: bold;
  border-bottom: 1px solid #1565c0;

  button {
    background: transparent;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    margin: 0 5px;
    padding: 5px;
    border-radius: 4px;
    transition: background-color 0.3s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }

  select {
    background: #DE7066;
    color: white;
    border: 1px solid #DE7066;
    border-radius: 4px;
    padding: 5px 10px;
    font-size: 1rem;
    cursor: pointer;
  }
`;

const DaysRow = styled.div`
  display: flex;
  background-color: #f9f9f9;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
`;

const DayCell = styled.div`
  flex: 1;
  text-align: center;
  font-size: 0.9rem;
  color: #555;
  position: relative;
  padding: 10px;
  border-right: 1px solid #e0e0e0;
  background-color: ${(props) =>
    props.isCurrentDay ? '#e3f2fd' : props.isWeekend ? '#fef9f9' : 'white'};
  transition: background-color 0.3s;

  &:last-child {
    border-right: none;
  }

  &:hover {
    background-color: #f1f1f1;
  }

  strong {
    color: #333;
  }
`;

const RoomRow = styled.div`
  display: flex;
  border-top: 1px solid #e0e0e0;

  &:nth-child(even) {
    background-color: #fafafa;
  }
`;

const RoomLabel = styled.div`
  width: 8%;
  padding: 15px;
  background-color: #f5f5f5;
  text-align: center;
  font-weight: bold;
  color: #666;
  border-right: 1px solid #e0e0e0;
`;

const ReservationBar = styled.div`
  position: absolute;
  top: ${(props) => (props.stackIndex || 0) * 35}px;
  left: ${(props) => Math.min(props.offset, 100)}%;
  width: ${(props) => Math.min(props.width, 100)}%;
  background-color: ${(props) =>
    props.isCheckedOut ? '#b0bec5' : props.checkinAt ? '#4caf50' : '#ffca28'};
  color: white;
  padding: 5px 8px;
  font-size: 0.8rem;
  height: 28px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${(props) =>
      props.isCheckedOut ? '#90a4ae' : props.checkinAt ? '#388e3c' : '#ffb300'};
  }

  &:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
`;

const Tooltip = styled.div`
  visibility: hidden;
  opacity: 0;
  width: 220px;
  background-color: #424242;
  color: white;
  padding: 10px;
  border-radius: 4px;
  font-size: 0.85rem;
  position: absolute;
  z-index: 10;
  top: -85px;
  left: 50%;
  transform: translateX(-50%);
  transition: opacity 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: #424242 transparent transparent transparent;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 8px 8px 0 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const FilterInput = styled.input`
  padding: 8px 15px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;

  &:focus {
    border-color: #1e88e5;
    box-shadow: 0 0 8px rgba(30, 136, 229, 0.2);
  }

  &::placeholder {
    color: #888;
    font-size: 0.9rem;
  }
`;

const DateInputContainer = styled.div`
  display: flex;
  gap: 10px;

  input[type="date"] {
    padding: 5px 15px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;

    &:focus {
      border-color: #1e88e5;
      box-shadow: 0 0 8px rgba(30, 136, 229, 0.2);
    }

    &::placeholder {
      color: #888;
      font-size: 0.9rem;
    }
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
        guest_name: reservation.guest_name,
        guest_document: reservation.guest_document,
        guest_phone: reservation.guest_phone || "", // Handle null values
        guests_qty: `${reservation.guests_qty}`, // Ensure it's a string
        apartment: reservation.apt_number,
        apartment_owner: reservation.apt_owner_name,
        photos: reservation.photo, // Main photo URL
        additional_photos: reservation.additional_photos, // Extract additional photo URLs
        checkin: reservation.checkin ? parseISO(reservation.checkin) : null, // Parse checkin if exists
        checkout: reservation.checkout ? parseISO(reservation.checkout) : null, // Parse checkout if exists
        checkin_at: reservation.checkin_at ? parseISO(reservation.checkin_at) : null, // Parse checkin_at
        checkout_at: reservation.checkout_at ? parseISO(reservation.checkout_at) : null, // Parse checkout_at
        has_children: reservation.has_children,
      })));
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const loadData = async () => {
    await Promise.all([fetchApartments(), fetchReservations()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const reopenModalId = sessionStorage.getItem("reopenModalId");
    if (reopenModalId) {
      sessionStorage.removeItem("reopenModalId"); // Clear it to prevent reopening on every reload
      const reservation = reservations.find(
        (res) => res.id === parseInt(reopenModalId, 10)
      );
      if (reservation) {
        setSelectedReservation(reservation);
      }
    }
  }, [reservations]);

  const getTotalGuestsForDay = (day) => {
    return reservations
      .filter(
        (reservation) =>
          day >= reservation.checkin && day <= reservation.checkout
      )
      .reduce((totalGuests, reservation) => totalGuests + parseInt(reservation.guests_qty, 10), 0);
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
    const matchesGuestName = reservation.guest_name.toLowerCase().includes(guestNameFilter.toLowerCase());
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
    const gapPercentage = 4;
    const gapBetweenDifferentReservations = 40;

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

  const generateYearRange = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5; // Adjust range as needed
    const endYear = currentYear + 5;
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  };
  
  // Function to handle year change
  const handleYearChange = (event) => {
    const selectedYear = parseInt(event.target.value, 10);
    const newStartDate = new Date(selectedYear, currentStartDate.getMonth(), 1); // Keep current month
    setCurrentStartDate(newStartDate);
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
          <FilterContainer>
            <FilterInput
              type="text"
              placeholder="Filtrar por nome"
              value={guestNameFilter}
              onChange={(e) => setGuestNameFilter(e.target.value)}
            />
            <DateInputContainer>
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
            </DateInputContainer>
          </FilterContainer>
          <CalendarHeader>
            <div>
              <div>
              <select onChange={(e) => setViewType(e.target.value)} value={viewType}>
                <option value="7">Semana</option>
                <option value="15">Quinzena</option>
                <option value="30">Mês</option>
              </select>
              </div>
            </div>
            <div>
              <button style={{ marginRight: '100px' }} onClick={handlePrev}>{"<"}</button>
              <span>{`${format(currentStartDate, "dd MMM yyyy", { locale: ptBR  })} - ${format(addDays(currentStartDate, daysInView.length - 1), "dd MMM yyyy", { locale: ptBR  })}`}</span>
              <button style={{ marginLeft: '100px' }} onClick={handleNext}>{">"}</button>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <select onChange={handleMonthChange} value={currentStartDate.getMonth()}>
                {monthNames.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              <select onChange={handleYearChange} value={currentStartDate.getFullYear()}>
                {generateYearRange().map((year) => (
                  <option key={year} value={year}>
                    {year}
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
                      {reservation.showName ? reservation.guest_name : ""}
                    </ReservationBar>
                  ))}
                </DayCell>
              ))}
            </RoomRow>
          ))}
            <RoomRow>
              <RoomLabel>Ocupação</RoomLabel>
              {daysInView.map((day, dayIndex) => (
                <DayCell key={dayIndex}>
                  <p>{getTotalGuestsForDay(day)}</p>
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
            loadData={loadData}
          />
        )}
    </CalendarContainer>
  );
};

export default ReservationCalendar;
