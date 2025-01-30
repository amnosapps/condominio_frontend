import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import LoadingSpinner from '../utils/loader';
import MessageDropdown from './MessageDropdown';
import { format, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReservationModal from '../ReservationModal';
import ReservationCreationModal from '../Reservation/ReservationCreation';
import { FaCommentAlt, FaHouseUser, FaUserEdit } from 'react-icons/fa';
import OwnerDetailsSection, { OwnerDetailsSidebar } from './OwnerDetailsSection';
import api from '../../services/api';

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
`;

const Container = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #ffffff;
    border-radius: 4px;
    box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    display: flex;
    max-width: 90%;
    width: 1000px;
    max-height: 80vh;
    overflow: hidden;
`;

const ModalContainer = styled.div`
    flex: 4;
    padding: 2rem 2rem;
    overflow-y: auto;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;


const ModalContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const ModalTitle = styled.h3`
    font-size: 1.5rem;
    font-weight: bold;
    margin-right: 20px;
    color: #333333;
`;

const SidebarContainer = styled.div`
    flex: 2.5;
    background: #f8f9fa;
    border-left: 1px solid #e9ecef;
    padding: 1rem;
    overflow-y: auto;
`;

const statusColors = {
    Disponível: '#36a2eb', // Blue for available
    Ocupado: '#ff6384',    // Red for occupied
    Manutenção: '#D3D3D3', // Gray for maintenance
};

// Circle for Status Indicator
const StatusCircle = styled.div`
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: ${(props) => props.color || '#ccc'};
    margin-left: 8px;
`;

const StatusContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
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

const SaveButton = styled.button`
    background-color: #007bff;
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-top: 8px;

    &:hover {
        background-color: #0056b3;
    }
`;

const EditButton = styled(SaveButton)`
    background-color: #6c757d;

    &:hover {
        background-color: #5a6268;
    }
`;

const AddResidentButton = styled(SaveButton)`
    background-color: #28a745;

    &:hover {
        background-color: #218838;
    }
`;

const RemoveButton = styled.button`
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: #c82333;
    }
`;

const ReservationCard = styled.div`
    cursor: pointer;
    background: ${(props) => {
        const today = new Date();
        const checkinDate = new Date(props.checkin);
        const checkoutDate = new Date(props.checkout);

        if (checkinDate.toDateString() === today.toDateString()) {
            return 'rgba(255, 165, 0, 0.3)'; // Light orange for check-in today
        } else if (checkinDate < today && checkoutDate >= today) {
            return 'rgba(76, 175, 80, 0.3)'; // Light green for active reservation
        } else if (checkoutDate < today) {
            return 'rgba(158, 158, 158, 0.3)'; // Light grey for past reservation
        }
        return '#f8f9fa'; // Default background
    }};
    border: 1px solid #e9ecef;
    border-radius: 4px;
    padding: 1.5rem 1.5rem;
    margin-bottom: 0.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    box-shadow: 0 4px 4px rgba(0, 0, 0.2, 0.2);
    transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;

    &:hover {
        background-color: rgba(0, 123, 255, 0.1); /* Light blue hover effect */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transform: scale(1.02);
        border-color: #007bff; /* Blue border on hover */
    }

    h4 {
        font-size: 1.1rem;
        color: #343a40;
        margin: 0 0 0.1rem 0;
        font-weight: bold;
    }

    span {
        font-size: 0.8rem;
        color: #495057;
        /* margin: 0.2rem 0; */
    }
`;

const StyledButton = styled.button`
    margin-left: 20px;
    background-color: #28a745;
    color: white;
    font-size: 14px;
    font-weight: bold;
    padding: 0.1rem 0.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;

    &:hover {
        background-color: #218838;
        transform: scale(1.05);
    }

    &:active {
        background-color: #1e7e34;
        transform: scale(1);
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 4px rgba(40, 167, 69, 0.8);
    }
`;

const ReservationButton = styled.button`
    background-color: #17a2b8;
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-top: 10px;

    &:hover {
        background-color: #138496;
    }
`;

const MessageSection = styled.div`
    margin-top: 1rem;
`;

const Message = styled.div`
    background: ${({ read }) => (read ? '#f8f9fa' : '#fff3cd')};
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
        font-size: 0.9rem;
        color: #495057;
    }
`;

const MarkAsReadButton = styled.button`
    background-color: #28a745;
    color: white;
    border: none;
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: #218838;
    }
`;

const FilterContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
`;

const FilterButton = styled.button`
    background-color: ${(props) => (props.active ? '#007bff' : '#e9ecef')};
    color: ${(props) => (props.active ? 'white' : '#495057')};
    border: none;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: ${(props) => (props.active ? '#0056b3' : '#d6d6d6')};
    }

    &:focus {
        outline: none;
    }
`;

const ReservationGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* Two cards per row */
    gap: 1rem;
`;

const FeaturedReservationCard = styled.div`
    /* background: rgba(76, 175, 80, 0.3); */
    border: 1px solid rgb(233, 233, 233); 
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    box-shadow: 0 4px 4px 0 rgba(0.2, 0, 0, 0.2);
    cursor: pointer;
    transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;

    &:hover {
        background-color: rgba(0, 123, 255, 0.1); /* Light blue hover effect */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transform: scale(1.02);
        border-color: #007bff; /* Blue border on hover */
    }

    h3 {
        font-size: 1.2rem;
        color: #2e7d32; 
        margin: 0;
        font-weight: bold;
    }

    span {
        font-size: 1rem;
        color: #495057;
    }
`;

const SidebarToggleButton = styled.button`
    background-color: transparent;
    /* color: #F46600; */
    border: none;
    font-size: 1.3rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-right: 20px;
`;

function Modal({ selectedApartment, profile, onClose }) {
    const [residentToAdd, setResidentToAdd] = useState({ name: '', email: '', phone: '' });
    const [ownerToAdd, setOwnerToAdd] = useState({ name: '', email: '', phone: '', username: '', password: '' });
    const [ownerDetails, setOwnerDetails] = useState({
        name: selectedApartment.owner_details?.name,
        email: selectedApartment.owner_details?.email,
        phone: selectedApartment.owner_details?.phone,
    });

    const [isEditingOwner, setIsEditingOwner] = useState(false);
    const [showAddResidentInputs, setShowAddResidentInputs] = useState(false);
    const [residents, setResidents] = useState(selectedApartment.residents);
    const [apartmentDetails, setApartmentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');

    const [filter, setFilter] = useState('previous');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isOwnerSidebarOpen, setIsOwnerSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // For ReservationCreationModal
    const [selectedReservation, setSelectedReservation] = useState(null); // For ReservationModal
    
    const fetchApartmentDetails = async (id) => {
        const token = localStorage.getItem('accessToken');
        try {
            const response = await api.get(`/api/apartments/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setApartmentDetails(response.data);
        } catch (error) {
            console.error('Error fetching apartment details:', error.response || error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchApartmentDetails(selectedApartment.id);
    }, [selectedApartment.id]);

    const handleAddResident = async () => {
        const token = localStorage.getItem('accessToken');
    
        if (!residentToAdd.name || !residentToAdd.email || !residentToAdd.phone) {
            alert('Preencha todos os campos do residente antes de adicionar.');
            return;
        }
    
        const newResident = {
            name: residentToAdd.name,
            user: {
                username: residentToAdd.username, // Use email as username
                password: residentToAdd.password || 'defaultPassword123', // Default password if not provided
            },
            condominium: selectedApartment.condominium, // Assuming the ID of the condominium is stored here
            apartment: selectedApartment.id, // Assuming the ID of the condominium is stored here
            phone: residentToAdd.phone,
            document: residentToAdd.document || '',
            email: residentToAdd.email,
            active: true,
        };
    
        try {
            const response = await api.post(
                `/api/residents/`,
                newResident,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Residente adicionado com sucesso.');
    
            // Update the local residents state
            setResidents((prev) => [...prev, response.data]);
    
            setResidentToAdd({ name: '', email: '', phone: '', password: '', document: '' });
            setShowAddResidentInputs(false);
        } catch (error) {
            console.error('Erro ao adicionar residente:', error.response || error);
            alert('Erro ao adicionar residente.');
        }
    };
    

    const handleRemoveResident = async (residentId) => {
        const token = localStorage.getItem('accessToken');
        try {
            await api.delete(`/api/residents/${residentId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Residente removido com sucesso.');

            // Update the local residents state
            setResidents((prev) => prev.filter((resident) => resident.id !== residentId));
        } catch (error) {
            alert('Erro ao remover residente.');
        }
    };

    const handleAddOwner = async () => {
        const token = localStorage.getItem('accessToken');

        if (!ownerToAdd.name || !ownerToAdd.email || !ownerToAdd.phone) {
            alert('Preencha todos os campos do proprietário.');
            return;
        }

        const newOwner = {
            name: ownerToAdd.name,
            // user: {
            //     username: ownerToAdd.username,
            //     password: ownerToAdd.password,
            // },
            condominiums: [selectedApartment.condominium], // Assuming the ID of the condominium is stored here
            apartment: selectedApartment.id, // Assuming the ID of the condominium is stored here
            phone: ownerToAdd.phone,
            email: ownerToAdd.email,
            document: ownerToAdd.document,
        };

        try {
            const response = await api.post(
                `/api/owners/`,
                newOwner,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Proprietário adicionado com sucesso.');

            // Update the owner details
            setOwnerDetails(response.data);
            setOwnerToAdd({ name: '', email: '', phone: '', username: '', password: '' });
        } catch (error) {
            console.error('Erro ao adicionar proprietário:', error.response || error);
            alert('Erro ao adicionar proprietário.');
        }
    };

    const handleRemoveOwner = async () => {
        const token = localStorage.getItem('accessToken');

        try {
            await api.delete(`/api/owners/${selectedApartment.owner_details.id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Proprietário removido com sucesso.');
            setOwnerDetails({ name: '', email: '', phone: '' });
        } catch (error) {
            console.error('Erro ao remover proprietário:', error.response || error);
            alert('Erro ao remover proprietário.');
        }
    };

    const handleSendMessage = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            await api.post(
                `/api/apartments/${selectedApartment.id}/add_message/`,
                { message: newMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewMessage('');
            fetchApartmentDetails(selectedApartment.id); // Reload details
        } catch (error) {
            console.error('Error sending message:', error.response || error);
            alert('Error sending message.');
        }
    };

    const markMessageAsRead = async (index) => {
        const token = localStorage.getItem('accessToken');
        try {
            await api.post(
                `/api/apartments/${selectedApartment.id}/mark_message_read/`,
                { message_index: index },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchApartmentDetails(selectedApartment.id);
        } catch (error) {
            console.error('Error marking message as read:', error.response || error);
            alert('Error marking message as read.');
        }
    };

    const handleRegisterReservation = async () => {
        const token = localStorage.getItem('accessToken');
        const newReservation = {
            apartment: selectedApartment.id,
            guest_name: "New Guest",
            checkin: new Date().toISOString(),
            checkout: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Example: 2 days later
            additional_guests: [],
        };

        try {
            await api.post(
                `/api/reservations/`,
                newReservation,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Reserva registrada com sucesso.');
        } catch (error) {
            console.error('Erro ao registrar reserva:', error.response || error);
            alert('Erro ao registrar reserva.');
        }
    };

    const handleTypeChange = async (newType) => {
        const token = localStorage.getItem('accessToken');
        const typeNames = {
            0: 'Temporada',
            1: 'Moradia',
        };
    
        // Display a confirmation alert
        const confirmChange = window.confirm(
            `Tem certeza de que deseja alterar o tipo para "${typeNames[newType]}"?`
        );
    
        if (!confirmChange) {
            // Exit the function if the user cancels
            return;
        }
    
        try {
            await api.patch(
                `/api/apartments/${selectedApartment.id}/`,
                { type: newType },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Tipo do apartamento atualizado com sucesso.');
            fetchApartmentDetails(selectedApartment.id); // Refresh the apartment details
        } catch (error) {
            console.error('Erro ao atualizar o tipo do apartamento:', error.response || error);
            alert('Erro ao atualizar o tipo do apartamento.');
        }
    };

    const handleStatusChange = async (newStatus) => {
        const token = localStorage.getItem('accessToken');
        const statusNames = {
            0: 'Disponível',
            1: 'Ocupado',
            2: 'Manutenção',
        };
    
        // Display a confirmation alert
        const confirmChange = window.confirm(
            `Tem certeza de que deseja alterar o status para "${statusNames[newStatus]}"?`
        );
    
        if (!confirmChange) {
            // Exit the function if the user cancels
            return;
        }
    
        try {
            await api.patch(
                `/api/apartments/${selectedApartment.id}/`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Status do apartamento atualizado com sucesso.');
            fetchApartmentDetails(selectedApartment.id); // Refresh the apartment details
        } catch (error) {
            console.error('Erro ao atualizar o status do apartamento:', error.response || error);
            alert('Erro ao atualizar o status do apartamento.');
        }
    };

    if (loading) {
        return <LoadingSpinner />
    }

    const currentMonth = new Date();
    const previousMonth = format(subMonths(currentMonth, 1), "MMMM", { locale: ptBR });
    const nextMonth = format(addMonths(currentMonth, 1), "MMMM", { locale: ptBR });

    const toggleModal = () => setIsModalOpen((prev) => !prev);

    const openReservationModal = (reservation) => setSelectedReservation(reservation);
    const closeReservationModal = () => setSelectedReservation(null);

    const filteredReservations = apartmentDetails?.last_reservations.filter((reservation) => {
        return !reservation.checkin_at && !reservation.checkout_at;
    });

    const currentReservation = apartmentDetails?.last_reservations.find((reservation) => {
        const today = new Date();
        const checkinDate = new Date(reservation.checkin);
        const checkoutDate = new Date(reservation.checkout);
    
        return (
            (checkinDate <= today || checkoutDate >= today) && // Stay hasn't ended
            (reservation.checkin_at && 
            !reservation.checkout_at)
        );
    })

    console.log(apartmentDetails.last_reservations)
    console.log(filteredReservations)
    console.log(currentReservation)

    return (
        <>
            <Overlay onClick={onClose} />
            <Container>
                <ModalContainer>
                    <ModalHeader>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <ModalTitle>
                                    Apto {apartmentDetails.number}
                                </ModalTitle>
                                
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <StatusContainer>
                                    <StatusCircle
                                        color={statusColors[apartmentDetails.status_name]}
                                    />
                                    <select
                                        value={apartmentDetails.status}
                                        onChange={(e) => handleStatusChange(parseInt(e.target.value))}
                                        style={{
                                            marginLeft: '8px',
                                            padding: '0.3rem',
                                            borderRadius: '4px',
                                            border: '1px solid #ccc',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <option value={0} style={{ color: statusColors.Disponível }}>Disponível</option>
                                        <option value={1} style={{ color: statusColors.Ocupado }}>Ocupado</option>
                                        <option value={2} style={{ color: statusColors.Manutenção }}>Manutenção</option>
                                    </select>
                                    <span>
                                        Tipo: 
                                        <select
                                            value={apartmentDetails.type}
                                            onChange={(e) => handleTypeChange(parseInt(e.target.value))}
                                            style={{
                                                marginLeft: '8px',
                                                padding: '0.3rem',
                                                borderRadius: '4px',
                                                border: '1px solid #ccc',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <option value={0} style={{ color: '#36a2eb' }}>Temporada</option>
                                            <option value={1} style={{ color: '#6c757d' }}>Moradia</option>
                                        </select>    
                                    </span>
                                    <span>Capacidade: {apartmentDetails.max_occupation}</span>
                                </StatusContainer>
                            </div>
                        </div>
                        <div>
                            <SidebarToggleButton
                                onClick={() => setIsSidebarOpen((prev) => !prev)}
                            >
                                <FaCommentAlt />
                            </SidebarToggleButton>
                            <SidebarToggleButton
                                onClick={() => setIsOwnerSidebarOpen((prev) => !prev)}
                            >
                                <FaUserEdit />
                            </SidebarToggleButton>
                            <CloseButton onClick={onClose}>&times;</CloseButton>
                        </div>
                    </ModalHeader>
                    <ModalContent>
                        {apartmentDetails.type_name === 'Moradia' ? (
                            <>
                                <h3>Residentes Ativos</h3>
                                {residents.length > 0 ? (
                                    residents.map((resident) => (
                                        <ReservationCard key={resident.id}>
                                            <h4>{resident.name}</h4>
                                            <span>Telefone: {resident.phone}</span>
                                            <span>Email: {resident.email}</span>
                                            {profile.user_type === 'admin' && (
                                                <RemoveButton
                                                    onClick={() => handleRemoveResident(resident.id)}
                                                >
                                                    Remover
                                                </RemoveButton>
                                            )}
                                        </ReservationCard>
                                    ))
                                ) : (
                                    <p>Sem residentes ativos no momento.</p>
                                )}
                                {profile.user_type === 'admin' && (
                                    <>
                                        {!showAddResidentInputs ? (
                                            <AddResidentButton
                                                onClick={() => setShowAddResidentInputs(true)}
                                            >
                                                Adicionar Residente
                                            </AddResidentButton>
                                        ) : (
                                            <>
                                                <h3 style={{ marginBottom: '-9px' }}>Adicionar Residente</h3>
                                                <h4 style={{ marginBottom: '-6px' }}>Dados do residente</h4>
                                                <ModalInput
                                                    type="text"
                                                    placeholder="Nome"
                                                    value={residentToAdd.name}
                                                    onChange={(e) =>
                                                        setResidentToAdd((prev) => ({
                                                            ...prev,
                                                            name: e.target.value,
                                                        }))
                                                    }
                                                />
                                                <ModalInput
                                                    type="email"
                                                    placeholder="Email"
                                                    value={residentToAdd.email}
                                                    onChange={(e) =>
                                                        setResidentToAdd((prev) => ({
                                                            ...prev,
                                                            email: e.target.value,
                                                        }))
                                                    }
                                                />
                                                <ModalInput
                                                    type="text"
                                                    placeholder="Telefone"
                                                    value={residentToAdd.phone}
                                                    onChange={(e) =>
                                                        setResidentToAdd((prev) => ({
                                                            ...prev,
                                                            phone: e.target.value,
                                                        }))
                                                    }
                                                />
                                                <ModalInput
                                                    type="text"
                                                    placeholder="Documento"
                                                    value={residentToAdd.document}
                                                    onChange={(e) =>
                                                        setResidentToAdd((prev) => ({
                                                            ...prev,
                                                            document: e.target.value,
                                                        }))
                                                    }
                                                />

                                                <h4 style={{ marginBottom: '-6px' }}>Acesso do residente</h4>
                                                {/* <ModalInput
                                                    type="text"
                                                    placeholder="username"
                                                    value={residentToAdd.username}
                                                    onChange={(e) =>
                                                        setResidentToAdd((prev) => ({
                                                            ...prev,
                                                            username: e.target.value,
                                                        }))
                                                    }
                                                />
                                                <ModalInput
                                                    type="password"
                                                    placeholder="senha"
                                                    value={residentToAdd.password}
                                                    onChange={(e) =>
                                                        setResidentToAdd((prev) => ({
                                                            ...prev,
                                                            password: e.target.value,
                                                        }))
                                                    }
                                                /> */}

                                                <SaveButton onClick={handleAddResident}>
                                                    Adicionar Residente
                                                </SaveButton>
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {currentReservation && (
                                    <FeaturedReservationCard
                                        onClick={() => openReservationModal(currentReservation)}
                                    >
                                        <h3>Reserva em curso</h3>
                                        <span><strong>Reserva:</strong> #{currentReservation.id} - {currentReservation.guest_name}</span>
                                        <span>
                                            <strong>Check-in:</strong>{" "}
                                            {format(new Date(currentReservation.checkin), "dd/MM/yyyy", {
                                                locale: ptBR,
                                            })}
                                        </span>
                                        <span>
                                            <strong>Checkout:</strong>{" "}
                                            {format(new Date(currentReservation.checkout), "dd/MM/yyyy", {
                                                locale: ptBR,
                                            })}
                                        </span>
                                        <span><strong>Status:</strong> Em curso</span>
                                    </FeaturedReservationCard>
                                )}
                                {filteredReservations.length > 0 ? (
                                    <>
                                        <h3>Próximas Reservas</h3>
                                        <ReservationGrid>
                                            {filteredReservations.map((reservation) => {
                                                if (currentReservation?.id === reservation.id) {
                                                    return null
                                                }
        
                                                return (
                                                <ReservationCard
                                                    key={reservation.id}
                                                    checkin={reservation.checkin}
                                                    checkout={reservation.checkout}
                                                    onClick={() => openReservationModal(reservation)}
                                                >
                                                    <h4>#{reservation.id} {reservation.guest_name}</h4>
                                                    <span>
                                                        <strong>Check-in:</strong>{" "}
                                                        {format(new Date(reservation.checkin), "dd/MM/yyyy", {
                                                            locale: ptBR,
                                                        })}
                                                    </span>
                                                    <span>
                                                        <strong>Check-out:</strong>{" "}
                                                        {format(new Date(reservation.checkout), "dd/MM/yyyy", {
                                                            locale: ptBR,
                                                        })}
                                                    </span>
                                                    <span><strong>Hóspedes:</strong> {reservation.guest_qty + 1 || 1}</span>
                                                </ReservationCard>
                                            )})}
                                        </ReservationGrid>
                                    </>
                                ) : (
                                    <>
                                        <span>Nenhuma reserva encontrada para os próximo 30 dias</span>
                                    </>
                                )}
                                
                            </>
                        )}
                    </ModalContent>

                </ModalContainer>
                {isSidebarOpen && (
                    <SidebarContainer>
                        <MessageDropdown
                            messages={apartmentDetails?.messages || []}
                            profile={profile}
                            markMessageAsRead={markMessageAsRead}
                            handleSendMessage={handleSendMessage}
                            newMessage={newMessage}
                            setNewMessage={setNewMessage}
                        />
                    </SidebarContainer>
                )}

                {isOwnerSidebarOpen && (
                    <OwnerDetailsSidebar>
                        <OwnerDetailsSection
                            ownerDetails={ownerDetails}
                            ownerToAdd={ownerToAdd}
                            setOwnerToAdd={setOwnerToAdd}
                            handleAddOwner={handleAddOwner}
                            handleRemoveOwner={handleAddOwner}
                            SaveButton={SaveButton}
                            RemoveButton={RemoveButton}
                            profile={profile}
                        />
                    </OwnerDetailsSidebar>
                )}
            </Container>
            {isModalOpen && (
                <ReservationCreationModal
                    onClose={toggleModal}
                    fetchApartmentDetails={() => fetchApartmentDetails(selectedApartment.id)}
                    apartments={[selectedApartment]}
                    profile={profile}
                />
            )}

            {/* Reservation Details Modal */}
            {selectedReservation && (
                <ReservationModal
                    closeModal={closeReservationModal}
                    selectedReservation={selectedReservation}
                    selectedApartment={selectedApartment}
                    fetchApartmentDetails={() => fetchApartmentDetails(selectedApartment.id)}
                    profile={profile}
                />
            )}
        </>
    );
}

export default Modal;

