import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ApartmentCard from './Apartment/ApartmentCard';
import ChartSection from './Apartment/ChartSection';
import Modal from './Apartment/Modal';
import styled from 'styled-components';
import CreateApartmentModal from './Apartment/CreateApartmentModal';
import LoadingSpinner from './utils/loader';
import { startOfDay, endOfDay, parseISO, isWithinInterval } from 'date-fns';

const ApartmentListContainer = styled.div`
    margin-top: 100px;
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    padding: 1rem;

    @media (max-width: 768px) {
        justify-content: center;
        gap: 0.75rem;
    }

    @media (max-width: 480px) {
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }
`;

const ControlsContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1rem;
    flex-wrap: wrap;
    gap: 1rem;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 0.75rem;
    }
`;

const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    font-weight: 500;
    color: #555;
    cursor: pointer;
    margin-right: 20px;

    input {
        appearance: none;
        width: 20px;
        height: 20px;
        border: 2px solid #0056b3;
        border-radius: 4px;
        background-color: #fff;
        cursor: pointer;
        transition: background-color 0.2s, border-color 0.2s;

        &:checked {
            background-color: #007bff;
            border-color: #0056b3;
        }

        &:hover {
            border-color: #007bff;
        }

        &:focus {
            outline: 2px solid rgba(0, 123, 255, 0.5);
        }
    }
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

    @media (max-width: 480px) {
        width: 100%;
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

    @media (max-width: 480px) {
        width: 100%;
    }
`;

const Loader = styled.div`
    text-align: center;
    font-size: 18px;
    color: #007bff;
    margin-top: 2rem;

    @media (max-width: 480px) {
        font-size: 16px;
    }
`;

const CreateButton = styled.button`
    padding: 0.5rem 1rem;
    font-size: 1rem;
    background-color: #F46600;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;

    &:hover {
        background-color:rgb(185, 77, 0);
    }

    @media (max-width: 480px) {
        width: 100%;
        padding: 0.5rem;
    }
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;

    @media (max-width: 480px) {
        padding: 1rem;
    }
`;

const ModalContent = styled.div`
    background: white;
    padding: 2rem;
    border-radius: 10px;
    width: 400px;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @media (max-width: 480px) {
        width: 90%;
        padding: 1rem;
    }
`;

const ModalCloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    align-self: flex-end;
    cursor: pointer;

    @media (max-width: 480px) {
        font-size: 1.25rem;
    }
`;

const ClearFiltersButton = styled.button`
    padding: 0.5rem 1rem;
    font-size: 1rem;
    background-color: #fff;
    color: #F46600;
    border: 1px solid #F46600;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: #F46600;
        color: #fff;
    }

    @media (max-width: 480px) {
        width: 100%;
        padding: 0.5rem;
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
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [checkinTodayFilter, setCheckinTodayFilter] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);

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

    const handleCheckinTodayChange = (e) => {
        setCheckinTodayFilter(e.target.checked);
    };

    const isCheckinToday = (apartment) => {
        const today = new Date();
        const todayStart = startOfDay(today);
        const todayEnd = endOfDay(today);

        return apartment.last_reservations.some((reservation) => {
            const checkinDate = reservation.checkin ? parseISO(reservation.checkin) : null;
            return checkinDate && isWithinInterval(checkinDate, { start: todayStart, end: todayEnd });
        });
    };

    const handleChartClick = ({ filterType, value }) => {
        if (filterType === 'status') setStatusFilter(value);
        if (filterType === 'type_name') setTypeFilter(value);
    };

    // Apply filters and search
    const filteredApartments = apartments.filter((apartment) => {
        const matchesSearch = search === '' || apartment.number.includes(search);
        const matchesType = typeFilter === '' || apartment.type_name === typeFilter;
        const matchesStatus = statusFilter === '' || apartment.status === parseInt(statusFilter, 10);
        const matchesCheckinToday = !checkinTodayFilter || isCheckinToday(apartment);

        return matchesSearch && matchesType && matchesStatus && matchesCheckinToday;
    });

    const clearFilters = () => {
        setSearch('');
        setTypeFilter('');
        setStatusFilter('');
        setCheckinTodayFilter(false);
    };

    const handleApartmentCreated = (newApartment) => {
        setApartments((prev) => [...prev, newApartment]);
    };

    return (
        <>
            {loading ? (
                <LoadingSpinner />
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
                            <option value="0">Disponível</option>
                            <option value="1">Ocupado</option>
                            <option value="2">Manutenção</option>
                        </FilterSelect>
                        <ClearFiltersButton onClick={clearFilters}>
                            Limpar Filtros
                        </ClearFiltersButton>
                        {profile.user_type === 'admin' && (
                            <CreateButton onClick={() => setCreateModalOpen(true)}>+ Apartamento</CreateButton>
                        )}
                    </ControlsContainer>
                    <ChartSection
                        apartments={apartments}
                        onChartClick={handleChartClick}
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
                    <CreateApartmentModal
                        isOpen={createModalOpen}
                        onClose={() => setCreateModalOpen(false)}
                        condominium={selectedCondominium}
                        onApartmentCreated={handleApartmentCreated}
                    />
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
