// src/components/ReservationForm.js

import React, { useState } from 'react';
import axios from 'axios';

function ReservationForm() {
    const [apartmentId, setApartmentId] = useState('');
    const [guestName, setGuestName] = useState('');
    const [guestDocument, setGuestDocument] = useState('');
    const [checkin, setCheckin] = useState('');
    const [checkout, setCheckout] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(`${process.env.API_URL}/api/reservations/`, {
            apartment: apartmentId,
            guest_name: guestName,
            guest_document: guestDocument,
            checkin: checkin,
            checkout: checkout,
        })
        .then(response => {
            console.log('Reservation created!', response.data);
        })
        .catch(error => {
            console.error('There was an error creating the reservation!', error);
        });
    };

    return (
        <>
            <h2>Make a Reservation</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Apartment ID:</label>
                    <input type="number" value={apartmentId} onChange={(e) => setApartmentId(e.target.value)} />
                </div>
                <div>
                    <label>Guest Name:</label>
                    <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                </div>
                <div>
                    <label>Guest Document:</label>
                    <input type="text" value={guestDocument} onChange={(e) => setGuestDocument(e.target.value)} />
                </div>
                <div>
                    <label>Check-in:</label>
                    <input type="time" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
                </div>
                <div>
                    <label>Check-out:</label>
                    <input type="time" value={checkout} onChange={(e) => setCheckout(e.target.value)} />
                </div>
                <button type="submit">Submit</button>
            </form>
        </>
    );
}

export default ReservationForm;
