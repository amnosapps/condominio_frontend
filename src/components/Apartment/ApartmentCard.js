import React from 'react';
import styled from 'styled-components';
import { FaUser, FaDoorOpen, FaHome, FaUsers, FaCircle } from 'react-icons/fa';

const ApartmentCardContainer = styled.div`
    background-color: ${({ status }) =>
        status === 0
            ? '#36a2eb' // free
            : status === 1
            ? '#FF9800' // occupied
            : '#7c7c7c'}; // maintenance
    padding: 0.5rem;
    border: 1px solid #e3e7ed;
    border-radius: 8px;
    width: 130px; /* Slightly wider */
    height: 160px; /* Adjusted height */
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s, box-shadow 0.3s;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    text-align: center;
    position: relative;

    &:hover {
        background-color: ${({ status }) =>
            status === 0
                ? '#d1f0da'
                : status === 1
                ? '#f8d7da'
                : '#ffe69a'};
        box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.15);
    }
`;

const ApartmentNumber = styled.div`
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    position: absolute;
    top: 8px;
    left: 8px;
`;

const IconContainer = styled.div`
    font-size: 40px;
    color: #fff;
    margin: 10px 0;
`;

const InfoContainer = styled.div`
    width: 100%;
    font-size: 12px;
    color: #fff;
    text-align: left;
    padding: 0.5rem;
    line-height: 1.5;

    & > div {
        display: flex;
        align-items: center;
        margin-bottom: 0.25rem;

        & > svg {
            margin-right: 6px;
            font-size: 17px;
        }
    }
`;

function ApartmentCard({ apartment, onClick }) {
    const today = new Date();

    const isReservationActive = (reservation) => {
        const checkin = new Date(reservation.checkin);
        const checkout = new Date(reservation.checkout);
        return reservation.active && (today >= checkin && today <= checkout);
    };

    const activeReservation = apartment?.last_reservations?.find(isReservationActive);

    const guestCount = activeReservation
        ? (activeReservation?.guests_qty || 0) + 1
        : 0;

    return (
        <ApartmentCardContainer status={apartment.status} onClick={onClick}>
            <ApartmentNumber>{apartment.number}</ApartmentNumber>
            <IconContainer>
                {apartment.type_name === 'Moradia' ? <FaHome /> : <FaDoorOpen />}
            </IconContainer>
            <InfoContainer>
                <div>
                    <FaCircle />
                    {apartment.status_name}
                </div>
                <div>
                    <FaHome />
                    {apartment.type_name}
                </div>
                {apartment.type_name === 'Moradia' && (
                    <div>
                        <FaUsers />
                        Pessoas: {apartment.residents?.length || 0}
                    </div>
                )}
                {apartment.type_name === 'Temporada' && (
                    <div>
                        <FaUsers />
                        Pessoas: {activeReservation ? guestCount : 0}
                    </div>
                )}
            </InfoContainer>
        </ApartmentCardContainer>
    );
}

export default ApartmentCard;
