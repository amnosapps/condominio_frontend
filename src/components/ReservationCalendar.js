import React, { useState, useEffect, useRef   } from "react";
import { useParams } from 'react-router-dom';
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
  startOfDay,
  endOfDay,
  isBefore,
  startOfWeek,
  isAfter,
  parse,
  isValid,
} from "date-fns";
import { ptBR  } from "date-fns/locale"; // Import Portuguese locale
import ReservationModal from "./ReservationModal";
import RodapeCalendar from "./Calendar/RodapeComponent";
import { registerLocale } from "react-datepicker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReservationCreationModal from "./Reservation/ReservationCreation";

registerLocale("pt-BR", ptBR);


// Styled components for the UI
const CalendarContainer = styled.div`
  width: 100%;
  height: 100%;
  margin: auto;
  font-family: 'Roboto', Arial, sans-serif;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow-x: hidden;
  /* overflow-y: hidden; */
  scrollbar-width: thin; /* For Firefox */
  /* justify-content: space-between; */

   /* For Webkit-based browsers */
   &::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e0e0e0;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

const CalendarWrapper = styled.div`
  width: 98%;
  max-height: 98%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  justify-items: center;
  margin: auto;
  font-family: 'Roboto', Arial, sans-serif;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #F46600;
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

    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
  }

  select {
    background: #F46600;
    color: white;
    border: 1px solid #F46600;
    border-radius: 4px;
    padding: 5px 10px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;

    &:focus {
      background-color: #C95C58; /* Darker shade of red when active */
      border-color: #C95C58; /* Match the border to the new background */
      outline: none; /* Remove the default outline */
    }

    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1px;
  }
`;


const DaysRow = styled.div`
  display: flex;
  background-color: #f9f9f9;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;

  @media (max-width: 768px) {
    padding: 5px 0;
  }
`;

const DayCell = styled.div`
  align-items: center;
  justify-content: center;
  display: flex;
  flex: 1;
  position: relative; /* To position bars inside */
  font-size: 0.9rem;
  color: #555;
  padding: 8px; /* Consistent padding */
  border-right: 1px solid #e0e0e0;
  background-color: ${(props) =>
    props.isCurrentDay ? '#e3f2fd' : props.isWeekend ? '#ffe0dd' : 'white'};
  transition: background-color 0.3s;

  &:last-child {
    border-right: none;
  }

  &:hover {
    background-color: #f1f1f1;
  }
`;

const RoomRow = styled.div`
  display: flex;
  align-items: center;
  border-top: 1px solid #e0e0e0;
  align-items: stretch; /* Ensure content aligns properly */

  &:nth-child(even) {
    background-color: #fafafa;
  }
`;


const RoomLabel = styled.div`
  flex: 0 0 120px; /* Fixed width of 120px */
  padding: 15px;
  background-color: #f5f5f5;
  text-align: center;
  font-weight: bold;
  color: #666;
  border-right: 1px solid #e0e0e0;
`;

const OccupationRow = styled.div`
  display: flex;
  align-items: center;
  border-top: 1px solid #e0e0e0;
  align-items: stretch; /* Ensure content aligns properly */
  position: sticky; /* Makes the row stick in place */
  bottom: 0; /* Sticks to the bottom of the container */
  background-color: #ffffff; /* Ensure consistent background color */
  z-index: 10; /* Ensure it is above other content */
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1); /* Add subtle shadow for visibility */

  &:nth-child(even) {
    background-color: #fafafa;
  }
`;

const OccupationLabel = styled.div`
  flex: 0 0 120px; /* Fixed width of 120px */
  padding: 15px;
  background-color: #f5f5f5;
  text-align: center;
  font-weight: bold;
  color: #666;
  border-right: 1px solid #e0e0e0;
`;

const OccupationCell = styled.div`
  align-items: center;
  justify-content: center;
  display: flex;
  flex: 1;
  font-size: 0.9rem;
  color: #555;
  border-right: 1px solid #e0e0e0;
  background-color: ${(props) =>
    props.isCurrentDay ? '#e3f2fd' : props.isWeekend ? '#ffe0dd' : 'white'};
  transition: background-color 0.3s;

  &:last-child {
    border-right: none;
  }

  &:hover {
    background-color: #f1f1f1;
  }
`;


const ReservationBar = styled.div`
  position: absolute;
  left: ${(props) => `calc(${props.startOffset}% + 5px)`}; 
  top: ${(props) => (props.stackIndex || 0) * 40}px;
  background-color: ${(props) => {
    // checkin proximo
    if (!props.checkinAt && isToday(props.checkin)) {
      return '#FFA500'; // Orange for today (pending)
    }

    // checkin pendente
    else if (!props.checkinAt && isAfter(new Date(), props.checkin)) {
      return '#FF5722'; // Red for expired (no check-in)
    }

    // reserva vigente
    else if (props.checkinAt && !props.checkoutAt && isBefore(new Date(), props.checkout)) {
      return '#4CAF50'; // Green for past check-ins (confirmed)
    }

    // checkout pendente
    else if (props.checkinAt && !props.checkoutAt && isAfter(new Date(), props.checkout)) {
      return '#000'; // Black if checked in and no checkout yet
    }

    // reserva encerrada
    else if (props.checkinAt && props.checkoutAt) {
      return '#9E9E9E'; // Grey if checked in and checked out
    }

    return '#FFC107'; // futuras reservas
  }};
  color: white;
  padding: 5px 8px;
  font-size: 0.85rem;
  height: 30px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;

  &:hover {
    opacity: 0.7
  }
`;

const Tooltip = styled.div`
  visibility: hidden;
  opacity: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  font-size: 0.8rem;
  border-radius: 4px;
  position: absolute;
  z-index: 10;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: opacity 0.3s;

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.7) transparent transparent transparent;
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

const FiltersWrapper = styled.div`
  display: flex;
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

const FilterDropdown = styled.select`
  background: white;
  border: 1px solid #ccc;
  padding: 8px 10px;
  border-radius: 4px;
  margin-left: 5px;
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #1e88e5;
    box-shadow: 0 0 8px rgba(30, 136, 229, 0.2);
  }
`;

const DatePickerButton = styled.button`
  background-color: #fff;
  color: #f46600;
  border: 1px solid #f46600;
  padding: 8px 15px;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-left: 6px;

  &:hover {
    background-color: #f46600;
    color: #fff;
  }
`;

const DatePickerContainer = styled.div`
  position: relative;

  .react-datepicker {
    position: absolute;
    top: 50px;
    right: 100px;
    z-index: 1050;
  }
`;

const ClearButton = styled.button`
  background-color: #F46600;
  color: white;
  border: none;
  padding: 8px 15px;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #C95C58;
  }
`;

const ScrollableContainer = styled.div`
  white-space: nowrap; /* Prevent wrapping */
  display: flex;
  flex-direction: column;
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoadingSpinner = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  border: 8px solid #f3f3f3; /* Light grey */
  border-top: 8px solid #F46600; /* Blue */
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  z-index: 1000;
`;

const CreateReservationButton = styled.button`
  background-color: #fff;
  color: #F46600;
  border: 1px solid #F46600;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #F46600;
    color: #fff;
  }
`;


// List of month names in Portuguese
const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Main component
const ReservationCalendar = ({ condominium }) => {
  const params = useParams();
  const selectedCondominium = condominium || params.condominium;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingNavigation, setLoadingNavigation] = useState(false);

  const [viewType, setViewType] = useState("7");
  const [currentStartDate, setCurrentStartDate] = useState(new Date());
  const [apartments, setApartments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [guestNameFilter, setGuestNameFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const [selectedReservation, setSelectedReservation] = useState(null);

  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [filterType, setFilterType] = useState("Temporada"); // Default filter for "Temporada"

  const fetchApartments = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/apartments/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { condominium: selectedCondominium },
      });

      const filteredApartments = response.data.filter((apartment) =>
        filterType === "All" ? true : apartment.type_name === filterType
      );

      setApartments(filteredApartments);
    } catch (error) {
      console.error("Error fetching apartments:", error);
    }
  };

  const fetchReservations = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reservations/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { condominium: selectedCondominium },
      });
      setReservations(response.data.map(reservation => ({
        id: reservation.id,
        guest_name: reservation.guest_name,
        guest_document: reservation.guest_document,
        guest_phone: reservation.guest_phone || "", // Handle null values
        guests_qty: reservation.additional_guests.length + 1 || 0, // Ensure it's a string
        apartment: reservation.apt_number,
        apartment_owner: reservation.apt_owner_name,
        photos: reservation.photo, // Main photo URL
        additional_photos: reservation.additional_photos_urls || [], // Extract additional photo URLs
        checkin: reservation.checkin ? parseISO(reservation.checkin) : null, // Parse checkin if exists
        checkout: reservation.checkout ? parseISO(reservation.checkout) : null, // Parse checkout if exists
        checkin_at: reservation.checkin_at ? parseISO(reservation.checkin_at) : null, // Parse checkin_at
        checkout_at: reservation.checkout_at ? parseISO(reservation.checkout_at) : null, // Parse checkout_at
        has_children: reservation.has_children,
        address: reservation.address,
        vehicle_plate: reservation.vehicle_plate,
        additional_guests: reservation.additional_guests,
        reservation_file: reservation.reservation_file
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
  }, [filterType]);

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value); // Update the filter type
  };

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
    function normalizeDate(date) {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
    }

    return reservations.filter((reservation) => 
      normalizeDate(day) >= normalizeDate(reservation.checkin) && 
      normalizeDate(day) <= normalizeDate(reservation.checkout))
    .reduce((totalGuests, reservation) => totalGuests + (reservation.additional_guests.length + 1),0);
  };

  const handleReservationClick = (reservation) => {
    setSelectedReservation(reservation);
  };

  const daysInView = selectedDateRange.startDate && selectedDateRange.endDate
    ? Array.from(
        { length: Math.ceil((selectedDateRange.endDate - selectedDateRange.startDate) / (24 * 60 * 60 * 1000)) + 1 },
        (_, i) => addDays(selectedDateRange.startDate, i)
      )
    : Array.from({ length: parseInt(viewType, 10) }, (_, i) => addDays(currentStartDate, i));

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
      .filter((reservation) => reservation.apartment === apartment)
      .filter(
        (reservation) =>
          reservation.checkin <= endOfDay(day) &&
          reservation.checkout >= startOfDay(day)
      )
      .sort((a, b) => a.checkin - b.checkin);
  
    const occupiedSlots = [];
    const bars = [];
  
    roomReservations.forEach((reservation) => {
      const startOffset = Math.max(
        0,
        ((reservation.checkin - startOfDay(day)) / (24 * 60 * 60 * 1000)) * 100
      ); // Prevent negative values
      
      const endOffset = Math.min(
        100,
        ((reservation.checkout - startOfDay(day)) / (24 * 60 * 60 * 1000)) * 100
      ); // Prevent exceeding 100%
      const width = endOffset - startOffset;
  
      let stackIndex = 0;
  
      while (
        occupiedSlots[stackIndex] &&
        occupiedSlots[stackIndex].some(
          (slot) =>
            reservation.checkin < slot.end && reservation.checkout > slot.start
        )
      ) {
        stackIndex++;
      }
  
      if (!occupiedSlots[stackIndex]) {
        occupiedSlots[stackIndex] = [];
      }
  
      occupiedSlots[stackIndex].push({
        start: reservation.checkin,
        end: reservation.checkout,
      });
  
      bars.push({
        ...reservation,
        startOffset,
        width,
        stackIndex,
        ischeckedout: reservation.checkout_at,
        checkoutAt: reservation.checkout_at,
        checkinAt: reservation.checkin_at,
      });
    });
  
    return bars;
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

  const navigateToReservation = (reservation) => {
    if (reservation && reservation.checkin) {
      setLoadingNavigation(true); // Start loading
      setTimeout(() => {
        setCurrentStartDate(startOfWeek(reservation.checkin, { weekStartsOn: 0 }));
        setLoadingNavigation(false); // Stop loading
      }, 500); // Simulate a delay for the animation
    }
  };

  useEffect(() => {
    if (guestNameFilter.trim()) {
      const matchingReservation = reservations.find((reservation) =>
        reservation.guest_name.toLowerCase().includes(guestNameFilter.toLowerCase())
      );
      if (matchingReservation) {
        navigateToReservation(matchingReservation);
      }
    }
  }, [guestNameFilter, reservations]);

  const clearFilters = () => {
    setGuestNameFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setSelectedDateRange({ startDate: null, endDate: null });
    setCurrentStartDate(new Date()); // Reset to today's date
  };

  const closeModal = () => {
    setSelectedReservation(null);
  };

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setSelectedDateRange({ startDate: start, endDate: end });
    if (start && end) {
      setShowDatePicker(false); // Close the DatePicker after selection
    }
  };

  const toggleDatePicker = () => {
    setShowDatePicker((prev) => !prev);
  };

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <CalendarWrapper>
      <FilterContainer>
        <FiltersWrapper>
          <FilterInput
            type="text"
            placeholder="Busque por nome"
            value={guestNameFilter}
            onChange={(e) => setGuestNameFilter(e.target.value)}
          />
          <FilterDropdown value={filterType} onChange={handleFilterTypeChange}>
            <option value="Temporada">Temporada</option>
            <option value="All">Todos</option>
          </FilterDropdown>
        </FiltersWrapper>
        <CreateReservationButton onClick={toggleModal}>
          + Criar Reserva
        </CreateReservationButton>
        <ClearButton onClick={() => clearFilters()}>Limpar Filtros</ClearButton>
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
         <DatePickerContainer>
            {showDatePicker && (
              <DatePicker
                selected={selectedDateRange.startDate}
                onChange={handleDateRangeChange}
                startDate={selectedDateRange.startDate}
                endDate={selectedDateRange.endDate}
                selectsRange
                inline
                dateFormat="dd/MM/yyyy"
                locale="pt-BR"
              />
            )}
          </DatePickerContainer>
          <button style={{ marginRight: '100px' }} onClick={handlePrev}>{"<"}</button>
          {selectedDateRange.startDate && selectedDateRange.endDate ? (
            <span style={{ cursor: 'pointer' }} onClick={toggleDatePicker}>{`${format(selectedDateRange.startDate, "dd MMM yyyy", { locale: ptBR  })} - ${format(selectedDateRange.endDate, "dd MMM yyyy", { locale: ptBR  })}`}</span>
          ) : (
            <span style={{ cursor: 'pointer' }} onClick={toggleDatePicker}>{`${format(currentStartDate, "dd MMM yyyy", { locale: ptBR  })} - ${format(addDays(currentStartDate, daysInView.length - 1), "dd MMM yyyy", { locale: ptBR  })}`}</span>
          )}
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
      {loading ? (
        <LoadingSpinner />
      ) : (
        <CalendarContainer>
          <ScrollableContainer>
          {loadingNavigation && <LoadingSpinner />}
            <DaysRow>
              <RoomLabel>Quarto</RoomLabel>
              {daysInView.map((day, dayIndex) => (
                <DayCell key={dayIndex} isCurrentDay={isToday(day)} isWeekend={isWeekend(day)}>
                  <strong>{format(day, "EEE dd", { locale: ptBR }).slice(0, 3) + " " + format(day, "dd")}</strong>
                </DayCell>
              ))}
            </DaysRow>

            {apartments.map(apartment => (
              <RoomRow key={apartment.id}>
                <RoomLabel>{`Quarto ${apartment.number}`}</RoomLabel>
                {daysInView.map((day, dayIndex) => (
                  <DayCell key={dayIndex}>
                    {getReservationBars(apartment.number, day).map((bar) => (
                      <ReservationBar
                        key={bar.id}
                        style={{
                          left: `${bar.startOffset}%`, // Relative to DayCell
                          width: `${bar.width}%`,      // Fit within DayCell
                          top: `${bar.stackIndex * 40}px`,
                        }}
                        ischeckedout={bar.ischeckedout}
                        checkin={bar.checkin}
                        checkout={bar.checkout}
                        checkinAt={bar.checkinAt}
                        checkoutAt={bar.checkoutAt}
                        onClick={() => handleReservationClick(bar)}
                      >
                        <strong>{bar.guest_name}</strong>
                        <Tooltip className="tooltip">
                          <p><strong>Hóspede:</strong> {bar.guest_name}</p>
                        </Tooltip>
                      </ReservationBar>
                    ))}

                  </DayCell>
                ))}
              </RoomRow>
              
            ))}
            <OccupationRow>
                <OccupationLabel>Ocupação</OccupationLabel>
                {daysInView.map((day, dayIndex) => (
                  <OccupationCell key={dayIndex}>
                    <p>{getTotalGuestsForDay(day)}</p>
                  </OccupationCell>
                ))}
              </OccupationRow>
          </ScrollableContainer>
        </CalendarContainer>
      )}
      
      {isModalOpen && (
        <ReservationCreationModal
          onClose={toggleModal}
          loadReservations={fetchReservations}
          apartments={apartments}
        />
      )}
      {selectedReservation && (
          <ReservationModal
            closeModal={closeModal}
            selectedReservation={selectedReservation}
            updateReservationTime={updateReservationTime}
            loadData={loadData}
          />
        )}
      <RodapeCalendar />
    </CalendarWrapper>
  );
};

export default ReservationCalendar;
