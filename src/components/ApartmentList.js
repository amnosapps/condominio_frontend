// src/components/ApartmentList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

// Styled components for ApartmentList as cards
const ApartmentListContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem;
`;

// Conditional styling based on apartment status
const ApartmentCard = styled.div`
    background-color: ${({ status }) => (status === 0 ? '#e0f7e9' : '#fdecea')}; /* Light green for 0, light red for 1 */
    padding: 1.5rem;
    border: 1px solid #e3e7ed;
    border-radius: 8px;
    width: 250px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s, box-shadow 0.3s;

    &:hover {
        background-color: ${({ status }) => (status === 0 ? '#d1f0da' : '#f8d7da')}; /* Slightly darker on hover */
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
    color: #333;
    margin-bottom: 0.5rem;
`;

const MaxOccupancy = styled.span`
    font-size: 14px;
    color: #555;
`;

const Loader = styled.div`
    text-align: center;
    font-size: 18px;
    color: #007bff;
    margin-top: 2rem;
`;

function ApartmentList() {
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('accessToken');
            try {
                const response = await axios.get(`${process.env.API_URL}/api/apartments/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setApartments(response.data);
            } catch (error) {
                console.error('Error fetching apartments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <>
            {loading ? (
                <Loader>Loading Apartments...</Loader>
            ) : (
                <ApartmentListContainer>
                    {apartments.map(apartment => (
                        <ApartmentCard key={apartment.id} status={apartment.status}>
                            <ApartmentInfo>Apartamento: {apartment.id}</ApartmentInfo>
                            <MaxOccupancy>Status de Ocupação: {apartment.status}</MaxOccupancy>
                            <MaxOccupancy>Tipo de Ocupação: {apartment.type}</MaxOccupancy>
                            <MaxOccupancy>Capacidade: {apartment.max_occupation}</MaxOccupancy>
                        </ApartmentCard>
                    ))}
                </ApartmentListContainer>
            )}
        </>
    );
}

export default ApartmentList;
