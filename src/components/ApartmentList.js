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

const ControlsContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const SearchInput = styled.input`
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #cccccc;
    border-radius: 8px;
    width: 200px;

    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const FilterSelect = styled.select`
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #cccccc;
    border-radius: 8px;
    width: 200px;

    &:focus {
        outline: none;
        border-color: #007bff;
    }
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
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

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

    // Apply filters and search
    const filteredApartments = apartments.filter((apartment) => {
        const matchesSearch = search === '' || apartment.number.includes(search);
        const matchesType = typeFilter === '' || apartment.type_name === typeFilter;
        const matchesStatus = statusFilter === '' || apartment.status_name === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <>
            {loading ? (
                <Loader>Carregando...</Loader>
            ) : (
                <>
                    <ControlsContainer>
                        <SearchInput
                            type="text"
                            placeholder="Buscar por número"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <FilterSelect
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">Filtrar por tipo</option>
                            <option value="Temporada">Temporada</option>
                            <option value="Moradia">Moradia</option>
                        </FilterSelect>
                        <FilterSelect
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Filtrar por status</option>
                            <option value="Disponível">Disponível</option>
                            <option value="Ocupado">Ocupado</option>
                            <option value="Manutenção">Manutenção</option>
                        </FilterSelect>
                    </ControlsContainer>
                    <ChartSection
                        apartments={filteredApartments}
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
