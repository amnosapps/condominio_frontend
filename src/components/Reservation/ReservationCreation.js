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
  max-height: 80vh;
  overflow-y: auto;

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
  font-size: 1.5rem;
  align-self: flex-end;
  cursor: pointer;
  margin-top: -20px;
`;

const ToggleButton = styled.button`
  background-color: ${(props) => (props.active ? "#F46600" : "#ccc")};
  color: white;
  border: none;
  padding: 10px;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.active ? "#d95c00" : "#aaa")};
  }
`;

const SubmitButton = styled.button`
  margin-top: 20px;
  background-color: #28a745;
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

const AddGuestButton = styled.button`
  margin: 15px 15px;
  padding: 5px 8px;
  background-color: #F46600;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background-color: #d89591;
  }
`;

const RemoveGuestButton = styled.button`
  background-color: red;
  color: #fff;
  border: none;
  cursor: pointer;
  margin: 10px 0;
  border-radius: 5px;

  &:hover {
    opacity: 0.8;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
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

function ReservationCreationModal({ onClose, loadReservations, apartments, profile }) {
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_document: "",
    guest_phone: "",
    guests: "",
    has_children: false,
    apartment: "",
    checkin: null,
    checkout: null,
    endereco: "",
    bairro: "",
    cep: "",
    cidade: "",
    estado: "",
    pais: "",
    vehicle_plate: "",
  });

  const [additionalGuests, setAdditionalGuests] = useState([]);
  const [isCompleteReservation, setIsCompleteReservation] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date, field) => {
    setFormData({ ...formData, [field]: date });
  };

  const addAdditionalGuest = (e) => {
    e.preventDefault();
    setAdditionalGuests((prev) => [
      ...prev,
      { name: "", document: "", is_child: false, age: "" },
    ]);
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

      const checkinDate = formData.checkin instanceof Date ? formData.checkin : new Date(formData.checkin);
      const checkoutDate = formData.checkout instanceof Date ? formData.checkout : new Date(formData.checkout);

      if (isNaN(checkinDate) || isNaN(checkoutDate)) {
        alert("As datas de check-in e check-out são inválidas.");
        return;
      }

      checkinDate.setHours(15, 0, 0); // Set to 3:00 PM
      checkoutDate.setHours(9, 0, 0); // Set to 9:00 AM

      const multipartData = new FormData();
      multipartData.append("guest_name", formData.guest_name);
      multipartData.append("guest_document", formData.guest_document);
      multipartData.append("guest_phone", formData.guest_phone);
      multipartData.append("guests", formData.guests);
      multipartData.append("has_children", formData.has_children);
      multipartData.append("apartment", formData.apartment);
      multipartData.append("checkin", checkinDate.toISOString());
      multipartData.append("checkout", checkoutDate.toISOString());

      if (isCompleteReservation) {
        multipartData.append("endereco", formData.endereco);
        multipartData.append("bairro", formData.bairro);
        multipartData.append("cep", formData.cep);
        multipartData.append("cidade", formData.cidade);
        multipartData.append("estado", formData.estado);
        multipartData.append("pais", formData.pais);
        multipartData.append("vehicle_plate", formData.vehicle_plate);
        multipartData.append("additional_guests", JSON.stringify(additionalGuests));
      }

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

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <ToggleButton
            active={!isCompleteReservation}
            onClick={() => setIsCompleteReservation(false)}
          >
            Reserva Simplificada
          </ToggleButton>
          <ToggleButton
            active={isCompleteReservation}
            onClick={() => setIsCompleteReservation(true)}
          >
            Reserva Completa
          </ToggleButton>
        </div>

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
            />
          </InputGroup>
          <InputGroup>
            <Label>Contato do Hóspede:</Label>
            <Input
              type="text"
              name="guest_phone"
              value={formData.guest_phone}
              onChange={handleChange}
            />
          </InputGroup>
          {isCompleteReservation && (
            <>
              <InputGroup>
                <Label>Endereço:</Label>
                <Input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Endereço"
                />
                <Input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  placeholder="Bairro"
                />
                <Input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  placeholder="CEP"
                />
                <Input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  placeholder="Cidade"
                />
                <Input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  placeholder="Estado"
                />
                <Input
                  type="text"
                  name="pais"
                  value={formData.pais}
                  onChange={handleChange}
                  placeholder="País"
                />
              </InputGroup>
              <InputGroup>
                <Label>Placa do Veículo:</Label>
                <Input
                  type="text"
                  name="vehicle_plate"
                  value={formData.vehicle_plate}
                  onChange={handleChange}
                />
              </InputGroup>
              <div>
                <Label>Hóspedes Adicionais: 
                  <AddGuestButton onClick={addAdditionalGuest}>
                    + Hóspede
                  </AddGuestButton>
                </Label>
                {additionalGuests.map((guest, index) => (
                  <div key={index} style={{ marginBottom: "10px" }}>
                    <Input
                      type="text"
                      placeholder="Nome"
                      value={guest.name}
                      onChange={(e) =>
                        updateGuestDetails(index, "name", e.target.value)
                      }
                    />
                    <Input
                      type="text"
                      placeholder="Documento"
                      value={guest.document}
                      onChange={(e) =>
                        updateGuestDetails(index, "document", e.target.value)
                      }
                    />
                    <Select
                      value={guest.is_child ? "Sim" : "Não"}
                      onChange={(e) =>
                        updateGuestDetails(
                          index,
                          "is_child",
                          e.target.value === "Sim"
                        )
                      }
                    >
                      <option value="Sim">Criança</option>
                      <option value="Não">Adulto</option>
                    </Select>
                    {guest.is_child && (
                      <Select
                        value={guest.age}
                        onChange={(e) =>
                          updateGuestDetails(index, "age", parseInt(e.target.value, 10))
                        }
                      >
                        <option value="">Selecione a idade</option>
                        {Array.from({ length: 8 }, (_, i) => (
                          <option key={i + 5} value={i + 5}>
                            {i + 5}
                          </option>
                        ))}
                      </Select>
                    )}
                    <RemoveGuestButton onClick={() => removeAdditionalGuest(index)}>
                      Remover
                    </RemoveGuestButton>
                  </div>
                ))}
                
              </div>
            </>
          )}
          <SubmitButton type="submit">Criar Reserva</SubmitButton>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
}

export default ReservationCreationModal;
