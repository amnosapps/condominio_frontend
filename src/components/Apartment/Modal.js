import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Backdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
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

function Modal({ selectedApartment, profile, onClose }) {
    const [residentToAdd, setResidentToAdd] = useState({ name: '', email: '', phone: '' });
    const [ownerDetails, setOwnerDetails] = useState({
        name: selectedApartment.owner_details.name,
        email: selectedApartment.owner_details.email,
        phone: selectedApartment.owner_details.phone,
    });
    const [isEditingOwner, setIsEditingOwner] = useState(false);
    const [showAddResidentInputs, setShowAddResidentInputs] = useState(false);
    const [residents, setResidents] = useState(selectedApartment.residents);

    console.log(selectedApartment)

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

    const handleSaveOwnerDetails = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            await axios.patch(`${process.env.REACT_APP_API_URL}/api/owners/${selectedApartment.owner_details.id}/`, ownerDetails);
            alert('Proprietário atualizado com sucesso.');
        } catch (error) {
            alert('Erro ao atualizar proprietário.');
        }
    };

    return (
        <>
            <Backdrop onClick={onClose} />
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>Detalhes do Apartamento {selectedApartment.number}</ModalTitle>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                </ModalHeader>
                <ModalContent>
                    <h3>Proprietário</h3>
                    {!isEditingOwner ? (
                        <>
                            <ModalLabel>Nome: {ownerDetails.name || 'N/A'}</ModalLabel>
                            <ModalLabel>Email: {ownerDetails.email || 'N/A'}</ModalLabel>
                            <ModalLabel>Telefone: {ownerDetails.phone || 'N/A'}</ModalLabel>
                            {profile?.is_staff && (
                                <EditButton onClick={() => setIsEditingOwner(true)}>
                                    Editar Proprietário
                                </EditButton>
                            )}
                        </>
                    ) : (
                        <>
                            <ModalLabel>Nome:</ModalLabel>
                            <ModalInput
                                type="text"
                                value={ownerDetails.name || ''}
                                onChange={(e) =>
                                    setOwnerDetails((prev) => ({ ...prev, name: e.target.value }))
                                }
                            />
                            <ModalLabel>Email:</ModalLabel>
                            <ModalInput
                                type="email"
                                value={ownerDetails.email || ''}
                                onChange={(e) =>
                                    setOwnerDetails((prev) => ({ ...prev, email: e.target.value }))
                                }
                            />
                            <ModalLabel>Telefone:</ModalLabel>
                            <ModalInput
                                type="text"
                                value={ownerDetails.phone || ''}
                                onChange={(e) =>
                                    setOwnerDetails((prev) => ({ ...prev, phone: e.target.value }))
                                }
                            />
                            <SaveButton onClick={handleSaveOwnerDetails}>Salvar Proprietário</SaveButton>
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
                                        {profile?.is_staff && (
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
                            {profile?.is_staff && (
                                <>
                                    {!showAddResidentInputs ? (
                                        <AddResidentButton
                                            onClick={() => setShowAddResidentInputs(true)}
                                        >
                                            Adicionar Residente
                                        </AddResidentButton>
                                    ) : (
                                        <>
                                            <h3>Adicionar Residente</h3>
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
                                            <ModalInput
                                                type="text"
                                                placeholder="Username"
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
                                                placeholder="Senha"
                                                value={residentToAdd.password}
                                                onChange={(e) =>
                                                    setResidentToAdd((prev) => ({
                                                        ...prev,
                                                        password: e.target.value,
                                                    }))
                                                }
                                            />

                                            <SaveButton onClick={handleAddResident}>
                                                Confirmar Residente
                                            </SaveButton>
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </ModalContent>
            </ModalContainer>
        </>
    );
}

export default Modal;

