import React, { useState, useEffect, useRef   } from "react";
import { useParams } from 'react-router-dom';
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
  subDays,
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
import ApartamentModal from './Apartment/ApartmentModal';
import api from "../services/api";

registerLocale("pt-BR", ptBR);


// Styled components for the UI
const CalendarContainer = styled.div`
  width: 100%;
  height: 100%;
  margin: auto;
  font-family: 'Roboto', Arial, sans-serif;
  background-color: #F5F5F5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  max-width: 1400px;
  max-height: 98%;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  width: ${(props) => `${props.daysInView * 120}px`}; 
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid #e0e0e0;

  > strong {
    flex: 0 0 120px; /* Fixed width of 120px */
    position: sticky;
    left: 0;
    z-index: 20;
    padding: 15px;
    background-color: #f5f5f5;
    text-align: center;
    font-weight: bold;
    color: #666;
    border-right: 1px solid #e0e0e0;
    border-top: 1px solid #e0e0e0;
  }

  @media (max-width: 768px) {
    width: ${(props) => `${props.daysInView * 100}px`};
  }
`;

const DayCell = styled.div`
  flex: 0 0 120px; /* Fixed width for each day cell */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 0.9rem;
  color: #555;
  padding: 8px;
  border-right: 1px solid #e0e0e0;
  border-top: 1px solid #e0e0e0;

  background-color: ${(props) =>
    props.isCurrentDay ? '#e3f2fd' : props.isWeekend ? '#ffe0dd' : 'white'};
  transition: background-color 0.3s;

  &:last-child {
    border-right: none; /* Remove border for the last cell */
  }

  &:hover {
    background-color: #f1f1f1;
  }
`;

const CalendarDayCell = styled.div`
  flex: 0 0 120px; /* Fixed width for each day cell */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #555;
  padding: 8px;
  border-right: 1px solid #e0e0e0;
  border-top: 1px solid #e0e0e0;

  background-color: ${(props) =>
    props.isCurrentDay ? '#e3f2fd' : props.isWeekend ? '#ffe0dd' : 'white'};
  transition: background-color 0.3s;

  &:last-child {
    border-right: none; /* Remove border for the last cell */
  }

  &:hover {
    background-color: #f1f1f1;
  }
`;

const RoomRow = styled.div`
  display: flex;
  align-items: stretch; /* Ensure content aligns properly */
  width: ${(props) => `${props.daysInView * 120}px`};

  &:nth-child(even) {
    background-color: #fafafa;
  }
`;


const RoomLabel = styled.div`
  flex: 0 0 120px; /* Fixed width of 120px */
  position: sticky;
  left: 0;
  z-index: 10;
  padding: 15px;
  background-color: #f5f5f5;
  text-align: center;
  font-weight: bold;
  color: #666;
  border-right: 1px solid #e0e0e0;
  border-top: 1px solid #e0e0e0;
  cursor: pointer;

  &:hover {
    opacity: 0.7
  }
`;

const OccupationRow = styled.div`
  width: ${(props) => `${props.daysInView * 120}px`}; 
  display: flex;
  align-items: stretch; 
  border-top: 1px solid #e0e0e0;
  position: sticky; /* Makes the row stick in place */
  bottom: 0; /* Sticks to the bottom of the container */
  background-color: #ffffff; /* Ensure consistent background color */
  z-index: 10; /* Ensure it is above other content */
  box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.1); /* Add subtle shadow for visibility */
  height: 30px;

  &:nth-child(even) {
    background-color: #fafafa;
  }
`;

const OccupationLabel = styled.div`
  flex: 0 0 120px; /* Fixed width of 120px */
  padding: 15px;
  left: 0;
  position: sticky;
  background-color: #f5f5f5;
  text-align: center;
  font-weight: bold;
  color: #666;
  border-right: 1px solid #e0e0e0;
  justify-content: center;
  align-items: center;
  display: flex;
  z-index: 25; /* Ensure it stays on top */
`;

const OccupationCell = styled.div`
  flex: 0 0 120px; /* Fixed width for each day cell */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #555;
  padding: 8px;
  border-right: 1px solid #e0e0e0;
  border-top: 1px solid #e0e0e0;

  background-color: ${(props) =>
    props.isCurrentDay ? '#e3f2fd' : props.isWeekend ? '#ffe0dd' : 'white'};
  transition: background-color 0.3s;

  &:last-child {
    border-right: none; /* Remove border for the last cell */
  }

  &:hover {
    background-color: #f1f1f1;
  }
`;


const ReservationBar = styled.div`
  position: absolute;
  left: ${(props) => `calc(${props.startOffset}% + 5px)`}; 
  background-color: ${(props) => {
    // checkin proximo (reserva futura)
    if (!props.checkinAt && isToday(props.checkin)) {
      return '#FF9800'; // orange
    }

    // checkin pendente
    else if (!props.checkinAt && isAfter(new Date(), props.checkin)) {
      return '#1E90FF'; // blue
    }

    // reserva vigente (hospedagem em curso)
    else if (props.checkinAt && !props.checkoutAt && isBefore(new Date(), props.checkout)) {
      return '#539e56'; // green
    }

    // checkout pendente (hospedagem em curso)
    else if (props.checkinAt && !props.checkoutAt && isAfter(new Date(), props.checkout)) {
      return '#539e56'; // green
    }

    // reserva encerrada
    else if (props.checkinAt && props.checkoutAt) {
      return '#9E9E9E'; // Grey if checked in and checked out
    }

    return '#FF9800'; // futuras reservas
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

  > strong {
    font-size: 14px;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  font-size: 0.75rem;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transform: translate(-50%, -10px);
  transition: opacity 0.2s ease-in-out;
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;

  > div {
    margin-bottom: 10px;
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
  padding: 8px 6px;
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
  margin-right: 5px;
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
    z-index: 200;
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
  width: 100%;
  height: calc(100vh - 200px);
  overflow: auto; /* Single scrollable container */
  position: relative;
  scrollbar-width: thin;
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const LoadingSpinner = styled.div`
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
const ReservationCalendar = ({ profile, selectedCondominium }) => {
  const params = useParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingNavigation, setLoadingNavigation] = useState(false);

  const [viewType, setViewType] = useState("15");
  const [currentStartDate, setCurrentStartDate] = useState(new Date());
  const [apartments, setApartments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingApartments, setLoadingApartments] = useState(false);

  const [hoveredReservation, setHoveredReservation] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (reservationId, event) => {
    setHoveredReservation(reservationId);
    const { clientX, clientY } = event;
    setTooltipPosition({ x: clientX, y: clientY });
  };

  const handleMouseLeave = () => {
    setHoveredReservation(null);
  };

  const [guestFilter, setGuestFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedApartment, setSelectedApartment] = useState(null);

  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [filterType, setFilterType] = useState("Temporada"); // Default filter for "Temporada"

  const scrollableRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1); // For horizontal pagination

  const [modalOpenApto, setModalOpenApto] = useState(false);

  const fetchApartments = async () => {
    const token = localStorage.getItem("accessToken");
    setLoadingApartments(true); // Start loading
    try {
      const response = await api.get(`/api/apartments/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { condominium: selectedCondominium.name },
      });

      const filteredApartments = response.data.filter((apartment) =>
        filterType === "Todos" ? true : apartment.type_name === filterType
      );

      setApartments(filteredApartments);
      setLoadingApartments(false);
    } catch (error) {
      console.error("Error fetching apartments:", error);
    }
  };

  const reservationCache = useRef({});

  const fetchReservations = async (page = 1, direction = "right", useCache = true) => {
    const token = localStorage.getItem("accessToken");
  
    // Calculate start and end dates based on the current view
    const startDate = addDays(
      currentStartDate,
      direction === "right" ? (page - 1) * parseInt(viewType, 10) : -(page * parseInt(viewType, 10))
    )
    startDate.setUTCHours(0, 0, 37, 401);
  
    const endDate = addDays(startDate, parseInt(viewType, 10));
    endDate.setUTCHours(23, 59, 37, 401);

    const rangeKey = `${startDate.toISOString()}_${endDate.toISOString()}`;
  
    // Use cached data if available
    if (useCache && reservationCache.current[rangeKey]) {
      setReservations((prevReservations) => [
        ...prevReservations,
        ...reservationCache.current[rangeKey].filter(
          (newRes) => !prevReservations.find((res) => res.id === newRes.id)
        ),
      ]);
      return;
    }

    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();
  
    try {
      setLoadingNavigation(true);
      const response = await api.get(`/api/reservations/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          condominium: selectedCondominium.name,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
        },
      });
  
      const newReservations = response.data.map((reservation) => ({
        id: reservation.id,
        guest_name: reservation.guest_name,
        observations: reservation.observations,
        guest_document: reservation.guest_document,
        document_type: reservation.document_type,
        guest_phone: reservation.guest_phone || "",
        guests_qty: reservation.guests_qty,
        apt_number: reservation.apt_number,
        apartment_owner: reservation.apt_owner_name,
        photos: reservation.photo,
        image_base64: reservation.image_base64 || null,
        user_device: reservation.user_device || null,
        active: reservation.active,
        additional_photos: reservation.additional_photos || [],
        checkin: reservation.checkin ? parseISO(reservation.checkin) : null,
        checkout: reservation.checkout ? parseISO(reservation.checkout) : null,
        hour_checkin: reservation.hour_checkin ? reservation.hour_checkin : "15:00",
        hour_checkout: reservation.hour_checkout ? reservation.hour_checkout : "12:00",
        checkin_at: reservation.checkin_at ? parseISO(reservation.checkin_at) : null,
        checkout_at: reservation.checkout_at ? parseISO(reservation.checkout_at) : null,
        has_children: reservation.has_children,
        address: reservation.address,
        vehicle_plate: reservation.vehicle_plate,
        additional_guests: reservation.additional_guests,
        reservation_file: reservation.reservation_file,
      }));
  
      // Update cache if enabled
      if (useCache) {
        reservationCache.current[rangeKey] = newReservations;
      }
  
      // Update state with new reservations (avoid duplicates)
      setReservations((prevReservations) => [
        ...prevReservations.filter(
          (res) => !newReservations.find((newRes) => newRes.id === res.id)
        ),
        ...newReservations,
      ]);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoadingNavigation(false);
    }
  };
  
  const loadData = async () => {
    await Promise.all([fetchReservations(currentPage)]);
    setLoading(false);
  };

  useEffect(() => {
    if (selectedCondominium) {
      fetchApartments();
    }
  }, [selectedCondominium]);

  useEffect(() => {
    if (selectedCondominium) {
      loadData();
    }
  }, [selectedCondominium, currentPage, filterType]);  

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value); // Update the filter type
  };

  // useEffect(() => {
  //   const reopenModalId = sessionStorage.getItem("reopenModalId");
  //   if (reopenModalId) {
  //     sessionStorage.removeItem("reopenModalId"); // Clear it to prevent reopening on every reload
  //     const reservation = reservations.find(
  //       (res) => res.id === parseInt(reopenModalId, 10)
  //     );
  //     if (reservation) {
  //       setSelectedReservation(reservation);
  //     }
  //   }
  // }, [reservations]);

  const getTotalGuestsForDay = (day) => {
    function normalizeDate(date) {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
    }

    var total_guests = reservations.filter((reservation) => reservation.active &&
      normalizeDate(day) >= normalizeDate(reservation.checkin) && 
      normalizeDate(day) <= normalizeDate(reservation.checkout) && !reservation.checkout_at)
    .reduce((totalGuests, reservation) => totalGuests + (reservation.guests_qty + 1),0);

    return total_guests
  };

  const getTotalResidentsForDay = (day) => {
    return apartments
      .filter((apartment) => apartment.type_name === "Moradia")
      .reduce((totalResidents, apartment) => totalResidents + (apartment.residents?.length || 0), 0);
  };

  const getTotalGuestsAndResidentsForDay = (day) => {
    const totalGuests = getTotalGuestsForDay(day);
    const totalResidents = getTotalResidentsForDay(day);
    return totalGuests + totalResidents;
  };

  const handleReservationClick = (reservation, apartment) => {
    setSelectedReservation(reservation);
    setSelectedApartment(apartment);
  };

  const handleScroll = () => {
    if (scrollableRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollableRef.current;
  
      if (scrollLeft + clientWidth >= scrollWidth - 50) {
        setCurrentPage((prevPage) => {
          fetchReservations(prevPage + 1, "right");
          return prevPage + 1;
        });
      }
  
      if (scrollLeft <= 50) {
        setCurrentPage((prevPage) => {
          if (prevPage > 1) {
            fetchReservations(prevPage - 1, "left");
          }
          return Math.max(prevPage - 1, 1);
        });
      }
    }
  };

  const daysInView = Array.from(
    { length: parseInt(viewType, 10) * currentPage },
    (_, i) => addDays(currentStartDate, i)
  );


  const handlePrev = async () => {
    const newStartDate = addDays(currentStartDate, -parseInt(viewType, 10));
    
    if (isBefore(newStartDate, startOfDay(new Date()))) {
      return; // Exit if the new start date is in the past
    }
  
    setCurrentStartDate(newStartDate);
  
    setReservations([]);
  
    await fetchReservations(currentPage, "left", false);
  }

  const handleNext = async () => {
    const newStartDate = addDays(currentStartDate, parseInt(viewType, 10));
    setCurrentStartDate(newStartDate);
  
    // Clear current reservations to avoid duplicates
    setReservations([]);
  
    // Fetch reservations for the new date range
    await fetchReservations(currentPage, "right", false);
  };

  const handleMonthChange = (event) => {
    const selectedMonthIndex = parseInt(event.target.value, 10);
    const newStartDate = setMonth(startOfMonth(currentStartDate), selectedMonthIndex);
    setCurrentStartDate(newStartDate);
  };

  const filteredReservations = reservations.filter((reservation) => {
    const matchesGuestName =
      guestFilter &&
      (reservation.guest_name?.toLowerCase().includes(guestFilter.toLowerCase()) ||
      String(reservation.id).includes(guestFilter));
  
    const matchesDateRange =
      (!startDateFilter || reservation.checkout >= parseISO(startDateFilter)) &&
      (!endDateFilter || reservation.checkin <= parseISO(endDateFilter));
  
    return (!guestFilter || matchesGuestName) && matchesDateRange;
  });
  

  const getReservationBars = (apartment, day) => {
    const roomReservations = filteredReservations
      .filter((reservation) => reservation.apt_number === apartment)
      .filter(
        (reservation) =>
          reservation.checkin <= endOfDay(day) &&
          reservation.checkout >= startOfDay(day)
      )
      .filter((reservation) => reservation.active && !reservation.checkout_at) 
      .sort((a, b) => a.checkin - b.checkin);
  
    const occupiedSlots = [];
    const bars = [];
  
    roomReservations.forEach((reservation) => {
      if (reservation.id === 119) {
        console.log(reservation)
      }
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

    if (isBefore(newStartDate, startOfDay(new Date()))) {
      return; // Exit if the new start date is in the past
    }

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

  const getGuest = () => {
    console.log("guestFilter - ", guestFilter)
    if (!guestFilter || !guestFilter.trim()) return;
    const matchingReservation = reservations?.find((reservation) =>
        reservation.guest_name?.toLowerCase().includes(guestFilter.toLowerCase()) ||
        String(reservation.id).includes(guestFilter)
    );
    console.log("--",matchingReservation)
    if (matchingReservation) {
        navigateToReservation(matchingReservation);
    }
}
  useEffect(() => {
    getGuest();
  }, [guestFilter, reservations]);

  const clearFilters = () => {
    setGuestFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setSelectedDateRange({ startDate: null, endDate: null });
    setCurrentStartDate(new Date()); // Reset to today's date
    setCurrentPage(1)
    fetchReservations(1, "right", false)
  };

  const closeModal = () => {
    setSelectedReservation(null);
  };

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
  
    setSelectedDateRange({ startDate: start, endDate: end });
  
    if (start) {
      setCurrentStartDate(start); // Align calendar's start date with the selected range
      fetchReservations(1, "right", false)
    }
  
    if (start && end) {
      setShowDatePicker(false); // Close the DatePicker
    }
  };

  const toggleDatePicker = () => {
    setShowDatePicker((prev) => !prev);
  };

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleEditClick = (apartment) => {
      setSelectedApartment(apartment);
      setModalOpenApto(true);
  };

  const handleModalClose = () => {
      setSelectedApartment(null);
      setModalOpenApto(false);
  };

  return (
    <CalendarWrapper>
      <FilterContainer>
        <CreateReservationButton onClick={toggleModal}>
          + Criar Reserva
        </CreateReservationButton>
        <FiltersWrapper>
          {/* <FilterInput
            type="text"
            placeholder="Busque uma reserva"
            value={guestFilter}
            onChange={(e) => setGuestFilter(e.target.value)}
          /> */}
          <FilterDropdown value={filterType} onChange={handleFilterTypeChange}>
            <option value="Temporada">Temporada</option>
            <option value="Todos">Todos</option>
          </FilterDropdown>
          <ClearButton onClick={() => clearFilters()}>Limpar Filtros</ClearButton>
        </FiltersWrapper>
      </FilterContainer>
      <CalendarHeader>
        <div>
          <div>
          <select onChange={(e) => setViewType(e.target.value)} value={viewType}>
            {/* <option value="7">Semana</option> */}
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
                // minDate={new Date()} // Restrict selection to today and future dates
              />
            )}
          </DatePickerContainer>
          {!isBefore(addDays(currentStartDate, -parseInt(viewType, 10)), startOfDay(new Date())) && (
            <button 
              style={{ marginRight: '100px' }} 
              onClick={handlePrev} 
              disabled={isBefore(addDays(currentStartDate, -parseInt(viewType, 10)), startOfDay(new Date()))}
            > 
              {"<"}
            </button>
          )}
         
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
              <option key={month} value={index}
                disabled={
                  isBefore(
                    new Date(currentStartDate.getFullYear(), index, 1), 
                    startOfDay(new Date())
                  )
                }
              >
                {month}
              </option>
            ))}
          </select>
          <select onChange={handleYearChange} value={currentStartDate.getFullYear()}>
            {generateYearRange().map((year) => (
              <option key={year} value={year}
               disabled={year < new Date().getFullYear()}
              >
                {year}
              </option>
            ))}
          </select>
        </div>
      </CalendarHeader>
      {loadingApartments ? (
        <LoadingSpinner />
      ) : (
        <CalendarContainer>
          <ScrollableContainer ref={scrollableRef} onScroll={handleScroll}>
          {loadingNavigation && <LoadingSpinner />}
            <DaysRow daysInView={daysInView.length}>
              <strong>Apto</strong>
              {daysInView.map((day, dayIndex) => (
                <CalendarDayCell key={dayIndex} isCurrentDay={isToday(day)} isWeekend={isWeekend(day)}>
                  <strong>{format(day, "EEE dd", { locale: ptBR }).slice(0, 3) + " " + format(day, "dd")}</strong>
                </CalendarDayCell>
              ))}
            </DaysRow>

            {modalOpenApto && (
              <ApartamentModal
                  selectedApartment={selectedApartment}
                  profile={profile}
                  onClose={handleModalClose}
                  fetchApartments={fetchApartments}
              />
            )}
              
            {apartments.map(apartment => (
              <RoomRow key={apartment.id} daysInView={daysInView.length}>
                <RoomLabel
                  onClick={() => handleEditClick(apartment)}
                >
                  {`Apto ${apartment.number}`}
                </RoomLabel>
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
                          onMouseEnter={(e) => handleMouseEnter(bar, e)}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => handleReservationClick(bar, apartment)}
                        >
                          <strong>
                            {bar.guest_name && bar.guest_name.split(" ").length > 1
                            ? `${bar.guest_name.split(" ")[0]} ${bar.guest_name.split(" ")[1][0]}.`
                            : bar.guest_name}

                          </strong>
                        </ReservationBar>
                    ))}

                  </DayCell>
                ))}
              </RoomRow>
              
            ))}
            <OccupationRow daysInView={daysInView.length}>
              <OccupationLabel>Hóspedes</OccupationLabel>
              {daysInView.map((day, dayIndex) => (
                <OccupationCell key={dayIndex}>
                  <p>{getTotalGuestsForDay(day)}</p>
                </OccupationCell>
              ))}
            </OccupationRow>

            
            {filterType === 'Todos' && (
              <>
                <OccupationRow daysInView={daysInView.length}>
                  <OccupationLabel>Moradores</OccupationLabel>
                  {daysInView.map((day, dayIndex) => (
                    <OccupationCell key={dayIndex}>
                      <p>{getTotalResidentsForDay(day)}</p>
                    </OccupationCell>
                  ))}
                </OccupationRow>
                
                <OccupationRow daysInView={daysInView.length}>
                  <OccupationLabel>Ocupação Total</OccupationLabel>
                  {daysInView.map((day, dayIndex) => (
                    <OccupationCell key={dayIndex}>
                      <p>{getTotalGuestsAndResidentsForDay(day)}</p>
                    </OccupationCell>
                  ))}
                </OccupationRow>
              </>
            )}
            
          </ScrollableContainer>
        </CalendarContainer>
      )}

      {hoveredReservation && (
        <Tooltip
          style={{
            top: tooltipPosition.y + 10,
            left: tooltipPosition.x + 10,
          }}
          visible={!!hoveredReservation}
        >
          <div><strong>Entrada:</strong> {format(hoveredReservation.checkin, 'dd/MM/yyyy')}</div>
          <div><strong>Saída:</strong> {format(hoveredReservation.checkout, 'dd/MM/yyyy')}</div>
          <div><strong>Acompanhantes:</strong> {hoveredReservation.guests_qty || 0}</div>
        </Tooltip>
      )}
      
      {isModalOpen && (
        <ReservationCreationModal
          onClose={toggleModal}
          fetchReservations={fetchReservations}
          apartments={apartments}
          profile={profile}
        />
      )}
      {selectedReservation && (
          <ReservationModal
            closeModal={closeModal}
            selectedReservation={selectedReservation}
            selectedApartment={selectedApartment}
            fetchReservations={fetchReservations}
            profile={profile}
            selectedCondominium={selectedCondominium}
          />
        )}
      <RodapeCalendar />
    </CalendarWrapper>
  );
};

export default ReservationCalendar;
