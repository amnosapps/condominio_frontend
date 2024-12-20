import React from 'react';
import styled from 'styled-components';

const ApartmentCardContainer = styled.div`
    background-color: ${({ status }) =>
        status === 0
            ? '#36a2eb' // free
            : status === 1
            ? '#ff6384' // occupied
            : '#ffce56'}; // maintenance
    padding: 1.5rem;
    border: 1px solid #e3e7ed;
    border-radius: 8px;
    width: 180px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s, box-shadow 0.3s;
    cursor: pointer;

    &:hover {
        background-color: ${({ status }) =>
            status === 0
                ? '#d1f0da'
                : status === 1
                ? '#f8d7da'
                : '#ffe69a'};
        box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.15);
    }

    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
`;

const ApartmentInfo = styled.div`
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 0.5rem;
`;

const ApartmentDescription = styled.span`
    font-size: 14px;
    color: #fff;
    width: 100%;
`;

function ApartmentCard({ apartment, onClick }) {
    return (
        <ApartmentCardContainer status={apartment.status} onClick={onClick}>
            <ApartmentInfo>Apartamento: {apartment.number}</ApartmentInfo>
            <ApartmentDescription>Status: {apartment.status_name}</ApartmentDescription>
            <ApartmentDescription>Tipo: {apartment.type_name}</ApartmentDescription>
            <ApartmentDescription>Capacidade: {apartment.max_occupation}</ApartmentDescription>
            <ApartmentDescription>Dono: {apartment.owner_details?.name}</ApartmentDescription>
        </ApartmentCardContainer>
    );
}

export default ApartmentCard;
