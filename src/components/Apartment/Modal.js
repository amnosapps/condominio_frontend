import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import LoadingSpinner from '../utils/loader';
import MessageDropdown from './MessageDropdown';
import { format, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Backdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
`;

const statusColors = {
    Disponível: '#36a2eb', // Blue for available
    Ocupado: '#ff6384',    // Red for occupied
    Manutenção: '#ffce56', // Yellow for maintenance
};

// Circle for Status Indicator
const StatusCircle = styled.div`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${(props) => props.color || '#ccc'};
    margin-right: 8px;
`;

const StatusContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const ApartmentInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.9rem;
    color: #666;
`;

const ModalContainer = styled.div`
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
    max-height: 80vh;
    overflow-y: auto;
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

    
    const fetchApartmentDetails = async (id) => {
        const token = localStorage.getItem('accessToken');
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/apartments/${id}/`, {
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
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/residents/`,
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
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/residents/${residentId}/`, {
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

        if (!ownerToAdd.name || !ownerToAdd.email || !ownerToAdd.phone || !ownerToAdd.username || !ownerToAdd.password) {
            alert('Preencha todos os campos do proprietário.');
            return;
        }

        const newOwner = {
            name: ownerToAdd.name,
            user: {
                username: ownerToAdd.username,
                password: ownerToAdd.password,
            },
            condominiums: [selectedApartment.condominium], // Assuming the ID of the condominium is stored here
            apartment: selectedApartment.id, // Assuming the ID of the condominium is stored here
            phone: ownerToAdd.phone,
            email: ownerToAdd.email,
            document: ownerToAdd.document,
        };

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/owners/`,
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
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/owners/${selectedApartment.owner_details.id}/`, {
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
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/apartments/${selectedApartment.id}/add_message/`,
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
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/apartments/${selectedApartment.id}/mark_message_read/`,
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
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/reservations/`,
                newReservation,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Reserva registrada com sucesso.');
        } catch (error) {
            console.error('Erro ao registrar reserva:', error.response || error);
            alert('Erro ao registrar reserva.');
        }
    };

    if (loading) {
        return <LoadingSpinner />
    }

    const currentMonth = new Date();
    const previousMonth = format(subMonths(currentMonth, 1), "MMMM", { locale: ptBR });
    const nextMonth = format(addMonths(currentMonth, 1), "MMMM", { locale: ptBR });

    return (
        <>
            <Backdrop onClick={onClose} />
            <ModalContainer>
                <ModalHeader>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <ModalTitle>
                            Apartamento {selectedApartment.number}
                        </ModalTitle>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <StatusContainer>
                                <StatusCircle
                                    color={statusColors[selectedApartment.status_name]}
                                />
                                <span>Status: {selectedApartment.status_name}</span>
                                <span>Tipo: {selectedApartment.type_name}</span>
                                <span>Capacidade: {selectedApartment.max_occupation}</span>
                            </StatusContainer>
                        </div>
                    </div>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                </ModalHeader>
                <ModalContent>
                    <MessageDropdown
                        messages={apartmentDetails?.messages || []}
                        profile={profile}
                        markMessageAsRead={markMessageAsRead}
                        handleSendMessage={handleSendMessage}
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                    />
                    <h3 style={{ marginBottom: '-9px' }} >Proprietário</h3>
                    {!ownerDetails.name && profile.user_type === 'admin' ? (
                        <>
                            <h4 style={{ marginBottom: '-3px' }} >Adicionar Proprietário</h4>
                            <ModalInput
                                type="text"
                                placeholder="Nome"
                                value={ownerToAdd.name}
                                onChange={(e) => setOwnerToAdd((prev) => ({ ...prev, name: e.target.value }))}
                            />
                            <ModalInput
                                type="email"
                                placeholder="Email"
                                value={ownerToAdd.email}
                                onChange={(e) => setOwnerToAdd((prev) => ({ ...prev, email: e.target.value }))}
                            />
                            <ModalInput
                                type="text"
                                placeholder="Documento"
                                value={ownerToAdd.document}
                                onChange={(e) => setOwnerToAdd((prev) => ({ ...prev, document: e.target.value }))}
                            />
                            <ModalInput
                                type="text"
                                placeholder="Telefone"
                                value={ownerToAdd.phone}
                                onChange={(e) => setOwnerToAdd((prev) => ({ ...prev, phone: e.target.value }))}
                            />
                            <ModalInput
                                type="text"
                                placeholder="Username"
                                value={ownerToAdd.username}
                                onChange={(e) => setOwnerToAdd((prev) => ({ ...prev, username: e.target.value }))}
                            />
                            <ModalInput
                                type="password"
                                placeholder="Senha"
                                value={ownerToAdd.password}
                                onChange={(e) => setOwnerToAdd((prev) => ({ ...prev, password: e.target.value }))}
                            />
                            <SaveButton onClick={handleAddOwner}>Adicionar Proprietário</SaveButton>
                        </>
                    ) : (
                        <>
                            <ModalLabel>Nome: {ownerDetails.name || 'N/A'}</ModalLabel>
                            <ModalLabel>Email: {ownerDetails.email || 'N/A'}</ModalLabel>
                            <ModalLabel>Telefone: {ownerDetails.phone || 'N/A'}</ModalLabel>
                            {profile.user_type === 'admin' && (
                                <RemoveButton onClick={handleRemoveOwner}>Remover Proprietário</RemoveButton>
                            )}
                        </>
                    )}

                    {selectedApartment.type_name === 'Moradia' ? (
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
                                            <ModalInput
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
                                            />

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
                            <h3>Últimas Reservas - {previousMonth} até {nextMonth}</h3>
                            {/* <ReservationButton onClick={handleRegisterReservation}>
                                Registrar Reserva
                            </ReservationButton> */}
                            {selectedApartment.last_reservations.length > 0 ? (
                                selectedApartment.last_reservations.map((reservation) => (
                                    <ReservationCard 
                                        key={reservation.id}
                                        checkin={reservation.checkin}
                                        checkout={reservation.checkout}
                                    >
                                        <h4>#{reservation.id} {reservation.guest_name}</h4>
                                        <span>Check-in: {format(new Date(reservation.checkin), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                                        <span>Check-out: {format(new Date(reservation.checkout), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                                        <span>Quantidade Hóspedes: {reservation.guest_qty + 1 || 1}</span>
                                    </ReservationCard>
                                ))
                            ) : (
                                <p>Nenhuma reserva recente encontrada.</p>
                            )}
                        </>
                    )}
                </ModalContent>
            </ModalContainer>
        </>
    );
}

export default Modal;

