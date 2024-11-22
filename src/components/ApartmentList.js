// src/components/ApartmentList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Styled components for ApartmentList as cards
const ApartmentListContainer = styled.div`
    margin-top: 100px;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem;
`;

const ApartmentCard = styled.div`
    background-color: ${({ status }) =>
        status === 0
            ? '#36a2eb' // free
            : status === 1
            ? '#ff6384' // ocuped
            : '#ffce56'};
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
    color: #333;
    margin-bottom: 0.5rem;
    color: #fff;
`;

const MaxOccupancy = styled.span`
    font-size: 14px;
    color: #fff;
`;

const Loader = styled.div`
    text-align: center;
    font-size: 18px;
    color: #007bff;
    margin-top: 2rem;
`;

const ChartContainer = styled.div`
    display: flex;
    justify-content: space-around;
    margin: 2rem auto;
    width: 80%;
`;

const ChartWrapper = styled.div`
    width: 150px;
    height: 150px;
    text-align: center;
`;

function ApartmentList() {
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('accessToken');
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/apartments/`, {
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

    const statusCounts = apartments.reduce(
        (acc, apartment) => {
            if (apartment.status === 0) {
                acc.available += 1;
            } else if (apartment.status === 1) {
                acc.occupied += 1;
            } else if (apartment.status === 2) {
                acc.maintenance += 1;
            }
            return acc;
        },
        { available: 0, occupied: 0, maintenance: 0 }
    );

    const totalApartments = apartments.length;

    const createDonutData = (count, label, color) => ({
        labels: [label, 'outros'],
        datasets: [
            {
                data: [count, totalApartments - count],
                backgroundColor: [color, '#e9ecef'],
                hoverBackgroundColor: [color, '#e9ecef'],
            },
        ],
    });

    return (
        <>
            {loading ? (
                <Loader>Loading Apartments...</Loader>
            ) : (
                <>
                    {/* Chart Section */}
                    <ChartContainer>
                        <ChartWrapper>
                            <h3>Ocupados</h3>
                            <Doughnut
                                data={createDonutData(statusCounts.occupied, 'Ocupados', '#ff6384')}
                                options={{
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: 'top',
                                        },
                                    },
                                }}
                            />
                        </ChartWrapper>
                        <ChartWrapper>
                            <h3>Disponíveis</h3>
                            <Doughnut
                                data={createDonutData(statusCounts.available, 'Disponíveis', '#36a2eb')}
                                options={{
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: 'top',
                                        },
                                    },
                                }}
                            />
                        </ChartWrapper>
                        <ChartWrapper>
                            <h3>Manutenção</h3>
                            <Doughnut
                                data={createDonutData(statusCounts.maintenance, 'Manutenção', '#ffce56')}
                                options={{
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: 'top',
                                        },
                                    },
                                }}
                            />
                        </ChartWrapper>
                    </ChartContainer>

                    {/* Apartment List Section */}
                    <ApartmentListContainer>
                        {apartments.map(apartment => (
                            <ApartmentCard key={apartment.id} status={apartment.status}>
                                <ApartmentInfo>Apartamento: {apartment.number}</ApartmentInfo>
                                <MaxOccupancy>Status: {apartment.status}</MaxOccupancy>
                                <MaxOccupancy>Tipo: {apartment.type}</MaxOccupancy>
                                <MaxOccupancy>Capacidade: {apartment.max_occupation}</MaxOccupancy>
                            </ApartmentCard>
                        ))}
                    </ApartmentListContainer>
                </>
            )}
        </>
    );
}

export default ApartmentList;
