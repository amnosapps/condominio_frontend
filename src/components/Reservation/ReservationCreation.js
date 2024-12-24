import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import ptBR from "date-fns/locale/pt-BR";

registerLocale("pt-BR", ptBR);

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

  > h2 {
    margin-top: -20px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  align-self: flex-end;
  cursor: pointer;
  margin-top: -20px;
`;

const SubmitButton = styled.button`
  background-color: #F46600;
  color: white;
  border: none;
  padding: 10px;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #218838;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const StyledDatePickerWrapper = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container {
    width: 100%;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;

    &:focus {
      border-color: #007bff;
      outline: none;
    }
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

function ReservationCreationModal({ onClose, loadReservations, apartments }) {
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_document: "",
    guests: "",
    has_children: false,
    apartment: "",
    checkin: null,
    checkout: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date, field) => {
    setFormData({ ...formData, [field]: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");

      const checkinDate = formData.checkin instanceof Date ? formData.checkin : new Date(formData.checkin);
      const checkoutDate = formData.checkout instanceof Date ? formData.checkout : new Date(formData.checkout);

      if (isNaN(checkinDate) || isNaN(checkoutDate)) {
        alert("As datas de check-in e check-out são inválidas.");
        return;
      }

      // Adjust time for PT_BR timezone (UTC-3)
      checkinDate.setHours(15, 0, 0); // Set to 3:00 PM
      checkoutDate.setHours(9, 0, 0); // Set to 9:00 AM

      // Prepare `FormData` object
      const multipartData = new FormData();
      multipartData.append("guest_name", formData.guest_name);
      multipartData.append("guest_document", formData.guest_document);
      multipartData.append("guests", formData.guests);
      multipartData.append("has_children", formData.has_children);
      multipartData.append("apartment", formData.apartment);
      multipartData.append("checkin", checkinDate.toISOString());
      multipartData.append("checkout", checkoutDate.toISOString());

      await axios.post(`${process.env.REACT_APP_API_URL}/api/reservations/`, multipartData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Reserva criada com sucesso!");
      onClose();
      loadReservations();
    } catch (error) {
      console.error("Erro ao criar reserva:", error);
      alert("Falha ao criar reserva. Por favor, verifique os dados e tente novamente.");
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <h2>Criar Reserva</h2>
        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Data de Check-in:</Label>
            <StyledDatePickerWrapper>
              <DatePicker
                selected={formData.checkin}
                onChange={(date) => handleDateChange(date, "checkin")}
                dateFormat="dd/MM/yyyy"
                locale="pt-BR"
                placeholderText="Selecione a data de entrada"
              />
            </StyledDatePickerWrapper>
          </InputGroup>
          <InputGroup>
            <Label>Data de Check-out:</Label>
            <StyledDatePickerWrapper>
              <DatePicker
                selected={formData.checkout}
                onChange={(date) => handleDateChange(date, "checkout")}
                dateFormat="dd/MM/yyyy"
                locale="pt-BR"
                placeholderText="Selecione a data de saída"
              />
            </StyledDatePickerWrapper>
          </InputGroup>
          <InputGroup>
            <Label>Apartamento:</Label>
            <Select
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um Apartamento</option>
              {apartments.map((apartment) => (
                <option key={apartment.id} value={apartment.id}>
                  {apartment.number}
                </option>
              ))}
            </Select>
          </InputGroup>
          <InputGroup>
            <Label>Nome do Hóspede:</Label>
            <Input
              type="text"
              name="guest_name"
              value={formData.guest_name}
              onChange={handleChange}
              required
            />
          </InputGroup>
          <InputGroup>
            <Label>Documento do Hóspede:</Label>
            <Input
              type="text"
              name="guest_document"
              value={formData.guest_document}
              onChange={handleChange}
              required
            />
          </InputGroup>
          <InputGroup>
            <Label>Quantidade de Hóspedes:</Label>
            <Input
              type="number"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              required
            />
          </InputGroup>
          <InputGroup>
            <Label>Há Crianças:</Label>
            <Select
              name="has_children"
              value={formData.has_children ? "Sim" : "Não"}
              onChange={(e) =>
                handleChange({
                  target: { name: "has_children", value: e.target.value === "Sim" },
                })
              }
            >
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </Select>
          </InputGroup>
          <SubmitButton type="submit">Criar Reserva</SubmitButton>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
}

export default ReservationCreationModal;
