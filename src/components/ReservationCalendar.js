import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isBefore,
  isAfter,
  min,
  max,
  isDate,
  parseISO,
} from "date-fns";
import "./ReservationCalendar.css";

const ReservationCalendar = () => {
  const [currentWeek, setCurrentWeek] = useState(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [apartments, setApartments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch apartments and reservations from the API
  useEffect(() => {
    const fetchApartments = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/apartments/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Set apartments based on the response
        setApartments(response.data.map(apartment => `Apartment ${apartment.id}`));
      } catch (error) {
        console.error("Error fetching apartments:", error);
      }
    };

    const fetchReservations = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/reservations/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReservations(
          response.data.map(reservation => ({
            name: reservation.guest_name,
            apartment: `Apartment ${reservation.apartment}`,
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
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });

  const getReservationSpan = (reservation, day) => {
    const startDate = isDate(day) ? day : parseISO(day);
    const reservationStartDate = isDate(reservation.beginDate)
      ? reservation.beginDate
      : parseISO(reservation.beginDate);
    const reservationEndDate = isDate(reservation.endDate)
      ? reservation.endDate
      : parseISO(reservation.endDate);

    const displayStart = max([startDate, reservationStartDate]);
    const displayEnd = min([weekEnd, reservationEndDate]);

    return (displayEnd - displayStart) / (1000 * 60 * 60 * 24) + 1;
  };

  const getReservationsForDateAndApartment = (day, apartment) => {
    return reservations
      .filter(
        (reservation) =>
          reservation.apartment === apartment &&
          isBefore(reservation.beginDate, addDays(day, 7)) &&
          isAfter(reservation.endDate, day)
      )
      .map((reservation) => {
        return { ...reservation, span: getReservationSpan(reservation, day) };
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="calendar">
      <header className="calendar-header">
        <button onClick={handlePrevWeek}>Previous Week</button>
        <h2>{`${format(currentWeek, "MMM dd")} - ${format(
          addDays(currentWeek, 6),
          "MMM dd"
        )}`}</h2>
        <button onClick={handleNextWeek}>Next Week</button>
      </header>

      <div className="calendar-grid">
        <div className="calendar-days">
          <div className="calendar-empty-cell"></div>
          {daysOfWeek.map((day, index) => (
            <div key={index} className="calendar-day">
              <div>{format(day, "EEEE")}</div>
              <div>{format(day, "MMM dd")}</div>
            </div>
          ))}
        </div>

        {apartments.map((apartment, index) => (
          <div key={index} className="calendar-row">
            <div className="calendar-apartment">{apartment}</div>
            {daysOfWeek.map((day, dayIndex) => {
              const reservationForCell = getReservationsForDateAndApartment(
                day,
                apartment
              ).find(
                (reservation) =>
                  format(reservation.beginDate, "yyyy-MM-dd") ===
                    format(day, "yyyy-MM-dd") ||
                  (isBefore(reservation.beginDate, day) &&
                    isAfter(reservation.endDate, day))
              );
              
              if (reservationForCell) {
                return (
                  <div
                    key={dayIndex}
                    className="calendar-cell reservation"
                    style={{ gridColumn: `span ${reservationForCell.span}` }}
                  >
                    {reservationForCell.name}
                  </div>
                );
              }

              return <div key={dayIndex} className="calendar-cell"></div>;
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReservationCalendar;
