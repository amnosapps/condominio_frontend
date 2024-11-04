// src/components/ReservationCalendar.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styled from 'styled-components';

// Styled container for calendar
const CalendarContainer = styled.div`
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const ReservationInfo = styled.div`
    font-size: 14px;
    color: #333;
    text-align: center;
    margin-top: 1rem;
`;

const calendarStyles = `
.react-calendar__tile.highlight {
    background-color: #fdecea;
    border-radius: 50%;
    color: #333;
}
`;

function ReservationCalendar() {
    const [reservations, setReservations] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [reservationsForSelectedDate, setReservationsForSelectedDate] = useState([]);

    useEffect(() => {
        const fetchReservations = async () => {
            const token = localStorage.getItem('accessToken');
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/reservations/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setReservations(response.data);
            } catch (error) {
                console.error('Error fetching reservations:', error);
            }
        };
        fetchReservations();
    }, []);

    // Filter reservations for the selected date
    useEffect(() => {
        const filteredReservations = reservations.filter(reservation => {
            const checkinDate = new Date(reservation.checkin);
            const checkoutDate = new Date(reservation.checkout);

            return (
                selectedDate >= checkinDate &&
                selectedDate <= checkoutDate
            );
        });
        setReservationsForSelectedDate(filteredReservations);
    }, [selectedDate, reservations]);

    // Check if a date is within any reservation range
    const isDateWithinReservation = date => {
        return reservations.some(reservation => {
            const checkinDate = new Date(reservation.checkin);
            const checkoutDate = new Date(reservation.checkout);
            return date >= checkinDate && date <= checkoutDate;
        });
    };

    return (
        <>
            <style>{calendarStyles}</style> {/* Add the styles here */}
            <CalendarContainer>
                <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    tileClassName={({ date, view }) => {
                        if (view === 'month' && isDateWithinReservation(date)) {
                            return 'highlight';
                        }
                    }}
                />
                <ReservationInfo>
                    {reservationsForSelectedDate.length > 0 ? (
                        <div>
                            <h3>Reservas para {selectedDate.toDateString()}</h3>
                            <ul>
                                {reservationsForSelectedDate.map(reservation => (
                                    <li key={reservation.id}>
                                        Hospede: {reservation.guest_name} <br />
                                        Apartamento: {reservation.apartment} <br />
                                        Check-in: {new Date(reservation.checkin).toLocaleDateString()} <br />
                                        Check-out: {new Date(reservation.checkout).toLocaleDateString()}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p>Sem reservas para essa data.</p>
                    )}
                </ReservationInfo>
            </CalendarContainer>
        </>
    );
}

export default ReservationCalendar;
