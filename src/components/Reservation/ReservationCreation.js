import React, { useState } from "react";
import styled from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import ptBR from "date-fns/locale/pt-BR";
import axios from "axios";
import api from "../../services/api";

registerLocale("pt-BR", ptBR);

// Styled Components
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

const ModalContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 3px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: #f5f5f5;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2.5rem;
  /* position: absolute; */
  /* top: 10px; */
  right: 250px;
  top: 200px;
  cursor: pointer;
  color: #333;

  &:hover {
    color: red;
  }
`;

const Title = styled.h2`
  margin-bottom: 1rem;
  text-align: center;
  color: #333;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const Column = styled.div`
  flex: 1;
  margin-right: 30px;
  min-width: 150px; /* Ensure columns are responsive */
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: bold;
`;

const FieldValue = styled.span`
  font-size: 14px;
  color: #555;

  .custom-date-picker {
    width: 180px; /* Larger width for the input */
    padding: 8px 10px; /* Add padding for larger clickable area */
    font-size: 16px; /* Bigger font for readability */
    border-radius: 6px; /* Rounded corners for better appearance */
    border: 1px solid #ccc; /* Subtle border for distinction */
    outline: none;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

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
    font-size: 1rem;

    &:focus {
      border-color: #007bff;
      outline: none;
    }
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const AddGuestButton = styled.button`
  margin-top: 10px;
  background-color: #f46600;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    background-color: #d95400;
  }
`;

const RemoveGuestButton = styled.button`
  background-color: red;
  color: white;
  border: none;
  padding: 5px 8px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 5px;

  &:hover {
    opacity: 0.8;
  }
`;

const SubmitButton = styled.button`
  margin-top: 20px;
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #218838;
  }
`;

function ReservationCreationModal({ onClose, fetchReservations, apartments, fetchApartmentDetails }) {
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_document: "",
    guest_phone: "",
    apartment: "",
    guests_qty: 0,
    checkin: null,
    checkout: null,
  });

  const [additionalGuests, setAdditionalGuests] = useState([]);
  const [maxGuests, setMaxGuests] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "apartment") {
      const selectedApartment = apartments.find((apartment) => apartment.id == value);
      setMaxGuests(selectedApartment ? selectedApartment.max_occupation : 1);
      setFormData((prev) => ({ ...prev, guests_qty: 0 })); // Reset guests_qty to 1
    }
  };

  const handleDateChange = (dates) => {
    const [checkin, checkout] = dates;
    setFormData((prev) => ({
      ...prev,
      checkin,
      checkout,
    }));
  };

  const addAdditionalGuest = () => {
    setAdditionalGuests((prev) => [...prev, { name: "", document: "" }]);
  };

  const updateGuestDetails = (index, field, value) => {
    setAdditionalGuests((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const removeAdditionalGuest = (index) => {
    setAdditionalGuests((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");

      const checkinDate =
        formData.checkin instanceof Date ? formData.checkin : new Date(formData.checkin);
      const checkoutDate =
        formData.checkout instanceof Date ? formData.checkout : new Date(formData.checkout);

      if (isNaN(checkinDate) || isNaN(checkoutDate)) {
        alert("As datas de check-in e check-out são inválidas.");
        return;
      }

      checkinDate.setHours(9, 0, 0); // Set to 3:00 PM
      checkoutDate.setHours(9, 0, 0); // Set to 9:00 AM

      const multipartData = new FormData();
      multipartData.append("guest_name", formData.guest_name);
      multipartData.append("guest_document", formData.guest_document);
      multipartData.append("guest_phone", formData.guest_phone);
      multipartData.append("apartment", formData.apartment);
      multipartData.append("guests_qty", formData.guests_qty);
      multipartData.append("checkin", checkinDate.toISOString());
      multipartData.append("checkout", checkoutDate.toISOString());
      multipartData.append("active", true);

      multipartData.append("additional_guests", JSON.stringify(additionalGuests));

      await api.post(`/api/reservations/`, multipartData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Reserva criada com sucesso!");
      onClose();

      if (fetchReservations) {
        fetchReservations(1, "right", false);
      }
      if (fetchApartmentDetails) {
        fetchApartmentDetails();
      }
      
    } catch (error) {
      console.error("Erro ao criar reserva:", error);
      alert(
        "Falha ao criar reserva. Por favor, verifique os dados e tente novamente."
      );
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignContent: 'center', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Title>Criar Reserva</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </div>
        <form onSubmit={handleSubmit}>
          <Row>
            <Column>
              <Label>Datas:</Label>
              <StyledDatePickerWrapper>
                <DatePicker
                  selected={formData.checkin}
                  onChange={handleDateChange}
                  startDate={formData.checkin}
                  endDate={formData.checkout}
                  selectsRange
                  dateFormat="dd/MM/yyyy"
                  locale="pt-BR"
                  placeholderText="Selecione as datas"
                />
              </StyledDatePickerWrapper>
            </Column>
            <Column>
              <Label>Apartamento:</Label>
              <FieldValue>
                <StyledSelect
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleChange}
                >
                  <option value="">Selecione um Apartamento</option>
                  {apartments.map((apartment) => (
                    <option key={apartment.id} value={apartment.id}>
                      {apartment.number}
                    </option>
                  ))}
                </StyledSelect>
              </FieldValue>
            </Column>
          </Row>
          <Row>
            <Column>
              <Label>Nome do Hóspede:</Label>
              <Input
                type="text"
                name="guest_name"
                value={formData.guest_name}
                onChange={handleChange}
              />
            </Column>
            <Column>
              <Label>Acompanhantes:</Label>
              <FieldValue>
                <StyledSelect
                  name="guests_qty"
                  value={formData.guests_qty}
                  onChange={handleChange}
                  disabled={!formData.apartment}
                >
                  {Array.from({ length: maxGuests }, (_, i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </StyledSelect>
              </FieldValue>
            </Column>
            {/* <Column>
              <Label>Documento do Hóspede:</Label>
              <Input
                type="text"
                name="guest_document"
                value={formData.guest_document}
                onChange={handleChange}
              />
            </Column>
            <Column>
              <Label>Contato do Hóspede:</Label>
              <Input
                type="text"
                name="guest_phone"
                value={formData.guest_phone}
                onChange={handleChange}
              />
            </Column> */}
          </Row>
          <SubmitButton type="submit">Criar Reserva</SubmitButton>
        </form>
      </ModalContainer>
    </ModalOverlay>
  );
}

export default ReservationCreationModal;
