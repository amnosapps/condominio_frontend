import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";

import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { printFormData } from "../utils/print";
import PhotoCapture from "./PhotoCapture";
import LogsVisualization from "./Logs/LogsVizualization";
import LogsListComponent from "./Logs/LogsVizualization";
import { FaArrowAltCircleRight, FaCheck, FaEdit, FaPlus } from "react-icons/fa";

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: start;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  margin-top: 30px;
  margin-left: 100px;
  background-color: white;
  width: 90%;
  max-width: 700px;
  max-height: 80vh; /* Constrain height to 80% of the viewport */
  padding: 30px;
  border-radius: 5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow-y: auto; /* Enable vertical scrolling */

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  /* top: 10px; */
  right: 50px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;


const GreenButton = styled.button`
  margin: 10px 5px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 600;
  background-color: #0056B3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color:rgb(33, 107, 185);
  }
`;

const RedButton = styled.button`
  margin: 10px 5px;
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
  }
`;

const RemoveGuestButton = styled.button`
  /* margin: 5px 5px; */
  padding: 5px 5px;
  background-color: transparent;
  color: white;
  border: none;
  border-radius: 5px;
  /* font-size: 14px; */
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const AddGuestButton = styled.button`
  margin: 15px 0;
  padding: 10px 10px;
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

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledSelect = styled.select`
  margin-top: 8px;
  width: 100%;
  padding:8px;
  font-size: 16px;
  color: #333;
  background: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  cursor: pointer;
  overflow-y: auto; /* Enables scrolling */
  max-height: 100%; /* Limits dropdown size */

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }

  &:hover {
    border-color: #555;
  }

  option {
    font-size: 16px;
    color: #333;
  }
`;


const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const StyledCheckbox = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  background: ${(props) => (props.checked ? "#28a745" : "white")};
  border: 2px solid #ccc;
  border-radius: 4px;
  transition: all 150ms;
  cursor: pointer;

  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.5);
  }

  &:hover {
    border-color: #999;
  }

  &:after {
    content: "";
    display: ${(props) => (props.checked ? "block" : "none")};
    width: 10px;
    height: 10px;
    margin: 4px;
    background: white;
    border-radius: 2px;
  }
`;

const Label = styled.label`
  margin-left: 10px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
`;

const EditableInput = styled.input`
  width: 95%;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
`;

const LogsModalContainer = styled.div`
  margin-top: 50px;
  background-color: white;
  width: 80%;
  max-width: 600px;
  max-height: 80vh;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow-y: auto;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const LogsButton = styled.button`
  margin: 10px 5px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const LogsList = styled.div`
  margin-top: 20px;
`;

const LogItem = styled.div`
  border-bottom: 1px solid #ccc;
  padding: 10px 0;
`;

const LogsModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const CloseLogsButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;

const SectionTitle = styled.h4`
  margin: 20px 0 10px;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
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
  margin-right: 10px;
  min-width: 150px; /* Ensure columns are responsive */
`;

const FieldLabel = styled.strong`
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
`;

const FieldValue = styled.span`
  font-size: 14px;
  color: #555;
`;

const EditableField = styled.div`
  margin-bottom: 15px;
`;

const Divider = styled.div`
  border-bottom: 1px solid #ddd;
  margin: 15px 0;
`;

const ReservationModal = ({
  closeModal,
  selectedReservation,
  loadData
}) => {
  const [logs, setLogs] = useState([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const [reservationData, setReservationData] = useState({
    guest_name: selectedReservation?.guest_name || "",
    guest_document: selectedReservation?.guest_document || "",
    document_type: selectedReservation?.document_type || "",
    guest_phone: selectedReservation?.guest_phone || "", // Handle null values
    guests_qty: selectedReservation?.additional_guests.length + 1 || 0,
    apartment: selectedReservation?.apartment || "", // Optional apartment number
    apartment_owner: selectedReservation?.apartment_owner || "", // Optional apartment owner name
    hasChildren: selectedReservation?.hasChildren || "no",
    photos: selectedReservation?.photos || "", // Main photo URL
    additional_photos: selectedReservation?.additional_photos || [], // Additional photos array
    checkin: selectedReservation?.checkin || null, // Check-in timestamp
    checkout: selectedReservation?.checkout || null, // Checkout timestamp
    checkin_at: selectedReservation?.checkin_at || null, // Check-in timestamp
    checkout_at: selectedReservation?.checkout_at || null, // Checkout timestamp
    address: selectedReservation?.address || {
      endereco: "",
      bairro: "",
      cep: "",
      cidade: "",
      estado: "",
      pais: "",
    },
    vehicle_plate: selectedReservation?.vehicle_plate || "",
    additional_guests: selectedReservation?.additional_guests || [],
    reservation_file: selectedReservation?.reservation_file || "",
  });

  const [hasCar, setHasCar] = useState(!!selectedReservation?.vehicle_plate);
  const [vehiclePlate, setVehiclePlate] = useState(
    selectedReservation?.vehicle_plate || ""
  );
  
  const [additionalGuests, setAdditionalGuests] = useState(
    selectedReservation?.additional_guests.map((guest) => ({
      name: guest.name || "",
      document: guest.document || "",
      age: guest.age || 0,
      is_child: guest.is_child || false,
    })) || []
  );
  
  const [address, setAddress] = useState(reservationData.address);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/logs/`, // Replace with your actual logs endpoint
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { object_id: selectedReservation.id, model_name: "Reservation" },
        }
      );
      setLogs(response.data);
      setIsLogsOpen(true); // Open the logs modal
    } catch (error) {
      console.error("Error fetching logs:", error);
      alert("Failed to load logs. Please try again.");
    }
  };

  const handleChange = (field, value) => {
    setReservationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field, value) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHasCarChange = (e) => {
    const checked = e.target.checked;
    setHasCar(checked);
    if (!checked) {
      setVehiclePlate(""); // Clear vehicle plate if no car
      handleChange("vehicle_plate", ""); // Sync with reservationData
    }
  };

  const addAdditionalGuest = () => {
    setAdditionalGuests((prev) => [
      ...prev,
      { name: "", document: "", age: 0, is_child: false },
    ]);
  };

  const removeAdditionalGuest = (index) => {
    setAdditionalGuests((prev) => prev.filter((_, i) => i !== index));
  };

  const updateGuestDetails = (index, field, value) => {
    setAdditionalGuests((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value, // Update only the specified field
      };
      return updated;
    });
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "$1 $2-$3").trim();
    }
    handleChange("guest_phone", value);
  };

  const handleUpdateReservation = async () => {
    if (!window.confirm("Você tem certeza que deseja atualizar as informações?")) return;
  
    setIsSubmitting(true);
  
    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
  
    // Append updated reservation data
    formData.append("guest_name", reservationData.guest_name);
    formData.append("guest_document", reservationData.guest_document);
    formData.append("guest_phone", reservationData.guest_phone || "");
    formData.append("guests_qty", 1 + additionalGuests.length);
    formData.append("has_children", additionalGuests.some((guest) => guest.is_child));
  
    // Debugging Address Data
    console.log("Address Data:", address);
    formData.append("address", JSON.stringify(address));
  
    // Vehicle plate if applicable
    if (hasCar) {
      console.log("Appending vehicle_plate:", vehiclePlate);
      formData.append("vehicle_plate", vehiclePlate);
    }
  
    // Append additional guests
    console.log("Additional Guests:", additionalGuests);
    formData.append("additional_guests", JSON.stringify(additionalGuests));
  
    // Debugging FormData Content
    console.log("FormData Content:");
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    console.log(formData)
  
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/reservations/${selectedReservation.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        alert("Informações atualizadas com sucesso!");
        loadData();
      } else {
        alert("Falha ao atualizar as informações. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao atualizar a reserva:", error);
      alert("Erro ao atualizar as informações. Verifique os dados e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleSaveCheckin = async () => {
    const confirmMessage = reservationData.checkin_at
      ? "Você tem certeza que deseja atualizar as informações?"
      : "Você tem certeza que deseja fazer o checkin?";
    if (!window.confirm(confirmMessage)) return;
  
    setIsSubmitting(true);
  
    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
  
    // Format `checkin_at` to ISO 8601
    const formattedCheckinAt = reservationData.checkin_at
      ? new Date(reservationData.checkin_at).toISOString()
      : new Date().toISOString();
  
    // Calculate total guests (main guest + additional guests)
    const totalGuests = 1 + additionalGuests.length;
  
    // Determine if there are children
    const hasChildren = additionalGuests.some((guest) => guest.is_child);

    if (hasChildren && reservationData.additional_photos.length === 0) {
      alert("Você deve adicionar pelo menos uma foto se houver crianças na reserva.");
      setIsSubmitting(false);
      return;
    }
  
    // Append reservation data to formData
    formData.append("guest_name", reservationData.guest_name);
    formData.append("guest_document", reservationData.guest_document);
    formData.append("guest_phone", reservationData.guest_phone || "");
    formData.append("guests_qty", totalGuests); // Updated to use calculated total
    formData.append("has_children", hasChildren); // Dynamically set
    formData.append("checkin_at", formattedCheckinAt);
  
    // Append Address information
    formData.append("address", JSON.stringify(address));
  
    // Append Vehicle Plate if the user has a car
    if (hasCar) {
      formData.append("vehicle_plate", vehiclePlate);
    }
  
    // Append Additional Guests
    formData.append("additional_guests", JSON.stringify(additionalGuests));
    
    console.log(reservationData.additional_photos)
    const photos = reservationData.additional_photos.map(async (photoUrl, index) => {
      console.log(photoUrl, index)
      const response = await fetch(photoUrl); // Fetch the blob from the URL
      const blob = await response.blob(); // Convert response to Blob
      return new File([blob], `photo-${index}.jpg`, { type: blob.type }); // Convert Blob to File
    });
  
    // Wait for all photos to be processed
    const photoFiles = await Promise.all(photos);
  
    // Append each photo to FormData
    photoFiles.forEach((file) => {
      formData.append("additional_photos", file);
    });

    console.log(formData)

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/reservations/${selectedReservation.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.status === 200) {
        alert("Informações salvas com sucesso!");
        loadData();
        closeModal();
        sessionStorage.setItem("reopenModalId", selectedReservation.id);
      } else {
        console.error("Unexpected response status:", response.status);
        alert("Falha ao salvar as informações. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao atualizar a reserva:", error);
  
      if (error.response) {
        console.error("Response data:", error.response.data);
        alert(
          `Erro no servidor: ${error.response.status}. Mensagem: ${
            error.response.data.detail || "Erro desconhecido"
          }`
        );
      } else if (error.request) {
        console.error("Request data:", error.request);
        alert("Erro na comunicação com o servidor. Verifique sua conexão.");
      } else {
        console.error("Error message:", error.message);
        alert(`Erro inesperado: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCheckout = async () => {
    if (!window.confirm("Você tem certeza que deseja fazer o checkout?")) return;
  
    setIsSubmitting(true);
  
    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
  
    formData.append("checkout_at", new Date().toISOString());
    console.log("FormData:", formData);
  
    axios
      .patch(
        `${process.env.REACT_APP_API_URL}/api/reservations/${selectedReservation.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        console.log("Response received:", response);
        if (response.status === 200) {
          alert("Checkout realizado com sucesso!");
          loadData()
          closeModal();
          sessionStorage.setItem("reopenModalId", selectedReservation.id);
        } else {
          console.error("Unexpected response status:", response.status);
          alert("Falha ao realizar o checkout. Tente novamente.");
        }
      })
      .catch((error) => {
        console.error("Erro completo:", error);
  
        // Handle server response errors
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          alert(
            `Erro no servidor: ${error.response.status}. Mensagem: ${error.response.data.detail || "Erro desconhecido"}`
          );
        } else if (error.request) {
          // Handle no response received
          console.error("Request data:", error.request);
          alert("Erro na comunicação com o servidor. Verifique sua conexão.");
        } else {
          // Handle other errors
          console.error("Error message:", error.message);
          alert(`Erro inesperado: ${error.message}`);
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const updatePhotos = (photos) => {
    setReservationData((prev) => ({
      ...prev,
      additional_photos: photos,
    }));
  };

  const closeModal1 = () => {
    closeModal();
  };

  const openBase64Pdf = (base64String, fileName = "reservation.pdf") => {
    try {
      // Decode the base64 string
      const byteCharacters = atob(base64String);
      const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
  
      // Create a Blob from the byte array
      const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
  
      // Generate a URL for the Blob
      const pdfUrl = URL.createObjectURL(pdfBlob);
  
      // Open the URL in a new tab
      const newWindow = window.open(pdfUrl, "_blank");
      if (!newWindow) {
        // If the browser blocks the new tab, offer the file for download
        const downloadLink = document.createElement("a");
        downloadLink.href = pdfUrl;
        downloadLink.download = fileName;
        downloadLink.click();
      }
  
      // Optional: Revoke the object URL after a delay to release memory
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
    } catch (error) {
      console.error("Erro ao abrir pdf:", error);
      alert("Erro ao abrir pdf. Procure o suporte");
    }
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing); // Toggle edit mode
  };

  const isCheckinToday = reservationData.checkin
    ? isSameDay(new Date(), reservationData.checkin) // Use the Date object directly
    : false;

  if (!selectedReservation) return null;

  return (
    <ModalOverlay onClick={closeModal1}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignContent: 'center', alignItems: 'center' }}>
          <div><strong>Apto {reservationData.apartment}</strong> {reservationData.apartment_owner != '' && (<>({reservationData.apartment_owner})</>)} </div>
          
          <CloseButton onClick={closeModal1}>X</CloseButton>
        </div>
        <div style={{ marginBottom: "10px" }}>
          {isLogsOpen && (
            <LogsModalOverlay onClick={() => setIsLogsOpen(false)}>
              <LogsModalContainer onClick={(e) => e.stopPropagation()}>
                <CloseLogsButton onClick={() => setIsLogsOpen(false)}>X</CloseLogsButton>
                <h3>Logs da Reserva</h3>
                <LogsListComponent logs={logs} />
              </LogsModalContainer>
            </LogsModalOverlay>
          )}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", margin: '15px 0px' }}>
            <a onClick={() => openBase64Pdf(reservationData.reservation_file, `${selectedReservation.apartment}_${selectedReservation.id}reservation.pdf`)}>
              <img
                src="/download-pdf.png"
                alt="PDF Reserva"
                style={{ width: "30px", height: "auto", cursor: "pointer" }}
              />
            </a>
            <strong>
              {format(new Date(reservationData.checkin), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(reservationData.checkout), 'dd/MM/yyyy', { locale: ptBR })}
            </strong>
          </div>
        </div>

        {/* Guest Information */}
        <Row>
          <Column>
            <FieldLabel>Nome:</FieldLabel>
            <FieldValue>
              <EditableInput
                disabled={!isEditing} 
                type="text"
                value={reservationData.guest_name}
                onChange={(e) => handleChange("guest_name", e.target.value)}
              />
            </FieldValue>
          </Column>
          <Column>
          <FieldLabel>Tipo de Documento:</FieldLabel>
          <FieldValue>
            <StyledSelect
              value={reservationData.document_type || ""}
              onChange={(e) => handleChange("document_type", e.target.value)}
              disabled={!isEditing} 
            >
              <option value="">Selecione</option>
              <option value="cpf">CPF</option>
              <option value="rg">RG</option>
              <option value="passport">Passaporte</option>
            </StyledSelect>
          </FieldValue>
        </Column>
          <Column>
            <FieldLabel>Documento:</FieldLabel>
            <FieldValue>
              <EditableInput
                type="text"
                value={reservationData.guest_document}
                onChange={(e) => handleChange("guest_document", e.target.value)}
                disabled={!isEditing} 
              />
            </FieldValue>
          </Column>
          <Column>
            <FieldLabel>Contato:</FieldLabel>
            <FieldValue>
              <EditableInput
                type="text"
                value={reservationData.guest_phone || ""}
                onChange={handlePhoneChange}
                placeholder="88 88888-8888"
                disabled={!isEditing} 
              />
            </FieldValue>
          </Column>
        </Row>

        <Row>
          {hasCar && (
            <Column>
              <FieldLabel>Placa do Veículo:</FieldLabel>
              <FieldValue>
                <EditableInput
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  disabled={!isEditing} 
                />
              </FieldValue>
            </Column>
          )}
        </Row>
        <div style={{ marginBottom: '20px', marginTop: '-14px' }}>
          <CheckboxContainer>
            <HiddenCheckbox
              checked={hasCar}
              onChange={handleHasCarChange}
              disabled={!isEditing} 
            />
            <StyledCheckbox
              checked={hasCar}
              onClick={() => handleHasCarChange({ target: { checked: !hasCar } })}
              disabled={!isEditing} 
            />
            <Label>Tem veículo?</Label>
          </CheckboxContainer>
        </div>  
        <Row>
          <Column>
            <FieldLabel>Endereço:</FieldLabel>
            <FieldValue>
              <EditableInput
              type="text"
              value={address.endereco || ""}
              onChange={(e) => handleAddressChange("endereco", e.target.value)}
              disabled={!isEditing} 
            />
            </FieldValue>
          </Column>
          <Column>
            <FieldLabel>Bairro:</FieldLabel>
            <FieldValue>
              <EditableInput
                type="text"
                value={address.bairro || ""}
                onChange={(e) => handleAddressChange("bairro", e.target.value)}
                disabled={!isEditing} 
              />
            </FieldValue>
          </Column>
          <Column>
            <FieldLabel>CEP:</FieldLabel>
            <FieldValue>
              <EditableInput
                type="text"
                value={address.cep || ""}
                onChange={(e) => handleAddressChange("cep", e.target.value)}
                disabled={!isEditing} 
              />
            </FieldValue>
          </Column>
        </Row>
        <Row>
          <Column>
            <FieldLabel>Cidade:</FieldLabel>
            <FieldValue>
              <EditableInput
                type="text"
                value={address.cidade || ""}
                onChange={(e) => handleAddressChange("cidade", e.target.value)}
                disabled={!isEditing} 
              />
            </FieldValue>
          </Column>
          <Column>
            <FieldLabel>Estado:</FieldLabel>
            <FieldValue>
              <EditableInput
                type="text"
                value={address.estado || ""}
                onChange={(e) => handleAddressChange("estado", e.target.value)}
                disabled={!isEditing} 
              />
            </FieldValue>
          </Column>
          <Column>
            <FieldLabel>País:</FieldLabel>
            <FieldValue>
              <EditableInput
                type="text"
                value={address.pais || ""}
                onChange={(e) => handleAddressChange("pais", e.target.value)}
                disabled={!isEditing} 
              />
            </FieldValue>
          </Column>
        </Row>
            
        <div>
          {additionalGuests.map((guest, index) => (
            <div key={index} style={{ margin: '15px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Hóspede Adicional:</strong>
                <RemoveGuestButton onClick={() => removeAdditionalGuest(index)} disabled={!isEditing} >
                  <img width={20} src="/trash.png" />
                </RemoveGuestButton>
              </div>
              
              <Row>
                <Column>
                  <EditableInput
                    type="text"
                    placeholder="Nome"
                    value={guest.name}
                    onChange={(e) => updateGuestDetails(index, "name", e.target.value)}
                    disabled={!isEditing} 
                  />
                </Column>
                <Column>
                  <FieldValue>
                    <StyledSelect
                      value={reservationData.document_type || ""}
                      onChange={(e) => handleChange("document_type", e.target.value)}
                      disabled={!isEditing} 
                    >
                      <option value="">Tipo Documento</option>
                      <option value="cpf">CPF</option>
                      <option value="rg">RG</option>
                      <option value="passport">Passaporte</option>
                    </StyledSelect>
                  </FieldValue>
                </Column>
                <Column>
                  <EditableInput
                    type="text"
                    placeholder="Num Documento"
                    value={guest.document}
                    onChange={(e) =>
                      updateGuestDetails(index, "document", e.target.value)
                    }
                    disabled={!isEditing} 
                  />
                </Column>
                <Column>
                  {guest.is_child && (
                    <>
                      <StyledSelect
                        value={guest.age}
                        onChange={(e) =>
                          updateGuestDetails(index, "age", parseInt(e.target.value, 10))
                        }
                        disabled={!isEditing} 
                      >
                        <option value="">Idade</option>
                        {Array.from({ length: 18 }, (_, i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </StyledSelect>
                    </>
                  )}
                </Column>
              </Row>
              <div>
                <CheckboxContainer>
                  <HiddenCheckbox
                    checked={guest.is_child}
                    onChange={(e) =>
                      updateGuestDetails(index, "is_child", e.target.checked)
                    }
                    disabled={!isEditing} 
                  />
                  <StyledCheckbox
                    checked={guest.is_child}
                    onClick={() =>
                      updateGuestDetails(index, "is_child", !guest.isChild)
                    }
                    disabled={!isEditing} 
                  />
                  <Label>É menor de idade?</Label>
                </CheckboxContainer>
              </div>
            </div>
          ))}
          <AddGuestButton onClick={addAdditionalGuest} disabled={!isEditing}
            style={{
                backgroundColor: !isEditing ? 'grey' : '#28a745', // Grey if not today
                cursor: !isEditing ? 'not-allowed' : 'pointer',   // Change cursor style
            }}
          >
            <FaPlus style={{ marginRight: '7px' }} />
            Hóspedes
          </AddGuestButton>
        </div>
        

        <PhotoCapture
          existingPhotos={reservationData.additional_photos}
          onPhotosChange={updatePhotos}
        />
        <div style={{ display: "flex", justifyContent: "start", gap: "10px" }}>
          {!isEditing ? (
            <GreenButton onClick={toggleEditing} disabled={reservationData.checkin_at}
              style={{
                  backgroundColor: reservationData.checkin_at? 'grey' : '#28a745', // Grey if not today
                  cursor: reservationData.checkin_at? 'not-allowed' : 'pointer',   // Change cursor style
              }}
            >
              {"Editar"}
              <FaEdit style={{ marginLeft: '7px' }} />
            </GreenButton>
          ) : (
            <GreenButton onClick={handleUpdateReservation} disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </GreenButton>
          )}
          
          {reservationData.checkin_at ? (
            <>
              {reservationData.checkout_at ? (
                <RedButton style={{ backgroundColor: 'grey' }} disabled={true}>
                  {isSubmitting ? "Processando..." : "Checkout"}
                  <FaArrowAltCircleRight style={{ marginLeft: '7px' }} />
                </RedButton>
              ) : (
                <RedButton onClick={handleCheckout} disabled={isSubmitting}>
                  {isSubmitting ? "Processando..." : "Checkout"}
                  <FaArrowAltCircleRight style={{ marginLeft: '7px' }} />
                </RedButton>
              )}
            </>
          ) : (
            <GreenButton
              onClick={handleSaveCheckin}
              disabled={isSubmitting || !isCheckinToday}
              style={{
                  backgroundColor: !isCheckinToday ? 'grey' : '#28a745', // Grey if not today
                  cursor: !isCheckinToday ? 'not-allowed' : 'pointer',   // Change cursor style
              }}
          >
              {isSubmitting ? "Enviando..." : "Checkin"}
              <FaCheck  style={{ marginLeft: '7px' }} />
          </GreenButton>
          )}
          <LogsButton onClick={fetchLogs}>Auditoria</LogsButton> 
          <RedButton onClick={closeModal1}>Cancelar</RedButton>
        </div>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ReservationModal;
