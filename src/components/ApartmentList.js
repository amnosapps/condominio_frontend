// src/components/ApartmentList.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

const ApartamentDescription = styled.span`
    font-size: 14px;
    color: #fff;
    width: 100%;
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

const Modal = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #ffffff;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    max-width: 500px;
    width: 100%;
`;

const Backdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
    color: #333333;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 2.2rem;
    cursor: pointer;
    color: #888888;

    &:hover {
        color: #000000;
    }
`;

const ModalContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const ModalLabel = styled.label`
    font-size: 1rem;
    font-weight: 500;
    color: #555555;
`;

const ModalSelect = styled.select`
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #cccccc;
    border-radius: 8px;

    &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 4px rgba(0, 123, 255, 0.5);
    }
`;

const ModalInput = styled.input`
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #cccccc;
    border-radius: 8px;

    &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 4px rgba(0, 123, 255, 0.5);
    }
`;

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
`;

const SaveButton = styled.button`
    background-color: #007bff;
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: #0056b3;
    }
`;

const CancelButton = styled(SaveButton)`
    background-color: #6c757d;

    &:hover {
        background-color: #5a6268;
    }
`;

const ReservationCard = styled.div`
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    h4 {
        font-size: 1rem;
        color: #343a40;
        margin: 0;
    }

    span {
        font-size: 0.9rem;
        color: #495057;
    }
`;


function ApartmentList({ condominium }) {
    const params = useParams();
    const selectedCondominium = condominium || params.condominium;
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApartment, setSelectedApartment] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const [filter, setFilter] = useState(null);

    const fetchUserProfile = async () => {
        const token = localStorage.getItem('accessToken');

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProfile(response.data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('accessToken');
            try {
                await fetchUserProfile();
                
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/apartments/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: { condominium: selectedCondominium }, // Move here
                });
                setApartments(response.data);
            } catch (error) {
                console.error('Error fetching apartments:', error);
            } finally {
                setLoading(false);
            }
        };
        if (selectedCondominium) {
            fetchData();
        }
    }, [selectedCondominium]);

    const handleEditClick = (apartment) => {
        if (profile?.is_staff) {
            setSelectedApartment(apartment);
            setModalOpen(true);
        }
    };

    const handleModalClose = () => {
        setSelectedApartment(null);
        setModalOpen(false);
    };

    const handleSave = async () => {
        if (!selectedApartment) return;

        const token = localStorage.getItem('accessToken');
        try {
            await axios.patch(
                `${process.env.REACT_APP_API_URL}/api/apartments/${selectedApartment.id}/`,
                {
                    status: selectedApartment.status,
                    number: selectedApartment.number,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // Update the local list of apartments
            setApartments((prev) =>
                prev.map((apt) =>
                    apt.id === selectedApartment.id ? selectedApartment : apt
                )
            );
        } catch (error) {
            console.error('Error saving apartment:', error);
        } finally {
            setModalOpen(false);
        }
    };

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

    const handleChartClick = (label) => {
        switch (label) {
            case 'Ocupados':
                setFilter(1);
                break;
            case 'Disponíveis':
                setFilter(0);
                break;
            case 'Manutenção':
                setFilter(2);
                break;
            default:
                setFilter(null);
        }
    };

    const filteredApartments = filter !== null
    ? apartments.filter((apartment) => apartment.status === filter)
    : apartments;

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
                                        tooltip: {
                                            callbacks: {
                                                label: (tooltipItem) => tooltipItem.label,
                                            },
                                        },
                                    },
                                    onClick: (_, elements) => {
                                        if (elements.length > 0) {
                                            const chartIndex = elements[0].index;
                                            const label = ['Ocupados', 'Disponíveis', 'Manutenção'][chartIndex];
                                            handleChartClick(label);
                                        }
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
                                        tooltip: {
                                            callbacks: {
                                                label: (tooltipItem) => tooltipItem.label,
                                            },
                                        },
                                    },
                                    onClick: (_, elements) => {
                                        if (elements.length > 0) {
                                            const chartIndex = elements[0].index;
                                            const label = ['Disponíveis', 'Ocupados', 'Manutenção'][chartIndex];
                                            handleChartClick(label);
                                        }
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
                                    tooltip: {
                                        callbacks: {
                                            label: (tooltipItem) => tooltipItem.label,
                                        },
                                    },
                                    onClick: (_, elements) => {
                                        if (elements.length > 0) {
                                            const chartIndex = elements[0].index;
                                            const label = ['Manutenção', 'Disponíveis', 'Ocupados'][chartIndex];
                                            handleChartClick(label);
                                        }
                                    },
                                }}
                            />
                        </ChartWrapper>
                    </ChartContainer>

                    {/* Apartment List Section */}
                    <ApartmentListContainer>
                        {filteredApartments.map(apartment => (
                            <ApartmentCard key={apartment.id} status={apartment.status} onClick={() => handleEditClick(apartment)}>
                                <ApartmentInfo>Apartamento: {apartment.number}</ApartmentInfo>
                                <ApartamentDescription>Status: {apartment.status_name}</ApartamentDescription>
                                <ApartamentDescription>Tipo: {apartment.type_name}</ApartamentDescription>
                                <ApartamentDescription>Capacidade: {apartment.max_occupation}</ApartamentDescription>
                            </ApartmentCard>
                        ))}
                    </ApartmentListContainer>
                    {modalOpen && (
                        <>
                            <Backdrop onClick={handleModalClose} />
                                <Modal>
                                    <ModalHeader>
                                        <ModalTitle>Editar Apartamento</ModalTitle>
                                        <CloseButton onClick={handleModalClose}>&times;</CloseButton>
                                    </ModalHeader>
                                    <ModalContent>
                                        <ModalLabel>
                                            Status:
                                            <ModalSelect
                                                value={selectedApartment.status}
                                                onChange={(e) =>
                                                    setSelectedApartment({
                                                        ...selectedApartment,
                                                        status: parseInt(e.target.value, 10),
                                                    })
                                                }
                                            >
                                                <option value={0}>Disponível</option>
                                                <option value={1}>Ocupado</option>
                                                <option value={2}>Manutenção</option>
                                            </ModalSelect>
                                        </ModalLabel>
                                        <ModalLabel>
                                            Número:
                                            <ModalInput
                                                type="text"
                                                value={selectedApartment.number}
                                                onChange={(e) =>
                                                    setSelectedApartment({
                                                        ...selectedApartment,
                                                        number: e.target.value,
                                                    })
                                                }
                                            />
                                        </ModalLabel>
                                        <h3>Últimas Reservas</h3>
                                        {selectedApartment.last_reservations.length > 0 ? (
                                            selectedApartment.last_reservations.map((reservation) => (
                                                <ReservationCard key={reservation.id}>
                                                    <h4>{reservation.guest_name}</h4>
                                                    <span>Check-in: {new Date(reservation.checkin).toLocaleString()}</span>
                                                    <span>Check-out: {new Date(reservation.checkout).toLocaleString()}</span>
                                                    <span>Quantidade Hóspedes: {reservation.additional_guests.length + 1}</span>
                                                </ReservationCard>
                                            ))
                                        ) : (
                                            <p>Nenhuma reserva recente encontrada.</p>
                                        )}
                                    </ModalContent>
                                    <ModalActions>
                                        <CancelButton onClick={handleModalClose}>Cancelar</CancelButton>
                                        <SaveButton onClick={handleSave}>Salvar</SaveButton>
                                    </ModalActions>
                                </Modal>
                        </>
                    )}
                </>
            )}
        </>
    );
}

export default ApartmentList;
