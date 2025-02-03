import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import api from "../../services/api";

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
    padding: 1.5rem;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }

  @media (max-width: 480px) {
    h2 {
      font-size: 1.25rem;
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;

  &:hover {
    color: #f46600;
  }
`;

const FormLabel = styled.label`
  font-size: 1rem;
  color: #555;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 0.6rem;
  margin-bottom: 1rem;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 0.6rem;
  margin-bottom: 1rem;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #218838;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 0.5rem;
  }
`;

function CreateApartmentModal({ isOpen, onClose, condominium, onApartmentCreated }) {
  const [formData, setFormData] = useState({
    number: "",
    type: "",
    status: "",
    max_occupation: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    try {
      const response = await api.post(
        `/api/apartments/`,
        { ...formData, condominium, residents: [],  owner_details: null},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onApartmentCreated(response.data);
      onClose();
    } catch (error) {
      console.error("Error creating apartment:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <h2>Criar Apartamento</h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <div>
            <FormLabel>Número:</FormLabel>
            <Input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <FormLabel>Tipo:</FormLabel>
            <Select name="type" value={formData.type} onChange={handleChange} required>
              <option value="">Selecione o Tipo</option>
              <option value="0">Temporada</option>
              <option value="1">Moradia</option>
            </Select>
          </div>
          <div>
            <FormLabel>Status:</FormLabel>
            <Select name="status" value={formData.status} onChange={handleChange} required>
              <option value="">Selecione o Status</option>
              <option value="0">Disponível</option>
              <option value="1">Ocupado</option>
              <option value="2">Manutenção</option>
            </Select>
          </div>
          <div>
            <FormLabel>Ocupação Máxima:</FormLabel>
            <Input
              type="number"
              name="max_occupation"
              value={formData.max_occupation}
              onChange={handleChange}
              required
            />
          </div>
          <SubmitButton type="submit">Criar</SubmitButton>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
}

export default CreateApartmentModal;
