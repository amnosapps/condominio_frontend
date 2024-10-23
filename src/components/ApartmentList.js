// src/components/ApartmentList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import DashboardLayout from './DashboardLayout';

// Styled components for ApartmentList
const ApartmentListContainer = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

const ApartmentItem = styled.li`
    background-color: #f9fafc;
    padding: 1rem;
    border: 1px solid #e3e7ed;
    border-radius: 6px;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 0.3s, box-shadow 0.3s;

    &:hover {
        background-color: #f1f3f5;
        box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.05);
    }
`;

const ApartmentInfo = styled.div`
    font-size: 16px;
    color: #555;
`;

const MaxOccupancy = styled.span`
    font-size: 14px;
    color: #888;
`;

const Loader = styled.div`
    text-align: center;
    font-size: 18px;
    color: #007bff;
`;

function ApartmentList() {
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('accessToken');
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/apartments/', {
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
        <DashboardLayout>
            {loading ? (
                <Loader>Loading Apartments...</Loader>
            ) : (
                <ApartmentListContainer>
                    {apartments.map(apartment => (
                        <ApartmentItem key={apartment.id}>
                            <ApartmentInfo>Apartment ID: {apartment.id}</ApartmentInfo>
                            <MaxOccupancy>Max Occupancy: {apartment.max_occupation}</MaxOccupancy>
                        </ApartmentItem>
                    ))}
                </ApartmentListContainer>
            )}
        </DashboardLayout>
    );
}

export default ApartmentList;
