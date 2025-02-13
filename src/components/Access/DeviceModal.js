import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../../services/api';
import { FaTimes } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

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

const DeviceModal = ({ isOpen, onClose, device, condominium_id, fetchDevices }) => {
  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    type: '0',
    brand: '0',
    user: '',
    password: '',
  });

  const brandOptions = [
    { value: '0', label: 'Intelbras' },
  ];

  const typeOptions = [
    { value: '0', label: 'Reconhecimento Facial' },
  ];

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name,
        ip: device.ip,
        type: device.type.toString(),
        brand: device.brand.toString(),
        user: device.user,
        password: device.password,
        condominium: condominium_id
      });
    } else {
      setFormData({
        name: '',
        ip: '',
        type: '0',
        brand: '0',
        user: '',
        password: '',
        condominium: condominium_id
      });
    }
  }, [device]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    try {
      if (device) {
        await api.put(`/access/devices/${device.id}/`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post('/access/devices/', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onClose();
      fetchDevices()
    } catch (error) {
      console.error('Error saving device:', error);
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
          <ModalTitle>{device ? 'Editar Dispositivo' : 'Adicionar Dispositivo'}</ModalTitle>
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
            <Input
              type="text"
              name="ip"
              value={formData.ip}
              onChange={handleChange}
              placeholder="IP"
              required
            />
            <Select name="brand" value={formData.brand} onChange={handleChange} required>
              {brandOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select name="type" value={formData.type} onChange={handleChange} required>
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Input
              type="text"
              name="user"
              value={formData.user}
              onChange={handleChange}
              placeholder="Usuário"
              required
            />
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Senha"
              required
            />
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

export default DeviceModal;
