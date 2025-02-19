import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import api from '../../services/api';

// Styled Components
const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 25px;
  border-radius: 10px;
  width: 450px;
  max-width: 100%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #555;

  &:hover {
    color: #e74c3c;
  }
`;

const ModalBody = styled.div`
  margin-top: 20px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
`;

const Button = styled.button`
  background-color: ${(props) => (props.primary ? '#007bff' : '#6c757d')};
  color: white;
  border: none;
  padding: 10px 15px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  width: 48%;

  &:hover {
    background-color: ${(props) => (props.primary ? '#0056b3' : '#545b62')};
  }
`;

const UserDeviceModal = ({ isOpen, onClose, userDevice, condominium_id, refreshList }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: '0',
        authority: '0',
        valid_from: '',
        valid_to: '',
        user_id_device: '',
        device: '',
        condominium: condominium_id,
    });

    const [devices, setDevices] = useState([]);

    const typeOptions = [
        { value: '0', label: 'Geral' },
        { value: '1', label: 'Visitante' },
    ];

    const authorityOptions = [
        { value: '0', label: 'Admin' },
        { value: '1', label: 'Geral' },
    ];

    useEffect(() => {
        if (userDevice) {
            setFormData({
                name: userDevice.name,
                type: userDevice.type.toString(),
                authority: userDevice.authority.toString(),
                valid_from: userDevice.valid_from || '',
                valid_to: userDevice.valid_to || '',
                user_id_device: userDevice.user_id_device,
                device: userDevice.device.toString(),
                condominium: condominium_id,
            });
        } else {
            setFormData({
                name: '',
                type: '1',
                authority: '1',
                valid_from: '',
                valid_to: '',
                device: '',
                condominium: condominium_id,
            });
        }
    }, [userDevice, condominium_id]);

    useEffect(() => {
        const fetchDevices = async () => {
            const token = localStorage.getItem('accessToken');
            try {
                const response = await api.get('/api/access/devices/', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { condominium: condominium_id },
                });
                setDevices(response.data);
            } catch (error) {
                console.error('Error fetching devices:', error);
            }
        };

        if (condominium_id) {
            fetchDevices();
        }
    }, [condominium_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');

        try {
            const payload = { ...formData, condominium: condominium_id };

            if (userDevice) {
                await api.put(`/api/access/user-devices/${userDevice.id}/`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await api.post('/api/access/user-devices/', payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            onClose();
            refreshList(); // Refresh list after add/edit
        } catch (error) {
            console.error('Error saving User Device:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    return (
        <ModalContainer isOpen={isOpen}>
            <ModalContent>
                <ModalHeader>
                    <ModalTitle>{userDevice ? 'Editar Dispositivo de Usuário' : 'Adicionar Dispositivo de Usuário'}</ModalTitle>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>
                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Nome"
                            required
                        />
                        <Select name="type" value={formData.type} onChange={handleChange} required>
                            {typeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                        <Select name="authority" value={formData.authority} onChange={handleChange} required>
                            {authorityOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                        <Input
                            type="datetime-local"
                            name="valid_from"
                            value={formData.valid_from}
                            onChange={handleChange}
                        />
                        <Input
                            type="datetime-local"
                            name="valid_to"
                            value={formData.valid_to}
                            onChange={handleChange}
                        />
                        <Select name="device" value={formData.device} onChange={handleChange} required>
                            <option value="">Selecione um Dispositivo</option>
                            {devices.map((device) => (
                                <option key={device.id} value={device.id}>
                                    {device.name} (IP: {device.ip})
                                </option>
                            ))}
                        </Select>
                    </ModalBody>
                    <ModalFooter>
                        <Button type="button" onClick={onClose}>Cancelar</Button>
                        <Button primary type="submit">Salvar</Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </ModalContainer>
    );
};

export default UserDeviceModal;
