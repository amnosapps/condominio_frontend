import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ApartmentCard from './Apartment/ApartmentCard';
import ChartSection from './Apartment/ChartSection';
import Modal from './Apartment/Modal';
import styled from 'styled-components';

const ApartmentListContainer = styled.div`
    margin-top: 100px;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem;
`;

const Loader = styled.div`
    text-align: center;
    font-size: 18px;
    color: #007bff;
    margin-top: 2rem;
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
                    headers: { Authorization: `Bearer ${token}` },
                    params: { condominium: selectedCondominium },
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
        setSelectedApartment(apartment);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setSelectedApartment(null);
        setModalOpen(false);
    };

    const handleFilterChange = (status) => {
        setFilter(status);
    };

    const filteredApartments = filter !== null
        ? apartments.filter((apartment) => apartment.status === filter)
        : apartments;

    return (
        <>
            {loading ? (
                <Loader>Carregando...</Loader>
            ) : (
                <>
                    <ChartSection
                        apartments={apartments}
                        onChartClick={handleFilterChange}
                    />
                    <ApartmentListContainer>
                        {filteredApartments.map((apartment) => (
                            <ApartmentCard
                                key={apartment.id}
                                apartment={apartment}
                                onClick={() => handleEditClick(apartment)}
                            />
                        ))}
                    </ApartmentListContainer>
                    {modalOpen && (
                        <Modal
                            selectedApartment={selectedApartment}
                            profile={profile}
                            onClose={handleModalClose}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default ApartmentList;
